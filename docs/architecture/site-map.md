# 站点地图

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **来源**: `DESIGN_SPEC.md`

## 站点结构

```mermaid
graph TD
    Home[/] --> Knowledge[/knowledge]
    Home --> Database[/database]
    Home --> News[/news]
    Home --> Glossary[/glossary]
    Home --> Articles[/articles]
    Home --> Tools[/tools]
    
    Knowledge --> KCategory[/knowledge/chip-process]
    Knowledge --> KDetail[/knowledge/powervia]
    
    Database --> DCategory[/database/chips]
    Database --> DDetail[/database/chips/a18-pro]
    Database --> DCompare[/database/compare]
    
    News --> NList[/news]
    News --> NDetail[/news/2025-01-01-xxx]
    
    Glossary --> GList[/glossary]
    Glossary --> GDetail[/glossary/tdp]
    
    Articles --> ADetail[/articles/xxx]
    Tools --> Calculator[/tools/calculator]
```

## URL结构规范

### 页面类型

| 类型 | URL格式 | 示例 | 说明 |
|------|---------|------|------|
| 首页 | `/` | `/` | 网站首页 |
| 知识库 | `/knowledge/[category]/[slug]` | `/knowledge/chip-process/powervia` | 技术原理知识库 |
| 产品库 | `/database/chips/[id]` | `/database/chips/a18-pro` | 产品详情页 |
| 新闻 | `/news/[date]-[slug]` | `/news/2025-01-01-xxx` | 新闻详情页 |
| 术语 | `/glossary/[term]` | `/glossary/tdp` | 术语详情页 |
| 文章 | `/articles/[slug]` | `/articles/intel-18a-analysis` | 深度文章 |
| 标签 | `/tags/[tag]` | `/tags/芯片制程` | 标签聚合页 |

### URL命名规则
- 使用小写字母和连字符
- 避免特殊字符
- 保持简洁（≤50字符）
- 使用有意义的slug

## 页面清单

### 核心页面
- `/` - 首页
- `/knowledge` - 知识库首页
- `/database` - 产品库首页
- `/news` - 新闻聚合页
- `/glossary` - 术语词典首页
- `/articles` - 文章列表页
- `/tools` - 工具页面

### 功能页面
- `/database/compare` - 产品对比页
- `/tags/[tag]` - 标签聚合页

## 变更日志

### v1.0.0 (2025-01-01)
- 初始站点地图
- 基于现有设计和规划

