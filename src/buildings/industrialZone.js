import { City } from '../city.js';
import { Zone } from './zone.js';

export class IndustrialZone extends Zone {
  constructor(x, y) {
    super(x, y);

    this.name = generateBusinessName();
    this.type = 'industrial';

    this.level = 1; // currently only has one level due to lack of models

    // Citizens that work here
    this.workers = [];
    // Maximum number of workers this building can support
    this.maxWorkers = 4;
  }

  /**
   * Returns the number of job openings
   * @returns {number}
   */
  numberOfJobsAvailable() {
    // If building is not developed, there are no available jobs
    if (this.abandoned || !this.developed) return 0;
    // Otherwise return the number of vacant positions
    return this.maxWorkers - this.workers.length;
  }

  /**
   * Returns the number of positions that are filled
   * @returns {number}
   */
  numberOfJobsFilled() {
    return this.workers.length;
  }
  
  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city 
   */
  step(city) {
    super.step(city);

    // If building is abandoned, all workers are laid off and no
    // more workers are allowed to work here
    if (this.abandoned) {
      this.#layOffWorkers();
    }
  }

  /**
   * Lay off all existing workers
   */
  #layOffWorkers() {
    for (const worker of this.workers) {
      worker.setWorkplace(null);
    }
    this.workers = [];
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    this.#layOffWorkers();
    super.dispose();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();

    html += `
    <div class="info-heading">Workers (${this.numberOfJobsFilled()}/${this.maxWorkers})</div>`;

    html += '<ul class="info-citizen-list">';
    for (const worker of this.workers) {
      html += worker.toHTML();
    }
    html += '</ul>';

    return html;
  }
}

// Arrays of words for generating business names
const prefixes = ['Apex', 'Vortex', 'Elevate', 'Zenith', 'Nova', 'Synapse', 'Pulse', 'Enigma', 'Catalyst', 'Axiom'];
const suffixes = ['Dynamics', 'Ventures', 'Solutions', 'Technologies', 'Innovations', 'Industries', 'Enterprises', 'Systems', 'Mechanics', 'Manufacturing'];
const businessSuffixes = ['LLC', 'Inc.', 'Co.', 'Corp.', 'Ltd.'];

// Function to generate a random industrial business name
function generateBusinessName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const businessSuffix = businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)];

  return prefix + ' ' + suffix + ' ' + businessSuffix;
}