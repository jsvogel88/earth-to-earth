import React, { useState } from 'react';
import { MISSION_DOCK_SECTIONS } from '../../ui/transportModeRegistry.js';

export default function MissionDock({
  activeSection,
  onSectionChange,
  layersContent,
  plannerContent,
  routesContent,
  destinationsContent,
  simulationsContent,
  settingsContent,
  isMobileOpen,
  mobileSection,
}) {
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);

  const section = activeSection || 'layers';

  const contentBySection = {
    layers: layersContent,
    planner: plannerContent,
    routes: routesContent,
    destinations: destinationsContent,
    simulations: simulationsContent,
    settings: settingsContent,
  };

  const panelContent = contentBySection[section];

  const dockClass = [
    'pmos-mission-dock',
    expanded || pinned || isMobileOpen ? 'is-expanded' : '',
    pinned ? 'is-pinned' : '',
    isMobileOpen ? 'is-mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={dockClass} data-testid="pmos-mission-dock" aria-label="Mission dock">
      <nav className="pmos-dock-rail pmos-glass" aria-label="Dock sections">
        {MISSION_DOCK_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`pmos-dock-rail-btn ${section === s.id || mobileSection === s.id ? 'is-active' : ''}`}
            title={s.label}
            aria-label={s.label}
            onClick={() => {
              onSectionChange?.(s.id);
              setExpanded(true);
            }}
            onMouseEnter={() => {
              if (!pinned) setExpanded(true);
            }}
          >
            <span aria-hidden>{s.icon}</span>
          </button>
        ))}
        <button
          type="button"
          className={`pmos-dock-rail-btn ${pinned ? 'is-active' : ''}`}
          title={pinned ? 'Unpin dock' : 'Pin dock open'}
          aria-pressed={pinned}
          onClick={() => setPinned((p) => !p)}
          style={{ marginTop: 'auto', fontSize: 10 }}
        >
          {pinned ? '◆' : '◇'}
        </button>
      </nav>

      <div
        className="pmos-dock-panel pmos-glass"
        onMouseLeave={() => {
          if (!pinned) setExpanded(false);
        }}
      >
        <div className="pmos-dock-panel-inner">
          <div className="pmos-label" style={{ marginBottom: 8 }}>
            {MISSION_DOCK_SECTIONS.find((s) => s.id === section)?.label || section}
          </div>
          {panelContent || (
            <p className="pmos-subtitle">Select a section from the dock rail.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
