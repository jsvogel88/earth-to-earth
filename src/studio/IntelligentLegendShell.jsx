import React from 'react';
import DynamicLegend from '../components/pmos/DynamicLegend.jsx';
import { getScenarioById } from './registries/scenarioRegistry.js';
import { getManufacturingPackageById } from './registries/manufacturingPackageRegistry.js';
import { getManufacturingPackagesByScale } from './registries/manufacturingPackageRegistry.js';

export default function IntelligentLegendShell({ studioState, legendProps }) {
  const scenario = getScenarioById(studioState?.activeScenarioId);
  const mfg = studioState?.selectedManufacturingPackageId
    ? getManufacturingPackageById(studioState.selectedManufacturingPackageId)
    : null;

  return (
    <div className="pls-legend-wrap" data-testid="pls-intelligent-legend">
      <div className="pls-legend-studio pmos-glass">
        <div className="pls-label">Active scenario</div>
        <div className="pls-legend-title">{scenario?.label ?? 'Current Default Network'}</div>
        {mfg && (
          <div className="pls-meta" style={{ marginTop: 4 }}>
            Package: {mfg.label} (L{mfg.scaleLevel})
          </div>
        )}
        <details className="pls-legend-mfg-ladder">
          <summary>Manufacturing visual ladder</summary>
          <ul>
            {getManufacturingPackagesByScale().map((p) => (
              <li key={p.id}>
                <span
                  className="pls-swatch"
                  style={{ background: p.mapStyle?.routeColor ?? '#888' }}
                />{' '}
                {p.label}
                {p.plannedOnly ? ' (planned)' : ''}
              </li>
            ))}
          </ul>
        </details>
        <div className="pls-legend-colors">
          <span style={{ color: '#d4af37' }}>■ E2E arcs</span>
          <span style={{ color: '#ff6b35' }}>■ RE2E / E2M arcs</span>
          <span style={{ color: '#00dcff' }}>■ Hyperloop spine</span>
          <span style={{ color: '#50ffc8' }}>■ PetaBond (when enabled)</span>
          <span style={{ color: '#7dff9a' }}>■ Robotaxi / local</span>
        </div>
      </div>
      {legendProps && <DynamicLegend {...legendProps} />}
    </div>
  );
}
