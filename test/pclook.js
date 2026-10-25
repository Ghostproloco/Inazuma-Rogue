// Personalización del jugador creado (v0.35): gratis al crearlo, con monedas después
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => Object.assign({ file: 'c00.png', row: pd.cs ? pd.cs[1] : 0 }, pd.look ? { look: pd.look } : {}), collFile: () => 'c00.png' };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'pcareer.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nthis.Profile=Profile;this.PC=PlayerCareer;this.PLAYER=PLAYER;this.PC_LOOK_COST=PC_LOOK_COST;this.mySprite=mySprite;', ctx);
const { Profile, PC, PLAYER, PC_LOOK_COST } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load(); Profile.data.firstDone = true; Profile.data.coins = 1000; Profile.save();
const look = PC.lookChoices(3, 'DEL')[0];
const pd = PC.newCustom({ name: 'Rayo', role: 'DEL', elem: 'fuego', look: look.id, nat: 'JP', style: { hair: '#30c0f0', skin: '#8a5430', boots: '#d83020', num: 10, raro: 1 } });
ok(JSON.stringify(pd.look) === JSON.stringify({ hair: '#30c0f0', skin: '#8a5430', boots: '#d83020', num: 10 }), 'al crearlo: pelo, piel, botas y dorsal (gratis) ' + JSON.stringify(pd.look));
ok(Profile.data.coins === 1000, 'crearlo no cuesta monedas');
ok(!Object.keys(PC.newCustom({ name: 'X', role: 'DEL', elem: 'fuego', look: look.id, style: { hair: '#123456', num: 150 } }).look || {}).length, 'colores o dorsales que no existen se ignoran');
const offers = PC.startOffers(pd.id); PC.create(pd.id, offers[0].key, pd);
ok(ctx.Sprites.refOf(PLAYER(pd.id)).look.num === 10, 'el muñeco del partido lleva su aspecto');
ok(ctx.mySprite(PLAYER(pd.id), 'DEL').look, 'también en tu equipo (si entra en la colección)');
let r = PC.setLook(Object.assign({}, pd.look)); ok(!r.ok && Profile.data.coins === 1000, 'sin cambios: no cobra');
r = PC.setLook(Object.assign({}, pd.look, { hair: '#e8c040' })); ok(r.ok && r.cost === PC_LOOK_COST.hair && Profile.data.coins === 700 && PLAYER(pd.id).look.hair === '#e8c040', 'cambiar el pelo: 300');
r = PC.setLook({ hair: '#e8c040', skin: '#8a5430' }); ok(r.ok && r.cost === PC_LOOK_COST.boots + PC_LOOK_COST.num && Profile.data.coins === 300, 'quitar botas y dorsal: 200 + 200');
const other = PC.lookChoices(5, 'DEL').find(p => p.cs + '' !== PLAYER(pd.id).cs + '');
r = PC.setLook(PLAYER(pd.id).look, other.cs); ok(!r.ok && Profile.data.coins === 300, 'cambiar la cara (800) sin monedas: no');
Profile.data.coins = 900; r = PC.setLook(PLAYER(pd.id).look, other.cs); ok(r.ok && PLAYER(pd.id).cs + '' === other.cs + '' && PC.data.me.pd.cs + '' === other.cs + '' && Profile.data.coins === 100, 'cara nueva por 800 (en la partida y en la ficha)');
const saved = JSON.parse(store['inazuma-jugador'] || '{}'); ok(saved.me && saved.me.pd && saved.me.pd.look && saved.me.pd.look.hair === '#e8c040', 'se guarda en la partida');
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
