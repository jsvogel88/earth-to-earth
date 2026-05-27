import React from 'react';
import {
  PLANET_OPTIONS,
  STUDIO_PLANETS,
  listOffWorldHubsForPlanet,
  countHubsByStudioPlanet,
} from '../registries/planetRegistry.js';

export default function PlanetPanel({
  activePlanetId = STUDIO_PLANETS.EARTH,
  onSelectPlanet,
  onFocusPlanet,
}) {
  const counts = countHubsByStudioPlanet();
  const offWorld = listOffWorldHubsForPlanet(activePlanetId);

  return (
    <div className="pls-panel" data-testid="studio-planet-panel">
      <h3 className="pls-h3">Planet logistics</h3>
      <p className="pls-sub">
        Earth renders on the 2D map. Moon/Mars hubs are registry + layer profiles until Planet View 3D.
      </p>
      <div className="pls-planet-counts">
        <span>Earth hubs: {counts.earth}</span>
        <span>Moon: {counts.moon}</span>
        <span>Mars: {counts.mars}</span>
      </div>
      {PLANET_OPTIONS.map((planet) => (
        <div
          key={planet.id}
          className={`pls-option-card ${activePlanetId === planet.id ? 'is-selected' : ''}`}
        >
          <div className="pls-option-card-body">
            <strong>{planet.label}</strong>
            <p className="pls-meta">{planet.description}</p>
            <div className="pls-inline-actions">
              <button
                type="button"
                className="pls-btn pls-btn-ghost pls-btn-sm"
                data-testid={`planet-select-${planet.id}`}
                onClick={() => onSelectPlanet?.(planet.id)}
              >
                {activePlanetId === planet.id ? 'Selected' : 'Select'}
              </button>
              <button
                type="button"
                className="pls-btn pls-btn-sm"
                data-testid={`planet-focus-${planet.id}`}
                onClick={() => onFocusPlanet?.(planet.id)}
              >
                Focus logistics
              </button>
            </div>
          </div>
        </div>
      ))}
      {activePlanetId !== STUDIO_PLANETS.EARTH && (
        <section className="pls-card-group" data-testid="studio-offworld-roster">
          <h4>Off-world roster — {activePlanetId}</h4>
          {offWorld.length === 0 && <p className="pls-meta">No hubs in registry for this realm.</p>}
          <ul className="pls-roster-list">
            {offWorld.map((hub) => (
              <li key={hub.id}>
                <strong>{hub.name}</strong>
                <span className="pls-meta">{hub.status}</span>
                {hub.notes && <p className="pls-meta">{hub.notes}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
