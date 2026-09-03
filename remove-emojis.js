const fs = require('fs');
let c = fs.readFileSync('src/features/tuition/utils/invoice-generator.ts', 'utf8');
const emojis = ['📋 ', '👩‍🎓', '🗺️ ', '📖 ', '🎯 ', '💬 ', '✅ ', '⚡ ', '📅 ', '💰 ', '🏦 ', '🙏'];
emojis.forEach(e => {
  c = c.split(e).join('');
});
c = c.replace(/<div style="font-size: 24px; margin-bottom: 8px;">\s*<\/div>/g, '');
fs.writeFileSync('src/features/tuition/utils/invoice-generator.ts', c);
console.log('Emojis removed');
