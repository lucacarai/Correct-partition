import { colorMaskOf, type ThreeColoring } from './coloring'
import type { FinitePoset } from './finitePoset'
import {
  createPartition,
  partitionsEqual,
  reachableBlockKeys,
  type Partition,
} from './partition'

function signatureKey<Element>(
  poset: FinitePoset<Element>,
  partition: Partition<Element>,
  element: Element,
): string {
  return partition.blocks
    .filter((block) =>
      reachableBlockKeys(poset, partition, element).has(block.key),
    )
    .map((block) => block.key)
    .join('|')
}

export function computeStableRefinement<Element>(
  poset: FinitePoset<Element>,
  coloring: ThreeColoring<Element>,
): Partition<Element> {
  const colorGroups = new Map<number, Element[]>()
  for (const element of poset.elements) {
    const color = colorMaskOf(coloring, element)
    const group = colorGroups.get(color) ?? []
    group.push(element)
    colorGroups.set(color, group)
  }

  let current = createPartition(poset, colorGroups.values())

  while (true) {
    const refinedGroups: Element[][] = []

    for (const block of current.blocks) {
      const bySignature = new Map<string, Element[]>()
      for (const element of block.elements) {
        const signature = signatureKey(poset, current, element)
        const group = bySignature.get(signature) ?? []
        group.push(element)
        bySignature.set(signature, group)
      }
      refinedGroups.push(...bySignature.values())
    }

    const refined = createPartition(poset, refinedGroups)
    if (partitionsEqual(current, refined)) {
      return refined
    }
    current = refined
  }
}
