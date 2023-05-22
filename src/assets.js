import * as THREE from 'three';

let loader = new THREE.TextureLoader();

/* Geometry */
const cube = new THREE.BoxGeometry(1, 1, 1);

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

// Asset library
const assets = {
  'ground': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ map: textures.grass });
    const mesh = new THREE.Mesh(cube, material);
    mesh.userData = { x, y };
    mesh.position.set(x, -0.5, y);
    mesh.receiveShadow = true;
    return mesh;
  },
  'residential': (x, y, data) => createZoneMesh(x, y, data),
  'commercial': (x, y, data) => createZoneMesh(x, y, data),
  'industrial': (x, y, data) => createZoneMesh(x, y, data),
  'road': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const mesh = new THREE.Mesh(cube, material);
    mesh.userData = { x, y };
    mesh.scale.set(1, 0.02, 1);
    mesh.position.set(x, 0.01, y);
    mesh.receiveShadow = true;
    return mesh;
  }
}

function createZoneMesh(x, y, data) {
  const textureName = data.id + data.style;

  const topMaterial = getTopMaterial();
  const sideMaterial = getSideMaterial(textureName);
  let materialArray = [
    sideMaterial, // +X
    sideMaterial, // -X
    topMaterial, // +Y
    topMaterial, // -Y
    sideMaterial, // +Z
    sideMaterial, // -Z
  ];
  let mesh = new THREE.Mesh(cube, materialArray);
  mesh.userData = { x, y };
  mesh.scale.set(0.8, (data.height - 0.95) / 2, 0.8);
  mesh.material.forEach(material => material.map?.repeat.set(1, data.height - 1));
  mesh.position.set(x, (data.height - 0.95) / 4, y);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/* Texture library */
// Credit: https://opengameart.org/content/free-urban-textures-buildings-apartments-shop-front
function loadTexture(url) {
  const tex = loader.load(url)
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

const textures = {
  'residential1': loadTexture('public/textures/residential1.png'),
  'residential2': loadTexture('public/textures/residential2.png'),
  'residential3': loadTexture('public/textures/residential3.png'),
  'commercial1': loadTexture('public/textures/commercial1.png'),
  'commercial2': loadTexture('public/textures/commercial2.png'),
  'commercial3': loadTexture('public/textures/commercial3.png'),
  'industrial1': loadTexture('public/textures/industrial1.png'),
  'industrial2': loadTexture('public/textures/industrial2.png'),
  'industrial3': loadTexture('public/textures/industrial3.png'),
  'grass': loadTexture('public/textures/grass.png')
};

const getTopMaterial = () => new THREE.MeshLambertMaterial({ color: 0x555555 });
const getSideMaterial = (textureName) => new THREE.MeshLambertMaterial({ map: textures[textureName].clone() })