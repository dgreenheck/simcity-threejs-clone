import * as THREE from 'three';
import { Scene3D } from './Scene3D';
import { Car3D } from './Car3D';
import { ICarChangedWithId, ICarInfo, ICarPath } from '../sim/SimCars';
import { cars } from './AssetManager';
import { random } from '../sim/Rng';

export class Cars3D extends THREE.Group {
    #cars: Car3D[] = [];

    constructor(readonly scene: Scene3D) {
        super();
    }

    drawFrame(now: number) {
        for (let car of this.#cars) {
            car.drawFrame(this.scene, now)
        }
    }

    onCarsChanged(carChanges: ICarChangedWithId[]) {
        for (let car of carChanges) {
            this.onCarChanged(car);
        }
    }

    onCarChanged(car: ICarChangedWithId) {
        let car3D = this.#cars[car.id];
        if (!car3D) {
            let carInfo: ICarInfo = {
                id: car.id,
                model: car.model ?? random(cars),
                path: Cars3D.fixPath(car.path),
                motion: 'loop'
            }
            car3D = new Car3D(this.scene, carInfo);
            this.#cars[car.id] = car3D;
        }
    }
    static fixPath(path?: Partial<ICarPath>[]): ICarPath[] {
        let speed = 1 / 5000;
        let x = 0;
        let z = 0;

        if (!path || path.length === 0) {
            return [{ speed, x, z }];
        }

        let fixed = path.map(p => {
            speed = p.speed ?? speed;
            x = p.x ?? x;
            z = p.z ?? z;
            return { speed, x, z, tile: undefined as any };
        })

        fixed = fixed.filter((p, i, arr) => {
            if (i === 0) return true;
            const prev = arr[i - 1];
            return p.x !== prev.x || p.z !== prev.z || p.speed !== prev.speed;
        });

        const first = fixed[0];
        if (fixed.length > 1) {
            const last = fixed.at(-1)!;
            if (fixed.length > 1 &&
                first.x === last.x && first.z === last.z && first.speed === last.speed) {
                fixed.pop();
            }
        }
        return fixed;
    }


}