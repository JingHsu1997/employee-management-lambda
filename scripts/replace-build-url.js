const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'employee-management-frontend', 'build', 'static', 'js', 'main.6b45b1e5.js');
const prod = 'https://6zrtt3kdc8.execute-api.ap-southeast-2.amazonaws.com/dev';
const local = 'http://localhost:5001/dev';

if (!fs.existsSync(file)) {
  console.error('file not found:', file);
  process.exit(1);
}

let content = fs.readFileSync(file, 'utf8');
if (content.indexOf(local) !== -1) {
  console.log('already patched');
  process.exit(0);
}

content = content.split(prod).join(local);
fs.writeFileSync(file, content, 'utf8');
console.log('patched file:', file);
