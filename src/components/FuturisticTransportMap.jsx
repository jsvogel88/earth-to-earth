import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import {
  GeoJsonLayer,
  ArcLayer,
  PathLayer,
  ScatterplotLayer,
  TextLayer,
} from '@deck.gl/layers';
import { regionalFeederCitiesByHub } from '../data/regionalFeederCities.js';
import {
  REGIONAL_HYPERLOOP_MAX_MILES,
  STARSHIP_PASSENGER_MIN_MILES,
  ANALYSIS_VIEW_MODES,
  haversineDistanceMiles,
} from '../data/globalHyperloopGraph.js';
import {
  DEFAULT_MAP_DISPLAY_MODE,
  PLANNING_DEMO_MIN_ZOOM,
} from '../data/mapLayerDefaults.js';
import {
  normalizeTransportMode,
  isHyperloopCoreMode,
  isE2EStarshipMode,
  isE2MOrbitalMode,
  isCivilizationGridMode,
  isRobotaxiMode,
} from '../data/transportOperatingSystem.js';
import { buildRobotaxiServiceZones } from '../data/robotaxiLayer.js';
import {
  listEarthStarbaseHubs,
  shouldRenderStarbaseAtZoom,
  getPetabondExportHubs,
  countOffWorldStarbaseHubs,
  STARBASE_CLASSES,
  STARBASE_STATUS,
} from '../data/starbaseHubs.js';
import { generateStarbaseConnectivity } from '../graph/starbaseConnectivity.js';
import { STARBASE_HUB_COLORS, STARBASE_CONNECTOR_COLORS } from '../transportation/starbase/starbaseVisualTokens.js';
import {
  applyStarbaseVisionPreview,
  isStarbaseVisionPreviewActive,
} from '../layers/starbaseLayerPresets.js';
import {
  filterRobotaxiHubDots,
  filterRobotaxiZoneFeatures,
  filterRobotaxiPickupDropoff,
  ROBOTAXI_COLORS,
  isHubMobilityOverlayActive,
} from '../layers/robotaxiVisibility.js';
import {
  buildGlobalConnectivityPaths,
  filterPlanningPathsByZoom,
  buildIntermodalHubHalos,
  buildE2EHubHalos,
} from '../layers/planningOverlayLayers.js';
import { isPlanetarySkeletonPath, getSkeletonPathWidthBoost } from '../graph/planetarySkeletonVisibility.js';
import { useMapScenarios } from '../hooks/useMapScenarios.js';
import ScenarioControls from './pmos/ScenarioControls.jsx';
import { buildDefaultLayerState } from '../layers/layerRegistry.js';
import { useE2EHubRegistry } from '../hooks/useE2EHubRegistry.js';
import { useCustomDestinations } from '../hooks/useCustomDestinations.js';
import { useParsedCities } from '../features/parsing/useParsedCities.js';
import { buildParsedCitiesDeckLayers } from '../layers/parsedCitiesLayer.js';
import {
  buildParsedIsolationVisibleLayers,
  computeParsedCitiesBounds,
  filterConnectionPreviewsForParsed,
} from '../features/parsing/parsedCityIsolation.js';
import { filterCustomDestinationsForView } from '../layers/customDestinationVisibility.js';
import {
  buildCustomConnectionPreviews,
  PREVIEW_LINE_STYLE,
} from '../layers/customConnectionPreview.js';
import {
  getRoleColor,
  CUSTOM_DESTINATION_MAP_STYLE,
} from '../data/userCustomDestinations.js';
import {
  buildE2MOrbitalNodes,
  buildE2MOrbitalPaths,
  E2M_NODE_TYPES,
} from '../data/e2mOrbitalNodes.js';
import { isPriorityRemoteCorridorVisible } from '../graph/corridorPriorityScore.js';
import TransportControlPanel from './TransportControlPanel.jsx';
import NetworkControlCenter from './NetworkControlCenter.jsx';
import AddDestinationPanel from './AddDestinationPanel.jsx';
import PlanetaryMobilityShell from './pmos/PlanetaryMobilityShell.jsx';
import SelectedLocationPanel from './pmos/SelectedLocationPanel.jsx';
import { DEFAULT_SIMULATION_YEAR, getSimulationMilestones, getSimulationGrowthFactor } from '../ui/simulationTimeline.js';
import '../styles/transport-control-panel.css';
import {
  buildPlanetaryHyperloopGraph,
  buildE2EOriginView,
  auditVisibleHyperloopGraph,
  isHyperloopNodeVisible,
  isHyperloopEdgeVisible,
  isHyperloopPathVisible,
  isCoreHyperloopWebPath,
} from '../graph/index.js';
import { useIntegratedTransportGraph } from '../hooks/useIntegratedTransportGraph.js';
import { withCanonicalHyperloopPaths } from '../data/canonicalHyperloopPathBridge.js';
import {
  getNetworkStats,
  getValidationReport,
  getGridViewData,
  getLoopViewData,
  getSpinePaths,
  canonicalPathsToDeckPaths,
  debugLogViewStatsOnce,
  validateLoopPathsOnce,
} from '../data/canonicalTransportAdapter.js';
import { INTERCONTINENTAL_BRIDGE_ROUTES } from '../data/corridorRouteRegistry.js';
import { buildRouteDisplayPipeline } from '../graph/buildRouteDisplayPipeline.js';
import { integratedViewToPipelineMode } from '../graph/integratedViewToPipelineMode.js';
import { pipelineBucketsToCanonicalDeck } from '../graph/pipelineDeckBridge.js';
import { getEconomicDebugRankings } from '../economics/economicScoringEngine.js';
import { getSimulationState, getSimulationDebugRankings } from '../simulation/simulationEngine.js';
import {
  SIMULATION_MODES,
  defaultSimulationModeForView,
} from '../simulation/simulationModes.js';
import { filterIntegratedGraph as filterIntegratedGraphForRender } from '../graph/integratedGridFilters.js';
import {
  createIntegratedGraphLayers,
  INTEGRATED_LAYER_IDS,
} from '../map/deckLayerFactory.js';
import { normalizeE2MArc } from '../map/e2mGeometry.js';
import {
  resolveSelectedLocation,
  getConnectedEdgesForLocation,
  getConnectedNodesFromEdges,
} from '../ui/resolveSelectedLocation.js';
import {
  getViewFocusLayerPatch,
  isIntegratedGridPipelineActive,
  isNodeVisibleInIntegratedFilters,
  INTEGRATED_VIEW_FOCUS,
} from '../ui/integratedGridFilters.js';
import { DEFAULT_MINERAL_HUBS } from '../data/mineralHubs.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import { LAYOUT_MODES } from '../layout/layoutModes.js';
import {
  EXTENDED_RURAL_LAYER_LABEL,
  REMOTE_VISIBLE_MIN_ZOOM,
  REMOTE_CARGO_VISIBLE_MIN_ZOOM,
} from '../data/extendedRuralNetwork.js';
import {
  buildFutureHighPopulationCities,
  getFutureHighPopulationMetrics,
  buildRareEarthHubCandidates,
  getRareEarthHubMetrics,
  PLANNING_LAYER_LABELS,
  RARE_EARTH_VISIBLE_MIN_ZOOM,
  REMOTE_CARGO_ROUTE_MIN_ZOOM,
  shouldRenderFutureHighPopulationHub,
  shouldRenderRareEarthHub,
  getRemoteCargoRouteColor,
  getRareEarthScatterFillColor,
  hasCoordinates as planningHasCoordinates,
  FUTURE_HUB_FILL,
  FUTURE_HUB_LINE,
} from '../data/globalHyperloopGraph.js';
import {
  getHyperloopLineWidth,
  getRemoteNodeColor,
} from '../data/hyperloopRouteClasses.js';
import {
  getRouteColor,
  getRouteWidth,
  getRouteDashPattern,
  PATH_DASH_RENDERING_ACTIVE,
} from '../styles/hyperloopRouteStyles.js';
import { buildRouteTooltipHtml } from '../utils/routeTooltip.js';
import {
  buildWorldCitiesPlanningGrid,
  getInfrastructureRoleColor,
} from '../data/classifyWorldCityInfrastructure.js';
import { REMOTE_CORRIDOR_CHAINS } from '../data/remoteCargoRoutes.js';

const HYPERLOOP_WEB_HELPER =
  'Hyperloop Web shows shared tube infrastructure. Pods route independently, pass through intermediate nodes, and split off only when needed. Intercontinental Hyperloop routes only appear through gateway corridors. Open-ocean routes remain Starship-only unless explicitly modeled as future undersea corridors.';

const EXTENDED_RURAL_HELPER =
  'Remote cargo nodes connect critical minerals, Arctic logistics, rainforest river towns, outback mining regions, and other hard-to-access areas into the Hyperloop Web.';

const emptyWebStats = {
  totalNodes: 0,
  totalRenderableNodes: 0,
  totalEdges: 0,
  totalRenderableEdges: 0,
  crosslinks: 0,
  splitOffNodes: 0,
  switchNodes: 0,
  trunkLines: 0,
  branchLines: 0,
  localFeederLines: 0,
  regionalHyperloopLines: 0,
  extendedHyperloopLines: 0,
  tunnelRequiredLines: 0,
  throughRoutes: 0,
  throughRouteMiles: 0,
  connectedFeederNetworks: 0,
  intercontinentalGatewayRoutes: 0,
  intercontinentalGatewayMiles: 0,
  tunnelGatewaySegments: 0,
  disabledFutureGatewayRoutes: 0,
  estimatedTubeMiles: 0,
  avgEdgeDistance: 0,
  connectedE2eHubs: 0,
  surfaceLines: 0,
  elevatedLines: 0,
  mountainTunnelLines: 0,
  underseaTunnelLines: 0,
  urbanTunnelLines: 0,
  arcticEngineeringLines: 0,
  desertCorridorLines: 0,
  extremeDifficultyMiles: 0,
  totalTunnelMiles: 0,
  specialConstructionSegments: 0,
  specialConstructionMiles: 0,
};

const emptyHyperloopStats = {
  local: 0,
  regional: 0,
  extended: 0,
  cargo: 0,
  trunk: 0,
  branch: 0,
  total: 0,
};

const ROUTE_TOOLTIP_LAYER_IDS = new Set([
  'global-hyperloop-web-routes',
  'extended-rural-routes',
  'remote-cargo-critical-minerals-routes',
  INTEGRATED_LAYER_IDS.HYPERLOOP_SPINE,
  INTEGRATED_LAYER_IDS.E2E_ROUTES,
  INTEGRATED_LAYER_IDS.E2M_ROUTES,
  INTEGRATED_LAYER_IDS.LOOP_ROUTES,
]);

const routePathDashProps = PATH_DASH_RENDERING_ACTIVE
  ? {
      getDashArray: (d) => getRouteDashPattern(d.routeClass, d),
      dashJustified: true,
    }
  : {};

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';

const DEFAULT_VIEW = {
  longitude: 0,
  latitude: 20,
  zoom: 2,
  pitch: 0,
  bearing: 0,
};

export const HYPERLOOP_RADIUS_MILES = REGIONAL_HYPERLOOP_MAX_MILES;
export const STARSHIP_MIN_DISTANCE_MILES = STARSHIP_PASSENGER_MIN_MILES;

const generateCatchmentZone = (lat, lon, radiusMiles) => {
  const points = [];
  const latPerMile = 1 / 69;
  const lonPerMile = 1 / (69 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i < 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push([
      lon + radiusMiles * lonPerMile * Math.sin(angle),
      lat + radiusMiles * latPerMile * Math.cos(angle),
    ]);
  }
  points.push(points[0]);

  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [points] },
    properties: { type: 'catchment' },
  };
};

const panelStyle = {
  background: 'rgba(13, 20, 45, 0.95)',
  border: '1px solid rgba(100, 200, 255, 0.4)',
  borderRadius: '8px',
  padding: '16px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  pointerEvents: 'auto',
};

