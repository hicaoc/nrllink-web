import { createApp } from 'vue'
import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import 'virtual:svg-icons-register'
import './styles/element-variables.scss'
import {
  CaretBottom,
  Clock,
  Close,
  Delete,
  Document,
  Download,
  Edit,
  Search,
  Setting,
  Share,
  Upload
} from '@element-plus/icons-vue'

import '@/styles/index.scss' // global css

import App from './App.vue'
import router from './router'
import { setupStore } from './store'
import { pinia } from './store'
import { useSettingsStore } from '@/store/modules/settings'

import i18n from './lang' // internationalization
import { setupIcons } from './icons' // icon
import './permission' // permission control
import { setupErrorLog } from './utils/error-log' // error log
import { setElementPlusTheme } from './utils/theme'

import * as filters from './filters' // global filters

// import Print from 'vue-print-nb'
// import 'default-passive-events'

/**
 * If you don't want to use mock-server
 * you want to use mockjs for request interception
 * you can execute:
 *
 * import { mockXHR } from '../mock'
 * mockXHR()
 */

const app = createApp(App)

app.component('CaretBottom', CaretBottom)
app.component('Clock', Clock)
app.component('Close', Close)
app.component('Delete', Delete)
app.component('Document', Document)
app.component('Download', Download)
app.component('Edit', Edit)
app.component('Search', Search)
app.component('Setting', Setting)
app.component('Share', Share)
app.component('Upload', Upload)

setupStore(app)
setupIcons(app)
app.use(router)
app.use(i18n)
setupErrorLog(app)

const settingsStore = useSettingsStore(pinia)
setElementPlusTheme(settingsStore.theme)

// register global utility filters (Vue3 removes template filters, use $filters)
app.config.globalProperties.$filters = filters

app.mount('#app')
