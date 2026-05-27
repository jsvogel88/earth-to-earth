/**
 * Recent Mission Copilot prompts (local only).
 */

const STORAGE_KEY = 'planetary-logistics-studio-copilot-history-v1';
const MAX_ENTRIES = 12;

export function listCopilotHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} prompt
 * @param {string} [response]
 */
export function pushCopilotHistory(prompt, response) {
  const text = String(prompt ?? '').trim();
  if (!text) return listCopilotHistory();
  const entries = [
    { id: `c-${Date.now()}`, prompt: text, response: response ?? null, at: new Date().toISOString() },
    ...listCopilotHistory().filter((e) => e.prompt !== text),
  ].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries }));
  return entries;
}

export function clearCopilotHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
