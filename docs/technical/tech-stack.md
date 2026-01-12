# 技术栈

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **来源**: `package.json`, `astro.config.mjs`

## 核心技术

### 框架
- **Astro**: v5.0.0
  - 用途: 静态网站生成
  - 优势: 零JS默认、极致性能
  - 配置: `astro.config.mjs`

### 样式
- **CSS Variables**: 原生CSS变量系统
  - 文件: `src/styles/global.css`
  - 无外部CSS框架依赖

### 部署
- **Vercel**: 自动部署
  - 触发: GitHub Push
  - 构建: `npm run build`
  - 域名: `gjnx.tech`
  - 环境: 自动区分开发、预览、生产环境

## 依赖清单

### 核心依赖
| 包名 | 版本 | 用途 |
|------|------|------|
| `astro` | ^5.0.0 | 框架核心 |
| `@astrojs/sitemap` | ^3.6.0 | 站点地图生成 |
| `satori` | ^0.18.3 | OG图片生成 |
| `gray-matter` | ^4.0.3 | Frontmatter解析 |
| `pinyin` | ^4.0.0 | 中文转拼音 |

## 开发工具

### 脚本命令
- `npm run dev` - 本地开发服务器 (localhost:4321)
- `npm run build` - 生产构建
- `npm run preview` - 预览构建结果
- `npm run sync` - 内容同步
- `npm run push-seo` - SEO推送

## 技术选型原则

### 性能优先
- 零JS默认（Astro）
- 静态生成
- 最小化依赖

### 易维护
- 原生CSS（无框架）
- 简单构建流程
- 清晰的目录结构

## CI/CD 配置

### GitHub Actions (可选)

如果使用 GitHub Actions，创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test  # 运行测试
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Vercel 配置

#### 构建配置
- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **安装命令**: `npm install`

#### 环境变量
在 Vercel Dashboard 中配置环境变量：

| 变量名 | 环境 | 说明 |
|--------|------|------|
| `NODE_ENV` | 所有 | 环境类型 (production/preview/development) |
| `ANALYTICS_ID` | 生产 | 分析工具 ID |
| `API_KEY` | 生产 | API 密钥（如有） |

#### 环境区分
- **Production**: `main` 分支自动部署
- **Preview**: 其他分支和 PR 自动部署预览
- **Development**: 本地开发环境

### 部署流程

#### 标准流程
1. **代码提交**: Push 到 GitHub
2. **自动构建**: Vercel 自动触发构建
3. **运行测试**: 运行测试套件（如果配置）
4. **部署**: 构建成功后自动部署
5. **通知**: 部署成功/失败通知

#### 回滚流程

##### 自动回滚
- Vercel 自动保留最近 10 个部署版本
- 可以通过 Vercel Dashboard 快速回滚到任意版本

##### 手动回滚
1. **找到稳定版本**: 在 Vercel Dashboard 中找到上一个稳定版本
2. **创建回滚 PR**: 
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
3. **自动部署**: 回滚 PR 合并后，自动触发部署

### 监控和告警

#### 部署监控
- **Vercel Dashboard**: 查看部署状态和历史
- **GitHub Actions**: 查看构建日志（如果使用）

#### 告警配置
- **构建失败**: 发送邮件/Slack 通知
- **部署失败**: 立即通知
- **性能下降**: 如果 Lighthouse 分数下降 > 5分，发送告警

## 环境变量配置

### 环境变量清单

#### 必需变量
| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NODE_ENV` | 环境类型 | `production` |

#### 可选变量
| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ANALYTICS_ID` | 分析工具 ID | `G-XXXXXXXXXX` |
| `API_KEY` | API 密钥 | `sk-...` |

### 环境变量管理

#### 本地开发
创建 `.env.local` 文件（不提交到 Git）:
```bash
NODE_ENV=development
ANALYTICS_ID=your_dev_id
```

#### 生产环境
在 Vercel Dashboard 中配置环境变量。

#### 环境变量检查清单
- [ ] 所有敏感信息使用环境变量
- [ ] 环境变量不在代码中硬编码
- [ ] `.env.example` 文件已创建（不含实际值）
- [ ] 生产环境变量已正确配置

## 变更日志

### v1.0.1 (2025-01-01)
- 添加 CI/CD 配置说明
- 添加环境变量配置文档
- 添加回滚机制说明
- 添加监控和告警配置

### v1.0.0 (2025-01-01)
- 初始技术栈
- 基于现有配置

