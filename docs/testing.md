# Testing

_Full documentation written in Phase 5._

## Unit tests (Vitest)

```bash
npm test              # single run
npm run test:watch    # watch mode
npm run coverage      # with coverage report
```

Tests live in `tests/unit/`. Each `src/core/` module has a corresponding test file.

## E2E tests (Playwright)

```bash
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
