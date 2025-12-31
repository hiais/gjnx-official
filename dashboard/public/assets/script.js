// 硅基能效 Dashboard - 核心逻辑 V3.1
// 包含 Phase 1 增强功能：历史对比、性能分布、多指标趋势

const REFRESH_INTERVAL = 30000;
let refreshTimer = null;
let countdownTimer = null;
let countdown = 30;
let tokenChart = null;
let previousData = null;
let lastDataHash = null;

let currentFilters = {
    workflow: '',
    priority: ''
};
let multiMetricChart = null;
let histogramChart = null;
let costChart = null;
let currentCostPeriod = 'today';
let currentSLAPeriod = 'today';
let alertRulesConfig = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadData(true);
    startAutoRefresh();
    startCountdown();
    setupFilters();
    setupExtendedFilters();

    // 恢复上次选中的标签页
    const savedTab = localStorage.getItem('dashboard-active-tab');
    if (savedTab) {
        switchTab(savedTab);
    } else {
        switchTab('cockpit');
    }

    // 恢复折叠分组状态
    const groups = ['core'];
    groups.forEach(groupId => {
        const savedState = localStorage.getItem(`group-${groupId}-state`);
        if (savedState === 'collapsed') {
            const content = document.getElementById(`group-${groupId}`);
            const icon = document.getElementById(`icon-${groupId}`);
            const header = icon?.closest('.card-group-header');
            if (content && icon && header) {
                content.classList.add('collapsed');
                header.classList.add('collapsed');
                icon.textContent = '▶';
            }
        }
    });

    // KPI卡片点击事件 (Mapping old event listeners might fail if elements don't exist, remove if not needed or update)
    // Removed old KPI listeners as structure changed significantly
});

// 设置筛选器
function setupFilters() {
    const workflowFilter = document.getElementById('workflowFilter');
    const priorityFilter = document.getElementById('priorityFilter');

    if (workflowFilter) {
        workflowFilter.addEventListener('change', (e) => {
            currentFilters.workflow = e.target.value;
            if (previousData) updateTaskQueue(previousData.tasks);
        });
    }

    if (priorityFilter) {
        priorityFilter.addEventListener('change', (e) => {
            currentFilters.priority = e.target.value;
            if (previousData) updateTaskQueue(previousData.tasks);
        });
    }
}

// 清除筛选
function clearFilters() {
    currentFilters = { workflow: '', priority: '' };
    document.getElementById('workflowFilter').value = '';
    document.getElementById('priorityFilter').value = '';
    if (previousData) updateTaskQueue(previousData.tasks);
}

// 加载数据
async function loadData(showLoading = false) {
    const overlay = document.getElementById('loadingOverlay');
    if (showLoading && overlay) overlay.classList.add('visible');

    try {
        const response = await fetch('dashboard-status.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error('网络响应异常');
        const data = await response.json();

        // 性能优化：只有数据变化时才完整渲染
        const currentHash = JSON.stringify(data).slice(0, 2000); // 采样哈希
        if (currentHash === lastDataHash) {
            console.log('数据未发生变化，跳过完整渲染');
            return;
        }
        lastDataHash = currentHash;

        updateDashboard(data);
        previousData = data;
    } catch (error) {
        console.error('加载数据失败:', error);
        showError('数据加载失败，请检查脚本运行状态');
    } finally {
        if (showLoading && overlay) overlay.classList.remove('visible');
    }
}

// 更新看板
function updateDashboard(data) {
    if (!data) return;

    // 更新基础元数据
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) lastUpdateEl.textContent = data.timestamp;

    const healthScoreEl = document.getElementById('healthScore');
    if (healthScoreEl) {
        healthScoreEl.textContent = data.health.score;
        healthScoreEl.className = 'health-score score-' + data.health.status;
    }

    const statusBadgeEl = document.getElementById('statusBadge');
    if (statusBadgeEl) {
        const statusMap = { healthy: '系统正常', warning: '有警告', critical: '紧急告警' };
        statusBadgeEl.textContent = statusMap[data.health.status] || '未知状态';
        statusBadgeEl.className = 'status-badge status-' + data.health.status;
    }

    // Dispatcher
    try {
        updateCockpit(data);
        updateActivity(data);
        updateContentFactory(data);

        // Multi-metric chart (available in Cockpit now)
        if (data.history && data.history.multi_metric_trend) {
            updateMultiMetricChart(data);
        }
    } catch (e) {
        console.error('Core update failed:', e);
    }

    // 检查新告警
    if (previousData && previousData.tasks.alerts.length < (data.tasks.alerts.length || 0)) {
        checkNewAlerts(data.tasks.alerts, previousData.tasks.alerts);
    }
}

// --- Phase 1 Extended Logic (Hardened) ---
// ... (No change)

// --- Phase 3 SLA Monitoring ---
// ... (No change to updateSLAMonitoring)

function updateContentFactory(data) {
    if (!data.content_factory) return;
    const cf = data.content_factory;

    // 1. Pipeline Status
    const pipeline = cf.pipeline || {};
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val !== undefined ? val : '-';
    };
    setVal('pfInbox', pipeline.inbox);
    setVal('pfScheduled', pipeline.scheduled);
    setVal('pfWip', pipeline.wip);
    setVal('pfPublished', pipeline.published);

    // 2. Topic Distribution Chart
    renderTopicChart(cf.topic_distribution);

    // 3. Weekly Output Chart
    renderWeeklyOutputChart(cf.weekly_output);

    // 4. Recent Published List
    renderRecentPublished(cf.recent_published);

    // 5. Setup Interactions
    setupPipelineInteractions(cf.pipeline_details);
}

let currentPipelineStep = null;

function setupPipelineInteractions(details) {
    if (!details) return;

    const steps = ['inbox', 'scheduled', 'wip', 'published'];

    steps.forEach(step => {
        const stepEl = document.querySelector(`.pipeline-step[data-step="${step}"]`);
        if (stepEl) {
            // Remove old listeners (by cloning if necessary, but simple overwrite acts as replacement here)
            stepEl.onclick = () => {
                const allSteps = document.querySelectorAll('.pipeline-step');
                allSteps.forEach(el => el.classList.remove('active'));
                stepEl.classList.add('active');

                currentPipelineStep = step;
                renderPipelineDetail(step, details[step]);
            };
        }
    });

    // Auto-select first tab or restore state
    if (!currentPipelineStep) {
        currentPipelineStep = 'inbox'; // Default
    }

    // Trigger render for current step
    const activeEl = document.querySelector(`.pipeline-step[data-step="${currentPipelineStep}"]`);
    if (activeEl) {
        activeEl.classList.add('active');
        renderPipelineDetail(currentPipelineStep, details[currentPipelineStep]);
    }
}

