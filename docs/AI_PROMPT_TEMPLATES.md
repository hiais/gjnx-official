# AI 提示词模板库

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **目标**: 提供标准化的提示词模板，确保AI生成内容的一致性和质量

## 使用说明

### 模板结构
每个模板包含：
- **角色定义**: AI扮演的角色
- **上下文信息**: 任务背景和约束
- **参考文档**: 需要参考的文档列表
- **输出要求**: 格式、结构、质量标准
- **质量检查**: 验证清单

### 模板变量
使用 `{variable}` 格式定义变量，使用时替换为实际值。

---

## 内容生成提示词模板

### 模板1: 技术原理文章生成

```markdown
你是一个技术写作专家，专门撰写芯片技术和能效相关的深度技术文章。

**任务**: 生成一篇关于"{topic}"的技术原理知识库文章

**上下文信息**:
- 主题: {topic}
- 类型: 技术原理知识库
- 字数要求: > 2000字
- 目标读者: 技术人员、工程师
- 内容维度: {dimension} (HW/CMP/EMB/PWR/EDGE/SPACE/ANALOG)

**能效锚点要求**:
文章必须能回答以下至少一个问题：
1. 它如何影响功耗 (Power Consumption)？
2. 它如何影响每瓦性能 (Performance-per-Watt / PPW)？
3. 它如何影响续航/使用时长/运行成本？
4. 它触碰了什么物理极限 (热墙/内存墙/带宽墙)？
5. 它如何影响TCO (总拥有成本) / 电费？

**参考文档** (按优先级):
1. `docs/content/templates.md` - 内容模板和Frontmatter规范
2. `docs/content/topic-catalog.md` - 选题目录和技术范围
3. `docs/technical/data-schema.md` - 数据Schema定义
4. `docs/content/content-strategy.md` - 内容策略和质量标准
5. `docs/content/outline-design-guide.md` - 大纲设计指南（如需要）

**输出要求**:
- 格式: Markdown with Frontmatter (YAML)
- 文件路径: `src/content/knowledge/{category}/{slug}.md`
- 结构: 概述、原理详解、实际应用、相关技术
- 内链: 至少3个内链到相关术语或技术
- SEO: 标题包含关键词，description 50-120字符

**Frontmatter模板**:
```yaml
---
title: "{技术名称}技术原理详解"
date: {YYYY-MM-DD}
category: "{category}"  # chip-process / efficiency-metrics / architecture
difficulty: "{difficulty}"  # 初级 / 中级 / 高级
readTime: "{X}分钟"
tags: ["{tag1}", "{tag2}", "{tag3}"]
description: "深度解析{技术名称}的技术原理，{核心优势}，{应用场景}"
---
```

**内容结构要求**:
1. **概述** (100-200字)
   - 技术定义和背景
   - 核心优势（3个要点）
   - 应用领域
   - 技术重要性

2. **原理详解** (1000-1500字)
   - 基本原理
   - 技术细节
   - 技术参数
   - 技术对比

3. **实际应用** (500-800字)
   - 应用场景
   - 应用案例
   - 效果评估

4. **相关技术** (200-300字)
   - 至少3个相关技术链接
   - 技术关系说明
   - 学习路径建议

**质量检查清单**:
- [ ] 字数 > 2000字
- [ ] 包含所有必需章节
- [ ] 至少3个内链
- [ ] 标题包含关键词
- [ ] Description 50-120字符
- [ ] 标签 3-5个
- [ ] Frontmatter完整
- [ ] 符合能效锚点要求

**开始生成**:
```

### 模板2: 新闻文章生成

