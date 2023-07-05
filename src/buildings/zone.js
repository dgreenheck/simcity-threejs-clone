import config from '../config.js';
import { Building } from './building.js';

/**
 * Represents a zoned building such as residential, commercial or industrial
 */
export class Zone extends Building {
  constructor(x, y) {
    super(x, y);

    /**
     * The mesh style to use when rendering
     */
    this.style = Math.floor(3 * Math.random()) + 1;

    /**
     * True if this zone is developed
     */
    this.isDeveloped = false;

    /**
     * True if this zone has access to a road
     */
    this.hasRoadAccess = false;

    /**
     * The building level (1, 2 or 3)
     * @type {number}
     */
    this.level = 1;

    /**
     * Number of steps this zone has not met its development criteria,
     * which will lead to abandonment of the building
     * @type {number}
     */
    this.abandonmentCounter = 0;
  }

  /**
   * Performs a full refresh of the building state
   * @param {City} city 
   */
  refresh(city) {
    this.#checkRoadAccess(city);
  }

  /**
   * Updates the state of this building by one simulation step
   * @param {City} city 
   */
  step(city) {
    super.step(city);

    // Check to see if this zone's development criteria are met
    if (this.#checkDevelopmentCriteria()) {
      this.abandonmentCounter = 0;

      // 50/50 chance of developing when conditions are met
      if (Math.random() > 0.5) {
        this.isDeveloped = true;
        this.isMeshOutOfDate = true;
      }
    } else {
      this.abandonmentCounter++;
    }
  }

  /**
   * Returns true if this zone is able to be developed
   */
  #checkDevelopmentCriteria() {
    return this.hasRoadAccess;
  }

  /**
   * Checks nearby tiles to see if a road is available. This check
   * is only triggered when `refresh()` is called.
   * @param {City} city 
   */
  #checkRoadAccess(city) {
    const road = city.findTile(this, (tile) => {
      return tile.building?.type === 'road'
    }, config.zone.maxRoadSearchDistance);

    if (road) {
      this.hasRoadAccess = true;
    } else {
      this.hasRoadAccess = false;
    }
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += `Style: ${this.style}<br>`;
    html += `Road Access: ${this.hasRoadAccess}<br>`;
    html += `Developed: ${this.isDeveloped}<br>`;
    html += `Level: ${this.level}<br>`;
    return html;
  }
}