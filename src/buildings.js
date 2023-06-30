import { createCitizen } from './citizens.js';

export function createBuilding(coords, buildingType) {
  switch (buildingType) {
    case 'residential': return createResidentialBuilding(coords);
    case 'commercial': return createCommercialBuilding(coords);
    case 'industrial': return createIndustrialBuilding(coords);
    case 'road': return createRoad(coords);
    default:
      console.error(`${buildingType} is not a recognized building type.`);
  }
}

function createResidentialBuilding(coords) {
  return {
    /* PROPERTIES  */

    id: crypto.randomUUID(),
    type: 'residential',
    coords,
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

function createCommercialBuilding(coords) {
  return {
    /* PROPERTIES */

    id: crypto.randomUUID(),
    type: 'commercial',
    coords,
    style: Math.floor(3 * Math.random()) + 1,
    height: 1,
    updated: true,

    // Citizens that work here
    workers: [],
    // Maximum number of workers this building can support
    maxWorkers: 4,

    /* METHODS */
    numberOfJobsAvailable() {
      return this.maxWorkers - this.workers.length;
    },

    numberOfJobsFilled() {
      return this.workers.length;
    },

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

      html += '<ul style="margin-top: 0; padding-left: 20px;">';
      if (this.workers.length > 0) {
        for (const worker of this.workers) {
          html += `<li>${worker.toHTML()}</li>`;
        }
      } else {
        html += '<li>None</li>'
      }
      html += '</ul>';

      return html;
    }
  }
}

function createIndustrialBuilding(coords) {
  return {
    /* PROPERTIES */

    id: crypto.randomUUID(),
    type: 'industrial',
    coords,
    style: Math.floor(3 * Math.random()) + 1,
    height: 1,
    updated: true,

    // Citizens that work here
    workers: [],
    // Maximum number of workers this building can support
    maxWorkers: 4,

    /* METHODS */
    numberOfJobsAvailable() {
      return this.maxWorkers - this.workers.length;
    },

    numberOfJobsFilled() {
      return this.workers.length;
    },
    
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

      html += `<br><strong>Workers (${this.numberOfJobsFilled()}/${this.maxWorkers})</strong>`;

      html += '<ul style="margin-top: 0; padding-left: 20px;">';
      if (this.workers.length > 0) {
        for (const worker of this.workers) {
          html += `<li>${worker.toHTML()}</li>`;
        }
      } else {
        html += '<li>None</li>'
      }
      html += '</ul>';

      return html;
    }
  }
}

function createRoad(coords) {
  return {
    /* PROPERTIES */

    id: crypto.randomUUID(),
    type: 'road',
    coords,
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