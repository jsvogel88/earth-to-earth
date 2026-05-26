# Current Map — Route Inventory

Read-only catalog of **route-like geometry** (paths, arcs, corridors) and how they are produced and rendered.

---

## Route production pipelines

| Pipeline | Entry function | Output shape | Primary renderer |
|----------|----------------|--------------|------------------|
| **Planetary hyperloop web** | `buildPlanetaryHyperloopGraph()` | `nodes[]`, `edges[]`, `webRenderablePaths[]` | `PathLayer` (`planetary-skeleton-trunks`, `global-hyperloop-web-routes`, …) |
| **Integrated grid** | `generateIntegratedRoutes()` | `nodes[]`, `edges[]` (modes: e2e, e2m, hyperloop, loop) | `deckLayerFactory.js` (`integrated-*`) |
| **E2E origin view** | `buildE2EOriginView()` | `starshipRoutes`, `hyperloopRoutes`, `e2eFeederRoutes` | `ArcLayer` / `PathLayer` when E2E mode |
| **E2M orbital** | `buildE2MOrbitalPaths()` | path arrays | `PathLayer` `e2m-orbital-routes` |
| **Robotaxi** | `buildRobotaxiServiceZones()` | GeoJSON features, dots | `GeoJsonLayer` / `ScatterplotLayer` |
| **Planning manual** | static corridor records | path arrays from node names | `global-connectivity-corridors` |
| **Custom preview** | `buildCustomConnectionPreviews()` | preview segments | `custom-connection-preview` |
| **Remote / rural** | `generateExtendedRuralEdges()` | branch edges | `extended-rural-routes` |

**Orchestration in map:** `src/components/FuturisticTransportMap.jsx` — `visibleLayers` useMemo selects deck layer IDs; `layers` useMemo instantiates deck.gl layers.

---

## By mode / feature

### E2E Starship routes

| Item | Detail |
|------|--------|
| **Type** | Great-circle **arcs** (long distance) |
| **Threshold** | `ROUTE_THRESHOLDS.starshipPassengerMinMiles` (1400 mi) in `hyperloopRouteClasses.js` |
| **Generator** | `buildE2EOriginView.js` — hub-to-hub from selected origin |
| **Route class** | `STARSHIP_E2E_ARC` / deck object `type: 'starship'` |
| **Deck layer** | `starship-routes` (`ArcLayer`) |
| **When shown** | E2E Starship mode / overview when `starshipRoutes.length > 0` |
| **Integrated equivalent** | `generateE2ERoutes.js` → `integrated-e2e-routes` (`ArcLayer` in factory) |

---

### E2E feeder routes

| Item | Detail |
|------|--------|
| **Sources** | Phase-1 E2E radial links; sliced origin view feeders |
| **Deck** | `e2e-feeder-routes` |
| **Config** | `regionalFeederCities.js`, `applyFeederTrunkAttachment.js` |

---

### E2M routes

| Item | Detail |
|------|--------|
| **Integrated generator** | `src/graph/generateE2MRoutes.js` |
| **Edge modes** | `EDGE_MODES.E2M`, types `resource`, `industrial`, `feeder` |
| **Deck (integrated)** | `integrated-e2m-routes` (`PathLayer`) |
| **Orbital paths** | `e2mOrbitalNodes.js` — separate from mineral feeders |
| **Deck (orbital)** | `e2m-orbital-routes` |
| **Remote cargo** | `remoteCargoRoutes.js`, `remoteCargoPlanningRoutes.js` → `remote-cargo-critical-minerals-routes` |

---

### Hyperloop spine / trunk routes

| Item | Detail |
|------|--------|
| **Continental spines** | `planetaryContinentalSpines.js` + `applyContinentalSpines.js` |
| **Regional corridors** | `hyperloopContinentalCorridors.js` (sequential chains, no all-to-all) |
| **Infrastructure trunks** | `planetaryInfrastructureTrunks.js` + `applyInfrastructureTrunks.js` |
| **Crosslinks** | `hyperloopCrosslinks.js` |
| **Through routes** | `generateThroughRoutes.js`, `generateCorridorThroughRoutes.js`, `throughRouteConfig.js` |
| **Merge gateways** | `applyPlanetaryMergeGateways.js` |
| **Mesh cleanup** | `pruneMeshSpaghetti.js` |
| **Route classes** | `HYPERLOOP_ROUTE_CLASSES` in `hyperloopRouteClasses.js` |
| **Styles** | `getRouteColor`, `getHyperloopLineWidth` — data + `styles/hyperloopRouteStyles.js` |
| **Legacy deck** | `planetary-skeleton-trunks`, `global-hyperloop-web-routes`, `hyperloop-routes` |
| **Integrated deck** | `integrated-hyperloop-spine` — merges `webRenderablePaths` + hyperloop edges from integrated graph |
| **Visibility** | `planetarySkeletonVisibility.js`, `visibleGraphFilter.js`, `zoomVisibility.js` |

