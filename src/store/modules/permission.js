import { defineStore } from 'pinia'
import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some((role) => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Use meta.requiresBilling to hide billing-related routes when the
 * server has not enabled the paid renew feature.
 * @param billingEnabled
 * @param route
 */
function billingAllowed(billingEnabled, route) {
  if (route.meta && route.meta.requiresBilling) {
    return !!billingEnabled
  }
  return true
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles  array of roles, or null to skip the role check (admin)
 * @param billingEnabled
 */
export function filterAsyncRoutes(routes, roles, billingEnabled) {
  const res = []

  routes.forEach((route) => {
    const tmp = { ...route }
    const rolePassed = roles === null || hasPermission(roles, tmp)
    if (rolePassed && billingAllowed(billingEnabled, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles, billingEnabled)
      }
      res.push(tmp)
    }
  })

  return res
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
  }),
  actions: {
    generateRoutes(roles, billingEnabled = false) {
      const roleFilter = roles.includes('admin') ? null : roles
      const accessedRoutes = filterAsyncRoutes(asyncRoutes || [], roleFilter, billingEnabled)
      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)
      return accessedRoutes
    },
  },
})
