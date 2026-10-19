const fs = require('fs'), vm = require('vm');
const S = '/home/claude/inazuma/src/';
const ctx = { console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync('/home/claude/inazuma/pub/gamedata.json', 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
const mk = () => { const s = Logic.createMatch({ minutes: 3, difficulty: 'dificil', golden: false, techMode: 'boton' }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) }); s.pause = null; return s; };
const step = (s, inp) => { Logic.update(s, Object.assign({ move: { x: 0, y: 0 }, sprint: false, shootHeld: false, passHeld: false, pressed: new Set() }, inp), 1 / 60); const e = s.events.map(x => x.type); s.events.length = 0; return e; };
for (const mode of ['pase', 'largo', 'despeje', 'espera']) {
  let keep = 0, N = 30;
  for (let k = 0; k < N; k++) {
    const s = mk(), gk = s.players.find(p => p.team === 'A' && p.role === 'POR');
    Logic._t.take(s, gk);
    if (s.controlledId !== gk.id) { console.log('ERROR: no controlas al portero'); break; }
    step(s, { move: { x: 0.3, y: 0 } }); step(s, { move: { x: 0.3, y: 0 } });   // se mueve un poco
    if (mode === 'pase') step(s, { pressed: new Set(['A']), move: { x: 0.4, y: -1 } });
    if (mode === 'largo') step(s, { pressed: new Set(['B']), move: { x: 0, y: -1 } });
    if (mode === 'despeje') { step(s, { shootHeld: true }); step(s, { move: { x: 0, y: -1 } }); }
    let first = null;
    for (let i = 0; i < (mode === 'espera' ? 800 : 240); i++) { step(s, {}); const o = s.ball.owner; if (!first && o && o !== gk) first = o; }
    if (first && first.team === 'A') keep++;
    if (k === 0) console.log(mode, 'controla ahora', s.controlledId, 'portero en área', Math.abs(gk.x - 17) <= 9, (52 - gk.y) <= 7.5);
  }
  console.log(mode, 'primer toque es tuyo:', keep, 'de', N);
}
