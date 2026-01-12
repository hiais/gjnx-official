# 内容更新流程

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **来源**: `CONTENT_SYNC_MANUAL.md`

## 内容同步机制

### 数据流
```
微信公众号内容库 → 官网内容库
Source: 03_Content_Factory/01_WeChat/Published/
Target: 05_Official_Website/src/content/articles/
Executor: npm run sync
```

### 核心原则
1. **Frontmatter即指令**: 元数据控制同步行为
2. **AI质量检查**: 自动拦截低质量内容
3. **流量熔断**: 单次最多新增5篇

## 同步字段

### 必填字段
| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 文章标题 |
| `date` | date | 发布日期 (YYYY-MM-DD) |

### 可选字段
| 字段 | 类型 | 说明 | 默认行为 |
|------|------|------|---------|
| `tags` | array | 标签数组 | 空数组 |
| `sync` | boolean | 同步开关 | AI智能筛选 |
| `website_slug` | string | URL后缀 | 自动生成 |
| `description` | string | SEO描述 | 截取前120字 |

## 操作流程

### 场景A: 标准发布
1. 在微信目录写完文章
2. 填写 `tags` 和 `description`（可选）
3. 运行 `npm run sync`
4. 自动检查字数，合格则上线

### 场景B: 强制下架
1. 在文章frontmatter添加 `sync: false`
2. 运行 `npm run sync`
3. 文章自动删除

### 场景C: 强制上架
1. 在文章frontmatter添加 `sync: true`
2. 运行 `npm run sync`
3. 无视质量检查，直接上线

### 场景D: 自定义URL
1. 在首次同步前设置 `website_slug`
2. 运行 `npm run sync`
3. 使用指定URL

## 质量检查

### AI检查规则
- **字数**: < 800字拦截（除非 `sync: true`）
- **关键词**: 包含"通知/招聘"拦截
- **流量控制**: 单次最多5篇

### 手动检查
- 内容质量
- 图片完整性
- 链接有效性

## 部署流程

### 标准流程
1. 内容同步: `npm run sync`
2. 本地测试: `npm run dev`
3. 构建检查: `npm run build`
4. 提交代码: `git push`
5. 自动部署: Vercel自动部署

### SEO推送
1. 确认部署成功
2. 运行 `npm run push-seo`
3. 自动推送到百度

## 变更日志

### v1.0.0 (2025-01-01)
- 初始更新流程
- 基于 CONTENT_SYNC_MANUAL.md

