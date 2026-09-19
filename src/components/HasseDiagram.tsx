import { useId, useMemo, useState } from 'react'
import {
  affectedElementsForToggle,
  colorMaskOf,
  colorOf,
  HUES,
  minimalHueElements,
  type Hue,
  type ThreeColoring,
} from '../math/coloring'
import {
  fixedCovers,
  fixedElementIds,
  fixedPointById,
  fixedPoset,
  type FixedElementId,
} from '../math/fixedPoset'
import {
  convexHull,
  DIAGRAM_HEIGHT,
  DIAGRAM_WIDTH,
  diagramPoint,
} from '../visual/geometry'
import {
  HUE_COLORS,
  HUE_NAMES,
  HUE_REGION_COLORS,
  MIXED_COLORS,
} from '../visual/palette'

interface HasseDiagramProps {
  readonly coloring: ThreeColoring<FixedElementId>
  readonly activeHue: Hue
  readonly onToggle: (element: FixedElementId) => void
}

function accessibleColorName(
  coloring: ThreeColoring<FixedElementId>,
  element: FixedElementId,
): string {
  const hues = colorOf(coloring, element)
  return hues.length === 0
    ? 'no hues'
    : hues.map((hue) => HUE_NAMES[hue].toLowerCase()).join(', ')
}

export function HasseDiagram({
  coloring,
  activeHue,
  onToggle,
}: HasseDiagramProps) {
  const maskPrefix = useId().replaceAll(':', '')
  const [hovered, setHovered] = useState<FixedElementId | null>(null)
  const preview = useMemo(
    () =>
      hovered
        ? affectedElementsForToggle(fixedPoset, coloring, activeHue, hovered)
        : new Set<FixedElementId>(),
    [activeHue, coloring, hovered],
  )
  const previewRemoves = hovered ? coloring[activeHue].has(hovered) : false
  const minimalByHue = useMemo(
    () =>
      Object.fromEntries(
        HUES.map((hue) => [hue, minimalHueElements(fixedPoset, coloring, hue)]),
      ) as Record<Hue, ReadonlySet<FixedElementId>>,
    [coloring],
  )
  const regionHullByHue = useMemo(
    () =>
      Object.fromEntries(
        HUES.map((hue) => [
          hue,
          convexHull([...coloring[hue]].map(diagramPoint)),
        ]),
      ) as Record<Hue, readonly { x: number; y: number }[]>,
    [coloring],
  )

  return (
    <section className="diagram-card" aria-labelledby="diagram-title">
      <div className="diagram-heading">
        <div>
          <p className="eyebrow">Fixed finite poset</p>
          <h2 id="diagram-title">Build three upsets</h2>
        </div>
        <p className="diagram-instruction">
          Hover to preview · click to {previewRemoves ? 'remove' : 'add'}
        </p>
      </div>

      <div className="diagram-frame">
        <svg
          className="hasse-diagram"
          viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
          role="group"
          aria-label="Interactive Hasse diagram with 21 points"
        >
          <defs>
            {HUES.map((hue) => (
              <mask id={`${maskPrefix}-hue-${hue}`} key={hue}>
                <rect width="100%" height="100%" fill="black" />
                <g fill="white" stroke="white" strokeLinecap="round">
                  {regionHullByHue[hue].length >= 3 && (
                    <polygon
                      points={regionHullByHue[hue]
                        .map(({ x, y }) => `${x},${y}`)
                        .join(' ')}
                      strokeWidth="70"
                      strokeLinejoin="round"
                    />
                  )}
                  {fixedCovers.map(([lower, upper]) => {
                    if (
                      !coloring[hue].has(lower) ||
                      !coloring[hue].has(upper)
                    ) {
                      return null
                    }
                    const from = diagramPoint(lower)
                    const to = diagramPoint(upper)
                    return (
                      <line
                        key={`${lower}-${upper}`}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        strokeWidth="70"
                      />
                    )
                  })}
                  {[...coloring[hue]].map((element) => {
                    const point = diagramPoint(element)
                    return (
                      <circle key={element} cx={point.x} cy={point.y} r="46" />
                    )
                  })}
                </g>
              </mask>
            ))}
          </defs>

          <rect
            className="diagram-background"
            width="100%"
            height="100%"
            rx="28"
          />

          <g className="region-layer">
            {HUES.map((hue) => (
              <rect
                className="hue-region"
                key={hue}
                width="100%"
                height="100%"
                fill={HUE_REGION_COLORS[hue]}
                mask={`url(#${maskPrefix}-hue-${hue})`}
              />
            ))}
          </g>

          <g className="edge-layer" aria-hidden="true">
            {fixedCovers.map(([lower, upper]) => {
              const from = diagramPoint(lower)
              const to = diagramPoint(upper)
              return (
                <line
                  key={`${lower}-${upper}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                />
              )
            })}
          </g>

          {hovered && (
            <g
              className={`preview-layer ${previewRemoves ? 'preview-remove' : 'preview-add'}`}
              aria-hidden="true"
            >
              {[...preview].map((element) => {
                const point = diagramPoint(element)
                return <circle key={element} cx={point.x} cy={point.y} r="33" />
              })}
            </g>
          )}

          <g className="point-layer">
            {fixedElementIds.map((element) => {
              const point = diagramPoint(element)
              const location = fixedPointById.get(element)!
              return (
                <g
                  className="poset-point"
                  key={element}
                  role="button"
                  tabIndex={0}
                  aria-label={`Point row ${location.row + 1}, column ${location.column + 1}; ${accessibleColorName(coloring, element)}`}
                  onClick={() => onToggle(element)}
                  onMouseEnter={() => setHovered(element)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(element)}
                  onBlur={() => setHovered(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onToggle(element)
                    }
                  }}
                >
                  <circle
                    className="point-hit-target"
                    cx={point.x}
                    cy={point.y}
                    r="31"
                  />
                  {HUES.map((hue, index) =>
                    minimalByHue[hue].has(element) ? (
                      <circle
                        className="generator-ring"
                        key={hue}
                        cx={point.x}
                        cy={point.y}
                        r={19 + index * 7}
                        stroke={HUE_COLORS[hue]}
                      />
                    ) : null,
                  )}
                  <circle
                    className="point-core"
                    cx={point.x}
                    cy={point.y}
                    r="11"
                    fill={MIXED_COLORS[colorMaskOf(coloring, element)]}
                  />
                </g>
              )
            })}
          </g>
        </svg>
      </div>
    </section>
  )
}
