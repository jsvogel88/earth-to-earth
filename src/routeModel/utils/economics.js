export function getConstraintTag(timeSavingsHours) {
  if (timeSavingsHours >= 12) return 'pharma';
  if (timeSavingsHours >= 8) return 'supply-chain';
  if (timeSavingsHours >= 4) return 'regional';
  return 'marginal';
}

export function constraintTierScore(tag) {
  const scores = { pharma: 100, 'supply-chain': 75, regional: 45, marginal: 15 };
  return scores[tag] ?? 15;
}

export function passengerDemand(cityA, cityB, timeSavingsHours) {
  const biz = (cityA.businessTravelers + cityB.businessTravelers) / 2;
  const pop = (cityA.population + cityB.population) / 2;
  const timeFactor = Math.min(1, timeSavingsHours / 8);
  return (biz * 0.4 + pop * 0.00002) * timeFactor;
}

export function cargoDemandKg(cityA, cityB, timeSavingsHours, distanceKm) {
  const gdp = (cityA.gdp + cityB.gdp) / 2;
  const timeFactor = 1 + timeSavingsHours / 12;
  const distFactor = distanceKm / 5000;
  return gdp * 1e-6 * timeFactor * Math.max(0.5, distFactor);
}

export function routeRevenue(
  passengerTrips,
  cargoKg,
  defaults,
  airportCapacityA,
  airportCapacityB
) {
  const cap = Math.min(airportCapacityA, airportCapacityB) * 365;
  const pax = Math.min(passengerTrips, cap);
  const passengerRev = pax * (defaults.passengerYield ?? 15000);
  const cargoRev = cargoKg * (defaults.cargoPrice ?? 6.5);
  return passengerRev + cargoRev;
}

export function strategicScore(cityA, cityB, timeSavingsHours, constraintTag) {
  const reg = ((cityA.regulatoryEase ?? 0.5) + (cityB.regulatoryEase ?? 0.5)) / 2;
  const stab = ((cityA.geopoliticalStability ?? 0.5) + (cityB.geopoliticalStability ?? 0.5)) / 2;
  const timeNorm = Math.min(100, (timeSavingsHours / 17) * 100);
  const constraint = constraintTierScore(constraintTag);
  return timeNorm * 0.4 + reg * 100 * 0.2 + stab * 100 * 0.2 + constraint * 0.2;
}

export function militaryRouteScore(cityA, cityB) {
  return (
    ((cityA.geopoliticalStability ?? 0.5) + (cityB.geopoliticalStability ?? 0.5)) / 2
  );
}

export function cargoRouteScore(timeSavingsHours, cargoKg) {
  return timeSavingsHours * 2 + Math.log10(Math.max(1, cargoKg));
}
