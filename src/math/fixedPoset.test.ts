import { describe, expect, it } from 'vitest'
import {
  fixedCovers,
  fixedElementIds,
  fixedPoints,
  fixedPoset,
} from './fixedPoset'

describe('fixedPoset', () => {
  it('matches the confirmed TikZ diagram data', () => {
    expect(fixedElementIds).toHaveLength(21)
    expect(fixedCovers).toHaveLength(37)
    expect(new Set(fixedElementIds)).toHaveLength(21)
    expect(
      new Set(fixedPoints.map(({ row, column }) => `${row}:${column}`)),
    ).toHaveLength(21)
  })

  it('places every point underneath the unique top point', () => {
    for (const element of fixedElementIds) {
      expect(fixedPoset.lessThanOrEqual(element, 'r0c1')).toBe(true)
    }
  })

  it('computes closures across short and long diagram arrows', () => {
    expect(fixedPoset.upwardClosure(['r2c0'])).toEqual(
      new Set(['r2c0', 'r1c0', 'r1c1', 'r0c1']),
    )
    expect(fixedPoset.upwardClosure(['r3c0'])).toEqual(
      new Set(['r3c0', 'r2c0', 'r1c2', 'r1c0', 'r1c1', 'r0c1']),
    )
    expect(fixedPoset.downwardClosure(['r0c1'])).toEqual(
      new Set(fixedElementIds),
    )
  })

  it('keeps incomparable generators as the minima of their union upset', () => {
    const upset = fixedPoset.upwardClosure(['r2c0', 'r2c2'])
    expect(fixedPoset.minimalElements(upset)).toEqual(new Set(['r2c0', 'r2c2']))
  })
})
