import { useEffect, useState } from 'react'

import type { SetupStatus } from '../shared/types'
import { tdErrorMessage } from '../shared/types'
import { useBridge } from './bridge'
import { AppMark, ExternalIcon, RefreshIcon } from './Icons'

// The two prerequisites, as a guided flow instead of an error message.
//
// States come from the service's `status` (src/shared/types.ts SetupStatus):
//   td-missing  → offer Homebrew install (one click when brew exists), the npm
//                 command to copy, or a path setting for unusual installs
//   signed-out  → "Sign in with Todoist": runs `td auth login`, which opens the
//                 browser OAuth page; the token goes to the macOS Keychain
//   error       → show what td said, with Retry
// While a job runs we poll `status` every 1.5 s — the job itself lives in the
// service and outlasts any single bridge call (server/jobs.ts).

export function SetupScreen({ setup, onRetry }: { setup: SetupStatus | null; onRetry: () => Promise<void> }) {
  const bridge = useBridge()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [readOnly, setReadOnly] = useState(false)
  const [pathDraft, setPathDraft] = useState('')
  const [showPath, setShowPath] = useState(false)
  const [copied, setCopied] = useState(false)
  const job = setup?.job ?? null
  const running = job?.state === 'running'
  const elapsed = useElapsed(running ? job!.startedAt : null)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => void bridge.call('status', {}).catch(() => {}), 1500)
    return () => clearInterval(id)
  }, [running, bridge])

  const act = async (name: string, fn: () => Promise<unknown>) => {
    setBusy(name)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(tdErrorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be unavailable in the sandboxed frame; the command stays
      // selectable on screen.
    }
  }

  if (!setup) {
    return (
      <div className="td-setup">
        <div className="td-setup-card"><AppMark size={40} /><h1>Todoist</h1><p className="td-dim"><span className="td-spinner" /> Looking for the Todoist CLI…</p></div>
      </div>
    )
  }

  const failedJob = job && job.state === 'failed' ? job : null

  return (
    <div className="td-setup">
      <div className="td-setup-card">
        <AppMark size={40} />
        <h1>{setup.state === 'td-missing' ? 'Install the Todoist CLI' : setup.state === 'signed-out' ? 'Sign in to Todoist' : 'Todoist is unavailable'}</h1>

        {setup.state === 'td-missing' && !running && (
          <>
            <p>This extension runs Doist's official command-line app, <code>td</code>, on your Mac. It was not found{setup.searched.length ? ` (looked in ${setup.searched.length} places)` : ''}.</p>
            {setup.brew ? (
              <button className="td-btn td-btn-primary td-btn-lg" disabled={!!busy} onClick={() => void act('install', () => bridge.call('install', {}))}>
                {busy === 'install' ? <span className="td-spinner" /> : null} Install with Homebrew
              </button>
            ) : null}
            <div className="td-setup-alt">
              <span className="td-dim">{setup.brew ? 'Or in a terminal:' : 'Install it in a terminal:'}</span>
              <button className="td-cmd" onClick={() => void copy(setup.brew ? 'brew install todoist-cli' : 'npm install -g @doist/todoist-cli')} title="Copy">
                <code>{setup.brew ? 'brew install todoist-cli' : 'npm install -g @doist/todoist-cli'}</code>
                <span className="td-dim">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <span className="td-dim td-small">Requires Node.js 24 or newer when installed with npm.</span>
            </div>
          </>
        )}

        {setup.state === 'td-missing' && running && job?.kind === 'install' && (
          <div className="td-progress">
            <span className="td-spinner" />
            <div>
              <b>Installing todoist-cli with Homebrew…</b>
              <div className="td-dim td-small">{elapsed}. This can take a few minutes the first time.</div>
            </div>
          </div>
        )}

        {setup.state === 'signed-out' && !running && (
          <>
            <p>Sign in once with your Todoist account. Your browser opens Todoist's sign-in page; the token is stored in your macOS Keychain by <code>td</code>, never by this extension.</p>
            {setup.error && <p className="td-warn">{setup.error}</p>}
            <button className="td-btn td-btn-primary td-btn-lg" disabled={!!busy} onClick={() => void act('login', () => bridge.call('login', { readOnly }))}>
              {busy === 'login' ? <span className="td-spinner" /> : null} Sign in with Todoist
            </button>
            <label className="td-check-row">
              <input type="checkbox" checked={readOnly} onChange={e => setReadOnly(e.target.checked)} />
              Read-only access (you can view tasks but not change them)
            </label>
            <p className="td-dim td-small">Already use <code>td</code> in a terminal? Run <code>td auth login</code> there and press Check again.</p>
          </>
        )}

        {running && job?.kind === 'login' && (
          <div className="td-progress">
            <span className="td-spinner" />
            <div>
              <b>Waiting for you to approve access in your browser…</b>
              <div className="td-dim td-small">{elapsed}. Come back here when the page says you are signed in.</div>
              {job.authorizeUrl && (
                <div className="td-progress-actions">
                  <button className="td-btn" onClick={() => void bridge.call('openUrl', { url: job.authorizeUrl! })}><ExternalIcon size={13} /> Open the page again</button>
                  <button className="td-btn td-btn-ghost" onClick={() => void act('cancel', () => bridge.call('cancelJob', {}))}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        )}

        {setup.state === 'error' && <p className="td-warn">{setup.error}</p>}
        {failedJob && <p className="td-warn">{failedJob.kind === 'login' ? 'Sign-in did not finish' : 'Installation failed'}: {failedJob.detail}</p>}
        {error && <p className="td-warn">{error}</p>}

        {!running && (
          <div className="td-setup-foot">
            <button className="td-btn td-btn-ghost" disabled={!!busy} onClick={() => void act('retry', onRetry)}>
              <RefreshIcon size={13} /> Check again
            </button>
            {setup.state === 'td-missing' && (
              <button className="td-btn td-btn-ghost" onClick={() => setShowPath(v => !v)}>Set td path…</button>
            )}
          </div>
        )}

        {showPath && setup.state === 'td-missing' && (
          <form
            className="td-path-form"
            onSubmit={e => {
              e.preventDefault()
              void act('path', () => bridge.call('setSetting', { key: 'todoist.tdPath', value: pathDraft.trim() }))
            }}
          >
            <input value={pathDraft} onChange={e => setPathDraft(e.target.value)} placeholder="/Users/you/.nvm/versions/node/v24.0.0/bin/td" />
            <button className="td-btn">Use</button>
          </form>
        )}

        {setup.td && <p className="td-dim td-small td-setup-ver">td {setup.td.version} · {setup.td.path}</p>}
      </div>
    </div>
  )
}

function useElapsed(since: number | null): string {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (since === null) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [since])
  if (since === null) return ''
  const s = Math.max(0, Math.round((now - since) / 1000))
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`
}
