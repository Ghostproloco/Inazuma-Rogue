// Partidos IA contra IA para medir goles, tiros y técnicas
const fs = require('fs'), vm = require('vm');
const S = '/home/claude/inazuma/src/';
const ctx = { console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync('/home/claude/inazuma/pub/gamedata.json', 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
function match(diff, a, b, fa, fb) {
  const s = Logic.createMatch({ minutes: 3, difficulty: diff, golden: false, techMode: 'auto', allAI: true }, { A: rivalTeam(a, fa, 1), B: rivalTeam(b, fb, 1) });
  const inp = { move: { x: 0, y: 0 }, sprint: false, shootHeld: false, pressed: new Set() };
  const c = { shots: 0, techs: 0, goals: 0, saves: 0, tackles: 0, passes: 0, realSec: 0 };
  for (let i = 0; i < 60 * 60 * 8 && !s.over; i++) {
    Logic.update(s, inp, 1 / 60); c.realSec += 1 / 60;
    for (const e of s.events) { if (e.type === 'shot') c.shots++; if (e.type === 'techStart') c.techs++; if (e.type === 'goal') c.goals++; if (e.type === 'save' || e.type === 'catch') c.saves++; if (e.type === 'tackle' && e.ok) c.tackles++; if (e.type === 'pass') c.passes++; }
    s.events.length = 0;
  }
  return c;
}
for (const diff of ['facil', 'medio', 'dificil']) {
  const tot = { shots: 0, techs: 0, goals: 0, saves: 0, tackles: 0, passes: 0, realSec: 0 }, N = 6;
  for (let i = 0; i < N; i++) { const c = match(diff, 'Royal Academy', 'Zeus', 1, 1); for (const k in tot) tot[k] += c[k]; }
  console.log(diff, Object.fromEntries(Object.entries(tot).map(([k, v]) => [k, +(v / N).toFixed(1)])));
}
