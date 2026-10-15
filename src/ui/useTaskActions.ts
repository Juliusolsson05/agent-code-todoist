import { useMemo, useRef } from 'react'

import { contentPreview } from '../shared/quickAddTokens'
import type { QuickAddIntent } from '../shared/quickAddPlan'
import type { ListQuery, TaskPatch, TaskRow } from '../shared/types'
import type { Bridge } from './bridge'
import { presetDue, store } from './store'

// Every action the user can take on a task, applied LOCALLY first and synced
// behind (Todoist's model). The store's change feed then carries the server's
// answer to every open view.
//
// Timings follow Todoist's own feel (snappiness evaluation, evaluator 6):
//   complete   check + strike 0 ms → row collapses at 250 ms over 200 ms →
//              gone at ~450 ms; the toast (with Undo) appears at the CLICK,
//              not when the server answers. Never "un-completes" on screen
//              (beta.4 cleared its marker on a timer and the row came back).
//   edits      priority, preset dates, labels, moves: shown at once; the row
//              leaves a list it no longer belongs to at once.
//   add        a pending row appears at Enter, replaced by the real one.

export const CHECK_MS = 250
export const COLLAPSE_MS = 200

export type ActionCallbacks = {
  toast: (message: string, extra?: { tone?: 'error'; action?: { label: string; run: () => void }; completion?: string }) => void
  fail: (error: unknown) => void
  /** Called when a task has left the list (collapse done), so focus can move on. */
  onGone: (id: string) => void
}

let pendingSeq = 0

export function useTaskActions(bridge: Bridge, callbacks: ActionCallbacks) {
  const cb = useRef(callbacks)
  cb.current = callbacks
  // Ids with a complete/reopen in flight: a double click must not complete a
  // recurring task twice (it would skip an occurrence). A ref: the second
  // click arrives before React re-renders.
  const toggling = useRef(new Set<string>())

  return useMemo(() => {
    const complete = (task: TaskRow) => {
      if (toggling.current.has(task.id)) return
      toggling.current.add(task.id)
      const done = () => toggling.current.delete(task.id)
      if (task.completedAt) {
        // Reopening from the Completed list.
        store.hide(task.id)
        void store.serialize(task.id, () => bridge.call('uncomplete', { id: task.id })).then(
          () => cb.current.toast('Task reopened'),
          error => { store.unhide(task.id); cb.current.fail(error) },
        ).finally(done)
        return
      }
      store.setPhase(task.id, 'checked')
      if (task.due?.recurring) {
        // A recurring task stays in the list at its next date: flash the
        // check, then the server's answer moves the date (no collapse).
        cb.current.toast(`Completed — next: ${task.due.string}`)
        void store.serialize(task.id, () => bridge.call('complete', { id: task.id })).then(
          () => {},
          error => cb.current.fail(error),
        ).finally(() => { setTimeout(() => store.setPhase(task.id, null), CHECK_MS + COLLAPSE_MS); done() })
        return
      }
      store.hide(task.id)
      setTimeout(() => store.isHidden(task.id) && store.setPhase(task.id, 'collapsing'), CHECK_MS)
      setTimeout(() => {
        if (!store.isHidden(task.id)) return
        store.setPhase(task.id, null)
        cb.current.onGone(task.id)
      }, CHECK_MS + COLLAPSE_MS)
      let undone = false
      cb.current.toast('Task completed', {
        completion: task.id,
        action: {
          label: 'Undo',
          run: () => {
            undone = true
            store.unhide(task.id)
            void store.serialize(task.id, () => bridge.call('uncomplete', { id: task.id })).catch(error => cb.current.fail(error))
          },
        },
      })
      void store.serialize(task.id, () => bridge.call('complete', { id: task.id })).then(
        () => {},
        error => { if (!undone) store.unhide(task.id); cb.current.fail(error) },
      ).finally(done)
    }

    /** Any field edit. Preset dates and everything except free-text dates are
     *  shown at once; a free-text date waits for Todoist's parser (the row is
     *  marked pending meanwhile — never a guessed date). */
    const update = (task: TaskRow, patch: TaskPatch) => {
      const local: Partial<TaskRow> = {}
      if (patch.content !== undefined) local.content = patch.content
      if (patch.description !== undefined) local.description = patch.description
      if (patch.priority !== undefined) local.priority = patch.priority as TaskRow['priority']
      if (patch.labels !== undefined) local.labels = patch.labels
      if (patch.deadline !== undefined) local.deadline = patch.deadline || null
      if (patch.due !== undefined) {
        const due = presetDue(patch.due)
        if (due !== undefined) local.due = due
      }
      return store.edit(task.id, local, () => bridge.call('update', { id: task.id, ...patch })).catch(error => { cb.current.fail(error); throw error })
    }

    const move = (task: TaskRow, target: { projectId: string; sectionId: string | null }) =>
      store.edit(task.id, { projectId: target.projectId, sectionId: target.sectionId }, () =>
        bridge.call('move', { id: task.id, projectId: target.projectId, ...(target.sectionId ? { sectionId: target.sectionId } : { noSection: true }) }),
      ).catch(error => { cb.current.fail(error); throw error })

    const remove = (id: string, name: string) => {
      store.hide(id)
      cb.current.onGone(id)
      void store.serialize(id, () => bridge.call('delete', { id })).then(
        () => cb.current.toast(`Deleted “${name}”`),
        error => { store.unhide(id); cb.current.fail(error) },
      )
    }

    /**
     * Quick add with the view's intent, in one request (server addWithIntent).
     * A pending row is in the list at once, shown dimmed; the real task
     * replaces it. Resolves false only when NOTHING was created (the editor
     * then keeps the text).
     */
    const add = async (text: string, intent: QuickAddIntent, into: ListQuery): Promise<boolean> => {
      const pendingId = `pending-${++pendingSeq}`
      const due = intent.due ? presetDue(intent.due) : null
      store.insert(into, {
        id: pendingId,
        content: contentPreview(text) || text,
        description: intent.note ?? '',
        priority: (intent.priority ?? 1) as TaskRow['priority'],
        due: due ?? null,
        deadline: null,
        duration: null,
        projectId: intent.projectId ?? intent.inboxId ?? '',
        sectionId: intent.sectionId ?? null,
        parentId: null,
        labels: intent.labels ?? [],
        order: Number.MAX_SAFE_INTEGER,
        commentCount: 0,
        completedAt: null,
        url: '',
      })
      try {
        const result = await bridge.call('addWithIntent', { text, intent })
        store.drop(pendingId)
        store.insert(into, result.task)
        if (result.partial) cb.current.toast(result.partial, { tone: 'error' })
        return true
      } catch (error) {
        store.drop(pendingId)
        cb.current.fail(error)
        return false
      }
    }

    /** Undo a completion from the task view (the task is still hidden). */
    const reopen = (task: TaskRow) => {
      store.unhide(task.id)
      void store.serialize(task.id, () => bridge.call('uncomplete', { id: task.id })).catch(error => cb.current.fail(error))
    }

    return { complete, reopen, update, move, remove, add, isPendingRow: (id: string) => id.startsWith('pending-') }
  }, [bridge])
}

export type TaskActions = ReturnType<typeof useTaskActions>
