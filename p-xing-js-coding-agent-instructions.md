# `p-xing.js` Coding Agent Instructions

## 1. Project mission

Create `p-xing.js`, a minimalist browser-based **pixel crossing** game.

The project must be playable directly from GitHub Pages, must live in a public GitHub repository, and must include full source code, tests, code coverage, documentation, CI, and CD.

The experience must be extremely fast:

```text
open page -> first puzzle visible -> first action -> solve -> enter 3-character score -> next puzzle
```

There must be very few clicks, no required scrolling to start playing, no account creation, and no onboarding wall.

## 2. Strict terminology

Use the term **pixel crossing** everywhere.

Do not use the word **nonogram** anywhere in the user-facing product, documentation, comments, filenames, test names, README, help text, HTML, metadata, package description, or UI.

Acceptable words:

- pixel crossing
- p-xing
- puzzle
- grid
- clues
- filled pixel
- crossed pixel
- empty pixel
- row clues
- column clues

Forbidden word:

- nonogram

Add an automated CI check that fails if the forbidden word appears in the repository.

Exception: this instruction file contains the forbidden word only to define the rule. If this file is committed, the forbidden-term check must either exclude this file or rewrite this section without the forbidden term before committing.

## 3. Core product requirements

### 3.1 Name

Project name:

```text
p-xing.js
```

Main visible product title:

```text
p-xing.js
```

Suggested tagline:

```text
pixel crossing · daily puzzle arcade
```

### 3.2 Target platform

The game must run in modern desktop and mobile browsers.

Supported browsers:

- Firefox latest
- Chrome latest
- Safari latest
- Mobile Safari
- Chrome Android

### 3.3 Hosting

The game must be deployable to GitHub Pages from the repository's `main` branch.

Use GitHub Actions with:

- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

GitHub's Pages documentation recommends uploading static files as a Pages artifact and deploying that artifact with `deploy-pages`. The workflow should use GitHub Pages as the deployment target.

Because this is a Vite app deployed under a repository path, configure the Vite `base` path correctly for `/p-xing.js/`.

### 3.4 Visual style

The UI must be:

- minimalist
- casual
- polished
- epurated
- arcade-inspired without being noisy
- readable on mobile
- fast to understand

The visual identity should support:

- light mode
- dark mode
- automatic system mode
- persistent user-selected mode

Theme options:

```text
system
light
dark
```

The first implementation can expose a two-state button, but the internal design should support all three states.

### 3.5 First-load behaviour

On first page load:

- the daily puzzle or a starter puzzle must be visible immediately
- no modal must block the game
- the help section must be hidden behind a clear Help button
- the timer must not start until the first player action
- the user must be able to start playing without choosing a mode

## 4. Game rules

### 4.1 Puzzle model

A puzzle is a rectangular grid of pixels.

Each pixel has a solution state:

```ts
type SolutionPixel = 0 | 1;
// 0 = empty
// 1 = filled
```

Each player pixel has a visible state:

```ts
type PlayerPixel = "unknown" | "filled" | "crossed";
```

Rows and columns have clues. A clue is a list of positive integers describing contiguous groups of filled pixels in that line.

For example:

```text
[3, 1] means three filled pixels, then at least one empty pixel, then one filled pixel.
```

Do not call this a nonogram in any code, UI, or docs.

### 4.2 Completion

The puzzle is solved when every filled solution pixel is marked filled by the player and every empty solution pixel is either unknown or crossed.

Crossing empty pixels is optional for completion.

A puzzle must not require the player to cross every empty pixel.

### 4.3 Mistakes

Default mode should be forgiving:

- filling an incorrect pixel counts as a mistake
- the UI may briefly indicate the mistake
- the pixel should either revert or stay marked depending on selected mode

Recommended MVP behaviour:

- incorrect fill briefly flashes
- mistake counter increments
- pixel returns to unknown

### 4.4 Hints

Hints are optional.

If implemented:

- using a hint must mark the result as an assisted score
- assisted scores must not be mixed with classic scores
- the UI must clearly show that a hint was used

### 4.5 Timer

The timer starts on the first meaningful player action:

- filling a pixel
- crossing a pixel
- erasing a pixel
- using a hint

The timer stops when the puzzle is solved.

## 5. Input model

### 5.1 Desktop

Required controls:

