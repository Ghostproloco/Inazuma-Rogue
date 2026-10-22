// Evento de Halloween: fechas, caramelos, Sobre Calabaza, jefe, retos y Ray Dark
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
const store = {};
let NOW = new Date('2026-10-25T12:00:00');
class FakeDate extends Date { constructor(...a) { super(...(a.length ? a : [NOW.getTime()])); } static now() { return NOW.getTime(); } }
const ctx = { TX: s => s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date: FakeDate, String, Number,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: () => ({ file: 'c00.png', row: 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'event.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nProfile.load();Profile.data.firstDone=true;this.Profile=Profile;this.Halloween=Halloween;this.PLAYER=PLAYER;this.Career=Career;this.Gacha=Gacha;this.Logic=Logic;this.HW_LEGENDS=HW_LEGENDS;this.HW_EPIC=HW_EPIC;this.RAY_DARK=RAY_DARK;this.MANAGERS=MANAGERS;', ctx);
const { Profile, Halloween, PLAYER, Career, Gacha, Logic, HW_LEGENDS, HW_EPIC, RAY_DARK } = ctx;
const setDay = d => { NOW = new Date(d + 'T12:00:00'); };

console.log('1. Fechas: del 22 de octubre al 3 de noviembre (incluidos)');
for (const [d, want] of [['2026-10-21', false], ['2026-10-22', true], ['2026-10-23', true], ['2026-10-31', true], ['2026-11-03', true], ['2026-11-04', false]]) { setDay(d); ok(Halloween.active() === want, d + ' → ' + (want ? 'activo' : 'apagado')); }
setDay('2026-11-10'); Halloween.forced = true; ok(Halloween.active(), 'forzado en el modo desarrollador'); Halloween.forced = false;
setDay('2026-10-21'); ok(Halloween.matchPlayed(true) === 0 && Halloween.daily() === 0, 'fuera de fechas no da caramelos');

console.log('2. Legendarios exclusivos y Ray Dark');
for (const L of HW_LEGENDS) {
  const p = PLAYER(L.id), b = PLAYER(L.base), avg = ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + p.ie[k], 0) / 5;
  ok(p && p.rarity === 'legendaria' && p.gacha === false && p.cs[0] === b.cs[0] && avg > 88 && avg < 96, p.full + ' · media ' + avg.toFixed(1));
}
ok(HW_LEGENDS.every((L, i) => PLAYER(L.id).hwFace === i) && PLAYER(996001).moves.some(m => ctx.GAME.techniques[m[0]].name === 'Tiro fantasma'), 'Johan Tassman tiene Tiro fantasma');
ok(PLAYER(996006) && PLAYER(996006).role === 'DEF' && PLAYER(996006).hwFace === 5, 'Zohen (Halloween) es el DF legendario nuevo');
ok(PLAYER(RAY_DARK) && !ctx.GAME.players.some(p => p.id === RAY_DARK), 'Ray Dark existe solo como mánager (no sale en listas ni gachas)');
ok(!Gacha.pull(50, {}).some(r => r.id >= 996000), 'el gacha normal no da jugadores de Halloween');

console.log('3. Caramelos');
setDay('2026-10-24');
const H = Halloween.data(); H.candy = 0;
ok(Halloween.daily() === 20 && Halloween.daily() === 0, 'regalo diario: +20 una vez al día');
setDay('2026-10-25'); ok(Halloween.daily() === 20, 'al día siguiente, otro regalo');
ok(Halloween.matchPlayed(false) === 5 && Halloween.matchPlayed(true) === 15, 'partido: +5, y +10 más si ganas');
ok(H.candy === 60, 'saldo correcto (' + H.candy + ')');

console.log('4. Partido jefe');
const B = Halloween.bossTeam();
const avgB = B.players.reduce((t, p) => t + (p.kick + p.control + p.defense + p.body) / 4, 0) / B.players.length;
const ieAvg = mp => { const pd = PLAYER(mp.id); return ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + Math.round(pd.ie[k] * 1), 0) / 5; };
const statAvg = mp => (mp.kick + mp.control + mp.defense + mp.body) / 4;
ok(B.players.length === 5 && avgB > 75 && avgB < 95, 'Ocultismo jefe: 5 jugadores, media en el campo ' + avgB.toFixed(1));
const tas = B.players.find(p => p.key === 44), rest = B.players.filter(p => p.key !== 44);
ok(tas && statAvg(tas) > Math.max(...rest.map(statAvg)), 'Tassman es el más fuerte (' + statAvg(tas).toFixed(1) + ' frente a ' + rest.map(p => statAvg(p).toFixed(0)).join('/') + ')');
ok(Halloween.bossResult(false) === 0, 'perder no da premio');
ok(Halloween.bossResult(true) === 60 && Halloween.bossResult(true) === 0, 'ganar: +60 una vez al día');
setDay('2026-10-26'); ok(Halloween.bossResult(true) === 60, 'al día siguiente, otra vez +60');
const s = Logic.createMatch({ minutes: 1, difficulty: 'medio', golden: false, techMode: 'auto', allAI: true, field: 'niebla' }, { A: vm.runInContext("rivalTeam('Royal Academy', 1, 1)", ctx), B });
for (let i = 0; i < 60 * 60 * 10 && !s.over; i++) { Logic.update(s, { move: { x: 0, y: 0 }, pressed: new Set() }, 1 / 60); s.events.length = 0; }
ok(s.over, 'el partido contra el jefe se juega entero (' + s.score.A + '-' + s.score.B + ')');

