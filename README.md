## Quick Look

<video src="./public/videos/dsa-rip-showreel.mp4" controls width="100%"></video>

[Watch the showreel](./public/videos/dsa-rip-showreel.mp4)

# DSA Rip

Local-first DSA sheet tracker (solved / revision / notes, practice links). Progress is stored in the browser only - there is no account or server sync.

## Prerequisites

This project requires **Node.js `>=22.12.0`** (see `package.json` `engines` and `.nvmrc`).

Vite and several dependencies will fail on Node 18/20. If you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use   # picks 24 from .nvmrc
```

Run this in the project directory before installing or starting the app. To avoid repeating it in every new shell, set Node 24 as your default:

```bash
nvm alias default 24
```

If you installed dependencies under an older Node version, reinstall after switching:

```bash
rm -rf node_modules
npm install
```

## Getting started

```bash
nvm use
npm install
npm run dev
```

The app runs at [http://localhost:8080](http://localhost:8080).

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start the Vite dev server      |
| `npm run build`   | Production build               |
| `npm run preview` | Preview the production build   |
| `npm test`        | Run Vitest (unit tests)        |
| `npm run lint`    | Run ESLint                     |
| `npm run format`  | Format with Prettier           |

## Stack

- **TanStack Start** (file routes) + **Vite 7** + **React 19** + **TypeScript** (`strict`)
- **Tailwind CSS 4**
- UI primitives: only `src/components/ui/dialog.tsx` and `dropdown-menu.tsx` (do not re-dump a full shadcn kit)
- Path alias: `@/*` → `src/*`

## Architecture

Put feature UI under `src/features/`, not in route files.

```
src/
  routes/index.tsx          Thin route: head metadata + SheetPage
  features/sheet/           Tracker UI (toolbar, grid, row, dialogs, search)
  data/                     Sheet dataset + extra-link merge
  lib/                      Persistence (tracker-store, localStorage schema)
  constants/                Branding, theme, column layout, creator copy
  components/ui/            Shared primitives only
```

- Routes stay thin. Edit tracker screens in `src/features/sheet/`.
- Hardcoded product strings and URLs belong in `src/constants/` (`branding.ts`, `creator.ts`, `theme.ts`, `sheet-columns.ts`, `layout.ts`) - not in JSX.
- Empty-string checks: use `.length === 0` (same convention as the rest of the data layer).

## Sheet data

Problems are **not** fetched at runtime. They ship in the client bundle.

| File | Role |
| ---- | ---- |
| `src/data/raw-sheet.ts` | Types for the raw JSON shape |
| `src/data/dataSheet.ts` | Typed `RawSheetStep[]` (titles, difficulty, LC/GFG/CN links, pattern images) |
| `src/data/extra-links.gen.ts` | **Generated** article + YouTube map. Do not edit by hand |
| `src/data/problem-extra-links.ts` | Zod-validates the generated map and resolves links by coord/title |
| `src/data/sheet.ts` | Adapter: raw rows → domain `Problem` / `Step` (`SHEET`, `ALL_PROBLEMS`) |

When adding a problem: update `dataSheet.ts` to match `RawProblem`. Optional `articleLink` / `youtubeLink` can be inlined on the row, or they merge from `extra-links.gen.ts` at adapter time.

`extra-links.gen.ts` is committed output. Changing its *shape* (not just values) will fail Zod parse on import - update `problem-extra-links.ts` and its tests together.

Do **not** commit scrape tooling or raw archive JSON. `scripts/` and `scripts/raw/` are gitignored and vercel-ignored on purpose.

The home page opens with a short branded splash (`src/constants/splash.ts`). Click, tap, or Escape skips it. `prefers-reduced-motion` shortens the hold. The product tour waits until the splash dismisses.

## Persistence

All progress is `localStorage` in this browser. Keys live in `DSA_LS_KEYS` (`src/lib/tracker-store.ts`):

| Key | Contents |
| --- | -------- |
| `dsa.done` / `dsa.rev` | Compact `[schemaVersion, [step, subStep, idx][]]` |
| `dsa.notes` | Compact notes keyed by the same triples |
| `dsa.theme` | Single-letter theme wire (`s` / `l` / `d` / `v`) |
| `dsa.ui.colm` | Optional column bitmask (YouTube, Article, Note, Revision, Difficulty) |

Problem IDs in memory include the title (`s{step}-ss{sub}-{idx}-{title}`). On disk, only the numeric triple is stored so title edits do not wipe progress. Schema version is `DSA_LS_SCHEMA_VERSION` in `src/lib/dsa-local-storage-schema.ts`. Hydration runs in a layout effect on the root shell so SSR HTML matches the first client paint (empty sets until hydrate).

## Tests

Tests live under `tests/`, not next to production modules. Vitest (`vitest.config.ts`) includes `tests/**/*.test.ts`.

```
tests/
  unit/
    constants/     Column mask helpers
    data/          Extra-link lookup + generated-map schema
    features/sheet Search / sheet-feature helpers
    lib/           localStorage encode/decode + legacy migration
```

Add new unit tests under the matching `tests/unit/<layer>/` folder. Keep `src/` free of `*.test.ts`. There is no E2E suite yet; if you add one, put it in `tests/e2e/`.

## Deploy

`vite.config.ts` picks the target from the environment:

- **Local / Cloudflare:** Wrangler + `src/server.ts` (`wrangler.jsonc`)
- **Vercel:** `VERCEL=1` during build → Nitro `vercel` preset (Cloudflare plugin off)

Do not upload `.dev.vars`, or `scripts/` (see `.gitignore` / `.vercelignore`).
