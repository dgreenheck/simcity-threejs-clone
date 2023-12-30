import { City } from './sim/city.js';
import { AssetManager } from './assets/assetManager.js';
import { SceneManager } from './scene/sceneManager.js';

export class Game {
  /**
   * @type {City}
   */
  city;
  /**
   * @type {SceneManager}
   */
  sceneManager;
  /**
   * @type {HTMLElement | null }
   */
  selectedControl = document.getElementById('button-select');

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

    window.ui.updateTitleBar(this);
    window.ui.updateInfoPanel(this.sceneManager.selectedObject);
  }
}

// Create a new game when the window is loaded
window.onload = () => {
  window.game = new Game();
}