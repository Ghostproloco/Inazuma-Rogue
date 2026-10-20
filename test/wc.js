// Mundial de Carrera: convocatoria, grupo, eliminatorias y premios (simulado), varias veces
const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname,'..','src')+'/';
const store = {};
const ctx = { console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','juego','gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: 0 }) };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\n' + fs.readFileSync(S + 'career.js', 'utf8') + '\nthis.Career=Career;this.PLAYER=PLAYER;this.Logic=Logic;Profile.load();', ctx);
const { Career, PLAYER, Logic } = ctx;
const places = {};
const ctx_nat = () => vm.runInContext('NATIONS', ctx).map(k => k + ':' + Career.wcRating(k)).join(' ');
for (let n = 0; n < 40; n++) {
  const c = Career.create(13, 'Instituto Prueba');
  while (!c.wc && !c.over) { if (Career.nextMatch()) { const r = Career.simulateMine(c.tactic); Career.finishMatch(r.gA, r.gB, r.pens, r.forma); } if (!c.over) Career.advance(); }
  if (c.over) { places.cerrado = (places.cerrado || 0) + 1; continue; }
  const cands = Career.wcCandidates();
  if (!globalThis.done1) console.log('temporada', c.wc.season, 'convocables', cands.length, cands.slice(0, 8).map(x => PLAYER(x.id).name + ':' + x.score + '@' + x.club).join(' '));
  if (!globalThis.done1) console.log('JP vs naciones', 0);
  Career.wcStart(cands.slice().sort((a, b) => b.score - a.score).slice(0, 10).map(x => x.id));
  const sq1 = c.wc.squad.slice(); Career.wcTeam2(); const sq2 = c.wc.squad.slice(); Career.wcBest();
  if (!globalThis.done1) console.log('equipo 1', sq1.map(i => PLAYER(i).name).join(','), '| equipo 2', sq2.map(i => PLAYER(i).name).join(','));
  // técnicas: equipar 2 de la lista de un jugador de tu club
  const m = c.squad[0], ls = Career.learnset(m.id);
  if (ls.length) { Career.toggleEquip(m.id, ls[ls.length - 1]); if (!globalThis.done1) console.log('técnicas', PLAYER(m.id).name, ls.length, '→ equipadas', Career.equipped(m)); }
  if (!globalThis.done1) { const t = Career.wcTeams(); const s = Logic.createMatch({ minutes: 1, difficulty: 'medio', techMode: 'auto', allAI: true }, t); console.log('partido ok', t.A.players.map(p => p.name + '/' + p.role).join(' '), 'vs', t.B.name); }
  while (c.wc.state !== 'out' && c.wc.state !== 'champion') { const s = Career.wcSim(); Career.wcResult(s.gA, s.gB); }
  if (!globalThis.done1) console.log('rating JP', Career.wcRating('JP'), ctx_nat());
  places[c.wc.place] = (places[c.wc.place] || 0) + 1;
  if (!globalThis.done1) console.log(c.wc.log.map(l => l.r + ' ' + l.gA + '-' + l.gB + ' ' + l.opp).join(' | '), c.wc.reward);
  Career.wcClose(); globalThis.done1 = 1;
}
console.log(places);
