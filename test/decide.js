// Menús de decisión: regate/técnica/pase cuando te sale un rival, opciones de chute (normal, poder, vaselina), técnicas con el rayo,
// y balón parado con el que saca quieto (solo pasa o chuta)
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
const inp = (o = {}) => Object.assign({ move: { x: 0, y: 0 }, sprint: false, shootHeld: false, passHeld: false, pressed: new Set() }, o);
const press = (...a) => inp({ pressed: new Set(a) });
const make = o => Logic.createMatch(Object.assign({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'boton', decide: 1, fouls: 0 }, o), { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) });
const run = (s, secs, i) => { for (let k = 0; k < secs * 60 && !s.over; k++) Logic.update(s, i ? i() : inp(), 1 / 60); };
const F = Logic.FIELD, cx = F.w / 2;
const live = o => { const s = make(o); s.pause = null; return s; };
const mine = (s, role) => s.players.find(p => p.team === 'A' && p.role === role);
const give = (s, p, x, y) => { p.x = x; p.y = y; p.vx = p.vy = 0; p.aim = -Math.PI / 2; p.facing = p.aim; Logic._t.take(s, p); s.controlledId = p.id; };
// Aparta a todos los demás para que el menú de «te sale un rival» no se abra sin querer
const clear = (s, keep) => { for (const q of s.players) if (!keep.includes(q)) { q.x = q.team === 'A' ? 2 : F.w - 2; q.y = q.team === 'A' ? F.l - 2 : 2; } };

console.log('1. Con los menús desactivados todo sigue igual');
{ const s = live({ decide: 0 }); const me = mine(s, 'DEL'); give(s, me, cx, 20);
  Logic.update(s, press('shoot'), 1 / 60); ok(!s.menu, 'pulsar Tiro no abre menú'); }

console.log('2. Te sale un rival: menú con regate, técnica y pase; el tiempo se para');
{ const s = live(); const me = mine(s, 'MED'), foe = s.players.find(p => p.team === 'B' && p.role === 'DEF');
  give(s, me, cx, 30); foe.x = cx; foe.y = 28.6; foe.vx = foe.vy = 0;
  Logic.update(s, inp(), 1 / 60);
  ok(s.menu && s.menu.kind === 'regate', 'se abre el menú de regate');
  ok(s.menu.opts[0].act === 'regate' && s.menu.opts[0].pct > 0, 'primera opción: regatear con ' + (s.menu && s.menu.opts[0].pct) + ' %');
  ok(s.menu.opts.some(o => o.act === 'pase' && o.pct > 0), 'hay opciones de pase con su probabilidad');
  const t0 = s.time, x0 = foe.x, y0 = foe.y; run(s, 3);
  ok(s.time === t0 && foe.x === x0 && foe.y === y0, 'el reloj y los jugadores están parados');
  Logic.chooseMenu(s, 0); ok(!s.menu && me.dash, 'al elegir Regatear, regatea');
  run(s, 0.1); ok(!s.menu, 'no se vuelve a abrir enseguida'); }
{ const s = live(); const me = mine(s, 'MED'), foe = s.players.find(p => p.team === 'B' && p.role === 'DEF');
  give(s, me, cx, 30); foe.x = cx; foe.y = 28.6;
  Logic.update(s, inp(), 1 / 60); const i = s.menu.opts.findIndex(o => o.act === 'pase'); const mate = s.menu.opts[i].mate;
  Logic.chooseMenu(s, i); ok(s.ball.owner === null && s.ball.intended === mate, 'al elegir pasar a un compañero, el balón va a él'); }
{ const s = live(); const me = mine(s, 'MED'), foe = s.players.find(p => p.team === 'B' && p.role === 'DEF');
  give(s, me, cx, 30); foe.x = cx; foe.y = 28.6;
  Logic.update(s, inp(), 1 / 60); Logic.chooseMenu(s, -1); ok(!s.menu && s.ball.owner === me, 'cancelar deja todo como estaba');
  run(s, 1); ok(!s.menu, 'y no te vuelve a preguntar al momento'); }

