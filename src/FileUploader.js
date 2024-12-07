import React, { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { ToastContainer, toast } from 'react-toastify';
import { 
  Button, 
  Box, 
  Typography, 
  CircularProgress, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import { Upload, File, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { calculateServices } from '../utils/calculations';
import formatters from '../utils/formatters';
import 'react-toastify/dist/ReactToastify.css';

const FileUploader = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [previews, setPreviews] = useState([]);
  const [unsupportedFiles, setUnsupportedFiles] = useState([]);
  const [pendingValidation, setPendingValidation] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);

  // Verificar pagos pendientes
  const checkPendingPayments = useCallback(() => {
    const payments = calculateServices.getUpcomingPayments();
    const pending = payments.filter(payment => payment.requiresProof);
    setPendingPayments(pending);
    if (pending.length > 0) {
      setShowPaymentDialog(true);
    }
  }, []);

  // Procesar PDF
  const processPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(' ');
      }

      return text;
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Error al procesar el PDF');
    }
  };

  // Procesar imágenes con OCR
  const processImage = async (file, fileName) => {
    try {
      const worker = await createWorker({
        logger: (info) => {
          if (info.status === 'recognizing text') {
            setProgressMap((prev) => ({
              ...prev,
              [fileName]: Math.floor(info.progress * 100),
            }));
          }
        },
      });

      await worker.loadLanguage('spa+eng');
      await worker.initialize('spa+eng');
      
      const { data: { text } } = await worker.recognize(file);
      
      await worker.terminate();
      return text;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Error al procesar la imagen');
    }
  };

  // Validar comprobante de pago
  const validatePaymentProof = (text, payment) => {
    // Aquí puedes agregar más validaciones específicas según tus necesidades
    const amount = payment.amount.toString();
    const serviceName = payment.service.toLowerCase();
    
    // Verificar si el texto contiene información relevante del pago
    const hasAmount = text.toLowerCase().includes(amount);
    const hasService = text.toLowerCase().includes(serviceName);
    const hasDateInfo = text.includes(formatters.date(payment.date));
    
    return {
      isValid: hasAmount && (hasService || hasDateInfo),
      details: {
        amount: hasAmount,
        service: hasService,
        date: hasDateInfo
      }
    };
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files).slice(0, 10);
    setSelectedFiles(files);
    event.target.value = '';
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.warning('Por favor, seleccione archivos primero');
      return;
    }

    setIsProcessing(true);
    const previewUrls = [];
    const unsupported = [];
    const results = [];

    try {
      for (const file of selectedFiles) {
        const fileName = file.name;
        const fileType = file.type;
        const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

        if (acceptedTypes.includes(fileType)) {
          // Crear preview para imágenes
          if (fileType.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            previewUrls.push({ name: fileName, url });
          }

          let text;
          try {
            text = fileType === 'application/pdf'
              ? await processPDF(file)
              : await processImage(file, fileName);

            // Buscar pago pendiente correspondiente
            const relatedPayment = pendingPayments.find(payment => {
              const validation = validatePaymentProof(text, payment);
              return validation.isValid;
            });

            if (relatedPayment) {
              const validationResult = validatePaymentProof(text, relatedPayment);
              results.push({
                fileName,
                payment: relatedPayment,
                validation: validationResult,
                content: text
              });

              toast.success(`Comprobante válido para ${relatedPayment.service}`);
            } else {
              toast.warning(`No se pudo relacionar el comprobante con ningún pago pendiente: ${fileName}`);
            }

          } catch (error) {
            toast.error(`Error procesando ${fileName}: ${error.message}`);
          }
        } else {
          unsupported.push(fileName);
        }
      }

      setPreviews(previewUrls);
      setUnsupportedFiles(unsupported);
      setUploadedData(prev => [...prev, ...results]);
      
      if (unsupported.length > 0) {
        toast.warning(`Archivos no soportados: ${unsupported.join(', ')}`);
      }
      
    } catch (error) {
      toast.error(`Error general: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setSelectedFiles([]);
    }
  };

  const PaymentProofDialog = () => (
    <Dialog 
      open={showPaymentDialog} 
      onClose={() => setShowPaymentDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Comprobantes de Pago Pendientes</DialogTitle>
      <DialogContent>
        <List>
          {pendingPayments.map((payment, index) => (
            <ListItem key={index} divider>
              <ListItemIcon>
                {uploadedData.some(data => data.payment === payment) 
                  ? <CheckCircle color="green" />
                  : <AlertTriangle color="orange" />
                }
              </ListItemIcon>
              <ListItemText
                primary={payment.service}
                secondary={
                  <>
                    Vencimiento: {formatters.date(payment.date)}
                    <br />
                    Monto: {formatters.currency(payment.amount)}
                  </>
                }
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={payment.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {payment.acceptedFormats.map((format, idx) => (
                  <Chip
                    key={idx}
                    label={format}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setShowPaymentDialog(false)}
          startIcon={<XCircle />}
        >
          Cerrar
        </Button>
        <Button
          variant="contained"
          onClick={() => document.getElementById('file-input').click()}
          startIcon={<Upload />}
        >
          Subir Comprobantes
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Uploader de Archivos
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<File />}
          disabled={isProcessing}
        >
          Seleccionar Archivos
          <input
            id="file-input"
            type="file"
            hidden
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
          />
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <Upload />}
          onClick={handleUpload}
          disabled={isProcessing || selectedFiles.length === 0}
        >
          {isProcessing ? 'Procesando...' : 'Subir Archivos'}
        </Button>

        <Button
          variant="outlined"
          onClick={checkPendingPayments}
          startIcon={<AlertTriangle />}
        >
          Verificar Pagos Pendientes
        </Button>
      </Box>

      {selectedFiles.length > 0 && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {selectedFiles.length} archivo(s) seleccionado(s)
        </Typography>
      )}

      {/* Previsualizaciones */}
      {previews.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Previsualización</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {previews.map((preview, index) => (
              <img 
                key={index} 
                src={preview.url} 
                alt={preview.name}
                style={{ 
                  maxWidth: '200px',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }} 
              />
            ))}
          </Box>
        </Box>
      )}

      <PaymentProofDialog />

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

export default FileUploader;
