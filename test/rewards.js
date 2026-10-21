// Recompensas del roguelite: las técnicas que se ofrecen tras cada partido tienen que servir para la posición del jugador
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') + '\nthis.Run=Run;this.Profile=Profile;this.Gacha=Gacha;this.PLAYER=PLAYER;this.TECH=TECH;', ctx);
const { Run, Profile, Gacha, PLAYER, TECH } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load(); Profile.data.firstDone = true;
for (let i = 0; i < 6; i++) Gacha.pull(10, { keeper: true });
const ids = Object.keys(Profile.data.coll).map(Number);
const gk = ids.find(id => PLAYER(id).role === 'POR'), outf = r => ids.filter(id => PLAYER(id).role === r).slice(0, 2);
const team = [gk, ...outf('DEF').slice(0, 1), ...outf('MED').slice(0, 1), ...outf('DEL').slice(0, 2)].filter(Boolean).slice(0, 5);
const run = Run.create('story', team, { stage: 's1', diff: 'medio', formation: '1-1-1-2' });
const cnt = { POR: {}, DEF: {}, MED: {}, DEL: {} };
for (let i = 0; i < 3000; i++) for (const o of Run.makeRewards(run)) if (o.kind === 'tech') {
  const role = PLAYER(run.roster[o.member].id).role, t = TECH(o.tech).type; cnt[role][t] = (cnt[role][t] || 0) + 1;
}
const pct = (r, t) => { const tot = Object.values(cnt[r]).reduce((a, b) => a + b, 0) || 1; return Math.round(100 * (cnt[r][t] || 0) / tot); };
console.log('  reparto:', JSON.stringify(cnt));
ok(Object.keys(cnt.POR).every(t => t === 'parada') && cnt.POR.parada > 0, 'portero: solo paradas');
ok(!cnt.DEF.parada && !cnt.MED.parada && !cnt.DEL.parada, 'nadie de campo recibe paradas');
ok(pct('DEL', 'tiro') >= 55, 'delantero: sobre todo tiros (' + pct('DEL', 'tiro') + ' %)');
ok(pct('DEF', 'bloqueo') >= 60, 'defensa: sobre todo bloqueos (' + pct('DEF', 'bloqueo') + ' %)');
ok(!cnt.DEL.bloqueo, 'delantero: ningún bloqueo');
console.log('Saltar la recompensa');
{
  const r2 = Run.create('story', team, { stage: 's1', diff: 'medio', formation: '1-1-1-2' });
  r2.rewards = Run.makeRewards(r2); r2.state = 'reward';
  const before = JSON.stringify(r2.roster), i0 = r2.index, coins = ctx.Profile.data.coins;
  Run.takeReward(r2, null);
  ok(r2.state === 'map' && r2.index === i0 + 1 && !r2.rewards, 'sigue al siguiente partido');
  ok(JSON.stringify(r2.roster) === before && ctx.Profile.data.coins === coins, 'sin quedarte con nada');
}
console.log(fails ? '\n✗ ' + fails + ' fallos' : '\n✓ Todo bien');
process.exit(fails ? 1 : 0);
