const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname,'..','src')+'/';
const ctx = { console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','juego','gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;this.CHAINS=CHAINS;this.Gacha=Gacha;this.BANNERS=BANNERS;this.Profile=Profile;this.Run=Run;', ctx);
const { CHAINS, rivalTeam, Gacha, BANNERS, Profile, Run } = ctx;
Profile.load();
for (const c of CHAINS) for (const t of c.teams) { const r = rivalTeam(t, c.factor, 0.5); if (!r || r.players.length !== 5) throw new Error('equipo ' + t); }
console.log('cadenas OK', CHAINS.map(c => c.key + (c.needs ? '(' + c.needs + ')' : '')).join(' '));
for (const b of BANNERS) { const res = Gacha.pull(10, { banner: b.id }); console.log(b.name, res.map(r => r.tech != null ? '[T]' : ctx.GAME.players.find(p => p.id === r.id).name).join(', ')); }
console.log('unlocked fuego sin s2:', Profile.unlocked({ chain: CHAINS.find(c => c.key === 'fuego') }));
