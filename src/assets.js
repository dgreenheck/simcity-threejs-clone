import * as THREE from 'three';

const geometry = new THREE.BoxGeometry(1, 1, 1);

// Asset library
const assets = { 
  'grass': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x339933 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'grass', x, y };
    mesh.position.set(x, -0.5, y);
    return mesh;
  },
  'residential': (x, y, data) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'residential', x, y };
    mesh.scale.set(1, data.height, 1);
    mesh.position.set(x, data.height / 2, y);
    return mesh;
  },
  'commercial': (x, y, data) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'commercial', x, y };
    mesh.scale.set(1, data.height, 1);
    mesh.position.set(x, data.height / 2, y);
    return mesh;
  },
  'industrial': (x, y, data) => {
    const material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'industrial', x, y };
    mesh.scale.set(1, data.height, 1);
    mesh.position.set(x, data.height / 2, y);
    return mesh;
  },
  'road': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x4444440 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'road', x, y };
    mesh.scale.set(1, 0.1, 1);
    mesh.position.set(x, 0.05, y);
    return mesh;
  }
}

/**
 * Creates a new 3D asset
 * @param {string} assetId The id of the asset to create
 * @param {number} x The x-coordinate of the asset
 * @param {number} y The y-coordinate of the asset
 * @param {object} data Additional metadata needed for creating the asset
 * @returns 
 */
export function createAssetInstance(assetId, x, y, data) {
  // If asset exists, configure it and return it
  if (assetId in assets) {
    return assets[assetId](x, y, data);
  } else {
    console.warn(`Asset Id ${assetId} is not found.`);
    return undefined;
  }
}