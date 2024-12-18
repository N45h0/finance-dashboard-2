import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  Clock,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';
import formatters from '../utils/formatters';

const IncomeTab = ({ income }) => {
  // Calcular totales
  const totalReceived = income
    .filter(inc => inc.status === 'received')
    .reduce((sum, inc) => sum + inc.amount, 0);
  
  const totalPending = income
    .filter(inc => inc.status === 'pending')
    .reduce((sum, inc) => sum + inc.amount, 0);

  const totalProjected = income
    .filter(inc => inc.projectDetails?.remainingPayments > 0)
    .reduce((sum, inc) => sum + (inc.projectDetails.totalAmount - inc.amount), 0);

  // Separar por categorías
  const recurringIncome = income.filter(inc => inc.recurrence);
  const projectIncome = income.filter(inc => inc.projectDetails);
  const otherIncome = income.filter(inc => !inc.recurrence && !inc.projectDetails);

  return (
    <Box sx={{ p: 2 }}>
      {/* Resumen General */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Recibido
              </Typography>
              <Typography variant="h4">
                {formatters.currency(totalReceived)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Pendiente de Cobro
              </Typography>
              <Typography variant="h4">
                {formatters.currency(totalPending)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'info.light' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Proyectado
              </Typography>
              <Typography variant="h4">
                {formatters.currency(totalProjected)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ingresos Recurrentes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <RefreshCcw size={20} style={{ marginRight: 8 }} />
            <Typography variant="h6">Ingresos Recurrentes</Typography>
          </Box>
          <List>
            {recurringIncome.map((income) => (
              <ListItem
                key={income.id}
                divider
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' }
                }}
              >
                <ListItemText
                  primary={income.description}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Calendar size={16} />
                      {`Día ${income.recurrence.expectedDay} de cada mes`}
                    </Box>
                  }
                />
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-end',
                  mt: { xs: 2, sm: 0 }
                }}>
                  <Typography variant="h6">
                    {formatters.currency(income.amount)}
                  </Typography>
                  <Chip
                    size="small"
                    label={income.status === 'received' ? 'Recibido' : 'Pendiente'}
                    color={income.status === 'received' ? 'success' : 'warning'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Ingresos por Proyectos */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DollarSign size={20} style={{ marginRight: 8 }} />
            <Typography variant="h6">Ingresos por Proyectos</Typography>
          </Box>
          <List>
            {projectIncome.map((income) => (
              <ListItem
                key={income.id}
                divider
                sx={{ flexDirection: 'column', alignItems: 'stretch' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">{income.description}</Typography>
                  <Typography variant="h6">
                    {formatters.currency(income.amount)}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progreso del proyecto
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(income.amount / income.projectDetails.totalAmount) * 100}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" display="block" textAlign="right">
                    {`${formatters.currency(income.amount)} de ${formatters.currency(income.projectDetails.totalAmount)}`}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    size="small"
                    label={`${income.projectDetails.remainingPayments} pagos restantes`}
                    color="info"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={16} />
                    <Typography variant="body2">
                      Próximo pago: {formatters.date(income.projectDetails.nextPaymentDate)}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Otros Ingresos */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AlertTriangle size={20} style={{ marginRight: 8 }} />
            <Typography variant="h6">Otros Ingresos</Typography>
          </Box>
          <List>
            {otherIncome.map((income) => (
              <ListItem
                key={income.id}
                divider
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' }
                }}
              >
                <ListItemText
                  primary={income.description}
                  secondary={income.details}
                />
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-end',
                  mt: { xs: 2, sm: 0 }
                }}>
                  <Typography variant="h6">
                    {formatters.currency(income.amount)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Calendar size={16} />
                    <Typography variant="body2">
                      {formatters.date(income.date)}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IncomeTab;
