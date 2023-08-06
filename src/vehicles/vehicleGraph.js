import * as THREE from 'three';
import { City } from '../city.js';
import { Vehicle } from './vehicle.js';
import config from '../config.js';

const NODE_GEOMETRY = new THREE.SphereGeometry(0.05, 6, 6);
const EDGE_GEOMETRY = new THREE.ConeGeometry(0.03, 1, 6);

const CONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const DISCONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const EDGE_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x000ff});

export class VehicleGraph {
  constructor(size) {
    /**
     * Size of the vehicle graph
     * @type {number}
     */
    this.size = size;

    /**
     * A 2D array of tiles
     * @type {GraphTile[]}
     */
    this.tiles = [];
    
    /**
     * Collection of vehicles in the graph
     * @type {THREE.Group}
     */
    this.vehicles = new THREE.Group();

    /**
     * The root scene node that all graph tiles are children of
     * @type {THREE.Group}
     */
    this.rootNode = new THREE.Group();
    this.rootNode.name = "VehicleGraph";
    this.rootNode.add(this.vehicles);

    // Initialize the tiles
    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        const tile = new GraphTile(x, y);
        this.rootNode.add(tile);
        column.push(tile);
      }
      this.tiles.push(column);
    }

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        const left = this.getTile(x - 1, y);
        const right = this.getTile(x + 1, y);
        const top = this.getTile(x, y + 1);
        const bottom = this.getTile(x, y - 1);

        if (left && Math.random() > 0.5) tile.rootNode.connect(left.rootNode);
        if (right && Math.random() > 0.5) tile.rootNode.connect(right.rootNode);
        if (top && Math.random() > 0.5) tile.rootNode.connect(top.rootNode);
        if (bottom && Math.random() > 0.5) tile.rootNode.connect(bottom.rootNode);
      }
    }

    setInterval(this.spawnVehicles.bind(this), config.vehicle.spawnInterval);
  }

  /**
   * Gets the graph tile at the specified coordinates
   * @param {number} x 
   * @param {number} y 
   * @returns {GraphTile | null}
   */
  getTile(x, y) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.tiles[x][y];
    } else {
      return null;
    }
  }

  update() {
    // Update the state of the rest of the vehicles
    for (const vehicle of this.vehicles.children) {
      vehicle.update();
    }
  }

  spawnVehicles() {
    if (this.vehicles.children.length < config.vehicle.maxVehicleCount) {
      console.log('spawning new vehicle');
      // Find a random graph node
      const x = Math.floor(this.size * Math.random());
      const y = Math.floor(this.size * Math.random());
      const tile = this.getTile(x, y);
      const origin = tile.rootNode;
      const destination = origin.getRandomNext();
      const vehicle = new Vehicle(origin, destination);
      this.vehicles.add(vehicle);
      return;
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

/**
 * Represents a sub-graph of the vehicle graph that corresponds
 * to a single tile in the city data model
 */
class GraphTile extends THREE.Object3D {
  constructor(x, y) {
    super();
    this.position.set(x, 0, y);
    this.name = `GraphTile (${x},${y})`

    this.rootNode = new GraphNode();
    this.add(this.rootNode);
  }
}

/**
 * Represents a node in a VehicleGraph
 */
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

    this.updateVisualization();
  }

  connect(node) {
    if (!this.next.includes(node)) {
      this.next.push(node);
      this.updateVisualization();
    }
  }

  disconnect(node) {
    this.next = this.next.filter(x => x !== node);
    this.updateVisualization();
  }

  disconnectAll() {
    this.next = [];
    this.updateVisualization();
  }

  getRandomNext() {
    if (this.next.length === 0) {
      return null;
    } else {
      const i = Math.floor(this.next.length * Math.random());
      return this.next[i];
    }
  }

  updateVisualization() {
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