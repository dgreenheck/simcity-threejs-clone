import * as THREE from 'three';
import { SimModule } from './buildings/modules/simModule';

const SELECTED_COLOR = 0xaaaa55;
const HIGHLIGHTED_COLOR = 0x555555;

export class SimObject extends THREE.Object3D {
  /**
   * @type {THREE.Mesh?}
   */
  #mesh = null;
  /**
   * World position of the object
   * @type {THREE.Vector3}
   */
  #worldPos = new THREE.Vector3();

  /**
   * @param {number} x The x-coordinate of the object 
   * @param {number} y The y-coordinate of the object
   */
  constructor(x = 0, y = 0) {
    super();
    this.name = 'SimObject';
    this.position.x = x;
    this.position.z = y;
  }

  get x() {
    this.getWorldPosition(this.#worldPos);
    return Math.floor(this.#worldPos.x);
  }

  get y() {
    this.getWorldPosition(this.#worldPos);
    return Math.floor(this.#worldPos.z);
  }

  /**
   * @type {THREE.Mesh?}
   */
  get mesh() {
    return this.#mesh;
  } 

  /**
   * @type {THREE.Mesh} value
   */
  setMesh(value) {
    // Remove resources for existing mesh
    if (this.#mesh) {
      this.dispose();
      this.remove(this.#mesh);
    }

    this.#mesh = value;

    // Add to scene graph
    if (this.#mesh) {
      this.add(this.#mesh);
    }
  }

  /**
   * Updates the state of this object by one simulation step
   * @param {City} city 
   */
  simulate(city) {
    // Override in subclass
  }

  setSelected(value) {
    if (value) {
      this.#setMeshEmission(SELECTED_COLOR);
    } else {
      this.#setMeshEmission(0);
    }
  }

  setFocused(value) {
    if (value) {
      this.#setMeshEmission(HIGHLIGHTED_COLOR);
    } else {
      this.#setMeshEmission(0);
    }
  }

  /**
   * Sets the emission color of the mesh 
   * @param {number} color 
   */
  #setMeshEmission(color) {
    if (!this.mesh) return;
    this.mesh.traverse((obj) => obj.material?.emissive?.setHex(color));
  }

  /**
   * Handles any clean up needed before an object is removed
   */
  dispose() {
    this.#mesh.traverse((obj) => {
      if (obj.material) {
        obj.material?.dispose();
      }
    })
  }
}