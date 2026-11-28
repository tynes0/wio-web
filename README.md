# Wio Web

The Wio learning website uses React and Vite, with a small cached Vercel function
for the GitHub release feed. Documentation and std sources follow the published
Wio `0.20.5` baseline. Downloads follow the latest published stable release,
independently of the documentation baseline.

## What the site does

- Offers complete, searchable Wio recipes and a multi-module Pulse project.
- Bundles the canonical documentation and all std source modules from the release tag.
- Shows source-level std declaration signatures, including compatibility/private declarations.
- Reads release notes and assets automatically from GitHub, with older releases and pagination.
- Recommends only a compatible platform/architecture installer or portable archive.
- Supports keyboard navigation, command search, responsive layouts, and reduced motion.

## Source of truth

The documentation source of truth remains in the main Wio repository:

- `README.md`
- `docs/`

`scripts/sync-content.mjs` downloads the documentation catalog and the actual std
inventory from the `documentedWioVersion` tag into ignored `public/content/`.
This happens before every production build. Documents are served locally, with
a version-pinned GitHub raw fallback. Updating the product baseline refreshes
the std page without duplicating its signatures by hand.

The new geometric W logo is preserved as `public/wio-logo.png`. CSS crops only
its display viewport; the supplied image is not modified.

## Local development

```powershell
npm ci
npm run sync-content
npm run dev
```

## Production build

```powershell
npm run build
```

The build runs the content sync, version/catalog checks, Node tests, and Vite.
The static output is `dist/`. On Vercel, `api/releases.js` supplies the live feed.
On static hosting or the Vite dev server, the deployment snapshot remains usable.

## Example validation

With a released Wio toolchain on PATH (or `WIO_EXECUTABLE` set):

```sh
npm run test:examples
npm run test:examples -- --run
npm run test:examples -- --run-examples
```

The first command checks every recipe and the Pulse project. `--run` also runs
Pulse on native and VM backends. `--run-examples` runs the individual recipes
with the default native backend and compares declared expected outputs.
Generated fixtures stay in ignored `.example-validation/` and can be removed
after validation; no compiler/runtime source is modified.

## Vercel deployment

Retain the existing Wio Vercel project and its production alias.

Recommended settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Because documentation selection uses hash-based navigation (`#docs/...`), the site does not need custom rewrite rules just to support deep document links.

## Release downloads

The client first requests `/api/releases`. The function caches public GitHub
responses for five minutes at the edge and supports bounded archive pagination.
No GitHub token is shipped to visitors. If the service fails, the client tries
the deployment snapshot, then GitHub directly. Snapshot use is labeled.

Asset links use GitHub's `browser_download_url` directly. The website does not
fetch installer bytes through CORS or proxy large binaries. VSIX files,
checksums, scripts, and foreign-platform packages cannot become the recommended
toolchain download. Missing platform/architecture packages show source-build
guidance and a working GitHub release link instead.

## Interaction design

The graphite/stone palette follows the supplied W mark. Editorial type, numbered
code scenes, hover/focus navigation previews, a compact sticky header, and
scroll-stacked explanation panels adapt the supplied design references to a
code-first learning site. Mobile layouts avoid stacked overlap. Motion respects
`prefers-reduced-motion`; scrolling is never hijacked and content has no preloader.
