# Vue3 迁移记录

## 范围
- 前端：`nrllink-web`（Vue2 -> Vue3，Vue CLI -> Vite，Vuex -> Pinia）
- 后端：无改动

## 已完成
- 路由兜底：使用 `/:pathMatch(.*)*` 并放到 routes 末尾
- Element Plus 兼容：替换 `$confirm/$notify/$message`，radio `label` -> `value`，修复 `$set`，补齐 `label-for/id`
- 删除与通知 UI：弹窗/提示样式统一（居中、层级、间距、图标与文本同排、颜色区分、可堆叠）
- Toast 显示：顶部居中、类型着色、半透明背景、避免重叠
- 主题覆盖：改用 CSS 变量覆盖 + 运行时 setter（不再远程拉取 CSS）
- 路由模式：切换为 hash 模式，硬刷新不再 404
- Vitest：加入基础配置与示例单测（`utils/validate`、`utils/theme`）

## 待确认
- Element Plus 主题覆盖在各页面的实际效果是否符合预期（需页面确认）

## 待推进
- 测试策略扩展：补充 store/权限/关键组件用例，或引入端到端测试

- 扩展 Pinia store 单元测试（user/permission/settings/tagsView/app/errorLog）

- 修复 Vitest 兼容：锁定 jsdom@22（Node16），更新组件/校验类旧测试以适配 Vue Test Utils v2

- 登录页输入框宽度对齐（el-input 改为 100- 登录页输入框宽度对齐（el-input 改为 100%）
- 登录页输入框与背景条宽度统一（el-form-item flex，el-input 填满剩余宽度）
- 登录页输入区域背景与外层条一致（去掉输入内层背景色）
- .env 补充 VITE_BASE_API，避免请求基址为空
- 依赖升级：axios@0.21.4、path-to-regexp@6.3.0（仍建议评估 axios 1.x/echarts 6 升级）
