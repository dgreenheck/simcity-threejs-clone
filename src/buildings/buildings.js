import { createCommercialZone } from './commercial.js';
import { createResidentialZone } from './residential.js';
import { createIndustrialZone } from './industrial.js';
import { createRoad } from './road.js';

/**
 * Creates a new building object
 * @param {number} x The x-coordinate of the building
 * @param {number} y The y-coordinate of the building
 * @param {string} buildingType The building type
 * @returns A new building object
 */
export function createBuilding(x, y, buildingType) {
  switch (buildingType) {
    case 'residential': return createResidentialZone(x, y);
    case 'commercial': return createCommercialZone(x, y);
    case 'industrial': return createIndustrialZone(x, y);
    case 'road': return createRoad(x, y);
    default:
      console.error(`${buildingType} is not a recognized building type.`);
  }
}