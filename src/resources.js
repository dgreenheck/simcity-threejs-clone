import * as THREE from 'three';

const box = new THREE.BoxGeometry(1, 1, 1);
const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x33aa44 });
const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x777777 });

const meshes = {
  'grass': (x, y) => {
    const mesh = new THREE.Mesh(box, grassMaterial);
    mesh.name = 'grass';
    mesh.scale.set(1, 1, 1);
    mesh.position.set(x, -0.5, y);
    return mesh;
  },
  'building-1': (x, y) => {
    const mesh = new THREE.Mesh(box, buildingMaterial);
    mesh.name = 'building-1';
    mesh.scale.set(1, 1, 1);
    mesh.position.set(x, 0.5, y);
    return mesh;
  },
  'building-2': (x, y) => {
    const mesh = new THREE.Mesh(box, buildingMaterial);
    mesh.name = 'building-2';
    mesh.scale.set(1, 2, 1);
    mesh.position.set(x, 1, y);
    return mesh;
  },
  'building-3': (x, y) => {
    const mesh = new THREE.Mesh(box, buildingMaterial);
    mesh.name = 'building-3';
    mesh.scale.set(1, 3, 1);
    mesh.position.set(x, 1.5, y);
    return mesh;
  }
}

export const loadMesh = (id, x, y) => meshes[id](x, y);