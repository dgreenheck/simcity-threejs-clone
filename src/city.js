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
      const tile = createTile({ x, y });
      column.push(tile);
    }
    tiles.push(column);
  }

  return {
    /* PROPERTIES */

    size,

    /** Returns the title at the coordinates
     * @param {{ x: number, y: number }} coords
     */
    getTile(coords) {
      return tiles[coords.x][coords.y];
    },

    getPopulation() {
      let population = 0;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const tile = this.getTile({ x, y });
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
          const tile = this.getTile({ x, y });
          tile.building?.update(this);
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
      const startTile = this.getTile(startPosition);
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

        console.log(tile);

        // Check if tile is outside the search bounds
        const distance = startTile.distanceTo(tile);
        if (distance > maxDistance) continue;

        // Add this tiles neighbor's to the search list
        tilesToSearch.push(...this.getTileNeighbors(tile.coords));

        console.log(tilesToSearch);

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
     * @param {*} coords Coordinates of the starting tile
     */
    getTileNeighbors(coords) {
      const neighbors = [];

      if (coords.x > 0) {
        neighbors.push(this.getTile({ x: coords.x - 1, y: coords.y }));
      }
      if (coords.x < this.size - 1) {
        neighbors.push(this.getTile({ x: coords.x + 1, y: coords.y }));
      }
      if (coords.y > 0) {
        neighbors.push(this.getTile({ x: coords.x, y: coords.y - 1}));
      }
      if (coords.y < this.size - 1) {
        neighbors.push(this.getTile({ x: coords.x, y: coords.y + 1}));
      }

      return neighbors;
    }
  }
}