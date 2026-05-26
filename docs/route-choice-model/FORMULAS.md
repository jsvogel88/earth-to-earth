# Route Choice Model — Implemented Formulas (v1)

This document describes the math implemented in `src/routeModel/`.

## Geography (`utils/geography.js`)

- **Haversine distance (km):** Earth radius 6371 km.
- **Orbital flight time (hours):** `distanceKm / orbitalVelocity` (default 23,800 km/h).
- **Conventional flight time (hours):**
  - Cruise: `distanceKm / cruiseSpeedKmh` (default 850 km/h)
  - Connections: +2h if distance &lt; 5000 km, else +4h
  - Hub penalty: +0.5h per tier step between origin and destination (1A=0, 1B=1, 1C=2)
- **Time savings (hours):** `max(0, conventionalHours - orbitalHours)`

## Economics (`utils/economics.js`)

- **Constraint tag:** from time savings — ≥12h `pharma`, 8–12h `supply-chain`, 4–8h `regional`, &lt;4h `marginal`
- **Passenger demand (annual trips):** `(businessTravelers * 0.4 + population * 0.00002) * min(1, timeSavings/8)`
- **Cargo demand (kg/year):** `gdp * 1e-6 * (1 + timeSavings/12) * (distanceKm/5000)`
- **Route revenue ($/year):** `min(passengerDemand, airportCapacity * 365) * passengerYield + cargoKg * cargoPrice`
- **Strategic score (0–100):** weighted sum of normalized time savings, regulatory ease, geopolitical stability, constraint tier

## Network (`modules/routeAnalyzer.js`)

- Pairwise routes for all selected hub pairs (unordered).
- Routes below 1400 mi (~2253 km) are excluded (Starship passenger minimum per map spec).

## Optimization (`modules/networkOptimizer.js`)

- **Greedy:** start empty; repeatedly add hub maximizing marginal total network revenue until all selected hubs are included.
- **Constraint-collapse:** sort routes by time savings descending; assign Q1–Q4 launch quarters to top routes.
- **Military-first / Cargo-focused:** re-rank routes using stability or cargo-weighted scores.

## Financial (`modules/financialModeler.js`)

- **Year 1:** sum of route revenues × `year1RampFactor` (0.12).
- **Years 2–5:** compound with `(hubCount / 4) ^ networkEffectExponent`.
- **Breakdown:** military floor band scaled by hub count; remainder split by cargo/passenger/gov/emergency margins from defaults.

## Local hosting

Run from repo root: `npm run dev` → http://localhost:5173
