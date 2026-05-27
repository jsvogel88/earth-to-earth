/**
 * Local scenario version snapshots (layerState + studio metadata).
 */

const STORAGE_KEY = 'planetary-logistics-studio-versions-v1';
const MAX_VERSIONS = 24;

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { versions: [] };
    return JSON.parse(raw);
  } catch {
    return { versions: [] };
  }
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * @param {{ layerState: object, studioState: object, label?: string }} snapshot
 */
export function saveStudioVersion(snapshot) {
  const store = readStore();
  const id = `v-${Date.now()}`;
  const entry = {
    id,
    label:
      snapshot.label ??
      `Snapshot ${new Date().toLocaleString()} — ${snapshot.studioState?.activeScenarioId ?? 'scenario'}`,
    savedAt: new Date().toISOString(),
    layerState: snapshot.layerState,
    studioState: { ...(snapshot.studioState ?? {}) },
    simulationYear: snapshot.simulationYear ?? null,
  };
  const versions = [entry, ...store.versions].slice(0, MAX_VERSIONS);
  writeStore({ versions });
  return entry;
}

export function listStudioVersions() {
  return readStore().versions;
}

export function getStudioVersion(id) {
  return listStudioVersions().find((v) => v.id === id) ?? null;
}

/**
 * @param {object} currentLayerState
 * @param {string} versionId
 */
export function diffLayerStateAgainstVersion(currentLayerState, versionId) {
  const version = getStudioVersion(versionId);
  if (!version?.layerState) return { changedKeys: [], version: null };
  const changedKeys = [];
  const keys = new Set([
    ...Object.keys(currentLayerState ?? {}),
    ...Object.keys(version.layerState ?? {}),
  ]);
  for (const key of keys) {
    if (currentLayerState?.[key] !== version.layerState?.[key]) {
      changedKeys.push(key);
    }
  }
  return { changedKeys: changedKeys.sort(), version };
}

export function exportStudioVersionsJson() {
  return JSON.stringify(readStore(), null, 2);
}
