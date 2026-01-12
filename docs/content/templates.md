# 内容模板

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01

## Frontmatter标准模板

### 基础模板
```yaml
---
title: "文章标题"
date: 2025-01-01
tags: ["标签1", "标签2"]
description: "SEO描述（120字以内）"
---
```

### Frontmatter 严格校验 (AI 必读)

**必填字段** (AI 生成时不能缺失):
- `title`: string, 长度 5-100 字符
- `date`: string, 格式 YYYY-MM-DD，必须为有效日期

**可选字段** (AI 生成时建议包含):
- `tags`: string[], 数组长度 1-5，每个标签长度 2-20 字符
- `description`: string, 长度 50-120 字符，用于 SEO
- `sync`: boolean, 默认由 AI 根据内容质量决定
- `website_slug`: string, 格式: 小写字母+连字符，如 "intel-18a-analysis"

**AI 生成 Description 的量化规则** (替代"吸引人"等模糊描述):
- 必须包含: [核心技术术语] + [具体量化指标/数据] + [行动召唤/价值点]
- 示例: "深度解析Intel 18A背面供电技术，能效提升30%，了解芯片制程最新突破"
- 禁止: 纯营销语言、无具体信息、超过120字符

### 官网控制字段
```yaml
---
# 基础字段
title: "文章标题"
date: 2025-01-01
tags: ["标签1", "标签2"]
description: "SEO描述"

# 官网控制（可选）
sync: true              # 强制上架
sync: false             # 强制下架
website_slug: "custom-url"  # 自定义URL
---
```

## 技术原理文章模板

### Frontmatter
```yaml
---
title: "PowerVia技术原理详解"
date: 2025-01-01
category: "chip-process"
difficulty: "中级"
readTime: "10分钟"
tags: ["芯片制程", "PowerVia", "Intel"]
description: "深度解析Intel 18A背面供电技术..."
---
```

### 内容结构
```markdown
## 概述
[技术简介，100-200字]

## 原理详解
[详细技术原理，1000-1500字]

## 实际应用
[应用案例，500-800字]

## 相关技术
[相关技术链接]
```

## 产品数据模板

### JSON格式
```json
{
  "id": "a18-pro",
  "name": "Apple A18 Pro",
  "process": "TSMC N3E",
  "type": "mobile",
  "data_points": [
    {
      "watts": 3.5,
      "score": 2100,
      "scenario": "Daily"
    }
  ],
  "last_updated": "2025-01-01"
}
```

### 严格数据校验 (AI 必读)

**⚠️ AI 生成 JSON 数据时必须遵循以下 TypeScript Schema:**

```typescript
interface ChipData {
  id: string;          // 格式: [品牌]-[代号]，如 "a18-pro", "snapdragon-8-elite"
                       // 规则: 小写字母+连字符，唯一标识符
  name: string;        // 显示名称，如 "Apple A18 Pro"
  process: string;     // 制程工艺，如 "TSMC N3E", "Samsung 4nm"
  type: "mobile" | "desktop" | "gpu";  // 枚举值，必须为三者之一
  data_points: Array<{
    watts: number;     // 功耗（瓦特），必须为正数，范围: 0.1 - 500
    score: number;     // 性能分数，必须为正整数，范围: 1 - 10000
    scenario: string; // 测试场景，如 "Daily", "Gaming", "Benchmark"
  }>;                 // 数组不能为空，至少包含1个数据点
  last_updated: string; // 格式: YYYY-MM-DD，必须为有效日期
}
```

**数据验证规则**:
1. `id` 必须唯一，不能与现有数据重复
2. `data_points` 数组长度 ≥ 1
3. `watts` 和 `score` 必须为正数
4. `type` 必须是枚举值之一
5. `last_updated` 必须是有效的日期格式

**错误示例** (AI 禁止生成):
```json
// ❌ 错误: id 格式不正确
{ "id": "A18 Pro" }  // 应改为 "a18-pro"

// ❌ 错误: data_points 为空
{ "data_points": [] }  // 必须至少包含1个数据点

// ❌ 错误: type 不在枚举中
{ "type": "tablet" }  // 必须为 "mobile" | "desktop" | "gpu"

// ❌ 错误: 数值为负数
{ "watts": -3.5 }  // 必须为正数
```

## 新闻文章模板

### Frontmatter
```yaml
---
title: "Intel发布18A制程技术"
date: 2025-01-01
category: "industry-news"
tags: ["Intel", "芯片制程", "行业新闻"]
description: "Intel宣布18A制程技术突破..."
---
```

### 内容结构
```markdown
## 速报
[新闻要点，200-300字]

## 深度解读
[详细分析，500-800字]

## 影响分析
[行业影响，300-500字]
```

## 术语条目模板

### Frontmatter
```yaml
---
term: "TDP"
category: "efficiency-metrics"
related_terms: ["TGP", "SDP"]
---
```

### 内容结构
```markdown
## 定义
[术语定义，50-100字]

## 原理
[技术原理，100-200字]

## 应用
[实际应用场景，50-100字]
```

## 模板维护

### 模板修改流程
- 模板变更需要通知所有内容创作者
- 模板变更需要更新此文档
- 模板变更需要更新版本号
- 如果涉及结构变更，需要同步更新 `outline-design-guide.md`

## 使用指南

### 模板选择
- 技术原理 → 使用技术原理模板
- 产品数据 → 使用JSON格式
- 新闻 → 使用新闻模板
- 术语 → 使用术语模板

### 内容创建流程
1. **选择模板**: 根据内容类型选择对应模板
2. **设计大纲** (推荐): 参考 [大纲设计指南](./outline-design-guide.md) 设计详细大纲
3. **生成内容**: 基于模板或大纲生成内容
4. **质量检查**: 验证 Frontmatter 和内容结构

### 相关文档
- [大纲设计指南](./outline-design-guide.md) - 详细大纲设计方法
- [内容创建工作流](./CONTENT_CREATION_WORKFLOW.md) - 完整的内容创建流程

## 变更日志

### v1.0.2 (2025-01-01)
- 移除大纲设计详细说明（移至 outline-design-guide.md）
- 添加使用指南和相关文档链接
- 明确文档职责：专注于模板定义

### v1.0.1 (2025-01-01)
- 添加大纲设计说明
- 推荐在生成内容前先设计大纲

### v1.0.0 (2025-01-01)
- 初始内容模板
- 基于内容类型定义

