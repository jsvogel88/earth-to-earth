import React from 'react';
import { STUDIO_TABS, STUDIO_TAB_LIST, DEFAULT_STUDIO_TAB } from './registries/studioTabs.js';
import VisionPanel from './panels/VisionPanel.jsx';
import ModesPanel from './panels/ModesPanel.jsx';
import HubsPanel from './panels/HubsPanel.jsx';
import PayloadsPanel from './panels/PayloadsPanel.jsx';
import ManufacturingPanel from './panels/ManufacturingPanel.jsx';
import ScenariosPanel from './panels/ScenariosPanel.jsx';
import MissionCopilotPanel from './panels/MissionCopilotPanel.jsx';
import VersionsPanel from './panels/VersionsPanel.jsx';
import StudioLayersHeader from './panels/StudioLayersHeader.jsx';
import PlanetPanel from './panels/PlanetPanel.jsx';
import SimulationPanel from './panels/SimulationPanel.jsx';

export default function LogisticsStudioSidebar({
  simulationYear,
  activeTab = DEFAULT_STUDIO_TAB,
  onTabChange,
  studioState,
  onStudioPatch,
  onApplyScenario,
  onDiffScenario,
  onApplyManufacturingPackage,
  onApplyCopilotAction,
  onApplyModeFocus,
  onApplyHubFocus,
  onApplyPayloadFocus,
  onTogglePayloadRouteFilter,
  onApplyPlanetFocus,
  onApplySimulationPreset,
  onApplyLayerQuickGroup,
  onSaveVersion,
  onRestoreVersion,
  onCompareVersion,
  onExportVersions,
  onClearCompare,
  onPreviewVersion,
  onExitVersionPreview,
  onCopilotRunPrompt,
  copilotHistory,
  layersPanel,
}) {
  const tab = activeTab ?? DEFAULT_STUDIO_TAB;

  const panel = (() => {
    switch (tab) {
      case STUDIO_TABS.VISION:
        return (
          <VisionPanel
            collapsed={studioState?.visionPanelCollapsed}
            onCollapsedChange={(visionPanelCollapsed) => onStudioPatch?.({ visionPanelCollapsed })}
            onNavigateTab={onTabChange}
          />
        );
      case STUDIO_TABS.MODES:
        return (
          <ModesPanel
            selectedModeId={studioState?.selectedModeId}
            onSelectMode={(selectedModeId) => onStudioPatch?.({ selectedModeId })}
            onFocusOnMap={onApplyModeFocus}
          />
        );
      case STUDIO_TABS.HUBS:
        return (
          <HubsPanel
            selectedHubTypeId={studioState?.selectedHubTypeId}
            onSelectHubType={(selectedHubTypeId) => onStudioPatch?.({ selectedHubTypeId })}
            onFocusOnMap={onApplyHubFocus}
          />
        );
      case STUDIO_TABS.PAYLOADS:
        return (
          <PayloadsPanel
            selectedPayloadId={studioState?.selectedPayloadId}
            onSelectPayload={(selectedPayloadId) =>
              onStudioPatch?.({
                selectedPayloadId,
                statusMessage: selectedPayloadId
                  ? `Payload selected: ${selectedPayloadId}`
                  : 'Map-first exploration mode',
              })
            }
            payloadFilterActive={studioState?.payloadFilterActive}
            onFocusOnMap={onApplyPayloadFocus}
            onToggleRouteFilter={onTogglePayloadRouteFilter}
          />
        );
      case STUDIO_TABS.MANUFACTURING:
        return (
          <ManufacturingPanel
            selectedPackageId={studioState?.selectedManufacturingPackageId}
            onSelectPackage={(selectedManufacturingPackageId) =>
              onStudioPatch?.({
                selectedManufacturingPackageId,
                statusMessage: selectedManufacturingPackageId
                  ? `Manufacturing: ${selectedManufacturingPackageId}`
                  : 'Map-first exploration mode',
              })
            }
            onShowOnMap={onApplyManufacturingPackage}
          />
        );
      case STUDIO_TABS.LAYERS:
        return (
          <div className="pls-layers-embed" data-testid="studio-layers-panel">
            <StudioLayersHeader onApplyQuickGroup={onApplyLayerQuickGroup} />
            {layersPanel}
          </div>
        );
      case STUDIO_TABS.SCENARIOS:
        return (
          <ScenariosPanel
            activeScenarioId={studioState?.activeScenarioId}
            onApplyScenario={onApplyScenario}
            onDiffScenario={onDiffScenario}
            scenarioDiff={studioState?.scenarioDiff}
          />
        );
      case STUDIO_TABS.PLANET:
        return (
          <PlanetPanel
            activePlanetId={studioState?.activePlanetId}
            onSelectPlanet={(activePlanetId) => onStudioPatch?.({ activePlanetId })}
            onFocusPlanet={onApplyPlanetFocus}
          />
        );
      case STUDIO_TABS.TIMELINE:
        return (
          <SimulationPanel
            simulationYear={simulationYear}
            activePresetId={studioState?.activeSimulationPresetId}
            onApplyPreset={onApplySimulationPreset}
          />
        );
      case STUDIO_TABS.COPILOT:
        return (
          <MissionCopilotPanel
            onApplyCopilotAction={onApplyCopilotAction}
            copilotHistory={copilotHistory ?? studioState?.copilotHistory}
            onRunPrompt={onCopilotRunPrompt}
          />
        );
      case STUDIO_TABS.VERSIONS:
        return (
          <VersionsPanel
            versions={studioState?.versions}
            compareVersionId={studioState?.compareVersionId}
            compareDiffKeys={studioState?.compareDiffKeys}
            compareDetailRows={studioState?.compareDetailRows}
            compareTruncated={studioState?.compareDetailTruncated}
            onSaveVersion={onSaveVersion}
            onRestoreVersion={onRestoreVersion}
            onCompareVersion={onCompareVersion}
            onExportVersions={onExportVersions}
            onClearCompare={onClearCompare}
            onPreviewVersion={onPreviewVersion}
            onExitVersionPreview={onExitVersionPreview}
            previewingVersionId={studioState?.previewingVersionId}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <div className="pls-sidebar" data-testid="logistics-studio-sidebar">
      <header className="pls-sidebar-header">
        <span className="pls-sidebar-title">Logistics Studio</span>
        <span className="pls-sidebar-subtitle">Vision · Modes · Layers · Scenarios</span>
      </header>
      <div className="pls-sidebar-body">
      <nav className="pls-tab-rail" aria-label="Studio sections">
        {STUDIO_TAB_LIST.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`pls-tab-btn ${tab === t.id ? 'is-active' : ''}`}
            data-testid={`studio-tab-${t.id}`}
            title={t.label}
            onClick={() => onTabChange?.(t.id)}
          >
            <span aria-hidden>{t.icon}</span>
            <span className="pls-tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
      <div className="pls-tab-panel">{panel}</div>
      </div>
    </div>
  );
}
