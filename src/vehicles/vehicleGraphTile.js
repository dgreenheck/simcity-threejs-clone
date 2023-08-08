import * as THREE from 'three';
import { VehicleGraphNode } from './vehicleGraphNode.js';
import { Road } from '../buildings/road.js';
import { Vehicle } from './vehicle.js';

const roadOffset = 0.05;
const halfTileSize = 0.33;

/**
 * Represents a sub-graph of the vehicle graph that corresponds
 * to a single tile in the city data model
 */
export class VehicleGraphTile extends THREE.Object3D {
  /**
   * Creates a new vehicle graph tile
   * @param {Road} road 
   */
  constructor(road) {
    super();

    this.road = road;
    this.name = `VehicleGraphTile (${this.position})`
    this.position.set(road.x, 0, road.y);
    this.rotation.set(0, THREE.MathUtils.degToRad(road.rotation), 0);

    /**
     * @type {{ in: VehicleGraphNode, out: VehicleGraphNode }}
     */
    this.left = { in: null, out: null };

    /**
     * @type {{ in: VehicleGraphNode, out: VehicleGraphNode }}
     */
    this.right = { in: null, out: null };

    /**
     * @type {{ in: VehicleGraphNode, out: VehicleGraphNode }}
     */
    this.top = { in: null, out: null };

    /**
     * @type {{ in: VehicleGraphNode, out: VehicleGraphNode }}
     */
    this.bottom = { in: null, out: null };

    /**
     * @type {Vehicle}
     */
    this.vehicle = null;
  }

  /**
   * Creates a new VehicleGraphTile from the road model
   * @param {Road} road 
   * @returns 
   */
  static create(road) {
    switch (road.style) {
      case 'end':
        return new EndRoadTile(road);
      case 'straight': 
        return new StraightRoadTile(road);
      case 'corner':
        return new CornerRoadTile(road);
      case 'three-way':
        return new ThreeWayRoadTile(road);
      case 'four-way':
        return new FourWayRoadTile(road);
      default:
        console.error(`Road type ${road.style} is not a known value`);
    }
  }

  /**
   * Disconnects all of this tile's nodes
   */
  disconnect() {
    this.children.forEach(node => {
      node.disconnectAll();
      node.removeFromParent();
    })
  }

  /**
   * Gets a random node from this tile
   * @returns {VehicleGraphNode}
   */
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
   * Gets the nodes on the left side in the world frame
   * @returns {{ in: VehicleGraphNode, out: VehicleGraphNode }}
   */
  getWorldLeftSide() {
    switch (this.road.rotation) {
      case 90: return this.top;
      case 180: return this.right;
      case 270: return this.bottom;
      default: return this.left;
    }
  }

  /**
   * Gets the nodes on the right side in the world frame
   * @returns {{ in: VehicleGraphNode, out: VehicleGraphNode }}
   */
  getWorldRightSide() {
    switch (this.road.rotation) {
      case 90: return this.bottom;
      case 180: return this.left;
      case 270: return this.top;
      default: return this.right;
    }
  }

  /**
   * Gets the nodes on the top side in the world frame
   * @returns {{ in: VehicleGraphNode, out: VehicleGraphNode }}
   */
  getWorldTopSide() {
    switch (this.road.rotation) {
      case 90: return this.right;
      case 180: return this.bottom;
      case 270: return this.left;
      default: return this.top;
    }
  }

  /**
   * Gets the nodes on the bottom side in the world frame
   * @returns {{ in: VehicleGraphNode, out: VehicleGraphNode }}
   */
  getWorldBottomSide() {
    switch (this.road.rotation) {
      case 90: return this.left;
      case 180: return this.top;
      case 270: return this.right;
      default: return this.bottom;
    }
  }
}

export class EndRoadTile extends VehicleGraphTile {
  constructor(road) {
    super(road);

    this.name = `EndRoadTile (${this.position})`

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, halfTileSize),
      out: new VehicleGraphNode(-roadOffset, halfTileSize)
    };

    const midpoint = {
      in: new VehicleGraphNode(roadOffset, 0),
      out: new VehicleGraphNode(-roadOffset, 0)
    };

    this.add(this.bottom.in);
    this.add(this.bottom.out);
    this.add(midpoint.in);
    this.add(midpoint.out);

    // Connect together
    // Path #1: U-turn
    this.bottom.in.connect(midpoint.in);
    midpoint.in.connect(midpoint.out);
    midpoint.out.connect(this.bottom.out);
  }
}

