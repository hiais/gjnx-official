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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadData(true);
    startAutoRefresh();
    startCountdown();
    setupFilters();
    setupExtendedFilters();
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

    // 更新现有组件
    updateTaskQueue(data.tasks);
    updatePerformance(data.performance, data.history);
    updateBusinessMetrics(data.business);
    updateScheduledTasks(data.scheduled_tasks || []);
    updateWorkflowPerformance(data.performance);
    updateLogStats(data.logs);

    // 更新健康问题
    updateHealthIssues(data.health);

    // 更新错误列表
    updateErrorList(data.logs.recent_errors || []);

    // 更新告警历史
    updateAlertList(data.alerts || []);

    // --- Phase 1 增强功能 (硬化版) ---
    try {
        if (data.history && data.history.multi_metric_trend) {
            updateMultiMetricChart(data);
        }
        if (data.performance && data.performance.duration_percentiles) {
            updatePerformancePercentiles(data);
        }
        if (data.comparison) {
            updateComparison(data);
        }
    } catch (e) {
        console.error('更新 Phase 1 增强卡片失败:', e);
    }

    // 检查新告警
    if (previousData && previousData.tasks.alerts.length < (data.tasks.alerts.length || 0)) {
        checkNewAlerts(data.tasks.alerts, previousData.tasks.alerts);
    }
}

// --- Phase 1 Extended Logic (Hardened) ---

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
        'ERR_SCHEDULER_EXCEPTION': '调度任务执行异常'
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
});
