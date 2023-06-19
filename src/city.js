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

    /* METHODS */

    getPopulation() {
      let population = 0;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          population += tiles[x][y].building?.residents?.length ?? 0;
        }
      }
      return population;
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
    },

    /**
     * Finds the first tile where the criteria are true
     * @param {{x: number, y: number}} startPosition 
     * @param {(object) => (boolean)} searchCriteria This function is called on each
     * tile in the search field until `searchCriteria` returns true, or there are
     * no more tiles left to search.
     * @param {number} maxDistance The maximum distance to search from the starting tile
     * @returns {object} The first tile matching `criteria`, otherwiser `null`
     */
    findTile(startPosition, searchCriteria, maxDistance) {
      const startTile = tiles[startPosition.x][startPosition.y];
      [].find
      const visited = new Set([startTile.id]);
      const tilesToSearch = [];

      // Initialze our search with the starting tile
      tilesToSearch.push(startTile);

      while (tilesToSearch.length > 0) {
        const tile = tilesToSearch.shift();
        visited.add(tile);

        // Check if tile is outside the search bounds
        if (startTile.distanceTo(tile) > maxDistance) continue;

        // Add this tiles neighbor's to the search list
        tilesToSearch.push(...this.findNeighbors(tile));

        // Has this tile been visited? If so, ignore it and move on
        if (visited.has(tile.id)) continue;
        // If this tile passes the criteria 
        if (searchCriteria(tile)) return tile;
      }

      return null;
    },

    /**
     * Finds and returns the neighbors of this tile
     * @param {*} tile 
     * @param {number} maxDistance The maximum distance to search for neighbors
     */
    findNeighbors(tile, maxDistance = 1) {
      const neighbors = [];

      const minX = Math.max(0, tile.x - maxDistance);
      const maxX = Math.max(size - 1, tile.x + maxDistance);
      const minY = Math.max(0, tile.y - maxDistance);
      const maxY = Math.max(size - 1, tile.y + maxDistance);

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          neighbors.push(data[x][y]);
        }
      }
    }
  }
}