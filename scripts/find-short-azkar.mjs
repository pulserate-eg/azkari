import https from 'https';
import fs from 'fs';

const url = 'https://raw.githubusercontent.com/rn0x/Adhkar-json/master/azkar.json';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      // Strip BOM if present
      if (data.charCodeAt(0) === 0xFEFF) {
        data = data.slice(1);
      }
      fs.writeFileSync('azkar.json', data);
      console.log('✅ Downloaded azkar.json');
      
      const azkarDict = JSON.parse(data);
      const results = {};
      
      for (const [category, azkarArray] of Object.entries(azkarDict)) {
        for (const zikr of azkarArray) {
          if (!zikr.ARABIC_TEXT) continue;
          
          if (zikr.ARABIC_TEXT.includes('سُبْحَانَ اللَّهِ') && zikr.ARABIC_TEXT.length < 50) results['subhanallah'] = zikr.AUDIO;
          if (zikr.ARABIC_TEXT.includes('الْحَمْدُ لِلَّهِ') && zikr.ARABIC_TEXT.length < 50) results['alhamdulillah'] = zikr.AUDIO;
          if (zikr.ARABIC_TEXT.includes('اللَّهُ أَكْبَرُ') && zikr.ARABIC_TEXT.length < 50) results['allahu_akbar'] = zikr.AUDIO;
          if (zikr.ARABIC_TEXT.includes('أَسْتَغْفِرُ اللَّهَ') && zikr.ARABIC_TEXT.length < 50) results['astaghfirullah'] = zikr.AUDIO;
          if (zikr.ARABIC_TEXT.includes('لَا حَوْلَ وَلَا قُوَّةَ') && zikr.ARABIC_TEXT.length < 50) results['la_hawla'] = zikr.AUDIO;
        }
      }
      console.log(JSON.stringify(results, null, 2));
    } catch (e) {
      console.error('Parse error:', e);
      console.log('First 50 chars of data:', data.slice(0, 50));
    }
  });
});
