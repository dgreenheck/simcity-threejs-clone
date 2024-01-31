import * as THREE from 'three';
import { VehicleGraphNode } from './vehicleGraphNode.js';
import config from '../../config.js';
import { SimObject } from '../simObject.js';
import models from '../../assets/models.js';

const FORWARD = new THREE.Vector3(1, 0, 0);

export class Vehicle extends SimObject {
  constructor(origin, destination) {
    super();

    this.createdTime = Date.now();
    this.cycleStartTime = this.createdTime;

    /**
     * @type {VehicleGraphNode}
     */
    this.origin = origin;

    /**
     * @type {VehicleGraphNode}
     */
    this.destination = destination;

    this.originWorldPosition = new THREE.Vector3();
    this.destinationWorldPosition = new THREE.Vector3();
    this.originToDestination = new THREE.Vector3();
    this.orientation = new THREE.Vector3();

    this.updateWorldPositions();

    const types = Object.entries(models)
    .filter(x => x[1].type === 'vehicle')
    .map(x => x[0]);

    const i = Math.floor(types.length * Math.random());

    this.setMesh(window.assetManager.getModel(types[i], this, true));
  }

  /**
   * @returns {number} Returns cycle time between 0 and 1
   */
  get cycleTime() {
    const distance = this.originToDestination.length();
    const cycleDuration = distance / config.vehicle.speed;
    const value = (Date.now() - this.cycleStartTime) / cycleDuration;

    return Math.max(0, Math.min(value, 1));
  }

  /**
   * @returns {number} Age of the vehicle in milliseconds
   */
  get age() {
    return Date.now() - this.createdTime;
  }

  /**
   * Updates the vehicle position each render frame
   */
  simulate() {
    if (!this.origin || !this.destination) {
      this.dispose();
      return;
    }

    // If a road tile was removed, the vehicles will still maintain reference
    // to the nodes. Automatically remove vehicles when the destination node
    // is no longer part of the scene
    if (!this.destination.parent) {
      this.dispose();
      return;
    }

    if (this.age > config.vehicle.maxLifetime) {
      this.dispose();
      return;
    }

    if (this.cycleTime === 1) {
      this.pickNewDestination();
    } else {
      this.position.copy(this.originWorldPosition);
      this.position.lerp(this.destinationWorldPosition, this.cycleTime);
    }

    this.updateOpacity();
  }

  updateOpacity() {
    const setOpacity = (opacity) => {
      this.traverse(obj => {
        if (obj.material) {
          obj.material.opacity = Math.max(0, Math.min(opacity, 1))
        }
      });
    }

    if (this.age < config.vehicle.fadeTime) {
      setOpacity(this.age / config.vehicle.fadeTime);
    } else if ((config.vehicle.maxLifetime - this.age) < config.vehicle.fadeTime) {
      setOpacity((config.vehicle.maxLifetime - this.age) / config.vehicle.fadeTime);
    } else {
      setOpacity(1);
    }
  }

  pickNewDestination() {
    this.origin = this.destination;
    this.destination = this.origin?.getRandomNextNode();
    this.updateWorldPositions();
    this.cycleStartTime = Date.now();
  }

  /**
   * Updates the world positions each cycle start
   */
  updateWorldPositions() {
    if (!this.origin || !this.destination) {
      return;
    }

    this.origin.getWorldPosition(this.originWorldPosition);
    this.destination.getWorldPosition(this.destinationWorldPosition);

    this.originToDestination.copy(this.destinationWorldPosition);
    this.originToDestination.sub(this.originWorldPosition);

    this.orientation.copy(this.originToDestination);
    this.orientation.normalize();

    this.quaternion.setFromUnitVectors(FORWARD, this.orientation);
  }

  dispose() {
    this.traverse((obj) => obj.material?.dispose());
    this.removeFromParent();
  }

  toHTML() {
    return 'Car';
  }
}