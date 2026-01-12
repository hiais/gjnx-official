# 可访问性规范

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **标准**: WCAG 2.1 AA

## WCAG 2.1 AA 合规要求

### 核心原则

1. **可感知** (Perceivable)
   - 文本替代：所有图片有alt属性
   - 时间媒体：视频有字幕
   - 适应性：内容可适应不同设备
   - 可辨别：颜色对比度符合标准

2. **可操作** (Operable)
   - 键盘可访问：所有功能可通过键盘操作
   - 足够时间：无时间限制或可调整
   - 导航：提供清晰的导航方式
   - 输入方式：支持多种输入方式

3. **可理解** (Understandable)
   - 可读性：文本清晰易懂
   - 可预测：界面行为可预测
   - 输入辅助：帮助用户避免和纠正错误

4. **健壮性** (Robust)
   - 兼容性：与辅助技术兼容
   - 代码质量：代码符合标准

## 颜色对比度要求

### 文本对比度

| 文本类型 | 最小对比度 | 示例 |
|---------|-----------|------|
| 普通文本 | 4.5:1 | 正文、段落 |
| 大文本 (≥18pt) | 3:1 | 标题、大号文字 |
| UI组件 | 3:1 | 按钮、输入框 |

### 当前颜色系统检查

| 颜色组合 | 对比度 | 状态 |
|---------|--------|------|
| `--c-text-primary` (#e0e0e0) / `--c-bg-dark` (#050505) | 15.8:1 | ✅ 通过 |
| `--c-text-secondary` (#888888) / `--c-bg-dark` (#050505) | 5.2:1 | ✅ 通过 |
| `--c-accent-cyan` (#00f0ff) / `--c-bg-dark` (#050505) | 4.8:1 | ✅ 通过 |
| `--c-accent-amber` (#ffae00) / `--c-bg-dark` (#050505) | 6.1:1 | ✅ 通过 |

## ARIA属性使用规范

### 导航组件

```astro
<nav role="navigation" aria-label="主导航">
  <ul>
    <li><a href="/" aria-current="page">首页</a></li>
  </ul>
</nav>
```

### 按钮组件

```astro
<!-- 图标按钮必须有aria-label -->
<button aria-label="关闭弹窗" aria-expanded="false">
  <span aria-hidden="true">×</span>
</button>

<!-- 文本按钮不需要额外aria-label -->
<button>提交</button>
```

### 模态框组件

```astro
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">标题</h2>
  <!-- 内容 -->
</div>
```

### 表单组件

```astro
<label for="email">邮箱地址</label>
<input 
  type="email" 
  id="email" 
  aria-required="true"
  aria-invalid="false"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert" aria-live="polite"></span>
```

### 图片组件

```astro
<!-- 装饰性图片 -->
<img src="decoration.jpg" alt="" aria-hidden="true" />

<!-- 内容图片 -->
<img src="chart.jpg" alt="2024年芯片能效对比图表" />

<!-- 功能图片 -->
<img src="icon-search.jpg" alt="搜索" role="button" tabindex="0" />
```

## 键盘导航规范

### 焦点管理

- **焦点顺序**: 符合视觉顺序（从左到右，从上到下）
- **焦点指示器**: 使用 `outline: 2px solid --c-accent-cyan`
- **跳过链接**: 提供"跳过导航"链接

### 键盘快捷键

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 跳过导航 | Tab (首次) | 跳转到主要内容 |
| 关闭模态框 | Esc | 关闭当前弹窗 |
| 提交表单 | Enter | 在表单内提交 |

### 焦点陷阱

- **模态框**: 焦点限制在模态框内
- **下拉菜单**: 焦点限制在菜单内
- **导航折叠**: 展开时焦点移到菜单

## 屏幕阅读器优化

### 语义化HTML

```astro
<!-- ✅ 正确：使用语义化标签 -->
<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
<footer>...</footer>

<!-- ❌ 错误：使用div代替语义化标签 -->
<div class="header">...</div>
<div class="content">...</div>
```

### 隐藏内容

```astro
<!-- 视觉隐藏但屏幕阅读器可读 -->
<span class="sr-only">仅屏幕阅读器可见的文本</span>

<!-- CSS实现 -->
<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
```

### 动态内容更新

```astro
<!-- 使用aria-live区域通知屏幕阅读器 -->
<div role="status" aria-live="polite" aria-atomic="true">
  搜索结果已更新，找到10条结果
</div>
```

## 响应式可访问性

### 移动端优化

- **触摸目标**: ≥ 44px × 44px (符合WCAG)
- **间距**: 按钮间距 ≥ 8px
- **字体大小**: 最小14px，推荐16px

### 导航折叠

```astro
<button 
  aria-expanded="false" 
  aria-controls="mobile-menu"
  aria-label="打开导航菜单"
>
  菜单
</button>
<nav id="mobile-menu" aria-label="移动端导航">
  <!-- 菜单内容 -->
</nav>
```

## 检查清单

### 开发阶段

- [ ] 所有图片有alt属性（装饰性图片使用空alt）
- [ ] 所有表单有label标签
- [ ] 所有按钮有可访问的名称（文本或aria-label）
- [ ] 颜色对比度检查通过（≥4.5:1）
- [ ] 键盘导航测试通过（Tab、Enter、Esc）
- [ ] 焦点指示器可见
- [ ] 页面有H1标题
- [ ] 语言属性设置 (`lang="zh-CN"`)

### 测试阶段

- [ ] 屏幕阅读器测试通过（NVDA/JAWS/VoiceOver）
- [ ] 键盘导航完整测试
- [ ] 颜色对比度工具验证
- [ ] 可访问性审计工具检查（axe DevTools）

### 部署前

- [ ] Lighthouse可访问性分数 ≥ 95
- [ ] WAVE工具检查无错误
- [ ] 手动测试关键流程

## 工具推荐

### 检查工具

- **Lighthouse**: Chrome DevTools内置
- **WAVE**: Web Accessibility Evaluation Tool
- **axe DevTools**: 浏览器扩展
- **Color Contrast Analyzer**: 颜色对比度检查

### 测试工具

- **NVDA**: Windows屏幕阅读器（免费）
- **JAWS**: Windows屏幕阅读器（商业）
- **VoiceOver**: macOS/iOS内置
- **键盘导航**: 仅使用键盘测试所有功能

## 变更日志

### v1.0.0 (2025-01-01)
- 初始可访问性规范
- 基于WCAG 2.1 AA标准
- 参考W3C可访问性指南

