import React, { useState } from 'react';
import { SCENARIOS } from '../registries/scenarioRegistry.js';

export default function ScenariosPanel({
  activeScenarioId,
  onApplyScenario,
  onDiffScenario,
  scenarioDiff,
}) {
  const [diffTargetId, setDiffTargetId] = useState(null);

  return (
    <div className="pls-panel" data-testid="studio-scenarios-panel">
      <h3 className="pls-h3">Scenarios</h3>
      <p className="pls-sub">Apply profiles or diff against the live map before applying.</p>

      {scenarioDiff?.rows?.length > 0 && (
        <div className="pls-compare-box" data-testid="scenario-diff-panel">
          <strong>
            Diff vs active: {scenarioDiff.scenario?.label ?? diffTargetId}
          </strong>
          <p className="pls-meta">{scenarioDiff.changedKeys.length} layer flag(s) would change</p>
          <table className="pls-diff-table">
            <thead>
              <tr>
                <th>Layer</th>
                <th>Current</th>
                <th>Scenario</th>
              </tr>
            </thead>
            <tbody>
              {scenarioDiff.rows.slice(0, 12).map((row) => (
                <tr key={row.key}>
                  <td>
                    <code>{row.key}</code>
                  </td>
                  <td>{String(row.current)}</td>
                  <td>{String(row.saved)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {SCENARIOS.map((scenario) => (
        <div
          key={scenario.id}
          className={`pls-scenario-card ${activeScenarioId === scenario.id ? 'is-active' : ''}`}
          data-testid={`scenario-card-${scenario.id}`}
        >
          <strong>{scenario.label}</strong>
          <p>{scenario.objective}</p>
          {scenario.notes && <span className="pls-meta">{scenario.notes}</span>}
          <div className="pls-inline-actions">
            <button
              type="button"
              className="pls-btn pls-btn-sm"
              onClick={() => onApplyScenario?.(scenario.id)}
            >
              Apply Scenario
            </button>
            {activeScenarioId !== scenario.id && (
              <button
                type="button"
                className="pls-btn pls-btn-ghost pls-btn-sm"
                data-testid={`scenario-diff-${scenario.id}`}
                onClick={() => {
                  setDiffTargetId(scenario.id);
                  onDiffScenario?.(scenario.id);
                }}
              >
                Diff vs active
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
