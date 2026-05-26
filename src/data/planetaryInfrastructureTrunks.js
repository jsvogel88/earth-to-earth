/**
 * Explicit trunk corridor definitions — railway/backbone style (sequential chains only).
 * Applied via src/graph/applyInfrastructureTrunks.js
 */

import { HYPERLOOP_ROUTE_CLASSES } from './hyperloopRouteClasses.js';

/** @typedef {'PLANETARY'|'REGIONAL'} TrunkTier */

/**
 * @typedef {Object} InfrastructureTrunkDef
 * @property {string} id
 * @property {TrunkTier} tier
 * @property {string} corridor
 * @property {string[]} nodes
 * @property {string} [routeClass]
 * @property {boolean} [specialCrossing]
 * @property {boolean} [tunnelRequired]
 */

/** Tier 1 — planetary trunks (reuse continental spine sequences where defined) */
export const tier1PlanetaryTrunks = [
  {
    id: 'na-east-spine',
    tier: 'PLANETARY',
    corridor: 'North America East Spine',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE,
    nodes: ['Dallas', 'Chicago', 'Toronto', 'Montreal', 'New York', 'Boston'],
  },
  {
    id: 'na-west-spine',
    tier: 'PLANETARY',
    corridor: 'North America West Spine',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE,
    nodes: ['Dallas', 'Denver', 'Salt Lake City', 'Seattle', 'San Francisco', 'Los Angeles'],
  },
  {
    id: 'europe-central-spine',
    tier: 'PLANETARY',
    corridor: 'Europe Central Spine',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE,
    nodes: ['London', 'Paris', 'Frankfurt', 'Amsterdam', 'Berlin', 'Warsaw'],
  },
  {
    id: 'gulf-corridor',
    tier: 'PLANETARY',
    corridor: 'Gulf Corridor',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE,
    nodes: ['Dubai', 'Riyadh', 'Doha', 'Kuwait City', 'Basra'],
  },
  {
    id: 'india-corridor',
    tier: 'PLANETARY',
    corridor: 'India Corridor',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE,
    nodes: ['Mumbai', 'Pune', 'Hyderabad', 'Bangalore', 'Chennai', 'Delhi'],
  },
  {
    id: 'china-east-spine',
    tier: 'PLANETARY',
    corridor: 'China East Spine',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE,
    nodes: ['Beijing', 'Shanghai', 'Nanjing', 'Hangzhou', 'Hong Kong'],
  },
  {
    id: 'east-africa-spine',
    tier: 'PLANETARY',
    corridor: 'East Africa Spine',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE,
    specialCrossing: true,
    nodes: [
      'Johannesburg',
      'Lusaka',
      'Dar es Salaam',
      'Nairobi',
      'Addis Ababa',
      'Cairo',
      'Istanbul',
    ],
  },
  {
    id: 'south-america-atlantic-spine',
    tier: 'PLANETARY',
    corridor: 'South America Atlantic Spine',
    routeClass: HYPERLOOP_ROUTE_CLASSES.CONTINENTAL_SPINE,
    nodes: ['Buenos Aires', 'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Recife'],
  },
];

/** Tier 2 — regional trunks feeding planetary systems */
export const tier2RegionalTrunks = [
  {
    id: 'alps-corridor',
    tier: 'REGIONAL',
    corridor: 'Alps Regional Trunk',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP,
    nodes: ['Milan', 'Zurich', 'Munich', 'Vienna'],
  },
  {
    id: 'denver-chicago-regional',
    tier: 'REGIONAL',
    corridor: 'US Midwest Regional Trunk',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP,
    nodes: ['Denver', 'Omaha', 'Chicago'],
  },
  {
    id: 'sea-peninsula-trunk',
    tier: 'REGIONAL',
    corridor: 'Malay Peninsula Regional Trunk',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP,
    nodes: ['Bangkok', 'Kuala Lumpur', 'Singapore'],
  },
  {
    id: 'nairobi-addis-regional',
    tier: 'REGIONAL',
    corridor: 'Horn of Africa Regional Trunk',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP,
    nodes: ['Nairobi', 'Addis Ababa'],
  },
  {
    id: 'eastern-europe-spine',
    tier: 'REGIONAL',
    corridor: 'Eastern Europe Spine',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP,
    nodes: ['Frankfurt', 'Prague', 'Vienna', 'Budapest', 'Warsaw', 'Bucharest'],
  },
  {
    id: 'central-asia-bridge',
    tier: 'REGIONAL',
    corridor: 'Central Asia Bridge',
    routeClass: HYPERLOOP_ROUTE_CLASSES.REGIONAL_HYPERLOOP,
    nodes: ['Istanbul', 'Ankara', 'Tbilisi', 'Baku', 'Ashgabat', 'Almaty'],
  },
];

export const allInfrastructureTrunks = [...tier1PlanetaryTrunks, ...tier2RegionalTrunks];
