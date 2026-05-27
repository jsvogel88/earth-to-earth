/**
 * Export current mission configuration as portable JSON.
 */

const PACKAGE_TYPE = 'planetary-logistics-studio-mission-package';
const PACKAGE_VERSION = 1;

/**
 * @param {{
 *   studioState: object,
 *   layerState: object,
 *   simulationYear?: number,
 *   routeStats?: object,
 * }} params
 */
export function buildMissionPackageExport({
  studioState = {},
  layerState = {},
  simulationYear,
  routeStats = null,
}) {
  return {
    type: PACKAGE_TYPE,
    packageVersion: PACKAGE_VERSION,
    exportedAt: new Date().toISOString(),
    scenarioId: studioState.activeScenarioId,
    missionModeId: studioState.missionModeId,
    viewModeId: studioState.viewModeId,
    activePlanetId: studioState.activePlanetId,
    selectedPayloadId: studioState.selectedPayloadId,
    selectedManufacturingPackageId: studioState.selectedManufacturingPackageId,
    selectedModeId: studioState.selectedModeId,
    selectedHubTypeId: studioState.selectedHubTypeId,
    simulationYear,
    simulationModeOverride: studioState.simulationModeOverride,
    payloadFilterActive: studioState.payloadFilterActive,
    layerState,
    routeStats,
  };
}

/**
 * @param {ReturnType<typeof buildMissionPackageExport>} pkg
 */
export function downloadMissionPackage(pkg, filename = 'planetary-logistics-mission.json') {
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
