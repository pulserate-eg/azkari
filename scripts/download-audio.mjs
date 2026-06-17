/**
 * Script to download Quran audio files for offline use.
 * Run with: node scripts/download-audio.mjs
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');

// Alafasy edition audio base URL
const ALAFASY_BASE = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy';

// All ayah references we use (surah:ayah -> number mapping for CDN)
// Format: surahNum * 1000 + ayahNum is NOT how CDN works
// CDN URL is: /audio/128/ar.alafasy/{ayahNumber}.mp3
// Ayah number = cumulative ayah number in Quran

const ayahMapping = {
  '94:5':  { num: 6231, name: 'سورة الشرح'    },
  '2:286': { num: 286,  name: 'سورة البقرة'   },
  '93:5':  { num: 6219, name: 'سورة الضحى'    },
  '12:86': { num: 1847, name: 'سورة يوسف'     },
  '9:40':  { num: 1251, name: 'سورة التوبة'   },
  '39:53': { num: 4270, name: 'سورة الزمر'    },
  '40:60': { num: 4392, name: 'سورة غافر'     },
  '20:46': { num: 2462, name: 'سورة طه'       },
  '2:216': { num: 216,  name: 'سورة البقرة'   },
  '3:139': { num: 445,  name: 'سورة آل عمران' },
  '21:87': { num: 2574, name: 'سورة الأنبياء' },
  '18:24': { num: 2295, name: 'سورة الكهف'   },
  '65:3':  { num: 5538, name: 'سورة الطلاق'  },
  '2:186': { num: 186,  name: 'سورة البقرة'  },
  '11:90': { num: 1492, name: 'سورة هود'     },
};

// Azkar audio: these are short Azkar recited by Alafasy available from Islamic CDNs
// We will use specific ayahs that contain the Azkar text
const azkarAyahMapping = {
  'subhanallah':  { num: 2939, ref: '23:116' },  // سبحان الله
  'alhamdulillah':{ num: 1479, ref: '11:73'  },  // الحمد لله
  'allahu_akbar': { num: 4270, ref: '39:53'  },  // الله أكبر (reuse)
  'astaghfirullah':{ num: 1492, ref: '11:90' },  // أستغفر الله (reuse)
  'la_hawla':     { num: 3501, ref: '29:65'  },  // لا حول ولا قوة إلا بالله
};

if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      console.log(`  ✓ Already exists: ${path.basename(dest)}`);
      resolve();
      return;
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => { file.close(); console.log(`  ↓ Downloaded: ${path.basename(dest)}`); resolve(); });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
    }).on('error', (err) => { file.close(); fs.unlink(dest, () => {}); reject(err); });
  });
}

async function main() {
  console.log('🎵 Downloading Quran audio files...\n');
  
  for (const [ref, { num }] of Object.entries(ayahMapping)) {
    const url = `${ALAFASY_BASE}/${num}.mp3`;
    const filename = `ayah_${ref.replace(':', '_')}.mp3`;
    const dest = path.join(AUDIO_DIR, filename);
    try {
      await downloadFile(url, dest);
    } catch (e) {
      console.error(`  ✗ Failed: ${ref} - ${e.message}`);
    }
    // Small delay to be respectful to CDN
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n✅ All audio files downloaded to public/audio/');
}

main().catch(console.error);
