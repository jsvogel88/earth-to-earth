/**
 * Integrated transport graph deck.gl layers (Phase 4+).
 * Visual hierarchy: Hyperloop spine (ground) → E2M/Loop → E2E overlay (premium jump).
 */

import { ArcLayer, PathLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { MODE_REGISTRY } from '../modes/modeRegistry.js';
import { normalizeNodeId } from '../graph/integratedGraphTypes.js';
import { getZoomTier, ZOOM_TIERS } from '../modes/zoomVisibility.js';
import {
  mergeIntegratedFilterDefaults,
  INTEGRATED_VIEW_FOCUS,
} from '../ui/integratedGridFilters.js';
import { getRouteColor } from '../styles/hyperloopRouteStyles.js';
import { ECONOMIC_OVERLAY_TINTS } from '../economics/economicOverlayClassifier.js';
import { getHyperloopLineWidth } from '../data/hyperloopRouteClasses.js';
import { getSkeletonPathWidthBoost } from '../graph/planetarySkeletonVisibility.js';
import {
  buildNodeCoordinateIndex,
  integratedEdgesToRenderData,
  edgeHasValidVisibilityZoom,
} from './integratedEdgePaths.js';
import { createSimulationOverlayLayers } from '../simulation/simulationDeckLayers.js';
import adapter from '../data/canonicalTransportAdapter.js';
import { getLayerVisibility } from './layerVisibility.js';
import {
  E2E_BASE_STYLE,
  SPINE_STYLES,
  LAYER_VISUAL_WEIGHT,
  getE2EArcStyle,
  getE2EArcTilt,
  isGlobalPlanetaryE2EArc,
  classifyE2MSubFamily,
  E2M_SUBFAMILIES,
  getNodeVisualStyle,
  getCorridorRouteColor,
  shouldShowE2MLabel,
  PLANETARY_LABEL_ALLOWLIST,
} from './visualHierarchy.js';
import {
  expandE2MToArcs,
  mergeE2MArcSources,
  normalizeE2MArc,
  shouldRenderE2MAsGroundPath,
  toE2MGroundPath,
  validateE2MRenderLayers,
  validateE2MDeckLayers,
} from './e2mGeometry.js';
import {
  rgbaFromRenderIntent,
  widthFromRenderIntent,
  geometryTypeFromRenderIntent,
} from '../transportation/render/renderIntentDeckStyle.js';

function isGroundPathMode(item) {
  const mode = String(item?.mode ?? '').toLowerCase();
  // Ground-path layer is for Hyperloop/loop/feeder/corridors only.
  // Keep RE2E (re2e) and legacy E2M (e2m/cargo/logistics) as arc-only.
  return (
    mode !== 'e2m' &&
    mode !== 're2e' &&
    mode !== 'cargo' &&
    mode !== 'logistics' &&
    mode !== 'e2e_starship'
  );
}

function groundPathsOnly(paths = []) {
  return (paths ?? []).filter(isGroundPathMode);
}

export const INTEGRATED_LAYER_IDS = {
  HYPERLOOP_SPINE: 'integrated-hyperloop-spine',
  E2E_ROUTES: 'integrated-e2e-routes',
  E2M_ROUTES: 'integrated-e2m-routes',
  LOOP_ROUTES: 'integrated-loop-routes',
  E2E_HUBS: 'integrated-e2e-hubs',
  MINERAL_HUBS: 'integrated-mineral-hubs',
  E2E_LABELS: 'integrated-e2e-hub-labels',
  MINERAL_LABELS: 'integrated-mineral-hub-labels',
};

function applyEconomicTint(baseColor, datum, enabled) {
  if (!enabled || !datum?.economicCorridorType) return baseColor;
  const tint = ECONOMIC_OVERLAY_TINTS[datum.economicCorridorType];
  if (!tint) return baseColor;
  const blend = 0.22;
  return [
    Math.round(baseColor[0] * (1 - blend) + tint[0] * blend),
    Math.round(baseColor[1] * (1 - blend) + tint[1] * blend),
    Math.round(baseColor[2] * (1 - blend) + tint[2] * blend),
    baseColor[3] ?? 255,
  ];
}

function hexToRgba(hex, alpha = 255) {
  const h = String(hex ?? '#888888').replace('#', '');
  if (h.length < 6) return [136, 136, 136, alpha];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    alpha,
  ];
}

