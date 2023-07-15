import { Citizen } from '../citizens.js';
import { City } from '../city.js';
import config from '../config.js';
import { Zone } from './zone.js';

export class ResidentialZone extends Zone {
  constructor(x, y) {
    super(x, y);
    this.name = generateBuildingName();
    this.type = 'residential';
    
    /**
     * Residents that live in this building
     * @type {Citizen[]}
     */
    this.residents = [];

    this.maxLevel = 3;
  }

  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city 
   */
  step(city) {
    super.step(city);

    // If building is abandoned, all residents are evicted and
    // no more residents are allowed to move in.
    if (this.abandoned) {
      this.#evictResidents();
      return;
    }
    
    if (this.developed) {
      // Move in new residents if there is room
      if (this.residents.length < this.getMaxResidents() &&
          Math.random() < config.zone.residentMoveInChance) {
        const resident = new Citizen(this);
        this.residents.push(resident);
      // If building is full, then small chance to upgrade
      } else {
        if (Math.random() < 0.03 && this.level < this.maxLevel) {
          this.level++;
        }
      }
    }
  }

  /**
   * Maximuim number of residents that can live in this building
   * @returns {number}
   */
  getMaxResidents() {
    return Math.pow(config.zone.maxResidents, this.level);
  }

  /**
   * Evicts all residents from the building
   */
  #evictResidents() {
    for (const resident of this.residents) {
      resident.dispose();
    }
    this.residents = [];
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    this.#evictResidents();
    super.dispose();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += `
      <div class="info-heading">Residents (${this.residents.length}/${this.getMaxResidents()})</div>`;

    html += '<ul class="info-citizen-list">';
    for (const resident of this.residents) {
      html += resident.toHTML();
    }
    html += '</ul>';

    return html;
  }
}

// Arrays of different name components
const prefixes = ['Emerald', 'Ivory', 'Crimson', 'Opulent', 'Celestial', 'Enchanted', 'Serene', 'Whispering', 'Stellar', 'Tranquil'];
const suffixes = ['Tower', 'Residence', 'Manor', 'Court', 'Plaza', 'House', 'Mansion', 'Place', 'Villa', 'Gardens'];

// Function to generate a random building name
function generateBuildingName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return prefix + ' ' + suffix;
}