function renderPipelineDetail(step, items) {
    const container = document.getElementById('pipelineDetails');
    if (!container) return;

    const titles = {
        inbox: '素材池待选',
        scheduled: '排期任务表',
        wip: '正在制作中',
        published: '已发布内容'
    };

    let html = `
        <div class="pipeline-detail-header">
            <h3>${titles[step]} (${items ? items.length : 0})</h3>
        </div>
    `;

    if (!items || items.length === 0) {
        html += '<div class="empty-state">此阶段暂无项目</div>';
    } else {
        html += '<div class="table-responsive"><table class="pipeline-detail-table"><thead><tr>';

        // Dynamic Headers
        if (step === 'inbox') {
            html += '<th width="70%">选题标题</th><th>来源/Topic</th>';
        } else if (step === 'scheduled' || step === 'wip') {
            html += '<th width="10%">优先级</th><th width="60%">标题</th><th>预定发布</th>';
        } else if (step === 'published') {
            html += '<th width="15%">发布日期</th><th width="60%">标题</th><th>Topic</th>';
        }

        html += '</tr></thead><tbody>';

        html += items.map(item => {
            if (step === 'inbox') {
                return `<tr>
                    <td><div class="detail-title">${item.title}</div></td>
                    <td><span class="detail-badge">${item.topic || 'Auto-Scout'}</span></td>
                </tr>`;
            } else if (step === 'scheduled' || step === 'wip') {
                const prio = item.priority || 'P2';
                return `<tr>
                    <td><span class="detail-badge ${prio.toLowerCase()}">${prio}</span></td>
                    <td><div class="detail-title">${item.title}</div></td>
                    <td><div class="detail-meta">${item.date || '-'}</div></td>
                </tr>`;
            } else if (step === 'published') {
                return `<tr>
                    <td><div class="detail-meta">${item.date}</div></td>
                    <td><div class="detail-title">${item.title}</div></td>
                    <td><span class="detail-badge">${item.topic || 'General'}</span></td>
                </tr>`;
            }
        }).join('');

        html += '</tbody></table></div>';
    }

    container.innerHTML = html;
}

let topicChart = null;
function renderTopicChart(distribution) {
    const canvas = document.getElementById('topicDistChart');
    if (!canvas || !distribution) return;

    if (topicChart) {
        try { topicChart.destroy(); } catch (e) { }
    }

    const labels = Object.keys(distribution);
    const data = Object.values(distribution);
    const ctx = canvas.getContext('2d');

    topicChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 10,
                        usePointStyle: true,
                    }
                }
            }
        }
    });
}

