const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname,'..','src')+'/';
const ctx = { console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','juego','gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
function setup() {
  const s = Logic.createMatch({ minutes: 3, difficulty: 'facil', golden: false, techMode: 'boton' }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) });
  s.pause = null; return s;
}
const step = (s, inp) => { Logic.update(s, Object.assign({ move: { x: 0, y: 0 }, sprint: false, shootHeld: false, passHeld: false, pressed: new Set() }, inp), 1 / 60); const ev = s.events.map(e => e.type + (e.text ? ':' + e.text : '')); s.events.length = 0; return ev; };
// 1) Regate contra un defensa delante
let ok = 0, N = 40;
for (let k = 0; k < N; k++) {
  const s = setup(); const A = s.players.filter(p => p.team === 'A'), B = s.players.filter(p => p.team === 'B');
  const me = A.find(p => p.role === 'MED'), d = B.find(p => p.role === 'DEF');
  B.forEach(p => { if (p !== d && p.role !== 'POR') { p.x = 2; p.y = 2; } });
  me.x = 17; me.y = 30; d.x = 17; d.y = 28.2; Logic._t.take(s, me); s.controlledId = me.id;
  let ev = []; ev = ev.concat(step(s, { move: { x: 0, y: -1 }, pressed: new Set(['dribble']) }));
  for (let i = 0; i < 30; i++) ev = ev.concat(step(s, { move: { x: 0, y: -1 } }));
  if (s.ball.owner === me) ok++;
  if (k === 0) console.log('eventos regate', ev.filter(e => e !== 'msg:¡Balón recuperado!').join(' '));
}
console.log('regates con éxito', ok, 'de', N);
// 2) Pase normal vs fuerte: velocidad del balón
for (const hold of [0, 40]) {
  const s = setup(); const A = s.players.filter(p => p.team === 'A');
  const me = A.find(p => p.role === 'MED'); Logic._t.take(s, me); s.controlledId = me.id;
  step(s, { pressed: new Set(['A']), passHeld: hold > 0 });
  for (let i = 0; i < hold; i++) step(s, { passHeld: true, move: { x: 0, y: -1 } });
  step(s, {});
  console.log(hold ? 'pase fuerte' : 'pase normal', 'velocidad', Math.hypot(s.ball.vx, s.ball.vy).toFixed(1), 'dueño', s.ball.owner && s.ball.owner.id);
}
// 3) Cambio automático al perder el balón
{
  const s = setup(); const A = s.players.filter(p => p.team === 'A'), B = s.players.filter(p => p.team === 'B');
  const far = A.find(p => p.role === 'DEL'); far.x = 30; far.y = 50; s.controlledId = far.id;
  const h = B.find(p => p.role === 'MED'); h.x = 10; h.y = 20; Logic._t.take(s, h);
  const near = A.find(p => p.role === 'DEF'); near.x = 11; near.y = 22;
  s.lastOwnerTeam = 'A';
  const ev = []; for (let i = 0; i < 5; i++) ev.push(...step(s, {}));
  console.log('cambio automático a', s.controlledId, '(cerca:', near.id + ')', ev.includes('switch'));
}
