import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Tile } from './tile.js';

export class AssetManager {
  textureLoader = new THREE.TextureLoader();
  modelLoader = new GLTFLoader();

  textures = {
    'albedo': this.loadTexture('public/textures/atlas-albedo-LPEC.png'),
    'emission-day': this.loadTexture('public/textures/atlas-emission-LPEC.png'),
    'emission-night': this.loadTexture('public/textures/atlas-emission-night-LPEC.png'),
    'gradient': this.loadTexture('public/textures/atlas-gradient-LPEC.png'),
    'specular': this.loadTexture('public/textures/atlas-specular-LPEC.png'),
  };

  models = {};

  constructor(onLoad) {
    this.loadModel('residential', 'building-house-block.glb', 100 / 30);
    this.loadModel('grass', 'tile-plain_grass.glb', 1 / 30, true, false);
    this.loadModel('road', 'tile-road-intersection.glb', 100 / 30);

    this.onLoad = onLoad;
  }

  getModel(modelName) {
    const mesh = this.models[modelName].clone();
    // Clone materials so each object has a unique material
    // This is so we can set the modify the texture of each
    // mesh independently (e.g. highlight on mouse over,
    // abandoned buildings, etc.))
    mesh.material = mesh.material.clone();
    console.log(mesh);
    return mesh;
  }

  /**
   * Loads the texture at the specified URL
   * @param {string} url 
   * @returns {THREE.Texture} A texture object
   */
  loadTexture(url) {
    const texture = this.textureLoader.load(url)
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    return texture;
  }

  /**
   * Load models into the scene
   * @param {string} url The URL of the model to load
   */
  loadModel(name, filename, scale = 1, receiveShadow = true, castShadow = true) {
    this.modelLoader.load(`public/models/${filename}`, 
      (glb) => {
        /**
         * @type {THREE.Group}
         */
        let model = glb.scene.children[0].children[0];

        model.material = new THREE.MeshLambertMaterial({
          name: "customMaterial",
          map: this.textures.albedo,
          specularMap: this.textures.specular
        });

        model.position.set(0, 0, 0);
        model.scale.set(scale, scale, scale);
        model.receiveShadow = receiveShadow;
        model.castShadow = castShadow;
        this.models[name] = model;

        console.log(model);

        if (Object.keys(this.models).length === 3) {
          this.onLoad();
        }
      },
    (xhr) => {
      console.log(`${name} ${(xhr.loaded / xhr.total) * 100 }% loaded`);
    },
    (error) => {
      console.error(error);
    });
  }

  /**
   * Creates a new mesh for a ground tile
   * @param {Tile} tile 
   * @returns {THREE.Mesh}
   */
  createGroundMesh(tile) {
    const mesh = this.getModel('grass');
    mesh.userData = tile;
    mesh.position.set(tile.x, 0, tile.y);
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
        return this.createZoneMesh(tile);
      case 'road':
        return this.createRoadMesh(tile);
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
  createZoneMesh(tile) {
    const zone = tile.building;
    let mesh = this.getModel('residential');
    mesh.userData = tile;
    mesh.position.set(zone.x, 0, zone.y);
    return mesh;
  }

  /**
   * Creates a new mesh for a road tile
   * @param {Tile} tile The tile the road sits on
   * @returns {THREE.Mesh} A mesh object
   */
  createRoadMesh(tile) {
    const road = tile.building;
    const mesh = this.getModel('road');
    mesh.userData = tile;
    mesh.position.set(road.x, 0, road.y);
    return mesh;
  }
}