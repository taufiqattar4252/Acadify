const fs = require('fs');

const replacements = [
  {
    file: 'src/components/admin/Students/StudentDetailsDrawer.tsx',
    searches: [
      { find: '₹{stats.totalAmountSpent}', replace: '₹{(stats.totalAmountSpent || 0).toFixed(2)}' },
      { find: '₹{purchase.amountPaid}', replace: '₹{(purchase.amountPaid || 0).toFixed(2)}' }
    ]
  },
  {
    file: 'src/components/admin/charts/RevenueChart.tsx',
    searches: [
      { find: '[`₹${Number(value).toLocaleString()}`', replace: '[`₹${Number(value).toLocaleString(\'en-IN\', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`' }
    ]
  },
  {
    file: 'src/app/dashboard/mock-tests/page.tsx',
    searches: [
      { find: '>₹{test.price}<', replace: '>₹{(test.price || 0).toFixed(2)}<' },
      { find: '₹{Math.round(test.price * 1.2)}', replace: '₹{(test.price * 1.2).toFixed(2)}' }
    ]
  },
  {
    file: 'src/app/dashboard/checkout/page.tsx',
    searches: [
      { find: '`₹${item.price}`', replace: '`₹${(item.price || 0).toFixed(2)}`' },
      { find: '₹{cart.subtotal}', replace: '₹{(cart.subtotal || 0).toFixed(2)}' },
      { find: '₹{cart.discount}', replace: '₹{(cart.discount || 0).toFixed(2)}' },
      { find: '₹{cart.finalTotal}', replace: '₹{(cart.finalTotal || 0).toFixed(2)}' }
    ]
  },
  {
    file: 'src/app/dashboard/cart/page.tsx',
    searches: [
      { find: '>₹{item.price} <', replace: '>₹{(item.price || 0).toFixed(2)} <' },
      { find: '₹{originalPrice}', replace: '₹{(originalPrice || 0).toFixed(2)}' },
      { find: '₹{cart.finalTotal}', replace: '₹{(cart.finalTotal || 0).toFixed(2)}' },
      { find: '₹{cart.subtotal}', replace: '₹{(cart.subtotal || 0).toFixed(2)}' },
      { find: '>₹{test.price}<', replace: '>₹{(test.price || 0).toFixed(2)}<' },
      { find: '₹{Math.round(test.price * 1.2)}', replace: '₹{(test.price * 1.2).toFixed(2)}' }
    ]
  },
  {
    file: 'src/app/admin/students/page.tsx',
    searches: [
      { find: '₹{student.totalAmountSpent} spent', replace: '₹{(student.totalAmountSpent || 0).toFixed(2)} spent' }
    ]
  },
  {
    file: 'src/app/admin/payments/page.tsx',
    searches: [
      { find: '`₹${stats?.totalRevenue?.toLocaleString() || 0}`', replace: '`₹${(stats?.totalRevenue || 0).toLocaleString(\'en-IN\', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`' },
      { find: '₹{payment.amount}', replace: '₹{(payment.amount || 0).toFixed(2)}' }
    ]
  },
  {
    file: 'src/app/admin/page.tsx',
    searches: [
      { find: 'value={`₹${(stats.revenue / 1000).toFixed(1)}k`}', replace: 'value={`₹${(stats.revenue / 1000).toFixed(2)}k`}' }
    ]
  }
];

let totalChanges = 0;

for (const rep of replacements) {
  if (!fs.existsSync(rep.file)) {
    console.log(`File not found: ${rep.file}`);
    continue;
  }
  let content = fs.readFileSync(rep.file, 'utf8');
  let changed = false;
  
  for (const s of rep.searches) {
    if (content.includes(s.find)) {
      content = content.split(s.find).join(s.replace);
      changed = true;
      totalChanges++;
    } else {
      console.log(`Could not find "${s.find}" in ${rep.file}`);
    }
  }
  
  if (changed) {
    fs.writeFileSync(rep.file, content);
    console.log(`Updated ${rep.file}`);
  }
}

console.log(`Finished with ${totalChanges} replacements.`);