let weeklyOutputChart = null;
function renderWeeklyOutputChart(weeklyData) {
    const canvas = document.getElementById('weeklyOutputChart');
    if (!canvas || !weeklyData) return;

    if (weeklyOutputChart) {
        try { weeklyOutputChart.destroy(); } catch (e) { }
    }

    // Sort dates
    const sortedDates = Object.keys(weeklyData).sort();
    const data = sortedDates.map(d => weeklyData[d]);

    const ctx = canvas.getContext('2d');
    weeklyOutputChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedDates,
            datasets: [{
                label: '发布数量',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

function renderRecentPublished(recentList) {
    const container = document.getElementById('recentPublishedList');
    if (!container) return;

    if (!recentList || recentList.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无发布记录</div>';
        return;
    }

    container.innerHTML = recentList.map(item => `
        <div class="recent-article-item">
            <div class="article-date">${item.date}</div>
            <div class="article-info">
                <div class="article-title">${item.title}</div>
                <div class="article-topic badge badge-topic">${item.topic}</div>
            </div>
            <div class="article-status">✅ 已发布</div>
        </div>
    `).join('');
}


function setupExtendedFilters() {
    const metricSelector = document.getElementById('metricSelector');
    if (metricSelector) {
        metricSelector.addEventListener('change', () => {
            if (previousData) updateMultiMetricChart(previousData);
        });
    }

    const workflowSelector = document.getElementById('workflowSelector');
    if (workflowSelector) {
        workflowSelector.addEventListener('change', () => {
            if (previousData) updatePerformancePercentiles(previousData);
        });
    }
}

function updateMultiMetricChart(data) {
    const canvas = document.getElementById('multiMetricChart');
    if (!canvas) return;

    if (!data.history || !data.history.multi_metric_trend) {
        if (multiMetricChart) { multiMetricChart.destroy(); multiMetricChart = null; }
        return;
    }

    const metricSelector = document.getElementById('metricSelector');
    const selectedMetric = metricSelector ? metricSelector.value : 'token_usage';
    const trendData = data.history.multi_metric_trend[selectedMetric];

    if (!trendData || !Array.isArray(trendData) || trendData.length === 0) {
        console.warn('Metric data empty:', selectedMetric);
        return;
    }

    if (multiMetricChart) {
        try { multiMetricChart.destroy(); } catch (e) { }
        multiMetricChart = null;
    }

    const ctx = canvas.getContext('2d');
    const colors = {
        token_usage: { border: '#667eea', bg: 'rgba(102, 126, 234, 0.1)' },
        success_rate: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        error_rate: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
        queue_length: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        avg_duration: { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' }
    };
    const color = colors[selectedMetric] || colors.token_usage;

    // 处理 Null 值 (如历史队列长度)
    const values = trendData.map(d => d.value !== null ? d.value : 0);

    multiMetricChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.map(d => d.date),
            datasets: [{
                label: getMetricLabel(selectedMetric),
                data: values,
                borderColor: color.border,
                backgroundColor: color.bg,
                tension: 0.4,
                fill: true,
                pointRadius: trendData.map(d => d.value === null ? 0 : 3)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const val = trendData[context.dataIndex].value;
                            if (val === null) return context.dataset.label + ': ' + '无历史数据';
                            return context.dataset.label + ': ' + val;
                        }
                    }
                }
            },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function getMetricLabel(metric) {
    const labels = {
        token_usage: 'Token消耗',
        success_rate: '成功率 (%)',
        error_rate: '错误率 (%)',
        queue_length: '积压任务数 (当日准确/历史估算)',
        avg_duration: '平均耗时 (分钟)'
    };
    return labels[metric] || metric;
}

function updatePerformancePercentiles(data) {
    const container = document.getElementById('percentilesGrid');
    const workflowSelector = document.getElementById('workflowSelector');
    if (!container) return;

    const percentiles = data.performance.duration_percentiles || {};
    const workflows = Object.keys(percentiles);

    if (workflowSelector && (workflowSelector.options.length <= 1 && workflows.length > 0)) {
        workflows.forEach(wf => {
            const opt = document.createElement('option');
            opt.value = wf; opt.textContent = wf; workflowSelector.appendChild(opt);
        });
    }

    const selected = workflowSelector ? workflowSelector.value : 'all';
    const display = selected === 'all' ? workflows.slice(0, 4) : [selected];

    if (display.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无性能数据。</div>';
    } else {
        container.innerHTML = display.map(wf => {
            const p = percentiles[wf];
            if (!p) return '';
            return `
                <div class="percentile-card">
                    <div class="percentile-header"><strong>${wf}</strong></div>
                    <div class="percentile-values">
                        <div class="percentile-item"><span>P50</span><strong>${p.p50}m</strong></div>
                        <div class="percentile-item"><span>P95</span><strong class="percentile-p95">${p.p95}m</strong></div>
                        <div class="percentile-item"><span>P99</span><strong class="percentile-p99">${p.p99}m</strong></div>
                    </div>
                </div>
            `;
        }).join('');
    }
    updateDurationHistogram(data, selected);
}

function updateDurationHistogram(data, selected) {
    const canvas = document.getElementById('durationHistogram');
    if (!canvas) return;

    if (histogramChart) {
        try { histogramChart.destroy(); } catch (e) { }
        histogramChart = null;
    }

    const percentiles = data.performance.duration_percentiles || {};
    if (selected === 'all' || !percentiles[selected]) return;

    const p = percentiles[selected];
    const ctx = canvas.getContext('2d');
    histogramChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['P50 典型耗时', 'P95 长尾耗时', 'P99 极端耗时'],
            datasets: [{
                label: '耗时 (分钟)',
                data: [p.p50, p.p95, p.p99],
                backgroundColor: ['#667eea', '#f59e0b', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, title: { display: true, text: '分钟' } } }
        }
    });
}

function updateComparison(data) {
    const container = document.getElementById('comparisonMetrics');
    if (!container || !data.comparison) return;

    const c = data.comparison;
    const renderItem = (label, today, yesterday, deltaPerc, isPercent) => {
        let deltaClass = 'delta-neutral';
        let deltaLabel = '';

        if (isNaN(deltaPerc) || !isFinite(deltaPerc)) {
            deltaLabel = yesterday === 0 && today > 0 ? '新增' : '持平';
        } else {
            deltaClass = deltaPerc >= 0 ? 'delta-positive' : 'delta-negative';
            // 错误数增多是负面的，颜色逻辑反向处理由CSS决定较好，此处仅标记升降
            if (label.includes('错误') && deltaPerc > 0) deltaClass = 'delta-negative';
            else if (label.includes('错误') && deltaPerc < 0) deltaClass = 'delta-positive';

            deltaLabel = (deltaPerc >= 0 ? '↑' : '↓') + ' ' + Math.abs(deltaPerc).toFixed(1) + '%';
        }

        return `
            <div class="comparison-item">
                <div class="comparison-label">${label}</div>
                <div class="comparison-values">
                    <span class="comparison-today">${today}${isPercent ? '%' : ''}</span>
                    <span class="comparison-yesterday">昨日: ${yesterday}${isPercent ? '%' : ''}</span>
                    <span class="comparison-delta ${deltaClass}">${deltaLabel}</span>
                </div>
            </div>
        `;
    };

    container.innerHTML =
        renderItem('Token 消耗量', formatNumber(c.token_usage.today), formatNumber(c.token_usage.yesterday), c.token_usage.delta_percent, false) +
        renderItem('执行成功率', c.success_rate.today, c.success_rate.yesterday, c.success_rate.delta_percent, true) +
        renderItem('异常日志记录', c.error_count.today, c.error_count.yesterday, c.error_count.delta_percent, false);
}

// --- Phase 2 Extended Logic ---



// 切换成本周期
function switchCostPeriod(period) {
    currentCostPeriod = period;
    const buttons = document.querySelectorAll('.period-btn');
    buttons.forEach(btn => {
        if (btn.dataset.period === period) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    if (previousData) updateCostAnalysis(previousData);
}

function updateCostAnalysis(data) {
    if (!data.cost_analysis) return;
    const cost = data.cost_analysis;
    const period = currentCostPeriod;
    const isToday = period === 'today';

    const totalCost = isToday ? (cost.today_total_cost || 0) : (cost.week_total_cost || 0);
    const totalTokens = isToday ? (cost.today_token_usage || 0) : (cost.week_token_usage || 0);
    const budgetUsage = isToday ? (cost.budget_usage_percent || 0) : ((cost.week_total_cost / (cost.daily_budget * 7)) * 100 || 0);
    const workflowData = isToday ? (cost.by_workflow_today_formatted || []) : (cost.by_workflow_week_formatted || []);

    const summaryEl = document.getElementById('costSummary');
    if (summaryEl) {
        const budgetStatusClass = cost.budget_status || 'normal';
        summaryEl.innerHTML = `
            <div class="cost-summary-item">
                <div class="cost-label">总预估成本</div>
                <div class="cost-value">¥${totalCost.toFixed(2)}</div>
                <div class="cost-subtitle">${formatNumber(totalTokens)} tokens (含 MJ 估算)</div>
            </div>
            <div class="cost-summary-item">
                <div class="cost-label">预算使用率</div>
                <div class="cost-value cost-${budgetStatusClass}">${budgetUsage.toFixed(1)}%</div>
                <div class="cost-subtitle">${isToday ? '今日' : '本周'} / ${isToday ? '¥' + cost.daily_budget : '¥' + (cost.daily_budget * 7)}</div>
            </div>
            <div class="cost-summary-item"><div class="cost-label">算力资产状态</div><div class="cost-status cost-status-${budgetStatusClass}">
                ${budgetStatusClass === 'critical' ? '🔴 熔断/超支' : budgetStatusClass === 'warning' ? '🟡 接近上限' : '🟢 充足'}
            </div></div>
        `;
    }

    const breakdownEl = document.getElementById('costBreakdown');
    if (breakdownEl) {
        if (!workflowData || workflowData.length === 0) breakdownEl.innerHTML = '<div class="empty-state">暂无成本数据</div>';
        else breakdownEl.innerHTML = workflowData.slice(0, 10).map(wf => `
            <div class="cost-item">
                <div class="cost-item-header"><span class="cost-workflow">${wf.workflow}</span><span class="cost-amount">¥${wf.cost.toFixed(2)}</span></div>
                <div class="cost-item-details"><small>${wf.count} 次执行 | ${formatNumber(wf.tokens)} tokens | ${wf.percentage}%</small></div>
                <div class="cost-bar"><div class="cost-bar-fill" style="width: ${wf.percentage}%"></div></div>
            </div>
        `).join('');
    }
    updateCostChart(workflowData, totalCost);
}

function updateCostChart(workflowData, totalCost) {
    const canvas = document.getElementById('costChart');
    if (!canvas) return;
    if (costChart) { try { costChart.destroy(); } catch (e) { } }
    const ctx = canvas.getContext('2d');
    const displayData = (workflowData || []).slice(0, 8);
    const labels = displayData.map(wf => wf.workflow);
    const costs = displayData.map(wf => wf.cost);
    const colors = ['rgba(102, 126, 234, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(34, 197, 94, 0.8)'];

    costChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: labels, datasets: [{ data: costs, backgroundColor: colors, borderWidth: 2, borderColor: '#ffffff' }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
                tooltip: { callbacks: { label: function (c) { const v = c.parsed || 0; return `${c.label}: ¥${v.toFixed(2)} (${totalCost > 0 ? ((v / totalCost) * 100).toFixed(1) : 0}%)`; } } }
            }
        }
    });
}

function toggleAlertConfig() {
    const panel = document.getElementById('alertConfigPanel');
    const icon = document.getElementById('alertConfigToggleIcon');
    if (panel.style.display === 'none') {
        panel.style.display = 'block'; icon.textContent = '▲'; loadAlertRulesConfig();
    } else {
        panel.style.display = 'none'; icon.textContent = '▼';
    }
}

