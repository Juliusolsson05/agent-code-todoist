import { defineView } from 'agent-code-extension-api'
import { createRoot } from 'react-dom/client'

import styles from './styles.css?inline'
import { App } from './ui/App'
import { BridgeContext, createBridge } from './ui/bridge'
import { injectStyles, syncColorScheme } from './ui/injectStyles'

// The panel view (`todoist.main`). Mount is synchronous by contract: render the
// React root and return cleanup; all async work lives in components.
export default defineView({
  mount(element, context) {
    injectStyles(styles)
    const stopScheme = syncColorScheme()
    const root = createRoot(element)
    root.render(
      <BridgeContext.Provider value={createBridge(context)}>
        <App />
      </BridgeContext.Provider>,
    )
    // Deferred: unmounting synchronously from inside the host's own teardown
    // can warn and drop effects (same as Skitgubbe).
    return () => {
      stopScheme()
      queueMicrotask(() => root.unmount())
    }
  },
})
