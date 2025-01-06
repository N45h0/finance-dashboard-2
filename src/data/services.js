const services = [
  {
    category: "Digitales",
    account: "6039",
    items: [
      {
        id: "SPT-2024",
        name: "Spotify Premium Familiar",
        price: {
          amount: 11.99,
          currency: "USD", 
          uyuEquivalent: 541.72,
          exchangeRate: 45.18
        },
        billingCycle: "monthly",
        paymentMethod: "debit_6039",
        billingDay: 3,
        status: "active",
        contract: null,
        paymentHistory: [
          {
            date: "2024-12-03",
            amount: 11.99,
            currency: "USD",
            uyuAmount: 541.72,
            exchangeRate: 45.18,
            status: "paid",
            method: "debit_6039",
            automaticPayment: true
          },
          {
            date: "2025-01-03",
            amount: 11.99,
            currency: "USD",
            uyuAmount: 541.72,
            exchangeRate: 45.18,
            status: "paid",
            method: "debit_6039",
            automaticPayment: true
          }
        ],
        monthlyMetrics: {
          totalPaid: 1083.44,
          nextPayment: {
            date: "2025-02-03",
            estimatedAmount: 541.72
          }
        }
      },
      {
        id: "CHATGPT-2024",
        name: "ChatGPT Plus",
        price: {
          amount: 20.00,
          currency: "USD",
          uyuEquivalent: 912.54,
          exchangeRate: 45.627
        },
        billingCycle: "monthly",
        paymentMethod: "debit_6039",
        billingDay: 20,
        status: "active",
        contract: null,
        paymentHistory: [
          {
            date: "2024-10-10",
            amount: 20.00,
            currency: "USD",
            uyuAmount: 933,
            exchangeRate: 46.65,
            status: "paid",
            method: "debit_2477",
            automaticPayment: true,
            details: "Pago con tarjeta anterior"
          },
          {
            date: "2024-11-10",
            amount: 20.00,
            currency: "USD",
            uyuAmount: 933,
            exchangeRate: 46.65,
            status: "paid",
            method: "debit_2477",
            automaticPayment: true,
            details: "Último pago con tarjeta anterior"
          },
          {
            date: "2024-12-20",
            amount: 20.00,
            currency: "USD",
            uyuAmount: 912.54,
            exchangeRate: 45.627,
            status: "paid",
            method: "debit_6039",
            automaticPayment: true,
            operationNumber: "435521550125",
            details: "Primer pago con nueva tarjeta"
          }
        ],
        monthlyMetrics: {
          totalPaid: 2778.54,
          nextPayment: {
            date: "2025-01-20",
            estimatedAmount: 912.54
          }
        }
      },
      {
        id: "CLDE-2024",
        name: "Claude Pro",
        price: {
          amount: 20.00,
          currency: "USD",
          uyuEquivalent: 900,
          exchangeRate: 45.00
        },
        billingCycle: "monthly",
        paymentMethod: "debit_6039",
        billingDay: 3,
        status: "active",
        contract: null,
        paymentHistory: [
          {
            date: "2024-11-22",
            amount: 20.00,
            currency: "USD",
            uyuAmount: 900,
            exchangeRate: 45.00,
            status: "paid",
            method: "debit_6039",
            automaticPayment: true
          },
          {
            date: "2025-01-03",
            amount: 20.00,
            currency: "USD",
            uyuAmount: 900,
            exchangeRate: 45.00,
            status: "paid",
            method: "debit_6039",
            automaticPayment: true
          }
        ],
        monthlyMetrics: {
          totalPaid: 1800,
          nextPayment: {
            date: "2025-02-03",
            estimatedAmount: 900
          }
        }
      },
      {
        id: "GONE-2024",
        name: "Google One",
        price: {
          amount: 20.00,
          currency: "USD",
          uyuEquivalent: 887.56,
          exchangeRate: 44.38
        },
        billingCycle: "annual",
        paymentMethod: "debit_6039",
        billingDay: 1,
        status: "active",
        contract: {
          startDate: "2024-12-01",
          renewalDate: "2025-12-01",
          cancellationDate: null,
          duration: "12 months",
          progress: ((new Date() - new Date("2024-12-01")) / (365 * 24 * 60 * 60 * 1000)) * 100,
          isFixed: true,
          monthlyEquivalent: 73.96
        },
        paymentHistory: [
          {
            date: "2024-12-01",
            amount: 20.00,
            currency: "USD",
            uyuAmount: 887.56,
            exchangeRate: 44.38,
            status: "paid",
            method: "debit_6039",
            automaticPayment: true,
            billingCycle: "annual"
          }
        ],
        monthlyMetrics: {
          totalPaid: 887.56,
          nextPayment: {
            date: "2025-12-01",
            estimatedAmount: 887.56
          }
        }
      },
      {
        id: "ANTL-2024",
        name: "Plan Antel",
        price: {
          amount: 520,
          currency: "UYU",
          uyuEquivalent: 520
        },
        billingCycle: "monthly",
        paymentMethod: "debit_6039",
        billingDay: null,
        status: "active",
        contract: {
          startDate: "2024-10-31",
          renewalDate: "2026-10-31",
          cancellationDate: null,
          duration: "24 months",
          progress: 1,
          isFixed: true,
          details: "Contrato obligatorio de 24 meses"
        },
        paymentHistory: [
          {
            date: "2024-11-22",
            amount: 163.76,
            currency: "UYU",
            status: "paid",
            method: "debit_6039",
            automaticPayment: true,
            details: "Pago prorrateo primer mes"
          },
          {
            date: "2024-12-22",
            amount: 590.00,
            currency: "UYU",
            status: "paid",
            method: "debit_6039",
            automaticPayment: true,
            details: "Pago Diciembre mes 2"
          }
        ],
        monthlyMetrics: {
          totalPaid: 753.76,
          nextPayment: {
            date: "2025-01-22",
            estimatedAmount: 590
          }
        }
      },
      {
        id: "ALQ-IGN-2024",
        name: "Alquiler Ignacio",
        price: {
          amount: 8500,
          currency: "UYU",
          uyuEquivalent: 8500
        },
        billingCycle: "monthly",
        paymentMethod: "debit_6039",
        billingDay: 3,
        status: "active",
        contract: {
          startDate: "2024-12-01",
          renewalDate: "2025-12-01",
          cancellationDate: null,
          duration: "12 months",
          progress: 8.33,
          isFixed: true
        },
        paymentHistory: [
          {
            date: "2024-12-03",
            amount: 8500,
            currency: "UYU",
            status: "paid",
            method: "debit_6039",
            automaticPayment: true
          },
          {
            date: "2025-01-05",
            amount: 8500,
            currency: "UYU",
            status: "paid",
            method: "transfer_6039",
            automaticPayment: false,
            operationNumber: "2501050386343682",
            details: "Transferencia a Celular"
          }
        ],
        monthlyMetrics: {
          totalPaid: 17000,
          nextPayment: {
            date: "2025-02-05",
            estimatedAmount: 8500
          }
        }
      },
      {
        id: "BARB-2024",
        name: "Barbería",
        price: {
          amount: 820,
          currency: "UYU",
          uyuEquivalent: 820
        },
        billingCycle: "monthly",
        paymentMethod: "debit_6039",
        billingDay: 20,
        status: "active",
        contract: null,
        paymentHistory: [
          {
            date: "2024-12-20",
            amount: 820,
            currency: "UYU",
            uyuAmount: 820,
            status: "paid",
            method: "debit_6039",
            automaticPayment: true,
            operationNumber: "435521968838"
          },
          {
            date: "2025-01-20",
            amount: 820,
            currency: "UYU",
            uyuAmount: 820,
            status: "paid",
            method: "debit_6039",
            automaticPayment: true
          }
        ],
        monthlyMetrics: {
          totalPaid: 1640,
          nextPayment: {
            date: "2025-02-20",
            estimatedAmount: 820
          }
        }
      }
    ]
  }
];

