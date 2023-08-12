import config from '../config.js';
import { Building } from './building.js';

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
     * True if this zone is abandoned
     */
    this.abandoned = false;

    /**
     * True if this zone is developed
     */
    this.developed = false;

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
   * Updates the state of this building by one simulation step
   * @param {City} city 
   */
  step(city) {
    super.step(city);

    // Check to see if this zone's development criteria are met. If they
    // are, the zone has a non-zero chance of developing a building
    if (this.checkDevelopmentCriteria(city)) {
      this.abandonmentCounter = 0;
      if (Math.random() < config.zone.developmentChance) {
        this.abandoned = false;
        this.developed = true;
        this.isMeshOutOfDate = true;
      }

    // If the zone has failed to meet its basic requirements
    // for enough time, there is a chance of the zone becoming abandoned
    } else {
      this.abandonmentCounter++;
      if (this.abandonmentCounter >= config.zone.abandonmentThreshold) {
        if (Math.random() < config.zone.abandonmentChance) {
          this.abandoned = true;
          this.isMeshOutOfDate = true;
        }
      }
    }
  }

  /**
   * Returns true if this zone is able to be developed
   */
  checkDevelopmentCriteria(city) {
    this.checkRoadAccess(city);
    return this.hasRoadAccess;
  }

  /**
   * Checks nearby tiles to see if a road is available. This check
   * is only triggered when `refresh()` is called.
   * @param {City} city 
   */
  checkRoadAccess(city) {
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
    html += `
    <span class="info-label">Style </span>
    <span class="info-value">${this.style}</span>
    <br>
    <span class="info-label">Abandoned </span>
    <span class="info-value">${this.abandoned} (${this.abandonmentCounter}/${config.zone.abandonmentThreshold})</span>
    <br>
    <span class="info-label">Road Access </span>
    <span class="info-value">${this.hasRoadAccess}</span>
    <br>
    <span class="info-label">Developed </span>
    <span class="info-value">${this.developed}</span>
    <br>
    <span class="info-label">Level </span>
    <span class="info-value">${this.level}</span>
    <br>
    `;
    return html;
  }
}