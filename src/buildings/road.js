export function createRoad(coords) {
  return {
    /* PROPERTIES */

    id: crypto.randomUUID(),
    type: 'road',
    coords,
    updated: true,

    /* METHODS */

    /**
     * Updates the state of this building by one simulation step
     * @param {object} city 
     */
    update(city) {
      this.updated = false;
    },

    /**
     * Handles any clean up needed before a building is removed
     */
    dispose() {
      // No-op
    },

    /**
     * Returns an HTML representation of this object
     * @returns {string}
     */
    toHTML() {
      let html = '';
      html += '<br><strong>Building</strong><br>';
      html += `Type: ${this.type}<br>`;
      return html;
    }
  }
}