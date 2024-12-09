import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';

// Configuración de pdfjsLib
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Configuración de Tesseract
import { createWorker } from 'tesseract.js';
window.createWorker = createWorker;

// Configuración del worker de Tesseract
const workerConfig = {
  workerPath: '/tesseract/worker.min.js',
  langPath: '/tesseract/lang-data',
  corePath: '/tesseract/tesseract-core.wasm.js',
  logger: m => console.log(m)
};

window.TESSERACT_CONFIG = workerConfig;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
