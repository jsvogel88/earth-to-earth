import React from 'react';
import { getScenarioById } from './registries/scenarioRegistry.js';
import { getManufacturingPackageById } from './registries/manufacturingPackageRegistry.js';
import { getPayloadTypeById } from './registries/payloadTypeRegistry.js';
import { getHubTypeById } from './registries/hubTypeRegistry.js';
import { getTransportationModeById } from './registries/transportationModeLibrary.js';
import { getPlanetOptionById } from './registries/planetRegistry.js';

export default function BottomIntelligenceBar({
  studioState,
  visibleSystems = [],
  routeCount,
  hubCount,
  simulationYear,
}) {
  const scenario = getScenarioById(studioState?.activeScenarioId);
  const mfg = studioState?.selectedManufacturingPackageId
    ? getManufacturingPackageById(studioState.selectedManufacturingPackageId)
    : null;
  const payload = studioState?.selectedPayloadId
    ? getPayloadTypeById(studioState.selectedPayloadId)
    : null;
  const hub = studioState?.selectedHubTypeId
    ? getHubTypeById(studioState.selectedHubTypeId)
    : null;
  const mode = studioState?.selectedModeId
    ? getTransportationModeById(studioState.selectedModeId)
    : null;
  const planet = studioState?.activePlanetId
    ? getPlanetOptionById(studioState.activePlanetId)
    : null;

  return (
    <footer className="pls-intel-bar" data-testid="pls-intelligence-bar">
      <span>
        <strong>Scenario:</strong> {scenario?.label ?? '—'}
      </span>
      <span>
        <strong>Payload:</strong> {payload?.label ?? 'None'}
      </span>
      <span>
        <strong>Hub:</strong> {hub?.label ?? 'None'}
      </span>
      <span>
        <strong>Mode:</strong> {mode?.label ?? 'None'}
      </span>
      <span>
        <strong>Mfg:</strong> {mfg?.label ?? 'None'}
      </span>
      <span>
        <strong>Planet:</strong> {planet?.label ?? 'Earth'}
      </span>
      {simulationYear != null && (
        <span data-testid="pls-intel-year">
          <strong>Year:</strong> {simulationYear}
        </span>
      )}
      {studioState?.payloadFilterActive && (
        <span data-testid="pls-payload-filter-badge">
          <strong>Filter:</strong> routes
        </span>
      )}
      <span>
        <strong>Systems:</strong>{' '}
        {visibleSystems.length ? visibleSystems.join(', ') : 'E2E, RE2E, Hyperloop (default)'}
      </span>
      {routeCount != null && (
        <span>
          <strong>Routes:</strong> {routeCount}
        </span>
      )}
      {hubCount != null && (
        <span>
          <strong>Hubs:</strong> {hubCount}
        </span>
      )}
      {studioState?.compareDiffKeys?.length > 0 && (
        <span data-testid="pls-compare-badge">
          <strong>Compare:</strong> {studioState.compareDiffKeys.length} diff
        </span>
      )}
      <span className="pls-intel-status">{studioState?.statusMessage}</span>
    </footer>
  );
}
