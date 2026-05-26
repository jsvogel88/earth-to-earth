import React from 'react';
import TopCommandBar from './TopCommandBar.jsx';
import MissionDock from './MissionDock.jsx';
import ContextPanel from './ContextPanel.jsx';
import TimelineBar from './TimelineBar.jsx';
import DynamicLegend from './DynamicLegend.jsx';
import { getTransportModeUI, getModeThemeClass } from '../../ui/transportModeRegistry.js';
import { DEFAULT_SIMULATION_YEAR } from '../../ui/simulationTimeline.js';
import '../../styles/pmos-design-system.css';
import '../../styles/pmos-shell.css';

export default function PlanetaryMobilityShell({
  mapDisplayMode,
  onMapModeChange,
  hubs,
  onSearchSelect,
  onFlyTo,
  showMetrics,
  onToggleMetrics,
  metricOverlays,
  onToggleMetricOverlay,
  onResetView,
  layoutMode,
  onLayoutModeChange,
  layoutModeLabels,
  simulationYear = DEFAULT_SIMULATION_YEAR,
  onSimulationYearChange,
  dockSection,
  onDockSectionChange,
  layersContent,
  plannerContent,
  routesContent,
  destinationsContent,
  simulationsContent,
  settingsContent,
  metricsContent,
  cityContext,
  selectedLocationPanel,
  origin,
  onCloseContext,
  legendProps,
  isMobileLayout,
  mobileSheet,
  onMobileSheetChange,
  children,
}) {
  const modeUI = getTransportModeUI(mapDisplayMode);
  const themeClass = getModeThemeClass(modeUI.themeId);

  return (
    <div className={`pmos-overlay pmos-active pmos-root ${themeClass}`} data-testid="pmos-shell">
      <TopCommandBar
        mapDisplayMode={mapDisplayMode}
        onMapModeChange={onMapModeChange}
        hubs={hubs}
        onSearchSelect={onSearchSelect}
        onFlyTo={onFlyTo}
        showMetrics={showMetrics}
        onToggleMetrics={onToggleMetrics}
        metricOverlays={metricOverlays}
        onToggleMetricOverlay={onToggleMetricOverlay}
        onResetView={onResetView}
        layoutMode={layoutMode}
        onLayoutModeChange={onLayoutModeChange}
        layoutModes={layoutModeLabels}
      />

      <p className="pmos-mode-tagline pmos-glass" style={{ padding: '4px 16px', border: 'none', boxShadow: 'none' }}>
        {modeUI.tagline}
      </p>

      <MissionDock
        activeSection={dockSection}
        onSectionChange={onDockSectionChange}
        layersContent={layersContent}
        plannerContent={plannerContent}
        routesContent={routesContent}
        destinationsContent={destinationsContent}
        simulationsContent={simulationsContent}
        settingsContent={settingsContent}
        isMobileOpen={isMobileLayout && mobileSheet === 'dock'}
        mobileSection={mobileSheet}
      />

      <div className={`pmos-metrics-drawer pmos-glass ${showMetrics ? '' : 'is-hidden'}`}>
        <div className="panel-row-header" style={{ marginBottom: 6 }}>
          <span className="pmos-label">Network metrics</span>
          <button type="button" className="pmos-btn" onClick={onToggleMetrics}>
            Close
          </button>
        </div>
        <div className="pmos-metrics-drawer-body">{metricsContent}</div>
      </div>

      {selectedLocationPanel}

      {!selectedLocationPanel && cityContext && (
        <ContextPanel
          cityInfo={cityContext}
          origin={origin}
          mapDisplayMode={mapDisplayMode}
          onClose={onCloseContext}
        />
      )}

      {legendProps && <DynamicLegend {...legendProps} />}

      <TimelineBar year={simulationYear} onYearChange={onSimulationYearChange} />

      {children}

      {isMobileLayout && (
        <nav className="pmos-mobile-nav" aria-label="Mobile panels">
          {[
            { id: 'dock', label: 'Dock' },
            { id: 'metrics', label: 'Metrics' },
            { id: 'search', label: 'Search' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={mobileSheet === id ? 'is-active' : ''}
              onClick={() => onMobileSheetChange?.(mobileSheet === id ? null : id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
