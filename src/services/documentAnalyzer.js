const documentPatterns = {
  SALARY_ADVANCE: {
    patterns: [
      'UTILIZACIÓN ADELANTO DE SUELDO',
      'COBRO DE ADS',
      'ADELANTO DE SUELDO',
      'ADELANTO SALARIAL'
    ],
    type: 'salary_advance',
    category: 'income'
  },
  LOAN: {
    patterns: [
      'PRÉSTAMO PERSONAL',
      'CRÉDITO',
      'CUOTA PRÉSTAMO',
      'PLAN DE PAGOS',
      'TEA',
      'TASA EFECTIVA ANUAL',
      'CAPITAL PRESTADO',
      'MONTO SOLICITADO'
    ],
    type: 'loan',
    category: 'credit'
  },
  CREDIT_CARD: {
    patterns: [
      'ESTADO DE CUENTA',
      'TARJETA DE CRÉDITO',
      'PAGO MÍNIMO',
      'FECHA DE VENCIMIENTO',
      'SALDO ANTERIOR',
      'CONSUMOS DEL MES'
    ],
    type: 'credit_card',
    category: 'credit'
  },
  PURCHASE: {
    patterns: [
      'FACTURA',
      'BOLETA',
      'RUT',
      'TOTAL A PAGAR',
      'SUBTOTAL',
      'IVA',
      'TICKET'
    ],
    type: 'purchase',
    category: 'expense'
  },
  UTILITY_BILL: {
    patterns: [
      'CONSUMO',
      'SERVICIO',
      'FACTURACIÓN',
      'PERÍODO',
      'VENCIMIENTO',
      'CÓDIGO DE PAGO',
      'TOTAL A PAGAR'
    ],
    type: 'utility_bill',
    category: 'expense'
  },
  BANK_STATEMENT: {
    patterns: [
      'ESTADO DE CUENTA',
      'SALDO ANTERIOR',
      'SALDO ACTUAL',
      'MOVIMIENTOS',
      'DÉBITOS',
      'CRÉDITOS',
      'TRANSFERENCIAS'
    ],
    type: 'bank_statement',
    category: 'account'
  },
  PAYMENT_RECEIPT: {
    patterns: [
      'COMPROBANTE DE PAGO',
      'RECIBO',
      'CONSTANCIA',
      'VALOR RECIBIDO',
      'PAGADO'
    ],
    type: 'payment_receipt',
    category: 'transaction'
  },
  SALARY_RECEIPT: {
    patterns: [
      'RECIBO DE SUELDO',
      'NÓMINA',
      'SALARIO',
      'HABERES',
      'DEDUCCIONES',
      'LÍQUIDO A COBRAR'
    ],
    type: 'salary_receipt',
    category: 'income'
  }
};

export const analyzeDocument = (text) => {
  const results = [];
  const foundPatterns = new Set();

  // Normalizar el texto para la búsqueda
  const normalizedText = text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  Object.entries(documentPatterns).forEach(([docType, info]) => {
    info.patterns.forEach(pattern => {
      const normalizedPattern = pattern.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalizedText.includes(normalizedPattern)) {
        foundPatterns.add(docType);
      }
    });
  });

  foundPatterns.forEach(docType => {
    const info = documentPatterns[docType];
    results.push({
      type: info.type,
      category: info.category,
      confidence: calculateConfidence(text, info.patterns),
      details: extractRelevantDetails(text, info.type)
    });
  });

  return results.length > 0 ? 
    results.sort((a, b) => b.confidence - a.confidence) : 
    [{
      type: 'unknown',
      category: 'unclassified',
      confidence: 0,
      details: null
    }];
};

const calculateConfidence = (text, patterns) => {
  let matches = 0;
  const normalizedText = text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  patterns.forEach(pattern => {
    const normalizedPattern = pattern.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedText.includes(normalizedPattern)) {
      matches++;
    }
  });

  return (matches / patterns.length) * 100;
};

const extractRelevantDetails = (text, type) => {
  const details = {
    dates: extractDates(text),
    amounts: extractAmounts(text),
    documentNumber: extractDocumentNumber(text)
  };

  switch (type) {
    case 'loan':
      details.interestRate = extractInterestRate(text);
      details.installments = extractInstallments(text);
      break;
    case 'credit_card':
      details.dueDate = extractDueDate(text);
      details.minimumPayment = extractMinimumPayment(text);
      break;
    case 'utility_bill':
      details.serviceProvider = extractServiceProvider(text);
      details.servicePeriod = extractServicePeriod(text);
      break;
    // Agregar más casos según sea necesario
  }

  return details;
};

// Funciones auxiliares de extracción
const extractDates = (text) => {
  const datePatterns = [
    /\d{2}\/\d{2}\/\d{4}/g,
    /\d{2}\-\d{2}\-\d{4}/g,
    /\d{1,2}\s+de\s+[A-Za-zÀ-ÿ]+\s+de\s+\d{4}/g
  ];
  
  let dates = [];
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) dates = [...dates, ...matches];
  });
  
  return dates;
};

const extractAmounts = (text) => {
  const amountPatterns = [
    /\$\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g,
    /USD\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g,
    /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s*(?:PESOS|DÓLARES)/g
  ];
  
  let amounts = [];
  amountPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) amounts = [...amounts, ...matches];
  });
  
  return amounts;
};

const extractDocumentNumber = (text) => {
  const documentPatterns = [
    /(?:N°|Nro\.|Número):\s*\d+/i,
    /(?:Factura|Recibo|Comprobante)\s*#?\s*\d+/i
  ];

  for (const pattern of documentPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  
  return null;
};

// Exportar todas las funciones necesarias
export const documentUtils = {
  analyzeDocument,
  documentPatterns,
  extractRelevantDetails
};
