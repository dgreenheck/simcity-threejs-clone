import * as THREE from 'three';
import config from '../config.js';

export class Vehicle extends THREE.Mesh {
  /**
   * Creates a new instance of a vehicle traveling from `origin` to `destination`
   * @param {VehicleGraphNode} origin The node the vehicle is traveling from
   * @param {VehicleGraphNode} destination The node the vehicle is traveling to
   */
  constructor(origin, destination, mesh) {
    super();

    this.createdTime = Date.now();
    this.cycleStartTime = this.createdTime;

    this.origin = origin;
    this.destination = destination;
    this.add(mesh);

    // Store world positions of the origin/destination to avoid re-allocating memory
    // each render frame for these
    this.originWorldPos = new THREE.Vector3();
    this.destinationWorldPos = new THREE.Vector3();
    this.originToDestination = new THREE.Vector3();
    this.orientation = new THREE.Vector3();

    this.updateWorldPositions();
  }

  getCyclePosition() {
    // Get distance between origin and destination
    const distance = this.originToDestination.length();
    // Calculate time it would take for vehicle to traverse that distance
    const cycleDuration = distance / config.vehicle.speed;
    // Find position within cycle by dividing time elapsed by
    const cycleTime = Date.now() - this.cycleStartTime;

    return Math.max(0, Math.min(cycleTime / cycleDuration, 1));
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
    if (this.getCyclePosition() >= 1) {
      this.pickNewDestination();
    }

    if (this.destination) {
      // Linearly interpolate between the origin and destination based on the
      // current cycle time to get the updated position
      this.position.copy(this.originWorldPos);
      this.position.lerp(this.destinationWorldPos, this.getCyclePosition());
    }

    this.updateOpacity();
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

    this.updateWorldPositions();

    this.cycleStartTime = Date.now();
  }

  updateWorldPositions() {
    // Update the world poosition for the origin and destination nodes
    if (this.origin) {
      this.origin.getWorldPosition(this.originWorldPos);
    } else {
      this.originWorldPos = new THREE.Vector3();
    }

    if (this.destination) {
      this.destination.getWorldPosition(this.destinationWorldPos);

      // Calculate vector from origin node to destination node
      this.originToDestination.copy(this.destinationWorldPos);
      this.originToDestination.sub(this.originWorldPos);

      // Update the vehicle orientation
      this.orientation.copy(this.originToDestination);
      this.orientation.normalize();
      this.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), this.orientation);
    } else {
      this.destinationWorldPos = new THREE.Vector3();
    }
  }

  dispose() {
    this.material.dispose();
    this.removeFromParent();
  }
}