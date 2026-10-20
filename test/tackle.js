// Entradas: nadie se queda congelado al robar ni al cambiar de jugador
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
const mk = () => { const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'auto', autoSwitch: 0 }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) }); s.kickoff = null; s.phase = 'play'; s.pause = 0; return s; };
const idle = (move = { x: 0, y: 0 }) => ({ move, sprint: false, shootHeld: false, pressed: new Set() });
const busy = p => !!(p.windup || p.tkWind > 0);

console.log('1. Cambias a un compañero que estaba preparando una entrada');
let s = mk();
const B9 = s.players.find(p => p.team === 'B' && p.role === 'DEL'); Logic._t.take(s, B9);
const mate = s.players.find(p => p.team === 'A' && p.role !== 'POR' && p.id !== s.controlledId);
mate.x = B9.x + 1.6; mate.y = B9.y;
// Forzamos que la IA del compañero empiece a preparar la entrada
let started = false;
for (let i = 0; i < 400 && !started; i++) { Logic.update(s, idle(), 1 / 60); s.events.length = 0; started = busy(mate) && !mate.tackle; if (!started) { mate.x = B9.x + 1.6; mate.y = B9.y; mate.tackleCd = 0; if (s.ball.owner !== B9) Logic._t.take(s, B9); } }
ok(started, 'el compañero (IA) empieza a preparar la entrada');
s.controlledId = mate.id;   // el jugador cambia a él justo entonces
for (let i = 0; i < 90; i++) { Logic.update(s, idle({ x: 1, y: 0 }), 1 / 60); s.events.length = 0; }
ok(!busy(mate), 'al controlarlo, la preparación desaparece (antes se quedaba en la pose de patada)');

console.log('2. Un rival que prepara una entrada se queda con el balón');
let stuckSum = 0, tackleWithBall = 0;
for (let n = 0; n < 60; n++) {
  s = mk();
  const holder = s.players.find(p => p.team === 'A' && p.role === 'DEL'); Logic._t.take(s, holder);
  const def = s.players.find(p => p.team === 'B' && p.role === 'DEF');
  def.x = holder.x + 1.5; def.y = holder.y; def.tackleCd = 0;
  for (let i = 0; i < 300 && !(busy(def) && !def.tackle); i++) { Logic.update(s, idle(), 1 / 60); s.events.length = 0; def.x = holder.x + 1.5; def.y = holder.y; if (s.ball.owner !== holder) Logic._t.take(s, holder); }
  Logic._t.take(s, def);   // se queda el balón (rebote, balón suelto…) mientras preparaba la entrada
  let still = 0;
  for (let i = 0; i < 60; i++) { Logic.update(s, idle(), 1 / 60); s.events.length = 0; if (s.ball.owner === def && Math.hypot(def.dvx, def.dvy) < 0.1 && def.stun <= 0) still++; if (s.ball.owner === def && def.tackle && !def.tackle.ok) tackleWithBall++; }
  stuckSum += still;
}
ok(stuckSum / 60 < 8, 'con el balón no se queda parado (media ' + (stuckSum / 60).toFixed(1) + ' fotogramas quieto)');
ok(tackleWithBall === 0, 'no hace una entrada con el balón en los pies (' + tackleWithBall + ' fotogramas)');

console.log('3. Partidos completos: nadie queda congelado mucho rato');
let frozen = 0;
for (let n = 0; n < 4; n++) {
  s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'auto', allAI: true }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) });
  const since = new Map();
  for (let i = 0; i < 60 * 60 * 4 && !s.over; i++) {
    Logic.update(s, idle(), 1 / 60); s.events.length = 0;
    for (const p of s.players) { if (busy(p) && !p.tackle && s.phase === 'play' && !s.tech && !s.pause) since.set(p.id, (since.get(p.id) || 0) + 1); else since.set(p.id, 0); if (since.get(p.id) === 120) frozen++; }
  }
}
ok(frozen === 0, 'nadie lleva 2 s preparando algo sin hacerlo (' + frozen + ' casos)');
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
