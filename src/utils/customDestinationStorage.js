/**
 * Persist user custom destinations in localStorage (no backend).
 */

import { createCustomDestinationFromCity } from '../data/userCustomDestinations.js';

export const CUSTOM_DESTINATIONS_STORAGE_KEY = 'transport-map-custom-destinations-v1';

export function loadCustomDestinations() {
  try {
    const raw = localStorage.getItem(CUSTOM_DESTINATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((d) => d?.worldCityId && d?.name) : [];
  } catch {
    return [];
  }
}

export function saveCustomDestinations(destinations) {
  try {
    localStorage.setItem(CUSTOM_DESTINATIONS_STORAGE_KEY, JSON.stringify(destinations));
    return true;
  } catch {
    return false;
  }
}

export function addCustomDestination(destinations, city, options = {}) {
  const entry = createCustomDestinationFromCity(city, options);
  if (destinations.some((d) => d.worldCityId === entry.worldCityId)) {
    return { list: destinations, added: null, duplicate: true };
  }
  const list = [...destinations, entry];
  saveCustomDestinations(list);
  return { list, added: entry, duplicate: false };
}

export function removeCustomDestination(destinations, id) {
  const list = destinations.filter((d) => d.id !== id);
  saveCustomDestinations(list);
  return list;
}

export function updateCustomDestination(destinations, id, patch) {
  const list = destinations.map((d) => (d.id === id ? { ...d, ...patch } : d));
  saveCustomDestinations(list);
  return list;
}
