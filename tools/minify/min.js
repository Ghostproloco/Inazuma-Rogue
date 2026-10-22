// Comprime el código del juego (lo usa build.py): difícil de leer y de copiar, y pesa menos.
// Instalar una vez: cd tools/minify && npm install
const { minify } = require('terser');
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
minify(src, { compress: { passes: 2 }, mangle: true, keep_classnames: true, format: { comments: false } })
  .then(r => { fs.writeFileSync(process.argv[3], r.code); })
  .catch(e => { console.error('terser:', e.message); process.exit(1); });
