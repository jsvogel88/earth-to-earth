import { TRUNK_CORRIDORS, getNodeMap, getTrunkNodeIds } from '../data/hyperloopNetworkV2.js';
import {
  APPROVED_WATER_CROSSINGS,
  findApprovedCrossing,
} from '../data/waterCrossings.js';

const MAX_EDGE_MILES = {
  trunk: 900,
  regional: 1200,
  branch: 500,
  feeder: 350,
};

const OCEAN_BOXES = [
  { name: 'North Atlantic', lonMin: -80, lonMax: -10, latMin: 10, latMax: 65 },
  { name: 'South Atlantic', lonMin: -50, lonMax: 10, latMin: -60, latMax: 10 },
  { name: 'North Pacific West', lonMin: 130, lonMax: 180, latMin: 10, latMax: 65 },
  { name: 'North Pacific East', lonMin: -180, lonMax: -120, latMin: 10, latMax: 65 },
  { name: 'South Pacific West', lonMin: 120, lonMax: 180, latMin: -60, latMax: 10 },
  { name: 'South Pacific East', lonMin: -180, lonMax: -70, latMin: -60, latMax: 10 },
  { name: 'Indian Ocean', lonMin: 40, lonMax: 110, latMin: -60, latMax: 20 },
];

const haversineDistanceMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
};

function pointInOcean(lon, lat) {
  return OCEAN_BOXES.find(
    (box) => lon >= box.lonMin && lon <= box.lonMax && lat >= box.latMin && lat <= box.latMax
  );
}

/** Sample geodesic — flag ocean crossing unless both endpoints share same land mass heuristic */
export function detectWaterCrossing(nodeA, nodeB) {
  const samples = 8;
  let oceanHits = 0;
  let startOcean = pointInOcean(nodeA.lon, nodeA.lat);
  let endOcean = pointInOcean(nodeB.lon, nodeB.lat);

  for (let i = 1; i < samples; i += 1) {
    const t = i / samples;
    const lon = nodeA.lon + (nodeB.lon - nodeA.lon) * t;
    const lat = nodeA.lat + (nodeB.lat - nodeA.lat) * t;
    if (pointInOcean(lon, lat)) oceanHits += 1;
  }

  if (oceanHits >= 2 && !startOcean && !endOcean) {
    return { blocked: true, reason: 'ocean' };
  }
  if ((startOcean || endOcean) && nodeA.continent !== nodeB.continent) {
    return { blocked: true, reason: 'cross-continental water' };
  }
  return { blocked: false };
}

function undirectedKey(a, b) {
  return [a, b].sort().join('|');
}

function mapEdgeTypeToRouteClass(type, distanceMiles) {
  if (type === 'undersea') return 'EXTENDED_HYPERLOOP';
  if (type === 'trunk') {
    if (distanceMiles <= 150) return 'LOCAL_FEEDER';
    if (distanceMiles <= 700) return 'REGIONAL_HYPERLOOP';
    return 'EXTENDED_HYPERLOOP';
  }
  if (type === 'regional') return 'REGIONAL_HYPERLOOP';
  if (type === 'branch' || type === 'feeder') return 'LOCAL_FEEDER';
  return 'REGIONAL_HYPERLOOP';
}

function toDeckPath(edge) {
  return {
    id: edge.id,
    path: [
      [edge.sourceLon, edge.sourceLat],
      [edge.targetLon, edge.targetLat],
    ],
    edgeType: edge.type,
    routeClass: edge.routeClass,
    distanceMiles: edge.distanceMiles,
    corridor: edge.corridorId || edge.waterCrossingLabel || edge.type,
    infrastructureOnly: true,
    isWaterCrossing: edge.isWaterCrossing,
    waterCrossingApproved: edge.waterCrossingApproved,
    waterCrossingLabel: edge.waterCrossingLabel,
    fromName: edge.sourceName,
    toName: edge.targetName,
  };
}

/**
 * Hyperloop Web V2 graph — corridor chains, water guard, minimum tube miles.
 */
