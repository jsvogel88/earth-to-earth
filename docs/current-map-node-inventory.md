# Current Map — Node Inventory

Read-only catalog of **node-like entities** on the Network Map: where they are defined, how they enter the render pipeline, and whether they are canonical graph nodes or overlays.

**Default map mode:** Civilization Grid (`TRANSPORT_MODES.CIVILIZATION_GRID`).

---

## Summary counts (static seeds)

| Dataset | Approx. count | Canonical graph? |
|---------|---------------|------------------|
| Curated E2E / ROI hubs | **31** | Yes (hyperloop + integrated) |
| E2M mineral hubs | **~40** seeds | Yes (integrated `e2m_hub`) |
| E2M orbital nodes | **~15** seeds + corridors | Overlay (dedicated deck layers) |
| Future 1M+ population hubs | **~100+** seeds | Overlay only |
| Remote / strategic / rare earth | **GLOBAL_COVERAGE_SEEDS** (regions file) | Overlay only |
| Remote cargo / rural nodes | **100+** city names in regions | Graph edges via `buildPlanetaryHyperloopGraph` |
| World cities CSV | **~33k** rows | **Not on map** (Route Optimizer) |
| Custom destinations | User-driven (localStorage) | Overlay only |
| Parsed cities | User paste batch | Overlay only |
| Planning grid points | Derived from `worldCities` enrichment | Overlay scatter |

---

## By category

### E2E Starship hubs

| Property | Detail |
|----------|--------|
| **Role** | Long-range passenger anchors; drive hyperloop graph ROI and starship arcs |
| **IDs** | `net:{city-slug}:{country-slug}` via `networkCityId()` |
| **Source files** | `src/data/worldCities.js` (`CURATED_NETWORK_CITIES`, `_curatedNetworkRows`) |
| **Selection** | `src/hooks/useE2EHubRegistry.js` — merges curated list + `localStorage` active hub IDs |
| **Map record** | `getMapRoiHubs()` → `toMapHubRecord()` (numeric `id` for picking + `networkCityId`) |
| **Flags** | `isE2EHub`, `isActiveE2EHub`, tier `0` in phase-1 graph |
| **Classification** | `src/data/nodeClassification.js`, `src/data/classifyWorldCityInfrastructure.js` → `ACTIVE_E2E_HUB` |
| **Integrated type** | `NODE_TYPES.E2E_HUB` / `e2e_eligible` via `src/modes/classifyLocation.js` |

**31 curated hub names (2026):** New York, London, Los Angeles, San Francisco, Tokyo, Singapore, Dubai, Hong Kong, Shanghai, Paris, Frankfurt, Amsterdam, Toronto, Chicago, Miami, Dallas, Houston, Mexico City, São Paulo, Buenos Aires, Sydney, Melbourne, Seoul, Mumbai, Delhi, Bangkok, Istanbul, Tel Aviv, Riyadh, Johannesburg, Lagos.

---

### Hyperloop stations (switch / city / trunk nodes)

| Property | Detail |
|----------|--------|
| **Builder** | `src/graph/buildPlanetaryHyperloopGraph.js` orchestrates phase-1 graph |
| **Core generator** | `src/data/phase1GlobalHyperloopGraph.js` (`buildGlobalHyperloopGraph`) |
| **City seeds** | `src/data/hyperloopPhase1Cities.js`, coordinates `hyperloopPhase1Coordinates.js` |
| **Continental corridors** | `hyperloopContinentalCorridors.js`, `planetaryContinentalSpines.js` |
| **Merge / gateways** | `planetaryMergeGateways.js`, `intercontinentalGateways.js` |
| **Node types** | `HYPERLOOP_CITY`, switch nodes (`isSwitchNode`), tiers 0–3 |
| **Deck layers** | `global-hyperloop-nodes-e2e`, `-switch`, `-city`; labels `global-hyperloop-labels` |
| **Halos** | `intermodal-hub-halos`, `e2e-hub-halos` (derived radii, not separate datasets) |

---

### Feeder cities

