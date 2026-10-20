const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname,'..','src')+'/';
const store = {};
const ctx = { Sprites: { collFile: pd => 'c' + String(pd.cs[0]).padStart(2, '0') + '.png' }, console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } } };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','juego','gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.Run=Run;this.Profile=Profile;this.Gacha=Gacha;this.STAGE_ORDER=STAGE_ORDER;this.rivalTeam=rivalTeam;this.TEAM=TEAM;', ctx);
const { Logic, Run, Profile, Gacha, STAGE_ORDER, rivalTeam } = ctx;
// perfil viejo con un Raimon «oscuro»: debe migrar
store['inazuma-perfil'] = JSON.stringify({ coll: { 1589: { stars: 3, up: {} } }, firstDone: true, tickets: 100 });
Profile.load(); console.log('migración', Object.keys(Profile.data.coll), Profile.data.story.s2);
console.log('Etapa 2', STAGE_ORDER.s2);
const res = Gacha.pull(100, { banner: 3 }); console.log('gacha 4', res.filter(r => r.tech != null).length, 'técnicas', res.slice(0, 5).map(r => r.id != null ? ctx.GAME.players.find(p => p.id === r.id).name : 'tec'));
Profile.data.story.s1.done = true;
const ids = Object.keys(Profile.data.coll).map(Number).slice(0, 5);
const run = Run.create('story', ids, { stage: 's2', diff: 'facil', formation: '1-2-1-1' });
console.log(run.name, run.schedule);
for (const key of STAGE_ORDER.s2.concat(['Prominence', 'Polvo de Diamantes', 'Caos'])) {
  const s = Logic.createMatch({ minutes: 2, difficulty: 'facil', golden: true, techMode: 'auto', allAI: true }, { A: Run.matchTeams(run).A, B: rivalTeam(key, 1, 1) });
  const inp = { move: { x: 0, y: 0 }, sprint: false, shootHeld: false, pressed: new Set() };
  for (let i = 0; i < 60 * 60 * 4 && !s.over; i++) { Logic.update(s, inp, 1 / 60); s.events.length = 0; }
  console.log(key.padEnd(22), s.score.A + '-' + s.score.B);
}
Run.applyResult(run, 'win', 2); console.log('s2', Profile.data.story.s2);
