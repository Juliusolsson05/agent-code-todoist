import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

// A small anchored popover rendered inside the frame.
//
// WHY hand-rolled: the extension frame is its own document (no host portal,
// no host UI kit), and the popovers we need are simple menus. It positions
// itself under the anchor, flips above when there is no room (the panel can be
// a short pane), clamps horizontally, and closes on outside pointer / Escape.
//
// Escape handling matters beyond this component: the HOST closes the whole
// extension view on an unhandled Escape (authoring.md §2). Every Escape we
// consume calls preventDefault + stopPropagation so closing a menu never closes
// the pane.

export function Popover({ anchor, onClose, children, width = 260, align = 'start' }: {
  anchor: HTMLElement | null
  onClose: () => void
  children: ReactNode
  width?: number
  align?: 'start' | 'end'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number } | null>(null)

  useLayoutEffect(() => {
    if (!anchor) return
    const place = () => {
      const rect = anchor.getBoundingClientRect()
      const height = ref.current?.offsetHeight ?? 240
      const vw = window.innerWidth
      const vh = window.innerHeight
      const below = vh - rect.bottom - 8
      const above = rect.top - 8
      const openUp = below < Math.min(height, 220) && above > below
      const maxHeight = Math.max(140, (openUp ? above : below) - 4)
      const top = openUp ? Math.max(4, rect.top - 4 - Math.min(height, maxHeight)) : rect.bottom + 4
      const w = Math.min(width, vw - 16)
      const rawLeft = align === 'end' ? rect.right - w : rect.left
      setPos({ top, left: Math.max(8, Math.min(rawLeft, vw - w - 8)), maxHeight })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [anchor, width, align])

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (ref.current?.contains(target) || anchor?.contains(target)) return
      onClose()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('pointerdown', onPointer, true)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', onPointer, true)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [anchor, onClose])

  return (
    <div
      ref={ref}
      className="td-popover"
      role="dialog"
      style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: Math.min(width, window.innerWidth - 16), maxHeight: pos?.maxHeight }}
    >
      {children}
    </div>
  )
}

/** Arrow-key navigation for a list of menu items inside a popover. Returns the
 *  active index and a keydown handler for the popover's search input. */
export function useMenuKeys(count: number, onPick: (index: number) => void) {
  const [active, setActive] = useState(0)
  useEffect(() => { setActive(index => Math.min(index, Math.max(0, count - 1))) }, [count])
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(i => (count ? (i + 1) % count : 0)) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(i => (count ? (i - 1 + count) % count : 0)) }
    else if (event.key === 'Enter') { event.preventDefault(); if (count) onPick(active) }
  }
  return { active, setActive, onKeyDown }
}
