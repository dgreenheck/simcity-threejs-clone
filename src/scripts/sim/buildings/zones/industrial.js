import { City } from '../../city.js';
import { JobsModule } from '../modules/jobs.js';
import { BuildingType } from '../buildingType.js';
import { Zone } from './zone.js';

export class IndustrialZone extends Zone {
  /**
   * @type {JobsModule}
   */
  jobs = new JobsModule(this);

  constructor(x, y) {
    super(x, y);
    this.name = generateBusinessName();
    this.type = BuildingType.industrial;
  }

  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city 
   */
  simulate(city) {
    super.simulate(city);
    this.jobs.simulate();
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    this.jobs.dispose();
    super.dispose();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += this.jobs.toHTML();
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