// Faltas, tarjetas, penaltis y elegir jugador en balón parado
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const ctx = { TX: s => s, TXn: (n, a, b) => (n === 1 ? a : b), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
const idle = () => ({ move: { x: 0, y: 0 }, sprint: false, shootHeld: false, passHeld: false, pressed: new Set() });
const make = o => Logic.createMatch(Object.assign({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'boton' }, o), { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) });
const run = (s, secs) => { for (let i = 0; i < secs * 60 && !s.over; i++) Logic.update(s, idle(), 1 / 60); };
const F = Logic.FIELD;
// Deja el partido en juego y pone a un rival (B) con el balón y a un jugador A que le hace falta
function setup(o, where) {
  const s = make(o); s.pause = null;
  const h = s.players.find(p => p.team === 'B' && p.role === 'DEL'), t = s.players.find(p => p.team === 'A' && p.role === 'DEF');
  h.x = where.x; h.y = where.y; t.x = where.x; t.y = where.y + 1;
  Logic._t.take(s, h); s.controlledId = 'A1';
  return { s, h, t };
}

console.log('1. Falta fuera del área: tiro libre para el que la recibe');
{ const { s, h, t } = setup({}, { x: F.w / 2, y: F.l * 0.45 });
  Logic._t.foulCall(s, t, h, false);
  ok(s.events.some(e => e.type === 'foul' && e.team === 'A' && !e.penalty), 'se pita la falta (de A) y no es penalti');
  let who = null; for (let i = 0; i < 60 * 6 && !who; i++) { Logic.update(s, idle(), 1 / 60); if (s.ball.owner) who = s.ball.owner; }
  ok(who && who.team === 'B', 'saca el rival (' + (who && who.id) + ')'); }

console.log('2. Falta dentro de tu área: penalti');
{ const { s, h, t } = setup({}, { x: F.w / 2, y: F.l - 3 });
  Logic._t.foulCall(s, t, h, false);
  ok(s.events.some(e => e.type === 'foul' && e.penalty), 'es penalti');
  for (let g = 0; g < 60 * 6 && !s.penalty; g++) Logic.update(s, idle(), 1 / 60);
  ok(s.penalty && !s.penalty.fired, 'penalti preparado');
  const tk = s.players.find(p => p.id === s.penalty.taker), spotY = F.spot;
  ok(tk.team === 'B' && Math.abs(s.ball.y - (F.l - F.spot)) < 1.2, 'el rival lo tira desde el punto (bola y=' + s.ball.y.toFixed(1) + ')');
  const inBox = s.players.filter(p => p.id !== tk.id && p.role !== 'POR' && Math.abs(p.x - F.w / 2) < F.boxW / 2 && p.y > F.l - F.boxD);
  ok(inBox.length === 0, 'nadie más dentro del área');
  const before = s.players.map(p => [p.x, p.y]); let maxMove = 0, frames = 0;
  while (s.penalty && frames < 60 * 5) { Logic.update(s, idle(), 1 / 60); frames++; if (s.penalty) s.players.forEach((p, i) => { if (p.role !== 'POR' && p.id !== tk.id && before[i]) maxMove = Math.max(maxMove, Math.hypot(p.x - before[i][0], p.y - before[i][1])); }); }
  ok(frames > 20 && maxMove < 0.3, 'quietos hasta el chut (' + frames + ' fotogramas, se mueven ' + maxMove.toFixed(2) + ' m)');
  run(s, 3);
  ok(!s.penalty, 'se ha tirado el penalti');
  ok(s.events.some(e => e.type === 'shot') || s.score.B > 0, 'hubo chut'); }

console.log('3. Tu penalti: lo tira tu jugador y no se mueve nadie más');
{ const s = make({}); s.pause = null;
  const h = s.players.find(p => p.team === 'A' && p.role === 'DEL'), t = s.players.find(p => p.team === 'B' && p.role === 'DEF');
  h.x = F.w / 2; h.y = 4; t.x = F.w / 2; t.y = 3; Logic._t.take(s, h);
  Logic._t.foulCall(s, t, h, false); run(s, 3.2);
  ok(s.penalty && s.penalty.team === 'A' && s.controlledId === s.penalty.taker, 'lo tira tu jugador y lo controlas');
  run(s, 14);
  ok(!s.penalty, 'si no chutas, chuta solo a los 12 s'); }

