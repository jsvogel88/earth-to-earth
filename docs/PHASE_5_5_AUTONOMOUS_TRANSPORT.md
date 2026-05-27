# Phase 5.5 — Autonomous Transport Foundation

Grand Master integration slot between Planetary Logistics Studio Phase 5 and future Phase 6.

## Pre-implementation audit (completed)

| Question | Answer |
|----------|--------|
| Canonical pipeline | `src/data/canonicalTransportAdapter.js` → `taxonomyBridge.js` → graph engine |
| Taxonomy bridge | `src/data/transport/taxonomyBridge.js` |
| Layer registry | `src/layers/layerRegistry.js` (`MAP_LAYER_REGISTRY`, `buildDefaultLayerState`) |
| Hyperloop hubs | `planetaryGraph` / `buildPlanetaryHyperloopGraph` + canonical nodes |
| Starbase hubs | `src/data/starbaseHubs.js` (`listStarbaseHubs`) |
| Legacy robotaxi | `src/data/robotaxiLayer.js` — **8–22 mile** radii; dots at zoom &lt; 4 |
| Render intent | `src/transportation/render/renderIntent.js` |
| Studio UI | `src/studio/` + `TransportControlPanel.jsx` |
| Turf.js | **Not installed** — uses `autonomousGeometry.js` geodesic circles |
| Language | JavaScript (JSDoc types) |
| Module path | `src/data/autonomous/*` |

## New module

```
src/data/autonomous/
  autonomousConstants.js
  autonomousTypes.js
  autonomousModeRegistry.js
  autonomousEligibility.js
  autonomousGenerators.js
  autonomousGeometry.js
  autonomousValidation.js
  autonomousDeduping.js
  autonomousSelectors.js
  collectAutonomousHubs.js
  buildAutonomousTransportSystem.js
  index.js
```

## Data flow

```
E2E / Hyperloop / Starbase / E2M hubs
  → collectAutonomousHubs
  → dedupeAutonomousHubs
  → generateAllAutonomousAssets
  → buildAutonomousTransportSystem
  → selectAutonomousLayers
  → FuturisticTransportMap (GeoJsonLayer 100mi rings)
```

## Feature flags

See `FEATURE_FLAGS` in `autonomousConstants.js`. Foundation enabled by default.

## Tests

`src/tests/autonomousTransportFoundation.test.js`
