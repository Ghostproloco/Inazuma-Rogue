// Tienda (v0.35): tickets, sobres, equipación, escudo y campo, niveles de técnicas y álbum
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: () => ({ file: 'c00.png', row: 0 }), collFile: () => 'c00.png' };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'shop.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') + '\nthis.Shop=Shop;this.SHOP=SHOP;this.Profile=Profile;this.Run=Run;this.PLAYER=PLAYER;this.TECH=TECH;this.EVO=EVO;this.MAX_STARS=MAX_STARS;Profile.load();', ctx);
const { Shop, SHOP, Profile, Run, PLAYER, TECH, EVO } = ctx;
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const P = Profile.data;

console.log('1. Tickets');
P.coins = 5000; P.tickets = 0;
const day1 = new Date(2026, 9, 23, 12).getTime(), day2 = new Date(2026, 9, 24, 9).getTime();
let r = Shop.buyTickets(3, day1); ok(r.ok && P.tickets === 3 && P.coins === 5000 - 450, '3 tickets = 450 monedas');
r = Shop.buyTickets(10, day1); ok(r.ok && r.n === 7 && P.tickets === 10, 'pides 10 y solo te da los 7 que quedan');
r = Shop.buyTickets(1, day1); ok(!r.ok && Shop.ticketsLeft(day1) === 0, 'el 11.º del día no se puede');
ok(Shop.ticketsLeft(day2) === 10 && Shop.buyTickets(1, day2).ok, 'al día siguiente vuelven a ser 10');
P.coins = 100; ok(!Shop.buyTickets(1, day2).ok && P.coins === 100, 'sin monedas no compra ni cobra');

console.log('2. Sobres');
const tiers = { rara: {}, epica: {}, legendaria: {} };
for (const k of ['rara', 'epica', 'legendaria']) for (let i = 0; i < 60; i++) Shop.packOptions(k).forEach(id => { const t = PLAYER(id).rarity; tiers[k][t] = (tiers[k][t] || 0) + 1; });
ok(!tiers.rara.comun && tiers.rara.rara > tiers.rara.epica, 'raro+: nunca comunes, sobre todo raros ' + JSON.stringify(tiers.rara));
ok(!tiers.epica.comun && !tiers.epica.rara && tiers.epica.epica > 100, 'épico+: épicos y algún legendario ' + JSON.stringify(tiers.epica));
ok(Object.keys(tiers.legendaria).join() === 'legendaria', 'legendario: solo legendarios');
const opts = Shop.packOptions('puesto', 'POR'); ok(opts.length === 3 && opts.every(id => PLAYER(id).role === 'POR') && new Set(opts).size === 3, 'épico de un puesto: 3 porteros distintos');
ok(GAME_ok = ctx.GAME.players.every(p => !p.original || !Shop.packOptions('legendaria').includes(p.id)), 'los originales nunca salen');
P.coins = 20000; P.giftPicks = [];
r = Shop.buyPack('rara'); ok(r.ok && P.coins === 19300 && P.giftPicks.length === 1 && P.giftPicks[0].uid === r.uid, 'sobre raro: 700 y queda un «elige 1 de 3»');
const before = Profile.ids().length, pick = Profile.takePick(0, P.giftPicks[0].opts[0]); ok(pick && P.giftPicks.length === 0 && (pick.isNew ? Profile.ids().length === before + 1 : true), 'elegir el jugador lo mete en la colección');
ok(!Shop.buyPack('puesto').ok && P.coins === 19300, 'épico de un puesto sin puesto: no');
ok(Shop.buyPack('puesto', 'DEL').ok && P.coins === 15800, 'épico de un puesto: 3500');
ok(Shop.buyPack('epica').ok && P.coins === 13300, 'épico: 2500');
const w1 = new Date(2026, 9, 21, 10).getTime(), w1b = new Date(2026, 9, 25, 22).getTime(), w2 = new Date(2026, 9, 26, 8).getTime();   // miércoles, domingo, lunes
ok(Shop.buyPack('legendaria', null, w1).ok && P.coins === 6300, 'legendario: 7000');
ok(!Shop.buyPack('legendaria', null, w1b).ok && P.coins === 6300, 'segundo legendario la misma semana (domingo): no');
ok(Shop.legReady(w2), 'el lunes siguiente vuelve a estar');

