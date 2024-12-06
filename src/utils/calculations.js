import _ from 'lodash';
import loans from '../data/loans';
import services from '../data/services';

const calculateLoans = {
  getTotalCapital: () => {
    return _.sumBy(loans, 'capital');
  },

  getTotalPaid: () => {
    return _.sumBy(loans, loan => loan.paidInstallments * loan.amount);
  },

  getRemainingBalance: () => {
    return _.sumBy(loans, loan => loan.currentBalance);
  },

  getProgress: (loan) => {
    if (!loan?.installments) return 0;
    return (loan.paidInstallments / loan.installments) * 100;
  },

  getMonthlyPayments: () => {
    return _.sumBy(loans, 'amount');
  },

  getOverdueLoans: () => {
    const today = new Date();
    return _.filter(loans, loan => {
      if (!loan.nextPaymentDate) return loan.isOverdue;
      return new Date(loan.nextPaymentDate) < today;
    });
  },

  getLoansByOwner: () => {
    return _.groupBy(loans, 'owner');
  }
};

const calculateServices = {
  getMonthlyTotal: () => {
    return _.sumBy(services, category => 
      _.sumBy(category.items, service => {
        const amount = service.price.uyuEquivalent;
        return service.billingCycle === 'monthly' ? amount : amount / 12;
      })
    );
  },

  getUpcomingPayments: () => {
    const today = new Date();
    const payments = [];
    
    _.forEach(services, category => {
      _.forEach(category.items, service => {
        if (service.billingDay) {
          const nextPayment = new Date(
            today.getFullYear(),
            today.getMonth(),
            service.billingDay
          );
          if (nextPayment < today) {
            nextPayment.setMonth(nextPayment.getMonth() + 1);
          }
          payments.push({
            service: service.name,
            date: nextPayment,
            amount: service.price.uyuEquivalent
          });
        }
      });
    });
    
    return _.sortBy(payments, 'date');
  },

  getContractStatus: () => {
    return _.flatMap(services, category =>
      _.chain(category.items)
        .filter('contract')
        .map(service => ({
          name: service.name,
          progress: service.contract.progress,
          daysUntilRenewal: Math.floor(
            (new Date(service.contract.renewalDate) - new Date()) / (1000 * 60 * 60 * 24)
          )
        }))
        .value()
    );
  }
};

export { calculateLoans, calculateServices };
