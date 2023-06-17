import * as THREE from 'three';
import { createCameraManager } from './cameraManager.js';
import { createAssetManager } from './assets.js';

export function createScene() {
  // Initial scene setup
  const gameWindow = document.getElementById('render-target');
  const scene = new THREE.Scene();

  const assetManager = createAssetManager();
  const cameraManager = createCameraManager(gameWindow);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  gameWindow.appendChild(renderer.domElement);

  // Variables for object selection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Last object the user has clicked on
  let activeObject = undefined;
  // Object the mouse is currently hovering over
  let hoverObject = undefined;

  // 2D array of building meshes at each tile location
  let buildings = [];

  function setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 1)
    sun.position.set(20, 20, 20);
    sun.castShadow = true;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 0;
    sun.shadow.camera.bottom = -10;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  }

  /**
   * Render the contents of the scene
   */
  function draw() {
    renderer.render(scene, cameraManager.camera);
  }

  /**
   * Updates the material properties of the object to have the
   * specified emission color
   * @param {THREE.Mesh} object 
   * @param {number} color 
   * @returns 
   */
  function setObjectEmission(object, color) {
    if (!object) return;
    if (Array.isArray(object.material)) {
      object.material.forEach(material => material.emissive?.setHex(color));
    } else {
      object.material.emissive?.setHex(color);
    }
  }

  return {
    /* PROPERTIES */

    cameraManager,

    /* METHODS */

    /**
     * Initializes the scene with the passed data model
     * @param {object} city City data model 
     */
    initialize(city) {
      scene.clear();
      buildings = [];
  
      for (let x = 0; x < city.size; x++) {
        const column = [];
        for (let y = 0; y < city.size; y++) {
          const mesh = assetManager.createMesh(city.tiles[x][y].terrainId, x, y);
          scene.add(mesh);
          column.push(mesh);
        }
        buildings.push([...Array(city.size)]);
      }
  
      setupLights();
    },
  
    /**
     * Updates the state of the city, moving it forward by
     * one simulation step
     */
    update(city) {
      for (let x = 0; x < city.size; x++) {
        for (let y = 0; y < city.size; y++) {
          const tile = city.tiles[x][y];
          const existingBuildingMesh = buildings[x][y];
  
          // If the player removes a building, remove it from the scene
          if (!tile.building && existingBuildingMesh) {
            scene.remove(existingBuildingMesh);
            buildings[x][y] = undefined;
          }
  
          // If the data model has changed, update the mesh
          if (tile.building && tile.building.updated) {
            scene.remove(existingBuildingMesh);
            buildings[x][y] = assetManager.createMesh(tile.building.type, x, y, tile.building);
            scene.add(buildings[x][y]);
            tile.building.updated = false;
          }
        }
      }
    },

    /**
     * Starts the renderer
     */
    start() {
      renderer.setAnimationLoop(draw);
    },

    /**
     * Stops the renderer
     */
    stop() {
      renderer.setAnimationLoop(null);
    },

    /**
     * Sets the object that is currently highlighted
     * @param {THREE.Mesh} object 
     */
    setHighlightedObject(object) {
      // Unhighlight the previously hovered object (if it isn't currently selected)
      if (hoverObject && hoverObject !== activeObject) {
        setObjectEmission(hoverObject, 0x000000);
      }

      hoverObject = object;

      if (hoverObject) {
        // Highlight the new hovered object (if it isn't currently selected))
        setObjectEmission(hoverObject, 0x555555);
      }
    },

    /**
     * Gets the object currently under the mouse cursor. If there is nothing under
     * the mouse cursor, returns null
     * @param {MouseEvent} event Mouse event
     */
    getSelectedObject(event) {
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
    },

    /**
     * Sets the currently selected object and highlights it
     * @param {object} object 
     */
    setActiveObject(object) {
      // Clear highlight on previously active object
      setObjectEmission(activeObject, 0x000000);
      activeObject = object;
      // Highlight new active object
      setObjectEmission(activeObject, 0xaaaa55);
    },

    /**
     * Resizes the renderer to fit the current game window
     */
    onResize() {
      cameraManager.camera.aspect = gameWindow.offsetWidth / gameWindow.offsetHeight;
      cameraManager.camera.updateProjectionMatrix();
      renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
    }
  }
}