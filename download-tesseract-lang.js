const https = require('https');
const fs = require('fs');
const path = require('path');

const languages = ['eng', 'spa'];
const baseUrl = 'https://raw.githubusercontent.com/tesseract-ocr/tessdata/';
const outputDir = path.join(process.cwd(), 'public', 'tesseract', 'lang-data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

languages.forEach(lang => {
  const fileName = `${lang}.traineddata`;
  const filePath = path.join(outputDir, fileName);
  const file = fs.createWriteStream(filePath);
  
  https.get(`${baseUrl}${fileName}`, response => {
    if (response.statusCode !== 200) {
      console.error(`Error downloading ${fileName}: Status ${response.statusCode}`);
      fs.unlink(filePath, () => {});
      return;
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${fileName}`);
    });
  }).on('error', err => {
    console.error(`Error downloading ${fileName}: ${err.message}`);
    fs.unlink(filePath, () => {});
  });
});