const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: pd.cs ? pd.cs[1] : 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'pcareer.js', 'event.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nthis.Logic=Logic;this.Profile=Profile;this.PC=PlayerCareer;this.PLAYER=PLAYER;this.FORMATIONS=FORMATIONS;this.HW_LEGENDS=HW_LEGENDS;this.Slots=Slots;this.TEAM=TEAM;this.PC_KEY=PC_KEY;', ctx);
const { Logic, Profile, PC, PLAYER, FORMATIONS, HW_LEGENDS } = ctx;
// Carrera Jugador con un legendario de evento: juega en su puesto y su «copia normal» no es su compañera
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load(); Profile.data.firstDone = true;
console.log('1. Cada legendario de Halloween en cada club de la liga');
PC.create(HW_LEGENDS[0].id, 'Occult');
const CLUBS = [].concat(...Object.values(PC.data.divs)).filter(k => k !== 'Occult' && ctx.TEAM(k)).concat(['Occult']);
console.log('   clubes:', CLUBS.length);
for (const L of HW_LEGENDS) {
  const pd = PLAYER(L.id); Profile.data.coll[L.id] = { stars: 1, up: {} };
  for (const club of CLUBS) {
    const c = PC.create(L.id, club);
    const roles = FORMATIONS[c.formation].roles, i = c.lineup.indexOf(L.id);
    const t = PC.matchTeams();
    const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'auto', lockId: t.lockId }, t);
    const me = s.players.find(p => p.id === t.lockId);
    const good = i < 0 || (roles[i] === pd.role && me && me.role === pd.role && me.key === L.id) ;
    const twin = c.squad.some(m => m.id === L.base);
    if (!good || twin) ok(false, pd.name + ' en ' + club + ': puesto ' + roles[i] + ' (es ' + pd.role + '), controla ' + (me && me.name) + (twin ? ' · ¡su copia está en el equipo!' : ''));
  }
}
ok(fails === 0, 'siempre en su puesto, controlas a tu jugador y sin copia en el equipo');
console.log('2. Partida de antes: copia en el equipo y fuera de su puesto');
{
  const L = HW_LEGENDS[0], c = PC.create(L.id, 'Occult');
  c.squad.push(PC.member(L.base, 1, 0)); const R = FORMATIONS[c.formation].roles; c.lineup = c.squad.slice(0, 5).map(m => m.id);
  const k = R.findIndex(r => r !== PLAYER(L.id).role); c.lineup[k] = L.id; PC.save();
  const c2 = PC.load(); PC.starter();
  ok(!c2.squad.some(m => m.id === L.base), 'la copia sale del equipo');
  const i = c2.lineup.indexOf(L.id);
  ok(i < 0 || R[i] === PLAYER(L.id).role, 'vuelve a su puesto (' + (i < 0 ? 'banquillo' : R[i]) + ')');
}
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
