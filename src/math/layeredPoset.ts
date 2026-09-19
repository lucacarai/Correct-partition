import { createFinitePoset, type CoverRelation } from './finitePoset'

export type PosetColumn = 0 | 1 | 2
export type PosetElementId = `r${number}c${PosetColumn}`

export interface PosetPoint {
  readonly id: PosetElementId
  readonly row: number
  readonly column: PosetColumn
}

export interface LayeredPoset {
  readonly layerCount: number
  readonly middleLayers: ReadonlySet<number>
  readonly points: readonly PosetPoint[]
  readonly elementIds: readonly PosetElementId[]
  readonly covers: readonly CoverRelation<PosetElementId>[]
  readonly pointById: ReadonlyMap<PosetElementId, PosetPoint>
  readonly poset: ReturnType<typeof createFinitePoset<PosetElementId>>
}

export const DEFAULT_LAYER_COUNT = 9
export const MAX_LAYER_COUNT = 30
export const DEFAULT_MIDDLE_LAYERS: ReadonlySet<number> = new Set([
  0, 1, 4, 6, 8,
])

function pointId(row: number, column: PosetColumn): PosetElementId {
  return `r${row}c${column}`
}

function isBelow(lower: PosetPoint, upper: PosetPoint): boolean {
  const layerDistance = lower.row - upper.row
  const isNonTopAdjacentMiddlePair =
    lower.column === 1 &&
    upper.column === 1 &&
    layerDistance === 1 &&
    upper.row > 0
  return (
    layerDistance >= 0 &&
    !isNonTopAdjacentMiddlePair &&
    Math.abs(lower.column - upper.column) <= layerDistance
  )
}

export function createLayeredPoset(
  layerCount: number,
  selectedMiddleLayers: Iterable<number>,
): LayeredPoset {
  if (
    !Number.isSafeInteger(layerCount) ||
    layerCount < 2 ||
    layerCount > MAX_LAYER_COUNT
  ) {
    throw new Error(
      `A layered poset must have between 2 and ${MAX_LAYER_COUNT} layers`,
    )
  }

  const middleLayers = new Set([0, 1, ...selectedMiddleLayers])
  for (const layer of middleLayers) {
    if (!Number.isSafeInteger(layer) || layer < 0 || layer >= layerCount) {
      throw new Error(`Middle-point layer ${layer} is outside the poset`)
    }
  }

  const points: PosetPoint[] = []
  for (let row = 0; row < layerCount; row += 1) {
    const columns: readonly PosetColumn[] =
      row === 0 ? [1] : middleLayers.has(row) ? [0, 1, 2] : [0, 2]
    for (const column of columns) {
      points.push({ id: pointId(row, column), row, column })
    }
  }

  const covers: CoverRelation<PosetElementId>[] = []
  for (const lower of points) {
    for (const upper of points) {
      if (
        lower.id === upper.id ||
        lower.row <= upper.row ||
        !isBelow(lower, upper)
      ) {
        continue
      }

      const hasIntermediate = points.some(
        (candidate) =>
          candidate.id !== lower.id &&
          candidate.id !== upper.id &&
          isBelow(lower, candidate) &&
          isBelow(candidate, upper),
      )
      if (!hasIntermediate) {
        covers.push([lower.id, upper.id])
      }
    }
  }

  const elementIds = points.map(({ id }) => id)
  return {
    layerCount,
    middleLayers,
    points,
    elementIds,
    covers,
    pointById: new Map(points.map((point) => [point.id, point] as const)),
    poset: createFinitePoset(elementIds, covers),
  }
}

export function createDefaultLayeredPoset(): LayeredPoset {
  return createLayeredPoset(DEFAULT_LAYER_COUNT, DEFAULT_MIDDLE_LAYERS)
}
