import { City } from '../../sim/city.js';
import config from '../../config.js';
import { Tile } from '../tile.js';

/**
 * Logic for controlling building abandonment
 */
export class RoadAccessAttribute {
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
  update(city) {
    const road = city.findTile(
      this.#tile, 
      (tile) => tile.building?.type === 'road', 
      config.attributes.roadAccess.searchDistance);

    this.value = (road !== null);
  }
}