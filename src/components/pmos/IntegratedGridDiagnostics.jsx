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
  ['syntheticFeederCount', 'Synthetic feeders'],
  ['intermodalFeederCount', 'Intermodal feeders'],
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
        {diagnostics?.geometryViolations && (
          <>
            <dt style={{ margin: 0, opacity: 0.85 }}>E2E ground violations</dt>
            <dd style={{ margin: 0, textAlign: 'right' }} data-testid="geom-e2e-ground">
              {diagnostics.geometryViolations.e2eGround}
            </dd>
            <dt style={{ margin: 0, opacity: 0.85 }}>E2M long-ground violations</dt>
            <dd style={{ margin: 0, textAlign: 'right' }} data-testid="geom-e2m-ground">
              {diagnostics.geometryViolations.e2mLongGround}
            </dd>
            <dt style={{ margin: 0, opacity: 0.85 }}>Hyperloop arc violations</dt>
            <dd style={{ margin: 0, textAlign: 'right' }} data-testid="geom-hyperloop-arc">
              {diagnostics.geometryViolations.hyperloopArc}
            </dd>
          </>
        )}
        {diagnostics?.feederSummary && (
          <>
            <dt style={{ margin: 0, opacity: 0.85 }}>Feeder branches (graph)</dt>
            <dd style={{ margin: 0, textAlign: 'right' }} data-testid="feeder-branch-count">
              {diagnostics.feederSummary.feederBranch}
            </dd>
            <dt style={{ margin: 0, opacity: 0.85 }}>Regional loops (graph)</dt>
            <dd style={{ margin: 0, textAlign: 'right' }}>
              {diagnostics.feederSummary.regionalLoop}
            </dd>
          </>
        )}
      </dl>
      {diagnostics?.simulationDebug && import.meta.env?.DEV && (
        <div
          data-testid="simulation-stats"
          style={{ marginTop: 10, fontSize: 10, lineHeight: 1.5, color: '#c8b0e8' }}
        >
          <div style={{ marginBottom: 4 }}>
            Simulation {diagnostics.simulationDebug.stats?.year} —{' '}
            {diagnostics.simulationDebug.stats?.eraLabel}
          </div>
          <div>
            Bottlenecks: {diagnostics.simulationDebug.stats?.hubBottleneckCount} hubs /{' '}
            {diagnostics.simulationDebug.stats?.corridorBottleneckCount} corridors
          </div>
          <div style={{ marginTop: 4, opacity: 0.9 }}>Top congested hubs</div>
          <ul style={{ margin: 0, paddingLeft: 14 }}>
            {diagnostics.simulationDebug.topCongestedHubs?.slice(0, 4).map((n) => (
              <li key={n.id}>
                {diagnostics.economicDebug?.topNodes?.find?.((x) => x.id === n.id)?.name ??
                  n.id.slice(0, 28)}
                … util {n.utilizationRate?.toFixed?.(0)}%
              </li>
            ))}
          </ul>
        </div>
      )}
      {diagnostics?.economicDebug && import.meta.env?.DEV && (
        <div style={{ marginTop: 10, fontSize: 10, lineHeight: 1.45, color: '#9ab0e0' }}>
          <div style={{ marginBottom: 4, opacity: 0.9 }}>Top civilization nodes</div>
          <ul style={{ margin: 0, paddingLeft: 14 }}>
            {diagnostics.economicDebug.topNodes?.slice(0, 5).map((n) => (
              <li key={n.id}>
                {n.name} — civ {n.civilizationIndex?.toFixed?.(0) ?? n.civilizationIndex}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 6, opacity: 0.9 }}>Top strategic routes</div>
          <ul style={{ margin: 0, paddingLeft: 14 }}>
            {diagnostics.economicDebug.topRoutes?.slice(0, 5).map((r) => (
              <li key={r.id}>
                {r.id.slice(0, 40)}… — {r.civilizationImportance?.toFixed?.(0)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {diagnostics?.routePipeline?.validation && import.meta.env?.DEV && (
        <div
          data-testid="phase7d-validation"
          style={{ marginTop: 10, fontSize: 10, lineHeight: 1.55, color: '#b8c8f0' }}
        >
          <div style={{ marginBottom: 4, fontWeight: 600 }}>Phase 7D validation</div>
          <div>
            E2E arcs: {diagnostics.routePipeline.validation.geometry?.e2eArcsRendered} | E2E path
            violations: {diagnostics.routePipeline.validation.geometry?.e2ePathViolations}
          </div>
          <div>
            E2M arcs: {diagnostics.routePipeline.validation.geometry?.e2mArcsRendered} | E2M path
            violations: {diagnostics.routePipeline.validation.geometry?.e2mPathViolations}
          </div>
          <div>
            Hyperloop paths: {diagnostics.routePipeline.validation.geometry?.hyperloopPathsRendered}{' '}
            | Ocean violations: {diagnostics.routePipeline.validation.geometry?.hyperloopOceanViolations}
          </div>
          <div>
            Unowned @ planetary: {diagnostics.routePipeline.validation.topology?.unownedVisibleRoutes}{' '}
            | Visible routes: {diagnostics.routePipeline.validation.topology?.visiblePlanetaryRouteCount}
          </div>
          <div style={{ marginTop: 4, opacity: 0.9 }}>
            Regional trunks — AF:{' '}
            {diagnostics.routePipeline.validation.regional?.africa ? '✓' : '—'} SA:{' '}
            {diagnostics.routePipeline.validation.regional?.southAmerica ? '✓' : '—'} NA:{' '}
            {diagnostics.routePipeline.validation.regional?.northAmerica ? '✓' : '—'} EU:{' '}
            {diagnostics.routePipeline.validation.regional?.europe ? '✓' : '—'} AS:{' '}
            {diagnostics.routePipeline.validation.regional?.asia ? '✓' : '—'}
          </div>
          <div
            style={{
              marginTop: 4,
              color: diagnostics.routePipeline.validation.pass ? '#7dffb0' : '#ffb07d',
            }}
          >
            {diagnostics.routePipeline.validation.pass ? 'PASS' : 'CHECK FAILURES'}
          </div>
        </div>
      )}
      {diagnostics?.routePipeline && (
        <div
          data-testid="route-pipeline-stats"
          style={{ marginTop: 10, fontSize: 10, lineHeight: 1.5, color: '#a8b8e8' }}
        >
          <div>
            View: {diagnostics.routePipeline.viewMode} | Zoom:{' '}
            {Number(diagnostics.routePipeline.zoom).toFixed(1)}
          </div>
          <div>
            Showing {diagnostics.routePipeline.visibleEdges} /{' '}
            {diagnostics.routePipeline.totalEdgesConsidered} edges
          </div>
          <div>
            Arcs: {diagnostics.routePipeline.arcs} | Spine: {diagnostics.routePipeline.trunkPaths}{' '}
            | Loops: {diagnostics.routePipeline.loopPaths} | Feeders:{' '}
            {diagnostics.routePipeline.feederPaths} | Cargo arcs:{' '}
            {diagnostics.routePipeline.cargoArcs ?? diagnostics.routePipeline.cargoPaths}{' '}
            | Hidden: {diagnostics.routePipeline.hiddenEdges}
            {diagnostics.routePipeline.economicPruned != null &&
              ` | Econ pruned: ${diagnostics.routePipeline.economicPruned}`}
          </div>
        </div>
      )}
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
