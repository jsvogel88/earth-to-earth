import React from 'react';
import {
  TRANSPORTATION_MODE_LIBRARY,
  MODE_GROUP_LABELS,
  MODE_LIBRARY_GROUPS,
} from '../registries/transportationModeLibrary.js';

const GROUP_ORDER = Object.values(MODE_LIBRARY_GROUPS);

export default function ModesPanel({ selectedModeId, onSelectMode, onFocusOnMap }) {
  return (
    <div className="pls-panel" data-testid="studio-modes-panel">
      <h3 className="pls-h3">Transportation modes</h3>
      <p className="pls-sub">Focus the map on a mode family using existing layer flags.</p>
      {GROUP_ORDER.map((group) => {
        const items = TRANSPORTATION_MODE_LIBRARY.filter((m) => m.group === group);
        if (!items.length) return null;
        return (
          <section key={group} className="pls-card-group">
            <h4>{MODE_GROUP_LABELS[group] ?? group}</h4>
            {items.map((mode) => (
              <div
                key={mode.id}
                className={`pls-option-card ${selectedModeId === mode.id ? 'is-selected' : ''}`}
              >
                <span className="pls-swatch" style={{ background: mode.color }} />
                <div className="pls-option-card-body">
                  <strong>{mode.label}</strong>
                  <span className="pls-meta">
                    {mode.wired ? 'Map focus available' : 'Planned — not wired yet'}
                  </span>
                  <div className="pls-inline-actions">
                    <button
                      type="button"
                      className="pls-btn pls-btn-ghost pls-btn-sm"
                      onClick={() => onSelectMode?.(selectedModeId === mode.id ? null : mode.id)}
                    >
                      {selectedModeId === mode.id ? 'Selected' : 'Select'}
                    </button>
                    {mode.wired && (
                      <button
                        type="button"
                        className="pls-btn pls-btn-sm"
                        data-testid={`mode-focus-${mode.id}`}
                        onClick={() => onFocusOnMap?.(mode.id)}
                      >
                        Focus on Map
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
