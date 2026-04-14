# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@involvex/terminal-dashboard` is an interactive terminal UI dashboard built with **Ink** (React for CLI) and TypeScript. It displays system metrics (CPU/RAM), GitHub trending repos, and NPM package releases in a 2-column grid layout with full keyboard navigation.

## Common Commands

```bash
bun run dev          # Start with hot reload
bun run build        # Production build (runs format → lint:fix → typecheck → build)
bun run start        # Run built CLI
bun run format       # Format with Prettier
bun run lint         # ESLint check (src/ only)
bun run lint:fix     # Auto-fix ESLint errors
bun run typecheck    # TypeScript type checking (tsc --noEmit)
bun run src/cli.tsx  # Quick run without build
```

After `bun run build`, the CLI is available as `term-dash` or `terminal-dashboard`.

## Architecture

**Entry point:** `src/cli.tsx` — uses `meow` for CLI arg parsing, routes to Help/Version/About/App components based on flags.

**Screen routing:** `src/app.tsx` — React Context (`AppContext`) drives a state machine (`AppScreen` type: `'menu' | 'dashboard' | 'settings' | 'help' | 'about' | 'version' | 'exit'`). The `Plugin` interface defines panels with `id`, `name`, `component`, and `enabled` toggle.

**Dashboard layout:** `src/dashboard.tsx` — 2-column responsive grid rendering enabled panels. Tracks `activePanel` index for keyboard focus. Header shows live clock + terminal dimensions; footer shows navigation hints.

**Key pattern — Plugins:** Panels implement `Plugin.component` type: `React.ComponentType<{ isActive: boolean; dimensions?: { columns: number; rows: number } }>`. The `isActive` prop drives focus styling; `dimensions` enables responsive sizing. New panels register in the `plugins` array in `app.tsx`.

**Key pattern — Stable handlers:** `src/components/select-input.tsx` uses refs (`indexRef`) inside `useCallback` with empty deps to work around Ink's handler re-registration bug. Follow this pattern when adding keyboard input.

**Data fetching:** Panels handle their own polling internally using `useEffect` + `setInterval`. System metrics use `systeminformation` (~1s), GitHub trending uses fetch to external API (~10min), NPM reads RSS feed (~10min). All panels include fallback/mock data.

## Directory Layout

```
src/
├── cli.tsx              # Entry point + meow CLI
├── app.tsx              # Root: AppContext, screen routing, plugin registry
├── dashboard.tsx        # 2-column grid layout + panel navigation
├── commands/            # Screen components (help, about, version, settings, exit)
├── components/          # Reusable UI (panel.tsx, select-input.tsx, menu.tsx)
├── panels/             # Data panels (cpu, ram, github-trending, npm)
└── hooks/              # useFontScale — responsive scaling by terminal size
```

## Key Conventions

- **ESM only** — `"type": "module"` in package.json; imports use `.js` extension (e.g., `'./app.js'`)
- **Bun build** — bundles `src/cli.tsx` to `dist/cli.js` with `--target node`
- **Package data** — imported as `import pkg from '../package.json' with {type: 'json'}`
- **No test suite** — `ink-testing-library` is a devDependency but no test files exist yet
- **Prettier config** — uses `@involvex/prettier-config` with import-sorting plugins

## Adding a New Panel

1. Create component in `src/panels/` accepting `{ isActive: boolean; dimensions?: { columns: number; rows: number } }`
2. Import in `src/app.tsx` and add to the `plugins` array with unique `id`, `name`, and `component`
3. Panel appears in Settings toggle automatically (via `plugins` state)

## Navigation Hotkeys

- `Ctrl+M` — toggle between menu and dashboard
- `Esc` — return to menu from any screen
- `Tab` / Arrow keys — cycle focus between panels
- `M` — return to menu from dashboard
- `Q` / `Esc` — quit from dashboard