import * as THREE from 'three';
import { CameraManager } from './cameraManager.js';
import { City } from '../sim/city.js';
import { SimObject } from '../sim/simObject.js';

/** 
 * Manager for the Three.js scene. Handles rendering of a `City` object
 */
export class SceneManager {
  /**
   * Currently selected tool
   * @type {string}
   */
  activeToolId = 'select';
  /**
   * @type {City}
   */
  city;
  /**
   * Object that currently hs focus
   * @type {SimObject | null}
   */
  focusedObject = null;
  /**
   * Last mouse position from 'mousemove' event
   * @type {THREE.Vector2}
   */
  mouse = new THREE.Vector2();
  isMouseDown = false;
  /**
   * Object that is currently selected
   * @type {SimObject | null}
   */
  selectedObject = null;

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

    // Variables for object selection
    this.raycaster = new THREE.Raycaster();

    window.addEventListener('resize', this.onResize.bind(this), false);
    this.gameWindow.addEventListener('mousedown', this.#onMouseDown.bind(this), false);
    this.gameWindow.addEventListener('mouseup', this.#onMouseUp.bind(this), false);
    this.gameWindow.addEventListener('mousemove', this.#onMouseMove.bind(this), false);
    this.gameWindow.addEventListener('contextmenu', (event) => event.preventDefault(), false);
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
    this.#updateFocusedObject();

    if (this.isMouseDown) {
      this.useActiveTool();
    }

    this.renderer.render(this.scene, this.cameraManager.camera);
  }

  /**
   * Event handler for `mousedown` event
   * @param {MouseEvent} event 
   */
  #onMouseDown(event) {
    if (event.button === 0) {
      this.isMouseDown = true;
    }
  }

  /**
   * Event handler for `mouseup` event
   * @param {MouseEvent} event 
   */
  #onMouseUp(event) {
    if (event.button === 0) {
      this.isMouseDown = false;
    }
  }

  /**
   * Event handler for 'mousemove' event
   * @param {MouseEvent} event 
   */
  #onMouseMove(event) {
    this.isMouseDown = event.buttons & 1;
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  useActiveTool() {
    switch (this.activeToolId) {
      case 'select':
        this.updateSelectedObject();
        this.updateInfoPanel(this.selectedObject);
        break;
      case 'bulldoze':
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          this.city.bulldoze(x, y);
        }
        break;
      default:
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          this.city.placeBuilding(x, y, this.activeToolId);
        }
        break;
    }
  }
  
  /**
   * Sets the currently selected object and highlights it
   */
  updateSelectedObject() {
    this.selectedObject?.setSelected(false);
    this.selectedObject = this.focusedObject;
    this.selectedObject?.setSelected(true);
  }

  /**
   * Sets the object that is currently highlighted
   */
  #updateFocusedObject() {  
    this.focusedObject?.setFocused(false);
    const newObject = this.#raycast();
    if (newObject !== this.focusedObject) {
      this.focusedObject = this.#raycast();
    }
    this.focusedObject?.setFocused(true);
  }

  /**
   * Gets the mesh currently under the this.mouse cursor. If there is nothing under
   * the this.mouse cursor, returns null
   * @param {MouseEvent} event Mouse event
   * @returns {THREE.Mesh?}
   */
  #raycast() {
    var coords = {
      x: (this.mouse.x / this.renderer.domElement.clientWidth) * 2 - 1,
      y: -(this.mouse.y / this.renderer.domElement.clientHeight) * 2 + 1
    };

    this.raycaster.setFromCamera(coords, this.cameraManager.camera);

    let intersections = this.raycaster.intersectObjects(this.city.root.children, true);
    if (intersections.length > 0) {
      // The SimObject attached to the mesh is stored in the user data
      const selectedObject = intersections[0].object.userData;
      return selectedObject;
    } else {
      return null;
    }
  }

  updateInfoPanel(object) {
    if (object) {
      const tile = this.city.getTile(object.x, object.y);
      document.getElementById('info-details').innerHTML = tile.toHTML();
    } else {
      document.getElementById('info-details').innerHTML = '';
    }
  }

  /**
   * Resizes the renderer to fit the current game window
   */
  onResize() {
    this.cameraManager.resize(this.gameWindow);
    this.renderer.setSize(this.gameWindow.clientWidth, this.gameWindow.clientHeight);
  }
}