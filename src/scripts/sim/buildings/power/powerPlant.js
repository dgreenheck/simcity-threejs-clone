import { City } from '../../city.js';
import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';

export class PowerPlant extends Building {

  /**
   * Available units of power
   */
  powerCapacity = 100;

  /**
   * Consumed units of power
   */
  powerConsumed = 0;

  constructor(x, y) {
    super(x, y);
    this.type = BuildingType.powerPlant;
  }

  /**
   * Gets the amount of power available
   */
  get powerAvailable() {
    return this.powerCapacity - this.powerConsumed;
  }

  updateMesh(city) {
    let mesh = window.assetManager.createInstance(this.type, this);
    this.setMesh(mesh);
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += `
      <div class="info-heading">Power</div>
      <span class="info-label">Power Capacity </span>
      <span class="info-value">${this.powerCapacity}</span>
      <br>
      <span class="info-label">Power Consumed </span>
      <span class="info-value">${this.powerConsumed}</span>
      <br>
      <span class="info-label">Power Available </span>
      <span class="info-value">${this.powerAvailable}</span>
      <br>
    `;
    return html;
  }
}