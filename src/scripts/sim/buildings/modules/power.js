import { SimModule } from './simModule.js';

/**
 * Logic for determining whether or not a tile has road access
 */
export class PowerModule extends SimModule {
  /**
   * Amount of power supplied to this building (if powerRequired > 0)
   * @type {number}
   */
  supplied = 0;

  /**
   * Amount of power this building needs
   * @type {number}
   */
  required = 0;

  /**
   * @param {number} powerRequired Amount of power (kWh) this building needs
   */
  constructor(powerRequired) {
    super();
    this.required = this.supplied;
  }

  /**
   * Returns true if building is fully powered
   * @type {boolean}
   */
  get isFullyPowered () {
    return this.supplied >= this.required;
  }
}