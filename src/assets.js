import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cube = new THREE.BoxGeometry(1, 1, 1);

/**
 * Loads the texture at the specified URL
 * @param {string} url 
 * @returns {THREE.Texture} A texture object
 */
function loadTexture(url) {
  const tex = loader.load(url)
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Texture library */
// Credit: https://opengameart.org/content/free-urban-textures-buildings-apartments-shop-fronts
const textures = {
  'grass': loadTexture('public/textures/grass.png'),
  'residential1': loadTexture('public/textures/residential1.png'),
  'residential2': loadTexture('public/textures/residential2.png'),
  'residential3': loadTexture('public/textures/residential3.png'),
  'commercial1': loadTexture('public/textures/commercial1.png'),
  'commercial2': loadTexture('public/textures/commercial2.png'),
  'commercial3': loadTexture('public/textures/commercial3.png'),
  'industrial1': loadTexture('public/textures/industrial1.png'),
  'industrial2': loadTexture('public/textures/industrial2.png'),
  'industrial3': loadTexture('public/textures/industrial3.png'),

  getTopMaterial: () => {
    return new THREE.MeshLambertMaterial({ color: 0x555555 });
  },
  getSideMaterial: (textureName) => {
    return new THREE.MeshLambertMaterial({ map: textures[textureName].clone() })
  }
};

export function createAssetManager() {
  /**
   * Creates a new mesh for a ground tile
   * @param {number} coords The coordinates tile
   * @returns {THREE.Mesh} A mesh object
   */
  function createGroundMesh(coords) {
    const material = new THREE.MeshLambertMaterial({ map: textures.grass });
    const mesh = new THREE.Mesh(cube, material);
    mesh.userData = coords;
    mesh.position.set(coords.x, -0.5, coords.y);
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Creates a new mesh for a zone tile
   * @param {number} coords The coordinates tile
   * @param {{
   *  type: string,
   *  style: string,
   *  height: number
   * }} data Additional metadata for the tile
   * @returns {THREE.Mesh} A mesh object
   */
  function createZoneMesh(coords, data) {
    const textureName = data.type + data.style;

    const topMaterial = textures.getTopMaterial();
    const sideMaterial = textures.getSideMaterial(textureName);
    let materialArray = [
      sideMaterial, // +X
      sideMaterial, // -X
      topMaterial, // +Y
      topMaterial, // -Y
      sideMaterial, // +Z
      sideMaterial, // -Z
    ];

    let mesh = new THREE.Mesh(cube, materialArray);
    mesh.userData = coords;
    mesh.scale.set(0.8, 0.8 * data.height, 0.8);
    mesh.material.forEach(material => material.map?.repeat.set(1, data.height));
    mesh.position.set(coords.x, 0.4 * data.height, coords.y);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Creates a new mesh for a road tile
   * @param {number} coords The coordinates tile
   * @returns {THREE.Mesh} A mesh object
   */
  function createRoadMesh(coords) {
    const material = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const mesh = new THREE.Mesh(cube, material);
    mesh.userData = coords;
    mesh.scale.set(1, 0.02, 1);
    mesh.position.set(coords.x, 0.01, coords.y);
    mesh.receiveShadow = true;
    return mesh;
  }

  return {
    /**
     * Creates a new 3D asset
     * @param {string} type The type of the asset to create
   * @param {number} coords The coordinates tile
     * @param {object} data Additional metadata needed for creating the asset
     * @returns 
     */
    createMesh(type, coords, data) {
      switch (type) {
        case 'ground':
          return createGroundMesh(coords);
        case 'residential':
        case 'commercial':
        case 'industrial':
          return createZoneMesh(coords, data);
        case 'road':
          return createRoadMesh(coords);
        default:
          console.warn(`Mesh type ${type} is not recognized.`);
          return null;
      }
    }
  }
}