| Property | Detail |
|----------|--------|
| **Static list** | `src/data/regionalFeederCities.js` (per-hub feeder name lists) |
| **Attachment** | `src/graph/applyFeederTrunkAttachment.js` |
| **E2E radial** | `phase1GlobalHyperloopGraph.js` — `E2E_FEEDER_MAX_LINKS` per hub (infrastructure mode may defer to trunk attachment) |
| **Deck** | `feeder-cities`, `feeder-labels`, `e2e-feeder-routes` (mode-dependent) |
| **E2E origin view** | `buildE2EOriginView.js` — `feederCitiesInRadius`, curated feeders |

---

### E2M hubs (mineral / industrial)

| Property | Detail |
|----------|--------|
| **Seeds** | `src/data/mineralHubs.js` (`MINERAL_HUB_SEEDS` → `DEFAULT_MINERAL_HUBS`) |
| **ID scheme** | `e2m:{name-slug}:{country-slug}` (`mineralHubId`) |
| **Enrichment** | `src/data/buildMineralHubConnections.js` (nearest city, scores — no routes in data file) |
| **Integrated** | `classifyMineralHub`, `generateE2MRoutes.js`, visible as `integrated-mineral-hubs` |
| **Types** | `MINERAL_TYPES` (REE, lithium, copper/cobalt, etc.) |

---

### E2M orbital / launch nodes (separate layer)

| Property | Detail |
|----------|--------|
| **File** | `src/data/e2mOrbitalNodes.js` |
| **Types** | `E2M_NODE_TYPES` (orbital refueling, launch zone, cargo port, Mars staging, gateway) |
| **Paths** | `buildE2MOrbitalPaths`, `E2M_ORBITAL_CORRIDORS` |
| **Deck** | `e2m-orbital-nodes`, `e2m-orbital-routes` |
| **Note** | Not the same dataset as mineral hubs; space/industrial storytelling layer |

---

### Loop stops

| Property | Detail |
|----------|--------|
| **Logic** | Cities with `loop_enabled !== false` and coordinates |
| **Generator** | `src/graph/generateLoopRegionalRoutes.js` |
| **Integrated node type** | `NODE_TYPES.LOOP_NODE` / mode `loop` |
| **Deck** | `integrated-loop-routes` (`deckLayerFactory.js`) |

---

### Robotaxi / auto zones

| Property | Detail |
|----------|--------|
| **Builder** | `src/data/robotaxiLayer.js` — `buildRobotaxiServiceZones`, hub dots, pickup/dropoff |
| **Inputs** | Active E2E hubs, trunk stations from planetary graph, E2M orbital nodes, rare earth nodes, custom destinations |
| **Visibility** | `src/layers/robotaxiVisibility.js`, toggles `showRobotaxiLayer`, `showRobotaxiServiceZones`, etc. |
| **Deck** | `robotaxi-service-zones-fill/outline`, `robotaxi-hub-availability`, `robotaxi-pickup-dropoff` |
| **Mode registry** | `auto` — `graphBehavior: 'overlayOnly'` (no integrated route generator) |

---

### Planning grid nodes

| Property | Detail |
|----------|--------|
| **Builder** | `buildWorldCitiesPlanningGrid()` in `classifyWorldCityInfrastructure.js` |
| **Roles** | `src/data/infrastructureRoles.js` (trunk, feeder, future E2E, rare earth, etc.) |
| **Colors** | `getInfrastructureRoleColor()` |
| **Deck** | `world-cities-planning-grid` (scatter by role) |
| **Toggle** | `showWorldCitiesPlanningGrid` in `layerRegistry.js` |

---

### Strategic / cargo / remote nodes

| Property | Detail |
|----------|--------|
| **Coverage seeds** | `src/data/globalCoverageRegions.js` → `GLOBAL_COVERAGE_SEEDS` |
| **Strategic build** | `src/data/remoteStrategicNodes.js` → rare earth candidates |
| **Rare earth display** | `src/data/rareEarthHubCandidates.js` |
| **Remote cargo nodes** | `src/data/remoteCargoResourceNodes.js` (`REMOTE_NODE_TYPES` incl. **port-like**: `ARCTIC_PORT_NODE`, `RIVER_PORT_NODE`) |
| **Future pop hubs** | `src/data/futureHighPopulationCities.js` |
| **Extended rural** | `src/data/extendedRuralNetwork.js` (branch nodes to nearest trunk/switch) |
| **Coords** | `cityCoordinateLookup.js`, `globalCoverageCoordinates.json`, `globalCoverageManualCoords.js` |

