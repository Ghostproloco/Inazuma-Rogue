// Modo Carrera Jugador: una carrera entera (creado y de la colección), con partidos jugados y simulados
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: pd.cs ? pd.cs[1] : 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'career.js', 'pcareer.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') +
  '\nthis.Logic=Logic;this.Profile=Profile;this.PC=PlayerCareer;this.PLAYER=PLAYER;this.LAST_YEAR=LAST_YEAR;this.PC_SUB_PART=PC_SUB_PART;this.PC_TIERS=PC_TIERS;this.TECH=TECH;this.TEAM=TEAM;', ctx);
const { Logic, Profile, PC, PLAYER } = ctx;
let fails = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fails++; };
Profile.load(); Profile.data.firstDone = true; Profile.save();

// Juega de verdad un partido con un «humano» sencillo que corre al área y la pide
function playReal(teams, preset = { A: 0, B: 0 }, part = 1) {
  const s = Logic.createMatch({ minutes: 3, difficulty: 'medio', golden: false, techMode: 'auto', lockId: teams.lockId }, teams);
  s.score.A = preset.A; s.score.B = preset.B; s.time *= part;
  const me = s.players.find(p => p.id === teams.lockId);
  for (let i = 0; i < 60 * 60 * 6 && !s.over; i++) {
    const o = s.ball.owner, pr = new Set(); let mv = { x: (s.field.w / 2 - me.x) * 0.1, y: -1 };
    if (o && o.team === 'A' && o !== me && i % 40 === 0) pr.add('A');
    if (o && o.team === 'B') { mv = { x: o.x - me.x, y: o.y - me.y }; const l = Math.hypot(mv.x, mv.y) || 1; mv.x /= l; mv.y /= l; if (l < 2 && i % 20 === 0) pr.add('A'); }
    Logic.update(s, { move: mv, sprint: true, shootHeld: o === me && me.y < 14 && (i % 60) < 40, passHeld: false, pressed: pr, dt: 1 / 60 }, 1 / 60);
    s.events.length = 0;
  }
  return s;
}

