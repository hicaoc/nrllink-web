// Just a mock data

export const constantRoutes = [
  {
    path: '/redirect',
    component: 'layout/Layout',
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: 'views/redirect/index'
      }
    ]
  },
  {
    path: '/login',
    component: 'views/login/index',
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: 'views/login/auth-redirect',
    hidden: true
  },
  {
    path: '/404',
    component: 'views/error-page/404',
    hidden: true
  },
  {
    path: '/401',
    component: 'views/error-page/401',
    hidden: true
  },
  {
    path: '',
    component: 'layout/Layout',
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: 'views/dashboard/index',
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', affix: true }
      }
    ]
  }
]

export const asyncRoutes = [
  {
    path: '/user',
    redirect: '/user/index',
    alwaysShow: true, // will always show the root menu
    name: 'userg',
    meta: {
      title: 'user',
      icon: 'lock',
      roles: ['admin', 'consultant'] // you can set roles in root nav
    },
    children: [
      {
        path: 'listimport',
        component: () => import('@/views/user/listimport'),
        name: 'ListImport',
        meta: {
          title: 'listimport',
          roles: ['admin', 'consultant'] // or you can only set roles in sub nav
        }
      }
     
    ]
  },
  {
    path: '/userquery',
    redirect: '/userquery/index',
    alwaysShow: true, // will always show the root menu
    name: 'userquery',
    meta: {
      title: 'userquery',
      icon: 'lock',
      roles: ['admin', 'consultant'] // you can set roles in root nav
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/userquery/Account'),
        name: 'AccountMange',
        meta: {
          title: 'Account',
          roles: ['admin', 'consultant '] // or you can only set roles in sub nav
        }
      }
   
    ]
  },
  

  {
    path: '/setup',
    redirect: '/setup/users',
    alwaysShow: true, // will always show the root menu
    name: 'Setup',
    meta: {
      title: 'setup',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/setup/user'),
        name: 'user',
        meta: {
          title: 'user',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
 
    ]
  },

  {
    path: '/error',
    component: 'layout/Layout',
    redirect: 'noRedirect',
    name: 'ErrorPages',
    meta: {
      title: 'errorPages',
      icon: '404'
    },
    children: [
      {
        path: '401',
        component: 'views/error-page/401',
        name: 'Page401',
        meta: { title: 'page401', noCache: true }
      },
      {
        path: '404',
        component: 'views/error-page/404',
        name: 'Page404',
        meta: { title: 'page404', noCache: true }
      }
    ]
  },

  {
    path: '/error-log',
    component: 'layout/Layout',
    redirect: 'noRedirect',
    children: [
      {
        path: 'log',
        component: 'views/error-log/index',
        name: 'ErrorLog',
        meta: { title: 'errorLog', icon: 'bug' }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]
