import { City } from '../../sim/city.js';
import { Zone } from './zone.js';
import { JobsAttribute } from '../attributes/jobs.js';

export class CommercialZone extends Zone {
  constructor(x, y) {
    super(x, y);

    this.name = generateBusinessName();
    this.type = 'commercial';

    // Citizens that work here
    /**
     * @type {JobsAttribute}
     */
    this.jobs = new JobsAttribute(this);
  }

  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city 
   */
  simulate(city) {
    super.simulate(city);
    this.jobs.update();
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