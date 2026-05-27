/**
 * Civilization-scale economic intelligence — precomputed scores for nodes, routes, corridors.
 */

import adapter from '../data/canonicalTransportAdapter.js';
import countryEconomics from '../data/transport/country_economics.json';
import { clampScore, logPopulationScore, safeNumber } from './scoreUtils.js';
import { scoreRouteImportance } from './routeImportanceEngine.js';
import { classifyEconomicCorridorType } from './economicOverlayClassifier.js';

const INTERMODAL_MODES = new Set([
  'e2e_starship',
  'hyperloop',
  'regional_loop',
  'e2m',
  'robotaxi',
  'port',
  'rail',
  'cargo',
]);

let _cache = null;

function tagHas(tags, ...keys) {
  const set = new Set((tags ?? []).map((t) => String(t).toLowerCase()));
  return keys.some((k) => set.has(k.toLowerCase()));
}

/**
 * @param {object} node
 * @param {number} connectivityDegree
 */
function scoreNodeIntelligence(node, connectivityDegree = 0) {
  const econ = node.economics ?? {};
  const tags = node.tags ?? [];
  const modes = node.modes ?? [];

  const gdpWeight = clampScore(econ.gdp_score ?? 0);
  const populationWeight = logPopulationScore(node.population);
  const logisticsWeight = clampScore(
    tagHas(tags, 'port', 'logistics', 'logistics_center') || node.nodeType === 'logistics_center'
      ? 85
      : modes.includes('port')
        ? 70
        : 25
  );
  const airportWeight = clampScore(tagHas(tags, 'aviation', 'airport') ? 80 : 20);
  const portWeight = clampScore(modes.includes('port') || tagHas(tags, 'port') ? 85 : 15);
  const industrialWeight = clampScore(
    tagHas(tags, 'manufacturing', 'industrial') ? 80 : 25
  );
  const aiTechWeight = clampScore(tagHas(tags, 'tech', 'ai') ? 88 : 15);
  const financeWeight = clampScore(tagHas(tags, 'finance', 'banking') ? 90 : 20);
  const energyWeight = clampScore(
    tagHas(tags, 'energy', 'oil', 'gas') || modes.includes('e2m') ? 75 : 15
  );
  const manufacturingWeight = industrialWeight;
  const geopoliticalWeight = clampScore(
    (node.isE2EHub ? 35 : 0) + (node.tier === 1 ? 40 : node.tier === 2 ? 22 : 8)
  );

  const modeDiversity = modes.filter((m) => INTERMODAL_MODES.has(m)).length;
  const intermodalScore = clampScore(
    (modeDiversity / 6) * 70 + (tagHas(tags, 'transfer_hub') ? 30 : 0)
  );
  const transferImportance = clampScore(
    tagHas(tags, 'transfer_hub', 'global_hub') ? 90 : intermodalScore * 0.6
  );

  const connectivityWeight = clampScore(Math.min(100, connectivityDegree * 5));

  const economicWeight = clampScore(
    gdpWeight * 0.28 +
      populationWeight * 0.18 +
      safeNumber(econ.trade_score) * 0.15 +
      safeNumber(econ.economic_weight) * 0.12 +
      logisticsWeight * 0.1 +
      financeWeight * 0.08 +
      transferImportance * 0.09
  );

  const strategicWeight = clampScore(
    geopoliticalWeight * 0.35 + transferImportance * 0.3 + (node.tier === 1 ? 35 : 15)
  );

  const resourceWeight = clampScore(
    energyWeight * 0.4 + manufacturingWeight * 0.3 + (modes.includes('e2m') ? 30 : 0)
  );

  const civilizationIndex = clampScore(
    economicWeight * 0.38 +
      connectivityWeight * 0.22 +
      intermodalScore * 0.18 +
      transferImportance * 0.12 +
      strategicWeight * 0.1
  );

  const strategicTier = node.tier ?? (civilizationIndex >= 75 ? 1 : civilizationIndex >= 50 ? 2 : 3);

  return {
    economicWeight,
    gdpWeight,
    populationWeight,
    logisticsWeight,
    airportWeight,
    portWeight,
    industrialWeight,
    aiTechWeight,
    financeWeight,
    energyWeight,
    manufacturingWeight,
    geopoliticalWeight,
    transferImportance,
    strategicTier,
    strategicWeight,
    throughputWeight: clampScore((populationWeight + gdpWeight) / 2),
    connectivityWeight,
    resourceWeight,
    civilizationWeight: civilizationIndex,
    civilizationIndex,
    intermodalScore,
    economicCorridorType: classifyEconomicCorridorType(node),
  };
}

