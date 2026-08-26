const fs = require('fs');
const path = require('path');

const map = {
  // dark mode explicit
  'dark:bg-gray-900': 'dark:bg-background',
  'dark:bg-gray-800': 'dark:bg-card',
  'dark:bg-gray-700': 'dark:bg-muted',
  'dark:bg-gray-700/50': 'dark:bg-muted/50',
  'dark:border-gray-700': 'dark:border-border',
  'dark:border-gray-600': 'dark:border-border',
  'dark:hover:bg-gray-700': 'dark:hover:bg-muted',
  'dark:hover:bg-gray-700/50': 'dark:hover:bg-muted/50',
};

const mapColor = (originalCls) => {
  if (map[originalCls]) return map[originalCls];

  let cls = originalCls;
  let prefix = '';
  let opacity = '';
  
  if (cls.includes('/')) {
    const parts = cls.split('/');
    cls = parts[0];
    opacity = '/' + parts[1];
  }

  const prefixMatch = cls.match(/^(dark:|hover:|focus:|active:|dark:hover:)/);
  if (prefixMatch) {
    prefix = prefixMatch[1];
    cls = cls.replace(prefixMatch[1], '');
  }

  let mapped = null;

  if (cls.match(/^text-(slate|gray|zinc|neutral|stone)-(900|800)$/)) mapped = 'text-foreground';
  else if (cls.match(/^text-(slate|gray|zinc|neutral|stone)-(700|600|500|400)$/)) mapped = 'text-muted-foreground';
  
  else if (cls.match(/^bg-(slate|gray|zinc|neutral|stone)-(50|100)$/)) mapped = 'bg-muted';
  else if (cls.match(/^bg-(slate|gray|zinc|neutral|stone)-(200|300)$/)) mapped = 'bg-muted-hover';
  
  else if (cls.match(/^border-(slate|gray|zinc|neutral|stone)-(100|200|300)$/)) mapped = 'border-border';
  else if (cls.match(/^ring-(slate|gray|zinc|neutral|stone)-(200|300)$/)) mapped = 'ring-ring';
  
  else if (cls.match(/^text-(emerald|green|teal)-(500|600|700)$/)) mapped = 'text-success';
  else if (cls.match(/^bg-(emerald|green|teal)-(50|100)$/)) mapped = 'bg-success-light';
  
  else if (cls.match(/^text-(red|rose)-(500|600|700)$/)) mapped = 'text-destructive';
  else if (cls.match(/^bg-(red|rose)-(50|100)$/)) mapped = 'bg-destructive-light';
  
  else if (cls.match(/^text-(amber|yellow|orange)-(500|600|700)$/)) mapped = 'text-warning';
  else if (cls.match(/^bg-(amber|yellow|orange)-(50|100)$/)) mapped = 'bg-warning-light';
  
  else if (cls.match(/^text-(indigo|blue|sky|purple)-(500|600|700)$/)) mapped = 'text-primary';
  else if (cls.match(/^bg-(indigo|blue|sky|purple)-(50|100)$/)) mapped = 'bg-primary-light';
  else if (cls.match(/^bg-(indigo|blue|sky|purple)-(500|600)$/)) mapped = 'bg-primary';
  
  if (mapped) {
    return prefix + mapped + opacity;
  }
  return null;
};

// Regex to catch standard tailwind colors and `dark:` variations and `bg-white`
const colorRegex = /\b((?:dark:|hover:|focus:|active:|dark:hover:)?(?:text|bg|border|ring|fill|stroke)-(?:blue|red|green|yellow|indigo|purple|pink|gray|slate|zinc|neutral|stone|emerald|cyan|sky|teal|amber|orange|rose)-[0-9]{2,3}(?:\/[0-9]{1,3})?|bg-white|dark:text-white|text-white)\b/g;

let filesChanged = 0;
let occurrencesReplaced = 0;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      const newContent = content.replace(colorRegex, (match) => {
        const replacement = mapColor(match);
        if (replacement) {
          occurrencesReplaced++;
          changed = true;
          return replacement;
        }
        return match;
      });
      
      if (changed) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        filesChanged++;
      }
    }
  }
}

scanDir(path.join(__dirname, 'src'));

console.log(`Replaced ${occurrencesReplaced} color occurrences across ${filesChanged} files.`);
