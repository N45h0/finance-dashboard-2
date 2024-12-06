import createModule from './tesseract-core.wasm';

let Module = null;
let moduleReady = false;

async function initializeModule() {
  if (!moduleReady) {
    Module = await createModule();
    moduleReady = true;
  }
  return Module;
}

self.onmessage = async function(e) {
  const { jobId, data, action } = e.data;
  
  try {
    const module = await initializeModule();
    
    switch (action) {
      case 'loadLanguage':
        await module.loadLanguage(data);
        self.postMessage({ jobId, status: 'loaded' });
        break;
        
      case 'initialize':
        await module.initialize(data);
        self.postMessage({ jobId, status: 'initialized' });
        break;
        
      case 'recognize':
        const result = await module.recognize(data);
        self.postMessage({ jobId, status: 'complete', data: result });
        break;
    }
  } catch (error) {
    self.postMessage({ jobId, status: 'error', error: error.message });
  }
};
