// Jugadores de Inazuma Eleven GO: registro, retrato propio y códigos de regalo.
const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname, '..', 'src') + '/';
const store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }, window: {}, document: {} };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: 0 }) };
vm.createContext(ctx);
const src = ['logic.js', 'run.js', 'career.js', 'go.js', 'limited.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n');
vm.runInContext(src + '\nProfile.load();this.Profile=Profile;this.GIFT_CODES=GIFT_CODES;this.PLAYER=PLAYER;this.GO_PLAYERS=GO_PLAYERS;', ctx);
const { Profile, PLAYER, GO_PLAYERS } = ctx;
let ok = true;
const chk = (c, m) => { if (!c) { ok = false; console.log('FALLA:', m); } };
for (const G of GO_PLAYERS) {
  const p = PLAYER(G.id);
  chk(p, G.name + ' no está registrado');
  if (!p) continue;
  chk(p.name === G.name && p.role === G.role && p.elem === G.elem, G.name + ': datos');
  chk(p.rarity === (G.id === 998004 ? 'limitada' : 'legendaria') && p.gacha === false, G.name + ': rareza/gacha');
  chk(p.goFace === G.face && p.cs && p.cs.length === 2, G.name + ': retrato y muñeco');
  chk(p.moves.length > 0, G.name + ': sin técnicas');
  console.log(G.id, p.name, p.role, p.elem, 'cara', p.goFace, 'muñeco', p.cs.join(','), 'técnicas', p.moves.length);
}
// Ya no se consiguen con códigos (solo en el Gacha limitado)
['ARIONGOLD', 'VICTORGOLD', 'RICCARDOGOLD', 'BAILONGGOLD', 'BIANCHINAVIDAD'].forEach(c => {
  const r = Profile.redeem(c); chk(!r.ok, c + ' todavía se puede canjear');
});
chk(!Object.keys(Profile.data.coll).some(id => [998001, 998002, 998003, 998004, 997008].includes(+id)), 'un código dio un jugador de GO');
console.log(ok ? '✓ Todo bien' : 'HAY FALLOS');
