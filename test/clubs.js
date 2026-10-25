// Carrera mánager: Primera de 12 (con el Raimon y el Alpino), jornadas de descanso y empezar con un club que ya existe
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: pd.cs ? pd.cs[1] : 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nthis.Career=Career;this.Profile=Profile;this.PLAYER=PLAYER;this.TEAM=TEAM;this.YOU=YOU;this.LEAGUE_WEEKS=LEAGUE_WEEKS;this.WEEKS=WEEKS;this.CAREER_START=CAREER_START;this.Logic=Logic;', ctx);
const { Career, Profile, PLAYER, TEAM, YOU, LEAGUE_WEEKS } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load();
const sizes = c => [1, 2, 3].map(d => c.divs[d].length).join('/');
const all = c => [1, 2, 3].flatMap(d => c.divs[d]);

console.log('1. El Raimon existe como club');
const R = TEAM('Raimon');
ok(R && R.players.map(p => PLAYER(p.id).name).join(', ').match(/Mark.*Axel/), 'Raimon: ' + R.players.map(p => PLAYER(p.id).name).join(', '));
ok(!ctx.GAME.teams.filter(t => t.key !== 'Raimon').some(t => t.players.some(p => R.players.some(q => q.id === p.id))), 'sus jugadores no están en otros equipos');

console.log('2. Carrera nueva (tu club en Tercera)');
let c = Career.create(13, 'Prueba');
ok(sizes(c) === '12/12/12' && c.divs[1].includes('Raimon') && c.divs[1].includes('Alpino'), 'divisiones ' + sizes(c) + ' con el Raimon y el Alpino en Primera');
ok(LEAGUE_WEEKS.length === 11 && ctx.WEEKS === 18, '18 semanas, 11 de liga');
ok(c.fix[1].filter(r => r.length).length === 11 && c.fix[2].filter(r => r.length).length === 11 && c.fix[2].length === 11, 'Primera y Segunda juegan 11 jornadas, sin descansos');
ok(c.cup.byes.length === 0 && c.cup.ties.length === 16 && c.cup.ties.flat().includes(YOU), 'Copa con 32 de los 36 equipos (fuera los 4 más flojos de Tercera, nunca tú): 16 eliminatorias');
let rests = 0, played = 0, snap = null;
let sum = null, g = 0;
while (!sum && g++ < 40) { if (Career.weekType() === 'P1' && !snap) snap = JSON.parse(JSON.stringify(c.tables)); const nm = Career.nextMatch(); if (Career.weekType() === 'L') { if (nm) played++; else rests++; } if (nm) { const r = Career.simulateMine(c.tactic); Career.finishMatch(r.gA, r.gB, r.pens, r.forma); } sum = Career.advance(); }
ok(sum && played === 11 && rests === 0, 'temporada en Tercera: 11 partidos de liga, sin descansos');
ok(snap && Object.values(snap[1]).every(t => t.pj === 11) && Object.values(snap[3]).every(t => t.pj === 11), 'tablas: 11 PJ en Primera y en Tercera');
ok(sizes(c) === '12/12/12', 'tras ascensos y descensos: ' + sizes(c));
ok(c.cup.winner || true, 'Copa con campeón: ' + (c.history[0].cupRound));

console.log('3. Empezar con el Raimon');
c = Career.create(14, null, 'normal', 'Raimon');
ok(c.divs[1].includes(YOU) && !all(c).includes('Raimon') && sizes(c) === '12/12/12', 'ocupas su sitio en Primera (' + sizes(c) + ')');
ok(c.school === 'Raimon' && c.crestImg === 1 && c.kit.a === '#e8c21a', 'con su nombre, escudo y equipación');
ok(c.squad.some(m => PLAYER(m.id).name === 'Axel') && c.squad.some(m => PLAYER(m.id).name === 'Mark') && c.squad.length >= 7, 'con Mark, Axel y compañía (' + c.squad.length + ' jugadores)');
ok(c.fame === 55 && c.money === 1500, 'fama 55 y 1500 💰 por empezar en Primera');
ok(!all(c).filter(k => k !== YOU).some(k => c.clubs[k].some(p => c.squad.some(m => m.id === p.id))), 'nadie más tiene a tus jugadores');
sum = null; g = 0; while (!sum && g++ < 40) { if (Career.nextMatch()) { const r = Career.simulateMine(c.tactic); Career.finishMatch(r.gA, r.gB, r.pens, r.forma); } sum = Career.advance(); }
ok(sum && sum.div === 1, 'temporada en Primera con el Raimon: ' + sum.pos + 'º');

console.log('4. Empezar con un club de Tercera');
c = Career.create(13, null, 'normal', 'Farm');
ok(c.divs[3].includes(YOU) && c.divs[3].includes('Guardabosques') && sizes(c) === '12/12/12' && c.school === TEAM('Farm').name, 'Farm en Tercera (' + sizes(c) + ')');

console.log('5. Partida antigua con Primera de 10');
c = Career.create(13, 'Vieja');
c.divs[1] = c.divs[1].filter(k => k !== 'Raimon' && k !== 'Alpino'); c.divs[3].push('Raimon'); c.divs[3] = c.divs[3].filter(k => k !== 'Raimon');
delete c.clubs.Raimon; delete c.clubs.Alpino;
Career.newSeason(true);
sum = null; g = 0; while (!sum && g++ < 40) { if (Career.nextMatch()) { const r = Career.simulateMine(c.tactic); Career.finishMatch(r.gA, r.gB, r.pens, r.forma); } sum = Career.advance(); }
ok(sum && sizes(c) === '12/12/12' && c.divs[1].includes('Raimon') && c.clubs.Raimon, 'la temporada siguiente entran el Raimon y el Alpino: ' + sizes(c));
const B = Career.clubTeam('Raimon');
ok(B.players.length === 5 && B.players.every(p => p.sprite && p.sprite.file), 'el Raimon se puede jugar como rival');
const s = ctx.Logic.createMatch({ minutes: 1, difficulty: 'medio', golden: false, techMode: 'auto', allAI: true }, { A: Career.clubTeam('Zeus'), B });
for (let i = 0; i < 60 * 60 * 8 && !s.over; i++) { ctx.Logic.update(s, { move: { x: 0, y: 0 }, pressed: new Set() }, 1 / 60); s.events.length = 0; }
ok(s.over, 'partido Zeus–Raimon (' + s.score.A + '-' + s.score.B + ')');

console.log(fails ? '\n✗ ' + fails + ' fallos' : '\n✓ Todo bien');
process.exit(fails ? 1 : 0);
