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
    return _.clamp(progress, 0, 100);
  },

  getMonthlyPayments: () => {
    const totalMonthlyAmount = _.sumBy(loans, loan => {
      // Skip if loan is fully paid
      if (loan.paidInstallments >= loan.installments) return 0;
      return loan.amount || 0;
    }) || 0;

    return {
      amount: totalMonthlyAmount,
      message: `Tiene que pagar un total de ${new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'UYU'
      }).format(totalMonthlyAmount)} este mes en préstamos.`
    };
  },

  getOverdueLoans: () => {
    const today = new Date();
    return _.filter(loans, loan => {
      // Skip if loan is fully paid
      if (loan.paidInstallments >= loan.installments) return false;
      
      // Check for overdue status
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
          
          // Handle fixed-term contracts
          if (service.contract?.duration) {
            const durationMonths = parseInt(service.contract.duration.split(' ')[0]);
            if (durationMonths > 0) {
              return service.billingCycle === 'annual' 
                ? amount / 12 
                : amount; // Monthly billing for fixed-term contracts
            }
          }
          
          // Handle regular billing cycles
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
          
          // If date has passed, move to next month
          if (nextPayment < today) {
            nextPayment.setMonth(nextPayment.getMonth() + 1);
          }
          
          // Check last payment status
          const lastPayment = _.last(service.paymentHistory);
          const requiresProof = !lastPayment || 
            new Date(lastPayment.date) < nextPayment;
          
          payments.push({
            service: service.name || 'Servicio sin nombre',
            date: nextPayment,
            amount: service.price?.uyuEquivalent || 0,
            category: category.category || 'Sin categoría',
            billingCycle: service.billingCycle || 'monthly',
            requiresProof,
            acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf']
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
      const today = new Date();
      
      return _.flatMap(services, category =>
        _.chain(category.items)
          .filter(service => {
            // Check if service has payment method but no active contract
            return service.paymentMethod && 
              (!service.contract || !service.contract.startDate) &&
              (!_.last(service.paymentHistory)?.status === 'paid');
          })
          .map(service => {
            // Calculate trial end date (assuming standard 14-day trial)
            const lastPaymentDate = _.last(service.paymentHistory)?.date;
            if (!lastPaymentDate) return null;
            
            const trialEndDate = new Date(lastPaymentDate);
            trialEndDate.setDate(trialEndDate.getDate() + 14);
            
            const daysUntilEnd = Math.floor(
              (trialEndDate - today) / (1000 * 60 * 60 * 24)
            );
            
            // Only alert if trial ends tomorrow
            if (daysUntilEnd !== 1) return null;
            
            return {
              name: service.name || 'Servicio sin nombre',
              trialEndDate,
              paymentMethod: service.paymentMethod,
              price: service.price,
              category: category.category || 'Sin categoría'
            };
          })
          .compact() // Remove null values
          .value()
      );
    } catch (error) {
      console.error('Error getting trial status:', error);
      return [];
    }
  }
};

export { calculateLoans, calculateServices };
