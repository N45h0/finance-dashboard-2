// formatters.js
// borra esta linea al pegar
const formatters = {
 currency: (amount, currency = "UYU") => {
   return new Intl.NumberFormat('es-UY', {
     style: 'currency',
     currency: currency,
   }).format(amount);
 },

 date: (date) => {
   return new Date(date).toLocaleDateString('es-UY', {
     year: 'numeric',
     month: '2-digit',
     day: '2-digit'
   });
 },

 percentage: (value) => {
   return `${Math.round(value)}%`;
 },

 paymentMethod: (method) => {
   const methods = {
     'debit_6039': 'Débito 6039',
     'debit_2477': 'Débito 2477',
     'manual_6039': 'Manual 6039',
     'cash': 'Efectivo'
   };
   return methods[method] || method;
 },

 billingCycle: (cycle) => {
   return cycle === 'monthly' ? 'Mensual' : 'Anual';
 }
};

export default formatters;
// pega aquí
