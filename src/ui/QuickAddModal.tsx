import { useEffect, useMemo, useRef, useState } from 'react'

import { colorHex, PRIORITY_COLORS } from '../shared/colors'
import { isAgentSession } from '../shared/agents'
import { contentPreview, tokenize } from '../shared/quickAddTokens'
import type { AgentLink, ApiPriority, Meta, SectionRow } from '../shared/types'
import { tdErrorMessage } from '../shared/types'
import { useBridge, useHostState } from './bridge'
import { AgentIcon, CalendarIcon, FlagFilledIcon, InboxIcon, LabelIcon } from './Icons'
import { DuePicker, LabelPicker, PriorityPicker, ProjectPicker, type ProjectTarget } from './pickers'
import { SetupScreen } from './SetupScreen'

// The Quick Add modal (`todoist.quickAdd`, ⌘⌥T by default).
//
// It is a SEPARATE view module from the panel on purpose: a modal must open fast
// from anywhere, so it carries no list, no sidebar and no drawer — just the
// natural-language field, the four pickers, and an optional link to an agent.
//
// Agent link: the one thing only Agent Code can add to a Todoist task. The view
// API exposes sessions/panes/workspace observation (granted at install), so we
// can list the agents in the ACTIVE tab first and stamp the chosen one into the
// task description ("From agent: <title> — <cwd>"). That turns "remind me to
// review what this agent did" into one keystroke.

