import * as THREE from 'three';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import { DevelopmentAttribute, DevelopmentState } from '../attributes/development.js';
import { Building } from '../building.js';

/**
 * Represents a zoned building such as residential, commercial or industrial
 */
export class Zone extends Building {
  constructor(x = 0, y = 0) {
    super(x, y);
    
    this.name = 'Zone';
    
    // Randomize the building rotation
    this.rotation.y = 90 * Math.floor(4 * Math.random()) * DEG2RAD;
    
    /**
     * The mesh style to use when rendering
     */
    this.style = String.fromCharCode(Math.floor(3 * Math.random()) + 65);

    /**
     * True if this zone is developed
     */
    this.development = new DevelopmentAttribute(this);
  }

  updateMesh(city) {
    let modelName;
    switch (this.development.state) {
      case DevelopmentState.underConstruction:
      case DevelopmentState.undeveloped:
        modelName = 'under-construction';
        break;
      default:
        modelName = `${this.type}-${this.style}${this.development.level}`;
        break;
    }

    let mesh = window.assetManager.createInstance(modelName, this);

    // Tint building a dark color if it is abandoned
    if (this.development.state === DevelopmentState.abandoned) {
      mesh.traverse((obj) => {
        if (obj.material) {
          obj.material.color = new THREE.Color(0x707070);
        }
      });
    }
    
    this.setMesh(mesh);
  }

  simulate(city) {
    super.simulate(city);
    this.development.simulate(city);
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += this.development.toHTML();
    return html;
  }
}