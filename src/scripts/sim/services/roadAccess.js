import config from '../../config.js';
import { City } from '../city.js';
import { SimService } from './simService.js';

/**
 * Calculates road access 
 */
export class RoadAccessService extends SimService {
  /**
   * Updates the state of this attribute
   * @param {City} city 
   */
  simulate(city) {
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        const building = tile.building;
        if (building) {
          building.hasRoadAccess = this.#findRoad(tile, city);
        }
      }
    }
  }

  #findRoad(tile, city) {
    // TODO: Avoid recomputing this if roads have not updated
    const road = city.findTile(
      tile, 
      (searchTile) => searchTile.building?.type === 'road', 
      config.modules.roadAccess.searchDistance);

    return (road !== null);
  }
}