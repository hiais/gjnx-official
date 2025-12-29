# 系统监控看板

## 访问地址

- 生产环境: https://dashboard.ikit.cloud（需密码）
- 开发环境: 本地打开 `index.html`

## 功能特性

- ✅ 实时系统状态监控
- ✅ 任务队列可视化
- ✅ 日志统计与分析
- ✅ 健康分数计算
- ✅ 自动刷新（30秒）
- ✅ 移动端适配
- ✅ 告警通知（浏览器）

## 数据更新

- 自动更新：每5分钟通过 GitHub Actions
- 手动更新：运行 `.\scripts\collect-dashboard-data.ps1`

## 密码保护

密码在 Vercel Dashboard 中设置，仅内部人员可访问。

## 故障排查

1. **数据不更新**：检查 GitHub Actions 是否运行
2. **页面无法访问**：检查 Vercel 部署状态
3. **样式异常**：检查文件路径是否正确
