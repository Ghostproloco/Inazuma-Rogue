// Agentes libres: ¿cuántas semanas sale uno destacado? ¿Los jugadores duran 6 cursos?
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: () => ({ file: 'c00.png', row: 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') + '\nthis.Career=Career;this.PLAYER=PLAYER;this.LAST_YEAR=LAST_YEAR;Profile.load();', ctx);
const { Career, PLAYER } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
const c = Career.create(13, 'Instituto Prueba');
const tally = { epica: 0, rara: 0, none: 0 }, avg = [];
for (let fame of [0, 50, 100]) {
  c.fame = fame; const t = { epica: 0, rara: 0, none: 0 };
  for (let w = 0; w < 400; w++) { c.market = null; c.week = w; const m = Career.marketList(); const st = m.star ? PLAYER(m.star) : null; t[st ? st.rarity : 'none']++;
    if (st) avg.push(Career.sumIE(st) / 5 - m.libres.slice(1).reduce((a, id) => a + Career.sumIE(PLAYER(id)) / 5, 0) / (m.libres.length - 1)); }
  console.log(`fama ${fame}: semanas con épica ${Math.round(t.epica / 4)} % · con rara buena ${Math.round(t.rara / 4)} % · sin destacado ${Math.round(t.none / 4)} %`);
  if (fame === 0) ok(t.epica > 30 && t.epica < 100, 'con fama 0, épica ~15 % de las semanas');
  if (fame === 100) ok(t.epica > 120, 'con fama 100, épica ~40 % de las semanas');
}
ok(avg.reduce((a, b) => a + b, 0) / avg.length > 5, 'el destacado tiene de media ' + (avg.reduce((a, b) => a + b, 0) / avg.length).toFixed(1) + ' puntos más que el resto');
// Cursos: un chaval de 1º se queda hasta acabar 6º (con plantilla corta, para que nadie lo venda)
const c2 = Career.create(13, 'Instituto Cursos'); c2.week = 1; c2.market = null;
const kid = c2.squad.find(m => m.year === 1), seen = [];
for (let s = 0; s < 7 && !c2.over; s++) { const m = Career.m(kid.id); seen.push(m ? m.year + 'º' : 'graduado'); c2.fame = 60; const sum = Career.devEndSeason(); if (sum && sum.grads.includes(kid.id)) { seen.push('graduado'); break; } }
console.log('  cursos de ' + PLAYER(kid.id).name + ':', seen.join(' → '));
ok(seen.join(',') === '1º,2º,3º,4º,5º,6º,graduado', 'se gradúa al acabar 6º, no 3º');
// Plantilla llena: los juveniles esperan y el jugador elige
const c3 = Career.create(13, 'Instituto Lleno');
while (c3.squad.length < 12) c3.squad.push(Career.member(Career.freePool(p => p.rarity === 'comun')[c3.squad.length * 7].id, 2));
const before = c3.squad.map(m => m.ovr = Career.ovr(m));
const sum3 = Career.devEndSeason();
ok(sum3.pendingYouth.length >= 2 && c3.squad.length === 12 - sum3.grads.length + Math.max(0, sum3.youth.length - sum3.pendingYouth.length), 'llegan ' + sum3.pendingYouth.length + ' juveniles que no caben y esperan');
const m0 = c3.squad.find(m => !sum3.grads.includes(m.id));
const vets = c3.squad.filter(m => m.year > 1), avgUp = vets.reduce((t, m) => t + Object.values(m.up).reduce((a, b) => a + b, 0) / 5, 0) / vets.length;
ok(sum3.growth === 1 && avgUp >= 0.5, 'los que pasan de curso ganan experiencia (media +' + avgUp.toFixed(2) + ' por stat)');
const worst = c3.squad.slice().sort((a, b) => Career.ovr(a) - Career.ovr(b))[0], k1 = c3.pendingYouth[0].id;
ok(Career.resolveYouth(k1, worst.id).ok && c3.squad.some(m => m.id === k1) && !c3.squad.includes(worst) && c3.squad.length === 12, 'aceptar: entra el juvenil y sale el elegido');
const k2 = c3.pendingYouth[0].id;
ok(Career.resolveYouth(k2, null).ok && !c3.squad.some(m => m.id === k2) && !c3.pendingYouth.length, 'rechazar: el juvenil se va');
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
