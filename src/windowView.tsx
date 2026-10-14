import { defineView } from 'agent-code-extension-api'
import { createRoot } from 'react-dom/client'

import styles from './styles.css?inline'
import { App } from './ui/App'
import { BridgeContext, createBridge } from './ui/bridge'
import { injectStyles, syncColorScheme } from './ui/injectStyles'

// The full Todoist workspace in a floating modal (`todoist.window`, command
// "Todoist: Open in Modal") — the same App as the pane, for a quick look
// without giving up a lane. Owner request after the first beta.
//
// WHY a separate entry and not the pane's view.js with a flag: the host gives
// a view nothing but its own manifest id, and one module per view keeps the
// "which frame am I" decision static instead of sniffing context.view.id.
export default defineView({
  mount(element, context) {
    injectStyles(styles)
    const stopScheme = syncColorScheme()
    const root = createRoot(element)
    root.render(
      <BridgeContext.Provider value={createBridge(context)}>
        <App variant="modal" />
      </BridgeContext.Provider>,
    )
    return () => {
      stopScheme()
      queueMicrotask(() => root.unmount())
    }
  },
})
