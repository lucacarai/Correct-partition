import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

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
