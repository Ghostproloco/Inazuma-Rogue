// Banco de pruebas: tiros aislados (tirador contra portero) para medir probabilidades de gol
const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname,'..','src')+'/';
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','juego','gamedata.json'), 'utf8'));
vm.createContext(ctx);
const code = fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;this.TECH=TECH;';
vm.runInContext(code, ctx);
const { Logic, rivalTeam, TECH } = ctx;
const techByName = n => Object.values(ctx.GAME.techniques).find(t => t.name === n);
function trial(shooterStat, gkStat, shotTech, gkTech, depth, offX, mode) {
  const A = rivalTeam('Royal Academy', 1, 1), B = rivalTeam('Zeus', 1, 1);
  const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'boton' }, { A, B });
  s.pause = null;
  const F = Logic.FIELD, cx = F.w / 2;
  const p = s.players.find(q => q.team === 'A' && q.role !== 'POR');
  const g = s.players.find(q => q.team === 'B' && q.role === 'POR');
  for (const q of s.players) if (q !== p && q !== g) { q.stun = 999; q.x = -50; q.y = -50; }
  Object.assign(p, { kick: shooterStat, control: shooterStat, body: shooterStat, x: cx + offX, y: depth, techs: shotTech ? [Object.assign({}, shotTech)] : [], cd: {} });
  Object.assign(g, { gk: gkStat, x: cx, y: 1.2, techs: gkTech ? [Object.assign({}, gkTech)] : [], cd: {}, react: 0.09 });
  s.controlledId = p.id;
  Logic._t.take(s, p);
  if (shotTech) Logic._t.startTech(s, p, p.techs[0], (Math.random() - 0.5) * 1.6);
  else Logic._t.shoot(s, p, mode === 'weak' ? 0.4 : 1, (Math.random() - 0.5) * 1.6, null);
  s.events.length = 0;
  const inp = { move: { x: 0, y: 0 }, sprint: false, shootHeld: false, pressed: new Set() };
  for (let i = 0; i < 600; i++) {
    Logic.update(s, inp, 1 / 60);
    for (const e of s.events) {
      if (e.type === 'goal') return e.team === 'A' ? 1 : 0;
      if (e.type === 'save' || e.type === 'catch' || e.type === 'out') return 0;
    }
    s.events.length = 0;
  }
  return 0;
}
function rate(...a) { let n = 0; const N = 400; for (let i = 0; i < N; i++) n += trial(...a); return Math.round(n / N * 100); }
const T = n => techByName(n);
const cases = [
  ['Tiro normal (60) vs portero 60, a 10 m', 60, 60, null, null, 10, 0],
  ['Tiro normal (60) vs portero 60, a 18 m', 60, 60, null, null, 18, 0],
  ['Tiro normal (70) vs portero 50, a 10 m', 70, 50, null, null, 10, 0],
  ['Técnica floja (Chut granada 27) vs portero 60, 10 m', 60, 60, T('Chut granada'), null, 10, 0],
  ['Técnica media (Tornado de fuego 57) vs portero 60, 10 m', 60, 60, T('Tornado de fuego'), null, 10, 0],
  ['Técnica fuerte (Fénix 102) vs portero 60, 10 m', 60, 60, T('Fénix'), null, 10, 0],
  ['Técnica media vs portero 60, 20 m', 60, 60, T('Tornado de fuego'), null, 20, 0],
  ['Técnica fuerte vs portero 60, 22 m', 60, 60, T('Fénix'), null, 22, 0],
  ['Técnica media vs Mano celestial (36)', 60, 60, T('Tornado de fuego'), T('Mano celestial'), 10, 0],
  ['Técnica media vs Mano mágica (73)', 60, 60, T('Tornado de fuego'), T('Mano mágica'), 10, 0],
  ['Técnica fuerte vs Mano celestial (36)', 60, 60, T('Fénix'), T('Mano celestial'), 10, 0],
  ['Técnica fuerte vs Mano mágica (73)', 60, 60, T('Fénix'), T('Mano mágica'), 10, 0],
  ['Técnica floja vs Mano mágica (73)', 60, 60, T('Chut granada'), T('Mano mágica'), 10, 0],
  ['Técnica fuerte vs Muralla infinita (105)', 60, 60, T('Fénix'), T('Muralla infinita'), 10, 0],
  ['Tiro normal vs Mano mágica', 60, 60, null, T('Mano mágica'), 10, 0],
];
for (const c of cases) console.log(String(rate(...c.slice(1))).padStart(3) + ' %  ' + c[0]);
