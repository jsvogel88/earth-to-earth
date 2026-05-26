/**
 * Node classification layer — metadata only.
 * References canonical city IDs from worldCities.js. No routes, edges, or graph logic.
 */

import { networkCityId, getNetworkCityById, CURATED_NETWORK_CITIES } from './worldCities.js';
import { classifyInfrastructureRole } from './classifyWorldCityInfrastructure.js';
import { FUTURE_HIGH_POPULATION_SEEDS } from './futureHighPopulationCities.js';
import { GLOBAL_COVERAGE_SEEDS, STRATEGIC_NODE_TYPES } from './globalCoverageRegions.js';

export const NODE_CATEGORIES = {
  ACTIVE_E2E_HUB: 'ACTIVE_E2E_HUB',
  FUTURE_HIGH_POP_HUB: 'FUTURE_HIGH_POP_HUB',
  RARE_EARTH_HUB: 'RARE_EARTH_HUB',
  REMOTE_CARGO_NODE: 'REMOTE_CARGO_NODE',
  SWITCH_NODE: 'SWITCH_NODE',
  GATEWAY_NODE: 'GATEWAY_NODE',
  ARCTIC_LOGISTICS_NODE: 'ARCTIC_LOGISTICS_NODE',
  OUTBACK_RESOURCE_NODE: 'OUTBACK_RESOURCE_NODE',
  RAINFOREST_ACCESS_NODE: 'RAINFOREST_ACCESS_NODE',
  ISLAND_ACCESS_NODE: 'ISLAND_ACCESS_NODE',
  FEEDER_NODE: 'FEEDER_NODE',
};

const STRATEGIC_TYPE_TO_CATEGORY = {
  [STRATEGIC_NODE_TYPES.RARE_EARTH_HUB_CANDIDATE]: NODE_CATEGORIES.RARE_EARTH_HUB,
  [STRATEGIC_NODE_TYPES.REMOTE_CARGO_NODE]: NODE_CATEGORIES.REMOTE_CARGO_NODE,
  [STRATEGIC_NODE_TYPES.ARCTIC_LOGISTICS_NODE]: NODE_CATEGORIES.ARCTIC_LOGISTICS_NODE,
  [STRATEGIC_NODE_TYPES.DESERT_LOGISTICS_NODE]: NODE_CATEGORIES.REMOTE_CARGO_NODE,
  [STRATEGIC_NODE_TYPES.RAINFOREST_ACCESS_NODE]: NODE_CATEGORIES.RAINFOREST_ACCESS_NODE,
  [STRATEGIC_NODE_TYPES.OUTBACK_RESOURCE_NODE]: NODE_CATEGORIES.OUTBACK_RESOURCE_NODE,
  [STRATEGIC_NODE_TYPES.ISLAND_ACCESS_NODE]: NODE_CATEGORIES.ISLAND_ACCESS_NODE,
  [STRATEGIC_NODE_TYPES.REMOTE_STRATEGIC_NODE]: NODE_CATEGORIES.RARE_EARTH_HUB,
};

/** cityId → primary NODE_CATEGORIES value */
const _classifications = new Map();

CURATED_NETWORK_CITIES.forEach((city) => {
  _classifications.set(city.id, NODE_CATEGORIES.ACTIVE_E2E_HUB);
});

FUTURE_HIGH_POPULATION_SEEDS.forEach((seed) => {
  const id = networkCityId(seed.name, seed.country || '');
  if (!_classifications.has(id)) {
    _classifications.set(id, NODE_CATEGORIES.FUTURE_HIGH_POP_HUB);
  }
});

GLOBAL_COVERAGE_SEEDS.forEach((seed) => {
  const id = networkCityId(seed.name, seed.country || '');
  const category =
    STRATEGIC_TYPE_TO_CATEGORY[seed.nodeType] || NODE_CATEGORIES.RARE_EARTH_HUB;
  if (!_classifications.has(id)) {
    _classifications.set(id, category);
  }
});

export function getNodeCategory(cityId) {
  return _classifications.get(cityId) ?? null;
}

export function classifyCityId(cityId) {
  return getNodeCategory(cityId);
}

export function isActiveE2EHubCity(cityId) {
  return getNodeCategory(cityId) === NODE_CATEGORIES.ACTIVE_E2E_HUB;
}

/** Apply classification flags onto a graph node (does not create routes). */
export function applyClassificationToNode(node) {
  if (!node) return node;
  const cityId = node.networkCityId || node.id;
  const category = getNodeCategory(cityId);
  if (!category) return node;

  const flags = {
    nodeCategory: category,
    isActiveE2EHub: category === NODE_CATEGORIES.ACTIVE_E2E_HUB,
    potentialFutureE2EHub: category === NODE_CATEGORIES.FUTURE_HIGH_POP_HUB,
    potentialRareEarthHub:
      category === NODE_CATEGORIES.RARE_EARTH_HUB ||
      category === NODE_CATEGORIES.REMOTE_CARGO_NODE,
    isSwitchNode: node.isSwitchNode || category === NODE_CATEGORIES.SWITCH_NODE,
  };

  if (category === NODE_CATEGORIES.GATEWAY_NODE) {
    flags.isGatewayNode = true;
  }

  const infrastructureRole = classifyInfrastructureRole({
    name: node.name,
    country: node.country,
    population: node.population,
    networkCityId: cityId,
    isE2EHub: flags.isActiveE2EHub,
    nodeType: node.nodeType,
  });

  return { ...node, ...flags, infrastructureRole };
}

export function listCityIdsByCategory(category) {
  return [..._classifications.entries()]
    .filter(([, cat]) => cat === category)
    .map(([id]) => id);
}

export function resolveNetworkCityForNode(node) {
  const cityId = node?.networkCityId || node?.id;
  return getNetworkCityById(cityId);
}
