export default {
  attributes: {
    roadAccess: {
      // Max distance to search for a road when determining road access
      searchDistance: 3       
    }
  },
  citizen: {
     // Minimum working age for a citizen
    minWorkingAge: 16,       
     // Age when citizens retire
    retirementAge: 65,       
    // Max Manhattan distance a citizen will search for a job
    maxJobSearchDistance: 4   
  },
  vehicle: {
    // The distance travelled per millisecond
    speed: 0.0005,            
    // The start/end time where the vehicle should fade
    fadeTime: 1000,  
    // Maximum lifetime of a vehicle         
    maxLifetime: 10000,
    // Maximum number of vehicles in scene at any one time
    maxVehicleCount: 25,
    // How often vehicles are spawned in milliseconds
    spawnInterval: 1000       
  },
  zone: {
    // Number of simulation cycles the road must fail the abandonment
    // criteria before it has a chance of becoming abandoned
    abandonThreshold: 10,     
    // Probability of building being abandoned after it has met the
    // abandonment criteria for 'delay' cycles
    abandonChance: 0.25,  
    // Number of days it takes to build a building
    constructionTime: 3,
    // Probability of a building leveling up
    levelUpChance: 0.05,
    // Probability of building being re-developed after it is no longer
    // meeting the abandonment criteria
    redevelopChance: 0.25,         
     // Max # of residents in a house
    maxResidents: 2,         
    // Max # of workers at a building
    maxWorkers: 2,            
    // Chance for a resident to move in
    residentMoveInChance: 0.5 
  }
}
