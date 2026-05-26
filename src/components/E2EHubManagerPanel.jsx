import React from 'react';
import { networkCityId } from '../data/worldCities.js';
import '../styles/transport-control-panel.css';

export default function E2EHubManagerPanel({
  hubRegistry,
  selectedOriginId,
  onOriginSelect,
  onClearOrigin,
}) {
  const {
    activeHubs,
    hubFilter,
    setHubFilter,
    candidateCities,
    addHub,
    removeHub,
    resetToCurated,
    savePreset,
    applyPreset,
    allPresets,
    isHubActive,
  } = hubRegistry;

  return (
    <>
      <div className="panel-row-header">
        <h2>E2E HUB MANAGEMENT</h2>
      </div>
      <p style={{ fontSize: '11px', color: '#8899cc', lineHeight: 1.45, marginBottom: '10px' }}>
        Curated premium hubs by default. Add cities from the world registry — no automatic routing.
      </p>
      <button
        type="button"
        onClick={onClearOrigin}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '10px',
          background: '#ff6464',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '12px',
        }}
      >
        Clear Origin
      </button>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '10px', color: '#64c8ff', marginBottom: '6px', letterSpacing: '0.05em' }}>
          PRESETS
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {allPresets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                borderRadius: '4px',
                border: '1px solid rgba(100,200,255,0.3)',
                background: 'rgba(100,200,255,0.1)',
                color: '#b0d4ff',
                cursor: 'pointer',
              }}
            >
              {p.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const name = window.prompt('Preset name');
              if (name) savePreset(name);
            }}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              borderRadius: '4px',
              border: '1px dashed rgba(255,215,0,0.4)',
              background: 'transparent',
              color: '#ffd700',
              cursor: 'pointer',
            }}
          >
            Save preset
          </button>
          <button
            type="button"
            onClick={resetToCurated}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              borderRadius: '4px',
              border: '1px solid rgba(255,100,100,0.35)',
              color: '#ffaaaa',
              cursor: 'pointer',
              background: 'transparent',
            }}
          >
            Reset curated
          </button>
        </div>
      </div>
      <input
        className="e2e-hub-search"
        placeholder="Search world cities…"
        value={hubFilter.search}
        onChange={(e) => setHubFilter((f) => ({ ...f, search: e.target.value }))}
      />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '10px', color: '#8899cc' }}>
          Min pop (M)
          <input
            type="number"
            min={0}
            step={0.5}
            value={hubFilter.minPopulation / 1e6}
            onChange={(e) =>
              setHubFilter((f) => ({
                ...f,
                minPopulation: Math.max(0, Number(e.target.value) || 0) * 1e6,
              }))
            }
            style={{ width: '48px', marginLeft: '4px' }}
          />
        </label>
      </div>
      <div
        style={{
          maxHeight: '140px',
          overflowY: 'auto',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(100,200,255,0.15)',
          paddingBottom: '8px',
        }}
      >
        {candidateCities.slice(0, 12).map((city) => {
          const id = city.registryId || networkCityId(city.name, city.country);
          const active = isHubActive(id);
          return (
            <div key={id} className="e2e-hub-candidate">
              <span>
                {city.name}, {city.country}{' '}
                <span style={{ color: '#6a7a9a' }}>
                  {(city.population / 1e6).toFixed(1)}M
                </span>
              </span>
              <button
                type="button"
                onClick={() => (active ? removeHub(id) : addHub(id))}
                style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: active ? '#ff6464' : '#3a8fd4',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {active ? 'Remove' : 'Add'}
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: '10px', color: '#64c8ff', marginBottom: '6px' }}>
        ACTIVE HUBS ({activeHubs.length}) — tap to set origin
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
        {activeHubs.map((hub) => {
          const isOrigin = selectedOriginId === hub.id;
          return (
            <button
              key={hub.networkCityId || hub.id}
              type="button"
              onClick={() => onOriginSelect(hub.id)}
              style={{
                padding: '12px',
                textAlign: 'left',
                background: isOrigin ? 'rgba(255, 215, 0, 0.25)' : 'rgba(100, 200, 255, 0.08)',
                border: isOrigin ? '2px solid #ffd700' : '1px solid rgba(100, 200, 255, 0.25)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: isOrigin ? 'bold' : 'normal',
                color: isOrigin ? '#ffd700' : '#e0e0ff',
                fontSize: '13px',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{hub.name}</div>
              <div style={{ fontSize: '11px', color: '#8899cc', marginTop: '4px' }}>
                {hub.country} • {((hub.population ?? 0) / 1e6).toFixed(1)}M
                {hub.gdpPerCapitaUsd != null && (
                  <span> • GDP/cap ${Math.round(hub.gdpPerCapitaUsd).toLocaleString()}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
