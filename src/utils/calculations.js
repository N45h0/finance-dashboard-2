import _ from 'lodash';
import loans from '../data/loans';
import services from '../data/services';

// Utilidad para manejar específicamente las cantidades monetarias
const formatMoney = (amount) => {
  const rounded = roundToTwo(amount);
  return rounded === 0 ? 0 : rounded;
};

// Función de redondeo
const roundToTwo = (num) => {
  // Aseguramos que el número sea válido
  if (typeof num !== 'number' || isNaN(num)) return 0;
  // Usamos una técnica más precisa de redondeo
  return +(Math.round(num + "e+2") + "e-2");
};

// función de utilidad para comparaciones
const areNumbersEqual = (num1, num2, precision = 2) => {
  const factor = Math.pow(10, precision);
  return Math.round(num1 * factor) === Math.round(num2 * factor);
};

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
  getTotalCapital: () => {
    return roundToTwo(_.sumBy(loans, 'capital') || 0);
  },

  getTotalPaid: () => {
    return roundToTwo(_.sumBy(loans, loan => 
      _.sumBy(loan.paymentHistory, 'amount')
    ) || 0);
  },

  getRemainingBalance: () => {
    return roundToTwo(_.sumBy(loans, 'currentBalance') || 0);
  },

  getProgress: (loan) => {
    if (!loan?.installments || loan.installments === 0) return 0;
    if (loan.status === 'completed') return 100;
    return _.clamp((loan.paidInstallments / loan.installments) * 100, 0, 100);
  },

  getOverallProgress: () => {
    const totalAmountToPay = _.sumBy(loans, 'totalAmountToPay');
    const totalPaid = calculateLoans.getTotalPaid();
    return totalAmountToPay > 0 ? 
      _.clamp((totalPaid / totalAmountToPay) * 100, 0, 100) : 0;
  },

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

  getLoansByOwner: () => {
    const groupedLoans = _.groupBy(loans, 'owner');
    
    return _.mapValues(groupedLoans, ownerLoans => {
      const activeLoans = ownerLoans.filter(loan => loan.status === 'active');
      const completedLoans = ownerLoans.filter(loan => loan.status === 'completed');
      const overdueLoans = activeLoans.filter(loan => loan.isOverdue);

      return {
        totalCapital: _.sumBy(ownerLoans, 'capital'),
        totalAmountToPay: _.sumBy(ownerLoans, 'totalAmountToPay'),
        currentBalance: _.sumBy(ownerLoans, 'currentBalance'),
        totalPaid: _.sumBy(ownerLoans, loan => 
          _.sumBy(loan.paymentHistory, 'amount')),
        activeLoansCount: activeLoans.length,
        completedLoansCount: completedLoans.length,
        overdueLoansCount: overdueLoans.length,
        monthlyPayment: _.sumBy(activeLoans, 'amount'),
        totalOverdueAmount: _.sumBy(overdueLoans, 'amount'),
        projectedLateFees: _.sumBy(overdueLoans, loan => {
          const daysOverdue = dateUtils.calculateDaysOverdue(loan.nextPaymentDate);
          return loan.moratory ? 
            (loan.amount * (loan.moratory / 100) * daysOverdue / 30) : 0;
        }),
        loans: ownerLoans,
        activeLoans,
        completedLoans,
        overdueLoans
      };
    });
  },

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
      return roundToTwo(_.sumBy(services, category => 
        _.sumBy(category.items, service => {
          if (!service?.price?.uyuEquivalent) return 0;
          const amount = service.price.uyuEquivalent;
          // Ajustar el cálculo para servicios anuales
          if (service.billingCycle === 'annual') {
            return service.contract?.monthlyEquivalent || amount / 12;
          }
          return amount;
        })
      ) || 0);
    } catch (error) {
      console.error('Error calculating monthly total:', error);
      return 0;
    }
  },

  getServiceAlerts: () => {
    const today = new Date();
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
            const startDate = new Date(service.contract.startDate);
            const renewalDate = new Date(service.contract.renewalDate);
            const daysUntilRenewal = dateUtils.getDaysDifference(today, renewalDate);
            
            // Calcular progreso basado en el ciclo de facturación
            let daysTotal;
            if (service.billingCycle === 'annual') {
              daysTotal = 365;
            } else {
              daysTotal = dateUtils.getDaysDifference(startDate, renewalDate);
            }
            
            const daysElapsed = Math.max(0, dateUtils.getDaysDifference(startDate, today));
            const progress = Math.min(100, (daysElapsed / daysTotal) * 100);

            return {
              name: service.name,
              progress,
              daysUntilRenewal,
              renewalDate: service.contract.renewalDate,
              category: category.category,
              isExpiringSoon: daysUntilRenewal <= 30,
              estimatedRenewalCost: service.price?.uyuEquivalent || 0,
              billingCycle: service.billingCycle
            };
          })
          .value()
      );
    } catch (error) {
      console.error('Error getting contract status:', error);
      return [];
    }
  },

  getUpcomingPayments: () => {
    const today = new Date();
    const payments = [];
    
    try {
      _.forEach(services, category => {
        _.forEach(category.items, service => {
          // Para servicios anuales, usar la fecha de renovación directamente
          if (service.billingCycle === 'annual') {
            if (service.contract?.renewalDate) {
              const nextPayment = new Date(service.contract.renewalDate);
              if (nextPayment > today) {
                payments.push({
                  service: service.name || 'Servicio sin nombre',
                  date: nextPayment,
                  amount: service.price?.uyuEquivalent || 0,
                  category: category.category || 'Sin categoría',
                  billingCycle: service.billingCycle
                });
              }
            }
            return;
          }
          
          // Para servicios mensuales, mantener la lógica existente
          if (!service?.billingDay) return;
          
          const nextPayment = new Date(
            today.getFullYear(),
            today.getMonth(),
            service.billingDay
          );
          
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
  }
};

export { calculateLoans, calculateServices, dateUtils, roundToTwo, areNumbersEqual };
