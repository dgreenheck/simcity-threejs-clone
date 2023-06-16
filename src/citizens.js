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

  return {
    /* PROPERTIES  */

    name: generateRandomName(),
    age: 1 + Math.floor(100*Math.random()),
    house,

    /* METHODS  */

    /**
     * Updates the state of this citizen by one simulation
     * @param {object} city 
     */
    update(city) {
      // Not implemented
    },

    /**
     * Returns an HTML representation of this object
     * @returns {string}
     */
    toHTML() {
      return `<span>${this.name} | Age: ${this.age}</span>`
    }
  }
}
