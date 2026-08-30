const fs = require('fs');
const path = require('path');

const filePath = path.resolve('e:/Acadify/frontend/src/services/authApi.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/import toast from 'react-hot-toast';\n/g, '');
content = content.replace(/.*toast\.(success|error)\(.*?\);?\n/g, '');

fs.writeFileSync(filePath, content);
console.log('Done replacing toast in authApi.ts');
