# 组件规范

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **来源**: `src/components/`

## 组件清单

| 组件名 | 文件路径 | 状态 | 用途 | 最后更新 |
|--------|---------|------|------|---------|
| EfficiencyCalculator | `src/components/EfficiencyCalculator.astro` | ✅ 稳定 | 能效计算器基础版 | 2025-01-01 |
| EfficiencyCalculatorPro | `src/components/EfficiencyCalculatorPro.astro` | ✅ 稳定 | 能效计算器专业版 | 2025-01-01 |
| WeChatModal | `src/components/WeChatModal.astro` | ✅ 稳定 | 微信关注弹窗 | 2025-01-01 |

## 组件设计规范

### 通用规范
- **背景**: 使用 `--c-bg-card` 或 `--c-bg-panel`
- **边框**: 1px solid rgba(255,255,255,0.1)
- **圆角**: 4px
- **间距**: 使用 `--space-unit` (4px) 的倍数

### 卡片组件
- **悬停效果**: 边框高亮 + 轻微上移 (translateY(-5px))
- **阴影**: 0 10px 30px rgba(0,0,0,0.5)
- **左侧高亮条**: 4px solid `--c-accent-cyan` (悬停时显示)

### 按钮组件
- **主按钮**: 背景 `--c-accent-cyan`，文字黑色
- **次按钮**: 边框 1px solid rgba(255,255,255,0.2)
- **悬停**: 阴影效果 0 0 20px rgba(0,240,255,0.4)
- **焦点**: 2px solid `--c-accent-cyan` outline
- **激活**: 背景变暗10% (translateY(1px))
- **禁用**: 透明度50%，`cursor: not-allowed`，`aria-disabled="true"`

## 组件开发流程

### 新增组件
1. 在 `src/components/` 创建组件文件
2. 遵循设计系统规范
3. 在此文档中注册
4. 更新版本号

### 组件修改
1. 评估对现有使用的影响
2. 更新组件文档
3. 更新版本号
4. 记录变更日志

## 使用指南

### 导入组件
```astro
import ComponentName from '../components/ComponentName.astro';
```

### 组件使用
- 查看组件文件了解Props
- 遵循组件设计规范
- 保持样式一致性

## 变更日志

### v1.0.0 (2025-01-01)
- 初始组件清单
- 基于现有组件

