const fs = require('fs');
const path = require('path');
const routes = ['questions', 'subjects', 'chapters', 'mock-tests', 'students', 'purchases', 'payments', 'attempts', 'analytics', 'settings', 'admins', 'support'];
routes.forEach(route => {
  const dir = path.join('src/app/admin', route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), 
    `'use client';\n\nimport React from 'react';\n\nexport default function Page() {\n  return (\n    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">\n      <h2 className="text-2xl font-bold text-slate-900 capitalize">${route.replace('-', ' ')}</h2>\n      <p className="text-slate-500 mt-2">This module is currently under construction.</p>\n    </div>\n  );\n}\n`
  );
});
console.log('Stubs created successfully');
