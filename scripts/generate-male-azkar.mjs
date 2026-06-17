/**
 * Generates calm, deep male Azkar audio using ar-QA-MoazNeural voice
 * with slow speaking rate for a spiritual, reverent tone.
 */
import { UniversalEdgeTTS } from 'edge-tts-universal';
import fs from 'fs';
import path from 'path';

// Best calm, deep male voice
const VOICE = 'ar-QA-MoazNeural';
// Slow rate for spiritual feel, slightly lower pitch
const RATE = '-20%';
const PITCH = '-5Hz';

const azkarList = [
  {
    id: 'zikr_subhanallah',
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    filename: 'zikr_subhanallah.mp3'
  },
  {
    id: 'zikr_la_ilah',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    filename: 'zikr_la_ilah.mp3'
  },
  {
    id: 'zikr_salah_alnabi',
    text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    filename: 'zikr_salah_alnabi.mp3'
  },
  {
    id: 'zikr_astaghfirullah',
    text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    filename: 'zikr_astaghfirullah.mp3'
  },
  {
    id: 'zikr_la_hawla',
    text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    filename: 'zikr_la_hawla.mp3'
  },
  {
    id: 'zikr_hasbi_allah',
    text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    filename: 'zikr_hasbi_allah.mp3'
  },
  {
    id: 'zikr_ya_hayyu',
    text: 'يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ',
    filename: 'zikr_ya_hayyu.mp3'
  },
  {
    id: 'zikr_rabbana',
    text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً، وَفِي الْآخِرَةِ حَسَنَةً، وَقِنَا عَذَابَ النَّارِ',
    filename: 'zikr_rabbana.mp3'
  },
  {
    id: 'zikr_sabahu_masaa',
    text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    filename: 'zikr_sabahu_masaa.mp3'
  }
];

const outDir = path.join(process.cwd(), 'public', 'azkar');

async function generate() {
  console.log(`🎙️  Voice: ${VOICE} | Rate: ${RATE} | Pitch: ${PITCH}`);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const zikr of azkarList) {
    console.log(`⏳ Generating: ${zikr.filename}`);
    try {
      const tts = new UniversalEdgeTTS(zikr.text, VOICE, { rate: RATE, pitch: PITCH });
      const res = await tts.synthesize();
      const buffer = Buffer.from(await res.audio.arrayBuffer());
      fs.writeFileSync(path.join(outDir, zikr.filename), buffer);
      console.log(`✅ Saved ${zikr.filename} (${buffer.length} bytes)`);
    } catch (e) {
      console.error(`❌ Failed to generate ${zikr.filename}:`, e.message);
    }
  }
  console.log('\n🎉 Done! All Azkar audio regenerated with calm, deep voice.');
}

generate();