---

### Custom destinations

| Property | Detail |
|----------|--------|
| **Storage** | User session / hook (see `src/features/` custom destinations hook usage in map) |
| **Schema** | `src/data/userCustomDestinations.js`, roles `CUSTOM_DESTINATION_ROLES` |
| **Preview edges** | `src/layers/customConnectionPreview.js` (preview only, graph isolation tests) |
| **Deck** | `custom-destinations`, `custom-destinations-halo`, `custom-destination-labels`, `custom-connection-preview` |

---

### Parsed cities

| Property | Detail |
|----------|--------|
| **Parser** | `src/features/parsing/parseCities.js`, `cityMatcher.js`, `parsedCityIsolation.js` |
| **Hook** | `src/features/parsing/useParsedCities.js` |
| **Deck** | `parsed-cities`, `parsed-cities-labels` |
| **Isolation mode** | `showOnlyParsedCities` — dedicated visible layer set |

---

### World city index (not map nodes)

| Property | Detail |
|----------|--------|
| **File** | `src/data/world-cities.csv` (~33k rows: name, country, geonameid) |
| **Loader** | `src/data/worldCities.js` |
| **Economics** | `src/data/economics/loadEconomics.js`, JSON enrichments |
| **Used on map?** | **No** (per `README-world-cities.md`) — Route Optimizer + search index `src/ui/globalSearchIndex.js` |

---

### Ports / logistics (partial)

There is **no dedicated global port layer**. Port-like behavior appears as:

- `NODE_TYPES.PORT` in `integratedGraphTypes.js` (schema only; sparse use)
- `REMOTE_NODE_TYPES.RIVER_PORT_NODE`, `ARCTIC_PORT_NODE` in remote cargo seeds
- `E2M_NODE_TYPES.CARGO_PORT` in orbital seeds
- Edge scoring uses `port_score` / `portConnectivity` in rural and E2E economic scoring

---

### Construction / metrics nodes

Not separate map markers — **edge-attached metadata**:

- `src/data/constructionTypes.js`
- `src/utils/applyEdgeConstruction.js` → `enrichAllEdgeConstruction` in planetary build
- `src/utils/constructionMetrics.js` — aggregates tunnel/surface/elevated counts for UI panel

---

### Integrated graph node union (generated)

At runtime, `generateIntegratedRoutes()` (`src/graph/generateIntegratedRoutes.js`) produces a **merged node list**:

1. Classified ROI cities (`classifyCity`)
2. Mineral hubs (`prepareMineralHubNode`)
3. Optional hyperloop nodes/edges from `existingHyperloopGraph` (planetary build)

Consumed by: `useIntegratedTransportGraph`, `deckLayerFactory` (`integrated-e2e-hubs`, `integrated-mineral-hubs`).

---

## Layer registry ↔ nodes

Primary toggle registry: `src/layers/layerRegistry.js` (`MAP_LAYER_REGISTRY`).

Integrated-specific toggles: `showIntegratedE2E`, `showIntegratedE2M`, `showIntegratedHyperloop`, `showIntegratedLoop`, `showIntegratedMineralHubs`, filters `showPopulation1MPlusOnly`, etc.

Overlay metadata: `src/layers/overlayRegistry.js`.

---

## Hooks that supply live node sets

| Hook | Output |
|------|--------|
| `useE2EHubRegistry` | `roiHubs` / active E2E cities |
| `useIntegratedTransportGraph` | `nodes`, `visibleNodes`, diagnostics |
| `useCustomDestinations` | user overlay points |
| `useParsedCities` | `parsedMapPoints` |
| `useMapScenarios` | scenario overlays (if enabled in UI) |

**Map component:** `src/components/FuturisticTransportMap.jsx` — all deck layers assembled in `layers` useMemo.
