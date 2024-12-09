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
import _ from 'lodash';
import loans from '../data/loans';
import services from '../data/services';

// Utilidades de fecha mejoradas
const dateUtils = {
  addMonths: (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  },
  
  getDaysDifference: (date1, date2) => {
    return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
  },

  calculateDaysOverdue: (nextPaymentDate) => {
    if (!nextPaymentDate) return 0;
    const today = new Date();
    const paymentDate = new Date(nextPaymentDate);
    return paymentDate < today ? dateUtils.getDaysDifference(paymentDate, today) : 0;
  }
};

const calculateLoans = {
  // Obtener capital total de préstamos
  getTotalCapital: () => {
    return _.sumBy(loans, 'capital') || 0;
  },

  // Obtener total pagado real basado en historial
  getTotalPaid: () => {
    return _.sumBy(loans, loan => 
      _.sumBy(loan.paymentHistory, 'amount')
    ) || 0;
  },

  // Obtener saldo restante actual
  getRemainingBalance: () => {
    return _.sumBy(loans, 'currentBalance') || 0;
  },

  // Calcular progreso de un préstamo específico
  getProgress: (loan) => {
    if (!loan?.installments || loan.installments === 0) return 0;
    if (loan.status === 'completed') return 100;
    return _.clamp((loan.paidInstallments / loan.installments) * 100, 0, 100);
  },

  // Calcular progreso general de todos los préstamos
  getOverallProgress: () => {
    const totalAmountToPay = _.sumBy(loans, 'totalAmountToPay');
    const totalPaid = calculateLoans.getTotalPaid();
    return totalAmountToPay > 0 ? 
      _.clamp((totalPaid / totalAmountToPay) * 100, 0, 100) : 0;
  },

  // Calcular pagos proyectados con moras
  getProjectedPayments: () => {
    const today = new Date();
    
    return loans
      .filter(loan => loan.status === 'active')
      .map(loan => {
        if (loan.remainingInstallments === 0) {
          return {
            loanId: loan.id,
            loanName: loan.name,
            payments: [],
            totalProjected: 0
          };
        }

        let projectedDate = loan.nextPaymentDate ? 
          new Date(loan.nextPaymentDate) : today;

        const payments = Array.from(
          { length: loan.remainingInstallments }, 
          (_, index) => {
            const paymentDate = dateUtils.addMonths(projectedDate, index);
            const isOverdue = paymentDate < today;
            const daysOverdue = isOverdue ? 
              dateUtils.getDaysDifference(paymentDate, today) : 0;

            const lateFee = isOverdue && loan.moratory ? 
              (loan.amount * (loan.moratory / 100) * daysOverdue / 30) : 0;

            return {
              date: paymentDate,
              amount: loan.amount,
              installmentNumber: loan.paidInstallments + index + 1,
              isOverdue,
              daysOverdue,
              lateFee,
              totalAmount: loan.amount + lateFee
            };
          }
        );

        return {
          loanId: loan.id,
          loanName: loan.name,
          owner: loan.owner,
          payments,
          totalProjected: _.sumBy(payments, 'totalAmount'),
          hasOverduePayments: payments.some(p => p.isOverdue),
          totalLateFees: _.sumBy(payments, 'lateFee')
        };
    });
  },

  // Obtener préstamos por titular con totales
  getLoansByOwner: () => {
    const groupedLoans = _.groupBy(loans, 'owner');
    
    return _.mapValues(groupedLoans, ownerLoans => {
      const activeLoans = ownerLoans.filter(loan => loan.status === 'active');
      const completedLoans = ownerLoans.filter(loan => loan.status === 'completed');
      const overdueLoans = activeLoans.filter(loan => loan.isOverdue);

      return {
        // Totales generales
        totalCapital: _.sumBy(ownerLoans, 'capital'),
        totalAmountToPay: _.sumBy(ownerLoans, 'totalAmountToPay'),
        currentBalance: _.sumBy(ownerLoans, 'currentBalance'),
        totalPaid: _.sumBy(ownerLoans, loan => 
          _.sumBy(loan.paymentHistory, 'amount')),

        // Métricas de préstamos
        activeLoansCount: activeLoans.length,
        completedLoansCount: completedLoans.length,
        overdueLoansCount: overdueLoans.length,

        // Pagos mensuales
        monthlyPayment: _.sumBy(activeLoans, 'amount'),

        // Moras y vencimientos
        totalOverdueAmount: _.sumBy(overdueLoans, 'amount'),
        projectedLateFees: _.sumBy(overdueLoans, loan => {
          const daysOverdue = dateUtils.calculateDaysOverdue(loan.nextPaymentDate);
          return loan.moratory ? 
            (loan.amount * (loan.moratory / 100) * daysOverdue / 30) : 0;
        }),

        // Referencias a préstamos
        loans: ownerLoans,
        activeLoans,
        completedLoans,
        overdueLoans
      };
    });
  },

  // Obtener préstamos vencidos con detalles
  getOverdueLoans: () => {
    return loans
      .filter(loan => loan.status === 'active' && loan.isOverdue)
      .map(loan => {
        const daysOverdue = dateUtils.calculateDaysOverdue(loan.nextPaymentDate);
        const lateFee = loan.moratory ? 
          (loan.amount * (loan.moratory / 100) * daysOverdue / 30) : 0;

        return {
          ...loan,
          daysOverdue,
          lateFee,
          totalDue: loan.amount + lateFee,
          paymentsPending: loan.remainingInstallments,
          projectedTotalWithFees: loan.currentBalance + 
            (loan.remainingInstallments * lateFee)
        };
      });
  },

  // Nueva función para obtener estadísticas generales
  getGeneralStats: () => {
    const activeLoans = loans.filter(loan => loan.status === 'active');
    const completedLoans = loans.filter(loan => loan.status === 'completed');
    const overdueLoans = loans.filter(loan => loan.isOverdue);

    return {
      totalLoansCount: loans.length,
      activeLoansCount: activeLoans.length,
      completedLoansCount: completedLoans.length,
      overdueLoansCount: overdueLoans.length,

      totalCapital: calculateLoans.getTotalCapital(),
      totalPaid: calculateLoans.getTotalPaid(),
      totalRemaining: calculateLoans.getRemainingBalance(),

      totalAmountToPay: _.sumBy(loans, 'totalAmountToPay'),
      totalMonthlyPayment: _.sumBy(activeLoans, 'amount'),
      
      projectedLateFees: _.sumBy(overdueLoans, loan => {
        const daysOverdue = dateUtils.calculateDaysOverdue(loan.nextPaymentDate);
        return loan.moratory ? 
          (loan.amount * (loan.moratory / 100) * daysOverdue / 30) : 0;
      })
    };
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
