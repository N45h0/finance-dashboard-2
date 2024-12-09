export const dateUtils = {
  addMonths: (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  },

  getDaysDifference: (date1, date2) => {
    return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
  },

  isOverdue: (date) => {
    return new Date(date) < new Date();
  },

  formatDate: (date, format = 'short') => {
    const options = format === 'short' ? 
      { year: 'numeric', month: '2-digit', day: '2-digit' } :
      { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-UY', options);
  },

  getNextPaymentDate: (currentDate, dayOfMonth) => {
    const next = new Date(currentDate);
    next.setDate(dayOfMonth);
    if (next < currentDate) {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  }
};
