import { createCommercialZone } from './commercial.js';
import { createResidentialZone } from './residential.js';
import { createIndustrialZone } from './industrial.js';
import { createRoad } from './road.js';

export function createBuilding(coords, buildingType) {
  switch (buildingType) {
    case 'residential': return createResidentialZone(coords);
    case 'commercial': return createCommercialZone(coords);
    case 'industrial': return createIndustrialZone(coords);
    case 'road': return createRoad(coords);
    default:
      console.error(`${buildingType} is not a recognized building type.`);
  }
}