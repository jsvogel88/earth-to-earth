/**
 * Short map-first legend copy for the sidebar when nothing is selected.
 */

export const INTEGRATED_MAP_LEGEND = [
  { color: '#00dcff', label: 'Hyperloop / tube spine — ground backbone' },
  { color: '#d4af37', label: 'E2E — global jump arcs (overlay)' },
  { color: '#ff6b35', label: 'E2M — mines & industrial feeders' },
  { color: '#00dcff', label: 'Loop — regional access into the spine' },
  { color: '#7dff9a', label: 'Auto — local coverage (zoom in)' },
];

export const SIMPLE_VIEW_BUTTONS = [
  { focus: 'integrated_grid', label: 'Integrated Grid', short: 'Grid' },
  { focus: 'hyperloop', label: 'Hyperloop Spine', short: 'Spine' },
  { focus: 'e2e', label: 'E2E Global', short: 'E2E' },
  { focus: 'mining_industrial', label: 'Mining / E2M', short: 'E2M' },
  { focus: 'loop', label: 'Local Loop', short: 'Loop' },
  { focus: 'auto', label: 'Auto Access', short: 'Auto' },
];
