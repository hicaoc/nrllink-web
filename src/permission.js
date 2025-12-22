import router from './router'
import { pinia } from './store'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/register', '/signtimes', '/getcustomer', '/auth-redirect'] // no redirect whitelist
const catchAllRoute = { path: '/:pathMatch(.*)*', name: 'CatchAll', redirect: '/404', hidden: true }

function ensureCatchAllRoute() {
  if (!router.hasRoute('CatchAll')) {
    router.addRoute(catchAllRoute)
  }
}

router.beforeEach(async(to, from, next) => {
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
      next({ path: '/' })
      NProgress.done()
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = userStore.roles && userStore.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await userStore.getInfo()

          // generate accessible routes map based on roles
          const accessRoutes = await permissionStore.generateRoutes(roles)

          // dynamically add accessible routes
          for (let i = 0; i < accessRoutes.length; i += 1) {
            const element = accessRoutes[i]
            router.addRoute(element) // 会有告警
          }
          ensureCatchAllRoute()

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          //  next({ replace: true })
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          userStore.resetToken()
          ElMessage.error(error?.message || error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
