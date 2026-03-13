# Testing Guide

presentMD uses [Vitest](https://vitest.dev/) with
[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro)
for unit and component tests.

---

## Running tests

| Command | What it does |
|---------|--------------|
| `npm test` | Start Vitest in **watch mode** – re-runs affected tests on every file save |
| `npm run test:run` | Single, non-interactive run – useful in CI or before committing |
| `npm run test:ui` | Open the [Vitest browser UI](https://vitest.dev/guide/ui) for visual test exploration |
| `npm run test:coverage` | Run all tests **and** generate a code-coverage report |

---

## Code coverage

### Generating the report

```bash
npm run test:coverage
```

After the run you will see a summary table printed directly in the terminal,
and two additional artefacts written to `./coverage/`:

| Artefact | How to use |
|----------|-----------|
| `coverage/index.html` | Open in any browser for a **line-by-line, colour-coded** view of which branches were executed |
| `coverage/lcov.info` | Machine-readable LCOV file consumed by CI services (Codecov, Coveralls, SonarCloud) |

> `coverage/` is git-ignored – never commit it.

### Opening the HTML report

```bash
# macOS
open coverage/index.html

# Linux
xdg-open coverage/index.html

# Windows
start coverage/index.html
```

### Coverage thresholds

The run **fails** if any metric drops below the values configured in
`vitest.config.ts`:

| Metric | Minimum |
|--------|---------|
| Statements | 80 % |
| Branches | 75 % |
| Functions | 85 % |
| Lines | 80 % |

These thresholds apply only to the files actively under test (see the
`coverage.exclude` list in `vitest.config.ts`). Complex UI components, page
components, and third-party generated files are excluded because they require
full browser integration tests rather than unit tests.

**Raise the thresholds** whenever you add tests for previously-uncovered code.

---

## Google Analytics in tests

The GA Measurement ID is injected at build time via the
`GOOGLE_ANALYTICS_ID` environment variable.  `vitest.config.ts` mirrors the
same `define` entry so the `__GA_ID__` constant is always available without
triggering a `ReferenceError` during tests.

To verify GA initialisation locally with a real ID:

```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXX npm run test:run
```

---

## Test file locations

Tests live next to the code they cover in `__tests__/` subdirectories:

```
src/
├── components/
│   ├── __tests__/
│   │   └── ErrorBoundary.test.tsx
│   └── slides/
│       └── __tests__/
│           └── utils.test.ts
├── constants/
│   └── __tests__/
│       └── index.test.ts
├── contexts/
│   └── __tests__/
│       └── ThemeContext.test.tsx
├── hooks/
│   └── __tests__/
│       ├── use-toast.test.ts
│       ├── useAIGenerate.test.ts
│       ├── usePresentationMode.test.ts
│       └── useThemeLoader.test.ts
└── lib/
    └── __tests__/
        ├── analytics.test.ts
        ├── errorHandler.test.ts
        ├── logger.test.ts
        └── utils.test.ts
```

---

## Writing new tests

1. Create `__tests__/<filename>.test.ts(x)` beside the file you're testing.
2. Use `describe` / `it` / `expect` (all auto-imported via `globals: true`).
3. React components → use `@testing-library/react`; pure functions → plain
   Vitest assertions.
4. Run `npm test` in watch mode while you write – Vitest will re-run on save.
5. Run `npm run test:coverage` before opening a PR to confirm thresholds still
   pass.
