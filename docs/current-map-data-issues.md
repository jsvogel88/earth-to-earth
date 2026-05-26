# Current Map — Data Issues & Cleanup Backlog

Read-only assessment of **known gaps, duplication, and risks** in the current data architecture. No fixes applied in this pass.

**Context:** App is stable at `localhost:5175` with Civilization Grid default; build passes. This list is for **later** data cleanup and a future canonical graph — not immediate refactors.

---

## Checkpoint (this task)

| Check | Result |
|-------|--------|
| `git status` | On `master`, **no commits yet**; large staged index includes `node_modules/` + `dist/`; unstaged: `FuturisticTransportMap.jsx`, `dist/` |
| Working state in git | **Not committed** — disk matches running app but VCS checkpoint incomplete |
| `npm.cmd run build` | **PASS** (~10s) |

---

## P0 — Architectural clarity

### Dual hyperloop rendering paths

- **Legacy:** `buildPlanetaryHyperloopGraph` → `webRenderablePaths` → `planetary-skeleton-trunks` / `global-hyperloop-web-routes`.
- **Integrated:** `generateIntegratedRoutes` + `deckLayerFactory` → `integrated-hyperloop-spine`.
- Civilization Grid prefers integrated layers and **suppresses** legacy skeleton trunks when integrated layers succeed; fallback re-enables legacy paths on failure/empty deck output.
- **Issue:** Same physical corridors can be owned by two pipelines with different width/color/zoom rules → “unclear route ownership” when debugging visuals.

### No single canonical graph yet

- `generateIntegratedRoutes` merges cities, minerals, and optional hyperloop graph — but E2M orbital paths, robotaxi zones, parsed/custom overlays, and manual corridors remain **outside** the integrated edge list.
- `MODE_REGISTRY` (`modeRegistry.js`) documents intent for a future canonical model; `layerRegistry.js` still drives UI toggles separately.

### Three coordinate authorities

| Authority | Scope |
|-----------|--------|
| `CURATED_NETWORK_CITIES` | 31 hubs — full lat/lon |
| `hyperloopPhase1Coordinates.js` / `PHASE1_MANUAL_COORDS` | Phase-1 city names |
| `world-cities.csv` | ~33k names — **no coordinates in CSV** |

Matching uses `normalizeCityKey`, aliases in spine/corridor files, and `cityCoordinateLookup.js`. **Duplicate or mismatched spellings** (e.g. Rio vs Rio de Janeiro, Dallas vs Dallas-Fort Worth) are handled ad hoc via alias maps — not one global gazetteer.

---

## P1 — Data quality

### Missing coordinates

- `world-cities.csv` rows lack lat/lon; enrichment is partial via economics loader and manual coords.
- Remote/coverage seeds **drop** cities when lookup fails (`hasCoordinates` guards throughout builders).
- Mineral hubs mark `coordinate_confidence` for approximate entries — still renderable but imprecise.

### Duplicate cities / identities

- Same city can appear as: curated hub (`net:…`), phase-1 node, planning grid point, future hub overlay, or parsed/custom overlay with **different IDs**.
- `canonicalNodeResolution.js` and `networkCityId()` reduce but do not eliminate duplicates across **overlay vs graph** namespaces.

### Choppy or misleading lines

- Long **E2E arcs** and starship routes use straight great-circle deck arcs — visually “choppy” or unrealistic at world scale (expected for current renderer).
- **Zoom-tier filtering** (`zoomVisibility.js`, `edgeHasValidVisibilityZoom`) can hide all integrated routes at some zoom levels while UI still shows “Grid” mode — perceived as blank or sparse map.
- Dense mesh in hyperloop web before `pruneMeshSpaghetti` — still heavy in Hyperloop Core mode.

---

## P2 — Product / UX data issues

### Too many visual layers

