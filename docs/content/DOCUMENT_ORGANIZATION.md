# 内容文档组织说明

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **目的**: 说明内容相关文档的职责划分和组织结构

## 文档职责划分

### 核心文档

| 文档 | 职责 | 使用场景 |
|------|------|---------|
| **CONTENT_CREATION_WORKFLOW.md** | 工作流整合 | 需要了解完整流程时 |
| **templates.md** | 模板定义 | 需要查看模板、Schema、Frontmatter时 |
| **outline-design-guide.md** | 大纲设计 | 需要设计详细大纲时 |

### 职责说明

#### 1. CONTENT_CREATION_WORKFLOW.md (工作流整合)
- **职责**: 整合模板和大纲设计，提供统一的工作流
- **内容**: 
  - 文档关系说明
  - 完整工作流程图
  - 快速参考指南
- **使用**: 首次创建内容时阅读，了解整体流程

#### 2. templates.md (模板定义)
- **职责**: 定义所有内容类型的模板和Schema
- **内容**:
  - Frontmatter标准模板
  - 各种内容类型的结构模板（技术原理、新闻、术语、产品数据）
  - 数据Schema和验证规则
- **使用**: 
  - 需要查看模板时
  - 需要了解Frontmatter字段时
  - 需要了解数据Schema时

#### 3. outline-design-guide.md (大纲设计)
- **职责**: 提供大纲设计方法和详细模板
- **内容**:
  - 大纲设计流程
  - 详细大纲模板（基于templates.md的基础模板扩展）
  - 大纲存储和管理
- **使用**:
  - 需要设计详细大纲时
  - 需要提高内容质量时
  - 需要批量生成内容时

## 文档关系

### 层次结构

```
CONTENT_CREATION_WORKFLOW.md (总入口)
    ├── templates.md (模板定义)
    │   └── 提供基础模板和Schema
    └── outline-design-guide.md (大纲设计)
        └── 基于templates.md扩展为详细大纲
```

### 依赖关系

- `outline-design-guide.md` **依赖** `templates.md` (引用基础模板)
- `CONTENT_CREATION_WORKFLOW.md` **整合** 两个文档 (提供统一流程)

## 使用建议

### 新用户
1. 先阅读 `CONTENT_CREATION_WORKFLOW.md` 了解整体流程
2. 根据需求选择：
   - 快速生成 → 直接使用 `templates.md`
   - 高质量生成 → 使用 `outline-design-guide.md` 设计大纲

### AI Agent
1. 读取 `CONTENT_CREATION_WORKFLOW.md` 了解工作流
2. 根据内容重要性选择：
   - 重要内容 → 使用 `outline-design-guide.md` 设计大纲
   - 快速内容 → 直接使用 `templates.md` 生成

## 文档优化历史

### 优化前的问题
- ❌ `templates.md` 和 `outline-design-guide.md` 有重复内容
- ❌ 职责不清晰，不知道何时使用哪个文档
- ❌ 缺少统一的工作流入口

### 优化后的改进
- ✅ 明确职责划分：templates.md 专注模板，outline-design-guide.md 专注大纲
- ✅ 创建统一入口：CONTENT_CREATION_WORKFLOW.md 整合流程
- ✅ 清晰的文档关系：依赖关系明确

## 变更日志

### v1.0.0 (2025-01-01)
- 初始文档组织说明
- 明确文档职责划分
- 建立文档关系图

