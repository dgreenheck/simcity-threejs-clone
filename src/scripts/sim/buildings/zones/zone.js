import { DevelopmentAttribute } from '../attributes/development.js';
import { Building } from '../building.js';

/**
 * Represents a zoned building such as residential, commercial or industrial
 */
export class Zone extends Building {
  constructor(x, y) {
    super(x, y);
    this.rotation = 90 * Math.floor(4 * Math.random());
    
    /**
     * The mesh style to use when rendering
     */
    this.style = String.fromCharCode(Math.floor(3 * Math.random()) + 65);

    /**
     * True if this zone is developed
     */
    this.development = new DevelopmentAttribute(this);
  }

  simulate(city) {
    super.simulate(city);
    this.development.simulate(city);
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += this.development.toHTML();
    return html;
  }
}