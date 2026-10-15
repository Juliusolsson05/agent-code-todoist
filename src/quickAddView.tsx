import { defineView } from 'agent-code-extension-api'
import { createRoot } from 'react-dom/client'

import styles from './styles.css?inline'
import { BridgeContext, createBridge } from './ui/bridge'
import { injectStyles, syncColorScheme, syncTheme } from './ui/injectStyles'
import { QuickAddModal } from './ui/QuickAddModal'

// The Quick Add modal view (`todoist.quickAdd`, mount: "modal"). The host sizes
// the modal to its content, so the root has a fixed width and natural height.
export default defineView({
  mount(element, context) {
    injectStyles(styles)
    const stopScheme = syncColorScheme()
    const stopTheme = syncTheme(context.runtime)
    const root = createRoot(element)
    root.render(
      <BridgeContext.Provider value={createBridge(context)}>
        <QuickAddModal />
      </BridgeContext.Provider>,
    )
    return () => {
      stopScheme()
      stopTheme()
      queueMicrotask(() => root.unmount())
    }
  },
})
