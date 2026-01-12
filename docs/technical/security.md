# 安全策略

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **维护者**: Security Team  
> **标准**: OWASP Top 10, CWE Top 25

## 安全原则

### 核心原则
1. **最小权限原则**: 只授予必要的权限
2. **纵深防御**: 多层安全防护
3. **安全默认**: 默认安全配置
4. **持续监控**: 实时监控安全状态

### 安全目标
- **零数据泄露**: 保护用户数据和敏感信息
- **零安全漏洞**: 及时修复已知漏洞
- **合规性**: 符合相关安全标准（如 GDPR）

## 输入验证

### 前端输入验证
- **所有用户输入必须验证**: 客户端和服务端双重验证
- **防止 XSS 攻击**: 
  - 使用 Astro 的自动转义
  - 禁止使用 `dangerouslySetInnerHTML`（除非绝对必要）
  - 对用户输入进行 HTML 编码

### 数据验证
- **Schema 验证**: 所有数据必须符合 `data-schema.md` 定义的 Schema
- **类型检查**: 使用 TypeScript 进行类型检查
- **范围验证**: 数值必须在合理范围内

### 示例代码
```typescript
// ✅ 正确: 使用类型安全的验证
interface UserInput {
  title: string;
  content: string;
}

function validateInput(input: unknown): UserInput {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Invalid input');
  }
  const { title, content } = input as Record<string, unknown>;
  if (typeof title !== 'string' || title.length < 5 || title.length > 100) {
    throw new Error('Invalid title');
  }
  if (typeof content !== 'string' || content.length < 10) {
    throw new Error('Invalid content');
  }
  return { title, content };
}
```

## 数据保护

### 敏感信息处理

#### 禁止行为
- ❌ **禁止**: 在代码中硬编码 API 密钥、密码、令牌
- ❌ **禁止**: 提交包含敏感信息的文件到 Git
- ❌ **禁止**: 在日志中输出敏感信息（密码、令牌、个人信息）
- ❌ **禁止**: 在前端代码中暴露后端 API 密钥

#### 正确做法
- ✅ **使用环境变量**: 所有敏感信息存储在环境变量中
- ✅ **使用 `.gitignore`**: 排除包含敏感信息的文件
- ✅ **加密存储**: 敏感数据加密存储（如需要）
- ✅ **访问控制**: 限制敏感数据的访问权限

### 环境变量管理
```bash
# .env.example (提交到 Git)
ANALYTICS_ID=your_analytics_id
API_KEY=your_api_key

# .env (不提交到 Git，添加到 .gitignore)
ANALYTICS_ID=actual_id
API_KEY=actual_key
```

### 数据加密
- **传输加密**: 使用 HTTPS（TLS 1.3+）
- **存储加密**: 敏感数据加密存储（如需要）
- **密钥管理**: 使用密钥管理服务（如 Vercel Environment Variables）

## 内容安全策略 (CSP)

### CSP 配置

在 `src/layouts/Layout.astro` 中添加 CSP meta 标签：

```astro
<head>
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; 
                 script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
                 style-src 'self' 'unsafe-inline'; 
                 img-src 'self' data: https:; 
                 font-src 'self' data:; 
                 connect-src 'self' https://api.example.com;">
</head>
```

### CSP 规则说明
- `default-src 'self'`: 默认只允许同源资源
- `script-src 'self' 'unsafe-inline'`: 允许内联脚本（Astro 需要）
- `style-src 'self' 'unsafe-inline'`: 允许内联样式
- `img-src 'self' data: https:`: 允许图片（同源、data URI、HTTPS）
- `font-src 'self' data:`: 允许字体（同源、data URI）

### CSP 报告
```astro
<meta http-equiv="Content-Security-Policy-Report-Only" 
      content="default-src 'self'; report-uri /csp-report">
```

## 依赖安全

### 依赖管理

#### 定期更新
- **每周检查**: 使用 `npm outdated` 检查过时依赖
- **每月更新**: 更新依赖到最新稳定版本
- **安全补丁**: 立即应用安全补丁

#### 安全检查
```bash
# 检查已知漏洞
npm audit

# 自动修复可修复的漏洞
npm audit fix

# 检查详细报告
npm audit --json > audit-report.json
```

### 依赖锁定
- **使用 `package-lock.json`**: 锁定依赖版本
- **定期审查**: 审查新增依赖的必要性
- **最小化依赖**: 只安装必要的依赖

