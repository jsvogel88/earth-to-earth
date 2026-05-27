/**
 * Autosave / restore last studio session (layer + studio metadata).
 */

const STORAGE_KEY = 'planetary-logistics-studio-session-v1';

/**
 * @param {{ layerState: object, studioState: object, simulationYear?: number }} session
 */
export function saveStudioSession(session) {
  const payload = {
    savedAt: new Date().toISOString(),
    simulationYear: session.simulationYear,
    layerState: session.layerState,
    studioState: session.studioState,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function loadStudioSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearStudioSession() {
  localStorage.removeItem(STORAGE_KEY);
}