export class StraightRoadTile extends VehicleGraphTile {
  constructor(road) {
    super(road);

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

    // Add to tile
    this.add(this.top.in);
    this.add(this.top.out);
    this.add(this.bottom.in);
    this.add(this.bottom.out);

    // Connect together
    // Path #1: Bottom -> Top
    this.bottom.in.connect(this.top.out);
    // Path #2: Top -> Bototm
    this.top.in.connect(this.bottom.out);
  }
}


export class CornerRoadTile extends VehicleGraphTile {
  constructor(road) {
    super(road);

    this.name = `CornerRoadTile (${this.position})`

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, halfTileSize),
      out: new VehicleGraphNode(-roadOffset, halfTileSize)
    };

    this.right = {
      in: new VehicleGraphNode(halfTileSize, -roadOffset),
      out: new VehicleGraphNode(halfTileSize, roadOffset)
    };

    const midpointBottomRight = new VehicleGraphNode(
      0.5 * halfTileSize - 1.5 * roadOffset, 
      0.5 * halfTileSize - 1.5 * roadOffset);

    const midpointTopLeft = new VehicleGraphNode(
      0.5 * halfTileSize - 3 * roadOffset,
      0.5 * halfTileSize - 3 * roadOffset);

    this.add(midpointBottomRight);
    this.add(midpointTopLeft);
    this.add(this.right.in);
    this.add(this.right.out);
    this.add(this.bottom.in);
    this.add(this.bottom.out);

    // Connect together
    // Path #1: Bottom -> Right
    this.bottom.in.connect(midpointBottomRight);
    midpointBottomRight.connect(this.right.out);
    // Path #2: Right -> Bottom
    this.right.in.connect(midpointTopLeft);
    midpointTopLeft.connect(this.bottom.out);
  }
}


export class ThreeWayRoadTile extends VehicleGraphTile {
  constructor(road) {
    super(road);

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

    // Connect midpoints
    midpointBottomLeft.connect(midpointBottomRight);
    midpointBottomRight.connect(midpointTopRight);
    midpointTopRight.connect(midpointTopLeft);
    midpointTopLeft.connect(midpointBottomLeft);

    // Connect inputs to midpoints
    this.left.in.connect(midpointBottomLeft);
    this.right.in.connect(midpointTopRight);
    this.bottom.in.connect(midpointBottomRight);

    // Connect midpoints to outputs
    midpointBottomLeft.connect(this.bottom.out);
    midpointBottomRight.connect(this.right.out);
    midpointTopLeft.connect(this.left.out);
  }
}

export class FourWayRoadTile extends VehicleGraphTile {
  constructor(road) {
    super(road);

    this.name = `IntersectionRoadTile (${this.position})`

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

    this.top = {
      in: new VehicleGraphNode(-roadOffset, -halfTileSize),
      out: new VehicleGraphNode(roadOffset, -halfTileSize)
    };

    const midpointBottomLeft =  new VehicleGraphNode(-roadOffset, roadOffset);
    const midpointBottomRight = new VehicleGraphNode(roadOffset, roadOffset);
    const midpointTopLeft =  new VehicleGraphNode(-roadOffset, -roadOffset);
    const midpointTopRight =  new VehicleGraphNode(roadOffset, -roadOffset);

    // Add to tile
    this.add(this.left.in);
    this.add(this.left.out);
    this.add(this.right.in);
    this.add(this.right.out);
    this.add(this.bottom.in);
    this.add(this.bottom.out);
    this.add(this.top.in);
    this.add(this.top.out);
    this.add(midpointBottomLeft);
    this.add(midpointBottomRight);
    this.add(midpointTopLeft);
    this.add(midpointTopRight);

    // Connect midpoints
    midpointBottomLeft.connect(midpointBottomRight);
    midpointBottomRight.connect(midpointTopRight);
    midpointTopRight.connect(midpointTopLeft);
    midpointTopLeft.connect(midpointBottomLeft);

    // Connect inputs to midpoints
    this.left.in.connect(midpointBottomLeft);
    this.right.in.connect(midpointTopRight);
    this.bottom.in.connect(midpointBottomRight);
    this.top.in.connect(midpointTopLeft);

    // Connect midpoints to outputs
    midpointBottomLeft.connect(this.bottom.out);
    midpointBottomRight.connect(this.right.out);
    midpointTopRight.connect(this.top.out);
    midpointTopLeft.connect(this.left.out);
  }
}