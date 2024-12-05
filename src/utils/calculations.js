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

export default calculateLoans;
