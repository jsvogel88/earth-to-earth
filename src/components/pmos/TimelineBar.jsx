import React from 'react';
import {
  SIMULATION_YEARS,
  getSimulationEraLabel,
  getSimulationMilestones,
} from '../../ui/simulationTimeline.js';

export default function TimelineBar({ year, onYearChange }) {
  const era = getSimulationEraLabel(year);
  const milestones = getSimulationMilestones(year);

  return (
    <footer className="pmos-timeline-bar pmos-glass" data-testid="pmos-timeline" aria-label="Simulation timeline">
      <span className="pmos-label">Timeline</span>
      <div className="pmos-timeline-years" role="group">
        {SIMULATION_YEARS.map((y) => (
          <button
            key={y}
            type="button"
            className={`pmos-timeline-year-btn ${year === y ? 'is-active' : ''}`}
            onClick={() => onYearChange(y)}
            aria-pressed={year === y}
          >
            {y}
          </button>
        ))}
      </div>
      <div className="pmos-timeline-era">
        <strong style={{ color: 'var(--pmos-cyan)', fontWeight: 600 }}>{era}</strong>
        {milestones[0] && (
          <span style={{ display: 'block', marginTop: 2, fontSize: 9, color: 'var(--pmos-text-dim)' }}>
            {milestones[0]}
          </span>
        )}
      </div>
    </footer>
  );
}
