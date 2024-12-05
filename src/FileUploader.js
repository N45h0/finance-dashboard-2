import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
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
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(' ');
    }

    return text;
  };

  // Procesar imágenes con OCR
  const processImage = async (file, fileName) => {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(file, 'spa+eng', {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            setProgressMap((prev) => ({
              ...prev,
              [fileName]: Math.floor(info.progress * 100),
            }));
          }
        },
      })
        .then((result) => resolve(result.data.text))
        .catch((error) => reject(error));
    });
  };

  // Clasificar y validar datos extraídos
  const classifyAndValidate = (text, fileName) => {
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

          const text = file.type === 'application/pdf'
            ? await processPDF(file)
            : await processImage(file, fileName);
          
          results.push({ fileName, content: text });
          classifyAndValidate(text, fileName);
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
      toast.error(`Error al procesar archivos: ${error.message}`);
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
          startIcon={isProcessing ? <CircularProgress size={20} /> : <Upload />}
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

      <Typography variant="body2" color="text.secondary">
        Puedes cargar hasta 10 archivos (PDF o imágenes)
      </Typography>

      {unsupportedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Archivos no soportados:</Typography>
          <ul>
            {unsupportedFiles.map((fileName, index) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
        </Box>
      )}

      {previews.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Previsualización de Imágenes</Typography>
          {previews.map((preview, index) => (
            <img 
              key={index} 
              src={preview.url} 
              alt={preview.name}
              style={{ maxWidth: '200px', margin: '8px' }} 
            />
          ))}
        </Box>
      )}

      {pendingValidation && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
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

      <ToastContainer position="bottom-right" />
    </Box>
  );
};

export default FileUploader;