const COLORS = {
  e2e: E2E_BASE_STYLE.color,
  e2m: hexToRgba(MODE_REGISTRY.e2m?.color ?? '#ff6b35'),
  loop: hexToRgba(MODE_REGISTRY.loop?.color ?? '#00dcff'),
};

/**
 * @param {object[]} visibleEdges
 * @param {number} zoom
 * @param {object} activeFilters
 */
function edgesForRender(visibleEdges, zoom, activeFilters) {
  const f = mergeIntegratedFilterDefaults(activeFilters);
  return (visibleEdges ?? []).filter((edge) => {
    const mode = edge?.mode;
    if (mode === 'auto') return false;
    if (mode === 'hyperloop' && f.showIntegratedHyperloop === false) return false;
    if ((mode === 'e2e' || mode === 'e2e_starship') && f.showIntegratedE2E === false) return false;
    if ((mode === 'e2m' || mode === 're2e') && f.showIntegratedE2M === false) return false;
    if (mode === 'loop' && f.showIntegratedLoop === false) return false;
    return edgeHasValidVisibilityZoom(edge, zoom);
  });
}

/**
 * @param {object} params
 * @returns {import('@deck.gl/core').Layer[]}
 */
export function createHyperloopSpineLayers({
  paths = [],
  zoom = 2,
  viewFocus = INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID,
  economicOverlay = false,
  onRouteClick,
  onRouteHover,
} = {}) {
  const spinePaths = groundPathsOnly(paths);
  if (!spinePaths.length) return [];
  const tier = getZoomTier(zoom);
  const spineFirst =
    viewFocus === INTEGRATED_VIEW_FOCUS.HYPERLOOP ||
    viewFocus === INTEGRATED_VIEW_FOCUS.LOOP ||
    viewFocus === INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
  const hyperWeight = LAYER_VISUAL_WEIGHT.HYPERLOOP;
  const opacity = spineFirst
    ? Math.round(hyperWeight.baseOpacity * 255)
    : Math.round(hyperWeight.baseOpacity * 0.75 * 255);
  const widthScale = spineFirst ? 1.5 : 1.05;

  return [
    new PathLayer({
      id: INTEGRATED_LAYER_IDS.HYPERLOOP_SPINE,
      data: spinePaths,
      pickable: true,
      widthMinPixels: spineFirst ? 2.5 : 1,
      widthMaxPixels: spineFirst ? 12 : 6,
      getPath: (d) => d.path,
      getColor: (d) => {
        const intentGeo = geometryTypeFromRenderIntent(d);
        const base =
          intentGeo === 'ground' && d?.visual?.colorKey
            ? rgbaFromRenderIntent(d, opacity)
            : getCorridorRouteColor(d, opacity);
        return applyEconomicTint(base, d, economicOverlay);
      },
      getWidth: (d) => {
        const isGlobal =
          d.routeType === 'global_spine' || d.routeClass === 'PLANETARY_TRUNK';
        const baseW = isGlobal
          ? SPINE_STYLES.global_spine.width
          : SPINE_STYLES.continental_spine.width;
        return (
          baseW *
          getSkeletonPathWidthBoost(d, zoom) *
          widthScale *
          (1 + (d.civilizationImportance ?? 0) / 250) *
          (d.spinalTrunkClass === 'primary_civilization_trunk' ? 1.12 : 1)
        );
      },
      onClick: onRouteClick,
      onHover: onRouteHover,
    }),
  ];
}

/**
 * @param {object} params
 * @returns {import('@deck.gl/core').Layer[]}
 */
