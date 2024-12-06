import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { Upload, File } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const FileUploader = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [previews, setPreviews] = useState([]);
  const [unsupportedFiles, setUnsupportedFiles] = useState([]);
  const [pendingValidation, setPendingValidation] = useState(null);

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
      // Inicializar worker con CDNs
      const worker = await createWorker({
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/worker.min.js',
        langPath: 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_best',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@2.1.4/tesseract-core.wasm.js',
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

  // Clasificar y validar datos extraídos
  const classifyAndValidate = (text, fileName) => {
    try {
      if (text.includes('UTILIZACIÓN ADELANTO DE SUELDO')) {
        setPendingValidation({
          type: 'adelanto_utilizacion',
          description: 'Utilización de adelanto de sueldo',
          details: { fileName, content: text },
        });
      } else if (text.includes('COBRO DE ADS')) {
        setPendingValidation({
          type: 'adelanto_cobro',
          description: 'Cobro de adelanto de sueldo',
          details: { fileName, content: text },
        });
      } else {
        toast.error(`No se pudo clasificar el documento: ${fileName}`);
      }
    } catch (error) {
      console.error('Error classifying document:', error);
      toast.error(`Error al clasificar el documento: ${fileName}`);
    }
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

        if (['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
          if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            const url = URL.createObjectURL(file);
            previewUrls.push({ name: fileName, url });
          }

          let text;
          try {
            text = file.type === 'application/pdf'
              ? await processPDF(file)
              : await processImage(file, fileName);
            
            results.push({ fileName, content: text });
            classifyAndValidate(text, fileName);
          } catch (error) {
            toast.error(`Error procesando ${fileName}: ${error.message}`);
          }
        } else {
          unsupported.push(fileName);
        }
      }

      setPreviews(previewUrls);
      setUnsupportedFiles(unsupported);
      
      if (unsupported.length > 0) {
        toast.warning(`Archivos no soportados: ${unsupported.join(', ')}`);
      }
      
      if (results.length > 0) {
        toast.success('Archivos procesados correctamente');
      }
    } catch (error) {
      toast.error(`Error general: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setSelectedFiles([]);
    }
  };

  const confirmMovement = (isConfirmed) => {
    if (!isConfirmed) {
      toast.info('Movimiento descartado.');
    } else if (pendingValidation) {
      const { type, description, details } = pendingValidation;
      toast.success(`Confirmado: ${description}`);
      setUploadedData((prev) => [...prev, { ...details, type }]);
    }
    setPendingValidation(null);
  };

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
      </Box>

      {selectedFiles.length > 0 && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {selectedFiles.length} archivo(s) seleccionado(s)
        </Typography>
      )}

      {/* Mensajes informativos */}
      <Typography variant="body2" color="text.secondary">
        Formatos soportados: PDF, JPG, JPEG, PNG (máximo 10 archivos)
      </Typography>

      {unsupportedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="error">
            Archivos no soportados:
          </Typography>
          <ul>
            {unsupportedFiles.map((fileName, index) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
        </Box>
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

      {/* Validación pendiente */}
      {pendingValidation && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          border: '1px solid #ccc', 
          borderRadius: 1,
          backgroundColor: '#f5f5f5'
        }}>
          <Typography variant="subtitle1">¿Confirmar este movimiento?</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Tipo: {pendingValidation.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => confirmMovement(true)}
            >
              Confirmar
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => confirmMovement(false)}
            >
              Descartar
            </Button>
          </Box>
        </Box>
      )}

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
