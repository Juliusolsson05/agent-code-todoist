import { useLayoutEffect, useRef, type RefObject } from 'react'

/**
 * Animate rows to their new position when the list reorders (FLIP).
 *
 * WHY: pressing `1` on a task re-sorts Today by priority at once — correct,
 * but the row teleported and the eye lost it (evaluator 4 measured the
 * largest layout shift of the whole UI there). Measuring each row before and
 * after the commit and transforming it from the old spot to the new one over
 * 180 ms keeps the instant update and makes the move readable, as in Todoist.
 *
 * `listKey` changes when the user switches list: no animation then.
 */
export function useFlip(container: RefObject<HTMLElement>, order: string, listKey: string) {
  const positions = useRef(new Map<string, number>())
  const lastKey = useRef(listKey)
  useLayoutEffect(() => {
    const root = container.current
    if (!root) return
    const rows = root.querySelectorAll<HTMLElement>('[data-task-id]')
    const next = new Map<string, number>()
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const sameList = lastKey.current === listKey
    lastKey.current = listKey
    // Positions in the LIST's coordinates (not the viewport's), so scrolling
    // between two renders never looks like a reorder.
    const origin = root.getBoundingClientRect().top - root.scrollTop
    for (const row of rows) {
      const id = row.dataset.taskId!
      const top = row.getBoundingClientRect().top - origin
      next.set(id, top)
      const before = positions.current.get(id)
      if (!sameList || reduce || before === undefined) continue
      const delta = before - top
      if (Math.abs(delta) < 2) continue
      row.style.transition = 'none'
      row.style.transform = `translateY(${delta}px)`
      requestAnimationFrame(() => {
        row.style.transition = 'transform 180ms cubic-bezier(.2, 0, 0, 1)'
        row.style.transform = ''
        // Hand transitions back to the stylesheet (hover/focus background).
        setTimeout(() => { row.style.transition = '' }, 200)
      })
    }
    positions.current = next
  }, [container, order, listKey])
}
