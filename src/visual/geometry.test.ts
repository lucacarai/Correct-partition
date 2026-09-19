import { describe, expect, it } from 'vitest'
import {
  convexHull,
  insetDominanceCell,
  paddedConvexHull,
  partitionContours,
} from './geometry'

describe('diagram geometry', () => {
  it('separates nearby whole classes without excluding their points', () => {
    const contours = partitionContours([
      [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
      ],
      [
        { x: 60, y: 0 },
        { x: 60, y: 100 },
      ],
    ])
    expect(Math.max(...contours[0]!.map((p) => p.x))).toBeCloseTo(24)
    expect(Math.min(...contours[1]!.map((p) => p.x))).toBeCloseTo(36)
    for (const contour of contours) expect(contour.length).toBeGreaterThan(3)
  })

  it('keeps crossing classes as complete polygons instead of splitting them', () => {
    const groups = [
      [
        { x: -100, y: 0 },
        { x: 100, y: 0 },
      ],
      [
        { x: 0, y: -100 },
        { x: 0, y: 100 },
      ],
    ]
    const contours = partitionContours(groups)
    expect(contours).toEqual(
      groups.map((points) => paddedConvexHull(points, 34, 48)),
    )
  })
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

  it('builds a padded contour that visibly joins several points', () => {
    const contour = paddedConvexHull(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      2,
      4,
    )
    expect(Math.min(...contour.map(({ x }) => x))).toBe(-2)
    expect(Math.max(...contour.map(({ x }) => x))).toBe(12)
  })

  it('leaves the requested gap between competing dominance cells', () => {
    const bounds = { minX: -20, minY: -20, maxX: 30, maxY: 20 }
    const left = insetDominanceCell(
      { x: 0, y: 0 },
      [{ x: 10, y: 0 }],
      bounds,
      2,
    )
    const right = insetDominanceCell(
      { x: 10, y: 0 },
      [{ x: 0, y: 0 }],
      bounds,
      2,
    )

    expect(Math.max(...left.map(({ x }) => x))).toBeCloseTo(4)
    expect(Math.min(...right.map(({ x }) => x))).toBeCloseTo(6)
  })
})
