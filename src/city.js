import { createTile } from './tile.js';

/**
 * Creates a new City object
 * @param {number} size The size of the city (# of tiles wide) 
 * @returns a City object
 */
export function createCity(size) {
  const tiles = [];

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

    /** Returns the title at the coordinates
     * @param {number} x The x-coordinate of the tile
     * @param {number} y The y-coordinate of the tile
     */
    getTile(x, y) {
      return tiles[x][y];
    },

    getPopulation() {
      let population = 0;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const tile = this.getTile(x, y);
          population += tile.building?.residents?.length ?? 0;
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
          const tile = this.getTile(x, y);
          tile.building?.update(this);
        }
      }
    },

    /**
     * Finds the first tile where the criteria are true
     * @param {{x: number, y: number}} start The starting coordinates of the search
     * @param {(object) => (boolean)} searchCriteria This function is called on each
     * tile in the search field until `searchCriteria` returns true, or there are
     * no more tiles left to search.
     * @param {number} maxDistance The maximum distance to search from the starting tile
     * @returns {object} The first tile matching `criteria`, otherwiser `null`
     */
    findTile(start, searchCriteria, maxDistance) {
      const startTile = this.getTile(start.x, start.y);
      const visited = new Set();
      const tilesToSearch = [];

      // Initialze our search with the starting tile
      tilesToSearch.push(startTile);

      while (tilesToSearch.length > 0) {
        const tile = tilesToSearch.shift();

        // Has this tile been visited? If so, ignore it and move on
        if (visited.has(tile.id)) {
          continue;
        } else {
          visited.add(tile.id);
        }

        // Check if tile is outside the search bounds
        const distance = startTile.distanceTo(tile);
        if (distance > maxDistance) continue;

        // Add this tiles neighbor's to the search list
        tilesToSearch.push(...this.getTileNeighbors(tile.x, tile.y));

        // If this tile passes the criteria 
        if (searchCriteria(tile)) {
          console.log(tile);
          return tile;
        }
      }

      return null;
    },

    /**
     * Finds and returns the neighbors of this tile
     * @param {number} x The x-coordinate of the tile
     * @param {number} y The y-coordinate of the tile
     */
    getTileNeighbors(x, y) {
      const neighbors = [];

      if (x > 0) {
        neighbors.push(this.getTile(x - 1, y));
      }
      if (x < this.size - 1) {
        neighbors.push(this.getTile(x + 1, y));
      }
      if (y > 0) {
        neighbors.push(this.getTile(x, y - 1));
      }
      if (y < this.size - 1) {
        neighbors.push(this.getTile(x, y + 1));
      }

      return neighbors;
    }
  }
}