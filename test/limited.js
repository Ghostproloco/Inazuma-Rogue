
// Gacha limitado «Tormenta Celestial»: 4 jugadores limitados, nota 100, sobre de 10 por 50 tickets, garantía y jugadores retirados.
const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname, '..', 'src') + '/';
const store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }, window: {}, document: {} };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: 0 }) };
vm.createContext(ctx);
const src = ['logic.js', 'run.js', 'career.js', 'christmas.js', 'limited.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n');
// partida guardada «vieja»: con los jugadores retirados en la colección
store['inazuma-perfil'] = JSON.stringify({ coll: { 998001: { stars: 3, up: {} }, 998002: { stars: 1, up: {} }, 998003: { stars: 2, up: {} }, 998004: { stars: 5, up: {} }, 1: { stars: 1, up: {} } }, coins: 10, tickets: 5 });
vm.runInContext(src + '\nProfile.load();Object.assign(this,{Navidad,XM_BIANCHI,XM_BIANCHI_PITY,XM_START,Profile,Run,PLAYER,TECH,Limitado,LM_N_LEG,LM_N_EPIC,LM_PRICE,LM_N,LM_PITY,LM_RATES,NEW_PLAYERS,LM_PLAYERS,RARITY,LEG_TECHS,Gacha,GIFT_CODES,giftPickOptions,signatureTech,startingTechs,statOf,LM_POOL_IDS,REMOVED_PLAYERS,runMember});', ctx);
const { Profile, Run, PLAYER, TECH, Limitado, LM_PRICE, LM_N, LM_PITY, LM_RATES, NEW_PLAYERS, LM_PLAYERS, RARITY, GIFT_CODES, giftPickOptions, signatureTech, startingTechs, statOf, LM_POOL_IDS, REMOVED_PLAYERS, runMember } = ctx;
let ok = true;
const chk = (c, m) => { if (!c) { ok = false; console.log('FALLA:', m); } };

// 1. Los 4 limitados: bien registrados, nota 100, rareza limitada y sin salir en el gacha normal
const WANT = { 994001: ['David Samford (Limitado)', 'DEL'], 994002: ['Falcèo Da Silva (Limitado)', 'POR'], 994003: ['Leonardo Almeida (Limitado)', 'MED'], 994004: ['Isabelle Trick (Limitado)', 'MED'] };
chk(LM_PLAYERS.length === 4, 'deben ser 4 limitados');
for (const id in WANT) {
  const p = PLAYER(id);
  chk(p, 'sin registrar ' + id); if (!p) continue;
  chk(p.full === WANT[id][0] && p.role === WANT[id][1], id + ': nombre/puesto ' + p.full + ' ' + p.role);
  chk(p.rarity === 'limitada' && p.gacha === false && p.lim === true && !p.inf && p.cs && p.cs.length === 2, id + ': rareza/gacha/muñeco');
  chk(Math.round(Limitado.avgOf(p)) === 100, id + ': la nota no es 100: ' + Limitado.avgOf(p));
  chk(['tiro', 'control', 'defensa', 'rapidez', 'fisico', 'aguante'].every(k => p.ie[k] > 0 && p.ie[k] <= 105), id + ': estadísticas fuera de rango ' + JSON.stringify(p.ie));
  chk(p.moves.length >= 2 && p.moves.every(m => TECH(m[0])), id + ': técnicas sin registrar');
  const st = startingTechs(p); chk(st.length >= 1 && st.every(t => TECH(t)), id + ': técnicas de inicio ' + st);
  if (p.role === 'POR') chk(st.some(t => TECH(t).type === 'parada'), 'el portero limitado debe empezar con una parada');
  chk(statOf(p.id, { stars: 1, up: {} }, 'tiro') === p.ie.tiro, id + ': los limitados empiezan con todas sus estadísticas');
  console.log(id, p.full, p.role, p.elem, 'nota', Limitado.avgOf(p).toFixed(1), 'técnica firma', TECH(signatureTech(p)).name, '· empieza con', st.map(t => TECH(t).name).join(' + '));
}
chk(RARITY.limitada && RARITY.limitada.dupCoins > RARITY.legendaria.dupCoins, 'falta la rareza limitada');
chk([30, 31862, 31870, 31061].every(id => PLAYER(id).gacha === false), 'las versiones normales de los 4 ya no deben estar en el gacha de siempre');
{ const A = new Set(), P = ctx.Gacha; for (let i = 0; i < 400; i++) { Profile.data.tickets = 99999; (P.pull(10, {}) || []).forEach(r => A.add(r.id)); }
  chk([30, 31862, 31870, 31061, 994001, 994002, 994003, 994004].every(id => !A.has(id)), 'el gacha de siempre ha dado uno de los 4'); }

