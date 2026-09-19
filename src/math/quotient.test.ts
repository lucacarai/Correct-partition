import { describe, expect, it } from 'vitest'
import { createFinitePoset } from './finitePoset'
import { createPartition, identityPartition } from './partition'
import { createQuotientOrder } from './quotient'

describe('quotient order', () => {
  it('uses the order inherited by correct equivalence classes', () => {
    const vee = createFinitePoset(
      ['left', 'right', 'top'] as const,
      [
        ['left', 'top'],
        ['right', 'top'],
      ] as const,
    )
    const partition = createPartition(vee, [['left', 'right'], ['top']])
    const quotient = createQuotientOrder(vee, partition)
    const lower = partition.blockByElement.get('left')!.key
    const upper = partition.blockByElement.get('top')!.key

    expect(quotient.strictlyLessThan(lower, upper)).toBe(true)
    expect(quotient.strictlyLessThan(upper, lower)).toBe(false)
    expect(quotient.strictUpperKeys(lower)).toEqual([upper])
  })

  it('distinguishes a least strict upper class from several minimal ones', () => {
    const diamond = createFinitePoset(
      ['bottom', 'left', 'right', 'top'] as const,
      [
        ['bottom', 'left'],
        ['bottom', 'right'],
        ['left', 'top'],
        ['right', 'top'],
      ] as const,
    )
    const partition = identityPartition(diamond)
    const quotient = createQuotientOrder(diamond, partition)
    const key = (element: (typeof diamond.elements)[number]) =>
      partition.blockByElement.get(element)!.key

    expect(quotient.isLeastStrictUpper(key('bottom'), key('left'))).toBe(false)
    expect(quotient.isLeastStrictUpper(key('bottom'), key('right'))).toBe(false)
    expect(quotient.isLeastStrictUpper(key('bottom'), key('top'))).toBe(false)
    expect(quotient.isLeastStrictUpper(key('left'), key('top'))).toBe(true)
  })
})
