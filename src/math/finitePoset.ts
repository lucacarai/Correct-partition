export type CoverRelation<Element> = readonly [lower: Element, upper: Element]

export interface FinitePoset<Element> {
  readonly elements: readonly Element[]
  readonly covers: readonly CoverRelation<Element>[]
  has(element: Element): boolean
  lessThanOrEqual(lower: Element, upper: Element): boolean
  strictlyLessThan(lower: Element, upper: Element): boolean
  upwardClosure(seeds: Iterable<Element>): ReadonlySet<Element>
  downwardClosure(seeds: Iterable<Element>): ReadonlySet<Element>
  minimalElements(elements: Iterable<Element>): ReadonlySet<Element>
}

function duplicateValues<Element>(values: readonly Element[]): Element[] {
  const seen = new Set<Element>()
  const duplicates = new Set<Element>()

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value)
    }
    seen.add(value)
  }

  return [...duplicates]
}

export function createFinitePoset<Element>(
  elementsInput: readonly Element[],
  coversInput: readonly CoverRelation<Element>[],
): FinitePoset<Element> {
  const elements = [...elementsInput]
  const elementSet = new Set(elements)
  const duplicates = duplicateValues(elements)

  if (duplicates.length > 0) {
    throw new Error(`Duplicate poset elements: ${duplicates.join(', ')}`)
  }

  const coverKeys = new Set<string>()
  const covers = coversInput.map(([lower, upper]) => {
    if (!elementSet.has(lower) || !elementSet.has(upper)) {
      throw new Error(`Cover relation contains an unknown element`)
    }
    if (Object.is(lower, upper)) {
      throw new Error(`A strict cover relation cannot be reflexive`)
    }

    const key = `${elements.indexOf(lower)}:${elements.indexOf(upper)}`
    if (coverKeys.has(key)) {
      throw new Error(`Duplicate cover relation`)
    }
    coverKeys.add(key)

    return [lower, upper] as const
  })

  const reachable = new Map<Element, Set<Element>>()
  for (const element of elements) {
    reachable.set(element, new Set([element]))
  }
  for (const [lower, upper] of covers) {
    reachable.get(lower)!.add(upper)
  }

  for (const intermediate of elements) {
    for (const lower of elements) {
      if (!reachable.get(lower)!.has(intermediate)) {
        continue
      }
      for (const upper of reachable.get(intermediate)!) {
        reachable.get(lower)!.add(upper)
      }
    }
  }

  for (const left of elements) {
    for (const right of elements) {
      if (
        !Object.is(left, right) &&
        reachable.get(left)!.has(right) &&
        reachable.get(right)!.has(left)
      ) {
        throw new Error(`Cover relations contain a directed cycle`)
      }
    }
  }

  for (const [lower, upper] of covers) {
    const hasIntermediate = elements.some(
      (candidate) =>
        !Object.is(candidate, lower) &&
        !Object.is(candidate, upper) &&
        reachable.get(lower)!.has(candidate) &&
        reachable.get(candidate)!.has(upper),
    )

    if (hasIntermediate) {
      throw new Error(`A supplied relation is transitive rather than a cover`)
    }
  }

  function assertKnown(element: Element): void {
    if (!elementSet.has(element)) {
      throw new Error(`Unknown poset element`)
    }
  }

  function upwardClosure(seeds: Iterable<Element>): ReadonlySet<Element> {
    const result = new Set<Element>()
    for (const seed of seeds) {
      assertKnown(seed)
      for (const element of reachable.get(seed)!) {
        result.add(element)
      }
    }
    return result
  }

  function downwardClosure(seeds: Iterable<Element>): ReadonlySet<Element> {
    const seedSet = new Set(seeds)
    for (const seed of seedSet) {
      assertKnown(seed)
    }

    return new Set(
      elements.filter((candidate) =>
        [...seedSet].some((seed) => reachable.get(candidate)!.has(seed)),
      ),
    )
  }

  function minimalElements(values: Iterable<Element>): ReadonlySet<Element> {
    const valueSet = new Set(values)
    for (const value of valueSet) {
      assertKnown(value)
    }

    return new Set(
      [...valueSet].filter(
        (candidate) =>
          ![...valueSet].some(
            (other) =>
              !Object.is(other, candidate) &&
              reachable.get(other)!.has(candidate),
          ),
      ),
    )
  }

  return {
    elements,
    covers,
    has: (element) => elementSet.has(element),
    lessThanOrEqual: (lower, upper) => {
      assertKnown(lower)
      assertKnown(upper)
      return reachable.get(lower)!.has(upper)
    },
    strictlyLessThan: (lower, upper) => {
      assertKnown(lower)
      assertKnown(upper)
      return !Object.is(lower, upper) && reachable.get(lower)!.has(upper)
    },
    upwardClosure,
    downwardClosure,
    minimalElements,
  }
}
