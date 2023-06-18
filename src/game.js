import { createScene } from './scene.js';
import { createCity } from './city.js';
import { createBuilding } from './buildings.js';

// Create a new game when the window is loaded
window.onload = () => {
  window.game = createGame();

  // Start update interval
  setInterval(() => {
    window.game.update();
  }, 1000)
}

/**
 * Creates a new Game object
 * @returns a Game object
 */
export function createGame() {
  let selectedControl = document.getElementById('button-select');
  let activeToolId = 'select';
  let isPaused = false;  
  // Last time mouse was moved
  let lastMove = new Date();

  const scene = createScene();
  const city = createCity(12);

  scene.initialize(city);

  // Hookup event listeners
  document.addEventListener('wheel', scene.cameraManager.onMouseScroll, false);
  document.addEventListener('mousedown', onMouseDown, false);
  document.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('resize', scene.onResize, false);

  // Prevent context menu from popping up
  document.addEventListener('contextmenu', (event) => event.preventDefault(), false);

  /**
   * Event handler for `mousedown` event
   * @param {MouseEvent} event 
   */
  function onMouseDown(event) {
    // Check if left mouse button pressed
    if (event.button === 0) {
      const selectedObject = scene.getSelectedObject(event);
      useActiveTool(selectedObject);
    }
  };

  /**
   * Event handler for 'mousemove' event
   * @param {MouseEvent} event 
   */
  function onMouseMove(event) {
    // Throttle event handler so it doesn't kill the browser
    if (Date.now() - lastMove < (1 / 60.0)) return;
    lastMove = Date.now();

    // Get the object the mouse is currently hovering over
    const hoverObject = scene.getSelectedObject(event);

    scene.setHighlightedObject(hoverObject);

    // If left mouse-button is down, use the tool as well
    if (hoverObject && event.buttons & 1) {
      useActiveTool(hoverObject);
    }

    scene.cameraManager.onMouseMove(event);
  }

  function useActiveTool(object) {
    if (!object) {
      updateInfoOverlay(null);
      return;
    }

    const { x, y } = object.userData;
    const tile = city.tiles[x][y];

    // If bulldoze is active, delete the building
    if (activeToolId === 'select') {
      scene.setActiveObject(object);
      updateInfoOverlay(tile);
    } else if (activeToolId === 'bulldoze') {
      tile.removeBuilding();
      scene.update(city);
      // Otherwise, place the building if this tile doesn't have one
    } else if (!tile.building) {
      const buildingType = activeToolId;
      tile.placeBuilding(buildingType);
      scene.update(city);
    }
  }

  function updateInfoOverlay(tile) {
    document.getElementById('info-overlay-details').innerHTML = tile ? tile.toHTML() : '';
  }

  function updateTitleBar() {
    document.getElementById('population-counter').innerHTML = city.getPopulation();
  }

  // Start the renderer
  scene.start();

  return {
    /* METHODS */

    /**
     * Main update method for the game
     */
    update() {
      if (isPaused) return;
      // Update the city data model first, then update the scene
      city.update();
      scene.update(city);

      updateTitleBar();
    },

    /**
     * 
     * @param {*} event 
     */
    onToolSelected(event) {
      // Deselect previously selected button and selected this one
      if (selectedControl) {
        selectedControl.classList.remove('selected');
      }
      selectedControl = event.target;
      selectedControl.classList.add('selected');

      activeToolId = selectedControl.getAttribute('data-type');
      console.log(activeToolId);
    },
    
    /**
     * Toggles the pause state of the game
     */
    togglePause() {
      isPaused = !isPaused;
      console.log(`Is Paused: ${isPaused}`);
      if (isPaused) {
        document.getElementById('pause-button-icon').src = 'public/icons/play.png';
      } else {
        document.getElementById('pause-button-icon').src = 'public/icons/pause.png';
      }
    }
  };
}