export function createE2ELayers({
  arcs = [],
  zoom = 2,
  viewFocus = INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID,
  onRouteClick,
  onRouteHover,
} = {}) {
  if (!arcs.length) return [];
  const [r, g, b] = COLORS.e2e;
  const tier = getZoomTier(zoom);
  const e2eEmphasis = viewFocus === INTEGRATED_VIEW_FOCUS.E2E;
  const filteredArcs =
    tier === ZOOM_TIERS.GLOBAL && !e2eEmphasis
      ? arcs.filter((d) => isGlobalPlanetaryE2EArc(d))
      : arcs;

  if (!filteredArcs.length) return [];

  return [
    new ArcLayer({
      id: INTEGRATED_LAYER_IDS.E2E_ROUTES,
      data: filteredArcs,
      pickable: true,
      greatCircle: true,
      widthMinPixels: 1,
      widthMaxPixels: e2eEmphasis ? 4 : 3,
      getSourcePosition: (d) => d.sourcePosition,
      getTargetPosition: (d) => d.targetPosition,
      getSourceColor: (d) => {
        if (d?.visual?.colorKey || d?.geometryType === 'arc') {
          const { opacity } = getE2EArcStyle(d);
          const alpha = Math.round((e2eEmphasis ? opacity * 1.15 : opacity) * 255);
          return rgbaFromRenderIntent(d, alpha);
        }
        const { opacity } = getE2EArcStyle(d);
        const alpha = Math.round((e2eEmphasis ? opacity * 1.15 : opacity) * 255);
        return [r, g, b, alpha];
      },
      getTargetColor: (d) => {
        if (d?.visual?.colorKey || d?.geometryType === 'arc') {
          const { opacity } = getE2EArcStyle(d);
          const alpha = Math.round((e2eEmphasis ? opacity : opacity * 0.65) * 255);
          return rgbaFromRenderIntent(d, Math.round(alpha * 0.85));
        }
        const { opacity } = getE2EArcStyle(d);
        const alpha = Math.round((e2eEmphasis ? opacity : opacity * 0.65) * 255);
        return [r, g, b, alpha];
      },
      getWidth: (d) => {
        const { width } = getE2EArcStyle(d);
        const w = d?.visual?.colorKey ? widthFromRenderIntent(d, width) : width;
        return e2eEmphasis ? w * 1.35 : w;
      },
      getTilt: (d) => getE2EArcTilt(d),
      onClick: onRouteClick,
      onHover: onRouteHover,
    }),
  ];
}

/**
 * @param {object} params
 * @returns {import('@deck.gl/core').Layer[]}
 */
export function createE2MLayers({
  arcs = [],
  localGroundPaths = [],
  zoom = 2,
  onRouteClick,
  onRouteHover,
} = {}) {
  const tier = getZoomTier(zoom);
  const opacity = tier === ZOOM_TIERS.GLOBAL ? 160 : 210;
  const arcData = [];
  const pathData = [];

  for (const d of arcs) {
    if (shouldRenderE2MAsGroundPath(d)) {
      const ground = toE2MGroundPath(d);
      if (ground) pathData.push(ground);
      continue;
    }
    arcData.push(...expandE2MToArcs(d));
  }

  for (const d of localGroundPaths) {
    const ground = toE2MGroundPath(d);
    if (ground) pathData.push(ground);
  }

  validateE2MRenderLayers(arcData, pathData);

  const layers = [];

  if (arcData.length > 0) {
    layers.push(
      new ArcLayer({
        id: INTEGRATED_LAYER_IDS.E2M_ROUTES,
        data: arcData,
        pickable: true,
        greatCircle: true,
        widthMinPixels: 1,
        widthMaxPixels: 4,
        getSourcePosition: (d) => d.sourcePosition,
        getTargetPosition: (d) => d.targetPosition,
        getSourceColor: (d) => {
          if (d?.visual?.colorKey || d?.geometryType === 'arc') {
            return rgbaFromRenderIntent(d, opacity);
          }
          const sub =
            E2M_SUBFAMILIES[d.e2mSubFamily ?? classifyE2MSubFamily(d)] ??
            E2M_SUBFAMILIES.CARGO_EXPORT;
          return [...sub.color, opacity];
        },
        getTargetColor: (d) => {
          if (d?.visual?.colorKey || d?.geometryType === 'arc') {
            return rgbaFromRenderIntent(d, Math.round(opacity * 0.7));
          }
          const sub =
            E2M_SUBFAMILIES[d.e2mSubFamily ?? classifyE2MSubFamily(d)] ??
            E2M_SUBFAMILIES.CARGO_EXPORT;
          return [...sub.color, Math.round(opacity * 0.7)];
        },
        getWidth: (d) => {
          if (d?.visual?.thickness) {
            const sub =
              E2M_SUBFAMILIES[d.e2mSubFamily ?? classifyE2MSubFamily(d)] ??
              E2M_SUBFAMILIES.CARGO_EXPORT;
            return widthFromRenderIntent(d, sub.width);
          }
          const sub =
            E2M_SUBFAMILIES[d.e2mSubFamily ?? classifyE2MSubFamily(d)] ??
            E2M_SUBFAMILIES.CARGO_EXPORT;
          return sub.width;
        },
        onClick: onRouteClick,
        onHover: onRouteHover,
      })
    );
  }

  if (pathData.length > 0) {
    layers.push(
      new PathLayer({
        id: `${INTEGRATED_LAYER_IDS.E2M_ROUTES}-local-ground`,
        data: pathData,
        pickable: true,
        widthMinPixels: 1,
        widthMaxPixels: 3,
        getPath: (d) => d.path,
        getColor: (d) => {
          const sub =
            E2M_SUBFAMILIES[d.e2mSubFamily ?? classifyE2MSubFamily(d)] ??
            E2M_SUBFAMILIES.CARGO_EXPORT;
          return [...sub.color, Math.round(opacity * 0.85)];
        },
        getWidth: (d) => {
          const sub =
            E2M_SUBFAMILIES[d.e2mSubFamily ?? classifyE2MSubFamily(d)] ??
            E2M_SUBFAMILIES.CARGO_EXPORT;
          return sub.width * 0.85;
        },
        onClick: onRouteClick,
        onHover: onRouteHover,
      })
    );
  }

  return layers;
}

