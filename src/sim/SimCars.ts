import { cars, ModelName } from "../client/AssetManager";
import { Sim } from "./Sim";
import { random } from "./Rng"
import { findPathOrStartOfPath } from './AStar';
import { SimTile } from "./SimTiles";

export class SimCars {
    cars: SimCar[] = [];
    carChanged = new Map<SimCar, ICarChangedWithId>();

    constructor(readonly simCity: Sim) { }

    feedRandom(carCount: number) {
        let newCars = [];
        for (let i = 0; i < carCount; i++) {
            let car = new SimCar(this.simCity, i, random(cars))
            newCars.push(car);
            car.setCarChange(
                {
                    path: this.#randomPath()
                }
            )
        }
        this.cars = newCars;

    }

    #randomPath(): ICarPath[] {
        let filter = (t: SimTile) => t.content?.isRoad()
        let t0 = this.simCity.simTiles.randomTile(filter);
        let t1 = this.simCity.simTiles.randomTile(filter);
        let t2 = random(2) == 0 ? this.simCity.simTiles.randomTile(filter) : undefined;

        let path1 = findPathOrStartOfPath(this.simCity.simTiles, t0, t1).path;
        if (t2) {
            let path2 = findPathOrStartOfPath(this.simCity.simTiles, t1, t2).path;
            let path3 = findPathOrStartOfPath(this.simCity.simTiles, t2, t0).path;
            return [...path1, ...path2, ...path3];
        } else {
            let path2 = findPathOrStartOfPath(this.simCity.simTiles, t1, t0).path;
            return [...path1, ...path2];
        }
    }

    getCarChanged(): ICarChangedWithId[] {
        let result = new Array(...this.carChanged.values())
        return result;
    }

    getCar(x: number): SimCar {
        return this.cars[x];
    }

}

export class SimCar {
    constructor(readonly city: Sim, readonly id: number, readonly model: ModelName) { }

    getCarChange() {
        return this.city.simCars.carChanged.get(this);
    }

    setCarChange(carChanged: ICarChanged) {
        (carChanged as ICarChangedWithId).id = this.id;
        let path = carChanged.path;
        if (path) {
            let newPath = path.map(p => ({ x: p.x, z: p.z, speed: p.speed }))
                .filter((p, i, arr) => {
                    if (i === 0) return true;
                    const prev = arr[i - 1];
                    return p.x !== prev.x || p.z !== prev.z || p.speed !== prev.speed;
                });

            if (newPath.length > 1) {
                const first = newPath[0];
                const last = newPath.at(-1)!;
                if (first.x === last.x && first.z === last.z && first.speed === last.speed) {
                    newPath.pop();
                }
            }
            carChanged.path = newPath;
        }

        this.city.simCars.carChanged.set(this, carChanged as ICarChangedWithId);
    }
}

export interface ICarInfo {
    id: number,
    model: ModelName,
    path: ICarPath[],
    motion: 'forward' | 'loop';
    startTime?: number;
}


export type ICarChanged = {
    model?: ModelName,
    path?: Partial<ICarPath>[],
    motion?: ICarInfo['motion']
    startTime?: number;
}
export type ICarChangedWithId = { id: number } & ICarChanged

export interface ICarPath {
    x: number;
    z: number;
    speed?: number;
}
