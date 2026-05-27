import React from 'react';
import { getStudioVersion } from '../studioVersionStore.js';

export default function VersionsPanel({
  versions = [],
  compareVersionId,
  compareDiffKeys = [],
  compareDetailRows = [],
  compareTruncated = false,
  onSaveVersion,
  onRestoreVersion,
  onCompareVersion,
  onExportVersions,
  onClearCompare,
  onPreviewVersion,
  onExitVersionPreview,
  previewingVersionId,
}) {
  const compareVersion = compareVersionId ? getStudioVersion(compareVersionId) : null;

  return (
    <div className="pls-panel" data-testid="studio-versions-panel">
      <h3 className="pls-h3">Versions</h3>
      <p className="pls-sub">Local snapshots of layer state and studio metadata. Session autosaves on change.</p>
      {previewingVersionId && (
        <div className="pls-preview-banner" data-testid="version-preview-banner">
          <strong>Previewing saved layers</strong>
          <button type="button" className="pls-btn pls-btn-sm" onClick={onExitVersionPreview}>
            Exit preview
          </button>
        </div>
      )}

      {compareVersion && (
        <div className="pls-compare-box" data-testid="studio-version-compare">
          <strong>Comparing to: {compareVersion.label}</strong>
          <p className="pls-meta">{compareDiffKeys.length} layer flag(s) differ from current map</p>
          {compareDetailRows.length > 0 ? (
            <table className="pls-diff-table">
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Current</th>
                  <th>Saved</th>
                </tr>
              </thead>
              <tbody>
                {compareDetailRows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <code>{row.key}</code>
                    </td>
                    <td>{String(row.current)}</td>
                    <td>{String(row.saved)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : compareDiffKeys.length > 0 ? (
            <ul className="pls-diff-keys">
              {compareDiffKeys.slice(0, 24).map((key) => (
                <li key={key}>
                  <code>{key}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pls-meta">No layer differences detected.</p>
          )}
          {compareTruncated && <p className="pls-meta">Showing first rows — export JSON for full diff.</p>}
          <button type="button" className="pls-btn pls-btn-ghost pls-btn-sm" onClick={onClearCompare}>
            Clear compare
          </button>
        </div>
      )}

      <ul className="pls-version-list">
        {versions.length === 0 && <li className="pls-meta">No saved versions yet.</li>}
        {versions.map((v) => (
          <li key={v.id} className={compareVersionId === v.id ? 'is-active' : ''}>
            <span>{v.label}</span>
            <div className="pls-version-actions">
              <button
                type="button"
                className="pls-btn pls-btn-ghost pls-btn-sm"
                data-testid={`preview-version-${v.id}`}
                onClick={() => onPreviewVersion?.(v.id)}
              >
                Preview
              </button>
              <button
                type="button"
                className="pls-btn pls-btn-ghost pls-btn-sm"
                data-testid={`restore-version-${v.id}`}
                onClick={() => onRestoreVersion?.(v.id)}
              >
                Restore
              </button>
              <button
                type="button"
                className="pls-btn pls-btn-ghost pls-btn-sm"
                data-testid={`compare-version-${v.id}`}
                onClick={() => onCompareVersion?.(v.id)}
              >
                Compare
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="pls-action-grid">
        <button type="button" className="pls-btn pls-btn-sm" data-testid="save-studio-version" onClick={onSaveVersion}>
          Save Current Version
        </button>
        <button
          type="button"
          className="pls-btn pls-btn-sm"
          disabled={!versions.length}
          onClick={() => versions[0] && onRestoreVersion?.(versions[0].id)}
        >
          Restore Latest
        </button>
        <button
          type="button"
          className="pls-btn pls-btn-sm"
          disabled={!versions.length}
          onClick={() => versions[0] && onCompareVersion?.(versions[0].id)}
        >
          Compare Latest
        </button>
        <button type="button" className="pls-btn pls-btn-sm" data-testid="export-studio-versions" onClick={onExportVersions}>
          Export JSON
        </button>
      </div>
    </div>
  );
}
