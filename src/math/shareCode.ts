import {
  createColoringFromMinimalElements,
  HUES,
  minimalHueElements,
  type ThreeColoring,
} from './coloring'
import {
  createLayeredPoset,
  type LayeredPoset,
  type PosetElementId,
} from './layeredPoset'

const SHARE_CODE_PREFIX = 'CP1.'

interface SharePayload {
  readonly v: 1
  readonly l: number
  readonly m: readonly number[]
  readonly h: readonly [
    readonly PosetElementId[],
    readonly PosetElementId[],
    readonly PosetElementId[],
  ]
}

export interface DecodedWorkspace {
  readonly model: LayeredPoset
  readonly coloring: ThreeColoring<PosetElementId>
}

function toBase64Url(value: string): string {
  return btoa(value)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '')
}

function fromBase64Url(value: string): string {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) {
    throw new Error('The share code contains invalid characters')
  }
  const standard = value.replaceAll('-', '+').replaceAll('_', '/')
  const padding = '='.repeat((4 - (standard.length % 4)) % 4)
  return atob(standard + padding)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function orderedGenerators(
  model: LayeredPoset,
  coloring: ThreeColoring<PosetElementId>,
  hue: (typeof HUES)[number],
): readonly PosetElementId[] {
  const minimal = minimalHueElements(model.poset, coloring, hue)
  return model.elementIds.filter((element) => minimal.has(element))
}

export function encodeWorkspace(
  model: LayeredPoset,
  coloring: ThreeColoring<PosetElementId>,
): string {
  const payload: SharePayload = {
    v: 1,
    l: model.layerCount,
    m: [...model.middleLayers].filter((row) => row >= 2).sort((a, b) => a - b),
    h: [
      orderedGenerators(model, coloring, 1),
      orderedGenerators(model, coloring, 2),
      orderedGenerators(model, coloring, 3),
    ],
  }

  return SHARE_CODE_PREFIX + toBase64Url(JSON.stringify(payload))
}

export function decodeWorkspace(code: string): DecodedWorkspace {
  const trimmed = code.trim()
  if (!trimmed.startsWith(SHARE_CODE_PREFIX)) {
    throw new Error('This is not a supported Correct Partition share code')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(fromBase64Url(trimmed.slice(SHARE_CODE_PREFIX.length)))
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('invalid characters')
    ) {
      throw error
    }
    throw new Error('The share code is damaged or incomplete')
  }

  if (
    !isRecord(parsed) ||
    parsed.v !== 1 ||
    !Number.isSafeInteger(parsed.l) ||
    !Array.isArray(parsed.m) ||
    !Array.isArray(parsed.h) ||
    parsed.h.length !== 3
  ) {
    throw new Error('The share code has an invalid structure')
  }

  const layerCount = parsed.l as number
  if (
    !parsed.m.every(
      (row): row is number =>
        Number.isSafeInteger(row) && row >= 2 && row < layerCount,
    ) ||
    new Set(parsed.m).size !== parsed.m.length
  ) {
    throw new Error('The share code has invalid middle-point layers')
  }

  const model = createLayeredPoset(layerCount, parsed.m)
  const hueGenerators = parsed.h.map((value) => {
    if (
      !Array.isArray(value) ||
      !value.every(
        (element): element is PosetElementId =>
          typeof element === 'string' &&
          model.poset.has(element as PosetElementId),
      ) ||
      new Set(value).size !== value.length
    ) {
      throw new Error('The share code contains invalid color generators')
    }
    return value
  })

  return {
    model,
    coloring: createColoringFromMinimalElements(model.poset, {
      1: hueGenerators[0]!,
      2: hueGenerators[1]!,
      3: hueGenerators[2]!,
    }),
  }
}
