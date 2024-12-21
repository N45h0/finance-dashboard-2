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

  // Formateo de porcentajes que maneja el progreso
  percentage: (value, decimals = 1) => {
    try {
      // Asegurar que el valor esté dentro de los límites 0-100
      const normalizedValue = Math.min(100, Math.max(0, value));
      return new Intl.NumberFormat('es-UY', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(normalizedValue / 100);
    } catch (error) {
      console.warn('Error formatting percentage:', error);
      return `${value.toFixed(decimals)}%`;
    }
  },

  // Formateo específico para progreso
progress: (value, options = {}) => {
    try {
      const {
        showDecimals = true,
        suffix = '%'
      } = options;

      const normalizedValue = Math.min(100, Math.max(0, parseFloat(value)));
      
      if (showDecimals) {
        return `${normalizedValue.toFixed(1)}${suffix}`;
      }
      return `${Math.round(normalizedValue)}${suffix}`;  // Esta es la línea 96
    } catch (error) {
      console.warn('Error formatting progress:', error);
      return `0${suffix}`;
    }
  },

  // Formateo de tiempo relativo para días restantes
  remainingDays: (days) => {
    try {
      if (!days && days !== 0) return 'No especificado';
      
      const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
      
      if (days === 0) return 'Hoy';
      if (days === 1) return 'Mañana';
      if (days < 0) return rtf.format(days, 'day');
      
      // Para días futuros, usar formato más detallado
      if (days > 365) {
        const years = Math.floor(days / 365);
        const remainingDays = days % 365;
        if (remainingDays === 0) {
          return rtf.format(years, 'year');
        }
        return `${years} año${years !== 1 ? 's' : ''} y ${remainingDays} día${remainingDays !== 1 ? 's' : ''}`;
      }
      
      if (days > 30) {
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        if (remainingDays === 0) {
          return rtf.format(months, 'month');
        }
        return `${months} mes${months !== 1 ? 'es' : ''} y ${remainingDays} día${remainingDays !== 1 ? 's' : ''}`;
      }
      
      return rtf.format(days, 'day');
    } catch (error) {
      console.warn('Error formatting remaining days:', error);
      return `${days} días`;
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
  billingCycle: (cycle, { capitalize = false } = {}) => {
    const cycles = {
      'monthly': 'mensual',
      'annual': 'anual',
      'quarterly': 'trimestral',
      'bimonthly': 'bimestral',
      'weekly': 'semanal'
    };

    try {
      const formatted = cycles[cycle] || cycle;
      return capitalize 
        ? formatted.charAt(0).toUpperCase() + formatted.slice(1) 
        : formatted;
    } catch (error) {
      console.warn('Error formatting billing cycle:', error);
      return cycle;
    }
  },

  // Formateo para estado de contrato
  contractStatus: (contract) => {
    try {
      if (!contract) return 'Sin contrato';
      
      const now = new Date();
      const startDate = new Date(contract.startDate);
      const renewalDate = new Date(contract.renewalDate);
      
      if (now < startDate) return 'Pendiente de inicio';
      if (now > renewalDate) return 'Vencido';
      
      const progress = ((now - startDate) / (renewalDate - startDate)) * 100;
      return `${formatters.progress(progress)} completado`;
    } catch (error) {
      console.warn('Error formatting contract status:', error);
      return 'Estado desconocido';
    }
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
