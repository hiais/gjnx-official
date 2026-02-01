# Wiki知识体系系统

## 概述

Wiki系统是硅基能效知识体系的系统化展示平台，包含7大维度、64个核心技术点、知识模块和学习路径。

## 路由结构

```
/wiki                          # Wiki首页
/wiki/domain/[dimension]       # 维度页面（7个维度）
/wiki/module/[moduleId]        # 模块页面
/wiki/concept/[conceptId]       # 词条页面
/wiki/learning-paths           # 学习路径列表
/wiki/learning-paths/[pathId]  # 学习路径详情
/wiki/core-64                  # 64核心技术点列表
```

## 数据结构

### Knowledge Collection Schema

词条（knowledge collection）支持以下字段：

```typescript
{
  title: string;                    // 词条标题
  description?: string;              // 描述
  category: string;                  // 分类
  tags?: string[];                   // 标签
  
  // Wiki系统字段（全部optional）
  dimension?: 'HW' | 'CMP' | 'EDGE' | 'PWR' | 'EMB' | 'SPACE' | 'ANALOG';
  techPointId?: number;              // 64技术点ID (1-64)
  module?: string;                   // 知识模块ID
  level?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];          // 前置知识ID数组
  nextSteps?: string[];              // 后续学习ID数组
  isCore64?: boolean;                // 是否为64核心技术点
}
```

### 知识体系配置

配置文件：`src/data/wiki-taxonomy.json`

包含：
- 7大维度定义
- 64技术点映射
- 知识模块定义
- 学习路径配置

## 使用方法

### 1. 为词条添加Wiki字段

在词条的frontmatter中添加：

```markdown
---
title: PPW (每瓦性能回报)
dimension: CMP
techPointId: 15
module: cmp-efficiency
level: beginner
isCore64: true
prerequisites: []
nextSteps: ['tco', 'pue']
---
```

### 2. 运行映射工具

识别现有词条与64技术点的对应关系：

```bash
node scripts/map-64-tech-points.js
```

这会生成 `src/data/64-tech-points-mapping.json` 文件。

### 3. 访问Wiki页面

- 首页：`/wiki`
- 维度页面：`/wiki/domain/hw`
- 词条页面：`/wiki/concept/ppw`

## 组件

### Core64Badge

显示64技术点标记：

```astro
<Core64Badge techPointId={15} dimensionCode="CMP" />
```

### Breadcrumb

面包屑导航：

```astro
<Breadcrumb items={[
  { label: '首页', href: '/' },
  { label: '知识体系', href: '/wiki' },
  { label: '当前页面' }
]} />
```

### KnowledgeGraph

知识网络图谱（简化版）：

```astro
<KnowledgeGraph 
  concepts={[
    { id: 'ppw', title: 'PPW', href: '/wiki/concept/ppw' }
  ]}
  currentId="ppw"
/>
```

### PrerequisitesCheck

前置知识检查：

```astro
<PrerequisitesCheck 
  prerequisites={['tdp', 'efficiency']}
  currentId="ppw"
/>
```

## 工具函数

`src/utils/wiki-helpers.ts` 提供了以下工具函数：

- `getTechPointForConcept(conceptId)` - 获取词条对应的技术点
- `isCore64Concept(concept)` - 检查是否为64技术点
- `getDimensionForConcept(concept)` - 获取词条所属维度
- `getModuleForConcept(concept)` - 获取词条所属模块
- `getCore64Concepts(allKnowledge)` - 获取所有64技术点词条
- `getRelatedConcepts(concept, allKnowledge)` - 获取相关概念

## 设计原则

1. **向后兼容**：所有Wiki字段都是optional，不影响现有词条
2. **渐进增强**：可以逐步为词条添加Wiki字段
3. **设计一致**：保持Cyberpunk Engineering设计风格
4. **性能优化**：使用静态生成（SSG），所有页面预渲染

## 后续工作

1. 完善64技术点词条内容
2. 为现有词条添加dimension、module等字段
3. 建立完整的学习路径
4. 添加交互式知识图谱（使用D3.js或vis.js）
5. 优化SEO（Schema.org标记）

