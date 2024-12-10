const loans = [
  {
    id: 1,
    name: "Refinanciamiento Antel",
    owner: "Ignacio",
    capital: 4941.19,
    installments: 9,
    amount: 549.02,
    paidInstallments: 1,
    interestRate: 0,
    status: "active",
    paymentHistory: [
      { 
        date: "2024-11-22",
        amount: 549.02,
        status: "paid",
        method: "manual_6039",
        installmentNumber: 1,
        paymentType: "regular"
      }
    ],
    // Capital - (cuotas pagadas * monto cuota)
    currentBalance: 4392.17,     // 4941.19 - (1 * 549.02)
    totalAmountToPay: 4941.18,   // 9 * 549.02
    remainingInstallments: 8,    // 9 - 1
    nextPaymentDate: "2024-12-22",
    account: "6039",
    isOverdue: false
  },
  {
    id: 2,
    name: "BROU Viaje Argentina",
    owner: "Ignacio",
    capital: 12000.00,
    installments: 10,
    amount: 1411.58,
    paidInstallments: 0,
    interestRate: 29.00,
    status: "active",
    paymentHistory: [],
    moratory: 43.74,
    cancellationFee: 732.00,
    account: "2477",
    // Sin pagos realizados
    currentBalance: 12000.00,    // Capital completo
    totalAmountToPay: 14115.80,  // 10 * 1411.58
    remainingInstallments: 10,   // 10 - 0
    nextPaymentDate: "2025-01-01",
    isOverdue: false
  },
  {
    id: 3,
    name: "BROU Dentista",
    owner: "Ignacio",
    capital: 20000.00,
    installments: 12,
    amount: 1916.39,
    paidInstallments: 3,
    interestRate: 23.00,
    status: "active",
    paymentHistory: [
      { 
        date: "2024-10-03",
        amount: 1916.39,
        status: "paid",
        installmentNumber: 1,
        paymentType: "regular"
      },
      { 
        date: "2024-11-04",
        amount: 1916.39,
        status: "paid",
        installmentNumber: 2,
        paymentType: "regular"
      },      
      { 
        date: "2024-12-03",
        amount: 1916.39,
        status: "paid",
        installmentNumber: 3,
        paymentType: "regular"
      }
    ],
    moratory: 51.35,
    ceipRetention: true,
    // Capital - (cuotas pagadas * monto cuota)
    currentBalance: 14250.83,    // 20000 - (3 * 1916.39)
    totalAmountToPay: 22996.68,  // 12 * 1916.39
    remainingInstallments: 9,    // 12 - 3
    nextPaymentDate: "2025-01-03",
    isOverdue: false
  },
  {
    id: 4,
    name: "BROU Buenos Aires",
    owner: "Yenni",
    capital: 10000.00,
    installments: 6,
    amount: 1801.64,
    paidInstallments: 0,
    interestRate: 19.00,
    status: "active",
    paymentHistory: [],
    moratory: 43.74,
    ceipRetention: true,
    account: "2477",
    // Sin pagos realizados
    currentBalance: 10000.00,    // Capital completo
    totalAmountToPay: 10809.84,  // 6 * 1801.64
    remainingInstallments: 6,    // 6 - 0
    nextPaymentDate: "2025-01-03",
    isOverdue: false
  },
  {
    id: 5,
    name: "Adelanto Sueldo BROU",
    owner: "Yenni",
    capital: 4800.00,
    installments: 1,
    amount: 4831.57,
    paidInstallments: 1,
    interestRate: 0,
    status: "completed",
    paymentHistory: [
      { 
        date: "2024-12-02",
        amount: 4831.05,
        status: "paid",
        installmentNumber: 1,
        paymentType: "regular"
      }
    ],
    moratory: 43.74,
    ceipRetention: true,
    // Préstamo pagado
    currentBalance: 0,           // Pagado completamente
    totalAmountToPay: 4831.05,   // 1 * 4831.05
    remainingInstallments: 0,    // 1 - 1
    nextPaymentDate: null,
    isOverdue: false
  }
];

// Función de validación para verificar la integridad de los datos
const validateLoan = (loan) => {
  const validations = [];

  // Validar balance actual
  const expectedBalance = loan.capital - (loan.paidInstallments * loan.amount);
  if (Math.abs(loan.currentBalance - expectedBalance) > 0.1 && loan.status !== 'completed') {
    validations.push({
      type: 'BALANCE_MISMATCH',
      message: `Balance incorrecto en préstamo ${loan.name}`,
      expected: expectedBalance,
      actual: loan.currentBalance
    });
  }

  // Validar cantidad de pagos registrados vs paidInstallments
  if (loan.paymentHistory.length !== loan.paidInstallments) {
    validations.push({
      type: 'PAYMENTS_MISMATCH',
      message: `Discrepancia en pagos registrados del préstamo ${loan.name}`,
      expected: loan.paidInstallments,
      actual: loan.paymentHistory.length
    });
  }

  // Validar monto total a pagar
  const expectedTotalAmount = loan.installments * loan.amount;
  if (Math.abs(loan.totalAmountToPay - expectedTotalAmount) > 0.1) {
    validations.push({
      type: 'TOTAL_AMOUNT_MISMATCH',
      message: `Monto total a pagar incorrecto en préstamo ${loan.name}`,
      expected: expectedTotalAmount,
      actual: loan.totalAmountToPay
    });
  }

  return validations;
};

// Ejecutar validaciones
loans.forEach(loan => {
  const validationResults = validateLoan(loan);
  if (validationResults.length > 0) {
    console.warn(`Validación del préstamo ${loan.name}:`, validationResults);
  }
});

export default loans;
