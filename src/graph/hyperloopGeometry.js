/**
 * Phase 7D — hyperloop / terrestrial PathLayer geometry guards.
 * Blocks ocean jumps and Mercator wrap artifacts on ground paths.
 */

const OCEAN_LON_THRESHOLD = 90;
const OCEAN_DIST_KM = 5000;

/**
 * @param {object} fromNode
 * @param {object} toNode
 * @param {object} [edge]
 * @returns {boolean}
 */
export function isHyperloopOceanCrossing(fromNode, toNode, edge = {}) {
  const mode = String(edge?.mode ?? '').toLowerCase();
  if (mode !== 'hyperloop' && mode !== 'loop' && mode !== 'regional_loop') {
    return false;
  }
  if (edge?.routeType === 'intercontinental_connector') return false;
  if (edge?.route_type === 'intercontinental_connector') return false;

  const fromLon = fromNode?.longitude ?? fromNode?.lon ?? 0;
  const toLon = toNode?.longitude ?? toNode?.lon ?? 0;
  const fromLat = fromNode?.latitude ?? fromNode?.lat ?? 0;
  const toLat = toNode?.latitude ?? toNode?.lat ?? 0;
  const diffLon = Math.abs(fromLon - toLon);
  const distKm =
    edge?.distanceKm ??
    edge?.distance_km ??
    haversineKm(fromLat, fromLon, toLat, toLon);

  if (diffLon > OCEAN_LON_THRESHOLD && distKm > 800) return true;
  if (distKm > OCEAN_DIST_KM && diffLon > 60) return true;

  return isPacificRimGroundArtifact(fromLat, fromLon, toLat, toLon, distKm);
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** LA/Vancouver ↔ Tokyo/Sydney as cyan chord = artifact */
function isPacificRimGroundArtifact(fromLat, fromLon, toLat, toLon, distKm) {
  if (distKm < 4000) return false;
  const americas = fromLon < -60 || toLon < -60;
  const asiaPac = (fromLon > 100 && fromLat > -10) || (toLon > 100 && toLat > -10);
  return americas && asiaPac;
}

/**
 * @param {object} fromNode
 * @param {object} toNode
 * @param {object} edge
 * @returns {'block' | 'arc_e2e' | 'arc_e2m' | 'allow'}
 */
export function classifyOceanCrossing(fromNode, toNode, edge = {}) {
  if (!isHyperloopOceanCrossing(fromNode, toNode, edge)) return 'allow';
  const mode = String(edge?.mode ?? '').toLowerCase();
  if (mode === 'e2e_starship' || mode === 'e2e') return 'allow';
  if (mode === 'e2m' || mode === 'cargo' || mode === 'logistics') return 'allow';
  if (edge?.routeType === 'intercontinental_connector') return 'allow';
  return 'block';
}

/**
 * @param {object[]} pathRecords
 * @returns {{ valid: object[], violations: object[] }}
 */
export function filterHyperloopPathRecords(pathRecords = []) {
  const valid = [];
  const violations = [];
  for (const rec of pathRecords) {
    const path = rec?.path ?? [];
    if (path.length < 2) continue;
    const [fromLon, fromLat] = path[0];
    const [toLon, toLat] = path[path.length - 1];
    const fakeEdge = { mode: rec.mode ?? 'hyperloop', routeType: rec.routeType, distanceKm: rec.distanceKm };
    if (
      isHyperloopOceanCrossing(
        { longitude: fromLon, latitude: fromLat },
        { longitude: toLon, latitude: toLat },
        fakeEdge
      )
    ) {
      violations.push(rec);
    } else {
      valid.push(rec);
    }
  }
  return { valid, violations };
}
