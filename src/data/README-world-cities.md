# World Cities master file (Route Optimizer / selector only)

**File:** [`world-cities.csv`](world-cities.csv)  
**Loader:** [`worldCities.js`](worldCities.js)

## Not used on the main Network Map

The ~33k-row `world-cities.csv` master list is **not** rendered on the default Network Map.

The main map uses two **curated** datasets only:

| Layer | Data file |
|-------|-----------|
| Rare Earth / Remote Strategic Hubs | `globalCoverageRegions.js` → `remoteStrategicNodes.js` → `rareEarthHubCandidates.js` |
| Future 1M+ Population Hyperloop Hubs | `futureHighPopulationCities.js` |

Coordinates for curated seeds come from `hyperloopPhase1Coordinates.js`, `globalCoverageCoordinates.json`, and `globalCoverageManualCoords.js` via `cityCoordinateLookup.js`.

## Where world-cities.csv is used

- **Route Optimizer** tab — city selection / network analysis (`routeModel`)
- Optional future: coordinate enrichment during data builds (not live map scatter)

## Replacing the CSV

Copy an updated CSV into `src/data/world-cities.csv` and restart the dev server. Do not point the main map layers at this file.
