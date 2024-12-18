const income = [
  {
    id: "INC-2024-001",
    type: "SITIO_WEB",
    description: "Pagos Expande Digital",
    amount: 20000,
    date: "2024-12-05",
    recipient: "Ignacio",
    category: "FREELANCE",
    paymentMethod: "transfer_6039",
    status: "received",
    details: "Pago por mantenimiento y desarrollo web diciembre",
    recurrence: {
      type: "monthly",
      expectedDay: 5
    },
    metrics: {
      monthlyAverage: 20000,
      yearlyProjection: 240000
    }
  },
  {
    id: "INC-2024-002",
    type: "PROYECTO_WEB",
    description: "Primer pago Cliente A - Landing Page",
    amount: 15000,
    date: "2024-12-10",
    recipient: "Ignacio",
    category: "FREELANCE_PROJECT",
    paymentMethod: "transfer_6039",
    status: "received",
    details: "Primer pago de dos por desarrollo de landing page",
    projectDetails: {
      totalAmount: 30000,
      remainingPayments: 1,
      nextPaymentDate: "2024-12-20",
      deliverables: "Landing page corporativa"
    }
  },
  {
    id: "INC-2024-003",
    type: "CERTIFICACIÓN_MÉDICA",
    description: "BPS Certificación",
    amount: 8500,
    date: "2024-12-15",
    recipient: "Ignacio",
    category: "MEDICAL_LEAVE",
    paymentMethod: "transfer_6039",
    status: "pending",
    details: "Certificación médica por 5 días",
    period: {
      startDate: "2024-12-10",
      endDate: "2024-12-15"
    }
  }
];

// Función de validación para verificar la integridad de los datos
const validateIncome = () => {
  income.forEach(entry => {
    // Verificar campos requeridos
    const requiredFields = ['id', 'type', 'amount', 'date', 'recipient'];
    requiredFields.forEach(field => {
      if (!entry[field]) {
        console.warn(`Campo requerido faltante: ${field} en entrada de ingreso ${entry.id}`);
      }
    });

    // Verificar métricas para ingresos recurrentes
    if (entry.recurrence?.type === 'monthly' && entry.metrics) {
      const expectedYearly = entry.metrics.monthlyAverage * 12;
      if (entry.metrics.yearlyProjection !== expectedYearly) {
        console.warn(`Discrepancia en proyección anual para ingreso ${entry.id}: 
          Calculado (${expectedYearly}) ≠ Registrado (${entry.metrics.yearlyProjection})`);
      }
    }

    // Verificar proyectos
    if (entry.projectDetails) {
      if (entry.projectDetails.totalAmount < entry.amount) {
        console.warn(`Error en monto de proyecto ${entry.id}: 
          Monto total (${entry.projectDetails.totalAmount}) es menor que el pago actual (${entry.amount})`);
      }
    }
  });
};

// Ejecutar validación al importar
validateIncome();

export default income;
