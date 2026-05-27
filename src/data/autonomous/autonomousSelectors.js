/**
 * Layer-ready selectors — UI consumes these only.
 */

import { AUTONOMOUS_MODES } from './autonomousModeRegistry.js';
import { filterLandChargingNodes } from './autonomousLandFilter.js';

export function selectRobotaxiServiceAreas(system) {
  return system?.robotaxiServiceAreas ?? [];
}

export function selectExtendedFeederRoutes(system) {
  return system?.extendedFeederRoutes ?? [];
}

export function selectRoboCourierCorridors(system) {
  return system?.roboCourierCorridors ?? [];
}

export function selectAutonomousTruckingCorridors(system) {
  return system?.autonomousTruckingCorridors ?? [];
}

export function selectChargingNodes(system, chargerType = null) {
  const nodes = filterLandChargingNodes(system?.chargingNodes ?? []);
  if (!chargerType) return nodes;
  return nodes.filter((n) => n.chargerType === chargerType || n.chargerType?.includes(chargerType));
}

export function selectTeslaDinerNodes(system) {
  return filterLandChargingNodes(
    (system?.chargingNodes ?? []).filter((n) => n.hasTeslaDiner)
  );
}

export function selectIndustrialExchangeHubs(system) {
  return system?.industrialExchangeHubs ?? [];
}

export function selectIndustrialLogisticsReach(system) {
  return system?.industrialLogisticsReach ?? [];
}

function toIndustrialReachFeature(reach, ring) {
  const geometry = ring === 'extended' ? reach.extendedGeometry : reach.defaultGeometry;
  const feature = geometry?.type === 'Feature' ? geometry : null;
  if (!feature) return null;
  feature.properties = {
    ...(feature.properties ?? {}),
    id: `${reach.id}:${ring}`,
    sourceHubName: reach.sourceHubName,
    radiusMiles:
      ring === 'extended' ? reach.extendedOnDemandRadiusMiles : reach.defaultRadiusMiles,
    ring,
    layer: ring === 'extended' ? 'Industrial reach (extended)' : 'Industrial reach (default)',
  };
  return feature;
}

export function selectIndustrialReachFeatures(system) {
  const features = [];
  for (const reach of selectIndustrialLogisticsReach(system)) {
    const inner = toIndustrialReachFeature(reach, 'default');
    const outer = toIndustrialReachFeature(reach, 'extended');
    if (inner) features.push(inner);
    if (outer) features.push(outer);
  }
  return features;
}

export function selectTeslaDronePorts(system) {
  return system?.teslaDronePorts ?? [];
}

/**
 * @param {object} system
 * @param {object} [options]
 */
export function selectAutonomousLayers(system, options = {}) {
  return {
    robotaxiFeatures: selectRobotaxiServiceAreas(system).map(toRobotaxiFeature),
    roboCourierPaths: selectRoboCourierCorridors(system),
    truckingPaths: selectAutonomousTruckingCorridors(system),
    superchargerPoints: selectTeslaDinerNodes(system),
    megachargerPoints: selectChargingNodes(system, 'megacharger'),
    industrialHubPoints: selectIndustrialExchangeHubs(system),
    industrialReachFeatures: [],
    extendedFeeders: selectExtendedFeederRoutes(system),
    stats: system?.stats ?? null,
  };
}

function toRobotaxiFeature(area) {
  const feature = area.geometry;
  if (feature?.type === 'Feature') {
    feature.properties = {
      ...(feature.properties ?? {}),
      id: area.id,
      sourceHubName: area.sourceHubName,
      radiusMiles: area.radiusMiles,
      eligibilityReasons: area.eligibilityReasons,
      layer: 'Autonomous Robotaxi',
    };
    return feature;
  }
  return {
    type: 'Feature',
    geometry: feature,
    properties: {
      id: area.id,
      sourceHubName: area.sourceHubName,
      radiusMiles: area.radiusMiles,
      eligibilityReasons: area.eligibilityReasons,
    },
  };
}

export function getAutonomousLayerStats(system) {
  return system?.stats ?? {};
}

export function getAutonomousLegendItems() {
  return [
    {
      id: 'robotaxi_coverage',
      label: 'Autonomous Robotaxi Coverage',
      description:
        '100-mile FSD service radius around Hyperloop hubs, Starbases, and major logistics cities.',
      color: '#64b4ff',
    },
    {
      id: 'tesla_diner',
      label: 'Supercharger + Tesla Diner',
      description:
        'Energy, food, rest, fleet staging, and delivery handoff nodes every 100 miles.',
      color: '#64dcff',
    },
    {
      id: 'megacharger',
      label: 'Megacharger Network',
      description: 'High-capacity charging for heavy autonomous freight corridors.',
      color: '#ffb43c',
    },
    {
      id: 'industrial_exchange',
      label: 'Industrial Exchange Hubs',
      description: 'Load-transfer and supply-chain exchange nodes.',
      color: '#c8ff78',
    },
    {
      id: 'industrial_reach',
      label: 'Industrial Logistics Reach',
      description: '1,000 mi default and 3,000 mi extended supply-chain envelopes.',
      color: '#ffd264',
    },
  ];
}

/**
 * @param {object} item
 */
export function getAutonomousTooltipData(item) {
  const props = item?.properties ?? item ?? {};
  return {
    hub: props.sourceHubName ?? item?.sourceHubName ?? item?.name ?? 'Hub',
    radius: props.radiusMiles ?? item?.radiusMiles,
    layer: props.layer ?? 'Autonomous Transport',
    eligibility: (props.eligibilityReasons ?? item?.eligibilityReasons ?? []).join(', '),
  };
}

export function getAutonomousModeRegistry() {
  return AUTONOMOUS_MODES;
}
