/**
 * Expansion pressure — regions where the network wants to grow next.
 */

import { clampScore, safeNumber } from '../economics/scoreUtils.js';

const HIGH_PRESSURE_REGIONS = [
  { region: 'South Asia', boost: 1.25, label: 'India megaregion' },
  { region: 'Middle East', boost: 1.2, label: 'Gulf corridor' },
  { region: 'Africa', boost: 1.18, label: 'African logistics' },
  { region: 'Latin America', boost: 1.12, label: 'LATAM trunk densification' },
  { region: 'Southeast Asia', boost: 1.22, label: 'Southeast Asia manufacturing belt' },
];

/**
 * @param {Map<string, object>} nodeStates
 * @param {Record<string, object>} nodesById
 * @param {object} maturity
 */
export function computeExpansionPressure(nodeStates, nodesById, maturity) {
  const regionPressure = new Map();
  const candidates = [];

  for (const { region, boost, label } of HIGH_PRESSURE_REGIONS) {
    regionPressure.set(region, { region, label, pressure: 0, nodeCount: 0 });
  }

  for (const [id, s] of nodeStates) {
    const node = nodesById[id];
    if (!node) continue;

    const region = node.region ?? 'Unknown';
    const boost = HIGH_PRESSURE_REGIONS.find((r) => r.region === region)?.boost ?? 1;
    const pressure = clampScore(s.growthPressure * boost * maturity.loopExpansion);

    s.expansionPriority = pressure;

    if (!regionPressure.has(region)) {
      regionPressure.set(region, { region, label: region, pressure: 0, nodeCount: 0 });
    }
    const rp = regionPressure.get(region);
    rp.pressure += pressure;
    rp.nodeCount += 1;

    if (pressure >= 55 && s.utilizationRate >= 50) {
      candidates.push({
        nodeId: id,
        name: node.name,
        region,
        expansionPriority: pressure,
        suggestedExpansion: inferExpansionType(node),
      });
    }
  }

  const regions = [...regionPressure.values()]
    .map((r) => ({
      ...r,
      pressure: r.nodeCount ? r.pressure / r.nodeCount : 0,
    }))
    .sort((a, b) => b.pressure - a.pressure);

  candidates.sort((a, b) => b.expansionPriority - a.expansionPriority);

  return { regions, candidates: candidates.slice(0, 24) };
}

function inferExpansionType(node) {
  const modes = node.modes ?? [];
  if (modes.includes('regional_loop')) return 'feeder_demand';
  if (modes.includes('hyperloop')) return 'spine_extension';
  if (modes.includes('e2m')) return 'cargo_corridor';
  if (modes.includes('port')) return 'intermodal_hub';
  return 'regional_loop';
}
