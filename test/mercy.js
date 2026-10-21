// Roguelite: con 5 goles de diferencia se acaba el partido (settings.mercy)
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const ctx = { TX: s => s, TXn: (n, a, b) => (n === 1 ? a : b), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
const make = mercy => Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'boton', mercy }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) });
const idle = { move: { x: 0, y: 0 }, sprint: false, shootHeld: false, passHeld: false, pressed: new Set() };
const afterPause = s => { for (let i = 0; i < 200 && !s.over; i++) Logic.update(s, idle, 1 / 60); };
function play(mercy, goals) {
  const s = make(mercy); s.pause = null;
  for (const t of goals) { s.events.length = 0; Logic._t.goal(s, t); if (s.events.some(e => e.type === 'mercy')) { afterPause(s); return { s, mercy: true }; } s.pause = null; }
  afterPause(s); return { s, mercy: false };
}
console.log('1. Roguelite: 5-0 acaba el partido y lo ganas');
let r = play(5, ['A', 'A', 'A', 'A', 'A']);
ok(r.mercy && r.s.over && r.s.result === 'win', 'acaba con victoria (' + r.s.score.A + '-' + r.s.score.B + ')');
console.log('2. Roguelite: 4-0 sigue');
r = play(5, ['A', 'A', 'A', 'A']);
ok(!r.mercy && !r.s.over, 'el partido sigue');
console.log('3. Roguelite: 1-6 acaba y pierdes');
r = play(5, ['A', 'B', 'B', 'B', 'B', 'B', 'B']);
ok(r.mercy && r.s.over && r.s.result !== 'win', 'acaba con derrota (' + r.s.score.A + '-' + r.s.score.B + ')');
console.log('4. Otros modos (mercy 0): 6-0 sigue');
r = play(0, ['A', 'A', 'A', 'A', 'A', 'A']);
ok(!r.mercy && !r.s.over, 'el partido sigue');
console.log(fails ? '\n✗ ' + fails + ' fallos' : '\n✓ todo bien'); process.exit(fails ? 1 : 0);
