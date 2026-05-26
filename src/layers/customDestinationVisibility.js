import { CUSTOM_LAYER_TAGS, formatLayerTagLabel } from '../data/userCustomDestinations.js';
import {
  isE2EStarshipMode,
  isHyperloopCoreMode,
  isE2MOrbitalMode,
  isCivilizationGridMode,
  isRobotaxiMode,
  normalizeTransportMode,
  getTransportModeLabel,
} from '../data/transportOperatingSystem.js';
import { toCustomDestinationMapPoint } from '../data/userCustomDestinations.js';

export function modeToLayerTag(mode) {
  const m = normalizeTransportMode(mode);
  if (isE2EStarshipMode(m)) return CUSTOM_LAYER_TAGS.E2E;
  if (isHyperloopCoreMode(m)) return CUSTOM_LAYER_TAGS.HYPERLOOP;
  if (isE2MOrbitalMode(m)) return CUSTOM_LAYER_TAGS.E2M;
  if (isRobotaxiMode(m)) return CUSTOM_LAYER_TAGS.ROBOTAXI;
  if (isCivilizationGridMode(m)) return CUSTOM_LAYER_TAGS.CIVILIZATION;
  return CUSTOM_LAYER_TAGS.CIVILIZATION;
}

/** Overlay filter — does not affect planetary graph. */
export function filterCustomDestinationsForView(destinations, transportMode) {
  const tag = modeToLayerTag(transportMode);
  return destinations
    .filter((d) => {
      const layers = d.enabledLayers || [];
      if (isCivilizationGridMode(normalizeTransportMode(transportMode))) return true;
      return layers.length === 0 || layers.includes(tag);
    })
    .map(toCustomDestinationMapPoint)
    .filter((d) => d.renderable);
}

/** List UI sections — does not affect graph. */
export function partitionCustomDestinationsByMode(destinations, transportMode) {
  const mode = normalizeTransportMode(transportMode);
  if (isCivilizationGridMode(mode)) {
    return [{ title: 'All custom destinations', items: destinations }];
  }

  const tag = modeToLayerTag(mode);
  const visible = [];
  const other = [];
  for (const d of destinations) {
    if ((d.enabledLayers || []).includes(tag)) visible.push(d);
    else other.push(d);
  }

  const sections = [];
  if (visible.length > 0) {
    sections.push({
      title: `Visible in ${getTransportModeLabel(mode)} (${formatLayerTagLabel(tag)})`,
      items: visible,
    });
  }
  if (other.length > 0) {
    sections.push({ title: 'Other layer tags', items: other });
  }
  return sections.length > 0 ? sections : [{ title: 'Custom destinations', items: destinations }];
}
