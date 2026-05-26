import { formatPopulation, formatCoordinates } from '../../data/userCustomDestinations.js';

export default function ParsedCityCard({ city, status, onRemove, compact = false }) {
  if (!city) return null;
  const popStr = formatPopulation(city.population);
  const coordStr = formatCoordinates(city.lat, city.lng);
  const confidence = Math.round((city.parsingConfidence ?? 0) * 100);

  return (
    <li className={`parse-city-card parse-city-card--${status || 'valid'}`}>
      <div className="parse-city-card-body">
        <div className="parse-city-card-head">
          <span className="parse-city-name">{city.city}</span>
          {status && <span className={`parse-city-badge parse-city-badge--${status}`}>{status}</span>}
        </div>
        <span className="parse-city-country">{city.country}</span>
        {!compact && (
          <div className="parse-city-meta">
            {popStr && <span>Pop. {popStr}</span>}
            {coordStr && <span>{coordStr}</span>}
            <span>{city.matchedBy} · {confidence}%</span>
            {city.suggestedRole && <span>{city.suggestedRole}</span>}
          </div>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          className="ncc-remove-btn"
          onClick={() => onRemove(city.id)}
          aria-label={`Remove ${city.city}`}
        >
          ×
        </button>
      )}
    </li>
  );
}
