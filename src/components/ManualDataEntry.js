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
  Alert
} from '@mui/material';
import { Save, Plus } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManualDataEntry = () => {
  const [entryType, setEntryType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '',
    type: '',
    owner: '',
    description: ''
  });

  const entryTypes = [
    { value: 'loan_payment', label: 'Pago de Préstamo' },
    { value: 'new_loan', label: 'Nuevo Préstamo' },
    { value: 'service_payment', label: 'Pago de Servicio' },
    { value: 'new_service', label: 'Nuevo Servicio' }
  ];

  const handleTypeChange = (event) => {
    setEntryType(event.target.value);
    setFormData({
      name: '',
      amount: '',
      date: '',
      type: event.target.value,
      owner: '',
      description: ''
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    try {
      // Aquí iría la lógica para actualizar los datos en la aplicación
      console.log('Datos a guardar:', formData);
      
      toast.success('Datos guardados correctamente');
      
      // Resetear el formulario
      setFormData({
        name: '',
        amount: '',
        date: '',
        type: entryType,
        owner: '',
        description: ''
      });
    } catch (error) {
      toast.error('Error al guardar los datos');
      console.error('Error:', error);
    }
  };

  const renderForm = () => {
    switch (entryType) {
      case 'loan_payment':
        return (
          <>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Préstamo</InputLabel>
                <Select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  label="Préstamo"
                >
                  <MenuItem value="BROU Viaje Argentina">BROU Viaje Argentina</MenuItem>
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
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de Pago"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        );

      case 'new_loan':
        return (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Préstamo"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Capital"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Titular</InputLabel>
                <Select
                  name="owner"
                  value={formData.owner}
                  onChange={handleInputChange}
                  label="Titular"
                >
                  <MenuItem value="LAFIO">LAFIO</MenuItem>
                  <MenuItem value="Lovia">Lovia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        );

      case 'service_payment':
        return (
          <>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Servicio</InputLabel>
                <Select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  label="Servicio"
                >
                  <MenuItem value="Spotify Premium Familiar">Spotify Premium Familiar</MenuItem>
                  <MenuItem value="ChatGPT Plus">ChatGPT Plus</MenuItem>
                  <MenuItem value="Claude Pro">Claude Pro</MenuItem>
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
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de Pago"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        );

      case 'new_service':
        return (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Servicio"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monto Mensual"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cuenta</InputLabel>
                <Select
                  name="owner"
                  value={formData.owner}
                  onChange={handleInputChange}
                  label="Cuenta"
                >
                  <MenuItem value="6039">Brou Débito 6039</MenuItem>
                  <MenuItem value="2477">Visa Santander Débito</MenuItem>
                  <MenuItem value="3879">Prex Mastercard UY</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Ingreso Manual de Datos
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Tipo de Entrada</InputLabel>
            <Select
              value={entryType}
              onChange={handleTypeChange}
              label="Tipo de Entrada"
            >
              {entryTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {entryType && (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {renderForm()}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Observaciones"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    startIcon={<Save />}
                  >
                    Guardar
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 2 }}>
        Use este formulario para ingresar manualmente nuevos datos o actualizar información existente.
      </Alert>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  );
};

export default ManualDataEntry;