| Action | Control |
|---|---|
| Fill pixel | left click |
| Cross pixel | right click |
| Erase pixel | click active state again or use erase tool |
| Fill while dragging | left click drag |
| Cross while dragging | right click drag |
| Undo | `Ctrl+Z` and `U` |
| Restart | `R` |
| Help | `?` or Help button |
| Toggle theme | theme button |

Optional controls:

| Action | Control |
|---|---|
| Move focus | arrow keys / Vim keys |
| Fill focused pixel | Space / Enter |
| Cross focused pixel | X |
| Erase focused pixel | Backspace |

### 5.2 Mobile

Mobile input is strict:

```text
touch = validate/fill a pixel
long press = cross the pixel
```

Requirements:

- a normal touch fills a pixel
- a long press crosses a pixel
- long press threshold should be around 450 to 600 ms
- dragging should be supported eventually, but MVP can be tap-first
- the page must prevent accidental browser context menus on the grid
- the page must avoid scrolling while interacting with the grid
- the grid must fit common phone widths for 10x10 and 15x15 puzzles

Do not require a mobile player to use a toolbar before playing. The primary interaction is touch and long press.

A small toolbar may still exist for:

- erase
- undo
- restart
- help
- theme

## 6. Help section

The game must include a Help section hidden behind a click.

It must be visible only after clicking/tapping:

```text
Help
```

The help copy must be succinct.

Suggested help text:

```text
How to play

p-xing.js is a pixel crossing puzzle.

The numbers beside each row and column tell you how many filled pixels appear in that line. A clue like "3 1" means three filled pixels, then a gap, then one filled pixel.

Fill the pixels that belong to the picture. Cross pixels you know are empty.

Desktop:
- left click: fill
- right click: cross
- drag: repeat the same action
- Ctrl+Z or U: undo
- R: restart

Mobile:
- touch: fill
- long press: cross

The timer starts on your first move.
```

The Help section must not block first play unless the user opens it.

Possible UI implementations:

- collapsible panel
- side drawer
- popover
- dialog

If using a dialog:

- it must be accessible
- Escape closes it
- clicking outside closes it
- focus returns to Help button

## 7. Leaderboard

### 7.1 Arcade-style name entry

Leaderboard names must be exactly 3 characters.

Allowed characters:

```text
A-Z
0-9
```

Rules:

- convert lowercase to uppercase
- reject other characters
- no spaces
- no emoji
- no punctuation
- no profanity filtering needed due to 3-character alphanumeric limitation
- no user accounts

Regex:

```ts
/^[A-Z0-9]{3}$/
```

### 7.2 Leaderboard modes

At minimum:

```text
daily-classic
daily-assisted
local-classic
local-assisted
```

For GitHub Pages MVP, use local leaderboard first:

- store scores in `localStorage`
- show top 10
- keep best score per puzzle per initials if desired

For online leaderboard later, GitHub Pages alone is static hosting and cannot safely host a write API. Do not fake a global leaderboard unless a backend exists.

Acceptable future backend options:

- Cloudflare Workers + D1
- Supabase
- Firebase
- tiny VPS with SQLite
- GitHub Issues only for experiments, not recommended for production leaderboard writes

### 7.3 Score fields

```ts
interface ScoreEntry {
  puzzleId: string;
  mode: "classic" | "assisted";
  initials: string;
  elapsedMs: number;
  mistakes: number;
  hints: number;
  score: number;
  completedAt: string;
}
```

### 7.4 Ranking

Recommended ranking for classic daily:

1. lowest hints
2. lowest mistakes
3. lowest elapsed time

For an arcade score:

```ts
score = Math.max(
  0,
  100000
  - Math.floor(elapsedMs / 10)
  - mistakes * 5000
  - hints * 10000
);
```

## 8. Puzzle format

### 8.1 JSON puzzle format

Use a compact JSON format generated from source puzzle files.

```ts
interface Puzzle {
  id: string;
  title: string;
  width: number;
  height: number;
  difficulty: "starter" | "easy" | "medium" | "hard" | "expert";
  pixels: number[][];
  tags?: string[];
}
```

Example:

```json
{
  "id": "starter-001",
  "title": "Tiny Rocket",
  "width": 5,
  "height": 5,
  "difficulty": "starter",
  "pixels": [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,0,1,0,1]
  ],
  "tags": ["starter", "space"]
}
```

### 8.2 Derived clues

Do not store clues as source of truth.

Generate clues from `pixels`.

Implement:

