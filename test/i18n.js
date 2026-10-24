// Juego en inglés: que no falte ninguna traducción y que la lógica funcione igual
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };

console.log('1. Todas las claves TX(…) tienen traducción');
const KEY = /TXn?\(\s*(?:[^,()']+,\s*)?'((?:[^'\\]|\\.)*)'/g;
const files = ['app.js', 'view.js', 'logic.js', 'run.js', 'career.js', 'event.js', 'dialog.js', 'christmas.js', 'go.js', 'limited.js', 'cloud.js', 'media.js', 'techfx.js'];
const used = new Set();
for (const f of files) { const src = fs.readFileSync(S + f, 'utf8'); let m; while ((m = KEY.exec(src))) used.add(eval("'" + m[1] + "'")); }
const store = { 'inazuma-idioma': 'en' };
const ctx = { console, Math, JSON, Object, Array, Set, Map, Date, String, Number, navigator: { language: 'en-GB' },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: () => ({ file: 'c00.png', row: 0 }), collFile: () => 'c00.png' };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'i18n.js', 'utf8') + '\n' + fs.readFileSync(S + 'en.js', 'utf8') + '\nthis.EN_TEXT=EN_TEXT;this.I18N=I18N;this.TX=TX;', ctx);
const miss = [...used].filter(k => ctx.EN_TEXT[k] == null);
ok(miss.length === 0, 'faltan ' + miss.length + (miss.length ? ': ' + miss.slice(0, 8).map(x => JSON.stringify(x)).join(', ') : ''));
const extra = Object.keys(ctx.EN_TEXT).filter(k => !used.has(k));
console.log('  (traducciones que ya no se usan: ' + extra.length + ')');
ok(ctx.I18N.lang === 'en' && ctx.TX('Partido') === 'Match', 'el juego está en inglés');
ok(ctx.GAME.techniques[143].name === 'Fire Tornado' && ctx.GAME.teams.find(t => t.key === 'Caos').name === 'Chaos', 'técnicas y equipos en inglés (Fire Tornado, Chaos)');

console.log('2. La lógica funciona en inglés');
vm.runInContext(['logic.js', 'run.js', 'career.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nthis.Logic=Logic;this.Run=Run;this.Profile=Profile;this.Gacha=Gacha;this.Career=Career;this.rivalTeam=rivalTeam;this.STAGES=STAGES;', ctx);
const { Logic, Run, Profile, Gacha, Career, rivalTeam } = ctx;
Profile.load(); Profile.data.firstDone = true;
const res = Gacha.pull(10, { keeper: true }); ok(res.length === 10, 'gacha');
const rd = Profile.redeem('MUNDIAL'); ok(rd.ok, 'código MUNDIAL: ' + rd.msg);
const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'auto', allAI: true }, { A: rivalTeam('Royal Academy', 1, 1), B: rivalTeam('Caos', 1, 1) });
let goals = 0; for (let i = 0; i < 60 * 60 * 10 && !s.over; i++) { Logic.update(s, { move: { x: 0, y: 0 }, pressed: new Set() }, 1 / 60); for (const e of s.events) if (e.type === 'goal') goals++; s.events.length = 0; }
ok(s.over, 'partido completo (' + goals + ' goles)');
const ids = Object.keys(Profile.data.coll).map(Number).slice(0, 5);
const run = Run.create('story', ids, { stage: 's1', diff: 'medio', formation: '1-2-1-1' });
ok(run && run.schedule.length > 0, 'Historia: intento creado (' + run.name + ')');
const c = Career.create(13, 'Test School');
let seasons = 0; for (let k = 0; k < 4 && !c.over; k++) { c.fame = 60; if (Career.devEndSeason()) seasons++; if (c.wc) { c.wc = null; } }
ok(seasons >= 3, 'Carrera: ' + seasons + ' temporadas simuladas · ' + Career.teamName(c.divs[3][0]));
const w = Career.wcCreate(3); c.wc = w; ok(!!w, 'Mundial creado');
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
