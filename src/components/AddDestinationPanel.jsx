import { useMemo, useState } from 'react';
import {
  CUSTOM_DESTINATION_ROLES,
  CONNECTION_MODES,
  defaultEnabledLayersForRole,
  layerTagOptionsForSelect,
  roleOptionsForSelect,
  connectionModeOptionsForSelect,
  suggestRoleAndLayersForCity,
  formatPopulation,
  formatCoordinates,
} from '../data/userCustomDestinations.js';
import { searchWorldCities } from '../utils/worldCitySearch.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

function CityResultCard({ city, isSelected, isAdded, onSelect }) {
  const lat = city.latitude ?? city.lat;
  const lon = city.longitude ?? city.lon;
  const { role, badges } = suggestRoleAndLayersForCity(city);
  const popStr = formatPopulation(city.population);
  const coordStr = formatCoordinates(lat, lon);

  return (
    <button
      type="button"
      className={`ncc-result-card ${isSelected ? 'is-selected' : ''} ${isAdded ? 'is-added' : ''}`}
      disabled={isAdded}
      onClick={() => !isAdded && onSelect(city)}
      aria-pressed={isSelected}
    >
      <div className="ncc-result-card-head">
        <span className="ncc-result-name">{city.name}</span>
        {isAdded && <span className="ncc-badge ncc-badge-warn">City already added</span>}
      </div>
      <div className="ncc-result-country">{city.country}</div>
      <div className="ncc-result-meta">
        {popStr != null && <span>Pop. {popStr}</span>}
        {coordStr != null && <span>{coordStr}</span>}
        {!popStr && !coordStr && <span>Planning coordinates</span>}
      </div>
      <div className="ncc-result-badges">
        <span className="ncc-suggest-badge ncc-suggest-role" title="Suggested role">
          {role.replace('Custom ', '')}
        </span>
        {badges.map((b) => (
          <span key={b} className="ncc-suggest-badge">
            {b}
          </span>
        ))}
      </div>
    </button>
  );
}

