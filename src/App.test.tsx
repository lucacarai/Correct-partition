import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { createEmptyColoring } from './math/coloring'
import { fixedPoset, type FixedElementId } from './math/fixedPoset'
import { computeReductionTrace } from './math/reductions'

describe('coloring editor', () => {
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
      screen.getByRole('button', { name: /start partitioning/i }),
    )

    expect(screen.getByText(/identity relation/i)).toBeInTheDocument()
    expect(screen.getAllByTestId('partition-bubble')).toHaveLength(
      expected.partitions[0]!.blocks.length,
    )
    expect(
      screen.getByRole('button', { name: /point row 1, column 2/i }),
    ).toHaveAttribute('aria-disabled', 'true')

    for (let index = 1; index < expected.partitions.length; index += 1) {
      await user.click(screen.getByRole('button', { name: 'Next' }))
      expect(screen.getAllByTestId('partition-bubble')).toHaveLength(
        expected.partitions[index]!.blocks.length,
      )
    }

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Replay' })).toBeEnabled()
    expect(screen.getByText(/^(alpha|beta) merge\.$/i)).toBeInTheDocument()
    expect(screen.queryByText(/least class|strict upper|row \d/i)).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(screen.getAllByTestId('partition-bubble')).toHaveLength(
      expected.partitions.at(-2)!.blocks.length,
    )
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Replay' }))
    expect(screen.getByRole('heading', { name: 'Step 1 of 21' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Pause' }))

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(
      screen.getByRole('button', { name: /start partitioning/i }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('partition-bubble')).not.toBeInTheDocument()
  })

  it('plays at the selected speed and pauses for manual stepping', async () => {
    vi.useFakeTimers()
    try {
      const expected = computeReductionTrace(
        fixedPoset,
        createEmptyColoring<FixedElementId>(),
      )
      render(<App />)
      fireEvent.click(
        screen.getByRole('button', { name: /start partitioning/i }),
      )
      fireEvent.change(screen.getByRole('combobox', { name: /speed/i }), {
        target: { value: '2' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Play' }))

      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
      await act(() => vi.advanceTimersByTimeAsync(600))
      expect(
        screen.getByRole('heading', { name: 'Step 2 of 21' }),
      ).toBeVisible()
      expect(screen.getAllByTestId('partition-bubble')).toHaveLength(
        expected.partitions[1]!.blocks.length,
      )

      fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
      await act(() => vi.advanceTimersByTimeAsync(1200))
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