/**
 * @param {object} params
 * @returns {import('@deck.gl/core').Layer[]}
 */
export function createLoopLayers({
  paths = [],
  zoom = 2,
  viewFocus = INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID,
  onRouteClick,
  onRouteHover,
} = {}) {
  const loopPaths = groundPathsOnly(paths);
  if (!loopPaths.length) return [];
  const tier = getZoomTier(zoom);
  const loopFocus = viewFocus === INTEGRATED_VIEW_FOCUS.LOOP;
  if (tier === ZOOM_TIERS.GLOBAL && !loopFocus) return [];

  return [
    new PathLayer({
      id: INTEGRATED_LAYER_IDS.LOOP_ROUTES,
      data: loopPaths,
      pickable: true,
      widthMinPixels: loopFocus ? 2 : 1,
      widthMaxPixels: loopFocus ? 6 : 4,
      getPath: (d) => d.path,
      getColor: (d) => {
        const feeder =
          d.routeType === 'branch' ||
          d.routeType === 'feeder' ||
          d.routeType === 'feeder_route';
        const alpha = loopFocus
          ? feeder
            ? 170
            : 220
          : feeder
            ? tier === ZOOM_TIERS.REGIONAL
              ? 100
              : 140
            : tier === ZOOM_TIERS.REGIONAL
              ? 120
              : 190;
        return getCorridorRouteColor(d, alpha);
      },
      getWidth: (d) => {
        const scale = d.widthScale ?? 1;
        const base = loopFocus ? 2.5 : tier === ZOOM_TIERS.LOCAL ? 2 : 1.5;
        return scale * base;
      },
      onClick: onRouteClick,
      onHover: onRouteHover,
    }),
  ];
}

/**
 * @param {object} params
 * @returns {import('@deck.gl/core').Layer[]}
 */
export function createMineralHubLayers({
  mineralNodes = [],
  onNodeClick,
  onNodeHover,
} = {}) {
  if (!mineralNodes.length) return [];
  const [r, g, b] = COLORS.e2m;
  return [
    new ScatterplotLayer({
      id: INTEGRATED_LAYER_IDS.MINERAL_HUBS,
      data: mineralNodes,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusMinPixels: 4,
      radiusMaxPixels: 14,
      lineWidthMinPixels: 1,
      getPosition: (d) => [d.lon ?? d.longitude, d.lat ?? d.latitude],
      getFillColor: () => [r, g, b, 220],
      getLineColor: () => [255, 200, 140, 240],
      getRadius: (d) => 6 + (d.strategic_score ?? 0.5) * 4,
      onClick: onNodeClick,
      onHover: onNodeHover,
    }),
  ];
}

/**
 * @param {object} params
 * @returns {import('@deck.gl/core').Layer[]}
 */
