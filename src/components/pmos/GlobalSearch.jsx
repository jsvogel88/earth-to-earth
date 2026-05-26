import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchGlobalIndex, getSearchSuggestions } from '../../ui/globalSearchIndex.js';

export default function GlobalSearch({ hubs = [], onSelectResult, onFlyTo }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

  const results = query.trim()
    ? searchGlobalIndex(query, { hubs, limit: 10 })
    : getSearchSuggestions({ hubs }).slice(0, 8);

  const handleSelect = useCallback(
    (result) => {
      if (!result) return;
      onSelectResult?.(result);
      if (result.lat != null && result.lon != null) {
        onFlyTo?.({
          lat: result.lat,
          lon: result.lon,
          zoom: result.zoom ?? 6,
          title: result.title,
          type: result.type,
          payload: result.payload,
        });
      }
      setQuery('');
      setOpen(false);
    },
    [onSelectResult, onFlyTo]
  );

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && results[highlight]) {
      e.preventDefault();
      handleSelect(results[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="pmos-search" ref={wrapRef} data-testid="pmos-global-search">
      <span className="pmos-search-icon" aria-hidden>
        ⌕
      </span>
      <input
        type="search"
        className="pmos-search-input"
        placeholder="Search cities, hubs, corridors…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        aria-label="Global search"
        aria-expanded={open}
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <div className="pmos-search-dropdown pmos-glass-strong" role="listbox">
          {results.map((r, i) => (
            <button
              key={r.id}
              type="button"
              role="option"
              className={`pmos-search-result ${i === highlight ? 'is-highlighted' : ''}`}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => handleSelect(r)}
            >
              <span className="pmos-search-result-type">{r.type}</span>
              <span className="pmos-search-result-title">{r.title}</span>
              {r.subtitle && <span className="pmos-search-result-sub">{r.subtitle}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
