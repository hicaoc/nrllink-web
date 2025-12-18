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
