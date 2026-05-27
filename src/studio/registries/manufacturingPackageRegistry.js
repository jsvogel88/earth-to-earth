/**
 * Manufacturing package ladder — KilaPlant → PetaBond.
 * UI/registry only in Phase 1; map layers wired in future phases.
 */

export const MANUFACTURING_PACKAGES = [
  {
    id: 'kilaplant',
    label: 'KilaPlant',
    scaleLevel: 1,
    category: 'manufacturing_package',
    description:
      'Starter manufacturing and repair package for remote, lunar, Martian, or frontier deployment.',
    typicalPayloads: ['Robotics kits', '3D printers', 'Spare parts', 'Solar starter kits'],
    originHubTypes: ['kilaplant_hub', 'industrial_zone'],
    destinationHubTypes: ['mars_settlement', 'moon_base', 'remote_deployment'],
    associatedTransportModes: ['e2m', 'cargo', 'hyperloop'],
    mapStyle: { nodeColor: '#7dff9a', routeColor: '#7dff9a', thickness: 'thin' },
    defaultLayers: [],
    plannedOnly: true,
  },
  {
    id: 'megaline',
    label: 'MegaLine',
    scaleLevel: 2,
    category: 'manufacturing_package',
    description: 'Modular production-line package for focused equipment at meaningful scale.',
    typicalPayloads: ['Assembly lines', 'Battery lines', 'Habitat production lines'],
    originHubTypes: ['megaline_hub', 'manufacturing_export'],
    destinationHubTypes: ['starbase_cargo', 'mars_industrial'],
    associatedTransportModes: ['hyperloop', 'rail', 'e2m'],
    mapStyle: { nodeColor: '#5ce0a0', routeColor: '#5ce0a0', thickness: 'medium' },
    defaultLayers: [],
    plannedOnly: true,
  },
  {
    id: 'gigafactory',
    label: 'GigaFactory',
    scaleLevel: 3,
    category: 'manufacturing_package',
    description: 'High-volume regional manufacturing base for vehicles, batteries, and energy systems.',
    typicalPayloads: ['Batteries', 'Robotics', 'Transport modules', 'Starship support systems'],
    originHubTypes: ['gigafactory_hub', 'energy_zone'],
    destinationHubTypes: ['starbase_launch', 'port_hub'],
    associatedTransportModes: ['hyperloop', 'rail', 'e2m', 'cargo'],
    mapStyle: { nodeColor: '#c8e060', routeColor: '#c8e060', thickness: 'medium' },
    defaultLayers: [],
    plannedOnly: true,
  },
  {
    id: 'terafab',
    label: 'TeraFab',
    scaleLevel: 4,
    category: 'manufacturing_package',
    description:
      'Civilization-scale heavy fabrication for settlement infrastructure and planetary logistics components.',
    typicalPayloads: ['Heavy machinery', 'Habitat superstructures', 'Mining systems'],
    originHubTypes: ['terafab_hub', 'major_industrial'],
    destinationHubTypes: ['starbase_cargo', 'mars_industrial_city'],
    associatedTransportModes: ['rail', 'port', 'e2m', 'hyperloop'],
    mapStyle: { nodeColor: '#e8b84d', routeColor: '#e8b84d', thickness: 'thick' },
    defaultLayers: [],
    plannedOnly: true,
  },
  {
    id: 'petabond',
    label: 'PetaBond',
    scaleLevel: 5,
    category: 'manufacturing_package',
    description:
      'Planetary export package bundling autonomous manufacturing and transport-grid deployment for Moon/Mars.',
    typicalPayloads: ['KilaPlant', 'MegaLine', 'GigaFactory modules', 'Robotics fleets', 'Grid kits'],
    originHubTypes: ['terafab_hub', 'gigafactory_hub', 'petabond_deployment'],
    destinationHubTypes: ['e2m_mars', 'e2m_moon', 'mars_settlement'],
    associatedTransportModes: ['e2m', 'e2e', 'cargo'],
    mapStyle: { nodeColor: '#50ffc8', routeColor: '#50ffc8', thickness: 'thick', pulse: true },
    defaultLayers: ['showPetabondExportPackages'],
    plannedOnly: false,
  },
];

export function getManufacturingPackageById(id) {
  return MANUFACTURING_PACKAGES.find((p) => p.id === id) ?? null;
}

export function getManufacturingPackagesByScale() {
  return [...MANUFACTURING_PACKAGES].sort((a, b) => a.scaleLevel - b.scaleLevel);
}
