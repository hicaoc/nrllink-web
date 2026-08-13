import router from './router'
import { pinia } from './store'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { useSettingsStore } from '@/store/modules/settings'
import { setPlatformTheme } from '@/utils/theme'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = [
  '/login',
  '/register',
  '/signtimes',
  '/getcustomer',
  '/auth-redirect',
  '/universe',
  '/serial',
] // no redirect whitelist
const catchAllRoute = { path: '/:pathMatch(.*)*', name: 'CatchAll', redirect: '/404', hidden: true }

function ensureCatchAllRoute() {
  if (!router.hasRoute('CatchAll')) {
    router.addRoute(catchAllRoute)
  }
}

router.beforeEach(async (to, from) => {
  const userStore = useUserStore(pinia)
  const permissionStore = usePermissionStore(pinia)
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      NProgress.done()
      return { path: '/' }
    }
    // determine whether the user has obtained his permission roles through getInfo
    const hasRoles = userStore.roles && userStore.roles.length > 0
    if (hasRoles) {
      return true
    }
    try {
      // get user info
      // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
      const { roles } = await userStore.getInfo()

      // generate accessible routes map based on roles
      const accessRoutes = await permissionStore.generateRoutes(roles, userStore.billing_enabled)

      // dynamically add accessible routes
      for (let i = 0; i < accessRoutes.length; i += 1) {
        const element = accessRoutes[i]
        router.addRoute(element) // 会有告警
      }
      ensureCatchAllRoute()

      // hack method to ensure that addRoutes is complete
      // set the replace: true, so the navigation will not leave a history record
      return { ...to, replace: true }
    } catch (error) {
      // remove token and go to login page to re-login
      userStore.resetToken()
      ElMessage.error(error?.message || error || 'Has Error')
      NProgress.done()
      return `/login?redirect=${to.path}`
    }
  }

  /* has no token*/
  if (whiteList.indexOf(to.path) !== -1) {
    // in the free login whitelist, go directly
    return true
  }
  // other pages that do not have permission to access are redirected to the login page.
  NProgress.done()
  return `/login?redirect=${to.path}`
})

router.afterEach(() => {
  const settingsStore = useSettingsStore(pinia)
  setPlatformTheme(settingsStore.platformThemeKey)
  NProgress.done()
})
