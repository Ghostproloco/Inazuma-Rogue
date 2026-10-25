// Ranuras de guardado: 3 para la Carrera mánager y 3 para la Carrera Jugador, separadas y compatibles con las partidas de antes
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: pd.cs ? pd.cs[1] : 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'pcareer.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nthis.Career=Career;this.PC=PlayerCareer;this.Profile=Profile;this.Slots=Slots;this.PLAYER=PLAYER;this.YOU=YOU;', ctx);
const { Career, PC, Profile, Slots, PLAYER, YOU } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load(); Profile.data.firstDone = true; Profile.save();

console.log('1. Partida de antes (sin ranuras) = ranura 1');
Career.create(13, 'Antigua'); ok(store['inazuma-carrera'] && Slots.get('car') === 1, 'se guarda en la clave de siempre');
Career.data = null; Career.load(); ok(Career.data.school === 'Antigua', 'se vuelve a cargar');

console.log('2. Tres carreras de mánager');
Slots.set('car', 2); Career.load(); ok(Career.data === null, 'la ranura 2 empieza vacía');
Career.create(14, null, 'normal', 'Raimon'); ok(store['inazuma-carrera-2'] && JSON.parse(store['inazuma-carrera-2']).school === 'Raimon', 'ranura 2: Raimon');
Slots.set('car', 3); Career.load(); Career.create(15, 'Tercera'); Career.devEndSeason();
ok(JSON.parse(store['inazuma-carrera-3']).season === 2, 'ranura 3: avanza una temporada sin tocar las otras');
Slots.set('car', 1); Career.load(); ok(Career.data.school === 'Antigua' && Career.data.season === 1, 'la ranura 1 sigue igual');
Slots.set('car', 2); Career.load(); ok(Career.data.school === 'Raimon', 'la ranura 2 sigue igual');
Career.clear(); ok(!store['inazuma-carrera-2'] && store['inazuma-carrera'] && store['inazuma-carrera-3'], 'borrar la ranura 2 no toca las demás');

console.log('3. Tres carreras de jugador');
const ax = ctx.GAME.players.find(p => !p.abroad && p.cs && p.role === 'DEL' && p.rarity === 'legendaria');
Slots.set('pc', 1); PC.create(ax.id, PC.startOffers(ax.id)[0].key, null);
const pd = PC.newCustom({ name: 'Rayo', role: 'DEL', elem: 'fuego', look: ax.id, nat: 'JP' });
Slots.set('pc', 2); PC.load(); ok(PC.data === null, 'ranura 2 vacía'); PC.create(pd.id, PC.startOffers(pd.id)[0].key, pd);
ok(store['inazuma-jugador'] && store['inazuma-jugador-2'], 'dos carreras de jugador guardadas aparte');
Slots.set('pc', 1); PC.load(); ok(PC.data.me.id === ax.id, 'ranura 1: ' + PLAYER(ax.id).name);
Slots.set('pc', 2); PC.load(); ok(PC.data.me.id === pd.id && PC.data.me.pd.name === 'Rayo', 'ranura 2: Rayo (creado)');
ok(JSON.parse(store['inazuma-carrera']).school === 'Antigua', 'la Carrera mánager no se mezcla con la de jugador');

console.log('4. Nube');
const cl = fs.readFileSync(S + 'cloud.js', 'utf8');
ok(['inazuma-carrera-2', 'inazuma-carrera-3', 'inazuma-jugador-2', 'inazuma-jugador-3'].every(k => (cl.match(new RegExp("'" + k + "'", 'g')) || []).length >= 2), 'las ranuras 2 y 3 se suben a la nube (y cuentan como progreso)');
ok(/DEVICE_KEYS = \[[^\]]*'inazuma-ranuras'/.test(cl), 'la ranura abierta es de cada dispositivo');

console.log(fails ? '\n✗ ' + fails + ' fallos' : '\n✓ Todo bien');
process.exit(fails ? 1 : 0);