export default function FuturisticTransportMap({
  layoutMode = LAYOUT_MODES.FULL,
  onLayoutModeChange,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const deckOverlayRef = useRef(null);

  const [selectedOriginId, setSelectedOriginId] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [viewState, setViewState] = useState(DEFAULT_VIEW);
  const [zoom, setZoom] = useState(DEFAULT_VIEW.zoom);
  const [mapDisplayMode, setMapDisplayMode] = useState(DEFAULT_MAP_DISPLAY_MODE);
  const [analysisViewMode, setAnalysisViewMode] = useState('Infrastructure');
  const [showMetricsPanel, setShowMetricsPanel] = useState(false);
  const [constructionMetricsCollapsed, setConstructionMetricsCollapsed] = useState(true);
  const [mobileSheet, setMobileSheet] = useState(null);
  const [dockSection, setDockSection] = useState('layers');
  const [simulationYear, setSimulationYear] = useState(DEFAULT_SIMULATION_YEAR);
  const [metricOverlays, setMetricOverlays] = useState({});
  const [layerState, setLayerState] = useState(() =>
    buildDefaultLayerState(DEFAULT_MAP_DISPLAY_MODE)
  );

  const hubRegistry = useE2EHubRegistry();
  const {
    destinations: customDestinations,
    add: addCustomDestination,
    remove: removeCustomDestination,
    hasDestinations: hasCustomDestinations,
  } = useCustomDestinations();
  const parsedCitiesHook = useParsedCities();
  const {
    parsedCities,
    previewCities,
    mapPoints: parsedMapPoints,
    parsedWorldCityIds,
    remove: removeParsedCity,
    showOnlyParsedCities,
    autoFitParsedBounds,
  } = parsedCitiesHook;
  const transportMode = normalizeTransportMode(mapDisplayMode);

  const showThroughRoutes = layerState.showThroughRoutes;
  const showE2MLayer = layerState.showE2MLayer;
  const showRemoteCorridorSpines = layerState.showRemoteCorridorSpines;
  const showPlanetaryTrunks = layerState.showPlanetaryTrunks;
  const showRegionalTrunks = layerState.showRegionalTrunks;
  const showGateways = layerState.showGateways;
  const showFeeders = layerState.showFeeders;
  const showLabels = layerState.showLabels !== false;
  const showFutureHighPopulationHubs = layerState.showFutureHighPopulationHubs;
  const showRareEarthHubs = layerState.showRareEarthHubs;
  const showRemoteCargoRoutes = layerState.showRemoteCargoRoutes;
  const showExtendedGlobalCoverageNodes = layerState.showExtendedGlobalCoverageNodes;
  const showConnectivityRepairLinks = layerState.showConnectivityRepairLinks;
  const showDisconnectedAudit = layerState.showDisconnectedAudit;
  const showExtendedRuralLayer = layerState.showExtendedRuralLayer;
  const showWorldCitiesMasterFile = layerState.showWorldCitiesMasterFile;
  const showWorldCitiesPlanningGrid = layerState.showWorldCitiesPlanningGrid;
  const showLocalFeeders = layerState.showLocalFeeders;
  const showRobotaxiLayer = layerState.showRobotaxiLayer;
  const showRobotaxiServiceZones = layerState.showRobotaxiServiceZones;
  const showRobotaxiPickupDropoff = layerState.showRobotaxiPickupDropoff;
  const showCustomDestinations = layerState.showCustomDestinations !== false;
  const showCustomDestinationLabels = layerState.showCustomDestinationLabels !== false;
  const showCustomConnectionPreview = Boolean(layerState.showCustomConnectionPreview);
  const showParsedCities = layerState.showParsedCities !== false;
  const showParsedCitiesLabels = layerState.showParsedCitiesLabels !== false;
  const showPlanetarySkeleton = layerState.showPlanetarySkeleton !== false;
  const showGlobalConnectivityCorridors = layerState.showGlobalConnectivityCorridors !== false;
  const showIntegratedMineralHubs = layerState.showIntegratedMineralHubs !== false;
  const showIntermodalHubHalos = layerState.showIntermodalHubHalos !== false;
  const showStarbaseHubs = layerState.showStarbaseHubs === true;
  const showStarbaseLabels = layerState.showStarbaseLabels === true;
  const showStarbaseConnectivity = layerState.showStarbaseConnectivity === true;
  const showPetabondExportPackages = layerState.showPetabondExportPackages === true;
  const starbaseVisionPreviewOn = isStarbaseVisionPreviewActive(layerState);
  const offWorldStarbaseCount = countOffWorldStarbaseHubs();

  const mapScenarios = useMapScenarios();

  useEffect(() => {
    setLayerState((prev) => {
      const next = buildDefaultLayerState(mapDisplayMode);
      if (hasCustomDestinations) {
        next.showCustomDestinations = prev.showCustomDestinations ?? true;
        next.showCustomDestinationLabels = prev.showCustomDestinationLabels ?? true;
      }
      return next;
    });
  }, [mapDisplayMode, hasCustomDestinations]);

  useEffect(() => {
    if (!hasCustomDestinations) return;
    setLayerState((prev) => {
      if (prev.showCustomDestinations) return prev;
      return { ...prev, showCustomDestinations: true, showCustomDestinationLabels: true };
    });
  }, [hasCustomDestinations]);

  const setLayerFlag = useCallback((key, value) => {
    setLayerState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isHyperloopWebMode = isHyperloopCoreMode(transportMode);
  const isE2EMode = isE2EStarshipMode(transportMode);
  const isE2MMode = isE2MOrbitalMode(transportMode);
  const isCivilizationMode = isCivilizationGridMode(transportMode);
  const isRobotaxiModeActive = isRobotaxiMode(transportMode);
  const isOverviewMode =
    isCivilizationMode || (showPlanetarySkeleton && !isHyperloopWebMode);
  const hubMobilityActive = isHubMobilityOverlayActive(layerState, transportMode);

  const planningLayerState = useMemo(
    () => ({
      showFutureHighPopulationHubs,
      showRareEarthHubs,
      showRemoteCargoRoutes,
    }),
    [showFutureHighPopulationHubs, showRareEarthHubs, showRemoteCargoRoutes]
  );
  const isMobileLayout = layoutMode === LAYOUT_MODES.MOBILE;

  const roiHubs = hubRegistry.activeHubs;

  const planetaryGraph = useMemo(() => {
    const legacy = buildPlanetaryHyperloopGraph({
      activeE2EHubs: roiHubs,
      regionalFeederCitiesByHub,
      includePlanningConnectors: true,
      runConnectivityRepair: true,
    });
    return withCanonicalHyperloopPaths(legacy);
  }, [roiHubs]);

  const canonicalNetworkDiagnostics = useMemo(() => {
    try {
      return {
        stats: getNetworkStats(),
        validation: getValidationReport(),
      };
    } catch {
      return null;
    }
  }, []);

  const integratedGraph = useIntegratedTransportGraph({
    cities: roiHubs,
    existingHyperloopGraph: planetaryGraph,
    mineralHubs: DEFAULT_MINERAL_HUBS,
    layerState,
  });

  const integratedRenderView = useMemo(() => {
    if (!integratedGraph.isReady || integratedGraph.error) {
      return {
        visibleNodes: [],
        visibleEdges: [],
        zoomTier: 'global',
        hiddenNodeCount: 0,
        hiddenEdgeCount: 0,
      };
    }
    return filterIntegratedGraphForRender({
      nodes: integratedGraph.nodes,
      edges: integratedGraph.edges,
      activeFilters: layerState,
      zoom,
    });
  }, [integratedGraph, layerState, zoom]);

  const showIntegratedMapLayers =
    !showOnlyParsedCities &&
    integratedGraph.isReady &&
    !integratedGraph.error &&
    (isCivilizationMode || isE2MMode) &&
    integratedGraph.edges.length > 0;

  const visibleMineralHubs = useMemo(
    () =>
      integratedRenderView.visibleNodes
        .filter((n) => n.mineral_hub_id)
        .map((hub) => ({
          ...hub,
          lat: hub.latitude ?? hub.lat,
          lon: hub.longitude ?? hub.lon,
          isMineralHub: true,
        })),
    [integratedRenderView.visibleNodes]
  );

  const starbaseConnectivityPaths = useMemo(() => {
    if (!showStarbaseConnectivity || !showStarbaseHubs) return [];
    const earthHubs = listEarthStarbaseHubs().filter((h) => shouldRenderStarbaseAtZoom(h, zoom));
    return generateStarbaseConnectivity(earthHubs, integratedRenderView.visibleNodes);
  }, [showStarbaseConnectivity, showStarbaseHubs, zoom, integratedRenderView.visibleNodes]);

  const selectedLocation = useMemo(
    () => (selectedCity ? resolveSelectedLocation(selectedCity) : null),
    [selectedCity]
  );

  const simulationMode = useMemo(() => {
    if (layerState.showTrafficFlow) return SIMULATION_MODES.CONGESTION;
    return defaultSimulationModeForView(
      layerState.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID
    );
  }, [layerState.showTrafficFlow, layerState.integratedViewFocus]);

  const simulationState = useMemo(() => {
    if (!showIntegratedMapLayers) return null;
    try {
      return getSimulationState({ year: simulationYear, mode: simulationMode });
    } catch (err) {
      if (import.meta.env?.DEV) {
        console.warn('[simulation] state build failed', err);
      }
      return null;
    }
  }, [showIntegratedMapLayers, simulationYear, simulationMode]);

  const routeDisplayPipeline = useMemo(() => {
    if (!showIntegratedMapLayers) return null;
    try {
      const viewMode = integratedViewToPipelineMode(
        layerState.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID
      );
      return buildRouteDisplayPipeline({
        viewMode,
        zoom,
        regionFilter: selectedLocation?.region ?? null,
        simulationYear,
        simulationMode,
      });
    } catch (err) {
      if (import.meta.env?.DEV) {
        console.warn('[route-display-pipeline] build failed', err);
      }
      return null;
    }
  }, [
    showIntegratedMapLayers,
    layerState.integratedViewFocus,
    zoom,
    selectedLocation?.region,
    simulationYear,
    simulationMode,
  ]);

  const integratedDiagnosticsEnriched = useMemo(
    () => ({
      ...integratedGraph.diagnostics,
      renderedVisibleNodeCount: integratedRenderView.visibleNodes.length,
      renderedVisibleEdgeCount: integratedRenderView.visibleEdges.length,
      currentZoomTier: integratedRenderView.zoomTier,
      routePipeline: routeDisplayPipeline?.stats ?? null,
      economicDebug:
        import.meta.env?.DEV && routeDisplayPipeline
          ? getEconomicDebugRankings()
          : null,
      simulationDebug:
        import.meta.env?.DEV && simulationState ? getSimulationDebugRankings(simulationState) : null,
    }),
    [integratedGraph.diagnostics, integratedRenderView, routeDisplayPipeline, simulationState]
  );

  const selectedConnectedEdges = useMemo(
    () =>
      selectedLocation
        ? getConnectedEdgesForLocation(selectedLocation, integratedGraph.edges)
        : [],
    [selectedLocation, integratedGraph.edges]
  );

  const selectedConnectedNodes = useMemo(
    () => getConnectedNodesFromEdges(selectedConnectedEdges, integratedGraph.nodes),
    [selectedConnectedEdges, integratedGraph.nodes]
  );

  const e2mOrbitalData = useMemo(() => {
    const nodes = buildE2MOrbitalNodes();
    const byKey = new Map(nodes.map((n) => [n.nameKey, n]));
    const paths = buildE2MOrbitalPaths(byKey);
    return { nodes, paths };
  }, []);

  const robotaxiData = useMemo(() => {
    const trunkStations = planetaryGraph.nodes.filter(
      (n) => n.renderable && (n.isE2EHub || n.isSwitchNode || (n.tier != null && n.tier <= 2))
    );
    const rareEarth = planetaryGraph.nodes.filter(
      (n) => n.renderable && (n.potentialRareEarthHub || n.nodeType === 'RARE_EARTH_NODE')
    );
    const zones = buildRobotaxiServiceZones({
      activeE2EHubs: roiHubs,
      trunkStations,
      e2mNodes: e2mOrbitalData.nodes,
      rareEarthNodes: rareEarth,
      customDestinations,
    });
    return {
      zones,
      hubDots: filterRobotaxiHubDots(zones, layerState, zoom, transportMode),
      zoneFeatures: filterRobotaxiZoneFeatures(zones, layerState, zoom, transportMode),
      pickupDropoff: filterRobotaxiPickupDropoff(zones, layerState, zoom, transportMode),
    };
  }, [roiHubs, planetaryGraph.nodes, e2mOrbitalData.nodes, layerState, zoom, transportMode, customDestinations]);

  const globalHyperloopWeb = planetaryGraph;

  const visibleHyperloopAudit = useMemo(() => {
    if (!isHyperloopWebMode) return null;
    return auditVisibleHyperloopGraph(
      planetaryGraph.nodes,
      planetaryGraph.edges,
      layerState,
      { isHyperloopNodeVisible, isHyperloopEdgeVisible }
    );
  }, [isHyperloopWebMode, planetaryGraph.nodes, planetaryGraph.edges, layerState]);

  const visibleDisconnectedNodes = useMemo(() => {
    if (!visibleHyperloopAudit) return [];
    return visibleHyperloopAudit.disconnectedNodes || [];
  }, [visibleHyperloopAudit]);

  const ruralLayerMetrics = useMemo(() => {
    const remoteNodes = planetaryGraph.nodes.filter((n) => n.isRemoteNode && n.renderable);
    return {
      renderableNodes: remoteNodes.length,
      needsCoordinates: planetaryGraph.nodes.filter((n) => n.needsCoordinates).length,
      rareEarthNodes: remoteNodes.filter((n) => n.nodeType === 'RARE_EARTH_NODE').length,
      remoteBranchLines: planetaryGraph.paths.filter((p) => p.edgeCategory === 'EXTENDED_RURAL')
        .length,
      resourceCargoBranchMiles: Math.round(
        planetaryGraph.paths
          .filter((p) => p.edgeCategory === 'EXTENDED_RURAL')
          .reduce((s, p) => s + (p.distanceMiles || 0), 0)
      ),
      avgBranchDistance: 0,
    };
  }, [planetaryGraph]);

  const ruralVisibleNodes = useMemo(() => {
    if (!showExtendedRuralLayer && !showRareEarthHubs && !showExtendedGlobalCoverageNodes) return [];
    return planetaryGraph.nodes.filter((n) => {
      if (!n.renderable) return false;
      const isRemote = n.isRemoteNode || n.globalCoverage;
      if (!isRemote) return false;
      const minZ = n.visibleMinZoom ?? PLANNING_DEMO_MIN_ZOOM;
      return zoom >= minZ;
    });
  }, [showExtendedRuralLayer, showRareEarthHubs, showExtendedGlobalCoverageNodes, planetaryGraph.nodes, zoom]);

  const filterPlanetaryPath = useCallback(
    (p) => isHyperloopPathVisible(p, layerState),
    [layerState]
  );

  const ruralVisiblePaths = useMemo(() => {
    const allowRemote =
      showExtendedRuralLayer ||
      showRemoteCargoRoutes ||
      (showRemoteCorridorSpines && isHyperloopWebMode);
    if (!allowRemote) return [];
    const minZoom =
      showRemoteCorridorSpines && isHyperloopWebMode ? 2 : REMOTE_VISIBLE_MIN_ZOOM;
    if (zoom < minZoom) return [];
    return planetaryGraph.paths.filter((p) => {
      if (!filterPlanetaryPath(p)) return false;
      if (p.edgeCategory === 'EXTENDED_RURAL') {
        return showExtendedRuralLayer || showRemoteCargoRoutes;
      }
      if (p.edgeCategory === 'GLOBAL_COVERAGE_CORRIDOR') {
        if (!showRemoteCorridorSpines && !showRemoteCargoRoutes) return false;
        return isPriorityRemoteCorridorVisible(p, zoom);
      }
      return false;
    });
  }, [
    planetaryGraph.paths,
    zoom,
    showExtendedRuralLayer,
    showRemoteCargoRoutes,
    showRemoteCorridorSpines,
    isHyperloopWebMode,
    filterPlanetaryPath,
  ]);

  const connectivityRepairPaths = useMemo(() => {
    if (!showConnectivityRepairLinks || !isHyperloopWebMode) return [];
    return planetaryGraph.paths.filter(
      (p) =>
        (p.edgeType === 'CONNECTIVITY_REPAIR_LINK' ||
          p.edgeCategory === 'CONNECTIVITY_REPAIR' ||
          p.generatedBy === 'connectivity_repair') &&
        filterPlanetaryPath(p)
    );
  }, [
    showConnectivityRepairLinks,
    isHyperloopWebMode,
    planetaryGraph.paths,
    filterPlanetaryPath,
  ]);

  const disconnectedAuditNodes = useMemo(() => {
    if (!showDisconnectedAudit || !isHyperloopWebMode) return [];
    return visibleDisconnectedNodes
      .map((d) => planetaryGraph.nodeById[d.id])
      .filter((n) => n && n.lat != null && n.lon != null);
  }, [showDisconnectedAudit, isHyperloopWebMode, visibleDisconnectedNodes, planetaryGraph.nodeById]);

  const futureHighPopulationCities = useMemo(
    () => buildFutureHighPopulationCities(),
    []
  );
  const rareEarthHubCandidates = useMemo(() => buildRareEarthHubCandidates(), []);
  const remoteCargoPlanning = useMemo(
    () => ({
      paths: planetaryGraph.paths.filter((p) => p.edgeCategory === 'EXTENDED_RURAL'),
      metrics: ruralLayerMetrics,
    }),
    [planetaryGraph.paths, ruralLayerMetrics]
  );

  const futureHubMetrics = useMemo(
    () => getFutureHighPopulationMetrics(futureHighPopulationCities),
    [futureHighPopulationCities]
  );
  const rareEarthMetrics = useMemo(
    () => getRareEarthHubMetrics(rareEarthHubCandidates),
    [rareEarthHubCandidates]
  );

  const networkMapDebugLoggedRef = useRef(false);
  useEffect(() => {
    if (networkMapDebugLoggedRef.current || !import.meta.env.DEV) return;
    networkMapDebugLoggedRef.current = true;
    const hasCoords = (n) =>
      n &&
      typeof n.lat === 'number' &&
      typeof n.lon === 'number' &&
      !Number.isNaN(n.lat) &&
      !Number.isNaN(n.lon);
    console.log('NETWORK MAP DATA COUNTS', {
      rareEarthHubCandidates: rareEarthHubCandidates.length,
      rareEarthRenderable: rareEarthHubCandidates.filter(hasCoords).length,
      futureHighPopulationCities: futureHighPopulationCities.length,
      futureHighPopulationRenderable: futureHighPopulationCities.filter(hasCoords).length,
      remoteCargoCorridorChains: REMOTE_CORRIDOR_CHAINS.length,
      remoteCargoRenderableSegments: planetaryGraph.paths.filter(
        (p) => p.edgeCategory === 'GLOBAL_COVERAGE_CORRIDOR' && p.renderable !== false
      ).length,
      layerState,
    });
  }, [
    rareEarthHubCandidates,
    futureHighPopulationCities,
    planetaryGraph.paths,
    layerState,
  ]);

  const visibleFutureHighPopHubs = useMemo(() => {
    if (!showFutureHighPopulationHubs) return [];
    return futureHighPopulationCities.filter((node) =>
      shouldRenderFutureHighPopulationHub(node, planningLayerState)
    );
  }, [showFutureHighPopulationHubs, futureHighPopulationCities, planningLayerState]);

  const visibleRareEarthHubs = useMemo(() => {
    if (!showRareEarthHubs && !showExtendedGlobalCoverageNodes) return [];
    let base = rareEarthHubCandidates.filter(
      (node) =>
        planningHasCoordinates(node) &&
        shouldRenderRareEarthHub(node, planningLayerState, zoom)
    );
    if (showExtendedGlobalCoverageNodes && !showRareEarthHubs) {
      base = base.filter((n) => n.globalCoverage);
    }
    return base;
  }, [
    showRareEarthHubs,
    showExtendedGlobalCoverageNodes,
    rareEarthHubCandidates,
    planningLayerState,
    zoom,
  ]);

  const visibleRemoteCargoPaths = useMemo(() => {
    if (
      isIntegratedGridPipelineActive({
        showIntegratedMapLayers,
        integratedGraphError: integratedGraph.error,
        layerState,
      })
    ) {
      return [];
    }
    if (!showRemoteCargoRoutes || zoom < PLANNING_DEMO_MIN_ZOOM) return [];
    return planetaryGraph.paths.filter(
      (p) =>
        (p.edgeCategory === 'GLOBAL_COVERAGE_CORRIDOR' ||
          (showExtendedRuralLayer && p.edgeCategory === 'EXTENDED_RURAL')) &&
        filterPlanetaryPath(p)
    );
  }, [
    showIntegratedMapLayers,
    integratedGraph.error,
    layerState,
    showRemoteCargoRoutes,
    zoom,
    filterPlanetaryPath,
    showExtendedRuralLayer,
    planetaryGraph.paths,
  ]);

  const e2eNetwork = useMemo(
    () =>
      buildE2EOriginView({
        originId: selectedOriginId,
        roiHubs,
        planetaryGraph: globalHyperloopWeb,
        radiusMiles: HYPERLOOP_RADIUS_MILES,
      }),
    [selectedOriginId, roiHubs, globalHyperloopWeb]
  );

  const starshipRoutes = isHyperloopWebMode ? [] : e2eNetwork.starshipRoutes;
  const e2eFeederRoutes = isHyperloopWebMode ? [] : e2eNetwork.e2eFeederRoutes || [];
  const hyperloopRoutes = isHyperloopWebMode
    ? globalHyperloopWeb.paths
    : e2eNetwork.hyperloopRoutes;
  const hyperloopStats = isHyperloopWebMode
    ? globalHyperloopWeb.stats
    : e2eNetwork.hyperloopStats;
  const hyperloopSwitchNodes = isHyperloopWebMode
    ? globalHyperloopWeb.switchNodes
    : e2eNetwork.hyperloopSwitchNodes;
  const webPhase1Nodes = useMemo(
    () =>
      isHyperloopWebMode
        ? globalHyperloopWeb.nodes.filter((n) => n.renderable)
        : [],
    [isHyperloopWebMode, globalHyperloopWeb.nodes]
  );
  const webE2ENodes = useMemo(
    () => (isHyperloopWebMode ? webPhase1Nodes.filter((n) => n.isE2EHub || n.tier === 0) : []),
    [isHyperloopWebMode, webPhase1Nodes]
  );
  const webSwitchNodes = useMemo(
    () => (isHyperloopWebMode ? webPhase1Nodes.filter((n) => n.isSwitchNode) : []),
    [isHyperloopWebMode, webPhase1Nodes]
  );
  const webCityNodes = useMemo(
    () =>
      isHyperloopWebMode && (showLocalFeeders || zoom >= 6)
        ? webPhase1Nodes.filter((n) => !n.isE2EHub && !n.isSwitchNode)
        : [],
    [isHyperloopWebMode, webPhase1Nodes, showLocalFeeders, zoom]
  );
  const planningGridPoints = useMemo(
    () => (showWorldCitiesPlanningGrid ? buildWorldCitiesPlanningGrid({ limit: 800 }) : []),
    [showWorldCitiesPlanningGrid]
  );

  const webRenderablePaths = useMemo(() => {
    if (isRobotaxiModeActive && !isOverviewMode) return [];
    if (isE2MMode && !isOverviewMode) return [];
    if (isHyperloopWebMode) {
      return globalHyperloopWeb.paths.filter((p) =>
        isCoreHyperloopWebPath(p, layerState, zoom, transportMode)
      );
    }
    if (isOverviewMode && layerState.showHyperloopInfrastructure !== false) {
      return globalHyperloopWeb.paths.filter((p) =>
        isPlanetarySkeletonPath(p, layerState, zoom, transportMode)
      );
    }
    return [];
  }, [
    isHyperloopWebMode,
    isE2MMode,
    isOverviewMode,
    isRobotaxiModeActive,
    globalHyperloopWeb.paths,
    layerState,
    zoom,
    transportMode,
  ]);

  const globalConnectivityPaths = useMemo(() => {
    if (!showGlobalConnectivityCorridors) return [];
    const paths = buildGlobalConnectivityPaths(planetaryGraph.nodes);
    return filterPlanningPathsByZoom(paths, zoom);
  }, [showGlobalConnectivityCorridors, planetaryGraph.nodes, zoom]);

  const intermodalHalos = useMemo(() => {
    if (!showIntermodalHubHalos) return [];
    const hubs = planetaryGraph.nodes.filter(
      (n) => n.renderable && (n.isE2EHub || n.isSwitchNode || n.tier === 0)
    );
    return buildIntermodalHubHalos(hubs, zoom);
  }, [showIntermodalHubHalos, planetaryGraph.nodes, zoom]);

  const e2eHubHalos = useMemo(() => {
    if (!showIntermodalHubHalos || zoom > 4) return [];
    return buildE2EHubHalos(roiHubs, zoom);
  }, [showIntermodalHubHalos, roiHubs, zoom]);
  const hyperloopWebStats = isHyperloopWebMode
    ? globalHyperloopWeb.webStats
    : emptyWebStats;
  const regionalHubsInRadius = isHyperloopWebMode ? [] : e2eNetwork.regionalHubsInRadius;
  const feederCitiesInRadius = isHyperloopWebMode ? [] : e2eNetwork.feederCitiesInRadius;
  const feederStats = isHyperloopWebMode
    ? { count: 0, avgDistance: 0 }
    : e2eNetwork.feederStats;

  const regionalHubIds = useMemo(
    () => new Set(regionalHubsInRadius.map((h) => h.id)),
    [regionalHubsInRadius]
  );

  const catchmentZones = useMemo(() => {
    if (isHyperloopWebMode || selectedOriginId == null) return [];

    const origin = roiHubs.find((h) => h.id === selectedOriginId);
    if (!origin) return [];

    return [generateCatchmentZone(origin.lat, origin.lon, HYPERLOOP_RADIUS_MILES)];
  }, [selectedOriginId, roiHubs, isHyperloopWebMode]);

  const visibleCustomDestinations = useMemo(
    () => filterCustomDestinationsForView(customDestinations, transportMode),
    [customDestinations, transportMode]
  );

  const customConnectionPreviews = useMemo(() => {
    if (!showCustomDestinations || !showCustomConnectionPreview) return [];
    return buildCustomConnectionPreviews({
      customDestinations: visibleCustomDestinations,
      graphNodes: planetaryGraph.nodes,
      layerState,
      regionalHubCandidates: regionalHubsInRadius,
    });
  }, [
    showCustomDestinations,
    showCustomConnectionPreview,
    visibleCustomDestinations,
    planetaryGraph.nodes,
    layerState,
    regionalHubsInRadius,
  ]);

  const parsedIsolationPreviews = useMemo(
    () =>
      filterConnectionPreviewsForParsed(
        customConnectionPreviews,
        customDestinations,
        parsedWorldCityIds
      ),
    [customConnectionPreviews, customDestinations, parsedWorldCityIds]
  );

  const connectionPreviewsToRender = useMemo(
    () => (showOnlyParsedCities ? parsedIsolationPreviews : customConnectionPreviews),
    [showOnlyParsedCities, parsedIsolationPreviews, customConnectionPreviews]
  );

  const visibleLayers = useMemo(() => {
    if (showOnlyParsedCities) {
      return buildParsedIsolationVisibleLayers({
        parsedMapPoints,
        showLabels: showParsedCitiesLabels,
        zoom,
        includePreviewRoutes: showCustomConnectionPreview,
        previewRouteCount: parsedIsolationPreviews.length,
      });
    }

    const layers = ['hub-cities'];

    if (showE2MLayer && isE2MMode) {
      layers.push('e2m-orbital-routes', 'e2m-orbital-nodes');
    }

    if (showIntegratedMapLayers) {
      if (layerState.showIntegratedHyperloop !== false) {
        layers.push(INTEGRATED_LAYER_IDS.HYPERLOOP_SPINE);
      }
      if (layerState.showIntegratedE2M !== false) {
        layers.push('integrated-e2m-routes');
        if (visibleMineralHubs.length > 0) layers.push('integrated-mineral-hubs');
        if (zoom >= 3) layers.push('integrated-mineral-hub-labels');
      }
      if (layerState.showIntegratedLoop !== false) {
        layers.push('integrated-loop-routes');
      }
      if (layerState.showIntegratedE2E !== false) {
        layers.push(
          'integrated-e2e-routes',
          'integrated-e2e-hubs',
          ...(zoom >= 5 ? ['integrated-e2e-hub-labels'] : [])
        );
      }
    }

    const integratedFocus = layerState.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
    const autoOnlyOverlay = integratedFocus === INTEGRATED_VIEW_FOCUS.AUTO;

    if (hubMobilityActive && autoOnlyOverlay) {
      if (robotaxiData.hubDots.length > 0) layers.push('robotaxi-hub-availability');
      if (robotaxiData.zoneFeatures.length > 0) layers.push('robotaxi-service-zones');
      if (robotaxiData.pickupDropoff.length > 0) layers.push('robotaxi-pickup-dropoff');
    }

    if (showGlobalConnectivityCorridors && globalConnectivityPaths.length > 0) {
      layers.push('global-connectivity-corridors');
    }
    if (autoOnlyOverlay && showIntermodalHubHalos && intermodalHalos.length > 0) {
      layers.push('intermodal-hub-halos');
    }
    if (autoOnlyOverlay && showIntermodalHubHalos && e2eHubHalos.length > 0) {
      layers.push('e2e-hub-halos');
    }

    if (showStarbaseHubs) {
      layers.push('starbase-hubs');
      if (showStarbaseLabels) layers.push('starbase-labels');
      if (showStarbaseConnectivity && starbaseConnectivityPaths.length > 0) {
        layers.push('starbase-connectivity');
      }
    }

    if (isOverviewMode && !isHyperloopWebMode) {
      const useIntegratedGridPipeline = isIntegratedGridPipelineActive({
        showIntegratedMapLayers,
        integratedGraphError: integratedGraph.error,
        layerState,
      });

      const useLegacySpine =
        webRenderablePaths.length > 0 &&
        (!showIntegratedMapLayers || integratedGraph.error);
      if (useLegacySpine) {
        layers.push('planetary-skeleton-trunks');
      }
      if (roiHubs.length > 0) layers.push('planetary-skeleton-hubs');
      if (visibleFutureHighPopHubs.length > 0) layers.push('future-high-population-hubs');
      if (visibleRareEarthHubs.length > 0) layers.push('rare-earth-hub-candidates');
      if (!useIntegratedGridPipeline && visibleRemoteCargoPaths.length > 0) {
        layers.push('remote-cargo-critical-minerals-routes');
      }
      if (
        !useIntegratedGridPipeline &&
        (showExtendedRuralLayer || showRemoteCorridorSpines) &&
        ruralVisiblePaths.length > 0
      ) {
        layers.push('extended-rural-routes');
      }
      if (showCustomDestinations && visibleCustomDestinations.length > 0) {
        if (showCustomConnectionPreview && customConnectionPreviews.length > 0) {
          layers.push('custom-connection-preview');
        }
        layers.push('custom-destinations');
        if (showCustomDestinationLabels && zoom >= 5) {
          layers.push('custom-destination-labels');
        }
      }
      if (showParsedCities && parsedMapPoints.length > 0) {
        layers.push('parsed-cities');
        if (showParsedCitiesLabels && zoom >= 5) {
          layers.push('parsed-cities-labels');
        }
      }
      if (showWorldCitiesPlanningGrid) layers.push('world-cities-planning-grid');
      return layers;
    }

    if (isHyperloopWebMode) {
      layers.push('global-hyperloop-nodes-e2e', 'global-hyperloop-nodes-switch', 'global-hyperloop-nodes-city');
      if (webRenderablePaths.length > 0 && zoom >= PLANNING_DEMO_MIN_ZOOM) {
        layers.push('global-hyperloop-web-routes');
      }
      if (showLabels && zoom >= 5) layers.push('global-hyperloop-labels');
      if (
        (showExtendedRuralLayer || showRemoteCorridorSpines) &&
        ruralVisiblePaths.length > 0
      ) {
        layers.push('extended-rural-routes');
      }
      if (showExtendedRuralLayer && zoom >= REMOTE_CARGO_VISIBLE_MIN_ZOOM) {
        if (ruralVisibleNodes.length > 0) layers.push('extended-rural-nodes');
      }
      if (visibleFutureHighPopHubs.length > 0) layers.push('future-high-population-hubs');
      if (visibleRareEarthHubs.length > 0) layers.push('rare-earth-hub-candidates');
      if (visibleRemoteCargoPaths.length > 0) layers.push('remote-cargo-critical-minerals-routes');
      if (connectivityRepairPaths.length > 0) layers.push('connectivity-repair-routes');
      if (disconnectedAuditNodes.length > 0) layers.push('disconnected-nodes-audit');
      if (showCustomDestinations && visibleCustomDestinations.length > 0) {
        if (showCustomConnectionPreview && customConnectionPreviews.length > 0) {
          layers.push('custom-connection-preview');
        }
        layers.push('custom-destinations');
        if (showCustomDestinationLabels && zoom >= 5) {
          layers.push('custom-destination-labels');
        }
      }
      if (showParsedCities && parsedMapPoints.length > 0) {
        layers.push('parsed-cities');
        if (showParsedCitiesLabels && zoom >= 5) {
          layers.push('parsed-cities-labels');
        }
      }
      if (showGlobalConnectivityCorridors && globalConnectivityPaths.length > 0) {
        layers.push('global-connectivity-corridors');
      }
      return layers;
    }

    if (showPlanetarySkeleton && webRenderablePaths.length > 0) {
      layers.push('planetary-skeleton-trunks');
    }

    if (starshipRoutes.length > 0) layers.push('starship-routes');
    if (zoom >= 3 && selectedOriginId != null) layers.push('catchment-zone');
    if (zoom >= 5 && selectedOriginId != null && hyperloopRoutes.length > 0) {
      layers.push('hyperloop-routes');
    }
    if (zoom >= 4 && selectedOriginId != null && feederCitiesInRadius.length > 0) {
      layers.push('feeder-cities');
    }
    if (zoom >= 5 && selectedOriginId != null && feederCitiesInRadius.length > 0) {
      layers.push('feeder-labels');
    }
    if (zoom >= 5 && selectedOriginId != null && e2eFeederRoutes.length > 0) {
      layers.push('e2e-feeder-routes');
    }
    if (visibleFutureHighPopHubs.length > 0) layers.push('future-high-population-hubs');
    if (visibleRareEarthHubs.length > 0) layers.push('rare-earth-hub-candidates');
    if (visibleRemoteCargoPaths.length > 0) layers.push('remote-cargo-critical-minerals-routes');
    if (showCustomDestinations && visibleCustomDestinations.length > 0) {
      if (showCustomConnectionPreview && customConnectionPreviews.length > 0) {
        layers.push('custom-connection-preview');
      }
      layers.push('custom-destinations');
      if (showCustomDestinationLabels && zoom >= 5) {
        layers.push('custom-destination-labels');
      }
    }
    if (showParsedCities && parsedMapPoints.length > 0) {
      layers.push('parsed-cities');
      if (showParsedCitiesLabels && zoom >= 5) {
        layers.push('parsed-cities-labels');
      }
    }

    return layers;
  }, [
    zoom,
    selectedOriginId,
    showCustomDestinations,
    showCustomDestinationLabels,
    showCustomConnectionPreview,
    customConnectionPreviews.length,
    visibleCustomDestinations.length,
    showParsedCities,
    showParsedCitiesLabels,
    parsedMapPoints.length,
    starshipRoutes.length,
    feederCitiesInRadius.length,
    e2eFeederRoutes.length,
    hyperloopRoutes.length,
    webRenderablePaths.length,
    showExtendedRuralLayer,
    ruralVisibleNodes.length,
    ruralVisiblePaths.length,
    visibleFutureHighPopHubs.length,
    visibleRareEarthHubs.length,
    showExtendedGlobalCoverageNodes,
    visibleRemoteCargoPaths.length,
    connectivityRepairPaths.length,
    disconnectedAuditNodes.length,
    isHyperloopWebMode,
    isE2MMode,
    showE2MLayer,
    showRobotaxiLayer,
    showOnlyParsedCities,
    parsedIsolationPreviews.length,
    isOverviewMode,
    hubMobilityActive,
    showGlobalConnectivityCorridors,
    globalConnectivityPaths.length,
    showIntermodalHubHalos,
    intermodalHalos.length,
    e2eHubHalos.length,
    showPlanetarySkeleton,
  ]);

  useEffect(() => {
    if (!showOnlyParsedCities || !autoFitParsedBounds || !parsedMapPoints.length) return;
    const bounds = computeParsedCitiesBounds(parsedMapPoints);
    const map = mapRef.current;
    if (!bounds || !map) return;
    map.fitBounds([bounds.sw, bounds.ne], { padding: 72, duration: 1100, maxZoom: 8 });
  }, [showOnlyParsedCities, autoFitParsedBounds, parsedMapPoints]);

  const handleMapModeChange = useCallback((mode) => {
    setMapDisplayMode(mode);
    setSelectedCity(null);
    if (!isE2EStarshipMode(normalizeTransportMode(mode))) {
      setSelectedOriginId(null);
    }
  }, []);

  const handleOriginSelect = useCallback((hubId) => {
    if (!isE2EStarshipMode(normalizeTransportMode(mapDisplayMode))) return;
    setSelectedOriginId((prev) => (prev === hubId ? null : hubId));
    setSelectedCity(null);
  }, [mapDisplayMode]);

  const handleClearOrigin = useCallback(() => {
    setSelectedOriginId(null);
    setSelectedCity(null);
  }, []);

  const resetView = useCallback(() => {
    setViewState(DEFAULT_VIEW);
    setZoom(DEFAULT_VIEW.zoom);

    const map = mapRef.current;
    if (map) {
      map.jumpTo({
        center: [DEFAULT_VIEW.longitude, DEFAULT_VIEW.latitude],
        zoom: DEFAULT_VIEW.zoom,
        pitch: DEFAULT_VIEW.pitch,
        bearing: DEFAULT_VIEW.bearing,
      });
      map.resize();
    }
  }, []);

  const flyToLocation = useCallback(({ lat, lon, zoom: targetZoom = 6 }) => {
    if (lat == null || lon == null) return;
    setViewState((prev) => ({
      ...prev,
      longitude: lon,
      latitude: lat,
      zoom: targetZoom,
    }));
    setZoom(targetZoom);
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: [lon, lat],
        zoom: targetZoom,
        duration: 2200,
        essential: true,
      });
    }
  }, []);

  const handleSearchSelect = useCallback(
    (result) => {
      if (result?.type === 'hub' && result.payload?.id && isE2EStarshipMode(transportMode)) {
        setSelectedOriginId(result.payload.id);
        setSelectedCity(null);
      }
      if (result?.type === 'mineral' && result.payload) {
        setSelectedCity({ ...result.payload, isMineralHub: true });
      }
      if (result?.type === 'city' && result.payload) {
        setSelectedCity(result.payload);
      }
    },
    [transportMode]
  );

  const handleApplyViewFocus = useCallback((focus) => {
    const patch = getViewFocusLayerPatch(focus);
    setLayerState((prev) => ({ ...prev, ...patch }));
    setMapDisplayMode(TRANSPORT_MODES.CIVILIZATION_GRID);
  }, []);

  const handleSaveIntegratedDestination = useCallback(
    (location) => {
      if (!location) return;
      mapScenarios.saveMapScenario({
        name: `Destination: ${location.name}`,
        transportMode: mapDisplayMode,
        layerState,
        simulationYear,
      });
    },
    [mapScenarios, mapDisplayMode, layerState, simulationYear]
  );

  const handleAddIntegratedScenario = useCallback(
    (location) => {
      if (!location) return;
      mapScenarios.saveMapScenario({
        name: `Scenario: ${location.name}`,
        transportMode: mapDisplayMode,
        layerState,
        simulationYear,
      });
    },
    [mapScenarios, mapDisplayMode, layerState, simulationYear]
  );

  const toggleMetricOverlay = useCallback((id) => {
    setMetricOverlays((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const customDestIds = useMemo(
    () => {
      const ids = new Set(customDestinations.map((d) => d.worldCityId));
      parsedCities.forEach((c) => {
        if (c.worldCityId) ids.add(c.worldCityId);
      });
      return ids;
    },
    [customDestinations, parsedCities]
  );

  const mapNodesForParsing = useMemo(
    () => planetaryGraph.nodes.filter((n) => n.lat != null && (n.lon != null || n.lng != null)),
    [planetaryGraph.nodes]
  );

  const handleIntegratedNodePick = useCallback((info) => {
    const obj = info?.object;
    if (!obj) return;
    if (obj.mineral_hub_id || obj.isMineralHub) {
      setSelectedCity({
        ...obj,
        mineral_hub_id: obj.mineral_hub_id,
        isMineralHub: true,
      });
      return;
    }
    setSelectedCity({
      ...obj,
      lat: obj.lat ?? obj.latitude,
      lon: obj.lon ?? obj.longitude,
      networkCityId: obj.networkCityId ?? obj.city_id ?? obj.id,
    });
  }, []);

  const handleIntegratedRoutePick = useCallback((info) => {
    if (!info?.object) return;
    setSelectedCity({
      name: `${info.object.fromName ?? 'Origin'} → ${info.object.toName ?? 'Destination'}`,
      isRouteSelection: true,
      routeDetail: info.object,
      lat: info.object.sourcePosition?.[1],
      lon: info.object.sourcePosition?.[0],
    });
  }, []);

  const hyperloopSpinePaths = useMemo(() => {
    if (!showIntegratedMapLayers || layerState.showIntegratedHyperloop === false) return [];
    const focus = layerState.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
    if (focus === INTEGRATED_VIEW_FOCUS.LOOP) return [];
    return webRenderablePaths;
  }, [
    showIntegratedMapLayers,
    layerState.showIntegratedHyperloop,
    layerState.integratedViewFocus,
    webRenderablePaths,
  ]);

  const canonicalViewDeck = useMemo(() => {
    if (!showIntegratedMapLayers) return null;

    const buildLoopViewDeck = () => {
      const data = getLoopViewData();
      if (import.meta.env?.DEV) {
        console.info('[LOOP DEBUG]', {
          nodes: data.nodes?.length,
          paths: data.paths?.length,
          spinePaths: data.spinePaths?.length,
          routes: data.routes?.length,
          firstPath: data.paths?.[0],
        });
      }
      validateLoopPathsOnce(data.paths);
      debugLogViewStatsOnce('loop', data.stats);
      const loopPaths = canonicalPathsToDeckPaths(
        [...(data.paths ?? []), ...(data.spinePaths ?? [])],
        { deckMode: 'loop' }
      );
      return {
        canonicalLoopPaths: loopPaths,
        canonicalSpinePaths: [],
        canonicalGridArcs: [],
        canonicalE2mArcs: null,
        canonicalE2mPaths: null,
      };
    };

    const buildLegacyViewDeck = () => {
      const focus = layerState.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
      if (focus === INTEGRATED_VIEW_FOCUS.LOOP) {
        return buildLoopViewDeck();
      }
      if (
        focus === INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID ||
        isCivilizationMode
      ) {
        const data = getGridViewData();
        debugLogViewStatsOnce('grid', data.stats);
        const spine = data.paths.filter((p) => p.renderFamily === 'SPINE');
        const loopAndFeeder = data.paths.filter(
          (p) => p.renderFamily === 'REGIONAL_LOOP' || p.renderFamily === 'FEEDER'
        );
        return {
          canonicalLoopPaths: canonicalPathsToDeckPaths(loopAndFeeder, { deckMode: 'loop' }),
          canonicalSpinePaths: canonicalPathsToDeckPaths(spine, { deckMode: 'hyperloop' }),
          canonicalGridArcs: data.arcs,
          canonicalE2mArcs: data.e2mArcs ?? [],
          canonicalE2mPaths: [],
        };
      }
      return null;
    };

    try {
      if (routeDisplayPipeline) {
        const deck = pipelineBucketsToCanonicalDeck(routeDisplayPipeline);
        const hasPipelineData =
          deck.canonicalGridArcs.length > 0 ||
          deck.canonicalSpinePaths.length > 0 ||
          deck.canonicalLoopPaths.length > 0 ||
          deck.canonicalE2mArcs.length > 0;

        if (hasPipelineData) {
          if (import.meta.env?.DEV) {
            debugLogViewStatsOnce('pipeline', routeDisplayPipeline.stats);
          }
          const focus = layerState.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;
          if (focus === INTEGRATED_VIEW_FOCUS.LOOP) {
            const loopDeck = buildLoopViewDeck();
            const pipelineLoops = deck.canonicalLoopPaths ?? [];
            return {
              ...loopDeck,
              canonicalLoopPaths:
                loopDeck.canonicalLoopPaths.length > 0
                  ? loopDeck.canonicalLoopPaths
                  : pipelineLoops,
            };
          }
            // Phase 8 — intercontinental spine continuity at planetary zoom.
            // Pipeline spine paths are edge-driven; bridge tissue is route-driven.
            if (zoom < 3 && deck?.canonicalSpinePaths?.length != null) {
              const bridgeRouteIds = Object.values(INTERCONTINENTAL_BRIDGE_ROUTES);
              const legacySpinePaths = getSpinePaths();
              const bridgePaths = (legacySpinePaths ?? []).filter((p) =>
                bridgeRouteIds.includes(p.routeId ?? p.id)
              );

              if (bridgePaths.length > 0) {
                const merged = new Map();
                for (const p of deck.canonicalSpinePaths ?? []) {
                  merged.set(p.id ?? p.routeId, p);
                }
                for (const p of bridgePaths) {
                  const key = p.id ?? p.routeId;
                  if (!merged.has(key)) merged.set(key, p);
                }
                return { ...deck, canonicalSpinePaths: [...merged.values()] };
              }
            }

            return deck;
        }
      }
      return buildLegacyViewDeck();
    } catch (err) {
      console.warn('[canonical-transport] view deck bundle failed', err);
      return buildLegacyViewDeck();
    }
  }, [
    showIntegratedMapLayers,
    layerState.integratedViewFocus,
    isCivilizationMode,
    routeDisplayPipeline,
  ]);

  const integratedDeckLayers = useMemo(() => {
    if (!showIntegratedMapLayers) return [];
    try {
      return createIntegratedGraphLayers({
        nodes: integratedGraph.nodes,
        edges: integratedGraph.edges,
        visibleNodes: integratedRenderView.visibleNodes,
        visibleEdges: integratedRenderView.visibleEdges,
        activeFilters: layerState,
        hyperloopSpinePaths,
        canonicalLoopPaths: canonicalViewDeck?.canonicalLoopPaths,
        canonicalSpinePaths: canonicalViewDeck?.canonicalSpinePaths,
        canonicalGridArcs: canonicalViewDeck?.canonicalGridArcs,
        canonicalE2mArcs: canonicalViewDeck?.canonicalE2mArcs,
        canonicalE2mPaths: canonicalViewDeck?.canonicalE2mPaths,
        simulationState: routeDisplayPipeline?.simulation ?? simulationState,
        selectedLocation,
        zoom,
        onNodeClick: handleIntegratedNodePick,
        onRouteClick: handleIntegratedRoutePick,
      });
    } catch (err) {
      console.warn('[integrated-grid] deck layers failed; using legacy spine', err);
      return [];
    }
  }, [
    showIntegratedMapLayers,
    integratedGraph.nodes,
    integratedGraph.edges,
    integratedRenderView.visibleNodes,
    integratedRenderView.visibleEdges,
    layerState,
    hyperloopSpinePaths,
    canonicalViewDeck,
    routeDisplayPipeline,
    simulationState,
    selectedLocation,
    zoom,
    handleIntegratedNodePick,
    handleIntegratedRoutePick,
  ]);

  const layers = useMemo(() => {
    const layerList = [];

    if (visibleLayers.includes('e2m-orbital-routes')) {
      const orbitalArcs = (e2mOrbitalData.paths ?? [])
        .map((d) => normalizeE2MArc(d))
        .filter((d) => d.sourcePosition && d.targetPosition);
      layerList.push(
        new ArcLayer({
          id: 'e2m-orbital-routes',
          data: orbitalArcs,
          pickable: true,
          greatCircle: true,
          widthMinPixels: 2,
          widthMaxPixels: 5,
          getSourcePosition: (d) => d.sourcePosition,
          getTargetPosition: (d) => d.targetPosition,
          getSourceColor: () => [210, 150, 50, 210],
          getTargetColor: () => [210, 150, 50, 120],
          getWidth: 3,
        })
      );
    }

    if (visibleLayers.includes('robotaxi-hub-availability')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'robotaxi-hub-availability',
          data: robotaxiData.hubDots,
          pickable: true,
          opacity: 0.9,
          radiusMinPixels: 4,
          radiusMaxPixels: 8,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: () => ROBOTAXI_COLORS.hubDot,
          getRadius: (d) => (d.isMajorHub ? 7 : 5),
        })
      );
    }

    if (visibleLayers.includes('robotaxi-service-zones')) {
      const zoneCollection = {
        type: 'FeatureCollection',
        features: robotaxiData.zoneFeatures,
      };
      layerList.push(
        new GeoJsonLayer({
          id: 'robotaxi-service-zones-fill',
          data: zoneCollection,
          pickable: false,
          stroked: false,
          filled: true,
          getFillColor: () => ROBOTAXI_COLORS.zoneFill,
        }),
        new GeoJsonLayer({
          id: 'robotaxi-service-zones-outline',
          data: zoneCollection,
          pickable: false,
          stroked: true,
          filled: false,
          lineWidthMinPixels: 1,
          getLineColor: () => ROBOTAXI_COLORS.zoneLine,
        })
      );
    }

    if (visibleLayers.includes('robotaxi-pickup-dropoff')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'robotaxi-pickup-dropoff',
          data: robotaxiData.pickupDropoff,
          pickable: true,
          opacity: 0.85,
          stroked: true,
          radiusMinPixels: 3,
          radiusMaxPixels: 6,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: () => ROBOTAXI_COLORS.pickupFill,
          getLineColor: () => ROBOTAXI_COLORS.pickupLine,
          getRadius: 4,
        })
      );
    }

    if (visibleLayers.includes('e2m-orbital-nodes')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'e2m-orbital-nodes',
          data: e2mOrbitalData.nodes,
          pickable: true,
          opacity: 0.92,
          stroked: true,
          radiusMinPixels: 6,
          radiusMaxPixels: 14,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: (d) => {
            if (d.nodeType === E2M_NODE_TYPES.MARS_STAGING) return [200, 100, 255, 230];
            if (d.nodeType === E2M_NODE_TYPES.LAUNCH_ZONE) return [255, 140, 40, 230];
            return [200, 160, 60, 220];
          },
          getRadius: (d) => (d.marsWindow ? 10 : 8),
        })
      );
    }

    if (integratedDeckLayers.length > 0) {
      layerList.push(...integratedDeckLayers);
    }

    if (visibleLayers.includes('starship-routes')) {
      layerList.push(
        new ArcLayer({
          id: 'starship-routes',
          data: starshipRoutes,
          pickable: false,
          getSourcePosition: (d) => d.sourcePosition,
          getTargetPosition: (d) => d.targetPosition,
          getSourceColor: [255, 215, 0, 220],
          getTargetColor: [100, 200, 255, 180],
          getWidth: zoom < 3 ? 3 : 1.5,
        })
      );
    }

    if (visibleLayers.includes('catchment-zone') && catchmentZones.length > 0) {
      layerList.push(
        new GeoJsonLayer({
          id: 'catchment-zones-fill',
          data: { type: 'FeatureCollection', features: catchmentZones },
          pickable: false,
          stroked: false,
          filled: true,
          getFillColor: [255, 215, 0, 20],
        }),
        new GeoJsonLayer({
          id: 'catchment-zones-outline',
          data: { type: 'FeatureCollection', features: catchmentZones },
          pickable: false,
          stroked: true,
          filled: false,
          lineWidthMinPixels: 2,
          getLineColor: [255, 215, 0, 100],
        })
      );
    }

    if (
      !showOnlyParsedCities &&
      showWorldCitiesPlanningGrid &&
      planningGridPoints.length > 0 &&
      (isCivilizationMode || visibleLayers.includes('global-hyperloop-web-routes') || isE2EMode)
    ) {
      layerList.push(
        new ScatterplotLayer({
          id: 'world-cities-planning-grid',
          data: planningGridPoints,
          pickable: false,
          opacity: 0.55,
          radiusMinPixels: 2,
          radiusMaxPixels: zoom >= 7 ? 4 : 2,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: (d) => getInfrastructureRoleColor(d.infrastructureRole),
        })
      );
    }

    if (visibleLayers.includes('global-connectivity-corridors')) {
      layerList.push(
        new PathLayer({
          id: 'global-connectivity-corridors',
          data: globalConnectivityPaths,
          pickable: true,
          widthMinPixels: 1,
          widthMaxPixels: 5,
          getPath: (d) => d.path,
          getColor: (d) => d.color || getRouteColor('GLOBAL_MACRO_CORRIDOR', d),
          getWidth: (d) => d.width || 3,
          getDashArray: (d) => d.dash || [12, 6],
          _pathType: 'open',
          ...routePathDashProps,
        })
      );
    }

    const legacySpineFallback =
      webRenderablePaths.length > 0 &&
      (integratedGraph.error ||
        (showIntegratedMapLayers && integratedDeckLayers.length === 0));

    if (visibleLayers.includes('planetary-skeleton-trunks') || legacySpineFallback) {
      layerList.push(
        new PathLayer({
          id: 'planetary-skeleton-trunks',
          data: webRenderablePaths,
          pickable: true,
          widthMinPixels: 1,
          widthMaxPixels: 7,
          getPath: (d) => d.path,
          getColor: (d) => getRouteColor(d.routeClass, d),
          getWidth: (d) =>
            getHyperloopLineWidth(d.edgeType, d.routeClass) *
            getSkeletonPathWidthBoost(d, zoom),
          _pathType: 'open',
          ...routePathDashProps,
        })
      );
    }

    if (visibleLayers.includes('planetary-skeleton-hubs')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'planetary-skeleton-hubs',
          data: roiHubs,
          pickable: true,
          opacity: 0.92,
          radiusMinPixels: 4,
          radiusMaxPixels: zoom < 3 ? 10 : 7,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: [255, 215, 80, 220],
          getRadius: 22000,
        })
      );
    }

    if (visibleLayers.includes('intermodal-hub-halos')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'intermodal-hub-halos',
          data: intermodalHalos,
          pickable: false,
          opacity: zoom < 3 ? 0.35 : 0.45,
          stroked: true,
          filled: true,
          radiusMinPixels: 4,
          radiusMaxPixels: zoom < 3 ? 10 : 12,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: [100, 200, 255, zoom < 3 ? 28 : 40],
          getLineColor: [140, 220, 255, zoom < 3 ? 90 : 120],
          getRadius: (d) => d.radius * (zoom < 3 ? 0.75 : 0.9),
        })
      );
    }

    if (visibleLayers.includes('e2e-hub-halos')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'e2e-hub-halos',
          data: e2eHubHalos,
          pickable: false,
          opacity: 0.5,
          stroked: true,
          filled: true,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: [255, 215, 80, zoom < 3 ? 35 : 45],
          getLineColor: [255, 230, 120, zoom < 3 ? 100 : 140],
          getRadius: (d) => d.radius * (zoom < 3 ? 0.8 : 1),
        })
      );
    }

    if (isHyperloopWebMode && visibleLayers.includes('global-hyperloop-web-routes')) {
      layerList.push(
        new PathLayer({
          id: 'global-hyperloop-web-routes',
          data: webRenderablePaths,
          pickable: true,
          widthMinPixels: 1,
          widthMaxPixels: 7,
          getPath: (d) => d.path,
          getColor: (d) => getRouteColor(d.routeClass, d),
          getWidth: (d) =>
            getHyperloopLineWidth(d.edgeType, d.routeClass) *
            getSkeletonPathWidthBoost(d, zoom),
          _pathType: 'open',
          ...routePathDashProps,
        })
      );
    }

    if (isHyperloopWebMode && visibleLayers.includes('extended-rural-routes')) {
      layerList.push(
        new PathLayer({
          id: 'extended-rural-routes',
          data: ruralVisiblePaths,
          pickable: true,
          widthMinPixels: 0.75,
          widthMaxPixels: 3.5,
          getPath: (d) => d.path,
          getColor: (d) => getRouteColor(d.routeClass, d),
          getWidth: (d) => getHyperloopLineWidth(d.edgeType, d.routeClass),
          ...routePathDashProps,
        })
      );
    }

    if (isHyperloopWebMode && visibleLayers.includes('extended-rural-nodes')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'extended-rural-nodes',
          data: ruralVisibleNodes,
          pickable: true,
          opacity: 0.9,
          stroked: true,
          radiusMinPixels: 3,
          radiusMaxPixels: 8,
          lineWidthMinPixels: 1,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: (d) => getRemoteNodeColor(d.nodeType),
          getRadius: (d) =>
            d.nodeType === 'CRITICAL_MINERALS_NODE' || d.nodeType === 'RARE_EARTH_NODE'
              ? 6
              : 4,
        })
      );
    }

    if (visibleLayers.includes('future-high-population-hubs')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'future-high-population-hubs',
          data: visibleFutureHighPopHubs,
          pickable: true,
          opacity: 0.92,
          stroked: true,
          filled: true,
          radiusMinPixels: 3,
          radiusMaxPixels: 10,
          lineWidthMinPixels: 1,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: FUTURE_HUB_FILL,
          getLineColor: FUTURE_HUB_LINE,
          getRadius: 5,
        })
      );
    }

    if (visibleLayers.includes('rare-earth-hub-candidates')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'rare-earth-hub-candidates',
          data: visibleRareEarthHubs,
          pickable: true,
          opacity: 0.95,
          stroked: true,
          filled: true,
          radiusMinPixels: 4,
          radiusMaxPixels: 12,
          lineWidthMinPixels: 1,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: 22000,
          getFillColor: (d) => getRareEarthScatterFillColor(d),
          getLineColor: [255, 255, 255, 220],
        })
      );
    }

    if (visibleLayers.includes('remote-cargo-critical-minerals-routes')) {
      layerList.push(
        new PathLayer({
          id: 'remote-cargo-critical-minerals-routes',
          data: visibleRemoteCargoPaths,
          pickable: true,
          widthMinPixels: 1,
          widthMaxPixels: 5,
          getPath: (d) => d.path,
          getColor: (d) => getRouteColor(d.routeClass, d),
          getWidth: (d) =>
            d.routeClass === 'CRITICAL_MINERALS' || d.routeClass === 'RARE_EARTH_RESOURCE'
              ? 2.5
              : 1.75,
          ...routePathDashProps,
        })
      );
    }

    if (visibleLayers.includes('connectivity-repair-routes')) {
      layerList.push(
        new PathLayer({
          id: 'connectivity-repair-routes',
          data: connectivityRepairPaths,
          pickable: true,
          widthMinPixels: 2,
          widthMaxPixels: 2,
          getPath: (d) => d.path,
          getColor: () => [180, 220, 255, 190],
          getWidth: 2,
        })
      );
    }

    if (visibleLayers.includes('disconnected-nodes-audit')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'disconnected-nodes-audit',
          data: disconnectedAuditNodes,
          pickable: true,
          opacity: 0.85,
          stroked: true,
          filled: true,
          radiusMinPixels: 4,
          radiusMaxPixels: 8,
          lineWidthMinPixels: 2,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: [255, 80, 100, 140],
          getLineColor: [255, 120, 140, 220],
          getRadius: 5,
        })
      );
    }

    if (!isHyperloopWebMode && visibleLayers.includes('e2e-feeder-routes')) {
      layerList.push(
        new PathLayer({
          id: 'e2e-feeder-routes',
          data: e2eFeederRoutes,
          pickable: false,
          widthMinPixels: 1,
          widthMaxPixels: 3,
          getPath: (d) => d.path,
          getColor: (d) => getRouteColor(d.routeClass, d),
          getWidth: (d) => getRouteWidth(d.routeClass, d),
          ...routePathDashProps,
        })
      );
    }

    if (!isHyperloopWebMode && visibleLayers.includes('hyperloop-routes')) {
      layerList.push(
        new PathLayer({
          id: 'hyperloop-routes',
          data: hyperloopRoutes,
          pickable: false,
          widthMinPixels: 1,
          widthMaxPixels: 4,
          getPath: (d) => d.path,
          getColor: (d) => getRouteColor(d.routeClass, d),
          getWidth: (d) => getRouteWidth(d.routeClass, d),
          ...routePathDashProps,
        })
      );
    }

    if (!isHyperloopWebMode && visibleLayers.includes('switch-nodes')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'switch-nodes',
          data: hyperloopSwitchNodes,
          pickable: true,
          opacity: 0.95,
          stroked: true,
          radiusMinPixels: 5,
          radiusMaxPixels: 10,
          lineWidthMinPixels: 2,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: [255, 180, 50, 230],
          getLineColor: [255, 220, 120, 255],
          getRadius: 5,
        })
      );
    }

    if (visibleLayers.includes('feeder-cities')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'feeder-cities',
          data: feederCitiesInRadius,
          pickable: true,
          opacity: 0.85,
          stroked: true,
          radiusMinPixels: 4,
          radiusMaxPixels: 14,
          lineWidthMinPixels: 1,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: [100, 255, 200, 180],
          getLineColor: [100, 255, 200, 255],
          getRadius: 5,
        })
      );
    }

    if (visibleLayers.includes('feeder-labels')) {
      layerList.push(
        new TextLayer({
          id: 'feeder-labels',
          data: feederCitiesInRadius,
          pickable: false,
          getPosition: (d) => [d.lon, d.lat],
          getText: (d) => d.name,
          getSize: 11,
          getColor: [180, 255, 220, 255],
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'center',
          getPixelOffset: [0, -14],
        })
      );
    }

    if (isHyperloopWebMode) {
      if (visibleLayers.includes('global-hyperloop-nodes-city')) {
        layerList.push(
          new ScatterplotLayer({
            id: 'global-hyperloop-nodes-city',
            data: webCityNodes,
            pickable: true,
            opacity: 0.85,
            stroked: false,
            radiusMinPixels: 3,
            radiusMaxPixels: 6,
            getPosition: (d) => [d.lon, d.lat],
            getFillColor: [0, 220, 255, 200],
            getRadius: 4,
          })
        );
      }
      if (visibleLayers.includes('global-hyperloop-nodes-switch')) {
        layerList.push(
          new ScatterplotLayer({
            id: 'global-hyperloop-nodes-switch',
            data: webSwitchNodes,
            pickable: true,
            opacity: 0.95,
            stroked: true,
            radiusMinPixels: 6,
            radiusMaxPixels: 10,
            lineWidthMinPixels: 2,
            getPosition: (d) => [d.lon, d.lat],
            getFillColor: [255, 170, 40, 230],
            getLineColor: [255, 220, 120, 255],
            getRadius: 7,
          })
        );
      }
      if (visibleLayers.includes('global-hyperloop-nodes-e2e')) {
        layerList.push(
          new ScatterplotLayer({
            id: 'global-hyperloop-nodes-e2e',
            data: webE2ENodes,
            pickable: true,
            opacity: 1,
            stroked: true,
            radiusMinPixels: 10,
            radiusMaxPixels: 16,
            lineWidthMinPixels: 2,
            getPosition: (d) => [d.lon, d.lat],
            getFillColor: [255, 215, 0, 240],
            getLineColor: [255, 255, 255, 255],
            getRadius: (d) => (d.isE2EHub ? 10 : 8),
          })
        );
      }
      if (visibleLayers.includes('global-hyperloop-labels')) {
        layerList.push(
          new TextLayer({
            id: 'global-hyperloop-labels',
            data: webE2ENodes,
            pickable: false,
            getPosition: (d) => [d.lon, d.lat],
            getText: (d) => d.name,
            getSize: 11,
            getColor: [220, 240, 255, 255],
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center',
            getPixelOffset: [0, -16],
          })
        );
      }
    } else if (visibleLayers.includes('hub-cities')) {
      layerList.push(
        new ScatterplotLayer({
          id: 'hub-cities',
          data: roiHubs,
          pickable: true,
          opacity: 0.95,
          stroked: true,
          radiusMinPixels: 8,
          radiusMaxPixels: 24,
          lineWidthMinPixels: 2,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: (d) => {
            if (d.id === selectedOriginId) return [255, 215, 0, 255];
            if (regionalHubIds.has(d.id)) return [100, 200, 255, 200];
            return [100, 200, 255, 220];
          },
          getLineColor: (d) => {
            if (d.id === selectedOriginId) return [255, 255, 0, 255];
            return [100, 200, 255, 255];
          },
          getRadius: (d) => (d.id === selectedOriginId ? 12 : 8),
        })
      );
    }

    if (visibleLayers.includes('starbase-connectivity') && starbaseConnectivityPaths.length > 0) {
      layerList.push(
        new PathLayer({
          id: 'starbase-connectivity',
          data: starbaseConnectivityPaths,
          pickable: false,
          widthMinPixels: 1,
          widthMaxPixels: 2,
          getPath: (d) => d.path,
          getColor: (d) =>
            STARBASE_CONNECTOR_COLORS[d.systemType] ?? STARBASE_CONNECTOR_COLORS.default,
          getWidth: 1,
          dashJustified: true,
          dashArray: [6, 4],
        })
      );
    }

    if (visibleLayers.includes('starbase-hubs')) {
      const hubs = listEarthStarbaseHubs()
        .filter((h) => shouldRenderStarbaseAtZoom(h, zoom))
        .map((h) => ({
          ...h,
          lon: h.coordinates?.[0],
          lat: h.coordinates?.[1],
          isPetabond: (h.hubRoles ?? []).includes('PETABOND_EXPORT'),
        }))
        .filter((h) => h.earthRenderable && h.lat != null && h.lon != null);

      const petabondIds = showPetabondExportPackages
        ? new Set(getPetabondExportHubs().filter((h) => h.earthRenderable).map((h) => h.id))
        : null;

      layerList.push(
        new ScatterplotLayer({
          id: 'starbase-hubs',
          data: hubs,
          pickable: true,
          opacity: 0.95,
          stroked: true,
          filled: true,
          radiusMinPixels: 5,
          radiusMaxPixels: 14,
          lineWidthMinPixels: 2,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: (d) => {
            if (petabondIds?.has(d.id)) return STARBASE_HUB_COLORS.petabond;
            if (d.starbaseClass === STARBASE_CLASSES.PRIME) return STARBASE_HUB_COLORS.prime;
            if (d.starbaseClass === STARBASE_CLASSES.PASSENGER) return STARBASE_HUB_COLORS.passenger;
            if (d.starbaseClass === STARBASE_CLASSES.INDUSTRIAL) return STARBASE_HUB_COLORS.industrial;
            if (d.starbaseClass === STARBASE_CLASSES.RESOURCE) return STARBASE_HUB_COLORS.resource;
            return STARBASE_HUB_COLORS.default;
          },
          getLineColor: (d) => {
            if (d.status === STARBASE_STATUS.CONCEPTUAL) return [180, 180, 200, 200];
            if (petabondIds?.has(d.id)) return [255, 255, 200, 255];
            return [220, 240, 255, 240];
          },
          getRadius: (d) =>
            d.starbaseClass === STARBASE_CLASSES.PRIME ? 10 : d.starbaseClass === STARBASE_CLASSES.PASSENGER ? 8 : 7,
          onClick: (info) => {
            if (!info?.object) return;
            setSelectedCity({
              name: info.object.name,
              isStarbaseHub: true,
              starbaseDetail: info.object,
              lat: info.object.lat,
              lon: info.object.lon,
            });
          },
        })
      );
    }

    if (visibleLayers.includes('starbase-labels')) {
      const hubs = listEarthStarbaseHubs()
        .filter((h) => shouldRenderStarbaseAtZoom(h, zoom))
        .map((h) => ({
          ...h,
          lon: h.coordinates?.[0],
          lat: h.coordinates?.[1],
        }))
        .filter((h) => h.earthRenderable && h.lat != null && h.lon != null);

      layerList.push(
        new TextLayer({
          id: 'starbase-labels',
          data: hubs,
          pickable: false,
          getPosition: (d) => [d.lon, d.lat],
          getText: (d) => d.name,
          getSize: 11,
          getColor: [230, 240, 255, 230],
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'center',
          getPixelOffset: [0, -16],
        })
      );
    }

    if (visibleLayers.includes('custom-connection-preview')) {
      const previewStyle = PREVIEW_LINE_STYLE;
      layerList.push(
        new PathLayer({
          id: 'custom-connection-preview',
          data: connectionPreviewsToRender,
          pickable: true,
          widthMinPixels: 1,
          widthMaxPixels: 3,
          getPath: (d) => d.path,
          getColor: () => previewStyle.color,
          getWidth: previewStyle.width,
          ...(PATH_DASH_RENDERING_ACTIVE
            ? {
                getDashArray: () => previewStyle.dashArray,
                dashJustified: true,
              }
            : {}),
        })
      );
    }

    if (visibleLayers.includes('custom-destinations')) {
      const style = CUSTOM_DESTINATION_MAP_STYLE;
      layerList.push(
        new ScatterplotLayer({
          id: 'custom-destinations-halo',
          data: visibleCustomDestinations,
          pickable: false,
          opacity: 0.55,
          stroked: true,
          filled: true,
          radiusMinPixels: style.haloRadius,
          radiusMaxPixels: style.haloRadius + 4,
          lineWidthMinPixels: 0,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: () => style.haloColor,
          getLineColor: () => [0, 0, 0, 0],
          getRadius: style.haloRadius,
        }),
        new ScatterplotLayer({
          id: 'custom-destinations',
          data: visibleCustomDestinations,
          pickable: true,
          opacity: 0.98,
          stroked: true,
          filled: true,
          radiusMinPixels: style.markerRadius,
          radiusMaxPixels: style.markerRadius + 6,
          lineWidthMinPixels: style.lineWidth,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: (d) => {
            const c = getRoleColor(d.selectedRole);
            return [c[0], c[1], c[2], 200];
          },
          getLineColor: () => style.lineColor,
          getRadius: style.markerRadius,
        })
      );
    }

    if (visibleLayers.includes('custom-destination-labels')) {
      const style = CUSTOM_DESTINATION_MAP_STYLE;
      layerList.push(
        new TextLayer({
          id: 'custom-destination-labels',
          data: visibleCustomDestinations,
          pickable: false,
          getPosition: (d) => [d.lon, d.lat],
          getText: (d) => `${style.labelPrefix}${d.name}`,
          getSize: 11,
          getColor: () => [255, 180, 255, 255],
          getTextAnchor: 'start',
          getAlignmentBaseline: 'center',
          getPixelOffset: [14, 0],
        })
      );
    }

    if (visibleLayers.includes('parsed-cities') && parsedMapPoints.length > 0) {
      layerList.push(
        ...buildParsedCitiesDeckLayers(parsedMapPoints, {
          showLabels: visibleLayers.includes('parsed-cities-labels'),
          zoom,
        })
      );
    }

    return layerList;
  }, [
    visibleLayers,
    roiHubs,
    selectedOriginId,
    regionalHubIds,
    starshipRoutes,
    hyperloopRoutes,
    e2eFeederRoutes,
    hyperloopSwitchNodes,
    webRenderablePaths,
    webE2ENodes,
    webSwitchNodes,
    webCityNodes,
    ruralVisiblePaths,
    ruralVisibleNodes,
    visibleFutureHighPopHubs,
    visibleRareEarthHubs,
    visibleRemoteCargoPaths,
    connectivityRepairPaths,
    disconnectedAuditNodes,
    feederCitiesInRadius,
    catchmentZones,
    zoom,
    isHyperloopWebMode,
    showWorldCitiesPlanningGrid,
    planningGridPoints,
    isE2MMode,
    showE2MLayer,
    e2mOrbitalData,
    transportMode,
    isCivilizationMode,
    isOverviewMode,
    isE2EMode,
    isRobotaxiModeActive,
    showRemoteCorridorSpines,
    showLabels,
    showRobotaxiLayer,
    robotaxiData,
    globalConnectivityPaths,
    intermodalHalos,
    e2eHubHalos,
    visibleCustomDestinations,
    showCustomDestinations,
    showCustomDestinationLabels,
    customConnectionPreviews,
    connectionPreviewsToRender,
    showCustomConnectionPreview,
    showParsedCities,
    showParsedCitiesLabels,
    parsedMapPoints,
    showOnlyParsedCities,
    visibleMineralHubs,
    integratedDeckLayers,
    showIntegratedMapLayers,
    starbaseConnectivityPaths,
    showPetabondExportPackages,
  ]);

  const handleLayerClick = useCallback(
    (info) => {
      if (info.layer?.id === 'hub-cities' && info.object?.id !== undefined) {
        handleOriginSelect(info.object.id);
      } else if (info.layer?.id === 'custom-destinations' && info.object) {
        setSelectedCity({
          ...info.object,
          lat: info.object.lat,
          lon: info.object.lon,
          isCustomDestination: true,
        });
      } else if (info.layer?.id === 'parsed-cities' && info.object) {
        setSelectedCity({
          name: info.object.city,
          country: info.object.country,
          lat: info.object.lat,
          lon: info.object.lng,
          selectedRole: info.object.suggestedRole,
          isParsedCity: true,
          parsingConfidence: info.object.parsingConfidence,
          source: info.object.source,
        });
      } else if (
        info.layer?.id === INTEGRATED_LAYER_IDS.MINERAL_HUBS ||
        info.layer?.id === INTEGRATED_LAYER_IDS.E2E_HUBS
      ) {
        handleIntegratedNodePick(info);
      } else if (
        info.layer?.id === 'feeder-cities' ||
        info.layer?.id === 'switch-nodes' ||
        info.layer?.id === 'extended-rural-nodes' ||
        info.layer?.id === 'future-high-population-hubs' ||
        info.layer?.id === 'rare-earth-hub-candidates' ||
        info.layer?.id === 'disconnected-nodes-audit' ||
        info.layer?.id?.startsWith('global-hyperloop-nodes')
      ) {
        setSelectedCity(info.object);
      }
    },
    [handleOriginSelect, handleIntegratedNodePick]
  );

  const routeTooltip = useCallback((info) => {
    if (!info?.object || !ROUTE_TOOLTIP_LAYER_IDS.has(info.layer?.id)) return null;
    const html = buildRouteTooltipHtml(info.object);
    return html ? { html } : null;
  }, []);

  const deckTooltip = useCallback(
    (info) => {
      if (info.layer?.id === 'custom-connection-preview' && info.object?.tooltip) {
        return { html: info.object.tooltip };
      }
      return routeTooltip(info);
    },
    [routeTooltip]
  );

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OPENFREEMAP_STYLE,
      center: [-20, 20],
      zoom: 1.5,
      pitch: 0,
      bearing: 0,
      minZoom: 0.5,
      maxZoom: 15,
      antialias: true,
    });

    mapRef.current = map;

    const deckOverlay = new MapboxOverlay({
      interleaved: true,
      layers: [],
      onClick: handleLayerClick,
      getTooltip: deckTooltip,
    });
    deckOverlayRef.current = deckOverlay;

    map.on('load', () => {
      map.addControl(deckOverlay);
      map.resize();
      setTimeout(() => map.resize(), 250);
    });

    const updateZoom = () => {
      const z = map.getZoom();
      setZoom(z);
      setViewState((prev) => ({
        ...prev,
        longitude: map.getCenter().lng,
        latitude: map.getCenter().lat,
        zoom: z,
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      }));
    };
    map.on('zoom', updateZoom);
    map.on('moveend', updateZoom);

    return () => {
      deckOverlay.setProps({ layers: [] });
      map.removeControl(deckOverlay);
      map.remove();
      mapRef.current = null;
      deckOverlayRef.current = null;
    };
  }, [handleLayerClick]);

  useEffect(() => {
    deckOverlayRef.current?.setProps({
      layers,
      onClick: handleLayerClick,
      getTooltip: deckTooltip,
    });
  }, [layers, handleLayerClick, deckTooltip]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const resize = () => map.resize();
    resize();
    const t1 = setTimeout(resize, 50);
    const t2 = setTimeout(resize, 150);
    const t3 = setTimeout(resize, 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [layoutMode]);

  useEffect(() => {
    setMobileSheet(null);
  }, [layoutMode]);

  const selectedOrigin = selectedOriginId != null
    ? roiHubs.find((h) => h.id === selectedOriginId)
    : null;

  const feederCityInfo = selectedCity
    ? {
        city: selectedCity,
        distance:
          selectedOrigin != null
            ? haversineDistanceMiles(
                selectedOrigin.lat,
                selectedOrigin.lon,
                selectedCity.lat,
                selectedCity.lon
              )
            : null,
      }
    : null;

  return (
    <div
      className={`transport-map-root${showOnlyParsedCities ? ' is-parsed-isolation' : ''}`}
      data-testid="transport-map-root"
      data-parsed-isolation={showOnlyParsedCities ? 'true' : 'false'}
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: '#0a0e27',
        color: '#e0e0ff',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        ref={mapContainer}
        data-testid="transport-map-container"
        style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'auto' }}
      />

      <div
        data-testid="starbase-preview-controls"
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 4,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '8px 10px',
          borderRadius: 8,
          background: 'rgba(13, 20, 45, 0.92)',
          border: '1px solid rgba(100, 200, 255, 0.35)',
          fontSize: 11,
          maxWidth: 220,
        }}
      >
        <div style={{ color: '#8899cc', fontSize: 10, letterSpacing: '0.04em' }}>STARBASE VISION</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            data-testid="starbase-vision-preview"
            checked={starbaseVisionPreviewOn}
            onChange={(e) => {
              const next = applyStarbaseVisionPreview(layerState, e.target.checked);
              Object.entries(next).forEach(([key, value]) => {
                if (
                  key.startsWith('showStarbase') ||
                  key === 'showPetabondExportPackages'
                ) {
                  setLayerFlag(key, value);
                }
              });
            }}
          />
          Show Starbase System
        </label>
        {offWorldStarbaseCount > 0 && (
          <span style={{ color: '#b8a8ff', fontSize: 10, lineHeight: 1.35 }}>
            Off-World pending: {offWorldStarbaseCount} (not on Earth map)
          </span>
        )}
      </div>

      {isMobileLayout && mobileSheet && (
        <button
          type="button"
          className={`mobile-backdrop is-visible`}
          aria-label="Close panel"
          onClick={() => setMobileSheet(null)}
        />
      )}

      <PlanetaryMobilityShell
        mapDisplayMode={mapDisplayMode}
        onMapModeChange={handleMapModeChange}
        hubs={roiHubs}
        onSearchSelect={handleSearchSelect}
        onFlyTo={flyToLocation}
        showMetrics={showMetricsPanel}
        onToggleMetrics={() => setShowMetricsPanel((s) => !s)}
        metricOverlays={metricOverlays}
        onToggleMetricOverlay={toggleMetricOverlay}
        onResetView={resetView}
        layoutMode={layoutMode}
        onLayoutModeChange={onLayoutModeChange}
        layoutModeLabels={{
          [LAYOUT_MODES.FULL]: 'Full',
          [LAYOUT_MODES.HALF]: 'Half',
          [LAYOUT_MODES.MOBILE]: 'Mobile',
        }}
        simulationYear={simulationYear}
        onSimulationYearChange={setSimulationYear}
        dockSection={dockSection}
        onDockSectionChange={setDockSection}
        layersContent={
          <TransportControlPanel
            mapDisplayMode={mapDisplayMode}
            onMapModeChange={handleMapModeChange}
            layerState={layerState}
            setLayerFlag={setLayerFlag}
            hideModeSelector
            compactHeader
            hyperloopWebHelper={HYPERLOOP_WEB_HELPER}
            extendedRuralHelper={EXTENDED_RURAL_HELPER}
            zoom={zoom}
            remoteVisibleMinZoom={REMOTE_VISIBLE_MIN_ZOOM}
            customDestinationCount={customDestinations.length}
            onApplyViewFocus={handleApplyViewFocus}
            selectedLocation={selectedLocation}
            integratedGraph={integratedGraph}
            connectedEdges={selectedConnectedEdges}
            connectedNodes={selectedConnectedNodes}
            allNodes={integratedGraph.nodes}
            integratedDiagnostics={integratedDiagnosticsEnriched}
            integratedGraphError={integratedGraph.error}
            onSaveDestination={handleSaveIntegratedDestination}
            onAddToScenario={handleAddIntegratedScenario}
            onCloseSelectedLocation={() => setSelectedCity(null)}
          />
        }
        plannerContent={
          <NetworkControlCenter
            compact
            mapDisplayMode={mapDisplayMode}
            isE2EMode={isE2EMode}
            isRobotaxiModeActive={isRobotaxiModeActive}
            hubRegistry={hubRegistry}
            selectedOriginId={selectedOriginId}
            onOriginSelect={handleOriginSelect}
            onClearOrigin={handleClearOrigin}
            roiHubCount={roiHubs.length}
            customDestinations={customDestinations}
            onAddCustomDestination={addCustomDestination}
            onRemoveCustomDestination={removeCustomDestination}
            parsedCitiesHook={parsedCitiesHook}
            existingWorldCityIds={customDestIds}
            mapNodesForParsing={mapNodesForParsing}
            onRemoveParsedCity={removeParsedCity}
            selectedCity={selectedCity}
            feederCityInfo={feederCityInfo}
          />
        }
        destinationsContent={
          <AddDestinationPanel onAdd={addCustomDestination} existingWorldCityIds={customDestIds} />
        }
        routesContent={
          <div className="pmos-subtitle" style={{ lineHeight: 1.5 }}>
            {selectedOrigin ? (
              <>
                Active anchor: <strong style={{ color: 'var(--pmos-cyan)' }}>{selectedOrigin.name}</strong>
              </>
            ) : (
              'Select an E2E hub or search a city to explore connected routes.'
            )}
            {isHyperloopWebMode && (
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--pmos-text-dim)' }}>
                {hyperloopWebStats.totalRenderableEdges} renderable edges ·{' '}
                {hyperloopWebStats.throughRoutes ?? 0} through routes
              </div>
            )}
          </div>
        }
        simulationsContent={
          <div>
            <p className="pmos-subtitle">
              Simulation year <strong>{simulationYear}</strong> — network growth{' '}
              {getSimulationGrowthFactor(simulationYear).toFixed(2)}×
            </p>
            <ul style={{ margin: '10px 0 0', paddingLeft: 16, fontSize: 11, color: 'var(--pmos-text-muted)' }}>
              {getSimulationMilestones(simulationYear).map((m) => (
                <li key={m} style={{ marginBottom: 4 }}>
                  {m}
                </li>
              ))}
            </ul>
            <p className="pmos-subtitle" style={{ marginTop: 12, fontSize: 10 }}>
              Timeline controls are on the bottom bar. Future phases will bind hub/route visibility to year.
            </p>
          </div>
        }
        settingsContent={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ScenarioControls
              scenarios={mapScenarios.scenarios}
              onSaveCurrent={(name) => {
                const map = mapRef.current;
                mapScenarios.saveMapScenario({
                  name,
                  transportMode: mapDisplayMode,
                  layerState,
                  customDestinations,
                  parsedDestinationSets: parsedCities,
                  simulationYear,
                  viewport: map
                    ? {
                        center: map.getCenter().toArray(),
                        zoom: map.getZoom(),
                        pitch: map.getPitch(),
                        bearing: map.getBearing(),
                      }
                    : null,
                });
              }}
              onLoad={(scenario) => {
                if (scenario.transportMode) handleMapModeChange(scenario.transportMode);
                if (scenario.layerState) setLayerState(scenario.layerState);
                if (scenario.simulationYear) setSimulationYear(scenario.simulationYear);
                const vp = scenario.viewport;
                if (vp?.center) {
                  flyToLocation({
                    lon: vp.center[0],
                    lat: vp.center[1],
                    zoom: vp.zoom ?? 3,
                  });
                }
              }}
              onDelete={mapScenarios.removeScenario}
              onDuplicate={mapScenarios.duplicateScenario}
            />
            <label className="pmos-label">
              Viewport
              <select
                className="pmos-search-input"
                style={{ marginTop: 4, width: '100%' }}
                value={layoutMode}
                onChange={(e) => onLayoutModeChange?.(e.target.value)}
              >
                <option value={LAYOUT_MODES.FULL}>Full</option>
                <option value={LAYOUT_MODES.HALF}>Half</option>
                <option value={LAYOUT_MODES.MOBILE}>Mobile</option>
              </select>
            </label>
            <button type="button" className="pmos-btn" onClick={resetView}>
              Reset camera
            </button>
          </div>
        }
        metricsContent={
          <>
          {canonicalNetworkDiagnostics?.stats && (
            <div
              className="metrics-grid"
              style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(100,200,255,0.15)' }}
            >
              <div style={{ gridColumn: '1 / -1', fontSize: '10px', color: '#64c8ff' }}>
                Canonical transport v1.4.0
                {planetaryGraph.canonicalPathsActive ? ' · canonical hyperloop paths' : ''}
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px' }}>NODES</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {canonicalNetworkDiagnostics.stats.totalNodes}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px' }}>EDGES</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {canonicalNetworkDiagnostics.stats.totalEdges}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px' }}>ROUTES</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {canonicalNetworkDiagnostics.stats.totalRoutes}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px' }}>E2E HUBS</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff6b35' }}>
                  {canonicalNetworkDiagnostics.stats.e2eHubs}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px' }}>REGIONS</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {Object.keys(canonicalNetworkDiagnostics.stats.byRegion ?? {}).length}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px' }}>VALIDATION</div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: canonicalNetworkDiagnostics.validation?.valid ? '#50c878' : '#ff6420',
                  }}
                >
                  {canonicalNetworkDiagnostics.validation?.errors?.length ?? 0} err /{' '}
                  {canonicalNetworkDiagnostics.validation?.warnings?.length ?? 0} warn
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px' }}>ACTIVE E2E (MAP)</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{roiHubs.length}</div>
              </div>
            </div>
          )}
          {(showFutureHighPopulationHubs ||
            showRareEarthHubs ||
            showRemoteCargoRoutes) && (
            <div
              className="metrics-grid"
              style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(100,200,255,0.15)' }}
            >
              <div style={{ gridColumn: '1 / -1', fontSize: '10px', color: '#ffbe50' }}>
                Planning overlays (not active E2E hubs)
              </div>
              {showFutureHighPopulationHubs && (
                <>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>FUTURE HUBS (VISIBLE)</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffbe50' }}>
                      {visibleFutureHighPopHubs.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>FUTURE W/ COORDS</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffbe50' }}>
                      {futureHubMetrics.totalWithCoordinates}
                    </div>
                  </div>
                </>
              )}
              {(showRareEarthHubs || showExtendedGlobalCoverageNodes) && (
                <>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>RARE EARTH (VISIBLE)</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffe646' }}>
                      {visibleRareEarthHubs.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>W/ COORDS (SEED)</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffe646' }}>
                      {rareEarthMetrics.renderableNodes}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>MISSING COORDS</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#8899cc' }}>
                      {rareEarthMetrics.needsCoordinates}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>GREENLAND / ATLANTIC</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#82dcff' }}>
                      {rareEarthMetrics.greenlandNodes ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>AFRICA REMOTE</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e6b050' }}>
                      {rareEarthMetrics.africaNodes ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>S. AMERICA</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#50c878' }}>
                      {rareEarthMetrics.southAmericaNodes ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>AUSTRALIA</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff7832' }}>
                      {rareEarthMetrics.australiaNodes ?? 0}
                    </div>
                  </div>
                </>
              )}
              {showRemoteCargoRoutes && (
                <>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>CARGO BRANCHES</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff9630' }}>
                      {visibleRemoteCargoPaths.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px' }}>BRANCH MI (PLAN)</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff6420' }}>
                      {Math.round(
                        visibleRemoteCargoPaths.reduce((s, p) => s + (p.distanceMiles || 0), 0)
                      ).toLocaleString()}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {isHyperloopWebMode ? (
            <div className="metrics-grid">
              <div style={{ gridColumn: '1 / -1', fontSize: '11px', color: '#64c8ff' }}>
                Phase 1 Global Hyperloop Web (corridors + crosslinks + feeders)
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>CROSSLINKS</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00dcff' }}>
                  {hyperloopWebStats.crosslinks ?? 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>THROUGH ROUTES</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#be00ff' }}>
                  {hyperloopWebStats.throughRoutes ?? 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>THROUGH ROUTE MI</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#be00ff' }}>
                  {(hyperloopWebStats.throughRouteMiles ?? 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>CONNECTED FEEDER NETS</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#be00ff' }}>
                  {hyperloopWebStats.connectedFeederNetworks ?? 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>INTERCONT. GATEWAYS</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#5078ff' }}>
                  {hyperloopWebStats.intercontinentalGatewayRoutes ?? 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>GATEWAY MI</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#5078ff' }}>
                  {(hyperloopWebStats.intercontinentalGatewayMiles ?? 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>TUNNEL / UNDERSEA GW</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff2850' }}>
                  {hyperloopWebStats.tunnelGatewaySegments ?? 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>FUTURE GW (OFF)</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#8899cc' }}>
                  {hyperloopWebStats.disabledFutureGatewayRoutes ?? 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>TOTAL NODES</div>
                <div className="metric-value-md">{hyperloopWebStats.totalNodes}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>RENDERABLE NODES</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{hyperloopWebStats.totalRenderableNodes}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>TOTAL EDGES</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{hyperloopWebStats.totalEdges}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>RENDERABLE EDGES</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{hyperloopWebStats.totalRenderableEdges}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>SWITCH / SPLIT-OFF</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffb432' }}>
                  {hyperloopWebStats.switchNodes}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>TRUNK LINES</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00dcff' }}>
                  {hyperloopWebStats.trunkLines}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>BRANCH LINES</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ff78' }}>
                  {hyperloopWebStats.branchLines}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>LOCAL FEEDER</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ff78' }}>
                  {hyperloopWebStats.localFeederLines}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>REGIONAL</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00dcff' }}>
                  {hyperloopWebStats.regionalHyperloopLines}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>EXTENDED</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#be5aff' }}>
                  {hyperloopWebStats.extendedHyperloopLines}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>TUNNEL-REQUIRED</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff2840' }}>
                  {hyperloopWebStats.tunnelRequiredLines}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>EST. TUBE MILES</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {hyperloopWebStats.estimatedTubeMiles.toLocaleString()}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setConstructionMetricsCollapsed((c) => !c)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#ff7888',
                    background: 'rgba(255, 40, 80, 0.08)',
                    border: '1px solid rgba(255, 40, 80, 0.25)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <span>Construction classification</span>
                  <span>{constructionMetricsCollapsed ? '▸' : '▾'}</span>
                </button>
              </div>
              {!constructionMetricsCollapsed && (
                <>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>SURFACE</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {hyperloopWebStats.surfaceLines ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>ELEVATED</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {hyperloopWebStats.elevatedLines ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>TUNNEL REQUIRED</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff2840' }}>
                      {hyperloopWebStats.tunnelRequiredLines ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>MOUNTAIN TUNNEL</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff2840' }}>
                      {hyperloopWebStats.mountainTunnelLines ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>UNDERSEA TUNNEL</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff2840' }}>
                      {hyperloopWebStats.underseaTunnelLines ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>URBAN TUNNEL</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff2840' }}>
                      {hyperloopWebStats.urbanTunnelLines ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>ARCTIC ENGINEERING</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#82dcff' }}>
                      {hyperloopWebStats.arcticEngineeringLines ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>DESERT CORRIDOR</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffb432' }}>
                      {hyperloopWebStats.desertCorridorLines ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>EXTREME DIFFICULTY MI</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff2840' }}>
                      {(hyperloopWebStats.extremeDifficultyMiles ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>TOTAL TUNNEL MI</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff2840' }}>
                      {(hyperloopWebStats.totalTunnelMiles ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>SPECIAL CONSTRUCTION</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff9630' }}>
                      {hyperloopWebStats.specialConstructionSegments ?? 0} seg /{' '}
                      {(hyperloopWebStats.specialConstructionMiles ?? 0).toLocaleString()} mi
                    </div>
                  </div>
                </>
              )}
              <div style={{ gridColumn: '1 / -1', fontSize: '11px', color: '#78c8e8', marginTop: '4px' }}>
                Visible map graph audit (matches rendered layers)
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>VISIBLE CONNECTED</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#78c8e8' }}>
                  {visibleHyperloopAudit?.metrics?.connectedNodes ?? 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>VISIBLE DISCONNECTED</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff7888' }}>
                  {visibleHyperloopAudit?.metrics?.disconnectedNodes ?? 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>COMPONENTS</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#78c8e8' }}>
                  {visibleHyperloopAudit?.metrics?.connectedComponents ?? 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>CONNECTIVITY %</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#78c8e8' }}>
                  {visibleHyperloopAudit?.metrics?.connectivityPercent ?? 0}%
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>REPAIR LINKS SHOWN</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#78c8e8' }}>
                  {connectivityRepairPaths.length}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>REPAIR LINKS GENERATED</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#78c8e8' }}>
                  {visibleHyperloopAudit?.metrics?.repairLinksGenerated ??
                    hyperloopWebStats.repairLinks ??
                    0}
                </div>
              </div>
              {visibleDisconnectedNodes.length > 0 && (
                <div style={{ gridColumn: '1 / -1', fontSize: '10px', color: '#ff7888', lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Disconnected (visible):</div>
                  {visibleDisconnectedNodes.slice(0, 5).map((d) => (
                    <div key={d.id}>• {d.name}{d.country ? `, ${d.country}` : ''}</div>
                  ))}
                  {visibleDisconnectedNodes.length > 5 && (
                    <div>…and {visibleDisconnectedNodes.length - 5} more</div>
                  )}
                </div>
              )}
              {showExtendedRuralLayer && (
                <>
                  <div style={{ gridColumn: '1 / -1', fontSize: '11px', color: '#5ab4ff', marginTop: '4px' }}>
                    Extended Rural + Remote Cargo (Phase 3)
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>REMOTE NODES (ON MAP)</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#5ab4ff' }}>
                      {ruralVisibleNodes.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>RENDERABLE REMOTE</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#5ab4ff' }}>
                      {ruralLayerMetrics.renderableNodes}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>NEEDS COORDS</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#8899cc' }}>
                      {ruralLayerMetrics.needsCoordinates}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>CRITICAL MINERALS</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffbe28' }}>
                      {ruralLayerMetrics.criticalMineralsNodes}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>RARE EARTH</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffe646' }}>
                      {ruralLayerMetrics.rareEarthNodes}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>REMOTE BRANCH LINES</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff9630' }}>
                      {ruralLayerMetrics.remoteBranchLines}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>RESOURCE BRANCH MI</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff6420' }}>
                      {(ruralLayerMetrics.resourceCargoBranchMiles ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>AVG BRANCH DIST</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#5ab4ff' }}>
                      {ruralLayerMetrics.avgBranchDistance} mi
                    </div>
                  </div>
                </>
              )}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>ZOOM LEVEL</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{zoom.toFixed(1)}</div>
                {zoom < 2.5 && (
                  <div style={{ marginTop: '6px', fontSize: '10px', color: '#8899cc' }}>
                    Zoom in to 2.5+ to see color-coded corridor infrastructure
                  </div>
                )}
              </div>
            </div>
          ) : selectedOrigin ? (
            <div className="metrics-grid">
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>ANALYSIS LAYER</div>
                <select
                  value={analysisViewMode}
                  onChange={(e) => setAnalysisViewMode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid rgba(100, 200, 255, 0.25)',
                    background: 'rgba(10, 20, 45, 0.9)',
                    color: '#e0e0ff',
                    cursor: 'pointer',
                  }}
                >
                  {ANALYSIS_VIEW_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>SELECTED ORIGIN</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffd700' }}>{selectedOrigin.name}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>STARSHIP DESTINATIONS</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#64c8ff' }}>{starshipRoutes.length}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>LOCAL FEEDER (0–150mi)</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00ff78' }}>{hyperloopStats.local}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>REGIONAL (150–700mi)</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00dcff' }}>{hyperloopStats.regional}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>EXTENDED (700–1400mi)</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#be5aff' }}>{hyperloopStats.extended}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>TRUNK / BRANCH</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {hyperloopStats.trunk} / {hyperloopStats.branch}
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>FEEDER CITIES</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00ff96' }}>{feederStats.count}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>REGIONAL HUBS (≤700mi)</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#64c8ff' }}>{regionalHubsInRadius.length}</div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>AVG FEEDER DIST</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ff96' }}>
                  {feederStats.avgDistance.toFixed(0)} mi
                </div>
              </div>
              <div>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>HYPERLOOP SEGMENTS</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{hyperloopStats.total}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ color: '#8899cc', fontSize: '10px', marginBottom: '4px' }}>ZOOM LEVEL</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{zoom.toFixed(1)}</div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#8899cc', fontSize: '11px', fontStyle: 'italic', lineHeight: 1.45 }}>
              E2E Starship: select an origin hub on the left to view Starship arcs, catchment ring, and
              regional Hyperloop feeders.
            </div>
          )}
          </>
        }
        cityContext={isCivilizationMode || isE2MMode ? null : feederCityInfo}
        selectedLocationPanel={
          selectedLocation && (isCivilizationMode || isE2MMode) ? (
            <SelectedLocationPanel
              selectedLocation={selectedLocation}
              integratedGraph={integratedGraph}
              connectedEdges={selectedConnectedEdges}
              connectedNodes={selectedConnectedNodes}
              allNodes={integratedGraph.nodes}
              diagnostics={integratedDiagnosticsEnriched}
              graphError={integratedGraph.error}
              visibleNodeCount={integratedRenderView.visibleNodes.length}
              visibleEdgeCount={integratedRenderView.visibleEdges.length}
              onSaveDestination={handleSaveIntegratedDestination}
              onAddToScenario={handleAddIntegratedScenario}
              onClose={() => setSelectedCity(null)}
            />
          ) : null
        }
        origin={selectedOrigin}
        onCloseContext={() => setSelectedCity(null)}
        legendProps={{
          mapDisplayMode,
          layerState,
          hyperloopWebHelper: HYPERLOOP_WEB_HELPER,
        }}
        isMobileLayout={isMobileLayout}
        mobileSheet={mobileSheet}
        onMobileSheetChange={setMobileSheet}
      />
    </div>
  );
}
