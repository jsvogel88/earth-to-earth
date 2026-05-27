import React from 'react';
import { HUB_TYPES, HUB_TYPE_GROUPS, getHubTypesByGroup } from '../registries/hubTypeRegistry.js';

const GROUP_LABELS = {
  [HUB_TYPE_GROUPS.SPACE]: 'Space hubs',
  [HUB_TYPE_GROUPS.GROUND]: 'Ground transport',
  [HUB_TYPE_GROUPS.INDUSTRIAL]: 'Industrial',
  [HUB_TYPE_GROUPS.CIVILIZATION]: 'Civilization',
};

export default function HubsPanel({ selectedHubTypeId, onSelectHubType, onFocusOnMap }) {
  return (
    <div className="pls-panel" data-testid="studio-hubs-panel">
      <h3 className="pls-h3">Hub types</h3>
      <p className="pls-sub">Highlight hub families on the map (Starbase, RE2E, Hyperloop, etc.).</p>
      {Object.values(HUB_TYPE_GROUPS).map((group) => (
        <section key={group} className="pls-card-group">
          <h4>{GROUP_LABELS[group]}</h4>
          {getHubTypesByGroup(group).map((hub) => (
            <div
              key={hub.id}
              className={`pls-option-card ${selectedHubTypeId === hub.id ? 'is-selected' : ''}`}
            >
              <span className="pls-swatch" style={{ background: hub.color }} />
              <div className="pls-option-card-body">
                <strong>{hub.label}</strong>
                <span className="pls-meta">
                  {hub.plannedOnly ? 'Registry preview' : 'Map focus available'}
                </span>
                <div className="pls-inline-actions">
                  <button
                    type="button"
                    className="pls-btn pls-btn-ghost pls-btn-sm"
                    onClick={() => onSelectHubType?.(selectedHubTypeId === hub.id ? null : hub.id)}
                  >
                    {selectedHubTypeId === hub.id ? 'Selected' : 'Select'}
                  </button>
                  <button
                    type="button"
                    className="pls-btn pls-btn-sm"
                    data-testid={`hub-focus-${hub.id}`}
                    disabled={hub.plannedOnly}
                    onClick={() => onFocusOnMap?.(hub.id)}
                  >
                    Focus on Map
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      ))}
      <p className="pls-meta">Total hub types in library: {HUB_TYPES.length}</p>
    </div>
  );
}
