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

  // Manejar cambios en el input de archivos
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files).slice(0, 10); // Limitar a 10 archivos
    const previewUrls = [];
    const unsupported = [];
    const results = [];

    for (const file of files) {
      const fileName = file.name;

      if (['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
          const url = URL.createObjectURL(file);
          previewUrls.push({ name: fileName, url });
        }

        try {
          const text =
            file.type === 'application/pdf'
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
    <div>
      <h1>Uploader de Archivos</h1>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
      />
      <p>Puedes cargar hasta 10 archivos (PDF o imágenes)</p>

      {/* Mensajes de Archivos No Soportados */}
      {unsupportedFiles.length > 0 && (
        <div>
          <h3>Archivos no soportados:</h3>
          <ul>
            {unsupportedFiles.map((fileName, index) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Previsualización */}
      {previews.length > 0 && (
        <div>
          <h3>Previsualización de Imágenes</h3>
          {previews.map((preview, index) => (
            <img key={index} src={preview.url} alt={preview.name} />
          ))}
        </div>
      )}

      {/* Validación Manual */}
      {pendingValidation && (
        <div>
          <h3>¿Confirmar este movimiento?</h3>
          <p>Tipo: {pendingValidation.description}</p>
          <button onClick={() => confirmMovement(true)}>Confirmar</button>
          <button onClick={() => confirmMovement(false)}>Descartar</button>
        </div>
      )}

      {/* Notificaciones */}
      <ToastContainer />
    </div>
  );
};

export default FileUploader;
