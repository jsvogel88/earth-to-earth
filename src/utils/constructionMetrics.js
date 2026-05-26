import { CONSTRUCTION_TYPES, CONSTRUCTION_DIFFICULTY } from '../data/constructionTypes.js';

export function computeConstructionMetrics(edges = []) {
  const renderable = (edges || []).filter((e) => e.renderable !== false);
  const countType = (type) =>
    renderable.filter((e) => e.constructionType === type).length;
  const sumMiles = (predicate) =>
    Math.round(
      renderable.filter(predicate).reduce((s, e) => s + (e.distanceMiles || 0), 0)
    );

  const tunnelEdges = renderable.filter((e) => e.tunnelRequired);
  const specialEdges = renderable.filter(
    (e) =>
      e.tunnelRequired ||
      (e.constructionType && e.constructionType !== CONSTRUCTION_TYPES.SURFACE)
  );

  return {
    surfaceLines: countType(CONSTRUCTION_TYPES.SURFACE),
    elevatedLines: countType(CONSTRUCTION_TYPES.ELEVATED),
    tunnelRequiredLines: tunnelEdges.length,
    mountainTunnelLines: countType(CONSTRUCTION_TYPES.MOUNTAIN_TUNNEL),
    underseaTunnelLines: countType(CONSTRUCTION_TYPES.UNDERSEA_TUNNEL),
    urbanTunnelLines: countType(CONSTRUCTION_TYPES.URBAN_TUNNEL),
    arcticEngineeringLines: countType(CONSTRUCTION_TYPES.ARCTIC_ENGINEERING),
    desertCorridorLines: countType(CONSTRUCTION_TYPES.DESERT_CORRIDOR),
    specialCorridorLines: countType(CONSTRUCTION_TYPES.SPECIAL_CORRIDOR),
    extremeDifficultyMiles: sumMiles(
      (e) => e.constructionDifficulty === CONSTRUCTION_DIFFICULTY.EXTREME
    ),
    totalTunnelMiles: sumMiles((e) => e.tunnelRequired),
    specialConstructionSegments: specialEdges.length,
    specialConstructionMiles: sumMiles(
      (e) =>
        e.tunnelRequired ||
        (e.constructionType && e.constructionType !== CONSTRUCTION_TYPES.SURFACE)
    ),
  };
}
