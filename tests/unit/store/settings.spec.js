import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '@/store/modules/settings'

describe('store/settings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('changeSetting updates known keys', () => {
    const store = useSettingsStore()
    store.changeSetting({ key: 'theme', value: '#000000' })
    expect(store.theme).toBe('#000000')
  })

  it('changeSetting ignores unknown keys', () => {
    const store = useSettingsStore()
    store.changeSetting({ key: 'unknown', value: 'x' })
    expect(store.unknown).toBeUndefined()
  })
})