```ts
getLineClues(line: SolutionPixel[]): number[]
getRowClues(puzzle: Puzzle): number[][]
getColumnClues(puzzle: Puzzle): number[][]
```

For an empty line, return:

```ts
[0]
```

### 8.3 Daily puzzle selection

Daily puzzle ID must be deterministic.

Use UTC date to avoid timezone confusion:

```ts
dailyIndex = hash("YYYY-MM-DD") % eligibleDailyPuzzles.length
```

Store daily date as:

```text
YYYY-MM-DD
```

## 9. Recommended technical stack

Use:

- TypeScript
- Vite
- Vitest
- Playwright
- ESLint
- Prettier
- c8 or Vitest native coverage
- GitHub Actions
- GitHub Pages

Avoid heavy frameworks for MVP.

Recommended rendering:

- HTML/CSS grid for MVP
- Canvas optional later for very large grids

HTML grid is easier to test and accessible. Canvas can be introduced later if performance demands it.

## 10. Repository structure

Create this structure:

```text
p-xing.js/
  .github/
    workflows/
      ci.yml
      pages.yml
  docs/
    architecture.md
    puzzle-format.md
    testing.md
    release.md
  public/
    favicon.svg
  src/
    core/
      clues.ts
      daily.ts
      game-state.ts
      puzzle.ts
      scoring.ts
      storage.ts
      theme.ts
      validation.ts
    data/
      puzzles.ts
    input/
      pointer.ts
      keyboard.ts
      long-press.ts
    ui/
      app.ts
      board.ts
      help.ts
      leaderboard.ts
      result.ts
      toolbar.ts
    styles/
      main.css
    main.ts
  tests/
    unit/
      clues.test.ts
      daily.test.ts
      game-state.test.ts
      scoring.test.ts
      storage.test.ts
      theme.test.ts
      validation.test.ts
    e2e/
      first-play.spec.ts
      help.spec.ts
      mobile-input.spec.ts
      leaderboard.spec.ts
      theme.spec.ts
  index.html
  package.json
  package-lock.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
  eslint.config.js
  README.md
  CONTRIBUTING.md
  LICENSE
```

## 11. Implementation details

### 11.1 `src/core/clues.ts`

Implement pure clue generation.

Required behaviour:

```ts
getLineClues([0,0,0]) -> [0]
getLineClues([1,1,0]) -> [2]
getLineClues([1,0,1]) -> [1,1]
getLineClues([0,1,1,0,1]) -> [2,1]
```

### 11.2 `src/core/game-state.ts`

Represent all game state without DOM dependencies.

Suggested interfaces:

```ts
export type PlayerPixel = "unknown" | "filled" | "crossed";

export interface GameState {
  puzzleId: string;
  width: number;
  height: number;
  pixels: PlayerPixel[][];
  startedAt: number | null;
  completedAt: number | null;
  mistakes: number;
  hints: number;
  history: Move[];
  mode: "classic" | "assisted";
}

export interface Move {
  x: number;
  y: number;
  before: PlayerPixel;
  after: PlayerPixel;
  at: number;
}
```

Functions:

```ts
createGameState(puzzle: Puzzle): GameState
applyFill(state: GameState, puzzle: Puzzle, x: number, y: number, now: number): GameState
applyCross(state: GameState, x: number, y: number, now: number): GameState
applyErase(state: GameState, x: number, y: number, now: number): GameState
undo(state: GameState): GameState
isSolved(state: GameState, puzzle: Puzzle): boolean
```

Rules:

- pure functions where practical
- no direct DOM access
- no localStorage access
- immutable updates preferred

### 11.3 `src/input/long-press.ts`

Implement mobile long press detection.

Required behaviour:

- `pointerdown` starts timer
- if pointer remains down for threshold, emit `cross`
- if pointer is released before threshold, emit `fill`
- moving more than a small threshold cancels or converts to drag mode
- suppress context menu on board
- support Pointer Events

Suggested API:

```ts
interface LongPressOptions {
  thresholdMs: number;
  moveTolerancePx: number;
  onTap: (x: number, y: number) => void;
  onLongPress: (x: number, y: number) => void;
}
```

### 11.4 `src/core/theme.ts`

Support:

```ts
type ThemePreference = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";
```

Persist preference in localStorage key:

```text
p-xing.theme
```

Apply to root element:

```html
<html data-theme="light">
<html data-theme="dark">
```

### 11.5 `src/core/storage.ts`

Use localStorage keys:

