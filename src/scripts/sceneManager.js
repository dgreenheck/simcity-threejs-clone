import * as THREE from 'three';
import { CameraManager } from './cameraManager.js';
import { AssetManager } from './assetManager.js';
import { City } from './city.js';
import { VehicleGraph } from './vehicles/vehicleGraph.js';

/** 
 * Manager for the Three.js scene. Handles rendering of a `City` object
 */
export class SceneManager {
  /**
   * Initializes a new Scene object
   * @param {City} city 
   */
  constructor(city, onLoad) {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true
    });
    this.scene = new THREE.Scene();
    this.gameWindow = document.getElementById('render-target');
    this.assetManager = new AssetManager(() => {
      console.log('assets loaded');
      this.#initialize(city);
      onLoad();
    });
    this.cameraManager = new CameraManager(this.gameWindow);

    /**
     * 2D array of building meshes at each tile location
     * @type {THREE.Mesh[][]}
     */
    this.buildings = [];

    /**
     * 2D array of terrain mesh data
     * @type {THREE.Mesh[][]}
     */
    this.terrain = [];

    // Configure the renderer
    this.renderer.setSize(this.gameWindow.clientWidth, this.gameWindow.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add the renderer to the DOM
    this.gameWindow.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.onResize.bind(this), false);

    // Variables for object selection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Last object the user has clicked on
    this.activeObject = null;
    // Object the mouse is currently hovering over
    this.hoverObject = null;
  }

  /**
   * Initalizes the scene, clearing all existing assets
   */
  #initialize(city) {
    this.scene.clear();

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.vehicleGraph = new VehicleGraph(city.size, this.assetManager);
    this.root.add(this.vehicleGraph);

    this.buildings = [];
    this.terrain = [];

    // Initialize the buildings array
    for (let x = 0; x < city.size; x++) {
      const column = [];
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        const mesh = this.assetManager.createGroundMesh(tile);
        this.root.add(mesh);
        column.push(mesh);
      }
      this.buildings.push([...Array(city.size)]);
      this.terrain.push(column);
    }

    this.#setupLights();
    this.#setupGrid(city);
  }

  #setupGrid(city) {
    // Add the grid
    const gridMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      map: this.assetManager.textures['grid'],
      transparent: true,
      opacity: 0.2
    });
    gridMaterial.map.repeat = new THREE.Vector2(city.size, city.size);
    gridMaterial.map.wrapS = city.size;
    gridMaterial.map.wrapT = city.size;

    const grid = new THREE.Mesh(
      new THREE.BoxGeometry(city.size, 0.1, city.size),
      gridMaterial
    );
    grid.position.set(city.size / 2 - 0.5, -0.04, city.size / 2 - 0.5);
    this.scene.add(grid);
  }

  /**
   * Setup the lights for the scene
   */
  #setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 2)
    sun.position.set(10, 20, 20);
    sun.castShadow = true;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 0;
    sun.shadow.camera.bottom = -10;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 50;
    this.root.add(sun);
    this.root.add(new THREE.AmbientLight(0xffffff, 0.5));
  }

  /**
   * Applies the latest changes in the data model to the scene
   * @param {City} city The city data model
   */
  applyChanges(city) {
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        const existingBuildingMesh = this.buildings[x][y];

        // Show/hide the terrain
        this.terrain[x][y].visible = !(tile.building?.hideTerrain) ?? true;

        // If the player removes a building, remove it from the root node
        if (!tile.building && existingBuildingMesh) {
          this.root.remove(existingBuildingMesh);
          this.buildings[x][y] = null;
          this.vehicleGraph.updateTile(x, y, null);
        }

        // If the data model has changed, update the mesh
        if (tile.building && tile.building.isMeshOutOfDate) {
          this.root.remove(existingBuildingMesh);
          this.buildings[x][y] = this.assetManager.createBuildingMesh(tile);
          this.root.add(this.buildings[x][y]);
          tile.building.isMeshOutOfDate = false;

          if (tile.building.type === 'road') {
            this.vehicleGraph.updateTile(x, y, tile.building);
          }
        }
      }
    }
  }

  /**
   * Starts the renderer
   */
  start() {
    this.renderer.setAnimationLoop(this.#draw.bind(this));
  }

  /**
   * Stops the renderer
   */
  stop() {
    this.renderer.setAnimationLoop(null);
  }

  /**
   * Render the contents of the scene
   */
  #draw() {
    this.vehicleGraph.updateVehicles();
    this.renderer.render(this.scene, this.cameraManager.camera);
  }

  /**
   * Sets the object that is currently highlighted
   * @param {THREE.Mesh} mesh 
   */
  setHighlightedMesh(mesh) {
    // Unhighlight the previously hovered object (if it isn't currently selected)
    if (this.hoverObject && this.hoverObject !== this.activeObject) {
      this.#setMeshEmission(this.hoverObject, 0x000000);
    }

    this.hoverObject = mesh;

    if (this.hoverObject) {
      // Highlight the new hovered object (if it isn't currently selected))
      this.#setMeshEmission(this.hoverObject, 0x555555);
    }
  }

  /**
   * Sets the emission color of the mesh 
   * @param {THREE.Mesh} mesh 
   * @param {number} color 
   */
  #setMeshEmission(mesh, color) {
    if (!mesh) return;
    mesh.material.emissive?.setHex(color);
  }

  /**
   * Gets the mesh currently under the this.mouse cursor. If there is nothing under
   * the this.mouse cursor, returns null
   * @param {MouseEvent} event Mouse event
   * @returns {THREE.Mesh?}
   */
  getSelectedObject(event) {
    // Compute normalized this.mouse coordinates
    this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.cameraManager.camera);

    let intersections = this.raycaster.intersectObjects(this.root.children, true);
    if (intersections.length > 0) {
      return intersections[0].object;
    } else {
      return null;
    }
  }

  /**
   * Sets the currently selected object and highlights it
   * @param {object} object 
   */
  setActiveObject(object) {
    // Clear highlight on previously active object
    this.#setMeshEmission(this.activeObject, 0x000000);
    this.activeObject = object;
    // Highlight new active object
    this.#setMeshEmission(this.activeObject, 0xaaaa55);
  }

  /**
   * Resizes the renderer to fit the current game window
   */
  onResize() {
    this.cameraManager.resize(this.gameWindow);
    this.renderer.setSize(this.gameWindow.clientWidth, this.gameWindow.clientHeight);
  }
}