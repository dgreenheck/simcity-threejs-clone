import * as THREE from 'three';
import { createCamera } from './camera.js';
import { createAssetInstance } from './assets.js';

export function createScene() {
  // Initial scene setup
  const gameWindow = document.getElementById('render-target');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x777777);

  // Renderer setsup
  const renderer = new THREE.WebGLRenderer();
  const camera = createCamera(gameWindow);
  renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  gameWindow.appendChild(renderer.domElement);
  
  // --- Variables for raycasting ---
  const raycaster = new THREE.Raycaster();
  // Normalized mouse coordinates (-1 to 1)
  const mouse = new THREE.Vector2();
  // Currently selected object in the scene
  let selectedObject = undefined;

  // 2D array of terrain objects in the scene
  let terrain = [[THREE.Mesh]];
  // 2D array of building objects in the scene
  let buildings = [[THREE.Mesh]];

  // Event handler for when an object is selected.
  // This is set in the Game object
  let onObjectSelected = undefined;

  /**
   * Initializes the scene with the city data model
   * @param {object} city 
   */
  function initialize(city) {
    scene.clear();
    terrain = [];
    buildings = [];

    // Load terrain for each tile, initialize buildings array
    for (let x = 0; x < city.size; x++) {
      const column = [];
      for (let y = 0; y < city.size; y++) {
        const terrainId = city.data[x][y].terrainId;
        const mesh = createAssetInstance(terrainId, x, y);
        scene.add(mesh);
        column.push(mesh);
      }
      terrain.push(column);
      buildings.push([...Array(city.size)]);
    }

    setupLights();
  }

  /**
   * Updates the scene to reflect the latest changes in the city data model
   * @param {object} city 
   */
  function update(city) {
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        updateTile(city.data[x][y]);
      }
    }
  }

  /**
   * Updates the mesh at the specified (`x`,`y`) coordinates, if needed
   * @param {*} x 
   * @param {*} y 
   */
  function updateTile(tile) {
    const { x, y } = tile;

    // Current building is the one currently in the scene
    // New building is the one in the data model.
    const currentBuildingId = buildings[x][y]?.userData.id;
    const newBuildingId = tile.buildingId;

    // If the player removes a building, remove it from the scene
    if (!newBuildingId && currentBuildingId) {
      scene.remove(buildings[x][y]);
      buildings[x][y] = undefined;
    }

    // If the data model has changed, update the mesh
    if (newBuildingId !== currentBuildingId) {
      scene.remove(buildings[x][y]);
      buildings[x][y] = createAssetInstance(newBuildingId, x, y);
      scene.add(buildings[x][y]);
    }
  }

  /**
   * Defines the lighting and adds it to the scene
   */
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
   * Draw loop for the scene
   */
  function draw() {
    renderer.render(scene, camera.camera);
  }

  function start() {
    renderer.setAnimationLoop(draw);
  }

  function stop() {
    renderer.setAnimationLoop(null);
  }

  /**
   * Event handler for 'mousedown' event
   * @param {MouseEvent} event 
   */
  function onMouseDown(event) {
    camera.onMouseDown(event);

    // Compute normalized mouse coordinates
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    // Update raycaster to have ray directed to where mouse was pointing
    raycaster.setFromCamera(mouse, camera.camera);

    // Find any scene objects intersected by the ray
    let intersections = raycaster.intersectObjects(scene.children, false);

    if (intersections.length > 0) {
      // Un-highlight the previously selected object
      if (selectedObject) selectedObject.material.emissive.setHex(0);

      // Highlight the new selected object
      selectedObject = intersections[0].object;
      selectedObject.material.emissive.setHex(0x555555);
      
      // Notify event handler of new selected object
      if (this.onObjectSelected) {
        this.onObjectSelected(selectedObject);
      }
    }
  }

  /**
   * Event handler for 'mouseup' event
   * @param {MouseEvent} event 
   */
  function onMouseUp(event) {
    camera.onMouseUp(event);
  }

  /**
   * Event handler for 'mousemove' event
   * @param {MouseEvent} event 
   */
  function onMouseMove(event) {
    camera.onMouseMove(event);
  }

  return {
    onObjectSelected,
    initialize,
    update,
    updateTile,
    start,
    stop,
    onMouseDown,
    onMouseUp,
    onMouseMove
  }
}