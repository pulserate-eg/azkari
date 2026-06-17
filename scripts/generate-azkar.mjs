import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as googleTTS from 'google-tts-api';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AZKAR_DIR = path.join(__dirname, '..', 'public', 'azkar');

if (!fs.existsSync(AZKAR_DIR)) fs.mkdirSync(AZKAR_DIR, { recursive: true });

const targetAzkar = [
  'سُبْحَانَ اللَّهِ',
  'الْحَمْدُ لِلَّهِ',
  'اللَّهُ أَكْبَرُ',
  'لَا إِلَٰهَ إِلَّا اللَّهُ',
  'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
  'أَسْتَغْفِرُ اللَّهَ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ'
];

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function main() {
  console.log('🎙️ Generating AI TTS for Azkar...');
  
  for (let i = 0; i < targetAzkar.length; i++) {
    const text = targetAzkar[i];
    const filepath = path.join(AZKAR_DIR, `zikr_${i}.mp3`);
    
    console.log(`Generating: ${text} -> zikr_${i}.mp3`);
    try {
      const url = googleTTS.getAudioUrl(text, {
        lang: 'ar',
        slow: false,
        host: 'https://translate.google.com',
      });
      await downloadFile(url, filepath);
      console.log(`  ✓ Done`);
    } catch (e) {
      console.error(`  ✗ Failed:`, e.message);
    }
  }

  console.log('\n✅ All 7 Azkar generated!');
}

main().catch(console.error);
