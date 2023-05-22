export default {
  'residential': () => {
    return {
      id: 'residential',
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
      id: 'commercial',
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
      id: 'industrial',
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
      id: 'road',
      updated: true,
      update: function() {
        this.updated = false;
      }
    }
  }
}