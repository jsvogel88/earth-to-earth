import React from 'react';
import {
  PAYLOAD_TYPES,
  PAYLOAD_GROUPS,
  getPayloadTypesByGroup,
} from '../registries/payloadTypeRegistry.js';

const GROUP_LABELS = {
  [PAYLOAD_GROUPS.HUMAN]: 'Human movement',
  [PAYLOAD_GROUPS.CARGO]: 'Cargo',
  [PAYLOAD_GROUPS.MOON_MARS]: 'Moon / Mars buildout',
  [PAYLOAD_GROUPS.INDUSTRIAL]: 'Industrial',
  [PAYLOAD_GROUPS.SPECIAL]: 'Special systems',
};

export default function PayloadsPanel({
  selectedPayloadId,
  payloadFilterActive,
  onSelectPayload,
  onFocusOnMap,
  onToggleRouteFilter,
}) {
  return (
    <div className="pls-panel" data-testid="studio-payloads-panel">
      <h3 className="pls-h3">Payload types</h3>
      <p className="pls-sub">Focus layers and optionally filter integrated-grid routes by payload class.</p>
      {selectedPayloadId && (
        <label className="pls-check-row">
          <input
            type="checkbox"
            data-testid="payload-route-filter-toggle"
            checked={Boolean(payloadFilterActive)}
            onChange={(e) => onToggleRouteFilter?.(e.target.checked)}
          />
          Filter visible routes on map
        </label>
      )}
      {Object.values(PAYLOAD_GROUPS).map((group) => (
        <section key={group} className="pls-card-group">
          <h4>{GROUP_LABELS[group]}</h4>
          {getPayloadTypesByGroup(group).map((p) => (
            <div
              key={p.id}
              className={`pls-option-card ${selectedPayloadId === p.id ? 'is-selected' : ''}`}
            >
              <div className="pls-option-card-body">
                <strong>{p.label}</strong>
                {p.highlight && <span className="pls-badge">PetaBond-class</span>}
                <div className="pls-inline-actions">
                  <button
                    type="button"
                    className="pls-btn pls-btn-ghost pls-btn-sm"
                    onClick={() => onSelectPayload?.(selectedPayloadId === p.id ? null : p.id)}
                  >
                    {selectedPayloadId === p.id ? 'Selected' : 'Select'}
                  </button>
                  <button
                    type="button"
                    className="pls-btn pls-btn-sm"
                    data-testid={`payload-focus-${p.id}`}
                    onClick={() => onFocusOnMap?.(p.id)}
                  >
                    Focus on Map
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
