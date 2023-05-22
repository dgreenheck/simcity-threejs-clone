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

  scene.setOnObjectSelected((selectedObject) => {
    let { x, y } = selectedObject.userData;
    const tile = city.data[x][y];

    // If bulldoze is active, delete the building
    if (activeToolId === 'select') {
      console.log(`Selected object at ${x},${y}`);
      console.log( JSON.stringify(tile, ' ', 2))
      scene.setSelectedObject(selectedObject);
      document.getElementById('selected-object-info').innerHTML = JSON.stringify(tile, ' ', 2);
    } else if (activeToolId === 'bulldoze') {
      tile.building = undefined;
      scene.update(city);
    // Otherwise, place the building if this tile doesn't have one
    } else if (!tile.building) {
      tile.building = buildingFactory[activeToolId]();
      scene.update(city);
    }
  });

  // Hookup event listeners
  document.addEventListener('keydown', scene.onKeyDown, false);
  document.addEventListener('keyup', scene.onKeyUp, false);
  document.addEventListener('wheel', scene.onMouseScroll, false);
  document.addEventListener('mousedown', scene.onMouseDown, false);
  document.addEventListener('mousemove', scene.onMouseMove, false);
  window.addEventListener('resize', scene.resizeRenderer, false);
  // Prevent context menu from popping up
  document.addEventListener('contextmenu', (event) => event.preventDefault(), false);

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