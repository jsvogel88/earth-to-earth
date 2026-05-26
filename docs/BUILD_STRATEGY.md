# Build Strategy — Planetary Hyperloop Web

The long-term goal is to connect the entire world into one planetary Hyperloop Web. Every valid node should eventually have a logical path into the network.

## Target architecture (single source of truth)

```
worldCities.js → nodeClassification.js → graph/buildPlanetaryHyperloopGraph.js
  → graph/visibleGraphFilter.js → FuturisticTransportMap.jsx (render-only)
```

- **worldCities.js** — canonical city IDs, coordinates, population (no routes)
- **nodeClassification.js** — node categories only (no routes)
- **graph/** — sole route/edge builders (`buildPlanetaryHyperloopGraph`, `buildE2EOriginView`)
- **graph/visibleGraphFilter.js** — visibility toggles only (no mutation)
- **styles/hyperloopRouteStyles.js** — colors, dashes, widths only
- **FuturisticTransportMap.jsx** — deck.gl layers only; no route generation

## Principles

- **Graph, not spaghetti:** Nodes connect via local branches, regional feeders, continental trunks, through routes, and intercontinental gateways — not all-to-all lines.
- **Packet-switched pods:** Tube infrastructure is shared; pods route independently and split off only when needed.
- **Geography guardrails:** No default open-ocean Hyperloop. Intercontinental links use explicit gateway corridors. Starship remains the default for long open-ocean passenger legs.
- **Phased rollout:** Phase 1 (active web) → Phase 2 (future high-population hubs) → Phase 3 (rare earth, remote cargo, rural extensions).
- **Honest data:** No invented coordinates or fake resource claims. Missing coordinates stay off the map until validated (e.g. GeoNames import).

Remote Coverage Gaps are tracked in **`docs/REMOTE_COVERAGE_GAPS.md`**. These are planning gaps only and should not be activated as live routes until the canonical graph architecture is stable.

## Connectivity target

`connectivityPercent` (share of renderable nodes in the largest connected component) should approach **100%** for all enabled, coordinate-valid nodes.

Nodes that cannot connect are listed in the **Disconnected Nodes Audit** with a `connectionReason`.

## Pipeline

`src/graph/buildPlanetaryHyperloopGraph()` runs:

1. Phase 1 curated corridors, crosslinks, split-off, gateways (`infrastructureMode: true` skips mesh E2E feeders and extended hub-to-hub trunks)
2. Planetary continental spines (`planetaryContinentalSpines.js` → `applyContinentalSpines.js`)
3. Planetary merge gateways (`planetaryMergeGateways.js` → `applyPlanetaryMergeGateways.js`)
4. Explicit Tier 1 / Tier 2 trunks (`planetaryInfrastructureTrunks.js` → `applyInfrastructureTrunks.js`)
5. Mesh prune (`pruneMeshSpaghetti.js`) — drop redundant crosslinks and mesh categories
6. Feeder trunk attachment (`applyFeederTrunkAttachment.js`) — short branches to nearest trunk only
7. Corridor through-routes (`generateCorridorThroughRoutes.js`) — shared spine visibility; hub-pair through routes disabled (`maxPerHub: 0`)
8. Planning rural / remote cargo branches (optional overlays)
9. Future high-population hub connectors (optional)
10. Connectivity repair links for stragglers (off by default in map layers)
11. `worldCities` infrastructure roles on nodes; graph audit (components, disconnected list, metrics)

**worldCities** supplies planning intelligence (classification, planning grid overlay). It does not auto-generate edges or routes.

## Transport Operating System (Phase 2 UI)

Map modes: **E2E Starship**, **E2M Orbital Logistics**, **Hyperloop Core Web**, **Civilization Grid**, **Robotaxi / Autonomous Mobility**. Central layer metadata: `src/layers/layerRegistry.js`. UI: `TransportControlPanel.jsx`, `GroupedLegend.jsx`. Robotaxi overlay: `src/data/robotaxiLayer.js` + `src/layers/robotaxiVisibility.js` (zones only, no graph edges). Multimodal trip stub: `src/data/multimodalTripChain.js`. Dynamic E2E hubs: `useE2EHubRegistry.js`.

## What we avoid

- All-to-all routing
- Random ocean crossings
- Adding future cities to the active E2E origin selector
- Rendering thousands of nodes at global zoom
