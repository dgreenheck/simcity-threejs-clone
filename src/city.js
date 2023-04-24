export function createCity(size) {
  const data = [];

  initialize();
  
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

  function update() {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        data[x][y].update();
      }
    }
  }

  return {
    size,
    data,
    update
  }
}

function createTile(x, y) {
  return { 
    x, 
    y,
    terrainId: 'grass',
    buildingId: undefined,
    update() {
      if (this.buildingId.startsWith('residential') ||
          this.buildingId.startsWith('commercial') ||
          this.buildingId.startsWith('industrial')) {
        const x = Math.random();
        if (x < 0.01) {
          let height = Number(this.buildingId.slice(-1));
          // NEED THE BUILDING TYPE FOR THE UPDATE LOGIC
          // THEN NEED TO STORE SEPARATE METADATA
        }
      }
    }
  };
}