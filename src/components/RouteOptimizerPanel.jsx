import React, { useState, useMemo, useCallback } from 'react';
import {
  loadCities,
  analyzeNetwork,
  getTopRoutes,
  getTotalNetworkRevenue,
  runOptimization,
  citiesFromPreset,
  project5YearRevenue,
  revenueBreakdown,
  phase1LaunchSequence,
  formatCurrency,
  formatTimeHours,
  formatDistanceKm,
} from '../routeModel/index.js';

const panelStyle = {
  background: 'rgba(13, 20, 45, 0.95)',
  border: '1px solid rgba(100, 200, 255, 0.4)',
  borderRadius: '8px',
  padding: '16px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  pointerEvents: 'auto',
};

const STRATEGIES = [
  { id: 'constraint-collapse', label: 'Constraint-collapse' },
  { id: 'greedy', label: 'Greedy hubs' },
  { id: 'military-first', label: 'Military-first' },
  { id: 'cargo-focused', label: 'Cargo-focused' },
];

const SORT_OPTIONS = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'timeSavings', label: 'Time savings' },
  { id: 'strategic', label: 'Strategic' },
  { id: 'distance', label: 'Distance' },
];

export default function RouteOptimizerPanel({
  variant = 'embed',
  onAnalysisComplete,
  collapsed = false,
  onToggleCollapse,
}) {
  const isPage = variant === 'page';
  const allCities = useMemo(() => loadCities(), []);
  const [selectedCodes, setSelectedCodes] = useState(() =>
    citiesFromPreset('firstLaunch6').map((c) => c.code)
  );
  const [tierFilter, setTierFilter] = useState('all');
  const [strategy, setStrategy] = useState('constraint-collapse');
  const [sortBy, setSortBy] = useState('revenue');
  const [result, setResult] = useState(null);

  const selectedCities = useMemo(
    () => allCities.filter((c) => selectedCodes.includes(c.code)),
    [allCities, selectedCodes]
  );

  const filteredCities = useMemo(() => {
    if (tierFilter === 'all') return allCities;
    return allCities.filter((c) => c.tier === tierFilter);
  }, [allCities, tierFilter]);

  const toggleCity = useCallback((code) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }, []);

  const applyPreset = useCallback((key) => {
    setSelectedCodes(citiesFromPreset(key).map((c) => c.code));
  }, []);

  const runAnalysis = useCallback(() => {
    if (selectedCities.length < 2) return;
    const optimization = runOptimization(strategy, selectedCities);
    const routes =
      optimization.routes ??
      analyzeNetwork(selectedCities);
    const topRoutes = getTopRoutes(routes, 20, sortBy);
    const projection = project5YearRevenue(routes, selectedCities.length);
    const breakdown = revenueBreakdown(routes, selectedCities.length);
    const launch =
      strategy === 'constraint-collapse' || optimization.launchSequence
        ? optimization.launchSequence ?? phase1LaunchSequence(selectedCities)
        : null;

    const payload = {
      routes,
      topRoutes,
      totalRevenue: getTotalNetworkRevenue(routes),
      projection,
      breakdown,
      launchSequence: launch,
      hubOrder: optimization.hubOrder,
      strategy,
    };
    setResult(payload);
    onAnalysisComplete?.(payload);
  }, [selectedCities, strategy, sortBy, onAnalysisComplete]);

  const showBody = isPage || !collapsed;

  return (
    <div
      className={`route-optimizer-panel${isPage ? ' route-optimizer-panel--page' : ''}`}
      style={{
        ...(isPage ? {} : panelStyle),
        width: !isPage && collapsed ? '48px' : undefined,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!isPage && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: collapsed ? 0 : '12px',
          }}
        >
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 700, color: '#64c8ff', fontSize: '14px' }}>Route Optimizer</div>
              <div style={{ fontSize: '10px', color: '#8899cc' }}>Starship E2E network v1</div>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              background: 'rgba(100, 200, 255, 0.15)',
              border: '1px solid rgba(100, 200, 255, 0.3)',
              color: '#64c8ff',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
      )}

      {showBody && (
        <>
          <div style={{ marginBottom: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => applyPreset('default12')} style={btnStyle}>
              12-hub
            </button>
            <button type="button" onClick={() => applyPreset('firstLaunch6')} style={btnStyle}>
              Launch 6
            </button>
            <button type="button" onClick={() => setSelectedCodes([])} style={btnStyle}>
              Clear
            </button>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyle}>Tier filter</label>
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              <option value="1A">1A</option>
              <option value="1B">1B</option>
              <option value="1C">1C</option>
            </select>
          </div>

          <div
            className="route-optimizer-panel__city-list"
            style={{
              flex: isPage ? '1 1 200px' : '0 0 120px',
              overflowY: 'auto',
              marginBottom: '10px',
              border: '1px solid rgba(100,200,255,0.2)',
              borderRadius: '4px',
              padding: '6px',
              minHeight: isPage ? 120 : undefined,
            }}
          >
            {filteredCities.map((city) => (
              <label
                key={city.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  padding: '2px 0',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCodes.includes(city.code)}
                  onChange={() => toggleCity(city.code)}
                />
                <span style={{ color: '#e0e0ff' }}>
                  {city.name} <span style={{ color: '#8899cc' }}>({city.tier})</span>
                </span>
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyle}>Strategy</label>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)} style={selectStyle}>
              {STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={runAnalysis}
            disabled={selectedCities.length < 2}
            style={{
              ...btnStyle,
              width: '100%',
              padding: '10px',
              fontWeight: 'bold',
              marginBottom: '10px',
              opacity: selectedCities.length < 2 ? 0.5 : 1,
            }}
          >
            Run Network Analysis ({selectedCodes.length} hubs)
          </button>

          {result && (
            <div
              className="route-optimizer-panel__results"
              style={{ overflowY: 'auto', flex: 1, fontSize: '11px', minHeight: isPage ? 200 : undefined }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <Metric label="Routes" value={String(result.routes.length)} />
                <Metric label="Route revenue" value={formatCurrency(result.totalRevenue)} />
                <Metric label="Year 1" value={formatCurrency(result.projection.year1)} />
                <Metric label="Year 5" value={formatCurrency(result.projection.year5)} />
                <Metric
                  label="Military floor"
                  value={`${formatCurrency(result.breakdown.military.low)} – ${formatCurrency(result.breakdown.military.high)}`}
                />
              </div>

              {result.launchSequence && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={labelStyle}>Launch sequence</div>
                  {result.launchSequence.map((item, i) => (
                    <div key={i} style={{ color: '#b0c4ff', marginTop: '4px' }}>
                      {item.quarter}: {item.route?.originName ?? item.label?.split(' → ')[0]} →{' '}
                      {item.route?.destName ?? item.label?.split(' → ')[1]} (
                      {formatTimeHours(item.route?.timeSavingsHours ?? item.timeSavingsHours)})
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: '6px' }}>
                <label style={labelStyle}>Sort routes</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ color: '#8899cc', textAlign: 'left' }}>
                    <th style={thStyle}>Route</th>
                    <th style={thStyle}>Δt</th>
                    <th style={thStyle}>Rev</th>
                  </tr>
                </thead>
                <tbody>
                  {getTopRoutes(result.routes, 12, sortBy).map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid rgba(100,200,255,0.15)' }}>
                      <td style={tdStyle}>
                        {r.originName} → {r.destName}
                      </td>
                      <td style={tdStyle}>{formatTimeHours(r.timeSavingsHours)}</td>
                      <td style={tdStyle}>{formatCurrency(r.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div style={{ color: '#8899cc', fontSize: '9px' }}>{label}</div>
      <div style={{ fontWeight: 'bold', color: '#64c8ff', fontSize: '12px' }}>{value}</div>
    </div>
  );
}

const labelStyle = { color: '#8899cc', fontSize: '10px', marginBottom: '4px', display: 'block' };
const btnStyle = {
  background: 'rgba(100, 200, 255, 0.12)',
  border: '1px solid rgba(100, 200, 255, 0.35)',
  color: '#b0d4ff',
  borderRadius: '4px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '11px',
};
const selectStyle = {
  width: '100%',
  padding: '6px',
  fontSize: '11px',
  borderRadius: '4px',
  border: '1px solid rgba(100, 200, 255, 0.25)',
  background: 'rgba(10, 20, 45, 0.9)',
  color: '#e0e0ff',
};
const thStyle = { padding: '4px 2px' };
const tdStyle = { padding: '4px 2px', color: '#e0e0ff' };
