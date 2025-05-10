import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { appConstants } from '../AppConstants';
import { Scene3D } from './Scene3D';

export interface IAssetMeta {
  type: 'zone' | 'road' | 'vehicle' | 'power' | "terrain",
  filename: string;
  scale?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  rotation?: number;
}

const ZERO_VECTOR = new THREE.Vector3(0, 0, 0);
const IDENTITY_QUATERNION = new THREE.Quaternion();
const HIDE_MATRIX = new THREE.Matrix4().compose(
  new THREE.Vector3(0, -1e5, 0),
  IDENTITY_QUATERNION,
  ZERO_VECTOR
);

const modelsMetaData = {
  "under-construction": {
    "type": "zone",
    "filename": "construction-small.glb",
    "scale": 3
  },
  "residential-A1": {
    "type": "zone",
    "filename": "building-house-block-big.glb"
  },
  "residential-B1": {
    "type": "zone",
    "filename": "building-house-family-small.glb"
  },
  "residential-C1": {
    "type": "zone",
    "filename": "building-house-family-large.glb"
  },
  "residential-A2": {
    "type": "zone",
    "filename": "building-block-4floor-short.glb",
  },
  "residential-B2": {
    "type": "zone",
    "filename": "building-block-4floor-corner.glb",
  },
  "residential-C2": {
    "type": "zone",
    "filename": "building-block-5floor.glb",
  },
  "residential-A3": {
    "type": "zone",
    "filename": "building-office-balcony.glb"
  },
  "residential-B3": {
    "type": "zone",
    "filename": "building-office-pyramid.glb"
  },
  "residential-C3": {
    "type": "zone",
    "filename": "building-office-tall.glb"
  },
  "commercial-A1": {
    "type": "zone",
    "filename": "building-cafe.glb"
  },
  "commercial-B1": {
    "type": "zone",
    "filename": "building-burger-joint.glb"
  },
  "commercial-C1": {
    "type": "zone",
    "filename": "building-restaurant.glb"
  },
  "commercial-A2": {
    "type": "zone",
    "filename": "building-cinema.glb"
  },
  "commercial-B2": {
    "type": "zone",
    "filename": "building-casino.glb"
  },
  "commercial-C2": {
    "type": "zone",
    "filename": "data-center.glb"
  },
  "commercial-A3": {
    "type": "zone",
    "filename": "building-office.glb"
  },
  "commercial-B3": {
    "type": "zone",
    "filename": "building-office-big.glb"
  },
  "commercial-C3": {
    "type": "zone",
    "filename": "building-skyscraper.glb"
  },
  "industrial-A1": {
    "type": "zone",
    "filename": "industry-factory.glb"
  },
  "industrial-B1": {
    "type": "zone",
    "filename": "industry-refinery.glb"
  },
  "industrial-C1": {
    "type": "zone",
    "filename": "industry-warehouse.glb"
  },
  "industrial-A2": {
    "type": "zone",
    "filename": "industry-factory.glb"
  },
  "industrial-B2": {
    "type": "zone",
    "filename": "industry-refinery.glb"
  },
  "industrial-C2": {
    "type": "zone",
    "filename": "industry-warehouse.glb"
  },
  "industrial-A3": {
    "type": "zone",
    "filename": "industry-factory.glb"
  },
  "industrial-B3": {
    "type": "zone",
    "filename": "industry-refinery.glb"
  },
  "industrial-C3": {
    "type": "zone",
    "filename": "industry-warehouse.glb"
  },
  "power-plant": {
    "type": "power",
    "filename": "industry-factory-old.glb"
  },
  "power-line": {
    "type": "power",
    "filename": "power_line_pole_modified.glb"
  },
  "road-straight": {
    "type": "road",
    "filename": "tile-road-straight.glb",
    "castShadow": false
  },
  "road-end": {
    "type": "road",
    "filename": "tile-road-end.glb",
    "castShadow": false
  },
  "road-corner": {
    "type": "road",
    "filename": "tile-road-curve.glb",
    "castShadow": false
  },
  "road-three-way": {
    "type": "road",
    "filename": "tile-road-intersection-t.glb",
    "castShadow": false
  },
  "road-four-way": {
    "type": "road",
    "filename": "tile-road-intersection.glb",
    "castShadow": false
  },
  "grass": {
    "type": "terrain",
    "filename": "tile-plain_grass.glb",
    "castShadow": false
  },
  "car-taxi": {
    "type": "vehicle",
    "filename": "car-taxi.glb",
    "rotation": 90
  },
  "car-police": {
    "type": "vehicle",
    "filename": "car-police.glb",
    "rotation": 90
  },
  "car-passenger": {
    "type": "vehicle",
    "filename": "car-passenger.glb",
    "rotation": 90
  },
  "car-veteran": {
    "type": "vehicle",
    "filename": "car-veteran.glb",
    "rotation": 90
  },
  "truck": {
    "type": "vehicle",
    "filename": "truck.glb",
    "rotation": 90
  },
  "car-hippie-van": {
    "type": "vehicle",
    "filename": "car-hippie-van.glb",
    "rotation": 90
  },
  "car-tow-truck": {
    "type": "vehicle",
    "filename": "car-tow-truck.glb",
    "rotation": 90
  },
  "car-ambulance-pickup": {
    "type": "vehicle",
    "filename": "car-ambulance-pickup.glb",
    "rotation": 90
  },
  "car-passenger-race": {
    "type": "vehicle",
    "filename": "car-passenger-race.glb",
    "rotation": 90
  },
  "car-baywatch": {
    "type": "vehicle",
    "filename": "car-baywatch.glb",
    "rotation": 90
  },
  "car-truck-dump": {
    "type": "vehicle",
    "filename": "car-truck-dump.glb",
    "rotation": 90
  },
  "car-truck-armored-truck": {
    "type": "vehicle",
    "filename": "armored-truck.glb",
    "rotation": 90
  }
} satisfies Record<string, IAssetMeta>;

