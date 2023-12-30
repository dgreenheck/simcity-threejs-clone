import * as THREE from 'three';

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
    if (this.#mesh) {
      this.dispose();
      this.remove(this.#mesh);
    }
    this.#mesh = value;
    this.add(this.#mesh);
  }

  /**
   * Performs a full refresh of the object
   * @param {City} city 
   */
  refresh(city) {
    // Override in subclass
  }

  /**
   * Updates the state of this object by one simulation step
   * @param {City} city 
   */
  simulate(city) {
    // Override in subclass
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