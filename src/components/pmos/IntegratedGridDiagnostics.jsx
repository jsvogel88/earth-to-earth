import React from 'react';

const METRIC_KEYS = [
  ['totalNodes', 'Total nodes'],
  ['totalEdges', 'Total edges'],
  ['e2eHubCount', 'E2E hubs'],
  ['mineralHubCount', 'Mineral hubs'],
  ['e2eRouteCount', 'E2E routes'],
  ['e2mRouteCount', 'E2M routes'],
  ['loopRouteCount', 'Loop routes'],
  ['hyperloopRouteCount', 'Hyperloop routes'],
  ['orphanMineralHubCount', 'Orphan mineral hubs'],
  ['duplicateEdgeCountRemoved', 'Duplicates removed'],
  ['renderedVisibleNodeCount', 'Rendered nodes'],
  ['renderedVisibleEdgeCount', 'Rendered edges'],
  ['currentZoomTier', 'Zoom tier'],
];

/**
 * Collapsed-by-default integrated graph diagnostics readout.
 * @param {object} props
 * @param {object | null} props.diagnostics
 * @param {string | null} [props.error]
 * @param {number} [props.visibleNodeCount]
 * @param {number} [props.visibleEdgeCount]
 * @param {string} [props.zoomTier]
 */
export default function IntegratedGridDiagnostics({
  diagnostics,
  error = null,
  visibleNodeCount,
  visibleEdgeCount,
  zoomTier = null,
}) {
  if (!diagnostics && !error) return null;

  return (
    <details
      className="integrated-grid-diagnostics"
      data-testid="integrated-grid-diagnostics"
      style={{ marginTop: 10, fontSize: 11, color: '#8899cc' }}
    >
      <summary className="pmos-label" style={{ cursor: 'pointer' }}>
        Grid diagnostics
      </summary>
      <dl
        style={{
          margin: '8px 0 0',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '4px 12px',
          fontSize: 11,
        }}
      >
        {METRIC_KEYS.map(([key, label]) => {
          if (diagnostics?.[key] == null) return null;
          return (
            <React.Fragment key={key}>
              <dt style={{ margin: 0, opacity: 0.85 }}>{label}</dt>
              <dd style={{ margin: 0, textAlign: 'right' }}>{diagnostics[key]}</dd>
            </React.Fragment>
          );
        })}
        {visibleNodeCount != null && (
          <>
            <dt style={{ margin: 0, opacity: 0.85 }}>Visible nodes (filter)</dt>
            <dd style={{ margin: 0, textAlign: 'right' }}>{visibleNodeCount}</dd>
          </>
        )}
        {visibleEdgeCount != null && (
          <>
            <dt style={{ margin: 0, opacity: 0.85 }}>Visible edges (filter)</dt>
            <dd style={{ margin: 0, textAlign: 'right' }}>{visibleEdgeCount}</dd>
          </>
        )}
        {zoomTier && (
          <>
            <dt style={{ margin: 0, opacity: 0.85 }}>Zoom tier (live)</dt>
            <dd style={{ margin: 0, textAlign: 'right' }} data-testid="diagnostics-zoom-tier">
              {zoomTier}
            </dd>
          </>
        )}
      </dl>
      {error && (
        <p style={{ marginTop: 8, color: '#ff8a7a', fontSize: 11 }} data-testid="integrated-graph-error">
          {error}
        </p>
      )}
      {diagnostics?.warnings?.length > 0 && (
        <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 10, lineHeight: 1.4 }}>
          {diagnostics.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </details>
  );
}