// 2. Bote de 10 jugadores, todos registrados y sin repetir; Bai Long, Arion, Victor y Riccardo ya no existen
const ids = Limitado.ids();
chk(ids.length >= 50 && new Set(ids).size === ids.length, 'el bote debe tener muchos jugadores distintos: ' + ids.length);
chk(Limitado.pool().legendaria.length === ctx.LM_N_LEG && Limitado.pool().epica.length >= ctx.LM_N_EPIC, 'faltan legendarios o épicos en el bote: ' + Limitado.pool().legendaria.length + ' / ' + Limitado.pool().epica.length);
chk(!ids.includes(997008), 'Bianchi Christmas ya no debe salir en el gacha limitado');
chk(LM_PLAYERS.every(l => PLAYER(l.id).furFace === LM_PLAYERS.indexOf(l)), 'cada limitado lleva su retrato modo furia (furFace)');
for (const t in LM_POOL_IDS) LM_POOL_IDS[t].forEach(id => chk(PLAYER(id), 'jugador sin registrar ' + id));
chk(Limitado.featured().length === 4, 'el banner enseña 4 limitados');
chk(Limitado.chanceOf(994001) === 0.25 && Limitado.chanceOf(997008) === 0, 'probabilidad por jugador: ' + Limitado.chanceOf(994001) + ' / ' + Limitado.chanceOf(997008));
[998001, 998002, 998003, 998004].forEach(id => chk(!PLAYER(id), 'el jugador ' + id + ' sigue existiendo'));
chk(!ctx.GAME.players.some(p => /Bai Long|Arion Sherwind|Victor Blade|Riccardo Di Rigo/.test(p.full || p.name)), 'quedan jugadores retirados en GAME');
chk(LM_RATES.reduce((t, [, w]) => t + w, 0) === 100, 'las probabilidades deben sumar 100');

// 3. Códigos: ninguno da jugadores retirados
['ARIONGOLD', 'VICTORGOLD', 'RICCARDOGOLD', 'BAILONGGOLD', 'BIANCHINAVIDAD'].forEach(c => chk(!GIFT_CODES[c], 'el código ' + c + ' sigue existiendo'));
const bad = new Set([998001, 998002, 998003, 998004, 994001, 994002, 994003, 994004]);
for (let i = 0; i < 400; i++) giftPickOptions({ rarity: 'comun' }, 3).forEach(id => chk(!bad.has(id), 'un «elige 1 de 3» dio ' + id));

// 4. Partida guardada vieja: los retirados desaparecen y lo demás se queda
chk([998001, 998002, 998003, 998004].every(id => !Profile.data.coll[id]) && Profile.data.coll[1], 'Profile.load debe quitar a los retirados y conservar el resto');
const roster = [1, 998004, 998003].map(id => ({ id, temp: false, techs: [], passives: [] }));
const rep = Run.repair({ roster, schedule: ['Royal Academy'], kind: 'story', lineup: [0, 1, 2], index: 0 });
chk(rep.roster.every(m => PLAYER(m.id)), 'Run.repair debe cambiar a los retirados de una ronda guardada: ' + rep.roster.map(m => m.id));
chk(rep.roster[1].id !== 998004 && PLAYER(rep.roster[1].id).role === 'DEL' && PLAYER(rep.roster[2].id).role === 'DEF', 'el cambio debe ser del mismo puesto');
chk(new Set(rep.roster.map(m => m.id)).size === 3, 'sin repetidos en la ronda');

// 5. Sobre: 50 tickets = 10 jugadores
Profile.data.tickets = 49; chk(Limitado.pull() === null && Profile.data.tickets === 49, 'sin tickets no debe tirar');
Profile.data.tickets = 75; let res = Limitado.pull();
chk(res && res.length === LM_N && LM_N === 10 && LM_PRICE === 50, 'un sobre son 10 jugadores por 50 tickets');
chk(Profile.data.tickets === 25, 'el sobre debe costar 50 tickets: ' + Profile.data.tickets);
chk(res.every(r => PLAYER(r.id) && ids.includes(r.id) && Profile.data.coll[r.id]), 'los jugadores del sobre van a la colección');
chk(Profile.data.lm.packs === 1 && Profile.data.lm.pulls === 10, 'contadores del sobre');