**Important:** In Civilization Grid, when integrated layers are active, legacy `planetary-skeleton-trunks` is **skipped** in favor of integrated spine; fallback restores legacy paths if integrated deck layers fail or are empty.

---

### Hyperloop regional loops

| Item | Detail |
|------|--------|
| **Meaning** | Regional corridor chains and loop-style connectors in phase-1 graph (not a separate “loop mode” file) |
| **Files** | `hyperloopContinentalCorridors.js`, corridor `nodeSequence` edges in `phase1GlobalHyperloopGraph.js` |
| **Integrated “loop” mode** | See Loop section below (different concept) |

---

### Feeder city routes

| Item | Detail |
|------|--------|
| **Attachment logic** | `applyFeederTrunkAttachment.js` |
| **Edge categories** | Feeder / local connector / E2E feeder strings in edge metadata |
| **Deck** | `feeder-cities` (points), `feeder-labels`, feeders in hyperloop web mode |
| **Filter toggle** | `showFeederRoutesFilter`, `showFeeders`, `showLocalFeeders` |

---

### Loop routes (integrated transport mode)

| Item | Detail |
|------|--------|
| **Generator** | `generateLoopRegionalRoutes.js` |
| **Behavior** | City → nearest E2E or hyperloop anchor within `maxRadiusKm` (default 800), cap `maxLoopEdges` (500) |
| **Deck** | `integrated-loop-routes` |
| **Zoom** | `zoomVisibility` min ~6 for loop edges |

---

### Robotaxi / auto routes

| Item | Detail |
|------|--------|
| **Routes?** | **No intercity routes** — zones and hub dots only (`transportOperatingSystem` description) |
| **Geometry** | Polygon zones + scatter pickup/dropoff |
| **Files** | `robotaxiLayer.js`, `robotaxiVisibility.js` |
| **Deck** | `robotaxi-service-zones-*`, `robotaxi-hub-availability`, `robotaxi-pickup-dropoff` |

---

### Planning grid edges

| Item | Detail |
|------|--------|
| **Planning “edges”** | Mostly **not** graph edges — scatter grid is role-colored **nodes** |
| **Manual macro corridors** | `globalConnectivityCorridors.js` — planning overlay paths only |
| **Deck** | `global-connectivity-corridors` (`PathLayer`, dashed) |
| **Schema** | `corridorPlanningSchema.js` |

---

### Custom destination / parsed city connections

| Item | Detail |
|------|--------|
| **Custom preview** | `customConnectionPreview.js` — dashed preview to nearest hub/trunk (not persisted graph) |
| **Parsed** | Same preview pipeline; isolation mode restricts other layers |
| **Contract** | `previewSegmentContract.js`, tests `customConnectionPreview.*` |

---

### Cargo / resource / mineral corridors

| Item | Detail |
|------|--------|
| **Mineral connections** | Generated in `generateE2MRoutes` (not static edge list in `mineralHubs.js`) |
| **Remote cargo** | `remoteCargoRoutes.js`, `remoteCargoPlanningRoutes.js` |
| **Extended rural** | `extendedRuralNetwork.js` — `REMOTE_EDGE_TYPES` (arctic branch, river port connector, desert logistics, …) |
| **Deck** | `remote-cargo-critical-minerals-routes`, `extended-rural-routes` |
| **Toggle** | `showRemoteCargoRoutes`, `showCargoCorridors`, `showExtendedRuralLayer` |

---

### Connectivity repair / audit

| Item | Detail |
|------|--------|
| **Repair links** | `generateConnectivityRepairLinks` in planetary build |
| **Audit** | `graphConnectivityAudit.js`, `disconnected-nodes-audit` layer |
| **Toggles** | `showConnectivityRepairLinks`, `showDisconnectedAudit` |

---

### Starship / catchment / misc legacy layers

| Layer ID | Data |
|----------|------|
| `catchment-zones-fill/outline` | `generateCatchmentZone` around selected E2E origin |
| `hub-cities` | ROI hub scatter (pick origin) |
| `switch-nodes` | Hyperloop switches |
| `connectivity-repair-routes` | Repair pass edges |

