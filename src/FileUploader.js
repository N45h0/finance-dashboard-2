import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Box, Typography, CircularProgress, Card } from '@mui/material';
import { Upload, File, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle } from '@mui/material';

const FileUploader = () => {
  const [worker, setWorker] = useState(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMap, setProgressMap] = useState({});

  // Inicializar el worker de Tesseract
  useEffect(() => {
    const initWorker = async () => {
      try {
        const newWorker = await createWorker({
          logger: progress => {
            if (progress.status === 'recognizing text') {
              setProgressMap(prev => ({
                ...prev,
                ['general']: Math.floor(progress.progress * 100)
              }));
            }
          },
        });

        // Inicializar con ambos idiomas
        await newWorker.loadLanguage('eng+spa');
        await newWorker.initialize('eng+spa');
        
        setWorker(newWorker);
        setIsWorkerReady(true);
        toast.success('Sistema OCR inicializado correctamente');
      } catch (error) {
        console.error('Error initializing Tesseract:', error);
        toast.error('Error al inicializar el sistema OCR');
      }
    };

    initWorker();

    // Cleanup
    return () => {
      if (worker) {
        worker.terminate();
      }
    };
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
        text += content.items.map(item => item.str).join(' ');
      }
      
      return text;
    } catch (error) {
      throw new Error(`Error al procesar PDF: ${error.message}`);
    }
  };

  // Procesar imagen
  const processImage = async (file) => {
    if (!worker || !isWorkerReady) {
      throw new Error('El sistema OCR no está listo');
    }

    try {
      const { data: { text } } = await worker.recognize(file);
      return text;
    } catch (error) {
      throw new Error(`Error al procesar imagen: ${error.message}`);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files).slice(0, 10);
    setSelectedFiles(files);
    event.target.value = '';
  };

  const handleUpload = async () => {
    if (!isWorkerReady) {
      toast.error('El sistema OCR aún no está listo. Por favor, espere.');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.warning('Por favor, seleccione archivos primero');
      return;
    }

    setIsProcessing(true);

    try {
      for (const file of selectedFiles) {
        setProgressMap(prev => ({ ...prev, [file.name]: 0 }));
        
        try {
          let text;
          if (file.type === 'application/pdf') {
            text = await processPDF(file);
          } else if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            text = await processImage(file);
          } else {
            toast.error(`Formato no soportado: ${file.name}`);
            continue;
          }

          // Procesar el texto extraído
          if (text.includes('UTILIZACIÓN ADELANTO DE SUELDO') || 
              text.includes('COBRO DE ADS')) {
            setUploadedData(prev => [...prev, { 
              fileName: file.name, 
              content: text,
              type: text.includes('UTILIZACIÓN') ? 'utilizacion' : 'cobro'
            }]);
            toast.success(`Archivo procesado: ${file.name}`);
          } else {
            toast.warning(`No se encontró información relevante en: ${file.name}`);
          }
        } catch (error) {
          toast.error(`Error procesando ${file.name}: ${error.message}`);
        }
      }
    } finally {
      setIsProcessing(false);
      setSelectedFiles([]);
      setProgressMap({});
    }
  };

  return (
    <Box className="p-4">
      <Card className="p-6">
        <Typography variant="h6" className="mb-4">
          Uploader de Archivos
        </Typography>

        {!isWorkerReady && (
          <Alert className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Inicializando sistema OCR...</AlertTitle>
            <Typography>Por favor, espere mientras se prepara el sistema.</Typography>
          </Alert>
        )}

        <Box className="flex gap-4 mb-4">
          <Button
            variant="contained"
            component="label"
            startIcon={<File />}
            disabled={isProcessing || !isWorkerReady}
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
            disabled={isProcessing || selectedFiles.length === 0 || !isWorkerReady}
          >
            {isProcessing ? 'Procesando...' : 'Subir Archivos'}
          </Button>
        </Box>

        {selectedFiles.length > 0 && (
          <Typography variant="body2" className="mb-4">
            {selectedFiles.length} archivo(s) seleccionado(s)
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary">
          Formatos soportados: PDF, JPG, JPEG, PNG (máximo 10 archivos)
        </Typography>

        {Object.entries(progressMap).map(([fileName, progress]) => (
          <Box key={fileName} className="mt-2">
            <Typography variant="caption">{fileName}</Typography>
            <CircularProgress 
              variant="determinate" 
              value={progress} 
              className="ml-2"
              size={16}
            />
          </Box>
        ))}
      </Card>

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
