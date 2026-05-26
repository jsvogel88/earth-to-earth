/**
 * Sparse strategic remote cargo corridor chains (sequential only, no all-to-all).
 */

import {
  hasCoordinates,
  haversineDistanceMiles,
  makeEdge,
  addEdgeUnique,
  edgeKey,
} from './phase1GlobalHyperloopGraph.js';
import { normalizeCityKey } from './hyperloopPhase1Coordinates.js';
import { HYPERLOOP_ROUTE_CLASSES } from './hyperloopRouteClasses.js';
import { buildRemoteStrategicNodes } from './remoteStrategicNodes.js';

export const REMOTE_CORRIDOR_VISIBLE_MIN_ZOOM = 4;

/** Sequential corridor chains — only consecutive pairs become edges */
export const REMOTE_CORRIDOR_CHAINS = [
  {
    id: 'alaska-arctic-chain',
    regionGroup: 'North America / Arctic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Anchorage', 'Fairbanks', 'Nome'],
  },
  {
    id: 'alaska-kodiak',
    regionGroup: 'North America / Arctic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Anchorage', 'Kodiak'],
  },
  {
    id: 'fairbanks-north',
    regionGroup: 'North America / Arctic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Fairbanks', 'Utqiagvik'],
  },
  {
    id: 'yukon-nwt-chain',
    regionGroup: 'North America / Arctic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Fairbanks', 'Whitehorse', 'Yellowknife'],
  },
  {
    id: 'nwt-nunavut',
    regionGroup: 'North America / Arctic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Yellowknife', 'Iqaluit', 'Rankin Inlet'],
  },
  {
    id: 'manitoba-chain',
    regionGroup: 'North America / Arctic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Churchill', 'Thompson'],
  },
  {
    id: 'alberta-resource',
    regionGroup: 'North America / Arctic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Fort McMurray', 'Prince George'],
  },
  {
    id: 'bc-prince-george',
    regionGroup: 'North America / Arctic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Prince George', 'Vancouver'],
  },
  {
    id: 'greenland-west',
    regionGroup: 'Greenland / North Atlantic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Nuuk', 'Kangerlussuaq', 'Sisimiut', 'Ilulissat'],
  },
  {
    id: 'greenland-south',
    regionGroup: 'Greenland / North Atlantic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Qaqortoq', 'Narsarsuaq'],
  },
  {
    id: 'greenland-east',
    regionGroup: 'Greenland / North Atlantic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Tasiilaq', 'Narsarsuaq'],
  },
  {
    id: 'iceland-chain',
    regionGroup: 'Greenland / North Atlantic',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Reykjavík', 'Akureyri'],
  },
  {
    id: 'amazon-north',
    regionGroup: 'South America / Amazon / Andes',
    routeClass: HYPERLOOP_ROUTE_CLASSES.RARE_EARTH_RESOURCE,
    edgeType: 'RAINFOREST_ACCESS',
    cities: ['Manaus', 'Santarém', 'Belém'],
  },
  {
    id: 'amazon-west',
    regionGroup: 'South America / Amazon / Andes',
    routeClass: HYPERLOOP_ROUTE_CLASSES.RARE_EARTH_RESOURCE,
    edgeType: 'RAINFOREST_ACCESS',
    cities: ['Manaus', 'Porto Velho', 'Rio Branco'],
  },
  {
    id: 'amazon-peru',
    regionGroup: 'South America / Amazon / Andes',
    routeClass: HYPERLOOP_ROUTE_CLASSES.RARE_EARTH_RESOURCE,
    edgeType: 'RAINFOREST_ACCESS',
    cities: ['Iquitos', 'Pucallpa', 'Puerto Maldonado'],
  },
  {
    id: 'amazon-triple-border',
    regionGroup: 'South America / Amazon / Andes',
    routeClass: HYPERLOOP_ROUTE_CLASSES.RARE_EARTH_RESOURCE,
    edgeType: 'RAINFOREST_ACCESS',
    cities: ['Leticia', 'Iquitos', 'Manaus'],
  },
  {
    id: 'andes-bolivia-chile',
    regionGroup: 'South America / Amazon / Andes',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CRITICAL_MINERALS,
    cities: ['La Paz', 'Uyuni', 'Antofagasta'],
  },
  {
    id: 'andes-mining',
    regionGroup: 'South America / Amazon / Andes',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CRITICAL_MINERALS,
    cities: ['Potosí', 'Uyuni', 'Calama'],
  },
  {
    id: 'patagonia-argentina',
    regionGroup: 'South America / Amazon / Andes',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Mendoza', 'Neuquén', 'Bariloche'],
  },
  {
    id: 'patagonia-south',
    regionGroup: 'South America / Amazon / Andes',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Puerto Montt', 'Coyhaique', 'Punta Arenas', 'Ushuaia'],
  },
  {
    id: 'sahel-mauritania',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.DESERT_LOGISTICS,
    cities: ['Nouakchott', 'Nouadhibou', 'Atar', 'Zouérat'],
  },
  {
    id: 'sahel-mali-niger',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.DESERT_LOGISTICS,
    cities: ['Bamako', 'Timbuktu', 'Gao', 'Agadez'],
  },
  {
    id: 'sahel-niger-nigeria',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.DESERT_LOGISTICS,
    cities: ['Agadez', 'Niamey', 'Kano'],
  },
  {
    id: 'chad-corridor',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.DESERT_LOGISTICS,
    cities: ["N'Djamena", 'Abéché', 'Faya-Largeau'],
  },
  {
    id: 'algeria-sahara',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.DESERT_LOGISTICS,
    cities: ['Tamanrasset', 'Ouargla', 'Algiers'],
  },
  {
    id: 'drc-copperbelt',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CRITICAL_MINERALS,
    cities: ['Lubumbashi', 'Kolwezi', 'Ndola', 'Lusaka'],
  },
  {
    id: 'east-africa-interior',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Dar es Salaam', 'Mwanza', 'Kigali', 'Kampala'],
  },
  {
    id: 'southern-africa',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Windhoek', 'Walvis Bay'],
  },
  {
    id: 'sadc-corridor',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Gaborone', 'Johannesburg'],
  },
  {
    id: 'zimbabwe-zambia',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Harare', 'Lusaka'],
  },
  {
    id: 'horn-ethiopia',
    regionGroup: 'Africa / Sahara / Sahel / Central',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Addis Ababa', 'Dire Dawa', 'Djibouti City'],
  },
  {
    id: 'russia-arctic-west',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Murmansk', 'Arkhangelsk'],
  },
  {
    id: 'russia-arctic-north',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Arkhangelsk', 'Vorkuta', 'Salekhard'],
  },
  {
    id: 'russia-gas-north',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Salekhard', 'Novy Urengoy', 'Noyabrsk', 'Norilsk'],
  },
  {
    id: 'norilsk-port',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CRITICAL_MINERALS,
    cities: ['Norilsk', 'Dudinka'],
  },
  {
    id: 'yakutia-chain',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Yakutsk', 'Mirny', 'Lensk'],
  },
  {
    id: 'russia-far-east',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS,
    cities: ['Yakutsk', 'Magadan', 'Anadyr', 'Pevek'],
  },
  {
    id: 'siberia-trunk',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Krasnoyarsk', 'Bratsk', 'Irkutsk', 'Ulan-Ude', 'Chita'],
  },
  {
    id: 'mongolia-chain',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Ulaanbaatar', 'Darkhan', 'Erdenet'],
  },
  {
    id: 'mongolia-south',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Ulaanbaatar', 'Dalanzadgad'],
  },
  {
    id: 'kazakhstan-chain',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Astana', 'Karaganda', 'Almaty'],
  },
  {
    id: 'central-asia-silk',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Almaty', 'Bishkek'],
  },
  {
    id: 'uzbek-corridor',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Tashkent', 'Samarkand', 'Bukhara'],
  },
  {
    id: 'turkmen-corridor',
    regionGroup: 'Russia / Siberia / Central Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Ashgabat', 'Mary', 'Türkmenabat'],
  },
  {
    id: 'himalaya-nepal',
    regionGroup: 'Himalayas / Remote Interior Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Kathmandu', 'Pokhara'],
  },
  {
    id: 'himalaya-nepal-east',
    regionGroup: 'Himalayas / Remote Interior Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Kathmandu', 'Biratnagar'],
  },
  {
    id: 'himalaya-tibet',
    regionGroup: 'Himalayas / Remote Interior Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Lhasa', 'Shigatse'],
  },
  {
    id: 'himalaya-india-north',
    regionGroup: 'Himalayas / Remote Interior Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Dehradun', 'Shimla', 'Dharamshala'],
  },
  {
    id: 'himalaya-kashmir',
    regionGroup: 'Himalayas / Remote Interior Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Srinagar', 'Leh'],
  },
  {
    id: 'northeast-india',
    regionGroup: 'Himalayas / Remote Interior Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Guwahati', 'Shillong', 'Imphal', 'Aizawl'],
  },
  {
    id: 'xinjiang-corridor',
    regionGroup: 'Himalayas / Remote Interior Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Ürümqi', 'Kashgar', 'Hotan'],
  },
  {
    id: 'china-northwest',
    regionGroup: 'Himalayas / Remote Interior Asia',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO,
    cities: ['Lanzhou', 'Xining', 'Yinchuan', 'Hohhot'],
  },
  {
    id: 'australia-top-end',
    regionGroup: 'Australia / Outback',
    routeClass: HYPERLOOP_ROUTE_CLASSES.OUTBACK_RESOURCE,
    cities: ['Darwin', 'Katherine', 'Tennant Creek', 'Alice Springs'],
  },
  {
    id: 'australia-red-center',
    regionGroup: 'Australia / Outback',
    routeClass: HYPERLOOP_ROUTE_CLASSES.OUTBACK_RESOURCE,
    cities: ['Alice Springs', 'Coober Pedy', 'Port Augusta'],
  },
  {
    id: 'australia-qld-mining',
    regionGroup: 'Australia / Outback',
    routeClass: HYPERLOOP_ROUTE_CLASSES.OUTBACK_RESOURCE,
    cities: ['Mount Isa', 'Cloncurry', 'Townsville'],
  },
  {
    id: 'australia-pilbara',
    regionGroup: 'Australia / Outback',
    routeClass: HYPERLOOP_ROUTE_CLASSES.OUTBACK_RESOURCE,
    cities: ['Port Hedland', 'Newman', 'Tom Price', 'Karratha'],
  },
  {
    id: 'australia-wa-gold',
    regionGroup: 'Australia / Outback',
    routeClass: HYPERLOOP_ROUTE_CLASSES.OUTBACK_RESOURCE,
    cities: ['Kalgoorlie', 'Esperance'],
  },
  {
    id: 'australia-nsw-outback',
    regionGroup: 'Australia / Outback',
    routeClass: HYPERLOOP_ROUTE_CLASSES.OUTBACK_RESOURCE,
    cities: ['Broken Hill', 'Dubbo'],
  },
  {
    id: 'australia-kimberley',
    regionGroup: 'Australia / Outback',
    routeClass: HYPERLOOP_ROUTE_CLASSES.OUTBACK_RESOURCE,
    cities: ['Broome', 'Derby', 'Kununurra'],
  },
];

