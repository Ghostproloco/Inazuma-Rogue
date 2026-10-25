// Bloqueos de tiro (como en el Inazuma DS): un defensa con técnica de bloqueo frena o para el tiro según las stats
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;', ctx);
const { Logic, rivalTeam } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
const T = Object.values(ctx.GAME.techniques);
const BLK_STRONG = T.filter(t => t.type === 'bloqueo').sort((a, b) => b.power - a.power)[0];
const BLK_WEAK = T.filter(t => t.type === 'bloqueo').sort((a, b) => a.power - b.power)[0];
const SHOT_STRONG = T.filter(t => t.type === 'tiro').sort((a, b) => b.power - a.power)[0];
const idle = (pr = []) => ({ move: { x: 0, y: 0 }, sprint: false, shootHeld: false, passHeld: false, pressed: new Set(pr) });
// Un rival (B) chuta hacia la portería A; un defensa de A está en medio con una técnica de bloqueo
function trial({ blk, def = 80, kick = 80, shotTech = null, charge = 0.5, mode = 'auto', control = false, press = false, team = 'A' }) {
  const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: mode }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Zeus', 1, 1) });
  s.pause = null; s.diff.techUse = 1;
  const atk = team === 'A' ? 'B' : 'A', F = Logic.FIELD;
  const sh = s.players.find(q => q.team === atk && q.role === 'DEL'), d = s.players.find(q => q.team === team && q.role === 'DEF');
  for (const q of s.players) if (q !== sh && q !== d) { q.stun = 999; q.x = 1; q.y = team === 'A' ? 2 : F.l - 2; }
  const gy = team === 'A' ? F.l : 0, dir = team === 'A' ? 1 : -1;   // portería que defiende «team» (A defiende la de abajo)
  sh.x = F.w / 2; sh.y = gy - dir * 16; d.x = F.w / 2; d.y = gy - dir * 9;
  sh.kick = kick; d.defense = def; d.body = def;
  d.techs = blk ? [Object.assign({ cd: 10 }, blk)] : []; d.cd = {};
  s.controlledId = team === 'A' && control ? d.id : s.players.find(q => q.team === 'A' && q.role === 'MED').id;
  Logic._t.take(s, sh); sh.aim = Math.atan2(gy - sh.y, 0);
  Logic._t.shoot(s, sh, charge, 0, shotTech ? Object.assign({}, shotTech) : null);
  const p0 = s.ball.shot.power;
  let blocked = false, weaker = false, ask = false, shotBlk = false;
  for (let i = 0; i < 240; i++) {
    const shot = s.ball.shot;
    Logic.update(s, idle(press && s.blockAsk ? ['tech'] : []), 1 / 60);
    if (s.blockAsk) ask = true;
    if (s.events.some(e => e.type === 'techStart' && e.kind === 'bloqueo' && e.quick && e.id === d.id)) shotBlk = true;
    if (s.ball.owner === d) { blocked = true; break; }
    if (shot && s.ball.shot === shot && shot.power < p0) weaker = true;
    if (!s.ball.shot || s.ball.owner) break;
    s.events.length = 0;
  }
  return { blocked, weaker, ask, shotBlk };
}
const rate = (n, o) => { let b = 0, w = 0; for (let i = 0; i < n; i++) { const r = trial(o); if (r.blocked) b++; else if (r.weaker) w++; } return { b: b / n, w: w / n }; };

console.log('1. Tiro normal contra un buen bloqueo → se para casi siempre');
let r = rate(40, { blk: BLK_STRONG, def: 82, kick: 75, team: 'B' });
ok(r.b > 0.8, `parado ${Math.round(r.b * 100)} %`);
console.log('2. Supertécnica muy fuerte contra un bloqueo flojo → casi nunca se para, pero sale más floja');
r = rate(40, { blk: BLK_WEAK, def: 55, kick: 95, shotTech: SHOT_STRONG, charge: 1, team: 'B' });
ok(r.b < 0.35 && r.w > 0.5, `parado ${Math.round(r.b * 100)} % · más flojo ${Math.round(r.w * 100)} %`);
console.log('3. Las stats cuentan: mejor defensa → para más');
const lo = rate(40, { blk: BLK_STRONG, def: 50, kick: 90, shotTech: SHOT_STRONG, charge: 1, team: 'B' }), hi = rate(40, { blk: BLK_STRONG, def: 99, kick: 90, shotTech: SHOT_STRONG, charge: 1, team: 'B' });
ok(hi.b > lo.b, `defensa 50: ${Math.round(lo.b * 100)} % · defensa 99: ${Math.round(hi.b * 100)} %`);
console.log('4. Sin técnica de bloqueo no hay bloqueo');
r = rate(10, { blk: null, team: 'B' });
ok(r.b === 0 && r.w === 0, 'nada');
console.log('5. Tu jugador con «Con botón»: si no pulsas, no bloquea; si pulsas, sí');
const noPress = trial({ blk: BLK_STRONG, def: 90, kick: 85, charge: 1, mode: 'boton', control: true });
ok(noPress.ask && !noPress.blocked && !noPress.weaker, 'sale el aviso y, sin pulsar, no bloquea ' + JSON.stringify(noPress));
const yes = rate(10, { blk: BLK_STRONG, def: 90, kick: 60, mode: 'boton', control: true, press: true });
ok(yes.b + yes.w === 1, 'pulsando Técnica, bloquea (' + Math.round(yes.b * 100) + ' % parados)');
console.log('5b. Solo a mano: en automático tu jugador tampoco bloquea sin pulsar, y tus compañeros nunca bloquean solos');
const autoNo = trial({ blk: BLK_STRONG, def: 90, kick: 60, mode: 'auto', control: true });
ok(autoNo.ask && !autoNo.shotBlk && !autoNo.weaker, 'automático sin pulsar: no bloquea ' + JSON.stringify(autoNo));
const autoYes = rate(10, { blk: BLK_STRONG, def: 90, kick: 60, mode: 'auto', control: true, press: true });
ok(autoYes.b + autoYes.w === 1, 'automático pulsando Técnica: bloquea');
let any = 0; for (let i = 0; i < 20; i++) if (trial({ blk: BLK_STRONG, def: 95, kick: 60 }).shotBlk) any++;
ok(any === 0, 'compañero que no llevas: no bloquea el tiro (' + any + ' de 20)');
console.log('6. Los rivales también bloquean tus tiros');
r = rate(20, { blk: BLK_STRONG, def: 85, kick: 70, team: 'B' });
ok(r.b > 0.6, `parado ${Math.round(r.b * 100)} %`);
console.log(fails ? '\n✗ ' + fails + ' fallos' : '\n✓ todo bien'); process.exit(fails ? 1 : 0);
