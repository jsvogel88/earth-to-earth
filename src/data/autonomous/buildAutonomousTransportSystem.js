/**
 * Main builder — Autonomous Transport Foundation (Phase 5.5).
 */

import { FEATURE_FLAGS } from './autonomousConstants.js';
import { collectAutonomousHubs } from './collectAutonomousHubs.js';
import { dedupeAutonomousHubs } from './autonomousDeduping.js';
import { generateAllAutonomousAssets } from './autonomousGenerators.js';
import { isRobotaxiEligible } from './autonomousEligibility.js';
import { validateAutonomousSystem } from './autonomousValidation.js';

/**
 * @param {{
 *   hubs?: object[],
 *   e2eHubs?: object[],
 *   trunkStations?: object[],
 *   integratedNodes?: object[],
 *   e2mNodes?: object[],
 *   starbaseHubs?: object[],
 *   corridors?: object[],
 *   roadAccessData?: object,
 *   options?: { featureFlags?: Partial<typeof FEATURE_FLAGS> },
 * }} input
 */
export function buildAutonomousTransportSystem(input = {}) {
  const flags = { ...FEATURE_FLAGS, ...(input.options?.featureFlags ?? {}) };

  if (!flags.ENABLE_AUTONOMOUS_TRANSPORT_FOUNDATION) {
    return emptySystem('foundation_disabled');
  }

  const rawHubs =
    input.hubs ??
    collectAutonomousHubs({
      e2eHubs: input.e2eHubs,
      trunkStations: input.trunkStations,
      integratedNodes: input.integratedNodes,
      e2mNodes: input.e2mNodes,
      starbaseHubs: input.starbaseHubs,
    });

  const { hubs: hubsNormalized, duplicatesMerged } = dedupeAutonomousHubs(rawHubs);
  const robotaxiEligibleHubs = hubsNormalized.filter(isRobotaxiEligible);

  const generated = generateAllAutonomousAssets(hubsNormalized, flags);
  const skippedMissingCoordinates = rawHubs.length - hubsNormalized.length;

  const system = {
    ...generated,
    warnings: [...generated.warnings],
    stats: {
      hubsInput: rawHubs.length,
      hubsNormalized: hubsNormalized.length,
      robotaxiEligibleHubs: robotaxiEligibleHubs.length,
      robotaxiServiceAreasGenerated: generated.robotaxiServiceAreas.length,
      extendedFeederRoutesGenerated: generated.extendedFeederRoutes.length,
      roboCourierCorridorsGenerated: generated.roboCourierCorridors.length,
      autonomousTruckingCorridorsGenerated: generated.autonomousTruckingCorridors.length,
      chargingNodesGenerated: generated.chargingNodes.length,
      teslaDinerNodesGenerated: generated.chargingNodes.filter((n) => n.hasTeslaDiner).length,
      megachargerNodesGenerated: generated.chargingNodes.filter((n) => n.chargerType === 'megacharger')
        .length,
      industrialExchangeHubsGenerated: generated.industrialExchangeHubs.length,
      industrialLogisticsReachGenerated: generated.industrialLogisticsReach.length,
      dronePortsScaffolded: generated.teslaDronePorts.length,
      duplicatesMerged,
      skippedMissingCoordinates,
      skippedOverWater: generated.skippedOverWater ?? 0,
    },
  };

  system.warnings.push(...validateAutonomousSystem(system));

  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    const s = system.stats;
    console.info(
      `[AUTONOMOUS] Rings: ${s.robotaxiServiceAreasGenerated} rendered | ${s.robotaxiEligibleHubs} eligible hubs | ${s.skippedOverWater} skipped (no country/ocean) | ${s.duplicatesMerged} merged`
    );
  }

  return system;
}

function emptySystem(reason) {
  return {
    robotaxiServiceAreas: [],
    extendedFeederRoutes: [],
    roboCourierCorridors: [],
    autonomousTruckingCorridors: [],
    chargingNodes: [],
    industrialExchangeHubs: [],
    industrialLogisticsReach: [],
    teslaDronePorts: [],
    teslaDroneCorridors: [],
    warnings: [reason],
    stats: { hubsInput: 0, hubsNormalized: 0, robotaxiEligibleHubs: 0 },
  };
}
