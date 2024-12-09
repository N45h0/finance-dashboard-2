import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { ToastContainer, toast } from 'react-toastify';
import { 
  Button, 
  Box, 
  Typography, 
  CircularProgress, 
  Card,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import { 
  Upload, 
  File, 
  AlertCircle, 
  X as XIcon,
  FileText,
  Image as ImageIcon 
} from 'lucide-react';
import { Alert, AlertTitle } from '@mui/material';
import { documentUtils } from '../services/documentAnalyzer';

const FileUploader = () => {
  const [worker, setWorker] = useState(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [error, setError] = useState(null);

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

        await newWorker.loadLanguage('eng+spa');
        await newWorker.initialize('eng+spa');
        
        setWorker(newWorker);
        setIsWorkerReady(true);
        toast.success('Sistema OCR inicializado correctamente');
      } catch (error) {
        console.error('Error initializing Tesseract:', error);
        setError('Error al inicializar el sistema OCR');
        toast.error('Error al inicializar el sistema OCR');
      }
    };

    initWorker();

    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, []);

  const processPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgressMap(prev => ({
          ...prev,
          [file.name]: (i / pdf.numPages) * 100
        }));
        
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ');
      }
      
      return text;
    } catch (error) {
      throw new Error(`Error al procesar PDF: ${error.message}`);
    }
  };

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
    const files = Array.from(event.target.files)
      .slice(0, 10)
      .filter(file => {
        const isValid = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
          .includes(file.type);
        if (!isValid) {
          toast.warning(`Formato no soportado: ${file.name}`);
        }
        return isValid;
      });
    
    setSelectedFiles(prev => [...prev, ...files]);
    event.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setProgressMap(prev => {
      const newMap = { ...prev };
      delete newMap[selectedFiles[index].name];
      return newMap;
    });
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
  setError(null);

  try {
    for (const file of selectedFiles) {
      setProgressMap(prev => ({ ...prev, [file.name]: 0 }));
      
      try {
        let text;
        if (file.type === 'application/pdf') {
          text = await processPDF(file);
        } else {
          text = await processImage(file);
        }

        // Analizar el documento
        const analysisResults = documentUtils.analyzeDocument(text);
        
        if (analysisResults[0].type !== 'unknown') {
          setUploadedData(prev => [...prev, { 
            fileName: file.name, 
            content: text,
            analysis: analysisResults,
            timestamp: new Date().toISOString(),
            details: analysisResults[0].details
          }]);
          
          toast.success(
            `Archivo procesado: ${file.name}\nTipo: ${analysisResults[0].type}\nConfianza: ${analysisResults[0].confidence.toFixed(1)}%`
          );
        } else {
          toast.warning(`No se pudo identificar el tipo de documento: ${file.name}`);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        toast.error(`Error procesando ${file.name}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error during upload:', error);
    setError('Error durante el procesamiento de archivos');
  } finally {
    setIsProcessing(false);
    setSelectedFiles([]);
    setProgressMap({});
  }
};

// Modificar la sección de visualización de archivos procesados:
{uploadedData.length > 0 && (
  <Box className="mt-4">
    <Typography variant="subtitle2" className="mb-2">
      Archivos procesados
    </Typography>
    <List>
      {uploadedData.map((data, index) => (
        <ListItem key={index}>
          <ListItemIcon>
            <FileText size={20} />
          </ListItemIcon>
          <ListItemText
            primary={data.fileName}
            secondary={
              <>
                <Typography variant="body2">
                  Tipo: {data.analysis[0].type} ({data.analysis[0].confidence.toFixed(1)}%)
                </Typography>
                {data.details && (
                  <Box sx={{ mt: 1 }}>
                    {data.details.dates?.length > 0 && (
                      <Typography variant="caption" display="block">
                        Fechas encontradas: {data.details.dates.join(', ')}
                      </Typography>
                    )}
                    {data.details.amounts?.length > 0 && (
                      <Typography variant="caption" display="block">
                        Montos encontrados: {data.details.amounts.join(', ')}
                      </Typography>
                    )}
                    {data.details.documentNumber && (
                      <Typography variant="caption" display="block">
                        Número de documento: {data.details.documentNumber}
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  </Box>
)}

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') return <FileText size={20} />;
    if (fileType.startsWith('image/')) return <ImageIcon size={20} />;
    return <File size={20} />;
  };

  return (
    <Box className="p-4">
      <Card className="p-6">
        <Typography variant="h6" className="mb-4">
          Carga de Documentos
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {!isWorkerReady && (
          <Alert className="mb-4" icon={<AlertCircle className="w-4 h-4" />}>
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
            {isProcessing ? 'Procesando...' : 'Procesar Archivos'}
          </Button>
        </Box>

        {selectedFiles.length > 0 && (
          <Box className="mb-4">
            <Typography variant="subtitle2" className="mb-2">
              Archivos seleccionados ({selectedFiles.length})
            </Typography>
            <List>
              {selectedFiles.map((file, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => removeFile(index)}
                      disabled={isProcessing}
                    >
                      <XIcon size={20} />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {getFileIcon(file.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={
                      progressMap[file.name] ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={progressMap[file.name]} 
                            sx={{ flexGrow: 1 }}
                          />
                          <Typography variant="caption">
                            {Math.round(progressMap[file.name])}%
                          </Typography>
                        </Box>
                      ) : null
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary">
          Formatos soportados: PDF, JPG, JPEG, PNG (máximo 10 archivos)
        </Typography>

        {uploadedData.length > 0 && (
          <Box className="mt-4">
            <Typography variant="subtitle2" className="mb-2">
              Archivos procesados
            </Typography>
            <List>
              {uploadedData.map((data, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <FileText size={20} />
                  </ListItemIcon>
                  <ListItemText
                    primary={data.fileName}
                    secondary={`Tipo: ${data.type} - Procesado: ${new Date(data.timestamp).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
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