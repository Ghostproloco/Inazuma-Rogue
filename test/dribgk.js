// Regate normal contra el portero: ¿cuántas veces sale bien? (debería rondar el 10 %)
const fs = require('fs'), vm = require('vm');
const S = '/home/claude/inazuma/src/';
const ctx = { console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync('/home/claude/inazuma/pub/gamedata.json', 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
let ok = 0, lost = 0, other = 0; const ev = {};
for (let n = 0; n < 200; n++) {
  const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'auto' }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) });
  const me = s.players.find(p => p.team === 'A' && p.role === 'DEL'), gk = s.players.find(p => p.team === 'B' && p.role === 'POR');
  s.players.forEach(p => { if (p !== me && p !== gk) { p.x = 1; p.y = 1; p.stun = 99; } });
  s.kickoff = null; s.phase = 'play'; s.pause = 0;
  Logic._t.take(s, me); s.controlledId = me.id;
  me.x = gk.x; me.y = gk.y + (gk.y < 20 ? 2.2 : -2.2);
  const dir = { x: 0, y: gk.y < me.y ? -1 : 1 };
  let res = null;
  for (let i = 0; i < 90 && !res; i++) {
    const inp = { move: dir, sprint: false, shootHeld: false, pressed: new Set(i === 0 ? ['dribble'] : []), dt: 1 / 60 };
    Logic.update(s, inp, 1 / 60);
    for (const e of s.events) ev[e.type] = (ev[e.type] || 0) + 1; s.events.length = 0;
    if (s.ball.owner === gk) res = 'lost';
    else if (i > 40 && s.ball.owner === me && Math.abs(me.y - gk.y) > 1 && Math.sign(me.y - gk.y) === Math.sign(dir.y)) res = 'ok';
  }
  if (res === 'ok') ok++; else if (res === 'lost') lost++; else other++;
}
console.log({ ok, lost, other }, ev);
