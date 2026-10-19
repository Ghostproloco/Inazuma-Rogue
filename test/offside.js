const fs = require('fs'), vm = require('vm');
const S = '/home/claude/inazuma/src/';
const ctx = { console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync('/home/claude/inazuma/pub/gamedata.json', 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;this.GAME_SPEED=GAME_SPEED;', ctx);
const { Logic, rivalTeam } = ctx;
const s = Logic.createMatch({ minutes: 3, difficulty: 'facil', golden: false, techMode: 'boton' }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) });
s.pause = null;
const A = s.players.filter(p => p.team === 'A'), B = s.players.filter(p => p.team === 'B');
// A ataca hacia y=0. Defensas de B en y=20; delantero de A en y=10 (fuera de juego)
B.forEach((p, i) => { if (p.role !== 'POR') { p.x = i % 2 ? 1 : 33; p.y = 20; } });
const holder = A.find(p => p.role === 'MED'), del = A.find(p => p.role === 'DEL');
holder.x = 17; holder.y = 30; del.x = 17; del.y = 10;
A.filter(p => p !== holder && p !== del && p.role !== 'POR').forEach(p => { p.x = 2; p.y = 45; });
Logic._t.take(s, holder); s.controlledId = holder.id; holder.aim = -Math.PI / 2;
const ev = [];
for (let i = 0; i < 400; i++) {
  const pressed = new Set(i === 1 ? ['A'] : []);
  Logic.update(s, { move: { x: 0, y: i < 2 ? -1 : 0 }, sprint: false, shootHeld: false, pressed }, 1 / 60);
  if (s.events.some(e => e.type === 'pass')) ev.push('[int=' + s.ball.intended + ' off=' + s.ball.offside + ' del=' + del.id + ']');
  for (const e of s.events) ev.push(e.type + (e.kind ? ':' + e.kind : '') + (e.team ? '@' + e.team : ''));
  s.events.length = 0;
}
console.log(ev.join(' '), '| dueño:', s.ball.owner && s.ball.owner.id);
