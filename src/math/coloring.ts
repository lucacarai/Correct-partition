import type { FinitePoset } from './finitePoset'

export const HUES = [1, 2, 3] as const

export type Hue = (typeof HUES)[number]

export type ThreeColoring<Element> = Readonly<Record<Hue, ReadonlySet<Element>>>

export function isUpset<Element>(
  poset: FinitePoset<Element>,
  elements: ReadonlySet<Element>,
): boolean {
  return [...elements].every((element) =>
    [...poset.upwardClosure([element])].every((upper) => elements.has(upper)),
  )
}

export function createThreeColoring<Element>(
  poset: FinitePoset<Element>,
  upsets: Readonly<Record<Hue, Iterable<Element>>>,
): ThreeColoring<Element> {
  const coloring = {
    1: new Set(upsets[1]),
    2: new Set(upsets[2]),
    3: new Set(upsets[3]),
  }

  for (const hue of HUES) {
    for (const element of coloring[hue]) {
      if (!poset.has(element)) {
        throw new Error(`Hue ${hue} contains an unknown poset element`)
      }
    }
    if (!isUpset(poset, coloring[hue])) {
      throw new Error(`Hue ${hue} does not define an upset`)
    }
  }

  return coloring
}

export function createEmptyColoring<Element>(): ThreeColoring<Element> {
  return {
    1: new Set<Element>(),
    2: new Set<Element>(),
    3: new Set<Element>(),
  }
}

export function createColoringFromMinimalElements<Element>(
  poset: FinitePoset<Element>,
  generators: Readonly<Record<Hue, Iterable<Element>>>,
): ThreeColoring<Element> {
  return createThreeColoring(poset, {
    1: poset.upwardClosure(generators[1]),
    2: poset.upwardClosure(generators[2]),
    3: poset.upwardClosure(generators[3]),
  })
}

export function minimalHueElements<Element>(
  poset: FinitePoset<Element>,
  coloring: ThreeColoring<Element>,
  hue: Hue,
): ReadonlySet<Element> {
  return poset.minimalElements(coloring[hue])
}

export function toggleHueAtElement<Element>(
  poset: FinitePoset<Element>,
  coloring: ThreeColoring<Element>,
  hue: Hue,
  element: Element,
): ThreeColoring<Element> {
  if (!poset.has(element)) {
    throw new Error(`Cannot edit a hue at an unknown poset element`)
  }

  const editedUpset = new Set(coloring[hue])

  if (editedUpset.has(element)) {
    for (const lower of poset.downwardClosure([element])) {
      editedUpset.delete(lower)
    }
  } else {
    for (const upper of poset.upwardClosure([element])) {
      editedUpset.add(upper)
    }
  }

  return createThreeColoring(poset, {
    1: hue === 1 ? editedUpset : coloring[1],
    2: hue === 2 ? editedUpset : coloring[2],
    3: hue === 3 ? editedUpset : coloring[3],
  })
}

export function affectedElementsForToggle<Element>(
  poset: FinitePoset<Element>,
  coloring: ThreeColoring<Element>,
  hue: Hue,
  element: Element,
): ReadonlySet<Element> {
  if (!poset.has(element)) {
    throw new Error(`Cannot preview a hue at an unknown poset element`)
  }

  if (!coloring[hue].has(element)) {
    return poset.upwardClosure([element])
  }

  return new Set(
    [...poset.downwardClosure([element])].filter((lower) =>
      coloring[hue].has(lower),
    ),
  )
}

export function clearHue<Element>(
  poset: FinitePoset<Element>,
  coloring: ThreeColoring<Element>,
  hue: Hue,
): ThreeColoring<Element> {
  return createThreeColoring(poset, {
    1: hue === 1 ? [] : coloring[1],
    2: hue === 2 ? [] : coloring[2],
    3: hue === 3 ? [] : coloring[3],
  })
}

export function colorOf<Element>(
  coloring: ThreeColoring<Element>,
  element: Element,
): readonly Hue[] {
  return HUES.filter((hue) => coloring[hue].has(element))
}

export function colorMaskOf<Element>(
  coloring: ThreeColoring<Element>,
  element: Element,
): number {
  return colorOf(coloring, element).reduce(
    (mask, hue) => mask | (1 << (hue - 1)),
    0,
  )
}

export function haveSameColor<Element>(
  coloring: ThreeColoring<Element>,
  left: Element,
  right: Element,
): boolean {
  return colorMaskOf(coloring, left) === colorMaskOf(coloring, right)
}
