import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Alert,
  Box
} from '@mui/material';
import { CreditCard } from 'lucide-react';
import formatters from '../utils/formatters';

const accounts = [
  {
    id: "6039",
    name: "Brou Débito 6039",
    type: "Visa débito",
    expiry: "03/2029",
    status: "active",
    primary: true,
    income: [
      {
        source: "Pagos Expande Digital",
        frequency: "monthly",
        estimatedAmount: 20000,
        paymentDay: 5
      }
    ],
    services: [
      {
        name: "Spotify Premium Familiar",
        billingDay: 3,
        automatic: true,
        amount: 541.72
      },
      {
        name: "Claude Pro",
        billingDay: 22,
        automatic: true,
        amount: 900
      },
      {
        name: "Google One",
        billingDay: 1,
        automatic: true,
        amount: 887.56,
        billingCycle: "annual"
      },
      {
        name: "Plan Antel",
        automatic: true,
        amount: 520
      },
      {
        name: "Refinanciamiento Antel",
        automatic: true,
        amount: 549.02
      }
    ],
    linkedLoans: [
      {
        name: "BROU Viaje Argentina",
        amount: 1411.58,
        paymentDay: 1,
        automatic: false
      },
      {
        name: "BROU Dentista",
        amount: 1916.39,
        paymentDay: 3,
        automatic: true
      },
      {
        name: "BROU Buenos Aires",
        amount: 1801.64,
        paymentDay: 3,
        automatic: true
      }
    ],
    monthlyOutflow: {
      services: 3398.30,    // Suma de servicios mensuales
      loans: 5129.61,       // Suma de cuotas de préstamos
      total: 8527.91        // Total mensual
    },
    monthlyInflow: {
      estimated: 20000,     // Suma de ingresos estimados 
      services: 0,          // Reembolsos o devoluciones de servicios
      total: 20000
    },
    balance: {
      available: true,      // Indica si tenemos acceso al balance
      lastUpdate: null,     // Fecha de última actualización 
      amount: null          // Monto actual
    }
  },
  {
    id: "2477",
    name: "Visa Santander Débito",
    type: "Visa débito",
    status: "active", 
    primary: false,
    income: [
      {
        source: "Pasividades BPS",
        frequency: "monthly",
        estimatedAmount: 25000,
        paymentDay: 1
      },
      {
        source: "Sueldo Elared",
        frequency: "monthly",
        estimatedAmount: 30000,
        paymentDay: 5
      },
      {
        source: "Pagos Expande Digital",
        frequency: "monthly",
        estimatedAmount: 15000,
        paymentDay: 5
      }
    ],
    services: [
      {
        name: "ChatGPT Plus",
        billingDay: 10,
        automatic: true,
        amount: 933
      }
    ],
    monthlyOutflow: {
      services: 933,        // ChatGPT Plus
      loans: 0,            // No hay préstamos vinculados
      total: 933
    },
    monthlyInflow: {
      estimated: 70000,     // Suma de ingresos estimados
      services: 0,
      total: 70000  
    },
    balance: {
      available: true,
      lastUpdate: null,
      amount: null
    }
  },
  {
    id: "3879",
    name: "Prex Mastercard UY",
    type: "Prepago",
    status: "active",
    primary: false,
    backup: true,
    monthlyOutflow: {
      services: 0,
      loans: 0,
      total: 0
    },
    monthlyInflow: {
      estimated: 0, 
      services: 0,
      total: 0
    },
    balance: {
      available: true,
      lastUpdate: null, 
      amount: null
    }  
  }
];

// Función para validar la coherencia de los datos
const validateAccounts = () => {
  accounts.forEach(account => {
    // Verificar que los totales coincidan 
    const calculatedServicesOutflow = (account.services || [])
      .reduce((sum, service) => sum + (service.amount || 0), 0);
    
    const calculatedLoansOutflow = (account.linkedLoans || [])
      .reduce((sum, loan) => sum + (loan.amount || 0), 0);

    if (calculatedServicesOutflow !== account.monthlyOutflow.services) {
      console.warn(`Discrepancia en servicios de cuenta ${account.id}:`,
        `Calculado: ${calculatedServicesOutflow},`,
        `Registrado: ${account.monthlyOutflow.services}`);
    }

    if (calculatedLoansOutflow !== account.monthlyOutflow.loans) {
      console.warn(`Discrepancia en préstamos de cuenta ${account.id}:`,
        `Calculado: ${calculatedLoansOutflow},`, 
        `Registrado: ${account.monthlyOutflow.loans}`);
    }

    // Verificar coherencia de ingresos
    const calculatedInflow = (account.income || [])
      .reduce((sum, income) => sum + (income.estimatedAmount || 0), 0);

    if (calculatedInflow !== account.monthlyInflow.estimated) {
      console.warn(`Discrepancia en ingresos de cuenta ${account.id}:`,
        `Calculado: ${calculatedInflow},`,
        `Registrado: ${account.monthlyInflow.estimated}`); 
    }
  });
};

// Ejecutar validación al importar
validateAccounts();

// Componente AccountsTab
const AccountsTab = () => {
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    try {
      // Importar cuentas dinámicamente para evitar problemas de carga inicial
      import('../data/accounts').then(module => {
        setAccounts(module.default);
      }).catch(err => {
        setError('Error loading accounts data');
        console.error(err);
      });
    } catch (err) {
      setError('Error initializing accounts view'); 
      console.error(err);
    }
  }, []);

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}        
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {accounts.map((account) => (
        <Grid item xs={12} md={4} key={account.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {account.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditCard size={20} className="mr-2" />
                <Typography>{account.type}</Typography>
              </Box>
              {account.income && (
                <List>
                  {account.income.map((income, idx) => (
                    <ListItem key={idx}>
                      <ListItemText 
                        primary={income.source}
                        secondary={formatters.currency(income.estimatedAmount)} 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );  
};

export default accounts;