function loadAlertRulesConfig() {
    if (!previousData || !previousData.alert_rules) return;
    alertRulesConfig = JSON.parse(JSON.stringify(previousData.alert_rules));
    const contentEl = document.getElementById('alertConfigContent');
    const summaryEl = document.getElementById('currentRulesSummary');

    if (contentEl) {
        contentEl.innerHTML = `
            <div class="alert-rule-item"><label>P0告警阈值</label><input type="number" id="p0_alerts_threshold" value="${alertRulesConfig.p0_alerts_threshold}" min="0"></div>
            <div class="alert-rule-item"><label>任务队列积压阈值</label><input type="number" id="queue_backup_threshold" value="${alertRulesConfig.queue_backup_threshold}" min="0"></div>
            <div class="alert-rule-item"><label>错误日志阈值</label><input type="number" id="error_rate_threshold" value="${alertRulesConfig.error_rate_threshold}" min="0"></div>
            <div class="alert-rule-item"><label>调度任务失败阈值</label><input type="number" id="scheduler_failure_threshold" value="${alertRulesConfig.scheduler_failure_threshold || 1}" min="0"></div>
            <div class="alert-rule-item"><label>成本预算警告阈值 (%)</label><input type="number" id="cost_budget_warning_percent" value="${alertRulesConfig.cost_budget_warning_percent}" min="0" max="100"></div>
            <div class="alert-rule-item"><label>成本预算严重阈值 (%)</label><input type="number" id="cost_budget_critical_percent" value="${alertRulesConfig.cost_budget_critical_percent}" min="0" max="100"></div>
        `;
    }
    if (summaryEl) {
        summaryEl.innerHTML = `<div class="rule-summary-item"><span class="rule-label">P0告警:</span><span class="rule-value">> ${alertRulesConfig.p0_alerts_threshold}</span></div>
            <div class="rule-summary-item"><span class="rule-label">队列积压:</span><span class="rule-value">> ${alertRulesConfig.queue_backup_threshold}</span></div>
            <div class="rule-summary-item"><span class="rule-label">错误日志:</span><span class="rule-value">> ${alertRulesConfig.error_rate_threshold}</span></div>
            <div class="rule-summary-item"><span class="rule-label">调度失败:</span><span class="rule-value">> ${alertRulesConfig.scheduler_failure_threshold || 1}</span></div>`;
    }
}

function validateAlertRules(rules) {
    const errors = [];
    if (rules.p0_alerts_threshold < 0) errors.push('P0告警阈值不能为负数');
    if (rules.queue_backup_threshold < 0) errors.push('队列积压阈值不能为负数');
    if (rules.error_rate_threshold < 0) errors.push('错误日志阈值不能为负数');
    if (rules.cost_budget_warning_percent < 0 || rules.cost_budget_warning_percent > 100) {
        errors.push('成本警告阈值必须在0-100之间');
    }
    if (rules.cost_budget_critical_percent < 0 || rules.cost_budget_critical_percent > 100) {
        errors.push('成本严重阈值必须在0-100之间');
    }
    if (rules.cost_budget_warning_percent >= rules.cost_budget_critical_percent) {
        errors.push('警告阈值必须小于严重阈值');
    }
    return errors;
}

async function saveAlertRules() {
    if (!alertRulesConfig) return;

    // 收集
    const newRules = {
        ...alertRulesConfig,
        p0_alerts_threshold: parseInt(document.getElementById('p0_alerts_threshold').value) || 0,
        queue_backup_threshold: parseInt(document.getElementById('queue_backup_threshold').value) || 0,
        error_rate_threshold: parseInt(document.getElementById('error_rate_threshold').value) || 0,
        scheduler_failure_threshold: parseInt(document.getElementById('scheduler_failure_threshold').value) || 0,
        cost_budget_warning_percent: parseInt(document.getElementById('cost_budget_warning_percent').value) || 0,
        cost_budget_critical_percent: parseInt(document.getElementById('cost_budget_critical_percent').value) || 0
    };

    // 验证
    const errors = validateAlertRules(newRules);
    if (errors.length > 0) {
        alert('❌ 配置验证失败：\n' + errors.join('\n'));
        return;
    }

    alertRulesConfig = newRules;
    localStorage.setItem('alertRulesConfig', JSON.stringify(alertRulesConfig));

    // 生成 JSON 供手动同步
    const configJson = JSON.stringify(alertRulesConfig, null, 2);
    console.log('Updated Config JSON:', configJson);

    alert('✅ 告警规则已保存至本地存储。\n\n📋 配置 JSON 已输出至控制台，由于当前为独立部署版本，请手动更新服务器上的 alert-rules-config.json 文件以实现永久生效。');
    loadAlertRulesConfig();
}

function resetAlertRules() {
    if (confirm('确定要重置为默认值吗？')) {
        alertRulesConfig = { p0_alerts_threshold: 1, queue_backup_threshold: 10, error_rate_threshold: 5, scheduler_failure_threshold: 1, cost_budget_warning_percent: 80, cost_budget_critical_percent: 100 };
        loadAlertRulesConfig();
    }
}

// --- Phase 3 SLA Monitoring ---

