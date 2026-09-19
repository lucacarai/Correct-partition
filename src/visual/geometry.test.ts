import { describe, expect, it } from 'vitest'
import { convexHull, paddedConvexHull, partitionContours } from './geometry'

describe('diagram geometry', () => {
  it('builds one complete padded contour for each class', () => {
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
})
