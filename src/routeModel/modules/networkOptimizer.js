import {
  analyzeNetwork,
  getTotalNetworkRevenue,
  loadCities,
} from './routeAnalyzer.js';
import { militaryRouteScore, cargoRouteScore } from '../utils/economics.js';

export function greedyOptimization(selectedCities, config) {
  if (selectedCities.length < 2) {
    return { hubOrder: [...selectedCities], routes: [], marginalSteps: [] };
  }

  const remaining = [...selectedCities];
  const hubOrder = [];
  const marginalSteps = [];

  while (remaining.length > 0) {
    let bestCity = null;
    let bestMarginal = -Infinity;

    if (hubOrder.length === 0) {
      bestCity = remaining.reduce((a, b) => ((a.gdp ?? 0) >= (b.gdp ?? 0) ? a : b));
      bestMarginal = 0;
    } else {
      const prevRoutes = analyzeNetwork(hubOrder, config);
      const prevTotal = getTotalNetworkRevenue(prevRoutes);

      for (const candidate of remaining) {
        const trial = [...hubOrder, candidate];
        const routes = analyzeNetwork(trial, config);
        const total = getTotalNetworkRevenue(routes);
        const marginal = total - prevTotal;
        if (marginal > bestMarginal) {
          bestMarginal = marginal;
          bestCity = candidate;
        }
      }
    }

    hubOrder.push(bestCity);
    remaining.splice(remaining.indexOf(bestCity), 1);
    marginalSteps.push({ city: bestCity, marginalRevenue: bestMarginal });
  }

  const routes = analyzeNetwork(hubOrder, config);
  return { hubOrder, routes, marginalSteps };
}

export function constraintCollapse(selectedCities, config, maxRoutes = 4) {
  const routes = analyzeNetwork(selectedCities, config);
  const sorted = [...routes].sort((a, b) => b.timeSavingsHours - a.timeSavingsHours);
  const quarters = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
  const launchSequence = sorted.slice(0, maxRoutes).map((route, i) => ({
    quarter: quarters[i] ?? `Q${i + 1} 2026`,
    route,
    rank: i + 1,
  }));
  return { routes: sorted, launchSequence };
}

export function militaryFirstOptimization(selectedCities, config) {
  const routes = analyzeNetwork(selectedCities, config);
  const sorted = [...routes].sort((a, b) => {
    const scoreA =
      militaryRouteScore(a.origin, a.destination) * 100 + a.timeSavingsHours;
    const scoreB =
      militaryRouteScore(b.origin, b.destination) * 100 + b.timeSavingsHours;
    return scoreB - scoreA;
  });
  return { routes: sorted, strategy: 'military-first' };
}

export function cargoFocusedOptimization(selectedCities, config) {
  const routes = analyzeNetwork(selectedCities, config);
  const sorted = [...routes].sort((a, b) => {
    const scoreA = cargoRouteScore(a.timeSavingsHours, a.cargoKg);
    const scoreB = cargoRouteScore(b.timeSavingsHours, b.cargoKg);
    return scoreB - scoreA;
  });
  return { routes: sorted, strategy: 'cargo-focused' };
}

export function runOptimization(strategy, selectedCities, config) {
  switch (strategy) {
    case 'greedy':
      return greedyOptimization(selectedCities, config);
    case 'constraint-collapse':
      return constraintCollapse(selectedCities, config);
    case 'military-first':
      return militaryFirstOptimization(selectedCities, config);
    case 'cargo-focused':
      return cargoFocusedOptimization(selectedCities, config);
    default:
      return { routes: analyzeNetwork(selectedCities, config) };
  }
}

export function citiesFromPreset(presetKey) {
  const all = loadCities();
  const byCode = (code) => all.find((c) => c.code === code);
  if (presetKey === 'default12') {
    return [
      'FRA', 'NYC', 'TKO', 'LON', 'SHA', 'SIN', 'DXB', 'SYD', 'LAX', 'PAR', 'SAO', 'HKG',
    ]
      .map(byCode)
      .filter(Boolean);
  }
  return ['FRA', 'SIN', 'NYC', 'TKO', 'LON', 'SHA'].map(byCode).filter(Boolean);
}
