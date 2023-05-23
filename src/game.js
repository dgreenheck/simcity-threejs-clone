import { createScene } from './scene.js';
import { createCity } from './city.js';
import buildingFactory from './buildings.js';

/**
 * Creates a new Game object
 * @returns a Game object
 */
export function createGame() {
  let activeToolId = 'select';

  const scene = createScene();
  const city = createCity(12);

  scene.initialize(city);

  // Hookup event listeners
  document.addEventListener('keydown', scene.cameraManager.onKeyDown, false);
  document.addEventListener('keyup', scene.cameraManager.onKeyUp, false);
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
    const selectedObject = scene.getSelectedObject(event);
    useActiveTool(selectedObject);
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

    scene.setHighlightedObject();

    // If left mouse-button is down, use the tool as well
    if (hoverObject && event.buttons & 1) {
      useActiveTool(hoverObject);
    }
  }

  function useActiveTool(object) {
    if (!object) {
      updateInfoPanel(null);
      return;
    }

    const { x, y } = object.userData;
    const tile = city.data[x][y];

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
    console.log(activeToolId);
    if (tile) {
      document.getElementById('selected-object-info').innerHTML = JSON.stringify(tile, ' ', 2);
    } else {
      document.getElementById('selected-object-info').innerHTML = '';
    }
    console.log(tile);
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

  const game = {
    update() {
      // Update the city data model first, then update the scene
      city.update();
      scene.update(city);
    },
    setActiveToolId(toolId) {
      activeToolId = toolId;
      console.log(activeToolId);
    }
  }

  // Start update interval
  setInterval(() => {
    game.update();
  }, 1000)

  scene.start();

  return game;
}