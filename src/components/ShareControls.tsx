import { useRef, useState } from 'react'

interface ShareControlsProps {
  readonly shareCode: string
  readonly onLoad: (code: string) => string | null
}

export function ShareControls({ shareCode, onLoad }: ShareControlsProps) {
  const codeRef = useRef<HTMLTextAreaElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeRef.current?.value ?? shareCode)
      setMessage('Code copied.')
      setIsError(false)
    } catch {
      setMessage('Copy failed. Select and copy the code manually.')
      setIsError(true)
    }
  }

  const loadCode = () => {
    const error = onLoad(codeRef.current?.value ?? '')
    setMessage(error ?? 'Poset and coloring loaded.')
    setIsError(Boolean(error))
  }

  return (
    <section className="share-controls" aria-labelledby="share-title">
      <div>
        <p className="eyebrow">Share setup</p>
        <h3 id="share-title">Poset and coloring code</h3>
      </div>
      <textarea
        key={shareCode}
        ref={codeRef}
        aria-label="Poset and coloring share code"
        defaultValue={shareCode}
        rows={4}
        spellCheck={false}
      />
      <div className="share-actions">
        <button className="secondary-button" type="button" onClick={copyCode}>
          Copy code
        </button>
        <button className="secondary-button" type="button" onClick={loadCode}>
          Load code
        </button>
      </div>
      {message && (
        <p
          className="share-message"
          data-error={isError}
          role={isError ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}
    </section>
  )
}
