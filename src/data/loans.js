const loans = [
  {
    id: 1,
    name: "Refinanciamiento Antel",
    owner: "Ignacio",
    capital: 4941.19,
    installments: 9,
    amount: 549.02,
    paidInstallments: 2,  // Actualizado
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
      },
      {
        date: "2024-12-20",
        amount: 549.02,
        status: "paid",
        method: "debit_6039",
        installmentNumber: 2,
        paymentType: "regular",
        operationNumber: "2412200379923793"
      }
    ],
    currentBalance: 3843.15,     // 4941.19 - (2 * 549.02)
    totalAmountToPay: 4941.18,   // 9 * 549.02
    remainingInstallments: 7,    // 9 - 2
    nextPaymentDate: "2025-01-22",
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
    paidInstallments: 1,
    interestRate: 29.00,
    status: "active",
    paymentHistory: [
      {
        date: "2025-01-02",
        amount: 1411.58,
        status: "paid",
        installmentNumber: 1,
        paymentType: "regular",
        documentNumber: "00100199000350007000003964120250102"
      }
    ],
    moratory: 43.18,
    cancellationFee: 614.32,
    account: "6039",
    currentBalance: 11237.97,    // Según sistema banco
    totalAmountToPay: 14115.80,  // 10 * 1411.58
    remainingInstallments: 9,    // 10 - 1
    nextPaymentDate: "2025-02-01",
    isOverdue: false
  },
  {
    id: 3,
    name: "BROU Dentista",
    owner: "Ignacio",
    capital: 20000.00,
    installments: 12,
    amount: 1916.39,
    paidInstallments: 4,  // Corregido
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
      },
      {
        date: "2024-12-20",
        amount: 1916.39,
        status: "paid",
        installmentNumber: 4,
        paymentType: "advance",
        method: "transfer_6039",
        documentNumber: "2412200379928941",
        details: "Pago adelantado cuota enero"
      }
    ],
    moratory: 51.35,
    ceipRetention: true,
    currentBalance: 12334.44,    // 20000 - (4 * 1916.39)
    totalAmountToPay: 22996.68,  // 12 * 1916.39
    remainingInstallments: 8,    // 12 - 4
    nextPaymentDate: "2025-02-03",
    isOverdue: false
  },
  {
    id: 4,
    name: "BROU Buenos Aires",
    owner: "Yenni",
    capital: 10000.00,
    installments: 6,
    amount: 1801.64,
    paidInstallments: 1,
    interestRate: 19.00,
    status: "active",
    paymentHistory: [
      {
        date: "2025-01-03",
        amount: 1801.64,
        status: "paid",
        installmentNumber: 1,
        paymentType: "regular",
        documentNumber: "00100199000350007000001331420250103",
        details: "Pago compuesto: 1613.64 + 188.00"
      }
    ],
    moratory: 43.18,
    ceipRetention: true,
    cancellationFee: 420.95,
    account: "6039",
    currentBalance: 8565.28,     // Según sistema banco
    totalAmountToPay: 10809.84,  // 6 * 1801.64
    remainingInstallments: 5,    // 6 - 1
    nextPaymentDate: "2025-02-03",
    isOverdue: false
  },
{
  id: 5,
  name: "Adelanto Sueldo BROU",
  owner: "Yenni",
  capital: 4800.00,
  installments: 1,
  amount: 4831.05,  // Corregido para que coincida con el pago realizado
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
  moratory: 43.18,
  ceipRetention: true,
  currentBalance: 0,
  totalAmountToPay: 4831.05,  // Corregido para que coincida con amount
  remainingInstallments: 0,
  nextPaymentDate: null,
  isOverdue: false
}
];

// Función de validación para verificar la integridad de los datos
const validateLoan = (loan) => {
  const validations = [];

  if (loan.status !== 'completed') {  // Solo validar préstamos activos
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

    // Validar remaining installments
    const expectedRemaining = loan.installments - loan.paidInstallments;
    if (loan.remainingInstallments !== expectedRemaining) {
      validations.push({
        type: 'REMAINING_MISMATCH',
        message: `Cuotas restantes incorrectas en préstamo ${loan.name}`,
        expected: expectedRemaining,
        actual: loan.remainingInstallments
      });
    }
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
