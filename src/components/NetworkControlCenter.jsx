import { useMemo, useState } from 'react';
import { getTransportModeLabel } from '../data/transportOperatingSystem.js';
import {
  formatConnectionModeLabel,
  formatLayerTagLabel,
} from '../data/userCustomDestinations.js';
import { partitionCustomDestinationsByMode } from '../layers/customDestinationVisibility.js';
import E2EHubManagerPanel from './E2EHubManagerPanel.jsx';
import AddDestinationPanel from './AddDestinationPanel.jsx';
import ParseCitiesPanel from './sidebar/ParseCitiesPanel.jsx';

function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`transport-os-section ${open ? '' : 'collapsed'}`}>
      <button
        type="button"
        className="transport-os-section-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span aria-hidden>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="transport-os-section-body">{children}</div>}
    </section>
  );
}

function CustomDestinationItem({ destination, onRemove }) {
  const layers = (destination.enabledLayers || []).map(formatLayerTagLabel).join(', ');
  return (
    <li className="ncc-custom-item">
      <div className="ncc-custom-item-body">
        <strong>
          {destination.name}
          <span className="ncc-custom-country"> — {destination.country}</span>
        </strong>
        <span className="ncc-custom-meta">{destination.selectedRole}</span>
        {layers && (
          <span className="ncc-custom-meta">
            Layers: {layers}
          </span>
        )}
        <span className="ncc-custom-meta">
          Connection: {formatConnectionModeLabel(destination.connectionMode)}
        </span>
      </div>
      <button
        type="button"
        className="ncc-remove-btn"
        onClick={() => onRemove(destination.id)}
        aria-label={`Remove ${destination.name}`}
      >
        Remove
      </button>
    </li>
  );
}

export default function NetworkControlCenter({
  mapDisplayMode,
  isE2EMode,
  isRobotaxiModeActive,
  hubRegistry,
  selectedOriginId,
  onOriginSelect,
  onClearOrigin,
  roiHubCount,
  customDestinations,
  onAddCustomDestination,
  onRemoveCustomDestination,
  parsedCitiesHook,
  existingWorldCityIds,
  mapNodesForParsing = [],
  onRemoveParsedCity,
  selectedCity,
  feederCityInfo,
  compact = false,
}) {
  const existingIds = new Set(customDestinations.map((d) => d.worldCityId));

  const listSections = useMemo(
    () => partitionCustomDestinationsByMode(customDestinations, mapDisplayMode),
    [customDestinations, mapDisplayMode]
  );

  return (
    <div className="network-control-center">
      {!compact && (
        <div className="panel-row-header">
          <h2>NETWORK CONTROL CENTER</h2>
        </div>
      )}

      {!compact && (
        <CollapsibleSection title="Selected mode" defaultOpen>
          <p className="ncc-mode-pill">{getTransportModeLabel(mapDisplayMode)}</p>
          <p className="ncc-helper">Use the command bar to switch transport systems and layers.</p>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Active origin / hub" defaultOpen={isE2EMode}>
        {isE2EMode ? (
          <E2EHubManagerPanel
            hubRegistry={hubRegistry}
            selectedOriginId={selectedOriginId}
            onOriginSelect={onOriginSelect}
            onClearOrigin={onClearOrigin}
          />
        ) : isRobotaxiModeActive ? (
          <p className="ncc-helper">
            Robotaxi mode — service zones at {roiHubCount} E2E/trunk anchors. No intercity routes.
          </p>
        ) : (
          <p className="ncc-helper">
            Switch to <strong>E2E Starship</strong> to pick an active origin. E2E hubs on map:{' '}
            {roiHubCount}.
          </p>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Add destination" defaultOpen>
        <AddDestinationPanel
          onAdd={onAddCustomDestination}
          existingWorldCityIds={existingIds}
        />
      </CollapsibleSection>

      {parsedCitiesHook && (
        <CollapsibleSection title="Parse Cities" defaultOpen={false}>
          <ParseCitiesPanel
            parsedCitiesHook={parsedCitiesHook}
            existingWorldCityIds={existingWorldCityIds || existingIds}
            mapNodes={mapNodesForParsing}
          />
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title={`Custom destinations (${customDestinations.length})`}
        defaultOpen={customDestinations.length > 0}
      >
        {customDestinations.length === 0 ? (
          <p className="ncc-helper">No custom destinations yet. Search above to add one.</p>
        ) : (
          listSections.map((section) => (
            <div key={section.title} className="ncc-custom-group">
              <div className="ncc-custom-group-title">{section.title}</div>
              <ul className="ncc-custom-list">
                {section.items.map((d) => (
                  <CustomDestinationItem
                    key={d.id}
                    destination={d}
                    onRemove={onRemoveCustomDestination}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Current selection summary" defaultOpen={Boolean(selectedCity)}>
        {selectedCity ? (
          <div className="ncc-summary">
            <div>
              <strong>{selectedCity.name}</strong>, {selectedCity.country}
              {selectedCity.isCustomDestination && (
                <span className="ncc-badge">Custom planning</span>
              )}
              {selectedCity.isParsedCity && (
                <span className="ncc-badge">Parsed import</span>
              )}
            </div>
            {selectedCity.selectedRole && (
              <div className="ncc-helper">{selectedCity.selectedRole}</div>
            )}
            {feederCityInfo?.distance != null && (
              <div className="ncc-helper">
                {feederCityInfo.distance.toFixed(0)} mi from active origin
              </div>
            )}
          </div>
        ) : (
          <p className="ncc-helper">Click a hub, city, or custom marker on the map.</p>
        )}
      </CollapsibleSection>
    </div>
  );
}
