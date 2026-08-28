import maximoData from '../data/maximo-mock.json';

export const RequestService = {
  findPotentialDuplicates(locationId, room, problemDescription) {
    const results = maximoData.open_requests.filter(req => {
      const locationMatch = req.location_id === locationId;
      const roomMatch = room && req.room === room;
      
      // Simple semantic match simulation: check if keywords from problem are in description
      const keywords = problemDescription.toLowerCase().split(' ').filter(w => w.length > 3);
      const description = req.description.toLowerCase();
      const semanticMatch = keywords.some(k => description.includes(k));

      return (locationMatch && semanticMatch) || (locationMatch && roomMatch);
    });
    
    return results;
  },

  async submit(requestData) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          requestId: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString()
        });
      }, 800);
    });
  }
};