export function generateHyperloopWebGraph(phaseFilter = 3) {
  const nodeMap = getNodeMap();
  const nodes = Object.values(nodeMap);
  const trunkNodeIds = getTrunkNodeIds();
  const edges = [];
  const edgeKeys = new Set();
  const adjacency = new Map();

  const addAdjacency = (a, b) => {
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    adjacency.get(a).add(b);
    if (!adjacency.has(b)) adjacency.set(b, new Set());
    adjacency.get(b).add(a);
  };

  const isConnected = (a, b) => {
    if (a === b) return true;
    const visited = new Set([a]);
    const queue = [a];
    while (queue.length) {
      const cur = queue.shift();
      const neighbors = adjacency.get(cur);
      if (!neighbors) continue;
      for (const n of neighbors) {
        if (n === b) return true;
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    return false;
  };

  const pushEdge = (edge) => {
    const key = undirectedKey(edge.source, edge.target);
    if (edgeKeys.has(key)) return false;
    if (edge.type !== 'undersea' && isConnected(edge.source, edge.target)) return false;

    edgeKeys.add(key);
    edges.push(edge);
    addAdjacency(edge.source, edge.target);
    return true;
  };

  const createEdge = (sourceId, targetId, type, meta = {}) => {
    const source = nodeMap[sourceId];
    const target = nodeMap[targetId];
    if (!source || !target) return null;

    const distanceMiles = Math.round(
      haversineDistanceMiles(source.lat, source.lon, target.lat, target.lon)
    );
    const max = MAX_EDGE_MILES[type] ?? MAX_EDGE_MILES.regional;
    if (type !== 'undersea' && distanceMiles > max) return null;

    const approved = findApprovedCrossing(sourceId, targetId, phaseFilter);
    const water = detectWaterCrossing(source, target);

    if (water.blocked && !approved && type !== 'undersea') return null;

    const finalType = approved && water.blocked ? 'undersea' : type;

    return {
      id: `${sourceId}-${targetId}-${finalType}`,
      source: sourceId,
      target: targetId,
      sourceLat: source.lat,
      sourceLon: source.lon,
      targetLat: target.lat,
      targetLon: target.lon,
      sourceName: source.name,
      targetName: target.name,
      type: finalType,
      corridorId: meta.corridorId,
      distanceMiles: approved?.distanceMiles ?? distanceMiles,
      routeClass: mapEdgeTypeToRouteClass(finalType, distanceMiles),
      isWaterCrossing: Boolean(approved) || water.blocked,
      waterCrossingApproved: Boolean(approved),
      waterCrossingLabel: approved?.label,
      phase: meta.phase ?? 1,
    };
  };

  // PASS 1 — trunk corridor chains (adjacent nodes only)
  TRUNK_CORRIDORS.forEach((corridor) => {
    const seq = corridor.nodeSequence.filter((id) => nodeMap[id]);
    for (let i = 0; i < seq.length - 1; i += 1) {
      const edge = createEdge(seq[i], seq[i + 1], 'trunk', { corridorId: corridor.id });
      if (edge) pushEdge(edge);
    }
  });

  // PASS 5 — approved undersea / strategic crossings
  APPROVED_WATER_CROSSINGS.forEach((crossing) => {
    if (crossing.phase > phaseFilter) return;
    const edge = createEdge(crossing.fromNodeId, crossing.toNodeId, 'undersea', {
      phase: crossing.phase,
      corridorId: crossing.id,
    });
    if (edge) {
      edge.waterCrossingLabel = crossing.label;
      edge.isWaterCrossing = true;
      edge.waterCrossingApproved = true;
      edge.distanceMiles = crossing.distanceMiles;
      pushEdge(edge);
    }
  });

  // PASS 3 — Tier 2 switch nodes → nearest trunk node (branch)
  nodes
    .filter((n) => n.tier === 2)
    .forEach((switchNode) => {
      let nearest = null;
      let minDist = Infinity;
      trunkNodeIds.forEach((trunkId) => {
        if (trunkId === switchNode.id) return;
        const trunk = nodeMap[trunkId];
        if (!trunk || trunk.continent !== switchNode.continent) return;
        const d = haversineDistanceMiles(switchNode.lat, switchNode.lon, trunk.lat, trunk.lon);
        if (d < minDist) {
          minDist = d;
          nearest = trunk;
        }
      });
      if (!nearest || minDist > MAX_EDGE_MILES.branch) return;
      nearest.isSwitchNode = true;
      const edge = createEdge(switchNode.id, nearest.id, 'branch', { corridorId: 'switch-branch' });
      if (edge) pushEdge(edge);
    });

  // PASS 4 — Tier 3 feeders → nearest tier 0/1/2 same continent
  nodes
    .filter((n) => n.tier === 3)
    .forEach((feeder) => {
      const anchors = nodes.filter(
        (n) => n.tier <= 2 && n.continent === feeder.continent && n.id !== feeder.id
      );
      let nearest = null;
      let minDist = Infinity;
      anchors.forEach((anchor) => {
        const d = haversineDistanceMiles(feeder.lat, feeder.lon, anchor.lat, anchor.lon);
        if (d < minDist) {
          minDist = d;
          nearest = anchor;
        }
      });
      if (!nearest || minDist > MAX_EDGE_MILES.feeder) return;
      const edge = createEdge(feeder.id, nearest.id, 'feeder', { corridorId: 'local-feeder' });
      if (edge) pushEdge(edge);
    });

  // PASS 2 — limited regional: same-continent tier-0 pairs within 900mi, not already connected, not water
  const tier0 = nodes.filter((n) => n.tier === 0);
  for (let i = 0; i < tier0.length; i += 1) {
    for (let j = i + 1; j < tier0.length; j += 1) {
      const a = tier0[i];
      const b = tier0[j];
      if (a.continent !== b.continent) continue;
      const d = haversineDistanceMiles(a.lat, a.lon, b.lat, b.lon);
      if (d > 900 || d < 120) continue;
      if (isConnected(a.id, b.id)) continue;
      const edge = createEdge(a.id, b.id, 'regional', { corridorId: 'regional-hub-link' });
      if (edge) pushEdge(edge);
    }
  }

  const paths = edges.map(toDeckPath);
  const pathsByType = {
    trunk: paths.filter((p) => p.edgeType === 'trunk'),
    regional: paths.filter((p) => p.edgeType === 'regional'),
    branch: paths.filter((p) => p.edgeType === 'branch'),
    feeder: paths.filter((p) => p.edgeType === 'feeder'),
    undersea: paths.filter((p) => p.edgeType === 'undersea'),
  };

  const switchNodes = nodes.filter((n) => n.isSwitchNode || n.tier === 2);
  const tier0Nodes = nodes.filter((n) => n.tier === 0);
  const tier1Nodes = nodes.filter((n) => n.tier === 1);

  const sumMiles = (type) =>
    edges.filter((e) => e.type === type).reduce((s, e) => s + e.distanceMiles, 0);

  const totalTubeMiles = edges.reduce((s, e) => s + e.distanceMiles, 0);

  const webStats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    switchNodes: switchNodes.length,
    trunkLines: edges.filter((e) => e.type === 'trunk').length,
    branchLines: edges.filter((e) => e.type === 'branch').length,
    feederLines: edges.filter((e) => e.type === 'feeder').length,
    regionalLines: edges.filter((e) => e.type === 'regional').length,
    trunkMiles: Math.round(sumMiles('trunk')),
    regionalMiles: Math.round(sumMiles('regional')),
    branchMiles: Math.round(sumMiles('branch')),
    feederMiles: Math.round(sumMiles('feeder')),
    underseaMiles: Math.round(sumMiles('undersea')),
    estimatedTubeMiles: Math.round(totalTubeMiles),
    avgEdgeDistance: edges.length ? Math.round(totalTubeMiles / edges.length) : 0,
    connectedE2eHubs: tier0Nodes.length,
    e2eHubs: tier0Nodes.length,
    primaryHubs: tier1Nodes.length,
    waterCrossingsActive: edges.filter((e) => e.type === 'undersea').length,
    estimatedCoverage: `${nodes.length} cities`,
  };

  const stats = {
    local: paths.filter((p) => p.routeClass === 'LOCAL_FEEDER').length,
    regional: paths.filter((p) => p.routeClass === 'REGIONAL_HYPERLOOP').length,
    extended: paths.filter((p) => p.routeClass === 'EXTENDED_HYPERLOOP').length,
    cargo: 0,
    trunk: webStats.trunkLines,
    branch: webStats.branchLines + webStats.feederLines,
    total: paths.length,
  };

  return {
    nodes,
    edges,
    paths,
    pathsByType,
    stats,
    switchNodes,
    webStats,
    nodeById: nodeMap,
  };
}

export { haversineDistanceMiles };
