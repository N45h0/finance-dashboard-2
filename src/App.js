import React, { useState } from 'react';
import FileUploader from './FileUploader';
import { Box, Card, CardContent, Typography, Tabs, Tab, Alert, LinearProgress, Grid, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';
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
 const monthlyTotal = calculateServices.getMonthlyTotal();
 const upcomingPayments = calculateServices.getUpcomingPayments();
 const contractStatus = calculateServices.getContractStatus();

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
     </Tabs>

     <TabPanel value={value} index={0}>
  <Grid container spacing={3}>
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6">Resumen Mensual Total</Typography>
          <Typography variant="h4">{formatters.currency(monthlyTotal)}</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography>LAFIO: {formatters.currency(14676.60)}</Typography>
            <Typography>Lovia: {formatters.currency(23519.60)}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>

    {/* Aquí agregamos el uploader */}
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6">Cargar Archivos</Typography>
          <FileUploader />
        </CardContent>
      </Card>
    </Grid>

         <Grid item xs={12} md={4}>
           <Card>
             <CardContent>
               <Typography variant="h6">Progreso de Préstamos</Typography>
               {loans.map(loan => (
                 <Box key={loan.id} sx={{ mt: 2 }}>
                   <Typography variant="body2">
                     {loan.name} ({loan.paidInstallments}/{loan.installments})
                   </Typography>
                   <LinearProgress 
                     variant="determinate" 
                     value={(loan.paidInstallments/loan.installments) * 100} 
                   />
                 </Box>
               ))}
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
                         { name: 'LAFIO', value: 14676.60, fill: "#1a1757" },
                         { name: 'Lovia', value: 23519.60, fill: "#8884d8" }
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
           <Card>
             <CardContent>
               <Typography variant="h6">Capital Total: {formatters.currency(51741.19)}</Typography>
               <Grid container spacing={2} sx={{ mt: 1 }}>
                 {loans.map(loan => (
                   <Grid item xs={12} md={6} key={loan.id}>
                     <Card variant="outlined">
                       <CardContent>
                         <Typography variant="h6">{loan.name}</Typography>
                         <Typography color="textSecondary">Titular: {loan.owner}</Typography>
                         <Box sx={{ mt: 2 }}>
                           <Typography>Capital: {formatters.currency(loan.capital)}</Typography>
                           <Typography>Cuota: {formatters.currency(loan.amount)}</Typography>
                           <Typography>Progreso: {loan.paidInstallments}/{loan.installments}</Typography>
                           {loan.interestRate > 0 && (
                             <Typography>TEA: {formatters.percentage(loan.interestRate)}</Typography>
                           )}
                           {loan.moratory > 0 && (
                             <Typography>TEA Mora: {formatters.percentage(loan.moratory)}</Typography>
                           )}
                           {loan.ceipRetention && (
                             <Typography color="error">Retención CEIP</Typography>
                           )}
                         </Box>
                       </CardContent>
                     </Card>
                   </Grid>
                 ))}
               </Grid>
             </CardContent>
           </Card>
         </Grid>
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
                             ` (${formatters.currency(service.price.uyuEquivalent)})`}
                           <br />
                           {service.billingCycle === 'annual' && '(Pago Anual)'}
                           {service.contract && (
                             <LinearProgress 
                               variant="determinate" 
                               value={service.contract.progress}
                               sx={{ mt: 1 }}
                             />
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
                   <Typography variant="caption" color="textSecondary">
                     {contract.daysUntilRenewal} días para renovación
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
                   <Typography display="flex" alignItems="center" gap={1}>
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
          
     <Tab label="Cargar Archivos" />
       <TabPanel value={value} index={4}>
       <FileUploader />
     </TabPanel>

   </Box>
 );
}
