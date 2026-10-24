// Gacha limitado de Bai Long: registro, nota 100, técnicas, sobre de 10 por 100 tickets, rareza «limitada», garantías y avisos de jugador nuevo.
const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname, '..', 'src') + '/';
const store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }, window: {}, document: {} };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: 0 }) };
vm.createContext(ctx);
const src = ['logic.js', 'run.js', 'career.js', 'go.js', 'christmas.js', 'limited.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n');
vm.runInContext(src + '\nProfile.load();Object.assign(this,{Profile,PLAYER,TECH,Limitado,LM_PRICE,LM_N,LM_PITY,LM_RATES,NEW_PLAYERS,BAI_ID,BAI_TECHS,RARITY,LEG_TECHS,GIFT_CODES,giftPickOptions,signatureTech,startingTechs,LM_POOL_IDS});', ctx);
const { Profile, PLAYER, TECH, Limitado, LM_PRICE, LM_N, LM_PITY, LM_RATES, NEW_PLAYERS, BAI_ID, BAI_TECHS, RARITY, LEG_TECHS, GIFT_CODES, giftPickOptions, signatureTech, startingTechs, LM_POOL_IDS } = ctx;
let ok = true;
const chk = (c, m) => { if (!c) { ok = false; console.log('FALLA:', m); } };

// 1. Bai Long: nota 100, rareza nueva, su tiro y su técnica
const bai = PLAYER(BAI_ID);
chk(bai && bai.name === 'Bai Long' && bai.role === 'DEL' && bai.elem === 'fuego', 'Bai Long mal registrado');
chk(bai.rarity === 'limitada' && bai.gacha === false && bai.lim === true, 'rareza/limitado de Bai Long');
chk(Math.round(Limitado.avgOf(bai)) === 100, 'la nota de Bai Long no es 100: ' + Limitado.avgOf(bai));
chk(RARITY.limitada && RARITY.limitada.label && RARITY.limitada.dupCoins > RARITY.legendaria.dupCoins, 'falta la rareza limitada');
chk(BAI_TECHS.every(b => TECH(b.id) && TECH(b.id).lim), 'técnicas de Bai Long sin registrar');
chk(TECH(30490).type === 'tiro' && TECH(30491).type === 'regate', 'tipos de técnica');
chk(signatureTech(bai) === 30490, 'su técnica de historia debe ser Dragón relámpago');
chk(startingTechs(bai).includes(30490) && startingTechs(bai).includes(30491), 'empieza con su tiro y su técnica: ' + startingTechs(bai));
chk(!LEG_TECHS.includes(30490) && !LEG_TECHS.includes(30491), 'sus técnicas no deben salir como técnicas legendarias del gacha');

// 2. Bote de 10 jugadores, todos registrados y sin repetir
const ids = Limitado.ids();
chk(ids.length === 10 && new Set(ids).size === 10, 'el bote debe tener 10 jugadores distintos: ' + ids.length);
for (const t in LM_POOL_IDS) LM_POOL_IDS[t].forEach(id => chk(PLAYER(id), 'jugador sin registrar ' + id));
chk([998001, 998002, 998003, 997008].every(id => ids.includes(id)), 'Arion, Victor, Riccardo y Bianchi deben estar en el sobre');

// 3. Ya no hay códigos para ellos
['ARIONGOLD', 'VICTORGOLD', 'RICCARDOGOLD', 'BAILONGGOLD', 'BIANCHINAVIDAD'].forEach(c => chk(!GIFT_CODES[c], 'el código ' + c + ' sigue existiendo'));
const bad = new Set([998001, 998002, 998003, 998004, 997008]);
for (let i = 0; i < 400; i++) giftPickOptions({ rarity: 'comun' }, 3).forEach(id => chk(!bad.has(id), 'un «elige 1 de 3» dio ' + id));

// 4. Sobre: 100 tickets = 10 jugadores
Profile.data.tickets = 99; chk(Limitado.pull() === null && Profile.data.tickets === 99, 'sin tickets no debe tirar');
Profile.data.tickets = 250; let res = Limitado.pull();
chk(res && res.length === LM_N && LM_N === 10 && LM_PRICE === 100, 'un sobre son 10 jugadores por 100 tickets');
chk(Profile.data.tickets === 150, 'el sobre debe costar 100 tickets: ' + Profile.data.tickets);
chk(res.every(r => PLAYER(r.id) && ids.includes(r.id) && Profile.data.coll[r.id]), 'los jugadores del sobre van a la colección');
chk(Profile.data.lm.packs === 1 && Profile.data.lm.pulls === 10, 'contadores del sobre');

// 5. Garantías y probabilidades (miles de sobres)
const cnt = { limitada: 0, legendaria: 0, epica: 0, rara: 0, comun: 0 }; let noEpic = 0, N = 0;
for (let i = 0; i < 3000; i++) {
  Profile.data.tickets = 1000; Profile.data.coll = {}; Profile.data.lm = { pulls: 0, pity: 0, packs: 0 };
  const r = Limitado.pull(); N += r.length;
  if (!r.some(x => ['epica', 'legendaria', 'limitada'].includes(x.tier))) noEpic++;
  r.forEach(x => cnt[x.tier]++);
}
chk(noEpic === 0, 'hay sobres sin épica o mejor: ' + noEpic);
const pct = t => cnt[t] / N * 100;
console.log('Reparto en', N, 'tiradas:', Object.fromEntries(Object.entries(cnt).map(([k, v]) => [k, (v / N * 100).toFixed(1) + ' %'])));
chk(Math.abs(pct('limitada') - 2) < 1.3, 'Bai Long fuera de lo esperado (≈2 %): ' + pct('limitada'));   // incluye algo de garantía
chk(pct('legendaria') > 7 && pct('legendaria') < 13, 'legendarias fuera de rango');
chk(pct('comun') > 28 && pct('comun') < 40, 'comunes fuera de rango');

// 6. Bai Long asegurado a las 30 tiradas sin él (3 sobres) aunque la suerte sea la peor
const rnd = Math.random; Math.random = () => 0.999;
Profile.data.tickets = 1000; Profile.data.coll = {}; Profile.data.lm = { pulls: 0, pity: 0, packs: 0 };
let got = 0; for (let p = 1; p <= 3; p++) { const r = Limitado.pull(); if (r.some(x => x.id === BAI_ID)) got = p; }
Math.random = rnd;
chk(got === 3, 'Bai Long debe salir en el sobre 3 (30 tiradas): ' + got);
chk(Profile.data.lm.pity === 0, 'la garantía se reinicia al salir');

// 7. Repetidos: estrellas y monedas
Profile.data.coll = { [BAI_ID]: { stars: 5, up: {} } }; Profile.data.lm.pity = LM_PITY - 1; Profile.data.tickets = 100; const c0 = Profile.data.coins;
Limitado.pull(); chk(Profile.data.coll[BAI_ID].stars === 5 && Profile.data.coins >= c0 + RARITY.limitada.dupCoins, 'Bai Long repetido con 5★ da monedas');

// 8. Aviso de jugadores nuevos
chk(NEW_PLAYERS.some(n => n.id === BAI_ID), 'Bai Long debe estar en NEW_PLAYERS');
chk(Limitado.pendingNew([]).length === NEW_PLAYERS.length && Limitado.pendingNew([BAI_ID]).length === 0, 'pendingNew');
chk(Limitado.active() === true, 'el gacha limitado debe estar activo');
console.log(ok ? '✓ Todo bien' : 'HAY FALLOS');