function switchSLAPeriod(period) {
    currentSLAPeriod = period;
    const buttons = document.querySelectorAll('.sla-period-selector .period-btn');
    buttons.forEach(btn => {
        if (btn.dataset.period === period) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    if (previousData) updateSLAMonitoring(previousData);
}

function updateSLAMonitoring(data) {
    if (!data.sla_monitoring) return;
    const sla = data.sla_monitoring;
    const period = currentSLAPeriod;
    const isToday = period === 'today';
    const stats = isToday ? sla.today_stats_formatted : (sla.week_stats_formatted || []);
    const overallRate = isToday ? sla.overall_sla_rate : (stats.length > 0 ? stats.reduce((sum, s) => sum + (s.sla_rate || 0), 0) / stats.length : 0);
    const violations = isToday ? (sla.sla_violations || []) : [];
    const timeoutTasks = isToday ? (sla.timeout_tasks || []) : [];

    const summaryEl = document.getElementById('slaSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div class="sla-summary-item"><div class="sla-label">整体 SLA 达成率</div><div class="sla-value ${overallRate >= 95 ? 'sla-excellent' : (overallRate >= 80 ? 'sla-good' : 'sla-warning')}">${overallRate.toFixed(1)}%</div></div>
            <div class="sla-summary-item"><div class="sla-label">监控工作流</div><div class="sla-value">${stats.length}</div></div>
            <div class="sla-summary-item"><div class="sla-label">超时任务</div><div class="sla-value ${timeoutTasks.length > 0 ? 'sla-critical' : ''}">${timeoutTasks.length}</div></div>
            <div class="sla-summary-item"><div class="sla-label">SLA 违规</div><div class="sla-value ${violations.length > 0 ? 'sla-warning' : ''}">${violations.length}</div></div>
        `;
    }

    const tableEl = document.getElementById('slaStatsTable');
    if (tableEl) {
        if (stats.length === 0) tableEl.innerHTML = '<div class="empty-state">暂无 SLA 数据</div>';
        else {
            tableEl.innerHTML = `
                <table class="dashboard-table sla-table">
                    <thead><tr><th>工作流</th><th>执行次</th><th>达成率</th><th>平均</th><th>最大</th><th>状态</th></tr></thead>
                    <tbody>${stats.map(s => {
                const rateClass = s.sla_rate >= 95 ? 'sla-rate-excellent' : (s.sla_rate >= 80 ? 'sla-rate-good' : 'sla-rate-warning');
                return `<tr><td>${s.workflow}</td><td>${s.total}</td><td><span class="sla-rate ${rateClass}">${s.sla_rate}%</span></td><td>${s.avg_duration}m</td><td>${s.max_duration}m</td><td>${s.sla_rate >= 80 ? '✅' : '⚠️'}</td></tr>`;
            }).join('')}</tbody>
                </table>
            `;
        }
    }

    const violationsEl = document.getElementById('slaViolations');
    if (violationsEl) {
        if (violations.length === 0) violationsEl.innerHTML = '<div class="empty-state">✅ 暂无违规</div>';
        else {
            violationsEl.innerHTML = `<h3>最近违规</h3>` + violations.slice(0, 5).map(v => `
                <div class="sla-violation-item sla-violation-${v.severity || 'warning'}">
                    <span>${v.workflow}</span><span>${v.duration}m</span><span>阈值 ${v.threshold || (v.baseline ? v.baseline.warning : '?')}m</span>
                </div>
            `).join('');
        }
    }
}

// --- End Phase 3 ---

// --- End Phase 2 ---

// --- End Phase 1 ---

// 更新任务队列
function updateTaskQueue(tasks) {
    const pendingCount = tasks.pending.length;
    const processingCount = tasks.processing.length;
    const alertCount = tasks.alerts.length;

    const pendingCountEl = document.getElementById('pendingCount');
    const processingCountEl = document.getElementById('processingCount');
    const alertCountEl = document.getElementById('alertCount');
    const pendingBadgeEl = document.getElementById('pendingBadge');

    if (pendingCountEl) pendingCountEl.textContent = pendingCount;
    if (processingCountEl) processingCountEl.textContent = processingCount;
    if (alertCountEl) alertCountEl.textContent = alertCount;
    if (pendingBadgeEl) pendingBadgeEl.textContent = pendingCount;

    // 应用筛选
    let filteredTasks = tasks.pending;
    if (currentFilters.workflow) {
        filteredTasks = filteredTasks.filter(t =>
            (t.workflow || '').toLowerCase().includes(currentFilters.workflow.toLowerCase())
        );
    }
    if (currentFilters.priority) {
        filteredTasks = filteredTasks.filter(t => t.priority === currentFilters.priority);
    }

    const taskList = document.getElementById('taskList');
    if (taskList) {
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<div class="empty-state">暂无待处理任务</div>';
        } else {
            taskList.innerHTML = filteredTasks.slice(0, 10).map(task => `
                <div class="task-item priority-${task.priority || 'P2'}" 
                     onclick="showTaskDetail('${task.id}', '${task.trace_id || ''}')">
                    <strong>${task.workflow || 'Unknown'}</strong>
                    <small>${task.age_minutes} 分钟前 | ${task.priority || 'Unknown'}</small>
                </div>
            `).join('');
        }
    }

    // 更新工作流筛选器选项
    updateWorkflowFilterOptions(tasks.pending);
}

// 更新工作流筛选器选项
function updateWorkflowFilterOptions(tasks) {
    const workflowFilter = document.getElementById('workflowFilter');
    if (!workflowFilter) return;

    const workflows = [...new Set(tasks.map(t => t.workflow).filter(w => w))];

    // 保留"所有工作流"选项
    const currentValue = workflowFilter.value;
    workflowFilter.innerHTML = '<option value="">所有工作流</option>';

    workflows.forEach(wf => {
        const option = document.createElement('option');
        option.value = wf;
        option.textContent = wf;
        workflowFilter.appendChild(option);
    });

    workflowFilter.value = currentValue;
}

// 更新性能指标
function updatePerformance(performance, history) {
    if (!performance) return;

    const tokenTodayEl = document.getElementById('tokenToday');
    const tokenWeekEl = document.getElementById('tokenWeek');
    const successRateEl = document.getElementById('successRate');

    if (tokenTodayEl) tokenTodayEl.textContent = formatNumber(performance.token_usage_today || 0);
    if (tokenWeekEl) tokenWeekEl.textContent = formatNumber(performance.token_usage_week || 0);
    if (successRateEl) successRateEl.textContent = `${performance.success_rate || 0}%`;

    // 更新Token趋势图
    if (history && history.token_trend_7d) {
        updateTokenChart(history.token_trend_7d);
    }
}

// 更新Token趋势图
function updateTokenChart(trendData) {
    const canvas = document.getElementById('tokenTrendChart');
    if (!canvas) return;

    if (tokenChart) {
        tokenChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    tokenChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.map(d => d.date),
            datasets: [{
                label: 'Token消耗',
                data: trendData.map(d => d.value),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

// 更新业务指标
function updateBusinessMetrics(business) {
    if (!business) return;

    const atEl = document.getElementById('articlesToday');
    const awEl = document.getElementById('articlesWeek');
    const qpEl = document.getElementById('qcPassRate');
    const efEl = document.getElementById('efficiency');

    if (atEl) atEl.textContent = business.articles_today || 0;
    if (awEl) awEl.textContent = business.articles_week || 0;
    if (qpEl) qpEl.textContent = `${business.qc_pass_rate || 0}%`;
    if (efEl) efEl.textContent = `${business.efficiency || 0} 篇/小时`;
}

// 更新调度任务
function updateScheduledTasks(tasks) {
    const taskList = document.getElementById('scheduledTasksList');
    const badgeEl = document.getElementById('scheduledTasksBadge');

    if (badgeEl) badgeEl.textContent = tasks.length;
    if (!taskList) return;

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">暂无调度任务</div>';
    } else {
        taskList.innerHTML = tasks.map(task => {
            const statusClass = task.status === 'Running' ? 'status-Running' :
                task.status === 'Disabled' ? 'status-Disabled' : '';
            const resultIcon = task.last_result === 0 ? '✅' :
                task.last_result !== null ? '❌' : '⏸️';

            return `
                <div class="scheduled-task-item ${statusClass}">
                    <strong>${task.name}</strong>
                    <small>${resultIcon} ${task.status} | 最后执行: ${task.last_run || '从未'}</small>
                </div>
            `;
        }).join('');
    }
}

// 更新工作流性能
function updateWorkflowPerformance(performance) {
    if (!performance || !performance.avg_duration_by_workflow) return;

    const container = document.getElementById('workflowPerformance');
    if (!container) return;

    const workflows = Object.entries(performance.avg_duration_by_workflow)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (workflows.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无性能数据</div>';
    } else {
        container.innerHTML = workflows.map(([name, duration]) => `
            <div class="workflow-perf-item">
                <span class="workflow-name">${name}</span>
                <span class="workflow-duration">${duration} 分钟</span>
            </div>
        `).join('');
    }
}

// 更新日志统计
function updateLogStats(logs) {
    const ltEl = document.getElementById('logTotal');
    const liEl = document.getElementById('logInfo');
    const lwEl = document.getElementById('logError'); // 这里之前可能是 logWarn 对应不对
    const leEl = document.getElementById('logError');

    if (ltEl) ltEl.textContent = logs.total || 0;
    if (liEl) liEl.textContent = (logs.by_level && logs.by_level.INFO) || 0;

    const warnEl = document.getElementById('logWarn');
    if (warnEl) warnEl.textContent = (logs.by_level && logs.by_level.WARN) || 0;
    if (leEl) leEl.textContent = (logs.by_level && logs.by_level.ERROR) || 0;

    const workflowStats = document.getElementById('workflowStats');
    if (workflowStats) {
        const workflows = Object.entries(logs.by_workflow || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (workflows.length === 0) {
            workflowStats.innerHTML = '<div class="empty-state">暂无工作流数据</div>';
        } else {
            workflowStats.innerHTML = workflows.map(([name, count]) => `
                <div class="workflow-stat">
                    <span>${name}</span>
                    <strong>${count}</strong>
                </div>
            `).join('');
        }
    }
}

// 更新健康问题
function updateHealthIssues(health) {
    const healthIssues = document.getElementById('healthIssues');
    if (!healthIssues) return;

    const translations = {
        'ERR_P0_ALERTS_ACTIVE': '检测到活跃 P0 告警',
        'WARN_QUEUE_BACKUP': '任务队列积压',
        'WARN_HIGH_ERROR_RATE': '今日错误日志率较高',
        'ERR_SCHEDULER_EXCEPTION': '调度任务执行异常',
        'ERR_COST_BUDGET_EXCEEDED': '成本预算已超支',
        'WARN_COST_BUDGET_WARNING': '成本预算使用率过高(警告)',
        'WARN_SLA_VIOLATION': 'SLA 超时任务过多'
    };

    if (!health.issues || health.issues.length === 0) {
        healthIssues.innerHTML = '<div class="health-issue resolved">✅ 系统运行正常</div>';
    } else {
        healthIssues.innerHTML = health.issues.map(issue => {
            const translated = translations[issue] || issue;
            return `<div class="health-issue">⚠️ ${translated}</div>`;
        }).join('');
    }
}

// 更新错误列表
function updateErrorList(errors) {
    const errorList = document.getElementById('errorList');
    const badgeEl = document.getElementById('errorBadge');

    if (badgeEl) badgeEl.textContent = errors.length;
    if (!errorList) return;

    if (errors.length === 0) {
        errorList.innerHTML = '<div class="empty-state">暂无错误记录</div>';
    } else {
        errorList.innerHTML = errors.slice(0, 5).map(error => `
            <div class="error-item" onclick="showTaskDetail(null, '${error.trace_id || ''}')">
                <strong>${error.level}</strong>: ${error.workflow || 'Unknown'}<br>
                <small>${error.error || 'No details'} | ${formatTime(error.time)}</small>
            </div>
        `).join('');
    }
}

// ========== 标签页切换功能 ==========
function switchTab(tabName) {
    // 隐藏所有标签页内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // 移除所有标签按钮的active状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 显示选中的标签页
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // 激活对应的标签按钮
    const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }

    // 保存当前标签到localStorage
    try {
        localStorage.setItem('dashboard-active-tab', tabName);
    } catch (e) {
        console.warn('LocalStorage access failed:', e);
    }

    // 切换标签时确保该标签下的图表重绘（因 Canvas 尺寸变化所需）
    if (typeof previousData !== 'undefined' && previousData) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                const targetTab = document.getElementById(`tab-${tabName}`);
                if (targetTab && targetTab.offsetHeight > 0) {
                    if (tabName === 'performance') {
                        if (previousData.history?.multi_metric_trend) updateMultiMetricChart(previousData);
                        if (previousData.performance?.duration_percentiles) updatePerformancePercentiles(previousData);
                    }
                    else if (tabName === 'cost') {
                        updateCostAnalysis(previousData);
                    }
                    else if (tabName === 'sla') {
                        updateSLAMonitoring(previousData);
                    }
                    else if (tabName === 'content') {
                        updateContentFactory(previousData);
                    }
                }
            }, 100);
        });
    }
}

// ========== 折叠分组功能 ==========
function toggleGroup(groupId) {
    const content = document.getElementById(`group-${groupId}`);
    const icon = document.getElementById(`icon-${groupId}`);

    if (!content || !icon) {
        console.warn(`Group elements not found: ${groupId}`);
        return;
    }

    const header = icon.closest('.card-group-header');
    if (!header) {
        console.warn(`Group header not found: ${groupId}`);
        return;
    }

    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        header.classList.remove('collapsed');
        icon.textContent = '▼';
    } else {
        content.classList.add('collapsed');
        header.classList.add('collapsed');
        icon.textContent = '▶';
    }

    // 保存折叠状态
    const state = content.classList.contains('collapsed') ? 'collapsed' : 'expanded';
    localStorage.setItem(`group-${groupId}-state`, state);
}

// ========== 更新KPI横幅 ==========
function updateKPIBanner(data) {
    if (!data) return;

    // P0告警 - 只统计ALERT文件（ALERT_P0_*.lock），不包括普通P0任务
    // 普通P0任务只是高优先级任务，不是告警；只有系统生成的ALERT文件才是真正的告警
    const kpiAlerts = document.getElementById('kpiAlerts');
    if (kpiAlerts) {
        const alertCount = (data.tasks?.alerts?.length) || 0;
        kpiAlerts.textContent = alertCount;
        const card = kpiAlerts.closest('.kpi-card');
        if (card) {
            card.classList.toggle('pulse', alertCount > 0);
            const detailText = alertCount > 0
                ? `当前有 ${alertCount} 个 P0 级别告警文件 (ALERT_P0_*.lock)`
                : `当前无 P0 级别告警`;
            card.title = detailText;
        }
    }

    // 队列堆积
    const kpiQueue = document.getElementById('kpiQueue');
    if (kpiQueue) {
        const queueCount = (data.tasks?.pending?.length) || 0;
        kpiQueue.textContent = queueCount;
    }

    // 成功率 - 修复：确保正确处理数据，包括null/undefined情况
    const kpiSuccess = document.getElementById('kpiSuccess');
    if (kpiSuccess) {
        const successRate = data.performance?.success_rate;
        // 处理null、undefined、NaN等情况
        const rate = (successRate !== null && successRate !== undefined && !isNaN(successRate))
            ? Number(successRate)
            : 0;
        kpiSuccess.textContent = `${rate.toFixed(1)}%`;
    }

    // 今日成本
    const kpiCost = document.getElementById('kpiCost');
    if (kpiCost) {
        const cost = data.cost_analysis?.today_total_cost ?? 0;
        kpiCost.textContent = `¥${Number(cost).toFixed(2)}`;

        // 添加成本超预算警告
        const budgetPercent = data.cost_analysis?.budget_usage_percent ?? 0;
        const card = kpiCost.closest('.kpi-card');
        if (card && budgetPercent >= 80) {
            // 如果 CSS 尚未定义 warning 类，这里仅作为逻辑预留，或复用 critical 类样式
            // 为避免视觉冲突，这里仅在极端情况(>100%)添加 critical 样式
            if (budgetPercent >= 100) {
                card.classList.add('critical');
                card.classList.remove('cost');
            }
            card.title = `预算使用率已达 ${budgetPercent}%`;
        }
    }
}




// 更新告警历史
function updateAlertList(alerts) {
    const alertList = document.getElementById('alertList');
    if (!alertList) return;

    if (alerts.length === 0) {
        alertList.innerHTML = '<div class="empty-state">暂无告警历史</div>';
    } else {
        alertList.innerHTML = alerts.slice(0, 10).map(alert => `
            <div class="alert-item">
                <strong>${alert.level} ${alert.rule_id}</strong><br>
                <small>${alert.reason} | ${alert.time}</small>
            </div>
        `).join('');
    }
}

// 显示任务详情
function showTaskDetail(taskId, traceId) {
    const modal = document.getElementById('taskModal');
    const modalBody = document.getElementById('taskModalBody');

    if (!modal || !modalBody) return;

    modalBody.innerHTML = '<div class="empty-state">加载详情中...</div>';
    modal.classList.add('visible');

    if (traceId) {
        modalBody.innerHTML = `
            <div class="task-detail">
                <h4 style="margin-bottom: 1rem; color: #667eea;">Trace ID: ${traceId}</h4>
                <p><strong>任务ID:</strong> ${taskId || 'N/A'}</p>
                <div style="margin-top: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                    <p style="font-size: 0.9rem; color: #666;">📝 提示：分布式追踪功能正在接入中，当前由于安全沙箱限制，仅展示 Trace ID。</p>
                </div>
            </div>
        `;
    } else {
        modalBody.innerHTML = `
            <div class="task-detail">
                <h4 style="margin-bottom: 1rem; color: #ef4444;">任务ID: ${taskId || 'N/A'}</h4>
                <p>⚠️ 提示：该任务无 Trace ID，通常属于单一脚本触发或早期遗留任务。</p>
            </div>
        `;
    }
}

// 关闭任务详情模态框
function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) modal.classList.remove('visible');
}

// 点击模态框外部关闭
window.onclick = function (event) {
    const modal = document.getElementById('taskModal');
    if (event.target === modal) {
        closeTaskModal();
    }
}

// 检查新告警并通知
function checkNewAlerts(currentAlerts, previousAlerts) {
    if (!currentAlerts || !previousAlerts) return;
    const newAlerts = currentAlerts.filter(alert =>
        !previousAlerts.some(prev => prev.id === alert.id)
    );

    if (newAlerts.length > 0 && 'Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('🚨 硅基能效 - 新告警', {
                    body: `发现 ${newAlerts.length} 个新 P0 告警`,
                    tag: 'dashboard-alert'
                });
            }
        });
    }
}

// 刷新数据（手动）
function refreshData() {
    loadData(true);
}

// 启动自动刷新
function startAutoRefresh() {
    refreshTimer = setInterval(() => {
        loadData(false);
    }, REFRESH_INTERVAL);
}

// 启动倒计时
function startCountdown() {
    countdownTimer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            countdown = 30;
        }
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) countdownEl.textContent = countdown;
    }, 1000);
}

// 格式化时间
function formatTime(timeString) {
    if (!timeString) return '-';
    try {
        const date = new Date(timeString);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        if (seconds > 10) return `${seconds}秒前`;
        return '刚刚';
    } catch {
        return timeString;
    }
}

// 格式化数字
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// 显示错误
function showError(message) {
    const healthIssues = document.getElementById('healthIssues');
    if (healthIssues) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'health-issue';
        errorDiv.innerHTML = `❌ ${message}`;
        healthIssues.insertBefore(errorDiv, healthIssues.firstChild);
    }
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (refreshTimer) clearInterval(refreshTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    if (tokenChart) tokenChart.destroy();
    if (multiMetricChart) multiMetricChart.destroy();
    if (histogramChart) histogramChart.destroy();
    if (costChart) costChart.destroy();
});

// --- Consolidated Views Logic ---

function updateSystemHealth(data) {
    // 1. Vital Signs
    const metrics = data.performance || {};
    const health = data.health || {};
    const logs = data.logs || {};

    // Success Rate
    setText('sysSuccessRate', metrics.success_rate || '0%');

    // Avg Duration (convert s to m if needed, simpler logic)
    const avg = metrics.avg_duration_all || 0;
    const p95 = (metrics.duration_percentiles && metrics.duration_percentiles['all'] && metrics.duration_percentiles['all'].p95) || 0;
    setText('sysAvgDuration', avg.toFixed(1) + 'm');
    setText('sysP95', p95 + 'm');

    // Error Rate
    const errCount = logs.total_errors || 0;
    const total = logs.total_count || 1;
    const errRate = ((errCount / total) * 100).toFixed(1) + '%';
    setText('sysErrorRate', errRate);
    setText('sysErrorCount', errCount);

    // 2. Alerts & Errors Lists
    const errors = logs.recent_errors || [];
    renderErrorListSimplified('sysErrorList', errors);

    const alerts = data.alerts || [];
    renderAlertListSimplified('sysAlertList', alerts);
    setText('activeAlertsBadge', (errors.length + alerts.length) || 0);

    // 3. SLA Simple List
    const sla = data.sla_monitoring || {};
    renderSLASimple('slaSimpleList', sla);
}

function updateResourcesSimplified(data) {
    const cost = data.cost_analysis || {};
    const period = currentCostPeriod;
    const isToday = period === 'today';

    // 1. Budget Gauge
    const limit = cost.daily_budget || 100;
    const current = isToday ? (cost.today_total_cost || 0) : (cost.week_total_cost || 0);
    const displayLimit = isToday ? limit : (limit * 7);

    setText('resTodayCost', '¥' + current.toFixed(2));
    setText('resDailyLimit', displayLimit);

    const pct = Math.min(100, Math.max(0, (current / displayLimit) * 100));
    const bar = document.getElementById('resBudgetBar');
    if (bar) {
        bar.style.width = pct + '%';
        bar.className = 'budget-progress-fill ' + (pct > 90 ? 'critical' : pct > 75 ? 'warning' : 'success');
        if (pct > 90) bar.style.backgroundColor = '#ef4444';
        else if (pct > 75) bar.style.backgroundColor = '#f59e0b';
        else bar.style.backgroundColor = '#10b981';
    }

    const statusText = pct > 100 ? '严重超支' : pct > 90 ? '即将耗尽' : pct > 75 ? '使用较高' : '预算充足';
    setText('resBudgetStatus', '状态: ' + statusText);

    // Token Secondary
    const tokens = isToday ? (cost.today_token_usage || 0) : (cost.week_token_usage || 0);
    setText('resTodayTokens', formatNumber(tokens));

    // 2. Top Consumption List
    const list = isToday ? (cost.by_workflow_today_formatted || []) : (cost.by_workflow_week_formatted || []);
    const topList = list.sort((a, b) => b.cost - a.cost).slice(0, 5);
    const listContainer = document.getElementById('costTopList');

    if (listContainer) {
        if (topList.length === 0) listContainer.innerHTML = '<div class="empty-state">暂无数据</div>';
        else {
            listContainer.innerHTML = topList.map((item, idx) => `
                <div class="cost-top-item">
                     <div class="cost-idx">${idx + 1}</div>
                     <div class="cost-name">${item.workflow}</div>
                     <div class="cost-val">¥${item.cost.toFixed(2)}</div>
                </div>
            `).join('');
        }
    }
}

// Helper: Tab switcher for Alerts section
window.switchAlertSubTab = function (subTab) {
    // Buttons
    document.querySelectorAll('.alert-tab').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    // Content
    document.querySelectorAll('.alert-sub-content').forEach(c => c.style.display = 'none');
    document.getElementById('alertSubTab-' + subTab).style.display = 'block';
};

// Helper: Renderers
function renderErrorListSimplified(id, items) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!items || items.length === 0) {
        el.innerHTML = '<div class="empty-state">运行平稳，无最近错误</div>';
        return;
    }
    el.innerHTML = items.map(err => `
        <div class="error-item">
            <strong>${err.time.split('T')[1].split('.')[0]} - ${err.workflow}</strong>
            <small>${err.message}</small>
        </div>
    `).join('');
}

function renderAlertListSimplified(id, items) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!items || items.length === 0) {
        el.innerHTML = '<div class="empty-state">历史记录清洁</div>';
        return;
    }
    el.innerHTML = items.map(a => `
        <div class="alert-item">
             <strong>${a.title}</strong>
             <small>${a.time}</small>
        </div>
    `).join('');
}

function renderSLASimple(id, sla) {
    const el = document.getElementById(id);
    if (!el || !sla) return;

    if (!sla.violations || sla.violations.length === 0) {
        el.innerHTML = `
            <div style="text-align:center; padding: 1rem; color: #10b981;">
                <h3>✨ 100% 达标</h3>
                <small>今日无 SLA 违规记录</small>
            </div>
        `;
    } else {
        el.innerHTML = sla.violations.slice(0, 3).map(v => `
            <div class="health-issue">
                <strong>SLA 违规: ${v.workflow}</strong>
                <div>耗时 ${v.duration}s (标准 < ${v.threshold}s)</div>
            </div>
        `).join('') + (sla.violations.length > 3 ? `<div style="text-align:center; font-size:0.8rem;">...等 ${sla.violations.length} 项</div>` : '');
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// --- V3.3 Cockpit & Activity Logic ---


function updateCockpit(data) {
    const health = data.health || { score: 0, status: 'unknown' };
    const perf = data.performance || {};
    const business = data.business || {};
    const cost = data.cost_analysis || {};
    const logs = data.logs || {};
    const alerts = data.alerts || [];
    const tasks = data.tasks || { pending: [], processing: [] };

    // 1. Health Hero
    setText('cockpitHealthScore', health.score);
    setText('cockpitStatusBadge', health.status === 'healthy' ? '✅ System Healthy' : (health.status === 'warning' ? '⚠️ Warning' : '🔴 Critical'));

    // Summary Text Logic
    const summary = [];
    if (health.score === 100) summary.push('系统运行完美，所有指标均在最佳范围内。');
    else if (health.score >= 90) summary.push('系统运行良好，各项指标正常。');
    else summary.push('系统存在部分异常，请关注告警信息。');

    // Safe count for pending
    const pendingCount = Array.isArray(tasks.pending) ? tasks.pending.length : (tasks.pending_count || 0);

    if (pendingCount > 5) summary.push(`积压任务 ${pendingCount} 个。`);
    if (logs.recent_errors && logs.recent_errors.length > 0) summary.push(`最近 ${logs.recent_errors.length} 个错误。`);

    setText('cockpitHealthSummary', summary.join(' '));

    // 2. Alert Box Logic (Refined)
    const alertBox = document.getElementById('cockpitAlertBox');
    if (alertBox) {
        // Only show RED if there are active P0 alerts or status is critical
        if (alerts.length > 0 || health.status === 'critical') {
            const count = alerts.length;
            alertBox.className = 'alert-box has-alert';
            alertBox.innerHTML = `
                <div class="alert-icon">🚨</div>
                <div class="alert-info">
                    <strong>发现 ${count} 个活跃告警</strong>
                    <small>请立即检查系统动态或执行维护</small>
                </div>
            `;
        } else if (health.status === 'warning' || (logs.recent_errors && logs.recent_errors.length > 0)) {
            // Yellow state for warnings or recent errors (but system is technically 'healthy' or 'warning')
            // If score is 100, we force green even if there are recent errors (they are resolved)
            if (health.score === 100) {
                alertBox.className = 'alert-box';
                alertBox.innerHTML = `
                    <div class="alert-icon">🟢</div>
                    <div class="alert-info">
                        <strong>系统运行平稳</strong>
                        <small>最近异常已解决，当前无活跃告警</small>
                    </div>
                `;
            } else {
                const count = logs.recent_errors ? logs.recent_errors.length : 0;
                alertBox.className = 'alert-box'; // Use standard bg but maybe add a warning icon inside
                alertBox.style.borderLeftColor = '#f59e0b'; // Warning yellow
                alertBox.innerHTML = `
                    <div class="alert-icon">⚠️</div>
                    <div class="alert-info">
                        <strong>发现 ${count} 个最近异常</strong>
                        <small>非阻塞性问题，请关注日志</small>
                    </div>
                `;
            }
        } else {
            alertBox.className = 'alert-box';
            alertBox.style.borderLeftColor = ''; // Reset
            alertBox.innerHTML = `
                <div class="alert-icon">🟢</div>
                <div class="alert-info">
                    <strong>当前无活跃告警</strong>
                    <small>系统运行平稳，各项监测正常</small>
                </div>
            `;
        }
    }

    // 3. KPI Grid

    // Op: Output & QC
    setText('kpiOpsOutput', (business.articles_today || 0) + ' 篇');
    setText('kpiOpsQC', (business.qc_pass_rate || '0%'));

    // Perf: Duration & Success
    const avg = perf.avg_duration_all || 0;
    setText('kpiPerfDuration', avg.toFixed(1) + 'm');
    setText('kpiPerfSuccess', (perf.success_rate || '0%'));

    // Res: Token & Cost
    const todayTokens = cost.today_token_usage || 0;
    const todayCost = cost.today_total_cost || 0;
    setText('kpiResTokens', formatNumber(todayTokens));
    setText('kpiResCost', '¥' + todayCost.toFixed(2));

    // Stab: Queue & Errors - FIXED: tasks.pending is an array
    setText('kpiStabQueue', pendingCount);
    setText('kpiStabErrors', (logs.total_errors || 0));
}

function updateActivity(data) {
    // 1. Task Queue (Reusing existing logic logic but scoped)
    updateTaskQueue(data.tasks);

    // 2. Scheduled Tasks
    updateScheduledTasks(data.scheduled_tasks || []);

    // 3. Recent Logs (Consolidated Errors)
    const logs = data.logs || {};
    const errors = logs.recent_errors || [];
    renderErrorListSimplified('errorList', errors);
}

// Re-using simplified renderer from previous step
function renderErrorListSimplified(id, items) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!items || items.length === 0) {
        el.innerHTML = '<div class="empty-state">日志流清洁 (Log Stream Clean)</div>';
        return;
    }
    el.innerHTML = items.map(err => `
        <div class="error-item">
            <strong>${err.time.split('T')[1].split('.')[0]} - ${err.workflow}</strong>
            <small>${err.message}</small>
        </div>
    `).join('');
}
