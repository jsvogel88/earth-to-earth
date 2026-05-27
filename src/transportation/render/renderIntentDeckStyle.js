/**
 * Map normalized renderIntent tokens → Deck.gl color/width/dash (with legacy fallback).
 */

export const RENDER_INTENT_COLOR_TOKENS = {
  e2e_blue: [212, 175, 55],
  e2m_orange: [255, 107, 53],
  hyperloop_cyan: [0, 220, 255],
  auto_teal: [0, 255, 180],
  default: [136, 136, 136],
};

/**
 * @param {object} datum — edge or arc datum (may include visual from normalizeRenderIntent)
 * @param {number} [fallbackAlpha]
 * @returns {[number, number, number, number]}
 */
export function rgbaFromRenderIntent(datum, fallbackAlpha = 255) {
  const visual = datum?.visual ?? {};
  const key = visual.colorKey ?? datum?.colorKey;
  const base = RENDER_INTENT_COLOR_TOKENS[key] ?? RENDER_INTENT_COLOR_TOKENS.default;
  const opacity = visual.opacity;
  const alpha =
    opacity != null && opacity <= 1 ? Math.round(opacity * 255) : fallbackAlpha;
  return [base[0], base[1], base[2], alpha];
}

/**
 * @param {object} datum
 * @param {number} baseWidth
 */
export function widthFromRenderIntent(datum, baseWidth = 2) {
  const t = datum?.visual?.thickness ?? datum?.thickness ?? 'medium';
  if (t === 'thick') return baseWidth * 1.35;
  if (t === 'thin') return baseWidth * 0.8;
  return baseWidth;
}

/** @param {object} datum */
export function isDashedRenderIntent(datum) {
  return Boolean(datum?.visual?.dashed ?? datum?.dashed);
}

/**
 * Prefer explicit geometryType when present; otherwise null → use legacy path.
 * @param {object} datum
 * @returns {'arc'|'ground'|null}
 */
export function geometryTypeFromRenderIntent(datum) {
  const g = datum?.geometryType;
  if (g === 'arc' || g === 'ground' || g === 'halo') return g === 'halo' ? 'ground' : g;
  if (datum?.renderAsArc === true) return 'arc';
  if (datum?.renderAsArc === false) return 'ground';
  return null;
}
