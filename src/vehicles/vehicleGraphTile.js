import * as THREE from 'three';
import { VehicleGraphNode } from './vehicleGraphNode.js';
import { Road } from '../buildings/road.js';
import config from '../config.js';

const roadOffset = 0.05;
const halfTileSize = 0.5;

/**
 * Represents a sub-graph of the vehicle graph that corresponds
 * to a single tile in the city data model
 */
export class VehicleGraphTile extends THREE.Object3D {
  /**
   * Creates a new vehicle graph tile
   * @param {Road} road 
   */
  constructor(road, spawnHandler) {
    super();
    this.position.set(road.x, 0, road.y);
    this.rotation.set(0, THREE.MathUtils.degToRad(road.rotation), 0);
    this.name = `VehicleGraphTile (${this.position})`

    this.left = { in: null, out: null };
    this.right = { in: null, out: null };
    this.top = { in: null, out: null };
    this.bottom = { in: null, out: null };

    setInterval(() => {
      if (Math.random() < config.vehicle.spawnChance) {
        spawnHandler(this)
      }
    }, config.vehicle.spawnInterval);
  }

  getRandomNode() {
    const nodes = [];
    if (this.left.in) nodes.push(this.left.in);
    if (this.right.in) nodes.push(this.right.in);
    if (this.top.in) nodes.push(this.top.in);
    if (this.bottom.in) nodes.push(this.bottom.in);
    const i = Math.floor(nodes.length * Math.random());
    return nodes[i];
  }
  
  /**
   * Creates a new VehicleGraphTile from the road model
   * @param {Road} road 
   * @returns 
   */
  static create(road, spawnHandler) {
    switch (road.style) {
      case 'end':
        return new EndRoadTile(road, spawnHandler);
      case 'straight': 
        return new StraightRoadTile(road, spawnHandler);
      case 'corner':
        return new CornerRoadTile(road, spawnHandler);
      case 'tee':
        return new TeeRoadTile(road, spawnHandler);
      case 'intersection':
        return new IntersectionRoadTile(road, spawnHandler);
      default:
        console.error(`Road type ${road.style} is not a known value`);
    }
  }
}

export class EndRoadTile extends VehicleGraphTile {
  constructor(road, spawnHandler) {
    super(road, spawnHandler);

    this.name = `EndRoadTile (${this.position})`

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, halfTileSize),
      out: new VehicleGraphNode(-roadOffset, halfTileSize)
    };

    const midpoint = {
      in: new VehicleGraphNode(roadOffset, 0),
      out: new VehicleGraphNode(-roadOffset, 0)
    };

    // Connect together
    // Path #1: U-turn
    this.bottom.in.connect(midpoint.in);
    midpoint.in.connect(midpoint.out);
    midpoint.out.connect(this.bottom.out);

    this.add(this.bottom.in);
    this.add(this.bottom.out);
    this.add(midpoint.in);
    this.add(midpoint.out);
  }
}

export class StraightRoadTile extends VehicleGraphTile {
  constructor(road, spawnHandler) {
    super(road, spawnHandler);

    this.name = `StraightRoadTile (${this.position})`

    // Create nodes
    this.top = {
      in: new VehicleGraphNode(-roadOffset, -halfTileSize),
      out: new VehicleGraphNode(roadOffset, -halfTileSize)
    };

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, halfTileSize),
      out: new VehicleGraphNode(-roadOffset, halfTileSize)
    };

    // Connect together
    // Path #1: Bottom -> Top
    this.bottom.in.connect(this.top.out);
    // Path #2: Top -> Bototm
    this.top.in.connect(this.bottom.out);

    // Add to tile
    this.add(this.top.in);
    this.add(this.top.out);
    this.add(this.bottom.in);
    this.add(this.bottom.out);
  }
}


