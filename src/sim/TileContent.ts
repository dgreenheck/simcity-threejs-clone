import { commercialBuildings, industrialBuildings, ModelName, residentialBuildings } from "../client/AssetManager";
import { ITileChange, SimTile } from "./SimTiles";
import { random } from "./Rng";
import { DEG_90, DEG_180, DEG_270, DEG_0 } from "./utils";


export abstract class TileContent {
    constructor(readonly tile: SimTile) { }
    computeModel(): void { }
    abstract updateTileChange(): void;
    isGrass() { return false; }
    isRoad() { return false; }

    setTileChange(tileChange: ITileChange) {
        this.tile.simTiles.tileChanged.set(this.tile, tileChange);
    }

    toString() {
        return this.constructor.name;
    }
}
export class SimRoad extends TileContent {
    floor: ModelName = 'road-end';
    orientation: number = 0;

    constructor(readonly tile: SimTile) {
        super(tile)
    }


    updateTileChange(): void {
        this.setTileChange({ floor: this.floor, x: this.tile.x, z: this.tile.z, orientation: this.orientation });
    }

    isRoad() { return true; }

    override computeModel() {
        let north = this.tile.northTile?.content.isRoad() ?? false;
        let south = this.tile.southTile?.content.isRoad() ?? false;
        let west = this.tile.westTile?.content.isRoad() ?? false;
        let east = this.tile.eastTile?.content.isRoad() ?? false;

        let sum = (north ? 1 : 0) + (south ? 1 : 0) + (west ? 1 : 0) + (east ? 1 : 0);
        switch (sum) {
            case 4:
                this.floor = 'road-four-way';
                break;
            case 3:
                this.floor = 'road-three-way';
                this.orientation =
                    !south ? DEG_0 :
                        !west ? DEG_90 :
                            !north ? DEG_180 :
                                /*!east*/ DEG_270;
                break;
            case 2:
                if (north && south || east && west) {
                    this.floor = 'road-straight';
                    if (north && south) this.orientation = DEG_0;
                    else /*east && west*/ this.orientation = DEG_90;
                }
                else {
                    this.floor = 'road-corner';
                    if (north && east) this.orientation = 0;
                    else if (south && east) this.orientation = DEG_90;
                    else if (south && west) this.orientation = DEG_180;
                    else /*north && west*/ this.orientation = DEG_270;
                }
                break;
            case 1:
                this.floor = 'road-end';
                this.orientation =
                    north ? DEG_0 :
                        east ? DEG_90 :
                            south ? DEG_180 :
                                /*west*/ DEG_270;
                break;
            default:
                this.floor = 'grass';
        }

        this.updateTileChange();
    }
}

export class SimGrass extends TileContent {

    updateTileChange(): void {
        this.setTileChange({ floor: 'grass', x: this.tile.x, z: this.tile.z });
    }
    isGrass() { return true; }
}

export abstract class SimBuilding extends TileContent {

    constructor(readonly tile: SimTile, readonly building: ModelName) {
        super(tile);
    }

    static newRandom(tile: SimTile): TileContent {
        switch (random(3)) {
            case 0: return SimResidential.newRandom(tile);
            case 1: return SimCommercial.newRandom(tile);
            case 2: return SimIndustrial.newRandom(tile);
            default: return new SimGrass(tile); // should not happen
        }
    }

    updateTileChange(): void {
        this.setTileChange({ floor: 'grass', building: this.building, x: this.tile.x, z: this.tile.z });
    }
}

export class SimResidential extends SimBuilding {
    static newRandom(tile: SimTile): TileContent {
        return new SimResidential(tile, random(residentialBuildings))
    }
}

export class SimCommercial extends SimBuilding {
    static newRandom(tile: SimTile): TileContent {
        return new SimResidential(tile, random(commercialBuildings))
    }
}
export class SimIndustrial extends SimBuilding {
    static newRandom(tile: SimTile): TileContent {
        return new SimResidential(tile, random(industrialBuildings))
    }
}