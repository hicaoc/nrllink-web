import { describe, expect, it } from 'vitest'
import { setElementPlusTheme } from '@/utils/theme'

describe('utils/theme', () => {
  it('sets element-plus css variables', () => {
    setElementPlusTheme('#ff0000')
    const root = document.documentElement
    expect(root.style.getPropertyValue('--el-color-primary')).toBe('#ff0000')
    expect(root.style.getPropertyValue('--el-color-primary-dark-2')).not.toBe('')
    expect(root.style.getPropertyValue('--el-color-primary-light-3')).not.toBe('')
  })
})
