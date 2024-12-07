import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tabs, 
  Tab, 
  Alert, 
  AlertTitle, 
  LinearProgress, 
  Grid, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Button
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie 
} from 'recharts';
import { CreditCard, Calendar, AlertTriangle, Bell } from 'lucide-react';
import FileUploader from './FileUploader';
import { calculateLoans, calculateServices } from './utils/calculations';
import PaymentHistory from './components/PaymentHistory';
import formatters from './utils/formatters';


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Dashboard() {
  const [value, setValue] = useState(0);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [trialAlerts, setTrialAlerts] = useState([]);
  useEffect(() => {
    // Verificar pagos pendientes y trials
    const payments = calculateServices.getUpcomingPayments();
    const trials = calculateServices.getContractStatus();
    
    setPendingPayments(payments.filter(p => p.requiresProof));
    setTrialAlerts(trials);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const monthlyPayments = calculateLoans.getMonthlyPayments();
  const overdueLoans = calculateLoans.getOverdueLoans();
  const monthlyTotal = calculateServices.getMonthlyTotal();

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Financiero Personal
      </Typography>

      {/* Alertas de préstamos vencidos */}
      {overdueLoans.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Préstamos Vencidos</AlertTitle>
          {overdueLoans.map(loan => (
            <Typography key={loan.id}>
              {loan.name} - Próximo vencimiento: {formatters.date(loan.nextPaymentDate)}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Alerta de pagos mensuales */}
      <Alert severity="info" sx={{ mb: 3 }}>
        {monthlyPayments.message}
      </Alert>

      {/* Alertas de pruebas gratuitas */}
      {trialAlerts.map((trial, index) => (
        <Alert 
          key={index} 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => {
                // Aquí puedes agregar la lógica para gestionar la suscripción
                console.log('Gestionar suscripción:', trial);
              }}
            >
              Gestionar
            </Button>
          }
        >
          <AlertTitle>Prueba Gratuita por Vencer</AlertTitle></Alert></antArtifact>

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const serviceAlerts = services.map(category => 
    category.items
      .filter(service => {
        const today = new Date();
        const renewalDate = new Date(service.contract?.renewalDate);
        return renewalDate && (renewalDate - today) / (1000 * 60 * 60 * 24) <= 30;
      })
      .map(service => ({
        type: 'renewal',
        message: `${service.name} se renovará el ${formatters.date(service.contract.renewalDate)}`,
        severity: 'warning'
      }))
  ).flat();

  const totalLoans = loans.reduce((acc, loan) => acc + loan.capital, 0);
  const totalPaid = loans.reduce((acc, loan) => acc + (loan.capital * (loan.paidInstallments/loan.installments)), 0);
  const totalRemaining = totalLoans - totalPaid;
  const overallProgress = (totalPaid / totalLoans) * 100;

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Financiero Personal
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        Adelanto de sueldo vencido: {formatters.currency(4831.57)}
      </Alert>

      {serviceAlerts.map((alert, index) => (
        <Alert key={index} severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      ))}

      <Tabs value={value} onChange={handleChange}>
        <Tab label="Resumen" />
        <Tab label="Préstamos" />
        <Tab label="Servicios" />
        <Tab label="Cuentas" />
        <Tab label="Cargar Archivos" />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Resumen Global de Préstamos</Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 2 }}>
                  <Typography variant="body2">Monto Total Préstamos</Typography>
                  <Typography variant="h6">{formatters.currency(totalLoans)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 2 }}>
                  <Typography variant="body2">Monto Pagado</Typography>
                  <Typography variant="h6">{formatters.currency(totalPaid)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 2 }}>
                  <Typography variant="body2">Monto Restante</Typography>
                  <Typography variant="h6">{formatters.currency(totalRemaining)}</Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Progreso de Pago Total</Typography>
              <LinearProgress variant="determinate" value={overallProgress} sx={{ mt: 1 }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                {overallProgress.toFixed(1)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Resumen Mensual Total</Typography>
                <Typography variant="h4" sx={{ mt: 2 }}>{formatters.currency(monthlyTotal)}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2 
                  }}>
                    <Typography>LAFIO</Typography>
                    <Typography>{formatters.currency(14676.60)}</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <Typography>Lovia</Typography>
                    <Typography>{formatters.currency(23519.60)}</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate"
                      value={70}
                      sx={{ 
                        height: 8,
                        borderRadius: 4,
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "rgb(26, 23, 87)"
                        }
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Distribución por Titular</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'LAFIO', value: 14676.60, fill: "#1e40af" },
                          { name: 'Lovia', value: 23519.60, fill: "#a5b4fc" }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                      />
                      <Tooltip formatter={(value) => formatters.currency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'primary.light' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Capital Total</Typography>
                    <Typography variant="h5">
                      {formatters.currency(calculateLoans.getTotalCapital())}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Total Pagado</Typography>
                    <Typography variant="h5">
                      {formatters.currency(calculateLoans.getTotalPaid())}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Saldo Restante</Typography>
                    <Typography variant="h5">
                      {formatters.currency(calculateLoans.getRemainingBalance())}
                    </Typography>
                  </Grid>
                </Grid>
                <LinearProgress
                  variant="determinate"
                  value={(calculateLoans.getTotalPaid() / calculateLoans.getTotalCapital()) * 100}
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {loans.map(loan => (
            <Grid item xs={12} md={6} key={loan.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{loan.name}</Typography>
                  <Typography color="textSecondary">Titular: {loan.owner}</Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Capital</Typography>
                        <Typography>{formatters.currency(loan.capital)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Cuota</Typography>
                        <Typography>{formatters.currency(loan.amount)}</Typography>
                      </Grid>
                    </Grid>
                    
                    {loan.interestRate > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="error">
                          TEA: {loan.interestRate}% | Mora: {loan.moratory}%
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">
                        Progreso: {loan.paidInstallments}/{loan.installments} cuotas
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={calculateLoans.getProgress(loan)}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    
                    <PaymentHistory loan={loan} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {calculateLoans.getOverdueLoans().length > 0 && (
            <Grid item xs={12}>
              <Alert severity="error">
                <AlertTitle>Préstamos Vencidos</AlertTitle>
                {calculateLoans.getOverdueLoans().map(loan => (
                  <Typography key={loan.id}>
                    {loan.name} - Próximo vencimiento: {formatters.date(loan.nextPaymentDate)}
                  </Typography>
                ))}
              </Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Servicios Digitales (Cuenta 6039)</Typography>
                <List>
                  {services[0].items.map((service, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={service.name}
                        secondary={
                          <>
                            {formatters.currency(service.price.amount, service.price.currency)}
                            {service.price.currency === "USD" && 
                              `(${formatters.currency(service.price.uyuEquivalent)})`}
                            <br />
                            {service.billingCycle === 'annual' && '(Pago Anual)'}
                            {service.contract && (
                              <>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={service.contract.progress} 
                                  sx={{ mt: 1 }}
                                />
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                                  {service.contract.progress.toFixed(1)}%
                                </Typography>
                              </>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">
                    Total Servicios Mensuales: {formatters.currency(monthlyTotal)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Próximos Vencimientos</Typography>
                <List>
                  {upcomingPayments.map((payment, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Calendar />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${payment.service}`}
                        secondary={`${formatters.date(payment.date)} - ${formatters.currency(payment.amount)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6">Estado de Contratos</Typography>
                {contractStatus.map((contract, index) => (
                  <Box key={index} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">{contract.name}</Typography>
                    <LinearProgress 
                      variant="determinate"
                      value={contract.progress}
                      sx={{ mb: 1 }}
                    /> 
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                      {contract.progress.toFixed(1)}%
                      ({contract.daysUntilRenewal} días para renovación)
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} md={4} key={account.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{account.name} ({account.id})</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCard size={20} />
                      {account.type}
                      {account.expiry && ` (vence ${account.expiry})`}
                    </Typography>
                    
                    {account.income && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Ingresos:</Typography>
                        <List dense>
                          {account.income.map((income, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={income} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {account.linkedLoans && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Préstamos vinculados:</Typography>
                        <List dense>
                          {account.linkedLoans.map((loan, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={loan} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {account.backup && (
                      <Typography color="textSecondary" sx={{ mt: 2 }}>
                        Tarjeta de respaldo
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
          
      <TabPanel value={value} index={4}>
        <FileUploader />
      </TabPanel>
    </Box>
  );
        }
