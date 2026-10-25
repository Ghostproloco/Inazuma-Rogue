// Decisiones de la Carrera Jugador: todas se pueden ver y resolver (todas las opciones) y no se repiten seguidas
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: pd.cs ? pd.cs[1] : 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'pcareer.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') + '\nthis.Profile=Profile;this.PC=PlayerCareer;', ctx);
const { Profile, PC } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load();
const look = PC.lookChoices(3, 'MED')[0], pd = PC.newCustom({ name: 'Ev', role: 'MED', elem: 'viento', look: look.id });
const c = PC.create(pd.id, PC.startOffers(pd.id)[0].key, pd);
const keys = new Set(), bad = [];
// Junta todas las decisiones posibles (en Japón y en la Liga Pro, tras ganar, tras perder y entre semanas)
const collect = () => { for (let i = 0; i < 400; i++) for (const cx of [{}, { after: 'win', club: c.divs[PC.myDiv()].find(k => k !== 'TU') }, { after: 'loss', club: c.divs[PC.myDiv()].find(k => k !== 'TU') }]) {
  c.me.event = null; const E = PC.makeEvent(true, cx); if (!E) continue; keys.add(E.k);
  const v = PC.eventView(); if (!v || !v.title || v.opts.length < 2) { bad.push(E.k + ' (vista)'); continue; }
  const snap = JSON.stringify(c.me);
  v.opts.forEach((o, i) => { c.me = JSON.parse(snap); c.me.event = E; let msg; try { msg = PC.resolveEvent(i); } catch (e) { bad.push(E.k + ':' + i + ' ' + e.message); return; } if (!msg) bad.push(E.k + ':' + i + ' sin mensaje'); });
  c.me = JSON.parse(snap); c.me.event = null; } };
PC.addRel(c.divs[PC.myDiv()].filter(k => k !== 'TU').map(k => c.clubs[k][1].id)[0], 'rival');
c.me.clubs.push('Wild'); collect();
const nJP = keys.size;
PC.devGraduate(); PC.acceptOffer(c.me.offers[0].key); collect();
console.log('    ' + [...keys].sort().join(', '));
ok(keys.size >= 29, keys.size + ' decisiones distintas (' + nJP + ' antes de la Liga Pro)');
ok(!bad.length, 'todas las opciones funcionan y dan un mensaje' + (bad.length ? ': ' + bad.slice(0, 5).join(' | ') : ''));
// No se repiten: 12 seguidas sin repetir
c.me.evSeen = []; const seq = [];
for (let i = 0; i < 12; i++) { c.me.event = null; seq.push(PC.makeEvent(true).k); }
ok(new Set(seq).size === 12, '12 decisiones seguidas sin repetir: ' + seq.join(', '));
// Modo desarrollador: cada decisión se puede forzar y resolver
const devBad = []; const before = Object.keys(c.me.rel).length;
for (const k of PC.devEventKeys()) { PC.devEventForce(k, true); const v = PC.eventView(); if (!v) devBad.push(k + ' (vista)'); c.me.event = null; }
ok(Object.keys(c.me.rel).length === before, 'mirar la lista no crea amigos ni rivales');
for (const k of PC.devEventKeys()) { if (!PC.devEventForce(k)) { devBad.push(k); continue; } const msg = PC.resolveEvent(0); if (!msg) devBad.push(k + ' sin mensaje'); }
ok(!devBad.length && PC.devEventKeys().length === 34, 'el modo dev puede lanzar las ' + PC.devEventKeys().length + ' decisiones' + (devBad.length ? ': ' + devBad.join(', ') : ''));
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