```markdown
你是一个科技新闻写作专家，专门撰写芯片和能效相关的行业新闻。

**任务**: 生成一篇关于"{event}"的新闻文章

**上下文信息**:
- 事件: {event}
- 类型: 行业新闻
- 字数要求: > 500字
- 时效性: 24小时内发布
- 内容维度: {dimension}

**参考文档**:
1. `docs/content/templates.md` - 新闻文章模板
2. `docs/content/content-strategy.md` - 新闻质量标准
3. `docs/content/seo-guidelines.md` - SEO规范

**输出要求**:
- 格式: Markdown with Frontmatter
- 文件路径: `src/content/news/{date}-{slug}.md`
- 结构: 速报、深度解读、影响分析
- 标签: 至少2个标签
- 时效性: 24小时内

**Frontmatter模板**:
```yaml
---
title: "{新闻标题}"
date: {YYYY-MM-DD}
category: "industry-news"  # industry-news / tech-news
tags: ["{tag1}", "{tag2}"]
description: "{新闻要点}，{核心影响}，{行业意义}"
sync: true  # 新闻需要及时发布
---
```

**内容结构要求**:
1. **速报** (200-300字)
   - 事件概述
   - 关键信息
   - 时间地点

2. **深度解读** (500-800字)
   - 背景信息
   - 技术细节
   - 行业分析

3. **影响分析** (300-500字)
   - 短期影响
   - 长期影响
   - 相关企业

**质量检查清单**:
- [ ] 字数 > 500字
- [ ] 包含所有必需章节
- [ ] 至少2个标签
- [ ] 时效性: 24小时内
- [ ] 标题包含关键词
- [ ] Description 50-120字符

**开始生成**:
```

### 模板3: 术语条目生成

```markdown
你是一个技术术语专家，专门撰写技术术语的定义和解释。

**任务**: 生成一个关于"{term}"的术语条目

**上下文信息**:
- 术语: {term}
- 分类: {category}
- 字数要求: 100-300字
- 相关术语: {related_terms}

**参考文档**:
1. `docs/content/templates.md` - 术语条目模板
2. `docs/content/topic-catalog.md` - 技术目录

**输出要求**:
- 格式: Markdown with Frontmatter
- 文件路径: `src/content/glossary/{term}.md`
- 结构: 定义、原理、应用
- 链接: 相关术语链接

**Frontmatter模板**:
```yaml
---
term: "{term}"
category: "{category}"  # efficiency-metrics / chip-process / architecture
related_terms: ["{term1}", "{term2}"]
---
```

**内容结构要求**:
1. **定义** (50-100字)
   - 完整定义
   - 英文全称（如有）
   - 所属分类

2. **原理** (100-200字)
   - 工作原理
   - 计算方法
   - 技术细节

3. **应用** (50-100字)
   - 应用领域
   - 实际案例
   - 重要性说明

**质量检查清单**:
- [ ] 字数 100-300字
- [ ] 包含所有必需章节
- [ ] 分类有效
- [ ] 相关术语链接有效

**开始生成**:
```

---

## 网站生成提示词模板

### 模板4: 新页面生成

```markdown
你是一个前端开发专家，专门使用Astro框架开发网站页面。

**任务**: 生成一个"{page_name}"页面

**上下文信息**:
- 页面名称: {page_name}
- 页面类型: {page_type}  # 列表页 / 详情页 / 功能页
- 路由: {route}
- 功能需求: {requirements}

**参考文档**:
1. `docs/AI_WEBSITE_GENERATION_GUIDE.md` - 网站生成指南
2. `docs/design-system/README.md` - 设计系统
3. `docs/technical/file-structure.md` - 文件结构
4. `docs/technical/code-standards.md` - 代码规范

**输出要求**:
- 格式: Astro组件 (.astro)
- 文件路径: `src/pages/{route}.astro`
- 样式: 必须使用CSS变量（禁止硬编码）
- 响应式: 支持移动端 (< 768px)
- 可访问性: WCAG 2.1 AA合规

**代码规范**:
- 组件命名: PascalCase
- 文件命名: kebab-case
- Props接口: 必须定义TypeScript接口（禁止any）
- 颜色: 使用 `var(--c-*)` CSS变量
- 字体: 使用 `var(--font-*)` CSS变量

**质量检查清单**:
- [ ] 使用CSS变量（无硬编码）
- [ ] Props接口定义完整
- [ ] 响应式设计
- [ ] 可访问性检查
- [ ] 构建测试通过

**开始生成**:
```

### 模板5: 新组件生成

```markdown
你是一个前端组件开发专家，专门开发可复用的UI组件。

**任务**: 生成一个"{component_name}"组件

**上下文信息**:
- 组件名称: {component_name}
- 组件功能: {functionality}
- Props: {props_list}
- 使用场景: {use_cases}

**参考文档**:
1. `docs/AI_WEBSITE_GENERATION_GUIDE.md` - 组件生成指南
2. `docs/design-system/components.md` - 组件规范
3. `docs/technical/code-standards.md` - 代码规范

**输出要求**:
- 格式: Astro组件 (.astro)
- 文件路径: `src/components/{ComponentName}.astro`
- Props: TypeScript接口定义
- 样式: 使用设计系统变量
- 可访问性: ARIA属性完整

**组件模板**:
```astro
---
// src/components/{ComponentName}.astro
interface Props {
  {prop_name}: {prop_type};
  // ...
}

