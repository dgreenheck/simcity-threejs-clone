import { CityType } from "../../types/City";
import { Citizen } from "../citizens";

export class Building {
  x: number;
  y: number;
  id: string;
  name: string;
  type: string;
  isMeshOutOfDate: boolean;
  hideTerrain: boolean;
  rotation: number;
  residents: Citizen[];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    /**
     * Unique identifier for this building
     * @type {string}
     */
    this.id = crypto.randomUUID();

    /**
     * Name of the building
     * @type {string}
     */
    this.name = "Untitled";

    /**
     * The building type
     * @type {string}
     */
    this.type = "building";

    /**
     * True if the mesh is out of date and needs to be regenerated
     * @type {boolean}
     */
    this.isMeshOutOfDate = true;

    /**
     * True if the terrain should not be rendered with this building type
     */
    this.hideTerrain = false;

    /**
     * Custom rotation angle for this tile
     */
    this.rotation = 0;

    this.residents = [];
  }

  /**
   * Performs a full refresh of the building state
   * @param {City} city
   */
  refresh(city: CityType) {}

  /**
   * Updates the state of this building by one simulation step
   * @param {City} city
   */
  step(city: CityType) {}

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {}

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = `
      <div class="info-heading">Building</div>
      <span class="info-label">Name </span>
      <span class="info-value">${this.name}</span>
      <br>
      <span class="info-label">Type </span>
      <span class="info-value">${this.type}</span>
      <br>
      <span class="info-label">Rotation </span>
      <span class="info-value">${this.rotation}</span>
      <br>
    `;
    return html;
  }
}
