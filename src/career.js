/* =====================================================================
   MODO CARRERA (mánager): 3 divisiones de 10 equipos a una vuelta, playoffs
   de ascenso, fichajes (ojeo, mercado con negociación, fichar al vencido),
   graduaciones, cantera, mejoras del club, equipación y escudo propios.
   Aquí solo está la lógica; las pantallas están en app.js.
   ===================================================================== */
const CAREER_KEY = 'inazuma-carrera';
const YOU = 'TU';                               // clave de tu club en las tablas
const DIV_NAME = { 1: 'Primera', 2: 'Segunda', 3: 'Tercera' };
const DIV_FACTOR = { 1: 0.95, 2: 0.85, 3: 0.72 }; // fuerza de los rivales según la división
const DIV_DIFF = { 1: 'dificil', 2: 'medio', 3: 'facil' };
const DIV_TICKET = { 1: 170, 2: 105, 3: 60 };   // taquilla por victoria
const DIV_PRIZE = { 1: 1500, 2: 800, 3: 400 };  // premio al campeón
const DIV_SPONSOR = { 1: 2.2, 2: 1.5, 3: 1 };   // patrocinio semanal (× fama)
const CAREER_START = {
  1: ['Emperadores Oscuros', 'Ultra Zeus', 'Zeus', 'Royal Academy', 'Génesis', 'Royal Academy Redux', 'Caos', 'Tormenta de Géminis', 'Épsilon', 'Polvo de Diamantes'],
  2: ['Veteranos', 'Tanques Centella', 'Bombas Centella', 'Ardientes', 'Kirkwood', 'Fauxshore', 'Airosos', 'Claustro Sagrado', 'Prominence', 'Épsilon Plus'],
  3: ['Farm', 'Wild', 'Occult', 'Umbrella', 'Shuriken', 'Otaku', 'Brain', 'Sallys', 'Inazuma Kids FC'],   // + tu club
};
// Calendario de 16 semanas: L = liga (9 jornadas), C = Copa (fase 3), P1/P2 = playoff de ascenso
const SCHED = [null, 'L', 'L', 'C', 'L', 'L', 'C', 'L', 'L', 'C', 'L', 'L', 'C', 'L', 'C', 'P1', 'P2'];
const WEEKS = SCHED.length - 1;
const LEAGUE_WEEKS = SCHED.map((t, w) => t === 'L' ? w : null).filter(w => w != null);
const CUP_WEEKS = SCHED.map((t, w) => t === 'C' ? w : null).filter(w => w != null);   // 5 rondas
const CUP_ROUND = ['Dieciseisavos', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];
const CAREER_DIFF = { facil: { name: 'Fácil', mul: 0.93, shift: -1 }, normal: { name: 'Normal', mul: 1, shift: 0 }, dificil: { name: 'Difícil', mul: 1.07, shift: 1 } };
const HOF_KEY = 'inazuma-salon';
const MANAGERS = [13, 14, 15, 212, 21440];      // Nelly, Celia, Silvia, Seymour Hillman (1 y 2)
const SQUAD_MAX = 12, SQUAD_MIN = 7;
const LAST_YEAR = 6;   // los jugadores se gradúan (se van) al acabar 6º curso
const YEAR_GROWTH = 1; // puntos que sube cada stat al pasar de curso
const TACTICS = {
  equilibrada: { name: 'Equilibrada', desc: 'Sin riesgos', for: 1, ag: 1, forma: 0 },
  ofensiva:    { name: 'Ofensiva', desc: 'Más goles a favor… y en contra', for: 1.28, ag: 1.22, forma: 0 },
  defensiva:   { name: 'Defensiva', desc: 'Encerrarse atrás', for: 0.78, ag: 0.72, forma: 0 },
  presion:     { name: 'Presión alta', desc: 'Roba arriba, cansa más', for: 1.12, ag: 0.9, forma: -6 },
};
const ACTIVITIES = {
  entrenar: { name: 'Entrenar', desc: 'Sube una estadística a todo el equipo', forma: -12 },
  tecnicas: { name: 'Practicar técnicas', desc: 'Pueden aprender supertécnicas nuevas', forma: -8 },
  ojear:    { name: 'Ojear', desc: 'Busca joyas baratas por la ciudad', forma: 0 },
  descansar:{ name: 'Descansar', desc: 'Recupera la forma del equipo', forma: 35 },
};
const FACILITIES = {
  campo:     { name: 'Campo de entrenamiento', desc: '+1 extra en cada entrenamiento por nivel', cost: [300, 800, 1800] },
  ojeadores: { name: 'Red de ojeadores', desc: 'Más joyas al ojear y de mejor nivel', cost: [250, 650, 1500] },
  spa:       { name: 'Enfermería', desc: 'Descansar recupera más y los partidos cansan menos', cost: [200, 550, 1200] },
  estadio:   { name: 'Estadio', desc: '+25 % de taquilla por nivel', cost: [400, 1000, 2200] },
};
// Equipación y escudo
const KIT_COLORS = ['#e8c21a', '#f2f2f2', '#d8361a', '#1f4fc0', '#2f9a3a', '#ff7a1a', '#7a3ad8', '#222222', '#3fb6e8', '#ff8ac0', '#8a5a2a', '#0e2a6a'];
const CREST_SHAPES = ['escudo', 'circulo', 'rombo'];
const CREST_SYMBOLS = { rayo: '⚡', estrella: '★', balon: '⚽', llama: '🔥', hoja: '🍃', montana: '⛰', ola: '🌊', corona: '♛' };
const RARITY_MUL = { comun: 1, rara: 1.3, epica: 1.8, legendaria: 2.6 };

