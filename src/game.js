import { createScene } from './scene.js';
import { createCity } from './city.js';

export function createGame() {
  const scene = createScene();
  const city = createCity(16);

  scene.initialize(city);

  // Hook up event handler for when user selects an object
  scene.onObjectSelected = (selectedObject) => {
    let { x, y } = selectedObject.userData;
    const tile = city.data[x][y];
  }

  // Hook up mouse event handlers
  document.addEventListener('mousedown', scene.onMouseDown.bind(scene), false);
  document.addEventListener('mouseup', scene.onMouseUp.bind(scene), false);
  document.addEventListener('mousemove', scene.onMouseMove.bind(scene), false);
  document.addEventListener('contextmenu', (event) => event.preventDefault(), false);

  const game = {
    /**
     * Updates the data model and updates the scene to reflect
     * any changes in the data model
     */
    update() {
      city.update();
      scene.update(city);
    }
  }

  // Update loop for the game
  setInterval(() => {
    game.update();
  }, 1000)

  scene.start();

  return game;
}