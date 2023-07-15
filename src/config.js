export default {
  citizen: {
    minWorkingAge: 16,        // Minimum working age for a citizen
    retirementAge: 65,        // Age when citizens retire
    maxJobSearchDistance: 4   // Max distance a citizen will search
  },                          // for a job
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
