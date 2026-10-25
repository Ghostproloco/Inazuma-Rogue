// Logros: se detectan con la partida que ya tienes, se recogen una vez y no se pierden
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: pd.cs ? pd.cs[1] : 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'pcareer.js', 'ach.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nthis.Profile=Profile;this.Ach=Ach;this.Career=Career;this.PC=PlayerCareer;', ctx);
const { Profile, Ach, Career, PC } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
// Una partida «antigua»: 60 jugadores, Etapa 1 hecha, 120 victorias, una carrera en Primera
Profile.load(); const P = Profile.data;
ctx.GAME.players.filter(p => p.gacha !== false && p.cs).slice(0, 60).forEach(p => { P.coll[p.id] = { stars: 1, up: {} }; });
P.story.s1.done = true; P.wins = 120; Profile.save();
Career.create(13, 'Test'); Career.data.history.push({ season: 1, div: 1, pos: 3 }); Career.save();
const fresh = Ach.scan().map(a => a.id);
ok(['col10', 'col50', 's1', 'win10', 'win100', 'car1', 'carPrim'].every(id => fresh.includes(id)), 'detecta lo que ya tenías: ' + fresh.join(', '));
ok(!fresh.includes('col150') && !fresh.includes('win500') && !fresh.includes('pcGrad'), 'no da los que faltan');
const t0 = P.tickets, R = Ach.claim('win100');
ok(R && P.tickets === t0 + R.tickets && Ach.state(Ach.LIST.find(a => a.id === 'win100')) === 'got', 'recoger da el premio (' + Ach.rewardTx(R) + ')');
ok(Ach.claim('win100') === null, 'no se puede recoger dos veces');
ok(Ach.claim('col150') === null, 'no se puede recoger uno sin conseguir');
// Conseguido y luego borrado: sigue para recoger
Career.clear(); Career.data = null;
ok(Ach.state(Ach.LIST.find(a => a.id === 'carPrim')) === 'ready', 'aunque borres la carrera, el logro sigue para recoger');
const tot = Ach.claimAll();
ok(tot.n === fresh.length - 1 && Ach.pending() === 0, 'recoger todo: ' + tot.n + ' logros · ' + Ach.rewardTx(tot));
// Carrera Jugador: con un jugador de la colección NO cuenta (solo con uno creado por ti)
{
  const star = ctx.GAME.players.find(p => p.cs && p.rarity === 'legendaria');
  Profile.data.coll[star.id] = { stars: 1, up: {} };
  PC.create(star.id, PC.startOffers(star.id)[0].key);
  PC.data.me.lv = 12; PC.data.me.total.goals = 60;
  ok(!Ach.scan().some(a => a.cat === 'pc' || /^pc/.test(a.id)), 'con ' + star.name + ' (de la colección) no salen logros de la Carrera Jugador');
  PC.clear();
}
const look = PC.lookChoices(3, 'DEL')[0], pd = PC.newCustom({ name: 'Logro', role: 'DEL', elem: 'fuego', look: look.id });
PC.create(pd.id, PC.startOffers(pd.id)[0].key, pd);
ok(Ach.scan().some(a => a.id === 'pcStart'), 'empezar una Carrera Jugador da su logro');
const prog = Ach.progress(Ach.LIST.find(a => a.id === 'pcOvr70'));
ok(prog.goal === 70 && prog.cur > 40 && !prog.ok, 'progreso de «media 70»: ' + prog.cur + '/' + prog.goal);
ok(new Set(Ach.LIST.map(a => a.id)).size === Ach.LIST.length && Ach.LIST.length >= 40, Ach.LIST.length + ' logros, sin ids repetidos');
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