console.log('4. Tarjetas: roja quita a un jugador, nunca al portero ni bajando de 4');
{ const { s, h } = setup({}, { x: F.w / 2, y: F.l * 0.45 });
  const gk = s.players.find(p => p.team === 'A' && p.role === 'POR');
  for (let i = 0; i < 40; i++) { s.pause = null; s.penalty = null; Logic._t.foulCall(s, gk, h, true); }
  ok(s.players.some(p => p.id === gk.id), 'el portero sigue en el campo');
  const { s: s2, h: h2 } = setup({}, { x: F.w / 2, y: F.l * 0.45 });
  const defs = s2.players.filter(p => p.team === 'A' && p.role !== 'POR');
  for (let i = 0; i < 80; i++) { s2.pause = null; s2.penalty = null; s2.pick = null; Logic._t.foulCall(s2, defs[i % defs.length], h2, true); }
  const n = s2.players.filter(p => p.team === 'A' && p.role !== 'POR').length;
  ok(n === 3 && s2.sentOff && s2.sentOff.length === 1, 'tras 80 faltas bruscas queda 1 expulsado y 3 de campo (' + n + ')');
  ok(!s2.players.some(p => p.id === s2.sentOff[0]) && s2.players.some(p => p.id === s2.controlledId), 'el expulsado sale y controlas a otro');
  s2.pause = null; run(s2, 20); ok(!s2.over || s2.over, 'el partido sigue sin errores con uno menos'); }

console.log('5. Elegir jugador en balón parado (ajuste pickStop)');
{ const { s, h, t } = setup({ pickStop: 1 }, { x: F.w / 2, y: F.l * 0.55 });
  h.team === 'B';
  // falta del rival (t es B aquí): usamos una falta a favor de A
  const a = s.players.find(p => p.team === 'A' && p.role === 'DEL'), r = s.players.find(p => p.team === 'B' && p.role === 'DEF');
  a.x = F.w / 2; a.y = F.l * 0.4; r.x = a.x; r.y = a.y + 1; Logic._t.take(s, a);
  Logic._t.foulCall(s, r, a, false);
  run(s, 3);
  ok(s.pick && s.pick.ids.length === 4, 'el partido espera: 4 jugadores para elegir (sin portero)');
  const t0 = s.time; run(s, 2); ok(Math.abs(s.time - t0) < 0.01, 'el reloj no corre mientras eliges');
  const mate = s.players.find(p => p.team === 'A' && p.role === 'MED');
  ok(!Logic.pickPlayer(s, 'B3') && s.pick, 'no deja elegir a un rival');
  ok(Logic.pickPlayer(s, mate.id), 'elegir');
  run(s, 1);
  ok(s.ball.owner && s.ball.owner.id === mate.id && s.controlledId === mate.id, 'saca el elegido y lo controlas'); }
{ const s = make({ pickStop: 1 }); s.pause = null;
  Logic._t.take(s, s.players.find(p => p.team === 'A' && p.role === 'DEL'));
  const rv = s.players.find(p => p.team === 'B' && p.role === 'DEF'), a = s.ball.owner;
  Logic._t.foulCall(s, a, rv, false); run(s, 3);   // falta tuya: saca el rival, eliges a quién controlas
  const mate = s.players.find(p => p.team === 'A' && p.role === 'DEF');
  ok(s.pick && Logic.pickPlayer(s, mate.id) && s.controlledId === mate.id && s.ball.owner.team === 'B', 'saca el rival y controlas al que elegiste'); }
{ const { s, h, t } = setup({}, { x: F.w / 2, y: F.l * 0.45 });
  Logic._t.foulCall(s, t, h, false); run(s, 3);
  ok(!s.pick, 'con el ajuste apagado no se pregunta nada'); }

console.log('6. Partidos enteros de IA contra IA');
let tot = 0, withCards = 0, pens = 0, over = 0; const N = 12;
for (let k = 0; k < N; k++) {
  const s = make({ allAI: true, minutes: 3 }); s.pause = null; let f = 0, pn = 0;
  for (let i = 0; i < 60 * 600 && !s.over; i++) { Logic.update(s, idle(), 1 / 60); for (const e of s.events) { if (e.type === 'foul') { f++; if (e.penalty) pn++; } } s.events.length = 0; }
  tot += f; pens += pn; if (s.cards && (s.cards.A.y + s.cards.B.y + s.cards.A.r + s.cards.B.r)) withCards++; if (s.over) over++;
}
console.log('  faltas por partido: ' + (tot / N).toFixed(1) + ' · penaltis: ' + pens + ' · partidos con tarjetas: ' + withCards + '/' + N);
ok(over === N, 'todos los partidos terminan');
ok(tot / N >= 0.5 && tot / N <= 14, 'faltas por partido razonables');
{ let f0 = 0; for (let k = 0; k < 4; k++) { const s = make({ allAI: true, fouls: 0 }); s.pause = null; for (let i = 0; i < 60 * 600 && !s.over; i++) { Logic.update(s, idle(), 1 / 60); f0 += s.events.filter(e => e.type === 'foul').length; s.events.length = 0; } }
  ok(f0 === 0, 'con las faltas desactivadas no hay ninguna'); }
console.log(fails ? '\n✗ ' + fails + ' fallos' : '\n✓ Todo bien'); process.exit(fails ? 1 : 0);
