import { PLAYBACK_SPEEDS, type PlaybackSpeed } from '../playback'

interface PartitionControlsProps {
  readonly frameIndex: number
  readonly frameCount: number
  readonly classCount: number
  readonly explanation: string
  readonly isPlaying: boolean
  readonly speed: PlaybackSpeed
  readonly onPrevious: () => void
  readonly onPlayPause: () => void
  readonly onNext: () => void
  readonly onSpeedChange: (speed: PlaybackSpeed) => void
  readonly onReset: () => void
}

export function PartitionControls({
  frameIndex,
  frameCount,
  classCount,
  explanation,
  isPlaying,
  speed,
  onPrevious,
  onPlayPause,
  onNext,
  onSpeedChange,
  onReset,
}: PartitionControlsProps) {
  const isFirst = frameIndex === 0
  const isLast = frameIndex === frameCount - 1

  return (
    <aside className="control-panel" aria-labelledby="partition-title">
      <div>
        <p className="eyebrow">Partition trace</p>
        <h2 id="partition-title">
          Step {frameIndex + 1} of {frameCount}
        </h2>
        <p className="control-copy">
          Inspect each mathematically valid partition before animation is added.
        </p>
      </div>

      <div className="trace-status">
        <div className="trace-count">
          <strong>{classCount}</strong>
          <span>{classCount === 1 ? 'class' : 'classes'}</span>
        </div>
        <progress
          aria-label="Partition trace progress"
          max={frameCount - 1 || 1}
          value={frameIndex}
        />
      </div>

      <p className="merge-explanation" aria-live="polite">
        {explanation}
      </p>

      <div className="control-actions partition-actions">
        <button
          className="secondary-button"
          onClick={onPrevious}
          disabled={isFirst}
        >
          Previous
        </button>
        <button
          className="primary-button"
          onClick={onPlayPause}
          disabled={frameCount <= 1}
        >
          {isPlaying ? 'Pause' : isLast ? 'Replay' : 'Play'}
        </button>
        <button className="secondary-button" onClick={onNext} disabled={isLast}>
          Next
        </button>
        <button className="text-button" onClick={onReset}>
          Reset
        </button>
      </div>

      <label className="speed-control">
        <span>Playback speed</span>
        <select
          aria-label="Playback speed"
          value={speed}
          onChange={(event) =>
            onSpeedChange(Number(event.currentTarget.value) as PlaybackSpeed)
          }
        >
          {PLAYBACK_SPEEDS.map((option) => (
            <option key={option} value={option}>
              {option}×
            </option>
          ))}
        </select>
      </label>

      <p className="mini-guide trace-guide">
        Coloring is locked while this trace is open. Reset returns to the same
        coloring.
      </p>
    </aside>
  )
}
