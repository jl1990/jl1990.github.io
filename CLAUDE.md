# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (lockfile is `pnpm-lock.yaml`, though it is gitignored).

- `pnpm dev` — start the Astro dev server
- `pnpm build` — runs `astro check` (type-check) then `astro build` to `dist/`
- `pnpm preview` — preview the production build
- `pnpm astro -- <cmd>` — pass-through to the Astro CLI

There is no test runner and no separate lint step; type errors surface through `astro check` during build.

## Deployment

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml` using `withastro/action@v5` (Node 24, pnpm). The deployed `site` URL is set in `astro.config.mjs` and is used by `astro-robots-txt` — update it there if the canonical host changes.

## Architecture

Astro 5 static site with a single primary route (`src/pages/index.astro`) plus a component catalog at `/components` (`src/pages/components.astro`). Everything renders at build time; there is no SSR adapter and no client framework — only `.astro` files plus small inline `<script>` blocks for client behavior.

- **Styling:** Tailwind v4 is wired through the Vite plugin (`@tailwindcss/vite` in `astro.config.mjs`), not the legacy PostCSS pipeline. `src/styles/global.css` is a single `@import "tailwindcss";`. `tailwind.config.mjs` declares `darkMode: 'class'`, but the current `Layout.astro` forces `color-scheme: dark` and switches via `prefers-color-scheme` — the `.dark` class strategy is not actually toggled anywhere yet.
- **Path alias:** `@/*` resolves to `src/*` (see `tsconfig.json`, which extends `astro/tsconfigs/strict`). Prefer `@/components/...` over relative paths in new files; existing files mix both styles.
- **Layout:** `src/layouts/Layout.astro` wraps every page with `Header`, `Footer`, the background gradient, and `<ViewTransitions />`. Pages should accept content via `<slot />` inside this layout.
- **Content as data:** Page content (experience entries, nav items, contact links) lives inline as `const` arrays inside the relevant component (e.g. `EXPERIENCE` in `Experience.astro`, `navItems` in `Header.astro`). There is no CMS or content collection — edit the array in place.
- **Shared constants:** `src/constants.ts` exports `EMAIL`, `LINKEDIN`, `GITHUB`. Reuse these instead of re-hardcoding contact details.

### Header active-section script (non-obvious)

`Header.astro` runs its scroll-spy on the `astro:page-load` event (fired by `<ViewTransitions />` on every navigation, not just initial load). To avoid leaking listeners across transitions, it stores a teardown function on `window.__headerNavCleanup` and invokes it at the top of each page-load handler. Any new global listeners added in components should follow the same pattern, otherwise ViewTransitions navigation will accumulate handlers.
