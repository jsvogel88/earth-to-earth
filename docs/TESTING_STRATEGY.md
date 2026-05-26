# Transport Map — Testing Strategy

## Philosophy

Automated tests protect the app from regressions that manual testing misses: blank screens, broken map rendering, invalid graph data (duplicate IDs, orphan edges), broken layer toggles, invalid registry entries, accidental route creation from planning overlays, and mode cross-contamination (E2E vs Hyperloop vs E2M vs Robotaxi).

Prioritize **practical confidence** over coverage percentages. Avoid brittle pixel-perfect visual assertions.

## Tooling

| Layer | Tool | Location |
|-------|------|----------|
| Unit / graph / registry | Vitest | `src/tests/*.test.js` |
| Component / integration | Vitest + React Testing Library | `src/tests/FuturisticTransportMap.test.jsx` |
| Browser smoke + screenshots | Playwright | `tests/app-smoke.spec.js` |

## NPM scripts

```bash
npm run test          # Vitest unit + component tests
npm run test:serial   # Same suite, single worker (use if parallel run OOMs on Windows)
npm run test:watch    # Vitest watch mode
npm run test:ui       # Vitest UI
npm run test:e2e      # Playwright (builds + preview server)
npm run test:all      # test + build + e2e
```

### Vitest worker memory (Windows / large graph suites)

The full suite (`npm run test`) runs files in parallel. On some machines, heavy graph + map tests can cause Vitest worker exits (`Worker exited unexpectedly`) even when individual files pass in isolation.

- **Do not ignore failures** — re-run the failing file or use serial mode.
- **Reliable full run:** `npm run test:serial` (single fork, all 19 files).
- **Targeted runs:** `npm run test -- src/tests/integratedGridPhase3.test.jsx`

## Cursor test protocol

After every **meaningful code update**, Cursor should ask:

> **Should I run the test protocol now?**

When you say **yes**:

| Change type | Commands |
|-------------|----------|
| Graph / data only | `npm run test` |
| UI / components | `npm run test` → `npm run test:e2e` |
| Map rendering, sidebar, modes, layers | `npm run test` → `npm run build` → `npm run test:e2e` |
| Before deployment | `npm run test:all` |

Report: what passed/failed, exact file/test name, likely cause, recommended fix, and whether it is safe to keep editing.

## Test files

| File | Covers |
|------|--------|
| `graphIntegrity.test.js` | `buildPlanetaryHyperloopGraph`, duplicates, orphans, connectivity, trunks / through-routes |
| `zoomVisibility.test.js` | Integrated graph zoom tiers (global/regional/city/local) |
| `deckLayerFactory.test.js` | E2E/E2M/Loop deck layers, no auto/hyperloop duplicates |
| `integratedGridPhase4.test.js` | Combined filters + zoom + route tooltips |
| `layerRegistry.test.js` | Registry shape, debug/heavy defaults, placeholders |
| `nodeClassification.test.js` | E2E vs cargo vs robotaxi vs custom destinations |
| `routeFilters.test.js` | Mode presets, visibility filters, no graph mutation |
| `modeContractCompliance.test.js` | Registry-driven mode contracts (update-proof) |
| `modeTestContracts.js` | Required metadata per transport mode |
| `customConnectionPreview.test.js` | Planning preview isolation from official graph |
| `FuturisticTransportMap.test.jsx` | App render, sidebar, toggles, legend |
| `tests/app-smoke.spec.js` | Real browser load, console errors, toggles, screenshots |

## Update-proof modes

Every `transport_mode` entry in `MAP_LAYER_REGISTRY` must have a matching row in `src/tests/modeTestContracts.js`. If a mode is added without a contract, Vitest fails with:

> New mode detected without test contract. Add this mode to modeTestContracts.js before continuing.

### New mode checklist

1. Route-producing, overlay-only, or local mobility?
2. Should it create edges? Intercity edges?
3. Default visibility and sidebar group?
4. Legend and screenshot review?
5. Heavy layer → default OFF?
6. Add contract + run `npm run test` / `test:e2e` / `test:all` as appropriate.

## Screenshots

Playwright saves review-only PNGs to `test-results/screenshots/` (no strict pixel diff yet):

- Default E2E, Hyperloop Web, Planning Grid, E2M, Robotaxi, Rare Earth, sidebar, legend, post mode-switching.

## Known limitations

- Deck.gl / MapLibre are mocked in component tests; WebGL behavior is only covered in Playwright smoke tests.
- Full planetary graph builds are sampled with a subset of ROI hubs in some tests; very large graphs are not stress-tested.
- Screenshot comparison is manual; map pixels drift with data changes.
- Route Optimizer page has minimal automated coverage.
- Economic enrichment scripts are not in the default test run.

## Still requires manual review

- Visual aesthetics and label placement at multiple zoom levels.
- Performance with full hub sets and long sessions.
- Real geodata accuracy and new city coordinates.
- Cross-browser behavior (tests target Chromium).
- Accessibility and mobile layout edge cases.

## Future ideas

- Visual regression with tolerant diff thresholds.
- Performance benchmarks and memory profiling.
- Large-graph stress tests.
- Route Optimizer end-to-end flows.
- AI-assisted graph anomaly detection.
