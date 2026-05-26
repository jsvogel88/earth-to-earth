import defaults from '../data/defaults.json';
import { getTotalNetworkRevenue } from './routeAnalyzer.js';

export function project5YearRevenue(routes, hubCount, config = defaults) {
  const totalRouteRevenue = getTotalNetworkRevenue(routes);
  const ramp = config.year1RampFactor ?? 0.12;
  const exponent = config.networkEffectExponent ?? 1.35;
  const hubFactor = Math.pow(Math.max(hubCount, 1) / 4, exponent);

  const year1 = totalRouteRevenue * ramp;
  const years = [{ year: 1, revenue: year1 }];

  for (let y = 2; y <= 5; y++) {
    const growth = Math.pow(1.65, y - 1) * hubFactor;
    years.push({ year: y, revenue: year1 * growth });
  }

  return {
    years,
    year5: years[4].revenue,
    year1,
    totalRouteRevenue,
  };
}

export function revenueBreakdown(routes, hubCount, config = defaults) {
  const projection = project5YearRevenue(routes, hubCount, config);
  const year5 = projection.year5;
  const milMin = config.militaryFloorMin ?? 35e9;
  const milMax = config.militaryFloorMax ?? 50e9;
  const hubScale = Math.min(1, hubCount / 12);
  const military = (milMin + (milMax - milMin) * hubScale) * hubScale;

  const remainder = Math.max(0, year5 - military);
  const cargoShare = 0.35;
  const passengerShare = 0.35;
  const govShare = 0.2;
  const emergencyShare = 0.1;

  return {
    military: { low: milMin * hubScale, high: milMax * hubScale, mid: military },
    cargo: remainder * cargoShare,
    passenger: remainder * passengerShare,
    government: remainder * govShare,
    emergency: remainder * emergencyShare,
    total: year5,
    margins: {
      military: config.militaryMargin,
      cargo: config.cargoMargin,
      passenger: config.passengerMargin,
      government: config.governmentMargin,
      emergency: config.emergencyMargin,
    },
  };
}

export function sensitivityCases(routes, hubCount, config = defaults) {
  const base = project5YearRevenue(routes, hubCount, config);
  return {
    base: base.year5,
    bull: base.year5 * 1.35,
    bear: base.year5 * 0.65,
  };
}
