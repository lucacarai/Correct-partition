import { describe, expect, it } from 'vitest'
import {
  affectedElementsForToggle,
  clearHue,
  colorMaskOf,
  colorOf,
  createColoringFromMinimalElements,
  createEmptyColoring,
  createThreeColoring,
  haveSameColor,
  isUpset,
  minimalHueElements,
  toggleHueAtElement,
} from './coloring'
import { fixedPoset } from './fixedPoset'

describe('three-hue coloring', () => {
  it('allows empty and coincident hue-upsets', () => {
    const coloring = createColoringFromMinimalElements(fixedPoset, {
      1: [],
      2: ['r2c0'],
      3: ['r2c0'],
    })

    expect(coloring[1]).toEqual(new Set())
    expect(coloring[2]).toEqual(coloring[3])
  })

  it('adds the full principal upset when an excluded point is clicked', () => {
    const coloring = toggleHueAtElement(
      fixedPoset,
      createEmptyColoring(),
      1,
      'r2c0',
    )

    expect(coloring[1]).toEqual(new Set(['r2c0', 'r1c0', 'r1c1', 'r0c1']))
    expect(minimalHueElements(fixedPoset, coloring, 1)).toEqual(
      new Set(['r2c0']),
    )
  })

  it('removes the downset portion when an included point is clicked', () => {
    const initial = createColoringFromMinimalElements(fixedPoset, {
      1: ['r2c0'],
      2: [],
      3: [],
    })
    const edited = toggleHueAtElement(fixedPoset, initial, 1, 'r1c0')

    expect(edited[1]).toEqual(new Set(['r1c1', 'r0c1']))
    expect(minimalHueElements(fixedPoset, edited, 1)).toEqual(new Set(['r1c1']))
    expect(isUpset(fixedPoset, edited[1])).toBe(true)
  })

  it('encodes all active hues as a color set and bit mask', () => {
    const coloring = createColoringFromMinimalElements(fixedPoset, {
      1: ['r2c0'],
      2: ['r1c0'],
      3: [],
    })

    expect(colorOf(coloring, 'r2c0')).toEqual([1])
    expect(colorOf(coloring, 'r1c0')).toEqual([1, 2])
    expect(colorMaskOf(coloring, 'r1c0')).toBe(0b011)
    expect(haveSameColor(coloring, 'r1c0', 'r0c1')).toBe(true)
    expect(haveSameColor(coloring, 'r2c0', 'r1c0')).toBe(false)
  })

  it('rejects a hue-set that is not upward closed', () => {
    expect(() =>
      createThreeColoring(fixedPoset, {
        1: ['r2c0'],
        2: [],
        3: [],
      }),
    ).toThrow(/does not define an upset/)
  })

  it('reports the exact closure-aware preview and clears only one hue', () => {
    const coloring = createColoringFromMinimalElements(fixedPoset, {
      1: ['r2c0'],
      2: ['r2c0'],
      3: [],
    })

    expect(affectedElementsForToggle(fixedPoset, coloring, 1, 'r1c0')).toEqual(
      new Set(['r1c0', 'r2c0']),
    )
    expect(clearHue(fixedPoset, coloring, 1)[1]).toEqual(new Set())
    expect(clearHue(fixedPoset, coloring, 1)[2]).toEqual(coloring[2])
  })
})
