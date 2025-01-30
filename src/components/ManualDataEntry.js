import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import { Save, RefreshCw } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import PaymentTracker from './PaymentTracker';
import { storageService } from '../services/storageService';

const ManualDataEntry = ({ onServiceAdd, onPaymentAdd }) => {
  const [entryType, setEntryType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '',
    type: '',
    method: '',
    currency: 'UYU',
    exchangeRate: '',
    description: ''
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    
    try {
      const payment = {
        date: formData.date,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        exchangeRate: formData.currency === 'USD' ? parseFloat(formData.exchangeRate) : null,
        uyuAmount: formData.currency === 'USD' ? 
          parseFloat(formData.amount) * parseFloat(formData.exchangeRate) : 
          parseFloat(formData.amount),
        method: formData.method,
        status: 'paid',
        description: formData.description
      };

      onPaymentAdd(formData.name, payment);
      
      setSnackbarMessage('Pago registrado correctamente');
      setOpenSnackbar(true);
      
      setFormData({
        name: '',
        amount: '',
        date: '',
        type: '',
        method: '',
        currency: 'UYU',
        exchangeRate: '',
        description: ''
      });
    } catch (error) {
      setSnackbarMessage('Error al registrar el pago');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Registrar Nuevo Pago
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Servicio/Préstamo</InputLabel>
                  <Select
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  >
                    <MenuItem value="ChatGPT Plus">ChatGPT Plus</MenuItem>
                    <MenuItem value="Claude Pro">Claude Pro</MenuItem>
                    <MenuItem value="Spotify Premium">Spotify Premium</MenuItem>
                    <MenuItem value="Google One">Google One</MenuItem>
                    <MenuItem value="Plan Antel">Plan Antel</MenuItem>
                    <MenuItem value="Alquiler">Alquiler</MenuItem>
                    <MenuItem value="BROU Dentista">BROU Dentista</MenuItem>
                    <MenuItem value="BROU Buenos Aires">BROU Buenos Aires</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monto"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Moneda</InputLabel>
                  <Select
                    name="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  >
                    <MenuItem value="UYU">UYU</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.currency === 'USD' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tipo de Cambio"
                    name="exchangeRate"
                    type="number"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData({...formData, exchangeRate: e.target.value})}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fecha de Pago"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Método de Pago</InputLabel>
                  <Select
                    name="method"
                    value={formData.method}
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                  >
                    <MenuItem value="debit_6039">Brou Débito 6039</MenuItem>
                    <MenuItem value="transfer_6039">Transferencia Brou</MenuItem>
                    <MenuItem value="debit_2477">Visa Santander</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción/Detalles"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<Save />}
                >
                  Registrar Pago
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />

      <ToastContainer position="bottom-right" />
      <PaymentTracker payments={storageService.getPayments()} />
    </Box>
  );
};

export default ManualDataEntry;
