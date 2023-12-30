import * as THREE from 'three';
import { CameraManager } from './cameraManager.js';
import { City } from '../sim/city.js';

/** 
 * Manager for the Three.js scene. Handles rendering of a `City` object
 */
export class SceneManager {
  /**
   * @type {City}
   */
  city;

  constructor(city) {
    this.city = city;

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true
    });
    this.scene = new THREE.Scene();
    this.gameWindow = document.getElementById('render-target');
    this.cameraManager = new CameraManager(this.gameWindow);

    // Configure the renderer
    this.renderer.setSize(this.gameWindow.clientWidth, this.gameWindow.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

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
  initialize(city) {
    this.scene.clear();
    this.scene.add(city);
    this.#setupLights();
    this.#setupGrid(city);

    console.log('scene loaded');
  }

  #setupGrid(city) {
    // Add the grid
    const gridMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      map: window.assetManager.textures['grid'],
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
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 50;
    sun.shadow.normalBias = 0.01;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
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
    this.city.draw();
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
    mesh.traverse((obj) => obj.material?.emissive?.setHex(color));
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

    let intersections = this.raycaster.intersectObjects(this.city.root.children, true);
    if (intersections.length > 0) {
      console.log(intersections);
      // The SimObject attached to the mesh is stored in the user data
      const selectedObject = intersections[0].object.userData;
      console.log(selectedObject);
      return selectedObject;
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