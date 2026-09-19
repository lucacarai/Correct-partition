import type { PosetPoint } from '../math/layeredPoset'

export const DIAGRAM_WIDTH = 760
export const PARTITION_BUBBLE_PADDING = 34
const DIAGRAM_TOP = 84
const DIAGRAM_ROW_GAP = 106

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

export function diagramHeight(layerCount: number): number {
  return DIAGRAM_TOP * 2 + (layerCount - 1) * DIAGRAM_ROW_GAP
}

export function diagramPoint(point: PosetPoint): DiagramPoint {
  return {
    x: 140 + point.column * 240,
    y: DIAGRAM_TOP + point.row * DIAGRAM_ROW_GAP,
  }
}

export function partitionContours(
  groups: readonly (readonly DiagramPoint[])[],
): readonly (readonly DiagramPoint[])[] {
  return groups.map((points) =>
    paddedConvexHull(points, PARTITION_BUBBLE_PADDING, 48),
  )
}
