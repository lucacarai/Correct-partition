import { describe, expect, it } from 'vitest'
import {
  createColoringFromMinimalElements,
  createEmptyColoring,
  toggleHueAtElement,
  type ThreeColoring,
} from './coloring'
import { createFinitePoset, type FinitePoset } from './finitePoset'
import { fixedElementIds, fixedPoset, type FixedElementId } from './fixedPoset'
import {
  isColorPreserving,
  isCorrectPartition,
  partitionsEqual,
} from './partition'
import { computeReductionTrace, findReductionCandidates } from './reductions'
import { computeStableRefinement } from './refinement'

function expectValidTrace<Element>(
  poset: FinitePoset<Element>,
  coloring: ThreeColoring<Element>,
): void {
  const trace = computeReductionTrace(poset, coloring)
  const refined = computeStableRefinement(poset, coloring)

  expect(trace.partitions).toHaveLength(trace.steps.length + 1)
  for (const partition of trace.partitions) {
    expect(isCorrectPartition(poset, partition)).toBe(true)
    expect(isColorPreserving(partition, coloring)).toBe(true)
  }
  for (const step of trace.steps) {
    expect(step.after.blocks).toHaveLength(step.before.blocks.length - 1)
    expect(['alpha', 'beta']).toContain(step.type)
  }
  expect(partitionsEqual(trace.finalPartition, refined)).toBe(true)
}

describe('alpha and beta reductions', () => {
  it('uses an alpha reduction for two equally colored points in a chain', () => {
    const chain = createFinitePoset(
      ['lower', 'upper'] as const,
      [['lower', 'upper']] as const,
    )
    const coloring = createEmptyColoring<(typeof chain.elements)[number]>()
    const trace = computeReductionTrace(chain, coloring)

    expect(trace.steps).toHaveLength(1)
    expect(trace.steps[0]!.type).toBe('alpha')
    expect(trace.finalPartition.blocks).toHaveLength(1)
  })

  it('uses a beta reduction for incomparable classes with equal strict uppers', () => {
    const vee = createFinitePoset(
      ['left', 'right', 'top'] as const,
      [
        ['left', 'top'],
        ['right', 'top'],
      ] as const,
    )
    const coloring = createColoringFromMinimalElements(vee, {
      1: ['top'],
      2: [],
      3: [],
    })
    const trace = computeReductionTrace(vee, coloring)

    expect(trace.steps).toHaveLength(1)
    expect(trace.steps[0]!.type).toBe('beta')
    expect(trace.finalPartition.blocks).toHaveLength(2)
  })

  it('orders alpha candidates before beta candidates', () => {
    const poset = createFinitePoset(
      ['a', 'b', 'c'] as const,
      [['a', 'c']] as const,
    )
    const coloring = createEmptyColoring<(typeof poset.elements)[number]>()
    const firstPartition = computeReductionTrace(poset, coloring).partitions[0]!
    const candidates = findReductionCandidates(poset, coloring, firstPartition)

    expect(candidates.some(({ type }) => type === 'alpha')).toBe(true)
    expect(candidates.some(({ type }) => type === 'beta')).toBe(true)
    expect(candidates[0]!.type).toBe('alpha')
  })
})

describe('fixed-poset reduction trace', () => {
  const seedChoices: readonly (readonly FixedElementId[])[] = [
    [],
    ['r0c1'],
    ['r2c0'],
    ['r2c2'],
  ]

  it('agrees with stable refinement for representative generated colorings', () => {
    for (const blue of seedChoices) {
      for (const red of seedChoices) {
        for (const yellow of seedChoices) {
          expectValidTrace(
            fixedPoset,
            createColoringFromMinimalElements(fixedPoset, {
              1: blue,
              2: red,
              3: yellow,
            }),
          )
        }
      }
    }
  })

  it('agrees for a coloring with multi-generator hue-upsets', () => {
    expectValidTrace(
      fixedPoset,
      createColoringFromMinimalElements(fixedPoset, {
        1: ['r4c0', 'r4c2'],
        2: ['r6c0', 'r6c2'],
        3: ['r8c0', 'r8c1', 'r8c2'],
      }),
    )
  })

  it('agrees across deterministic closure-edited colorings', () => {
    for (let scenario = 0; scenario < 48; scenario += 1) {
      let coloring = createEmptyColoring<FixedElementId>()
      const editCount = 3 + (scenario % 9)

      for (let edit = 0; edit < editCount; edit += 1) {
        const hue = ((scenario + edit) % 3) + 1
        const element =
          fixedElementIds[(scenario * 7 + edit * 11) % fixedElementIds.length]!
        coloring = toggleHueAtElement(
          fixedPoset,
          coloring,
          hue as 1 | 2 | 3,
          element,
        )
      }

      expectValidTrace(fixedPoset, coloring)
    }
  })

  it('terminates in at most one fewer steps than elements', () => {
    const trace = computeReductionTrace(fixedPoset, createEmptyColoring())
    expect(trace.steps.length).toBeLessThanOrEqual(fixedElementIds.length - 1)
  })
})