export const cars: ModelName[] = ["car-ambulance-pickup", "car-baywatch", "car-hippie-van", "car-passenger-race", "car-passenger", "car-police", "car-taxi", "car-tow-truck", "car-truck-armored-truck", "car-truck-dump", "car-veteran", "truck"];
export const commercialBuildings: ModelName[] = ["commercial-A1", "commercial-A2", "commercial-A3", "commercial-B1", "commercial-B2", "commercial-B3", "commercial-C1", "commercial-C2", "commercial-C3"];
export const otherTiles: ModelName[] = ["grass", "power-line", "under-construction"]
export const industrialBuildings: ModelName[] = ["industrial-A1", "industrial-A2", "industrial-A3", "industrial-B1", "industrial-B2", "industrial-B3", "industrial-C1", "industrial-C2", "industrial-C3", "power-plant"];
export const residentialBuildings: ModelName[] = ["residential-A1", "residential-A2", "residential-A3", "residential-B1", "residential-B2", "residential-B3", "residential-C1", "residential-C2", "residential-C3"]
export const roads: ModelName[] = ["road-corner", "road-end", "road-four-way", "road-straight", "road-three-way"];

export type ModelName = keyof typeof modelsMetaData;

let assetsBaseUrl = appConstants.AssetsBaseUrl;

interface IFastMeshes {
  modelName: ModelName;
  geometry: any,
  material: any;
  instancedMesh: THREE.InstancedMesh;
  index: number;
  count: number;
}

export interface IFastMesh {
  parent: IFastMeshes;
  index: number;
  rotation: number;
}

export interface IAssetOptions {
  zOffset: number;

}

export class AssetManager {
  textureLoader = new THREE.TextureLoader();
  modelLoader = new GLTFLoader();

  textures = {
    'base': this.#loadTexture(`${assetsBaseUrl}textures/base.png`),
    'specular': this.#loadTexture(`${assetsBaseUrl}textures/specular.png`),
    'grid': this.#loadTexture(`${assetsBaseUrl}textures/grid.png`),

  };

  // statusIcons = {
  //   'no-power': this.#loadTexture(`${assetsBaseUrl}statusIcons/no-power.png`, true),
  //   'no-road-access': this.#loadTexture(`${assetsBaseUrl}statusIcons/no-road-access.png`, true)
  // }

  models: Record<ModelName, THREE.Mesh> = {} as any;
  fastMeshes: Record<string, IFastMeshes> = {};

  sprites = {};
  modelCount!: number;
  loadedModelCount!: number;

  constructor(readonly scene: Scene3D) {
  }

  async init() {
    this.modelCount = Object.keys(modelsMetaData).length;
    this.loadedModelCount = 0;

    await Promise.all(Object.entries(modelsMetaData).map(async ([name, meta]) => {
      const model = await this.#loadModel(meta);
      this.models[name as ModelName] = model;
      this.loadedModelCount += 1;
    }));

  }

  addFastMesh(modelName: ModelName, x: number, y: number, z: number, rotation: number, options?: IAssetOptions): IFastMesh {
    let fastMeshes = this.fastMeshes[modelName];
    if (!fastMeshes) {
      fastMeshes = this.#createFastMesh(modelName, fastMeshes, options);

    }
    if (fastMeshes.index >= fastMeshes.count) {
      this.#growFastMesh(fastMeshes);
    }
    let result: IFastMesh = {
      rotation,
      parent: fastMeshes,
      index: fastMeshes.index++
    };
    this.moveFastMesh(result, x, y, z, rotation);
    return result;
  }

  removeFastMesh(fastMesh: IFastMesh) {
    // we swap the last instancedMesh with the one we just clear
    // not tested
    let fastMeshes = fastMesh.parent;
    let lastInstance = fastMeshes.count - 1;
    let tempMatrix = new THREE.Matrix4();
    let instancedMesh = fastMeshes.instancedMesh;
    if (fastMesh.index !== lastInstance) {
      instancedMesh.getMatrixAt(lastInstance, tempMatrix);
      instancedMesh.setMatrixAt(fastMesh.index, tempMatrix);
    }
    instancedMesh.setMatrixAt(lastInstance, HIDE_MATRIX);
    fastMeshes.count -= 1;
  }

