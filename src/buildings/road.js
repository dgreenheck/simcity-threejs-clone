import { Building } from './building.js';
import { City } from '../city.js';

export class Road extends Building {
  constructor(x, y) {
    super(x, y);
    this.name = 'Two-Lane Road';
    this.type = 'road';
    this.style = 'straight';
    this.hideTerrain = true;
  }

  /**
   * Updates the road mesh based on which adjacent tiles
   * are roads as well
   * @param {City} city 
   */
  refresh(city) {
    // Check which adjacent tiles are roads
    let top = (city.getTile(this.x, this.y - 1)?.building?.type === this.type) ?? false;
    let bottom = (city.getTile(this.x, this.y + 1)?.building?.type === this.type) ?? false;
    let left = (city.getTile(this.x - 1, this.y)?.building?.type === this.type) ?? false;
    let right = (city.getTile(this.x + 1, this.y)?.building?.type === this.type) ?? false;

    // Check all combinations
    // Four-way intersection
    if (top && bottom && left && right) {
      this.style = 'four-way';
      this.rotation = 0;
    // T intersection
    } else if (!top && bottom && left && right) { // bottom-left-right
      this.style = 'three-way';
      this.rotation = 0;
    } else if (top && !bottom && left && right) { // top-left-right
      this.style = 'three-way';
      this.rotation = 180;
    } else if (top && bottom && !left && right) { // top-bottom-right
      this.style = 'three-way';
      this.rotation = 90;
    } else if (top && bottom && left && !right) { // top-bottom-left
      this.style = 'three-way';
      this.rotation = 270;
    // Corner
    } else if (top && !bottom && left && !right) { // top-left
      this.style = 'corner';
      this.rotation = 180;
    } else if (top && !bottom && !left && right) { // top-right
      this.style = 'corner';
      this.rotation = 90;
    } else if (!top && bottom && left && !right) { // bottom-left
      this.style = 'corner';
      this.rotation = 270;
    } else if (!top && bottom && !left && right) { // bottom-right
      this.style = 'corner';
      this.rotation = 0;
    // Straight
    } else if (top && bottom && !left && !right) { // top-bottom
      this.style = 'straight';
      this.rotation = 0;
    } else if (!top && !bottom && left && right) { // left-right
      this.style = 'straight';
      this.rotation = 90;
    // Dead end
    } else if (top && !bottom && !left && !right) { // top
      this.style = 'end';
      this.rotation = 180;
    } else if (!top && bottom && !left && !right) { // bottom
      this.style = 'end';
      this.rotation = 0;
    } else if (!top && !bottom && left && !right) { // left
      this.style = 'end';
      this.rotation = 270;
    } else if (!top && !bottom && !left && right) { // right
      this.style = 'end';
      this.rotation = 90;
    }

    this.isMeshOutOfDate = true;
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
    `;
    return html;
  }
}