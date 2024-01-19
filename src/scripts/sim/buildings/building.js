import { SimObject } from '../simObject';

export class Building extends SimObject {
  /**
   * The building type
   * @type {string}
   */
  type = 'building';
  /**
   * True if the terrain should not be rendered with this building type
   * @type {boolean}
   */
  hideTerrain = false;
  /**
   * Whether or not this building has access to a road
   */
  hasRoadAccess = false;
  /**
   * Amount of power supplied to this building (if powerRequired > 0)
   */
  powerSupplied = 0;

  /**
   * Returns true if this building's power requirements are met
   */
  get isPowered() {
    return this.powerSupplied >= this.powerRequired;
  }

  /**
   * Amount of power this building needs
   */
  get powerRequired() {
    return 0;
  }
  
  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = `
      <div class="info-heading">Building</div>
      <span class="info-label">Name </span>
      <span class="info-value">${this.name}</span>
      <br>
      <span class="info-label">Type </span>
      <span class="info-value">${this.type}</span>
      <br>
      <span class="info-label">Power </span>
      <span class="info-value">${this.isPowered}</span>
      <br>
      <span class="info-label">Road Access </span>
      <span class="info-value">${this.hasRoadAccess}</span>
      <br>
    `;
    return html;
  }
}