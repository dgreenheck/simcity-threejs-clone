import { CommercialZone } from "./commercialZone";
import { ResidentialZone } from "./residentialZone";
import { IndustrialZone } from "./industrialZone";
import { Road } from "./road";
import { exhaustiveSwitchGuard } from "../../utils";
import { BuildingKind } from "../../types/Building";

/**
 * Creates a new building object
 * @param {number} x The x-coordinate of the building
 * @param {number} y The y-coordinate of the building
 * @param {string} type The building type
 * @returns {Building} A new building object
 */
export function createBuilding(x: number, y: number, kind: BuildingKind) {
  switch (kind) {
    case "residential":
      return new ResidentialZone(x, y);
    case "commercial":
      return new CommercialZone(x, y);
    case "industrial":
      return new IndustrialZone(x, y);
    case "road":
      return new Road(x, y);
    default:
      console.error(`${kind} is not a recognized building kind.`);
      return exhaustiveSwitchGuard(kind);
  }
}
