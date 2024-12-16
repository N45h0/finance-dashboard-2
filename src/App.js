import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Card, 
  CardContent,
  Grid,
  CircularProgress
} from '@mui/material';

// Importar componentes
import ManualDataEntry from './components/ManualDataEntry';
import AccountsTab from './components/AccountsTab';

// Importar datos
import loans from './data/loans';
import services from './data/services';
import accounts from './data/accounts';

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard Financiero
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Resumen" />
          <Tab label="Préstamos" />
          <Tab label="Servicios" />
          <Tab label="Cuentas" />
          <Tab label="Cargar Datos" />
        </Tabs>
      </Box>

      {/* Tab Resumen */}
      <TabPanel value={value} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Resumen Global</Typography>
                <Typography>Contenido del resumen</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab Préstamos */}
      <TabPanel value={value} index={1}>
        <Grid container spacing={2}>
          {loans.map((loan) => (
            <Grid item xs={12} md={6} key={loan.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{loan.name}</Typography>
                  <Typography>Capital: {loan.capital}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab Servicios */}
      <TabPanel value={value} index={2}>
        <Grid container spacing={2}>
          {services[0]?.items.map((service, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{service.name}</Typography>
                  <Typography>
                    Monto: {service.price?.uyuEquivalent}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab Cuentas */}
      <TabPanel value={value} index={3}>
        <AccountsTab />
      </TabPanel>

      {/* Tab Cargar Datos */}
      <TabPanel value={value} index={4}>
        <ManualDataEntry />
      </TabPanel>
    </Box>
  );
}

export default App;
