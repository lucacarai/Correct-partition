import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { HasseDiagram } from './components/HasseDiagram'
import { HueControls } from './components/HueControls'
import { PartitionControls } from './components/PartitionControls'
import { PosetControls } from './components/PosetControls'
import {
  clearHue,
  createEmptyColoring,
  createRandomColoring,
  HUES,
  toggleHueAtElement,
  type Hue,
  type ThreeColoring,
} from './math/coloring'
import {
  createLayeredPoset,
  createRandomLayeredPosetShape,
  DEFAULT_LAYER_COUNT,
  DEFAULT_MIDDLE_LAYERS,
  type PosetElementId,
} from './math/layeredPoset'
import {
  computeReductionTrace,
  type ReductionStep,
  type ReductionTrace,
} from './math/reductions'
import { decodeWorkspace, encodeWorkspace } from './math/shareCode'
import { PLAYBACK_DELAY_MS, type PlaybackSpeed } from './playback'

function explainStep(step?: ReductionStep<PosetElementId>): string {
  if (!step) return 'Identity relation: every point begins in its own class.'
  return `${step.type === 'alpha' ? 'Alpha' : 'Beta'} merge.`
}

function App() {
  const [activeHue, setActiveHue] = useState<Hue>(1)
  const [layerCount, setLayerCount] = useState(DEFAULT_LAYER_COUNT)
  const [middleLayers, setMiddleLayers] = useState<ReadonlySet<number>>(
    () => new Set(DEFAULT_MIDDLE_LAYERS),
  )
  const [isEditingPoset, setIsEditingPoset] = useState(false)
  const model = useMemo(
    () => createLayeredPoset(layerCount, middleLayers),
    [layerCount, middleLayers],
  )
  const [coloring, setColoring] =
    useState<ThreeColoring<PosetElementId>>(createEmptyColoring)
  const [history, setHistory] = useState<
    readonly ThreeColoring<PosetElementId>[]
  >([])
  const [trace, setTrace] = useState<ReductionTrace<PosetElementId> | null>(
    null,
  )
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTraceExplanation, setShowTraceExplanation] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1)
  const shareCode = useMemo(
    () => encodeWorkspace(model, coloring),
    [coloring, model],
  )

  useEffect(() => {
    if (!isPlaying || !trace) return
    const lastFrameIndex = trace.partitions.length - 1
    if (frameIndex >= lastFrameIndex) return

    const timer = window.setTimeout(() => {
      const nextFrameIndex = frameIndex + 1
      setFrameIndex(nextFrameIndex)
      if (nextFrameIndex === lastFrameIndex) setIsPlaying(false)
    }, PLAYBACK_DELAY_MS / playbackSpeed)
    return () => window.clearTimeout(timer)
  }, [frameIndex, isPlaying, playbackSpeed, trace])

  useEffect(() => {
    if (!trace) return

    const handleArrowStep = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return
      }

      event.preventDefault()
      setIsPlaying(false)
      setShowTraceExplanation(true)
      setFrameIndex((index) =>
        event.key === 'ArrowLeft'
          ? Math.max(0, index - 1)
          : Math.min(trace.partitions.length - 1, index + 1),
      )
    }

    window.addEventListener('keydown', handleArrowStep)
    return () => window.removeEventListener('keydown', handleArrowStep)
  }, [trace])

  const commit = (next: ThreeColoring<PosetElementId>) => {
    setHistory((past) => [...past, coloring])
    setColoring(next)
  }

  const clearWorkForNewPoset = () => {
    setColoring(createEmptyColoring<PosetElementId>())
    setHistory([])
    setTrace(null)
    setFrameIndex(0)
    setIsPlaying(false)
    setShowTraceExplanation(false)
  }

  const changeLayerCount = (nextLayerCount: number) => {
    setLayerCount(nextLayerCount)
    setMiddleLayers(
      (current) => new Set([...current].filter((row) => row < nextLayerCount)),
    )
    clearWorkForNewPoset()
  }

  const toggleMiddleLayer = (row: number) => {
    if (row < 2 || row >= layerCount) return
    setMiddleLayers((current) => {
      const next = new Set(current)
      if (next.has(row)) next.delete(row)
      else next.add(row)
      return next
    })
    clearWorkForNewPoset()
  }

  const restoreDefaultPoset = () => {
    setLayerCount(DEFAULT_LAYER_COUNT)
    setMiddleLayers(new Set(DEFAULT_MIDDLE_LAYERS))
    clearWorkForNewPoset()
  }

  const randomizePoset = () => {
    const shape = createRandomLayeredPosetShape()
    setLayerCount(shape.layerCount)
    setMiddleLayers(shape.middleLayers)
    clearWorkForNewPoset()
    return shape.layerCount
  }

  const loadShareCode = (code: string): string | null => {
    try {
      const decoded = decodeWorkspace(code)
      setLayerCount(decoded.model.layerCount)
      setMiddleLayers(new Set(decoded.model.middleLayers))
      setColoring(decoded.coloring)
      setHistory([])
      setTrace(null)
      setFrameIndex(0)
      setIsPlaying(false)
      setShowTraceExplanation(false)
      return null
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'The share code is invalid'
    }
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
            explanation={
              showTraceExplanation
                ? explainStep(trace.steps[frameIndex - 1])
                : ''
            }
            isPlaying={isPlaying}
            speed={playbackSpeed}
            onPrevious={() => {
              setIsPlaying(false)
              setShowTraceExplanation(true)
              setFrameIndex((index) => Math.max(0, index - 1))
            }}
            onPlayPause={() => {
              if (isPlaying) {
                setIsPlaying(false)
              } else if (trace.partitions.length > 1) {
                setShowTraceExplanation(true)
                if (frameIndex === trace.partitions.length - 1) setFrameIndex(0)
                setIsPlaying(true)
              }
            }}
            onNext={() => {
              setIsPlaying(false)
              setShowTraceExplanation(true)
              setFrameIndex((index) =>
                Math.min(trace.partitions.length - 1, index + 1),
              )
            }}
            onSpeedChange={setPlaybackSpeed}
            onReset={() => {
              setTrace(null)
              setFrameIndex(0)
              setIsPlaying(false)
              setShowTraceExplanation(false)
            }}
          />
        ) : isEditingPoset ? (
          <PosetControls
            layerCount={layerCount}
            onLayerCountChange={changeLayerCount}
            onDone={() => setIsEditingPoset(false)}
            onRestoreDefault={restoreDefaultPoset}
            onRandomize={randomizePoset}
          />
        ) : (
          <HueControls
            activeHue={activeHue}
            canUndo={history.length > 0}
            activeHueIsEmpty={coloring[activeHue].size === 0}
            allHuesAreEmpty={HUES.every((hue) => coloring[hue].size === 0)}
            onSelectHue={setActiveHue}
            onUndo={() => {
              const previous = history.at(-1)
              if (!previous) return
              setColoring(previous)
              setHistory((past) => past.slice(0, -1))
            }}
            onClearHue={() =>
              commit(clearHue(model.poset, coloring, activeHue))
            }
            onReset={() => commit(createEmptyColoring<PosetElementId>())}
            onRandomize={() => commit(createRandomColoring(model.poset))}
            onStart={() => {
              const nextTrace = computeReductionTrace(model.poset, coloring)
              setTrace(nextTrace)
              setFrameIndex(nextTrace.partitions.length - 1)
              setIsPlaying(false)
              setShowTraceExplanation(false)
            }}
            onChangePoset={() => setIsEditingPoset(true)}
            shareCode={shareCode}
            onLoadShareCode={loadShareCode}
          />
        )}
        <HasseDiagram
          model={model}
          activeHue={activeHue}
          coloring={coloring}
          onToggle={(element) =>
            commit(
              toggleHueAtElement(model.poset, coloring, activeHue, element),
            )
          }
          partition={partition}
          isEditingPoset={isEditingPoset}
          onToggleMiddleLayer={toggleMiddleLayer}
        />
      </div>
    </main>
  )
}

export default App
