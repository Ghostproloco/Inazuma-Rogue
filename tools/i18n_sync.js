// Sincroniza src/en.js con las claves TX('…') del código:
//  node tools/i18n_sync.js missing          → lista las que faltan (una por línea, JSON)
//  node tools/i18n_sync.js add archivo.txt  → añade traducciones «clave exacta en JSON|traducción»
//  (las que ya no se usan se quitan). Los espacios de los bordes se copian de la clave.
const fs = require('fs'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const KEY = /TXn?\(\s*(?:[^,()']+,\s*)?'((?:[^'\\]|\\.)*)'/g;
const used = new Set();
for (const f of ['app.js', 'view.js', 'logic.js', 'run.js', 'career.js', 'event.js', 'shop.js', 'selva.js', 'leyenda.js', 'cloud.js', 'media.js', 'techfx.js', 'pcareer.js', 'ach.js', 'christmas.js', 'go.js', 'limited.js', 'dialog.js']) {
  const src = fs.readFileSync(S + f, 'utf8'); let m; while ((m = KEY.exec(src))) used.add(eval("'" + m[1] + "'")); const PL = /TXn\([^,]+,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'/g; while ((m = PL.exec(src))) { used.add(eval("'" + m[1] + "'")); used.add(eval("'" + m[2] + "'")); }
}
const enSrc = fs.readFileSync(S + 'en.js', 'utf8');
const EN = new Function(enSrc.split('const EN_TEXT =')[1].split('\nI18N.applyData')[0].replace(/;\s*$/, '').replace(/^/, 'return '))();
const [, , cmd, file] = process.argv;
if (cmd === 'missing') { [...used].filter(k => EN[k] == null).sort().forEach(k => console.log(JSON.stringify(k))); process.exit(0); }
if (cmd === 'add') {
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const i = line.lastIndexOf('|'), k = JSON.parse(line.slice(0, i)), v = line.slice(i + 1).trim();
    const lead = k.match(/^\s*/)[0], trail = k.match(/\s*$/)[0];
    EN[k] = lead + v + trail;
  }
}
const keys = Object.keys(EN).filter(k => used.has(k)).sort();
const q = s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const body = keys.map(k => `  ${q(k)}: ${q(EN[k])},`).join('\n');
const [head] = enSrc.split('const EN_TEXT = {');
const tail = enSrc.slice(enSrc.indexOf('};', enSrc.indexOf('const EN_TEXT = {')));
fs.writeFileSync(S + 'en.js', head + 'const EN_TEXT = {\n' + body + '\n' + tail);
console.log(keys.length, 'traducciones ·', [...used].filter(k => EN[k] == null).length, 'sin traducir');
