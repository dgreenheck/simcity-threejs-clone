export function createCitizen(house) {
  function generateRandomName() {
    const firstNames = [
      'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella',
      'Liam', 'Noah', 'William', 'James', 'Benjamin',
      'Elizabeth', 'Margaret', 'Alice', 'Dorothy', 'Eleanor',
      'John', 'Robert', 'William', 'Charles', 'Henry',
      'Alex', 'Taylor', 'Jordan', 'Casey', 'Robin'
    ];
  
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Jones', 'Brown',
      'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
      'Anderson', 'Thomas', 'Jackson', 'White', 'Harris',
      'Clark', 'Lewis', 'Walker', 'Hall', 'Young',
      'Lee', 'King', 'Wright', 'Adams', 'Green'
    ];
  
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return randomFirstName + ' ' + randomLastName;
  }

  function findWorkplace(citizen, city) {
    // Get the tile coordinates of the house the citizen lives at
    const coords = citizen.house.coords;

    console.log('findWorkplace');

    const tile = city.findTile(coords, (tile) => {
      // Tile has no building, ignore
      if (!tile.building) return false;

      const buildingType = tile.building?.type;

      // Search for an industrial or commercial building with at least one available job
      if (buildingType === 'industrial' || buildingType === 'commercial') {
        if (tile.building.numberOfJobsAvailable() > 0) {
          return true;
        }
      }

      return false;
    })

    if (tile) {
      // Employ the citizen at the building
      tile.building.workers.push(citizen);
      return tile.building;
    } else {
      return null;
    }
  }

  return {
    /* PROPERTIES  */
    id: crypto.randomUUID(),
    name: generateRandomName(),
    age: 1 + Math.floor(100*Math.random()),
    state: 'new',

    // Number of simulation steps the citizen has not had a job
    timeWithoutJob: 0,
    // Number of simulation steps the citizen has not had a store
    timeWithoutStore: 0,

    // A reference to the building the citizen lives at
    house,
    // A reference to the building the citizen works at
    job: null,
    // A reference to the storeo the citizen shops at
    store: null,

    /* METHODS  */

    /**
     * Updates the state of this citizen by one simulation
     * @param {object} city 
     */
    update(city) {
      switch (this.state) {
        case 'new':
          this.job = findWorkplace(this, city);

          if (this.job) {
            this.state = 'employed';
          }

          break;
        case 'employed':
          // Do nothing
          break;
        default:
          console.error(`Citizen ${this.id} is in an unknown state (${this.state})`);
      }

      if (!this.job) {
        this.timeWithoutJob++;
      }

      if (!this.store) {
        this.timeWithoutStore++;
      }
    },

    /**
     * Returns an HTML representation of this object
     * @returns {string}
     */
    toHTML() {
      return `<span>${this.name} | Age: ${this.age} | State: ${this.state}</span>`
    }
  }
}
