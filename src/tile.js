import { createBuilding } from './buildings.js';

/**
 * Creates a new tile object
 * @param {number} x The x-coordinate of the tile
 * @param {number} y The y-coordinate of hte tile
 * @returns 
 */
export function createTile(x, y) {
  return {
    /* PROPERTIES */
    x,
    y,
    terrainId: 'ground',
    building: null,

    /* METHODS */

    /**
     * Removes the building from this tile
     */
    removeBuilding() {
      this.building = null;
    },

    /**
     * Places a new building onto the tile
     * @param {string} tile 
     */
    placeBuilding(buildingType) {
      this.building = createBuilding(buildingType);
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