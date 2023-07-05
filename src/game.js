import { SceneManager } from './sceneManager.js';
import { City } from './city.js';
import { Building } from './buildings/building.js';
import { Tile } from './tile.js';

export class Game {
  selectedControl = document.getElementById('button-select');
  activeToolId = 'select';
  isPaused = false;

  /**
   * The current focused object
   * @type {Building | Tile}
   */
  focusedObject = null;
  // Last time mouse was moved
  lastMove = new Date();

  constructor() {
    /**
     * The city data model
     * @type {City}
     */
    this.city = new City(12);

    /**
     * The 3D game scene
     */
    this.sceneManager = new SceneManager(this.city);
    this.sceneManager.start();

    // Hookup event listeners
    document.addEventListener('wheel', this.sceneManager.cameraManager.onMouseScroll.bind(this), false);
    document.addEventListener('mousedown', this.#onMouseDown.bind(this), false);
    document.addEventListener('mousemove', this.#onMouseMove.bind(this), false);

    // Prevent context menu from popping up
    document.addEventListener('contextmenu', (event) => event.preventDefault(), false);

    // Start update interval
    setInterval(this.step.bind(this), 1000);
  }

  /**
   * Main update method for the game
   */
  step() {
    if (this.isPaused) return;
    // Update the city data model first, then update the scene
    this.city.step();
    this.sceneManager.applyChanges(this.city);

    this.#updateTitleBar();
    this.#updateInfoOverlay();
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
      document.getElementById('pause-button-icon').src = 'public/icons/play.png';
    } else {
      document.getElementById('pause-button-icon').src = 'public/icons/pause.png';
    }
  }

  /**
   * Event handler for `mousedown` event
   * @param {MouseEvent} event 
   */
  #onMouseDown(event) {
    // Check if left mouse button pressed
    if (event.button === 0) {
      const selectedObject = this.sceneManager.getSelectedObject(event);
      this.#useActiveTool(selectedObject);
    }
  }

  /**
   * Event handler for 'mousemove' event
   * @param {MouseEvent} event 
   */
  #onMouseMove(event) {
    // Throttle event handler so it doesn't kill the browser
    if (Date.now() - this.lastMove < (1 / 60.0)) return;
    this.lastMove = Date.now();

    // Get the object the mouse is currently hovering over
    const hoverObject = this.sceneManager.getSelectedObject(event);

    this.sceneManager.setHighlightedMesh(hoverObject);

    // If left mouse-button is down, use the tool as well
    if (hoverObject && event.buttons & 1) {
      this.#useActiveTool(hoverObject);
    }

    this.sceneManager.cameraManager.onMouseMove(event);
  }

  #useActiveTool(object) {
    // If no object is selected, clear the info panel
    if (!object) {
      this.#updateInfoOverlay(null);
      return;
    } else {
      const tile = object.userData;
      if (this.activeToolId === 'select') {
        this.sceneManager.setActiveObject(object);
        this.focusedObject = tile;
        this.#updateInfoOverlay();
      } else if (this.activeToolId === 'bulldoze') {
        if (tile.building) {
          tile.removeBuilding();
          this.city.refresh();
          this.sceneManager.applyChanges(this.city);
        }
      } else if (!tile.building) {
        const buildingType = this.activeToolId;
        tile.placeBuilding(buildingType);
        this.city.refresh();
        this.sceneManager.applyChanges(this.city);
      }
    }
  }

  #updateInfoOverlay() {
    document.getElementById('info-overlay-details').innerHTML = this.focusedObject?.toHTML() ?? '';
  }

  #updateTitleBar() {
    document.getElementById('population-counter').innerHTML = this.city.getPopulation();
  }
}