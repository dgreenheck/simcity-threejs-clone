import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Tile } from './tile.js';
import { Zone } from './buildings/zone.js';

export class AssetManager {
  #textureLoader = new THREE.TextureLoader();
  #gltfLoader = new GLTFLoader();
  #cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

  #models = {};

  /* Texture library */
  // Credit: https://opengameart.org/content/free-urban-textures-buildings-apartments-shop-fronts
  #textures = {
    'grass': this.#loadTexture('public/textures/grass.png'),
    'residential1': this.#loadTexture('public/textures/residential1.png'),
    'residential2': this.#loadTexture('public/textures/residential2.png'),
    'residential3': this.#loadTexture('public/textures/residential3.png'),
    'commercial1': this.#loadTexture('public/textures/commercial1.png'),
    'commercial2': this.#loadTexture('public/textures/commercial2.png'),
    'commercial3': this.#loadTexture('public/textures/commercial3.png'),
    'industrial1': this.#loadTexture('public/textures/industrial1.png'),
    'industrial2': this.#loadTexture('public/textures/industrial2.png'),
    'industrial3': this.#loadTexture('public/textures/industrial3.png'),
  };

  constructor() {
    this.#loadModels();
  }

  /**
   * Load models into the scene
   */
  #loadModels() {
    this.#gltfLoader.load(
      'public/models/under_construction.gltf',
      (gltf) => {
        const mesh = gltf.scene;
        mesh.scale.set(0.01, 0.01, 0.01);

        mesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      
        this.#models['underConstruction'] = mesh;
      });
  }

  /**
   * Creates a new mesh for a ground tile
   * @param {Tile} tile 
   * @returns {THREE.Mesh}
   */
  createGroundMesh(tile) {
    const material = new THREE.MeshLambertMaterial({ map: this.#textures.grass });
    const mesh = new THREE.Mesh(this.#cubeGeometry, material);
    mesh.userData = tile;
    mesh.position.set(tile.x, -0.5, tile.y);
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Creates a new building mesh
   * @param {Tile} tile The tile the building sits on
   * @returns {THREE.Mesh | null}
   */
  createBuildingMesh(tile) {
    if (!tile?.building) return null;

    switch (tile.building?.type) {
      case 'residential':
      case 'commercial':
      case 'industrial':
        return this.#createZoneMesh(tile);
      case 'road':
        return this.#createRoadMesh(tile);
      default:
        console.warn(`Mesh type ${tile.building?.type} is not recognized.`);
        return null;
    }
  }

  /**
   * Creates a new mesh for a zone
   * @param {Tile} tile The tile that the zone sits on
   * @returns {THREE.Mesh} A mesh object
   */
  #createZoneMesh(tile) {
    const zone = tile.building;

    // If zone is not yet developed, show it as under construction
    if (!zone.developed) {
      const mesh = this.#getModel('underConstruction');
      mesh.position.set(zone.x, 0.01, zone.y);
      return mesh;
    }

    const textureName = zone.type + zone.style;
    const topMaterial = this.#getTopMaterial();
    const sideMaterial = this.#getSideMaterial(textureName);

    if (zone.abandoned) {
      sideMaterial.color.setHex(0x555555);
    }

    let materialArray = [
      sideMaterial, // +X
      sideMaterial, // -X
      topMaterial, // +Y
      topMaterial, // -Y
      sideMaterial, // +Z
      sideMaterial, // -Z
    ];

    let mesh = new THREE.Mesh(this.#cubeGeometry, materialArray);
    mesh.userData = tile;
    mesh.scale.set(0.8, 0.8 * zone.level, 0.8);
    mesh.material.forEach(material => material.map?.repeat.set(1, zone.level));
    mesh.position.set(zone.x, 0.4 * zone.level, zone.y);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Creates a new mesh for a road tile
   * @param {Tile} tile The tile the road sits on
   * @returns {THREE.Mesh} A mesh object
   */
  #createRoadMesh(tile) {
    const road = tile.building;
    const material = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const mesh = new THREE.Mesh(this.#cubeGeometry, material);
    mesh.userData = tile;
    mesh.scale.set(1, 0.02, 1);
    mesh.position.set(road.x, 0.01, road.y);
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Loads the texture at the specified URL
   * @param {string} url 
   * @returns {THREE.Texture} A texture object
   */
  #loadTexture(url) {
    const tex = this.#textureLoader.load(url)
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  #getModel(modelName) {
    return this.#models[modelName].clone();
  }

  #getTopMaterial() {
    return new THREE.MeshLambertMaterial({ color: 0x555555 });
  }
  
  #getSideMaterial(textureName) {
    return new THREE.MeshLambertMaterial({ map: this.#textures[textureName].clone() })
  }
}