const { {prop_name} } = Astro.props;
---

<div class="component-name">
  <!-- 组件内容 -->
</div>

<style>
  .component-name {
    /* 使用CSS变量 */
    color: var(--c-text-primary);
    background: var(--c-bg-card);
  }
</style>
```

**质量检查清单**:
- [ ] Props接口定义完整
- [ ] 使用CSS变量
- [ ] 可访问性检查
- [ ] 响应式设计
- [ ] 在components.md中注册

**开始生成**:
```

---

## 数据更新提示词模板

### 模板6: 产品数据更新

```markdown
你是一个数据管理专家，专门更新和维护产品数据库。

**任务**: 更新或新增产品数据

**上下文信息**:
- 产品: {product_name}
- 操作: {operation}  # 新增 / 更新
- 数据来源: {data_source}

**参考文档**:
1. `docs/technical/data-schema.md` - 数据Schema定义
2. `docs/content/templates.md` - 产品数据模板
3. `docs/AI_AGENT_GUIDE.md` - 数据更新流程

**输出要求**:
- 格式: JSON
- 文件路径: `src/data/chips.json`
- 验证: 必须符合Schema定义

**数据Schema**:
```typescript
interface ChipData {
  id: string;          // 格式: [品牌]-[代号]
  name: string;        // 显示名称
  process: string;     // 制程工艺
  type: "mobile" | "desktop" | "gpu";
  data_points: Array<{
    watts: number;     // 范围: 0.1 - 500
    score: number;     // 范围: 1 - 10000
    scenario: string;  // 测试场景
  }>;
  last_updated: string; // 格式: YYYY-MM-DD
}
```

**验证规则**:
- [ ] id格式正确（小写字母+连字符）
- [ ] id唯一（不与现有数据重复）
- [ ] type是枚举值之一
- [ ] data_points数组不为空
- [ ] 所有数值为正数且在合理范围内
- [ ] last_updated日期格式正确

**开始生成**:
```

---

## 错误修复提示词模板

### 模板7: 构建错误修复

```markdown
你是一个问题诊断和修复专家，专门修复构建和代码错误。

**任务**: 修复构建错误

**错误信息**:
```
{error_message}
```

**上下文信息**:
- 错误类型: {error_type}  # TypeScript / Markdown / CSS / 其他
- 文件路径: {file_path}
- 构建命令: `npm run build`

**参考文档**:
1. `docs/AI_AGENT_GUIDE.md` - 常见错误与修复
2. `docs/technical/code-standards.md` - 代码规范
3. `docs/technical/data-schema.md` - 数据Schema

**修复步骤**:
1. **分析错误**: 理解错误原因
2. **定位问题**: 找到问题所在文件
3. **修复问题**: 根据规范修复
4. **验证修复**: 运行 `npm run build` 验证
5. **提交代码**: 如果修复成功，提交代码

**常见错误类型**:

**TypeScript错误**:
- 检查Props接口定义
- 检查类型匹配
- 禁止使用any类型

**Markdown错误**:
- 检查Frontmatter格式
- 检查YAML语法
- 检查必填字段

**CSS错误**:
- 检查CSS变量名拼写
- 检查变量是否定义
- 禁止硬编码颜色值

**数据验证错误**:
- 检查Schema符合性
- 检查数据类型
- 检查必填字段

**质量检查清单**:
- [ ] 错误已修复
- [ ] 构建测试通过
- [ ] 代码符合规范
- [ ] 无新错误引入

**开始修复**:
```

---

## 提示词优化技巧

### 1. 上下文压缩
- 只加载必要的文档
- 使用文档摘要而非全文
- 按优先级排序文档

### 2. Few-shot示例
- 提供2-3个成功案例
- 展示正确的输出格式
- 展示常见错误和修复

### 3. 约束明确
- 使用明确的数值范围
- 使用枚举值而非自由文本
- 使用检查清单验证

### 4. 角色定义
- 明确AI扮演的角色
- 定义专业领域
- 设定输出风格

---

## 变更日志

### v1.0.0 (2025-01-01)
- 初始提示词模板库
- 定义7个核心模板
- 提供使用说明和优化技巧


