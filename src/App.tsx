import { useState } from 'react'
import './App.css'
import { HasseDiagram } from './components/HasseDiagram'
import { HueControls } from './components/HueControls'
import {
  clearHue,
  createEmptyColoring,
  HUES,
  toggleHueAtElement,
  type Hue,
  type ThreeColoring,
} from './math/coloring'
import { fixedPoset, type FixedElementId } from './math/fixedPoset'

function App() {
  const [activeHue, setActiveHue] = useState<Hue>(1)
  const [coloring, setColoring] =
    useState<ThreeColoring<FixedElementId>>(createEmptyColoring)
  const [history, setHistory] = useState<
    readonly ThreeColoring<FixedElementId>[]
  >([])

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
        <HueControls
          activeHue={activeHue}
          canUndo={history.length > 0}
          activeHueIsEmpty={coloring[activeHue].size === 0}
          allHuesAreEmpty={HUES.every((hue) => coloring[hue].size === 0)}
          onSelectHue={setActiveHue}
          onUndo={undo}
          onClearHue={() => commit(clearHue(fixedPoset, coloring, activeHue))}
          onReset={reset}
        />
        <HasseDiagram
          activeHue={activeHue}
          coloring={coloring}
          onToggle={toggle}
        />
      </div>
    </main>
  )
}

export default App
