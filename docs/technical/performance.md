# 性能规范

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01

## 性能指标

### 核心指标
| 指标 | 目标值 | 测量工具 | 优先级 |
|------|--------|---------|--------|
| 首屏加载 | < 2s | Lighthouse | 高 |
| 交互响应 | < 100ms | Chrome DevTools | 高 |
| Lighthouse总分 | > 90 | Lighthouse | 中 |
| 可访问性 | > 95 | Lighthouse | 中 |

## 性能预算

### 资源大小限制
| 资源类型 | 限制 | 说明 |
|---------|------|------|
| HTML | < 50KB (gzip) | 单页 HTML 大小 |
| CSS | < 20KB (gzip) | 所有 CSS 文件总和 |
| JS | < 30KB (gzip) | 所有 JS 文件总和 |
| 图片 | < 200KB/张 | 单张图片大小 |
| 字体 | < 50KB/字体 | 单个字体文件大小 |

### 加载时间限制
| 指标 | 限制 | 说明 |
|------|------|------|
| 首屏加载 (FCP) | < 2s | First Contentful Paint |
| 交互响应 (TTI) | < 3.5s | Time to Interactive |
| 页面切换 | < 500ms | 路由切换时间 |
| 资源加载 | < 1s | 关键资源加载时间 |

### 性能预算检查
```bash
# 使用 bundlephobia 检查包大小
npx bundlephobia <package-name>

# 使用 webpack-bundle-analyzer 分析打包结果
npm run build:analyze
```

### 资源限制
- **图片**: 懒加载，WebP格式
- **字体**: 子集化，woff2格式
- **JS**: 零JS默认（Astro）
- **CSS**: 内联关键CSS

## 优化策略

### 代码优化
- [ ] 代码分割（按路由）
- [ ] Tree-shaking（移除未使用代码）
- [ ] 压缩CSS/JS
- [ ] 压缩HTML

### 资源优化
- [ ] 图片懒加载
- [ ] 图片格式优化（WebP）
- [ ] 字体子集化
- [ ] CDN配置

### 缓存策略
- [ ] 静态资源长期缓存
- [ ] HTML短期缓存
- [ ] API响应缓存

## 性能检查清单

### 开发阶段
- [ ] 本地构建测试通过
- [ ] Lighthouse分数 > 90
- [ ] 首屏加载 < 2s
- [ ] 无控制台错误

### 部署前
- [ ] 生产构建测试
- [ ] 性能测试通过
- [ ] 资源大小检查
- [ ] 缓存配置检查

## 性能监控自动化

### Lighthouse CI 配置

在 `.github/workflows/lighthouse.yml` 中配置：

```yaml
name: Lighthouse CI

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run preview &
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:4321/
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Web Vitals 监控

使用 Vercel Analytics 监控真实用户性能：

```astro
<!-- src/layouts/Layout.astro -->
<script>
  import { inject } from '@vercel/analytics';
  inject();
</script>
```

### 性能告警

#### 告警阈值
- **Lighthouse 分数 < 85**: 发送邮件通知
- **首屏加载 > 3s**: 发送 Slack 通知
- **Core Web Vitals 异常**: 立即通知

#### 告警配置
```javascript
// scripts/performance-alert.js
const thresholds = {
  lighthouse: 85,
  fcp: 3000,
  lcp: 4000,
  fid: 100,
  cls: 0.1,
};

function checkPerformance(metrics) {
  if (metrics.lighthouse < thresholds.lighthouse) {
    sendAlert('Lighthouse score below threshold');
  }
  // ... 其他检查
}
```

## 性能回归检测

### 检测方法
1. **对比测试**: 对比当前版本与上一版本的 Lighthouse 分数
2. **趋势分析**: 监控关键指标的变化趋势
3. **预算告警**: 如果超过性能预算，自动告警

### 处理流程
1. **检测**: 检测到性能回归
2. **分析**: 分析性能下降的原因
3. **优化**: 优化代码和资源
4. **验证**: 验证性能改进
5. **更新**: 更新性能预算（如需要）

### 回归检测脚本
```bash
# scripts/check-performance-regression.sh
#!/bin/bash
PREVIOUS_SCORE=$(cat .lighthouse-baseline.json | jq '.score')
CURRENT_SCORE=$(npm run lighthouse:ci | jq '.score')

if [ "$CURRENT_SCORE" -lt "$PREVIOUS_SCORE" ]; then
  echo "Performance regression detected!"
  exit 1
fi
```

## 监控

### 工具
- **Lighthouse**: 本地性能测试
- **Lighthouse CI**: 自动化性能测试
- **Vercel Analytics**: 生产环境监控（Web Vitals）
- **Chrome DevTools**: 开发调试

### 频率
- **开发时**: 每次构建检查
- **PR 合并前**: 自动运行 Lighthouse CI
- **部署后**: 每周检查
- **重大更新**: 立即检查

### 监控仪表板
- **Vercel Analytics Dashboard**: 查看真实用户性能数据
- **Lighthouse CI Dashboard**: 查看历史性能趋势

## 变更日志

### v1.0.0 (2025-01-01)
- 初始性能规范
- 基于最佳实践

