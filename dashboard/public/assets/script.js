// 05_Official_Website/dashboard/public/assets/script.js
// V2.0 增强版：添加图表、交互、筛选功能

const DATA_FILE = 'dashboard-status.json';
const REFRESH_INTERVAL = 30000; // 30秒

let refreshTimer = null;
let countdownTimer = null;
let countdown = 30;
let previousData = null;
let tokenChart = null;
let currentFilters = {
    workflow: '',
    priority: ''
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadData(true);
    startAutoRefresh();
    startCountdown();
    setupFilters();
});

// 设置筛选器
function setupFilters() {
    const workflowFilter = document.getElementById('workflowFilter');
    const priorityFilter = document.getElementById('priorityFilter');

    if (workflowFilter) {
        workflowFilter.addEventListener('change', (e) => {
            currentFilters.workflow = e.target.value;
            applyFilters();
        });
    }

    if (priorityFilter) {
        priorityFilter.addEventListener('change', (e) => {
            currentFilters.priority = e.target.value;
            applyFilters();
        });
    }
}

// 应用筛选
function applyFilters() {
    if (!previousData) return;
    updateDashboard(previousData);
}

// 清除筛选
function clearFilters() {
    currentFilters.workflow = '';
    currentFilters.priority = '';
    const wfFilter = document.getElementById('workflowFilter');
    const prFilter = document.getElementById('priorityFilter');
    if (wfFilter) wfFilter.value = '';
    if (prFilter) prFilter.value = '';

    if (previousData) {
        updateDashboard(previousData);
    }
}

// 加载数据
async function loadData(showLoading = false) {
    if (showLoading) toggleLoading(true);

    try {
        const response = await fetch(`${DATA_FILE}?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (validateData(data)) {
            updateDashboard(data);
            previousData = data;
            countdown = 30;
        }
    } catch (error) {
        console.error('Failed to load data:', error);
        showError(`加载数据失败: ${error.message}`);
    } finally {
        if (showLoading) toggleLoading(false);
    }
}

// 验证数据格式
function validateData(data) {
    if (!data || typeof data !== 'object') {
        showError('无效的数据格式');
        return false;
    }

    if (!data.health || !data.tasks || !data.logs) {
        showError('数据缺失核心字段');
        return false;
    }

    return true;
}

// 切换Loading显示
function toggleLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('visible');
        } else {
            overlay.classList.remove('visible');
        }
    }
}

// 更新看板
function updateDashboard(data) {
    // 更新头部
    const lastUpdateEl = document.getElementById('lastUpdate');
    const healthScoreEl = document.getElementById('healthScore');
    if (lastUpdateEl) lastUpdateEl.textContent = data.timestamp || data.system.last_update;
    if (healthScoreEl) healthScoreEl.textContent = data.health.score;

    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
        statusBadge.textContent = data.health.status.toUpperCase();
        statusBadge.className = `status-badge status-${data.health.status}`;
    }

    // 更新任务队列
    updateTaskQueue(data.tasks);

    // 更新性能指标
    updatePerformance(data.performance, data.history);

    // 更新业务指标
    updateBusinessMetrics(data.business);

    // 更新调度任务
    updateScheduledTasks(data.scheduled_tasks || []);

    // 更新工作流性能
    updateWorkflowPerformance(data.performance);

    // 更新日志统计
    updateLogStats(data.logs);

    // 更新健康问题
    updateHealthIssues(data.health);

    // 更新错误列表
    updateErrorList(data.logs.recent_errors || []);

    // 更新告警历史
    updateAlertList(data.alerts || []);

    // 检查新告警
    if (previousData && previousData.tasks.alerts.length < (data.tasks.alerts.length || 0)) {
        checkNewAlerts(data.tasks.alerts, previousData.tasks.alerts);
    }
}

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
    const lwEl = document.getElementById('logWarn');
    const leEl = document.getElementById('logError');

    if (ltEl) ltEl.textContent = logs.total || 0;
    if (liEl) liEl.textContent = (logs.by_level && logs.by_level.INFO) || 0;
    if (lwEl) lwEl.textContent = (logs.by_level && logs.by_level.WARN) || 0;
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
        errorList.innerHTML = '<div class="empty-state">暂无错误</div>';
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
        alertList.innerHTML = '<div class="empty-state">暂无告警</div>';
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

    // 这里可以扩展：通过API或本地数据加载任务详情
    // 目前显示基本信息
    if (traceId) {
        modalBody.innerHTML = `
            <div class="task-detail">
                <h4 style="margin-bottom: 1rem; color: #667eea;">Trace ID: ${traceId}</h4>
                <p><strong>任务ID:</strong> ${taskId || 'N/A'}</p>
                <div style="margin-top: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                    <p style="font-size: 0.9rem; color: #666;">📝 提示：完整链路追踪功能正在接入中，当前由于安全沙箱限制，仅展示核心标识符。</p>
                </div>
            </div>
        `;
    } else {
        modalBody.innerHTML = `
            <div class="task-detail">
                <h4 style="margin-bottom: 1rem; color: #ef4444;">任务ID: ${taskId || 'N/A'}</h4>
                <p>⚠️ 提示：该任务无 Trace ID，属于系统早期遗留任务或直接调用的脚本，无法进行完整链路追踪。</p>
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
    const newAlerts = currentAlerts.filter(alert =>
        !previousAlerts.some(prev => prev.id === alert.id)
    );

    if (newAlerts.length > 0 && 'Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                newAlerts.forEach(alert => {
                    new Notification('🚨 新告警', {
                        body: `发现 ${newAlerts.length} 个新P0告警`,
                        icon: '/favicon.ico',
                        tag: 'dashboard-alert'
                    });
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
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
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
});
