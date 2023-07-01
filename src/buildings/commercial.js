export function createCommercialZone(x, y) {
  return {
    /* PROPERTIES */

    id: crypto.randomUUID(),
    name: generateBusinessName(),
    type: 'commercial',
    x,
    y,
    style: Math.floor(3 * Math.random()) + 1,
    height: 1,
    updated: true,

    // Citizens that work here
    workers: [],
    // Maximum number of workers this building can support
    maxWorkers: 4,

    /* METHODS */
    numberOfJobsAvailable() {
      return this.maxWorkers - this.workers.length;
    },

    numberOfJobsFilled() {
      return this.workers.length;
    },

    /**
     * Updates the state of this building by one simulation step
     * @param {object} city 
     */
    update(city) {
      if (Math.random() < 0.02) {
        if (this.height < 5) {
          this.height += 1;
          this.updated = true;
        }
      }
    },

    /**
     * Handles any clean up needed before a building is removed
     */
    dispose() {

    },

    /**
     * Returns an HTML representation of this object
     * @returns {string}
     */
    toHTML() {
      let html = '';
      html += '<br><strong>Building</strong><br>';
      html += `Name: ${this.name}<br>`;
      html += `Type: ${this.type}<br>`;
      html += `Style: ${this.style}<br>`;
      html += `Height: ${this.height}<br>`;

      html += `<br><strong>Workers (${this.numberOfJobsFilled()}/${this.maxWorkers})</strong>`;

      html += '<ul style="margin-top: 0; padding-left: 20px;">';
      if (this.workers.length > 0) {
        for (const worker of this.workers) {
          html += worker.toHTML();
        }
      } else {
        html += '<li>None</li>'
      }
      html += '</ul>';

      return html;
    }
  }
}

// Arrays of words for generating business names
const prefixes = ['Prime', 'Elite', 'Global', 'Exquisite', 'Vibrant', 'Luxury', 'Innovative', 'Sleek', 'Premium', 'Dynamic'];
const suffixes = ['Commerce', 'Trade', 'Marketplace', 'Ventures', 'Enterprises', 'Retail', 'Group', 'Emporium', 'Boutique', 'Mall'];
const businessSuffixes = ['LLC', 'Inc.', 'Co.', 'Corp.', 'Ltd.'];

// Function to generate a random commercial business name
function generateBusinessName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const businessSuffix = businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)];

  return prefix + ' ' + suffix + ' ' + businessSuffix;
}