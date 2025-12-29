// 05_Official_Website/dashboard/public/assets/script.js
// Enhanced with loading states and error handling
const DATA_FILE = 'dashboard-status.json';
const REFRESH_INTERVAL = 30000; // 30秒

let refreshTimer = null;
let countdownTimer = null;
let countdown = 30;
let previousData = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadData(true); // 首次加载显示loading
    startAutoRefresh();
    startCountdown();
});

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

            // 重置倒计时
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
    document.getElementById('lastUpdate').textContent = data.timestamp || data.system.last_update;
    document.getElementById('healthScore').textContent = data.health.score;

    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = data.health.status.toUpperCase();
    statusBadge.className = `status-badge status-${data.health.status}`;

    // 更新任务队列
    const pendingCount = data.tasks.pending.length;
    const processingCount = data.tasks.processing.length;
    const alertCount = data.tasks.alerts.length;

    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('processingCount').textContent = processingCount;
    document.getElementById('alertCount').textContent = alertCount;
    document.getElementById('pendingBadge').textContent = pendingCount;

    // 更新任务列表
    const taskList = document.getElementById('taskList');
    if (pendingCount === 0) {
        taskList.innerHTML = '<div class="empty-state">暂无待处理任务</div>';
    } else {
        taskList.innerHTML = data.tasks.pending.slice(0, 10).map(task => `
            <div class="task-item priority-${task.priority || 'P2'}">
                <strong>${task.workflow || 'Unknown'}</strong>
                <small>${task.age_minutes} 分钟前 | ${task.priority || 'Unknown'}</small>
            </div>
        `).join('');
    }

    // 更新日志统计
    document.getElementById('logTotal').textContent = data.logs.total;
    document.getElementById('logInfo').textContent = data.logs.by_level.INFO || 0;
    document.getElementById('logWarn').textContent = data.logs.by_level.WARN || 0;
    document.getElementById('logError').textContent = data.logs.by_level.ERROR || 0;

    // 更新工作流统计
    const workflowStats = document.getElementById('workflowStats');
    const workflows = Object.entries(data.logs.by_workflow || {})
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

    // 更新错误列表
    const errorList = document.getElementById('errorList');
    const errors = data.logs.recent_errors || [];
    document.getElementById('errorBadge').textContent = errors.length;

    if (errors.length === 0) {
        errorList.innerHTML = '<div class="empty-state">暂无错误</div>';
    } else {
        errorList.innerHTML = errors.slice(0, 5).map(error => `
            <div class="error-item">
                <strong>${error.level}</strong>: ${error.workflow || 'Unknown'}<br>
                <small>${error.error || 'No details'} | ${formatTime(error.time)}</small>
            </div>
        `).join('');
    }

    // 更新健康问题
    const healthIssues = document.getElementById('healthIssues');
    // 清空现有问题，重新渲染（避免追加重复）- 或者是append模式？
    // 原逻辑是完全覆盖：healthIssues.innerHTML = ...
    // 但showError是append。
    // 这里我们应该保持updateDashboard的完全覆盖逻辑。

    if (data.health.issues.length === 0) {
        healthIssues.innerHTML = '<div class="health-issue resolved">✅ 系统运行正常</div>';
    } else {
        healthIssues.innerHTML = data.health.issues.map(issue => `
            <div class="health-issue">⚠️ ${issue}</div>
        `).join('');
    }

    // 更新告警历史
    const alertList = document.getElementById('alertList');
    const alerts = data.alerts || [];

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

    // 检查新告警（通知）
    if (previousData && previousData.tasks.alerts.length < alertCount) {
        checkNewAlerts(data.tasks.alerts, previousData.tasks.alerts);
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
                        badge: '/favicon.ico',
                        tag: 'dashboard-alert'
                    });
                });
            }
        });
    }
}

// 刷新数据（手动）
function refreshData() {
    loadData(true); // 手动刷新显示loading
}

// 启动自动刷新
function startAutoRefresh() {
    refreshTimer = setInterval(() => {
        loadData(false); // 自动刷新不显示loading
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
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        return '刚刚';
    } catch {
        return timeString;
    }
}

// 显示错误
function showError(message) {
    const healthIssues = document.getElementById('healthIssues');
    if (healthIssues) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'health-issue';
        errorDiv.innerHTML = `❌ ${message}`;
        // 插入到最前面
        healthIssues.insertBefore(errorDiv, healthIssues.firstChild);
    }
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (refreshTimer) clearInterval(refreshTimer);
    if (countdownTimer) clearInterval(countdownTimer);
});
