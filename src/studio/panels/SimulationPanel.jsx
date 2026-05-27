import React from 'react';
import {
  SIMULATION_TIMELINE_PRESETS,
  describeSimulationYear,
} from '../simulationStudioBridge.js';

export default function SimulationPanel({
  simulationYear,
  activePresetId,
  onApplyPreset,
}) {
  const era = simulationYear ? describeSimulationYear(simulationYear) : null;

  return (
    <div className="pls-panel" data-testid="studio-simulation-panel">
      <h3 className="pls-h3">Logistics timeline</h3>
      <p className="pls-sub">
        Drives simulation year on the map timeline and applies matching scenario layer profiles.
      </p>
      {simulationYear != null && (
        <div className="pls-sim-current">
          <strong>Active year: {simulationYear}</strong>
          {era && <span className="pls-meta"> — {era.era}</span>}
          {era?.milestones?.[0] && <p className="pls-meta">{era.milestones[0]}</p>}
        </div>
      )}
      {SIMULATION_TIMELINE_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          className={`pls-btn pls-btn-sm pls-preset-row ${activePresetId === preset.id ? 'is-active' : ''}`}
          data-testid={`sim-preset-${preset.id}`}
          onClick={() => onApplyPreset?.(preset.id)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
