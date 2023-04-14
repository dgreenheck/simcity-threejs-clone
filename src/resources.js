import * as THREE from 'three';

const box = new THREE.BoxGeometry(1, 1, 1);

const meshes = {
  'grass': (x, y) => {
    const mesh = new THREE.Mesh(box, new THREE.MeshLambertMaterial({ color: 0x33aa44 }));
    mesh.name = 'grass';
    mesh.userData = { x, y }
    mesh.scale.set(1, 1, 1);
    mesh.position.set(x, -0.5, y);
    return mesh;
  },
  'building-1': (x, y) => {
    const mesh = new THREE.Mesh(box, new THREE.MeshLambertMaterial({ color: 0x777777 }));
    mesh.name = 'building-1';
    mesh.userData = { x, y }
    mesh.scale.set(1, 1, 1);
    mesh.position.set(x, 0.5, y);
    return mesh;
  },
  'building-2': (x, y) => {
    const mesh = new THREE.Mesh(box, new THREE.MeshLambertMaterial({ color: 0x777777 }));
    mesh.name = 'building-2';
    mesh.userData = { x, y }
    mesh.scale.set(1, 2, 1);
    mesh.position.set(x, 1, y);
    return mesh;
  },
  'building-3': (x, y) => {
    const mesh = new THREE.Mesh(box, new THREE.MeshLambertMaterial({ color: 0x777777 }));
    mesh.name = 'building-3';
    mesh.userData = { x, y }
    mesh.scale.set(1, 3, 1);
    mesh.position.set(x, 1.5, y);
    return mesh;
  }
}

export const loadMesh = (id, x, y) => meshes[id](x, y);