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
import { getHyperloopLineWidth } from '../data/hyperloopRouteClasses.js';
import { getSkeletonPathWidthBoost } from '../graph/planetarySkeletonVisibility.js';
import {
  buildNodeCoordinateIndex,
  integratedEdgesToRenderData,
  edgeHasValidVisibilityZoom,
} from './integratedEdgePaths.js';

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
  e2e: hexToRgba(MODE_REGISTRY.e2e?.color ?? '#d4af37'),
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
    if (mode === 'e2e' && f.showIntegratedE2E === false) return false;
    if (mode === 'e2m' && f.showIntegratedE2M === false) return false;
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
  onRouteClick,
  onRouteHover,
} = {}) {
  if (!paths.length) return [];
  const tier = getZoomTier(zoom);
  const spineFirst =
    viewFocus === INTEGRATED_VIEW_FOCUS.HYPERLOOP ||
    viewFocus === INTEGRATED_VIEW_FOCUS.LOOP ||
    viewFocus === INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
  const opacity = spineFirst ? (tier === ZOOM_TIERS.GLOBAL ? 245 : 255) : 185;
  const widthScale = spineFirst ? (tier === ZOOM_TIERS.GLOBAL ? 1.85 : 1.45) : 1.1;

  return [
    new PathLayer({
      id: INTEGRATED_LAYER_IDS.HYPERLOOP_SPINE,
      data: paths,
      pickable: true,
      widthMinPixels: spineFirst ? 2 : 1,
      widthMaxPixels: spineFirst ? 10 : 6,
      getPath: (d) => d.path,
      getColor: (d) => {
        const base = getRouteColor(d.routeClass, d);
        return [base[0], base[1], base[2], opacity];
      },
      getWidth: (d) =>
        getHyperloopLineWidth(d.edgeType, d.routeClass) *
        getSkeletonPathWidthBoost(d, zoom) *
        widthScale,
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
  const opacity = e2eEmphasis
    ? tier === ZOOM_TIERS.GLOBAL
      ? 220
      : 240
    : tier === ZOOM_TIERS.GLOBAL
      ? 110
      : 175;
  const maxWidth = e2eEmphasis ? 5 : tier === ZOOM_TIERS.GLOBAL ? 3 : 4;
  return [
    new ArcLayer({
      id: INTEGRATED_LAYER_IDS.E2E_ROUTES,
      data: arcs,
      pickable: true,
      greatCircle: true,
      widthMinPixels: 1,
      widthMaxPixels: maxWidth,
      getSourcePosition: (d) => d.sourcePosition,
      getTargetPosition: (d) => d.targetPosition,
      getSourceColor: () => [r, g, b, opacity],
      getTargetColor: () => [r, g, b, Math.round(opacity * 0.7)],
      getWidth: (d) => {
        const p = d.priority_score ?? 0.5;
        return (e2eEmphasis ? 2.5 : 1.5) + p * (e2eEmphasis ? 2 : 1);
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
export function createE2MLayers({ paths = [], zoom = 2, onRouteClick, onRouteHover } = {}) {
  if (!paths.length) return [];
  const [r, g, b] = COLORS.e2m;
  const tier = getZoomTier(zoom);
  const opacity = tier === ZOOM_TIERS.GLOBAL ? 160 : 210;
  return [
    new PathLayer({
      id: INTEGRATED_LAYER_IDS.E2M_ROUTES,
      data: paths,
      pickable: true,
      widthMinPixels: 1,
      widthMaxPixels: 4,
      getPath: (d) => d.path,
      getColor: () => [r, g, b, opacity],
      getWidth: (d) => 1.5 + (d.priority_score ?? 0.4) * 1.5,
      onClick: onRouteClick,
      onHover: onRouteHover,
    }),
  ];
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
  if (!paths.length) return [];
  const tier = getZoomTier(zoom);
  if (tier === ZOOM_TIERS.GLOBAL && viewFocus !== INTEGRATED_VIEW_FOCUS.LOOP) return [];

  const [r, g, b] = COLORS.loop;
  return [
    new PathLayer({
      id: INTEGRATED_LAYER_IDS.LOOP_ROUTES,
      data: paths,
      pickable: true,
      widthMinPixels: 1,
      widthMaxPixels: 3,
      getPath: (d) => d.path,
      getColor: () => [r, g, b, tier === ZOOM_TIERS.REGIONAL ? 120 : 170],
      getWidth: () => (tier === ZOOM_TIERS.LOCAL ? 2 : 1.5),
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
        const pop = d.metro_population ?? d.population ?? 0;
        return 6 + Math.min(8, Math.log10(Math.max(pop, 1)) * 2);
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

  if (tier === ZOOM_TIERS.GLOBAL || tier === ZOOM_TIERS.REGIONAL) {
    const topMinerals = [...mineralNodes]
      .sort((a, b) => (b.strategic_score ?? 0) - (a.strategic_score ?? 0))
      .slice(0, tier === ZOOM_TIERS.GLOBAL ? 12 : 24)
      .filter((n) => n.lat != null && n.lon != null);

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

  if (zoom >= 5) {
    const labelHubs = e2eHubNodes
      .filter((n) => n.lat != null && n.lon != null)
      .slice(0, tier === ZOOM_TIERS.CITY || tier === ZOOM_TIERS.LOCAL ? 40 : 18);

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
  selectedLocation = null,
  zoom = 2,
  onNodeClick,
  onRouteClick,
  onNodeHover,
  onRouteHover,
} = {}) {
  const f = mergeIntegratedFilterDefaults(activeFilters);
  const viewFocus = activeFilters.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
  const renderNodes = visibleNodes?.length ? visibleNodes : nodes;
  const renderEdgeList = edgesForRender(
    visibleEdges?.length ? visibleEdges : edges,
    zoom,
    activeFilters
  );

  const nodeIndex = buildNodeCoordinateIndex(nodes.length ? nodes : renderNodes);
  const { arcs, paths: modePaths } = integratedEdgesToRenderData(renderEdgeList, nodeIndex, {
    modes: ['e2e', 'e2m', 'loop', 'hyperloop'],
  });

  const graphHyperloopPaths = modePaths.filter((d) => d.mode === 'hyperloop');
  const spinePaths = [...(hyperloopSpinePaths ?? []), ...graphHyperloopPaths];
  const e2mPaths = modePaths.filter((d) => d.mode === 'e2m');
  const loopPaths = modePaths.filter((d) => d.mode === 'loop');

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

  if (f.showIntegratedHyperloop !== false) {
    layers.push(
      ...createHyperloopSpineLayers({
        paths: spinePaths,
        zoom,
        viewFocus,
        onRouteClick,
        onRouteHover,
      })
    );
  }

  if (f.showIntegratedE2M !== false) {
    layers.push(...createE2MLayers({ paths: e2mPaths, zoom, onRouteClick, onRouteHover }));
  }

  if (f.showIntegratedLoop !== false) {
    layers.push(
      ...createLoopLayers({ paths: loopPaths, zoom, viewFocus, onRouteClick, onRouteHover })
    );
  }

  if (f.showIntegratedE2E !== false) {
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

  return layers.filter(Boolean);
}

/**
 * @param {object[]} layers
 * @returns {string[]}
 */
export function getIntegratedLayerIds(layers) {
  return (layers ?? []).map((l) => l?.id).filter(Boolean);
}
