import fs from 'fs';
const filePath = 'src/data/contentDatabase.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace temp fallback audio paths with real azkar files
const replacements = [
  ["'/audio/ayah_94_5.mp3', // temp fallback", "'/azkar/zikr_0.mp3'"],
  ["'/audio/ayah_2_186.mp3', // temp fallback", "'/azkar/zikr_1.mp3'"],
  ["'/audio/ayah_40_60.mp3', // temp fallback", "'/azkar/zikr_2.mp3'"],
  ["'/audio/ayah_21_87.mp3', // temp fallback", "'/azkar/zikr_3.mp3'"],
  ["'/audio/ayah_9_40.mp3', // temp fallback", "'/azkar/zikr_4.mp3'"],
  ["'/audio/ayah_11_90.mp3', // temp fallback", "'/azkar/zikr_5.mp3'"],
  ["'/audio/ayah_65_3.mp3', // temp fallback", "'/azkar/zikr_6.mp3'"],
  // Remove the fallback comment line
  ["// للأذكار سنستخدم نفس ملفات الآيات كـ fallback حتى يتم تحميل ملفات مخصصة\n", ""],
];

let count = 0;
for (const [from, to] of replacements) {
  if (content.includes(from)) {
    content = content.split(from).join(to);
    count++;
    console.log(`✓ Replaced: ${from.slice(0, 40)}...`);
  } else {
    console.log(`✗ Not found: ${from.slice(0, 40)}...`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n✅ Done! ${count} replacements made.`);
