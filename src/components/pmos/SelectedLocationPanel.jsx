import React, { useMemo } from 'react';
import {
  getConnectedEdgesForLocation,
  getConnectedNodesFromEdges,
  resolveNodeDisplayName,
  findNearbyMineralHubs,
  isMineralHubPayload,
  deriveDisplayModes,
} from '../../ui/resolveSelectedLocation.js';
import { MODE_REGISTRY } from '../../modes/modeRegistry.js';
import IntegratedGridDiagnostics from './IntegratedGridDiagnostics.jsx';
import { INTEGRATED_MAP_LEGEND } from '../../ui/integratedMapLegend.js';
import StarbaseDetailCard from './StarbaseDetailCard.jsx';
import { formatModeLabelForUI } from '../../ui/re2eDisplayLabels.js';
import { countOffWorldStarbaseHubs } from '../../data/starbaseHubs.js';

const MODE_CHIP_COLORS = {
  auto: MODE_REGISTRY.auto?.color ?? '#7dff9a',
  loop: MODE_REGISTRY.loop?.color ?? '#00dcff',
  e2e: MODE_REGISTRY.e2e?.color ?? '#d4af37',
  e2m: MODE_REGISTRY.e2m?.color ?? '#ff6b35',
  hyperloop: MODE_REGISTRY.hyperloop?.color ?? '#00dcff',
};

