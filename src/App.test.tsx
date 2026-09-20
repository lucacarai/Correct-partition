import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import {
  createColoringFromMinimalElements,
  createEmptyColoring,
} from './math/coloring'
import { fixedPoset, type FixedElementId } from './math/fixedPoset'
import { createLayeredPoset, type PosetElementId } from './math/layeredPoset'
import { computeReductionTrace } from './math/reductions'
import { encodeWorkspace } from './math/shareCode'

describe('coloring editor', () => {
  it('changes the number of layers and toggles optional middle points', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: /point row 3, column 1; no hues/i,
      }),
    )
    await user.click(screen.getByRole('button', { name: /change poset/i }))
    expect(
      screen.getByRole('spinbutton', { name: /number of layers/i }),
    ).toHaveValue(9)
    expect(
      screen.getByRole('spinbutton', { name: /number of layers/i }),
    ).toHaveAttribute('max', '30')

    fireEvent.change(
      screen.getByRole('spinbutton', { name: /number of layers/i }),
      { target: { value: '31' } },
    )
    expect(
      screen.getByRole('spinbutton', { name: /number of layers/i }),
    ).toHaveValue(30)

    await user.clear(
      screen.getByRole('spinbutton', { name: /number of layers/i }),
    )
    await user.type(
      screen.getByRole('spinbutton', { name: /number of layers/i }),
      '5',
    )
    expect(
      screen.getByRole('group', {
        name: /interactive hasse diagram with 11 points and 5 layers/i,
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /add middle point to layer 3/i }),
    )
    expect(
      screen.getByRole('button', { name: /remove middle point from layer 3/i }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /done changing poset/i }),
    )
    expect(
      screen.getByRole('button', {
        name: /point row 3, column 2; no hues/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /point row 3, column 1; no hues/i,
      }),
    ).toBeInTheDocument()
  })

  it('builds an upset and preserves independent coincident hues', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: /point row 3, column 1; no hues/i,
      }),
    )

    expect(
      screen.getByRole('button', {
        name: /point row 2, column 1; blue/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /point row 3, column 3; no hues/i,
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /red/i }))
    await user.click(
      screen.getByRole('button', {
        name: /point row 3, column 1; blue/i,
      }),
    )

    expect(
      screen.getByRole('button', {
        name: /point row 2, column 1; blue, red/i,
      }),
    ).toBeInTheDocument()
  })

  it('cuts each hue region away from points outside that hue', () => {
    const { container } = render(<App />)

    expect(
      container.querySelector(
        '.hue-exclusion-halo[data-hue="1"][data-element="r8c1"]',
      ),
    ).toHaveAttribute('r', '27')
  })

  it('supports undo, clearing the active hue, and keyboard editing', async () => {
    const user = userEvent.setup()
    render(<App />)
    const bottomLeft = screen.getByRole('button', {
      name: /point row 9, column 1; no hues/i,
    })

    bottomLeft.focus()
    await user.keyboard('{Enter}')
    expect(bottomLeft).toHaveAccessibleName(/blue/i)

    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(bottomLeft).toHaveAccessibleName(/no hues/i)

    await user.click(bottomLeft)
    await user.click(screen.getByRole('button', { name: /clear blue/i }))
    expect(bottomLeft).toHaveAccessibleName(/no hues/i)
  })

  it('generates an undoable random coloring', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      const user = userEvent.setup()
      render(<App />)

      await user.click(screen.getByRole('button', { name: /random coloring/i }))
      expect(
        screen.getByRole('button', {
          name: /point row 9, column 1; blue, red, yellow/i,
        }),
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Undo' }))
      expect(
        screen.getByRole('button', {
          name: /point row 9, column 1; no hues/i,
        }),
      ).toBeInTheDocument()
    } finally {
      random.mockRestore()
    }
  })

  it('generates a random poset and clears the current coloring', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      const user = userEvent.setup()
      render(<App />)
      await user.click(
        screen.getByRole('button', {
          name: /point row 3, column 1; no hues/i,
        }),
      )
      await user.click(screen.getByRole('button', { name: /change poset/i }))
      await user.click(screen.getByRole('button', { name: /random poset/i }))

      expect(
        screen.getByRole('spinbutton', { name: /number of layers/i }),
      ).toHaveValue(2)
      await user.click(
        screen.getByRole('button', { name: /done changing poset/i }),
      )
      expect(
        screen.getByRole('button', {
          name: /point row 2, column 1; no hues/i,
        }),
      ).toBeInTheDocument()
    } finally {
      random.mockRestore()
    }
  })

  it('loads a shared poset and coloring code', async () => {
    const user = userEvent.setup()
    const sharedModel = createLayeredPoset(5, [2])
    const sharedColoring = createColoringFromMinimalElements<PosetElementId>(
      sharedModel.poset,
      {
        1: ['r4c0'],
        2: [],
        3: ['r3c2'],
      },
    )
    const code = encodeWorkspace(sharedModel, sharedColoring)
    render(<App />)

    const codeBox = screen.getByRole('textbox', {
      name: /poset and coloring share code/i,
    })
    await user.clear(codeBox)
    await user.type(codeBox, code)
    await user.click(screen.getByRole('button', { name: /load code/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/loaded/i)
    expect(
      screen.getByRole('group', {
        name: /interactive hasse diagram with 11 points and 5 layers/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /point row 5, column 1; blue/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /point row 4, column 3; yellow/i,
      }),
    ).toBeInTheDocument()

    const loadedCodeBox = screen.getByRole('textbox', {
      name: /poset and coloring share code/i,
    })
    await user.clear(loadedCodeBox)
    await user.type(loadedCodeBox, 'invalid')
    await user.click(screen.getByRole('button', { name: /load code/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/not a supported/i)
    expect(
      screen.getByRole('group', {
        name: /interactive hasse diagram with 11 points and 5 layers/i,
      }),
    ).toBeInTheDocument()
  })
})

describe('partition trace', () => {
  it('renders every tested trace frame and supports manual inspection', async () => {
    const user = userEvent.setup()
    const expected = computeReductionTrace(
      fixedPoset,
      createEmptyColoring<FixedElementId>(),
    )
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: /compute correct partition/i }),
    )

    expect(
      screen.getByRole('heading', {
        name: `Step ${expected.partitions.length} of ${expected.partitions.length}`,
      }),
    ).toBeVisible()
    expect(screen.getAllByTestId('partition-bubble')).toHaveLength(
      expected.partitions.at(-1)!.blocks.length,
    )
    expect(
      screen.getByRole('button', { name: /point row 1, column 2/i }),
    ).toHaveAttribute('aria-disabled', 'true')

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Replay' })).toBeEnabled()
    expect(screen.queryByText(/^(alpha|beta) merge\.$/i)).toBeNull()
    expect(screen.queryByText(/identity relation/i)).toBeNull()
    expect(screen.queryByText(/least class|strict upper|row \d/i)).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Replay' }))
    expect(screen.getByRole('heading', { name: 'Step 1 of 21' })).toBeVisible()
    expect(screen.getByText(/identity relation/i)).toBeInTheDocument()
    expect(screen.getAllByTestId('partition-bubble')).toHaveLength(
      expected.partitions[0]!.blocks.length,
    )
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Pause' }))

    for (let index = 1; index < expected.partitions.length; index += 1) {
      await user.click(screen.getByRole('button', { name: 'Next' }))
      expect(screen.getAllByTestId('partition-bubble')).toHaveLength(
        expected.partitions[index]!.blocks.length,
      )
    }

    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(screen.getAllByTestId('partition-bubble')).toHaveLength(
      expected.partitions.at(-2)!.blocks.length,
    )

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(
      screen.getByRole('button', { name: /compute correct partition/i }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('partition-bubble')).not.toBeInTheDocument()
  })

  it('plays at 600ms per frame at 1x and pauses for manual stepping', async () => {
    vi.useFakeTimers()
    try {
      const expected = computeReductionTrace(
        fixedPoset,
        createEmptyColoring<FixedElementId>(),
      )
      render(<App />)
      fireEvent.click(
        screen.getByRole('button', { name: /compute correct partition/i }),
      )
      fireEvent.click(screen.getByRole('button', { name: 'Replay' }))

      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
      await act(() => vi.advanceTimersByTimeAsync(600))
      expect(
        screen.getByRole('heading', { name: 'Step 2 of 21' }),
      ).toBeVisible()
      expect(screen.getAllByTestId('partition-bubble')).toHaveLength(
        expected.partitions[1]!.blocks.length,
      )

      fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
      await act(() => vi.advanceTimersByTimeAsync(600))
      expect(
        screen.getByRole('heading', { name: 'Step 2 of 21' }),
      ).toBeVisible()

      fireEvent.click(screen.getByRole('button', { name: 'Play' }))
      await act(() => vi.advanceTimersByTimeAsync(600))
      fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Step 2 of 21' }),
      ).toBeVisible()
    } finally {
      vi.useRealTimers()
    }
  })
})
