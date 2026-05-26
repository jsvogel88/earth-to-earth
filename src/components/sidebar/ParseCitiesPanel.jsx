import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseCityList } from '../../features/parsing/parseCities.js';
import ParsingResults from './ParsingResults.jsx';

const PLACEHOLDER = `New York
London
Tokyo
Paris, France
São Paulo, Brazil`;

export default function ParseCitiesPanel({
  parsedCitiesHook,
  existingWorldCityIds = new Set(),
  mapNodes = [],
}) {
  const {
    parsedCities,
    previewCities,
    setPreviewCities,
    setParseErrors,
    lastParseResult,
    setLastParseResult,
    addAll,
    remove,
    removeAll,
    exportJson,
    importJson,
    showOnlyParsedCities,
    setShowOnlyParsedCities,
    autoFitParsedBounds,
    setAutoFitParsedBounds,
    hasMapPoints,
  } = parsedCitiesHook;

  const [input, setInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const existingParsedIds = useMemo(
    () => new Set(parsedCities.map((c) => c.id)),
    [parsedCities]
  );

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 120), 320)}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const runParse = useCallback(async () => {
    if (!input.trim()) {
      setStatus('Paste cities first.');
      return;
    }
    setParsing(true);
    setProgress({ done: 0, total: 0 });
    setStatus('');
    try {
      const result = await parseCityList(input, {
        existingWorldCityIds,
        existingParsedIds: existingParsedIds,
        mapNodes,
        onProgress: setProgress,
      });
      setLastParseResult(result);
      setParseErrors(result.unresolved.map((u) => u.rawInput));
      setStatus(
        `Parsed ${result.parsedCount} · failed ${result.failedCount} · dupes ${result.duplicateCount}`
      );
    } catch (err) {
      setStatus(err?.message || 'Parse failed');
    } finally {
      setParsing(false);
      setProgress(null);
    }
  }, [input, existingWorldCityIds, existingParsedIds, mapNodes, setLastParseResult, setParseErrors]);

  const handlePreview = useCallback(() => {
    if (!lastParseResult?.valid?.length) {
      setStatus('Parse first — no valid cities to preview.');
      return;
    }
    const preview = lastParseResult.valid.map((c) => ({
      ...c,
      isPreview: true,
      id: `preview:${c.id}`,
    }));
    setPreviewCities(preview);
    setStatus(`Previewing ${preview.length} cities on map (overlay only).`);
  }, [lastParseResult, setPreviewCities]);

  const handleAddAll = useCallback(() => {
    const toAdd = lastParseResult?.valid || [];
    if (!toAdd.length) {
      setStatus('Nothing to add — parse valid cities first.');
      return;
    }
    const added = addAll(toAdd);
    setPreviewCities([]);
    setStatus(`Added ${added.length} parsed cities (overlay only).`);
  }, [lastParseResult, addAll, setPreviewCities]);

  const handleClear = useCallback(() => {
    setInput('');
    setLastParseResult(null);
    setPreviewCities([]);
    setParseErrors([]);
    setStatus('');
  }, [setLastParseResult, setPreviewCities, setParseErrors]);

  const handleExport = useCallback(() => {
    const json = exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parsed-cities-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Exported JSON.');
  }, [exportJson]);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '');
        if (file.name.endsWith('.json')) {
          try {
            importJson(text);
            setStatus('Imported parsed cities from JSON.');
          } catch {
            setStatus('Invalid JSON file.');
          }
        } else {
          setInput((prev) => (prev ? `${prev}\n${text}` : text));
          setStatus(`Loaded ${file.name}`);
        }
      };
      reader.readAsText(file);
    },
    [importJson]
  );

  const onPaste = useCallback(() => {
    setStatus('Paste detected — click Parse when ready.');
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        runParse();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleAddAll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [runParse, handleAddAll]);

  const counts = lastParseResult
    ? {
        parsed: lastParseResult.parsedCount,
        failed: lastParseResult.failedCount,
        duplicates: lastParseResult.duplicateCount,
        added: parsedCities.length,
      }
    : { parsed: 0, failed: 0, duplicates: 0, added: parsedCities.length };

  return (
    <div className="parse-cities-panel ncc-section-body">
      <p className="ncc-helper">
        Bulk paste destinations — overlay markers only, never mutates the transport graph.
      </p>

      <div
        className={`parse-isolation-block ${showOnlyParsedCities ? 'is-active' : ''}`}
      >
        <label className="transport-os-check parse-isolation-toggle">
          <input
            type="checkbox"
            checked={showOnlyParsedCities}
            disabled={!hasMapPoints}
            onChange={(e) => setShowOnlyParsedCities(e.target.checked)}
            aria-label="Show only parsed cities"
          />
          Show Only Parsed Cities
        </label>
        <p className="ncc-helper parse-isolation-hint">
          Hides default hubs, routes, and transport layers temporarily. Your layer toggles are
          preserved — turn off to restore the full map.
        </p>
        {showOnlyParsedCities && (
          <p className="parse-isolation-active-badge" role="status">
            Isolation mode active
          </p>
        )}
        <label className="transport-os-check parse-isolation-sub">
          <input
            type="checkbox"
            checked={autoFitParsedBounds}
            disabled={!hasMapPoints}
            onChange={(e) => setAutoFitParsedBounds(e.target.checked)}
          />
          Auto-fit map to parsed cities
        </label>
      </div>

      <div
        className={`parse-drop-zone ${dragOver ? 'is-drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer?.files?.[0];
          handleFile(file);
        }}
      >
        <textarea
          ref={textareaRef}
          className="parse-cities-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={onPaste}
          placeholder={PLACEHOLDER}
          aria-label="City list to parse"
          rows={6}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.json"
          className="parse-file-input"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          className="parse-file-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          Drop TXT/CSV or browse
        </button>
      </div>

      <div className="parse-action-row">
        <button type="button" className="ncc-primary-btn" onClick={runParse} disabled={parsing}>
          {parsing ? 'Parsing…' : 'Parse'}
        </button>
        <button type="button" className="parse-secondary-btn" onClick={handlePreview}>
          Preview
        </button>
        <button type="button" className="parse-secondary-btn" onClick={handleAddAll}>
          Add All
        </button>
        <button type="button" className="parse-secondary-btn" onClick={handleClear}>
          Clear
        </button>
        <button type="button" className="parse-secondary-btn" onClick={handleExport}>
          Export JSON
        </button>
      </div>

      <p className="ncc-helper parse-shortcuts">
        Shortcuts: Ctrl+Shift+P parse · Ctrl+Shift+Enter add all
      </p>

      {(parsing || progress) && (
        <div className="parse-progress" role="status" aria-live="polite">
          <span className="parse-progress-spinner" aria-hidden />
          {progress?.total
            ? `Matching ${progress.done} / ${progress.total}…`
            : 'Parsing…'}
        </div>
      )}

      <div className="parse-count-badges">
        <span className="parse-count-badge" title="Parsed valid">
          Parsed <strong>{counts.parsed}</strong>
        </span>
        <span className="parse-count-badge parse-count-badge--warn" title="Failed">
          Failed <strong>{counts.failed}</strong>
        </span>
        <span className="parse-count-badge" title="Duplicates in paste">
          Dupes <strong>{counts.duplicates}</strong>
        </span>
        <span className="parse-count-badge parse-count-badge--ok" title="On map">
          Added <strong>{counts.added}</strong>
        </span>
      </div>

      {status && <p className="ncc-status">{status}</p>}

      <ParsingResults parseResult={lastParseResult} onRemoveParsed={remove} />

      {parsedCities.length > 0 && (
        <div className="parse-on-map-actions">
          <button type="button" className="parse-secondary-btn" onClick={removeAll}>
            Remove all from map ({parsedCities.length})
          </button>
        </div>
      )}
    </div>
  );
}
