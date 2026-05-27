/**
 * Subtle simulation overlays for deck.gl (congestion hubs, high-flow corridors).
 */

import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';

export const SIMULATION_LAYER_IDS = {
  CONGESTION_HUBS: 'simulation-congestion-hubs',
  FLOW_CORRIDORS: 'simulation-flow-corridors',
};

/**
 * @param {object} params
 * @returns {import('@deck.gl/core').Layer[]}
 */
export function createSimulationOverlayLayers({
  simulation = null,
  pathData = [],
  nodesById = {},
  enabled = false,
} = {}) {
  if (!enabled || !simulation) return [];

  const hubDots = [];
  for (const [id, s] of simulation.nodeStates) {
    if (s.congestionLevel < 62 && s.utilizationRate < 70) continue;
    const n = nodesById[id];
    if (!n || n.latitude == null) continue;
    hubDots.push({
      id: `sim-hub-${id}`,
      lat: n.latitude,
      lon: n.longitude,
      name: n.name,
      congestionLevel: s.congestionLevel,
      utilizationRate: s.utilizationRate,
    });
  }

  const flowPaths = [];
  for (const seg of pathData) {
    const es = simulation.edgeStates.get(seg.id);
    if (!es || es.congestion < 55) continue;
    if (!seg.path?.length) continue;
    flowPaths.push({
      ...seg,
      congestion: es.congestion,
      flowIntensity: es.activeTraffic,
    });
  }

  const layers = [];

  if (flowPaths.length) {
    layers.push(
      new PathLayer({
        id: SIMULATION_LAYER_IDS.FLOW_CORRIDORS,
        data: flowPaths,
        pickable: false,
        widthMinPixels: 1,
        widthMaxPixels: 5,
        getPath: (d) => d.path,
        getColor: (d) => {
          const c = d.congestion ?? 0;
          return [255, 120, 60, Math.round(40 + c * 1.2)];
        },
        getWidth: (d) => 1 + (d.flowIntensity ?? 0) / 40,
      })
    );
  }

  if (hubDots.length) {
    layers.push(
      new ScatterplotLayer({
        id: SIMULATION_LAYER_IDS.CONGESTION_HUBS,
        data: hubDots,
        pickable: false,
        radiusMinPixels: 4,
        radiusMaxPixels: 14,
        getPosition: (d) => [d.lon, d.lat],
        getRadius: (d) => 4 + (d.congestionLevel ?? 0) / 12,
        getFillColor: (d) => {
          const u = d.utilizationRate ?? 0;
          return [255, 80, 80, Math.round(80 + u * 1.4)];
        },
      })
    );
  }

  return layers;
}
