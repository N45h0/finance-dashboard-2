const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const apiService = {
  async saveManualEntry(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/manual-entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al guardar los datos');
      return await response.json();
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  },

  async getDataHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      if (!response.ok) throw new Error('Error al obtener historial');
      return await response.json();
    } catch (error) {
      console.error('History fetch error:', error);
      throw error;
    }
  }
};
