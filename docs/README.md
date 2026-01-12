# 硅基能效网站设计文档索引

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **用途**: 网站设计、开发、优化的统一参考文档

## 快速导航

### 设计系统
- [设计系统总览](./design-system/README.md) - 设计原则、组件库、版本历史
- [颜色规范](./design-system/colors.md) - 颜色系统、使用场景
- [字体规范](./design-system/typography.md) - 字体系统、排版规则
- [组件规范](./design-system/components.md) - 组件清单、使用指南
- [响应式规范](./design-system/responsive.md) - 响应式设计、断点定义
- [可访问性规范](./design-system/accessibility.md) - WCAG 2.1 AA合规、ARIA使用

### 信息架构
- [站点地图](./architecture/site-map.md) - 页面结构、URL规范
- [导航结构](./architecture/navigation.md) - 导航设计、面包屑
- [内容结构](./architecture/content-structure.md) - 内容分类、组织方式

### 技术规范
- [技术栈](./technical/tech-stack.md) - 技术选型、依赖说明、CI/CD配置
- [文件结构](./technical/file-structure.md) - 目录组织、命名规范
- [性能规范](./technical/performance.md) - 性能指标、性能预算、监控自动化
- [代码规范](./technical/code-standards.md) - 代码风格、TypeScript规范
- [数据架构](./technical/data-schema.md) - 数据结构定义、Schema验证
- [安全策略](./technical/security.md) - 安全最佳实践、CSP配置、安全审计
- [测试策略](./technical/testing-strategy.md) - 测试类型、工具配置、缺陷管理
- [环境变量](./technical/environment-variables.md) - 环境变量配置、管理规范
- [工作流编排](./technical/workflow-orchestration.md) - **新增**: 工作流触发、状态管理、重试策略
- [监控和告警](./technical/monitoring.md) - **新增**: 监控指标、告警规则、监控工具

### 内容规范
- [内容策略](./content/content-strategy.md) - 内容类型、更新频率、选题规范
- [选题目录](./content/topic-catalog.md) - **重要**: 详细选题范围和技术目录（7维度64技术点）
- [SEO规范](./content/seo-guidelines.md) - SEO策略、检查清单
- [更新流程](./content/update-process.md) - 内容同步、发布流程
- [内容创建工作流](./content/CONTENT_CREATION_WORKFLOW.md) - **总入口**: 完整的内容创建流程
- [内容模板](./content/templates.md) - Frontmatter模板、内容结构模板、数据Schema
- [大纲设计指南](./content/outline-design-guide.md) - 内容大纲设计流程和详细模板

## AI Agent 指南

- [AI Agent 自动化维护指南](./AI_AGENT_GUIDE.md) - **AI 必读**: 任务执行协议、守卫规则、验证标准、快速参考
- [AI 网站自动生成指南](./AI_WEBSITE_GENERATION_GUIDE.md) - **网站生成**: 页面生成、组件生成、样式指南
- [AI 内容自动生成指南](./AI_CONTENT_GENERATION_GUIDE.md) - **内容生成**: 文章生成、知识库生成、自动发布
- [AI 提示词模板库](./AI_PROMPT_TEMPLATES.md) - **新增**: 标准化的提示词模板，确保生成一致性
- [AI 自动化成功指标](./AI_AUTOMATION_METRICS.md) - **新增**: 成功指标定义和追踪方法
- [AI 自动化能力评估](./AI_AUTOMATION_ASSESSMENT.md) - **能力评估**: 自动化支持程度评估报告

## 审核报告

### 设计和技术审核
- [UX Designer审核报告](./REVIEW_UX_DESIGNER.md)
- [Frontend Architect审核报告](./REVIEW_FRONTEND_ARCHITECT.md)
- [Content Strategist审核报告](./REVIEW_CONTENT_STRATEGIST.md)
- [System Architect审核报告](./REVIEW_SYSTEM_ARCHITECT.md)
- [多角色深度审核报告 v2.0](./REVIEW_MULTI_ROLE_V2.md) - 6个专业角色的综合审核
- [多角色深度审核报告 v4.0](./REVIEW_MULTI_ROLE_V4.md) - 6个专业角色的全面审核（Technical Writer, DevOps, QA, Product Owner, Security, Performance）
- [多角色深度审核报告 v5.0](./REVIEW_MULTI_ROLE_V5.md) - 6个专业角色的深度审核（Code Reviewer, Technical Lead, Documentation Manager, Compliance Officer, UX Researcher, SRE）

### AI自动化专项审核
- [AI Agent 视角深度审核报告 v3.0](./REVIEW_AI_AGENT_V3.md) - AI 工作流专家视角的专项审核
- [AI 自动化执行能力审查报告 v6.0](./REVIEW_AI_AUTOMATION_V6.md) - **最新**: 6个专业角色评估AI完全自动化执行所需能力

### 优化总结
- [文档优化完成报告](./SUMMARY_OPTIMIZATION.md) - 根据审核建议完成的优化工作

## 文档维护

### 更新流程
1. **修改文档**: 更新内容后，修改版本号和"最后更新"日期
2. **记录变更**: 在"变更日志"部分详细记录变更内容
3. **交叉引用**: 如果涉及其他文档，更新相关文档的交叉引用
4. **通知团队**: 重大变更（主版本号变更）需要通知相关团队成员
5. **提交代码**: 提交时在commit message中说明文档变更

### 版本号规则
- **主版本号**: 重大架构变更（如：设计系统重构）
- **次版本号**: 新增功能或章节（如：新增可访问性规范）
- **修订号**: 错误修复或小幅更新（如：修正错别字）

### 定期审查
- **频率**: 每季度审查一次所有文档
- **内容**: 确保文档与实际情况一致，更新过时信息
- **负责人**: 各文档的维护者负责审查

### 文档审查检查清单
在提交文档更新前，请检查：
- [ ] 版本号和最后更新日期正确
- [ ] 变更日志记录了所有重要变更
- [ ] 交叉引用链接有效
- [ ] 代码示例可执行
- [ ] 表格数据准确
- [ ] 无拼写错误
- [ ] Mermaid图表语法正确

### 更新频率
- **设计系统**: 重大变更时更新
- **信息架构**: 结构变更时更新
- **技术规范**: 技术栈变更时更新
- **内容规范**: 每月评审

### 文档状态
- ✅ 核心文档已完成
- ✅ 审核报告已生成（8个版本）
- ✅ 缺失文档已补充
- ✅ 可访问性规范已添加
- ✅ AI Agent 指南已创建
- ✅ 数据架构 Schema 已定义
- ✅ 安全策略文档已创建
- ✅ 测试策略文档已创建
- ✅ CI/CD 配置说明已完善
- ✅ 环境变量文档已创建
- ✅ 术语表已创建
- ✅ 文档模板已创建
- ✅ AI 网站生成指南已创建
- ✅ AI 内容生成指南已创建
- ✅ AI 自动化能力评估已完成
- 📋 架构决策记录（待创建）
- 📋 SLA/SLO 定义（待创建）
- 📋 文档学习路径（待创建）

## 参考文档

### 基础文档
- [术语表](./GLOSSARY.md) - 统一专业术语定义
- [文档模板](./TEMPLATE.md) - 新文档创建模板

## 参考标准

本文档体系参考以下主流网站的设计模式：
- **Stripe**: 极简的设计系统文档结构
- **Notion**: 清晰的信息架构组织
- **Medium**: 内容策略和SEO规范
- **Vercel**: 技术文档的简洁性

