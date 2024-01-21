import { BuildingType } from '../buildings/buildingType.js';
import { City } from '../city.js';

export class PowerService {
  /**
   * @param {City} city 
   */
  simulate(city) {
    // Find all power plants in the city
    const powerPlantList = [];
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        const building = city.getTile(x, y).building;
        if (building) {
          if (building.type === BuildingType.powerPlant) {
            const powerPlant = building;
            // Reset power consumption for each power plant
            powerPlant.powerConsumed = 0;
            // Create an object with the power plant, the search frontier, and a visited array
            powerPlantList.push({
              powerPlant,
              frontier: [tile],
              visited: []
            });
          } else {
            // Reset supplier power for each building
            building.power.supplied = 0;
          }
        }
      }
    }

    // If there are no power plants, return early
    if (powerPlantList.length === 0) {
      return;
    }

    // Power is allocated by performing a BFS starting at each power plants and
    // distributing power to buildings that require power. The search frontier
    // for each power plant is expanded simultaneously so the load is shared
    // as evenly as possible between poewr plants. Search is terminated when
    // all buildings have been visited or the power plant has no power remaining.

    let searching = true;
    while (searching) {
      searching = false;

      // Iterate over each power plant
      for (const item of powerPlantList) {
        const { powerPlant, frontier, visited } = item;

        // If power plant has no power left to give, ignore it
        if (powerPlant.powerAvailable === 0) continue;

        // If power plant has power available, find the next building on the search frontier
        if (frontier.length > 0) {
          searching = true;

          // Get the next tile
          const tile = frontier.shift();
          const building = tile.building;
          visited.push(tile);

          // Does this building need power?
          if (building.power.supplied < building.power.required) {
            const powerSupplied = Math.min(powerPlant.powerAvailable, building.power.required);
            powerPlant.powerConsumed += powerSupplied;
            building.power.supplied = powerSupplied;
          }

          // Add adjacent buildings to the search frontier
          const { x, y } = tile;

          // Add neighboring tiles to search if
          // 1) They haven't already been visited
          // 2) The tile has a building (power can pass through non-powered buildings)
          const shouldVisit = (tile) => tile && !visited.includes(tile) && tile.building;

          let left = city.getTile(x - 1, y);
          let right = city.getTile(x + 1, y);
          let top = city.getTile(x, y - 1);
          let bottom = city.getTile(x, y + 1);

          if (shouldVisit(left)) {
            frontier.push(left);
          }
          if (shouldVisit(right)) {
            frontier.push(right);
          }
          if (shouldVisit(top)) {
            frontier.push(top);
          }            
          if (shouldVisit(bottom)) {
            frontier.push(bottom);
          }
        }
      }
    }
  }

  /**
   * Cleans up this module, disposing of any assets and unlinking any references
   */
  dispose() {
    // Implement in subclass
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    // Implement in subclass
  }
}