export function createIntegratedNodeLayers({
  e2eHubNodes = [],
  selectedLocation = null,
  onNodeClick,
  onNodeHover,
} = {}) {
  if (!e2eHubNodes.length) return [];
  const [r, g, b] = COLORS.e2e;
  const selectedId = selectedLocation ? normalizeNodeId(selectedLocation) : null;

  return [
    new ScatterplotLayer({
      id: INTEGRATED_LAYER_IDS.E2E_HUBS,
      data: e2eHubNodes,
      pickable: true,
      opacity: 0.92,
      stroked: true,
      radiusMinPixels: 5,
      radiusMaxPixels: 14,
      getPosition: (d) => [d.lon ?? d.longitude, d.lat ?? d.latitude],
      getFillColor: (d) => {
        const id = normalizeNodeId(d);
        if (selectedId && id === selectedId) return [255, 255, 200, 255];
        return [r, g, b, 230];
      },
      getLineColor: () => [255, 255, 255, 200],
      getRadius: (d) => {
        const style = getNodeVisualStyle(d);
        return style.r ?? 6;
      },
      onClick: onNodeClick,
      onHover: onNodeHover,
    }),
  ];
}

/**
 * @param {object} params
 * @returns {import('@deck.gl/core').Layer[]}
 */
export function createIntegratedLabelLayers({ e2eHubNodes = [], mineralNodes = [], zoom = 2 } = {}) {
  const layers = [];
  const tier = getZoomTier(zoom);

  if (zoom >= 3 && (tier === ZOOM_TIERS.GLOBAL || tier === ZOOM_TIERS.REGIONAL)) {
    const topMinerals = [...mineralNodes]
      .sort((a, b) => (b.strategic_score ?? 0) - (a.strategic_score ?? 0))
      .slice(0, tier === ZOOM_TIERS.GLOBAL ? 8 : 24)
      .filter((n) => n.lat != null && n.lon != null && shouldShowE2MLabel(n, zoom));

    if (topMinerals.length) {
      layers.push(
        new TextLayer({
          id: INTEGRATED_LAYER_IDS.MINERAL_LABELS,
          data: topMinerals,
          pickable: false,
          getPosition: (d) => [d.lon, d.lat],
          getText: (d) => `E2M: ${d.name}`,
          getSize: 11,
          getColor: () => [255, 180, 120, 230],
          getPixelOffset: [0, -14],
        })
      );
    }
  }

  if (zoom >= 2) {
    const labelHubs = e2eHubNodes
      .filter((n) => {
        if (n.lat == null && n.latitude == null) return false;
        const id = String(n.id ?? n.networkCityId ?? '').replace(/^node:city:/, '').replace(/^net:/, '');
        if (zoom < 3 && !PLANETARY_LABEL_ALLOWLIST.has(id.split(':')[0])) return false;
        return true;
      })
      .slice(0, zoom < 3 ? 20 : tier === ZOOM_TIERS.CITY || tier === ZOOM_TIERS.LOCAL ? 40 : 18);

    if (labelHubs.length) {
      layers.push(
        new TextLayer({
          id: INTEGRATED_LAYER_IDS.E2E_LABELS,
          data: labelHubs,
          pickable: false,
          getPosition: (d) => [d.lon, d.lat],
          getText: (d) => (tier >= ZOOM_TIERS.CITY ? d.name : `E2E: ${d.name}`),
          getSize: 11,
          getColor: () => [220, 200, 140, 240],
          getPixelOffset: [0, -16],
        })
      );
    }
  }

  return layers;
}

/**
 * @param {object} params
 * @returns {import('@deck.gl/core').Layer[]}
 */
