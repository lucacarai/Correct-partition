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
  type LayeredPoset,
  type PosetElementId,
  type PosetPoint,
} from '../math/layeredPoset'
import type { Partition } from '../math/partition'
import {
  convexHull,
  DIAGRAM_WIDTH,
  diagramHeight,
  diagramPoint,
  partitionContours,
} from '../visual/geometry'
import {
  HUE_COLORS,
  HUE_NAMES,
  HUE_REGION_COLORS,
  MIXED_COLORS,
} from '../visual/palette'

const HUE_EXCLUSION_HALO_RADIUS = 27

interface HasseDiagramProps {
  readonly model: LayeredPoset
  readonly coloring: ThreeColoring<PosetElementId>
  readonly activeHue: Hue
  readonly onToggle: (element: PosetElementId) => void
  readonly partition?: Partition<PosetElementId>
  readonly isEditingPoset: boolean
  readonly onToggleMiddleLayer: (row: number) => void
}

function accessibleColorName(
  coloring: ThreeColoring<PosetElementId>,
  element: PosetElementId,
): string {
  const hues = colorOf(coloring, element)
  return hues.length === 0
    ? 'no hues'
    : hues.map((hue) => HUE_NAMES[hue].toLowerCase()).join(', ')
}

export function HasseDiagram({
  model,
  coloring,
  activeHue,
  onToggle,
  partition,
  isEditingPoset,
  onToggleMiddleLayer,
}: HasseDiagramProps) {
  const { covers, elementIds, layerCount, pointById, points, poset } = model
  const maskPrefix = useId().replaceAll(':', '')
  const [hovered, setHovered] = useState<PosetElementId | null>(null)
  const preview = useMemo(
    () =>
      hovered && !partition && !isEditingPoset
        ? affectedElementsForToggle(poset, coloring, activeHue, hovered)
        : new Set<PosetElementId>(),
    [activeHue, coloring, hovered, isEditingPoset, partition, poset],
  )
  const previewRemoves = hovered ? coloring[activeHue].has(hovered) : false
  const minimalByHue = useMemo(
    () =>
      Object.fromEntries(
        HUES.map((hue) => [hue, minimalHueElements(poset, coloring, hue)]),
      ) as Record<Hue, ReadonlySet<PosetElementId>>,
    [coloring, poset],
  )
  const pointPosition = (element: PosetElementId) =>
    diagramPoint(pointById.get(element)!)
  const regionHullByHue = useMemo(
    () =>
      Object.fromEntries(
        HUES.map((hue) => [
          hue,
          convexHull(
            [...coloring[hue]].map((element) =>
              diagramPoint(pointById.get(element)!),
            ),
          ),
        ]),
      ) as Record<Hue, readonly { x: number; y: number }[]>,
    [coloring, pointById],
  )
  const partitionShapes = useMemo(() => {
    if (!partition) return []

    const contours = partitionContours(
      partition.blocks.map((block) =>
        block.elements.map((element) => diagramPoint(pointById.get(element)!)),
      ),
    )
    return partition.blocks.map((block, index) => ({
      block,
      index,
      contour: contours[index]!,
    }))
  }, [partition, pointById])

  const optionalMiddleRows = Array.from(
    { length: Math.max(0, layerCount - 2) },
    (_, index) => index + 2,
  )

  const pointControlProps = (point: PosetPoint) => {
    if (isEditingPoset) {
      if (point.column === 1 && point.row >= 2) {
        return {
          role: 'button',
          tabIndex: 0,
          'aria-label': `Remove middle point from layer ${point.row + 1}`,
          onClick: () => onToggleMiddleLayer(point.row),
          onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onToggleMiddleLayer(point.row)
            }
          },
        } as const
      }
      return { 'aria-hidden': true, tabIndex: -1 } as const
    }

    return {
      role: 'button',
      tabIndex: partition ? -1 : 0,
      'aria-disabled': partition ? true : undefined,
      'aria-label': `Point row ${point.row + 1}, column ${point.column + 1}; ${accessibleColorName(coloring, point.id)}`,
      onClick: () => !partition && onToggle(point.id),
      onMouseEnter: () => !partition && setHovered(point.id),
      onMouseLeave: () => setHovered(null),
      onFocus: () => !partition && setHovered(point.id),
      onBlur: () => setHovered(null),
      onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => {
        if (!partition && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onToggle(point.id)
        }
      },
    } as const
  }

  return (
    <section className="diagram-card" aria-labelledby="diagram-title">
      <div className="diagram-heading">
        <div>
          <p className="eyebrow">Layered finite poset</p>
          <h2 id="diagram-title">
            {partition
              ? 'Inspect the partition'
              : isEditingPoset
                ? 'Choose middle points'
                : 'Build three upsets'}
          </h2>
        </div>
        <p className="diagram-instruction">
          {partition
            ? `${partition.blocks.length} ${partition.blocks.length === 1 ? 'class' : 'classes'}`
            : isEditingPoset
              ? `${layerCount} layers · click dashed middle positions`
              : `Hover to preview · click to ${previewRemoves ? 'remove' : 'add'}`}
        </p>
      </div>

      <div className="diagram-frame">
        <svg
          className="hasse-diagram"
          viewBox={`0 0 ${DIAGRAM_WIDTH} ${diagramHeight(layerCount)}`}
          role="group"
          aria-label={`Interactive Hasse diagram with ${elementIds.length} points and ${layerCount} layers`}
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
                  {covers.map(([lower, upper]) => {
                    if (
                      !coloring[hue].has(lower) ||
                      !coloring[hue].has(upper)
                    ) {
                      return null
                    }
                    const from = pointPosition(lower)
                    const to = pointPosition(upper)
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
                    const point = pointPosition(element)
                    return (
                      <circle key={element} cx={point.x} cy={point.y} r="46" />
                    )
                  })}
                </g>
                <g fill="black">
                  {points.map((location) => {
                    if (coloring[hue].has(location.id)) return null
                    const point = diagramPoint(location)
                    return (
                      <circle
                        className="hue-exclusion-halo"
                        data-hue={hue}
                        data-element={location.id}
                        key={location.id}
                        cx={point.x}
                        cy={point.y}
                        r={HUE_EXCLUSION_HALO_RADIUS}
                      />
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
            {covers.map(([lower, upper]) => {
              const from = pointPosition(lower)
              const to = pointPosition(upper)
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

          {hovered && !partition && !isEditingPoset && (
            <g
              className={`preview-layer ${previewRemoves ? 'preview-remove' : 'preview-add'}`}
              aria-hidden="true"
            >
              {[...preview].map((element) => {
                const point = pointPosition(element)
                return <circle key={element} cx={point.x} cy={point.y} r="33" />
              })}
            </g>
          )}

          <g className="point-layer">
            {points.map((location) => {
              const element = location.id
              const point = diagramPoint(location)
              return (
                <g
                  className={`poset-point ${isEditingPoset && location.column === 1 && location.row >= 2 ? 'middle-point-toggle' : ''}`}
                  key={element}
                  {...pointControlProps(location)}
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

          {isEditingPoset && (
            <g className="middle-slot-layer">
              {optionalMiddleRows.map((row) => {
                if (model.middleLayers.has(row)) return null
                const point = diagramPoint({ id: `r${row}c1`, row, column: 1 })
                return (
                  <g
                    className="middle-slot"
                    key={row}
                    role="button"
                    tabIndex={0}
                    aria-label={`Add middle point to layer ${row + 1}`}
                    onClick={() => onToggleMiddleLayer(row)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onToggleMiddleLayer(row)
                      }
                    }}
                  >
                    <circle cx={point.x} cy={point.y} r="25" />
                    <line
                      x1={point.x - 8}
                      y1={point.y}
                      x2={point.x + 8}
                      y2={point.y}
                    />
                    <line
                      x1={point.x}
                      y1={point.y - 8}
                      x2={point.x}
                      y2={point.y + 8}
                    />
                  </g>
                )
              })}
            </g>
          )}

          {partition && (
            <g
              className="partition-layer"
              role="list"
              aria-label={`Partition with ${partition.blocks.length} classes`}
            >
              {partitionShapes.map(({ block, contour, index }) => {
                const positions = block.elements.map((element) => {
                  const point = pointById.get(element)!
                  return `row ${point.row + 1}, column ${point.column + 1}`
                })
                return (
                  <g
                    className="partition-bubble"
                    data-testid="partition-bubble"
                    key={block.key}
                    role="listitem"
                    aria-label={`Class ${index + 1}: ${positions.join('; ')}`}
                  >
                    <polygon
                      className="partition-bubble-source"
                      points={contour.map(({ x, y }) => `${x},${y}`).join(' ')}
                    />
                  </g>
                )
              })}
            </g>
          )}
        </svg>
      </div>
    </section>
  )
}
