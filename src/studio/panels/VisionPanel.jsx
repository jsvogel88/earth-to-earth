import React from 'react';
import { STUDIO_TABS } from '../registries/studioTabs.js';

export default function VisionPanel({ collapsed, onCollapsedChange, onNavigateTab }) {
  if (collapsed) {
    return (
      <div className="pls-panel" data-testid="studio-vision-panel">
        <button
          type="button"
          className="pls-btn pls-btn-ghost"
          onClick={() => onCollapsedChange?.(false)}
        >
          Show Vision overview
        </button>
      </div>
    );
  }

  return (
    <div className="pls-panel" data-testid="studio-vision-panel">
      <div className="pls-panel-header">
        <h3>Planetary Logistics Studio</h3>
        <button
          type="button"
          className="pls-btn pls-btn-ghost pls-btn-sm"
          onClick={() => onCollapsedChange?.(true)}
          aria-label="Collapse vision panel"
        >
          −
        </button>
      </div>
      <p className="pls-body">
        This map shows an integrated Earth-to-Earth, Earth-to-Moon, Earth-to-Mars, Hyperloop,
        industrial, rare earth, road, rail, port, autonomous mobility, and manufacturing logistics
        system. Explore the current network, then customize using modes, hubs, payloads,
        manufacturing packages, layers, scenarios, or optional Mission Copilot assistance.
      </p>
      <ul className="pls-list">
        <li>E2E Starship passenger arcs (blue)</li>
        <li>RE2E / E2M cargo arcs (orange)</li>
        <li>Hyperloop ground spine (cyan)</li>
        <li>Robotaxi and local feeders</li>
        <li>Starbase / PETABOND intelligence (toggle in Layers)</li>
      </ul>
      <div className="pls-action-grid">
        <button type="button" className="pls-btn" onClick={() => onCollapsedChange?.(true)}>
          Explore Current Map
        </button>
        <button type="button" className="pls-btn" onClick={() => onNavigateTab?.(STUDIO_TABS.MODES)}>
          Transportation Modes
        </button>
        <button type="button" className="pls-btn" onClick={() => onNavigateTab?.(STUDIO_TABS.HUBS)}>
          Hub Types
        </button>
        <button type="button" className="pls-btn" onClick={() => onNavigateTab?.(STUDIO_TABS.PAYLOADS)}>
          Payload Types
        </button>
        <button
          type="button"
          className="pls-btn"
          onClick={() => onNavigateTab?.(STUDIO_TABS.MANUFACTURING)}
        >
          Manufacturing Packages
        </button>
        <button type="button" className="pls-btn" onClick={() => onNavigateTab?.(STUDIO_TABS.SCENARIOS)}>
          Build a Scenario
        </button>
        <button type="button" className="pls-btn" onClick={() => onNavigateTab?.(STUDIO_TABS.COPILOT)}>
          Ask Mission Copilot
        </button>
      </div>
    </div>
  );
}
