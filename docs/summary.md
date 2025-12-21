# 迁移整理摘要

## 概览
- 前端已升级到 Vue3 + Vite + Pinia
- Element Plus 兼容问题已集中修复
- 统一弹窗/提示样式，顶部 toast 可见且可堆叠
- 路由切换为 hash 模式，硬刷新不再 404

## 测试
- 使用 Vitest + jsdom（Node16 需固定 jsdom@22.1.0）
- 运行：
  - `npm run test:unit`

## 发布
- 构建：`npm run build:prod`
- 部署：`rsync -a --delete dist/ /root/PgarlicPTT/www/`

## 待办
- 扩展测试：store/权限/关键组件更多用例
- Element Plus 主题覆盖效果逐页核验
