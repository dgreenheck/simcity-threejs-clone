import { createCitizen } from './citizens.js';

export function createBuilding(buildingType) {
  switch (buildingType) {
    case 'residential': return createResidentialBuilding();
    case 'commercial': return createCommercialBuilding();
    case 'industrial': return createIndustrialBuilding();
    case 'road': return createRoad();
    default:
      console.error(`${buildingType} is not a recognized building type.`);
  }
}

function createResidentialBuilding() {
  return {
    /* PROPERTIES  */

    id: crypto.randomUUID(),
    type: 'residential',
    style: Math.floor(3 * Math.random()) + 1,
    height: 1,
    updated: true,

    // Array of residents that live in this building
    residents: [],
    // This is the maximum number of people that can live in this building at one time
    maxResidents: 4,

    /* METHODS */

    /**
     * Updates the state of this building by one simulation step
     * @param {object} city 
     */
    update(city) {
      if (this.residents.length < this.maxResidents) {
        const resident = createCitizen(this);
        this.residents.push(resident);
        city.citizens.push(resident);
        console.log(resident);
      }

      if (Math.random() < 0.02) {
        if (this.height < 5) {
          this.height += 1;
          this.updated = true;
        }
      }
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
          html += `<li>${resident.toHTML()}</li>`;
        }
      } else {
        html += '<li>None</li>'
      }
      html += '</ul>';

      return html;
    }
  }
}

function createCommercialBuilding() {
  return {
    /* PROPERTIES */

    id: crypto.randomUUID(),
    type: 'commercial',
    style: Math.floor(3 * Math.random()) + 1,
    height: 1,
    updated: true,

    /* METHODS */

    /**
     * Updates the state of this building by one simulation step
     * @param {object} city 
     */
    update(city) {
      if (Math.random() < 0.02) {
        if (this.height < 5) {
          this.height += 1;
          this.updated = true;
        }
      }
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
      return html;
    }
  }
}

function createIndustrialBuilding() {
  return {
    /* PROPERTIES */

    id: crypto.randomUUID(),
    type: 'industrial',
    style: Math.floor(3 * Math.random()) + 1,
    height: 1,
    updated: true,

    /* METHODS */

    /**
     * Updates the state of this building by one simulation step
     * @param {object} city 
     */
    update(city) {
      if (Math.random() < 0.02) {
        if (this.height < 5) {
          this.height += 1;
          this.updated = true;
        }
      }
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
      return html;
    }
  }
}

function createRoad() {
  return {
    /* PROPERTIES */

    id: crypto.randomUUID(),
    type: 'road',
    updated: true,

    /* METHODS */

    /**
     * Updates the state of this building by one simulation step
     * @param {object} city 
     */
    update(city) {
      this.updated = false;
    },

    /**
     * Returns an HTML representation of this object
     * @returns {string}
     */
    toHTML() {
      let html = '';
      html += '<br><strong>Building</strong><br>';
      html += `Type: ${this.type}<br>`;
      return html;
    }
  }
}