export const LAYOUT_MODES = {
  FULL: 'full',
  /** Compact desktop UI — fills viewport; for split-screen / narrow browser windows */
  HALF: 'half',
  MOBILE: 'mobile',
};

export const LAYOUT_MODE_LIST = [
  { id: LAYOUT_MODES.FULL, label: 'Full' },
  { id: LAYOUT_MODES.HALF, label: 'Half' /* compact-desktop */ },
  { id: LAYOUT_MODES.MOBILE, label: 'Mobile' },
];

export const LAYOUT_STORAGE_KEY = 'transport-map-layout-mode';

export function readStoredLayoutMode() {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (Object.values(LAYOUT_MODES).includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return LAYOUT_MODES.FULL;
}
