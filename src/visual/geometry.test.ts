import { describe, expect, it } from 'vitest'
import { convexHull } from './geometry'

describe('diagram geometry', () => {
  it('wraps a point cloud without retaining interior points', () => {
    expect(
      convexHull([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
        { x: 1, y: 1 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ])
  })

  it('keeps one- and two-point regions unchanged', () => {
    expect(convexHull([{ x: 1, y: 1 }])).toEqual([{ x: 1, y: 1 }])
    expect(
      convexHull([
        { x: 2, y: 2 },
        { x: 0, y: 0 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 2 },
    ])
  })
})
