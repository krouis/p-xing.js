# Release

_Full documentation written in Phase 5._

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

## Versioning

Use `package.json` `version` field. Tag releases as `vX.Y.Z`.
