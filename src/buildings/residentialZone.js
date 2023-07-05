import { Citizen } from '../citizens.js';
import { City } from '../city.js';
import { Zone } from './zone.js';

export class ResidentialZone extends Zone {
  constructor(x, y) {
    super(x, y);
    this.type = 'residential';
    
    /**
     * Residents that live in this building
     * @type {Citizen[]}
     */
    this.residents = [];

    /**
     * Maximum number of people that can live in this building
     * @type {number}
     */
    this.maxResidents = 4;
  }

  /**
   * Updates the state of this building by one simulation step
   * @param {City} city 
   */
  step(city) {
    super.step(city);

    if (this.isDeveloped) {
      // Move in new residents
      if (this.residents.length < this.maxResidents) {
        const resident = new Citizen(this);
        this.residents.push(resident);
      }
    }
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    for (const resident of this.residents) {
      resident.dispose();
    }
    super.dispose();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += `<br><strong>Residents</strong>`;

    html += '<ul style="margin-top: 0; padding-left: 20px;">';
    if (this.residents.length > 0) {
      for (const resident of this.residents) {
        html += resident.toHTML();
      }
    } else {
      html += '<li>None</li>'
    }
    html += '</ul>';

    return html;
  }
}