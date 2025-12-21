import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/store/modules/user'

vi.mock('@/api/user', () => ({
  login: vi.fn(async () => ({ data: { token: 'token-123' } })),
  logout: vi.fn(async () => ({})),
  getInfo: vi.fn(async () => ({
    data: {
      routes: ['a'],
      roles: ['admin'],
      id: 1,
      name: 'tester',
      phone: '123',
      callsign: 'BG4QG',
      status: 1,
      package_type: 2,
      avatar: 'avatar.png',
      introduction: 'hi'
    }
  }))
}))

vi.mock('@/utils/auth', () => ({
  getToken: vi.fn(() => 'init-token'),
  setToken: vi.fn(),
  removeToken: vi.fn()
}))

vi.mock('@/router', () => ({
  resetRouter: vi.fn()
}))

const { login, logout, getInfo } = await import('@/api/user')
const { setToken, removeToken } = await import('@/utils/auth')
const { resetRouter } = await import('@/router')

describe('store/user', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('login sets token and persists it', async () => {
    const store = useUserStore()
    await store.login({ username: ' admin ', password: 'pw' })
    expect(login).toHaveBeenCalledWith({ username: 'admin', password: 'pw' })
    expect(store.token).toBe('token-123')
    expect(setToken).toHaveBeenCalledWith('token-123')
  })

  it('getInfo populates user state', async () => {
    const store = useUserStore()
    const data = await store.getInfo()
    expect(getInfo).toHaveBeenCalled()
    expect(store.roles).toEqual(['admin'])
    expect(store.name).toBe('tester')
    expect(data.roles).toEqual(['admin'])
  })

  it('getInfo throws when roles missing', async () => {
    getInfo.mockResolvedValueOnce({ data: { roles: [] } })
    const store = useUserStore()
    await expect(store.getInfo()).rejects.toThrow('getInfo: roles must be a non-null array!')
  })

  it('logout clears state and resets router', async () => {
    const store = useUserStore()
    store.token = 'token-123'
    store.roles = ['admin']
    await store.logout()
    expect(logout).toHaveBeenCalledWith('token-123')
    expect(store.token).toBe('')
    expect(store.roles).toEqual([])
    expect(removeToken).toHaveBeenCalled()
    expect(resetRouter).toHaveBeenCalled()
  })

  it('changeRoles updates token and returns roles', async () => {
    const store = useUserStore()
    const roles = await store.changeRoles('admin')
    expect(setToken).toHaveBeenCalledWith('admin-token')
    expect(roles).toEqual(['admin'])
    expect(resetRouter).toHaveBeenCalled()
  })
})
