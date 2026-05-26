# Earth-to-Earth Transport Network Map

A Vite + React visualization of global transport hubs, hyperloop feeder routes, and Starship intercontinental arcs — plus a **Route Optimizer** for orbital network analysis.

Uses **MapLibre GL JS** with the free [OpenFreeMap](https://openfreemap.org/) dark basemap — no API keys required.

## Quick Start

```bash
cd transport-map
npm install
npm run dev
```

Open http://localhost:5173

## Pages

| Page | Description |
|------|-------------|
| **Network Map** (default) | B2B hubs, hyperloop feeders, Starship arcs — unchanged defaults |
| **Route Optimizer** | Separate Starship route analysis (does not change the map yet) |

Use the top nav bar to switch pages.

## Route Optimizer (v1)

The Starship route choice model lives in `src/routeModel/`. Spec docs are in `docs/route-choice-model/`.

### Quick workflow

1. Open **Route Optimizer** from the nav bar.
2. Choose a preset (**Launch 6** or **12-hub**) or select hubs manually (≥2).
3. Pick a strategy (Constraint-collapse, Greedy, Military-first, or Cargo-focused).
4. Click **Run Network Analysis** — view top routes, Year 1 / Year 5 revenue, and launch sequence.

The **Network Map** still uses default B2B hubs and hyperloop destinations. Wiring optimizer output to the map is prepared in `src/routeModel/mapNetworkConfig.js` but not enabled.

Formulas: see [docs/route-choice-model/FORMULAS.md](docs/route-choice-model/FORMULAS.md).

## Features

- 30 ROI global hub cities (economically viable markets)
- Separate Route Optimizer page: revenue, time savings, strategic score, 5-year projections
- 700-mile catchment zones (zoom 3+)
- Hyperloop feeder routes from secondary cities (zoom 5+)
- Starship great-circle arcs between all hubs (1400+ mi)
- deck.gl overlays on MapLibre base map
- Analysis layer selector on map (Infrastructure default; demand overlays reserved)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

## Planetary Hyperloop Web (build strategy)

The long-term goal is to connect the entire world into one planetary Hyperloop Web. Every valid node should eventually have a logical path into the network. The graph prioritizes trunk corridors, regional feeders, through routes, intercontinental gateways, and remote cargo/resource branches. The system avoids all-to-all routing, random ocean crossings, and fake data. Connectivity is measured by graph audit metrics.

See [docs/BUILD_STRATEGY.md](docs/BUILD_STRATEGY.md) and `src/data/planetaryHyperloopGraph.js`.

## World cities database

Global origin/destination candidates for E2E and Hyperloop live in:

- [`src/data/world-cities.csv`](src/data/world-cities.csv) (~33,700 cities, GeoNames IDs)
- [`src/data/worldCities.js`](src/data/worldCities.js) — parser and loader

See [`src/data/README-world-cities.md`](src/data/README-world-cities.md).

## Project Structure

```
transport-map/
├── docs/route-choice-model/   # Spec + FORMULAS.md
├── src/
│   ├── data/
│   │   ├── world-cities.csv   # Global city registry (E2E + Hyperloop)
│   │   └── worldCities.js
│   ├── routeModel/            # Analysis engine (cities, routes, financials)
│   ├── data/
│   │   ├── planetaryHyperloopGraph.js  # Master graph + connectivity repair
│   │   └── graphConnectivityAudit.js
│   ├── components/
│   ├── pages/
│   │   └── RouteOptimizerPage.jsx
│   ├── components/
│   │   ├── FuturisticTransportMap.jsx
│   │   └── RouteOptimizerPanel.jsx
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js
└── package.json
```
