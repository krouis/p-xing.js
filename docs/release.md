# Release

## GitHub Pages deployment

Push to `main`. The `pages.yml` workflow runs automatically:

1. Installs dependencies
2. Runs checks (terms, format, lint, typecheck, tests)
3. Builds with `npm run build`
4. Uploads `dist/` as a Pages artifact
5. Deploys via `actions/deploy-pages`

## Validate a release

Open `https://<owner>.github.io/p-xing.js/` and confirm:

- Puzzle is visible immediately
- First click starts the timer
- Light/dark theme toggle works
- Help panel opens and closes
- Mobile tap fills a pixel
- Mobile long press crosses a pixel
- Result dialog saves a local score with 3-character initials
- Browser devtools show no third-party requests on load

## Versioning

Use `package.json` `version` field. Tag releases as `vX.Y.Z`.

## Pre-Release Checklist

Before tagging:

- run `npm run ci`
- confirm `README.md` points at the correct live demo URL
- confirm `vite.config.ts` still uses `/p-xing.js/` for GitHub Pages
- confirm the Pages workflow is enabled in repository settings
