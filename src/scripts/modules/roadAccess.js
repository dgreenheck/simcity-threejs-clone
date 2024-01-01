import config from '../config.js';
import { City } from '../sim/city.js';
import { Tile } from '../sim/tile.js';

/**
 * Logic for controlling building abandonment
 */
export class RoadAccessModule {
  /**
   * @type {Tile}
   */
  #tile;

  constructor(tile) {
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