// 6. Probabilidades (miles de sobres)
const cnt = { limitada: 0, legendaria: 0, epica: 0, rara: 0, comun: 0 }, each = {}; let noEpic = 0, N = 0;
for (let i = 0; i < 3000; i++) {
  Profile.data.tickets = 1000; Profile.data.coll = {}; Profile.data.lm = { pulls: 0, pity: 0, packs: 0 };
  const r = Limitado.pull(); N += r.length;
  if (!r.some(x => ['epica', 'legendaria', 'limitada'].includes(x.tier))) noEpic++;
  r.forEach(x => { cnt[x.tier]++; each[x.id] = (each[x.id] || 0) + 1; });
}
chk(noEpic === 0, 'hay sobres sin épica o mejor: ' + noEpic);
const pct = t => cnt[t] / N * 100;
console.log('Reparto en', N, 'tiradas:', Object.fromEntries(Object.entries(cnt).map(([k, v]) => [k, (v / N * 100).toFixed(1) + ' %'])));
chk(pct('limitada') > 0.5 && pct('limitada') < 2, 'limitados fuera de lo esperado (≈1 %): ' + pct('limitada'));   // incluye algo de garantía
chk(pct('legendaria') > 4.5 && pct('legendaria') < 8, 'legendarias fuera de rango: ' + pct('legendaria'));
chk(pct('comun') > 28 && pct('comun') < 40, 'comunes fuera de rango');
LM_PLAYERS.forEach(l => chk(each[l.id] > 0 && Math.abs(each[l.id] / N * 100 - pct('limitada') / 4) < 0.2, 'los 4 limitados deben salir parecido: ' + l.id + ' ' + (each[l.id] / N * 100).toFixed(2)));

// 7. Uno de los 4 asegurado a las 200 tiradas sin ninguno (20 sobres) aunque la suerte sea la peor
const rnd = Math.random; Math.random = () => 0.999;
Profile.data.tickets = 5000; Profile.data.coll = {}; Profile.data.lm = { pulls: 0, pity: 0, packs: 0 };
let got = 0; for (let p = 1; p <= 20; p++) { const r = Limitado.pull(); if (r.some(x => x.tier === 'limitada')) got = p; }
Math.random = rnd;
chk(got === 20, 'un limitado debe salir en el sobre 20 (200 tiradas): ' + got);
chk(Profile.data.lm.pity === 0, 'la garantía se reinicia al salir');

// 8. Repetidos: estrellas y monedas
Profile.data.coll = { 994001: { stars: 5, up: {} } }; Profile.data.lm.pity = LM_PITY - 1; Profile.data.tickets = 50; const c0 = Profile.data.coins;
const r8 = Limitado.pull(); const dup = r8.filter(x => x.id === 994001 && x.coins);
chk(Profile.data.coll[994001].stars === 5 && (r8[0].id !== 994001 || Profile.data.coins >= c0 + RARITY.limitada.dupCoins), 'un limitado repetido con 5★ da monedas');

// 9. Aviso de jugadores nuevos: uno por limitado
chk(NEW_PLAYERS.length === 4 && NEW_PLAYERS.every(n => WANT[n.id]), 'NEW_PLAYERS debe tener los 4 limitados');
chk(Limitado.pendingNew([]).length === 4 && Limitado.pendingNew([994001]).length === 3 && Limitado.pendingNew(NEW_PLAYERS.map(n => n.id)).length === 0, 'pendingNew');
chk(Limitado.active() === true, 'el gacha limitado debe estar activo');

// 10. Bianchi Christmas: solo en el Sobre Navideño (súper difícil) y el evento se abre el 12 de diciembre
chk(ctx.XM_START === '2026-12-12', 'la Navidad debe empezar el 12 de diciembre: ' + ctx.XM_START);
{ const N = ctx.Navidad, H = N.data(); const BID = ctx.XM_BIANCHI.id;
  chk(PLAYER(BID) && PLAYER(BID).xmas && PLAYER(BID).gacha === false, 'Bianchi Christmas registrado como jugador de Navidad');
  let seen = 0; const rnd2 = Math.random;
  H.snow = 1e9; H.bpity = 0; for (let i = 0; i < 20000; i++) { const r = N.pull(1); if (r[0].id === BID) seen++; }
  console.log('Bianchi en 20000 tiradas de Navidad:', seen, '(esperado ≈ 40 + garantía)');
  chk(seen > 10 && seen < 150, 'Bianchi sale fuera de lo esperado: ' + seen);
  Math.random = () => 0.999; H.snow = 1e9; H.bpity = 0; H.pity = 0; let first = 0;
  for (let i = 1; i <= ctx.XM_BIANCHI_PITY + 5 && !first; i++) { if (N.pull(1)[0].id === BID) first = i; }
  Math.random = rnd2;
  chk(first === ctx.XM_BIANCHI_PITY, 'Bianchi asegurado a las ' + ctx.XM_BIANCHI_PITY + ' tiradas: salió en ' + first);
}
console.log(ok ? '✓ Todo bien' : 'HAY FALLOS');
