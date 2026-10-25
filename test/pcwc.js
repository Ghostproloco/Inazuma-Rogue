// Mundial de la Carrera Jugador: selección propia (el creado elige país), papel (titular/suplente/reserva) y ganarse el puesto
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: pd.cs ? pd.cs[1] : 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'pcareer.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nthis.Logic=Logic;this.Profile=Profile;this.PC=PlayerCareer;this.PLAYER=PLAYER;this.TEAM=TEAM;this.PC_NATS=PC_NATS;this.PC_SUB_PART=PC_SUB_PART;this.GAMEP=GAME.players;', ctx);
const { Logic, Profile, PC, PLAYER, TEAM, PC_NATS } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load(); Profile.data.firstDone = true; Profile.save();
const runWC = () => { let g = 0; while (PC.data.pwc.state === 'on' && g++ < 10) PC.wcSimulate(); return PC.data.pwc; };

console.log('1. Selecciones');
ok(PC_NATS[0] === 'JP' && PC_NATS.length >= 14 && PC_NATS.every(k => k === 'JP' || TEAM(k)), PC_NATS.length + ' selecciones: ' + PC_NATS.map(k => PC.natName(k)).join(', '));

console.log('2. Creado de España (Red Matador)');
const pd = PC.newCustom({ name: 'Hugo', role: 'DEL', elem: 'fuego', look: ctx.GAMEP.find(p => p.cs && p.role === 'DEL').id, nat: 'Red Matador' });
PC.create(pd.id, PC.startOffers(pd.id)[0].key, pd);
ok(PC.myNat() === 'Red Matador', 'su selección es Red Matador');
PC.devWC('titular');
let W = PC.data.pwc;
ok(!W.opps.includes('Red Matador') && W.opps.includes('JP') && !W.opps.includes('Neo Japan'), 'rivales sin su propia selección y con Inazuma Japón: ' + W.opps.join(', '));
let t = PC.wcTeams();
ok(t.A.name === 'Red Matador' && t.A.players.some(p => p.key === pd.id) && t.A.players.filter(p => p.key !== pd.id).every(p => PLAYER(p.key).abroad === 'Red Matador'), 'juega con jugadores de su país: ' + t.A.players.map(p => p.name).join(', '));
ok(t.A.players.every(p => p.sprite.kit == null || p.sprite.kit.a === TEAM('Red Matador').kit.a), 'con la equipación de su selección');
// partido contra Inazuma Japón
W.round = W.opps.indexOf('JP'); t = PC.wcTeams();
ok(t.B.name === 'Inazuma Japón' && t.B.players.length === 5 && t.B.players.every(p => !PLAYER(p.key).abroad), 'Inazuma Japón como rival: ' + t.B.players.map(p => p.name).join(', '));
const s = Logic.createMatch({ minutes: 2, difficulty: 'medio', golden: false, techMode: 'auto', allAI: true }, { A: t.A, B: t.B });
for (let i = 0; i < 60 * 60 * 8 && !s.over; i++) { Logic.update(s, { move: { x: 0, y: 0 }, pressed: new Set() }, 1 / 60); s.events.length = 0; }
ok(s.over, 'el partido España–Japón se juega entero (' + s.score.A + '-' + s.score.B + ')');
W.round = 0;
W = runWC();
ok(W.state !== 'on' && W.log.length >= 3, 'Mundial terminado: ' + W.place);

console.log('3. Jugadores reales van con su selección');
const kr = ctx.GAMEP.find(p => p.abroad === 'Unicorn' && p.cs && p.role === 'DEL');
PC.create(kr.id, PC.startOffers(kr.id)[0].key, null);
ok(PC.myNat() === 'Unicorn', kr.name + ' va con Unicorn');
const ax = ctx.GAMEP.find(p => !p.abroad && p.cs && p.role === 'DEL' && p.rarity === 'legendaria');
PC.create(ax.id, PC.startOffers(ax.id)[0].key, null);
ok(PC.myNat() === 'JP', ax.name + ' va con Inazuma Japón');

