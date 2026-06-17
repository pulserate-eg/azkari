import { UniversalEdgeTTS } from 'edge-tts-universal';
import fs from 'fs';

const voices = [
  'ar-SA-HamedNeural',
  'ar-KW-FahedNeural',
  'ar-DZ-IsmaelNeural',
  'ar-IQ-BasselNeural',
  'ar-QA-MoazNeural',
  'ar-AE-HamdanNeural',
  'ar-LB-RamiNeural',
  'ar-MA-JamalNeural',
  'ar-OM-AbdullahNeural',
];

const text = 'سبحان الله وبحمده، سبحان الله العظيم';

async function test() {
  for (const v of voices) {
    try {
      const tts = new UniversalEdgeTTS(text, v);
      const res = await tts.synthesize();
      const buf = Buffer.from(await res.audio.arrayBuffer());
      fs.writeFileSync(`voice_${v}.mp3`, buf);
      console.log('OK:', v, buf.length + ' bytes');
    } catch(e) {
      console.log('FAIL:', v, e.message);
    }
  }
}

test();
