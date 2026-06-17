import fs from 'fs';
const filePath = 'src/data/contentDatabase.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix missing commas after audio paths for azkar entries
// Pattern: audio line ending without comma before lesson line
content = content.replace(/(audio: '\/azkar\/zikr_\d+\.mp3')\n(\s+lesson:)/g, "$1,\n$2");

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed missing commas in contentDatabase.ts');
