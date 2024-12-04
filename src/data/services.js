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
         uyuEquivalent: 541.72
       },
       billingCycle: "monthly",
       paymentMethod: "debit_6039",
       billingDay: 3,
       contract: null,
       paymentHistory: [
         {
           date: "2024-12-03",
           amount: 11.99,
           currency: "USD",
           uyuAmount: 541.72,
           status: "paid",
           method: "debit_6039"
         }
       ]
     },
     {
       id: "CHATGPT-2024",
       name: "ChatGPT Plus",
       price: {
         amount: 20.00,
         currency: "USD",
         uyuEquivalent: 933
       },
       billingCycle: "monthly",
       paymentMethod: "debit_2477",
       billingDay: 10,
       contract: null,
       paymentHistory: [
         {
           date: "2024-12-10",
           amount: 20.00,
           currency: "USD",
           status: "pending",
           method: "debit_2477"
         },
         {
           date: "2024-11-10",
           amount: 20.00,
           currency: "USD",
           status: "paid",
           method: "debit_2477"
         },
         {
           date: "2024-10-10",
           amount: 20.00,
           currency: "USD",
           status: "paid",
           method: "debit_2477"
         },
         {
           date: "2024-09-10",
           amount: 20.00,
           currency: "USD",
           status: "paid",
           method: "debit_2477"
         }
       ]
     },
     {
       id: "CLDE-2024",
       name: "Claude Pro",
       price: {
         amount: 20.00,
         currency: "USD",
         uyuEquivalent: 900
       },
       billingCycle: "monthly",
       paymentMethod: "debit_6039",
       billingDay: 22,
       contract: null,
       paymentHistory: [
         {
           date: "2024-11-22",
           amount: 20.00,
           currency: "USD",
           uyuAmount: 900,
           status: "paid",
           method: "debit_6039"
         }
       ]
     },
     {
       id: "GONE-2024",
       name: "Google One",
       price: {
         amount: 20.00,
         currency: "USD",
         uyuEquivalent: 887.56
       },
       billingCycle: "annual",
       paymentMethod: "debit_6039",
       billingDay: 2,
       contract: {
         startDate: "2024-12-02",
         renewalDate: "2025-12-01",
         cancellationDate: null,
         duration: "12 months",
         progress: 0,
         isFixed: true
       },
       paymentHistory: [
         {
           date: "2024-12-02",
           amount: 20.00,
           currency: "USD",
           uyuAmount: 887.56,
           status: "paid",
           method: "debit_6039"
         }
       ]
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
       paymentMethod: "manual_6039",
       billingDay: null,
       contract: {
         startDate: "2024-10-31",
         renewalDate: "2026-10-31",
         cancellationDate: null,
         duration: "24 months",
         progress: 0,
         isFixed: true,
         details: "Contrato obligatorio de 24 meses"
       },
       paymentHistory: [
         {
           date: "2024-11-22",
           amount: 742.78,
           currency: "UYU",
           status: "paid",
           method: "manual_6039",
           details: "Pago parcial plan + refinanciamiento"
         },
         {
           date: "2024-10-31",
           amount: null,
           currency: "UYU",
           status: "contract_start",
           method: null,
           details: "Inicio de contrato a 24 meses"
         }
       ]
     },
     {
       id: "ANTL-REF-2024",
       name: "Refinanciamiento Antel",
       price: {
         amount: 549.02,
         currency: "UYU",
         uyuEquivalent: 549.02
       },
       billingCycle: "monthly",
       paymentMethod: "manual_6039",
       billingDay: null,
       contract: {
         startDate: "2024-10-31",
         renewalDate: "2025-07-31",
         cancellationDate: null,
         duration: "9 months",
         progress: 0,
         isFixed: true,
         details: "Refinanciamiento en 9 cuotas fijas"
       },
       paymentHistory: [
         {
           date: "2024-11-22",
           amount: null,
           currency: "UYU",
           status: "paid",
           method: "manual_6039",
           details: "Incluido en pago parcial plan + refinanciamiento"
         },
         {
           date: "2024-10-31",
           amount: null,
           currency: "UYU",
           status: "contract_start",
           method: null,
           details: "Inicio de refinanciamiento a 9 cuotas"
         }
       ]
     }
   ]
 }
];

export default services;
