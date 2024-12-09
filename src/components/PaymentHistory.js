import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Box,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { AlertCircle, Calendar, CreditCard } from 'lucide-react';
import formatters from '../utils/formatters';

const PaymentHistory = ({ loan }) => {
  // Calcular progreso y montos
  const progress = (loan.paidInstallments / loan.installments) * 100;
  const totalPaid = loan.paymentHistory.reduce((sum, payment) => 
    sum + payment.amount, 0);
  const totalAmount = loan.amount * loan.installments;
  const remainingAmount = totalAmount - totalPaid;

  // Determinar si hay pagos atrasados
  const today = new Date();
  const hasOverduePayment = loan.nextPaymentDate && 
    new Date(loan.nextPaymentDate) < today;

  return (
    <Card variant="outlined" className="mt-4">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Historial de Pagos - {loan.name}
          </Typography>
          {hasOverduePayment && (
            <Tooltip title="Pago vencido">
              <AlertCircle color="error" size={20} />
            </Tooltip>
          )}
        </Box>

        {/* Resumen de pagos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Progreso de pago
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{ mb: 1 }} 
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">
              {loan.paidInstallments} de {loan.installments} cuotas
            </Typography>
            <Typography variant="caption">
              {progress.toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        {/* Resumen financiero */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: 2, 
          mb: 3,
          bgcolor: 'background.default',
          p: 2,
          borderRadius: 1
        }}>
          <Box>
            <Typography variant="caption" display="block" color="text.secondary">
              Total a pagar
            </Typography>
            <Typography variant="subtitle2">
              {formatters.currency(totalAmount)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" display="block" color="text.secondary">
              Pagado
            </Typography>
            <Typography variant="subtitle2" color="success.main">
              {formatters.currency(totalPaid)}
            </Typography>
          </Box>
          <Box>
             <Typography variant="caption" display="block" color="text.secondary">
              Restante
            </Typography>
            <Typography variant="subtitle2" color="warning.main">
              {formatters.currency(remainingAmount)}
            </Typography>
          </Box>
        </Box>

        {/* Historial de pagos */}
        <List>
          {loan.paymentHistory.map((payment, index) => (
            <ListItem 
              key={index} 
              divider
              sx={{
                bgcolor: payment.status === 'late' ? 'error.light' : 'transparent'
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={16} />
                    {formatters.date(payment.date)}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <CreditCard size={16} />
                    {payment.method ? formatters.paymentMethod(payment.method) : 'Método no especificado'}
                  </Box>
                }
              />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {formatters.currency(payment.amount)}
                </Typography>
                <Chip
                  label={formatters.paymentStatus(payment.status)}
                  color={payment.status === 'paid' ? 'success' : 
                         payment.status === 'pending' ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
            </ListItem>
          ))}
        </List>

        {/* Próximo pago */}
        {loan.nextPaymentDate && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: hasOverduePayment ? 'error.light' : 'info.light',
            borderRadius: 1
          }}>
            <Typography 
              variant="subtitle2" 
              color={hasOverduePayment ? 'error' : 'text.secondary'}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Calendar size={16} />
              Próximo vencimiento: {formatters.date(loan.nextPaymentDate)}
              {loan.amount && (
                <span style={{ marginLeft: 'auto' }}>
                  {formatters.currency(loan.amount)}
                </span>
              )}
            </Typography>
            {hasOverduePayment && loan.moratory && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                Mora aplicable: {loan.moratory}% 
                ({formatters.currency(loan.amount * (loan.moratory / 100))}/mes)
              </Typography>
            )}
          </Box>
        )}

        {/* Estado del préstamo */}
        {loan.status === 'completed' && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Chip
              label="Préstamo Completado"
              color="success"
              sx={{ width: '100%' }}
            />
          </Box>
        )}

        {/* Información adicional del préstamo */}
        {loan.interestRate > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Información de intereses
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2">
                TEA: {loan.interestRate}%
              </Typography>
              <Typography variant="body2">
                Mora: {loan.moratory}%
              </Typography>
            </Box>
          </Box>
        )}

        {/* Información de cuenta asociada */}
        {loan.account && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Cuenta asociada
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {formatters.paymentMethod(loan.account)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
