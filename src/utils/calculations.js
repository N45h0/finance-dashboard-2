import loans from '../data/loans';
import services from '../data/services';

const calculateLoans = {
  getTotalCapital: () => {
    return loans.reduce((total, loan) => total + loan.capital, 0);
  },

  getTotalPaid: () => {
    return loans.reduce((total, loan) => 
      total + (loan.paidInstallments * loan.amount), 0);
  },

  getRemainingBalance: () => {
    return loans.reduce((total, loan) => 
      total + (loan.capital - (loan.paidInstallments * loan.amount)), 0);
  },

  getProgress: (loan) => {
    return (loan.paidInstallments / loan.installments) * 100;
  },

  getMonthlyPayments: () => {
    return loans.reduce((total, loan) => total + loan.amount, 0);
  },

  getOverdueLoans: () => {
    const today = new Date();
    return loans.filter(loan => {
      const nextPayment = new Date(loan.nextPaymentDate);
      return nextPayment < today;
    });
  },

  getLoansByOwner: () => {
    return loans.reduce((acc, loan) => {
      if (!acc[loan.owner]) {
        acc[loan.owner] = {
          total: 0,
          paid: 0,
          remaining: 0
        };
      }
      acc[loan.owner].total += loan.capital;
      acc[loan.owner].paid += (loan.paidInstallments * loan.amount);
      acc[loan.owner].remaining += (loan.capital - (loan.paidInstallments * loan.amount));
      return acc;
    }, {});
  }
};

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

export { calculateLoans, calculateServices };
