import * as THREE from 'three';
import viteConfig from '../../vite.config';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Tile } from './tile.js';
import models from './models.js';

const baseUrl = viteConfig.base;
const DEG2RAD = Math.PI / 180.0;

export class AssetManager {
  textureLoader = new THREE.TextureLoader();
  modelLoader = new GLTFLoader();

  textures = {
    'base': this.loadTexture(`${baseUrl}textures/base.png`),
    'specular': this.loadTexture(`${baseUrl}textures/specular.png`),
    'grid': this.loadTexture(`${baseUrl}textures/grid.png`)
  };

  meshes = {};

  constructor(onLoad) {
    this.modelCount = Object.keys(models).length;
    this.loadedModelCount = 0;

    for (const [name, meta] of Object.entries(models)) {

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
    const mesh = this.cloneMesh('grass', false);
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

    let modelName = `${zone.type}-${zone.style}${zone.level}`;
    if (zone.developed) {
      // TODO  modelName = 'under-construction';
    }
     
    let mesh = this.cloneMesh(modelName);
    mesh.userData = tile;
    mesh.rotation.set(0, zone.rotation * DEG2RAD, 0);
    mesh.position.set(zone.x, 0, zone.y);

    // Tint building a dark color if it is abandoned
    if (zone.abandoned) {
      mesh.material.color = new THREE.Color(0x707070);
    }
    
    return mesh;
  }

  /**
   * Creates a new mesh for a road tile
   * @param {Tile} tile The tile the road sits on
   * @returns {THREE.Mesh} A mesh object
   */
  createRoadMesh(tile) {
    const road = tile.building;
    const mesh = this.cloneMesh(`${road.type}-${road.style}`);
    mesh.userData = tile;
    mesh.rotation.set(0, road.rotation * DEG2RAD, 0);
    mesh.position.set(road.x, 0, road.y);
    return mesh;
  }

  /**
   * Creates a new random vehicle mesh
   * @returns {THREE.Mesh} A mesh object
   */
  createRandomVehicleMesh() {
    const types = Object.entries(models)
      .filter(x => x[1].type === 'vehicle')
      .map(x => x[0]);

    const i = Math.floor(types.length * Math.random());
    return this.cloneMesh(types[i], true);
  }

  /**
   * Returns a cloned copy of a mesh
   * @param {string} name The name of the mesh to retrieve
   * @param {boolean} transparent True if materials should be transparent. Default is false.
   * @returns {THREE.Mesh}
   */
  cloneMesh(name, transparent = false) {
    const mesh = this.meshes[name].clone();

    // Clone materials so each object has a unique material
    // This is so we can set the modify the texture of each
    // mesh independently (e.g. highlight on mouse over,
    // abandoned buildings, etc.))
    mesh.traverse((obj) => {
      if(obj.material) {
        obj.material = obj.material.clone();
        obj.material.transparent = transparent;
      }
    });

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
  loadModel(name, {filename, scale = 1, rotation = 0, receiveShadow = true, castShadow = true}) {
    this.modelLoader.load(`${baseUrl}models/${filename}`,
      (glb) => {
        let mesh = glb.scene.children[0].children[0];

        mesh.traverse((node) => {
          node.material = new THREE.MeshLambertMaterial({
            map: this.textures.base,
            specularMap: this.textures.specular
          })
        });

        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, THREE.MathUtils.degToRad(rotation), 0);
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
        //console.log(`${name} ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error(error);
      });
  }
}