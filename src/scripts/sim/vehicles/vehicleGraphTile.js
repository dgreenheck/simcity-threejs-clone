import * as THREE from 'three';
import { VehicleGraphNode } from './vehicleGraphNode.js';
import { RAD2DEG } from 'three/src/math/MathUtils.js';

const roadOffset = 0.05;
const tileOffset = 0.25;

export class VehicleGraphTile extends THREE.Group {
  constructor(x, y, rotation) {
    super();

    this.position.set(x, 0, y);
    this.rotation.set(0, rotation, 0);

    this.roadRotation = Math.round(rotation * RAD2DEG);

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
  }

  /**
   * Factory function for creating a road tile of a specified type
   * @param {number} x
   * @param {number} y
   * @param {number} rotation
   * @param {string} style 
   * @returns {VehicleGraphTile | null}
   */
  static create(x, y, rotation, style) {
    switch (style) {
      case 'end':
        return new EndRoadTile(x, y, rotation);
      case 'straight': 
        return new StraightRoadTile(x, y, rotation);
      case 'corner':
        return new CornerRoadTile(x, y, rotation);
      case 'three-way':
        return new ThreeWayRoadTile(x, y, rotation);
      case 'four-way':
        return new FourWayRoadTile(x, y, rotation);
      default:
        console.error(`Road type ${style} is not a known value`);
    }
  }

  /**
   * Disconnect the tile from the vehicle graph
   */
  disconnectAll() {
    for (let node of this.children) {
      node.disconnectAll();
      node.removeFromParent();
    }
  }

  /**
   * Get a random starting node for a vehicle
   * @returns {VehicleGraphNode}
   */
  getRandomNode() {
    const nodes = [];

    if (this.left.in) nodes.push(this.left.in);
    if (this.right.in) nodes.push(this.right.in);
    if (this.top.in) nodes.push(this.top.in);
    if (this.bottom.in) nodes.push(this.bottom.in);

    if (nodes.length > 0) {
      const i = Math.floor(nodes.length * Math.random());
      return nodes[i];
    } else {
      return null;
    }
  }

  getWorldLeftSide() {
    switch (this.roadRotation) {
      case 0: return this.left;
      case 90: return this.top;
      case 180: return this.right;
      case 270: return this.bottom;
      default: return this.left;
    }
  }

  getWorldRightSide() {
    switch (this.roadRotation) {
      case 0: return this.right;
      case 90: return this.bottom;
      case 180: return this.left;
      case 270: return this.top;
      default: return this.right;
    }
  }

  getWorldTopSide() {
    switch (this.roadRotation) {
      case 0: return this.top;
      case 90: return this.right;
      case 180: return this.bottom;
      case 270: return this.left;
      default: return this.top;
    }
  }

  getWorldBottomSide() {
    switch (this.roadRotation) {
      case 0: return this.bottom;
      case 90: return this.left;
      case 180: return this.top;
      case 270: return this.right;
      default: return this.bottom;
    }
  }
}

export class EndRoadTile extends VehicleGraphTile {
  constructor(x, y, rotation) {
    super(x, y, rotation);

    this.name = `EndRoadTile (${this.position})`

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, tileOffset),
      out: new VehicleGraphNode(-roadOffset, tileOffset)
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
  constructor(x, y, rotation) {
    super(x, y, rotation);

    this.name = `StraightRoadTile (${this.position})`

    // Create nodes
    this.top = {
      in: new VehicleGraphNode(-roadOffset, -tileOffset),
      out: new VehicleGraphNode(roadOffset, -tileOffset)
    };

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, tileOffset),
      out: new VehicleGraphNode(-roadOffset, tileOffset)
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
  constructor(x, y, rotation) {
    super(x, y, rotation);

    this.name = `CornerRoadTile (${this.position})`

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, tileOffset + 0.1),
      out: new VehicleGraphNode(-roadOffset, tileOffset + 0.1)
    };

    this.right = {
      in: new VehicleGraphNode(tileOffset + 0.1, -roadOffset),
      out: new VehicleGraphNode(tileOffset + 0.1, roadOffset)
    };

    const midpointBottomRight = new VehicleGraphNode(
      tileOffset - 1.5 * roadOffset, 
      tileOffset - 1.5 * roadOffset);

    const midpointTopLeft = new VehicleGraphNode(
      tileOffset - 3 * roadOffset,
      tileOffset - 3 * roadOffset);

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
  constructor(x, y, rotation) {
    super(x, y, rotation);

    this.name = `TeeRoadTile (${this.position})`

    // Create nodes
    this.left = {
      in: new VehicleGraphNode(-tileOffset, roadOffset),
      out: new VehicleGraphNode(-tileOffset, -roadOffset)
    };

    this.right = {
      in: new VehicleGraphNode(tileOffset, -roadOffset),
      out: new VehicleGraphNode(tileOffset, roadOffset)
    };

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, tileOffset),
      out: new VehicleGraphNode(-roadOffset, tileOffset)
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
  constructor(x, y, rotation) {
    super(x, y, rotation);

    this.name = `IntersectionRoadTile (${this.position})`

    // Create nodes
    this.left = {
      in: new VehicleGraphNode(-tileOffset, roadOffset),
      out: new VehicleGraphNode(-tileOffset, -roadOffset)
    };

    this.right = {
      in: new VehicleGraphNode(tileOffset, -roadOffset),
      out: new VehicleGraphNode(tileOffset, roadOffset)
    };

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, tileOffset),
      out: new VehicleGraphNode(-roadOffset, tileOffset)
    };

    this.top = {
      in: new VehicleGraphNode(-roadOffset, -tileOffset),
      out: new VehicleGraphNode(roadOffset, -tileOffset)
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