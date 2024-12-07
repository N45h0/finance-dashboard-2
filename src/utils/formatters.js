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
     'debit_6039': 'Brou Débito 6039',
     'debit_2477': 'Visa Santander Débito 2477',
     'manual_6039': 'Brou Débito Manual 6039',
     'debit_3879': 'Prex Mastercard UY',
     'cash': 'Efectivo'
   };
   return methods[method] || method;
 },

 billingCycle: (cycle) => {
   switch (cycle) {
     case 'monthly':
       return 'Mensual';
     case 'annual':
       return 'Anual';
     default:
       return 'Ciclo no reconocido';
   }
 }
};

export default formatters;
