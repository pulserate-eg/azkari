import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');

// All ayah references we use
const ayahMapping = {
  '94:5':  'سورة الشرح',
  '2:286': 'سورة البقرة',
  '93:5':  'سورة الضحى',
  '12:86': 'سورة يوسف',
  '9:40':  'سورة التوبة',
  '39:53': 'سورة الزمر',
  '40:60': 'سورة غافر',
  '20:46': 'سورة طه',
  '2:216': 'سورة البقرة',
  '3:139': 'سورة آل عمران',
  '21:87': 'سورة الأنبياء',
  '18:24': 'سورة الكهف',
  '65:3':  'سورة الطلاق',
  '2:186': 'سورة البقرة',
  '11:90': 'سورة هود',
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
    }).on('error', (err) => { file.close(); fs.unlink(dest, () => {}); reject(err); });
  });
}

async function main() {
  console.log('🔄 Fixing Ayah Audio Files...\n');
  
  for (const ref of Object.keys(ayahMapping)) {
    console.log(`Fetching correct audio URL for Ayah ${ref}...`);
    try {
      const apiResponse = await fetchJson(`https://api.alquran.cloud/v1/ayah/${ref}/ar.alafasy`);
      if (apiResponse.code === 200 && apiResponse.data && apiResponse.data.audio) {
        const audioUrl = apiResponse.data.audio;
        const filename = `ayah_${ref.replace(':', '_')}.mp3`;
        const dest = path.join(AUDIO_DIR, filename);
        
        console.log(`  ↓ Downloading ${filename} from exact URL...`);
        await downloadFile(audioUrl, dest);
        console.log(`  ✓ Replaced successfully.`);
      } else {
        console.error(`  ✗ API did not return audio for ${ref}`);
      }
    } catch (e) {
      console.error(`  ✗ Failed: ${ref} - ${e.message}`);
    }
    // Small delay
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\n✅ All Ayah audio files have been corrected and downloaded!');
}

main().catch(console.error);
