import { createCitizen } from '../citizen.js';

export function createResidentialZone(x, y) {
  return {
    /* PROPERTIES  */

    id: crypto.randomUUID(),
    type: 'residential',
    x,
    y,
    style: Math.floor(3 * Math.random()) + 1,
    height: 1,
    updated: true,

    // Array of residents that live in this building
    residents: [],
    // This is the maximum number of people that can live in this building at one time
    maxResidents: 1,

    /* METHODS */

    /**
     * Updates the state of this building by one simulation step
     * @param {object} city 
     */
    update(city) {
      this.residents.forEach(resident => resident.update(city));

      // Move in new residents
      if (this.residents.length < this.maxResidents) {
        const resident = createCitizen(this);
        this.residents.push(resident);
      }

      // Update building development state
      if (Math.random() < 0.02) {
        if (this.height < 5) {
          this.height += 1;
          this.updated = true;
        }
      }
    },

    /**
     * Handles any clean up needed before a building is removed
     */
    dispose() {

    },

    /**
     * Returns an HTML representation of this object
     * @returns {string}
     */
    toHTML() {
      let html = '';
      html += '<br><strong>Building</strong><br>';
      html += `Type: ${this.type}<br>`;
      html += `Style: ${this.style}<br>`;
      html += `Height: ${this.height}<br>`;

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
}