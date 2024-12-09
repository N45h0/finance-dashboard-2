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
  CircularProgress
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
  Pie,
  Cell 
} from 'recharts';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';
import FileUploader from './components/FileUploader';

// Importar datos y utilidades
import loans from './data/loans';
import services from './data/services';
import accounts from './data/accounts';
import { calculateLoans, calculateServices } from './utils/calculations';
import PaymentHistory from './components/PaymentHistory';
import formatters from './utils/formatters';
import dateUtils from './utils/dateUtils';

// Hook personalizado para el tamaño de ventana
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Colores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Componente TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      className={`transition-opacity duration-200 ${value === index ? 'opacity-100' : 'opacity-0 hidden'}`}
      id={`finance-tabpanel-${index}`}
      aria-labelledby={`finance-tab-${index}`}
      aria-hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Dashboard() {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const isTablet = width <= 1024;

  // Estados
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loanSummary, setLoanSummary] = useState({
    totalCapital: 0,
    totalPaid: 0,
    remainingBalance: 0,
    overallProgress: 0,
    projectedPayments: [],
    overdueLoans: [],
    loansByOwner: {},
    generalStats: {}
  });
  
  const [serviceSummary, setServiceSummary] = useState({
    monthlyTotal: 0,
    annualizedCosts: [],
    upcomingPayments: [],
    serviceAlerts: [],
    contractStatus: []
  });

  const [error, setError] = useState(null);

  // Estilos responsivos
  const responsiveStyles = {
    container: {
      width: '100%',
      maxWidth: isMobile ? '100%' : '1200px',
      margin: 'auto',
      p: isMobile ? 1 : 3,
    },
    grid: {
      spacing: { xs: 1, sm: 2, md: 3 },
    },
    chart: {
      height: isMobile ? 200 : 300,
    },
    title: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      textAlign: isMobile ? 'center' : 'left',
    },
    card: {
      p: { xs: 1, sm: 2 },
    },
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Calcular resumen de préstamos
        const generalStats = calculateLoans.getGeneralStats();
        setLoanSummary({
          totalCapital: calculateLoans.getTotalCapital(),
          totalPaid: calculateLoans.getTotalPaid(),
          remainingBalance: calculateLoans.getRemainingBalance(),
          overallProgress: calculateLoans.getOverallProgress(),
          projectedPayments: calculateLoans.getProjectedPayments(),
          overdueLoans: calculateLoans.getOverdueLoans(),
          loansByOwner: calculateLoans.getLoansByOwner(),
          generalStats
        });

        // Calcular resumen de servicios
        setServiceSummary({
          monthlyTotal: calculateServices.getMonthlyTotal(),
          annualizedCosts: calculateServices.getAnnualizedCosts(),
          upcomingPayments: calculateServices.getUpcomingPayments(),
          serviceAlerts: calculateServices.getServiceAlerts(),
          contractStatus: calculateServices.getContractStatus()
        });

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={responsiveStyles.container}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom
        sx={responsiveStyles.title}
      >
        Dashboard Financiero Personal
      </Typography>

      {/* Alertas */}
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        {loanSummary.overdueLoans.length > 0 && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            <AlertTitle>Préstamos Vencidos</AlertTitle>
            {loanSummary.overdueLoans.map(loan => (
              <Typography 
                key={loan.id}
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                {loan.name} - {formatters.currency(loan.currentBalance)} - 
                Vencimiento: {formatters.date(loan.nextPaymentDate)}
                {loan.projectedLateFees > 0 && (
                  <Typography component="span" color="error">
                    {' '}(Mora estimada: {formatters.currency(loan.projectedLateFees)})
                  </Typography>
                )}
              </Typography>
            ))}
          </Alert>
        )}

        {serviceSummary.serviceAlerts.map((alert, index) => (
          <Alert 
            key={index} 
            severity={alert.severity} 
            sx={{ mb: 2, fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            <AlertTitle>{alert.type === 'renewal' ? 'Renovación Próxima' : alert.type}</AlertTitle>
            {alert.message}
          </Alert>
        ))}
      </Box>

      {/* Tabs */}
      <Tabs 
        value={value} 
        onChange={handleChange}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
        sx={{
          '.MuiTab-root': {
            fontSize: isMobile ? '0.875rem' : '1rem',
            minWidth: isMobile ? 'auto' : 90,
            p: isMobile ? 1 : 2,
          }
        }}
      >
        <Tab label="Resumen" />
        <Tab label="Préstamos" />
        <Tab label="Servicios" />
        <Tab label="Cuentas" />
        <Tab label="Cargar Archivos" />
      </Tabs>

      {/* Panel de Resumen */}
      <TabPanel value={value} index={0}>
        <Card sx={{ mb: isMobile ? 2 : 3 }}>
          <CardContent sx={responsiveStyles.card}>
            <Typography variant={isMobile ? "subtitle1" : "h6"}>
              Resumen Global de Préstamos
            </Typography>
            <Grid container spacing={responsiveStyles.grid.spacing}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  bgcolor: 'primary.light', 
                  p: isMobile ? 1.5 : 2,
                  borderRadius: 2,
                  mb: isMobile ? 1 : 0 
                }}>
                  <Typography variant="body2">Monto Total Préstamos</Typography>
                  <Typography variant="h6">
                    {formatters.currency(loanSummary.totalCapital)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  bgcolor: 'success.light', 
                  p: isMobile ? 1.5 : 2,
                  borderRadius: 2,
                  mb: isMobile ? 1 : 0 
                }}>
                  <Typography variant="body2">Monto Pagado</Typography>
                  <Typography variant="h6">
                    {formatters.currency(loanSummary.totalPaid)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  bgcolor: 'warning.light', 
                  p: isMobile ? 1.5 : 2,
                  borderRadius: 2 
                }}>
                  <Typography variant="body2">Monto Restante</Typography>
                  <Typography variant="h6">
                    {formatters.currency(loanSummary.remainingBalance)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Progreso de Pago Total</Typography>
              <LinearProgress 
                variant="determinate" 
                value={loanSummary.overallProgress} 
                sx={{ mt: 1 }} 
              />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                {formatters.percentage(loanSummary.overallProgress)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Distribución por Titular */}
        <Grid container spacing={responsiveStyles.grid.spacing}>
          <Grid item xs={12} md={isMobile ? 12 : 6}>
            <Card>
              <CardContent sx={responsiveStyles.card}>
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Distribución por Titular
                </Typography>
                <Box sx={{ height: isMobile ? 200 : 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(loanSummary.loansByOwner).map(([owner, data]) => ({
                          name: owner,
                          value: data.currentBalance
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(loanSummary.loansByOwner).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatters.currency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={isMobile ? 12 : 6}>
            <Card>
              <CardContent sx={responsiveStyles.card}>
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Próximos Vencimientos
                </Typography>
                <List dense={isMobile}>
                  {loanSummary.projectedPayments
                    .filter(projection => projection.payments.length > 0)
                    .map(projection => (
                      <ListItem key={projection.loanId}>
                        <ListItemIcon>
                          <Calendar size={isMobile ? 16 : 20} />
                        </ListItemIcon>
                        <ListItemText
                          primary={projection.loanName}
                          secondary={
                            <>
                              {formatters.date(projection.payments[0].date)} - 
                              {formatters.currency(projection.payments[0].amount)}
                              {projection.payments[0].lateFee > 0 && (
                                <Typography component="span" color="error">
                                  {' '}(+{formatters.currency(projection.payments[0].lateFee)} mora)
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Panel de Préstamos */}
      <TabPanel value={value} index={1}>
        <Grid container spacing={responsiveStyles.grid.spacing}>
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'primary.light' }}>
              <CardContent sx={responsiveStyles.card}>
                <Grid container spacing={responsiveStyles.grid.spacing}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Capital Total</Typography>
                    <Typography variant={isMobile ? "h6" : "h5"}>
                      {formatters.currency(loanSummary.totalCapital)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Total Pagado</Typography>
                    <Typography variant={isMobile ? "h6" : "h5"}>
                      {formatters.currency(loanSummary.totalPaid)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Saldo Restante</Typography>
                    <Typography variant={isMobile ? "h6" : "h5"}>
                      {formatters.currency(loanSummary.remainingBalance)}
                    </Typography>
                  </Grid>
                </Grid>
                <LinearProgress
                  variant="determinate"
                  value={loanSummary.overallProgress}
                  sx={{ 
                    mt: 2, 
                    height: isMobile ? 6 : 8, 
                    borderRadius: 4 
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Lista de Préstamos */}
          {loans.map(loan => (
            <Grid item xs={12} md={isMobile ? 12 : 6} key={loan.id}>
              <Card>
                <CardContent sx={responsiveStyles.card}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <Typography variant={isMobile ? "subtitle1" : "h6"}>
                      {loan.name}
                    </Typography>
                    {loan.isOverdue && (
                      <Chip 
                        label="Vencido" 
                        color="error" 
                        size="small"
                      />
                    )}
                  </Box>
                  <Typography color="textSecondary">
                    Titular: {loan.owner}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={responsiveStyles.grid.spacing}>
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
                        sx={{ 
                          mt: 1, 
                          height: isMobile ? 4 : 6, 
                          borderRadius: 3 
                        }}
                      />
                    </Box>
                    
                    <PaymentHistory loan={loan} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Panel de Servicios */}
      <TabPanel value={value} index={2}>
        <Grid container spacing={responsiveStyles.grid.spacing}>
          <Grid item xs={12} md={isMobile ? 12 : 6}>
            <Card>
              <CardContent sx={responsiveStyles.card}>
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Servicios Digitales
                </Typography>
                <List dense={isMobile}>
                  {services[0].items.map((service, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={service.name}
                        secondary={
                          <>
                            {formatters.currency(service.price.amount, service.price.currency)}
                            {service.price.currency === "USD" && 
                              ` (${formatters.currency(service.price.uyuEquivalent)})`}
                            <br />
                            {formatters.billingCycle(service.billingCycle)}
                            {service.contract && (
                              <>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={service.contract.progress} 
                                  sx={{ 
                                    mt: 1,
                                    height: isMobile ? 4 : 6
                                  }}
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
                <Divider sx={{ my: 2 }} />
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Total Mensual: {formatters.currency(serviceSummary.monthlyTotal)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={isMobile ? 12 : 6}>
            <Card>
              <CardContent sx={responsiveStyles.card}>
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Próximos Vencimientos
                </Typography>
                <List dense={isMobile}>
                  {serviceSummary.upcomingPayments.map((payment, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Calendar size={isMobile ? 16 : 20} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={payment.service}
                        secondary={`${formatters.date(payment.date)} - ${formatters.currency(payment.amount)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Estado de Contratos */}
            <Card sx={{ mt: isMobile ? 2 : 3 }}>
              <CardContent sx={responsiveStyles.card}>
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                  Estado de Contratos
                </Typography>
                {serviceSummary.contractStatus.map((contract, index) => (
                  <Box key={index} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      {contract.name}
                    </Typography>
                    <LinearProgress 
                      variant="determinate"
                      value={contract.progress}
                      sx={{ 
                        mb: 1,
                        height: isMobile ? 4 : 6
                      }}
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

      {/* Panel de Cuentas */}
      <TabPanel value={value} index={3}>
        <Grid container spacing={responsiveStyles.grid.spacing}>
        {Array.isArray(accounts) && accounts.map((account) => (
            <Grid item xs={12} md={isMobile ? 12 : 4} key={account.id}>
              <Card>
                <CardContent sx={responsiveStyles.card}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"}>
                    {account.name} ({account.id})
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }}>
                      <CreditCard size={isMobile ? 16 : 20} />
                      {account.type}
                      {account.expiry && ` (vence ${account.expiry})`}
                    </Typography>
                    
                    {account.income && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Ingresos:</Typography>
                        <List dense={isMobile}>
                          {account.income.map((income, idx) => (
                            <ListItem key={idx}>
                              <ListItemText 
                                primary={income.source}
                                secondary={formatters.currency(income.estimatedAmount)}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {account.services && account.services.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Servicios asociados:</Typography>
                        <List dense={isMobile}>
                          {account.services.map((service, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={service} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {account.linkedLoans && account.linkedLoans.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Préstamos vinculados:</Typography>
                        <List dense={isMobile}>
                          {account.linkedLoans.map((loan, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={loan} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {account.backup && (
                      <Typography 
                        color="textSecondary" 
                        sx={{ 
                          mt: 2,
                          fontSize: isMobile ? '0.875rem' : '1rem'
                        }}
                      >
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
          
      {/* Panel de Carga de Archivos */}
      <TabPanel value={value} index={4}>
        <Box sx={{ p: isMobile ? 1 : 2 }}>
          <FileUploader />
        </Box>
      </TabPanel>
    </Box>
  );
}

export default Dashboard;
