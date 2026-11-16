// Crée .env à partir de .env.local.example s'il n'existe pas encore (fonctionne sous Windows, macOS et Linux).
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const target = path.join(root, '.env');
if (fs.existsSync(target)) console.log('.env existe déjà : conservé.');
else { fs.copyFileSync(path.join(root, '.env.local.example'), target); console.log('.env créé à partir de .env.local.example'); }
