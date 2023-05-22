import * as THREE from 'three';
import { createCameraManager } from './cameraManager.js';
import { createAssetInstance } from './assets.js';

export function createScene() {
  // Initial scene setup
  const gameWindow = document.getElementById('render-target');
  const scene = new THREE.Scene();

  const cameraManager = createCameraManager(gameWindow);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  renderer.setClearColor(0x000000, 0);
  gameWindow.appendChild(renderer.domElement);
  
  // Variables for object selection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const LEFT_MOUSE_BUTTON = 1;
  const lastMove = new Date();
  let onObjectSelected = undefined;

  // Last object the user has clicked on
  let selectedObject = undefined;
  // Object the mouse is currently hovering over
  let hoverObject = undefined;

  // 2D array of building meshes at each tile location
  let buildings = [];

  function initialize(city) {
    scene.clear();
    buildings = [];

    for (let x = 0; x < city.size; x++) {
      const column = [];
      for (let y = 0; y < city.size; y++) {
        const mesh = createAssetInstance(city.data[x][y].terrainId, x, y);
        scene.add(mesh);
        column.push(mesh);
      }
      buildings.push([...Array(city.size)]);
    }

    setupLights();
  }

  function update(city) {
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.data[x][y];
        const existingBuildingMesh = buildings[x][y];

        // If the player removes a building, remove it from the scene
        if (!tile.building && existingBuildingMesh) {
          scene.remove(existingBuildingMesh);
          buildings[x][y] = undefined;
        }

        // If the data model has changed, update the mesh
        if (tile.building && tile.building.updated) {
          scene.remove(existingBuildingMesh);
          buildings[x][y] = createAssetInstance(tile.building.id, x, y, tile.building);
          scene.add(buildings[x][y]);
          tile.building.updated = false;
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

  /**
   * Render the contents of the scene
   */
  function draw() {
    cameraManager.updateCameraPosition();
    renderer.render(scene, cameraManager.camera);
  }

  /**
   * Starts the renderer
   */
  function start() {
    renderer.setAnimationLoop(draw);
  }

  /**
   * Stops the renderer
   */
  function stop() {
    renderer.setAnimationLoop(null);
  }

  /**
   * Event handler for 'keydown' event
   * @param {KeyboardEvent} event 
   */
  function onKeyDown(event) {
    cameraManager.onKeyDown(event);
  }

  /**
   * Event handler for 'keyup' event
   * @param {KeyboardEvent} event 
   */
  function onKeyUp(event) {
    cameraManager.onKeyUp(event);
  }

  /**
   * Event handler for 'wheel' event
   * @param {MouseEvent} event 
   */
  function onMouseScroll(event) {
    cameraManager.onMouseScroll(event);
  }

  /**
   * Event handler for `mousedown` event
   * @param {MouseEvent} event 
   */
  function onMouseDown(event) {
    const object = getObjectUnderMouse(event);
    if (object && onObjectSelected) {
      onObjectSelected(object);
    }
  }

  /**
   * Event handler for 'onMouseMove' event
   * @param {MouseEvent} event 
   */
  function onMouseMove(event) {
    // Throttle raycasting so it doesn't kill the browser
    if (Date.now() - lastMove < (1 / 60.0)) return;

    // Unhighlight the previously hovered object (if it isn't currently selected)
    if (hoverObject && hoverObject !== selectedObject) {
      hoverObject.material.emissive.setHex(0);
    }

    // Get object mouse is currently hovering over
    hoverObject = getObjectUnderMouse(event);
    
    if (hoverObject) {
      // Highlight the new hovered object (if it isn't currently selected))
      if (hoverObject !== selectedObject) {
        hoverObject.material.emissive.setHex(0x555555);
      }

      // If left mouse-button is down, also update the selected object
      if (event.buttons & LEFT_MOUSE_BUTTON) {
        onObjectSelected(hoverObject);
      }
    }
  }

  /**
   * Gets the object currently under the mouse cursor. If there is nothing under
   * the mouse cursor, returns null
   * @param {MouseEvent} event Mouse event
   */
  function getObjectUnderMouse(event) {
    // Compute normalized mouse coordinates
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraManager.camera);

    let intersections = raycaster.intersectObjects(scene.children, false);

    if (intersections.length > 0) {
      return intersections[0].object;
    } else {
      return null;
    }
  }

  /**
   * Resizes the renderer to fit the current game window
   */
  function resizeRenderer() {
    cameraManager.camera.aspect = gameWindow.offsetWidth / gameWindow.offsetHeight;
    cameraManager.camera.updateProjectionMatrix();
    renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  }

  /**
   * Sets the currently selected object and highlights it
   * @param {object} object 
   */
  function setSelectedObject(object) {
    // Clear highlight on currently selected object
    if (selectedObject) {
      selectedObject.material.emissive.setHex(0x000000)
    }

    selectedObject = object;

    // Highlight the newly selected object
    selectedObject.material.emissive.setHex(0xaaaa55)
  }

  function setOnObjectSelected(eventHandler) {
    onObjectSelected = eventHandler;
  }

  return {
    initialize,
    update,
    start,
    stop,
    onKeyDown,
    onKeyUp,
    onMouseScroll,
    onMouseDown,
    onMouseMove,
    resizeRenderer,
    setSelectedObject,
    setOnObjectSelected
  }
}