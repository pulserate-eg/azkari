import fs from 'fs';
const filePath = 'src/data/contentDatabase.ts';
let content = fs.readFileSync(filePath, 'utf8');

for (let i = 0; i <= 6; i++) {
  const regex = new RegExp(`\\s*audio: '\\/azkar\\/zikr_${i}\\.mp3',`, 'g');
  content = content.replace(regex, '');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Removed azkar audio paths from DB');
