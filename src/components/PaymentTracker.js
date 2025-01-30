import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { Calendar, CreditCard, DollarSign } from 'lucide-react';
import formatters from '../utils/formatters';

const PaymentTracker = ({ payments }) => {
  // Agrupar pagos por mes
  const groupedPayments = payments.reduce((groups, payment) => {
    const date = new Date(payment.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(payment);
    return groups;
  }, {});

  // Calcular totales por mes
  const calculateMonthlyTotal = (monthPayments) => {
    return monthPayments.reduce((total, payment) => total + payment.uyuAmount, 0);
  };

  return (
    <Box sx={{ mt: 3 }}>
      {Object.entries(groupedPayments)
        .sort((a, b) => b[0].localeCompare(a[0])) // Ordenar por mes, más reciente primero
        .map(([monthYear, monthPayments]) => (
          <Card key={monthYear} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {new Date(monthYear + '-01').toLocaleDateString('es-UY', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Typography>
                <Typography variant="h6">
                  Total: {formatters.currency(calculateMonthlyTotal(monthPayments))}
                </Typography>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Servicio</TableCell>
                      <TableCell>Monto</TableCell>
                      <TableCell>Método</TableCell>
                      <TableCell>Detalles</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthPayments
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Calendar size={16} />
                              {formatters.date(payment.date)}
                            </Box>
                          </TableCell>
                          <TableCell>{payment.serviceName}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <DollarSign size={16} />
                              {payment.currency === 'USD' 
                                ? <span>
                                    {formatters.currency(payment.amount, 'USD')}
                                    <Typography variant="body2" color="text.secondary">
                                      ({formatters.currency(payment.uyuAmount)})
                                    </Typography>
                                  </span>
                                : formatters.currency(payment.amount)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CreditCard size={16} />
                              <Chip 
                                label={formatters.paymentMethod(payment.method)}
                                size="small"
                                color={payment.automaticPayment ? "success" : "default"}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {payment.description}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))}
    </Box>
  );
};

export default PaymentTracker;
