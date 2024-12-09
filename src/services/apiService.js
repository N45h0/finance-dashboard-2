const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const apiService = {
  async uploadDocument(file, analysisResult) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('analysis', JSON.stringify(analysisResult));

      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir documento');
      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  async getDocumentHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (!response.ok) throw new Error('Error al obtener historial');
      return await response.json();
    } catch (error) {
      console.error('History fetch error:', error);
      throw error;
    }
  }
};