const cRnd = Math.random, pickR = a => a[Math.floor(cRnd() * a.length)];
const Career = {
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(CAREER_KEY) || 'null'); } catch (_) { this.data = null; }
    if (this.data && (this.data.v || 1) < 2) this.migrate();
    if (this.data) this.remapIds();
    return this.data;
  },
  // Personajes fusionados (versiones del 1, 2 y 3): se usa la ficha única en tu plantilla y en los clubes
  remapIds() {
    const c = this.data, M = GAME.idmap || {}, to = id => M[id] != null ? M[id] : id;
    const seen = new Set();
    c.squad = c.squad.filter(m => { m.id = to(m.id); if (seen.has(m.id)) return false; seen.add(m.id); return true; });
    if (c.lineup) c.lineup = c.lineup.map(to);
    for (const k in c.clubs || {}) c.clubs[k].forEach(p => { const n = to(p.id); if (n !== p.id) { p.id = n; delete p.file; delete p.row; } });
  },
  save() { if (this.data && this.data.devMoney) this.data.money = 9999999; try { localStorage.setItem(CAREER_KEY, JSON.stringify(this.data)); } catch (_) {} },
  clear() { this.archive(); this.data = null; try { localStorage.removeItem(CAREER_KEY); } catch (_) {} },
  // Salón de la fama: guarda un resumen de cada carrera terminada o abandonada
  hall() { try { return JSON.parse(localStorage.getItem(HOF_KEY) || '[]'); } catch (_) { return []; } },
  archive() {
    const c = this.data; if (!c || !c.history || !c.history.length || c.archived) return;
    const best = Math.min(...c.history.map(h => h.div));
    const top = c.squad.slice().sort((a, b) => b.goals - a.goals)[0];
    const rec = { school: c.school, manager: c.manager, crest: c.crest, seasons: c.history.length, titles: c.titles.map(t => t.name), best, goal: c.goal,
      closed: c.over === 'cerrado', date: Date.now(), scorer: top && top.goals ? [top.id, top.goals] : null, diff: c.diff || 'normal' };
    const h = this.hall(); h.unshift(rec); try { localStorage.setItem(HOF_KEY, JSON.stringify(h.slice(0, 30))); } catch (_) {}
    c.archived = true;
  },
  // Carrera de la fase 1 (divisiones de 8): se conserva el club y se rehace la temporada en curso
  migrate() {
    const c = this.data, d = this.divOf(YOU) || 3;
    c.v = 2; c.divs = JSON.parse(JSON.stringify(CAREER_START));
    if (d !== 3) c.divs[3].push(c.divs[d].pop());   // hace hueco en tu división
    c.divs[d].push(YOU);
    this.defaults(); this.newSeason(true); this.save();
    c.migrated = true;
  },
  defaults() {
    const c = this.data;
    c.clubs = c.clubs || {}; c.fac = c.fac || { campo: 0, ojeadores: 0, spa: 0, estadio: 0 };
    c.kit = c.kit || { a: '#e8c21a', b: '#1f4fc0' };
    c.crest = c.crest || { shape: 'escudo', c1: '#1f4fc0', c2: '#e8c21a', sym: 'rayo' };
    c.scout = c.scout || []; c.market = c.market || null; c.neg = c.neg || {}; c.news = c.news || [];
    const M = GAME.idmap || {};
    for (const k of [1, 2, 3]) for (const key of c.divs[k]) if (key !== YOU && !c.clubs[key]) c.clubs[key] = TEAM(key).players.map(p => M[p.id] != null ? { id: M[p.id], role: p.role } : { id: p.id, role: p.role, file: p.file, row: p.row });
  },

  /* ---------- Crear ---------- */
  create(manager, school, diff = 'normal') {
    const c = this.data = { v: 2, diff, manager, school: school || 'Instituto Inazuma', season: 1, week: 1, fame: 25, money: 300, forma: 100,
      squad: [], formation: '1-2-1-1', lineup: null, tactic: 'equilibrada', divs: JSON.parse(JSON.stringify(CAREER_START)),
      titles: [], history: [], over: null, goal: false, lastActivity: null, log: [] };
    c.divs[3].push(YOU);
    this.defaults();
    c.squad = this.startingSquad();
    this.autoLineup();
    this.newSeason(true);
    this.save();
    return c;
  },
  sumIE: p => STAT_KEYS.reduce((t, k) => t + p.ie[k], 0),
  // Jugadores que no están en ningún club ni en el tuyo (agentes libres)
  taken() {
    const c = this.data, s = new Set(c.squad.map(m => m.id));
    for (const k in c.clubs) c.clubs[k].forEach(p => s.add(p.id));
    return s;
  },
  freePool(filter) {
    const t = this.taken();
    return GAME.players.filter(p => p.gacha !== false && !p.abroad && !t.has(p.id) && (!filter || filter(p)));   // los de fuera del país van aparte
  },
  // Jugadores de selecciones extranjeras (Inazuma 3): «Fuera del país», fichables pagando un extra por el traspaso internacional
  abroadList(country) {
    const t = this.taken();
    return GAME.players.filter(p => p.abroad && p.cs && p.gacha !== false && !t.has(p.id) && (!country || p.abroad === country));
  },
  abroadPrice(id) { return Math.round(this.value(id) * 1.3 / 5) * 5; },
  // 7 chavales del montón: comunes flojos de cada puesto
  startingSquad() {
    const pool = this.freePool(p => p.rarity === 'comun' && p.id < 20000);
    const pick = (role, n) => {
      const c = pool.filter(p => p.role === role).sort((a, b) => this.sumIE(a) - this.sumIE(b));
      const band = c.slice(Math.floor(c.length * 0.6), Math.floor(c.length * 0.92)), out = [];   // chavales normalitos, pero capaces de competir en Tercera
      while (out.length < n && band.length) out.push(band.splice(Math.floor(cRnd() * band.length), 1)[0]);
      return out;
    };
    return [...pick('POR', 1), ...pick('DEF', 2), ...pick('MED', 2), ...pick('DEL', 2)].map((p, i) => this.member(p.id, 1 + (i % 3)));
  },
  member(id, year = 1, nTech = 1) {
    const pd = PLAYER(id);
    const moves = pd.moves.filter(([t]) => TECH(t)).map(([t]) => t).sort((a, b) => TECH(a).power - TECH(b).power);
    const known = moves.slice(0, nTech);
    const gk = keeperTech(pd, known); if (gk != null && !known.includes(gk)) known.unshift(gk);
    return { id, year, up: {}, known, games: 0, goals: 0 };
  },
  stat(m, k) { const pd = PLAYER(m.id); return Math.round(pd.ie[k] * (pd.rarity === 'legendaria' ? 1 : 0.78)) + (m.up[k] || 0); },
  ovr(m) { return Math.round(STAT_KEYS.reduce((t, k) => t + this.stat(m, k), 0) / STAT_KEYS.length); },
  m(id) { return this.data.squad.find(x => x.id === id); },
  // Nota de un jugador para un puesto
  rate(m, role) {
    const s = k => this.stat(m, k);
    const v = { POR: (s('defensa') + s('fisico')) / 2, DEF: (s('defensa') * 2 + s('fisico') + s('rapidez')) / 4,
      MED: (s('control') * 2 + s('tiro') + s('rapidez')) / 4, DEL: (s('tiro') * 2 + s('rapidez') + s('control')) / 4 }[role];
    return Math.round(v * (playsAs(PLAYER(m.id), role) ? 1 : role === 'POR' ? 0.7 : 0.85));   // un portero de verdad casi siempre es mejor bajo palos
  },
  autoLineup() {
    const c = this.data, roles = FORMATIONS[c.formation].roles, used = new Set(), out = roles.map(() => null);
    const order = roles.map((r, i) => i).sort((a, b) => (roles[a] === 'POR' ? -1 : 0) - (roles[b] === 'POR' ? -1 : 0));
    for (const i of order) {
      const free = c.squad.filter(m => !used.has(m.id)), gks = free.filter(m => playsAs(PLAYER(m.id), 'POR'));
      const best = (roles[i] === 'POR' && gks.length ? gks : free).sort((a, b) => this.rate(b, roles[i]) - this.rate(a, roles[i]))[0];   // la portería, solo para porteros
      if (best) { out[i] = best.id; used.add(best.id); }
    }
    c.lineup = out;
  },
  lineupOk() { const c = this.data; return c.lineup && c.lineup.length === 5 && c.lineup.every(id => id != null && this.m(id)) && new Set(c.lineup).size === 5; },
  formaMul() { return 0.85 + 0.15 * this.data.forma / 100; },
  myRating() {
    const c = this.data; if (!this.lineupOk()) this.autoLineup();
    const ms = c.lineup.map(id => this.m(id));
    return Math.round(ms.reduce((t, m) => t + (this.stat(m, 'tiro') + this.stat(m, 'control') + this.stat(m, 'defensa') + this.stat(m, 'fisico')) / 4, 0) / ms.length * this.formaMul());
  },

  /* ---------- Clubes rivales (con sus plantillas, que cambian al venderte jugadores) ---------- */
  aiFactor(key) {
    const c = this.data, champ = c.history.findIndex(h => h.champion && h.div === 1);
    return DIV_FACTOR[this.divOf(key)] * ((CAREER_DIFF[c.diff] || CAREER_DIFF.normal).mul) * (c.goal && champ >= 0 ? 1 + 0.03 * Math.min(10, c.history.length - champ - 1) : 1);   // en modo infinito los rivales mejoran
  },
  clubTeam(key, progress = 0.5) {
    const c = this.data, f = this.aiFactor(key);
    const nTech = 1 + Math.floor(Math.min(1, progress) * 2.99);
    const order = { POR: 0, DEF: 1, MED: 2, DEL: 3 };
    const mem = c.clubs[key].slice().sort((a, b) => order[a.role] - order[b.role]);
    const pos = layout(mem.map(m => m.role));
    return { name: TEAM(key).name, key, players: mem.map((m, i) => {
      const pd = PLAYER(m.id);
      let techs = pd.moves.slice().sort((a, b) => a[1] - b[1]).map(x => x[0]).filter(id => TECH(id)).slice(0, nTech);
      const sig = signatureTech(pd); if (sig != null && !techs.includes(sig)) techs[0] = sig;
      const gkt = keeperTech(pd, techs); if (gkt != null) techs.unshift(gkt);
      return Object.assign(buildMatchPlayer(m.id, m.role, k => Math.round(pd.ie[k] * f), techs, [], 5 + i, pos[i]),
        { sprite: m.file ? { file: m.file, row: m.row } : Sprites.refOf(pd) });
    }) };
  },
  matchDiff() {
    const L = ['facil', 'medio', 'dificil'], i = L.indexOf(DIV_DIFF[this.myDiv()]) + ((CAREER_DIFF[this.data.diff] || CAREER_DIFF.normal).shift);
    return L[Math.max(0, Math.min(2, i))];
  },
  divOf(key) { const d = this.data.divs; return +Object.keys(d).find(k => d[k].includes(key)); },
  myDiv() { return this.divOf(YOU); },
  teamName(key) { return key === YOU ? this.data.school : (TEAM(key) || { name: key }).name; },
  rating(key) {
    if (key === YOU) return this.myRating();
    const c = this.data; c.ratings = c.ratings || {};
    if (c.ratings[key] == null) {
      const t = this.clubTeam(key);
      c.ratings[key] = Math.round(t.players.reduce((s, p) => s + (p.kick + p.control + p.defense + p.body) / 4, 0) / t.players.length);
    }
    return c.ratings[key];
  },

  /* ---------- Temporada ---------- */
  // Liga a una vuelta (método del círculo): 9 jornadas de 5 partidos
  fixtures(teams) {
    const t = teams.slice().sort(() => cRnd() - 0.5), n = t.length, rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const ms = [];
      for (let i = 0; i < n / 2; i++) { const a = t[i], b = t[n - 1 - i]; ms.push(r % 2 ? [b, a] : [a, b]); }
      rounds.push(ms);
      t.splice(1, 0, t.pop());
    }
    return rounds;
  },
  newSeason(first) {
    const c = this.data;
    c.week = 1; c.ratings = {}; c.fix = {}; c.tables = {}; c.results = {}; c.po = null; c.market = null;
    for (const d of [1, 2, 3]) {
      c.fix[d] = this.fixtures(c.divs[d]);
      c.results[d] = c.fix[d].map(() => []);
      c.tables[d] = Object.fromEntries(c.divs[d].map(k => [k, { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 }]));
    }
    this.setupCup();
    if (!first) c.forma = Math.max(c.forma, 80);
  },
  // Copa Inazuma: los 30 equipos; los 2 mejores de Primera esperan en octavos
  setupCup() {
    const c = this.data, all = [1, 2, 3].flatMap(d => c.divs[d]);
    const byes = c.divs[1].filter(k => k !== YOU).sort((a, b) => this.rating(b) - this.rating(a)).slice(0, 2);
    const rest = all.filter(k => !byes.includes(k)).sort(() => cRnd() - 0.5);
    const ties = []; for (let i = 0; i < rest.length; i += 2) ties.push([rest[i], rest[i + 1]]);
    c.cup = { round: 0, ties, byes, rounds: [], winner: null, out: false };
  },
  cupTie() { const c = this.data; return c.cup && !c.cup.out && !c.cup.winner ? c.cup.ties.find(p => p.includes(YOU)) : null; },
  weekType(w = this.data.week) { return SCHED[w]; },
  jornadaOf(week) { const i = LEAGUE_WEEKS.indexOf(week); return i < 0 ? null : i; },
  // Tu partido de esta semana (o null si no juegas)
  nextMatch() {
    const c = this.data, t = this.weekType(), d = this.myDiv();
    if (t === 'L') {
      const j = this.jornadaOf(c.week), m = c.fix[d][j].find(p => p.includes(YOU));
      return { type: 'liga', j, rival: m[0] === YOU ? m[1] : m[0], home: m[0] === YOU };
    }
    if (t === 'C' && c.cup && c.cup.round === CUP_WEEKS.indexOf(c.week)) {
      const m = this.cupTie();
      if (m) return { type: 'copa', round: c.cup.round, rival: m[0] === YOU ? m[1] : m[0], home: m[0] === YOU, ko: true };
    }
    if ((t === 'P1' || t === 'P2') && c.po && c.po[d]) {
      const P = c.po[d], list = t === 'P1' ? P.semis : (P.final ? [P.final] : []);
      const m = list.find(p => p.includes(YOU));
      if (m) return { type: t === 'P1' ? 'semi' : 'final', rival: m[0] === YOU ? m[1] : m[0], home: m[0] === YOU, ko: true };
    }
    return null;
  },
  standings(d) {
    const T = this.data.tables[d];
    return Object.entries(T).map(([k, r]) => Object.assign({ key: k }, r))
      .sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf || this.teamName(a.key).localeCompare(this.teamName(b.key)));
  },
  myPos() { return this.standings(this.myDiv()).findIndex(r => r.key === YOU) + 1; },
  // Playoff de ascenso en Segunda y Tercera: 3º-6º (semis 3-6 y 4-5 en casa del mejor; final en casa del mejor clasificado)
  setupPlayoffs() {
    const c = this.data; c.po = {};
    for (const d of [2, 3]) { const s = this.standings(d).map(r => r.key); c.po[d] = { semis: [[s[2], s[5]], [s[3], s[4]]], res: [], final: null, finalRes: null, winner: null, seed: s }; }
  },

  /* ---------- Simulación ---------- */
  poisson(l) { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= cRnd(); } while (p > L); return k - 1; },
  simScore(rA, rB, tA = TACTICS.equilibrada, tB = TACTICS.equilibrada, scale = 12) {
    const lam = (x, y, tf, ta) => Math.max(0.15, Math.min(4.5, 1.35 * Math.exp((x - y) / scale) * tf.for * ta.ag));
    return [this.poisson(lam(rA, rB, tA, tB)), this.poisson(lam(rB, rA, tB, tA))];
  },
  // Tanda de penaltis: gana el mejor más a menudo
  penalties(rA, rB) {
    const pA = Math.max(0.3, Math.min(0.7, 0.5 + (rA - rB) / 100)), aWins = cRnd() < pA;
    const lo = 2 + Math.floor(cRnd() * 3), hi = lo + 1 + (cRnd() < 0.3 ? 1 : 0);
    return aWins ? [hi, lo] : [lo, hi];
  },
  // Partido simulado como mánager: marcador y crónica minuto a minuto
  simulateMine(tacticKey) {
    const c = this.data, nm = this.nextMatch(), tac = TACTICS[tacticKey] || TACTICS.equilibrada;
    const rival = this.clubTeam(nm.rival, Math.min(1, c.season / 3));
    let [gA, gB] = this.simScore(this.myRating() + (nm.home ? 1.5 : 0), this.rating(nm.rival) + (nm.home ? 0 : 1.5), tac);
    const mine = c.lineup.map(id => this.m(id)), ev = [];
    const pickScorer = list => {
      const w = list.map(p => (p.role === 'DEL' ? 2.2 : p.role === 'MED' ? 1.2 : p.role === 'DEF' ? 0.4 : 0.02) * (p.kick || 50));
      let r = cRnd() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; } return list[0];
    };
    const myPlayers = mine.map((m, i) => ({ name: PLAYER(m.id).name, role: FORMATIONS[c.formation].roles[i], kick: this.stat(m, 'tiro'), id: m.id,
      techs: m.known.map(TECH).filter(t => t && t.type === 'tiro') }));
    const rvPlayers = rival.players.map(p => ({ name: p.name, role: p.role, kick: p.kick, techs: p.techs.filter(t => t.type === 'tiro') }));
    const goal = (team, list) => { const p = pickScorer(list); const t = p.techs.length && cRnd() < 0.55 ? pickR(p.techs) : null; return { team, type: 'goal', name: p.name, tech: t && t.name, id: p.id }; };
    for (let i = 0; i < gA; i++) ev.push(goal('A', myPlayers));
    for (let i = 0; i < gB; i++) ev.push(goal('B', rvPlayers));
    const gkA = myPlayers.find(p => p.role === 'POR'), gkB = rival.players.find(p => p.role === 'POR');
    const nSaves = 2 + Math.floor(cRnd() * 4);
    for (let i = 0; i < nSaves; i++) { const mineSave = cRnd() < 0.5; ev.push({ team: mineSave ? 'A' : 'B', type: 'save', name: mineSave ? gkA && gkA.name : gkB && gkB.name }); }
    ev.forEach(e => { e.min = 1 + Math.floor(cRnd() * 89); });
    ev.sort((a, b) => a.min - b.min);
    let pens = null;
    if (nm.ko && gA === gB) { pens = this.penalties(this.myRating(), this.rating(nm.rival)); ev.push({ type: 'pens', min: 90, a: pens[0], b: pens[1] }); }
    return { gA, gB, pens, events: ev, rival: nm.rival, forma: tac.forma };
  },

  /* ---------- Semana ---------- */
  doActivity(act, statKey) {
    const c = this.data, A = ACTIVITIES[act]; if (!A) return null;
    let msg = '';
    if (act === 'entrenar') {
      const k = STAT_KEYS.includes(statKey) ? statKey : 'tiro', n = 2 + c.fac.campo;
      c.squad.forEach(m => { m.up[k] = (m.up[k] || 0) + n; });
      const lucky = pickR(c.squad), k2 = pickR(STAT_KEYS); lucky.up[k2] = (lucky.up[k2] || 0) + 1;
      msg = `Entrenamiento de ${STAT_LABEL[k]}: +${n} a todo el equipo. ${PLAYER(lucky.id).name} destaca (+1 ${STAT_LABEL[k2]}).`;
    } else if (act === 'tecnicas') {
      const learned = [];
      c.squad.forEach(m => {
        const pd = PLAYER(m.id);
        const next = pd.moves.filter(([t]) => TECH(t) && !m.known.includes(t)).map(([t]) => t).sort((a, b) => TECH(a).power - TECH(b).power)[0];
        if (next != null && cRnd() < 0.45) { m.known.push(next); learned.push(pd.name.split(' ')[0] + ': ' + TECH(next).name); }
        m.up.control = (m.up.control || 0) + 1;
      });
      msg = learned.length ? '¡Supertécnicas nuevas! ' + learned.join(' · ') : 'Nadie ha aprendido nada nuevo esta vez, pero todos mejoran el control (+1).';
    } else if (act === 'ojear') {
      const n = 3 + (c.fac.ojeadores >= 2 ? 1 : 0), lvl = c.fac.ojeadores;
      const want = { comun: 1, rara: 0.6 + lvl * 0.25, epica: 0.12 + lvl * 0.12, legendaria: lvl >= 3 ? 0.03 : 0 };
      const pool = this.freePool(p => want[p.rarity] > 0);
      const found = [];
      for (let i = 0; i < 60 && found.length < n; i++) {
        const p = pickR(pool); if (!p || found.includes(p.id) || cRnd() > want[p.rarity]) continue;
        found.push(p.id);
      }
      c.scout = found.map(id => ({ id, price: Math.round(this.value(id) * 0.55), until: c.week + 3 }));
      msg = `Tus ojeadores han encontrado ${found.length} jugadores. Míralos en Fichajes → Ojeados (baratos, pero solo durante 3 semanas).`;
    } else if (act === 'descansar') msg = 'El equipo descansa y recupera la forma.';
    const fm = act === 'descansar' ? A.forma + c.fac.spa * 8 : A.forma;
    c.forma = Math.max(10, Math.min(100, c.forma + fm));
    c.lastActivity = act;
    this.save();
    return msg;
  },
  // Juega/resuelve los partidos de la semana. mine = { gA, gB, pens } si jugabas
  resolveWeek(mine, extraForma = 0, scorers = []) {
    const c = this.data, t = this.weekType(), d = this.myDiv(), nm = mine ? this.nextMatch() : null;
    const out = { type: t, results: {}, fame: 0, money: 0 };
    if (nm) Object.assign(out, { gA: mine.gA, gB: mine.gB, pens: mine.pens || null, rival: nm.rival, kind: nm.type });
    const pair = (a, b, home = 1.5, scale = 12) => {
      if (a === YOU) return [mine.gA, mine.gB, mine.pens];
      if (b === YOU) return [mine.gB, mine.gA, mine.pens && [mine.pens[1], mine.pens[0]]];
      const [ga, gb] = this.simScore(this.rating(a) + home, this.rating(b), undefined, undefined, scale);
      return [ga, gb, null];
    };
    if (t === 'L') {
      const j = this.jornadaOf(c.week);
      for (const dv of [1, 2, 3]) {
        out.results[dv] = [];
        for (const [a, b] of c.fix[dv][j]) {
          const [ga, gb] = pair(a, b), T = c.tables[dv], A = T[a], B = T[b];
          A.pj++; B.pj++; A.gf += ga; A.gc += gb; B.gf += gb; B.gc += ga;
          if (ga > gb) { A.g++; B.p++; A.pts += 3; } else if (ga < gb) { B.g++; A.p++; B.pts += 3; } else { A.e++; B.e++; A.pts++; B.pts++; }
          c.results[dv][j].push([a, b, ga, gb]); out.results[dv].push([a, b, ga, gb]);
        }
      }
    } else if (t === 'C' && c.cup && !c.cup.winner && c.cup.round === CUP_WEEKS.indexOf(c.week)) {
      const C = c.cup, res = C.ties.map(([a, b]) => {
        let [ga, gb, pens] = pair(a, b, 1, 20);   // en la Copa hay más sorpresas
        if (ga === gb && !pens) pens = this.penalties(this.rating(a), this.rating(b));
        return [a, b, ga, gb, pens, ga > gb || (ga === gb && pens[0] > pens[1]) ? a : b];
      });
      C.rounds.push(res); out.results.cup = res; out.cupRound = C.round;
      const win = res.map(r => r[5]).concat(C.round === 0 ? C.byes : []);
      if (!win.includes(YOU) && (C.ties.some(p => p.includes(YOU)))) C.out = true;
      if (win.length === 1) { C.winner = win[0]; out.cupWinner = win[0]; if (win[0] === YOU) c.titles.push({ season: c.season, name: 'Copa Inazuma' }); }
      else { const w = win.sort(() => cRnd() - 0.5); C.ties = []; for (let i = 0; i < w.length; i += 2) C.ties.push([w[i], w[i + 1]]); }
      C.round++;
    } else if ((t === 'P1' || t === 'P2') && c.po) {
      for (const dv of [2, 3]) {
        const P = c.po[dv]; out.results[dv] = [];
        const play = ([a, b]) => {
          let [ga, gb, pens] = pair(a, b, 1.5);
          if (ga === gb && !pens) pens = this.penalties(this.rating(a), this.rating(b));
          const w = ga > gb || (ga === gb && pens[0] > pens[1]) ? a : b;
          const r = [a, b, ga, gb, pens, w]; out.results[dv].push(r); return r;
        };
        if (t === 'P1') { P.res = P.semis.map(play); P.final = [P.res[0][5], P.res[1][5]].sort((x, y) => P.seed.indexOf(x) - P.seed.indexOf(y)); }
        else { P.finalRes = play(P.final); P.winner = P.finalRes[5]; }
      }
    }
    if (nm) {
      const won = mine.gA > mine.gB || (mine.gA === mine.gB && mine.pens && mine.pens[0] > mine.pens[1]);
      const draw = mine.gA === mine.gB && !mine.pens;
      const tk = DIV_TICKET[d] * (1 + c.fame / 120) * (1 + 0.25 * c.fac.estadio) * (nm.ko ? 1.6 : 1) * (nm.type === 'copa' ? 1 + nm.round * 0.35 : 1);
      out.fame = won ? (nm.ko ? 7 : 5) : draw ? 1 : (nm.type === 'copa' ? -1 : nm.ko ? -2 : -4);
      if (out.cupWinner === YOU) { out.fame += 12; out.money += DIV_PRIZE[1]; out.tickets = 10; Profile.data.tickets += 10; Profile.save(); }
      out.money += Math.round(won ? tk : draw ? tk * 0.5 : tk * 0.25);
      c.fame = Math.max(0, Math.min(100, c.fame + out.fame)); c.money += out.money;
      c.forma = Math.max(10, c.forma - Math.max(4, 10 - c.fac.spa * 2) + extraForma);
      // Rendimiento: los titulares suben o bajan según el resultado, sus goles y (porteros) los goles recibidos
      const roles = FORMATIONS[c.formation].roles, GROW = { POR: ['defensa', 'fisico'], DEF: ['defensa', 'fisico', 'rapidez'], MED: ['control', 'rapidez', 'tiro'], DEL: ['tiro', 'rapidez', 'control'] };
      const goalsBy = {}; scorers.forEach(id => { goalsBy[id] = (goalsBy[id] || 0) + 1; const m = this.m(id); if (m) m.goals++; });
      out.prog = [];
      c.lineup.forEach((id, i) => {
        const m = this.m(id); if (!m) return; m.games++;
        let sc = (won ? 1 : draw ? 0 : -1) + 0.6 * (goalsBy[id] || 0);
        if (roles[i] === 'POR') sc += mine.gB === 0 ? 0.7 : mine.gB >= 3 ? -0.7 : 0;
        if (sc > 0 && cRnd() < Math.min(0.9, 0.4 + 0.18 * sc)) {
          const k = (goalsBy[id] && cRnd() < 0.6) ? 'tiro' : pickR(GROW[roles[i]] || STAT_KEYS);
          m.up[k] = (m.up[k] || 0) + 1; out.prog.push({ id, k, d: 1 });
        } else if (sc < 0 && cRnd() < 0.35) {
          const k = pickR(STAT_KEYS); if ((m.up[k] || 0) > -8) { m.up[k] = (m.up[k] || 0) - 1; out.prog.push({ id, k, d: -1 }); }
        }
      });
      c.log.unshift({ s: c.season, w: c.week, txt: `${this.teamName(YOU)} ${mine.gA}-${mine.gB} ${this.teamName(nm.rival)}` }); c.log.length = Math.min(c.log.length, 30);
      // Fichar al vencido: a veces un jugador del rival quiere venirse contigo
      if (won && c.squad.length < SQUAD_MAX && cRnd() < 0.4 + c.fame / 400) {
        const club = c.clubs[nm.rival], best = club.slice().sort((a, b) => this.sumIE(PLAYER(b.id)) - this.sumIE(PLAYER(a.id)))[0];
        const cand = club.filter(p => p !== best && this.buyable(p.id));
        if (cand.length) { const p = pickR(cand); out.vencido = { key: nm.rival, id: p.id, price: Math.round(this.value(p.id, nm.rival) * 0.6) }; c.vencido = out.vencido; }
      }
      if (c.fame <= 0 && c.season > 1) { c.over = 'cerrado'; this.archive(); }
      if (c.season === 1) c.fame = Math.max(1, c.fame);   // la primera temporada el director da margen
    }
    this.save();
    return out;
  },
  finishMatch(gA, gB, pens, extraForma = 0, scorers = []) { return this.resolveWeek({ gA, gB, pens }, extraForma, scorers); },
  // Pasa a la semana siguiente; al acabar la última cierra la temporada
  advance() {
    const c = this.data;
    // Semanas con partidos en los que no juegas (playoffs ajenos): se simulan al pasar
    const t = this.weekType();
    if ((t === 'P1' || t === 'P2') && c.po && !this.nextMatch() && !c.poDone) this.resolveWeek(null);
    if (t === 'C' && c.cup && !this.nextMatch() && c.cup.round === CUP_WEEKS.indexOf(c.week)) { const r = this.resolveWeek(null); c.lastCup = r.results.cup || null; }
    c.poDone = false;
    c.vencido = null;
    // Ingresos semanales por patrocinio
    c.money += Math.round((8 + c.fame * 0.5) * DIV_SPONSOR[this.myDiv()]);
    c.scout = (c.scout || []).filter(s => s.until > c.week + 1);
    if (c.week < WEEKS) {
      c.week++;
      if (this.weekType() === 'P1' && !c.po) this.setupPlayoffs();
      this.save(); return null;
    }
    return this.endSeason();
  },
  endSeason() {
    const c = this.data, d = this.myDiv(), sum = { season: c.season, div: d, pos: this.myPos(), moves: [], fame: 0, money: 0, champion: false };
    const table = {}; for (const k of [1, 2, 3]) table[k] = this.standings(k).map(r => r.key);
    if (!c.po) { this.setupPlayoffs(); c.week = 15; this.resolveWeek(null); c.week = 16; this.resolveWeek(null); }
    const poW = { 2: c.po[2].winner, 3: c.po[3].winner };
    const up2 = [...table[2].slice(0, 2), poW[2]], up3 = [...table[3].slice(0, 2), poW[3]];
    const down1 = table[1].slice(-3), down2 = table[2].slice(-3);
    const pos = sum.pos;
    if (pos === 1) { sum.champion = true; c.titles.push({ season: c.season, name: 'Liga ' + DIV_NAME[d] }); sum.fame += 15; sum.money += DIV_PRIZE[d]; }
    else sum.money += Math.round(DIV_PRIZE[d] * Math.max(0.08, (11 - pos) / 20));
    sum.cupWinner = c.cup && c.cup.winner;
    if (d === 1 && pos === 1 && !c.goal) { c.goal = true; sum.goal = true; }
    if (d > 1 && up2.concat(up3).includes(YOU)) { sum.moves.push('up'); sum.fame += 10; if (poW[d] === YOU) { sum.playoff = true; c.titles.push({ season: c.season, name: 'Playoff de ascenso' }); } }
    if (d < 3 && (d === 1 ? down1 : down2).includes(YOU)) { sum.moves.push('down'); sum.fame -= 15; }
    if (d === 3 && pos >= 8) { sum.fame -= c.season === 1 ? 4 : 12; sum.warning = true; }   // el primer año, el director es comprensivo
    c.divs[1] = c.divs[1].filter(k => !down1.includes(k)).concat(up2);
    c.divs[2] = c.divs[2].filter(k => !up2.includes(k) && !down2.includes(k)).concat(down1, up3);
    c.divs[3] = c.divs[3].filter(k => !up3.includes(k)).concat(down2);
    sum.table = table[d]; sum.po = c.po[d] || null;
    sum.promoted = { 1: up2, 2: up3 }; sum.relegated = { 1: down1, 2: down2 };
    c.fame = Math.max(c.season === 1 ? 10 : 0, Math.min(100, c.fame + sum.fame)); c.money += sum.money;   // tras el primer año, al menos 10 de fama
    c.history.push({ season: c.season, div: d, pos, champion: sum.champion, up: sum.moves.includes('up'), down: sum.moves.includes('down'), cup: sum.cupWinner === YOU, cupRound: c.cup ? c.cup.rounds.length : 0 });
    // Premios para el gacha: tickets por cada logro de la temporada
    sum.tickets = (sum.champion ? 10 : 0) + (sum.moves.includes('up') ? 5 : 0) + (sum.goal ? 20 : 0);
    if (sum.tickets) { Profile.data.tickets += sum.tickets; Profile.save(); }
    // Graduaciones (los de 6º se van) y cantera (llegan juveniles)
    sum.grads = c.squad.filter(m => m.year >= LAST_YEAR).map(m => m.id);
    c.squad = c.squad.filter(m => m.year < LAST_YEAR);
    c.squad.forEach(m => { m.year++; STAT_KEYS.forEach(k => { m.up[k] = (m.up[k] || 0) + YEAR_GROWTH; }); });   // un año más de experiencia
    sum.growth = YEAR_GROWTH;
    // Cantera: siempre llegan al menos 2; si no caben, el jugador elige a quién deja ir (c.pendingYouth)
    const youth = this.youth(Math.max(2, SQUAD_MIN - c.squad.length));
    sum.youth = youth.map(m => m.id);
    const room = Math.max(0, SQUAD_MAX - c.squad.length);
    c.squad.push(...youth.slice(0, room));
    c.pendingYouth = youth.slice(room);
    sum.pendingYouth = c.pendingYouth.map(m => m.id);
    // Los clubes rivales reponen jugadores que les falten
    for (const k in c.clubs) while (c.clubs[k].length < 5) c.clubs[k].push(this.replacement(c.clubs[k][0] ? 'MED' : 'POR', 50));
    if (sum.season % 3 === 0 && !(c.fame <= 0 && c.history.length > 1)) { c.wc = this.wcCreate(sum.season); sum.wc = true; }   // cada 3 temporadas: Mundial
    c.season++;
    if (c.fame <= 0 && c.history.length > 1) { c.over = 'cerrado'; this.archive(); }
    c.fame = Math.max(c.fame, c.over ? 0 : 1);
    this.autoLineup();
    this.newSeason(false);
    this.save();
    return sum;
  },
  // Juveniles de la cantera: comunes de 1º curso (mejores con más fama)
  youth(n) {
    const pool = this.freePool(p => p.rarity === 'comun' || (p.rarity === 'rara' && cRnd() < this.data.fame / 300));
    const out = [];
    const roles = ['POR', 'DEF', 'MED', 'DEL'];
    const have = r => this.data.squad.filter(m => PLAYER(m.id).role === r).length + out.filter(m => PLAYER(m.id).role === r).length;
    for (let i = 0; i < n; i++) {
      const need = roles.find(r => have(r) < (r === 'POR' ? 1 : 2)) || pickR(roles);
      const p = pickR(pool.filter(q => q.role === need && !out.some(m => m.id === q.id)));
      if (p) out.push(this.member(p.id, 1));
    }
    return out;
  },

  // Juvenil que no cabe: entra si dejas ir a alguien de la plantilla (releaseId), o se va (releaseId = null)
  resolveYouth(youthId, releaseId) {
    const c = this.data, i = (c.pendingYouth || []).findIndex(m => m.id === youthId); if (i < 0) return { ok: false };
    const kid = c.pendingYouth.splice(i, 1)[0];
    if (releaseId == null) { this.save(); return { ok: true, msg: PLAYER(kid.id).name + ' se va a otro instituto.' }; }
    const out = c.squad.find(m => m.id === releaseId); if (!out) { c.pendingYouth.splice(i, 0, kid); return { ok: false }; }
    c.squad = c.squad.filter(m => m !== out); c.squad.push(kid);
    if (c.lineup.includes(releaseId)) this.autoLineup();   // solo se recoloca si se iba un titular
    c.news.unshift(`T${c.season}: ${PLAYER(out.id).name} deja el club y entra ${PLAYER(kid.id).name} de la cantera`); c.news.length = Math.min(c.news.length, 20);
    this.save(); return { ok: true, msg: PLAYER(kid.id).name + ' entra en la plantilla.' };
  },

  /* ---------- Fichajes ---------- */
  // Valor de mercado: nivel, rareza y división del club que lo tiene
  value(id, clubKey) {
    const pd = PLAYER(id), ovr = this.sumIE(pd) / STAT_KEYS.length * 0.78;
    const base = 15 + Math.pow(Math.max(0, ovr - 30), 2) * 0.9;
    const dv = clubKey ? this.divOf(clubKey) : 0;
    return Math.round(base * (RARITY_MUL[pd.rarity] || 1) * ({ 1: 1.4, 2: 1.15, 3: 1, 0: 0.8 }[dv] || 1) / 5) * 5;
  },
  // ¿Tiene sprite de colección? (algunos jugadores del 2 solo existen como rivales)
  buyable(id) { const pd = PLAYER(id); return !!(pd && pd.cs && pd.gacha !== false); },
  // Mercado de la semana: agentes libres y jugadores de otros clubes
  marketList() {
    const c = this.data;
    if (!c.market || c.market.week !== c.week || c.market.season !== c.season) {
      const free = this.freePool(p => p.rarity !== 'legendaria');
      const libres = [];
      // De vez en cuando, un agente libre destacado (más probable con más fama): épico o uno de los mejores raros
      let star = null;
      const r = cRnd(), pEpic = 0.15 + c.fame / 400, pRare = 0.35;
      const best = list => list.sort((a, b) => this.sumIE(b) - this.sumIE(a)).slice(0, Math.max(1, Math.ceil(list.length * 0.3)));
      if (r < pEpic) star = pickR(free.filter(p => p.rarity === 'epica'));
      else if (r < pEpic + pRare) star = pickR(best(free.filter(p => p.rarity === 'rara')));
      if (star) libres.push(star.id);
      for (let i = 0; i < 80 && libres.length < 8; i++) { const p = pickR(free); if (p && !libres.includes(p.id) && (p.rarity === 'comun' || cRnd() < 0.5)) libres.push(p.id); }
      c.market = { week: c.week, season: c.season, libres, star: star ? star.id : null };
      this.save();
    }
    return c.market;
  },
  clubPlayers(div) {
    const c = this.data, out = [];
    for (const key of c.divs[div]) if (key !== YOU) {
      const best = c.clubs[key].slice().sort((a, b) => this.sumIE(PLAYER(b.id)) - this.sumIE(PLAYER(a.id)))[0];
      c.clubs[key].forEach(p => { if (this.buyable(p.id)) out.push({ key, id: p.id, star: p === best }); });
    }
    return out;
  },
  canSign() {
    const c = this.data;
    if (c.squad.length >= SQUAD_MAX) return 'Tu plantilla está llena (máximo ' + SQUAD_MAX + '). Vende o libera a alguien.';
    return null;
  },
  sign(id, price, from) {
    const c = this.data, err = this.canSign(); if (err) return { ok: false, msg: err };
    if (c.money < price) return { ok: false, msg: 'No tienes dinero suficiente.' };
    c.money -= price;
    const pd = PLAYER(id), fromClub = from && c.clubs[from];
    const year = 1 + Math.floor(cRnd() * (LAST_YEAR - 1));   // nunca llega alguien a punto de irse
    c.squad.push(this.member(id, year, fromClub ? 2 : 1));
    if (fromClub) {   // el club rival rellena el hueco con otro jugador del mismo puesto (algo peor)
      const i = fromClub.findIndex(p => p.id === id), role = fromClub[i].role;
      fromClub[i] = this.replacement(role, this.sumIE(pd) / STAT_KEYS.length * 0.9);
      delete c.ratings[from];
    }
    c.scout = (c.scout || []).filter(s => s.id !== id);
    if (c.market) c.market.libres = c.market.libres.filter(x => x !== id);
    c.news.unshift(`T${c.season} S${c.week}: fichaje de ${pd.name} por ${price} 💰${from ? ' (' + this.teamName(from) + ')' : ''}`); c.news.length = Math.min(c.news.length, 20);
    this.save();
    return { ok: true, msg: `¡${pd.name} ficha por ${c.school}! (${year}º curso)` };
  },
  replacement(role, maxAvg) {
    const pool = this.freePool(p => p.role === role && this.sumIE(p) / STAT_KEYS.length <= maxAvg);
    const p = pickR(pool.length ? pool : this.freePool(p => p.role === role));
    return { id: p.id, role };
  },
  // Negociación con un club: acepta, rechaza o contraoferta
  offer(key, id, amount) {
    const c = this.data, k = key + ':' + id, N = c.neg[k] = c.neg[k] && c.neg[k].week === c.week ? c.neg[k] : { week: c.week, tries: 0, closed: false, counter: null };
    if (N.closed) return { res: 'closed', msg: `${this.teamName(key)} no quiere seguir negociando esta semana.` };
    const club = c.clubs[key], best = club.slice().sort((a, b) => this.sumIE(PLAYER(b.id)) - this.sumIE(PLAYER(a.id)))[0];
    let ask = this.value(id, key);
    if (best && best.id === id) ask *= 1.5;                           // su estrella cuesta más
    const gap = this.divOf(key) - this.myDiv(); if (gap < 0) ask *= 1 + 0.25 * -gap;   // un club de más arriba no vende barato a uno de abajo
    ask *= 1.1 - c.fame / 500;                                        // la fama ayuda
    ask = Math.round(ask / 5) * 5;
    N.tries++;
    if (N.counter && amount >= N.counter) { this.save(); return { res: 'accept', price: amount }; }
    if (amount >= ask) { this.save(); return { res: 'accept', price: amount }; }
    if (amount >= ask * 0.8 && N.tries < 3) {
      N.counter = Math.round((ask * (1 + cRnd() * 0.08)) / 5) * 5;
      this.save(); return { res: 'counter', price: N.counter, msg: `${this.teamName(key)} pide ${N.counter} 💰.` };
    }
    if (N.tries >= 3) N.closed = true;
    this.save();
    return { res: 'reject', msg: N.closed ? `${this.teamName(key)} se cansa y cierra la negociación hasta la semana que viene.` : `${this.teamName(key)} rechaza la oferta: es demasiado poco.` };
  },
  // Vender: un club de la liga paga el 70 % de su valor
  sell(id) {
    const c = this.data;
    if (c.squad.length <= SQUAD_MIN) return { ok: false, msg: `Necesitas al menos ${SQUAD_MIN} jugadores.` };
    const pd = PLAYER(id), price = Math.round(this.value(id) * 0.7 / 5) * 5;
    const buyers = Object.keys(c.clubs).filter(k => c.divs[this.myDiv()].includes(k) || c.divs[Math.max(1, this.myDiv() - 1)].includes(k));
    const buyer = pickR(buyers);
    c.squad = c.squad.filter(m => m.id !== id); c.money += price;
    if (c.lineup.includes(id)) this.autoLineup();
    c.news.unshift(`T${c.season} S${c.week}: ${pd.name} vendido al ${this.teamName(buyer)} por ${price} 💰`);
    this.save();
    return { ok: true, msg: `${pd.name} se va al ${this.teamName(buyer)} por ${price} 💰.` };
  },
  release(id) {
    const c = this.data;
    if (c.squad.length <= SQUAD_MIN) return { ok: false, msg: `Necesitas al menos ${SQUAD_MIN} jugadores.` };
    c.squad = c.squad.filter(m => m.id !== id); if (c.lineup.includes(id)) this.autoLineup(); this.save();
    return { ok: true, msg: `${PLAYER(id).name} deja el club.` };
  },
  upgrade(k) {
    const c = this.data, F = FACILITIES[k], lv = c.fac[k];
    if (lv >= F.cost.length) return { ok: false, msg: 'Ya está al máximo.' };
    if (c.money < F.cost[lv]) return { ok: false, msg: 'No tienes dinero suficiente.' };
    c.money -= F.cost[lv]; c.fac[k]++; this.save();
    return { ok: true, msg: `${F.name}: nivel ${c.fac[k]}.` };
  },

  // Equipos para jugar tu partido de la semana
  /* ---------- Técnicas equipadas: el jugador elige entre las que aprende (su lista del juego) ---------- */
  learnset(id) { const pd = PLAYER(id); return [...new Set(pd.moves.map(x => x[0]).filter(t => TECH(t)))]; },
  equipped(m) {
    const ok = new Set(this.learnset(m.id).concat(m.known));
    if (m.equip && m.equip.length && m.equip.every(t => ok.has(t))) return m.equip.slice(0, TECH_SLOTS);
    return m.known.slice().sort((a, b) => TECH(b).power - TECH(a).power).slice(0, TECH_SLOTS);
  },
  toggleEquip(id, t) {
    const m = this.m(id); if (!m) return;
    let e = (m.equip && m.equip.length ? m.equip : this.equipped(m)).slice();
    if (e.includes(t)) e = e.filter(x => x !== t); else { if (e.length >= TECH_SLOTS) e.shift(); e.push(t); }
    m.equip = e; this.save();
  },
  /* ---------- Modo desarrollador ---------- */
  // Ocupar el sitio de otro club: su división, su nombre y sus jugadores (ellos se quedan con tu plantilla); la temporada empieza de nuevo
  devTakeClub(key) {
    const c = this.data, d = this.divOf(key), myd = this.myDiv(), old = c.squad.map(m => ({ id: m.id, role: PLAYER(m.id).role }));
    c.divs[myd] = c.divs[myd].map(k => k === YOU ? key : k); c.divs[d] = c.divs[d].map(k => k === key ? YOU : k);
    c.squad = c.clubs[key].map(m => this.member(m.id, 2, 2));
    c.clubs[key] = old.slice(0, 7);
    c.school = TEAM(key).name; c.lineup = null; this.autoLineup(); this.newSeason(false); this.save();
  },
  devToDiv(d) {
    const c = this.data, myd = this.myDiv(); if (d === myd) return;
    const other = c.divs[d].slice().sort((a, b) => this.rating(a) - this.rating(b))[0];
    c.divs[myd] = c.divs[myd].map(k => k === YOU ? other : k); c.divs[d] = c.divs[d].map(k => k === other ? YOU : k);
    this.newSeason(false); this.save();
  },
  devSign(id) { const c = this.data; if (c.squad.some(m => m.id === id)) return false; c.squad.push(this.member(id, 1, 2)); this.save(); return true; },
  devEndSeason() {
    const c = this.data; let sum = null, guard = 0;
    while (!sum && !c.over && guard++ < 40) { if (this.nextMatch()) { const r = this.simulateMine(c.tactic); this.finishMatch(r.gA, r.gB, r.pens, r.forma); } if (!c.over) sum = this.advance(); }
    return sum;
  },
  /* ---------- Mundial (cada 3 temporadas): eres el seleccionador de Inazuma Japón ---------- */
  wcCreate(season) { return { season, state: 'call', squad: [], group: null, round: 0, opp: null, log: [] }; },
  wcStat(id, k) {             // jugadores de tu club: con su entrenamiento; convocados de otros clubes: su nivel actual
    const m = this.m(id), pd = PLAYER(id);
    return m ? this.stat(m, k) : Math.round(pd.ie[k] * 0.85);
  },
  wcScore(id) { return Math.round(STAT_KEYS.reduce((t, k) => t + this.wcStat(id, k), 0) / STAT_KEYS.length); },
  // Convocables: toda tu plantilla y los mejores de las ligas (más fácil cuanto mejor ha ido su temporada)
  wcCandidates() {
    const c = this.data, out = c.squad.map(m => ({ id: m.id, club: YOU, score: this.wcScore(m.id) }));
    const seen = new Set(out.map(x => x.id)), others = [];
    for (const key in c.clubs) for (const m of c.clubs[key]) if (!seen.has(m.id) && PLAYER(m.id) && PLAYER(m.id).cs) {
      seen.add(m.id);
      const d = this.divOf(key), pos = this.standings(d).findIndex(r => r.key === key);
      others.push({ id: m.id, club: key, score: this.wcScore(m.id) + (3 - d) * 2 + (pos >= 0 && pos < 3 ? 2 : 0) });
    }
    others.sort((a, b) => b.score - a.score);
    return out.concat(others.slice(0, 24));
  },
  wcRoles(ids) {               // coloca a los 5 en los puestos de tu formación
    const roles = FORMATIONS[this.data.formation].roles, used = new Set(), out = roles.map(() => null);
    const rr = (id, r) => { const s = k => this.wcStat(id, k), v = r === 'POR' ? (s('defensa') + s('fisico')) / 2 : r === 'DEF' ? (s('defensa') * 2 + s('fisico') + s('rapidez')) / 4 : r === 'MED' ? (s('control') * 2 + s('tiro') + s('rapidez')) / 4 : (s('tiro') * 2 + s('rapidez') + s('control')) / 4; return v * (playsAs(PLAYER(id), r) ? 1 : 0.85); };
    roles.map((r, i) => i).sort((a, b) => (roles[a] === 'POR' ? -1 : 0) - (roles[b] === 'POR' ? -1 : 0)).forEach(i => {
      const free = ids.filter(id => !used.has(id)), gks = free.filter(id => playsAs(PLAYER(id), 'POR'));
      const best = (roles[i] === 'POR' && gks.length ? gks : free).sort((a, b) => rr(b, roles[i]) - rr(a, roles[i]))[0];
      out[i] = best; used.add(best);
    });
    return out;
  },
  wcStart(ids) {
    const w = this.data.wc, pool = NATIONS.slice().sort(() => cRnd() - 0.5);
    w.call = ids.slice(); w.squad = this.wcRoles(ids);
    const group = pool.slice(0, 3);
    w.group = { teams: ['JP', ...group], table: Object.fromEntries(['JP', ...group].map(k => [k, { pts: 0, gf: 0, gc: 0 }])) };
    w.rest = pool.slice(3); w.state = 'group'; w.round = 0; w.opp = group[0];
    this.save();
  },
  wcFactor() { return 1.22 * ((CAREER_DIFF[this.data.diff] || CAREER_DIFF.normal).mul); },   // las selecciones son lo más duro de la carrera
  wcRating(key) {
    const t = key === 'JP' ? this.wcTeams().A : rivalTeam(key, this.wcFactor(), 1);
    return Math.round(t.players.reduce((s, p) => s + (p.kick + p.control + p.defense + p.body) / 4, 0) / t.players.length);
  },
  wcTeams() {
    const w = this.data.wc, roles = FORMATIONS[this.data.formation].roles, pos = layout(roles);
    const A = { name: 'Inazuma Japón', players: w.squad.map((id, i) => {
      const m = this.m(id), pd = PLAYER(id);
      let techs = (m ? m.known : pd.moves.map(x => x[0]).filter(t => TECH(t))).slice().sort((a, b) => TECH(b).power - TECH(a).power).slice(0, TECH_SLOTS);
      if (roles[i] === 'POR') { const gk = keeperTech(pd, techs); if (gk != null) techs = [gk, ...techs].slice(0, TECH_SLOTS); }
      return Object.assign(buildMatchPlayer(id, roles[i], k => this.wcStat(id, k), techs, [], i, pos[i]),
        { sprite: Object.assign({}, Sprites.refOf(pd), roles[i] === 'POR' ? {} : { kit: { a: '#1a3aa8', b: '#f2f2f2' } }) });
    }) };
    return { A, B: rivalTeam(w.opp, this.wcFactor(), 1) };
  },
  wcSim() { const s = this.simScore(this.wcRating('JP'), this.wcRating(this.data.wc.opp), undefined, undefined, 14); return { gA: s[0], gB: s[1] }; },
  wcResult(gA, gB) {
    const c = this.data, w = c.wc, opp = w.opp; let pens = null, msg = '';
    if (w.state === 'group') {
      const T = w.group.table, add = (k, f, a) => { T[k].gf += f; T[k].gc += a; T[k].pts += f > a ? 3 : f === a ? 1 : 0; };
      add('JP', gA, gB); add(opp, gB, gA);
      const others = w.group.teams.filter(k => k !== 'JP' && k !== opp), s = this.simScore(this.wcRating(others[0]), this.wcRating(others[1]), undefined, undefined, 14);
      add(others[0], s[0], s[1]); add(others[1], s[1], s[0]);
      w.log.push({ r: 'Grupo', opp, gA, gB, other: [others[0], others[1], s[0], s[1]] });
      w.round++;
      if (w.round < 3) { w.opp = w.group.teams[w.round + 1]; }
      else {
        const rank = this.wcTable().map(r => r.key);
        if (rank.indexOf('JP') < 2) { w.state = 'semi'; w.opp = w.rest.shift(); msg = '¡Pasáis a semifinales!'; }
        else { w.state = 'out'; w.place = 'grupo'; msg = 'Eliminados en la fase de grupos'; }
      }
    } else {
      if (gA === gB) pens = this.penalties(this.wcRating('JP'), this.wcRating(opp));
      const won = gA > gB || (pens && pens[0] > pens[1]);
      w.log.push({ r: w.state === 'semi' ? 'Semifinal' : 'Final', opp, gA, gB, pens });
      if (w.state === 'semi') {
        if (won) { w.state = 'final'; w.opp = w.rest.includes('Little Gigant') ? 'Little Gigant' : w.rest.shift(); msg = '¡A la final!'; }
        else { w.state = 'out'; w.place = 'semi'; msg = 'Eliminados en semifinales'; }
      } else { w.state = won ? 'champion' : 'out'; w.place = won ? 'campeón' : 'final'; msg = won ? '¡Campeones del mundo!' : 'Subcampeones del mundo'; }
    }
    if (w.state === 'out' || w.state === 'champion') {
      const R = { campeón: [20, 2500, 15], final: [10, 1200, 8], semi: [5, 600, 4], grupo: [0, 200, 1] }[w.place];
      c.fame = Math.min(100, c.fame + R[0]); c.money += R[1]; Profile.data.tickets += R[2]; Profile.save();
      w.reward = { fame: R[0], money: R[1], tickets: R[2] };
      if (w.place === 'campeón') c.titles.push({ season: w.season, name: 'Mundial con Inazuma Japón' });
    }
    this.save();
    return { gA, gB, pens, msg, opp };
  },
  wcTable() {
    const T = this.data.wc.group.table;
    return Object.entries(T).map(([key, r]) => Object.assign({ key }, r)).sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf);
  },
  wcSet(i, id) { if (FORMATIONS[this.data.formation].roles[i] === 'POR' && !playsAs(PLAYER(id), 'POR')) return false; const w = this.data.wc, at = w.squad.indexOf(id); if (at >= 0) w.squad[at] = w.squad[i]; w.squad[i] = id; this.save(); },
  wcTeam2() { const w = this.data.wc, rest = w.call.filter(id => !w.squad.includes(id)); if (rest.length >= 5) { w.squad = this.wcRoles(rest); this.save(); } },
  wcBest() { const w = this.data.wc; w.squad = this.wcRoles(w.call); this.save(); },
  wcClose() { const c = this.data; (c.wcHistory = c.wcHistory || []).push({ season: c.wc.season, place: c.wc.place }); c.wc = null; this.save(); },
  matchTeams() {
    const c = this.data, nm = this.nextMatch(), roles = FORMATIONS[c.formation].roles, pos = layout(roles), fm = this.formaMul();
    const A = { name: c.school, players: c.lineup.map((id, i) => {
      const m = this.m(id), pd = PLAYER(id);
      let techs = this.equipped(m);
      if (!m.equip && roles[i] === 'POR') { const gk = m.known.find(t => TECH(t).type === 'parada'); if (gk != null && !techs.includes(gk)) techs = [gk, ...techs].slice(0, TECH_SLOTS); }
      return Object.assign(buildMatchPlayer(id, roles[i], k => Math.round(this.stat(m, k) * fm), techs, [], i, pos[i]),
        { sprite: Object.assign({}, Sprites.refOf(pd), roles[i] === 'POR' ? {} : { kit: c.kit }) });
    }) };
    return { A, B: this.clubTeam(nm.rival, Math.min(1, c.season / 3)) };
  },
};
