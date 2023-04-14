import * as THREE from 'three';
import { createCamera } from './camera.js';
import { loadMesh } from './resources.js';

export function createScene() {
  // Initial scene setup
  const gameWindow = document.getElementById('render-target');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x777777);

  const camera = createCamera(gameWindow);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  gameWindow.appendChild(renderer.domElement);
  
  let terrain = [];
  let buildings = [];

  function initialize(city) {
    scene.clear();
    terrain = [];
    buildings = [];
    for (let x = 0; x < city.size; x++) {
      const column = [];
      for (let y = 0; y < city.size; y++) {
        const terrain = city.data[x][y].terrain;
        const mesh = loadMesh(terrain, x, y);
        scene.add(mesh);
        column.push(mesh);
      }
      terrain.push(column);
      buildings.push([...Array(city.size)]);
    }

    setupLights();
  }

  function update(city) {
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const newBuilding = city.data[x][y].building;
        const oldBuilding = buildings[x][y]?.name;

        // If building was removed or changed, remove the old one from the scene
        if ((!newBuilding && oldBuilding) || (newBuilding !== oldBuilding)) {
          scene.remove(buildings[x][y]);
          buildings[x][y] = undefined;
        }

        // Do we need to add a new building?
        if (newBuilding) {
          // Load the mesh for the new building and add it to the scene
          buildings[x][y] = loadMesh(newBuilding, x, y);
          scene.add(buildings[x][y]);
        }
      }
    }
  }

  function setupLights() {
    const lights = [
      new THREE.AmbientLight(0xffffff, 0.2),
      new THREE.DirectionalLight(0xffffff, 0.3),
      new THREE.DirectionalLight(0xffffff, 0.3),
      new THREE.DirectionalLight(0xffffff, 0.3)
    ];

    lights[1].position.set(0, 1, 0);
    lights[2].position.set(1, 1, 0);
    lights[3].position.set(0, 1, 1);

    scene.add(...lights);
  }

  function draw() {
    renderer.render(scene, camera.camera);
  }

  function start() {
    renderer.setAnimationLoop(draw);
  }

  function stop() {
    renderer.setAnimationLoop(null);
  }

  function onMouseDown(event) {
    camera.onMouseDown(event);
  }

  function onMouseUp(event) {
    camera.onMouseUp(event);
  }

  function onMouseMove(event) {
    camera.onMouseMove(event);
  }

  return {
    initialize,
    update,
    start,
    stop,
    onMouseDown,
    onMouseUp,
    onMouseMove
  }
}