function buildConnectivityCounts(edges) {
  const counts = new Map();
  for (const e of edges) {
    counts.set(e.fromNodeId, (counts.get(e.fromNodeId) ?? 0) + 1);
    counts.set(e.toNodeId, (counts.get(e.toNodeId) ?? 0) + 1);
  }
  return counts;
}

/**
 * Precompute full economic intelligence graph (once per session).
 */
export function buildEconomicIntelligence() {
  const nodes = adapter.nodes ?? [];
  const edges = adapter.getAllEdges?.() ?? adapter.edges ?? [];
  const nodesById = adapter.nodesById ?? Object.fromEntries(nodes.map((n) => [n.id, n]));
  const connectivity = buildConnectivityCounts(edges);

  const nodeScores = new Map();
  for (const node of nodes) {
    nodeScores.set(node.id, scoreNodeIntelligence(node, connectivity.get(node.id) ?? 0));
  }

  const edgeScores = new Map();
  for (const edge of edges) {
    const from = nodesById[edge.fromNodeId];
    const to = nodesById[edge.toNodeId];
    if (!from || !to) continue;
    edgeScores.set(
      edge.id,
      scoreRouteImportance(
        edge,
        from,
        to,
        nodeScores.get(edge.fromNodeId),
        nodeScores.get(edge.toNodeId),
        {
          connectivityFrom: connectivity.get(edge.fromNodeId) ?? 0,
          connectivityTo: connectivity.get(edge.toNodeId) ?? 0,
        }
      )
    );
  }

  return {
    nodeScores,
    edgeScores,
    nodesById,
    countryEconomicsCount: countryEconomics.length,
    stats: {
      nodeCount: nodeScores.size,
      edgeCount: edgeScores.size,
    },
  };
}

/** Cached singleton — avoids per-render recomputation. */
export function getEconomicIntelligence() {
  if (!_cache) _cache = buildEconomicIntelligence();
  return _cache;
}

export function resetEconomicIntelligenceCache() {
  _cache = null;
}

/**
 * @param {object} intelligence
 * @param {number} [limit]
 */
export function getEconomicDebugRankings(intelligence = getEconomicIntelligence(), limit = 8) {
  const nodes = [...intelligence.nodeScores.entries()]
    .map(([id, s]) => ({ id, name: intelligence.nodesById[id]?.name, ...s }))
    .sort((a, b) => b.civilizationIndex - a.civilizationIndex)
    .slice(0, limit);

  const routes = [...intelligence.edgeScores.entries()]
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => b.civilizationImportance - a.civilizationImportance)
    .slice(0, limit);

  const passenger = [...intelligence.edgeScores.values()]
    .sort((a, b) => b.passengerImportance - a.passengerImportance)
    .slice(0, limit);

  const cargo = [...intelligence.edgeScores.values()]
    .sort((a, b) => b.cargoImportance - a.cargoImportance)
    .slice(0, limit);

  const intermodal = [...intelligence.nodeScores.entries()]
    .map(([id, s]) => ({ id, name: intelligence.nodesById[id]?.name, ...s }))
    .sort((a, b) => b.intermodalScore - a.intermodalScore)
    .slice(0, limit);

  return { topNodes: nodes, topRoutes: routes, topPassenger: passenger, topCargo: cargo, topIntermodal: intermodal };
}