```text
p-xing.scores.v1
p-xing.theme
p-xing.lastPuzzle
```

Storage functions must handle corrupted localStorage gracefully.

```ts
loadScores(): ScoreEntry[]
saveScore(score: ScoreEntry): void
getTopScores(puzzleId: string, mode: ScoreMode, limit: number): ScoreEntry[]
```

If localStorage is unavailable, game must still be playable.

## 12. Accessibility requirements

The game must be usable with keyboard and screen readers at a basic level.

Required:

- semantic buttons
- visible focus states
- Help button accessible name
- theme button accessible name
- puzzle grid labelled
- cells are focusable or a keyboard cursor exists
- result screen announces completion
- colour must not be the only distinction between filled and crossed pixels
- dark and light themes must have adequate contrast

Recommended ARIA:

```html
<div role="grid" aria-label="Pixel crossing grid">
<button aria-label="Fill row 3 column 4">
```

## 13. Testing requirements

### 13.1 Unit tests

Use Vitest.

Required coverage:

- clue generation
- puzzle validation
- game state transitions
- win detection
- mistake counting
- undo
- scoring
- daily puzzle selection determinism
- theme preference resolution
- leaderboard validation
- localStorage corruption handling
- 3-character initials validation
- mobile long-press logic

### 13.2 E2E tests

Use Playwright.

Required scenarios:

#### First play

- open `/`
- puzzle grid is visible
- help is not open
- timer shows zero or idle state
- first click starts timer
- player can fill a pixel

#### Help

- click Help
- help content appears
- content uses "pixel crossing"
- content explains desktop and mobile controls
- close Help
- game is still visible

#### Theme

- default theme follows system or app default
- toggle theme
- `data-theme` changes
- preference persists after reload

#### Mobile input

Use Playwright mobile emulation.

- tap on a cell fills it
- long press on a cell crosses it
- context menu is not opened
- page does not scroll while interacting with the board

#### Leaderboard

- solve a small test puzzle
- result screen appears
- initials input accepts exactly 3 alphanumeric characters
- lowercase converts to uppercase
- invalid characters are rejected
- submitted score appears in local leaderboard

### 13.3 Coverage gates

Minimum coverage:

```text
statements: 90%
branches: 85%
functions: 90%
lines: 90%
```

Core logic should target near 100%.

Do not exclude core files from coverage.

Permitted exclusions:

- generated puzzle data
- Vite environment files
- minimal bootstrap code

### 13.4 Forbidden-term test

Add a test or script:

```json
{
  "scripts": {
    "check:terms": "node scripts/check-forbidden-terms.mjs"
  }
}
```

The script must fail CI if the forbidden product term appears.

Search file types:

```text
.ts
.tsx
.js
.mjs
.html
.css
.md
.json
.yml
.yaml
```

Exclude:

```text
node_modules
dist
coverage
.git
```

## 14. Code quality

### 14.1 Scripts

`package.json` must include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "e2e": "playwright test",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "check:terms": "node scripts/check-forbidden-terms.mjs",
    "ci": "npm run check:terms && npm run format:check && npm run lint && npm run typecheck && npm run coverage && npm run build && npm run e2e"
  }
}
```

### 14.2 Formatting

Use Prettier.

### 14.3 Linting

Use ESLint with TypeScript support.

Lint must fail on:

- unused variables
- implicit `any`
- floating promises
- accidental console logs outside controlled logger
- inaccessible clickable elements

### 14.4 TypeScript

Use strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 15. Documentation requirements

### 15.1 `README.md`

Must include:

- project description
- screenshot or mock image placeholder
- live demo URL
- local development instructions
- test instructions
- build instructions
- GitHub Pages deployment instructions
- terminology rule: this is pixel crossing
- controls
- browser support
- license

### 15.2 `docs/architecture.md`

Must describe:

- core engine
- puzzle model
- UI layer
- input handling
- storage
- score model
- theme model
- future backend leaderboard option

### 15.3 `docs/puzzle-format.md`

Must describe:

- JSON puzzle format
- how clues are generated
- how daily puzzle selection works
- how to add a puzzle

### 15.4 `docs/testing.md`

Must describe:

- unit tests
- E2E tests
- coverage targets
- forbidden-term check
- how to run tests locally

### 15.5 `docs/release.md`

Must describe:

- release process
- GitHub Pages deployment
- versioning
- how to validate a published release

## 16. CI/CD

### 16.1 CI workflow

Create:

```text
.github/workflows/ci.yml
```

Requirements:

- run on pull requests
- run on pushes to `main`
- install dependencies with `npm ci`
- install Playwright browsers
- run all CI checks
- upload coverage report as artifact
- upload Playwright report on failure

Workflow:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run CI
        run: npm run ci

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### 16.2 GitHub Pages workflow

Create:

```text
.github/workflows/pages.yml
```

Requirements:

- deploy only from `main`
- use GitHub Pages artifact deployment
- build before deploy
- run CI before deploy or repeat essential checks
- publish `dist`

Workflow:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Check
        run: npm run check:terms && npm run format:check && npm run lint && npm run typecheck && npm run test

      - name: Build
        run: npm run build

      - name: Configure GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload GitHub Pages artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Deploy GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 16.3 Repository settings

In GitHub:

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

The published URL should be:

```text
https://<github-user-or-org>.github.io/p-xing.js/
```

## 17. Vite configuration

`vite.config.ts`:

```ts
import { defineConfig } from "vite";

