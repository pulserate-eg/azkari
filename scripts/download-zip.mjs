import https from 'https';
import fs from 'fs';
import path from 'path';

const url = 'https://codeload.github.com/rn0x/Adhkar-json/zip/refs/heads/master';
const dest = path.join(process.cwd(), 'adhkar.zip');

console.log('Downloading Adhkar-json zip...');
const file = fs.createWriteStream(dest);

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('✅ Downloaded adhkar.zip');
  });
}).on('error', (err) => {
  fs.unlink(dest, () => {});
  console.error('Error downloading:', err.message);
});
