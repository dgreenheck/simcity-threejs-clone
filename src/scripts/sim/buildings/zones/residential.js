import { Citizen } from '../../citizen.js';
import { City } from '../../city.js';
import config from '../../../config.js';
import { Zone } from './zone.js';
import { ResidentsAttribute } from '../attributes/residents.js';
import { BuildingType } from '../buildingFactory.js';

export class ResidentialZone extends Zone {
  constructor(x, y) {
    super(x, y);
    this.name = generateBuildingName();
    this.type = BuildingType.residential;
    
    /**
     * @type {ResidentsAttribute}
     */
    this.residents = new ResidentsAttribute(this);
  }

  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city 
   */
  simulate(city) {
    super.simulate(city);
    this.residents.simulate(city);
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    this.residents.dispose();
    super.dispose();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += this.residents.toHTML();
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