import fs from 'fs';
import path from 'path';
import * as googleTTS from 'google-tts-api';

const azkarList = [
  "اللهم صل وسلم على نبينا محمد",
  "سبحان الله وبحمده",
  "أستغفر الله العظيم",
  "لا حول ولا قوة إلا بالله",
  "لا إله إلا الله",
  "الحمد لله رب العالمين",
  "الله أكبر"
];

const dir = path.join(process.cwd(), 'public', 'azkar');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function download() {
  for (let i = 0; i < azkarList.length; i++) {
    const text = azkarList[i];
    const url = googleTTS.getAudioUrl(text, { lang: 'ar', slow: false, host: 'https://translate.google.com' });
    
    console.log(`Downloading: ${text}`);
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(path.join(dir, `zikr_${i}.mp3`), Buffer.from(buffer));
  }
  console.log("Done");
}

download();
