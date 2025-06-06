import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [{
  path: '/redirect',
  component: Layout,
  hidden: true,
  children: [{
    path: '/redirect/:path(.*)',
    component: () =>
      import ('@/views/redirect/index')
  }]
},
{
  path: '/login',
  component: () =>
    import ('@/views/login/index'),
  hidden: true
},

{
  path: '/auth-redirect',
  component: () =>
    import ('@/views/login/auth-redirect'),
  hidden: true
},
{
  path: '/404',
  component: () =>
    import ('@/views/error-page/404'),
  hidden: true
},
{
  path: '/401',
  component: () =>
    import ('@/views/error-page/401'),
  hidden: true
},
{
  path: '',
  component: Layout,
  redirect: 'dashboard',
  children: [{
    path: 'dashboard',
    component: () =>
      import ('@/views/dashboard/index'),
    name: 'Dashboard',
    meta: { title: 'dashboard', icon: 'dashboard', affix: true, noCache: true }
  }]
},

{
  path: '/profile',
  component: Layout,
  redirect: '/profile/index',
  hidden: true,
  children: [{
    path: 'index',
    component: () =>
      import ('@/views/profile/index'),
    name: 'Profile',
    meta: { title: 'profile', icon: 'user', noCache: true }
  }]
}
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [

  // {

  // path: '/month',
  // component: Layout,
  // redirect: 'monty',
  // meta: {
  //   title: 'month',
  //   icon: 'dashboard',
  //   affix: true,
  //   noCache: true,
  //   roles: ['ham'] // you can set roles in root nav
  // },

  // children: [{
  //   path: '/chat',
  //   component: () =>
  //     import ('@/views/dashboard/chat'),

  //   name: 'chat',
  //   meta: { title: 'chat', icon: 'user', noCache: true }
  // }]
  // },

  {
    path: '/public',
    component: Layout,
    redirect: '/pub/device',
    alwaysShow: true, // will always show the root menu
    name: 'devgroup',
    meta: {
      title: 'devgroup',
      icon: 'people',
      roles: ['ham'] // you can set roles in root nav
    },
    children: [{
      path: 'totaldevices',
      component: () =>
        import ('@/views/pub/device'),
      name: 'totaldevices',
      meta: {
        title: 'totaldevices',
        roles: ['ham']
      }
    },
    {
      path: 'groups',
      component: () =>
        import ('@/views/pub/groups'),
      name: 'grouproom',
      meta: {
        title: 'grouproom',
        roles: ['ham']
      }
    },
    // {
    //   path: 'mydevices',
    //   component: () =>
    //     import ('@/views/pub/mydevice'),
    //   name: 'mydevices',
    //   meta: {
    //     title: 'mydevices',
    //     roles: ['ham']
    //   }
    // },
    {
      path: 'relay',
      component: () =>
        import ('@/views/pub/relay'),
      name: 'relay',
      meta: {
        title: 'relay',
        roles: ['ham'] // or you can only set roles in sub nav
      }
    }

    ]
  },

  {
    path: '/setup',
    component: Layout,
    redirect: '/setup/users',
    alwaysShow: true, // will always show the root menu
    name: 'Setup',
    meta: {
      title: 'setup',
      icon: 'edit',
      roles: ['master'] // you can set roles in root nav
    },
    children: [

      {
        path: 'publicgroup',
        component: () =>
          import ('@/views/setup/groups'),
        name: 'publicgroup',
        meta: {
          title: 'publicgroup',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },

      {
        path: 'server',
        component: () =>
          import ('@/views/setup/server'),
        name: 'server',
        meta: {
          title: 'server',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },

      {
        path: 'users',
        component: () =>
          import ('@/views/setup/users'),
        name: 'UserMgr',
        meta: {
          title: 'users',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'register',
        component: () =>
          import ('@/views/setup/register'),
        name: 'regMgr',
        meta: {
          title: 'register',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'roles',
        component: () =>
          import ('@/views/setup/role'),
        name: 'Roles',
        meta: {
          title: 'rolemgr',
          roles: ['admin']
        }
      }

    ]
  },

  {
    path: '/log',
    component: Layout,
    redirect: '/log/operatorlog',
    alwaysShow: true, // will always show the root menu
    name: 'Log',
    meta: {
      title: 'log',
      icon: 'documentation',
      roles: ['admin'] // you can set roles in root nav
    },
    children: [

      {
        path: 'operatorlog',
        component: () =>
          import ('@/views/log/operatorlog'),
        name: 'OperatorLog',
        meta: {
          title: 'operatorlog',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