// Reto 1 contra 1 en el minicampo: el «humano» va a por el balón y tira
function playDuel(t) {
  const s = Logic.createMatch({ minutes: 1.5, difficulty: 'medio', golden: false, techMode: 'auto', lockId: t.lockId, mini: true, goalLimit: 3, noOffside: true }, t);
  const me = s.players.find(p => p.id === t.lockId);
  for (let i = 0; i < 60 * 60 * 3 && !s.over; i++) {
    const o = s.ball.owner, pr = new Set(); let mv;
    if (o === me) mv = { x: (s.field.w / 2 - me.x) * 0.2, y: -1 };
    else { const tx = o ? o : s.ball; mv = { x: tx.x - me.x, y: tx.y - me.y }; const l = Math.hypot(mv.x, mv.y) || 1; mv.x /= l; mv.y /= l; if (o && o.team === 'B' && l < 2 && i % 20 === 0) pr.add('A'); }
    Logic.update(s, { move: mv, sprint: true, shootHeld: o === me && me.y < 9 && (i % 60) < 40, passHeld: false, pressed: pr, dt: 1 / 60 }, 1 / 60);
    s.events.length = 0;
  }
  return s;
}
const N = { duels: 0, duelsReal: 0, events: 0, tiers: [], awards: [] };
function career(label, startId, custom) {
  console.log(label);
  const offers = PC.startOffers(startId); ok(offers.length >= 2, 'ofertas para empezar: ' + offers.map(o => o.key + ' (' + o.div + 'ª)').join(', '));
  const c = PC.create(startId, offers[0].key, custom);
  ok(PC.mine() && PC.divOf('TU') === offers[0].div, 'empieza en ' + c.school + ' · media ' + PC.ovrMe() + ' · ' + (PC.starter() ? 'titular' : 'suplente'));
  const start = PC.ovrMe(); let weeks = 0, real = 0, subIn = 0, starts = 0, seasonsDone = 0, transfers = 0, wc = 0, played = 0, spent = 0, techs = 0, guard = 0, mid = 0, gradAt = 0, firstTech = 0;
  if (custom) ok(start >= 55 && start <= 59, 'el creado empieza con media ~57, como los mejores comunes (' + start + ')');
  while (seasonsDone < 6 && guard++ < 400) {
    // Pedir el traspaso en el mercado de invierno de la 2.ª temporada
    if (c.season === 2 && c.week === 8 && PC.canAsk()) {
      const o = PC.askTransfer();
      if (o && o.length) {
        const before = PC.standings(PC.myDiv()).length, pj = PC.standings(PC.divOf(o[0].key)).find(r => r.key === o[0].key).pj;
        PC.acceptOffer(o[0].key); mid++;
        const T = PC.standings(PC.myDiv()), mineRow = T.find(r => r.key === 'TU');
        ok(T.length === before && mineRow && mineRow.pj === pj && c.club === o[0].key && !PC.nextMatch() === !PC.nextMatch(), 'traspaso a mitad de temporada: ahora en ' + c.school + ' con su clasificación (' + mineRow.pj + ' PJ)');
      } else console.log('    (nadie quiso ficharle en invierno)');
    }
    if (c.me.techWhy) N.tiers.push(ctx.PC_TIERS[c.me.techWhy - 1].ovr + ':' + ctx.TECH(c.me.techChoice[0]).power);
    if (c.me.techChoice) { PC.chooseTech(c.me.techChoice[0]); techs++; continue; }
    if (c.me.duel) {
      N.duels++;
      if (N.duels % 2) { const t = PC.duelTeams(); const s = playDuel(t); const F = s.field;
        ok(t.A.players.length === 2 && t.B.players.length === 2 && F.w === 22 && s.over, 'reto 1v1 en minicampo (' + F.w + '×' + F.l + ') contra ' + PLAYER(c.me.duel.id).name + ': ' + s.score.A + '-' + s.score.B);
        PC.duelResult(s.score.A, s.score.B); N.duelsReal++; }
      else PC.duelSimulate();
      continue;
    }
    if (c.me.event) { const v = PC.eventView(); ok(v && v.opts.length >= 2, 'decisión: ' + v.title); const msg = PC.resolveEvent(N.events % v.opts.length); N.events++; continue; }
    while (c.me.pts > 0) { const k = PLAYER(c.me.id).role === 'DEF' ? 'defensa' : 'tiro'; if (!PC.spendPoint(k) && !PC.spendPoint('rapidez')) break; spent++; }
    if (c.pwc) { while (c.pwc.state === 'on') { const W = c.pwc; if (W.round === 0 && wc % 2 === 0 && W.role === 'titular') { const t = PC.wcTeams(); const s = playReal(t); const st = s.pstats[t.lockId]; PC.wcFinish(s.score.A, s.score.B, PC.rateMatch(st, 1, s.score.A > s.score.B, s.score.A === s.score.B, s.score.B, 'DEL'), st); } else PC.wcSimulate(); } N.wcRoles = (N.wcRoles || []).concat(c.pwc.log.map(l => l.role[0]).join('')); wc++; PC.wcClose(); continue; }
    if (!PC.activityDone()) {
      if (weeks === 1 && PC.techOptions(1).length) { const n0 = PC.mine().known.length; PC.doActivity('tecnica', PC.techOptions(1)[0]); firstTech = PC.mine().known.length - n0; }
      else PC.doActivity(weeks % 3 === 0 ? 'descansar' : weeks % 5 === 0 ? 'tecnica' : 'entrenar', weeks % 5 === 0 ? (PC.techOptions(1)[0]) : 'tiro');
    }
    const nm = PC.nextMatch();
    if (nm) {
      if (PC.starter()) {
        starts++;
        if (weeks % 7 === 0) { const t = PC.matchTeams(); const s = playReal(t); PC.playedResult(s, t.lockId, 1); real++; } else PC.simulateWeek();
      } else {
        const plan = PC.benchPlan();
        if (plan.enters && weeks % 4 === 0) { const t = PC.matchTeams({ subIn: true }); const s = playReal(t, { A: plan.gA, B: plan.gB }, ctx.PC_SUB_PART); PC.playedResult(s, t.lockId, ctx.PC_SUB_PART, plan); real++; subIn++; }
        else { PC.simulateWeek(plan); if (plan.enters) subIn++; }
      }
      played++;
    }
    weeks++;
    const sum = PC.advance();
    if (sum) {
      seasonsDone++;
      const r = sum.pc;
      console.log(`    T${sum.season} ${c.school} ${sum.div}ª ${sum.pos}º · ${r.apps} PJ (${r.starts} tit.) ${r.goals} g ${r.assists} a · nota ${r.avg} · media ${PC.ovrMe()} · nv ${c.me.lv}${r.offers.length ? ' · ofertas ' + r.offers.map(o => o.key).join('/') : ''}${r.callup ? ' · ¡CONVOCADO!' : ''}${r.graduated ? ' · GRADUADO' : ''}`);
      if (r.graduated) gradAt = seasonsDone;
      if (r.awards.rookie) N.awards.push('rookie T' + sum.season); if (r.awards.balon) N.awards.push('BALÓN T' + sum.season);
      if (c.goPro) { ok(c.me.offers.length === 3 && c.me.offers.every(o => PC.isPro(o.key)), 'ofertas de la Liga Pro: ' + c.me.offers.map(o => o.key).join(', ')); PC.acceptOffer(c.me.offers[1].key); transfers++;
        ok(c.pro && PC.myDiv() === 1 && c.divs[1].length === 10 && c.divs[1].filter(k => k !== 'TU').every(k => PC.isPro(k)) && c.divs[2].length === 12 && c.divs[3].length === 12, 'en la Liga Pro con ' + c.school + ' (media del club ' + PC.myRating() + ')'); }
      else if (r.offers.length && r.offers[0].why !== 'down') { PC.acceptOffer(r.offers[0].key); transfers++; } else if (c.me.offers) PC.rejectOffers();
    }
  }
  ok(c.me.graduated && gradAt === 3 && !c.over && seasonsDone === 6, 'se gradúa tras 3 temporadas (' + gradAt + ') y sigue en la Liga Pro (' + seasonsDone + ' temporadas)');
  ok(c.pro && c.divs[1].filter(k => k !== 'TU').every(k => PC.isPro(k)) && c.divs[1].length === 10, 'la Liga Pro sigue igual tras varias temporadas (' + c.divs[1].map(k => k === 'TU' ? c.school : k.slice(4)).join(', ') + ')');
  if (custom) ok(firstTech === 1, 'la primera técnica se aprende en 1 semana');
  ok(c.news.some(n => / ficha a /.test(n)), 'los clubes fichan entre ellos: ' + c.news.filter(n => / ficha a /.test(n)).length + ' noticias (p. ej. «' + (c.news.find(n => / ficha a /.test(n)) || '') + '»)');
  const bad = Object.entries(c.clubs).filter(([k, L]) => !(L.length === 5 && L.filter(p => p.role === 'POR').length === 1)).map(([k, L]) => k + ':' + L.map(p => p.role).join('/')), sizes = !bad.length; if (bad.length) console.log('    ' + bad.join('  '));
  ok(sizes, 'todos los clubes siguen con 5 jugadores y 1 portero');
  const T0 = ctx.TEAM('pro:barcelona'); ok(new Set(T0.players.map(p => PLAYER(p.id).abroad)).size >= 3, 'la Liga Pro mezcla países (Barcelona: ' + T0.players.map(p => PLAYER(p.id).abroad).join(', ') + ')');
  console.log('    retos 1v1: ' + N.duels + ' (' + N.duelsReal + ' jugados) · ganados ' + c.me.duels.w + ' · decisiones: ' + N.events + ' · franjas de técnicas: ' + N.tiers.join(' ') + ' · premios: ' + N.awards.join(', '));
  console.log('    relaciones: ' + PC.relList().map(r => r.t + ' ' + PLAYER(r.id).name + ' nv' + r.lv).join(', '));
  ok(Object.keys(c.me.rel).length > 0, 'tiene amigos o rivales (' + Object.keys(c.me.rel).length + ')');
  ok(PC.ovrMe() > Math.min(start + 8, 95), 'mejora: media ' + start + ' → ' + PC.ovrMe() + ' · nivel ' + c.me.lv + ' · ' + spent + ' puntos · ' + techs + ' técnicas elegidas · conoce ' + PC.mine().known.length);
  ok(real >= 5 && played > 50, played + ' partidos (' + real + ' jugados de verdad, ' + starts + ' de titular, ' + subIn + ' saliendo del banquillo)');
  console.log('    traspasos pedidos: ' + mid + ' · fichajes: ' + transfers + ' · mundiales: ' + wc + (N.wcRoles ? ' (papel por partido: ' + N.wcRoles.join(' | ') + ')' : '') + ' · goles totales: ' + c.me.total.goals + ' · premios: ' + c.me.awards.map(a => a.name).join(', '));
  return c;
}

