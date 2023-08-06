import * as THREE from 'three';
import { City } from './city.js';

const NODE_GEOMETRY = new THREE.SphereGeometry(0.05, 6, 6);
const EDGE_GEOMETRY = new THREE.ConeGeometry(0.03, 1, 6);
const CONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const DISCONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const EDGE_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x000ff});

export class VehicleGraph {
  constructor(city) {
    /**
     * @type {GraphTile[]}
     */
    this.tiles = [];
    
    /**
     * The root scene node that all graph tiles are children of
     * @type {THREE.Group}
     */
    this.rootNode = new THREE.Group();
    this.rootNode.name = "VehicleGraph";

    for (let x = 0; x < city.size; x++) {
      const column = [];
      for (let y = 0; y < city.size; y++) {
        const tile = new GraphTile(x, y);
        this.rootNode.add(tile);
        column.push(tile);
      }
      this.tiles.push(column);
    }

    this.tiles[1][1].rootNode.connect(this.tiles[1][2].rootNode);
    this.tiles[1][1].rootNode.connect(this.tiles[1][0].rootNode);
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

class GraphTile extends THREE.Object3D {
  constructor(x, y) {
    super();
    this.position.set(x, 0, y);
    this.name = `GraphTile (${x},${y})`

    this.rootNode = new GraphNode();
    this.add(this.rootNode);
  }
}

class GraphNode extends THREE.Mesh {
  constructor() {
    super();

    this.name = "GraphNode";

    /**
     * One or more traffic nodes following this one
     * @type {GraphNode[]}
     */
    this.next = [];

    this.position.set(0, 0, 0);

    this.update();
  }

  connect(node) {
    if (!this.next.includes(node)) {
      this.next.push(node);
      this.update();
    }
  }

  disconnect(node) {
    this.next = this.next.filter(x => x !== node);
    this.update();
  }

  disconnectAll() {
    this.next = [];
    this.update();
  }

  update() {
    this.clear();

    this.geometry = NODE_GEOMETRY;
    
    if(this.next.length > 0) {
      this.material = CONNECTED_MATERIAL;

      const worldPosThis = new THREE.Vector3();
      const worldPosNext = new THREE.Vector3();
      this.getWorldPosition(worldPosThis);

      for (const nextNode of this.next) {
        nextNode.getWorldPosition(worldPosNext);
        const edge = new THREE.Mesh(EDGE_GEOMETRY, EDGE_MATERIAL);
        const edgeVector = worldPosNext.sub(worldPosThis);
        const distance = edgeVector.length();
        
        const up = new THREE.Vector3(0, 1, 0);

        edge.scale.set(1, distance, 1);
        edge.quaternion.setFromUnitVectors(up, edgeVector.clone().normalize());

        const offset = new THREE.Vector3(0, distance / 2, 0).applyQuaternion(edge.quaternion);
        edge.position.set(offset.x, offset.y, offset.z);

        this.add(edge);
      }
    } else {
      this.material = DISCONNECTED_MATERIAL;
    }
  }
}