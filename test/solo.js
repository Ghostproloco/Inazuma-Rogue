// Partido controlando solo a un jugador: nunca cambia, «¡Pásamela!» funciona y se cuentan sus estadísticas
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const ctx = { TX: s => s, console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
let switched = 0, reqs = 0, got = 0, total = { pas: 0, sh: 0, gl: 0, tk: 0, touch: 0 }, goalsA = 0, glSum = 0;
for (let n = 0; n < 6; n++) {
  const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'auto', lockId: 'A3' }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Occult', 1, 1) });
  const me = s.players.find(p => p.id === 'A3');
  for (let i = 0; i < 60 * 60 * 10 && !s.over; i++) {
    const owner = s.ball.owner, pressed = new Set();
    // jugador «humano» sencillo: corre hacia la portería rival; si un compañero la tiene, la pide; con balón, tira cerca del área
    let mv = { x: (s.field.w / 2 - me.x) * 0.1, y: -1 };
    if (owner && owner.team === 'A' && owner !== me && i % 40 === 0) { pressed.add('A'); reqs++; }
    if (owner && owner.team === 'B') { mv = { x: owner.x - me.x, y: owner.y - me.y }; const l = Math.hypot(mv.x, mv.y) || 1; mv.x /= l; mv.y /= l; if (l < 2 && i % 20 === 0) pressed.add('A'); }
    const shootHeld = owner === me && me.y < 14 && (i % 60) < 40;
    const prevOwner = owner;
    Logic.update(s, { move: mv, sprint: true, shootHeld, passHeld: false, pressed, dt: 1 / 60 }, 1 / 60);
    if (s.controlledId !== 'A3') switched++;
    if (prevOwner && prevOwner.team === 'A' && prevOwner !== me && !s.ball.owner && s.ball.intended === 'A3') got++;
    s.events.length = 0;
  }
  const st = s.pstats.A3 || {}; for (const k in total) total[k] += st[k] || 0;
  goalsA += s.score.A; glSum += Object.entries(s.pstats).filter(([id]) => id[0] === 'A').reduce((a, [, v]) => a + v.gl, 0);
}
ok(switched === 0, 'el control nunca cambia de jugador (' + switched + ' fotogramas)');
ok(got > 3, 'tus compañeros te la pasan al pedirla (' + got + ' veces de ' + reqs + ' peticiones)');
ok(total.touch >= 6 && total.pas + total.sh >= 3, 'se cuentan tus toques, pases y tiros: ' + JSON.stringify(total));
ok(glSum === goalsA, 'los goles de tu equipo se reparten entre sus jugadores (' + glSum + '/' + goalsA + ')');
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
