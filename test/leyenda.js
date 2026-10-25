// Cadena Leyenda (evento de la 0.35.1): 15 equipos, una derrota y fuera, premios cada 3, Willy Glass LEYENDA
// y que los rivales no tengan ventajas (máx. 2 técnicas, sin multiplicar stats, sin correr ni robar más)
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: 0 }), collFile: () => 'c00.png' };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'pcareer.js', 'event.js', 'shop.js', 'selva.js', 'leyenda.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nthis.Profile=Profile;this.Leyenda=Leyenda;this.Run=Run;this.PLAYER=PLAYER;this.TECH=TECH;this.TEAM=TEAM;this.LY_TEAMS=LY_TEAMS;this.LY_ID=LY_ID;this.rivalTeam=rivalTeam;this.Logic=Logic;this.giftPickOptions=giftPickOptions;this.Shop=Shop;this.lyBanned=lyBanned;this.lyRepeat=lyRepeat;this.startingTechs=startingTechs;', ctx);
const { Profile, Leyenda, Run, PLAYER, TECH, TEAM, LY_TEAMS, LY_ID, rivalTeam, Logic, Shop } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load();
// Willy
const W = PLAYER(LY_ID), avg = p => ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + p.ie[k], 0) / 5;
ok(W && W.leyenda && W.rarity === 'legendaria' && W.role === 'DEL' && W.gacha === false && W.cs[0] === 161, 'Willy Glass LEYENDA existe (DEL, legendario, fuera del gacha, muñeco con corona)');
ok(avg(W) >= 96.5, 'media ' + avg(W) + ' (de los mejores del juego)');
ok(TECH(30910) && TECH(30910).name === 'Gafas Royale' && TECH(30910).type === 'tiro' && W.moves.every(([t]) => TECH(t)), 'Gafas Royale y sus técnicas: ' + W.moves.map(([t]) => TECH(t).name + ' ' + TECH(t).power).join(', '));
ok(ctx.startingTechs(W)[0] === 30910, 'empieza con Gafas Royale');
ok(!ctx.giftPickOptions({ rarity: 'legendaria' }, 200).includes(LY_ID) && !W.inf, 'no sale en los «elige 1 de 3»');
// equipos
ok(LY_TEAMS.length === 15 && LY_TEAMS.every(k => TEAM(k)) && new Set(LY_TEAMS).size === 15, '15 equipos distintos que existen');
const mean = k => { const ps = TEAM(k).players.map(m => avg(PLAYER(m.id))); return ps.reduce((a, b) => a + b, 0) / ps.length; };
ok(TEAM(LY_TEAMS[14]).kind === 'leyenda' && mean(LY_TEAMS[14]) > mean(LY_TEAMS[13]) && mean(LY_TEAMS[13]) >= mean(LY_TEAMS[0]), 'jefe final Leyendas (' + TEAM(LY_TEAMS[14]).players.map(m => PLAYER(m.id).name).join(', ') + ') · ' + 'de menos a más: ' + mean(LY_TEAMS[0]).toFixed(1) + ' → ' + mean(LY_TEAMS[14]).toFixed(1));
// sin ventajas
const B = rivalTeam(LY_TEAMS[14], 1, 1);
ok(B.players.every(p => p.techs.length <= 2), 'los rivales llevan como mucho 2 técnicas');
ok(B.players.every(p => p.techs.length <= 2), 'el jefe también con 2 técnicas');
const rr = Run.create('leyenda', [1, 10, 12, 9, 5], {}); const fs_ = [0, 7, 13, 14].map(i => { rr.index = i; return Run.rivalFactor(rr); });
ok(fs_[0] === 1 && Math.abs(fs_[2] - 1.25) < 1e-9 && fs_[3] === 1.15 && fs_[1] > 1 && fs_[1] < 1.25, 'los rivales suben: ' + fs_.map(x => x.toFixed(2)).join(' → '));
ok(ctx.lyBanned(10) === (PLAYER(10).rarity === 'legendaria') && ctx.lyBanned(LY_ID) && !ctx.lyBanned(12), 'sin legendarios en tu equipo');
ok(!ctx.Run.playable(LY_TEAMS[14]) && !Shop.album().some(a => a.key === LY_TEAMS[14]), 'el jefe no sale en el Infinito ni en el álbum');
for (const k of LY_TEAMS) for (const pr of [0, 0.5, 1]) if (rivalTeam(k, 1, pr).players.some(p => p.techs.length > 2)) ok(false, k + ' con más de 2 técnicas');
const s = Logic.createMatch({ minutes: 3, difficulty: 'leyenda', golden: true, techMode: 'auto' }, { A: rivalTeam('Raimon', 1, 1), B });
ok(s.diff.press && s.diff.steal > 1.5, 'dificultad «leyenda»: IA agresiva');
// recorrido
const ids = [1, 10, 12, 9, 5];
let r = Run.create('leyenda', ids, {});
ok(r.lives === 1 && r.schedule.length === 15 && r.diff === 'leyenda', 'una vida, 15 partidos');
const P = Profile.data; P.giftPicks = [];
ok(!ctx.lyRepeat(), 'la primera vez se puede con legendarios'); const t0 = P.tickets, c0 = P.coins;
for (let i = 0; i < 3; i++) { Run.applyResult(r, 'win', 1); if (r.state === 'reward') Run.takeReward(r, null); }
ok(P.tickets === t0 + 10 && r.last.lyPrize, 'partido 3: +10 tickets');
for (let i = 0; i < 3; i++) { Run.applyResult(r, 'win', 1); if (r.state === 'reward') Run.takeReward(r, null); }
ok(r.last.lyPrize && P.coins - c0 > 1500, 'partido 6: +1500 monedas');
Run.applyResult(r, 'loss', 0);
ok(r.state === 'over' && r.last.done, 'una derrota y fuera');
r = Run.create('leyenda', ids, {}); const t1 = P.tickets;
for (let i = 0; i < 6; i++) { Run.applyResult(r, 'win', 1); if (r.state === 'reward') Run.takeReward(r, null); }
ok(P.tickets === t1 && !r.last.lyPrize, 'los premios de tramo solo se dan una vez');
for (let i = 6; i < 15; i++) { Run.applyResult(r, 'win', 1); if (r.state === 'reward') Run.takeReward(r, null); }
ok(P.giftPicks.length === 2 && P.giftPicks.every(g => g.code === '👑' && g.opts.length === 3), 'partidos 9 y 12: dos «elige 1 de 3» (épico+ y legendario)');
ok(P.giftPicks[1].opts.every(id => PLAYER(id).rarity === 'legendaria'), 'el del 12 es legendario');
ok(ctx.lyRepeat(), 'tras completarla, al repetirla ya no valen legendarios');
ok(r.last.victory && r.last.legend && r.last.legend.isNew && P.coll[LY_ID] && P.coll[LY_ID].equip[0] === 30910, 'al ganar el 15: Willy Glass LEYENDA con Gafas Royale');
ok(Leyenda.data().done === 1 && Leyenda.data().best === 15 && Leyenda.data().tries === 3, 'récord 15, 1 completada, 3 intentos');
r = Run.create('leyenda', ids, {}); r.index = 14; Run.applyResult(r, 'win', 1);
ok(r.last.legend && r.last.legend.star === 2, 'repetirla: una estrella más');
// fechas
ok(Leyenda.active.call({ forced: false, today: () => '2026-10-25' }) && Leyenda.active.call({ forced: false, today: () => '2026-10-27' }) && !Leyenda.active.call({ forced: false, today: () => '2026-10-28' }) && !Leyenda.active.call({ forced: false, today: () => '2026-10-24' }), 'del 25 al 27 de octubre');
P.rayos = 5; ok(!Profile.useRayo(LY_ID) && P.rayos === 5, 'a Willy LEYENDA no se le pueden dar Rayos');
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exitCode = fails ? 1 : 0;
