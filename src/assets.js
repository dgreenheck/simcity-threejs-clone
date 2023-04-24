import * as THREE from 'three';

// Common geometry definitions
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Library of game assets/meshes
const assets = { 
  'grass': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x339933 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'grass', x, y };
    mesh.position.set(x, -0.5, y);
    return mesh;
  },
  'residential': (x, y, height) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x55bb55 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'residential', x, y };
    mesh.scale.set(1, height, 1);
    mesh.position.set(x, height / 2, y);
    return mesh;
  },
  'commercial': (x, y, height) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x5555bb });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'commercial', x, y };
    mesh.scale.set(1, height, 1);
    mesh.position.set(x, height / 2, y);
    return mesh;
  },
  'industrial': (x, y, height) => {
    const material = new THREE.MeshLambertMaterial({ color: 0xbbbb55 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'industrial', x, y };
    mesh.scale.set(1, height, 1);
    mesh.position.set(x, height / 2, y);
    return mesh;
  },
  'road': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'road', x, y };
    mesh.scale.set(1, 0.1, 1);
    mesh.position.set(x, 0.05, y);
    return mesh;
  }
}

/**
 * Creates a new mesh from the specified `assetId`. The mesh is
 * positioned at the (`x`,`y`) coordinates.
 * @param {string} assetId 
 * @param {number} x 
 * @param {number} y 
 * @param {number} height
 * @returns {THREE.Mesh}
 */
export function createAssetInstance(assetId, x, y, height) {
  if (assetId in assets) {
    return assets[assetId](x, y, height);
  } else {
    console.warn(`Asset Id ${assetId} is not found.`);
    return undefined;
  }
}