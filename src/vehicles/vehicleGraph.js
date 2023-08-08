import * as THREE from 'three';
import { Vehicle } from './vehicle.js';
import { VehicleGraphTile } from './vehicleGraphTile.js';

import config from '../config.js';

export class VehicleGraph extends THREE.Group {
  constructor(size) {
    super();

    /**
     * Size of the vehicle graph
     * @type {number}
     */
    this.size = size;

    /**
     * A 2D array of tiles
     * @type {VehicleGraphTile[][]}
     */
    this.tiles = [];
    
    /**
     * Collection of vehicles in the graph
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
   * @param {Road} road 
   */
  updateTile(x, y, road) {
    // Remove the existing tile
    const existingTile = this.getTile(x, y);
    if (existingTile) {
      this.remove(existingTile);
    }

    if (road) {
      const tile = VehicleGraphTile.create(road, this.spawnVehicles.bind(this));
      this.tiles[x][y] = tile;
      tile.getLeftSide()?.out?.connect(this.getTile(x - 1, y)?.getRightSide()?.in);
      tile.getRightSide()?.out?.connect(this.getTile(x + 1, y)?.getLeftSide()?.in);
      tile.getTopSide()?.out?.connect(this.getTile(x, y - 1)?.getBottomSide()?.in);
      tile.getBottomSide()?.out?.connect(this.getTile(x, y + 1)?.getTopSide()?.in);
      this.add(tile);
    } else {
      this.tiles[x][y] = null;
      this.getTile(x - 1, y)?.getRightSide()?.out?.disconnectAll();
      this.getTile(x + 1, y)?.getLeftSide()?.out?.disconnectAll();
      this.getTile(x, y + 1)?.getTopSide()?.out?.disconnectAll();
      this.getTile(x, y - 1)?.getBottomSide()?.out?.disconnectAll();
    }
  }

  /**
   * Timer function that is responsible for spawning new vehicles
   * @returns 
   */
  spawnVehicles(tile) {
    if (this.vehicles.children.length < config.vehicle.maxVehicleCount) {
      console.log('spawning new vehicle');
      const origin = tile.getRandomNode();
      const destination = origin.getRandomNext();
      const vehicle = new Vehicle(origin, destination);
      this.vehicles.add(vehicle);
      return;
    }
  }
}