export function QuickAddModal() {
  const bridge = useBridge()
  const host = useHostState(bridge)
  const [baseMeta, setMeta] = useState<Meta | null>(null)
  const [sectionCache, setSectionCache] = useState<Record<string, SectionRow[]>>({})
  const [text, setText] = useState('')
  const [target, setTarget] = useState<ProjectTarget | null>(null)
  const [due, setDue] = useState('')
  const [priority, setPriority] = useState<ApiPriority>(1)
  const [labels, setLabels] = useState<string[]>([])
  const [agents, setAgents] = useState<AgentLink[]>([])
  const [agentId, setAgentId] = useState<string | null>(null)
  const [menu, setMenu] = useState<null | 'project' | 'due' | 'priority' | 'labels'>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState<string | null>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const refs = { project: useRef<HTMLButtonElement>(null), due: useRef<HTMLButtonElement>(null), priority: useRef<HTMLButtonElement>(null), labels: useRef<HTMLButtonElement>(null) }
  const ready = host?.setup?.state === 'ready'

  useEffect(() => { void bridge.call('status', {}).catch(() => {}) }, [bridge])
  useEffect(() => {
    if (!ready) return
    bridge.call('meta', {}).then(setMeta, () => {})
  }, [bridge, ready, host?.revision])

  useEffect(() => {
    const api = bridge.context.api
    let alive = true
    const read = async () => {
      try {
        const [sessions, workspace, panes] = await Promise.all([api.sessions.observe(), api.workspace.observe(), api.panes.observe()])
        if (!alive) return
        const activeLeaves = new Set(panes.find(p => p.tabId === workspace.activeTabId)?.leafSessionIds ?? [])
        const list: AgentLink[] = sessions
          .filter(s => isAgentSession(s.kind))
          .map(s => ({ id: s.id, title: s.title || s.kind || 'Agent', cwd: s.cwd, kind: s.kind, inActiveTab: activeLeaves.has(s.id), working: s.activity === 'working' }))
          .sort((a, b) => Number(b.inActiveTab) - Number(a.inActiveTab) || a.title.localeCompare(b.title))
        setAgents(list.slice(0, 12))
      } catch {
        // Observation permissions may be absent (older host / declined) — the
        // modal simply has no agent row then.
      }
    }
    void read()
    let unsubscribe = () => {}
    try { unsubscribe = api.sessions.subscribe(() => void read()) } catch { /* no permission */ }
    return () => { alive = false; unsubscribe() }
  }, [bridge])

  // Sections load per project (see server/handlers.ts meta): the Inbox's on
  // open, and whichever project the user picks so a second pick can choose a
  // section inside it.
  const sectionsFor = target?.projectId ?? baseMeta?.projects.find(p => p.isInbox)?.id
  useEffect(() => {
    if (!sectionsFor || sectionCache[sectionsFor]) return
    bridge.call('sections', { projectId: sectionsFor }).then(list => setSectionCache(c => ({ ...c, [sectionsFor]: list })), () => {})
  }, [bridge, sectionsFor, sectionCache])
  const meta = useMemo<Meta | null>(() => (baseMeta ? { ...baseMeta, sections: Object.values(sectionCache).flat() } : null), [baseMeta, sectionCache])

  const tokens = useMemo(() => tokenize(text), [text])
  const project = meta?.projects.find(p => p.id === target?.projectId) ?? meta?.projects.find(p => p.isInbox)
  const section = meta?.sections.find(s => s.id === target?.sectionId)
  const agent = agents.find(a => a.id === agentId) ?? null

  const submit = async (keepOpen: boolean) => {
    const line = text.trim()
    if (!line || busy) return
    setBusy(true)
    setError(null)
    // The line goes to Todoist's parser untouched; the pickers are applied
    // after it, in the SAME request (server addWithIntent): one change for
    // every open view instead of two or three (src/shared/quickAddPlan.ts).
    const inboxId = baseMeta?.projects.find(p => p.isInbox)?.id ?? null
    const submitted = line
    // Clear at submit: "add another" (⇧↵) can be typed while this one saves.
    setText('')
    try {
      const result = await bridge.call('addWithIntent', {
        text: submitted,
        intent: {
          due: due || null,
          priority,
          labels,
          projectId: target?.projectId ?? null,
          sectionId: target?.sectionId ?? null,
          inboxId,
          note: agent ? agentNote(agent) : null,
        },
      })
      if (result.partial) {
        // The task exists: say exactly what did not happen; never re-add.
        setError(result.partial)
      } else if (keepOpen) {
        setAdded(result.task.content)
        setTimeout(() => setAdded(null), 2500)
      } else {
        await bridge.context.api.ui.close()
        return
      }
      input.current?.focus()
    } catch (e) {
      // Nothing was created: give the text back unless a new line was started.
      setText(current => current || submitted)
      setError(tdErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (!ready) {
    return <div className="td-root td-modal-root"><SetupScreen setup={host?.setup ?? null} onRetry={async () => { await bridge.call('status', { refresh: true }) }} /></div>
  }

  return (
    <div className="td-root td-modal-root">
      <div className="td-qa">
        <div className="td-qa-field">
          <div className="td-qa-mirror" aria-hidden="true">
            {tokens.map((token, i) => <span key={i} className={`tok-${token.kind}`}>{token.text}</span>)}{'​'}
          </div>
          <textarea
            ref={input}
            autoFocus
            rows={1}
            value={text}
            spellCheck={false}
            placeholder={'Task name — try "Review PR tomorrow 3pm p1 #Work @review"'}
            onChange={e => setText(e.target.value.replace(/\n/g, ' '))}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault()
                void submit(e.shiftKey)
              }
            }}
          />
        </div>
        {tokens.some(t => t.kind !== 'text') && contentPreview(text) && (
          <div className="td-qa-preview">Adds “<b>{contentPreview(text)}</b>”</div>
        )}

        <div className="td-qa-chips">
          <button ref={refs.due} className={`td-qa-chip${due ? ' is-set' : ''}`} onClick={() => setMenu('due')}><CalendarIcon size={13} />{due || 'Date'}</button>
          <button ref={refs.priority} className={`td-qa-chip${priority > 1 ? ' is-set' : ''}`} onClick={() => setMenu('priority')}>
            <FlagFilledIcon size={13} color={priority === 1 ? 'var(--td-muted)' : PRIORITY_COLORS[priority]} />{priority > 1 ? `P${5 - priority}` : 'Priority'}
          </button>
          <button ref={refs.labels} className={`td-qa-chip${labels.length ? ' is-set' : ''}`} onClick={() => setMenu('labels')}><LabelIcon size={13} />{labels.length ? labels.join(', ') : 'Labels'}</button>
        </div>
        {/* Inline: Agent Code sizes this modal from its content and clips
            anything floating outside it (evaluator 7: pickers 45–58% cut off). */}
        {menu === 'due' && <DuePicker inline anchor={refs.due.current} current={due} onPick={setDue} onClose={() => setMenu(null)} />}
        {menu === 'priority' && <PriorityPicker inline anchor={refs.priority.current} current={priority} onPick={setPriority} onClose={() => setMenu(null)} />}
        {menu === 'labels' && meta && (
          <LabelPicker inline anchor={refs.labels.current} labels={meta.labels} selected={labels} onChange={setLabels}
            onCreate={async name => { await bridge.call('createLabel', { name }); setMeta(await bridge.call('meta', {})) }}
            onClose={() => setMenu(null)} />
        )}
        {menu === 'project' && meta && <ProjectPicker inline anchor={refs.project.current} meta={meta} current={target ?? undefined} onPick={setTarget} onClose={() => setMenu(null)} />}

        {agents.length > 0 && (
          <div className="td-qa-agents">
            <span className="td-qa-agents-label"><AgentIcon size={13} /> Link to agent</span>
            <div className="td-qa-agent-list">
              {agents.map(a => (
                <button
                  key={a.id}
                  className={`td-agent-chip${agentId === a.id ? ' is-on' : ''}`}
                  title={a.cwd}
                  onClick={() => setAgentId(agentId === a.id ? null : a.id)}
                >
                  <span className={`td-agent-dot${a.working ? ' is-working' : ''}`} />
                  {a.title}
                  {a.inActiveTab && <span className="td-dim"> · this tab</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="td-warn">{error}</div>}

        <div className="td-qa-foot">
          <button ref={refs.project} className="td-qa-project" onClick={() => setMenu('project')}>
            {project?.isInbox || !project ? <InboxIcon size={14} /> : <span className="td-dot" style={{ background: colorHex(project.color) }} />}
            {project?.name ?? 'Inbox'}{section ? <span className="td-dim"> / {section.name}</span> : null}
          </button>
          <span className="td-qa-hint">{added ? <>Added “{added}”</> : <><kbd>↵</kbd> add · <kbd>⇧↵</kbd> add another</>}</span>
          <button className="td-btn td-btn-ghost" onClick={() => void bridge.context.api.ui.close()}>Cancel</button>
          <button className="td-btn td-btn-primary" disabled={!text.trim() || busy} onClick={() => void submit(false)}>
            {busy ? <span className="td-spinner" /> : null} Add task
          </button>
        </div>
      </div>

    </div>
  )
}

function agentNote(agent: AgentLink): string {
  return `From agent: **${agent.title}** — \`${agent.cwd}\``
}
