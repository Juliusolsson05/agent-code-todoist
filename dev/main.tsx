import panel from '../src/view'
import quickAdd from '../src/quickAddView'
import { createFakeContext } from './fakeHost'

// Preview entry: ?view=panel|modal &theme=nord|light &state=ready|td-missing|signed-out|login|installing
//
// Theme values are copied from agent-code src/renderer/src/styles.css (Nord is
// the default mode; Light is [data-mode="light"]) and the Frost accent from
// src/renderer/src/app-state/settings/types.ts, so screenshots show the frame
// the way Agent Code paints it. The host pushes these same --theme-* tokens into
// the real frame before mount.
const THEMES: Record<string, Record<string, string>> = {
  nord: {
    '--theme-canvas': '#171b21', '--theme-surface': '#20242d', '--theme-surface-hi': '#262b35',
    '--theme-ink': '#d8dee9', '--theme-ink-dim': 'rgba(216, 222, 233, 0.68)', '--theme-muted': 'rgba(216, 222, 233, 0.42)',
    '--theme-border': '#262b35', '--theme-border-hi': '#3b4252', '--theme-accent': '#88c0d0', '--theme-accent-fg': '#171b21',
    '--theme-danger': '#bf616a',
  },
  light: {
    '--theme-canvas': '#faf9f6', '--theme-surface': '#f1efe9', '--theme-surface-hi': '#e8e5dc',
    '--theme-ink': '#19181a', '--theme-ink-dim': '#4a4a48', '--theme-muted': '#6f6b62',
    '--theme-border': '#e2ddd1', '--theme-border-hi': '#c8c3b5', '--theme-accent': '#5e81ac', '--theme-accent-fg': '#faf9f6',
    '--theme-danger': '#c0392b',
  },
}

const params = new URLSearchParams(location.search)
const theme = THEMES[params.get('theme') ?? 'nord'] ?? THEMES.nord
for (const [k, v] of Object.entries(theme)) document.documentElement.style.setProperty(k, v)
const modal = params.get('view') === 'modal'
if (modal) document.body.classList.add('modal')
const context = createFakeContext(params.get('state') ?? 'ready', modal)
const element = document.getElementById('frame')!
;(modal ? quickAdd : panel).mount(element, context as never)
