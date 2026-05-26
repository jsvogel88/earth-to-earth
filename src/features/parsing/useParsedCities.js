import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  loadParsedCities,
  loadImportSessions,
  addParsedCities,
  removeParsedCity,
  removeAllParsedCities,
  saveParsedCities,
  saveImportSessions,
  exportParsedCitiesJson,
  importParsedCitiesJson,
  PARSED_CITY_STORAGE_KEY,
} from './parsedCitiesStorage.js';

export function useParsedCities() {
  const [parsedCities, setParsedCities] = useState(() => loadParsedCities());
  const [previewCities, setPreviewCities] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importSessions, setImportSessions] = useState(() => loadImportSessions());
  const [lastParseResult, setLastParseResult] = useState(null);
  const [showOnlyParsedCities, setShowOnlyParsedCities] = useState(false);
  const [autoFitParsedBounds, setAutoFitParsedBounds] = useState(true);

  const refresh = useCallback(() => {
    setParsedCities(loadParsedCities());
    setImportSessions(loadImportSessions());
  }, []);

  const addAll = useCallback(
    (cities) => {
      const { list, added } = addParsedCities(parsedCities, cities);
      setParsedCities(list);
      setPreviewCities([]);
      if (added.length) {
        const session = {
          id: `session-${Date.now()}`,
          createdAt: new Date().toISOString(),
          lineCount: added.length,
          addedCount: added.length,
        };
        const sessions = [session, ...importSessions].slice(0, 50);
        setImportSessions(sessions);
        saveImportSessions(sessions);
      }
      return added;
    },
    [parsedCities, importSessions]
  );

  const remove = useCallback(
    (id) => {
      const list = removeParsedCity(parsedCities, id);
      setParsedCities(list);
    },
    [parsedCities]
  );

  const removeAll = useCallback(() => {
    setParsedCities(removeAllParsedCities());
    setPreviewCities([]);
  }, []);

  const bulkRemove = useCallback(
    (ids) => {
      const idSet = new Set(ids);
      const list = parsedCities.filter((c) => !idSet.has(c.id));
      setParsedCities(list);
      saveParsedCities(list);
    },
    [parsedCities]
  );

  const exportJson = useCallback(() => {
    return exportParsedCitiesJson(parsedCities, importSessions);
  }, [parsedCities, importSessions]);

  const importJson = useCallback(
    (text) => {
      const { cities, sessions } = importParsedCitiesJson(text);
      setParsedCities(cities);
      if (sessions?.length) setImportSessions(sessions);
      return cities;
    },
    []
  );

  const mapPoints = useMemo(
    () => [...parsedCities, ...previewCities.filter((p) => p.isPreview)],
    [parsedCities, previewCities]
  );

  const parsedWorldCityIds = useMemo(
    () => new Set(parsedCities.map((c) => c.worldCityId).filter(Boolean)),
    [parsedCities]
  );

  const parsedOverlayIds = useMemo(
    () => new Set(mapPoints.map((c) => c.id).filter(Boolean)),
    [mapPoints]
  );

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === PARSED_CITY_STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  useEffect(() => {
    if (showOnlyParsedCities && mapPoints.length === 0) {
      setShowOnlyParsedCities(false);
    }
  }, [showOnlyParsedCities, mapPoints.length]);

  return {
    parsedCities,
    previewCities,
    setPreviewCities,
    parseErrors,
    setParseErrors,
    importSessions,
    lastParseResult,
    setLastParseResult,
    addAll,
    remove,
    removeAll,
    bulkRemove,
    exportJson,
    importJson,
    refresh,
    mapPoints,
    parsedWorldCityIds,
    parsedOverlayIds,
    activeCount: parsedCities.length,
    previewCount: previewCities.length,
    showOnlyParsedCities,
    setShowOnlyParsedCities,
    autoFitParsedBounds,
    setAutoFitParsedBounds,
    hasMapPoints: mapPoints.length > 0,
  };
}
