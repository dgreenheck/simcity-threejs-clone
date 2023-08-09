import * as THREE from 'three';

/**
 * Represents a node in a VehicleGraph
 */
export class VehicleGraphNode extends THREE.Group {
  constructor(x, y) {
    super();

    this.name = "VehicleGraphNode";
    this.position.set(x, 0, y);

    /**
     * One or more traffic nodes following this one
     * @type {VehicleGraphNode[]}
     */
    this.next = [];
  }

  /**
   * Sets `node` as a next node
   * @param {VehicleGraphNode} node 
   * @returns 
   */
  connect(node) {
    if (!node) return;

    if (!this.next.includes(node)) {
      this.next.push(node);
    }
  }

  /**
   * Clears the connections for this node
   */
  disconnectAll() {
    this.next = [];
  }

  /**
   * Randomly selects one of the next nodes and returns it
   * @returns {VehicleGraphNode}
   */
  getRandomNext() {
    if (this.next.length === 0) {
      return null;
    } else {
      const i = Math.floor(this.next.length * Math.random());
      return this.next[i];
    }
  }

  toHTML() {
    const thisPosition = new THREE.Vector3();
    const nextPosition = new THREE.Vector3();

    this.getWorldPosition(thisPosition);

    let html = `
      <span class="info-label">ID </span>
      <span class="info-value">${this.id}</span>
      <br>
      <span class="info-label">Position </span>
      <span class="info-value">X: ${thisPosition.x} Y: ${thisPosition.z}</span>
    `;
    
    html += `<div class="info-heading">Next Nodes (${this.next.length})</div>`;

    for (const node of this.next) {
      node.getWorldPosition(nextPosition);

      html += `
        <span class="info-label">ID </span>
        <span class="info-value">${node.id}</span>
        <br>
        <span class="info-label">Position </span>
        <span class="info-value">X: ${nextPosition.x} Y: ${nextPosition.z}</span>
      `;
    }
    html += '</ul>';

    return html;
  }
}