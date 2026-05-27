import React from 'react';
import {
  STARBASE_CLASSES,
  STARBASE_STATUS,
  STARBASE_PLANETS,
} from '../../data/starbaseHubs.js';
import { RE2E_DISPLAY_LONG, E2M_ORBITAL_DISPLAY_LONG } from '../../ui/re2eDisplayLabels.js';

const CLASS_LABELS = {
  [STARBASE_CLASSES.PRIME]: 'Prime launch / logistics',
  [STARBASE_CLASSES.PASSENGER]: 'Passenger / E2E intermodal',
  [STARBASE_CLASSES.INDUSTRIAL]: 'Industrial / manufacturing',
  [STARBASE_CLASSES.RESOURCE]: 'Resource / RE2E extraction',
  [STARBASE_CLASSES.ORBITAL]: 'Orbital depot',
  [STARBASE_CLASSES.LUNAR]: 'Lunar gateway',
  [STARBASE_CLASSES.MARS]: 'Mars surface',
};

const ROLE_LABELS = {
  E2E: 'E2E Starship passenger',
  RE2E: RE2E_DISPLAY_LONG,
  HYPERLOOP: 'Hyperloop corridor',
  AUTO_FSD: 'Robotaxi / FSD',
  PETABOND_EXPORT: 'PETABOND export package',
  E2O: 'Earth-to-Orbit',
  E2F: 'Earth-to-fuel depot',
  E2L: 'Earth-to-Lunar',
  E2MARS: E2M_ORBITAL_DISPLAY_LONG,
  MARS_HYPERLOOP: 'Mars hyperloop (future)',
};

function statusLabel(status) {
  if (status === STARBASE_STATUS.CONCEPTUAL) return 'Conceptual';
  if (status === STARBASE_STATUS.FUTURE) return 'Future';
  if (status === STARBASE_STATUS.MARS_FUTURE) return 'Mars future';
  return 'Active';
}

export default function StarbaseDetailCard({ hub, onClose }) {
  if (!hub) return null;

  const coords = hub.coordinates ?? [hub.lon, hub.lat];
  const petabond = (hub.hubRoles ?? []).includes('PETABOND_EXPORT');
  const roles = hub.hubRoles ?? [];

  return (
    <div className="starbase-detail-card" data-testid="starbase-detail-card">
      {onClose && (
        <button type="button" className="pmos-context-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
      <h3 style={{ margin: '0 0 8px', fontSize: 16, color: '#e8f0ff' }}>{hub.name}</h3>
      <p className="pmos-subtitle" style={{ marginBottom: 10 }}>
        {CLASS_LABELS[hub.starbaseClass] ?? hub.starbaseClass} · {statusLabel(hub.status)}
      </p>

      {hub.worldCityName && (
        <div style={{ marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: '#8899cc' }}>Region anchor </span>
          <span>{hub.worldCityName}</span>
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#8899cc', fontSize: 10, marginBottom: 4 }}>CONNECTED SYSTEMS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {roles.length ? (
            roles.map((r) => (
              <span key={r} className="pmos-chip" style={{ borderColor: '#64c8ff', color: '#a8d4ff' }}>
                {ROLE_LABELS[r] ?? r}
              </span>
            ))
          ) : (
            <span className="pmos-subtitle">—</span>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          fontSize: 12,
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ color: '#8899cc', fontSize: 10 }}>PETABOND eligible</div>
          <div style={{ fontWeight: 600, color: petabond ? '#ffd700' : '#8899cc' }}>
            {petabond ? 'Yes' : 'No'}
          </div>
        </div>
        <div>
          <div style={{ color: '#8899cc', fontSize: 10 }}>Planet / realm</div>
          <div>{hub.planet ?? STARBASE_PLANETS.EARTH}</div>
        </div>
        {coords?.length === 2 && hub.earthRenderable && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ color: '#8899cc', fontSize: 10 }}>Coordinates</div>
            <div>
              {coords[1].toFixed(4)}°, {coords[0].toFixed(4)}°
            </div>
          </div>
        )}
      </div>

      {hub.notes && (
        <p className="pmos-subtitle" style={{ lineHeight: 1.45, marginTop: 8 }}>
          {hub.notes}
        </p>
      )}

      {hub.nonEarth && (
        <p className="pmos-subtitle" style={{ marginTop: 8, color: '#b8a8ff' }}>
          Off-world node — visible in future Planet View / 3D mode, not on the Earth map.
        </p>
      )}
    </div>
  );
}
