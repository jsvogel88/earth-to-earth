/**
 * Dynamic E2E hub registry — curated default + user selection from worldCities.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  CURATED_NETWORK_CITIES,
  getNetworkCityById,
  toMapHubRecord,
  loadWorldCitiesEnrichedWithCoordinates,
  networkCityId,
} from '../data/worldCities.js';
import {
  E2E_ACTIVE_HUBS_STORAGE_KEY,
  E2E_HUB_PRESETS_STORAGE_KEY,
  E2E_HUB_PRESET_BUILTINS,
} from '../data/transportOperatingSystem.js';

function loadActiveHubIds() {
  try {
    const raw = localStorage.getItem(E2E_ACTIVE_HUBS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function loadPresets() {
  try {
    const raw = localStorage.getItem(E2E_HUB_PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveActiveHubIds(ids) {
  try {
    localStorage.setItem(E2E_ACTIVE_HUBS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function savePresets(presets) {
  try {
    localStorage.setItem(E2E_HUB_PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    /* ignore */
  }
}

const DEFAULT_IDS = CURATED_NETWORK_CITIES.map((c) => c.id);

export function useE2EHubRegistry() {
  const [activeHubIds, setActiveHubIds] = useState(() => loadActiveHubIds() ?? DEFAULT_IDS);
  const [customPresets, setCustomPresets] = useState(() => loadPresets());
  const [hubFilter, setHubFilter] = useState({
    search: '',
    minPopulation: 500_000,
    minGdp: 0,
    minGdpPerCapita: 0,
    region: '',
    rareEarthOnly: false,
    strategicOnly: false,
  });

  const activeHubs = useMemo(() => {
    const records = [];
    activeHubIds.forEach((id, index) => {
      const curated = getNetworkCityById(id);
      if (curated) {
        records.push(toMapHubRecord(curated, index));
        return;
      }
      const enriched = loadWorldCitiesEnrichedWithCoordinates({ minPopulation: 0 }).find(
        (c) => networkCityId(c.name, c.country) === id
      );
      if (enriched?.hasCoordinates) {
        records.push({
          id: index,
          networkCityId: id,
          name: enriched.name,
          country: enriched.country,
          lat: enriched.latitude,
          lon: enriched.longitude,
          population: enriched.population,
          continent: enriched.continent,
          region: enriched.continent,
          gdp: enriched.gdp,
          gdpPerCapitaUsd: enriched.gdpPerCapitaUsd,
        });
      }
    });
    return records;
  }, [activeHubIds]);

  const candidateCities = useMemo(() => {
    const q = hubFilter.search.trim().toLowerCase();
    return loadWorldCitiesEnrichedWithCoordinates({ minPopulation: hubFilter.minPopulation })
      .filter((c) => {
        if (!c.hasCoordinates) return false;
        if ((c.population ?? 0) < hubFilter.minPopulation) return false;
        if ((c.gdp ?? 0) < hubFilter.minGdp) return false;
        if ((c.gdpPerCapitaUsd ?? 0) < hubFilter.minGdpPerCapita) return false;
        if (hubFilter.region && c.continent !== hubFilter.region) return false;
        if (q && !c.name.toLowerCase().includes(q) && !c.country?.toLowerCase().includes(q)) {
          return false;
        }
        return true;
      })
      .map((c) => ({ ...c, registryId: networkCityId(c.name, c.country) }))
      .slice(0, 80);
  }, [hubFilter]);

  const addHub = useCallback((networkCityIdValue) => {
    setActiveHubIds((prev) => {
      if (prev.includes(networkCityIdValue)) return prev;
      const next = [...prev, networkCityIdValue];
      saveActiveHubIds(next);
      return next;
    });
  }, []);

  const removeHub = useCallback((networkCityIdValue) => {
    setActiveHubIds((prev) => {
      const next = prev.filter((id) => id !== networkCityIdValue);
      saveActiveHubIds(next.length ? next : DEFAULT_IDS);
      return next.length ? next : DEFAULT_IDS;
    });
  }, []);

  const resetToCurated = useCallback(() => {
    setActiveHubIds(DEFAULT_IDS);
    saveActiveHubIds(DEFAULT_IDS);
  }, []);

  const savePreset = useCallback(
    (name) => {
      const preset = {
        id: `custom-${Date.now()}`,
        name: name || `Preset ${customPresets.length + 1}`,
        hubIds: [...activeHubIds],
      };
      const next = [...customPresets, preset];
      setCustomPresets(next);
      savePresets(next);
    },
    [activeHubIds, customPresets]
  );

  const applyPreset = useCallback(
    (presetId) => {
      if (presetId === 'global-premium') {
        resetToCurated();
        return;
      }
      const builtin = E2E_HUB_PRESET_BUILTINS.find((p) => p.id === presetId);
      if (builtin?.hubIds) {
        setActiveHubIds(builtin.hubIds);
        saveActiveHubIds(builtin.hubIds);
        return;
      }
      const custom = customPresets.find((p) => p.id === presetId);
      if (custom?.hubIds?.length) {
        setActiveHubIds(custom.hubIds);
        saveActiveHubIds(custom.hubIds);
      }
    },
    [customPresets, resetToCurated]
  );

  const allPresets = useMemo(
    () => [...E2E_HUB_PRESET_BUILTINS, ...customPresets],
    [customPresets]
  );

  return {
    activeHubIds,
    activeHubs,
    hubFilter,
    setHubFilter,
    candidateCities,
    addHub,
    removeHub,
    resetToCurated,
    savePreset,
    applyPreset,
    allPresets,
    isHubActive: (id) => activeHubIds.includes(id),
  };
}
