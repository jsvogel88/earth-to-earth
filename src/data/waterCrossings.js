/** Approved water / strategic crossings — only these may render as undersea edges */
export const APPROVED_WATER_CROSSINGS = [
  {
    id: 'channel_tunnel',
    label: 'Channel Tunnel',
    fromNodeId: 'LON',
    toNodeId: 'PAR',
    crossingType: 'tunnel',
    phase: 1,
    distanceMiles: 31,
  },
  {
    id: 'oresund_bridge',
    label: 'Øresund Bridge Corridor',
    fromNodeId: 'CPH',
    toNodeId: 'STO',
    crossingType: 'bridge',
    phase: 1,
    distanceMiles: 10,
  },
  {
    id: 'gibraltar_tunnel',
    label: 'Gibraltar Strait Tunnel',
    fromNodeId: 'MAD',
    toNodeId: 'CAS',
    crossingType: 'future_strategic',
    phase: 4,
    distanceMiles: 9,
  },
  {
    id: 'messina_strait',
    label: 'Messina Strait',
    fromNodeId: 'ROM',
    toNodeId: 'PAL',
    crossingType: 'tunnel',
    phase: 2,
    distanceMiles: 2,
  },
  {
    id: 'bering_tunnel',
    label: 'Bering Strait Tunnel',
    fromNodeId: 'ANC',
    toNodeId: 'CHU',
    crossingType: 'undersea_corridor',
    phase: 5,
    distanceMiles: 55,
  },
  {
    id: 'atlantic_undersea',
    label: 'Atlantic Undersea',
    fromNodeId: 'LON',
    toNodeId: 'NYC',
    crossingType: 'undersea_corridor',
    phase: 4,
    distanceMiles: 3459,
  },
  {
    id: 'pacific_undersea',
    label: 'Pacific Undersea',
    fromNodeId: 'TKO',
    toNodeId: 'ANC',
    crossingType: 'undersea_corridor',
    phase: 5,
    distanceMiles: 3700,
  },
  {
    id: 'japan_korea',
    label: 'Japan-Korea Tunnel',
    fromNodeId: 'TKO',
    toNodeId: 'SEO',
    crossingType: 'tunnel',
    phase: 3,
    distanceMiles: 120,
  },
  {
    id: 'sg_batam',
    label: 'Singapore-Batam Link',
    fromNodeId: 'SIN',
    toNodeId: 'CGK',
    crossingType: 'tunnel',
    phase: 2,
    distanceMiles: 20,
  },
  {
    id: 'suez_crossing',
    label: 'Suez Canal Crossing',
    fromNodeId: 'CAI',
    toNodeId: 'TLV',
    crossingType: 'tunnel',
    phase: 2,
    distanceMiles: 15,
  },
  {
    id: 'india_sri_lanka',
    label: 'India-Sri Lanka Tunnel',
    fromNodeId: 'BAN',
    toNodeId: 'CMB',
    crossingType: 'future_strategic',
    phase: 4,
    distanceMiles: 35,
  },
  {
    id: 'africa_atlantic',
    label: 'Lisbon-Dakar Link',
    fromNodeId: 'LIS',
    toNodeId: 'DAK',
    crossingType: 'undersea_corridor',
    phase: 5,
    distanceMiles: 1700,
  },
];

export const findApprovedCrossing = (fromId, toId, phaseFilter = 5) => {
  const a = fromId;
  const b = toId;
  return APPROVED_WATER_CROSSINGS.find(
    (c) =>
      c.phase <= phaseFilter &&
      ((c.fromNodeId === a && c.toNodeId === b) || (c.fromNodeId === b && c.toNodeId === a))
  );
};
