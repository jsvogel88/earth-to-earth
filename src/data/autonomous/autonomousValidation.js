/**
 * Validation for generated autonomous transport objects.
 */

import { getAutonomousModeById } from './autonomousModeRegistry.js';
import { FEATURE_FLAGS } from './autonomousConstants.js';

const DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

function logWarning(message) {
  if (DEV) console.warn(`[AUTONOMOUS] ${message}`);
}

/**
 * @param {object} obj
 * @param {string} kind
 */
export function validateAutonomousObject(obj, kind) {
  const warnings = [];
  if (!obj?.id) warnings.push(`${kind}: missing id`);
  if (obj?.lat != null && (obj.lat < -90 || obj.lat > 90)) {
    warnings.push(`${kind} ${obj.id}: invalid lat`);
  }
  if (obj?.lng != null && (obj.lng < -180 || obj.lng > 180)) {
    warnings.push(`${kind} ${obj.id}: invalid lng`);
  }
  if (obj?.modeId && !getAutonomousModeById(obj.modeId)) {
    warnings.push(`Invalid modeId "${obj.modeId}" — skipped`);
  }
  if (obj?.radiusMiles != null && obj.radiusMiles <= 0) {
    warnings.push(`${kind} ${obj.id}: invalid radiusMiles`);
  }
  if (obj?.distanceMiles != null && obj.distanceMiles <= 0) {
    warnings.push(`${kind} ${obj.id}: invalid distanceMiles`);
  }
  if (kind === 'corridor' && (!obj.originHubId || !obj.destinationHubId)) {
    warnings.push(`${kind} ${obj.id}: missing origin/destination`);
  }
  warnings.forEach(logWarning);
  return warnings;
}

/**
 * @param {object} system
 */
export function validateAutonomousSystem(system) {
  const warnings = [...(system?.warnings ?? [])];

  if (!FEATURE_FLAGS.ENABLE_TESLA_DRONE_LAYER) {
    if (system?.teslaDronePorts?.length) {
      warnings.push('Drone ports present while ENABLE_TESLA_DRONE_LAYER is false');
    }
  }

  for (const area of system?.robotaxiServiceAreas ?? []) {
    warnings.push(...validateAutonomousObject(
      { ...area, lat: area.coordinates?.[1], lng: area.coordinates?.[0] },
      'robotaxi_zone'
    ));
  }

  return warnings;
}
