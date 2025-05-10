import { Scene3D } from './Scene3D.js';
import { ReactiveMesh } from './ReactiveMesh';
import { IPoint2D } from '../sim/IPoint.js';
import { ICarInfo } from '../sim/SimCars';
import { CarState } from './CarStates';



export class Car3D implements IPoint2D {
  readonly carMesh = new ReactiveMesh();
  x: number = 0;
  z: number = 0;
  rotation: number = 0; // in radian
  speed: number = 0;

  // The current state instance of the car
  currentCarState: CarState;


  constructor(readonly scene: Scene3D, readonly carInfo: ICarInfo) {
    this.carMesh.set(scene.assetManager, carInfo.model, 0, 0, 0, 0);
    this.currentCarState = CarState.createInitialState(this);
    this.currentCarState.initialize(this, performance.now());
  }

  private updateCarVisuals(scene: Scene3D): void {
    this.carMesh.move(scene.assetManager, this.x, 0, this.z, -this.rotation);
  }

  drawFrame(scene: Scene3D, now: number) {
    this.currentCarState.onDrawFrame(this, now);
    this.updateCarVisuals(scene);
  }


}