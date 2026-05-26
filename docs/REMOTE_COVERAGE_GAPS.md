# Remote Coverage Gaps — Planning Document

**Status:** Planning only. Not activated on the live map.

This file documents missing or weakly covered regions in the Hyperloop Web. Items here are **future optional planning layers**, not current route generation. Do not treat this document as permission to add live edges until the canonical graph architecture is stable and a deliberate layer pass is approved.

---

## 1. Eastern Europe / Balkans / Black Sea

### Current gap

- Corridor density drops sharply east of Germany/Poland compared to Western Europe.
- Balkans, Ukraine, Moldova, Romania, Bulgaria, and Black Sea littoral states are underrepresented relative to their bridge role between EU trunks and Turkey/Russia.
- Caucasus gateway cities (e.g. Tbilisi, Baku) are sparse or absent from continental spine chains.
- Connectivity between Western Europe ↔ Turkey ↔ Russia ↔ Central Asia relies on a few long hops rather than a visible regional mesh.

### Strategic role

- **Bridge corridor** between Western Europe, Turkey, Russia, Caucasus, and Central Asia.
- Should complete the Eurasian spine visually and in graph audit—not replace the existing London → Istanbul / Moscow corridors, but **feed into** them.

### Future node sourcing

- Pull city names and coordinates from **`worldCities.js`** (and enriched CSV where available).
- Use **`networkCityId(name, country)`** for every node; no ad-hoc slug IDs.
- Curated lists (e.g. corridor seed names) should be **tags/filters** on registry rows, not duplicate city objects.

### Example future corridor themes (not live routes)

- Vienna → Budapest → Belgrade → Sofia → Istanbul (partially overlaps existing gateway defs; gap is **density and Balkan feeders**).
- Warsaw → Kyiv → Odessa → Bucharest (Black Sea arc).
- Moscow → Rostov → Ankara or Caucasus land-bridge (high difficulty; gateway-class only).

---

## 2. Arctic / Greenland / Canadian North / Alaska

### Current gap

- Greenland (Nuuk and north) is strategically placed but **thin**—few sequential hops, many nodes missing coordinates in older audits.
- Canadian Arctic / NWT / Yukon / northern Quebec appear mainly in remote-cargo seed lists, not as a coherent **Arctic logistics trunk**.
- Alaska (Anchorage, Fairbanks, Nome) often sits in a **small disconnected component** separate from the main Americas–Eurasia merge.

### Strategic role

- **Rare earth / logistics / defense / cargo** layer—not a dense passenger mesh.
- Arctic planetary gateway (Montreal → Nuuk → Reykjavík → London) is the passenger **bridge**; northern resource chains are cargo-weighted.

### Future node sourcing

- **`worldCities`** + `globalCoverageManualCoords` / GeoNames for Nuuk, Sisimiut, Iqaluit, Yellowknife, Inuvik, etc.
- Flag `NEEDS_COORDINATES` when CSV has geonameid but no lat/lon yet—do not invent positions.

### Planning notes

- Tunnel / undersea / arctic engineering route class only where geography requires it.
- Connect into existing **Dallas → Chicago → Toronto → Montreal** spine, not new trans-ocean shortcuts.

---

## 3. Siberia / Northern Russia / Central Asia

### Current gap

- Eurasian spine covers several Russian trunk cities (Kazan, Yekaterinburg, Novosibirsk, Krasnoyarsk, Irkutsk) but **northern** and **far-eastern** Russia remain sparse.
- Central Asia (Urumqi, Almaty, Tashkent, Bishkek) appears mainly via **Beijing–Delhi bridge**, not as a continuous regional system.
- Long segments risk looking like isolated dots unless built as **explicit corridor chains**.

### Strategic role

- **Critical for Eurasian continuity**—must read as one land trunk, not scattered nodes.
- Links Moscow spine ↔ Mongolia ↔ Beijing and westward into Kazakhstan/Uzbekistan.

### Future node sourcing

- **`worldCities`** as coordinate backbone for approved city names along Trans-Siberian and Central Asia corridors.
- Prefer sequential chains: Moscow → … → Vladivostok; Almaty → Tashkent → Samarkand → (gateway to Delhi or Tehran).

### Planning notes

- Extreme distance segments stay **trunk/gateway** class, not regional all-to-all.
- No default Bering Strait passenger hop unless explicitly enabled as future gateway (currently disabled in gateway routes).

---

## 4. Amazon / Andes / Patagonia

### Current gap

- Americas south spine (Ushuaia → … → Mexico City → Dallas) improves Patagonia visibility but **Amazon interior** and **Andean east/west** branches are thin.
- Rainforest and river logistics (Manaus, Iquitos, La Paz corridors) rely on remote-cargo seeds, not continental spine attachment.
- Andes crossings need **sparse strategic corridors**, not Andean city mesh.

### Strategic role

- **Remote cargo + rainforest/river logistics** layer.
- Passenger trunk remains the coastal/southern spine; Amazon/Andes are **feeder/cargo** overlays.

### Future node sourcing

- Curated cargo city lists tagged from **`worldCities`**; validate country (Brazil, Peru, Bolivia, Ecuador, Colombia).
- Use corridor chains: Manaus ↔ Brasília; Lima ↔ Santiago; Quito ↔ Bogotá (gateway-class where tunnel/high difficulty).

### Planning notes

- Do not create dense passenger mesh in jungle/low-density interior.
- Panama ↔ Bogotá ↔ Lima segments already touch gateway defs—gap is **interior Amazon reach**.

---

## 5. Sahara / Sahel / Central Africa

### Current gap

