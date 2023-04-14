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

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedObject = undefined;

  let terrain = [];
  let buildings = [];

  // Event handler for when an object is selected
  let onObjectSelected = undefined;

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
        const building = city.data[x][y].building;
        // Is there a building at this location?
        if (building) {
          // If a mesh exists at this location and it doesn't match the model,
          // remove it and add the new one
          if (buildings[x][y]) {
            if (buildings[x][y].name !== building) {
              scene.remove(buildings[x][y]);
              // Load the mesh for the new building and add it to the scene
              buildings[x][y] = loadMesh(building, x, y);
              scene.add(buildings[x][y]);
            }
          // If there is no mesh at this location, go ahead and add the building
          } else {
            // Load the mesh for the new building and add it to the scene
            buildings[x][y] = loadMesh(building, x, y);
            scene.add(buildings[x][y]);
          }
        } else {
          // If a mesh already exists at this location, remove it
          if (buildings[x][y]) {
            scene.remove(buildings[x][y]);
          }
          buildings[x][y] = undefined;
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

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera.camera);

    var intersects = raycaster.intersectObjects(scene.children, false)

    if (intersects.length > 0) {
      // Un-highlight the previously selected object
      if (selectedObject) selectedObject.material.emissive.setHex(0);
      // Highlight the new selected object
      selectedObject = intersects[0].object;
      selectedObject.material.emissive.setHex(0x555555);

      if (this.onObjectSelected) {
        this.onObjectSelected(selectedObject);
      }
    }
  }

  function onMouseUp(event) {
    camera.onMouseUp(event);
  }

  function onMouseMove(event) {
    camera.onMouseMove(event);
  }

  return {
    /* Properties */
    onObjectSelected,

    /* Methods */
    initialize,
    update,
    start,
    stop,
    onMouseDown,
    onMouseUp,
    onMouseMove
  }
}