function formatPopulation(pop) {
  if (pop == null) return '—';
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${Math.round(pop / 1000)}K`;
  return String(pop);
}

function formatModeLabel(mode) {
  return formatModeLabelForUI(mode);
}

function ModeChips({ modes }) {
  if (!modes?.length) return <span className="pmos-subtitle">None</span>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
      {modes.map((m) => (
        <span
          key={m}
          className="pmos-chip"
          style={{ borderColor: MODE_CHIP_COLORS[m] ?? '#8899cc', color: MODE_CHIP_COLORS[m] }}
        >
          ✓ {formatModeLabel(m)}
        </span>
      ))}
    </div>
  );
}

function groupEdgesByMode(edges) {
  const groups = {};
  for (const edge of edges ?? []) {
    const mode = edge.mode ?? 'other';
    if (!groups[mode]) groups[mode] = [];
    groups[mode].push(edge);
  }
  return groups;
}

function groupE2MEdgesByRouteType(edges) {
  const groups = { feeder: [], resource: [], industrial: [], other: [] };
  for (const edge of edges ?? []) {
    if ((edge.mode ?? edge.edgeMode) !== 'e2m') continue;
    const rt = edge.route_type ?? edge.routeType ?? 'other';
    if (rt === 'feeder') groups.feeder.push(edge);
    else if (rt === 'resource') groups.resource.push(edge);
    else if (rt === 'industrial') groups.industrial.push(edge);
    else groups.other.push(edge);
  }
  return groups;
}

function CityLocationView({ location, connectedEdges, connectedNodes, allNodes, mineralHubs }) {
  const displayModes = useMemo(
    () => deriveDisplayModes(location, connectedEdges),
    [location, connectedEdges]
  );
  const nearbyMineral = useMemo(
    () => findNearbyMineralHubs(location, mineralHubs),
    [location, mineralHubs]
  );
  const edgeGroups = useMemo(() => groupEdgesByMode(connectedEdges), [connectedEdges]);
  const e2mEdges = connectedEdges.filter((e) => e.mode === 'e2m');

  const nodeTypeLabel = location.transfer_hub
    ? 'Transfer Hub'
    : location.locationType === 'e2e_hub' || location.isE2EHub
      ? 'E2E Hub'
      : 'City';

  const supportLabels = [
    location.auto_enabled && 'Auto City',
    location.loop_enabled && 'Loop City',
    location.hyperloop_connected && 'Hyperloop Hub',
  ].filter(Boolean);

  return (
    <>
      <div className="pmos-label pmos-mode-accent">City / Hub</div>
      <h2 className="pmos-title" style={{ marginTop: 4, marginBottom: 2 }}>
        {location.name}
      </h2>
      <p className="pmos-subtitle">
        {[location.country, location.region].filter(Boolean).join(' · ')}
      </p>

      <div style={{ marginTop: 12 }}>
        <span className="pmos-label">Node type</span>
        <p style={{ fontSize: 13, margin: '4px 0 0' }}>
          {nodeTypeLabel}
          {supportLabels.length ? ` · ${supportLabels.join(' · ')}` : ''}
        </p>
      </div>

      <div style={{ marginTop: 10 }}>
        <span className="pmos-label">Population</span>
        <p style={{ fontSize: 13, margin: '4px 0 0' }}>
          {formatPopulation(location.metro_population ?? location.population)}
          {location.e2e_eligible ? ' · 1M+ eligible' : ''}
        </p>
      </div>

      <div style={{ marginTop: 10 }}>
        <span className="pmos-label">Modes available</span>
        <ModeChips modes={displayModes} />
      </div>

      {Object.keys(edgeGroups).length > 0 && (
        <div style={{ marginTop: 12 }}>
          <span className="pmos-label">Connected routes</span>
          {Object.entries(edgeGroups).map(([mode, list]) => (
            <p key={mode} className="pmos-subtitle" style={{ margin: '4px 0 0' }} data-testid={`route-count-${mode}`}>
              {formatModeLabel(mode)}: {list.length} route{list.length !== 1 ? 's' : ''}
            </p>
          ))}
        </div>
      )}

      {e2mEdges.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <span className="pmos-label">Connected E2M routes</span>
          <p className="pmos-subtitle" style={{ margin: '4px 0 0' }}>
            {e2mEdges.length} feeder / resource / industrial
          </p>
        </div>
      )}

      {nearbyMineral.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <span className="pmos-label">Nearby E2M hubs</span>
          <p className="pmos-subtitle" style={{ margin: '4px 0 0' }}>
            {nearbyMineral.map((h) => h.name).join(' · ')}
          </p>
        </div>
      )}

      {connectedNodes.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <span className="pmos-label">Connected nodes</span>
          <p className="pmos-subtitle" style={{ margin: '4px 0 0' }}>
            {connectedNodes
              .slice(0, 6)
              .map((n) => n.name)
              .filter(Boolean)
              .join(' · ')}
            {connectedNodes.length > 6 ? ' …' : ''}
          </p>
        </div>
      )}
    </>
  );
}

function MineralHubView({ location, connectedEdges, allNodes }) {
  const displayModes = useMemo(
    () => deriveDisplayModes(location, connectedEdges),
    [location, connectedEdges]
  );
  const e2mGroups = useMemo(
    () => groupE2MEdgesByRouteType(connectedEdges),
    [connectedEdges]
  );

  return (
    <>
      <div className="pmos-label" style={{ color: MODE_CHIP_COLORS.e2m }}>
        E2M Mineral Hub
      </div>
      <h2 className="pmos-title" style={{ marginTop: 4, marginBottom: 2 }}>
        {location.name}
      </h2>
      <p className="pmos-subtitle">
        {[location.country, location.region].filter(Boolean).join(' · ')}
      </p>

      <div style={{ marginTop: 12 }}>
        <span className="pmos-label">Minerals</span>
        <p style={{ fontSize: 13, margin: '4px 0 0' }}>{location.mineral_type ?? '—'}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        <div>
          <span className="pmos-label">Strategic score</span>
          <p style={{ fontSize: 13 }}>{location.strategic_score ?? '—'}</p>
        </div>
        <div>
          <span className="pmos-label">Remote score</span>
          <p style={{ fontSize: 13 }}>{location.remote_score ?? '—'}</p>
        </div>
        <div>
          <span className="pmos-label">Production</span>
          <p style={{ fontSize: 13 }}>{location.production_status ?? '—'}</p>
        </div>
        <div>
          <span className="pmos-label">Coordinates</span>
          <p style={{ fontSize: 13 }}>{location.coordinate_confidence ?? '—'}</p>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <span className="pmos-label">Modes available</span>
        <ModeChips modes={displayModes} />
      </div>

      <div style={{ marginTop: 12 }}>
        <span className="pmos-label">Nearest support city</span>
        <p style={{ fontSize: 13, margin: '4px 0 0' }} data-testid="nearest-support-city">
          {resolveNodeDisplayName(location.nearest_support_city, allNodes)}
        </p>
        <span className="pmos-label" style={{ marginTop: 8, display: 'block' }}>
          Nearest port
        </span>
        <p style={{ fontSize: 13, margin: '4px 0 0' }} data-testid="nearest-port">
          {resolveNodeDisplayName(location.nearest_port, allNodes)}
        </p>
        <span className="pmos-label" style={{ marginTop: 8, display: 'block' }}>
          Nearest E2E hub
        </span>
        <p style={{ fontSize: 13, margin: '4px 0 0' }} data-testid="nearest-e2e-hub">
          {resolveNodeDisplayName(location.nearest_e2e_hub, allNodes)}
        </p>
      </div>

      {(e2mGroups.feeder.length > 0 ||
        e2mGroups.resource.length > 0 ||
        e2mGroups.industrial.length > 0) && (
        <div style={{ marginTop: 10 }} data-testid="e2m-route-breakdown">
          <span className="pmos-label">E2M routes</span>
          {e2mGroups.feeder.length > 0 && (
            <p className="pmos-subtitle" style={{ margin: '4px 0 0' }}>
              Feeder: {e2mGroups.feeder.length}
            </p>
          )}
          {e2mGroups.resource.length > 0 && (
            <p className="pmos-subtitle" style={{ margin: '4px 0 0' }}>
              Resource: {e2mGroups.resource.length}
            </p>
          )}
          {e2mGroups.industrial.length > 0 && (
            <p className="pmos-subtitle" style={{ margin: '4px 0 0' }}>
              Industrial: {e2mGroups.industrial.length}
            </p>
          )}
        </div>
      )}

      <p className="pmos-subtitle" style={{ marginTop: 12, lineHeight: 1.45 }}>
        This hub feeds {location.mineral_type ?? 'strategic minerals'} into the industrial grid
        through regional feeder routes and major E2E / Hyperloop nodes.
      </p>
    </>
  );
}

export default function SelectedLocationPanel({
  selectedLocation,
  integratedGraph = null,
  connectedEdges: connectedEdgesProp,
  connectedNodes: connectedNodesProp,
  allNodes: allNodesProp,
  diagnostics = null,
  graphError = null,
  visibleNodeCount,
  visibleEdgeCount,
  onSaveDestination,
  onSaveRoute,
  onAddToScenario,
  onClose,
}) {
  const graphNodes = integratedGraph?.nodes ?? allNodesProp ?? [];
  const graphEdges = integratedGraph?.edges ?? [];

  const connectedEdges = useMemo(() => {
    if (connectedEdgesProp != null) return connectedEdgesProp;
    if (!selectedLocation) return [];
    return getConnectedEdgesForLocation(selectedLocation, graphEdges);
  }, [connectedEdgesProp, selectedLocation, graphEdges]);

  const connectedNodes = useMemo(() => {
    if (connectedNodesProp != null) return connectedNodesProp;
    return getConnectedNodesFromEdges(connectedEdges, graphNodes);
  }, [connectedNodesProp, connectedEdges, graphNodes]);

  const panelDiagnostics = diagnostics ?? integratedGraph?.diagnostics ?? null;
  const panelError = graphError ?? integratedGraph?.error ?? null;
  const offWorldPending = countOffWorldStarbaseHubs();

  if (!selectedLocation) {
    return (
      <div className="selected-location-panel" data-testid="selected-location-panel-empty">
        <p className="pmos-subtitle" style={{ lineHeight: 1.5, marginBottom: 10 }}>
          Click a city, hub, mine, or route on the map.
        </p>
        <ul
          className="integrated-map-legend"
          data-testid="integrated-map-legend"
          style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 11, lineHeight: 1.5 }}
        >
          {INTEGRATED_MAP_LEGEND.map((item) => (
            <li key={item.label} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: item.color,
                  flexShrink: 0,
                  marginTop: 3,
                }}
              />
              <span style={{ color: '#8899cc' }}>{item.label}</span>
            </li>
          ))}
          {offWorldPending > 0 && (
            <li style={{ marginTop: 8, color: '#b8a8ff', fontSize: 10 }}>
              Off-World System Pending: {offWorldPending} hub
              {offWorldPending === 1 ? '' : 's'} (orbit / moon / mars) — Planet View later
            </li>
          )}
        </ul>
        <IntegratedGridDiagnostics
          diagnostics={panelDiagnostics}
          error={panelError}
          visibleNodeCount={visibleNodeCount ?? integratedGraph?.visibleNodes?.length}
          visibleEdgeCount={visibleEdgeCount ?? integratedGraph?.visibleEdges?.length}
          zoomTier={panelDiagnostics?.currentZoomTier}
        />
      </div>
    );
  }

  const isMineral = isMineralHubPayload(selectedLocation);
  const isStarbase = Boolean(selectedLocation?.isStarbaseHub);

  return (
    <aside
      className="pmos-context-panel selected-location-panel pmos-glass-strong pmos-animate-in-right"
      data-testid="selected-location-panel"
      aria-label="Selected location"
    >
      {onClose && !isStarbase && (
        <button type="button" className="pmos-context-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}

      {isStarbase ? (
        <StarbaseDetailCard hub={selectedLocation.starbaseDetail ?? selectedLocation} onClose={onClose} />
      ) : isMineral ? (
        <MineralHubView
          location={selectedLocation}
          connectedEdges={connectedEdges}
          allNodes={graphNodes}
        />
      ) : (
        <CityLocationView
          location={selectedLocation}
          connectedEdges={connectedEdges}
          connectedNodes={connectedNodes}
          allNodes={graphNodes}
          mineralHubs={graphNodes.filter((n) => n.mineral_hub_id)}
        />
      )}

      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {onSaveDestination && (
          <button type="button" className="pmos-btn" onClick={() => onSaveDestination(selectedLocation)}>
            Save destination
          </button>
        )}
        {onAddToScenario && (
          <button type="button" className="pmos-btn" onClick={() => onAddToScenario(selectedLocation)}>
            Add to scenario
          </button>
        )}
        {onSaveRoute && connectedEdges[0] && (
          <button type="button" className="pmos-btn" onClick={() => onSaveRoute(connectedEdges[0])}>
            Save route
          </button>
        )}
      </div>

      <IntegratedGridDiagnostics
        diagnostics={panelDiagnostics}
        error={panelError}
        visibleNodeCount={visibleNodeCount ?? integratedGraph?.visibleNodes?.length}
        visibleEdgeCount={visibleEdgeCount ?? integratedGraph?.visibleEdges?.length}
        zoomTier={panelDiagnostics?.currentZoomTier}
      />
    </aside>
  );
}
