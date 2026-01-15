# 05_Official_Website (Brand Layer)

> **Live Demo**: [https://gjnx.tech](https://gjnx.tech) | **Repository**: [hiais/gjnx-official](https://github.com/hiais/gjnx-official)

此目录包含 **硅基能效 (Silicon Efficiency)** 的官方品牌网站代码。这是一个基于 Astro + TailwindCSS 构建的高性能静态网站，通过 GitHub Actions 或 Vercel 自动部署。

## 📌 Project Overview
This directory contains the source code for the "Silicon Efficiency" official website. It acts as the **"Public Face"** and **"Toolbox"** for the WeChat Official Account ecosystem.

Its primary role is **NOT** to replace the WeChat account, but to:
1.  **Host Interactive Tools**: Efficiency calculators, interactive charts.
2.  **Archive Knowledge**: SEO-friendly versions of deep-dive articles.
3.  **Drive Traffic**: Convert web visitors to WeChat subscribers.

## 🛠️ Tech Stack
*   **Framework**: [Astro](https://astro.build) (Zero-JS default, extreme performance).
*   **Styling**: Plain CSS Variables (`src/styles/global.css`). No heavy frameworks.
*   **Deployment**: Vercel (Auto-deploy via GitHub).
*   **Content Source**: Local Markdown files synced from `../03_Content_Factory` (See [CONTENT_SYNC_MANUAL.md](./CONTENT_SYNC_MANUAL.md)).

## 📂 Directory Structure Rules

```text
05_Official_Website/
├── public/              # Static assets (favicon, robots.txt, social images)
├── src/
│   ├── content/         # [AUTO] Content Collections config
│   │   └── config.ts    # Defines schema for articles
│   ├── components/      # [DEV] Reusable UI components
│   │   └── EfficiencyCalculator.astro
│   ├── layouts/         # [DEV] Page shells (Meta tags, Nav, Footer)
│   ├── pages/           # [DEV] Route definitions
│   │   ├── index.astro  # Homepage
│   │   └── articles/    # Blog post template
│   └── styles/          # [DESIGN] Global theme variables
└── astro.config.mjs     # Project configuration
```

## 🚀 Development Commands

Run these commands inside `d:\gjnx\05_Official_Website`:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production static files to `dist/` |
| `npm run preview` | Preview the built `dist/` folder locally |

## 📦 Deployment Workflow
1.  **Commit**: `git add .` -> `git commit -m "update"` -> `git push`
2.  **Build**: Vercel automatically detects the push and triggers a build.
3.  **Live**: Changes are live at `https://www.gjnx.cc` within ~30s.

## ⚠️ Important Rules
1.  **Do NOT edit `dist/` manually**. It is generated code.
2.  **Image Paths**: Images in Markdown from `03_Content_Factory` need special handling to work on the web (Astro Assets or public folder mapping).
3.  **Privacy**: Ensure NO private files from `01_Knowledge_Base` are accidentally exposed via `src/content`.
