import { Building } from './building.js';
import { Zone } from './zone.js';

export class Road extends Building {
  constructor(x, y) {
    super(x, y);
    this.type = 'road';
  }
}