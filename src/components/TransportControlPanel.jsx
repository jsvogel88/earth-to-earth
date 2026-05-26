import React, { useState } from 'react';
import {
  normalizeTransportMode,
  isE2EStarshipMode,
  isHyperloopCoreMode,
  isE2MOrbitalMode,
  isCivilizationGridMode,
  isRobotaxiMode,
} from '../data/transportOperatingSystem.js';
import {
  LAYER_GROUPS,
  GROUP_SECTION_TITLES,
  SIDEBAR_GROUP_ORDER,
  getTransportModeLayers,
  getLayersByGroup,
} from '../layers/layerRegistry.js';
import {
  INTEGRATED_VIEW_FOCUS,
  INTEGRATED_VIEW_FOCUS_LABELS,
  getViewFocusLayerPatch,
} from '../ui/integratedGridFilters.js';
import { SIMPLE_VIEW_BUTTONS } from '../ui/integratedMapLegend.js';
import { TRANSPORT_MODES } from '../data/transportOperatingSystem.js';
import SelectedLocationPanel from './pmos/SelectedLocationPanel.jsx';
import IntegratedGridDiagnostics from './pmos/IntegratedGridDiagnostics.jsx';
import { EXTENDED_RURAL_LAYER_LABEL } from '../data/extendedRuralNetwork.js';
import '../styles/transport-control-panel.css';

