/**
 * Short map-first legend copy for the sidebar when nothing is selected.
 */

export const INTEGRATED_MAP_LEGEND = [
  { color: '#00dcff', label: 'Hyperloop / tube spine — ground backbone' },
  { color: '#d4af37', label: 'E2E — global jump arcs (overlay)' },
  { color: '#ff6b35', label: 'RE2E — rare-earth & industrial corridors (internal: e2m)' },
  { color: '#00dcff', label: 'Loop — regional access into the spine' },
  { color: '#64b4ff', label: 'Autonomous Robotaxi — 100-mile FSD coverage ring' },
  { color: '#64dcff', label: 'Supercharger + Tesla Diner — every 100 miles' },
  { color: '#ffb43c', label: 'Megacharger — heavy freight corridors' },
  { color: '#c8ff78', label: 'Industrial exchange hubs' },
];

export const SIMPLE_VIEW_BUTTONS = [
  { focus: 'integrated_grid', label: 'Integrated Grid', short: 'Grid' },
  { focus: 'hyperloop', label: 'Hyperloop Spine', short: 'Spine' },
  { focus: 'e2e', label: 'E2E Global', short: 'E2E' },
  { focus: 'mining_industrial', label: 'Mining / RE2E', short: 'RE2E' },
  { focus: 'loop', label: 'Local Loop', short: 'Loop' },
  { focus: 'auto', label: 'Auto Access', short: 'Auto' },
];
