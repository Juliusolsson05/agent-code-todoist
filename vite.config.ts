import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { extensionViteConfig } from 'agent-code-extension-api'

// Same shape as Skitgubbe/Mini Games on purpose so all extension repos fail and
// get fixed the same way.
//
// extensionViteConfig() supplies the load-bearing parts: independent v2 runtime
// and view modules, the process.env.NODE_ENV define (frames have no `process`),
// and the pinned production JSX transform. We spread its `define`/`build` rather
// than cherry-picking deeper keys because the preset also owns `esbuild.jsxDev`.
//
// Three entries, three frames: the hidden runtime, the panel, and the quick-add
// modal. The two views share chunks (React, the shared model); the installer
// serves contained sibling chunks, and they are committed with dist/.
//
// Always build with NODE_ENV=production (see README): a dev build emits jsxDEV,
// which is undefined in the sandboxed frame.
const preset = extensionViteConfig({
  entries: {
    runtime: 'src/runtime.ts',
    view: 'src/view.tsx',
    quickAddView: 'src/quickAddView.tsx',
  },
}) as UserConfig

export default defineConfig({
  plugins: [react()],
  define: preset.define,
  esbuild: preset.esbuild,
  build: {
    ...preset.build,
    minify: 'esbuild',
    target: 'es2022',
    emptyOutDir: true,
    outDir: 'dist',
    rollupOptions: {
      ...preset.build?.rollupOptions,
      // Stable shared-chunk names: content hashes would rename the committed
      // chunk on every build and turn each release diff into delete+add noise.
      output: { ...(preset.build?.rollupOptions?.output as object), chunkFileNames: 'shared-[name].js' },
    },
  },
})
