import { useCallback, useEffect, useState } from 'react';
import {
  loadScenarios,
  upsertScenario,
  deleteScenario,
  duplicateScenario,
  createScenarioRecord,
  SCENARIO_SAVE_TYPES,
} from '../utils/scenarioStorage.js';

/**
 * @param {object} [options]
 * @param {(scenarios: object[]) => void} [options.onScenariosChange]
 */
export function useMapScenarios(options = {}) {
  const [scenarios, setScenarios] = useState(() => loadScenarios());

  const refresh = useCallback(() => {
    const next = loadScenarios();
    setScenarios(next);
    options.onScenariosChange?.(next);
    return next;
  }, [options.onScenariosChange]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'transport-map-map-scenarios-v1') refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const saveScenario = useCallback(
    (payload) => {
      const record = upsertScenario(createScenarioRecord(payload));
      refresh();
      return record;
    },
    [refresh]
  );

  const saveMapScenario = useCallback(
    ({ name, transportMode, layerState, customDestinations, parsedDestinationSets, simulationYear, viewport }) =>
      saveScenario({
        name: name || 'Map scenario',
        type: SCENARIO_SAVE_TYPES.SCENARIO,
        transportMode,
        layerState,
        customDestinations,
        parsedDestinationSets,
        simulationYear,
        viewport,
      }),
    [saveScenario]
  );

  const removeScenario = useCallback(
    (id) => {
      deleteScenario(id);
      refresh();
    },
    [refresh]
  );

  const duplicate = useCallback(
    (id) => {
      const copy = duplicateScenario(id);
      refresh();
      return copy;
    },
    [refresh]
  );

  return {
    scenarios,
    saveScenario,
    saveMapScenario,
    removeScenario,
    duplicateScenario: duplicate,
    refresh,
    SCENARIO_SAVE_TYPES,
  };
}
