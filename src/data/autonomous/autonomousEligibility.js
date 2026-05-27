/**
 * Autonomous eligibility engine — pure functions, no React.
 */

import { DEFAULTS } from './autonomousConstants.js';
import { distanceMiles as geoDistanceMiles } from './autonomousGeometry.js';

const ROBOTAXI_TIERS = new Set(['global', 'mega']);

/**
 * @param {object} node
 * @returns {string[]}
 */
export function getHubTypes(node) {
  const types = new Set();
  if (Array.isArray(node?.hubTypes)) node.hubTypes.forEach((t) => types.add(String(t)));
  if (node?.hubType) types.add(String(node.hubType));
  if (node?.type) types.add(String(node.type));
  if (node?.nodeType) types.add(String(node.nodeType));
  if (Array.isArray(node?.nodeTypes)) node.nodeTypes.forEach((t) => types.add(String(t)));
  if (node?.tags?.includes('hyperloop_hub')) types.add('hyperloop_hub');
  if (node?.tags?.includes('starbase')) types.add('starbase_hub');
  if (node?.hyperloop_connected) types.add('hyperloop_hub');
  if (node?.isStarbaseHub || node?.overlayKind === 'starbase') types.add('starbase_hub');
  if (node?.isSwitchNode || node?.isIntermodalGateway) types.add('hyperloop_hub');
  return [...types];
}

export function getHubModes(node) {
  const modes = new Set();
  if (Array.isArray(node?.modes)) node.modes.forEach((m) => modes.add(String(m)));
  if (node?.mode) modes.add(String(node.mode));
  if (Array.isArray(node?.transportModes)) node.transportModes.forEach((m) => modes.add(String(m)));
  if (node?.hubRoles?.includes('HYPERLOOP')) modes.add('hyperloop');
  if (node?.hubRoles?.includes('E2E')) modes.add('e2e_starship');
  return [...modes];
}

export function getHubTier(node) {
  if (node?.tier != null) return node.tier;
  if (node?.populationRank != null) return node.populationRank;
  return node?.classification ?? null;
}

export function getHubTags(node) {
  const tags = new Set(node?.tags ?? []);
  if (node?.isE2EHub) tags.add('e2e_hub');
  if (node?.isMajorCity) tags.add('major_city');
  if (node?.infrastructureRole) tags.add(String(node.infrastructureRole));
  return [...tags];
}

/**
 * Strict whitelist — explicit hubTypes + global/mega tier only (temporary dataset guard).
 * @param {object} node
 * @returns {string[]}
 */
export function getRobotaxiEligibilityReasons(node) {
  const reasons = [];
  const explicitTypes = (node?.hubTypes ?? []).map((t) => String(t));

  if (explicitTypes.includes('hyperloop_hub')) reasons.push('hyperloop_hub');
  if (explicitTypes.includes('starbase_hub')) reasons.push('starbase_hub');

  const tier = String(getHubTier(node) ?? '').toLowerCase();
  if (ROBOTAXI_TIERS.has(tier)) reasons.push(`tier_${tier}`);

  return reasons;
}

export function isRobotaxiEligible(node) {
  return getRobotaxiEligibilityReasons(node).length > 0;
}

export function isIndustrialHub(node) {
  const types = getHubTypes(node);
  const tags = getHubTags(node);
  const name = String(node?.name ?? '').toLowerCase();
  const industrialTypes = [
    'gigafactory',
    'terafab',
    'petabond',
    'port',
    'mineral',
    'resource',
    'industrial',
    'warehouse',
    'starbase',
  ];
  if (types.some((t) => industrialTypes.some((k) => t.includes(k)))) return true;
  if (tags.some((t) => industrialTypes.some((k) => t.includes(k)))) return true;
  if (node?.e2m_enabled || node?.mineral_hub_id) return true;
  if (name.includes('giga') || name.includes('starbase') || name.includes('port')) return true;
  return false;
}

export function isDronePortEligible(node) {
  if (!isRobotaxiEligible(node) && !isIndustrialHub(node)) return false;
  const explicitTypes = (node?.hubTypes ?? []).map((t) => String(t));
  return (
    explicitTypes.includes('hyperloop_hub') ||
    explicitTypes.includes('starbase_hub') ||
    isIndustrialHub(node)
  );
}

export function hasRoadAccess(node) {
  if (node?.roadAccess === false) return false;
  if (node?.roadAccessStatus === 'unavailable') return false;
  if (node?.planet && node.planet !== 'EARTH' && node.planet !== 'Earth') return false;
  return true;
}

function distanceBetweenHubs(a, b) {
  const lat1 = a?.lat ?? a?.latitude;
  const lng1 = a?.lng ?? a?.longitude ?? a?.lon;
  const lat2 = b?.lat ?? b?.latitude;
  const lng2 = b?.lng ?? b?.longitude ?? b?.lon;
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return Infinity;
  return geoDistanceMiles(lat1, lng1, lat2, lng2);
}

/**
 * @param {object} origin
 * @param {object} destination
 */
export function isExtendedFeederEligible(origin, destination) {
  if (!hasRoadAccess(origin) || !hasRoadAccess(destination)) return false;
  const dist = distanceBetweenHubs(origin, destination);
  return dist > 0 && dist <= DEFAULTS.EXTENDED_FEEDER_MAX_MILES;
}

export function isRoboCourierEligible(origin, destination) {
  if (!hasRoadAccess(origin) || !hasRoadAccess(destination)) return false;
  const dist = distanceBetweenHubs(origin, destination);
  return dist > 5 && dist <= DEFAULTS.EXTENDED_FEEDER_MAX_MILES;
}

export function isAutonomousTruckingEligible(origin, destination) {
  if (!isIndustrialHub(origin) && !isIndustrialHub(destination)) return false;
  if (!hasRoadAccess(origin) || !hasRoadAccess(destination)) return false;
  const dist = distanceBetweenHubs(origin, destination);
  return dist > 20 && dist <= 1200;
}
