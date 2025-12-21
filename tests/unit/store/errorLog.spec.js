import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useErrorLogStore } from '@/store/modules/errorLog'

describe('store/errorLog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds error log entries', () => {
    const store = useErrorLogStore()
    store.addErrorLog({ message: 'oops' })
    expect(store.logs.length).toBe(1)
    expect(store.logs[0].message).toBe('oops')
  })
})
