export class CityEvent {
  constructor(type) {
    this.type = type;
  }

  static BuildingCreated() {
    return new CityEvent('building-created');
  }

  static BuildingRemoved() {
    return new CityEvent('building-removed');
  }
}