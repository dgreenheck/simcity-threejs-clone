import config from '../../../config.js';
import { City } from '../../city.js';
import { Zone } from '../../buildings/zones/zone.js';
import { SimModule } from './simModule.js';

export const DevelopmentState = {
  abandoned: 'abandoned',
  developed: 'developed',
  underConstruction: 'under-construction',
  undeveloped: 'undeveloped',
};

export class DevelopmentModule extends SimModule {
  #zone;

  /**
   * The zone's current state of development
   */
  #state = DevelopmentState.undeveloped;

  /**
   * Level of development
   */
  #level = 1;

  /**
   * Maximum level of development
   */
  maxLevel = 3;

  /**
   * Number of simulation steps that building has met abandonment criteria
   * If abandonment criteria are not met, value is zero
   */
  #abandonmentCounter = 0;

  /**
   * Counter for days under construction
   */
  #constructionCounter = 0;

  /**
   * 
   * @param {Zone} zone 
   */
  constructor(zone) {
    super();
    this.#zone = zone;
  }

  get level() {
    return this.#level;
  }

  set level(value) {
    this.#level = value;
    this.#zone.isMeshOutOfDate = true;
  }
  get state() {
    return this.#state;
  }

  set state(value) {
    this.#state = value;
  }

  /**
   * @param {City} city 
   */
  simulate(city) {
    this.#checkAbandonmentCriteria();

    switch (this.state) {
      case DevelopmentState.undeveloped:
        if (this.#checkDevelopmentCriteria() &&
          Math.random() < config.modules.development.redevelopChance) {
          this.state = DevelopmentState.underConstruction;
          this.#zone.updateMesh(city);
          this.#constructionCounter = 0;
        }
        break;
      case DevelopmentState.underConstruction:
        if (++this.#constructionCounter === config.modules.development.constructionTime) {
          this.state = DevelopmentState.developed;
          this.#zone.updateMesh(city);
          this.level = 1;
          this.#constructionCounter = 0;
        }
        break;
      case DevelopmentState.developed:
        if (this.#abandonmentCounter > config.modules.development.abandonThreshold) {
          if (Math.random() < config.modules.development.abandonChance) {
            this.state = DevelopmentState.abandoned;
            this.#zone.updateMesh(city);
          }
        } else {
          if (this.level < this.maxLevel && Math.random() < config.modules.development.levelUpChance) {
            this.level++;
            this.#zone.updateMesh(city);
          }
        }
        break;
      case DevelopmentState.abandoned:
        if (this.#abandonmentCounter == 0) {
          if (Math.random() < config.modules.development.redevelopChance) {
            this.state = DevelopmentState.developed;
            this.#zone.updateMesh(city);
          }
        }
        break;
    }
  }

  /**
   * @param {City} city 
   * @returns 
   */
  #checkDevelopmentCriteria() {
    if (this.#zone.hasRoadAccess) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @param {City} city 
   * @returns 
   */
  #checkAbandonmentCriteria() {
    if (!this.#zone.hasRoadAccess) {
      this.#abandonmentCounter++;
    } else {
      this.#abandonmentCounter = 0;
    }
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
    toHTML() {
      return `
        <span class="info-label">State </span>
        <span class="info-value">${this.state}</span>
        <br>
        <span class="info-label">Level </span>
        <span class="info-value">${this.level}</span>
        <br>`;
    }
}