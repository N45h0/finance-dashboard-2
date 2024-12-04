import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FileUploader = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [previews, setPreviews] = useState([]);
  const [unsupportedFiles, setUnsupportedFiles] = useState([]);

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

  // Procesar imágenes con OCR (español e inglés)
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

  // Manejar cambios en el input de archivos
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).slice(0, 10); // Limitar a 10 archivos
    let results = [];
    let previewUrls = [];
    let unsupported = []; // Para almacenar archivos no soportados

    files.forEach((file) => {
      const fileName = file.name;

      // Verificar tipos soportados
      if (['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        // Previsualización de imágenes
        if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
          const url = URL.createObjectURL(file);
          previewUrls.push({ name: fileName, url });
        }

        // Procesamiento simultáneo
        if (file.type === 'application/pdf') {
          processPDF(file).then((text) => {
            results.push({ name: fileName, type: 'PDF', content: text });
            setUploadedData((prev) => [...prev, { name: fileName, type: 'PDF', content: text }]);
            toast.success(`Archivo ${fileName} procesado exitosamente`);
          });
        } else if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
          processImage(file, fileName).then((text) => {
            results.push({ name: fileName, type: 'Image', content: text });
            setUploadedData((prev) => [...prev, { name: fileName, type: 'Image', content: text }]);
            toast.success(`Imagen ${fileName} procesada exitosamente`);
          });
        }
      } else {
        unsupported.push(fileName); // Archivos no soportados
      }
    });

    // Mostrar notificación si hay archivos no soportados
    if (unsupported.length > 0) {
      setUnsupportedFiles(unsupported);
      toast.error('Algunos archivos no son soportados: ' + unsupported.join(', '));
    }

    setPreviews(previewUrls); // Guardar previsualizaciones
    setUnsupportedFiles(unsupported); // Actualizar lista de archivos no soportados
  };

  return (
    <div>
      <h1>Uploader de Archivos</h1>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
      />
      <p>Puedes cargar hasta 10 archivos (PDF o imágenes)</p>

      {/* Mensajes para Archivos No Soportados */}
      {unsupportedFiles.length > 0 && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <h3>Archivos no soportados:</h3>
          <ul>
            {unsupportedFiles.map((fileName, index) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Previsualización de Imágenes */}
      {previews.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          {previews.map((preview, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <img
                src={preview.url}
                alt={preview.name}
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <p style={{ fontSize: '12px' }}>{preview.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Barra de Progreso */}
      {Object.keys(progressMap).length > 0 && (
        <div>
          <h2>Progreso:</h2>
          {Object.entries(progressMap).map(([fileName, progress]) => (
            <div key={fileName}>
              <p>{fileName}</p>
              <progress value={progress} max="100"></progress>
              <p>{progress}%</p>
            </div>
          ))}
        </div>
      )}

      {/* Datos Procesados */}
      <div>
        <h2>Datos procesados:</h2>
        {uploadedData.length > 0 ? (
          <ul>
            {uploadedData.map((file, index) => (
              <li key={index}>
                <strong>{file.name} ({file.type}):</strong>
                <pre>{file.content}</pre>
              </li>
            ))}
          </ul>
        ) : (
          <p>No se han procesado archivos aún.</p>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default FileUploader;
