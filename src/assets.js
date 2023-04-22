import * as THREE from 'three';

const geometry = new THREE.BoxGeometry(1, 1, 1);

const assets = { 
  'grass': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x339933 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'grass', x, y };
    mesh.position.set(x, -0.5, y);
    return mesh;
  },
  'building-1': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ color: 0xbb5555 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'building-1', x, y };
    mesh.position.set(x, 0.5, y);
    return mesh;
  },
  'building-2': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ color: 0xbbbb55 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'building-2', x, y };
    mesh.scale.set(1, 2, 1);
    mesh.position.set(x, 1, y);
    return mesh;
  },
  'building-3': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x5555bb });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id: 'building-3', x, y };
    mesh.scale.set(1, 3, 1);
    mesh.position.set(x, 1.5, y);
    return mesh;
  }
}

export function createAssetInstance(assetId, x, y) {
  if (assetId in assets) {
    return assets[assetId](x, y);
  } else {
    console.warn(`Asset Id ${assetId} is not found.`);
    return undefined;
  }
}