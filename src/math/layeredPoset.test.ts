import { describe, expect, it } from 'vitest'
import {
  createDefaultLayeredPoset,
  createLayeredPoset,
  createRandomLayeredPosetShape,
} from './layeredPoset'

describe('layered poset family', () => {
  it('reproduces the original poset as its default', () => {
    const model = createDefaultLayeredPoset()

    expect(model.elementIds).toHaveLength(21)
    expect(model.covers).toHaveLength(37)
    expect(model.middleLayers).toEqual(new Set([0, 1, 4, 6, 8]))
  })

  it('keeps the first two layers mandatory and accepts optional middles', () => {
    const model = createLayeredPoset(5, [3])

    expect(model.elementIds).toEqual([
      'r0c1',
      'r1c0',
      'r1c1',
      'r1c2',
      'r2c0',
      'r2c2',
      'r3c0',
      'r3c1',
      'r3c2',
      'r4c0',
      'r4c2',
    ])
  })

  it('derives skipped-layer covers when a middle point is absent', () => {
    const model = createLayeredPoset(4, [])

    expect(model.covers).toContainEqual(['r3c0', 'r1c2'])
    expect(model.covers).toContainEqual(['r3c2', 'r1c0'])
    expect(model.poset.lessThanOrEqual('r3c0', 'r0c1')).toBe(true)
  })

  it('keeps only the two top adjacent middle points comparable', () => {
    const model = createLayeredPoset(4, [2, 3])

    expect(model.poset.strictlyLessThan('r1c1', 'r0c1')).toBe(true)
    expect(model.poset.strictlyLessThan('r2c1', 'r1c1')).toBe(false)
    expect(model.poset.strictlyLessThan('r3c1', 'r2c1')).toBe(false)
    expect(model.covers).not.toContainEqual(['r2c1', 'r1c1'])
    expect(model.covers).not.toContainEqual(['r3c1', 'r2c1'])
  })

  it('rejects layer counts outside 2 through 30 and invalid middle layers', () => {
    expect(() => createLayeredPoset(1, [])).toThrow(/between 2 and 30 layers/i)
    expect(() => createLayeredPoset(31, [])).toThrow(/between 2 and 30 layers/i)
    expect(() => createLayeredPoset(4, [4])).toThrow(/outside the poset/i)
  })

  it('makes nine layers the peak of the gradual random length distribution', () => {
    let state = 98765
    const random = () => {
      state = (state * 16807) % 2147483647
      return (state - 1) / 2147483646
    }
    const counts = new Map<number, number>()

    for (let sample = 0; sample < 30_000; sample += 1) {
      const { layerCount } = createRandomLayeredPosetShape(random)
      counts.set(layerCount, (counts.get(layerCount) ?? 0) + 1)
    }

    expect(counts.get(9)).toBeGreaterThan(counts.get(8)!)
    expect(counts.get(9)).toBeGreaterThan(counts.get(10)!)
    expect(counts.get(8)).toBeGreaterThan(counts.get(7)!)
    expect(counts.get(10)).toBeGreaterThan(counts.get(11)!)
  })

  it('selects about one third of optional middle points', () => {
    let call = 0
    const values = [0.32, 0.1, 0.5, 0.2, 0.7, 0.3]
    const shape = createRandomLayeredPosetShape(() => values[call++] ?? 0.9)

    expect(shape.layerCount).toBe(8)
    expect(shape.middleLayers).toEqual(new Set([0, 1, 2, 4, 6]))
  })
})
