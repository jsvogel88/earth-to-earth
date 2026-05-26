/** Construction classification for Hyperloop edges (through routes, gateways, remote cargo). */

export const CONSTRUCTION_TYPES = {
  SURFACE: 'SURFACE',
  ELEVATED: 'ELEVATED',
  TUNNEL: 'TUNNEL',
  UNDERSEA_TUNNEL: 'UNDERSEA_TUNNEL',
  MOUNTAIN_TUNNEL: 'MOUNTAIN_TUNNEL',
  URBAN_TUNNEL: 'URBAN_TUNNEL',
  DESERT_CORRIDOR: 'DESERT_CORRIDOR',
  ARCTIC_ENGINEERING: 'ARCTIC_ENGINEERING',
  SPECIAL_CORRIDOR: 'SPECIAL_CORRIDOR',
};

export const TUNNEL_TYPES = {
  UNDERSEA: 'UNDERSEA',
  MOUNTAIN: 'MOUNTAIN',
  URBAN: 'URBAN',
  ARCTIC: 'ARCTIC',
  MIXED: 'MIXED',
};

export const CONSTRUCTION_DIFFICULTY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  EXTREME: 'EXTREME',
};

export const DEFAULT_CONSTRUCTION = {
  constructionType: CONSTRUCTION_TYPES.SURFACE,
  tunnelRequired: false,
  tunnelType: null,
  constructionDifficulty: CONSTRUCTION_DIFFICULTY.LOW,
  constructionNotes: null,
};

export function formatConstructionLabel(constructionType) {
  if (!constructionType) return 'Surface';
  return constructionType
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatDifficultyLabel(difficulty) {
  if (!difficulty) return 'Low';
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
}
