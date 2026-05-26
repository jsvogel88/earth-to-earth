import {
  formatConstructionLabel,
  formatDifficultyLabel,
} from '../data/constructionTypes.js';

function routeTypeLabel(path) {
  if (
    path.routeClass === 'THROUGH_ROUTE' ||
    path.edgeType === 'THROUGH_ROUTE' ||
    path.edgeCategory === 'THROUGH_ROUTE'
  ) {
    return 'Through Route';
  }
  if (path.isIntercontinentalGateway || path.edgeCategory === 'INTERCONTINENTAL_GATEWAY') {
    return 'Intercontinental Gateway';
  }
  if (path.edgeCategory === 'GLOBAL_COVERAGE_CORRIDOR' || path.routeClass === 'REMOTE_CARGO') {
    return 'Remote Cargo';
  }
  if (path.routeClass === 'RARE_EARTH_RESOURCE') return 'Rare Earth Resource';
  if (path.routeClass === 'CRITICAL_MINERALS') return 'Critical Minerals';
  if (path.routeClass === 'ARCTIC_LOGISTICS') return 'Arctic Logistics';
  if (path.routeClass === 'REGIONAL_HYPERLOOP') return 'Regional Hyperloop';
  if (path.routeClass === 'LOCAL_FEEDER') return 'Local Feeder';
  if (path.routeClass === 'EXTENDED_HYPERLOOP') return 'Extended Hyperloop';
  if (path.routeClass === 'TUNNEL_REQUIRED') return 'Tunnel Required';
  return path.routeClass?.replace(/_/g, ' ') || 'Hyperloop Route';
}

function purposeLine(path) {
  if (path.isInterNetworkConnector || path.isThroughCorridor) {
    return 'Inter-network connector';
  }
  if (path.isIntercontinentalGateway) return 'Continental gateway corridor';
  if (path.edgeCategory === 'GLOBAL_COVERAGE_CORRIDOR') return 'Remote / strategic cargo corridor';
  if (path.corridor) return path.corridor;
  return 'Shared tube infrastructure';
}

function integratedRouteTypeLabel(path) {
  const mode = String(path.mode ?? '').toUpperCase();
  const rt = String(path.route_type ?? path.routeType ?? '').replace(/_/g, ' ');
  if (mode && rt) return `${mode} · ${rt}`;
  if (mode) return mode;
  return rt || 'Integrated route';
}

export function buildRouteTooltipHtml(path) {
  if (!path?.fromName && !path?.toName) return null;

  if (path.mode === 'e2e' || path.mode === 'e2m' || path.mode === 'loop') {
    const type = integratedRouteTypeLabel(path);
    const km =
      path.distance_km != null
        ? Math.round(path.distance_km)
        : path.distanceMiles != null
          ? Math.round(path.distanceMiles * 1.60934)
          : '—';
    const priority =
      path.priority_score != null ? path.priority_score.toFixed(2) : '—';
    return [
      `<div style="font-weight:700;color:#e8f4ff;margin-bottom:4px">${type}</div>`,
      `<div style="color:#b8c8e8">${path.fromName} → ${path.toName}</div>`,
      `<div style="margin-top:6px;font-size:11px;line-height:1.45">`,
      `<div><span style="color:#8899cc">Distance:</span> ${km} km</div>`,
      `<div><span style="color:#8899cc">Priority:</span> ${priority}</div>`,
      path.corridor_type
        ? `<div><span style="color:#8899cc">Corridor:</span> ${path.corridor_type}</div>`
        : '',
      `</div>`,
    ].join('');
  }

  const type = routeTypeLabel(path);
  const construction = formatConstructionLabel(path.constructionType);
  const tunnel = path.tunnelRequired ? 'Yes' : 'No';
  const difficulty = formatDifficultyLabel(path.constructionDifficulty);
  const miles = path.distanceMiles != null ? Math.round(path.distanceMiles) : '—';
  const purpose = purposeLine(path);

  const lines = [
    `<div style="font-weight:700;color:#e8f4ff;margin-bottom:4px">${type}</div>`,
    `<div style="color:#b8c8e8">${path.fromName} → ${path.toName}</div>`,
    `<div style="margin-top:6px;font-size:11px;line-height:1.45">`,
    `<div><span style="color:#8899cc">Construction:</span> ${construction}</div>`,
    `<div><span style="color:#8899cc">Tunnel Required:</span> ${tunnel}</div>`,
    `<div><span style="color:#8899cc">Difficulty:</span> ${difficulty}</div>`,
    `<div><span style="color:#8899cc">Distance:</span> ${miles} mi</div>`,
    `<div><span style="color:#8899cc">Purpose:</span> ${purpose}</div>`,
    `</div>`,
  ];

  if (path.constructionNotes) {
    lines.push(
      `<div style="margin-top:4px;font-size:10px;color:#8899cc;font-style:italic">${path.constructionNotes}</div>`
    );
  }

  return lines.join('');
}
