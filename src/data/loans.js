const loans = [
  {
    id: 1,
    name: "Refinanciamiento Antel",
    owner: "LAFIO",
    capital: 4941.19,
    installments: 9,
    amount: 549.02,
    paidInstallments: 1,
    interestRate: 0,
    paymentHistory: [
      { 
        date: "2024-02-01",
        amount: 549.02,
        status: "paid"
      }
    ],
    currentBalance: 4392.17, // capital - pagos realizados
    nextPaymentDate: "2024-03-01"
  },
  {
    id: 2,
    name: "BROU Viaje Argentina",
    owner: "LAFIO",
    capital: 12000.00,
    installments: 10,
    amount: 1411.58,
    paidInstallments: 0,
    interestRate: 29.00,
    paymentHistory: [],
    moratory: 43.74,
    cancellationFee: 732.00,
    account: "2477",
    currentBalance: 12000.00, // capital - pagos realizados
    nextPaymentDate: "2024-01-01" // Asumido como ejemplo
  },
  {
    id: 3,
    name: "BROU Dentista",
    owner: "Lovia",
    capital: 20000.00,
    installments: 12,
    amount: 1916.39,
    paidInstallments: 2,
    interestRate: 23.00,
    paymentHistory: [
      { 
        date: "2024-02-01",
        amount: 1916.39,
        status: "paid"
      },
      { 
        date: "2024-03-01",
        amount: 1916.39,
        status: "paid"
      }
    ],
    moratory: 51.35,
    ceipRetention: true,
    currentBalance: 16167.22, // capital - pagos realizados
    nextPaymentDate: "2024-04-01"
  },
  {
    id: 4,
    name: "BROU Buenos Aires",
    owner: "Lovia",
    capital: 10000.00,
    installments: 6,
    amount: 1801.64,
    paidInstallments: 0,
    interestRate: 19.00,
    paymentHistory: [],
    moratory: 43.74,
    ceipRetention: true,
    currentBalance: 10000.00, // capital - pagos realizados
    nextPaymentDate: "2024-01-01" // Asumido como ejemplo
  },
  {
    id: 5,
    name: "Adelanto Sueldo BROU",
    owner: "Lovia",
    capital: 4800.00,
    installments: 1,
    amount: 4831.57,
    paidInstallments: 0,
    interestRate: 0,
    paymentHistory: [],
    moratory: 43.74,
    isOverdue: true,
    currentBalance: 4831.57, // capital - pagos realizados (incluye intereses)
    nextPaymentDate: null // Asumido como sin fecha debido al estado overdue
  }
];

export default loans;