export default function AddDestinationPanel({ onAdd, existingWorldCityIds = new Set() }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [oneMillionPlus, setOneMillionPlus] = useState(false);
  const [rareEarthFilter, setRareEarthFilter] = useState(false);
  const [e2mFilter, setE2mFilter] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [role, setRole] = useState(CUSTOM_DESTINATION_ROLES.CUSTOM_E2E_CANDIDATE);
  const [enabledLayers, setEnabledLayers] = useState(
    defaultEnabledLayersForRole(CUSTOM_DESTINATION_ROLES.CUSTOM_E2E_CANDIDATE)
  );
  const [connectionMode, setConnectionMode] = useState(CONNECTION_MODES.NONE);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');

  const searchFilters = useMemo(
    () => ({
      requireCoordinates: true,
      oneMillionPlus,
      rareEarthCandidate: rareEarthFilter,
      e2mCandidate: e2mFilter,
    }),
    [oneMillionPlus, rareEarthFilter, e2mFilter]
  );

  const results = useMemo(
    () =>
      searchWorldCities({
        query: debouncedQuery,
        limit: 25,
        filters: searchFilters,
      }),
    [debouncedQuery, searchFilters]
  );

  const trimmedQuery = debouncedQuery.trim();
  const showStartTyping = !trimmedQuery;
  const showNoResults = trimmedQuery.length > 0 && results.length === 0;

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    const suggestion = suggestRoleAndLayersForCity(city);
    setRole(suggestion.role);
    setEnabledLayers(suggestion.layers);
    setStatus('');
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setEnabledLayers(defaultEnabledLayersForRole(nextRole));
  };

  const toggleLayer = (tag) => {
    setEnabledLayers((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleConnectionChange = (next) => {
    setConnectionMode(next);
  };

  const handleAdd = () => {
    if (!selectedCity) {
      setStatus('Select a city from search results first.');
      return;
    }
    if (existingWorldCityIds.has(selectedCity.worldCityId)) {
      setStatus('City already added.');
      return;
    }
    const result = onAdd(
      {
        ...selectedCity,
        lat: selectedCity.latitude ?? selectedCity.lat,
        lon: selectedCity.longitude ?? selectedCity.lon,
      },
      {
        selectedRole: role,
        enabledLayers,
        connectionMode,
        manualHubId: null,
        manualHubName: null,
        customNotes: notes,
      }
    );
    if (result?.duplicate) {
      setStatus('City already added.');
      return;
    }
    setStatus(`Added ${selectedCity.name} as planning node (no routes).`);
    setSelectedCity(null);
    setQuery('');
    setConnectionMode(CONNECTION_MODES.NONE);
    setNotes('');
  };

  return (
    <div className="ncc-section-body">
      <p className="ncc-helper">
        Search worldCities and add planning markers only — no automatic routes.
      </p>
      <input
        type="search"
        className="e2e-hub-search"
        placeholder="City or country…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search world cities"
      />
      <div className="ncc-filter-row">
        <label className="transport-os-check">
          <input
            type="checkbox"
            checked={oneMillionPlus}
            onChange={(e) => setOneMillionPlus(e.target.checked)}
          />
          1M+ pop
        </label>
        <label className="transport-os-check">
          <input
            type="checkbox"
            checked={rareEarthFilter}
            onChange={(e) => setRareEarthFilter(e.target.checked)}
          />
          Cargo / remote
        </label>
        <label className="transport-os-check">
          <input
            type="checkbox"
            checked={e2mFilter}
            onChange={(e) => setE2mFilter(e.target.checked)}
          />
          E2M coastal
        </label>
      </div>

      {showStartTyping && (
        <p className="ncc-empty-state" role="status">
          Start typing to search cities
        </p>
      )}

      {showNoResults && (
        <p className="ncc-empty-state ncc-empty-warn" role="status">
          No matching cities found
        </p>
      )}

      {!showStartTyping && results.length > 0 && (
        <div className="ncc-search-results" role="listbox" aria-label="City search results">
          {results.map((city) => (
            <CityResultCard
              key={city.worldCityId}
              city={city}
              isSelected={selectedCity?.worldCityId === city.worldCityId}
              isAdded={existingWorldCityIds.has(city.worldCityId)}
              onSelect={handleSelectCity}
            />
          ))}
        </div>
      )}

      {selectedCity && (
        <div className="ncc-selection-block">
          <div className="ncc-selection-title">
            Selected: {selectedCity.name}
            {existingWorldCityIds.has(selectedCity.worldCityId) && (
              <span className="ncc-badge ncc-badge-warn">City already added</span>
            )}
          </div>
          <label className="ncc-field-label">
            Role
            <select
              className="ncc-select"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {roleOptionsForSelect().map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="ncc-field-label">Show on layers</div>
          <div className="ncc-layer-chips">
            {layerTagOptionsForSelect().map((opt) => (
              <label key={opt.id} className="transport-os-check">
                <input
                  type="checkbox"
                  checked={enabledLayers.includes(opt.id)}
                  onChange={() => toggleLayer(opt.id)}
                />
                {opt.label}
              </label>
            ))}
          </div>
          <label className="ncc-field-label">
            Connection (planning only)
            <select
              className="ncc-select"
              value={connectionMode}
              onChange={(e) => handleConnectionChange(e.target.value)}
            >
              {connectionModeOptionsForSelect().map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {connectionMode === CONNECTION_MODES.MANUAL_HUB && (
            <label className="ncc-field-label">
              Manual hub
              <select className="ncc-select" disabled value="">
                <option value="">Manual hub picker coming next</option>
              </select>
              <span className="ncc-helper">Stored as planning-only; no hub link yet.</span>
            </label>
          )}
          <input
            type="text"
            className="e2e-hub-search"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            type="button"
            className="ncc-primary-btn"
            onClick={handleAdd}
            disabled={existingWorldCityIds.has(selectedCity.worldCityId)}
          >
            Add to map
          </button>
        </div>
      )}

      {status && <p className="ncc-status">{status}</p>}
    </div>
  );
}
