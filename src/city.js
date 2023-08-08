import { createBuilding } from './buildings/buildingFactory.js';
import { Tile } from './tile.js';

export class City {
  constructor(size) {
    this.size = size;

    /**
     * 2D array of tiles that make up the city
     * @type {Tile[][]}
     */
    this.tiles = [];

    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        const tile = new Tile(x, y);
        column.push(tile);
      }
      this.tiles.push(column);
    }  
  }
 
  /** Returns the title at the coordinates. If the coordinates
   * are out of bounds, then `null` is returned.
   * @param {number} x The x-coordinate of the tile
   * @param {number} y The y-coordinate of the tile
   * @returns {Tile | null}
   */
  getTile(x, y) {
    if (x === undefined || y === undefined ||
        x < 0 ||  y < 0 ||  
        x >= this.size ||  y >= this.size) {
      return null;
    } else {
      return this.tiles[x][y];
    }
  }

  getPopulation() {
    let population = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        population += tile.building?.residents?.length ?? 0;
      }
    }
    return population;
  }
  
  /**
   * Places a building at the specified coordinates if the
   * tile does not already have a building on it
   * @param {number} x 
   * @param {number} y 
   * @param {string} buildingType 
   */
  placeBuilding(x, y, buildingType) {
    const tile = this.getTile(x, y);

    // If the tile doesnt' already have a building, place one there
    if (tile && !tile.building) {
      tile.building = createBuilding(x, y, buildingType);
      tile.building.refresh(this);

      // Refresh the adjacent buildings as well
      this.getTile(x - 1, y)?.building?.refresh(this);
      this.getTile(x + 1, y)?.building?.refresh(this);
      this.getTile(x, y - 1)?.building?.refresh(this);
      this.getTile(x, y + 1)?.building?.refresh(this);
    }
  }

  /**
   * Bulldozes the building at the specified coordinates
   * @param {number} x 
   * @param {number} y
   */
  bulldoze(x, y) {
    const tile = this.getTile(x, y);

    if (tile.building) {
      tile.building.dispose();
      tile.building = null;

      // Refresh the adjacent buildings as well
      this.getTile(x - 1, y)?.building?.refresh(this);
      this.getTile(x + 1, y)?.building?.refresh(this);
      this.getTile(x, y - 1)?.building?.refresh(this);
      this.getTile(x, y + 1)?.building?.refresh(this);
    }
  }

  /**
   * Update the state of each tile in the city
   */
  step() {
    // Update each building
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        tile.building?.step(this);
      }
    }

    // Update each citizen
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        const residents = tile.building?.residents;
        if (residents) {
          residents.forEach(resident => resident.step(this));
        }
      }
    }
  }

  /**
   * Finds the first tile where the criteria are true
   * @param {{x: number, y: number}} start The starting coordinates of the search
   * @param {(Tile) => (boolean)} filter This function is called on each
   * tile in the search field until `filter` returns true, or there are
   * no more tiles left to search.
   * @param {number} maxDistance The maximum distance to search from the starting tile
   * @returns {Tile} The first tile matching `criteria`, otherwiser `null`
   */
  findTile(start, filter, maxDistance) {
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
      if (filter(tile)) {
        return tile;
      }
    }

    return null;
  }

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