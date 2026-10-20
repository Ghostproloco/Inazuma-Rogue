const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname,'..','src')+'/';
const ctx = { console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','juego','gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
const diff = process.argv[2] || 'medio', N = +(process.argv[3] || 6);
const tot = {};
for (let m = 0; m < N; m++) {
  const s = Logic.createMatch({ minutes: 3, difficulty: diff, golden: false, techMode: 'auto', allAI: true }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) });
  const inp = { move: { x: 0, y: 0 }, sprint: false, shootHeld: false, pressed: new Set() };
  let owner = null;
  for (let i = 0; i < 60 * 60 * 8 && !s.over; i++) {
    Logic.update(s, inp, 1 / 60);
    const o = s.ball.owner; if (o && owner && o.team !== owner.team) tot.turnover = (tot.turnover || 0) + 1; if (o) owner = o;
    for (const e of s.events) { let k = e.type; if (k === 'setpiece') k += '_' + e.kind; if (k === 'tackle') k += e.ok ? '_ok' : '_ko'; if (k === 'techStart') k += '_' + e.kind; if (k === 'shot') k += s.ball.shot && s.ball.shot.tech ? '_tec' : '_norm'; tot[k] = (tot[k] || 0) + 1; }
    s.events.length = 0;
  }
}
console.log(diff, Object.fromEntries(Object.entries(tot).sort().map(([k, v]) => [k, +(v / N).toFixed(1)])));
