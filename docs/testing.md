# Testing

## Unit tests (Vitest)

```bash
npm test              # single run
npm run test:watch    # watch mode
npm run coverage      # with coverage report
```

Tests live in `tests/unit/`. Each `src/core/` module has a corresponding test file.

## E2E tests (Playwright)

```bash
npx playwright install # one-time browser install
npm run e2e
```

Tests live in `tests/e2e/`. Playwright starts the preview server automatically.

## Coverage targets

| Metric     | Target |
| ---------- | ------ |
| Statements | 90%    |
| Branches   | 85%    |
| Functions  | 90%    |
| Lines      | 90%    |

Core logic targets ~100%.

## Forbidden-term check

```bash
npm run check:terms
```

Fails if the forbidden product term appears in tracked source files.

## Full Local Gate

```bash
npm run ci
```

This runs terminology, formatting, lint, typecheck, coverage, production build,
HTML validation, privacy checks, E2E tests, and Lighthouse CI in the same order
as the package script.
