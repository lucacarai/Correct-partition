import { HUES, type Hue } from '../math/coloring'
import { HUE_COLORS, HUE_NAMES } from '../visual/palette'
import { ShareControls } from './ShareControls'

interface HueControlsProps {
  readonly activeHue: Hue
  readonly canUndo: boolean
  readonly activeHueIsEmpty: boolean
  readonly allHuesAreEmpty: boolean
  readonly onSelectHue: (hue: Hue) => void
  readonly onUndo: () => void
  readonly onClearHue: () => void
  readonly onReset: () => void
  readonly onStart: () => void
  readonly onChangePoset: () => void
  readonly shareCode: string
  readonly onLoadShareCode: (code: string) => string | null
}

export function HueControls({
  activeHue,
  canUndo,
  activeHueIsEmpty,
  allHuesAreEmpty,
  onSelectHue,
  onUndo,
  onClearHue,
  onReset,
  onStart,
  onChangePoset,
  shareCode,
  onLoadShareCode,
}: HueControlsProps) {
  return (
    <aside className="control-panel" aria-labelledby="coloring-title">
      <div>
        <p className="eyebrow">Coloring editor</p>
        <h2 id="coloring-title">Choose a hue</h2>
        <p className="control-copy">
          Select a hue, then click any point. Everything above it joins that
          hue&apos;s upset automatically.
        </p>
      </div>

      <div className="hue-picker" role="radiogroup" aria-label="Active hue">
        {HUES.map((hue) => (
          <button
            className="hue-choice"
            data-selected={activeHue === hue}
            key={hue}
            onClick={() => onSelectHue(hue)}
            role="radio"
            aria-checked={activeHue === hue}
            style={{ '--hue': HUE_COLORS[hue] } as React.CSSProperties}
          >
            <span className="hue-swatch" aria-hidden="true" />
            <span>
              <strong>{HUE_NAMES[hue]}</strong>
              <small>Hue {hue}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="editing-hint" aria-live="polite">
        <span
          className="editing-dot"
          style={{ background: HUE_COLORS[activeHue] }}
          aria-hidden="true"
        />
        Editing {HUE_NAMES[activeHue].toLowerCase()}
      </div>

      <div className="control-actions">
        <button
          className="secondary-button"
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </button>
        <button
          className="secondary-button"
          onClick={onClearHue}
          disabled={activeHueIsEmpty}
        >
          Clear {HUE_NAMES[activeHue].toLowerCase()}
        </button>
        <button
          className="text-button"
          onClick={onReset}
          disabled={allHuesAreEmpty}
        >
          Reset all
        </button>
      </div>

      <button className="primary-button start-button" onClick={onStart}>
        Compute correct partition
      </button>

      <button
        className="secondary-button change-poset-button"
        onClick={onChangePoset}
      >
        Change poset
      </button>

      <div className="mini-guide">
        <p>
          <span className="guide-ring" aria-hidden="true" /> Rings mark minimal
          elements.
        </p>
        <p>
          <span className="guide-dash" aria-hidden="true" /> A dashed preview
          shows what will change.
        </p>
      </div>

      <ShareControls shareCode={shareCode} onLoad={onLoadShareCode} />
    </aside>
  )
}
