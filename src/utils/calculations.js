import _ from 'lodash';
import loans from '../data/loans';
import services from '../data/services';

const calculateLoans = {
  getTotalCapital: () => {
    return _.sumBy(loans, 'capital') || 0;
  },

  getTotalPaid: () => {
    return _.sumBy(loans, loan => 
      (loan.paidInstallments || 0) * (loan.amount || 0)
    ) || 0;
  },

  getRemainingBalance: () => {
    return _.sumBy(loans, loan => 
      loan.currentBalance || (loan.capital - ((loan.paidInstallments || 0) * loan.amount))
    ) || 0;
  },

  getProgress: (loan) => {
    if (!loan?.installments || !loan?.paidInstallments) return 0;
    const progress = (loan.paidInstallments / loan.installments) * 100;
    return _.clamp(progress, 0, 100); // Asegura que el progreso esté entre 0 y 100
  },

  getMonthlyPayments: () => {
    return _.sumBy(loans, 'amount') || 0;
  },

  getOverdueLoans: () => {
    const today = new Date();
    return _.filter(loans, loan => {
      if (!loan.nextPaymentDate && loan.isOverdue) return true;
      if (!loan.nextPaymentDate) return false;
      return new Date(loan.nextPaymentDate) < today;
    });
  },

  getLoansByOwner: () => {
    const groupedLoans = _.groupBy(loans, 'owner');
    
    return _.mapValues(groupedLoans, ownerLoans => ({
      total: _.sumBy(ownerLoans, 'capital') || 0,
      paid: _.sumBy(ownerLoans, loan => 
        (loan.paidInstallments || 0) * (loan.amount || 0)
      ) || 0,
      remaining: _.sumBy(ownerLoans, loan => 
        loan.currentBalance || (loan.capital - ((loan.paidInstallments || 0) * loan.amount))
      ) || 0,
      loans: ownerLoans
    }));
  }
};

const calculateServices = {
  getMonthlyTotal: () => {
    try {
      return _.sumBy(services, category => 
        _.sumBy(category.items, service => {
          if (!service?.price?.uyuEquivalent) return 0;
          const amount = service.price.uyuEquivalent;
          return service.billingCycle === 'monthly' ? amount : amount / 12;
        })
      ) || 0;
    } catch (error) {
      console.error('Error calculating monthly total:', error);
      return 0;
    }
  },

  getUpcomingPayments: () => {
    const today = new Date();
    const payments = [];
    
    try {
      _.forEach(services, category => {
        _.forEach(category.items, service => {
          if (!service?.billingDay) return;
          
          const nextPayment = new Date(
            today.getFullYear(),
            today.getMonth(),
            service.billingDay
          );
          
          // Si la fecha ya pasó, move al próximo mes
          if (nextPayment < today) {
            nextPayment.setMonth(nextPayment.getMonth() + 1);
          }
          
          payments.push({
            service: service.name || 'Servicio sin nombre',
            date: nextPayment,
            amount: service.price?.uyuEquivalent || 0,
            category: category.category || 'Sin categoría',
            billingCycle: service.billingCycle || 'monthly'
          });
        });
      });
      
      return _.sortBy(payments, 'date');
    } catch (error) {
      console.error('Error getting upcoming payments:', error);
      return [];
    }
  },

  getContractStatus: () => {
    try {
      return _.flatMap(services, category =>
        _.chain(category.items)
          .filter(service => service?.contract)
          .map(service => {
            const renewalDate = new Date(service.contract.renewalDate);
            const now = new Date();
            const daysUntilRenewal = Math.max(0, Math.floor(
              (renewalDate - now) / (1000 * 60 * 60 * 24)
            ));

            return {
              name: service.name || 'Servicio sin nombre',
              progress: _.clamp(service.contract.progress || 0, 0, 100),
              daysUntilRenewal,
              renewalDate: service.contract.renewalDate,
              category: category.category || 'Sin categoría',
              isExpiringSoon: daysUntilRenewal <= 30
            };
          })
          .value()
      );
    } catch (error) {
      console.error('Error getting contract status:', error);
      return [];
    }
  }
};

export { calculateLoans, calculateServices };
