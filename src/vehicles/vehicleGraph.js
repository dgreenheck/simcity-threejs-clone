import * as THREE from 'three';
import { Vehicle } from './vehicle.js';
import { VehicleGraphTile } from './vehicleGraphTile.js';

import config from '../config.js';
import { AssetManager } from '../assetManager.js';
import { VehicleGraphHelper } from './vehicleGraphHelper.js';

export class VehicleGraph extends THREE.Group {
  constructor(size, assetManager) {
    super();

    /**
     * Size of the vehicle graph
     * @type {number}
     */
    this.size = size;

    /**
     * @type {AssetManager}
     */
    this.assetManager = assetManager;

    /**
     * A 2D array of tiles
     * @type {VehicleGraphTile[][]}
     */
    this.tiles = [];
        
    /**
     * Visualizer for the graph
     * @type {VehicleGraphHelper}
     */
    this.helper = new VehicleGraphHelper();
    this.add(this.helper);

    /**
     * Collection of graph scene objects
     */
    this.graph = new THREE.Group();
    this.add(this.graph);

    /**
     * Collection of vehicle scene objects
     * @type {THREE.Group}
     */
    this.vehicles = new THREE.Group();
    this.add(this.vehicles);

    // Initialize the tiles
    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        column.push(null);
      }
      this.tiles.push(column);
    }

    setInterval(this.spawnVehicles.bind(this), config.vehicle.spawnInterval);
  }

  /**
   * Gets the graph tile at the specified coordinates
   * @param {number} x 
   * @param {number} y 
   * @returns {VehicleGraphTile | null}
   */
  getTile(x, y) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.tiles[x][y];
    } else {
      return null;
    }
  }

  /**
   * Updates the state (position/orientation) of the vehicles
   */
  updateVehicles() {
    // Update the state of the rest of the vehicles
    for (const vehicle of this.vehicles.children) {
      vehicle.update();
    }
  }

  /**
   * Updates the graph tile at the specified coordinates to match the road
   * @param {Road | null} road 
   */
  updateTile(x, y, road) {
    const existingTile = this.getTile(x, y);

    const leftTile = this.getTile(x - 1, y);
    const rightTile = this.getTile(x + 1, y);
    const topTile = this.getTile(x, y - 1);
    const bottomTile = this.getTile(x, y + 1);

    // Disconnect the existing tile and all adjacent tiles from each other
    existingTile?.disconnect();
    leftTile?.getWorldRightSide()?.out?.disconnectAll();
    rightTile?.getWorldLeftSide()?.out?.disconnectAll();
    topTile?.getWorldBottomSide()?.out?.disconnectAll();
    bottomTile?.getWorldTopSide()?.out?.disconnectAll();

    if (existingTile) {
      this.graph.remove(existingTile);
    }

    // If placing a road, create the graph tile and connect it to the rest of the graph
    if (road) {
      const tile = VehicleGraphTile.create(road);
      
      // Connect tile to adjacent tiles
      if (leftTile) {
        tile.getWorldLeftSide().out?.connect(leftTile.getWorldRightSide().in);
        leftTile.getWorldRightSide().out?.connect(tile.getWorldLeftSide().in);
      }
      if (rightTile) {
        tile.getWorldRightSide().out?.connect(rightTile.getWorldLeftSide().in);
        rightTile.getWorldLeftSide().out?.connect(tile.getWorldRightSide().in);
      }
      if (topTile) {
        tile.getWorldTopSide().out?.connect(topTile.getWorldBottomSide().in);
        topTile.getWorldBottomSide().out?.connect(tile.getWorldTopSide().in);
      }
      if (bottomTile) {
        tile.getWorldBottomSide().out?.connect(bottomTile.getWorldTopSide().in);
        bottomTile.getWorldTopSide().out?.connect(tile.getWorldBottomSide().in);
      }

      // Store the tile in the array and add it to the scene
      this.tiles[x][y] = tile;
      this.graph.add(tile);
    // Otherwise, remove it
    } else {
      this.tiles[x][y] = null;
    }

    road.needsGraphUpdate = false;
    this.helper.update(this);
  }

  /**
   * Timer function that is responsible for spawning new vehicles
   * @returns 
   */
  spawnVehicles() {
    if (this.vehicles.children.length < config.vehicle.maxVehicleCount) {
      const i = Math.floor(this.graph.children.length * Math.random());
      const tile = this.graph.children[i];

      if (tile) {
        const origin = tile.getRandomNode();
        const destination = origin.getRandomNext();
        if (origin && destination) {
          const vehicle = new Vehicle(origin, destination, this.assetManager.getRandomCarMesh());
          this.vehicles.add(vehicle);
        }
      }
    }
  }
}