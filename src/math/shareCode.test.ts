import { describe, expect, it } from 'vitest'
import { createColoringFromMinimalElements } from './coloring'
import { createLayeredPoset, type PosetElementId } from './layeredPoset'
import { decodeWorkspace, encodeWorkspace } from './shareCode'

describe('workspace share codes', () => {
  it('round-trips the poset and complete coloring deterministically', () => {
    const model = createLayeredPoset(6, [2, 5])
    const coloring = createColoringFromMinimalElements<PosetElementId>(
      model.poset,
      {
        1: ['r5c0'],
        2: ['r3c2'],
        3: ['r2c1', 'r4c2'],
      },
    )

    const code = encodeWorkspace(model, coloring)
    const decoded = decodeWorkspace(code)

    expect(code).toMatch(/^CP1\.[A-Za-z0-9_-]+$/u)
    expect(decoded.model.layerCount).toBe(6)
    expect(decoded.model.middleLayers).toEqual(new Set([0, 1, 2, 5]))
    expect(decoded.coloring).toEqual(coloring)
    expect(encodeWorkspace(decoded.model, decoded.coloring)).toBe(code)
  })

  it('rejects unsupported and damaged codes', () => {
    expect(() => decodeWorkspace('not-a-code')).toThrow(/not a supported/i)
    expect(() => decodeWorkspace('CP1.%%%')).toThrow(/invalid characters/i)
    expect(() => decodeWorkspace('CP1.e30')).toThrow(/invalid structure/i)
  })
})
