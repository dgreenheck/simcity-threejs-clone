export default {
  citizen: {
    minWorkingAge: 16,        // Minimum working age for a citizen
    retirementAge: 65,        // Age when citizens retire
    maxJobSearchDistance: 4   // Max distance a citizen will search for a job
  },
  vehicle: {
    speed: 0.0005,            // The distance travelled per millisecond
    fadeTime: 1000,           // The start/end time where the vehicle should fade
    maxLifetime: 10000,       // Maximum lifetime of a vehicle
    maxVehicleCount: 25,      // Maximum number of vehicles in scene at any one time
    spawnInterval: 1000       // How often vehicles are spawned in milliseconds
  },
  zone: {
    abandonmentThreshold: 10, // Number of days before abandonment
    abandonmentChance: 0.25,  // Probability of building abandonment
    developmentChance: 0.25,  // Probability of building development
    maxRoadSearchDistance: 3, // Max distance between buildng and road
    maxResidents: 2,          // Max # of residents in a house
    maxWorkers: 2,            // Max # of workers at a building
    residentMoveInChance: 0.5 // Chance for a resident to move in
  }
}
