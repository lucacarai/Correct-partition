import { colorMaskOf, type ThreeColoring } from './coloring'
import type { FinitePoset } from './finitePoset'

export type BlockKey = string

export interface PartitionBlock<Element> {
  readonly key: BlockKey
  readonly elements: readonly Element[]
}

export interface Partition<Element> {
  readonly blocks: readonly PartitionBlock<Element>[]
  readonly blockByElement: ReadonlyMap<Element, PartitionBlock<Element>>
  readonly blockByKey: ReadonlyMap<BlockKey, PartitionBlock<Element>>
}

function blockKey(indices: readonly number[]): BlockKey {
  return `block:${indices.join('.')}`
}

export function createPartition<Element>(
  poset: FinitePoset<Element>,
  groups: Iterable<Iterable<Element>>,
): Partition<Element> {
  const elementIndex = new Map(
    poset.elements.map((element, index) => [element, index] as const),
  )
  const seen = new Set<Element>()

  const blocks = [...groups].map((group) => {
    const elements = [...group]
    if (elements.length === 0) {
      throw new Error(`A partition cannot contain an empty block`)
    }

    for (const element of elements) {
      if (!poset.has(element)) {
        throw new Error(`A partition contains an unknown poset element`)
      }
      if (seen.has(element)) {
        throw new Error(`A partition contains an element more than once`)
      }
      seen.add(element)
    }

    elements.sort(
      (left, right) => elementIndex.get(left)! - elementIndex.get(right)!,
    )
    return {
      key: blockKey(elements.map((element) => elementIndex.get(element)!)),
      elements,
    }
  })

  if (seen.size !== poset.elements.length) {
    throw new Error(`A partition must contain every poset element exactly once`)
  }

  blocks.sort(
    (left, right) =>
      elementIndex.get(left.elements[0]!)! -
      elementIndex.get(right.elements[0]!)!,
  )

  const blockByElement = new Map<Element, PartitionBlock<Element>>()
  const blockByKey = new Map<BlockKey, PartitionBlock<Element>>()

  for (const block of blocks) {
    blockByKey.set(block.key, block)
    for (const element of block.elements) {
      blockByElement.set(element, block)
    }
  }

  return { blocks, blockByElement, blockByKey }
}

export function identityPartition<Element>(
  poset: FinitePoset<Element>,
): Partition<Element> {
  return createPartition(
    poset,
    poset.elements.map((element) => [element]),
  )
}

export function mergeBlocks<Element>(
  poset: FinitePoset<Element>,
  partition: Partition<Element>,
  leftKey: BlockKey,
  rightKey: BlockKey,
): Partition<Element> {
  if (leftKey === rightKey) {
    throw new Error(`Cannot merge a partition block with itself`)
  }

  const left = partition.blockByKey.get(leftKey)
  const right = partition.blockByKey.get(rightKey)
  if (!left || !right) {
    throw new Error(`Cannot merge an unknown partition block`)
  }

  return createPartition(poset, [
    ...partition.blocks
      .filter((block) => block.key !== leftKey && block.key !== rightKey)
      .map((block) => block.elements),
    [...left.elements, ...right.elements],
  ])
}

export function reachableBlockKeys<Element>(
  poset: FinitePoset<Element>,
  partition: Partition<Element>,
  element: Element,
): ReadonlySet<BlockKey> {
  return new Set(
    [...poset.upwardClosure([element])].map(
      (upper) => partition.blockByElement.get(upper)!.key,
    ),
  )
}

function setsEqual<Value>(
  left: ReadonlySet<Value>,
  right: ReadonlySet<Value>,
): boolean {
  return (
    left.size === right.size && [...left].every((value) => right.has(value))
  )
}

export function isCorrectPartition<Element>(
  poset: FinitePoset<Element>,
  partition: Partition<Element>,
): boolean {
  return partition.blocks.every((block) => {
    const first = block.elements[0]!
    const expected = reachableBlockKeys(poset, partition, first)
    return block.elements.every((element) =>
      setsEqual(expected, reachableBlockKeys(poset, partition, element)),
    )
  })
}

export function isColorPreserving<Element>(
  partition: Partition<Element>,
  coloring: ThreeColoring<Element>,
): boolean {
  return partition.blocks.every((block) => {
    const expected = colorMaskOf(coloring, block.elements[0]!)
    return block.elements.every(
      (element) => colorMaskOf(coloring, element) === expected,
    )
  })
}

export function partitionsEqual<Element>(
  left: Partition<Element>,
  right: Partition<Element>,
): boolean {
  return (
    left.blocks.length === right.blocks.length &&
    left.blocks.every((block, index) => block.key === right.blocks[index]?.key)
  )
}
