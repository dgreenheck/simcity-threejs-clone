import { createScene } from './scene.js';
import { createCity } from './city.js';

/**
 * Creates a new Game object
 * @returns a Game object
 */
export function createGame() {
  const scene = createScene();
  const city = createCity(16);

  scene.initialize(city);

  scene.onObjectSelected = (selectedObject) => {
    console.log(selectedObject);

    let { x, y } = selectedObject.userData;
    const tile = city.data[x][y];
    console.log(tile);
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
    }
  }

  // Start update interval
  setInterval(() => {
    game.update();
  }, 1000)

  scene.start();

  return game;
}