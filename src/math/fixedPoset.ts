import { createFinitePoset, type CoverRelation } from './finitePoset'

export const fixedPoints = [
  { id: 'r0c1', row: 0, column: 1 },
  { id: 'r1c0', row: 1, column: 0 },
  { id: 'r1c1', row: 1, column: 1 },
  { id: 'r1c2', row: 1, column: 2 },
  { id: 'r2c0', row: 2, column: 0 },
  { id: 'r2c2', row: 2, column: 2 },
  { id: 'r3c0', row: 3, column: 0 },
  { id: 'r3c2', row: 3, column: 2 },
  { id: 'r4c0', row: 4, column: 0 },
  { id: 'r4c1', row: 4, column: 1 },
  { id: 'r4c2', row: 4, column: 2 },
  { id: 'r5c0', row: 5, column: 0 },
  { id: 'r5c2', row: 5, column: 2 },
  { id: 'r6c0', row: 6, column: 0 },
  { id: 'r6c1', row: 6, column: 1 },
  { id: 'r6c2', row: 6, column: 2 },
  { id: 'r7c0', row: 7, column: 0 },
  { id: 'r7c2', row: 7, column: 2 },
  { id: 'r8c0', row: 8, column: 0 },
  { id: 'r8c1', row: 8, column: 1 },
  { id: 'r8c2', row: 8, column: 2 },
] as const

export type FixedElementId = (typeof fixedPoints)[number]['id']

export const fixedElementIds = fixedPoints.map(
  ({ id }) => id,
) as readonly FixedElementId[]

export const fixedCovers = [
  ['r1c0', 'r0c1'],
  ['r1c1', 'r0c1'],
  ['r1c2', 'r0c1'],
  ['r2c0', 'r1c0'],
  ['r2c0', 'r1c1'],
  ['r2c2', 'r1c1'],
  ['r2c2', 'r1c2'],
  ['r3c0', 'r2c0'],
  ['r3c0', 'r1c2'],
  ['r3c2', 'r2c2'],
  ['r3c2', 'r1c0'],
  ['r4c0', 'r3c0'],
  ['r4c0', 'r2c2'],
  ['r4c1', 'r3c0'],
  ['r4c1', 'r3c2'],
  ['r4c2', 'r3c2'],
  ['r4c2', 'r2c0'],
  ['r5c0', 'r4c0'],
  ['r5c0', 'r4c1'],
  ['r5c2', 'r4c1'],
  ['r5c2', 'r4c2'],
  ['r6c0', 'r5c0'],
  ['r6c0', 'r4c2'],
  ['r6c1', 'r5c0'],
  ['r6c1', 'r5c2'],
  ['r6c2', 'r5c2'],
  ['r6c2', 'r4c0'],
  ['r7c0', 'r6c0'],
  ['r7c0', 'r6c1'],
  ['r7c2', 'r6c1'],
  ['r7c2', 'r6c2'],
  ['r8c0', 'r7c0'],
  ['r8c0', 'r6c2'],
  ['r8c1', 'r7c0'],
  ['r8c1', 'r7c2'],
  ['r8c2', 'r7c2'],
  ['r8c2', 'r6c0'],
] as const satisfies readonly CoverRelation<FixedElementId>[]

export const fixedPoset = createFinitePoset(fixedElementIds, fixedCovers)

export const fixedPointById = new Map(
  fixedPoints.map((point) => [point.id, point] as const),
)
