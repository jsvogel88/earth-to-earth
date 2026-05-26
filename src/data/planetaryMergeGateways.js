/**
 * Targeted planetary merge gateways — sequential chains only (no graph logic).
 * Applied in src/graph/applyPlanetaryMergeGateways.js after continental spines.
 */

import { HYPERLOOP_ROUTE_CLASSES } from './hyperloopRouteClasses.js';

/**
 * @typedef {Object} PlanetaryMergeGatewayDef
 * @property {string} corridor
 * @property {string[]} nodes
 * @property {string} [routeClass]
 * @property {string} [edgeType]
 * @property {boolean} [specialCrossing]
 * @property {boolean} [tunnelRequired]
 * @property {string} [tunnelType]
 * @property {boolean} [isIntercontinentalGateway]
 */

export const MERGE_GATEWAY_ALIASES = {
  rio: 'Rio de Janeiro',
  'reykjavik': 'Reykjavík',
  'reykjavík': 'Reykjavík',
  'kuala lumpur': 'Kuala Lumpur',
  bengaluru: 'Bangalore',
  bombay: 'Mumbai',
};

/**
 * Explicit gateway chains to merge top disconnected components.
 * @type {PlanetaryMergeGatewayDef[]}
 */
export const planetaryMergeGateways = [
  {
    corridor: 'Arctic Planetary Gateway (Americas–Europe)',
    routeClass: HYPERLOOP_ROUTE_CLASSES.ARCTIC_GATEWAY,
    edgeType: 'PLANETARY_GATEWAY_ROUTE',
    specialCrossing: true,
    tunnelRequired: true,
    tunnelType: 'UNDERSEA_ARCTIC',
    isIntercontinentalGateway: true,
    nodes: ['Montreal', 'Nuuk', 'Reykjavík', 'London'],
  },
  {
    corridor: 'African Planetary Gateway (South–North Trunk)',
    routeClass: HYPERLOOP_ROUTE_CLASSES.PLANETARY_GATEWAY,
    edgeType: 'PLANETARY_GATEWAY_ROUTE',
    specialCrossing: true,
    isIntercontinentalGateway: true,
    nodes: [
      'Cape Town',
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
    corridor: 'West Africa Gateway Merge (into East Africa trunk)',
    routeClass: HYPERLOOP_ROUTE_CLASSES.PLANETARY_GATEWAY,
    edgeType: 'PLANETARY_GATEWAY_ROUTE',
    specialCrossing: false,
    isIntercontinentalGateway: true,
    nodes: ['Dakar', 'Lagos', 'Douala', 'Kinshasa', 'Lusaka'],
  },
  {
    corridor: 'Eurasia–SEA Planetary Gateway',
    routeClass: HYPERLOOP_ROUTE_CLASSES.PLANETARY_GATEWAY,
    edgeType: 'PLANETARY_GATEWAY_ROUTE',
    specialCrossing: true,
    isIntercontinentalGateway: true,
    nodes: [
      'Singapore',
      'Kuala Lumpur',
      'Bangkok',
      'Chennai',
      'Bangalore',
      'Mumbai',
      'Delhi',
      'Karachi',
      'Dubai',
      'Riyadh',
      'Istanbul',
    ],
  },
  {
    corridor: 'Australia–SEA Future Island Gateway',
    routeClass: HYPERLOOP_ROUTE_CLASSES.SPECIAL_FUTURE_CORRIDOR,
    edgeType: 'PLANETARY_GATEWAY_ROUTE',
    specialCrossing: true,
    tunnelRequired: true,
    tunnelType: 'UNDERSEA',
    isIntercontinentalGateway: true,
    nodes: ['Brisbane', 'Darwin', 'Jakarta', 'Singapore'],
  },
];
