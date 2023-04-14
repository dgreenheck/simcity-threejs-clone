import * as THREE from 'three';

const box = new THREE.BoxGeometry(1, 1, 1);

function createMesh(name, geometry, hexColor) {
  const material = new THREE.MeshLambertMaterial({ color: hexColor });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  return mesh;
}

const meshes = {
  'grass': (x, y) => {
    const mesh = createMesh('grass', box, 0x33aa44);
    mesh.scale.set(1, 1, 1);
    mesh.position.set(x, -0.5, y);
    return mesh;
  },
  'building-1': (x, y) => {
    const mesh = createMesh('building-1', box, 0x444444);
    mesh.scale.set(1, 1, 1);
    mesh.position.set(x, 0.5, y);
    return mesh;
  },
  'building-2': (x, y) => {
    const mesh = createMesh('building-2', box, 0x888888);
    mesh.scale.set(1, 2, 1);
    mesh.position.set(x, 1, y);
    return mesh;
  },
  'building-3': (x, y) => {
    const mesh = createMesh('building-3', box, 0xaaaaaa);
    mesh.scale.set(1, 3, 1);
    mesh.position.set(x, 1.5, y);
    return mesh;
  }
}

export const loadMesh = (id, x, y) => meshes[id](x, y);