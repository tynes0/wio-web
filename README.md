# Wio Web

This folder hosts the static Wio website.

The site package follows the Wio product release line. This branch targets Wio
`0.13.0`; canonical content and the VS Code extension use the same version.

It is intentionally designed to work well on Vercel without a custom backend.

## What the site does

- renders the canonical Wio markdown documentation from the main `tynes0/wio` GitHub repository
- fetches the latest GitHub release from the Wio releases API
- recommends a download asset for the current platform when a release exists
- falls back gracefully when there is no tagged release yet

## Source of truth

The documentation source of truth remains in the main Wio repository:

- `README.md`
- `docs/`

The website does not keep a second hand-maintained copy of those docs. It reads the markdown directly from GitHub raw URLs so the repo docs and the site stay aligned.

## Local development

```powershell
npm install
npm run dev
```

## Production build

```powershell
npm run build
```

The site outputs a static `dist/` folder and does not require a custom server.

## Vercel deployment

This project is Vercel-friendly as a normal static Vite app.

Recommended settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Because documentation selection uses hash-based navigation (`#docs/...`), the site does not need custom rewrite rules just to support deep document links.

## Release downloads

The downloader card reads:

- `https://api.github.com/repos/tynes0/wio/releases/latest`

If no release exists yet, the UI shows a friendly fallback and points users toward the source repository instead of breaking.