export function createIntegratedGraphLayers({
  nodes = [],
  edges = [],
  visibleNodes = [],
  visibleEdges = [],
  activeFilters = {},
  hyperloopSpinePaths = [],
  canonicalLoopPaths = null,
  canonicalSpinePaths = null,
  canonicalGridArcs = null,
  canonicalE2mArcs = null,
  canonicalE2mPaths = null,
  simulationState = null,
  selectedLocation = null,
  zoom = 2,
  onNodeClick,
  onRouteClick,
  onNodeHover,
  onRouteHover,
} = {}) {
  const f = mergeIntegratedFilterDefaults(activeFilters);
  const viewFocus = activeFilters.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
  const layerVis = getLayerVisibility(viewFocus);
  const renderNodes = visibleNodes?.length ? visibleNodes : nodes;
  const renderEdgeList = edgesForRender(
    visibleEdges?.length ? visibleEdges : edges,
    zoom,
    activeFilters
  );

  const nodeIndex = buildNodeCoordinateIndex(nodes.length ? nodes : renderNodes);
  const { arcs: edgeArcs, paths: modePaths, e2mArcs: edgeE2mArcs } =
    integratedEdgesToRenderData(renderEdgeList, nodeIndex, {
    modes: ['e2e', 'e2m', 'loop', 'hyperloop'],
  });

  let arcs = canonicalGridArcs != null ? canonicalGridArcs : edgeArcs;
  if (viewFocus === INTEGRATED_VIEW_FOCUS.LOOP && canonicalGridArcs == null) {
    arcs = [];
  }

  const graphHyperloopPaths = groundPathsOnly(modePaths.filter((d) => d.mode === 'hyperloop'));
  const useCanonicalSpine = canonicalSpinePaths != null;
  const spinePaths = groundPathsOnly(
    useCanonicalSpine
      ? canonicalSpinePaths
      : [...(hyperloopSpinePaths ?? []), ...graphHyperloopPaths]
  );

  const legacyE2mArcs = edgeE2mArcs.map((d) => normalizeE2MArc(d));
  const pipelineE2mArcs = (canonicalE2mArcs ?? [])
    .filter(Boolean)
    .flatMap((d) => expandE2MToArcs(d));
  const fallbackE2mArcs = (canonicalE2mPaths ?? [])
    .filter(Boolean)
    .flatMap((d) => expandE2MToArcs(d));
  const e2mArcs =
    pipelineE2mArcs.length > 0 || legacyE2mArcs.length > 0
      ? mergeE2MArcSources(pipelineE2mArcs, legacyE2mArcs)
      : fallbackE2mArcs;
  const loopPaths = groundPathsOnly(
    canonicalLoopPaths != null && canonicalLoopPaths.length > 0
      ? canonicalLoopPaths
      : modePaths.filter((d) => d.mode === 'loop')
  );

  const mineralNodes = renderNodes
    .filter((n) => n.mineral_hub_id)
    .map((n) => ({
      ...n,
      lat: n.latitude ?? n.lat,
      lon: n.longitude ?? n.lon,
      isMineralHub: true,
    }))
    .filter((n) => n.lat != null && n.lon != null);

  const e2eHubNodes = renderNodes
    .filter((n) => !n.mineral_hub_id && (n.e2e_eligible || n.isE2EHub))
    .map((n) => ({
      ...n,
      lat: n.latitude ?? n.lat,
      lon: n.longitude ?? n.lon,
    }))
    .filter((n) => n.lat != null && n.lon != null);

  const layers = [];

  if (f.showIntegratedHyperloop !== false && layerVis.showSpines) {
    layers.push(
      ...createHyperloopSpineLayers({
        paths: spinePaths,
        zoom,
        viewFocus,
        economicOverlay: f.showGdpWeighting === true,
        onRouteClick,
        onRouteHover,
      })
    );
  }

  if (f.showIntegratedE2M !== false && layerVis.showE2MArcs) {
    layers.push(...createE2MLayers({ arcs: e2mArcs, zoom, onRouteClick, onRouteHover }));
  }

  if (f.showIntegratedLoop !== false && layerVis.showLoops) {
    layers.push(
      ...createLoopLayers({ paths: loopPaths, zoom, viewFocus, onRouteClick, onRouteHover })
    );
  }

  if (f.showIntegratedE2E !== false && layerVis.showE2EArcs) {
    layers.push(
      ...createE2ELayers({ arcs, zoom, viewFocus, onRouteClick, onRouteHover })
    );
  }

  if (f.showIntegratedMineralHubs !== false) {
    layers.push(
      ...createMineralHubLayers({
        mineralNodes,
        onNodeClick,
        onNodeHover,
      })
    );
  }

  if (f.showIntegratedE2E !== false) {
    layers.push(
      ...createIntegratedNodeLayers({
        e2eHubNodes,
        selectedLocation,
        onNodeClick,
        onNodeHover,
      })
    );
  }

  layers.push(
    ...createIntegratedLabelLayers({
      e2eHubNodes,
      mineralNodes,
      zoom,
    })
  );

  if (f.showTrafficFlow === true && simulationState) {
    const overlayPaths = [...spinePaths, ...loopPaths];
    layers.push(
      ...createSimulationOverlayLayers({
        simulation: simulationState,
        pathData: overlayPaths,
        nodesById: adapter.nodesById ?? {},
        enabled: true,
      })
    );
  }

  validateE2MDeckLayers(layers);

  return layers.filter(Boolean);
}

/**
 * @param {object[]} layers
 * @returns {string[]}
 */
export function getIntegratedLayerIds(layers) {
  return (layers ?? []).map((l) => l?.id).filter(Boolean);
}
