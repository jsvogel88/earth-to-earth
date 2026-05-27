import React from 'react';
import { getManufacturingPackagesByScale } from '../registries/manufacturingPackageRegistry.js';

export default function ManufacturingPanel({
  selectedPackageId,
  onSelectPackage,
  onShowOnMap,
}) {
  const packages = getManufacturingPackagesByScale();

  return (
    <div className="pls-panel" data-testid="studio-manufacturing-panel">
      <h3 className="pls-h3">Manufacturing packages</h3>
      <p className="pls-sub">Scale ladder: KilaPlant → MegaLine → GigaFactory → TeraFab → PetaBond</p>
      {packages.map((pkg) => (
        <button
          key={pkg.id}
          type="button"
          className={`pls-mfg-card ${selectedPackageId === pkg.id ? 'is-selected' : ''}`}
          data-testid={`mfg-card-${pkg.id}`}
          onClick={() => onSelectPackage?.(selectedPackageId === pkg.id ? null : pkg.id)}
        >
          <div className="pls-mfg-scale">L{pkg.scaleLevel}</div>
          <div>
            <strong>{pkg.label}</strong>
            <p>{pkg.description}</p>
            <span className="pls-meta">
              {pkg.plannedOnly ? 'Preview profile — limited map layers' : 'Map layer profile available'}
            </span>
          </div>
        </button>
      ))}
      {selectedPackageId && (
        <button
          type="button"
          className="pls-btn pls-btn-sm"
          data-testid="mfg-show-on-map"
          onClick={() => onShowOnMap?.(selectedPackageId)}
        >
          Show on Map
        </button>
      )}
    </div>
  );
}
