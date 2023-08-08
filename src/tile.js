import { Building } from './buildings/building.js';

export class Tile {
  /**
   * Creates a new `Tile` object
   * @param {number} x The x-coordinate of the tile 
   * @param {number} y The y-coordinate of the tile
   */
  constructor(x, y) {
    /**
     * Unique identifier for this tile
     * @type {string}
     */
    this.id = crypto.randomUUID();
    
    /**
     * The x-coordinate of the tile
     * @type {number}
     */
    this.x = x;

    /**
     * The y-coordinate of the tile
     * @type {number}
     */
    this.y = y;

    /**
     * The type of terrain
     * @type {string}
     */
    this.terrain = 'grass';

    /**
     * The building on this tile
     * @type {Building?}
     */
    this.building = null;
  }

  /**
   * Gets the Manhattan distance between two tiles
   * @param {Tile} tile 
   * @returns 
   */
  distanceTo(tile) {
    return Math.abs(this.x - tile.x) + Math.abs(this.y - tile.y);
  }

  /**
   * 
   * @returns {string} HTML representation of this object
   */
  toHTML() {
    let html = `
      <span class="info-label">Coordinates </span>
      <span class="info-value">X: ${this.x}, Y: ${this.y}</span>
      <br>
      <span class="info-label">Terrain </span>
      <span class="info-value">${this.terrain}</span>
      <br>
    `;

    if (this.building) {
      html += this.building.toHTML();
    }

    return html;
  }
};