import React from 'react';
import { MISSION_MODES } from './registries/missionModeRegistry.js';
import { VIEW_MODES } from './registries/viewModeRegistry.js';
import { getScenarioById } from './registries/scenarioRegistry.js';

export default function TopMissionBar({
  activeScenarioId,
  missionModeId,
  viewModeId,
  onMissionModeChange,
  onViewModeChange,
  onSave,
  onRestore,
  onCompare,
  onExport,
}) {
  const scenario = getScenarioById(activeScenarioId);

  return (
    <header className="pls-mission-bar pmos-glass" data-testid="pls-mission-bar">
      <div className="pls-mission-brand">
        <strong>Planetary Logistics Studio</strong>
        <span>Design Earth, Moon, and Mars infrastructure networks</span>
      </div>
      <div className="pls-mission-scenario" title={scenario?.objective}>
        <span className="pls-label">Scenario</span>
        <span className="pls-value">{scenario?.label ?? '—'}</span>
      </div>
      <label className="pls-mission-select">
        <span className="pls-label">Mission</span>
        <select
          value={missionModeId}
          onChange={(e) => onMissionModeChange?.(e.target.value)}
          data-testid="mission-mode-select"
        >
          {MISSION_MODES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <label className="pls-mission-select">
        <span className="pls-label">View</span>
        <select
          value={viewModeId}
          onChange={(e) => onViewModeChange?.(e.target.value)}
          data-testid="view-mode-select"
        >
          {VIEW_MODES.map((v) => (
            <option key={v.id} value={v.id} disabled={v.plannedOnly}>
              {v.label}
              {v.plannedOnly ? ' (planned)' : ''}
            </option>
          ))}
        </select>
      </label>
      <div className="pls-mission-actions">
        <button type="button" className="pls-btn pls-btn-sm" onClick={onSave} data-testid="mission-bar-save">
          Save
        </button>
        <button type="button" className="pls-btn pls-btn-sm" onClick={onRestore} data-testid="mission-bar-restore">
          Restore
        </button>
        <button type="button" className="pls-btn pls-btn-sm" onClick={onCompare} data-testid="mission-bar-compare">
          Compare
        </button>
        <button type="button" className="pls-btn pls-btn-sm" onClick={onExport} data-testid="mission-bar-export">
          Export
        </button>
      </div>
    </header>
  );
}
