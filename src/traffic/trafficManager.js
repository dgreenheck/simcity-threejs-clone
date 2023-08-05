import * as THREE from 'three';
import { City } from '../city.js';

const NODE_GEOMETRY = new THREE.SphereGeometry(0.1, 6, 6);
const EDGE_GEOMETRY = new THREE.ConeGeometry(0.1, 1, 6);
const CONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const DISCONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xff0000 });

export class TrafficManager {
  constructor(city) {
    this.tiles = [];
    
    for (let x = 0; x < city.size; x++) {
      const column = [];
      for (let y = 0; y < city.size; y++) {
        column.push(null);
      }
      this.tiles.push(column);
    }
  }

  /**
   * 
   * @param {City} city 
   */
  refresh(city) {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = city.getTile(x, y);
        if (tile.building?.type === 'road') {

        }
      }
    }
  }
}

class TrafficNode extends THREE.Mesh {
  constructor() {
    /**
     * One or more traffic nodes following this one
     * @type {TrafficNode[]}
     */
    this.next = [];
  }

  connect(node) {
    if (!this.next.includes(node)) {
      this.next.push(node);
    }
  }

  disconnect(node) {
    this.next = this.next.filter(x => x !== node);
  }

  disconnectAll() {
    this.next = [];
  }

  updateMesh() {
    this.clear();

    this.geometry = NODE_GEOMETRY;
    
    if(this.next.length > 0) {
      this.material = CONNECTED_MATERIAL;
      for (const nextNode of this.next) {
        const edge = new THREE.Mesh(EDGE_GEOMETRY, CONNECTED_MATERIAL);
        const edgeVector = nextNode.position.sub(this.position);
        edge.scale.set(1, edgeVector.length(), 1);
        edge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), edgeVector.clone().normalize())
        this.add(edge);
      }
    } else {
      this.material = DISCONNECTED_MATERIAL;
    }
  }
}