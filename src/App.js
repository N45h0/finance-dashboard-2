import React, { useState } from 'react';
import FileUploader from './FileUploader';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
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
} from 'recharts';
import { CreditCard, Calendar } from 'lucide-react';

// Importar datos
import loans from './data/loans';
import services from './data/services';
import accounts from './data/accounts';
import calculateServices from './utils/calculations';
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
  const [uploadedLoans, setUploadedLoans] = useState([]);
  const [uploadedServices, setUploadedServices] = useState([]);
  const [uploadedAccounts, setUploadedAccounts] = useState([]);

  const monthlyTotal = calculateServices.getMonthlyTotal();
  const upcomingPayments = calculateServices.getUpcomingPayments();
  const contractStatus = calculateServices.getContractStatus();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleUploadedData = (type, data) => {
    if (type === 'loan') {
      setUploadedLoans((prev) => [...prev, data]);
    } else if (type === 'service') {
      setUploadedServices((prev) => [...prev, data]);
    } else if (type === 'account') {
      setUploadedAccounts((prev) => [...prev, data]);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Financiero Personal
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        Adelanto de sueldo vencido: {formatters.currency(4831.57)}
      </Alert>

      {upcomingPayments.map((alert, index) => (
        <Alert key={index} severity="warning" sx={{ mb: 2 }}>
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Resumen Mensual Total</Typography>
                <Typography variant="h4">{formatters.currency(monthlyTotal)}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography>LAFIO: {formatters.currency(14676.6)}</Typography>
                  <Typography>Lovia: {formatters.currency(23519.6)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Cargar Archivos</Typography>
                <FileUploader onUpload={handleUploadedData} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Grid container spacing={3}>
          {loans.concat(uploadedLoans).map((loan, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{loan.name}</Typography>
                  <Typography>Capital: {formatters.currency(loan.capital)}</Typography>
                  <Typography>Cuotas: {loan.paidInstallments}/{loan.installments}</Typography>
                  <Typography>Tasa de Interés: {formatters.percentage(loan.interestRate)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Typography variant="h6">Servicios Digitales</Typography>
        <List>
          {services[0].items.concat(uploadedServices).map((service, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={service.name}
                secondary={formatters.currency(service.price.amount)}
              />
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Typography variant="h6">Cuentas</Typography>
        <List>
          {accounts.concat(uploadedAccounts).map((account, index) => (
            <ListItem key={index}>
              <ListItemText primary={account.name} secondary={`Saldo: ${formatters.currency(account.balance)}`} />
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={value} index={4}>
        <FileUploader onUpload={handleUploadedData} />
      </TabPanel>
    </Box>
  );
}
