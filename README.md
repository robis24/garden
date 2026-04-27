# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

Project Title: Bio-Interactive Garden Mapper (BIG-M)
Project Overview
This project is a custom-built, web-based GIS (Geographic Information System) application designed to facilitate the transition of a residential garden into a productive permaculture ecosystem. As a front-end developer and vegan gardener, I am building a tool that bridges the gap between raw environmental data (soil quality, sunlight, historical land use) and actionable horticultural design.

Technical Architecture
The project follows a decoupled architecture, ensuring that spatial data, plant logic, and descriptive content remain maintainable and scalable.

View Layer (SVG): A high-precision, scalable vector map of the 328N and 328P parcels. Using SVG allows for DOM-level interaction with specific garden elements (e.g., individual fruit trees, greenhouse structures, or soil mounds).

Data Layer (JSON): A central "Source of Truth" that stores properties for every garden element. This includes:

Soil Profiles: Tracking high-nitrogen zones (former chicken runs) and pioneer species indicators.

Microclimate Zones: Mapping thermal mass (brick walls), shade gradients (neighboring trees), and wind sectors.

Plant Status: Real-time health tracking (e.g., fungal pressure on pear trees).

Content Layer (Markdown): Linked documentation for each element ID, containing vegan-specific guild instructions, maintenance logs, and ecological functions.

Core Features
Zone & Sector Analysis: Visualizing the "Main Path" (Zone 1) from the street to the kitchen, optimizing daily harvest efficiency.

Succession Tracking: Monitoring the transition from invasive species (Ground Elder, Celandine) to productive perennials using the "Shade-Out" strategy.

Hydrological Mapping: Designing for water retention on a sloped terrain (flowing towards the road) using the "Slow, Spread, Sink" principle.

Vegan Guild Integration: A recommendation engine that suggests plant combinations (e.g., the Three Sisters or Comfrey-based mulching) to replace animal-based fertilizers with green manure and dynamic accumulators.
