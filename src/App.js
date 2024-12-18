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
  CircularProgress,
  Chip
} from '@mui/material';

// Imports de Recharts para gráficos
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

// Imports de Lucide para iconos
import { 
  CreditCard, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';

// Importar componentes
import PaymentHistory from './components/PaymentHistory';
import ManualDataEntry from './components/ManualDataEntry';
import AccountsTab from './components/AccountsTab';

// Importar datos
import loans from './data/loans';
import services from './data/services';
import accounts from './data/accounts';

// Importar utilidades y servicios
import { calculateLoans, calculateServices } from './utils/calculations';
import { dateUtils } from './utils/dateUtils';
import formatters from './utils/formatters';
import { apiService } from './services/apiService';

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

// Helper para cálculos anualizados
const getAnnualizedAmount = (service) => {
  if (!service?.price?.uyuEquivalent) return 0;
  
  const amount = service.price.uyuEquivalent;
  if (service.billingCycle === 'annual') {
    return service.contract?.monthlyEquivalent || amount / 12;
  }
  return amount;
};

// Colores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Componente TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
      aria-labelledby={`finance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Estilos responsivos
const getResponsiveStyles = (isMobile) => ({
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }
});

// Constantes para configuración
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

function App() {
  const { width } = useWindowSize();
  const isMobile = width <= MOBILE_BREAKPOINT;
  const isTablet = width <= TABLET_BREAKPOINT;
  const responsiveStyles = getResponsiveStyles(isMobile);

  // Estados
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [contractStatus, setContractStatus] = useState([]);
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
    upcomingPayments: [],
    serviceAlerts: [],
    contractStatus: []
  });

  const [error, setError] = useState(null);

  const [servicesData, setServicesData] = useState(() => {
    const savedServices = localStorage.getItem('financeServices');
    return savedServices ? JSON.parse(savedServices) : services;
  });
// JUSTO DESPUÉS DEL ESTADO DE SERVICES DATA
  const handleServiceUpdate = (newService) => {
    setServicesData(prevServices => {
      const updatedServices = [...prevServices];
      updatedServices[0].items.push(newService);
      
      // Guardar en localStorage
      localStorage.setItem('financeServices', JSON.stringify(updatedServices));
      
      return updatedServices;
    });

    // Recalcular el resumen de servicios
    setServiceSummary(prev => ({
      ...prev,
      monthlyTotal: calculateServices.getMonthlyTotal(),
      upcomingPayments: calculateServices.getUpcomingPayments()
    }));
  };

  // La siguiente línea debe ser handleChange, déjala como está
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log("Cargando datos iniciales...");

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
        const serviceData = {
          monthlyTotal: calculateServices.getMonthlyTotal(),
          upcomingPayments: calculateServices.getUpcomingPayments(),
          serviceAlerts: calculateServices.getServiceAlerts(),
          contractStatus: calculateServices.getContractStatus()
        };
        setServiceSummary(serviceData);
        setContractStatus(serviceData.contractStatus);

        console.log("Datos cargados exitosamente");
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
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

      <Tabs 
        value={value} 
        onChange={handleChange}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
      >
        <Tab label="Resumen" />
        <Tab label="Préstamos" />
        <Tab label="Servicios" />
        <Tab label="Cuentas" />
        <Tab label="Cargar Datos" />
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

        <Grid container spacing={responsiveStyles.grid.spacing}>
          {/* Gráfico de distribución */}
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

          {/* Próximos vencimientos */}
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
          {loans.map((loan) => (
            <Grid item xs={12} md={6} key={loan.id}>
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
                  <PaymentHistory loan={loan} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Panel de Servicios */}
      <TabPanel value={value} index={2}>
        <Grid container spacing={responsiveStyles.grid.spacing}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={responsiveStyles.card}>
                <Typography variant="h6">
                  Servicios Activos
                </Typography>
                <List>
                  {servicesData[0].items.map((service, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={service.name}
                        secondary={
                          <>
                            {formatters.currency(service.price.amount, service.price.currency)}
                            {service.price.currency === "USD" && 
                              ` (${formatters.currency(service.price.uyuEquivalent)})`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total Mensual: {formatters.currency(serviceSummary.monthlyTotal)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Panel de Cuentas */}
      <TabPanel value={value} index={3}>
        <AccountsTab />
      </TabPanel>

      {/* Panel de Cargar Datos */}
      <TabPanel value={value} index={4}>
  <ManualDataEntry onServiceAdd={handleServiceUpdate} />
      </TabPanel>
    </Box>
  );
}

export default App;
