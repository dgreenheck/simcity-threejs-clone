/**
 * Creates a new tile object
 * @param {number} x The x-coordinate of the tile
 * @param {number} y The y-coordinate of hte tile
 * @returns 
 */
export default function Tile(x, y) {
  return { 
    id: crypto.randomUUID(),
    x, 
    y,
    terrainId: 'ground',
    building: undefined,

    /**
     * Computes the Manhattan distance from this tile to `tile`
     * @param {object} tile The tile to measure the distance to
     */
    distanceTo: function(tile) {
      return Math.abs((this.x - tile.x) + (this.y - tile.y));
    }
  };
}