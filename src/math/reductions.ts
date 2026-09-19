import { colorMaskOf, type ThreeColoring } from './coloring'
import type { FinitePoset } from './finitePoset'
import {
  identityPartition,
  isColorPreserving,
  isCorrectPartition,
  mergeBlocks,
  type BlockKey,
  type Partition,
} from './partition'
import { createQuotientOrder } from './quotient'

export type ReductionType = 'alpha' | 'beta'

export interface ReductionCandidate {
  readonly type: ReductionType
  readonly leftKey: BlockKey
  readonly rightKey: BlockKey
  readonly leftStrictUpperKeys: readonly BlockKey[]
  readonly rightStrictUpperKeys: readonly BlockKey[]
}

export interface ReductionStep<Element> extends ReductionCandidate {
  readonly before: Partition<Element>
  readonly after: Partition<Element>
  readonly mergedKey: BlockKey
}

export interface ReductionTrace<Element> {
  readonly partitions: readonly Partition<Element>[]
  readonly steps: readonly ReductionStep<Element>[]
  readonly finalPartition: Partition<Element>
}

function sameValues<Value>(
  left: readonly Value[],
  right: readonly Value[],
): boolean {
  const rightSet = new Set(right)
  return (
    left.length === right.length && left.every((value) => rightSet.has(value))
  )
}

export function findReductionCandidates<Element>(
  poset: FinitePoset<Element>,
  coloring: ThreeColoring<Element>,
  partition: Partition<Element>,
): readonly ReductionCandidate[] {
  if (!isCorrectPartition(poset, partition)) {
    throw new Error(`Alpha and beta reductions require a correct partition`)
  }
  if (!isColorPreserving(partition, coloring)) {
    throw new Error(
      `Alpha and beta reductions require a color-preserving partition`,
    )
  }

  const quotient = createQuotientOrder(poset, partition)
  const blockColor = (key: BlockKey) =>
    colorMaskOf(coloring, partition.blockByKey.get(key)!.elements[0]!)
  const alpha: ReductionCandidate[] = []
  const beta: ReductionCandidate[] = []

  for (const left of partition.blocks) {
    for (const right of partition.blocks) {
      if (
        left.key === right.key ||
        blockColor(left.key) !== blockColor(right.key)
      ) {
        continue
      }

      if (quotient.isLeastStrictUpper(left.key, right.key)) {
        alpha.push({
          type: 'alpha',
          leftKey: left.key,
          rightKey: right.key,
          leftStrictUpperKeys: quotient.strictUpperKeys(left.key),
          rightStrictUpperKeys: quotient.strictUpperKeys(right.key),
        })
      }
    }
  }

  for (let leftIndex = 0; leftIndex < partition.blocks.length; leftIndex += 1) {
    const left = partition.blocks[leftIndex]!
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < partition.blocks.length;
      rightIndex += 1
    ) {
      const right = partition.blocks[rightIndex]!
      if (blockColor(left.key) !== blockColor(right.key)) {
        continue
      }

      const leftUpper = quotient.strictUpperKeys(left.key)
      const rightUpper = quotient.strictUpperKeys(right.key)
      if (sameValues(leftUpper, rightUpper)) {
        beta.push({
          type: 'beta',
          leftKey: left.key,
          rightKey: right.key,
          leftStrictUpperKeys: leftUpper,
          rightStrictUpperKeys: rightUpper,
        })
      }
    }
  }

  return [...alpha, ...beta]
}

export function computeReductionTrace<Element>(
  poset: FinitePoset<Element>,
  coloring: ThreeColoring<Element>,
): ReductionTrace<Element> {
  let current = identityPartition(poset)
  const partitions: Partition<Element>[] = [current]
  const steps: ReductionStep<Element>[] = []

  while (true) {
    const candidate = findReductionCandidates(poset, coloring, current)[0]
    if (!candidate) {
      break
    }

    const next = mergeBlocks(
      poset,
      current,
      candidate.leftKey,
      candidate.rightKey,
    )

    if (!isCorrectPartition(poset, next)) {
      throw new Error(
        `${candidate.type} reduction did not preserve correctness`,
      )
    }
    if (!isColorPreserving(next, coloring)) {
      throw new Error(`${candidate.type} reduction did not preserve coloring`)
    }

    const mergedKey = next.blockByElement.get(
      current.blockByKey.get(candidate.leftKey)!.elements[0]!,
    )!.key
    steps.push({ ...candidate, before: current, after: next, mergedKey })
    partitions.push(next)
    current = next
  }

  return { partitions, steps, finalPartition: current }
}
