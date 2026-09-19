import { fixedPointById, type FixedElementId } from '../math/fixedPoset'

export const DIAGRAM_WIDTH = 760
export const DIAGRAM_HEIGHT = 1020
export const PARTITION_BUBBLE_PADDING = 34
export const PARTITION_BUBBLE_GAP = 12

export interface DiagramPoint {
  readonly x: number
  readonly y: number
}

export interface DiagramBounds {
  readonly minX: number
  readonly minY: number
  readonly maxX: number
  readonly maxY: number
}

function cross(
  origin: DiagramPoint,
  first: DiagramPoint,
  second: DiagramPoint,
): number {
  return (
    (first.x - origin.x) * (second.y - origin.y) -
    (first.y - origin.y) * (second.x - origin.x)
  )
}

export function convexHull(
  points: readonly DiagramPoint[],
): readonly DiagramPoint[] {
  const sorted = [...points].sort(
    (left, right) => left.x - right.x || left.y - right.y,
  )

  if (sorted.length <= 2) return sorted

  const lower: DiagramPoint[] = []
  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower.at(-2)!, lower.at(-1)!, point) <= 0
    ) {
      lower.pop()
    }
    lower.push(point)
  }

  const upper: DiagramPoint[] = []
  for (const point of sorted.reverse()) {
    while (
      upper.length >= 2 &&
      cross(upper.at(-2)!, upper.at(-1)!, point) <= 0
    ) {
      upper.pop()
    }
    upper.push(point)
  }

  lower.pop()
  upper.pop()
  return [...lower, ...upper]
}

export function paddedConvexHull(
  points: readonly DiagramPoint[],
  padding: number,
  samplesPerPoint = 24,
): readonly DiagramPoint[] {
  return convexHull(
    points.flatMap((point) =>
      Array.from({ length: samplesPerPoint }, (_, index) => {
        const angle = (index / samplesPerPoint) * Math.PI * 2
        return {
          x: point.x + Math.cos(angle) * padding,
          y: point.y + Math.sin(angle) * padding,
        }
      }),
    ),
  )
}

function clipToHalfPlane(
  polygon: readonly DiagramPoint[],
  normal: DiagramPoint,
  limit: number,
): readonly DiagramPoint[] {
  if (polygon.length === 0) return polygon
  const clipped: DiagramPoint[] = []
  const signedDistance = (point: DiagramPoint) =>
    point.x * normal.x + point.y * normal.y - limit

  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index]!
    const previous = polygon[(index + polygon.length - 1) % polygon.length]!
    const currentDistance = signedDistance(current)
    const previousDistance = signedDistance(previous)
    const currentInside = currentDistance <= 0
    const previousInside = previousDistance <= 0

    if (currentInside !== previousInside) {
      const amount = previousDistance / (previousDistance - currentDistance)
      clipped.push({
        x: previous.x + (current.x - previous.x) * amount,
        y: previous.y + (current.y - previous.y) * amount,
      })
    }
    if (currentInside) clipped.push(current)
  }

  return clipped
}

export function insetDominanceCell(
  site: DiagramPoint,
  competitors: readonly DiagramPoint[],
  bounds: DiagramBounds,
  gap: number,
): readonly DiagramPoint[] {
  if (gap < 0) throw new Error(`Dominance-cell gap cannot be negative`)

  let cell: readonly DiagramPoint[] = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY },
  ]

  for (const competitor of competitors) {
    const deltaX = competitor.x - site.x
    const deltaY = competitor.y - site.y
    const distance = Math.hypot(deltaX, deltaY)
    if (distance === 0) {
      throw new Error(`Dominance-cell sites must have distinct coordinates`)
    }
    const normal = { x: deltaX / distance, y: deltaY / distance }
    const bisector =
      (competitor.x ** 2 + competitor.y ** 2 - site.x ** 2 - site.y ** 2) /
      (2 * distance)
    cell = clipToHalfPlane(cell, normal, bisector - gap / 2)
  }

  return cell
}

export function diagramPoint(id: FixedElementId): DiagramPoint {
  const point = fixedPointById.get(id)
  if (!point) {
    throw new Error(`Unknown fixed point ${id}`)
  }

  return {
    x: 140 + point.column * 240,
    y: 84 + point.row * 106,
  }
}

// Separate whole classes only. Cutting by individual sites can disconnect a class.
export function partitionContours(
  groups: readonly (readonly DiagramPoint[])[],
): readonly (readonly DiagramPoint[])[] {
  const contours = groups.map((points) =>
    paddedConvexHull(points, PARTITION_BUBBLE_PADDING, 48),
  )
  for (let a = 0; a < groups.length; a += 1) {
    for (let b = a + 1; b < groups.length; b += 1) {
      const axes: DiagramPoint[] = []
      for (const points of [groups[a]!, groups[b]!]) {
        const hull = convexHull(points)
        for (let i = 0; i < hull.length; i += 1) {
          const p = hull[i]!
          const q = hull[(i + 1) % hull.length]!
          axes.push({ x: q.y - p.y, y: p.x - q.x })
        }
      }
      for (const p of groups[a]!)
        for (const q of groups[b]!) axes.push({ x: q.x - p.x, y: q.y - p.y })
      let best:
        { normal: DiagramPoint; lower: number; upper: number } | undefined
      let bestGap = 0
      for (const axis of axes) {
        const length = Math.hypot(axis.x, axis.y)
        if (length < 1e-8) continue
        for (const sign of [1, -1]) {
          const normal = {
            x: (sign * axis.x) / length,
            y: (sign * axis.y) / length,
          }
          const project = (p: DiagramPoint) => p.x * normal.x + p.y * normal.y
          const lower = Math.max(...groups[a]!.map(project))
          const upper = Math.min(...groups[b]!.map(project))
          if (upper - lower > bestGap) {
            bestGap = upper - lower
            best = { normal, lower, upper }
          }
        }
      }
      // Keep room around every point marker. When whole-class separation is
      // impossible, retain the complete contours and allow their overlap.
      if (!best || bestGap < 36 + PARTITION_BUBBLE_GAP) continue
      const middle = (best.lower + best.upper) / 2
      contours[a] = clipToHalfPlane(
        contours[a]!,
        best.normal,
        middle - PARTITION_BUBBLE_GAP / 2,
      )
      contours[b] = clipToHalfPlane(
        contours[b]!,
        { x: -best.normal.x, y: -best.normal.y },
        -middle - PARTITION_BUBBLE_GAP / 2,
      )
    }
  }
  return contours
}
