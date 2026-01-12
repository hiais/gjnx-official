# 代码规范

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01

## 代码风格

### 文件命名
- **组件**: PascalCase (`EfficiencyCalculator.astro`)
- **页面**: kebab-case (`index.astro`, `[...slug].astro`)
- **工具函数**: camelCase (`formatDate.js`)

### 代码格式
- **缩进**: 2个空格
- **行尾**: LF (Unix)
- **引号**: 单引号优先
- **分号**: 不使用分号（Astro/JS）

## TypeScript规范

### 类型定义
```typescript
// Props接口
interface Props {
  title: string;
  description?: string;
}

// 组件使用
const { title, description = "默认值" } = Astro.props;
```

### 类型检查
- 所有Props必须定义类型
- 函数参数必须定义类型
- 返回值类型可选但推荐

## 组件规范

### 组件结构
```astro
---
// 1. Imports
import Layout from '../layouts/Layout.astro';

// 2. Props定义
interface Props {
  title: string;
}

// 3. 逻辑处理
const { title } = Astro.props;
---

<!-- 4. HTML模板 -->
<Layout title={title}>
  <main>...</main>
</Layout>

<!-- 5. 样式 -->
<style>
  /* 组件样式 */
</style>

<!-- 6. 脚本（如需要） -->
<script>
  // 客户端脚本
</script>
```

### 组件命名
- 组件名与文件名一致
- 使用描述性名称
- 避免缩写

## CSS规范

### 类名规范
- 使用kebab-case: `.article-card`
- 语义化命名: `.knowledge-card` 而非 `.card-1`
- BEM风格（可选）: `.card__header`, `.card--featured`

### 样式组织
- 组件样式放在组件内 `<style>`
- 全局样式放在 `global.css`
- 使用CSS变量而非硬编码颜色

## AI 协同开发守卫

### 逻辑保持原则
- **DRY原则**: AI 在新增功能前必须检查 `src/components/` 是否已有类似实现，避免重复代码
- **注释要求**: AI 生成的复杂逻辑必须包含中文注释，解释"为什么这么做"而非"做了什么"
- **禁止 Hallucination**: 如果 AI 不确定某个数据来源或技术细节，必须在输出中明确标记 `[NEED_VERIFICATION]` 或 `[NEED_HUMAN_REVIEW]`
- **代码复用**: 优先使用现有组件，只有在现有组件无法满足需求时才创建新组件

### 类型安全
- 所有 Astro 组件的 `Props` 必须定义 `interface`
- 严禁使用 `any` 类型（除非明确要求）
- 函数参数必须定义类型
- 返回值类型推荐定义（提高代码可读性）

### AI 代码生成规则
- **组件创建**: 创建新组件前，必须检查 `docs/design-system/components.md` 了解现有组件
- **样式使用**: 必须使用 `src/styles/global.css` 中的 CSS 变量，严禁硬编码颜色值
- **路径引用**: 使用相对路径引用，确保在不同环境下都能正常工作
- **错误处理**: 所有可能失败的操作（如 API 调用、文件读取）必须有错误处理

### 禁止行为 (Forbidden)
- ❌ 禁止创建未使用的组件或页面
- ❌ 禁止修改已有组件的核心 Props（除非明确要求）
- ❌ 禁止在组件中硬编码业务逻辑（应通过 Props 传递）
- ❌ 禁止使用 `console.log` 提交到生产代码（使用 `console.error` 或移除）
- ❌ 禁止在未运行 `npm run build` 测试的情况下提交代码

## 检查清单

### 代码提交前
- [ ] 代码格式正确
- [ ] 类型定义完整
- [ ] 无控制台错误
- [ ] 无未使用的导入
- [ ] 组件命名规范
- [ ] 已运行 `npm run build` 测试通过
- [ ] 所有图片有 `alt` 属性
- [ ] 所有链接有效（无 404）

### AI 生成代码后
- [ ] 检查是否有重复代码（可复用现有组件）
- [ ] 确认所有硬编码值已替换为变量或配置
- [ ] 验证类型定义完整（无 `any` 类型）
- [ ] 确认错误处理已添加
- [ ] 检查是否有 `[NEED_VERIFICATION]` 标记需要人工审核

## 变更日志

### v1.0.1 (2025-01-01)
- 新增 AI 协同开发守卫规则
- 强化类型安全要求
- 添加禁止行为清单

### v1.0.0 (2025-01-01)
- 初始代码规范
- 基于Astro最佳实践

