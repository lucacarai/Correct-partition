import { describe, expect, it } from 'vitest'
import {
  createColoringFromMinimalElements,
  createEmptyColoring,
} from './coloring'
import { createFinitePoset } from './finitePoset'
import {
  createPartition,
  identityPartition,
  isColorPreserving,
  isCorrectPartition,
  mergeBlocks,
  reachableBlockKeys,
} from './partition'

describe('partitions', () => {
  const vee = createFinitePoset(
    ['a', 'b', 'top'] as const,
    [
      ['a', 'top'],
      ['b', 'top'],
    ] as const,
  )

  it('constructs identity and merged equivalence classes', () => {
    const identity = identityPartition(vee)
    const merged = mergeBlocks(
      vee,
      identity,
      identity.blockByElement.get('a')!.key,
      identity.blockByElement.get('b')!.key,
    )

    expect(identity.blocks).toHaveLength(3)
    expect(merged.blocks).toHaveLength(2)
    expect(merged.blockByElement.get('a')).toBe(merged.blockByElement.get('b'))
  })

  it('recognizes correct and incorrect partitions by upper block reachability', () => {
    const correct = createPartition(vee, [['a', 'b'], ['top']])
    expect(isCorrectPartition(vee, correct)).toBe(true)
    expect(reachableBlockKeys(vee, correct, 'a')).toEqual(
      reachableBlockKeys(vee, correct, 'b'),
    )

    const chainAndIsolate = createFinitePoset(
      ['lower', 'upper', 'isolated'] as const,
      [['lower', 'upper']] as const,
    )
    const incorrect = createPartition(chainAndIsolate, [
      ['lower', 'isolated'],
      ['upper'],
    ])
    expect(isCorrectPartition(chainAndIsolate, incorrect)).toBe(false)
  })

  it('checks that every block has one color', () => {
    const coloring = createColoringFromMinimalElements(vee, {
      1: ['top'],
      2: [],
      3: [],
    })

    expect(isColorPreserving(identityPartition(vee), coloring)).toBe(true)
    expect(
      isColorPreserving(createPartition(vee, [['a', 'top'], ['b']]), coloring),
    ).toBe(false)
    expect(
      isColorPreserving(
        createPartition(vee, [['a', 'b', 'top']]),
        createEmptyColoring(),
      ),
    ).toBe(true)
  })
})
