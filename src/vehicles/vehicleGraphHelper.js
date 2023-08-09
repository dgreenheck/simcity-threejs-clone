import * as THREE from 'three';
import { VehicleGraph } from './vehicleGraph.js';
import { VehicleGraphNode } from './vehicleGraphNode.js';

const NODE_GEOMETRY = new THREE.SphereGeometry(0.03, 6, 6);
const EDGE_GEOMETRY = new THREE.ConeGeometry(0.02, 1, 6);

const CONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const DISCONNECTED_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const EDGE_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x000ff});

export class VehicleGraphHelper extends THREE.Group {
  /**
   * Updates the visualization of the vehicle graph
   * @param {VehicleGraph} graph 
   */
  update(graph) {
    this.clear();

    if (!graph) return;

    for (let x = 0; x < graph.size; x++) {
      for (let y = 0; y < graph.size; y++) {
        const tile = graph.getTile(x, y);

        if (!tile) continue;

        for (const node of tile.children) {
          this.createGraphNode(node)
        }
      }
    }
  }

  /**
   * 
   * @param {VehicleGraphNode} node 
   */
  createGraphNode(node) {
    const nodeMesh = new THREE.Mesh(
      NODE_GEOMETRY, 
      node.next.length > 0 ? CONNECTED_MATERIAL : DISCONNECTED_MATERIAL
    );

    const nodeWorldPos = new THREE.Vector3();
    node.getWorldPosition(nodeWorldPos);

    nodeMesh.position.set(
      nodeWorldPos.x, 
      nodeWorldPos.y, 
      nodeWorldPos.z);
    
    if(node.next.length > 0) {
      for (const nextNode of node.next) {
        const edgeVector = new THREE.Vector3();
        nextNode.getWorldPosition(edgeVector);
        edgeVector.sub(nodeWorldPos);
        const distance = edgeVector.length();
        
        const up = new THREE.Vector3(0, 1, 0);

        const edge = new THREE.Mesh(EDGE_GEOMETRY, EDGE_MATERIAL);
        edge.scale.set(1, distance, 1);
        edge.quaternion.setFromUnitVectors(up, edgeVector.clone().normalize());

        const offset = new THREE.Vector3(0, distance / 2, 0).applyQuaternion(edge.quaternion.clone());
        edge.position.set(
          nodeWorldPos.x + offset.x,
          nodeWorldPos.y + offset.y, 
          nodeWorldPos.z + offset.z);

        this.add(edge);
      }
    }

    this.add(nodeMesh);
  }
}