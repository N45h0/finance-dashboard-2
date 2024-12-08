import _ from 'lodash';
import loans from '../data/loans';
import services from '../data/services';

// Utilidades de fecha
const dateUtils = {
  addMonths: (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  },
  
  getDaysDifference: (date1, date2) => {
    return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
  }
};

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
    return _.sumBy(loans, loan => {
      // Si hay balance actual definido, usarlo
      if (loan.currentBalance !== undefined) {
        return loan.currentBalance;
      }
      // Calcular basado en cuotas pagadas
      const paidAmount = (loan.paidInstallments || 0) * (loan.amount || 0);
      return loan.capital - paidAmount;
    }) || 0;
  },

  getProgress: (loan) => {
    if (!loan?.installments || !loan?.paidInstallments) return 0;
    const progress = (loan.paidInstallments / loan.installments) * 100;
    return _.clamp(progress, 0, 100);
  },

  getOverallProgress: () => {
    const totalCapital = calculateLoans.getTotalCapital();
    const totalPaid = calculateLoans.getTotalPaid();
    return totalCapital > 0 ? _.clamp((totalPaid / totalCapital) * 100, 0, 100) : 0;
  },

  getProjectedPayments: () => {
    return loans.map(loan => {
      const remainingInstallments = loan.installments - (loan.paidInstallments || 0);
      if (remainingInstallments <= 0) return { loanId: loan.id, payments: [], totalProjected: 0 };

      let currentDate = loan.nextPaymentDate ? new Date(loan.nextPaymentDate) : new Date();
      const projectedPayments = Array.from({ length: remainingInstallments }, (_, i) => ({
        date: dateUtils.addMonths(currentDate, i),
        amount: loan.amount,
        projected: true,
        installmentNumber: (loan.paidInstallments || 0) + i + 1
      }));

      return {
        loanId: loan.id,
        loanName: loan.name,
        payments: projectedPayments,
        totalProjected: loan.amount * remainingInstallments
      };
    });
  },

  getLoansByOwner: () => {
    const groupedLoans = _.groupBy(loans, 'owner');
    
    return _.mapValues(groupedLoans, ownerLoans => ({
      total: _.sumBy(ownerLoans, 'capital'),
      paid: _.sumBy(ownerLoans, loan => 
        (loan.paidInstallments || 0) * (loan.amount || 0)
      ),
      remaining: _.sumBy(ownerLoans, loan => 
        loan.currentBalance || (loan.capital - ((loan.paidInstallments || 0) * loan.amount))
      ),
      loans: ownerLoans,
      monthlyPayment: _.sumBy(ownerLoans, 'amount')
    }));
  },

  getOverdueLoans: () => {
    const today = new Date();
    return loans.filter(loan => {
      if (loan.paidInstallments >= loan.installments) return false;
      if (!loan.nextPaymentDate) return false;
      return new Date(loan.nextPaymentDate) < today;
    }).map(loan => ({
      ...loan,
      daysOverdue: dateUtils.getDaysDifference(new Date(loan.nextPaymentDate), today),
      projectedLateFees: loan.moratory ? 
        (loan.amount * (loan.moratory / 100) * 
         dateUtils.getDaysDifference(new Date(loan.nextPaymentDate), today) / 30) : 0
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

  getAnnualizedCosts: () => {
    try {
      return services.map(category => ({
        category: category.category,
        annualCost: _.sumBy(category.items, service => {
          const monthlyAmount = service.price?.uyuEquivalent || 0;
          return service.billingCycle === 'monthly' ? monthlyAmount * 12 : monthlyAmount;
        }),
        items: category.items.map(service => ({
          name: service.name,
          annualCost: service.billingCycle === 'monthly' ?
            (service.price?.uyuEquivalent || 0) * 12 :
            (service.price?.uyuEquivalent || 0),
          monthlyCost: service.billingCycle === 'monthly' ?
            (service.price?.uyuEquivalent || 0) :
            (service.price?.uyuEquivalent || 0) / 12
        }))
      }));
    } catch (error) {
      console.error('Error calculating annualized costs:', error);
      return [];
    }
  },

  getUpcomingPayments: () => {
    const today = new Date();
    const payments = [];
    
    try {
      services.forEach(category => {
        category.items.forEach(service => {
          if (!service?.billingDay) return;
          
          const nextPayment = new Date(
            today.getFullYear(),
            today.getMonth(),
            service.billingDay
          );
          
          // Si la fecha ya pasó, mover al próximo mes
          if (nextPayment < today) {
            nextPayment.setMonth(nextPayment.getMonth() + 1);
          }
          
          payments.push({
            service: service.name,
            date: nextPayment,
            amount: service.price?.uyuEquivalent || 0,
            category: category.category,
            billingCycle: service.billingCycle,
            currency: service.price?.currency || 'UYU',
            paymentMethod: service.paymentMethod
          });
        });
      });
      
      return _.sortBy(payments, 'date');
    } catch (error) {
      console.error('Error getting upcoming payments:', error);
      return [];
    }
  },

  getServiceAlerts: () => {
    const today = new Date();
    const thirtyDaysFromNow = dateUtils.addMonths(today, 1);

    return _.flatMap(services, category =>
      category.items
        .filter(service => service?.contract?.renewalDate)
        .map(service => {
          const renewalDate = new Date(service.contract.renewalDate);
          const daysUntilRenewal = dateUtils.getDaysDifference(today, renewalDate);

          return {
            serviceName: service.name,
            renewalDate,
            daysUntilRenewal,
            requiresAction: daysUntilRenewal <= 30,
            estimatedRenewalCost: service.price?.uyuEquivalent || 0,
            category: category.category,
            currentProgress: service.contract.progress || 0
          };
        })
        .filter(alert => alert.requiresAction)
    );
  },

  getContractStatus: () => {
    const today = new Date();
    
    try {
      return _.flatMap(services, category =>
        _.chain(category.items)
          .filter(service => service?.contract)
          .map(service => {
            const renewalDate = new Date(service.contract.renewalDate);
            const daysUntilRenewal = dateUtils.getDaysDifference(today, renewalDate);

            return {
              name: service.name,
              progress: _.clamp(service.contract.progress || 0, 0, 100),
              daysUntilRenewal,
              renewalDate: service.contract.renewalDate,
              category: category.category,
              isExpiringSoon: daysUntilRenewal <= 30,
              estimatedRenewalCost: service.price?.uyuEquivalent || 0
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

export { calculateLoans, calculateServices, dateUtils };
