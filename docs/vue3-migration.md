# Vue3 Migration Timeline

## Scope
- Frontend: `nrllink-web` (Vue2 -> Vue3, Vue CLI -> Vite, Vuex -> Pinia)
- Backend: no change

## Timeline
| Date | Commit | Scope | Notes |
| --- | --- | --- | --- |
| 2025-12-20 | b202fdc | Router | Move catch-all to constantRoutes to avoid initial no-match warnings |
| 2025-12-20 | (pending) | Element Plus | Replace $confirm/$notify, update radio value prop, guard null responses |
| 2025-12-20 | (pending) | Element Plus | Replace $confirm/$notify in register view, guard response messages |
| 2025-12-20 | (pending) | Element Plus | Replace $confirm/$notify in device view, guard response messages |
| 2025-12-20 | (pending) | Element Plus | Replace el-radio label with value in device view |
| 2025-12-20 | (pending) | Element Plus | Replace $confirm/$notify and radio label in pub groups view |
| 2025-12-20 | (pending) | Element Plus | Replace $confirm/$notify and radio label in users view |
| 2025-12-20 | (pending) | Element Plus | Replace el-radio label with value in AutoWidth option |
| 2025-12-20 | (pending) | Register | Guard license image fetch to avoid unhandled 404 |
| 2025-12-20 | (pending) | Vue3 | Replace $set usage in pub groups view |
| 2025-12-20 | (pending) | Element Plus | Replace $confirm/$notify in relay view |
| 2025-12-20 | (pending) | Element Plus | Add label-for/id for radio groups to fix label for warnings |
| 2025-12-20 | (pending) | Element Plus | Replace $confirm/$notify in server view |
| 2025-12-20 | (pending) | Element Plus | Add label-for/id for radio groups in device, pub groups, users |
| 2025-12-20 | (pending) | Element Plus | Replace el-button type="link" with link prop in device view |
| 2025-12-20 | (pending) | Element Plus | Normalize el-button type bindings in device view |
| 2025-12-20 | (pending) | Element Plus | Replace remaining $message/$notify in views |
| 2025-12-20 | (pending) | UI | Raise z-index for message box/notification |
| 2025-12-20 | (pending) | UI | Center message box wrapper with flex |
| 2025-12-20 | (pending) | UI | Force message box/message/notification positioning |
| 2025-12-20 | (pending) | UI | Restyle message box and dialog layout |
| 2025-12-20 | (pending) | UI | Fix message/dialog styles SCSS brace |
| 2025-12-20 | (pending) | Element Plus | Use notification for server delete result |
| 2025-12-19 | (pending) | Vite base + Vue3 + Pinia | Build config, entry, router, store migration scaffolding |
| 2025-12-19 | (pending) | Template syntax | .sync -> v-model, slot-scope -> v-slot, filters -> methods/$filters |
| 2025-12-19 | (pending) | Vue3 deps | vue-count-to -> vue3-count-to, vuedraggable -> v4 |
| 2025-12-19 | (pending) | Dependency cleanup | remove vue-print-nb, vue-splitpane, vue-weui, script-loader |
| 2025-12-19 | (pending) | Element Plus icons | replace el-icon-* usage with @element-plus/icons-vue |
| 2025-12-19 | (pending) | MDinput icon | map legacy icon names to Element Plus icons |
| 2025-12-19 | (pending) | Tooling | downgrade Vite to v4 for Node16, update ESLint config |
| 2025-12-19 | (pending) | Build fixes | add .vue extensions, adjust deep selector syntax, replace JSX Sidebar Item |
| 2025-12-19 | (pending) | Build fixes | update path-to-regexp import and settings export |
| 2025-12-19 | (pending) | Build | `npm run build:prod` succeeds under Vite |
| 2025-12-19 | (pending) | Sass cleanup | replace `@import` with `@use`, update color functions, fix `::v-deep`, silence legacy JS API warnings |
| 2025-12-19 | (pending) | Build size | split vendor chunks and raise chunk warning limit |
| 2025-12-19 | (pending) | Element Plus | switch to on-demand components/styles with auto-import + ConfigProvider |
| 2025-12-19 | (pending) | Export2Excel | lazy-load xlsx inside export helpers |
| 2025-12-19 | (pending) | Element Plus icons | register only used icons instead of full bundle |

## Open Items
- Validate Element Plus theme overrides
- Update tests to Vitest (or new testing strategy)

- Tweak message box/message styles to match aa/cc reference (classic overlay, compact box, top toast)

- Force ElMessage toast to fixed top center with higher z-index so cancel-delete notices are visible

- Restyle ElMessage and ElMessageBox to a cleaner non-transparent look (rounded, shadow, spacing)

- Tighten message box vertical spacing and pin close button top-right

- Align confirm icon inline with text and soften close button

- Align ElMessage icon/text inline and tighten height

- Move toast to top-center and colorize by type (success/info/warn/error)

- Let ElMessage use native stacking offsets to avoid overlap while keeping top-center alignment

- Add subtle translucency to toast background for softer look

- Switch router history to hash mode to avoid 404 on hard refresh

- Validate Element Plus theme override: apply CSS variables and runtime theme setter (no remote CSS fetch)
