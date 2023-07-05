export class Building {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    /**
     * Unique identifier for this building
     * @type {string}
     */
    this.id = crypto.randomUUID();

    /**
     * Name of the building
     * @type {string}
     */
    this.name = 'Untitled';

    /**
     * The building type
     * @type {string}
     */
    this.type = 'building';

    /**
     * True if the mesh is out of date and needs to be regenerated
     * @type {boolean}
     */
    this.isMeshOutOfDate = true;
  }

  /**
   * Performs a full refresh of the building state
   * @param {City} city 
   */
  refresh(city) {
  }

  /**
   * Updates the state of this building by one simulation step
   * @param {City} city 
   */
  step(city) {
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = '';
    html += '<br><strong>Building</strong><br>';
    html += `Name: ${this.name}<br>`;
    html += `Type: ${this.type}<br>`;
    return html;
  }
}