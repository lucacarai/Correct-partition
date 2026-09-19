import type { FinitePoset } from './finitePoset'
import type { BlockKey, Partition } from './partition'

export interface QuotientOrder {
  lessThanOrEqual(lower: BlockKey, upper: BlockKey): boolean
  strictlyLessThan(lower: BlockKey, upper: BlockKey): boolean
  strictUpperKeys(block: BlockKey): readonly BlockKey[]
  isLeastStrictUpper(lower: BlockKey, candidate: BlockKey): boolean
}

export function createQuotientOrder<Element>(
  poset: FinitePoset<Element>,
  partition: Partition<Element>,
): QuotientOrder {
  const relation = new Map<BlockKey, Set<BlockKey>>()

  for (const lowerBlock of partition.blocks) {
    const upperKeys = new Set<BlockKey>()
    for (const lower of lowerBlock.elements) {
      for (const upper of poset.upwardClosure([lower])) {
        upperKeys.add(partition.blockByElement.get(upper)!.key)
      }
    }
    relation.set(lowerBlock.key, upperKeys)
  }

  function assertKnown(key: BlockKey): void {
    if (!partition.blockByKey.has(key)) {
      throw new Error(`Unknown quotient block`)
    }
  }

  function lessThanOrEqual(lower: BlockKey, upper: BlockKey): boolean {
    assertKnown(lower)
    assertKnown(upper)
    return relation.get(lower)!.has(upper)
  }

  function strictlyLessThan(lower: BlockKey, upper: BlockKey): boolean {
    return lower !== upper && lessThanOrEqual(lower, upper)
  }

  function strictUpperKeys(block: BlockKey): readonly BlockKey[] {
    assertKnown(block)
    return partition.blocks
      .map(({ key }) => key)
      .filter((candidate) => strictlyLessThan(block, candidate))
  }

  function isLeastStrictUpper(lower: BlockKey, candidate: BlockKey): boolean {
    return (
      strictlyLessThan(lower, candidate) &&
      strictUpperKeys(lower).every((upper) => lessThanOrEqual(candidate, upper))
    )
  }

  return {
    lessThanOrEqual,
    strictlyLessThan,
    strictUpperKeys,
    isLeastStrictUpper,
  }
}
