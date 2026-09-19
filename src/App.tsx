import { useEffect, useState } from 'react'
import './App.css'
import { HasseDiagram } from './components/HasseDiagram'
import { HueControls } from './components/HueControls'
import { PartitionControls } from './components/PartitionControls'
import {
  clearHue,
  createEmptyColoring,
  HUES,
  toggleHueAtElement,
  type Hue,
  type ThreeColoring,
} from './math/coloring'
import { fixedPoset, type FixedElementId } from './math/fixedPoset'
import {
  computeReductionTrace,
  type ReductionStep,
  type ReductionTrace,
} from './math/reductions'
import { PLAYBACK_DELAY_MS, type PlaybackSpeed } from './playback'

function explainStep(step?: ReductionStep<FixedElementId>): string {
  if (!step) {
    return 'Identity relation: every point begins in its own class.'
  }

  return `${step.type === 'alpha' ? 'Alpha' : 'Beta'} merge.`
}

function App() {
  const [activeHue, setActiveHue] = useState<Hue>(1)
  const [coloring, setColoring] =
    useState<ThreeColoring<FixedElementId>>(createEmptyColoring)
  const [history, setHistory] = useState<
    readonly ThreeColoring<FixedElementId>[]
  >([])
  const [trace, setTrace] = useState<ReductionTrace<FixedElementId> | null>(
    null,
  )
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1)

  useEffect(() => {
    if (!isPlaying || !trace) return
    const lastFrameIndex = trace.partitions.length - 1
    if (frameIndex >= lastFrameIndex) return

    const timer = window.setTimeout(() => {
      const nextFrameIndex = frameIndex + 1
      setFrameIndex(nextFrameIndex)
      if (nextFrameIndex === lastFrameIndex) {
        setIsPlaying(false)
      }
    }, PLAYBACK_DELAY_MS / playbackSpeed)
    return () => window.clearTimeout(timer)
  }, [frameIndex, isPlaying, playbackSpeed, trace])

  const commit = (next: ThreeColoring<FixedElementId>) => {
    setHistory((past) => [...past, coloring])
    setColoring(next)
  }

  const toggle = (element: FixedElementId) => {
    commit(toggleHueAtElement(fixedPoset, coloring, activeHue, element))
  }

  const undo = () => {
    const previous = history.at(-1)
    if (!previous) return
    setColoring(previous)
    setHistory((past) => past.slice(0, -1))
  }

  const reset = () => {
    commit(createEmptyColoring<FixedElementId>())
  }

  const startPartitioning = () => {
    setTrace(computeReductionTrace(fixedPoset, coloring))
    setFrameIndex(0)
    setIsPlaying(false)
  }

  const resetPartitioning = () => {
    setTrace(null)
    setFrameIndex(0)
    setIsPlaying(false)
  }

  const previousFrame = () => {
    setIsPlaying(false)
    setFrameIndex((index) => Math.max(0, index - 1))
  }

  const nextFrame = () => {
    if (!trace) return
    setIsPlaying(false)
    setFrameIndex((index) => Math.min(trace.partitions.length - 1, index + 1))
  }

  const togglePlayback = () => {
    if (!trace) return
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    if (trace.partitions.length <= 1) return
    if (frameIndex === trace.partitions.length - 1) {
      setFrameIndex(0)
    }
    setIsPlaying(true)
  }

  const partition = trace?.partitions[frameIndex]

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Correct Partition</p>
          <h1>Color the order.</h1>
        </div>
        <p className="header-copy">
          Choose three upward-closed regions. Overlapping hues mix directly on
          the poset, ready for the partition process.
        </p>
      </header>

      <div className="workspace">
        {trace && partition ? (
          <PartitionControls
            frameIndex={frameIndex}
            frameCount={trace.partitions.length}
            classCount={partition.blocks.length}
            explanation={explainStep(trace.steps[frameIndex - 1])}
            isPlaying={isPlaying}
            speed={playbackSpeed}
            onPrevious={previousFrame}
            onPlayPause={togglePlayback}
            onNext={nextFrame}
            onSpeedChange={setPlaybackSpeed}
            onReset={resetPartitioning}
          />
        ) : (
          <HueControls
            activeHue={activeHue}
            canUndo={history.length > 0}
            activeHueIsEmpty={coloring[activeHue].size === 0}
            allHuesAreEmpty={HUES.every((hue) => coloring[hue].size === 0)}
            onSelectHue={setActiveHue}
            onUndo={undo}
            onClearHue={() => commit(clearHue(fixedPoset, coloring, activeHue))}
            onReset={reset}
            onStart={startPartitioning}
          />
        )}
        <HasseDiagram
          activeHue={activeHue}
          coloring={coloring}
          onToggle={toggle}
          partition={partition}
        />
      </div>
    </main>
  )
}

export default App
