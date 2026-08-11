const fs = require('fs');

const files = [
  'src/app/dashboard/mock-tests/page.tsx',
  'src/app/dashboard/cart/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/min-h-\[420px\]/g, 'min-h-[380px]');
  content = content.replace(/h-52/g, 'h-44');
  content = content.replace(/w-28 h-28/g, 'w-24 h-24');
  content = content.replace(/w-12 h-12/g, 'w-10 h-10');
  content = content.replace(/px-3 pt-5/g, 'px-3 pt-4');
  content = content.replace(/mb-6 mt-auto/g, 'mb-4 mt-auto');
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
