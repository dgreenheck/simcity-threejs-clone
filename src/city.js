/**
 * Creates a new City object
 * @param {number} size The size of the city (# of tiles wide) 
 * @returns a City object
 */
export function createCity(size) {
  const tiles = [];

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
      tiles.push(column);
    }
  }

  /**
   * Update the state of each tile in the city
   */
  function update() {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        tiles[x][y].building?.update();
      }
    }
  }

  return {
    size,
    tiles,
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
    terrainId: 'ground',
    building: undefined
  };
}