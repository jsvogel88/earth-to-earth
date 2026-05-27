import React from 'react';
import { STUDIO_LAYER_QUICK_GROUPS } from '../studioLayerQuickGroups.js';

export default function StudioLayersHeader({ onApplyQuickGroup }) {
  return (
    <div className="pls-layer-quick" data-testid="studio-layers-quick-groups">
      <p className="pls-sub" style={{ marginBottom: 6 }}>
        Quick focus — applies safe layer profiles below.
      </p>
      <div className="pls-chip-row">
        {STUDIO_LAYER_QUICK_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            className="pls-btn pls-btn-ghost pls-btn-sm"
            data-testid={g.testId}
            onClick={() => onApplyQuickGroup?.(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