export class CornerRoadTile extends VehicleGraphTile {
  constructor(road, spawnHandler) {
    super(road, spawnHandler);

    this.name = `CornerRoadTile (${this.position})`

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, halfTileSize),
      out: new VehicleGraphNode(-roadOffset, halfTileSize)
    };

    this.right = {
      in: new VehicleGraphNode(halfTileSize, -roadOffset),
      out: new VehicleGraphNode(halfTileSize, roadOffset)
    };

    const midpoint = {
      in: new VehicleGraphNode(0.5 * halfTileSize - 1.5 * roadOffset, 0.5 * halfTileSize - 1.5 * roadOffset),
      out: new VehicleGraphNode(0.5 * halfTileSize - 3 * roadOffset, 0.5 * halfTileSize - 3 * roadOffset)
    }

    // Connect together
    // Path #1: Bottom -> Right
    this.bottom.in.connect(midpoint.in);
    midpoint.in.connect(this.right.out);
    // Path #2: Right -> Bottom
    this.right.in.connect(midpoint.out);
    midpoint.out.connect(this.bottom.out);

    this.add(midpoint.in);
    this.add(midpoint.out);
    this.add(this.right.in);
    this.add(this.right.out);
    this.add(this.bottom.in);
    this.add(this.bottom.out);
  }
}


export class TeeRoadTile extends VehicleGraphTile {
  constructor(road, spawnHandler) {
    super(road, spawnHandler);

    this.name = `TeeRoadTile (${this.position})`

    // Create nodes
    this.left = {
      in: new VehicleGraphNode(-halfTileSize, roadOffset),
      out: new VehicleGraphNode(-halfTileSize, -roadOffset)
    };

    this.right = {
      in: new VehicleGraphNode(halfTileSize, -roadOffset),
      out: new VehicleGraphNode(halfTileSize, roadOffset)
    };

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, halfTileSize),
      out: new VehicleGraphNode(-roadOffset, halfTileSize)
    };

    const midpointBottomLeft =  new VehicleGraphNode(-roadOffset, roadOffset);
    const midpointBottomRight = new VehicleGraphNode(roadOffset, roadOffset);
    const midpointTopLeft =  new VehicleGraphNode(-roadOffset, -roadOffset);
    const midpointTopRight =  new VehicleGraphNode(roadOffset, -roadOffset);

    // Connect together
    // Path #1: Left -> Right
    // Path #2: Left -> Bottom
    this.left.in.connect(midpointBottomLeft);
    midpointBottomLeft.connect(this.right.out);
    midpointBottomLeft.connect(this.bottom.out);
    // Path #3: Bottom  -> Right
    this.bottom.in.connect(midpointBottomRight);
    midpointBottomRight.connect(this.right.out);
    // Path #4: Bottom -> Left
    this.bottom.in.connect(midpointTopRight);
    midpointTopRight.connect(this.left.out);
    // Path #5: Right -> Left
    this.right.in.connect(midpointTopLeft);
    midpointTopLeft.connect(this.left.out);
    // Path #6: Right -> Bottom
    midpointTopLeft.connect(this.bottom.out);

    // Add to tile
    this.add(this.left.in);
    this.add(this.left.out);
    this.add(this.right.in);
    this.add(this.right.out);
    this.add(this.bottom.in);
    this.add(this.bottom.out);
    this.add(midpointBottomLeft);
    this.add(midpointBottomRight);
    this.add(midpointTopLeft);
    this.add(midpointTopRight);
  }
}

export class IntersectionRoadTile extends VehicleGraphTile {
  constructor(road, spawnHandler) {
    super(road, spawnHandler);

    this.name = `IntersectionRoadTile (${this.position})`

    this.top = {
      in: new VehicleGraphNode(-roadOffset, halfTileSize),
      out: new VehicleGraphNode(roadOffset, halfTileSize)
    };

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, -halfTileSize),
      out: new VehicleGraphNode(-roadOffset, -halfTileSize)
    };

    this.add(this.top.in);
    this.add(this.top.out);
    this.add(this.bottom.in);
    this.add(this.bottom.out);

    this.bottom.in.connect(this.top.out);
    this.top.in.connect(this.bottom.out);
  }
}