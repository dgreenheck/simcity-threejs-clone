import { CommercialZone } from './zones/commercial.js';
import { ResidentialZone } from './zones/residential.js';
import { IndustrialZone } from './zones/industrial.js';
import { Road } from './services/transportation/road.js';
import { Building } from './building.js';

export const BuildingType = {
  residential: 'residential',
  commercial: 'commercial',
  industrial: 'industrial',
  road: 'road'
}

/**
 * Creates a new building object
 * @param {number} x The x-coordinate of the building
 * @param {number} y The y-coordinate of the building
 * @param {string} type The building type
 * @returns {Building} A new building object
 */
export function createBuilding(x, y, type) {
  switch (type) {
    case BuildingType.residential: 
      return new ResidentialZone();
    case BuildingType.commercial: 
      return new CommercialZone();
    case BuildingType.industrial: 
      return new IndustrialZone();
    case BuildingType.road: 
      return new Road();
    default:
      console.error(`${type} is not a recognized building type.`);
  }
}