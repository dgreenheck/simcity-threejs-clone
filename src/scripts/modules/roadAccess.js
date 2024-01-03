import config from '../config.js';
import { City } from '../sim/city.js';
import { Tile } from '../sim/tile.js';
import { SimModule } from './simModule.js';

/**
 * Logic for determining whether or not a tile has road access
 */
export class RoadAccessModule extends SimModule {
  /**
   * @type {Tile}
   */
  #tile;

  constructor(tile) {
    super();
    this.#tile = tile;
  }

  /**
   * Updates the state of this attribute
   * @param {City} city 
   */
  simulate(city) {
    const road = city.findTile(
      this.#tile, 
      (tile) => tile.building?.type === 'road', 
      config.modules.roadAccess.searchDistance);

    this.value = (road !== null);
  }
}