import { BuildingType } from "./Building";

export type TileType = {
  x: number;
  y: number;
  id: string;
  terrain: string;
  building: BuildingType | null;
};
