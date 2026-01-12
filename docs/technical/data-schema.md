# 数据架构与 Schema 定义

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **目标**: 为 AI Agent 提供严格的数据结构定义，确保数据生成的一致性

## 核心数据结构

### 产品数据 (ChipData)

**文件位置**: `src/data/chips.json`

**TypeScript Interface**:
```typescript
interface ChipData {
  id: string;                    // 唯一标识符
  name: string;                  // 显示名称
  process: string;               // 制程工艺
  type: ChipType;               // 产品类型
  data_points: DataPoint[];      // 性能数据点
  last_updated: string;          // 最后更新日期
}

type ChipType = "mobile" | "desktop" | "gpu";

interface DataPoint {
  watts: number;                 // 功耗（瓦特）
  score: number;                 // 性能分数
  scenario: string;              // 测试场景
}
```

**验证规则**:
- `id`: 格式 `[品牌]-[代号]`，小写字母+连字符，唯一
- `name`: 长度 5-100 字符
- `process`: 常见值见下方枚举
- `type`: 必须是 `"mobile" | "desktop" | "gpu"` 之一
- `data_points`: 数组长度 ≥ 1，每个元素必须包含 `watts`, `score`, `scenario`
- `watts`: 范围 0.1 - 500，必须为正数
- `score`: 范围 1 - 10000，必须为正整数
- `last_updated`: 格式 `YYYY-MM-DD`，必须为有效日期

**制程工艺枚举** (常见值):
```typescript
type ProcessType = 
  | "TSMC N3E"
  | "TSMC N3B"
  | "TSMC N5"
  | "TSMC N7"
  | "Samsung 4nm"
  | "Samsung 5nm"
  | "Intel 18A"
  | "Intel 20A"
  | string;  // 允许其他值，但建议使用标准值
```

**测试场景枚举** (常见值):
```typescript
type ScenarioType = 
  | "Daily"        // 日常使用
  | "Gaming"       // 游戏场景
  | "Benchmark"    // 基准测试
  | "Idle"         // 待机
  | "Peak"         // 峰值性能
  | string;        // 允许其他值
```

### 文章 Frontmatter

**文件位置**: `src/content/articles/*.md`

**TypeScript Interface**:
```typescript
interface ArticleFrontmatter {
  title: string;                 // 必填
  date: string;                  // 必填，格式 YYYY-MM-DD
  tags?: string[];               // 可选，长度 1-5
  description?: string;          // 可选，SEO描述，长度 50-120
  sync?: boolean;                // 可选，同步开关
  website_slug?: string;         // 可选，自定义URL
  category?: string;             // 可选，分类
  difficulty?: string;           // 可选，难度等级
  readTime?: string;             // 可选，阅读时间
}
```

**验证规则**:
- `title`: 长度 5-100 字符，必填
- `date`: 格式 `YYYY-MM-DD`，必填，必须为有效日期
- `tags`: 数组长度 1-5，每个标签长度 2-20 字符
- `description`: 长度 50-120 字符，用于 SEO
- `website_slug`: 格式小写字母+连字符，如 "intel-18a-analysis"

### 术语数据 (GlossaryEntry)

**文件位置**: `src/content/glossary/*.md`

**TypeScript Interface**:
```typescript
interface GlossaryEntry {
  term: string;                  // 术语名称
  category: string;              // 分类
  related_terms?: string[];      // 相关术语
}
```

**验证规则**:
- `term`: 长度 1-50 字符，必填
- `category`: 常见值见下方枚举
- `related_terms`: 数组，每个术语必须存在于术语库中

**分类枚举**:
```typescript
type GlossaryCategory = 
  | "efficiency-metrics"    // 能效指标
  | "chip-process"          // 芯片制程
  | "architecture"          // 架构设计
  | "manufacturing"         // 制造工艺
  | string;                 // 允许其他值
```

## JSON Schema 验证

### 产品数据 JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id", "name", "process", "type", "data_points", "last_updated"],
    "properties": {
      "id": {
        "type": "string",
        "pattern": "^[a-z0-9-]+$",
        "minLength": 3,
        "maxLength": 50
      },
      "name": {
        "type": "string",
        "minLength": 5,
        "maxLength": 100
      },
      "process": {
        "type": "string"
      },
      "type": {
        "type": "string",
        "enum": ["mobile", "desktop", "gpu"]
      },
      "data_points": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": ["watts", "score", "scenario"],
          "properties": {
            "watts": {
              "type": "number",
              "minimum": 0.1,
              "maximum": 500
            },
            "score": {
              "type": "number",
              "minimum": 1,
              "maximum": 10000
            },
            "scenario": {
              "type": "string"
            }
          }
        }
      },
      "last_updated": {
        "type": "string",
        "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
      }
    }
  }
}
```

## AI 数据生成检查清单

### 生成产品数据前
- [ ] 确认 `id` 格式正确（小写字母+连字符）
- [ ] 确认 `id` 不与现有数据重复
- [ ] 确认 `type` 是枚举值之一
- [ ] 确认 `data_points` 数组不为空
- [ ] 确认所有数值为正数且在合理范围内
- [ ] 确认 `last_updated` 日期格式正确

### 生成文章 Frontmatter 前
- [ ] 确认 `title` 长度在 5-100 字符
- [ ] 确认 `date` 格式为 YYYY-MM-DD
- [ ] 确认 `tags` 数组长度 ≤ 5
- [ ] 确认 `description` 长度在 50-120 字符（如果提供）
- [ ] 确认 `website_slug` 格式正确（如果提供）

### 生成术语数据前
- [ ] 确认 `term` 长度在 1-50 字符
- [ ] 确认 `category` 是有效分类
- [ ] 确认 `related_terms` 中的术语存在（如果提供）

## 数据验证工具

### 推荐工具
- **JSON Schema Validator**: 使用 JSON Schema 验证 JSON 数据
- **TypeScript Compiler**: 使用 TypeScript 接口验证类型
- **自定义验证脚本**: 在 `scripts/` 目录下创建验证脚本

### 验证脚本示例

```javascript
// scripts/validate-chips.js
const chips = require('../src/data/chips.json');

function validateChipData(chip) {
  const errors = [];
  
  if (!/^[a-z0-9-]+$/.test(chip.id)) {
    errors.push(`Invalid id format: ${chip.id}`);
  }
  
  if (!['mobile', 'desktop', 'gpu'].includes(chip.type)) {
    errors.push(`Invalid type: ${chip.type}`);
  }
  
  if (chip.data_points.length === 0) {
    errors.push('data_points array is empty');
  }
  
  chip.data_points.forEach((point, index) => {
    if (point.watts <= 0) {
      errors.push(`data_points[${index}].watts must be positive`);
    }
    if (point.score <= 0) {
      errors.push(`data_points[${index}].score must be positive`);
    }
  });
  
  return errors;
}

// 验证所有数据
chips.forEach((chip, index) => {
  const errors = validateChipData(chip);
  if (errors.length > 0) {
    console.error(`Chip ${index} (${chip.id}) has errors:`, errors);
    process.exit(1);
  }
});

console.log('All chip data is valid!');
```

## 变更日志

### v1.0.0 (2025-01-01)
- 初始数据架构定义
- 定义核心数据结构的 TypeScript Interface
- 提供 JSON Schema 验证规则
- 建立 AI 数据生成检查清单

