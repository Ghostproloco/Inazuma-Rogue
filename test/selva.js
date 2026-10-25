// Sobre Selva (evento de la 0.35): 6 legendarios, probabilidades, asegurado y que no salgan en otros sitios
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: 0 }), collFile: () => 'c00.png' };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'pcareer.js', 'event.js', 'shop.js', 'selva.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nthis.Profile=Profile;this.Selva=Selva;this.SV_LEGENDS=SV_LEGENDS;this.PLAYER=PLAYER;this.TECH=TECH;this.Gacha=Gacha;this.Shop=Shop;this.giftPickOptions=giftPickOptions;this.startingTechs=startingTechs;', ctx);
const { Profile, Selva, SV_LEGENDS, PLAYER, TECH, Gacha, Shop } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load();
const avg = p => ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + p.ie[k], 0) / 5;
const L = Selva.legends();
ok(L.length === 6 && L.every(p => p.rarity === 'legendaria' && p.selva && p.gacha === false && p.look), '6 legendarios de evento con su diseño');
ok(['POR', 'DEF', 'MED', 'DEL'].every(r => L.some(p => p.role === r && SV_LEGENDS.find(x => x.id === p.id).top)), 'un top de cada puesto');
L.forEach(p => { const top = SV_LEGENDS.find(x => x.id === p.id).top, m = avg(p);
  ok(top ? m >= 94.5 && m <= 96.5 : m >= 88 && m <= 90, p.name + ' (' + p.role + ') media ' + m.toFixed(1) + ' · ' + p.moves.map(([t]) => TECH(t).name + ' ' + TECH(t).power).join(', ')); });
ok(L.every(p => p.moves.every(([t]) => TECH(t))) && L.every(p => ctx.startingTechs(p).length >= 1), 'todas sus técnicas existen');
// probabilidades
let tops = 0, fill = 0; for (let i = 0; i < 60000; i++) { const id = Selva.pickLegend(); if (SV_LEGENDS.find(x => x.id === id).top) tops++; else fill++; }
ok(Math.abs(tops / 60000 - 1 / 3) < 0.02, 'de los legendarios, 1/3 son top (1 %) y 2/3 de relleno (2 %): ' + (100 * tops / 60000).toFixed(1) + ' %');
Profile.data.tickets = 5000; const t0 = Profile.data.tickets; let leg = 0, n = 0, maxGap = 0, gap = 0;
for (let i = 0; i < 300; i++) { const r = Selva.pull(10); r.forEach(x => { n++; gap++; if (x.tier === 'legendaria') { leg++; maxGap = Math.max(maxGap, gap); gap = 0; } }); }
ok(Profile.data.tickets === t0 - 3000, '1 ticket por tirada');
ok(leg / n > 0.025 && leg / n < 0.05, 'legendarios ' + (100 * leg / n).toFixed(1) + ' % (3 % + asegurado)');
ok(maxGap <= 50, 'nunca más de 50 tiradas sin legendario (máx. ' + maxGap + ')');
ok(Selva.pull(1) && !(Profile.data.tickets = 0) && Selva.pull(1) === null, 'sin tickets no tira');
// no salen en otros sitios
ok(!Gacha.pull(200, { banner: 1 }).some(r => PLAYER(r.id) && PLAYER(r.id).selva), 'no salen en el gacha normal');
ok(!ctx.giftPickOptions({ rarity: 'legendaria' }, 300).some(id => PLAYER(id).selva), 'ni en los «elige 1 de 3»');
ok(!Shop.album().some(a => a.ids.some(id => PLAYER(id).selva)), 'ni en el álbum'); ok(!L.some(p => p.inf), 'ni como versiones del Infinito ' + L.filter(p => p.inf).map(p => p.name));
{ const P = Selva.pool(); ok(P.comun.length + P.rara.length + P.epica.length >= 100, 'muchos jugadores de relleno: ' + P.comun.length + ' comunes, ' + P.rara.length + ' raros, ' + P.epica.length + ' épicos'); }
{ const P = Profile.data; P.giftPicks = []; P.codes = {}; const r = Profile.redeem('selvaleyenda'), g = (P.giftPicks || []).slice(-1)[0];
  ok(r.ok && g && g.opts.length === 3 && new Set(g.opts).size === 3 && g.opts.every(id => PLAYER(id).selva && PLAYER(id).rarity === 'legendaria'), 'código SELVALEYENDA: elige 1 de 3 legendarios de Selva ' + (g ? g.opts.map(id => PLAYER(id).name).join(', ') : r.msg));
  ok(!Profile.redeem('SELVALEYENDA').ok, 'el código solo una vez'); }
{ const P = Profile.data; P.giftPicks = []; const t0 = P.tickets, r = Profile.redeem('inazuma035'), g = P.giftPicks || [];
  const av = pd => ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + pd.ie[k], 0) / 5;
  ok(r.ok && P.tickets === t0 + 20 && g.length === 2 && g.every(x => x.opts.length === 3 && x.opts.every(id => av(PLAYER(id)) >= 80 || PLAYER(id).rarity === 'legendaria')), 'código INAZUMA035: 20 tickets y 2 «elige 1 de 3» de +80');
  let e = 0, l = 0, n = 0; for (let i = 0; i < 4000; i++) for (const id of ctx.giftPickOptions({ min: 80, mix: { evt: 1, leg: 2 } }, 3)) { n++; const p = PLAYER(id); if (p.halloween || p.selva) e++; else if (p.rarity === 'legendaria') l++; }
  ok(Math.abs(e / n - 0.01) < 0.004 && Math.abs(l / n - 0.02) < 0.006, 'probabilidades: evento ' + (100 * e / n).toFixed(2) + ' % · legendario ' + (100 * l / n).toFixed(2) + ' %'); }
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
