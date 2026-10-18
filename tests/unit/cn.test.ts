import { describe, it, expect } from 'vitest'
import { cn } from '../../src/utils/cn'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('a', false, 'c')).toBe('a c')
    expect(cn(null, undefined, 'd')).toBe('d')
  })
})
