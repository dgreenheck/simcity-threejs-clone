import { createTile } from './tile.js';

/**
 * Creates a new City object
 * @param {number} size The size of the city (# of tiles wide) 
 * @returns a City object
 */
export function createCity(size) {
  const tiles = [];
  const citizens = [];

  for (let x = 0; x < size; x++) {
    const column = [];
    for (let y = 0; y < size; y++) {
      const tile = createTile(x, y);
      column.push(tile);
    }
    tiles.push(column);
  }

  return {
    /* PROPERTIES */

    size,
    tiles,
    citizens,

    /* METHODS */

    getPopulation() {
      return this.citizens.length;
    },
    
    /**
     * Update the state of each tile in the city
     */
    update() {
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          tiles[x][y].building?.update(this);
        }
      }
    }
  }
}