// Controles: que no se pierdan los toques (fallo del móvil «no chuta y no pasa»)
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
function setup() {
  const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'boton' }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) });
  s.pause = null;
  const p = s.players.find(q => q.team === 'A' && q.role === 'DEL') || s.players.find(q => q.team === 'A' && q.role !== 'POR');
  for (const q of s.players) if (q !== p) { q.stun = 999; }
  p.x = Logic.FIELD.w / 2; p.y = 14; s.controlledId = p.id; Logic._t.take(s, p); s.events.length = 0;
  return { s, p };
}
const still = (o = {}) => Object.assign({ move: { x: 0, y: 0 }, sprint: false, shootHeld: false, passHeld: false, pressed: new Set() }, o);
const idle = (o = {}) => Object.assign({ move: { x: 0, y: -1 }, sprint: false, shootHeld: false, passHeld: false, pressed: new Set() }, o);
const run = (s, inputs) => { for (const i of inputs) Logic.update(s, i, 1 / 60); };
const shot = s => s.events.some(e => e.type === 'shot') || !!s.ball.shot;
const passed = (s, p) => s.ball.owner !== p;

console.log('1. Tiro con un toque rapidísimo (se suelta antes del siguiente fotograma)');
let { s, p } = setup();
run(s, [idle({ pressed: new Set(['shoot']) }), idle(), idle()]);
ok(shot(s) && s.ball.owner !== p, 'chuta igual');

console.log('2. Tiro mantenido (como antes)');
({ s, p } = setup());
run(s, [idle({ shootHeld: true, pressed: new Set(['shoot']) }), ...Array(30).fill(idle({ shootHeld: true }))]);
ok(!shot(s) && s.shoot.charging && s.shoot.charge > 0.3, 'mientras lo mantienes carga (' + s.shoot.charge.toFixed(2) + ')');
run(s, [idle(), idle()]);
ok(shot(s) && s.ball.shot && s.ball.shot.power > 0, 'al soltar, chuta una sola vez');

console.log('3. Pulsar Pase justo cuando tu jugador aún no puede (recuperándose)');
({ s, p } = setup());
p.recover = 0.1;
run(s, [idle({ pressed: new Set(['A']) }), ...Array(12).fill(idle())]);
ok(passed(s, p), 'el pase sale en cuanto puede (antes se perdía)');

console.log('4. Pulsar durante el «congelado» de un golpe');
({ s, p } = setup());
s.hitstop = 0.08;
run(s, [idle({ pressed: new Set(['A']) }), ...Array(10).fill(idle())]);
ok(passed(s, p), 'el pase no se pierde');

console.log('5. El búfer caduca (no hace cosas raras mucho después)');
({ s, p } = setup());
p.recover = 0.6;
run(s, [idle({ pressed: new Set(['A']) }), ...Array(50).fill(idle())]);
ok(!passed(s, p), 'si tarda más de 0,25 s, el toque se olvida');

console.log('6. Pulsar Pase justo ANTES de recibir un pase');
function incoming() {
  const { s, p } = setup();
  const mate = s.players.find(q => q.team === 'A' && q !== p && q.role !== 'POR');
  mate.stun = 0; mate.x = p.x; mate.y = p.y + 8; Logic._t.take(s, mate);
  s.controlledId = mate.id;
  // el compañero me la pasa: el balón va hacia mí
  Object.assign(s.ball, { owner: null, x: p.x, y: p.y + 6, z: 0, vx: 0, vy: -14, vz: 0, lastTeam: 'A', intended: p.id });
  s.controlledId = p.id; p.stun = 0; mate.stun = 999;
  return { s, p };
}
({ s, p } = incoming());
run(s, [still({ pressed: new Set(['A']) })]);
ok(!p.tackle, 'no hace una entrada (antes sí)');
let got = false, gone = false;
for (let i = 0; i < 240 && !gone; i++) { run(s, [still()]); if (s.ball.owner === p) got = true; if (got && s.ball.owner !== p) gone = true; }
ok(got && gone, 'recibe y el pase sale solo, al primer toque');

console.log('7. Tiro al primer toque (pulsas Tiro mientras llega el balón)');
({ s, p } = incoming());
run(s, [still({ pressed: new Set(['shoot']) })]);
let shotOk = false; for (let i = 0; i < 240 && !shotOk; i++) { run(s, [still()]); if (s.ball.shot) shotOk = true; }
ok(shotOk, 'chuta nada más recibir');

console.log('8. Con el balón en los pies de un compañero, Pase no hace una entrada');
({ s, p } = setup());
const m2 = s.players.find(q => q.team === 'A' && q !== p && q.role !== 'POR'); m2.stun = 0; Logic._t.take(s, m2); s.controlledId = p.id;
run(s, [still({ pressed: new Set(['A']) }), still()]);
ok(!p.tackle, 'nada de entradas a tu propio compañero');

console.log(fails ? '\n✗ ' + fails + ' fallos' : '\n✓ Todo bien');
process.exit(fails ? 1 : 0);
