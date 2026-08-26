const fs = require('fs');
const path = require('path');

const colorRegex = /\b(text|bg|border|ring|fill|stroke|hover:bg|hover:text|dark:bg|dark:text|dark:border|dark:hover:bg|dark:hover:text)-(blue|red|green|yellow|indigo|purple|pink|gray|slate|zinc|neutral|stone|emerald|cyan|sky|teal|amber|orange|rose)-[0-9]{2,3}(?:\/[0-9]{1,3})?\b/g;

const colors = {};

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let match;
      while ((match = colorRegex.exec(content)) !== null) {
        colors[match[0]] = (colors[match[0]] || 0) + 1;
      }
    }
  }
}

scanDir(path.join(__dirname, 'src'));

const sortedColors = Object.entries(colors).sort((a, b) => b[1] - a[1]);
console.log(`Found ${sortedColors.length} unique color classes`);
console.log(sortedColors.slice(0, 50).map(([color, count]) => `${color}: ${count}`).join('\n'));
