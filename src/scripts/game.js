import { City } from './sim/city.js';
import { Building } from './sim/buildings/building.js';
import { Tile } from './sim/tiles/tile.js';
import { SceneManager } from './scene/sceneManager.js';
import { AssetManager } from './assets/assetManager.js';

export class Game {
  /**
   * @type {City}
   */
  city;

  /**
   * @type {HTMLElement | null }
   */
  selectedControl = document.getElementById('button-select');
  /**
   * True if the game is currently paused
   * @type {boolean}
   */
  isPaused = false;
    /**
   * The currently selected object
   * @type {Building | Tile}
   */
  selectedObject = null;

  constructor() {
    /**
     * Global instance of the asset manager
     */
    window.assetManager = new AssetManager(() => {
      console.log('assets loaded');
      document.getElementById('loading').remove();

      this.city = new City(16);

      this.sceneManager = new SceneManager(this.city);
      this.sceneManager.initialize(this.city);
      this.sceneManager.start();

      setInterval(this.simulate.bind(this), 1000);
    });
  }

  /**
   * Main update method for the game
   */
  simulate() {
    if (this.isPaused) return;

    // Update the city data model first, then update the scene
    this.city.simulate(1);

    this.#updateTitleBar();
    this.sceneManager.updateInfoPanel(this.sceneManager.selectedObject);
  }

  /**
   * 
   * @param {*} event 
   */
  onToolSelected(event) {
    // Deselect previously selected button and selected this one
    if (this.selectedControl) {
      this.selectedControl.classList.remove('selected');
    }
    this.selectedControl = event.target;
    this.selectedControl.classList.add('selected');
    this.sceneManager.activeToolId = this.selectedControl.getAttribute('data-type');
  }

  /**
   * Toggles the pause state of the game
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    console.log(`Is Paused: ${this.isPaused}`);
    if (this.isPaused) {
      document.getElementById('pause-button-icon').src = '/icons/play.png';
    } else {
      document.getElementById('pause-button-icon').src = '/icons/pause.png';
    }
  }

  #updateTitleBar() {
    document.getElementById('population-counter').innerHTML = this.city.population;
  }
}