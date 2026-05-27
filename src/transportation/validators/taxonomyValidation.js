import {
  isTransportationMode,
  isNodeType,
  isRouteType,
  isCityStatus,
} from '../registries/index.js';

export function validateEdgeTaxonomy(edge) {
  const errors = [];
  const mode = edge?.mode ?? edge?.edgeMode;
  const routeType = edge?.routeType ?? edge?.route_type;

  if (mode != null && !isTransportationMode(mode)) {
    errors.push(`invalid mode: ${String(mode)}`);
  }
  if (routeType != null && !isRouteType(routeType)) {
    errors.push(`invalid routeType: ${String(routeType)}`);
  }
  return errors;
}

export function validateNodeTaxonomy(node) {
  const errors = [];
  const status = node?.cityStatus ?? node?.city_status;
  if (status != null && !isCityStatus(status)) {
    errors.push(`invalid cityStatus: ${String(status)}`);
  }
  const nodeTypes = node?.nodeTypes ?? (node?.nodeType ? [node.nodeType] : []);
  for (const t of nodeTypes) {
    if (t != null && !isNodeType(t)) errors.push(`invalid nodeType: ${String(t)}`);
  }
  return errors;
}

