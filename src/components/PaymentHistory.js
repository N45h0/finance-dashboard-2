import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Chip
} from '@mui/material';
import formatters from '../utils/formatters';

const PaymentHistory = ({ loan }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Historial de Pagos - {loan.name}
        </Typography>
        <List>
          {loan.paymentHistory.map((payment, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={formatters.date(payment.date)}
                secondary={formatters.currency(payment.amount)}
              />
              <Chip
                label={payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                color={payment.status === 'paid' ? 'success' : 'warning'}
                size="small"
              />
            </ListItem>
          ))}
        </List>
        <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
          Próximo vencimiento: {formatters.date(loan.nextPaymentDate)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
