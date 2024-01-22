import config from '../../../config.js';
import { City } from '../../city.js';
import { Building } from '../building.js';
import { SimModule } from './simModule.js';

/**
 * Logic for determining whether or not a tile has road access
 */
export class RoadAccessModule extends SimModule {
  /**
   * @type {Building}
   */
  building;
  /**
   * Whether or not the tile has access to a road
   * @type {boolean}
   */
  value;

  /**
   * @param {Building} building 
   */
  constructor(building) {
    super();
    this.building = building;
  }

  /**
   * Updates the state of this attribute
   * @param {City} city 
   */
  simulate(city) {
    const road = city.findTile(
      this.building, 
      (tile) => tile.building?.type === 'road', 
      config.modules.roadAccess.searchDistance);

    this.value = (road !== null);
  }
}