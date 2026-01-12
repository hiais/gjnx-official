# 环境变量配置

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **维护者**: DevOps Team

## 环境变量清单

### 必需变量

| 变量名 | 类型 | 说明 | 示例 | 环境 |
|--------|------|------|------|------|
| `NODE_ENV` | string | 环境类型 | `production` | 所有 |

### 可选变量

| 变量名 | 类型 | 说明 | 示例 | 环境 |
|--------|------|------|------|------|
| `ANALYTICS_ID` | string | 分析工具 ID | `G-XXXXXXXXXX` | 生产 |
| `API_KEY` | string | API 密钥 | `sk-...` | 生产 |
| `SENTRY_DSN` | string | Sentry 错误监控 DSN | `https://...` | 生产 |

## 环境变量管理

### 本地开发

创建 `.env.local` 文件（不提交到 Git）:
```bash
# .env.local
NODE_ENV=development
ANALYTICS_ID=your_dev_analytics_id
API_KEY=your_dev_api_key
```

### 生产环境

在 Vercel Dashboard 中配置环境变量：
1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加变量并选择环境（Production/Preview/Development）

### 环境变量文件

#### `.env.example`
提交到 Git 的示例文件（不含实际值）:
```bash
# .env.example
NODE_ENV=development
ANALYTICS_ID=your_analytics_id
API_KEY=your_api_key
```

#### `.env.local`
本地开发环境变量（不提交到 Git，添加到 `.gitignore`）

#### `.gitignore`
确保敏感文件不被提交：
```
.env
.env.local
.env.*.local
```

## 使用环境变量

### Astro 中使用

```typescript
// src/utils/config.ts
export const config = {
  analyticsId: import.meta.env.ANALYTICS_ID || '',
  apiKey: import.meta.env.API_KEY || '',
  nodeEnv: import.meta.env.NODE_ENV || 'development',
};
```

### 类型定义

```typescript
// src/env.d.ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly ANALYTICS_ID?: string;
  readonly API_KEY?: string;
  readonly NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## 安全检查清单

- [ ] 所有敏感信息使用环境变量
- [ ] 环境变量不在代码中硬编码
- [ ] `.env.example` 文件已创建
- [ ] `.env.local` 已添加到 `.gitignore`
- [ ] 生产环境变量已正确配置
- [ ] 环境变量文档已更新

## 变更日志

### v1.0.0 (2025-01-01)
- 初始环境变量配置文档
- 定义必需和可选变量
- 建立环境变量管理规范

