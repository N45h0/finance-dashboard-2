import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Financiero
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Resumen" />
          <Tab label="Préstamos" />
          <Tab label="Servicios" />
          <Tab label="Cuentas" />
          <Tab label="Cargar Datos" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        Contenido de Resumen
      </TabPanel>
      <TabPanel value={value} index={1}>
        Contenido de Préstamos
      </TabPanel>
      <TabPanel value={value} index={2}>
        Contenido de Servicios
      </TabPanel>
      <TabPanel value={value} index={3}>
        Contenido de Cuentas
      </TabPanel>
      <TabPanel value={value} index={4}>
        Contenido de Carga de Datos
      </TabPanel>
    </Box>
  );
}

export default App;
