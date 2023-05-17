/**
 * Creates a new City object
 * @param {number} size The size of the city (# of tiles wide) 
 * @returns a City object
 */
export function createCity(size) {
  const data = [];

  initialize();
  
  /**
   * Initialize the data array
   */
  function initialize() {
    for (let x = 0; x < size; x++) {
      const column = [];
      for (let y = 0; y < size; y++) {
        const tile = createTile(x, y);
        column.push(tile);
      }
      data.push(column);
    }
  }

  /**
   * Update the state of each tile in the city
   */
  function update() {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        data[x][y].building?.update();
      }
    }
  }

  return {
    size,
    data,
    update
  }
}

/**
 * Creates a new tile object
 * @param {number} x The x-coordinate of the tile
 * @param {number} y The y-coordinate of hte tile
 * @returns 
 */
function createTile(x, y) {
  return { 
    x, 
    y,
    terrainId: 'grass',
    building: undefined
  };
}