console.log('3. Equipación, escudo y campo');
P.coins = 10000;
ok(Shop.buyDesign('aros').ok && P.coins === 9400 && Shop.kitDesigns().some(d => d[0] === 'aros'), 'diseño «aros» comprado y en el creador');
ok(!Shop.buyDesign('aros').ok && P.coins === 9400, 'no se compra dos veces');
ok(Shop.kitDesigns().length === ctx.KIT_DESIGNS_LEN + 1 || Shop.kitDesigns().length === 7, 'los 6 de siempre siguen gratis');
ok(Shop.buyColor('#d4a62a').ok && Shop.kitColors().includes('#d4a62a'), 'color oro comprado');
ok(!Shop.setCrest({ shape: 'circulo' }) && Shop.myCrest() === null, 'sin comprar el escudo no se puede editar');
ok(Shop.buyCrest().ok && Shop.myCrest() && Shop.setCrest({ shape: 'circulo', sym: 'llama' }) && Shop.myCrest().shape === 'circulo', 'escudo propio: 1500 y editable');
ok(!Shop.setCrest({ shape: 'estrella' }), 'forma especial sin comprar: no');
ok(Shop.buyShape('estrella').ok && Shop.setCrest({ shape: 'estrella' }) && Shop.crestShapes().includes('estrella'), 'forma estrella comprada (también en la Carrera)');
P.crestOff = true; ok(Shop.myCrest() === null && Shop.crestData(), 'puedes volver al del Raimon sin perderlo'); P.crestOff = false;
ok(!Shop.setField('volcan') && Shop.buyField('volcan').ok && Shop.setField('volcan') && Shop.myField() === 'volcan', 'campo volcánico comprado y elegido');
const run = Run.create('story', [1, 2, 3, 4, 5].map(i => Profile.ids()[i] || Profile.ids()[0]), { stage: 's1', diff: 'medio' });
const fields = run.schedule.map((_, i) => { run.index = i; return Run.field(run); });
ok(fields.filter(f => f === 'volcan').length === Math.ceil((run.schedule.length - 1) / 2) && fields[fields.length - 1] !== 'volcan', 'Historia: en casa los partidos pares, la final fuera · ' + fields.join(','));
const sp = Run.create('special', [Profile.ids()[0]], { team: 'Royal Academy' }); ok(Run.field(sp) !== 'volcan', 'equipo especial: en su campo');
Shop.setField('normal'); run.index = 0; ok(Shop.myField() === null && Run.field(run) !== 'volcan', 'con el clásico, todo como antes');

console.log('4. Supertécnicas');
const tid = Object.keys(ctx.GAME.evo).map(Number).find(t => TECH(t)), to = EVO(tid);
P.coins = 10000; P.techs = P.techs || {}; delete P.techs[to];
ok(Shop.techLevel(tid) === 1 && Shop.levelCost(tid) === 500, 'empieza en nivel 1; subir al 2 cuesta 500');
ok(!Shop.canEvolve(tid) && !Shop.evolve(tid).ok, 'no evoluciona hasta el nivel 3');
ok(Shop.levelUp(tid).ok && Shop.levelUp(tid).ok && Shop.techLevel(tid) === 3 && P.coins === 8000, 'nivel 3 por 500 + 1500');
ok(!Shop.levelUp(tid).ok && P.coins === 8000, 'no pasa del 3');
const m = Shop.boost({ techs: [Object.assign({}, TECH(tid))] }); ok(m.techs[0].power === TECH(tid).power + 16 && TECH(tid).power !== m.techs[0].power, '+16 de potencia en el partido (sin tocar la técnica original)');
ok(Shop.evolve(tid).ok && P.techs[to] && P.coins === 5000, 'evolución: 3000 y te da ' + TECH(to).name);
ok(!Shop.canEvolve(tid), 'no se evoluciona dos veces');
// En el partido del recorrido, tus técnicas con nivel suben
const id0 = Profile.ids().find(id => Profile.equipOf(id).length);
const t0 = Profile.equipOf(id0)[0]; P.techLv[t0] = 2;
const r2 = Run.create('story', [id0, id0, id0, id0, id0], { stage: 's1' }), T = Run.matchTeams(r2);
const mt = T.A.players[0].techs.find(t => t.id === t0); ok(mt && mt.power === TECH(t0).power + 8 && mt.lv === 2, 'en el partido sale con +8 (nivel 2)');
ok(T.B.players.every(p => p.techs.every(t => !t.lv)), 'los rivales no llevan niveles');

console.log('5. Álbum');
const A = Shop.album(); ok(A.length > 30, A.length + ' equipos en el álbum');
ok(A.every(a => a.ids.every(id => { const p = PLAYER(id); return p.cs && p.gacha !== false && !p.original && !p.halloween; })), 'solo jugadores del gacha (sin originales ni de evento)');
const team = A.find(a => a.key === 'Raimon') || A[0]; P.coins = 1e6;
team.ids.forEach(id => delete P.coll[id]);
ok(!Shop.claimAlbum(team.key).ok, 'incompleto: sin premio');
const miss = team.ids.slice(), c0 = P.coins;
for (const id of miss) if (!Shop.buyPlayer(id).ok) ok(false, 'comprar ' + id);
ok(P.coins === c0 - miss.reduce((t, id) => t + SHOP.buyPrice[PLAYER(id).rarity], 0), 'comprar los que faltan: precio por rareza');
ok(!Shop.buyPlayer(miss[0]).ok, 'no compras uno que ya tienes');
const tk = P.tickets; r = Shop.claimAlbum(team.key); ok(r.ok && P.tickets === tk + 5 && Shop.albumState(team.key).claimed, team.name + ' completo: +300 🪙 y +5 🎟️');
ok(!Shop.claimAlbum(team.key).ok, 'el premio solo una vez');

// Clubes del Modo Carrera
ok(Shop.clubPrice(88) === 15000 && Shop.clubPrice(76) === 3000 && Shop.clubPrice(61) === 300, 'precio de los clubes según su media');
P.coins = 1000; ok(!Shop.buyClub('Raimon', 88).ok && P.coins === 1000 && !Shop.ownsClub('Raimon'), 'sin monedas no se compra el club');
P.coins = 16000; ok(Shop.buyClub('Raimon', 88).ok && P.coins === 1000 && Shop.ownsClub('Raimon'), 'comprar el Raimon (15000)');
ok(!Shop.buyClub('Raimon', 88).ok && P.coins === 1000, 'un club solo se compra una vez');
console.log(fails ? fails + ' FALLOS' : 'Todo bien');
process.exit(fails ? 1 : 0);
