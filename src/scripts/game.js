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
   * Currently selected tool
   * @type {string}
   */
  activeToolId = 'select';
  /**
   * True if the game is currently paused
   * @type {boolean}
   */
  isPaused = false;
  /**
   * The current focused object
   * @type {Building | Tile}
   */
  focusedObject = null;
  /**
   * The last time the mouse was moved
   * @type {Date}
   */
  lastMove = new Date();

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

      // Hookup event listeners
      this.sceneManager.gameWindow.addEventListener('wheel', this.sceneManager.cameraManager.onMouseScroll.bind(this.sceneManager.cameraManager), false);
      this.sceneManager.gameWindow.addEventListener('mousedown', this.#onMouseDown.bind(this), false);
      this.sceneManager.gameWindow.addEventListener('mousemove', this.#onMouseMove.bind(this), false);

      // Prevent context menu from popping up
      this.sceneManager.gameWindow.addEventListener('contextmenu', (event) => event.preventDefault(), false);

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
    this.#updateInfoPanel();
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

    this.activeToolId = this.selectedControl.getAttribute('data-type');
    console.log(this.activeToolId);
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

  /**
   * Event handler for `mousedown` event
   * @param {MouseEvent} event 
   */
  #onMouseDown(event) {
    console.log('onMouseDown');
    // Check if left mouse button pressed
    if (event.button === 0) {
      const selectedObject = this.sceneManager.getSelectedObject(event);
      this.#useActiveTool(selectedObject);
    }

    this.sceneManager.cameraManager.onMouseMove(event);
  }

  /**
   * Event handler for 'mousemove' event
   * @param {MouseEvent} event 
   */
  #onMouseMove(event) {
    console.log('onMouseMove');

    // Throttle event handler so it doesn't kill the browser
    if (Date.now() - this.lastMove < (1 / 60.0)) return;
    this.lastMove = Date.now();

    // Get the object the mouse is currently hovering over
    const hoverObject = this.sceneManager.getSelectedObject(event);
    
    this.sceneManager.setHighlightedMesh(hoverObject);
    this.sceneManager.cameraManager.onMouseMove(event);
  }

  #useActiveTool(object) {
    // If no object is selected, clear the info panel
    if (!object) {
      this.#updateInfoPanel(null);
    } else {
      if (this.activeToolId === 'select') {
        this.sceneManager.setActiveObject(object);
        this.focusedObject = object;
        this.#updateInfoPanel();
      } else if (this.activeToolId === 'bulldoze') {
        this.city.bulldoze(object.x, object.y);
      } else if (!this.city.getTile(object.x, object.y).building) {
        const buildingType = this.activeToolId;
        console.log(object.x, object.y);
        this.city.placeBuilding(object.x, object.y, buildingType);
      }
    }
  }

  #updateInfoPanel() {
    if (this.focusedObject) {
      const tile = this.city.getTile(this.focusedObject.x, this.focusedObject.y);
      document.getElementById('info-details').innerHTML = tile.toHTML();
    } else {
      document.getElementById('info-details').innerHTML = '';
    }
  }

  #updateTitleBar() {
    document.getElementById('population-counter').innerHTML = this.city.population;
  }
}