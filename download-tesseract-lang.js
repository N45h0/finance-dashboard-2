const https = require('https');
const fs = require('fs');
const path = require('path');

const languages = ['eng', 'spa'];
const baseUrl = 'https://github.com/tesseract-ocr/tessdata/raw/main/';
const outputDir = path.join(process.cwd(), 'public', 'tesseract', 'lang-data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

languages.forEach(lang => {
  const fileName = `${lang}.traineddata`;
  const file = fs.createWriteStream(path.join(outputDir, fileName));
  
  https.get(`${baseUrl}${fileName}`, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${fileName}`);
    });
  }).on('error', err => {
    fs.unlink(fileName);
    console.error(`Error downloading ${fileName}: ${err.message}`);
  });
});
