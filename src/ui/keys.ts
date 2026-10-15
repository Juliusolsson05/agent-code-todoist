// Keyboard plumbing shared by the pane and the modal.
//
// WHY `document`, bubble phase: Agent Code's frame bootstrap registers its own
// `window` keydown listener BEFORE our module loads (agent-code
// src/main/extensions/frameDocument.ts) and turns an Escape it sees with
// `defaultPrevented === false` into "close this pane". Listeners on the same
// target run in registration order, so a `window` listener of ours runs after
// the host's has already decided — our preventDefault came too late and Escape
// closed the whole pane instead of the drawer (review of PR #2, reproduced in
// Chromium). An event reaches `document` before `window`, so a listener here
// always runs first.
//
// WHY not capture phase: capture would run BEFORE React's handlers and the
// popovers' own Escape handling, so one Escape would close the drawer AND the
// date picker inside it. In the bubble phase on `document`, everything deeper
// has already had its turn; it signals "handled" with preventDefault, which we
// check (and so does the host).

export function onKeyAfterReact(handler: (event: KeyboardEvent) => void): () => void {
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}

/** Elements that Enter/Space already activate natively. A global shortcut
 *  must leave those keys to them. */
export function isActivatable(target: EventTarget | null): boolean {
  return target instanceof Element
    && !!target.closest('button, a[href], summary, select, [role="button"], [role="menuitem"], [role="menuitemcheckbox"], [role="option"], [role="checkbox"], [role="tab"], [role="switch"]')
}
