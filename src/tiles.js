import Building from './buildings.js';

/**
 * Creates a new tile object
 * @param {number} x The x-coordinate of the tile
 * @param {number} y The y-coordinate of hte tile
 * @returns 
 */
export default function Tile(x, y) {
  return { 
    id: crypto.randomUUID(),
    x, 
    y,
    terrainId: 'ground',
    building: null,

    /**
     * Removes the building from the tile
     * @param {object} tile The tile to remove the building remove
     */
    removeBuilding() {
      this.building = null;
    },

    /**
     * Places a building on the tile
     * @param {object} tile The tile to place the building on
     * @returns {boolean} True if the building was successfully added
     */
    placeBuilding(buildingType) {
      if (!this.building) {
        this.building = Building(buildingType);
      }
    },

    /**
     * Computes the Manhattan distance from this tile to `tile`
     * @param {object} tile The tile to measure the distance to
     */
    distanceTo(tile) {
      return Math.abs((this.x - tile.x) + (this.y - tile.y));
    },

    /**
     * Returns a string representation of this tile
     */
    toHTML() {
      let result = '';
      result += '<strong>Tile</strong><br>'
      result += `ID: ${this.id}<br>`;
      result += `Coordinates: (X: ${this.x}, Y: ${this.y})<br>`;
      result += `Terrain ID: ${this.terrainId}<br>`;

      if (this.building) {
        result += this.building.toHTML();
      }
      
      return result;
    }
  };
}