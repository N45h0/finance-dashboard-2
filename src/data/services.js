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
          }
        ],
        monthlyMetrics: {
          totalPaid: 541.72,
          nextPayment: {
            date: "2025-01-03",
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
          uyuEquivalent: 933,
          exchangeRate: 46.65
        },
        billingCycle: "monthly",
        paymentMethod: "debit_2477",
        billingDay: 10,
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
            automaticPayment: true
          },
          {
            date: "2024-11-10",
            amount: 20.00,
            currency: "USD",
            uyuAmount: 933,
            exchangeRate: 46.65,
            status: "paid",
            method: "debit_2477",
            automaticPayment: true
          }
        ],
        monthlyMetrics: {
          totalPaid: 1866,
          nextPayment: {
            date: "2024-12-10",
            estimatedAmount: 933
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
        billingDay: 22,
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
          }
        ],
        monthlyMetrics: {
          totalPaid: 900,
          nextPayment: {
            date: "2024-12-22",
            estimatedAmount: 900
          }
        }
      },
      {
        id: "GONE-2024",
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
          // Calcular el progreso basado en días transcurridos desde startDate
          progress: ((new Date() - new Date("2024-12-01")) / (365 * 24 * 60 * 60 * 1000)) * 100,
          isFixed: true,
          monthlyEquivalent: 73.96  // 887.56 / 12
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
            date: "2025-12-01",  // Corregido para reflejar el ciclo anual
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
          }
        ],
        monthlyMetrics: {
          totalPaid: 163.76,
          nextPayment: {
            date: "2024-12-22",
            estimatedAmount: 520
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
