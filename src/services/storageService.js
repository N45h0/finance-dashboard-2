const STORAGE_KEY = 'finance_dashboard_data';

export const storageService = {
  savePayment: (serviceName, payment) => {
    try {
      const currentData = localStorage.getItem(STORAGE_KEY);
      const data = currentData ? JSON.parse(currentData) : {
        services: [],
        payments: []
      };
      
      // Agregar el nuevo pago
      data.payments.push({
        serviceName,
        ...payment,
        id: `PAY-${Date.now()}`
      });
      
      // Guardar datos actualizados
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      return true;
    } catch (error) {
      console.error('Error saving payment:', error);
      return false;
    }
  },

  getPayments: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data).payments : [];
    } catch (error) {
      console.error('Error getting payments:', error);
      return [];
    }
  },

  updateService: (serviceId, updates) => {
    try {
      const currentData = localStorage.getItem(STORAGE_KEY);
      const data = currentData ? JSON.parse(currentData) : {
        services: [],
        payments: []
      };
      
      const serviceIndex = data.services.findIndex(s => s.id === serviceId);
      if (serviceIndex >= 0) {
        data.services[serviceIndex] = {
          ...data.services[serviceIndex],
          ...updates
        };
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      return false;
    }
  },

  clearData: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
};

export default storageService;
