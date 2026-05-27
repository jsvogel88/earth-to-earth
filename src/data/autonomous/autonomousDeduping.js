/**
 * Hub deduplication for autonomous transport generation.
 */

/**
 * @param {object} hub
 */
function dedupeKey(hub) {
  const lat = Number(hub.lat ?? hub.latitude)?.toFixed(2);
  const lng = Number(hub.lng ?? hub.longitude ?? hub.lon)?.toFixed(2);
  const name = String(hub.name ?? '')
    .toLowerCase()
    .replace(/\s+/g, '-');
  const region = hub.country ?? hub.region ?? '';
  if (name && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    return `geo:${name}|${region}|${lat}|${lng}`;
  }
  const canonical = hub?.canonicalId ?? hub?.id;
  return canonical ? `id:${canonical}` : `unknown:${name}`;
}

/**
 * @param {object[]} hubs
 * @returns {{ hubs: object[], duplicatesMerged: number }}
 */
export function dedupeAutonomousHubs(hubs = []) {
  const map = new Map();

  for (const hub of hubs) {
    const key = dedupeKey(hub);
    if (!map.has(key)) {
      map.set(key, { ...hub });
      continue;
    }
    const existing = map.get(key);
    const hubTypes = new Set([...(existing.hubTypes ?? []), ...(hub.hubTypes ?? [])]);
    const modes = new Set([...(existing.modes ?? []), ...(hub.modes ?? [])]);
    const tags = new Set([...(existing.tags ?? []), ...(hub.tags ?? [])]);
    const sources = new Set([...(existing.sources ?? []), hub.source].filter(Boolean));
    const eligibilityReasons = new Set([
      ...(existing.eligibilityReasons ?? []),
      ...(hub.eligibilityReasons ?? []),
    ]);

    map.set(key, {
      ...existing,
      ...hub,
      hubTypes: [...hubTypes],
      modes: [...modes],
      tags: [...tags],
      sources: [...sources],
      eligibilityReasons: [...eligibilityReasons],
      id: existing.id ?? hub.id,
      canonicalId: existing.canonicalId ?? hub.canonicalId,
    });
  }

  return {
    hubs: [...map.values()],
    duplicatesMerged: hubs.length - map.size,
  };
}
