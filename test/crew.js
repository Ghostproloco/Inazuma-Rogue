// Técnicas de varios jugadores: cuántos compañeros salen y bonus +5 % si están los que también la saben
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const S = require('path').join(__dirname,'..','src')+'/';
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','juego','gamedata.json'), 'utf8'));
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\nthis.Logic=Logic;this.rivalTeam=rivalTeam;this.buildMatchPlayer=buildMatchPlayer;this.layout=layout;this.PLAYER=PLAYER;this.statOf=statOf;this.crewSize=crewSize;', ctx);
const { Logic, rivalTeam, buildMatchPlayer, layout, PLAYER, statOf, crewSize } = ctx;
const T = id => ctx.GAME.techniques[id];
const want = { 147: 2, 195: 2, 300: 2, 209: 2, 30241: 2, 277: 0, 298: 1, 291: 1, 30292: 1, 142: 1, 272: 1, 144: 0, 483: 0, 332: 0, 376: 0, 169: 0 };
for (const [id, n] of Object.entries(want)) assert.strictEqual(crewSize(T(id)), n, T(id).name);
console.log('ok tamaños');

function run(techSets) {
  const ids = [172, 3, 8, 10, 29], roles = ['POR', 'DEF', 'MED', 'DEL', 'DEL'], pos = layout(roles);
  const A = { name: 'Yo', key: 'yo', players: ids.map((id, i) => Object.assign(buildMatchPlayer(id, roles[i], k => statOf(id, { stars: 3, up: {} }, k), techSets[i], [], i, pos[i]), { sprite: {} })) };
  const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'auto', allAI: true }, { A, B: rivalTeam('Kirkwood', 1.13, 0.5) });
  const inp = { move: { x: 0, y: 0 }, sprint: false, shootHeld: false, pressed: new Set() };
  const r = { starts: 0, combo: 0, powers: [] };
  for (let i = 0; i < 60 * 60 * 8 && !s.over; i++) {
    Logic.update(s, inp, 1 / 60);
    for (const e of s.events) if (e.type === 'techStart' && e.team === 'A' && e.name === 'Triángulo letal') { r.starts++; if (e.combo) r.combo++; }
    if (s.ball.shot && s.ball.shot.tech && s.ball.shot.team === 'A' && s.ball.shot.tech.name === 'Triángulo letal' && !r.powers.includes(s.ball.shot.tech.power)) r.powers.push(s.ball.shot.tech.power);
    s.events.length = 0;
  }
  return r;
}
const solo = run([[], [], [], [147], []]);            // solo uno la sabe: sin bonus
const trio = run([[], [], [147], [147], [147]]);      // tres la saben: bonus
console.log('solo', solo, 'trío', trio);
assert(solo.starts > 0 && solo.combo === 0 && !solo.powers.includes(Math.round(96 * 1.05)));
assert(trio.starts > 0 && trio.combo === trio.starts && trio.powers.every(p => p === Math.round(96 * 1.05)));
console.log('ok bonus');
