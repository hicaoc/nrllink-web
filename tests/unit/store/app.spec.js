import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(() => undefined),
    set: vi.fn()
  }
}))

vi.mock('@/lang/index', () => ({
  getLanguage: vi.fn(() => 'zh-cn')
}))

import Cookies from 'js-cookie'
import { useAppStore } from '@/store/modules/app'

describe('store/app', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('toggles sidebar and persists status', () => {
    const store = useAppStore()
    const initial = store.sidebar.opened
    store.toggleSideBar()
    expect(store.sidebar.opened).toBe(!initial)
    expect(Cookies.set).toHaveBeenCalled()
  })

  it('sets language and size', () => {
    const store = useAppStore()
    store.setLanguage('en')
    store.setSize('small')
    expect(store.language).toBe('en')
    expect(store.size).toBe('small')
    expect(Cookies.set).toHaveBeenCalledWith('language', 'en')
    expect(Cookies.set).toHaveBeenCalledWith('size', 'small')
  })
})