console.log('3. Tiro: chutar, con poder o vaselina (solo con la portería cerca)');
{ const s = live(); const me = mine(s, 'DEL'); give(s, me, cx, 12); clear(s, [me, s.players.find(p => p.team === 'B' && p.role === 'POR')]);
  Logic.update(s, press('shoot'), 1 / 60);
  ok(s.menu && s.menu.kind === 'tiro', 'cerca de la portería, Tiro abre el menú');
  ok(['normal', 'poder', 'vaselina'].every(a => s.menu.opts.some(o => o.act === a)), 'con chutar, poder y vaselina');
  Logic.chooseMenu(s, s.menu.opts.findIndex(o => o.act === 'vaselina'));
  ok(s.ball.shot && s.ball.shot.lob, 'la vaselina sale como vaselina'); }
{ const s = live(); const me = mine(s, 'DEL'); give(s, me, cx, 35); clear(s, [me]);
  Logic.update(s, press('shoot'), 1 / 60);
  ok(!s.menu && s.ball.shot, 'lejos de la portería, Tiro chuta directamente sin menú'); }
{ const s = live(); const me = mine(s, 'DEL'); give(s, me, cx, 12); clear(s, [me, s.players.find(p => p.team === 'B' && p.role === 'POR')]);
  Logic.update(s, press('shoot'), 1 / 60); Logic.setMenuAim(s, -0.85); Logic.chooseMenu(s, 0);
  ok(s.ball.vx < 0, 'se puede apuntar a la izquierda antes de chutar'); }

console.log('4. Vaselina: el portero en la línea la caza casi siempre; si ha salido, casi nunca llega');
{ const rate = (how, out) => { let g = 0, n = 300;
    for (let k = 0; k < n; k++) { const s = live(); const me = mine(s, 'DEL'), gk = s.players.find(p => p.team === 'B' && p.role === 'POR');
      give(s, me, cx + (Math.random() - 0.5) * 6, 10 + Math.random() * 4); clear(s, [me, gk]); gk.x = cx; gk.y = 1.2 + out;
      Logic.update(s, press('shoot'), 1 / 60); Logic.chooseMenu(s, s.menu.opts.findIndex(o => o.act === how));
      for (let i = 0; i < 60 * 5 && !s.score.A && !s.ball.owner; i++) { Logic.update(s, inp(), 1 / 60); if (gk.y !== 1.2 + out && !s.over) { gk.y = 1.2 + out; gk.x = cx; } if (s.pause) break; }
      if (s.score.A) g++; }
    return g / n; };
  const lobOn = rate('vaselina', 0), lobOut = rate('vaselina', 2.4), nor = rate('normal', 0), pow = rate('poder', 0);
  console.log('    gol: vaselina con portero en la línea ' + (lobOn * 100).toFixed(0) + ' % · con el portero fuera ' + (lobOut * 100).toFixed(0) + ' % · chute normal ' + (nor * 100).toFixed(0) + ' % · con poder ' + (pow * 100).toFixed(0) + ' %');
  ok(lobOut > lobOn + 0.2, 'la vaselina funciona mucho mejor si el portero ha salido');
  ok(lobOn < 0.3, 'con el portero en su línea es una mala idea');
  ok(lobOut > 0.35, 'con el portero adelantado es una buena opción'); }

console.log('5. Rayo (Técnica): menú con tus técnicas y pausa');
{ const s = live(); const me = s.players.find(p => p.team === 'A' && p.role === 'DEL' && p.techs.some(t => t.type === 'tiro')) || mine(s, 'DEL');
  give(s, me, cx, 14); clear(s, [me, s.players.find(p => p.team === 'B' && p.role === 'POR')]); for (const k in me.cd) me.cd[k] = 0;
  Logic.update(s, press('tech'), 1 / 60);
  if (me.techs.some(t => t.type === 'tiro')) {
    ok(s.menu && s.menu.kind === 'tecnica' && s.menu.opts.some(o => o.act === 'tecnica' && !o.off), 'se abre la lista de técnicas');
    const t0 = s.time; run(s, 2); ok(s.time === t0, 'el tiempo se para');
    Logic.chooseMenu(s, s.menu.opts.findIndex(o => !o.off)); ok(s.tech && s.tech.p === me, 'al elegir, empieza la supertécnica');
  } else console.log('    (este jugador no tiene técnica de tiro; se salta)'); }

