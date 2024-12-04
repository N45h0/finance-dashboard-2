// borra esta linea al pegar
// calculations.js
const calculateServices = {
 getMonthlyTotal: () => {
   let total = 0;
   services.forEach(category => {
     category.items.forEach(service => {
       if (service.billingCycle === 'monthly') {
         total += service.price.uyuEquivalent;
       } else if (service.billingCycle === 'annual') {
         total += service.price.uyuEquivalent / 12;
       }
     });
   });
   return total;
 },

 getUpcomingPayments: () => {
   const today = new Date();
   const upcoming = [];
   services.forEach(category => {
     category.items.forEach(service => {
       if (service.billingDay) {
         const nextPayment = new Date(today.getFullYear(), today.getMonth(), service.billingDay);
         if (nextPayment < today) {
           nextPayment.setMonth(nextPayment.getMonth() + 1);
         }
         upcoming.push({
           service: service.name,
           date: nextPayment,
           amount: service.price.uyuEquivalent
         });
       }
     });
   });
   return upcoming.sort((a, b) => a.date - b.date);
 },

 getContractStatus: () => {
   return services.map(category => 
     category.items
       .filter(service => service.contract)
       .map(service => ({
         name: service.name,
         progress: service.contract.progress,
         daysUntilRenewal: Math.floor((new Date(service.contract.renewalDate) - new Date()) / (1000 * 60 * 60 * 24))
       }))
   ).flat();
 }
};

export default calculateServices;
// pega aquí