- `MAP_LAYER_REGISTRY` has **40+** toggles plus 5 transport mode tabs and integrated view-focus presets.
- Planning Tools section duplicates concepts (E2E layer, hyperloop layer, loop layer, mineral hubs, population filters).
- **Risk:** Users enable conflicting overlays (future hubs + integrated grid + rural remote + connectivity corridors) → clutter and GPU load (13MB+ JS bundle).

### Routes not connected across modes

- E2E starship arcs do not share edge IDs with hyperloop trunk edges.
- Robotaxi zones do not connect to graph edges (`overlayOnly`).
- Custom/parsed previews are explicitly **not** merged into planetary graph (by design; tests enforce isolation).
- Multimodal trip chain data exists (`multimodalTripChain.js`) but is not a live unified pathfinder on the map.

### Robotaxi showing too globally

- Zones are built from many trunk/E2M/rare-earth inputs; visibility gating depends on `hubMobilityActive` / robotaxi mode — easy to appear “everywhere” when layers are on in Civilization Grid with broad hub inputs.
- Review `robotaxiVisibility.js` thresholds when cleaning data.

### Hyperloop lines “not clean enough”

- Multiple enrichment passes (spines, through routes, crosslinks, merge gateways, repair links, rural branches) add edges incrementally.
- `connectivity-repair-routes` and `disconnected-nodes-audit` expose underlying graph gaps — good for dev, noisy for demos.

---

## P3 — Repository / process

### Git checkpoint incomplete

- Intended commit message: *“Restore working transport map after data backbone upgrade”* — **not on `master` yet**.
- Staged `node_modules/` and `dist/` should not be committed; reset staging and rely on `.gitignore` before first real commit.

### Test vs production data bleed

- `test-results/screenshots/` and Playwright artifacts exist in repo tree — ensure they stay out of production bundles (not imported by `src/` today; grep shows no `test-results` imports in app code).

### Dynamic import / bundle size

- `worldCities.js` static + dynamic economics import — Vite warns about mixed static/dynamic import; does not break build but complicates chunking.

---

## P4 — Documentation drift risks

| Doc | Risk |
|-----|------|
| `README-world-cities.md` | Correctly says CSV not on map — easy to forget when adding features |
| `docs/REMOTE_COVERAGE_GAPS.md` | May lag behind `globalCoverageRegions.js` seeds |
| `modeRegistry.js` header | Says “do not replace layerRegistry yet” — integrators should read both |

---

## Suggested cleanup order (future work — not started)

1. **First git commit** with only `src/`, `docs/`, config — exclude `node_modules`, `dist`, `test-results`.
2. **Canonical node table** — export from `CURATED_NETWORK_CITIES` + phase-1 coords + mineral hubs with stable IDs.
3. **Single hyperloop path list** — planetary build OR integrated merge, not both on screen by default.
4. **Coordinate enrichment pass** for high-value planning seeds missing coords.
5. **Layer consolidation** — map registry toggles to 2–3 preset bundles (already started with Integrated Grid view focuses).
6. **Defer** full transport model rewrite until inventories above are stable.

---

## Files to treat as source-of-truth candidates (later)

| Domain | Primary files |
|--------|----------------|
| Hubs | `worldCities.js`, `useE2EHubRegistry.js` |
| Hyperloop topology | `buildPlanetaryHyperloopGraph.js`, `phase1GlobalHyperloopGraph.js` |
| Integrated edges | `generateIntegratedRoutes.js`, `integratedGraphTypes.js` |
| Minerals | `mineralHubs.js`, `generateE2MRoutes.js` |
| Overlays only | `userCustomDestinations.js`, `parseCities.js`, `globalConnectivityCorridors.js` |
| UI toggles | `layerRegistry.js` (metadata only — not geometry) |

---

## See also

- [current-map-data-mindmap.md](./current-map-data-mindmap.md)
- [current-map-node-inventory.md](./current-map-node-inventory.md)
- [current-map-route-inventory.md](./current-map-route-inventory.md)
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