- African north–south spine (Cape Town → … → Istanbul) is defined but **Cape Town / southern cluster** can remain disconnected from the largest component in audit.
- West Africa spine (Dakar → Lagos → Douala → Kinshasa) does not always merge into East Africa trunk (Lusaka / Nairobi) in graph connectivity.
- **Sahel** and **Central Africa** (Chad, Niger, CAR, Sudan) are largely absent between north African trunk and sub-Saharan hubs.

### Strategic role

- **Resource logistics and desert corridors**—north/south and west/east continuity.
- Bridge Kinshasa ↔ Lusaka ↔ Nairobi and northward to Cairo/Istanbul without ocean spaghetti.

### Future node sourcing

- **`worldCities`** for Dakar, Niamey, N'Djamena, Khartoum, Luanda, etc., when coordinates exist.
- Mark missing coords explicitly; use Red Sea / Suez **gateway** patterns only where already approved.

### Planning notes

- Desert logistics route class for long arid segments.
- Do not duplicate Lagos/Cairo nodes—canonical **`networkCityId`** only.

---

## 6. Australian Outback

### Current gap

- East–west spine (Perth → … → Brisbane) and interior (Darwin → Alice Springs → Adelaide) exist but **Outback resource nodes** (Mount Isa, Kalgoorlie, Tennant Creek, etc.) are not fully integrated as a **resource corridor layer**.
- Australia–SEA link (Brisbane → Darwin → Jakarta → Singapore) is **special future corridor**—may not merge Sydney/Singapore into main Eurasian CC until activated consistently.

### Strategic role

- **Resource corridor layer**: mining, logistics, outback access.
- Must connect into **Perth, Adelaide, Darwin, Brisbane**—not bypass existing east–west spine.

### Future node sourcing

- Outback city names from remote cargo lists → resolve via **`worldCities`** / manual coords registry.
- Tag nodes as `OUTBACK_RESOURCE` / cargo priority in classification, not default passenger trunk.

---

## 7. Pacific Islands / Remote Island Chains

### Current gap

- Island chains (Indonesia archipelago, Philippines, Pacific micro-states) appear in **future island gateway** definitions or cargo lists but should not become normal hyperloop ocean grids.
- Risk of **ocean spaghetti** if every island port is linked pairwise.

### Strategic role

- **Special future corridor only**: island access, E2E-adjacent hops, Batam/Jakarta/Bali → Darwin style chains.
- Passenger long-ocean remains Starship/E2E arc default.

### Future node sourcing

- **`worldCities`** for coastal/island cities with valid coordinates.
- Route class: `SPECIAL_FUTURE_CORRIDOR` / `ISLAND_ACCESS`—sequential chains only (e.g. Singapore → Batam → Jakarta → Surabaya → Bali → Darwin).

### Planning notes

- No all-to-all inter-island mesh.
- Each chain must land on a **continental anchor** (Singapore, Darwin, Sydney).

---

## 8. Missing Data Strategy

| Principle | Action |
|-----------|--------|
| Master coordinates | **`worldCities.js`** / `world-cities.csv` (+ enrichment) becomes the primary coordinate source; `globalCoverageCoordinates.json` and manual coords are supplements. |
| Curated remote lists | `remoteCargoResourceNodes`, `globalCoverageRegions`, etc. become **tags/filters** on registry lookups—not parallel city object factories. |
| Missing coordinates | Flag `needsCoordinates` / `NEEDS_COORDINATES`; **do not invent** lat/lon. |
| GeoNames | Use `geonameid` from CSV for future import passes (`npm run enrich:economic` pattern). |
| Identity | Always **`networkCityId(name, country)`** at graph build time. |
| Dedup | One canonical node per `networkCityId`; merge duplicates in planetary build, never duplicate render markers. |

---

## 9. Future Map Layers To Add Later

These layers should remain **off by default** until explicitly enabled in layer UI:

| Layer | Purpose |
|-------|---------|
| **Remote Coverage Gaps** | Highlights nodes/corridors listed in this document (planning overlay). |
| **Rare Earth / Strategic Cargo** | Existing phase-3 direction; tie to registry tags. |
| **Future 1M+ Population Hubs** | Phase-2 overlay; connector edges only. |
| **Eastern Europe Completion Layer** | Balkans / Black Sea / Caucasus corridor chains. |
| **Arctic Logistics Layer** | Greenland, NWT, Alaska, northern Russia ports. |
| **Outback Resource Layer** | Australian mining/logistics corridors. |
| **Island Access Layer** | Pacific / SEA island chains as special future corridors only. |

Activation criteria (before any layer goes live):

1. Canonical graph build stable (no duplicate IDs, zero orphan gateway edges).
2. Corridor defined as sequential chain in data file, applied via existing `apply*Gateway` / spine patterns.
3. Visibility controlled through `visibleGraphFilter.js` only.

---

## 10. Rules

- **Do not** render all `worldCities` by default (33k+ rows).
- **Do not** add every city as a route node.
- **Do not** create all-to-all routes or random ocean lines.
- **Do** use corridor chains (sequential hops).
- **Do** use gateway nodes for continent/sea crossings.
- **Do** use canonical **`networkCityId`** for every node.
- **Do** use **`worldCities`** / registry lookup for coordinates.
- **Do** keep the active map stable—planning gaps documented here must not auto-activate in `buildPlanetaryHyperloopGraph` without an explicit pass.

---

## Related docs

- `docs/BUILD_STRATEGY.md` — canonical pipeline and phased rollout
- `src/data/worldCities.js` — city identity and curated ROI hubs
- `src/graph/canonicalNodeResolution.js` — node ID normalization at build time
