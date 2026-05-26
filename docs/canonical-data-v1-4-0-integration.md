# Canonical data v1.4.0 integration

Planetary Mobility OS loads Claude’s v1.4.0 canonical backbone as **data-only** swaps. The map renderer, UI toggles, and layer registry are unchanged.

## Data package files

### World cities (`src/data/worldCities/`)

| File | Role |
|------|------|
| `worldCities.summary.json` | Startup-safe counts and metadata |
| `worldCities.official.json` | Official / network nodes |
| `worldCities.coords.json` | Coordinates index |
| `worldCities.countryManifest.json` | Per-country chunk manifest |
| `worldCities.utils.js` / `worldCities.types.js` | Helpers and types |
| `chunks/cities_{countrySlug}.json` | Lazy per-country city lists |
| `worldCities.index.json` | **Lazy only** — full search index (~11MB) |
| `worldCities.generated.json` | **Lazy only** — full generated set (~21MB) |

Entry point: `src/data/worldCities/index.js` — static imports only for small files; `lazyLoadWorldCitySearchIndex()` and `lazyLoadFullWorldCitiesGenerated()` for large JSON.

### Canonical transport (`src/data/transport/`)

| File | Role |
|------|------|
| `nodes.json` | 641 network nodes |
| `edges.json` | 796 edges |
| `routes.json` | 221 named routes |
| `layers.json` | Layer metadata |
| `modeRegistry.js` | Canonical mode definitions |
| `taxonomyBridge.js` | Canonical ↔ app taxonomy mapping |
| `globalSpinalNetwork.json` | Ground/tube spinal backbone (not E2E arcs) |

Adapter: `src/data/canonicalTransportAdapter.js`  
Wiring helpers: `src/data/canonicalIntegration.js`

## Safe vs lazy imports

**Safe at startup (bundled with main chunk):**

- `worldCities.summary.json`, `official.json`, `coords.json`, `countryManifest.json`
- `transport/nodes.json`, `edges.json`, `routes.json`, `layers.json`
- `canonicalTransportAdapter.js` (imports transport JSON only)

**Must be lazy-loaded:**

- `worldCities.index.json`
- `worldCities.generated.json`
- Country chunks via `lazyLoadCountryCities(slug)` or `import.meta.glob` in `worldCities/index.js`

**Rule:** Do not render all ~33,733 index cities by default. They exist for search, parser, and debug only.

## City status path

`index_only` → `candidate` → `planning_node` → `official_network_node` → `transfer_hub`

### Current status counts (v1.4.0)

| Status | Count |
|--------|------:|
| `index_only` | 33,051 |
| `official_network_node` | 568 |
| `candidate` | 86 |
| `transfer_hub` | 28 |

**Note:** `transfer_hub` count (28) should be reviewed against the **31 curated E2E hubs** in `getE2EHubs()` — tagging may differ between world-city status and transport nodes.

## Canonical transport totals

| Metric | Count |
|--------|------:|
| Nodes | 641 |
| Edges | 796 |
| Named routes | 221 |
| Spinal nodes | 137 |
| Spinal corridors | 37 |
| Intercontinental connectors | 9 |

Global spinal network (macrodata): 30 E2E transfer hubs, 22 E2M connector hubs, 87 robotaxi-enabled hubs, 0 missing coordinates in package.

## Adapter swaps (app wiring)

| API | Replaces | Fallback |
|-----|----------|----------|
| `getE2EHubs()` | `CURATED_NETWORK_CITIES` / `getMapRoiHubs()` | Legacy 31-row curated table |
| `getIntegratedGraph()` | `generateIntegratedRoutes()` | Legacy generator in `useIntegratedTransportGraph` |
| `getHyperloopPaths()` | Planetary spine path source | Full `buildPlanetaryHyperloopGraph` paths |
| `getLayerVisibility(zoom)` | Partial zoom rules | `zoomVisibility.js` |
| `GLOBAL_SPINAL_NETWORK` | — (macro export only) | N/A |
| `taxonomyBridge.js` | — | App taxonomy constants unchanged |

## Zoom tiers (canonical)

- Zoom 1–3: E2E + global spines  
- Zoom 4–5: continental + E2M  
- Zoom 6–8: loops + feeders  
- Zoom 9+: robotaxi + labels  

**Robotaxi:** local only, minZoom 6, hard cap 80km — never global lines.

## Global spinal network vs E2E

- **E2E Starship:** global air/space arcs (`ArcLayer`).  
- **Global spinal network:** ground/tube backbone (`PathLayer` / surface paths only).  
- Do not treat `GLOBAL_SPINAL_NETWORK` as an E2E layer.

## Validation (metrics panel)

Expected from `getValidationReport()` when data is consistent: **0 errors**, **0 warnings** (orphan edges and missing coords are checked at load time).