function buildNodeIndex(nodes) {
  const byKey = new Map();
  (nodes || []).forEach((n) => {
    if (!hasCoordinates(n)) return;
    byKey.set(normalizeCityKey(n.name), n);
  });
  return byKey;
}

function classifyCorridorEdge(chain, distanceMiles) {
  if (chain.routeClass) return chain.routeClass;
  if (chain.regionGroup?.includes('Arctic')) {
    return HYPERLOOP_ROUTE_CLASSES.ARCTIC_LOGISTICS;
  }
  if (chain.edgeType === 'RAINFOREST_ACCESS') {
    return HYPERLOOP_ROUTE_CLASSES.RARE_EARTH_RESOURCE;
  }
  return HYPERLOOP_ROUTE_CLASSES.REMOTE_CARGO;
}

/**
 * Build sequential corridor edges from REMOTE_CORRIDOR_CHAINS.
 */
export function buildRemoteCargoCorridorEdges(nodes, existingEdgeMap = new Map()) {
  const byKey = buildNodeIndex(nodes);
  const edges = [];
  const edgeMap = new Map(existingEdgeMap);

  REMOTE_CORRIDOR_CHAINS.forEach((chain) => {
    if (chain.skipOcean) return;

    for (let i = 0; i < chain.cities.length - 1; i += 1) {
      const fromNode = byKey.get(normalizeCityKey(chain.cities[i]));
      const toNode = byKey.get(normalizeCityKey(chain.cities[i + 1]));
      if (!fromNode || !toNode) continue;

      const dist = haversineDistanceMiles(
        fromNode.lat,
        fromNode.lon,
        toNode.lat,
        toNode.lon
      );

      const edge = makeEdge(fromNode, toNode, {
        edgeType: chain.edgeType || 'REMOTE_CARGO_CORRIDOR',
        routeClass: classifyCorridorEdge(chain, dist),
        corridor: chain.id,
        edgeCategory: 'GLOBAL_COVERAGE_CORRIDOR',
        generatedBy: 'remote_cargo_corridor',
        cargoPriority: true,
        passengerPriority: false,
        isThroughCorridor: true,
        specialCrossing: chain.specialCrossing || false,
      });

      if (edge) {
        edge.visibleMinZoom = REMOTE_CORRIDOR_VISIBLE_MIN_ZOOM;
        addEdgeUnique(edges, edgeMap, edge);
      }
    }
  });

  return { edges, edgeMap };
}

