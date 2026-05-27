import { useCallback, useState } from 'react';
import { DEFAULT_STUDIO_TAB } from './registries/studioTabs.js';
import { DEFAULT_VIEW_MODE } from './registries/viewModeRegistry.js';
import { DEFAULT_MISSION_MODE } from './registries/missionModeRegistry.js';
import { getScenarioById } from './registries/scenarioRegistry.js';
import { listStudioVersions } from './studioVersionStore.js';
import { listCopilotHistory } from './copilotHistoryStore.js';
import { STUDIO_PLANETS } from './registries/planetRegistry.js';

const DEFAULT_SCENARIO_ID = 'current-default-network';

export function createDefaultStudioState() {
  return {
    activeTab: DEFAULT_STUDIO_TAB,
    activeScenarioId: DEFAULT_SCENARIO_ID,
    missionModeId: DEFAULT_MISSION_MODE,
    viewModeId: DEFAULT_VIEW_MODE,
    selectedPayloadId: null,
    selectedManufacturingPackageId: null,
    selectedModeId: null,
    selectedHubTypeId: null,
    activePlanetId: STUDIO_PLANETS.EARTH,
    activeSimulationPresetId: null,
    simulationModeOverride: null,
    payloadFilterActive: false,
    visionPanelCollapsed: false,
    versions: listStudioVersions(),
    compareVersionId: null,
    compareDiffKeys: [],
    compareDetailRows: [],
    compareDetailTruncated: false,
    scenarioDiff: null,
    copilotHistory: listCopilotHistory(),
    previewingVersionId: null,
    layerPreviewBackup: null,
    statusMessage: 'Map-first exploration mode',
  };
}

/**
 * @param {ReturnType<typeof createDefaultStudioState>} [initial]
 */
export function useStudioState(initial) {
  const [state, setState] = useState(() => initial ?? createDefaultStudioState());

  const setActiveTab = useCallback((activeTab) => {
    setState((s) => ({ ...s, activeTab }));
  }, []);

  const applyScenario = useCallback((scenarioId) => {
    const scenario = getScenarioById(scenarioId);
    if (!scenario) return null;
    setState((s) => ({
      ...s,
      activeScenarioId: scenarioId,
      statusMessage: `Scenario: ${scenario.label}`,
    }));
    return scenario;
  }, []);

  const patchStudio = useCallback((patch) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const refreshVersions = useCallback(() => {
    setState((s) => ({ ...s, versions: listStudioVersions() }));
  }, []);

  const refreshCopilotHistory = useCallback(() => {
    setState((s) => ({ ...s, copilotHistory: listCopilotHistory() }));
  }, []);

  return {
    studioState: state,
    setStudioState: setState,
    setActiveTab,
    applyScenario,
    patchStudio,
    refreshVersions,
    refreshCopilotHistory,
  };
}