console.log('6. Balón parado: el que saca no se mueve; pasa o chuta');
{ const s = live(); const t = mine(s, 'MED'); clear(s, [t]);
  Logic._t.restart(s, 'A', cx, 40, 'falta', null); s.pause = null;
  const taker = s.ball.owner; ok(s.hold && s.hold.id === taker.id, 'el que saca queda retenido (' + (taker && taker.id) + ')');
  const x0 = taker.x, y0 = taker.y;
  run(s, 1, () => inp({ move: { x: 1, y: 0 } })); ok(taker.x === x0 && taker.y === y0, 'aunque muevas el joystick no se mueve');
  Logic.update(s, press('A'), 1 / 60); ok(s.menu && s.menu.kind === 'pase', 'Pase abre la lista de compañeros');
  Logic.chooseMenu(s, 0); Logic.update(s, inp(), 1 / 60); ok(!s.hold && s.ball.owner === null, 'al elegir, el pase sale y se acaba la retención'); }
{ const s = live(); Logic._t.restart(s, 'A', cx, 20, 'falta', null); s.pause = null;
  Logic.update(s, press('shoot'), 1 / 60); ok(s.menu && s.menu.kind === 'tiro', 'falta cerca de la portería: Tiro abre las opciones de chute'); }
{ const s = live(); Logic._t.restart(s, 'A', cx, 46, 'falta', null); s.pause = null;
  Logic.update(s, press('shoot'), 1 / 60); ok(!s.menu && s.ball.shot, 'falta lejos: chuta sin menú'); }
{ const s = live(); Logic._t.restart(s, 'A', 0.25, 30, 'banda', null); s.pause = null;
  Logic.update(s, press('shoot'), 1 / 60); ok(!s.menu && !s.ball.shot && s.ball.owner, 'en un saque de banda no se puede chutar'); }
{ const s = live(); Logic._t.restart(s, 'B', cx, 20, 'falta', null); s.pause = null; ok(!s.hold, 'si saca el rival no hay retención'); }

console.log('7. Penalti propio: solo se chuta, con las opciones');
{ const s = live(); const t = mine(s, 'DEL'); s.controlledId = t.id; Logic._t.startPenalty(s, 'A', t.id); s.pause = null;
  Logic.update(s, press('A'), 1 / 60); ok(!s.menu && s.ball.owner === t, 'Pase no hace nada');
  Logic.update(s, press('shoot'), 1 / 60); ok(s.menu && s.menu.kind === 'tiro', 'Tiro abre el menú');
  const t0 = s.time; run(s, 20); ok(s.time === t0 && s.menu, 'espera sin límite de tiempo');
  const n0 = s.events.length; Logic.chooseMenu(s, 0); run(s, 1); ok(s.events.slice(n0).some(e => e.type === 'shot') && !s.penalty, 'el penalti sale'); }

console.log('8. Partidos completos con menús: sin congelarse (la IA y tú eligiendo al azar)');
{ let stuck = 0, menus = 0;
  for (let g = 0; g < 6; g++) {
    const s = make({ minutes: 2 }); let n = 0;
    for (let i = 0; i < 60 * 600 && !s.over; i++) {
      const r = Math.random(), x = Math.random() * 2 - 1, y = Math.random() * 2 - 1;
      Logic.update(s, inp({ move: { x, y }, pressed: r < 0.03 ? new Set([['shoot', 'A', 'tech', 'dribble'][Math.floor(Math.random() * 4)]]) : new Set() }), 1 / 60);
      if (s.menu) { menus++; if (++n > 3) { Logic.chooseMenu(s, Math.random() < 0.3 ? -1 : Math.floor(Math.random() * s.menu.opts.length)); n = 0; } } else n = 0;
      if (s.menu && s.menu.t > 100) stuck++;
    }
    if (!s.over) stuck++;
  }
  console.log('    menús abiertos: ' + menus); ok(stuck === 0, 'todos los partidos terminan (' + stuck + ' atascados)'); }

console.log(fails ? '\n✗ ' + fails + ' fallos' : '\n✓ Todo bien'); process.exit(fails ? 1 : 0);
