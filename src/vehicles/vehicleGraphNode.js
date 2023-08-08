import * as THREE from 'three';

const NODE_GEOMETRY = new THREE.SphereGeometry(0.03, 6, 6);
const EDGE_GEOMETRY = new THREE.ConeGeometry(0.02, 1, 6);

const CONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const DISCONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const EDGE_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x000ff});

/**
 * Represents a node in a VehicleGraph
 */
export class VehicleGraphNode extends THREE.Mesh {
  constructor(x, y) {
    super();

    this.name = "VehicleGraphNode";
    this.position.set(x, 0, y);

    /**
     * One or more traffic nodes following this one
     * @type {VehicleGraphNode[]}
     */
    this.next = [];
    
    this.updateVisualization();
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
      this.updateVisualization();
    }
  }

  /**
   * Clears the connections for this node
   */
  disconnectAll() {
    this.next = [];
    this.updateVisualization();
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

  /**
   * Updates the 3D representation of this node
   */
  updateVisualization() {
    this.clear();

    this.geometry = NODE_GEOMETRY;
    
    if(this.next.length > 0) {
      this.material = CONNECTED_MATERIAL;

      const worldPosThis = new THREE.Vector3();
      this.getWorldPosition(worldPosThis);

      for (const nextNode of this.next) {
        const edgeVector = new THREE.Vector3();
        nextNode.getWorldPosition(edgeVector);
        edgeVector.sub(worldPosThis);
        const distance = edgeVector.length();
        
        const up = new THREE.Vector3(0, 1, 0);

        const edge = new THREE.Mesh(EDGE_GEOMETRY, EDGE_MATERIAL);
        edge.scale.set(1, distance, 1);
        edge.quaternion.setFromUnitVectors(up, edgeVector.clone().normalize());

        const offset = new THREE.Vector3(0, distance / 2, 0).applyQuaternion(edge.quaternion.clone());
        edge.position.set(offset.x, offset.y, offset.z);

        this.add(edge);
      }
    } else {
      this.material = DISCONNECTED_MATERIAL;
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