console.log('5. Sobre Calabaza');
const pool = Halloween.pool();
ok(pool.legendaria.length === 6 && pool.epica.length > 20 && pool.rara.length > 50 && pool.comun.length > 100, `bote: ${pool.legendaria.length} leg · ${pool.epica.length} ép · ${pool.rara.length} raras · ${pool.comun.length} comunes`);
H.candy = 10; ok(Halloween.pull(1) === null && H.candy === 10, 'sin caramelos suficientes no tira ni cobra');
H.candy = 15 * 3000; H.pity = 0;
const cnt = { comun: 0, rara: 0, epica: 0, legendaria: 0 }; let maxGap = 0, gap = 0, bad = 0;
for (let i = 0; i < 300; i++) for (const r of Halloween.pull(10)) {
  cnt[r.tier]++; const p = PLAYER(r.id);
  if (!p || !p.cs || p.rarity !== r.tier) bad++;
  if (r.tier === 'legendaria') { maxGap = Math.max(maxGap, gap); gap = 0; } else gap++;
}
ok(bad === 0, 'cada resultado es un jugador válido de su rareza');
ok(H.candy === 0, 'cada tirada cuesta 15 caramelos (×10 = 150)');
const pc = t => (cnt[t] / 30).toFixed(1);
ok(Math.abs(cnt.comun / 30 - 50) < 4 && Math.abs(cnt.rara / 30 - 32) < 4 && Math.abs(cnt.epica / 30 - 15) < 3 && cnt.legendaria / 30 > 2.5 && cnt.legendaria / 30 < 5.5,
  `probabilidades: ${pc('comun')} % común · ${pc('rara')} % rara · ${pc('epica')} % épica · ${pc('legendaria')} % legendaria`);
ok(maxGap <= 39, 'legendario asegurado: nunca más de 39 tiradas seguidas sin uno (máx. ' + maxGap + ')');
ok(HW_LEGENDS.every(L => Profile.data.coll[L.id]), 'tras 3000 tiradas tienes los 5 legendarios');
ok(Object.values(Profile.data.coll).every(o => o.stars <= 5), 'las estrellas no pasan de 5');

console.log('6. Retos y Ray Dark');
ok(Halloween.RETOS.length === 3 && Halloween.RETOS.every(R => Halloween.retoState(R) === 'ready'), 'los 3 retos listos para recoger');
const t0 = Profile.data.tickets;
let last; for (const R of Halloween.RETOS) last = Halloween.claim(R.id);
ok(Halloween.claim('boss') === null, 'un reto no se cobra dos veces');
ok(last && last.ray && Halloween.rayUnlocked() && Profile.data.tickets === t0 + 25, 'al completar los 3: Ray Dark desbloqueado y 25 tickets');
ok(JSON.parse(store['inazuma-perfil']).hw.ray === true, 'se guarda en el perfil (y por tanto en la nube)');

