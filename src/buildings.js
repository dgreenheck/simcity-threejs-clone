export default {
  'residential': () => {
    return {
      type: 'residential',
      style: Math.floor(3 * Math.random()) + 1,
      height: 1,
      updated: true,
      update: function() {
        if (Math.random() < 0.05) {
          if (this.height < 5) {
            this.height += 1;
            this.updated = true;
          }
        }
      }
    }
  },
  'commercial': () => {
    return {
      type: 'commercial',
      style: Math.floor(3 * Math.random()) + 1,
      height: 1,
      updated: true,
      update: function() {
        if (Math.random() < 0.05) {
          if (this.height < 5) {
            this.height += 1;
            this.updated = true;
          }
        }
      }
    }
  },
  'industrial': () => {
    return {
      type: 'industrial',
      style: Math.floor(3 * Math.random()) + 1,
      height: 1,
      updated: true,
      update: function() {
        if (Math.random() < 0.05) {
          if (this.height < 5) {
            this.height += 1;
            this.updated = true;
          }
        }
      }
    }
  },
  'road': () => {
    return {
      type: 'road',
      updated: true,
      update: function() {
        this.updated = false;
      }
    }
  }
}