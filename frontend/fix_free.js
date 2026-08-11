const fs = require('fs');

const badge = '<span className="bg-emerald-500 text-white text-[10px] md:text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow-sm">FREE</span>';

function replace(file, find, replaceText) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(find)) {
    content = content.split(find).join(replaceText);
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}

replace('src/app/dashboard/cart/page.tsx', '<span className="text-green-600">Free</span>', badge);
replace('src/app/dashboard/cart/page.tsx', '<span className="text-green-500">Free</span>', badge);
replace('src/app/dashboard/mock-tests/page.tsx', '<span className="text-green-500">Free</span>', badge);
replace('src/app/dashboard/checkout/page.tsx', "{item.price === 0 ? 'Free' : `₹${(item.price || 0).toFixed(2)}`}", `{item.price === 0 ? ${badge} : \`₹\${(item.price || 0).toFixed(2)}\`}`);
