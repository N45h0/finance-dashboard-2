const formatters = {
  // Formateo de moneda con opciones extendidas
  currency: (amount, currency = "UYU", options = {}) => {
    const defaultOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };

    try {
      return new Intl.NumberFormat('es-UY', {
        ...defaultOptions,
        ...options
      }).format(amount);
    } catch (error) {
      console.warn('Error formatting currency:', error);
      return `${currency} ${amount.toFixed(2)}`;
    }
  },

  // Formateo de fechas con opciones
  date: (date, format = 'short') => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = new Date(date);
      
      const formats = {
        short: {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        },
        long: {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        },
        withTime: {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        },
        monthDay: {
          month: '2-digit',
          day: '2-digit'
        },
        monthYear: {
          year: 'numeric',
          month: 'long'
        }
      };

      return dateObj.toLocaleDateString('es-UY', formats[format]);
    } catch (error) {
      console.warn('Error formatting date:', error);
      return date.toString();
    }
  },

  // Formateo de porcentajes
  percentage: (value, decimals = 1) => {
    try {
      return new Intl.NumberFormat('es-UY', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value / 100);
    } catch (error) {
      console.warn('Error formatting percentage:', error);
      return `${value.toFixed(decimals)}%`;
    }
  },

  // Formateo de métodos de pago
  paymentMethod: (method) => {
    const methods = {
      'debit_6039': 'Brou Débito 6039',
      'debit_2477': 'Visa Santander Débito 2477',
      'manual_6039': 'Brou Débito Manual 6039',
      'debit_3879': 'Prex Mastercard UY',
      'cash': 'Efectivo',
      'transfer': 'Transferencia Bancaria'
    };
    return methods[method] || method;
  },

  // Formateo de ciclos de facturación
  billingCycle: (cycle) => {
    const cycles = {
      'monthly': 'Mensual',
      'annual': 'Anual',
      'quarterly': 'Trimestral',
      'bimonthly': 'Bimestral',
      'weekly': 'Semanal'
    };
    return cycles[cycle] || cycle;
  },

  // Formateo de estados de pago
  paymentStatus: (status) => {
    const statuses = {
      'paid': 'Pagado',
      'pending': 'Pendiente',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado',
      'processing': 'Procesando',
      'failed': 'Fallido',
      'refunded': 'Reembolsado'
    };
    return statuses[status] || status;
  },

  // Formateo de estados de préstamo
  loanStatus: (status) => {
    const statuses = {
      'active': 'Activo',
      'completed': 'Completado',
      'defaulted': 'En Mora',
      'cancelled': 'Cancelado',
      'refinanced': 'Refinanciado'
    };
    return statuses[status] || status;
  },

  // Formateo de números con separadores de miles
  number: (value, decimals = 0) => {
    try {
      return new Intl.NumberFormat('es-UY', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    } catch (error) {
      console.warn('Error formatting number:', error);
      return value.toFixed(decimals);
    }
  },

  // Formateo de plazos
  timeframe: (months) => {
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} año${years !== 1 ? 's' : ''}`;
      }
      return `${years} año${years !== 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths !== 1 ? 'es' : ''}`;
    }
    return `${months} mes${months !== 1 ? 'es' : ''}`;
  },

  // Formateo de diferencias de tiempo relativas
  relativeTime: (date) => {
    try {
      const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
      const now = new Date();
      const diff = new Date(date) - now;
      const days = Math.round(diff / (1000 * 60 * 60 * 24));
      
      if (Math.abs(days) < 1) {
        const hours = Math.round(diff / (1000 * 60 * 60));
        return rtf.format(hours, 'hour');
      }
      if (Math.abs(days) < 30) {
        return rtf.format(days, 'day');
      }
      if (Math.abs(days) < 365) {
        return rtf.format(Math.round(days / 30), 'month');
      }
      return rtf.format(Math.round(days / 365), 'year');
    } catch (error) {
      console.warn('Error formatting relative time:', error);
      return formatters.date(date);
    }
  },

  // Formateo de cantidades monetarias compactas
  compactCurrency: (amount, currency = "UYU") => {
    try {
      if (amount >= 1000000) {
        return `${formatters.currency(amount / 1000000, currency)} M`;
      }
      if (amount >= 1000) {
        return `${formatters.currency(amount / 1000, currency)} K`;
      }
      return formatters.currency(amount, currency);
    } catch (error) {
      console.warn('Error formatting compact currency:', error);
      return formatters.currency(amount, currency);
    }
  }
};

export default formatters;
