# 监控和告警配置

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **目标**: 定义监控指标、告警规则和监控工具配置

## 监控指标定义

### 1. 内容生成监控

#### 指标
| 指标名称 | 类型 | 说明 | 阈值 |
|---------|------|------|------|
| `content_generation_success_rate` | 成功率 | 内容生成成功率 | ≥ 95% |
| `content_generation_duration` | 耗时 | 单篇内容生成耗时 | < 5分钟 |
| `content_validation_failure_rate` | 失败率 | 内容验证失败率 | < 5% |
| `content_sync_frequency` | 频率 | 内容同步频率 | 每6小时 |

#### 监控点
- 内容生成任务开始/结束
- 内容验证结果
- 内容同步状态
- 构建状态

### 2. 网站构建监控

#### 指标
| 指标名称 | 类型 | 说明 | 阈值 |
|---------|------|------|------|
| `build_success_rate` | 成功率 | 构建成功率 | ≥ 98% |
| `build_duration` | 耗时 | 构建耗时 | < 3分钟 |
| `build_size` | 大小 | 构建产物大小 | < 50MB |
| `page_count` | 数量 | 生成页面数量 | 监控变化 |

#### 监控点
- 构建开始/结束
- 构建错误
- 构建产物大小
- 页面生成数量

### 3. 数据质量监控

#### 指标
| 指标名称 | 类型 | 说明 | 阈值 |
|---------|------|------|------|
| `data_validation_error_count` | 错误数 | 数据验证错误数 | = 0 |
| `data_schema_compliance_rate` | 合规率 | Schema合规率 | = 100% |
| `data_update_frequency` | 频率 | 数据更新频率 | 每天 |

#### 监控点
- 数据验证结果
- Schema合规性
- 数据更新频率

### 4. 工作流执行监控

#### 指标
| 指标名称 | 类型 | 说明 | 阈值 |
|---------|------|------|------|
| `workflow_success_rate` | 成功率 | 工作流成功率 | ≥ 95% |
| `workflow_duration` | 耗时 | 工作流执行耗时 | < 10分钟 |
| `workflow_retry_count` | 重试次数 | 工作流重试次数 | < 3 |
| `workflow_failure_rate` | 失败率 | 工作流失败率 | < 5% |

#### 监控点
- 工作流开始/结束
- 工作流状态变化
- 重试次数
- 失败原因

## 告警规则

### P0 - 紧急告警（立即通知）

#### 规则1: 构建连续失败
**条件**: 连续3次构建失败  
**通知**: GitHub Issue + 邮件（如配置）  
**处理**: 自动回滚到上一个成功版本

#### 规则2: 数据验证失败
**条件**: 数据验证错误数 > 0  
**通知**: GitHub Issue  
**处理**: 阻止部署，等待修复

#### 规则3: 工作流完全失败
**条件**: 工作流最终状态为失败  
**通知**: GitHub Issue  
**处理**: 记录错误日志，等待人工介入

### P1 - 重要告警（1小时内通知）

#### 规则4: 内容生成成功率下降
**条件**: 成功率 < 90%  
**通知**: GitHub Issue  
**处理**: 检查内容生成流程

#### 规则5: 构建耗时异常
**条件**: 构建耗时 > 5分钟  
**通知**: GitHub Issue  
**处理**: 优化构建流程

#### 规则6: 工作流重试次数过多
**条件**: 重试次数 ≥ 3  
**通知**: GitHub Issue  
**处理**: 检查依赖和资源

### P2 - 警告（每日汇总）

#### 规则7: 内容生成耗时增加
**条件**: 平均耗时 > 3分钟  
**通知**: 日志记录  
**处理**: 优化生成流程

#### 规则8: 数据更新频率异常
**条件**: 超过24小时未更新  
**通知**: 日志记录  
**处理**: 检查定时任务

## 监控工具配置

### GitHub Actions 监控

#### 工作流状态监控
```yaml
# .github/workflows/monitor.yml
name: Monitor Workflows

on:
  workflow_run:
    workflows: ["Content Sync", "Build"]
    types: [completed]

jobs:
  check-status:
    runs-on: ubuntu-latest
    steps:
      - name: Check workflow status
        if: ${{ github.event.workflow_run.conclusion == 'failure' }}
        uses: actions/github-script@v6
        with:
          script: |
            // 创建告警Issue
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `[监控] 工作流失败: ${{ github.event.workflow_run.name }}`,
              body: `工作流执行失败，请检查日志。`,
              labels: ['monitoring', 'alert']
            });
```

### 日志监控

#### 日志格式
```
[2025-01-01 12:00:00] [LEVEL] [MODULE] Message
```

**示例**:
```
[2025-01-01 12:00:00] [INFO] [CONTENT_SYNC] Starting content sync
[2025-01-01 12:00:05] [INFO] [CONTENT_SYNC] Synced 5 articles
[2025-01-01 12:00:10] [ERROR] [BUILD] Build failed: TypeScript error
```

#### 日志存储
**位置**: `.agent/workflows/logs/`

**保留策略**: 
- 成功日志: 保留7天
- 失败日志: 保留30天
- 错误日志: 永久保留

### 性能监控

#### 构建性能
```javascript
// scripts/monitor-build.js
const startTime = Date.now();

// 执行构建
await exec('npm run build');

const duration = Date.now() - startTime;

// 记录指标
console.log(`Build duration: ${duration}ms`);

// 如果超过阈值，记录警告
if (duration > 180000) { // 3分钟
  console.warn(`Build duration exceeds threshold: ${duration}ms`);
}
```

#### 内容生成性能
```javascript
// scripts/monitor-content-generation.js
const metrics = {
  total: 0,
  succeeded: 0,
  failed: 0,
  totalDuration: 0
};

// 记录每次生成
function recordGeneration(success, duration) {
  metrics.total++;
  if (success) {
    metrics.succeeded++;
  } else {
    metrics.failed++;
  }
  metrics.totalDuration += duration;
  
  // 计算成功率
  const successRate = (metrics.succeeded / metrics.total) * 100;
  
  // 如果成功率低于阈值，告警
  if (successRate < 95) {
    console.error(`Content generation success rate below threshold: ${successRate}%`);
  }
}
```

## 告警通知配置

### GitHub Issues
**用途**: 主要告警渠道

**配置**: 自动创建工作流

**标签**:
- `monitoring`: 监控相关
- `alert`: 告警
- `p0`: 紧急
- `p1`: 重要
- `p2`: 警告

### 邮件通知（可选）
**用途**: 紧急告警

**配置**: 需要配置SMTP服务器

**触发条件**: P0级别告警

### 日志文件
**用途**: 所有告警记录

**位置**: `.agent/workflows/logs/alerts.log`

**格式**:
```
[2025-01-01 12:00:00] [P0] [ALERT] Build failed 3 times in a row
[2025-01-01 12:00:05] [P1] [WARNING] Content generation success rate: 88%
```

## 监控仪表板（可选）

### 指标展示
- 内容生成成功率趋势
- 构建耗时趋势
- 工作流执行状态
- 数据质量指标

### 工具推荐
- **GitHub Actions**: 内置工作流监控
- **Vercel Analytics**: 网站性能监控
- **自定义Dashboard**: 使用Grafana等工具

## 变更日志

### v1.0.0 (2025-01-01)
- 初始监控和告警配置
- 定义监控指标和告警规则
- 配置监控工具和通知机制