  #createFastMesh(modelName: ModelName, fastMeshes: IFastMeshes, options?: IAssetOptions) {
    let originalMesh = this.models[modelName];
    let actualMesh = originalMesh as any;
    let { geometry, material } = actualMesh;
    if (!geometry || !material) {
      // we need a mesh with material in order to use InstancedMesh
      originalMesh.updateMatrixWorld();
      const merged = mergeMeshesWithGroups(actualMesh);
      geometry = merged.geometry;
      material = merged.materials;
    }
    if (options && options.zOffset) {
      geometry.translate(0,0,options.zOffset);
    }

    let count = appConstants.MeshInstancesMin;
    fastMeshes = {
      modelName,
      instancedMesh: new THREE.InstancedMesh(geometry, material, count),
      count,
      geometry,
      material,
      index: 0
    };

    this.#clearFastMeshes(fastMeshes, 1);

    this.scene.scene.add(fastMeshes.instancedMesh);
    this.fastMeshes[modelName] = fastMeshes;
    return fastMeshes;
  }

  #clearFastMeshes(fastMeshes: IFastMeshes, from: number) {
    for (let i = from; i < fastMeshes.count; i++) {
      fastMeshes.instancedMesh.setMatrixAt(i, HIDE_MATRIX);
    }
    fastMeshes.instancedMesh.frustumCulled = false;
  }

  #growFastMesh(fastMeshes: IFastMeshes) {
    fastMeshes.count = Math.floor(fastMeshes.count * appConstants.MeshInstancesGrowth);
    let oldMesh = fastMeshes.instancedMesh;
    let newMesh = fastMeshes.instancedMesh = new THREE.InstancedMesh(oldMesh.geometry, oldMesh.material, fastMeshes.count);
    let tempMatrix = new THREE.Matrix4();
    for (let i = 0; i < oldMesh.count; i++) {
      oldMesh.getMatrixAt(i, tempMatrix);
      newMesh.setMatrixAt(i, tempMatrix);
    }
    this.#clearFastMeshes(fastMeshes, oldMesh.count)
    this.scene.scene.remove(oldMesh);
    this.scene.scene.add(newMesh);
  }

  moveFastMesh(fastMesh: IFastMesh, x: number, y: number = 0, z: number, rotation?: number) {
    const matrix = new THREE.Matrix4();
    const pos = new THREE.Vector3(x, y, z);
    const rot = rotation ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation) : new THREE.Quaternion();
    matrix.compose(pos, rot, new THREE.Vector3(1, 1, 1));
    fastMesh.parent.instancedMesh.setMatrixAt(fastMesh.index, matrix);
    fastMesh.parent.instancedMesh.instanceMatrix.needsUpdate = true;
  }



  /** Loads the texture at the specified URL   */
  #loadTexture(url: string, flipY = false) {
    const texture = this.textureLoader.load(url)
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = flipY;
    return texture;
  }

  /** Load the 3D models  */
  async #loadModel(meta: IAssetMeta): Promise<THREE.Mesh> {
    let filename = meta.filename;
    let receiveShadow = meta.receiveShadow ?? false;
    let castShadow = meta.castShadow ?? true;
    let scale = meta.scale ?? 1
    let rotation = meta.rotation ?? 0

    return new Promise((resolve, reject) => {
      this.modelLoader.load(`${assetsBaseUrl}models/${filename}`,
        (glb) => {
          let mesh: THREE.Mesh = glb.scene! as any;

          mesh.name = filename;

          mesh.traverse((obj: any) => {
            //if (obj.material) {
            obj.material = new THREE.MeshLambertMaterial({
              map: this.textures.base,
              specularMap: this.textures.specular
            })
            obj.receiveShadow = receiveShadow;
            obj.castShadow = castShadow;
            //}
          });

          mesh.rotation.set(0, THREE.MathUtils.degToRad(rotation), 0);
          mesh.scale.set(scale / 30, scale / 30, scale / 30);


          resolve(mesh);
        },
        (_xhr: any) => {
          //console.log(`${name} ${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
          console.error(error);
          reject(error)
        });
    })

  }
}


function mergeMeshesWithGroups(object: THREE.Object3D): { geometry: THREE.BufferGeometry, materials: THREE.Material[] } {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const materialIndexMap = new Map<THREE.Material, number>();
  let groupOffset = 0;

  object.traverse((child: any) => {
    if (child.isMesh && child.geometry && child.material) {
      const geom = child.geometry.clone();
      geom.applyMatrix4(child.matrixWorld);

      let matIndex = materialIndexMap.get(child.material);
      if (matIndex === undefined) {
        matIndex = materials.length;
        materials.push(child.material);
        materialIndexMap.set(child.material, matIndex);
      }

      geom.groups.forEach((g: any) => {
        geom.addGroup(g.start + groupOffset, g.count, matIndex!);
      });

      if (geom.groups.length === 0) {
        geom.addGroup(0 + groupOffset, geom.index?.count || geom.attributes.position.count, matIndex!);
      }

      groupOffset += geom.index?.count || geom.attributes.position.count;
      geometries.push(geom);
    }
  });

  const merged = BufferGeometryUtils.mergeGeometries(geometries, true);
  return { geometry: merged, materials };
}
