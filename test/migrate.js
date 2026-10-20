const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname,'..','src')+'/';
const old = { v: 1, manager: 13, school: 'Viejo', season: 2, week: 5, fame: 40, money: 500, forma: 80, squad: [], formation: '1-2-1-1', lineup: null, tactic: 'equilibrada',
  divs: { 1: ['Zeus','Royal Academy Redux','Tormenta de Géminis','Épsilon','Emperadores Oscuros','Génesis','Prominence','Polvo de Diamantes'], 2: ['Brain','Shuriken','Kirkwood','Royal Academy','TU','Alpino','Claustro Sagrado','Fauxshore'], 3: ['Inazuma Kids FC','Sallys','Umbrella','Occult','Farm','Otaku','Wild','Veteranos'] }, titles: [], history: [], over: null, goal: false, log: [] };
const store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','juego','gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: 0 }) };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\n' + fs.readFileSync(S + 'career.js', 'utf8') + '\nthis.Career=Career;', ctx);
const C = ctx.Career; old.squad = C.startingSquad ? (C.data = { squad: [], clubs: {}, divs: old.divs }, C.startingSquad()) : [];
store['inazuma-carrera'] = JSON.stringify(old);
const c = C.load();
console.log('v', c.v, 'div', C.myDiv(), [1,2,3].map(d => c.divs[d].length), 'semana', c.week, 'temporada', c.season, 'nm', JSON.stringify(C.nextMatch()), 'rating', C.myRating());