// Función para validar la coherencia de los datos
const validateServices = () => {
  services.forEach(category => {
    category.items.forEach(service => {
      // Validar precios y equivalencias
      if (service.price.currency === "USD" && 
          Math.abs(service.price.amount * service.price.exchangeRate - 
                  service.price.uyuEquivalent) > 0.1) {
        console.warn(`Discrepancia en equivalencia UYU para ${service.name}`);
      }

      // Validar historial de pagos
      const totalPaidCalculated = service.paymentHistory.reduce((sum, payment) => 
        sum + (payment.uyuAmount || payment.amount), 0);
      
      if (Math.abs(totalPaidCalculated - service.monthlyMetrics.totalPaid) > 0.1) {
        console.warn(`Discrepancia en total pagado para ${service.name}`);
      }

      // Validar contratos
      if (service.contract) {
        const startDate = new Date(service.contract.startDate);
        const renewalDate = new Date(service.contract.renewalDate);
        const duration = service.contract.duration.split(' ')[0];
        
        const expectedRenewalDate = new Date(startDate);
        expectedRenewalDate.setMonth(expectedRenewalDate.getMonth() + parseInt(duration));

        if (expectedRenewalDate.getTime() !== renewalDate.getTime()) {
          console.warn(`Discrepancia en fechas de contrato para ${service.name}`);
        }
      }
    });
  });
};

// Ejecutar validación al importar
validateServices();

export default services;