### 依赖白名单
在 `package.json` 中明确列出所有依赖：
```json
{
  "dependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "@astrojs/sitemap": "^3.6.0"
  }
}
```

## 部署安全

### 环境变量配置

#### Vercel 环境变量
1. 在 Vercel Dashboard 中配置环境变量
2. 区分开发、预览、生产环境
3. 使用不同的密钥（如需要）

#### 环境变量检查清单
- [ ] 所有敏感信息使用环境变量
- [ ] 环境变量不在代码中硬编码
- [ ] 环境变量文档化（`.env.example`）
- [ ] 生产环境变量已正确配置

### HTTPS 配置
- **强制 HTTPS**: Vercel 默认启用 HTTPS
- **HSTS**: 启用 HTTP Strict Transport Security
- **证书**: 使用有效的 SSL/TLS 证书

### 部署安全检查
- [ ] 环境变量已配置
- [ ] HTTPS 已启用
- [ ] CSP 已配置
- [ ] 无已知安全漏洞

## 安全审计清单

### 代码安全
- [ ] 无硬编码密钥、密码、令牌
- [ ] 所有用户输入已验证
- [ ] 无 SQL 注入风险（如果使用数据库）
- [ ] 无 XSS 漏洞
- [ ] 无 CSRF 漏洞（如果使用表单）

### 依赖安全
- [ ] 依赖包已更新到最新版本
- [ ] `npm audit` 无高危漏洞
- [ ] 无已知安全漏洞（CVE）
- [ ] 依赖来源可信

### 部署安全
- [ ] 环境变量配置正确
- [ ] HTTPS 已启用
- [ ] CSP 已配置
- [ ] 安全头已设置

### 数据安全
- [ ] 敏感数据加密存储
- [ ] 访问控制已实施
- [ ] 数据备份已配置
- [ ] 数据保留策略已定义

## 安全事件响应

### 事件分类
- **P0（严重）**: 数据泄露、系统入侵
- **P1（高）**: 安全漏洞、未授权访问
- **P2（中）**: 配置错误、潜在风险

### 响应流程
1. **发现**: 识别安全事件
2. **评估**: 评估影响范围和严重程度
3. **隔离**: 隔离受影响系统
4. **修复**: 修复安全漏洞
5. **验证**: 验证修复效果
6. **报告**: 记录事件和响应过程

### 报告模板
```markdown
## 安全事件报告

### 事件描述
[详细描述安全事件]

### 发现时间
[YYYY-MM-DD HH:MM:SS]

### 影响范围
[受影响系统、数据、用户]

### 响应措施
[采取的响应措施]

### 修复状态
[已修复/修复中/待修复]

### 预防措施
[防止类似事件再次发生的措施]
```

## AI Agent 安全指南

### AI 生成代码安全检查
- [ ] 检查是否有硬编码密钥
- [ ] 检查输入验证是否完整
- [ ] 检查是否有安全漏洞
- [ ] 检查依赖是否安全

### AI 处理敏感信息
- ❌ **禁止**: AI 在代码中硬编码敏感信息
- ❌ **禁止**: AI 提交包含敏感信息的文件
- ✅ **必须**: AI 使用环境变量存储敏感信息
- ✅ **必须**: AI 在提交前检查敏感信息

## 安全工具推荐

### 代码扫描
- **ESLint Security Plugin**: 检测常见安全问题
- **Snyk**: 依赖漏洞扫描
- **GitHub Dependabot**: 自动依赖更新和安全补丁

### 运行时监控
- **Vercel Analytics**: 监控异常请求
- **Sentry**: 错误监控和报告
- **LogRocket**: 用户会话回放（如需要）

## 合规性

### 数据保护法规
- **GDPR**: 欧盟通用数据保护条例
- **CCPA**: 加州消费者隐私法
- **PIPL**: 个人信息保护法（中国）

### 合规检查清单
- [ ] 隐私政策已发布
- [ ] 用户数据收集已告知
- [ ] 用户数据删除机制已实施
- [ ] 数据跨境传输已合规

## 变更日志

### v1.0.0 (2025-01-01)
- 初始安全策略文档
- 基于 OWASP Top 10 和 CWE Top 25
- 定义输入验证、数据保护、CSP 配置
- 建立安全审计清单和事件响应流程