export default defineConfig({
  base: "/p-xing.js/",
  build: {
    sourcemap: true,
  },
});
```

If the project is later hosted at a custom domain root, change `base` to:

```ts
base: "/"
```

## 18. Acceptance criteria

The project is done when all criteria below are met.

### 18.1 Product

- opening the GitHub Pages URL shows a playable puzzle
- first play requires no menu navigation
- light/dark mode works
- preference persists
- Help is hidden until clicked
- Help explains pixel crossing succinctly
- mobile touch fills a pixel
- mobile long press crosses a pixel
- local leaderboard accepts only 3-character alphanumeric initials
- no user-facing product text uses the forbidden terminology

### 18.2 Engineering

- TypeScript strict mode enabled
- unit tests pass
- E2E tests pass
- coverage gates pass
- lint passes
- formatting check passes
- forbidden-term check passes
- production build succeeds
- GitHub Actions CI passes
- GitHub Pages deployment succeeds

### 18.3 Documentation

- README complete
- architecture docs complete
- puzzle format docs complete
- testing docs complete
- release docs complete

## 19. Suggested implementation plan for coding agents

### Phase 1: Scaffold

1. Create Vite TypeScript project.
2. Add strict TypeScript config.
3. Add ESLint, Prettier, Vitest, Playwright.
4. Add folder structure.
5. Add CI scripts.
6. Add GitHub Actions CI.

### Phase 2: Core engine

1. Implement puzzle model.
2. Implement clue generation.
3. Implement game state.
4. Implement scoring.
5. Implement validation.
6. Implement daily puzzle selection.
7. Add unit tests until coverage gate passes.

### Phase 3: UI

1. Build main layout.
2. Render puzzle grid.
3. Render clues.
4. Add timer.
5. Add controls.
6. Add result screen.
7. Add local leaderboard.
8. Add Help panel.
9. Add light/dark theme.

### Phase 4: Input

1. Add desktop pointer controls.
2. Add right-click crossing.
3. Add drag fill/cross.
4. Add keyboard shortcuts.
5. Add mobile tap fill.
6. Add mobile long press cross.
7. Add E2E tests.

### Phase 5: Polish

1. Make mobile layout excellent.
2. Add animations only where useful.
3. Add accessible labels.
4. Add empty/error states.
5. Add starter puzzles.
6. Add README screenshots.

### Phase 6: Deployment

1. Configure Vite base path.
2. Add Pages workflow.
3. Enable GitHub Pages with GitHub Actions.
4. Validate published URL.
5. Add live demo link to README.

## 20. Non-goals for MVP

Do not implement these in the first version unless everything above is complete:

- user accounts
- global online leaderboard
- puzzle editor
- multiplayer
- large puzzle packs
- WASM renderer
- backend service
- social login
- comments
- moderation tools

## 21. Future roadmap

After MVP:

- online leaderboard with Cloudflare Workers + D1
- puzzle import from PBM
- puzzle editor
- daily streaks
- shareable result cards
- curated puzzle packs
- difficulty estimator
- offline PWA mode
- WASM reuse of existing `p-xing` logic
- compact embedded mode for personal websites

## 22. Final instruction to coding agents

Prioritise playability, simplicity, and polish.

The first page load must feel like an arcade cabinet waiting for a coin, except the coin is the player's first click.

Do not overcomplicate the architecture.

Keep the core pure, the UI small, the tests strong, and the deployed GitHub Page always playable.
