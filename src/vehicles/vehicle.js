import * as THREE from 'three';
import config from '../config.js';

const CAR_GEOMETRY = new THREE.BoxGeometry(0.2, 0.1, 0.1);

export class Vehicle extends THREE.Mesh {
  /**
   * Creates a new instance of a vehicle traveling from `origin` to `destination`
   * @param {VehicleGraphNode} origin The node the vehicle is traveling from
   * @param {VehicleGraphNode} destination The node the vehicle is traveling to
   */
  constructor(origin, destination) {
    super();

    this.createdTime = Date.now();
    this.cycleStartTime = this.createdTime;
    this.geometry = CAR_GEOMETRY;
    this.material = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true });
    this.origin = origin;
    this.destination = destination;

    console.log(`spawning vehicle ${this.id}`)
  }

  getElapsedCycleTime() {
    return Date.now() - this.cycleStartTime;
  }

  /**
   * Gets the number of milliseconds since the vehicle was created
   * @returns {number}
   */
  getAge() {
    return Date.now() - this.createdTime;
  }

  update() {
    // Does this vehicle need to be despawned?
    if (this.getAge() > config.vehicle.maxLifetime) {
      this.dispose();
      return;
    }

    // Ready for next cycle?
    if (this.getElapsedCycleTime() > config.vehicle.cycleInterval) {
      this.pickNewDestination();
    }

    // If vehicle doesn't have origin or destination, it is in
    // an invalid state and needs to be removed
    if (this.destination) {
      this.updateTransform();
    }

    this.updateOpacity();
  }

  updateTransform() {
    // Get the world position of the origin and destination nodes
    const originWorldPos = new THREE.Vector3();
    const destinationWorldPos = new THREE.Vector3();
    this.origin.getWorldPosition(originWorldPos);
    this.destination.getWorldPosition(destinationWorldPos);

    // Linearly interpolate between the origin and destination based on the
    // current cycle time to get the updated position
    const position = originWorldPos.lerp(destinationWorldPos, this.getElapsedCycleTime() / config.vehicle.cycleInterval);
    this.position.set(position.x, position.y, position.z);

    // Align the vehicle with the direction of travel
    const orientation = destinationWorldPos.sub(originWorldPos).normalize();
    this.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), orientation);
  }

  updateOpacity() {
    const age = this.getAge();

    // Fade in/out during the last 'console.vehicle.fadeTime' milliseconds of the vehicle's life
    if (age < config.vehicle.fadeTime) {
      this.material.opacity = Math.min(Math.max(0, age / config.vehicle.fadeTime), 1);
    } else if ((config.vehicle.maxLifetime - age) < config.vehicle.fadeTime) {
      this.material.opacity = (config.vehicle.maxLifetime - age) / config.vehicle.fadeTime
    } else {
      this.material.opacity = 1;
    }
  }

  pickNewDestination() {
    // Move the origin to the previous destination (if there was one).
    // If the vehicle had no previous destination, then it was
    // stopped at the origin
    if (this.destination) {
      this.origin = this.destination;
    }

    // Pick a new destination
    this.destination = this.origin.getRandomNext();

    this.cycleStartTime = Date.now();
  }

  dispose() {
    this.material.dispose();
    this.removeFromParent();
  }
}