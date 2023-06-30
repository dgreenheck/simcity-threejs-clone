import { createBuilding } from './buildings/buildings.js';

/**
 * Creates a new tile object
 * @param {number} coords The coordinates of the tile
 * @returns 
 */
export function createTile({ x, y }) {
  return {
    /* PROPERTIES */
    id: crypto.randomUUID(),
    coords: {
      x,
      y
    },
    terrainId: 'ground',
    building: null,

    /* METHODS */

    distanceTo(tile) {
      return Math.abs(this.coords.x - tile.coords.x) + 
             Math.abs(this.coords.y - tile.coords.y);
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
      this.building = createBuilding(this.coords, buildingType);
    },

    /**
     * 
     * @returns {string} HTML representation of this object
     */
    toHTML() {
      let html = '';
      html += `Coordinates: (X: ${this.coords.x}, Y: ${this.coords.y})<br>`;
      html += `Terrain: ${this.terrainId}<br>`;

      if (this.building) {
        html += this.building.toHTML();
      }

      return html;
    }
  };
}