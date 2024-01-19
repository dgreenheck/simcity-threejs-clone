import { City } from '../city.js';

export class PowerService {
  /**
   * @param {City} city 
   */
  simulate(city) {
    // In order to update power allocation for the entire city, the following steps take place
    // 1. Locate all of the power plants in the city and reset their power consumption
    // 2. For each power plant, add an entry to the 'search map', where the power plant
    //    is the key and an array initialized to power plant's tile
    // 3. Iterate over each entry in the map, performing breadth first search for each
    //    power plant one building at a time. This is done to evenly spread the load
    //    across each power plant.
    // 4. For each building that requires power, increment the power plant's power consumption
    //    and mark that building as powered.

    // Find all power plants in the city and build the search map
    const powerPlantMap = {};
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        const building = city.getTile(x, y).building;
        if (building?.type === 'power-plant') {
          const powerPlant = building;
          powerPlant.powerConsumed = 0;
          powerPlantMap[powerPlant] = [tile];
        } else {
          // Reset supplier power for each building
          building.powerSupplied = 0;
        }
      }
    }

    if (Object.entries(powerPlantMap).length > 0) {
      let searching = true;
      while (searching) {
        searching = false;

        // Iterate over each power plant
        for (const [powerPlant, frontier] of Object.entries(powerPlantMap)) {
          if (powerPlant.powerAvailable === 0) continue;

          // If power plant has power available, find the next building on the search frontier
          if (frontier.length > 0) {
            searching = true;

            const tile = frontier.shift();
            const building = tile.building;

            if (building) {
              // If this building has power requirements, supply power to it up to the amount
              // of power remaining for the power plant
              if (building.powerRequired > 0) {
                const powerSupplied = min(powerPlant.powerAvailable, building.powerRequired);
                powerPlant.powerConsumed += powerSupplied;
                building.powerSupplied = powerSupplied;
              }


              //TODO
              // Need to figure out how to handle multiple power plants
              // Really need to do BFS from each one independently
              // The trouble is knowing when to terminate the search
              // Can't go based off of whether or not building is powered
              // because there might be a building beyond that which didn't get power
              // from another power plant



              // Add adjacent buildings to the search frontier
              const { x, y } = tile.position;
              if (city.getTile(x - 1, y)?.building) {
                frontier.push(city.getTile(x - 1, y));
              }
              if (city.getTile(x + 1, y)?.building) {
                frontier.push(city.getTile(x + 1, y));
              }
              if (city.getTile(x, y - 1)?.building) {
                frontier.push(city.getTile(x, y - 1));
              }
              if (city.getTile(x, y + 1)?.building) {
                frontier.push(city.getTile(x, y + 1));
              }
            }
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