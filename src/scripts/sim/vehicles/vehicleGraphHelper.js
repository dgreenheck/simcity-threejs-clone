import * as THREE from 'three';
import { VehicleGraph } from './vehicleGraph.js';
import { VehicleGraphNode } from './vehicleGraphNode.js';

const UP = new THREE.Vector3(0, 1, 0);

const NODE_GEOMETRY = new THREE.SphereGeometry(0.03, 6, 6);
const EDGE_GEOMETRY = new THREE.ConeGeometry(0.02, 1, 6);

const EDGE_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x5050ff });
const CONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const DISCONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xff0000 });

export class VehicleGraphHelper extends THREE.Group {
  constructor() {
    super();
    this.visible = false;
  }

  /**
   * 
   * @param {VehicleGraph} graph 
   */
  refreshView(graph) {
    this.clear();

    for (let x = 0; x < graph.size; x++) {
      for (let y = 0; y < graph.size; y++) {
        const tile = graph.getTile(x, y);

        if (!tile) continue;

        for (const node of tile.children) {
          this.createNodeVisualization(node);
        }
      }
    }
  }

  /**
   * 
   * @param {VehicleGraphNode} node 
   */
  createNodeVisualization(node) {
    const nodeMesh = new THREE.Mesh(
      NODE_GEOMETRY,
      node.next.length > 0 ? CONNECTED_MATERIAL : DISCONNECTED_MATERIAL
    );

    const nodeWorldPosition = new THREE.Vector3();
    node.getWorldPosition(nodeWorldPosition);

    nodeMesh.position.set(
      nodeWorldPosition.x,
      nodeWorldPosition.y,
      nodeWorldPosition.z
    );

    // Add edge visualizations for the connected nodes
    if(node.next.length > 0) {
      for (const next of node.next) {
        // Get world position of the next node
        const nextWorldPosition = new THREE.Vector3();
        next.getWorldPosition(nextWorldPosition);

        const edgeVector = new THREE.Vector3();
        edgeVector.copy(nextWorldPosition);
        edgeVector.sub(nodeWorldPosition);

        const distance = edgeVector.length();

        const edgeMesh = new THREE.Mesh(
          EDGE_GEOMETRY,
          EDGE_MATERIAL
        );

        edgeMesh.scale.set(1, distance, 1);
        
        edgeMesh.quaternion.setFromUnitVectors(
          UP,
          edgeVector.clone().normalize()
        );
        
        const offset = new THREE.Vector3(0, distance / 2, 0)
          .applyQuaternion(edgeMesh.quaternion.clone());

        edgeMesh.position.set(
          nodeWorldPosition.x + offset.x,
          nodeWorldPosition.y + offset.y,
          nodeWorldPosition.z + offset.z
        );

        this.add(edgeMesh);
      }
    }

    this.add(nodeMesh);
  }
}