import { City } from '../city.js';
import { Zone } from './zone.js';
import config from '../config.js';

export class CommercialZone extends Zone {
  constructor(x, y) {
    super(x, y);
    
    this.name = generateBusinessName();
    this.type = 'commercial';
    
    // Citizens that work here
    this.workers = [];
    // The maximum level this building can be upgraded to
    this.maxLevel = 3;
  }

  /**
   * Maximuim number of workers that can work at this building
   * @returns {number}
   */
  getMaxWorkers() {
    return Math.pow(config.zone.maxWorkers, this.level);
  }

  /**
   * Returns the number of job openings
   * @returns {number}
   */
  numberOfJobsAvailable() {
    // If building is abandoned or undeveloped, there are no available jobs
    if (this.abandoned || !this.developed) return 0;
    // Otherwise return the number of vacant positions
    return this.getMaxWorkers() - this.workers.length;
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
      return;
    }

    // If building is developed, have a random chance of developing
    if (this.developed) {
      if (Math.random() < 0.03 && this.level < this.maxLevel) {
        this.level++;
      }
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
    <div class="info-heading">Workers (${this.numberOfJobsFilled()}/${this.getMaxWorkers()})</div>`;

    html += '<ul class="info-citizen-list">';
    for (const worker of this.workers) {
      html += worker.toHTML();
    }
    html += '</ul>';

    return html;
  }
}

// Arrays of words for generating business names
const prefixes = ['Prime', 'Elite', 'Global', 'Exquisite', 'Vibrant', 'Luxury', 'Innovative', 'Sleek', 'Premium', 'Dynamic'];
const suffixes = ['Commerce', 'Trade', 'Marketplace', 'Ventures', 'Enterprises', 'Retail', 'Group', 'Emporium', 'Boutique', 'Mall'];
const businessSuffixes = ['LLC', 'Inc.', 'Co.', 'Corp.', 'Ltd.'];

// Function to generate a random commercial business name
function generateBusinessName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const businessSuffix = businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)];

  return prefix + ' ' + suffix + ' ' + businessSuffix;
}