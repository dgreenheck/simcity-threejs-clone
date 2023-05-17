import { createScene } from './scene.js';
import { createCity } from './city.js';
import buildingFactory from './buildings.js';

/**
 * Creates a new Game object
 * @returns a Game object
 */
export function createGame() {
  let activeToolId = '';

  const scene = createScene();
  const city = createCity(16);

  scene.initialize(city);

  scene.onObjectSelected = (selectedObject) => {
    let { x, y } = selectedObject.userData;
    const tile = city.data[x][y];

    // If bulldoze is active, delete the building
    if (activeToolId === 'bulldoze') {
      tile.building = undefined;
      scene.update(city);
    // Otherwise, place the building if this tile doesn't have one
    } else if (!tile.building) {
      tile.building = buildingFactory[activeToolId]();
      scene.update(city);
    }
  }

  // Hook up mouse event handlers to the scene
  document.addEventListener('mousedown', scene.onMouseDown.bind(scene), false);
  document.addEventListener('mousemove', scene.onMouseMove.bind(scene), false);
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