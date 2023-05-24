import { createScene } from './scene.js';
import { createCity } from './city.js';
import buildingFactory from './buildings.js';

// Create a new game when the window is loaded
window.onload = () => {
  window.game = createGame();
}

/**
 * Creates a new Game object
 * @returns a Game object
 */
export function createGame() {
  let selectedControl = document.getElementById('button-select');
  let activeToolId = 'select';
  let isPaused = false;

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
   * Main update method for the game
   */
  function update() {
    if (isPaused) return;
    // Update the city data model first, then update the scene
    city.update();
    scene.update(city);
  }

  function togglePause() {
    isPaused = !isPaused;
    document.getElementById('button-pause').innerHTML = isPaused ? 'RESUME' : 'PAUSE';
  }

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

  // Last time mouse was moved
  const lastMove = new Date();

  /**
   * Event handler for 'mousemove' event
   * @param {MouseEvent} event 
   */
  function onMouseMove(event) {
    // Throttle event handler so it doesn't kill the browser
    if (Date.now() - lastMove < (1 / 60.0)) return;

    // Get the object the mouse is currently hovering over
    const hoverObject = scene.getSelectedObject(event);

    scene.setHighlightedObject(hoverObject);

    // If left mouse-button is down, use the tool as well
    if (hoverObject && event.buttons & 1) {
      useActiveTool(hoverObject);
    }

    scene.cameraManager.onMouseMove(event);
  }

  /**
   * 
   * @param {*} event 
   */
  function onToolSelected(event) {
    // Deselect previously selected button and selected this one
    if (selectedControl) {
      selectedControl.classList.remove('selected');
    }
    selectedControl = event.target;
    selectedControl.classList.add('selected');

    activeToolId = selectedControl.getAttribute('data-type');
    console.log(activeToolId);
  }

  function useActiveTool(object) {
    if (!object) {
      updateInfoPanel(null);
      return;
    }

    const { x, y } = object.userData;
    const tile = city.tiles[x][y];

    // If bulldoze is active, delete the building
    if (activeToolId === 'select') {
      scene.setActiveObject(object);
      updateInfoPanel(tile);
    } else if (activeToolId === 'bulldoze') {
      bulldoze(tile);
      // Otherwise, place the building if this tile doesn't have one
    } else if (!tile.building) {
      placeBuilding(tile);
    }
  }

  function updateInfoPanel(tile) {
    document.getElementById('selected-object-info').innerHTML = tile ? JSON.stringify(tile, ' ', 2) : '';
  }

  function bulldoze(tile) {
    console.log(activeToolId);
    tile.building = undefined;
    scene.update(city);
    console.log(tile);
  }

  function placeBuilding(tile) {
    console.log(activeToolId);
    tile.building = buildingFactory[activeToolId]();
    scene.update(city);
    console.log(tile);
  }

  // Start update interval
  setInterval(() => {
    game.update();
  }, 1000)

  // Start the renderer
  scene.start();

  return {
    update,
    onToolSelected,
    togglePause
  };
}