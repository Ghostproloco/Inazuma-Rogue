// Fichajes entre clubes y ofertas por tus jugadores (Carrera de mánager)
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: pd.cs ? pd.cs[1] : 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') + '\nthis.Profile=Profile;this.Career=Career;this.PLAYER=PLAYER;', ctx);
const { Profile, Career, PLAYER } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load();
const c = Career.create(13, 'Test');
// Plantilla de 10 (con 7, el mínimo, no llegan ofertas: no te pueden dejar sin equipo)
Career.freePool(p => p.rarity === 'comun' && p.cs).slice(0, 3).forEach(p => Career.devSign(p.id));
let bids = 0, sold = 0, seasons = 0, guard = 0, before = JSON.stringify(c.clubs);
while (seasons < 3 && guard++ < 200) {
  if (c.bid) { bids++; const m = Career.m(c.bid.id); const money = c.money, price = c.bid.price, n = c.squad.length, key = c.bid.key, id = c.bid.id;
    if (bids % 2 && c.squad.length > 7) { const r = Career.acceptBid(); if (r.ok) { sold++; ok(c.money === money + price && c.squad.length === n - 1 && c.clubs[key].some(p => p.id === id) && c.clubs[key].length === 5, 'venta aceptada: ' + PLAYER(id).name + ' al ' + key + ' por ' + price); } }
    else Career.rejectBid(); }
  if (c.wc) { c.wc = null; }
  if ((c.pendingYouth || []).length) c.pendingYouth = [];
  if (Career.nextMatch()) { const r = Career.simulateMine('equilibrada'); Career.finishMatch(r.gA, r.gB, r.pens, r.forma); }
  const sum = Career.advance();
  if (sum) { seasons++; ok(Array.isArray(sum.transfers), 'temporada ' + sum.season + ': ' + sum.transfers.length + ' fichajes de verano entre clubes'); }
}
ok(bids >= 2, bids + ' ofertas por tus jugadores en 3 temporadas (' + sold + ' aceptadas)');
ok(c.news.filter(n => / ficha a /.test(n)).length >= 10, c.news.filter(n => / ficha a /.test(n)).length + ' noticias de fichajes entre clubes');
ok(JSON.stringify(c.clubs) !== before, 'las plantillas de los rivales han cambiado');
const bad = Object.entries(c.clubs).filter(([k, L]) => L.length !== 5 || L.filter(p => p.role === 'POR').length !== 1);
ok(!bad.length, 'todos los clubes siguen con 5 y un portero' + (bad.length ? ' · mal: ' + bad.map(b => b[0]).join(', ') : ''));
// Un mercado no crea ni pierde jugadores: solo los cambia de sitio
const all = () => Object.values(c.clubs).flat().map(p => p.id).concat(c.squad.map(m => m.id)).sort((a, b) => a - b).join(',');
const b0 = all(), mv = Career.aiTransfers(5);
ok(mv.length && all() === b0, 'un mercado de ' + mv.length + ' fichajes no crea ni pierde jugadores');
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
