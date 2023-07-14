import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Tile } from './tile.js';
import models from './models.js';

const DEG2RAD = Math.PI / 180.0;

export class AssetManager {
  textureLoader = new THREE.TextureLoader();
  modelLoader = new GLTFLoader();

  textures = {
    'base': this.loadTexture('public/textures/base.png'),
    'specular': this.loadTexture('public/textures/specular.png'),
  };

  meshes = {};

  constructor(onLoad) {
    this.modelCount = Object.keys(models).length;
    this.loadedModelCount = 0;

    for (const [name, meta] of Object.entries(models)) {
      console.log(meta);
      this.loadModel(name, meta);
    }

    this.onLoad = onLoad;
  }

  /**
   * Creates a new mesh for a ground tile
   * @param {Tile} tile 
   * @returns {THREE.Mesh}
   */
  createGroundMesh(tile) {
    const mesh = this.getMesh('grass', false);
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
    const modelName = `${zone.type}-${zone.style}${zone.level}`;
    let mesh = this.getMesh(modelName);
    mesh.userData = tile;
    mesh.rotation.set(0, zone.rotation * DEG2RAD, 0);
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
    const mesh = this.getMesh(`${road.type}-${road.style}`);
    mesh.userData = tile;
    mesh.rotation.set(0, road.rotation * DEG2RAD, 0);
    mesh.position.set(road.x, 0, road.y);
    return mesh;
  }
  
  /**
   * Gets a mesh with the specified name. Clones the mesh/material data
   * @param {string} name The name of the mesh to retrieve
   * @returns {THREE.Mesh}
   */
  getMesh(name) {
    const mesh = this.meshes[name].clone();
    // Clone materials so each object has a unique material
    // This is so we can set the modify the texture of each
    // mesh independently (e.g. highlight on mouse over,
    // abandoned buildings, etc.))
    mesh.material = mesh.material.clone();
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
   * Load the 3D models
   * @param {string} url The URL of the model to load
   */
  loadModel(name, {filename, scale = 1, receiveShadow = true, castShadow = true}) {
    this.modelLoader.load(`public/models/${filename}`,
      (glb) => {
        let mesh = glb.scene.children[0].children[0];

        mesh.material = new THREE.MeshLambertMaterial({
          map: this.textures.base,
          specularMap: this.textures.specular
        });

        mesh.position.set(0, 0, 0);
        mesh.scale.set(scale / 30, scale / 30, scale / 30);
        mesh.receiveShadow = receiveShadow;
        mesh.castShadow = castShadow;

        this.meshes[name] = mesh;

        // Once all models are loaded
        this.loadedModelCount++;
        if (this.loadedModelCount == this.modelCount) {
          this.onLoad()
        }
      },
      (xhr) => {
        console.log(`${name} ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error(error);
      });
  }
}