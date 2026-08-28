import locationsData from '../data/locations.json';
import maximoData from '../data/maximo-mock.json';

export const LocationService = {
  search(query) {
    const q = query.toLowerCase();
    
    // Check aliases first
    for (const [alias, full] of Object.entries(locationsData.aliases)) {
      if (alias.toLowerCase().includes(q) || full.toLowerCase().includes(q)) {
        return { type: 'building', name: full, id: this.findBuildingIdByName(full) };
      }
    }

    // Search buildings
    for (const area of locationsData.areas) {
      if (area.buildings) {
        for (const bldg of area.buildings) {
          if (bldg.name.toLowerCase().includes(q)) {
            return { type: 'building', name: bldg.name, id: bldg.id };
          }
        }
      }
    }

    // Search landmarks
    for (const area of locationsData.areas) {
      if (area.landmarks) {
        for (const landmark of area.landmarks) {
          if (landmark.toLowerCase().includes(q)) {
            return { type: 'landmark', name: landmark, id: `landmark-${landmark.replace(/\s+/g, '-').toLowerCase()}` };
          }
        }
      }
    }

    return null;
  },

  getAllBuildings() {
    const all = [];
    for (const area of locationsData.areas) {
      if (area.buildings) {
        area.buildings.forEach(b => all.push({ name: b.name, id: b.id, type: b.type }));
      }
    }
    return all;
  },

  findBuildingIdByName(name) {
    for (const area of locationsData.areas) {
      if (area.buildings) {
        const bldg = area.buildings.find(b => b.name === name);
        if (bldg) return bldg.id;
      }
    }
    return null;
  },

  getLocationDetails(id) {
    for (const area of locationsData.areas) {
      if (area.buildings) {
        const bldg = area.buildings.find(b => b.id === id);
        if (bldg) return bldg;
      }
    }
    return null;
  },

  getMaximoId(internalId) {
    return maximoData.locations[internalId] || 'MAX-UNKNOWN';
  }
};
