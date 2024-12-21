import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Alert } from '@mui/material';
import { Calendar } from 'lucide-react';
import formatters from '../utils/formatters';

const PaymentSummary = () => {
  const payments = [
    // Servicios
    {
      name: "Barbería",
      amount: 820.00,
      dueDate: "2025-01-20",
      type: "service",
      account: "6039"
    },
    {
      name: "Spotify Premium Familiar",
      amount: 541.72,
      dueDate: "2025-01-03",
      type: "service",
      account: "6039"
    },
    {
      name: "ChatGPT Plus",
      amount: 912.54,
      dueDate: "2025-01-10",
      type: "service",
      account: "2477"
    },
    {
      name: "Plan Antel + Refinanciamiento",
      amount: 1139.00,
      dueDate: "2025-01-22",
      type: "service",
      account: "6039"
    },
    // Préstamos
    {
      name: "BROU Viaje Argentina",
      amount: 1411.58,
      dueDate: "2025-01-01",
      type: "loan",
      account: "8475"
    },
    {
      name: "BROU Dentista",
      amount: 1916.39,
      dueDate: "2025-01-03",
      type: "loan",
      account: "6039"
    },
    {
      name: "BROU Buenos Aires",
      amount: 1801.64,
      dueDate: "2025-01-03",
      type: "loan",
      account: "6039"
    }
  ];

  // Agrupar por cuenta
  const accountGroups = payments.reduce((groups, payment) => {
    if (!groups[payment.account]) {
      groups[payment.account] = [];
    }
    groups[payment.account].push(payment);
    return groups;
  }, {});

  // Calcular totales por tipo
  const totals = payments.reduce((acc, payment) => {
    acc.total += payment.amount;
    if (payment.type === 'loan') {
      acc.loans += payment.amount;
    } else {
      acc.services += payment.amount;
    }
    return acc;
  }, { total: 0, loans: 0, services: 0 });

  return (
    <div>
      {Object.entries(accountGroups).map(([account, accountPayments]) => {
        const accountTotal = accountPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const accountName = account === "6039" ? "Brou Débito 6039" : 
                          account === "2477" ? "Visa Santander Débito 2477" : 
                          account === "8475" ? "BROU Mastercard 8475" : 
                          `Cuenta ${account}`;

        return (
          <Box key={account} sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
              <Typography variant="h6" gutterBottom>
                {accountName}
              </Typography>
            </Box>
            
            <Box sx={{ p: 2 }}>
              {accountPayments.map((payment, index) => (
                <Box key={index} sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: index < accountPayments.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none'
                }}>
                  <Box>
                    <Typography variant="body1">{payment.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <Calendar size={16} />
                      <Typography variant="body2">
                        {formatters.date(payment.dueDate)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1">
                      {formatters.currency(payment.amount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {payment.type === 'loan' ? 'Préstamo' : 'Servicio'}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              <Box sx={{ 
                mt: 2, 
                pt: 2, 
                borderTop: '2px solid rgba(0,0,0,0.12)', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6">Total Cuenta</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatters.currency(accountTotal)}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}

      <Box sx={{ 
        mt: 3, 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        borderRadius: 1,
        boxShadow: 2
      }}>
        <Typography variant="h6" gutterBottom>Resumen Total Mensual</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="body2">Préstamos</Typography>
            <Typography variant="h6">{formatters.currency(totals.loans)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2">Servicios</Typography>
            <Typography variant="h6">{formatters.currency(totals.services)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2">Total</Typography>
            <Typography variant="h6">{formatters.currency(totals.total)}</Typography>
          </Box>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          * Todos los montos están en pesos uruguayos (UYU).
          * Las fechas de vencimiento son estimadas y pueden variar.
        </Typography>
      </Alert>
    </div>
  );
};

export default PaymentSummary;
