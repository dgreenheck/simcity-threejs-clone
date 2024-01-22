import config from '../../../config.js';
import { Citizen } from '../../citizen.js';
import { City } from '../../city.js';
import { Zone } from '../../buildings/zones/zone.js';
import { DevelopmentState } from './development.js';
import { SimModule } from './simModule.js';

export class JobsModule extends SimModule {
  /**
   * @type {Zone}
   */
  #zone;

  /**
   * @type {Citizen[]}
   */
  workers = [];

  constructor(zone) {
    super();
    this.#zone = zone;
  }

  /**
   * Maximuim number of workers that can work at this building
   * @returns {number}
   */
  get maxWorkers() {
    // If building is not developed, there are no available jobs
    if (this.#zone.development.state !== DevelopmentState.developed) {
      return 0;
    } else {
      return Math.pow(config.modules.jobs.maxWorkers, this.#zone.development.level);
    }
  }

  /**
   * Returns the number of job openings
   * @returns {number}
   */
  get availableJobs() {
    return this.maxWorkers - this.workers.length;
  }

  /**
   * Returns the number of positions that are filled
   * @returns {number}
   */
  get filledJobs() {
    return this.workers.length;
  }

  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city 
   */
  simulate(city) {
    // If building is abandoned, all workers are laid off and no
    // more workers are allowed to work here
    if (this.#zone.development.state === DevelopmentState.abandoned) {
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
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = `<div class="info-heading">Workers (${this.filledJobs}/${this.maxWorkers})</div>`;

    html += '<ul class="info-citizen-list">';
    for (const worker of this.workers) {
      html += worker.toHTML();
    }
    html += '</ul>';

    return html;
  }
}