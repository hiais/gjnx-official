# 文件结构

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **来源**: 项目实际结构

## 目录结构

```
05_Official_Website/
├── docs/                    # 设计文档（新增）
├── public/                  # 静态资源
│   ├── assets/             # 图片、字体
│   └── robots.txt          # SEO配置
├── src/
│   ├── components/          # 组件
│   │   ├── EfficiencyCalculator.astro
│   │   ├── EfficiencyCalculatorPro.astro
│   │   └── WeChatModal.astro
│   ├── content/            # 内容集合
│   │   ├── articles/      # 文章Markdown
│   │   └── config.ts      # 内容配置
│   ├── data/              # 数据文件
│   │   └── chips.json     # 产品数据
│   ├── layouts/           # 布局组件
│   │   ├── Layout.astro   # 主布局
│   │   └── ArticleLayout.astro
│   ├── pages/             # 页面路由
│   │   ├── index.astro    # 首页
│   │   ├── articles/      # 文章路由
│   │   ├── tags/          # 标签路由
│   │   └── og/            # OG图片生成
│   └── styles/            # 样式文件
│       └── global.css     # 全局样式
├── scripts/               # 脚本文件
│   ├── sync-content.js   # 内容同步
│   └── baidu-push.js     # SEO推送
├── astro.config.mjs      # Astro配置
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 文件命名规范

### 组件文件
- 使用 PascalCase: `EfficiencyCalculator.astro`
- 文件名与组件名一致

### 页面文件
- 使用 kebab-case: `index.astro`, `[...slug].astro`
- 动态路由使用 `[...slug]` 格式

### 内容文件
- 使用 kebab-case: `intel-18a-analysis.md`
- 包含日期前缀: `2025-01-01-xxx.md`

### 数据文件
- 使用 camelCase: `chips.json`
- JSON格式，UTF-8编码

## 目录规则

### 禁止操作
- 禁止手动编辑 `dist/` 目录（构建生成）
- 禁止在 `public/` 放置源代码
- 禁止在 `src/` 放置构建产物

### 新增文件
- 组件: 放在 `src/components/`
- 页面: 放在 `src/pages/`
- 内容: 放在 `src/content/`
- 数据: 放在 `src/data/`

## 变更日志

### v1.0.0 (2025-01-01)
- 初始文件结构
- 基于现有项目结构

