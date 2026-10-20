// ¿Marca la IA goles sin técnica? A = equipo tipo del jugador (colección), B = rival de historia
const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname,'..','src')+'/';
const ctx = { console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','juego','gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;this.buildMatchPlayer=buildMatchPlayer;this.layout=layout;this.PLAYER=PLAYER;this.statOf=statOf;', ctx);
const { Logic, rivalTeam, buildMatchPlayer, layout, PLAYER, statOf } = ctx;
const N = +(process.argv[2] || 8), legGK = process.argv[3] === 'leg';
const ids = [legGK ? 1 : 172, 3, 8, 10, 29];   // portero (Mark legendario o uno normal) + 4
const roles = ['POR', 'DEF', 'MED', 'DEL', 'DEL'], pos = layout(roles);
const tot = { A_tec: 0, A_norm: 0, B_tec: 0, B_norm: 0, shotsB: 0 };
for (let m = 0; m < N; m++) {
  const A = { name: 'Yo', key: 'yo', players: ids.map((id, i) => Object.assign(buildMatchPlayer(id, roles[i], k => statOf(id, { stars: 3, up: {} }, k), PLAYER(id).moves.map(x => x[0]).slice(0, 2), [], i, pos[i]), { sprite: {} })) };
  const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'auto', allAI: true }, { A, B: rivalTeam('Kirkwood', 1.13, 0.5) });
  const inp = { move: { x: 0, y: 0 }, sprint: false, shootHeld: false, pressed: new Set() };
  for (let i = 0; i < 60 * 60 * 8 && !s.over; i++) {
    Logic.update(s, inp, 1 / 60);
    for (const e of s.events) { if (e.type === 'goal') tot[e.team + (e.tech ? '_tec' : '_norm')]++; if (e.type === 'shot' && e.team === 'B') tot.shotsB++; }
    s.events.length = 0;
  }
}
console.log(legGK ? 'portero legendario' : 'portero normal', Object.fromEntries(Object.entries(tot).map(([k, v]) => [k, +(v / N).toFixed(2)])));
