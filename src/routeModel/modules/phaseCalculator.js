import { constraintCollapse } from './networkOptimizer.js';

export function phase1LaunchSequence(selectedCities, config) {
  const { launchSequence } = constraintCollapse(selectedCities, config, 4);
  return launchSequence.map((item) => ({
    quarter: item.quarter,
    label: `${item.route.originName} → ${item.route.destName}`,
    timeSavingsHours: item.route.timeSavingsHours,
    constraint: item.route.constraint,
    revenue: item.route.revenue,
  }));
}

export function phase1Summary() {
  return {
    name: 'Phase 1 — Earth Orbital',
    years: '2026–2030',
    hubTarget: '4–20 hubs',
    revenueTarget: '$100B by 2030',
  };
}
