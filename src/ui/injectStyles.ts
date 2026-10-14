const STYLE_ID = 'agent-code-todoist-styles'

// The host never loads sibling stylesheets for us (authoring.md §4: "CSS must be
// loaded by your view"), so the stylesheet is imported `?inline` and injected
// once per frame document. Idempotent because a frame can remount its view.
export function injectStyles(css: string): void {
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = css
  document.head.append(el)
}

/**
 * Keep the frame's `color-scheme` in step with the host theme.
 *
 * WHY: native controls (the date input's calendar glyph, select arrows,
 * scrollbars) are drawn by the browser from `color-scheme`, not from our CSS
 * variables. The host pushes --theme-* tokens as inline styles on <html> but no
 * light/dark flag, so on a dark Agent Code theme the date picker icon rendered
 * black-on-dark. We derive the scheme from the canvas colour's luminance and
 * re-derive whenever the host rewrites the inline style (theme change).
 */
export function syncColorScheme(): () => void {
  const root = document.documentElement
  const apply = () => {
    const probe = document.createElement('div')
    probe.style.color = getComputedStyle(root).getPropertyValue('--theme-canvas').trim() || '#1e1f22'
    document.body.append(probe)
    const rgb = getComputedStyle(probe).color.match(/[\d.]+/g)?.map(Number) ?? [30, 31, 34]
    probe.remove()
    const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
    const scheme = luminance > 0.5 ? 'light' : 'dark'
    if (root.style.colorScheme !== scheme) root.style.colorScheme = scheme
  }
  apply()
  const observer = new MutationObserver(apply)
  observer.observe(root, { attributes: true, attributeFilter: ['style'] })
  return () => observer.disconnect()
}
