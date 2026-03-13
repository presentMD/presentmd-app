import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  // Mirror the build-time define so tests that import main.tsx or analytics.ts
  // do not see a ReferenceError for __GA_ID__.
  define: {
    __GA_ID__: JSON.stringify(process.env.GOOGLE_ANALYTICS_ID || ''),
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },

    // ── Code coverage ────────────────────────────────────────────────────────
    // Run:  npm run test:coverage
    // Report artefacts are written to ./coverage/
    coverage: {
      // V8's built-in instrumentation – no extra Babel transforms needed.
      provider: 'v8',

      // Only instrument application source files.
      include: ['src/**/*.{ts,tsx}'],

      // Files excluded from measurement:
      //   • test helpers / setup              → not production code
      //   • test files themselves             → would inflate numbers
      //   • entry point (main.tsx)            → just wires GA + React root
      //   • App.tsx                           → pure provider/router wiring, no logic
      //   • ambient type declarations         → no executable statements
      //   • shadcn/ui generated components    → third-party generated code
      //   • complex UI feature components     → require full browser integration tests
      //   • page components                   → require router integration tests
      //   • pptxExporter service              → requires heavy pptxgenjs mocking
      //
      // Note: useAIGenerate.ts is intentionally KEPT in coverage. Streaming
      // paths that require a live provider connection are annotated inline with
      // /* v8 ignore start/stop */ so only the untestable network I/O is skipped.
      exclude: [
        'src/test/**',
        'src/**/__tests__/**',
        'src/main.tsx',
        'src/App.tsx',
        'src/vite-env.d.ts',
        'src/components/ui/**',
        'src/components/features/**',
        'src/components/layout/**',
        'src/components/slides/DiagramRenderer.tsx',
        'src/components/slides/SlideRenderer.tsx',
        'src/components/CssEditor.tsx',
        'src/components/HelpDialog.tsx',
        'src/components/MarkdownEditor.tsx',
        'src/components/Preview.tsx',
        'src/components/TabbedEditor.tsx',
        'src/components/ThemeModeSwitcher.tsx',
        'src/components/ThemeSelector.tsx',
        'src/pages/**',
        'src/services/**',
        'src/config/aiProviderSetup.ts',
        'src/config/themes.ts',
      ],

      // Reporters:
      //   text  → terminal summary printed after every run
      //   lcov  → machine-readable format consumed by Codecov / Coveralls / SonarCloud
      //   html  → open coverage/index.html for a browsable line-by-line view
      reporter: ['text', 'lcov', 'html'],

      // Output directory for report artefacts (added to .gitignore).
      reportsDirectory: './coverage',

      // Minimum thresholds – the run fails if any drops below these values.
      // These reflect the currently tested surface area (lib, hooks, contexts,
      // constants, slide utils, ErrorBoundary).  Raise them as new tests land.
      thresholds: {
        statements: 80,
        branches:   75,
        functions:  85,
        lines:      80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
