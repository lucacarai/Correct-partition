import { createDefaultLayeredPoset, type PosetElementId } from './layeredPoset'

const defaultModel = createDefaultLayeredPoset()

export type FixedElementId = PosetElementId
export const fixedPoints = defaultModel.points
export const fixedElementIds = defaultModel.elementIds
export const fixedCovers = defaultModel.covers
export const fixedPoset = defaultModel.poset
export const fixedPointById = defaultModel.pointById
