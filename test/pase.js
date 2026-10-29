// Pase de batalla (XP, premios, Pase Oro, jugador exclusivo) + cambios de jugador y táctica en el partido
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: () => ({ file: 'c00.png', row: 0 }) };
vm.createContext(ctx);
const src = ['logic.js', 'run.js', 'career.js', 'christmas.js', 'limited.js', 'pase.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n');
vm.runInContext(src + '\nProfile.load();Object.assign(this,{Profile,PLAYER,Pase,RARITY,Logic,rivalTeam,buildMatchPlayer,layout,FORMATIONS,PB_PLAYER,PB_LEVELS,PB_XP,PB_PREMIUM_COST,LM_FX});', ctx);
const { Profile, PLAYER, Pase, RARITY, Logic, rivalTeam, buildMatchPlayer, layout, FORMATIONS, PB_PLAYER, PB_LEVELS, PB_XP, PB_PREMIUM_COST, LM_FX } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };

console.log('1. Jugador del Pase');
const pd = PLAYER(PB_PLAYER);
ok(pd && pd.rarity === 'pase' && RARITY.pase.label === 'Pase de batalla', 'rareza «Pase de batalla»');
ok(pd.gacha === false && !pd.lim, 'no sale en ningún gacha');
const avg = ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + pd.ie[k], 0) / 5;
ok(avg >= 98 && avg <= 100, 'nota ~99 (' + avg.toFixed(1) + ')');
ok(LM_FX[PB_PLAYER], 'aura en el campo');

console.log('2. XP y niveles');
Profile.data.coins = 5000; Profile.data.tickets = 100;
ok(Pase.level() === 0, 'empieza en nivel 0');
Pase.matchPlayed(false, 0); ok(Pase.data().xp === 20, '+20 XP por jugar');
Pase.matchPlayed(true, 3); ok(Pase.data().xp === 70 && Pase.data().d.goals === 3, '+50 XP por ganar y cuenta goles');
Pase.matchPlayed(true, 2); ok(Pase.level() === 1, 'sube al nivel 1 (' + Pase.data().xp + ' XP)');

console.log('3. Premios');
ok(Pase.state(1, false) === 'ready' && Pase.state(1, true) === 'premium' && Pase.state(2, false) === 'locked', 'estados de las casillas');
const c0 = Profile.data.coins; Pase.claim(1, false); ok(Profile.data.coins === c0 + Pase.rewardOf(1, false).coins && Pase.state(1, false) === 'got', 'cobrar nivel 1');
ok(Pase.claim(1, false) === null, 'no se cobra dos veces');
ok(Pase.claim(1, true) === null, 'sin Pase Oro no se cobra el oro');
ok(Pase.buyPremium() && Profile.data.coins === c0 + Pase.rewardOf(1, false).coins - PB_PREMIUM_COST && Pase.data().premium, 'comprar Pase Oro');
ok(!Pase.buyPremium(), 'no se compra dos veces');

console.log('4. Hasta el nivel 40');
Profile.data.tickets = 1000; for (let i = 0; i < 40; i++) Pase.buyLevel();
ok(Pase.level() === PB_LEVELS, 'nivel máximo');
const out = Pase.claimAll();
ok(Profile.data.coll[PB_PLAYER] && Profile.data.coll[PB_PLAYER].stars === 1, 'el jugador del Pase llega a la colección');
ok(out.res.some(r => r.id === PB_PLAYER && r.tier === 'pase' && r.isNew), 'sale en la pantalla de premios');
ok(out.res.filter(r => r.tier !== 'pase').length === 20, 'dos tiradas ×10 gratis (' + out.res.length + ')');
ok(Pase.pending() === Pase.MISSIONS.filter(m => Pase.missionState(m) === 'ready').length, 'solo quedan misiones pendientes');
const rem = Pase.claimAll(); ok(rem.res.length === 0, 'cobrar todo otra vez no da nada');

console.log('5. Misiones');
{ const d = Pase.data().d; d.matches = 3; const m = Pase.MISSIONS[0]; ok(Pase.missionState(m) === 'ready', 'misión lista'); const xp0 = Pase.data().xp; ok(Pase.claimMission('m1') === 60 && Pase.data().xp >= xp0, '+60 XP'); ok(Pase.claimMission('m1') === 0, 'una vez'); }

console.log('6. Táctica y cambios en el partido');
const F = FORMATIONS['1-1-1-2'], pos = layout(F.roles);
const mk = (id, role, i) => Object.assign(buildMatchPlayer(id, role, k => PLAYER(id).ie[k], [], [], i, pos[i]), { sprite: { file: 'c00.png', row: 0 } });
const ids = [1, 10, 29, 157, 1024, 1460];
const A = { name: 'A', players: F.roles.map((r, i) => mk(ids[i], r, i)) };
const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'boton', tactic: 'of' }, { A, B: rivalTeam('Zeus', 1, 1) });
ok(s.tactic.A === 'of' && s.tactic.B === 'eq', 'táctica inicial');
Logic.setTactic(s, 'A', 'def'); ok(s.tactic.A === 'def', 'cambia a defensivo'); Logic.setTactic(s, 'A', 'xx'); ok(s.tactic.A === 'def', 'ignora valores raros');
const idle = () => ({ move: { x: 0, y: 0 }, sprint: false, shootHeld: false, passHeld: false, pressed: new Set() });
for (const t of ['def', 'eq', 'of']) { Logic.setTactic(s, 'A', t); const s2 = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'boton', tactic: t }, { A: { name: 'A', players: F.roles.map((r, i) => mk(ids[i], r, i)) }, B: rivalTeam('Zeus', 1, 1) }); for (let i = 0; i < 60 * 20; i++) Logic.update(s2, idle(), 1 / 60); ok(!s2.players.some(p => isNaN(p.x)), 'partido de 20 s en táctica ' + t + ' sin errores'); }
const old = s.players.find(p => p.id === 'A3'), px = old.x, py = old.y;
old.stamina = 0.1;
const nd = mk(1471, old.role, 10);
ok(Logic.substitute(s, 'A3', nd), 'cambio hecho');
const np = s.players.find(p => p.id === 'A3');
ok(np.key === 1471 && np.role === old.role && np.team === 'A' && np.stamina === 1 && np.x === px && np.y === py && np.row === 10, 'entra en el mismo sitio, con energía llena y su fila de sprite');
ok(s.players.length === 10 && s.subs === 1, 'siguen 10 jugadores; cuenta 1 cambio');
{ const w = s.players.find(p => p.id === 'A2'); Logic._t.take(s, w); Logic.substitute(s, 'A2', mk(1541, w.role, 11)); ok(s.ball.owner && s.ball.owner.id === 'A2' && s.ball.owner.key === 1541, 'el balón pasa al que entra'); }
for (let i = 0; i < 60 * 20; i++) Logic.update(s, idle(), 1 / 60);
ok(!s.players.some(p => isNaN(p.x) || isNaN(p.y)), 'el partido sigue bien tras los cambios');
console.log(fails ? '\nFALLAN ' + fails : '\nTodo bien'); process.exit(fails ? 1 : 0);
