import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { contentPreview, tokenize } from '../shared/quickAddTokens'
import { PlusIcon } from './Icons'

// The natural-language input with live token colouring.
//
// Technique: a transparent-text <input> sits exactly on top of a mirror <div>
// that renders the same string as coloured spans. The input keeps native
// editing, IME, undo and the caret; the mirror only paints. Their font, padding
// and horizontal scroll must match exactly — `syncScroll` copies scrollLeft so
// long lines stay aligned.

export type QuickAddHandle = { focus(): void }

export const QuickAddBar = forwardRef<QuickAddHandle, {
  placeholder: string
  contextLabel?: string | null
  disabled?: boolean
  onSubmit: (text: string) => Promise<boolean>
  autoFocus?: boolean
  large?: boolean
}>(function QuickAddBar({ placeholder, contextLabel, disabled, onSubmit, autoFocus, large }, ref) {
  const [text, setText] = useState('')
  // How many adds are in flight. A count, not a flag: rapid entry ("one ⏎
  // two ⏎") runs adds side by side.
  const [pending, setPending] = useState(0)
  const busy = pending > 0
  const input = useRef<HTMLInputElement>(null)
  const mirror = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => ({ focus: () => input.current?.focus() }), [])

  const syncScroll = () => {
    if (mirror.current && input.current) mirror.current.scrollLeft = input.current.scrollLeft
  }

  const submit = async () => {
    const value = text.trim()
    if (!value) return
    // Clear at submit, not on success: the first version cleared when the add
    // FINISHED, wiping whatever the user had typed next in the meantime, and
    // ignored an Enter pressed while busy — so fast entry lost tasks (found by
    // the UI suite). An emptied field also makes a double Enter harmless.
    setText('')
    setPending(n => n + 1)
    try {
      // A failed add (offline, signed out) must not eat what the user typed:
      // put it back, unless they have already started the next line.
      if (!(await onSubmit(value))) setText(current => current || value)
    } finally {
      setPending(n => n - 1)
      requestAnimationFrame(() => input.current?.focus())
    }
  }

  const tokens = tokenize(text)
  const preview = text ? contentPreview(text) : ''
  const hasMarkers = tokens.some(token => token.kind !== 'text')

  return (
    <div className={`td-quickadd${large ? ' is-large' : ''}${busy ? ' is-busy' : ''}`}>
      <div className="td-quickadd-field">
        <span className="td-quickadd-plus"><PlusIcon /></span>
        <div className="td-quickadd-stack">
          <div ref={mirror} className="td-quickadd-mirror" aria-hidden="true">
            {tokens.map((token, index) => (
              <span key={index} className={`tok-${token.kind}`}>{token.text}</span>
            ))}
            {/* trailing space keeps the mirror's width in step with a trailing space in the input */}
            {'​'}
          </div>
          <input
            ref={input}
            className="td-quickadd-input"
            value={text}
            disabled={disabled}
            autoFocus={autoFocus}
            spellCheck={false}
            placeholder={placeholder}
            aria-label="Quick add task"
            onChange={event => { setText(event.target.value); requestAnimationFrame(syncScroll) }}
            onScroll={syncScroll}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault()
                void submit()
              } else if (event.key === 'Escape' && text) {
                // Clear first; a second Escape blurs. Never let it reach the
                // host, which would close the whole pane.
                event.preventDefault()
                event.stopPropagation()
                setText('')
              } else if (event.key === 'Escape') {
                event.preventDefault()
                event.stopPropagation()
                input.current?.blur()
              }
            }}
          />
        </div>
        <button type="button" className="td-btn td-btn-primary td-quickadd-submit" disabled={!text.trim() || disabled} onClick={() => void submit()}>
          {busy && !text.trim() ? <span className="td-spinner" /> : 'Add'}
        </button>
      </div>
      {(hasMarkers || contextLabel) && (
        <div className="td-quickadd-hint">
          {hasMarkers && preview ? <span>Adds “<b>{preview}</b>”</span> : null}
          {contextLabel ? <span className="td-dim">{contextLabel}</span> : null}
        </div>
      )}
    </div>
  )
})