function Section({ title, children, defaultOpen = true, collapsible = true, helper }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`transport-os-section ${open ? '' : 'collapsed'}`}>
      {collapsible ? (
        <button
          type="button"
          className="transport-os-section-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span>{title}</span>
          <span aria-hidden>{open ? '−' : '+'}</span>
        </button>
      ) : (
        <div className="transport-os-section-title">{title}</div>
      )}
      {(!collapsible || open) && (
        <div className="transport-os-section-body">
          {helper && <p className="transport-os-helper">{helper}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

function LayerCheck({ layerKey, label, layerState, setLayerFlag, disabled, description }) {
  const on = Boolean(layerState[layerKey]);
  return (
    <label
      className={`transport-os-check ${on ? 'is-on' : ''}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
      title={description || ''}
    >
      <input
        type="checkbox"
        data-testid={`layer-toggle-${layerKey}`}
        checked={on}
        disabled={disabled}
        onChange={(e) => setLayerFlag(layerKey, e.target.checked)}
      />
      {label}
    </label>
  );
}

function RegistryGroupSection({
  groupId,
  layerState,
  setLayerFlag,
  defaultOpen,
  labelOverrides = {},
}) {
  const layers = getLayersByGroup(groupId);
  if (!layers.length) return null;

  return (
    <Section title={GROUP_SECTION_TITLES[groupId]} defaultOpen={defaultOpen}>
      {layers.map((layer) => (
        <LayerCheck
          key={layer.id}
          layerKey={layer.stateKey}
          label={labelOverrides[layer.id] || layer.label}
          layerState={layerState}
          setLayerFlag={setLayerFlag}
          disabled={layer.disabled}
          description={layer.description}
        />
      ))}
    </Section>
  );
}

const GROUP_DEFAULT_OPEN = {
  [LAYER_GROUPS.TRANSPORT_MODES]: true,
  [LAYER_GROUPS.INFRASTRUCTURE]: false,
  [LAYER_GROUPS.SPACE_E2M]: false,
  [LAYER_GROUPS.AUTONOMOUS_MOBILITY]: false,
  [LAYER_GROUPS.PLANNING_TOOLS]: false,
  [LAYER_GROUPS.CARGO_RESOURCE]: false,
  [LAYER_GROUPS.VISUALIZATION]: false,
  [LAYER_GROUPS.DEBUG_DEV]: false,
};

export default function TransportControlPanel({
  mapDisplayMode,
  onMapModeChange,
  layerState,
  setLayerFlag,
  resetView,
  metricsCollapsed,
  onToggleMetricsCollapsed,
  hyperloopWebHelper,
  extendedRuralHelper,
  zoom,
  remoteVisibleMinZoom,
  customDestinationCount = 0,
  hideModeSelector = false,
  compactHeader = false,
  onApplyViewFocus,
  selectedLocation = null,
  connectedEdges = [],
  connectedNodes = [],
  allNodes = [],
  integratedDiagnostics = null,
  integratedGraph = null,
  integratedGraphError = null,
  onSaveDestination,
  onAddToScenario,
  onCloseSelectedLocation,
}) {
  const mode = normalizeTransportMode(mapDisplayMode);
  const isHyperloop = isHyperloopCoreMode(mode);
  const isE2E = isE2EStarshipMode(mode);
  const isE2M = isE2MOrbitalMode(mode);
  const isCiv = isCivilizationGridMode(mode);
  const isRobotaxi = isRobotaxiMode(mode);
  const transportModes = getTransportModeLayers();
  const activeViewFocus =
    layerState.integratedViewFocus ?? INTEGRATED_VIEW_FOCUS.INTEGRATED_GRID;

  const openForGroup = (groupId) => {
    if (groupId === LAYER_GROUPS.TRANSPORT_MODES) return true;
    if (groupId === LAYER_GROUPS.INFRASTRUCTURE) return isHyperloop || isE2M;
    if (groupId === LAYER_GROUPS.SPACE_E2M) return isE2M;
    if (groupId === LAYER_GROUPS.AUTONOMOUS_MOBILITY) return isRobotaxi;
    if (groupId === LAYER_GROUPS.PLANNING_TOOLS) return isCiv || customDestinationCount > 0;
    return GROUP_DEFAULT_OPEN[groupId] ?? false;
  };

  const sidebarGroups = SIDEBAR_GROUP_ORDER.filter((gid) => {
    if (gid === LAYER_GROUPS.INFRASTRUCTURE) return isHyperloop || isE2M;
    if (gid === LAYER_GROUPS.SPACE_E2M) return isE2M;
    if (gid === LAYER_GROUPS.AUTONOMOUS_MOBILITY) return isRobotaxi || layerState.showRobotaxiLayer;
    return true;
  });

  const applyFocus = (focus) => {
    if (onApplyViewFocus) {
      onApplyViewFocus(focus);
      return;
    }
    const patch = getViewFocusLayerPatch(focus);
    Object.entries(patch).forEach(([key, value]) => setLayerFlag(key, value));
    if (!isCiv) {
      if (focus === INTEGRATED_VIEW_FOCUS.E2E) onMapModeChange(TRANSPORT_MODES.E2E_STARSHIP);
      else if (
        focus === INTEGRATED_VIEW_FOCUS.E2M ||
        focus === INTEGRATED_VIEW_FOCUS.MINING_INDUSTRIAL
      ) {
        onMapModeChange(TRANSPORT_MODES.E2M_ORBITAL);
      } else if (focus === INTEGRATED_VIEW_FOCUS.HYPERLOOP) {
        onMapModeChange(TRANSPORT_MODES.HYPERLOOP_CORE);
      } else if (focus === INTEGRATED_VIEW_FOCUS.AUTO) {
        onMapModeChange(TRANSPORT_MODES.ROBOTAXI);
      }
    }
  };

  const useSimpleSidebar = isCiv && !hideModeSelector;

  return (
    <div data-testid="transport-control-panel">
      {!compactHeader && (
        <div className="panel-row-header">
          <h2>{useSimpleSidebar ? 'MAP' : hideModeSelector ? 'LAYERS' : 'LAYER CONTROLS'}</h2>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {onToggleMetricsCollapsed && (
              <button type="button" className="panel-collapse-btn" onClick={onToggleMetricsCollapsed}>
                {metricsCollapsed ? 'Expand' : 'Collapse'}
              </button>
            )}
            {resetView && (
              <button type="button" className="panel-collapse-btn" onClick={resetView}>
                Reset
              </button>
            )}
          </div>
        </div>
      )}
      <div className="ui-panel-metrics-body">
        {useSimpleSidebar ? (
          <>
            <Section title="View" collapsible={false} defaultOpen>
              <div className="transport-os-view-grid">
                {SIMPLE_VIEW_BUTTONS.map(({ focus, label }) => (
                  <button
                    key={focus}
                    type="button"
                    data-testid={`view-focus-${focus}`}
                    className={`transport-os-view-btn ${
                      activeViewFocus === focus ? 'is-active' : ''
                    }`}
                    onClick={() => applyFocus(focus)}
                    title={INTEGRATED_VIEW_FOCUS_LABELS[focus] ?? label}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="transport-os-helper" style={{ marginTop: 8 }}>
                Cyan lines = ground tube spine. Gold arcs = E2E jumps. Orange = mining logistics.
              </p>
            </Section>

            <Section title="Selected" defaultOpen={Boolean(selectedLocation)}>
              <SelectedLocationPanel
                selectedLocation={selectedLocation}
                integratedGraph={integratedGraph}
                connectedEdges={connectedEdges}
                connectedNodes={connectedNodes}
                allNodes={allNodes}
                diagnostics={integratedDiagnostics}
                graphError={integratedGraphError}
                onSaveDestination={onSaveDestination}
                onAddToScenario={onAddToScenario}
                onClose={onCloseSelectedLocation}
              />
            </Section>

            <Section title="Advanced" defaultOpen={false}>
              <Section title="Filters" defaultOpen={false}>
                <LayerCheck
                  layerKey="showIntegratedHyperloop"
                  label="Hyperloop spine"
                  layerState={layerState}
                  setLayerFlag={setLayerFlag}
                />
                <LayerCheck
                  layerKey="showIntegratedE2E"
                  label="E2E global"
                  layerState={layerState}
                  setLayerFlag={setLayerFlag}
                />
                <LayerCheck
                  layerKey="showIntegratedE2M"
                  label="Mining / E2M"
                  layerState={layerState}
                  setLayerFlag={setLayerFlag}
                />
                <LayerCheck
                  layerKey="showIntegratedLoop"
                  label="Local loop"
                  layerState={layerState}
                  setLayerFlag={setLayerFlag}
                />
                <LayerCheck
                  layerKey="showFeederRoutesFilter"
                  label="Feeder routes"
                  layerState={layerState}
                  setLayerFlag={setLayerFlag}
                />
                <LayerCheck
                  layerKey="showPopulation1MPlusOnly"
                  label="Cities 1M+"
                  layerState={layerState}
                  setLayerFlag={setLayerFlag}
                />
              </Section>

              {sidebarGroups
                .filter((gid) => gid !== LAYER_GROUPS.TRANSPORT_MODES)
                .map((groupId) => (
                  <RegistryGroupSection
                    key={groupId}
                    groupId={groupId}
                    layerState={layerState}
                    setLayerFlag={setLayerFlag}
                    defaultOpen={false}
                    labelOverrides={{ extended_rural: EXTENDED_RURAL_LAYER_LABEL }}
                  />
                ))}

              <Section title="Debug" defaultOpen={false}>
                {integratedDiagnostics && (
                  <IntegratedGridDiagnostics
                    diagnostics={integratedDiagnostics}
                    error={integratedGraphError}
                    visibleNodeCount={
                      integratedDiagnostics.renderedVisibleNodeCount ??
                      integratedGraph?.visibleNodes?.length
                    }
                    visibleEdgeCount={
                      integratedDiagnostics.renderedVisibleEdgeCount ??
                      integratedGraph?.visibleEdges?.length
                    }
                    zoomTier={integratedDiagnostics.currentZoomTier}
                  />
                )}
              </Section>
            </Section>
          </>
        ) : (
          <>
            {!hideModeSelector && (
              <Section title={GROUP_SECTION_TITLES[LAYER_GROUPS.TRANSPORT_MODES]} collapsible={false}>
                <div className="transport-os-mode-row">
                  {transportModes.map((layer) => {
                    const m = layer.transportMode;
                    const active = mode === m;
                    const short = m
                      .replace('Hyperloop Core Web', 'Hyperloop')
                      .replace('E2E Starship', 'E2E')
                      .replace('E2M Orbital Logistics', 'E2M')
                      .replace('Civilization Grid', 'Grid')
                      .replace('Robotaxi / Autonomous Mobility', 'Robotaxi');
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        data-testid={`mode-btn-${layer.id}`}
                        className={`transport-os-mode-btn ${active ? 'is-active' : ''}`}
                        onClick={() => onMapModeChange(m)}
                        title={layer.description || ''}
                      >
                        {short}
                      </button>
                    );
                  })}
                </div>
                {isHyperloop && <p className="transport-os-helper">{hyperloopWebHelper}</p>}
              </Section>
            )}

            {(isCiv || isE2M || isE2E) && (
              <Section title="View" defaultOpen={isCiv}>
                <div className="transport-os-view-grid">
                  {SIMPLE_VIEW_BUTTONS.map(({ focus, label }) => (
                    <button
                      key={focus}
                      type="button"
                      data-testid={`view-focus-${focus}`}
                      className={`transport-os-view-btn ${
                        activeViewFocus === focus ? 'is-active' : ''
                      }`}
                      onClick={() => applyFocus(focus)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Selected" defaultOpen={Boolean(selectedLocation)}>
              <SelectedLocationPanel
                selectedLocation={selectedLocation}
                integratedGraph={integratedGraph}
                connectedEdges={connectedEdges}
                connectedNodes={connectedNodes}
                allNodes={allNodes}
                diagnostics={integratedDiagnostics}
                graphError={integratedGraphError}
                onSaveDestination={onSaveDestination}
                onAddToScenario={onAddToScenario}
                onClose={onCloseSelectedLocation}
              />
            </Section>

            {sidebarGroups
              .filter((gid) => gid !== LAYER_GROUPS.TRANSPORT_MODES)
              .map((groupId) => (
                <RegistryGroupSection
                  key={groupId}
                  groupId={groupId}
                  layerState={layerState}
                  setLayerFlag={setLayerFlag}
                  defaultOpen={openForGroup(groupId)}
                  labelOverrides={{ extended_rural: EXTENDED_RURAL_LAYER_LABEL }}
                />
              ))}
          </>
        )}

        {isE2E && !useSimpleSidebar && (
          <p className="transport-os-helper">
            Manage E2E hubs in the Network Control Center (left panel).
          </p>
        )}
      </div>
    </div>
  );
}
