import _ from 'lodash';
import loans from '../data/loans';
import services from '../data/services';

// Utility para cálculos financieros
const LoanCalculator = {
  /**
   * Calcula el monto total pagado de un préstamo
   * @param {Object} loan - Objeto préstamo
   * @returns {number} Monto total pagado
   */
  calculatePaidAmount(loan) {
    const paidInstallments = loan.paidInstallments || 0;
    const installmentAmount = loan.amount || 0;
    return paidInstallments * installmentAmount;
  },

  /**
   * Calcula el saldo restante de un préstamo
   * @param {Object} loan - Objeto préstamo
   * @returns {number} Saldo restante
   */
  calculateRemainingBalance(loan) {
    // Si hay un balance actual registrado, usamos ese
    if (loan.currentBalance !== undefined) {
      return loan.currentBalance;
    }
    
    // Si no, calculamos basado en pagos realizados
    const totalPaid = this.calculatePaidAmount(loan);
    return loan.capital - totalPaid;
  },

  /**
   * Calcula el resumen global de préstamos
   * @param {Array} loans - Array de préstamos
   * @returns {Object} Resumen de préstamos
   */
  calculateLoansSummary(loans) {
    const summary = loans.reduce((acc, loan) => {
      const paidAmount = this.calculatePaidAmount(loan);
      const remainingBalance = this.calculateRemainingBalance(loan);
      
      return {
        totalCapital: acc.totalCapital + loan.capital,
        totalPaid: acc.totalPaid + paidAmount,
        remainingBalance: acc.remainingBalance + remainingBalance
      };
    }, {
      totalCapital: 0,
      totalPaid: 0,
      remainingBalance: 0
    });

    // Validación de consistencia
    if (Math.abs(summary.totalCapital - (summary.totalPaid + summary.remainingBalance)) > 0.01) {
      console.warn('Detectada inconsistencia en los cálculos de préstamos');
    }

    return summary;
  },

  /**
   * Agrupa préstamos por titular
   * @param {Array} loans - Array de préstamos
   * @returns {Object} Préstamos agrupados por titular
   */
  groupLoansByOwner(loans) {
    return loans.reduce((acc, loan) => {
      if (!acc[loan.owner]) {
        acc[loan.owner] = {
          totalCapital: 0,
          totalPaid: 0,
          remainingBalance: 0,
          loans: []
        };
      }

      const paidAmount = this.calculatePaidAmount(loan);
      const remainingBalance = this.calculateRemainingBalance(loan);

      acc[loan.owner].totalCapital += loan.capital;
      acc[loan.owner].totalPaid += paidAmount;
      acc[loan.owner].remainingBalance += remainingBalance;
      acc[loan.owner].loans.push(loan);

      return acc;
    }, {});
  }
};

export default LoanCalculator;

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
