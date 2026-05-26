import React, { useState } from 'react';
import { getTransportModeUI } from '../../ui/transportModeRegistry.js';
import GroupedLegend from '../GroupedLegend.jsx';

export default function DynamicLegend({
  mapDisplayMode,
  layerState,
  hyperloopWebHelper,
  expanded,
  onToggleExpanded,
}) {
  const modeUI = getTransportModeUI(mapDisplayMode);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="pmos-legend-float" data-testid="pmos-dynamic-legend">
      {modeUI.legendChips.map((chip) => (
        <span
          key={chip}
          className="pmos-chip pmos-legend-chip"
          title={chip}
          onMouseEnter={() => setShowDetail(true)}
        >
          {chip}
        </span>
      ))}
      <button
        type="button"
        className="pmos-chip pmos-legend-chip"
        onClick={() => {
          setShowDetail((d) => !d);
          onToggleExpanded?.();
        }}
        aria-expanded={showDetail || expanded}
      >
        {showDetail || expanded ? 'Hide detail' : 'Legend +'}
      </button>

      {(showDetail || expanded) && (
        <div
          className="pmos-glass"
          style={{
            width: '100%',
            marginTop: 6,
            padding: '10px 12px',
            maxHeight: 180,
            overflowY: 'auto',
            flexBasis: '100%',
          }}
        >
          <GroupedLegend
            mapDisplayMode={mapDisplayMode}
            layerState={layerState}
            hyperloopWebHelper={hyperloopWebHelper}
          />
        </div>
      )}
    </div>
  );
}
