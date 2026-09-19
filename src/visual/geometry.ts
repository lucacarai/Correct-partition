import { fixedPointById, type FixedElementId } from '../math/fixedPoset'

export const DIAGRAM_WIDTH = 760
export const DIAGRAM_HEIGHT = 1020

export interface DiagramPoint {
  readonly x: number
  readonly y: number
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
