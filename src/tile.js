import { createBuilding } from './buildings/buildings.js';

/**
 * Creates a new tile object
 * @param {number} x The x-coordinate of the tile
 * @param {number} y The y-coordinate of the tile
 * @returns A new Tile instance
 */
export function createTile(x, y) {
  return {
    /* PROPERTIES */
    id: crypto.randomUUID(),
    x,
    y,
    terrainId: 'ground',
    building: null,

    /* METHODS */

    distanceTo(tile) {
      return Math.abs(this.x - tile.x) + 
             Math.abs(this.y - tile.y);
    },

    /**
     * Removes the building from this tile
     */
    removeBuilding() {
      this.building.dispose();
      this.building = null;
    },

    /**
     * Places a new building onto the tile
     * @param {string} tile 
     */
    placeBuilding(buildingType) {
      this.building = createBuilding(x, y, buildingType);
    },

    /**
     * 
     * @returns {string} HTML representation of this object
     */
    toHTML() {
      let html = '';
      html += `Coordinates: (X: ${this.x}, Y: ${this.y})<br>`;
      html += `Terrain: ${this.terrainId}<br>`;

      if (this.building) {
        html += this.building.toHTML();
      }

      return html;
    }
  };
}