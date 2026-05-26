/**
 * Future bridge: Route Optimizer → main map (B2B hubs / Starship routes).
 * The map always uses built-in defaults until `applyToMap` is enabled.
 */

export const MAP_NETWORK_CONFIG_KEY = 'transport-map.mapNetworkConfig.v1';

/** Default map behavior (current B2B hubs + hyperloop/Starship rules). */
export function getDefaultMapNetworkConfig() {
  return {
    applyToMap: false,
    enabledHubCodes: null,
    enabledRouteIds: null,
    updatedAt: null,
  };
}

/** What the map reads today — always defaults. */
export function loadMapNetworkConfig() {
  return getDefaultMapNetworkConfig();
}

/** Reserved for when optimizer should drive the main map (not wired yet). */
export function savePendingMapNetworkConfig(_payload) {
  return getDefaultMapNetworkConfig();
}