---

## Integrated route schema

Defined in `src/graph/integratedGraphTypes.js`:

| Field | Values |
|-------|--------|
| `mode` | `e2e`, `e2m`, `hyperloop`, `loop`, `auto` |
| `route_type` | `global`, `trunk`, `regional`, `feeder`, `resource`, `industrial`, `urban`, `local`, `last_mile`, `repair` |
| `corridor_type` | `passenger`, `freight`, `industrial`, `resource`, `mixed`, `strategic`, `local_access` |

Conversion to deck paths: `src/map/integratedEdgePaths.js` (`integratedEdgesToRenderData`).

Layer factory: `src/map/deckLayerFactory.js` (`INTEGRATED_LAYER_IDS`).

Filters: `src/ui/integratedGridFilters.js`, `src/graph/integratedGridFilters.js`, view focuses (Integrated Grid, Hyperloop Spine, E2E Global, …).

---

## Full deck layer ID list (route / network geometry)

From `FuturisticTransportMap.jsx` + `deckLayerFactory.js`:

| Layer ID | Layer type | Typical data source |
|----------|------------|---------------------|
| `integrated-hyperloop-spine` | Path | Planetary paths + integrated hyperloop edges |
| `integrated-e2e-routes` | Arc | `generateE2ERoutes` |
| `integrated-e2m-routes` | Path | `generateE2MRoutes` |
| `integrated-loop-routes` | Path | `generateLoopRegionalRoutes` |
| `planetary-skeleton-trunks` | Path | `webRenderablePaths` |
| `global-hyperloop-web-routes` | Path | Planetary graph paths |
| `hyperloop-routes` | Path | Legacy hyperloop slice |
| `e2e-feeder-routes` | Path | Origin view / graph feeders |
| `starship-routes` | Arc | `buildE2EOriginView` |
| `e2m-orbital-routes` | Path | `e2mOrbitalNodes` |
| `global-connectivity-corridors` | Path | Manual corridors |
| `extended-rural-routes` | Path | Extended rural generator |
| `remote-cargo-critical-minerals-routes` | Path | Remote cargo builder |
| `connectivity-repair-routes` | Path | Repair links |
| `custom-connection-preview` | Path | Preview builder |
| `robotaxi-service-zones-fill/outline` | GeoJSON | Robotaxi zones |
| `catchment-zones-fill/outline` | GeoJSON | E2E catchment |

---

## Layer registry & toggles (metadata only)

| File | Role |
|------|------|
| `src/layers/layerRegistry.js` | `MAP_LAYER_REGISTRY` — toggles, transport modes, `stateKey`, `deckLayerId` |
| `src/data/mapLayerDefaults.js` | Per-mode default layer state |
| `src/layers/overlayRegistry.js` | Planning vs official overlay taxonomy |
| `src/layers/planningOverlayLayers.js` | Planning overlay helpers |
| `src/data/visibleGraphFilter.js` | Hyperloop path visibility rules (data-adjacent) |
| `src/graph/visibleGraphFilter.js` | Graph-side visibility filter |

---

## Route rendering utilities

| File | Role |
|------|------|
| `src/utils/routeTooltip.js` | Tooltip HTML for route picks (`ROUTE_TOOLTIP_LAYER_IDS`) |
| `src/utils/hyperloopRouteStyles.js` | Re-exports / helpers for colors |
| `src/data/hyperloopRouteStyles.js` | Route color tokens |
| `src/styles/hyperloopRouteStyles.js` | Style tokens for deck |
| `src/utils/applyEdgeConstruction.js` | Tunnel/surface metadata on edges |
| `src/utils/constructionMetrics.js` | Aggregate construction stats |

---

## Generated vs static

| Static (checked in) | Generated at runtime |
|---------------------|----------------------|
| Corridor node name lists | `webRenderablePaths` from planetary build |
| Mineral hub seeds | E2M edges to nearest hubs |
| Manual connectivity corridors | Integrated edges after `generateIntegratedRoutes` |
| Orbital corridor definitions | Starship arcs when origin selected |
| Remote region city name lists | Repair links, rural branches |

---

## See also

- [current-map-data-mindmap.md](./current-map-data-mindmap.md)
- [current-map-node-inventory.md](./current-map-node-inventory.md)
- [current-map-data-issues.md](./current-map-data-issues.md)