export function buildRemoteCargoCorridorPaths(nodes, existingEdgeMap) {
  const { edges } = buildRemoteCargoCorridorEdges(nodes, existingEdgeMap);
  const paths = edges
    .filter((e) => e.fromNode && e.toNode)
    .map((edge) => ({
      id: `corridor-${edge.id}`,
      path: [
        [edge.fromNode.lon, edge.fromNode.lat],
        [edge.toNode.lon, edge.toNode.lat],
      ],
      edgeType: edge.edgeType,
      routeClass: edge.routeClass,
      distanceMiles: edge.distanceMiles,
      tunnelRequired: edge.tunnelRequired,
      tunnelType: edge.tunnelType,
      constructionType: edge.constructionType,
      constructionDifficulty: edge.constructionDifficulty,
      constructionNotes: edge.constructionNotes,
      edgeCategory: edge.edgeCategory,
      corridor: edge.corridor,
      visibleMinZoom: edge.visibleMinZoom ?? REMOTE_CORRIDOR_VISIBLE_MIN_ZOOM,
      renderable: true,
      fromName: edge.fromNode.name,
      toName: edge.toNode.name,
    }));

  return { edges, paths };
}

/** Corridor chain definitions (sequential remote cargo / critical minerals routes). */
export const remoteCargoRoutes = REMOTE_CORRIDOR_CHAINS;

export function getRemoteCorridorMetrics(paths) {
  const p = paths || [];
  const byRegion = {};
  REMOTE_CORRIDOR_CHAINS.forEach((c) => {
    const count = p.filter((path) => path.corridor === c.id).length;
    if (count > 0) {
      byRegion[c.regionGroup] = (byRegion[c.regionGroup] || 0) + count;
    }
  });
  return {
    corridorSegments: p.length,
    corridorChains: REMOTE_CORRIDOR_CHAINS.length,
    byRegion,
  };
}
