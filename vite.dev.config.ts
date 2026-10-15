import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standalone browser preview of the REAL view modules against a fake runtime fed
// by the SDK-derived fixtures (dev/fakeHost.ts). It exists so the UI can be
// reviewed and screenshotted without launching Agent Code, which is a standing
// rule for this codebase's agents. Not part of the extension bundle.
export default defineConfig({
  root: 'dev',
  plugins: [react()],
  server: { port: 5199, strictPort: true },
})
