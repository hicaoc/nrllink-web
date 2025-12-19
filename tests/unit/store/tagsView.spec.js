import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTagsViewStore } from '@/store/modules/tagsView'

describe('store/tagsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds visited and cached views', () => {
    const store = useTagsViewStore()
    store.addView({ path: '/a', name: 'A', meta: { title: 'A' } })
    expect(store.visitedViews.length).toBe(1)
    expect(store.cachedViews).toEqual(['A'])
  })

  it('skips caching when noCache is true', () => {
    const store = useTagsViewStore()
    store.addView({ path: '/b', name: 'B', meta: { title: 'B', noCache: true } })
    expect(store.cachedViews).toEqual([])
  })

  it('deletes views', () => {
    const store = useTagsViewStore()
    const view = { path: '/a', name: 'A', meta: { title: 'A' } }
    store.addView(view)
    store.delView(view)
    expect(store.visitedViews.length).toBe(0)
    expect(store.cachedViews.length).toBe(0)
  })
})
