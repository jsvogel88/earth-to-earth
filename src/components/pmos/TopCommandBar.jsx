import React from 'react';
import GlobalSearch from './GlobalSearch.jsx';
import {
  getTransportModeUIList,
  getModeThemeClass,
  METRIC_OVERLAY_REGISTRY,
} from '../../ui/transportModeRegistry.js';

export default function TopCommandBar({
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
  layoutModes,
}) {
  const modes = getTransportModeUIList();

  return (
    <header className="pmos-command-bar pmos-glass" data-testid="pmos-command-bar">
      <div className="pmos-command-bar-brand">
        <strong>Planetary Mobility OS</strong>
        <span>Infrastructure command</span>
      </div>

      <div className="pmos-command-search-wrap">
        <GlobalSearch hubs={hubs} onSelectResult={onSearchSelect} onFlyTo={onFlyTo} />
      </div>

      <div className="pmos-command-bar-modes" role="tablist" aria-label="Transport systems">
        {modes.map((cfg) => {
          const active = mapDisplayMode === cfg.mode;
          return (
            <button
              key={cfg.registryId}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`pmos-mode-${cfg.registryId}`}
              className={`pmos-mode-btn ${getModeThemeClass(cfg.themeId)} ${active ? 'is-active' : ''}`}
              title={cfg.tagline}
              onClick={() => onMapModeChange(cfg.mode)}
            >
              <span aria-hidden>{cfg.icon} </span>
              {cfg.shortLabel}
            </button>
          );
        })}
      </div>

      <div className="pmos-command-bar-actions">
        <button
          type="button"
          className={`pmos-btn ${showMetrics ? 'is-active' : ''}`}
          onClick={onToggleMetrics}
          title="Network metrics"
        >
          Metrics
        </button>
        {METRIC_OVERLAY_REGISTRY.slice(0, 3).map((m) => (
          <button
            key={m.id}
            type="button"
            className={`pmos-btn ${metricOverlays?.[m.id] ? 'is-active' : ''}`}
            title={m.label}
            onClick={() => onToggleMetricOverlay?.(m.id)}
          >
            {m.icon}
          </button>
        ))}
        <button type="button" className="pmos-btn" onClick={onResetView} title="Reset camera">
          Reset
        </button>
        {layoutModes && onLayoutModeChange && (
          <select
            className="pmos-btn"
            value={layoutMode}
            onChange={(e) => onLayoutModeChange(e.target.value)}
            aria-label="Viewport layout"
            style={{ paddingRight: 4 }}
          >
            {Object.entries(layoutModes).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        )}
      </div>
    </header>
  );
}
