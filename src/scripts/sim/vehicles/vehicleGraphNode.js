import * as THREE from 'three';

export class VehicleGraphNode extends THREE.Object3D {
  constructor(x, y) {
    super();

    this.position.set(x, 0, y);

    /**
     * @type {VehicleGraphNode[]}
     */
    this.next = [];
  }

  connect(node) {
    if (!node) return;

    if (!this.next.includes(node)) {
      this.next.push(node);
    }
  }

  disconnectAll() {
    this.next = [];
  }

  /**
   * @returns {VehicleGraphNode | null}
   */
  getRandomNextNode() {
    if (this.next.length === 0) {
      return null;
    } else {
      const i = Math.floor(this.next.length * Math.random());
      return this.next[i];
    }
  }
}