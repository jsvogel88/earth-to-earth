import React, { useState } from 'react';

export default function ScenarioControls({
  scenarios = [],
  onSaveCurrent,
  onLoad,
  onDelete,
  onDuplicate,
}) {
  const [name, setName] = useState('');

  return (
    <div className="pmos-scenario-controls" data-testid="pmos-scenario-controls">
      <p className="pmos-subtitle" style={{ marginBottom: 8 }}>
        Save map scenarios locally — mode, layers, destinations, and viewport.
      </p>
      <label className="pmos-label">
        Scenario name
        <input
          className="pmos-search-input"
          style={{ marginTop: 4, width: '100%' }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Global trunk study"
          data-testid="scenario-name-input"
        />
      </label>
      <button
        type="button"
        className="pmos-btn"
        style={{ marginTop: 8 }}
        data-testid="scenario-save-btn"
        onClick={() => {
          onSaveCurrent?.(name.trim() || 'Map scenario');
          setName('');
        }}
      >
        Save current map
      </button>
      {scenarios.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: '12px 0 0',
            padding: 0,
            fontSize: 11,
            color: 'var(--pmos-text-muted)',
          }}
          data-testid="scenario-list"
        >
          {scenarios.map((s) => (
            <li
              key={s.id}
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                marginBottom: 6,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ flex: 1, minWidth: 120 }}>{s.name}</span>
              <button type="button" className="pmos-chip" onClick={() => onLoad?.(s)}>
                Load
              </button>
              <button type="button" className="pmos-chip" onClick={() => onDuplicate?.(s.id)}>
                Copy
              </button>
              <button type="button" className="pmos-chip" onClick={() => onDelete?.(s.id)}>
                Del
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
