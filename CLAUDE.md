# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Bio-Interactive Garden Mapper (BIG-M)** — a web-based GIS application for mapping a residential permaculture garden (parcels 328N and 328P). Built with Nuxt 4 + Vue 3.

## Commands

```bash
bun run dev        # start dev server at http://localhost:3000
bun run build      # production build
bun run generate   # static site generation
bun run preview    # preview production build
```

No test runner or linter is configured yet.

## Architecture

The intended architecture (from the project spec) is three decoupled layers:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| View | SVG (`garden.svg`) | Interactive map of the garden parcels |
| Data | JSON | Source of truth for every element (soil profiles, microclimate zones, plant health) |
| Content | Markdown | Per-element documentation (guild instructions, maintenance logs) |

`garden.svg` is an Inkscape-created map. Its SVG element IDs are the primary keys that link the three layers together:

- **`garden-areas`** group — individual garden zones: `areas-0` through `areas-5`, `areas-1`, `areas-2`, `areas-3`, `areas-4`, `areas-fruit-trees`, `areas-behind-garage`, `areas-wall`, `areas-tarres`
- **`garden-buildings`** group — `buildings-house`, `buildings-serre`, `buildings-garage`, `buildings-carport`, `building-shed`
- **`garden-paths`** group — path/walkway shapes
- **`garden-greenhouse`** — greenhouse overlay
- **`garden-wall`** — wall element

The app is in early scaffolding stage: `app/app.vue` currently renders only the default Nuxt welcome page.

## Key Design Decisions

- SVG element IDs are the canonical identifiers — any data or content file should key off these same IDs.
- The project is vegan-focused: plant guild recommendations must avoid animal-based inputs; prefer green manure, dynamic accumulators, and mulching strategies.
- Nuxt 4 compatibility date is set to `2025-07-15`; use the Nuxt 4 directory structure (`app/` folder convention).
