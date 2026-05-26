import { useMemo, useState } from 'react';
import ParsedCityCard from './ParsedCityCard.jsx';

const SECTIONS = [
  { key: 'valid', label: 'Valid', prop: 'valid' },
  { key: 'unresolved', label: 'Invalid / unresolved', prop: 'unresolved' },
  { key: 'duplicates', label: 'Duplicates', prop: 'duplicates' },
  { key: 'alreadyAdded', label: 'Already added', prop: 'alreadyAdded' },
];

const VIRTUAL_LIMIT = 80;

export default function ParsingResults({ parseResult, onRemoveParsed }) {
  const [expanded, setExpanded] = useState({ valid: true, unresolved: true });

  const sections = useMemo(() => {
    if (!parseResult) return [];
    return SECTIONS.map(({ key, label, prop }) => {
      const items = parseResult[prop] || [];
      return { key, label, items, count: items.length };
    }).filter((s) => s.count > 0);
  }, [parseResult]);

  if (!parseResult || sections.length === 0) {
    return (
      <p className="ncc-helper parse-results-empty" role="status">
        Parse a list to see valid cities, errors, and suggestions.
      </p>
    );
  }

  return (
    <div className="parse-results-panel">
      {sections.map(({ key, label, items, count }) => {
        const open = expanded[key] !== false;
        const slice = items.slice(0, VIRTUAL_LIMIT);
        const hasMore = items.length > VIRTUAL_LIMIT;
        return (
          <div key={key} className="parse-results-section">
            <button
              type="button"
              className="parse-results-section-toggle"
              onClick={() => setExpanded((e) => ({ ...e, [key]: !open }))}
              aria-expanded={open}
            >
              <span>{label}</span>
              <span className="parse-count-badge">{count}</span>
              <span aria-hidden>{open ? '−' : '+'}</span>
            </button>
            {open && (
              <ul className="parse-results-list">
                {slice.map((entry, i) => (
                  <li key={`${key}-${entry.rawInput}-${i}`} className="parse-results-line">
                    {entry.city ? (
                      <ParsedCityCard
                        city={entry.city}
                        status={entry.status}
                        onRemove={key === 'valid' && onRemoveParsed ? onRemoveParsed : undefined}
                        compact
                      />
                    ) : (
                      <div className="parse-unresolved-line">
                        <span className="parse-unresolved-raw">{entry.rawInput}</span>
                        {entry.reason && (
                          <span className="parse-unresolved-reason">{entry.reason}</span>
                        )}
                        {entry.suggestions?.length > 0 && (
                          <div className="parse-suggestions">
                            <span className="ncc-helper">Suggested:</span>
                            {entry.suggestions.slice(0, 3).map((s) => (
                              <span key={s.id} className="parse-suggest-chip">
                                {s.city}, {s.country}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
                {hasMore && (
                  <li className="ncc-helper">+ {items.length - VIRTUAL_LIMIT} more (scroll list in export)</li>
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
