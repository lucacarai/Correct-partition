import { MAX_LAYER_COUNT } from '../math/layeredPoset'

interface PosetControlsProps {
  readonly layerCount: number
  readonly onLayerCountChange: (layerCount: number) => void
  readonly onDone: () => void
  readonly onRestoreDefault: () => void
}

export function PosetControls({
  layerCount,
  onLayerCountChange,
  onDone,
  onRestoreDefault,
}: PosetControlsProps) {
  return (
    <aside className="control-panel" aria-labelledby="poset-editor-title">
      <div>
        <p className="eyebrow">Poset editor</p>
        <h2 id="poset-editor-title">Shape the diagram</h2>
        <p className="control-copy">
          Choose between 2 and {MAX_LAYER_COUNT} layers, then click a middle
          position in the diagram to add or remove its point.
        </p>
      </div>

      <label className="layer-count-control">
        <span>Number of layers</span>
        <input
          aria-label="Number of layers"
          type="number"
          min="2"
          max={MAX_LAYER_COUNT}
          step="1"
          key={layerCount}
          defaultValue={layerCount}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (Number.isSafeInteger(next) && next > MAX_LAYER_COUNT) {
              event.currentTarget.value = String(MAX_LAYER_COUNT)
              onLayerCountChange(MAX_LAYER_COUNT)
              return
            }
            if (
              Number.isSafeInteger(next) &&
              next >= 2 &&
              next <= MAX_LAYER_COUNT
            ) {
              onLayerCountChange(next)
            }
          }}
          onBlur={(event) => {
            const next = Number(event.currentTarget.value)
            if (!Number.isSafeInteger(next) || next < 2) {
              event.currentTarget.value = String(layerCount)
            }
          }}
        />
      </label>

      <div className="editing-hint poset-editing-hint" aria-live="polite">
        Dashed circles are available middle positions.
      </div>

      <button className="primary-button start-button" onClick={onDone}>
        Done changing poset
      </button>
      <button className="text-button" onClick={onRestoreDefault}>
        Restore default poset
      </button>
    </aside>
  )
}
