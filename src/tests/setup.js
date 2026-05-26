import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverMock;

  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = IntersectionObserverMock;
}

const storage = new Map();
const localStorageMock = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

class MapLibreMapMock {
  constructor() {
    this._handlers = {};
  }
  on(evt, handler) {
    this._handlers[evt] = handler;
    if (evt === 'load') queueMicrotask(() => handler());
    return this;
  }
  remove() {}
  addControl() {}
  removeControl() {}
  flyTo() {}
  getZoom() {
    return 4;
  }
  getCenter() {
    return { lng: 0, lat: 20 };
  }
  resize() {}
}

vi.mock('maplibre-gl', () => ({
  default: { Map: MapLibreMapMock },
}));

vi.mock('@deck.gl/mapbox', () => ({
  MapboxOverlay: class {
    setProps() {}
    finalize() {}
  },
}));

class MockDeckLayer {
  constructor(props = {}) {
    this.props = props;
    this.id = props.id;
  }
}

vi.mock('@deck.gl/layers', () => ({
  GeoJsonLayer: MockDeckLayer,
  ArcLayer: MockDeckLayer,
  PathLayer: MockDeckLayer,
  ScatterplotLayer: MockDeckLayer,
  TextLayer: MockDeckLayer,
}));
