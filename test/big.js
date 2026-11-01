// 11 contra 11: partidos IA contra IA en el campo grande (sin errores, goles, jugadores dentro del campo)
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem() {} } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\n' + fs.readFileSync(S + 'big.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeamBig=rivalTeamBig;this.BIG_FORMATIONS=BIG_FORMATIONS;', ctx);
const { Logic, rivalTeamBig, BIG_FORMATIONS } = ctx;
let ok = true; const chk = (c, m) => { if (!c) { ok = false; console.log('✗', m); } };
const teams = ['Royal Academy', 'Zeus', 'Occult', 'Umbrella', 'Génesis'];
let goals = 0, N = 0;
for (let k = 0; k < teams.length; k++) {
  const a = rivalTeamBig(teams[k], 1, 1), b = rivalTeamBig(teams[(k + 1) % teams.length], 1, 1);
  chk(a.players.length === 11 && b.players.length === 11, 'cada equipo debe tener 11: ' + a.players.length + '/' + b.players.length);
  chk(a.players.filter(p => p.role === 'POR').length === 1, 'un solo portero');
  const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'auto', allAI: true, big: true }, { A: a, B: b });
  chk(s.players.length === 22 && s.field.l === 84 && s.field.w === 52, 'campo grande de 22 jugadores');
  const inp = { move: { x: 0, y: 0 }, sprint: false, shootHeld: false, pressed: new Set() };
  let bad = 0, sec = 0, shots = 0, passes = 0, maxD = 0;
  try {
    for (let i = 0; i < 60 * 60 * 8 && !s.over; i++) {
      Logic.update(s, inp, 1 / 60); sec += 1 / 60;
      for (const e of s.events) { if (e.type === 'shot') shots++; if (e.type === 'pass') passes++; }
      s.events.length = 0;
      for (const p of s.players) { if (!isFinite(p.x) || !isFinite(p.y)) bad++; if (p.x < -6 || p.x > s.field.w + 6 || p.y < -6 || p.y > s.field.l + 6) bad++; }
      if (!isFinite(s.ball.x) || !isFinite(s.ball.y)) bad++;
    }
  } catch (e) { chk(false, 'excepción: ' + e.stack.split('\n').slice(0, 3).join(' | ')); }
  chk(bad === 0, 'posiciones fuera de rango o NaN: ' + bad);
  chk(s.over, 'el partido debe terminar');
  goals += s.score.A + s.score.B; N++;
  console.log(teams[k], a.formation, 'vs', teams[(k + 1) % teams.length], b.formation, '→', s.score.A + '-' + s.score.B, 'tiros', shots, 'pases', passes, Math.round(sec) + 's reales');
}
chk(goals > 0, 'tiene que haber goles en algún partido');
console.log(ok ? '\n✓ Todo bien' : '\nHAY FALLOS');
process.exitCode = ok ? 0 : 1;
