import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');

const reciters = [
  'ar.alafasy',
  'ar.mahermuaiqly',
  'ar.abdulbasitmurattal',
  'ar.husary'
];

// All ayah references we use
const ayahMapping = [
  '94:5', '2:286', '93:5', '12:86', '9:40', '39:53', '40:60', 
  '20:46', '2:216', '3:139', '21:87', '18:24', '65:3', '2:186', '11:90'
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve();
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => { file.close(); fs.unlink(dest, () => {}); reject(err); });
  });
}

async function main() {
  console.log('🔄 Downloading Ayahs for multiple reciters...\n');
  
  for (const reciter of reciters) {
    const dir = path.join(AUDIO_DIR, reciter);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    console.log(`\n🎧 Reciter: ${reciter}`);
    for (const ref of ayahMapping) {
      try {
        const apiResponse = await fetchJson(`https://api.alquran.cloud/v1/ayah/${ref}/${reciter}`);
        if (apiResponse.code === 200 && apiResponse.data && apiResponse.data.audio) {
          const audioUrl = apiResponse.data.audio;
          const filename = `ayah_${ref.replace(':', '_')}.mp3`;
          const dest = path.join(dir, filename);
          
          await downloadFile(audioUrl, dest);
          console.log(`  ✓ ${filename}`);
        }
      } catch (e) {
        console.error(`  ✗ Failed: ${ref}`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log('\n✅ All Ayah audio files have been downloaded!');
}

main().catch(console.error);