const tk0 = Profile.data.tickets;
const look = PC.lookChoices(6, 'DEL')[0];
const pd = PC.newCustom({ name: 'Rayo Test', role: 'DEL', elem: 'fuego', look: look.id });
ok(pd.id >= 990000 && PLAYER(pd.id) === pd, 'jugador creado (' + pd.name + ', aspecto de ' + look.name + ')');
const c1 = career('1. Jugador creado', pd.id, pd);
ok(c1.me.seasons[0].starts < c1.me.seasons[0].apps || c1.me.seasons[0].apps < 9, 'el creado empieza ganándose el puesto (1.ª temporada: ' + c1.me.seasons[0].starts + ' titular de ' + c1.me.seasons[0].apps + ' partidos)');
ok(Profile.data.custom && Profile.data.custom.some(p => p.id === pd.id) && Profile.data.coll[pd.id], 'al graduarse entra en tu colección (' + PLAYER(pd.id).rarity + ')');
ok(Profile.data.tickets > tk0, 'premios en tickets: +' + (Profile.data.tickets - tk0));
// Recargar el perfil: el creado sigue existiendo
const saved = store['inazuma-perfil']; Profile.load();
ok(PLAYER(pd.id) && Profile.data.coll[pd.id], 'tras recargar, sigue en tu colección');

const axel = ctx.GAME.players.find(p => p.name === 'Axel' || /Axel Blaze/.test(p.full || ''));
Profile.data.coll[axel.id] = { stars: 1, up: {} };
const c2 = career('2. Estrella de la colección (' + axel.name + ')', axel.id, null);
ok(c2.me.total.starts > c2.me.total.apps * 0.6, 'una estrella es titular casi siempre (' + c2.me.total.starts + ' de ' + c2.me.total.apps + ')');
console.log(fails ? fails + ' FALLOS' : 'Todo bien'); process.exit(fails ? 1 : 0);