const ns = PLAYER(21589);
if (ns) { PC.create(ns.id, 'Emperadores Oscuros', null); const ids = PC.data.squad.map(m => m.id); ok(ids.filter(i => i === ns.id).length === 1 && new Set(ids).size === ids.length, ns.name + ' fichando por los Emperadores Oscuros (donde ya estaba): una sola copia'); }
console.log('4. Papel según el nivel');
const pd2 = PC.newCustom({ name: 'Nuevo', role: 'DEL', elem: 'viento', look: ctx.GAMEP.find(p => p.cs && p.role === 'DEL').id, nat: 'JP' });
PC.create(pd2.id, PC.startOffers(pd2.id)[0].key, pd2);
ok(PC.wcRole(null) === 'reserva', 'un novato (media ' + PC.ovrMe() + ') va de reserva con Japón');
// Al mejorar, pasas de reserva a suplente y a titular (en ese orden)
{ const seen = []; let last = null; for (let i = 0; i < 25; i++) { const r = PC.wcRole(null); if (last !== r) { seen.push(r + ' ' + PC.ovrMe()); last = r; } PC.devStats(2); }
  ok(seen.length === 3 && /^reserva/.test(seen[0]) && /^suplente/.test(seen[1]) && /^titular/.test(seen[2]), 'reserva → suplente → titular al mejorar: ' + seen.join(' · ')); }
PC.devStats(20); ok(PC.wcRole(null) === 'titular', 'muy bueno (media ' + PC.ovrMe() + '): titular');
ok(PC.wcRole(7.6) === 'titular', 'buena nota no baja el papel');
const sp = PC.newCustom({ name: 'Rafa', role: 'DEL', elem: 'fuego', look: ctx.GAMEP.find(p => p.cs && p.role === 'DEL').id, nat: 'Red Matador' });
PC.create(sp.id, PC.startOffers(sp.id)[0].key, sp); PC.devStats(20);
ok(PC.wcRole(null) === 'titular', 'en España (media ' + PC.ovrMe() + ') ya eres titular');

console.log('5. Suplente y reserva');
PC.create(pd2.id, PC.startOffers(pd2.id)[0].key, pd2);
PC.devWC('suplente'); W = PC.data.pwc;
t = PC.wcTeams(); ok(t.lockId === null && !t.A.players.some(p => p.key === pd2.id), 'de suplente no empiezas');
t = PC.wcTeams({ subIn: true }); ok(t.lockId && t.A.players.some(p => p.key === pd2.id), 'al salir en la 2.ª parte estás en el campo');
const bp = PC.wcBenchPlan(); ok(bp.gA >= 0 && bp.gB >= 0, 'primera parte simulada ' + bp.gA + '-' + bp.gB);
let r = PC.wcFinish(1, 0, 7.8, { gl: 1 }); ok(r.move === 'titular' && W.role === 'titular', 'nota 7.8 de suplente → ¡titular!');
r = PC.wcFinish(0, 1, 5.0, {}); ok(r.move === 'suplente' && W.role === 'suplente', 'nota 5.0 de titular → al banquillo');
PC.devWC('reserva'); W = PC.data.pwc;
const g0 = PC.data.me.total.goals;
r = PC.wcSimulate(); ok(r.note === null, 'de reserva no juegas (sin nota)');
let up = W.role === 'suplente'; for (let i = 0; i < 4 && !up && W.state === 'on'; i++) { PC.wcSimulate(); up = W.role === 'suplente'; }
ok(up, 'el reserva acaba subiendo a suplente');
ok(PC.data.me.total.goals >= g0, 'sin goles inventados');

console.log('6. Partida antigua (sin selección ni papel)');
PC.devWC(); delete PC.data.pwc.role; delete PC.data.pwc.moves; delete PC.data.pwc.nat; delete PC.data.me.nat;
r = PC.wcSimulate(); ok(r && PC.data.pwc.role && PC.data.pwc.nat === 'JP', 'se arregla sola: ' + PC.data.pwc.role + ' con ' + PC.data.pwc.nat);

console.log('7. Convocatoria en el fin de temporada');
PC.create(pd2.id, PC.startOffers(pd2.id)[0].key, pd2); PC.devStats(40);
let got = null; for (let k = 0; k < 4 && !got; k++) { const sum = PC.devEndSeason(); if (PC.data.pwc) got = PC.data.pwc; }
ok(got && got.role && got.nat === 'JP', 'convocado en la temporada ' + (got && got.season) + ' como ' + (got && got.role));

console.log(fails ? '\n✗ ' + fails + ' fallos' : '\n✓ Todo bien');
process.exit(fails ? 1 : 0);
