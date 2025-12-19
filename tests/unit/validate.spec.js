import { describe, expect, it } from 'vitest'
import {
  isExternal,
  validURL,
  validLowerCase,
  validUpperCase,
  validAlphabets,
  validEmail,
  isString,
  isArray
} from '@/utils/validate'

describe('utils/validate', () => {
  it('detects external urls', () => {
    expect(isExternal('http://example.com')).toBe(true)
    expect(isExternal('https://example.com')).toBe(true)
    expect(isExternal('mailto:test@example.com')).toBe(true)
    expect(isExternal('tel:123')).toBe(true)
    expect(isExternal('/local/path')).toBe(false)
  })

  it('validates urls', () => {
    expect(validURL('https://example.com')).toBe(true)
    expect(validURL('ftp://example.com')).toBe(true)
    expect(validURL('not-a-url')).toBe(false)
  })

  it('validates case and alphabet', () => {
    expect(validLowerCase('abc')).toBe(true)
    expect(validLowerCase('Abc')).toBe(false)
    expect(validUpperCase('ABC')).toBe(true)
    expect(validUpperCase('AbC')).toBe(false)
    expect(validAlphabets('Abc')).toBe(true)
    expect(validAlphabets('123')).toBe(false)
  })

  it('validates email', () => {
    expect(validEmail('test@example.com')).toBe(true)
    expect(validEmail('bad@@example.com')).toBe(false)
  })

  it('checks string and array helpers', () => {
    expect(isString('abc')).toBe(true)
    expect(isString(123)).toBe(false)
    expect(isArray([1, 2])).toBe(true)
    expect(isArray('nope')).toBe(false)
  })
})
