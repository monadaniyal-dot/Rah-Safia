# Quran Al-Falah | قرآن الفلاح

A modern Islamic companion web app dedicated to the loving memory of Safia Bano — a source of Sadaqah Jariyah.

## Run & Operate

- `pnpm --filter @workspace/rah-e-safia run dev` — run the Islamic web app (port 8082)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4
- UI: framer-motion, lucide-react, next-themes (dark mode), wouter (routing)
- Fonts: Poppins (UI), Amiri (Arabic/Quran text)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM

## Where things live

- `artifacts/rah-e-safia/` — Islamic web app (React + Vite)
  - `src/pages/HomePage.tsx` — main homepage with 5 feature cards
  - `src/components/layout/` — AppShell, Sidebar (desktop), BottomNav (mobile)
  - `src/components/ui/` — FeatureCard, ThemeToggle
  - `src/lib/constants.ts` — nav items and feature card definitions
  - `src/lib/utils.ts` — cn() utility
  - `src/hooks/useTheme.ts` — dark mode hook (wraps next-themes)
  - `src/index.css` — Islamic theme CSS variables (emerald green + gold)
- `artifacts/api-server/` — Express backend (port 8080)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/` — Drizzle DB schema

## Architecture decisions

- **Islamic color theme**: Deep emerald green (`hsl(145, 56%, 24%)`) as primary, gold (`hsl(42, 58%, 50%)`) as accent. Both adapt for dark mode.
- **Amiri font for Arabic**: All Arabic/Quran text uses the Amiri serif typeface loaded from Google Fonts.
- **Mobile-first layout**: AppShell switches between BottomNav (mobile) and Sidebar (desktop ≥lg).
- **`--prefer-offline` install**: `pnpm install --prefer-offline` runs on `dev` startup to ensure node_modules exist for the new workspace member without a slow full resolve.
- **Wouter router**: Lightweight SPA router with base URL from `import.meta.env.BASE_URL`.

## Product

- **Homepage**: Basmala header, Assalamu Alaikum welcome banner with dedication to Safia Bano, 5 feature cards (Prayer Times, Qibla Finder, Qur'an, Hadith, Tafseer)
- **Navigation**: Sidebar (desktop) + BottomNav (mobile), both with Arabic sub-labels
- **Dark mode**: Full dark mode with deep dark-green background, toggleable via the moon/sun button
- Feature pages (Prayer Times, Qibla, Quran, Hadith, Tafseer) — UI scaffold ready, awaiting functionality

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `pnpm install --prefer-offline` in the dev script: rah-e-safia was added as a new workspace member after the lockfile was generated. The install step on startup updates the lockfile using cached packages. Once it runs once successfully, subsequent starts skip the install (node_modules exist). After that, remove the `--prefer-offline` prefix from the dev script if desired.
- Port 8082 (rah-e-safia) is not in the standard Replit workflow supported-ports list but works for the multi-artifact proxy routing via artifact.toml.
- `code_execution` notebook was unavailable during initial setup — `createArtifact()` could not be called. The artifact was manually scaffolded and registered by writing artifact.toml + restarting the api-server workflow (which triggers artifact discovery).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
