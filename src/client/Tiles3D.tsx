import * as THREE from 'three';
import { Tile3D } from './Tile3D';
import { Scene3D } from './Scene3D';
import { ITileChange } from '../sim/SimTiles';
import { IPoint2D } from '../sim/IPoint';

//import { BuildingType } from './buildings/buildingType.jsx';
//import { createBuilding } from './buildings/buildingFactory.jsx';
//import { VehicleGraph } from './vehicles/vehicleGraph.jsx';
//import { PowerService } from './services/power.jsx';
//import { Building } from './buildings/building.jsx';

export class Tiles3D {
    setSize(width: number, height: number) {
        if (width != this.width || height != this.height) {
            this.width = width;
            this.height = height;
            this.initTiles();
        }
    }

    clearCity() {
        for (let z = 0; z < this.height; z++) {
            for (let x = 0; x < this.width; x++) {
                // let tile = this.getTile({ x, z })!;
                // tile.floor.set('grass', 0)
                // tile?.building.clear();
            }
        }
    }

    root = new THREE.Group();
    width = 0;
    height = 0;
    simTime = 0;
    simMoney = 999;
    #tiles: Tile3D[][] = [];

    constructor(readonly scene: Scene3D) {
    }

    drawFrame(_now: number) {
    }


    init() {
        this.initTiles();
    }

    initTiles() {
        this.root.clear();
        this.#tiles = [];
        for (let z = 0; z < this.height; z++) {
            const row: Tile3D[] = [];
            for (let x = 0; x < this.width; x++) {
                const tile = new Tile3D(x, z);
                row.push(tile);
            }
            this.#tiles.push(row);
        }
        this.scene.onTilesResized();
    }

    getTile({ x, z: z }: IPoint2D): Tile3D {

        if (x === undefined || z === undefined ||
            x < 0 || z < 0 ||
            x >= this.width || z >= this.height) {
            throw Error(`Invalid tile ${x} ${z}`)
        } else {
            return this.#tiles[z][x];
        }
    }

    onTileChanged(tileChanged: ITileChange[]) {
        let scene = this.scene;
        for (let t of tileChanged) {
            let tile = this.getTile(t);
            tile.setFloor(scene, t.floor, t.orientation);
            if (t.building) tile.setContent(scene, t.building, t.buildingOrientation);
        }
        Object.values(this.scene.assetManager.fastMeshes).forEach(m => {
            m.instancedMesh.instanceMatrix.needsUpdate = true;
        })
    }

}