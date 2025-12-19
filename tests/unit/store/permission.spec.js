import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/router', () => ({
  constantRoutes: [{ path: '/constant' }],
  asyncRoutes: [
    { path: '/admin', meta: { roles: ['admin'] } },
    { path: '/user', meta: { roles: ['user'] } },
    { path: '/public' }
  ]
}))

import { usePermissionStore, filterAsyncRoutes } from '@/store/modules/permission'

describe('store/permission', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('filters async routes by roles', () => {
    const routes = [
      { path: '/admin', meta: { roles: ['admin'] } },
      { path: '/user', meta: { roles: ['user'] } },
      { path: '/public' }
    ]
    expect(filterAsyncRoutes(routes, ['user']).map(r => r.path)).toEqual(['/user', '/public'])
  })

  it('generateRoutes returns all routes for admin', () => {
    const store = usePermissionStore()
    const added = store.generateRoutes(['admin'])
    expect(added.length).toBe(3)
    expect(store.routes.length).toBe(4)
  })

  it('generateRoutes filters for non-admin', () => {
    const store = usePermissionStore()
    const added = store.generateRoutes(['user'])
    expect(added.map(r => r.path)).toEqual(['/user', '/public'])
    expect(store.routes.length).toBe(3)
  })
})