console.log('7. Pasiva de Ray Dark: +10 % de ingresos en el Modo Carrera');
const run = mgr => { Math.random = (() => { let x = 7; return () => (x = (x * 16807) % 2147483647) / 2147483647; })(); const c = Career.create(mgr, 'Prueba'); const m0 = c.money; for (let w = 0; w < 6; w++) { Career.finishMatch(2, 0, null, 0, []); Career.advance(); } return c.money - m0; };
const rnd = Math.random, a = run(13), b = run(RAY_DARK); Math.random = rnd;
ok(b > a * 1.07 && b < a * 1.13, `ingresos en 6 semanas: Nelly ${a} · Ray Dark ${b} (${(b / a * 100 - 100).toFixed(1)} %)`);

console.log('8. Premios por entrar (5 días, no hace falta que sean seguidos)');
setDay('2026-10-22'); const H2 = Halloween.data(); H2.login = null;
const P0 = { candy: H2.candy, tickets: Profile.data.tickets, coins: Profile.data.coins };
ok(Halloween.loginReady() && Halloween.claimLogin().day === 1 && H2.candy === P0.candy + 150, 'día 1: +150 caramelos');
ok(!Halloween.loginReady() && Halloween.claimLogin() === null, 'el mismo día no se repite');
setDay('2026-10-25'); ok(Halloween.claimLogin().day === 2 && Profile.data.tickets === P0.tickets + 10, 'día 2 (aunque falten días entre medias): +10 tickets');
setDay('2026-10-26'); ok(Halloween.claimLogin().day === 3 && Profile.data.coins >= P0.coins + 1000, 'día 3: +1000 monedas');
setDay('2026-10-27'); const opts = Halloween.pickOptions();
ok(opts.length === 3 && new Set(opts).size === 3 && opts.every(id => Halloween.avgOf(PLAYER(id)) >= 80 && !PLAYER(id).halloween), 'día 4: 3 jugadores distintos de +80: ' + opts.map(id => PLAYER(id).name + ' ' + Math.round(Halloween.avgOf(PLAYER(id)))).join(', '));
ok(JSON.stringify(Halloween.pickOptions()) === JSON.stringify(opts), 'las opciones no cambian si vuelves a entrar');
const notIn = Halloween.pickPool().find(id => !opts.includes(id));
ok(Halloween.claimLogin(notIn) === null, 'no vale elegir uno que no está entre los 3');
const d4 = Halloween.claimLogin(opts[1]); ok(d4 && d4.day === 4 && Profile.data.coll[opts[1]], 'eliges uno y es tuyo');
setDay('2026-10-28'); const hadJim = !!Profile.data.coll[HW_EPIC.id]; const d5 = Halloween.claimLogin();
ok(d5 && d5.day === 5 && Profile.data.coll[HW_EPIC.id] && d5.players[0].id === HW_EPIC.id, 'día 5: Jim de Halloween (épico especial, media 86) de regalo' + (hadJim ? ' (ya lo tenía: +1 ★ o monedas)' : ''));
ok(PLAYER(HW_EPIC.id).rarity === 'epica' && PLAYER(HW_EPIC.id).halloween && PLAYER(HW_EPIC.id).hwFace === 6, 'Jim de Halloween: épico con retrato de evento');
setDay('2026-10-29'); ok(!Halloween.loginReady() && Halloween.daily() === 20, 'tras los 5 días no hay más, pero el regalo diario de 20 sigue');
setDay('2026-11-05'); H2.login = null; ok(!Halloween.loginReady(), 'fuera del evento no hay premios');

console.log(fails ? '\n✗ ' + fails + ' fallos' : '\n✓ Todo bien');
process.exit(fails ? 1 : 0);
