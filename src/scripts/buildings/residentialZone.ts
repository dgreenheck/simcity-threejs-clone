import { CityType } from "../../types/City";
import { Citizen } from "../citizens";
import config from "../config";
import { Zone } from "./zone";

export class ResidentialZone extends Zone {
  abandoned = false;
  developed = false;
  maxLevel: number;

  constructor(x: number, y: number) {
    super(x, y);
    this.name = generateBuildingName();
    this.type = "residential";

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
  step(city: CityType) {
    super.step(city);

    // If building is abandoned, all residents are evicted and
    // no more residents are allowed to move in.
    if (this.abandoned) {
      this.#evictResidents();
      return;
    }

    if (this.developed) {
      // Move in new residents if there is room
      if (
        this.residents.length < this.getMaxResidents() &&
        Math.random() < config.zone.residentMoveInChance
      ) {
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
      <div class="info-heading">Residents (${
        this.residents.length
      }/${this.getMaxResidents()})</div>`;

    html += '<ul class="info-citizen-list">';
    for (const resident of this.residents) {
      html += resident.toHTML();
    }
    html += "</ul>";

    return html;
  }
}

// Arrays of different name components
const prefixes = [
  "Emerald",
  "Ivory",
  "Crimson",
  "Opulent",
  "Celestial",
  "Enchanted",
  "Serene",
  "Whispering",
  "Stellar",
  "Tranquil",
];
const suffixes = [
  "Tower",
  "Residence",
  "Manor",
  "Court",
  "Plaza",
  "House",
  "Mansion",
  "Place",
  "Villa",
  "Gardens",
];

// Function to generate a random building name
function generateBuildingName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return prefix + " " + suffix;
}
