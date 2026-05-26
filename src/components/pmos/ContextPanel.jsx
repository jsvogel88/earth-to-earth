import React, { useMemo } from 'react';

function formatPopulation(pop) {
  if (pop == null) return '—';
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${Math.round(pop / 1000)}K`;
  return String(pop);
}

function formatGdp(gdp) {
  if (gdp == null) return '—';
  if (gdp >= 1e12) return `$${(gdp / 1e12).toFixed(1)}T`;
  if (gdp >= 1e9) return `$${(gdp / 1e9).toFixed(0)}B`;
  return `$${gdp.toLocaleString()}`;
}

function estimateThroughput(city) {
  const pop = city.population ?? 0;
  const gdp = city.gdp ?? city.gdpUsd ?? 0;
  return Math.round(pop * 0.002 + gdp * 1e-9 * 50);
}

function estimateCargoScore(city) {
  const pop = city.population ?? 0;
  let score = Math.min(100, Math.round(Math.log10(pop + 1) * 12));
  if (city.potentialRareEarthHub) score += 15;
  if (city.isRemoteNode) score += 10;
  return Math.min(100, score);
}

function estimateStrategicImportance(city, distanceFromAnchor) {
  let s = 40;
  if ((city.population ?? 0) > 5_000_000) s += 25;
  if (city.isSwitchNode) s += 15;
  if (city.trunkCorridors?.length) s += 10;
  if (distanceFromAnchor != null && distanceFromAnchor < 400) s += 10;
  return Math.min(100, s);
}

export default function ContextPanel({ cityInfo, origin, mapDisplayMode, onClose }) {
  const profile = useMemo(() => {
    if (!cityInfo?.city) return null;
    const city = cityInfo.city;
    const distance = cityInfo.distance;
    return {
      name: city.name,
      country: city.country,
      population: city.population,
      gdp: city.gdp ?? city.gdpUsd,
      throughput: estimateThroughput(city),
      cargoScore: estimateCargoScore(city),
      strategic: estimateStrategicImportance(city, distance),
      corridor: city.corridor || 'Regional',
      tier: city.tier,
      modes: [mapDisplayMode].filter(Boolean),
      growth: city.potentialFutureE2EHub ? 'High (planned hub)' : 'Stable',
      distance,
      flags: {
        switch: city.isSwitchNode,
        rareEarth: city.potentialRareEarthHub,
        futureHub: city.potentialFutureE2EHub,
        remote: city.isRemoteNode,
      },
      extra: city,
    };
  }, [cityInfo, mapDisplayMode]);

  if (!profile) return null;

  return (
    <aside
      className="pmos-context-panel pmos-glass-strong pmos-animate-in-right"
      data-testid="pmos-context-panel"
      aria-label="City profile"
    >
      <button type="button" className="pmos-context-close" onClick={onClose} aria-label="Close">
        ×
      </button>

      <div className="pmos-label pmos-mode-accent">City profile</div>
      <h2 className="pmos-title" style={{ marginTop: 4, marginBottom: 2 }}>
        {profile.name}
      </h2>
      <p className="pmos-subtitle">{profile.country}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
        <div className="pmos-context-metric">
          <span className="pmos-label">Population</span>
          <span className="pmos-context-metric-value">{formatPopulation(profile.population)}</span>
        </div>
        <div className="pmos-context-metric">
          <span className="pmos-label">GDP</span>
          <span className="pmos-context-metric-value">{formatGdp(profile.gdp)}</span>
        </div>
        <div className="pmos-context-metric">
          <span className="pmos-label">Throughput est.</span>
          <span className="pmos-context-metric-value pmos-mode-accent">{profile.throughput}</span>
        </div>
        <div className="pmos-context-metric">
          <span className="pmos-label">Cargo score</span>
          <span className="pmos-context-metric-value">{profile.cargoScore}</span>
        </div>
        <div className="pmos-context-metric">
          <span className="pmos-label">Strategic</span>
          <span className="pmos-context-metric-value">{profile.strategic}/100</span>
        </div>
        {profile.distance != null && (
          <div className="pmos-context-metric">
            <span className="pmos-label">From anchor</span>
            <span className="pmos-context-metric-value">{Math.round(profile.distance)} mi</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="pmos-context-metric">
          <span className="pmos-label">Corridor</span>
          <span style={{ fontSize: 13 }}>{profile.corridor}</span>
        </div>
        {origin && (
          <div className="pmos-context-metric">
            <span className="pmos-label">E2E anchor</span>
            <span style={{ fontSize: 13 }}>{origin.name}</span>
          </div>
        )}
        <div className="pmos-context-metric">
          <span className="pmos-label">Growth outlook</span>
          <span style={{ fontSize: 13 }}>{profile.growth}</span>
        </div>
        {profile.tier != null && (
          <div className="pmos-context-metric">
            <span className="pmos-label">Node tier</span>
            <span style={{ fontSize: 13 }}>{profile.tier}</span>
          </div>
        )}
      </div>

      {(profile.flags.rareEarth || profile.flags.futureHub || profile.flags.switch) && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {profile.flags.switch && <span className="pmos-chip">Switch node</span>}
          {profile.flags.rareEarth && <span className="pmos-chip">Rare earth candidate</span>}
          {profile.flags.futureHub && <span className="pmos-chip">Future hub</span>}
        </div>
      )}

      {profile.extra.trunkCorridors?.length > 0 && (
        <p className="pmos-subtitle" style={{ marginTop: 12 }}>
          Corridors: {profile.extra.trunkCorridors.join(', ')}
        </p>
      )}
    </aside>
  );
}

export function RouteContextPanel({ route, onClose }) {
  if (!route) return null;
  const miles = route.distanceMiles ?? route.miles ?? 0;
  const throughput = Math.round(miles * 12 + (route.importance ?? 50) * 8);

  return (
    <aside className="pmos-context-panel pmos-glass-strong pmos-animate-in-right" data-testid="pmos-route-context">
      <button type="button" className="pmos-context-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <div className="pmos-label pmos-mode-accent">Route profile</div>
      <h2 className="pmos-title" style={{ marginTop: 4 }}>
        {route.label || route.id || 'Corridor segment'}
      </h2>
      <div className="pmos-context-metric">
        <span className="pmos-label">Distance</span>
        <span className="pmos-context-metric-value">{Math.round(miles).toLocaleString()} mi</span>
      </div>
      <div className="pmos-context-metric">
        <span className="pmos-label">Throughput est.</span>
        <span className="pmos-context-metric-value">{throughput}</span>
      </div>
      {route.routeClass && (
        <div className="pmos-context-metric">
          <span className="pmos-label">Class</span>
          <span style={{ fontSize: 13 }}>{route.routeClass}</span>
        </div>
      )}
    </aside>
  );
}
