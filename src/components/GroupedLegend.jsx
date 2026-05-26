import React, { useState } from 'react';
import {
  isE2EStarshipMode,
  isHyperloopCoreMode,
  isE2MOrbitalMode,
  isCivilizationGridMode,
  isRobotaxiMode,
  normalizeTransportMode,
} from '../data/transportOperatingSystem.js';
import { LEGEND_GROUPS } from '../layers/layerRegistry.js';
import { ROBOTAXI_COLORS } from '../layers/robotaxiVisibility.js';
import { STARSHIP_PASSENGER_MIN_MILES, REGIONAL_HYPERLOOP_MAX_MILES } from '../data/globalHyperloopGraph.js';
import '../styles/transport-control-panel.css';

function LegendGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="legend-group">
      <button
        type="button"
        className="transport-os-section-toggle"
        onClick={() => setOpen((o) => !o)}
        style={{ paddingBottom: 4 }}
      >
        <span>{title}</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="legend-group-items">{children}</div>}
    </div>
  );
}

export default function GroupedLegend({
  mapDisplayMode,
  layerState,
  hyperloopWebHelper,
}) {
  const mode = normalizeTransportMode(mapDisplayMode);
  const isHyperloop = isHyperloopCoreMode(mode);
  const isE2E = isE2EStarshipMode(mode);
  const isE2M = isE2MOrbitalMode(mode);
  const isCiv = isCivilizationGridMode(mode);
  const isRobotaxi = isRobotaxiMode(mode);

  return (
    <div data-testid="grouped-legend">
      {isHyperloop && (
        <p style={{ margin: '0 0 8px', color: '#8899cc', lineHeight: 1.4, fontSize: '10px' }}>
          {hyperloopWebHelper}
        </p>
      )}
      {isE2E && (
        <LegendGroup title="Passenger — E2E Starship">
          <span>● Gold — active E2E hub</span>
          <span>● Cyan — regional hub (≤{REGIONAL_HYPERLOOP_MAX_MILES} mi)</span>
          <span>— Gold arc — Starship ({STARSHIP_PASSENGER_MIN_MILES}+ mi)</span>
          <span>○ Gold ring — catchment (zoom 3+)</span>
          <span style={{ color: '#00ff78' }}>— Green — local feeder</span>
          <span style={{ color: '#00dcff' }}>— Teal — regional Hyperloop</span>
        </LegendGroup>
      )}
      {isHyperloop && (
        <LegendGroup title="Hyperloop infrastructure">
          <span style={{ color: '#3cb4ff' }}>— Bright blue — planetary / continental trunk</span>
          <span style={{ color: '#00dcff' }}>— Teal — regional trunk</span>
          <span style={{ color: '#be00ff' }}>— Magenta dashed — through-route / corridor flow</span>
          <span style={{ color: '#5078ff' }}>— Electric blue — intercontinental gateway</span>
          <span>● Gold — E2E / trunk hub</span>
          <span style={{ color: '#ffb432' }}>● Amber — switch node</span>
          <span style={{ color: '#00ff78' }}>— Green — feeder branch (zoom 5.5+)</span>
          <span style={{ color: '#ff2850' }}>— Crimson dash — tunnel / undersea</span>
        </LegendGroup>
      )}
      {isE2M && layerState.showE2MLayer && (
        <LegendGroup title="E2M orbital logistics">
          <span style={{ color: '#c8a050' }}>● Bronze — orbital refueling hub</span>
          <span style={{ color: '#ff9630' }}>■ Orange — industrial launch zone</span>
          <span style={{ color: '#dda030' }}>— Amber line — propellant / cargo corridor</span>
          <span style={{ color: '#e070ff' }}>◇ Violet — Mars-window staging</span>
        </LegendGroup>
      )}
      {(layerState.showRareEarthHubs ||
        layerState.showRemoteCargoRoutes ||
        layerState.showFutureHighPopulationHubs) && (
        <LegendGroup title="Cargo & extraction" defaultOpen={false}>
          <span style={{ color: '#ffe646' }}>● Yellow — rare earth hub</span>
          <span style={{ color: '#ff9630' }}>— Orange — remote cargo corridor</span>
          <span style={{ color: '#ffbe28' }}>— Gold-orange — critical minerals</span>
        </LegendGroup>
      )}
      {(isCiv || layerState.showWorldCitiesPlanningGrid) && (
        <LegendGroup title="Planning layers">
          <span style={{ color: '#64c8ff' }}>· Cyan dot — trunk-class city</span>
          <span style={{ color: '#00ff8c' }}>· Green dot — feeder candidate</span>
          <span style={{ color: '#b490ff' }}>· Violet — future E2E candidate</span>
          <span style={{ color: '#6a7a9a' }}>· Gray — unclassified (no edges)</span>
        </LegendGroup>
      )}
      {layerState.showCustomDestinations && (
        <LegendGroup title="Custom Planning Destination" defaultOpen>
          <span style={{ color: '#ff64ff' }}>◇ Magenta halo — user-added (not official hub)</span>
          <span style={{ color: '#ffdc64' }}>● Role-colored core — planning node only</span>
          <span style={{ color: '#ffa0ff' }}>— Magenta ring — distinct from E2E/trunk hubs</span>
          <span style={{ color: '#e8b0ff' }}>Custom: label at zoom 5+ — no routes drawn</span>
        </LegendGroup>
      )}
      {layerState.showCustomConnectionPreview && layerState.showCustomDestinations && (
        <LegendGroup title="Custom Preview Connection" defaultOpen>
          <span style={{ color: '#c878ff' }}>— Violet dashed — preview only (not in graph)</span>
          <span style={{ color: '#8899cc' }}>Nearest trunk or regional hub attachment</span>
        </LegendGroup>
      )}
      {(isRobotaxi || layerState.showRobotaxiLayer) && (
        <LegendGroup title={LEGEND_GROUPS.AUTONOMOUS} defaultOpen={isRobotaxi}>
          <span style={{ color: `rgb(${ROBOTAXI_COLORS.zoneLine.slice(0, 3).join(',')})` }}>
            ○ Lime ring — robotaxi service zone
          </span>
          <span style={{ color: `rgb(${ROBOTAXI_COLORS.hubDot.slice(0, 3).join(',')})` }}>
            ● Electric lime — hub availability (world zoom)
          </span>
          <span style={{ color: `rgb(${ROBOTAXI_COLORS.pickupFill.slice(0, 3).join(',')})` }}>
            · Soft green — pickup / dropoff point
          </span>
          <span style={{ color: '#e8ffe0' }}>— White accent — final-mile coverage (no roads)</span>
          <span style={{ color: '#a8d890' }}>◇ Remote / airport / downtown connectors</span>
        </LegendGroup>
      )}
      {layerState.showExtendedRuralLayer && (
        <LegendGroup title="Remote / rural spines" defaultOpen={false}>
          <span style={{ color: '#5ab4ff' }}>● Soft blue — remote access node</span>
          <span style={{ color: '#82dcff' }}>— Ice blue — Arctic logistics</span>
          <span style={{ color: '#ff6420' }}>— Deep orange — resource corridor</span>
        </LegendGroup>
      )}
      <LegendGroup title="Future systems" defaultOpen={false}>
        <span style={{ color: '#8899cc' }}>Simulation & AI generation — Phase 3+</span>
      </LegendGroup>
    </div>
  );
}
