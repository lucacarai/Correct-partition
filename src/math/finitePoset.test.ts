import { describe, expect, it } from 'vitest'
import { createFinitePoset } from './finitePoset'

describe('createFinitePoset', () => {
  it('computes reflexive and transitive order relations', () => {
    const poset = createFinitePoset(
      ['a', 'b', 'c'] as const,
      [
        ['a', 'b'],
        ['b', 'c'],
      ] as const,
    )

    expect(poset.lessThanOrEqual('a', 'a')).toBe(true)
    expect(poset.lessThanOrEqual('a', 'c')).toBe(true)
    expect(poset.lessThanOrEqual('c', 'a')).toBe(false)
    expect(poset.strictlyLessThan('a', 'a')).toBe(false)
    expect(poset.strictlyLessThan('a', 'c')).toBe(true)
  })

  it('computes upward, downward, and minimal-element sets', () => {
    const poset = createFinitePoset(
      ['a', 'b', 'c'] as const,
      [
        ['a', 'c'],
        ['b', 'c'],
      ] as const,
    )

    expect(poset.upwardClosure(['a'])).toEqual(new Set(['a', 'c']))
    expect(poset.downwardClosure(['c'])).toEqual(new Set(['a', 'b', 'c']))
    expect(poset.minimalElements(['a', 'b', 'c'])).toEqual(new Set(['a', 'b']))
  })

  it('rejects cycles and relations that are not covers', () => {
    expect(() =>
      createFinitePoset(
        ['a', 'b'] as const,
        [
          ['a', 'b'],
          ['b', 'a'],
        ] as const,
      ),
    ).toThrow(/cycle/)

    expect(() =>
      createFinitePoset(
        ['a', 'b', 'c'] as const,
        [
          ['a', 'b'],
          ['b', 'c'],
          ['a', 'c'],
        ] as const,
      ),
    ).toThrow(/transitive rather than a cover/)
  })
})
