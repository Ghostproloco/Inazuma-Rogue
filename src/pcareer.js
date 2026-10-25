/* =====================================================================
   MODO CARRERA JUGADOR: vives la carrera de un solo jugador.
   - Creas uno (nombre, puesto, elemento y aspecto) o usas uno de tu colección.
   - Juegas en un club de las ligas de la Carrera (mismas 3 divisiones, Copa y
     playoffs): el entrenador pone a los 5 mejores; si eres suplente, a veces
     sales en la 2.ª parte.
   - En el partido solo controlas a tu jugador (Logic: settings.lockId).
   - Nota del partido → experiencia → niveles (puntos para stats y técnicas).
   - Ofertas de otros clubes, convocatoria con tu selección para el Mundial (titular, suplente o reserva)
     y, tras 3 temporadas, te graduas: el jugador creado entra en tu colección
     y das el salto a la Liga Pro (clubes inventados con estrellas del Inazuma 3),
     donde la carrera sigue sin fin.
   Reutiliza el motor de la Carrera de mánager (Career) con sus propios datos.
   ===================================================================== */
const PC_KEY = 'inazuma-jugador';
const PC_ROLES = ['DEF', 'MED', 'DEL'];
// Estadísticas de partida de un jugador creado (en el juego valen ×0,78: empieza flojito)
const PC_BASE = {
  DEF: { tiro: 49, control: 54, defensa: 65, rapidez: 57, fisico: 63, aguante: 60 },   // media ~45
  MED: { tiro: 55, control: 65, defensa: 52, rapidez: 60, fisico: 56, aguante: 62 },
  DEL: { tiro: 65, control: 58, defensa: 45, rapidez: 62, fisico: 58, aguante: 64 },
};
const PC_TYPES = { DEF: ['bloqueo', 'regate'], MED: ['regate', 'tiro', 'bloqueo'], DEL: ['tiro', 'regate'], POR: ['parada'] };
const PC_ACTS = {
  entrenar:  { name: TX('Entrenar'), desc: TX('Sube la estadística que elijas'), forma: -10 },
  tecnica:   { name: TX('Practicar técnica'), desc: TX('Aprende una supertécnica nueva practicándola'), forma: -6 },
  descansar: { name: TX('Descansar'), desc: TX('Recuperas forma para el partido'), forma: 25 },
};
const PC_XP = lv => 60 + lv * 22;          // experiencia para pasar del nivel lv al siguiente
const PC_SUB_PART = 0.4;                   // parte del partido que juegas si sales del banquillo
const PC_STAT_MAX = 99;
const PC_TECH_WEEKS = 3;                   // semanas para aprender una técnica (la primera, solo 1)
const PC_GRAD_YEAR = 3;
// Supertécnicas que se desbloquean al llegar a una media (también con jugadores de la colección)
const PC_TIERS = [
  { ovr: 70, min: 55, max: 80, name: TX('medio buenas') },
  { ovr: 80, min: 75, max: 95, name: TX('bastante buenas') },
  { ovr: 85, min: 90, max: 200, name: TX('muy buenas') },
];
const PC_DUEL_GAP = 5;   // semanas mínimas entre dos retos 1 contra 1
const PC_REL_MAX = { amigo: 5, rival: 3 };   // como mucho, 5 amigos y 3 rivales (el más flojo se olvida)                    // te graduas al acabar 3º: luego, Liga Pro
const PC_WINDOWS = { verano: [1, 2], invierno: [8, 9] };   // semanas en las que puedes pedir el traspaso
// Liga Pro: clubes inventados con las estrellas de las selecciones del Inazuma 3.
// Escudos y equipaciones con los colores del club al que homenajean (escudos hechos con tools/pro_crests.py)
const PRO_CLUBS = [
  { key: 'pro:barcelona', name: 'Barcelona Atlètic', nat: 'Red Matador', half: 0, extra: 'Little Gigant', crest: 4001, kit: { a: '#a50044', b: '#004d98' } },
  { key: 'pro:madrid', name: 'Madrid Imperial', nat: 'Red Matador', half: 1, extra: 'The Great Horn', crest: 4002, kit: { a: '#f4f4f4', b: '#c9a227' } },
  { key: 'pro:milano', name: 'Milano Calcio', nat: 'Orpheus', extra: 'Big Waves', crest: 4003, kit: { a: '#c8102e', b: '#151515' } },
  { key: 'pro:london', name: 'London Royals', nat: 'Knights of Queen', extra: 'Team Zoolan', crest: 4004, kit: { a: '#db0007', b: '#f4f4f4' } },
  { key: 'pro:paris', name: 'Paris Étoile', nat: 'Rose Griffon', extra: 'Desert Lion', crest: 4005, kit: { a: '#004170', b: '#da291c' } },
  { key: 'pro:munchen', name: 'München Adler', nat: 'Brocken Bogue', extra: 'Fire Dragon', crest: 4006, kit: { a: '#dc052d', b: '#f4f4f4' } },
  { key: 'pro:rio', name: 'Rio Samba FC', nat: 'The Kingdom', extra: 'Little Gigant', crest: 4007, kit: { a: '#c4122e', b: '#151515' } },
  { key: 'pro:buenosaires', name: 'Buenos Aires Gauchos', nat: 'The Empire', extra: 'Big Waves', crest: 4008, kit: { a: '#103f79', b: '#f3b229' } },
  { key: 'pro:losangeles', name: 'Los Angeles Stars', nat: 'Unicorn', extra: 'Team Zoolan', crest: 4009, kit: { a: '#00245d', b: '#ffd200' } },
  { key: 'pro:doha', name: 'Doha Leones', nat: 'Desert Lion', extra: 'The Great Horn', crest: 4010, kit: { a: '#f4f4f4', b: '#151515' } },
];
const PRO_ROLES = ['POR', 'DEF', 'MED', 'MED', 'DEL'];
// Selecciones del Mundial: Inazuma Japón ('JP') y las del Inazuma 3 que tienen jugadores propios (abroad)
const PC_NATS = ['JP', ...[...new Set(GAME.players.filter(p => p.abroad).map(p => p.abroad))].filter(k => TEAM(k)).sort()];
const PC_WC_ROLES = ['titular', 'suplente', 'reserva'];
const PC_WC_GAP = [1, 10];   // diferencia con el último titular de tu puesto: hasta 1 → titular; hasta 10 → suplente; más → reserva
const PC_WC_ROLE_LABEL = { titular: TX('Titular'), suplente: TX('Suplente'), reserva: TX('Reserva') };
const natOfPlayer = pd => (pd && (pd.nat || pd.abroad)) || 'JP';
const natName = k => k === 'JP' ? TX('Inazuma Japón') : (TEAM(k) || { name: k }).name;
const natCrest = k => k === 'JP' ? 3016 : (TEAM(k) || { crest: 1 }).crest;
const PRO_FACTOR = 0.87;   // fuerza de los rivales de la Liga Pro
let proReady = false;
// Crea los equipos de la Liga Pro (una vez). Cada club: portero y defensa de «su» selección y 3 fichajes
// de otros países (reparto por turnos para que queden igualados): nadie es solo de un país.
function ensureProTeams() {
  if (proReady || typeof GAME === 'undefined') return; proReady = true;
  const ie = p => STAT_KEYS.reduce((t, k) => t + p.ie[k], 0);
  const all = GAME.players.filter(p => p.abroad && p.cs).sort((a, b) => ie(b) - ie(a));
  const used = new Set(), squads = {};
  const take = (pred, nth = 0) => { const f = all.filter(p => !used.has(p.id) && pred(p)); const p = f[Math.min(nth, f.length - 1)]; if (p) used.add(p.id); return p; };
  // 1) Portero y defensa de su selección (Barcelona y Madrid se reparten la de España)
  for (const C of PRO_CLUBS) squads[C.key] = [take(p => p.abroad === C.nat && p.role === 'POR', C.half || 0), take(p => p.abroad === C.nat && p.role === 'DEF', C.half || 0)];
  // 2) Tres rondas de fichajes (medio, medio y delantero) en orden de serpiente, siempre de otro país
  const order = PRO_CLUBS.slice();
  ['MED', 'MED', 'DEL'].forEach((role, r) => {
    (r % 2 ? order.slice().reverse() : order).forEach(C => {
      const have = new Set(squads[C.key].filter(Boolean).map(p => p.abroad));
      const pref = r === 0 && C.extra ? p => p.abroad === C.extra : () => true;
      const p = take(q => q.role === role && q.abroad !== C.nat && !have.has(q.abroad) && pref(q), (r + PRO_CLUBS.indexOf(C)) % 3)
        || take(q => q.role === role && q.abroad !== C.nat && !have.has(q.abroad));
      squads[C.key].push(p);
    });
  });
  for (const C of PRO_CLUBS) {
    if (TEAM(C.key)) continue;
    const players = squads[C.key].map((p, i) => p && { id: p.id, role: PRO_ROLES[i] }).filter(Boolean);
    GAME.teams.push({ key: C.key, name: C.name, kind: 'pro', players, crest: C.crest, kit: C.kit, pro: true });
  }
}

// Personalización (v0.35): colores para elegir y lo que cuesta cambiarlos después de crear al jugador
const PC_HAIR = ['#1a1a1a', '#5a3218', '#9a5a2a', '#e8c040', '#f2ead0', '#d83020', '#ff7a1a', '#3f8a3a', '#2a6ad8', '#30c0f0', '#8a4ad8', '#ff8ac0', '#c0c8d0'];
const PC_SKIN = ['#fde2c8', '#f6c8a0', '#e0a070', '#b87848', '#8a5430', '#5a3420'];
const PC_BOOTS = ['#1a1a1a', '#f2f2f2', '#d83020', '#2a6ad8', '#e8c040', '#3f8a3a', '#ff7a1a', '#8a4ad8'];
const PC_LOOK_COST = { cara: 800, hair: 300, skin: 300, boots: 200, num: 200 };
function cleanLook(l) {
  const o = {}, ok = (v, L) => typeof v === 'string' && L.includes(v);
  if (!l) return o;
  if (ok(l.hair, PC_HAIR)) o.hair = l.hair; if (ok(l.skin, PC_SKIN)) o.skin = l.skin; if (ok(l.boots, PC_BOOTS)) o.boots = l.boots;
  const n = Math.floor(+l.num); if (n >= 1 && n <= 99) o.num = n;
  return o;
}
const PlayerCareer = Object.assign(Object.create(Career), {
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(Slots.key(PC_KEY, Slots.get('pc'))) || 'null'); } catch (_) { this.data = null; }
    if (this.data && this.data.me && this.data.me.pd) registerCustom(this.data.me.pd);
    ensureProTeams();
    const c = this.data;
    if (c && c.cmv !== 1) { c.cmv = 1; c.ratings = {}; }   // medias de carrera nuevas (22 oct)
    if (c && c.me && c.squad) { const twin = this.twinOf(); if (twin != null && c.squad.some(m => m.id === twin)) { c.squad = c.squad.filter(m => m.id !== twin); if (c.lineup && c.lineup.includes(twin)) c.lineup = null; } }
    // partidas de antes: si tu jugador estaba colocado fuera de su puesto (p. ej. un delantero de portero), el entrenador rehace el once
    if (c && c.me && c.lineup && c.formation && PLAYER(c.me.id)) { const at = c.lineup.indexOf(c.me.id), R = FORMATIONS[c.formation].roles; if (at >= 0 && R[at] !== PLAYER(c.me.id).role && R.includes(PLAYER(c.me.id).role)) c.lineup = null; }
    if (c && c.me) { c.me.rel = c.me.rel || {}; c.me.duels = c.me.duels || { w: 0, l: 0 }; if (c.me.tier == null) c.me.tier = this.tierOf(this.ovrMe()); }
    if (c && c.club && TEAM(c.club) && TEAM(c.club).pro) { c.crestId = TEAM(c.club).crest; c.kit = TEAM(c.club).kit; }   // escudo y colores al día
    if (c && c.over === 'graduado') {   // beta 0.32: la graduación cerraba la carrera; ahora sigue en la Liga Pro
      c.over = null; c.me.graduated = true; if (c.graduation) c.graduation.seen = true;
      if (!c.pro) { c.goPro = true; c.me.offers = this.proOffers(); }
      this.save();
    }
    return this.data;
  },
  save() { try { localStorage.setItem(Slots.key(PC_KEY, Slots.get('pc')), JSON.stringify(this.data)); } catch (_) {} },
  clear() { this.data = null; try { localStorage.removeItem(Slots.key(PC_KEY, Slots.get('pc'))); } catch (_) {} },
  archive() {},   // el salón de la fama es de la Carrera de mánager

  /* ---------- Tu jugador ---------- */
  me() { return this.data && this.data.me; },
  // Si eres un legendario de evento (p. ej. Hebimos de Halloween), el jugador «normal» del que sale no puede ser tu compañero
  twinOf() { const c = this.data, pd = c && PLAYER(c.me.id); return pd && pd.hwBase != null ? pd.hwBase : null; },
  mine() { const c = this.data; return c && c.squad.find(m => m.id === c.me.id); },
  pd() { return PLAYER(this.data.me.id); },
  ovrMe() { return this.ovr(this.mine()); },
  // Aspectos para el jugador creado: comunes del gacha, no famosos (al azar)
  lookChoices(n = 12, role) {
    const pool = GAME.players.filter(p => p.cs && p.gacha !== false && p.rarity === 'comun' && !p.custom && (!role || p.role === role));
    const out = []; while (out.length < n && pool.length) out.push(pool.splice(Math.floor(cRnd() * pool.length), 1)[0]);
    return out;
  },
  // Personalización del jugador creado: pelo, piel, botas y dorsal (gratis al crearlo; luego, con monedas)
  lookCost(cur, next) {
    const a = cur || {}, b = next || {}; let c = 0;
    if ((a.cs || '') + '' !== (b.cs || '') + '') c += PC_LOOK_COST.cara;
    for (const k of ['hair', 'skin', 'boots', 'num']) if ((a[k] || null) !== (b[k] || null)) c += PC_LOOK_COST[k];
    return c;
  },
  // Cambia el aspecto de tu jugador creado (paga en monedas del perfil)
  setLook(look, cs) {
    const me = this.data && this.data.me; if (!me || !me.pd) return { ok: false, msg: TX('Solo para jugadores creados') };
    const pd = PLAYER(me.id) || me.pd, cur = Object.assign({ cs: pd.cs }, pd.look || {}), nxt = Object.assign({ cs: cs || pd.cs }, cleanLook(look));
    const cost = this.lookCost(cur, nxt), P = Profile.data;
    if (!cost) return { ok: false, msg: TX('No has cambiado nada') };
    if (P.coins < cost) return { ok: false, msg: TX('No tienes monedas suficientes') };
    P.coins -= cost;
    for (const x of new Set([pd, me.pd, ...(P.custom || []).filter(q => q.id === me.id)])) { x.look = cleanLook(look); if (cs) x.cs = cs.slice(); }
    Profile.save(); this.save();
    return { ok: true, cost };
  },
  newCustom({ name, role, elem, look, nat, style }) {
    const P = Profile.data; P.customSeq = (P.customSeq || 0) + 1; Profile.save();
    const lp = PLAYER(look);
    const pd = { id: 990000 + P.customSeq, name: String(name || '').trim().slice(0, 16) || TX('Novato'), role, elem, rarity: 'comun',
      cs: lp.cs.slice(), ie: Object.assign({}, PC_BASE[role]), moves: [], gacha: false, custom: true, nat: PC_NATS.includes(nat) ? nat : 'JP' };
    const lk = cleanLook(style); if (Object.keys(lk).length) pd.look = lk;
    registerCustom(pd);
    return pd;
  },
  // Media de un jugador (como la calcula la Carrera) sin tenerlo en la plantilla
  ovrOf(id) { return this.ovr({ id, up: {} }); },
  // Ofertas para empezar: según tu media, clubes de la división que te toca
  startOffers(id) {
    const o = this.ovrOf(id), div = o >= 66 ? 1 : o >= 52 ? 2 : 3;
    const list = (CAREER_START[div] || []).concat(div === 3 ? ['Guardabosques'] : []).filter(k => TEAM(k));
    return list.sort(() => cRnd() - 0.5).slice(0, 3).map(key => ({ key, div }));
  },

  /* ---------- Crear la carrera ---------- */
  create(meId, clubKey, customPd) {
    if (customPd) registerCustom(customPd);
    ensureProTeams();
    const c = this.data = { v: 1, mode: 'player', diff: 'normal', manager: 13, school: '', club: null, season: 1, week: 1, fame: 50, money: 0, forma: 100,
      squad: [], formation: '1-2-1-1', lineup: null, tactic: 'equilibrada', divs: JSON.parse(JSON.stringify(CAREER_START)),
      titles: [], history: [], over: null, goal: false, lastActivity: null, log: [],
      me: { id: meId, pd: customPd || null, lv: 1, xp: 0, pts: 0, trust: customPd ? -5 : 1, practiced: 0, rel: {}, duels: { w: 0, l: 0 }, balon: 0, forma: 100, learning: null, techChoice: null,
        season: this.blankSeason(), total: { apps: 0, starts: 0, goals: 0, assists: 0, mvp: 0 }, awards: [], callups: 0, clubs: [], offers: null, seasons: [],
        nat: natOfPlayer(customPd || PLAYER(meId)) } };
    c.divs[3].push('Guardabosques');                // 10 clubes de verdad en cada división
    this.defaults();
    const pd = PLAYER(meId), mm = this.member(meId, 1, 0);
    mm.known = customPd ? [] : startingTechs(pd);
    this.joinClub(clubKey, mm);
    this.newSeason(true);
    c.me.tier = this.tierOf(this.ovrMe());   // las franjas que ya tienes no se «desbloquean» de nuevo
    this.save();
    return c;
  },
  blankSeason() { return { apps: 0, starts: 0, goals: 0, assists: 0, notes: [], mvp: 0 }; },
  // Fichas por un club: ocupas su sitio en la liga; tu plantilla anterior vuelve a su club
  joinClub(key, mm) {
    const c = this.data, me = mm || this.mine();
    if (c.club) {
      const old = c.club, back = c.squad.filter(m => m.id !== c.me.id).map(m => Object.assign({ id: m.id, role: PLAYER(m.id).role }, m.spr ? { file: m.spr.file, row: m.spr.row } : {}));
      // El club vuelve a tener 5 (los mejores en los puestos de su once); si faltan, vuelven los suyos de siempre
      const roles = TEAM(old).players.map(p => p.role), used = new Set(), five = [];
      const best = r => back.filter(m => !used.has(m.id) && m.role === r).sort((a, b) => this.sumIE(PLAYER(b.id)) - this.sumIE(PLAYER(a.id)))[0];
      roles.forEach((r, i) => { const m = best(r) || Object.assign({}, TEAM(old).players[i]); used.add(m.id); five.push({ id: m.id, role: r, ...(m.file ? { file: m.file, row: m.row } : {}) }); });
      c.clubs[old] = five;
      const od = this.divOf(YOU); c.divs[od] = c.divs[od].map(k => k === YOU ? old : k);
    }
    const d = this.divOf(key); c.divs[d] = c.divs[d].map(k => k === key ? YOU : k);
    // si tu jugador ya estaba en ese club (p. ej. Nathan en los Emperadores), no hay dos copias
    const twin = this.twinOf();
    c.squad = (c.clubs[key] || []).filter(m => m.id !== c.me.id && m.id !== twin).map(m => { const x = this.member(m.id, 1 + Math.floor(cRnd() * 5), 2); if (m.file && !PLAYER(m.id).cs) x.spr = { file: m.file, row: m.row }; return x; });
    delete c.clubs[key];
    c.squad.push(me);
    const T = TEAM(key);
    c.club = key; c.school = T.name; c.kit = T.kit || T.kitAuto || c.kit; c.crestId = T.crest || 1;
    if (!c.me.clubs.includes(key)) c.me.clubs.push(key);
    c.ratings = {}; c.lineup = null; this.autoLineup();
  },
  // El entrenador pone a los 5 mejores; la confianza (tus notas) cuenta un poco
  rate(m, role) {
    const v = Career.rate.call(this, m, role);
    return this.data && m.id === this.data.me.id ? v + Math.max(-8, Math.min(7, this.data.me.trust)) : v;
  },
  // Un jugador creado empieza en el banquillo: las 2 primeras semanas no es titular
  rookie() { const c = this.data; return !!(c && c.me.pd && !c.me.graduated && !c.me.forceStart && c.season === 1 && c.week <= 2); },
  autoLineup() {
    Career.autoLineup.call(this);
    const c = this.data; if (!c || !c.me || !c.lineup) return;
    if (c.me.forceStart && !c.lineup.includes(c.me.id)) {   // (desarrollador) titular fijo
      const roles = FORMATIONS[c.formation].roles, r = PLAYER(c.me.id).role, i = roles.lastIndexOf(r);
      c.lineup[i >= 0 ? i : roles.length - 1] = c.me.id; return;
    }
    // Juegas en TU puesto: un jugador con stats altas en todo (como un legendario de evento) no acaba de portero o de defensa por ser el mejor ahí
    const roles = FORMATIONS[c.formation].roles, myRole = PLAYER(c.me.id).role, at = c.lineup.indexOf(c.me.id);
    if (at >= 0 && roles[at] !== myRole) {
      const slots = roles.map((r, k) => k).filter(k => roles[k] === myRole);
      if (slots.length) {
        const j = slots.sort((a, b) => this.rate(this.m(c.lineup[a]), myRole) - this.rate(this.m(c.lineup[b]), myRole))[0];   // le quitas el sitio al peor de tu puesto
        const out = c.lineup[j]; c.lineup[j] = c.me.id; c.lineup[at] = null;
        const r = roles[at], free = c.squad.filter(m => m.id !== c.me.id && !c.lineup.includes(m.id) && (r !== 'POR' || PLAYER(m.id).role === 'POR'));
        const best = free.sort((a, b) => Career.rate.call(this, b, r) - Career.rate.call(this, a, r))[0];
        c.lineup[at] = best ? best.id : out;
      }
    }
    if (!this.rookie() || !c.lineup.includes(c.me.id)) return;
    const i = c.lineup.indexOf(c.me.id), role = FORMATIONS[c.formation].roles[i];
    const alt = c.squad.filter(m => m.id !== c.me.id && !c.lineup.includes(m.id)).sort((a, b) => Career.rate.call(this, b, role) - Career.rate.call(this, a, role))[0];
    if (alt) c.lineup[i] = alt.id;
  },
  // Liga Pro: los rivales juegan al nivel de tus compañeros (no al 95 % de sus stats)
  aiFactor(key) {
    const c = this.data;
    if (c && c.pro && this.divOf(key) === 1) return PRO_FACTOR * ((CAREER_DIFF[c.diff] || CAREER_DIFF.normal).mul);
    return Career.aiFactor.call(this, key);
  },
  starter() { const c = this.data; if (!this.lineupOk()) this.autoLineup(); return c.lineup.includes(c.me.id); },
  slotOf() { return this.data.lineup.indexOf(this.data.me.id); },
  myForma() { return 0.85 + 0.15 * this.data.me.forma / 100; },

  /* ---------- Equipos del partido ---------- */
  matchTeams(opts = {}) {
    const c = this.data, nm = this.nextMatch(), roles = FORMATIONS[c.formation].roles, pos = layout(roles);
    let lineup = c.lineup.slice();
    if (opts.subIn) {   // sales del banquillo: entras por el titular de tu puesto
      const myRole = PLAYER(c.me.id).role, i = roles.findIndex((r, k) => r === myRole && lineup[k] !== c.me.id);
      lineup[i >= 0 ? i : roles.length - 1] = c.me.id;
    }
    const A = { name: c.school, players: lineup.map((id, i) => {
      const m = this.m(id), pd = PLAYER(id), mul = id === c.me.id ? this.myForma() * (this.rivalsIn(nm.rival).length ? 1.05 : 1) : 1;
      let techs = this.equipped(m);
      if (!m.equip && roles[i] === 'POR') { const gk = m.known.find(t => TECH(t).type === 'parada'); if (gk != null && !techs.includes(gk)) techs = [gk, ...techs].slice(0, TECH_SLOTS); }
      const sprite = m.spr ? { file: m.spr.file, row: m.spr.row } : Object.assign({}, Sprites.refOf(pd), roles[i] === 'POR' ? {} : { kit: c.kit });
      return Object.assign(buildMatchPlayer(id, roles[i], k => Math.round(this.stat(m, k) * mul), techs, [], i, pos[i]), { sprite });
    }) };
    return { A, B: this.clubTeam(nm.rival, Math.min(1, c.season / 3)), lockId: 'A' + lineup.indexOf(c.me.id), friendKeys: this.friendKeys() };
  },
  equipped(m) {
    if (m.id !== this.data.me.id) return Career.equipped.call(this, m);
    const eq = (m.equip || []).filter(t => m.known.includes(t));
    return (eq.length ? eq : m.known.slice().sort((a, b) => TECH(b).power - TECH(a).power)).slice(0, TECH_SLOTS);
  },
  setEquip(list) { const m = this.mine(); m.equip = list.filter(t => m.known.includes(t)).slice(0, TECH_SLOTS); this.save(); },

  /* ---------- La semana ---------- */
  doActivity(act, arg) {
    const c = this.data, me = c.me, m = this.mine(), A = PC_ACTS[act]; if (!A) return null;
    let msg = '';
    if (act === 'entrenar') {
      const k = STAT_KEYS.includes(arg) ? arg : 'tiro';
      const n = 2 + (cRnd() < 0.45 ? 1 : 0);
      this.addStat(m, k, n); this.gainXp(8); this.checkTier();
      msg = TX('Entrenamiento de {0}: +{1}.', STAT_LABEL[k], n);
    } else if (act === 'tecnica') {
      if (!me.learning && arg != null) me.learning = { id: +arg, w: 0 };
      if (me.learning) {
        me.learning.w++;
        const t = TECH(me.learning.id);
        const need = this.techWeeks();
        if (me.learning.w >= need) { this.learn(me.learning.id); msg = TX('¡Has aprendido {0}!', t.name); me.learning = null; me.practiced = (me.practiced || 0) + 1; }
        else msg = TX('Practicas {0}: {1} de {2} semanas.', t.name, me.learning.w, need);
        this.gainXp(5);
      }
    } else if (act === 'descansar') msg = TX('Descansas y recuperas la forma.');
    me.forma = Math.max(20, Math.min(100, Math.round(me.forma + A.forma)));
    c.lastActivity = { week: c.week, season: c.season, act };
    this.save();
    return { act, msg };
  },
  // La primera técnica que practicas se aprende en 1 semana; las demás, en 3
  techWeeks() { return (this.data.me.practiced || 0) ? PC_TECH_WEEKS : 1; },
  activityDone() { const L = this.data.lastActivity; return !!L && L.week === this.data.week && L.season === this.data.season; },
  addStat(m, k, n) { const now = this.stat(m, k); m.up[k] = (m.up[k] || 0) + Math.max(0, Math.min(n, PC_STAT_MAX - now)); },
  spendPoint(k) {
    const me = this.data.me, m = this.mine(); if (me.pts <= 0 || this.stat(m, k) >= PC_STAT_MAX) return false;
    this.addStat(m, k, 1); me.pts--; this.checkTier(); this.save(); return true;
  },
  gainXp(n) {
    const me = this.data.me; let ups = 0;
    me.xp += Math.round(n);
    while (me.xp >= PC_XP(me.lv)) { me.xp -= PC_XP(me.lv); me.lv++; me.pts += 3; ups++; }
    if (ups && !me.techChoice) { const o = this.techOptions(3); if (o.length) me.techChoice = o; }
    return ups;
  },
  // Técnicas que puede aprender: las de su elemento (o neutras) de los tipos de su puesto, hasta una potencia
  // según el nivel o la media (PC_TIERS). Con band, solo las de esa franja de potencia.
  techCap() { const me = this.data.me, t = PC_TIERS[(me.tier || 0) - 1]; return Math.max(26 + me.lv * 5, t ? t.max : 0); },
  techOptions(n = 3, band) {
    const me = this.data.me, m = this.mine(), pd = this.pd(), cap = this.techCap();
    const evo = new Set(Object.values(GAME.evo || {}));
    const ok = t => band ? t.power >= band.min && t.power <= band.max : t.power <= cap;
    const own = (pd.moves || []).map(x => x[0]).filter(t => TECH(t) && !m.known.includes(t) && (band ? ok(TECH(t)) : TECH(t).power <= cap + 10));
    const pool = Object.values(GAME.techniques).filter(t => PC_TYPES[pd.role].includes(t.type) && (t.elem === pd.elem || t.elem === 'neutro')
      && ok(t) && !m.known.includes(t.id) && !evo.has(t.id) && t.id < 30000).sort((a, b) => b.power - a.power).slice(0, 12).map(t => t.id);
    const names = new Set(m.known.map(t => TECH(t) && TECH(t).name)), out = [];
    for (const t of [...new Set(own.concat(pool.sort(() => cRnd() - 0.5)))]) {   // sin repetir técnicas con el mismo nombre (hay versiones duplicadas)
      const nm = TECH(t).name; if (names.has(nm)) continue; names.add(nm); out.push(t); if (out.length >= n) break;
    }
    return out;
  },
  tierOf(o) { let t = 0; PC_TIERS.forEach((T, i) => { if (o >= T.ovr) t = i + 1; }); return t; },
  // ¿Has llegado a una media nueva (70, 80, 85)? → eliges una supertécnica de esa franja
  checkTier() {
    const me = this.data.me, t = this.tierOf(this.ovrMe());
    if (t <= (me.tier || 0)) return 0;
    me.tier = t;
    const o = this.techOptions(3, PC_TIERS[t - 1]);
    if (o.length) { if (me.techChoice) me.tierPending = t; else { me.techChoice = o; me.techWhy = t; } }
    return t;
  },
  learn(id) { const m = this.mine(); if (!m.known.includes(+id)) m.known.push(+id); this.save(); },
  chooseTech(id) {
    const me = this.data.me; if (id != null && me.techChoice && me.techChoice.includes(+id)) this.learn(+id);
    me.techChoice = null; me.techWhy = null;
    if (me.tierPending) { const t = me.tierPending; me.tierPending = null; const o = this.techOptions(3, PC_TIERS[t - 1]); if (o.length) { me.techChoice = o; me.techWhy = t; } }
    this.save();
  },

  /* ---------- Partido ---------- */
  // Suplente: se simula la primera parte y decide si sales
  benchPlan() {
    const c = this.data, nm = this.nextMatch(), me = c.me;
    const r1 = this.myRating() + (nm.home ? 1.5 : 0), r2 = this.rating(nm.rival) + (nm.home ? 0 : 1.5);
    const lam = (x, y) => Math.max(0.1, 1.35 * Math.exp((x - y) / 12)) * (1 - PC_SUB_PART);
    const gA = this.poisson(lam(r1, r2)), gB = this.poisson(lam(r2, r1));
    const chance = Math.max(0.2, Math.min(0.85, 0.42 + me.trust * 0.05 + (gA < gB ? 0.18 : 0) + (me.forma - 70) / 300));
    return { gA, gB, enters: cRnd() < chance };
  },
  // Nota del partido (de 3 a 10) a partir de lo que ha hecho tu jugador
  rateMatch(st, part, won, draw, conceded, role) {
    st = st || {};
    let n = 6 + (st.gl || 0) * 1.1 + (st.as || 0) * 0.7 + Math.min(st.sh || 0, 5) * 0.12 + (st.tk || 0) * 0.35 + (st.dr || 0) * 0.25
      + Math.min(st.pok || 0, 10) * 0.07 - (st.lost || 0) * 0.15 + (won ? 0.4 : draw ? 0 : -0.3);
    if (role === 'DEF') n += conceded === 0 ? 0.6 : conceded >= 3 ? -0.4 : 0;
    if ((st.touch || 0) === 0) n -= 0.6;   // ni la ha tocado
    n = 6 + (n - 6) * (part < 1 ? 0.85 : 1);
    return Math.round(Math.max(3, Math.min(10, n)) * 10) / 10;
  },
  // Nota aproximada si se simula el partido
  simNote(won, draw, goals) {
    const team = this.myRating(), o = this.ovrMe();
    const n = 6 + (o - team) / 9 + (won ? 0.45 : draw ? 0 : -0.3) + goals * 1.0 + (cRnd() - 0.5) * 1.4;
    return Math.round(Math.max(3, Math.min(9.5, n)) * 10) / 10;
  },
  // Simula tu partido entero (como titular, como suplente que entra o que no sale)
  simulateWeek(plan) {
    const c = this.data, nm = this.nextMatch();
    const r = this.simulateMine('equilibrada');   // marcador y goleadores del motor de la Carrera
    let gA = r.gA, gB = r.gB, played = this.starter() ? 1 : 0;
    if (plan) { const extra = this.simScore(this.myRating(), this.rating(nm.rival)); gA = plan.gA + Math.round(extra[0] * PC_SUB_PART); gB = plan.gB + Math.round(extra[1] * PC_SUB_PART); played = plan.enters ? PC_SUB_PART : 0; }
    const pens = nm.ko && gA === gB ? this.penalties(this.myRating(), this.rating(nm.rival)) : null;
    let scorers = r.events.filter(e => e.type === 'goal' && e.team === 'A').map(e => e.id).slice(0, gA);
    while (scorers.length < gA) scorers.push(pickR(c.lineup));
    if (plan && plan.enters) for (let i = plan.gA; i < scorers.length; i++) if (cRnd() < 0.3) scorers[i] = c.me.id;   // sales y a veces marcas
    const myGoals = played ? scorers.filter(id => id === c.me.id).length : 0;
    const astP = (0.22 + 0.06 * this.friendKeys().length) * played;   // tus amigos te la dan más
    const myAst = played ? scorers.filter(id => id !== c.me.id).reduce(a => a + (cRnd() < astP ? 1 : 0), 0) : 0;
    const won = gA > gB || (gA === gB && pens && pens[0] > pens[1]), draw = gA === gB && !pens;
    const note = played ? this.simNote(won, draw, myGoals) : null;
    return this.finishWeek({ gA, gB, pens, scorers, note: note != null ? Math.min(10, note + myAst * 0.5) : null, played, stats: { gl: myGoals, as: myAst }, simulated: true });
  },
  // Resultado de un partido jugado: s = estado del partido (Logic), lockId, part = 1 (titular) o PC_SUB_PART
  playedResult(s, lockId, part, base = { gA: 0, gB: 0 }) {
    const c = this.data, nm = this.nextMatch();
    const gA = s.score.A, gB = s.score.B;   // el marcador ya incluía lo de la 1.ª parte
    const pens = nm.ko && gA === gB ? this.penalties(this.myRating(), this.rating(nm.rival)) : null;
    const lineup = c.lineup.slice(), idOf = pid => { const p = s.players.find(q => q.id === pid); return p ? p.key : null; };
    const scorers = (s.goalLog || []).filter(g => g.team === 'A' && g.key != null).map(g => g.key);
    for (let i = 0; i < base.gA; i++) scorers.push(pickR(lineup.filter(id => id !== c.me.id)));
    const st = (s.pstats || {})[lockId] || {};
    const won = gA > gB || (gA === gB && pens && pens[0] > pens[1]), draw = gA === gB && !pens;
    const note = this.rateMatch(st, part, won, draw, gB, PLAYER(c.me.id).role);
    return this.finishWeek({ gA, gB, pens, scorers, note, played: part, stats: st });
  },
  // Cierra la semana: resultados de la liga (motor de la Carrera) + tu progreso
  finishWeek({ gA, gB, pens, scorers, note, played, stats, simulated }) {
    const c = this.data, me = c.me, m = this.mine(), before = JSON.stringify(m.up);
    const nm = this.nextMatch();
    const out = this.finishMatch(gA, gB, pens, 0, scorers);
    m.up = JSON.parse(before);                        // tu progreso es el tuyo (no el sorteo de la Carrera de mánager)
    c.forma = 100; c.fame = Math.max(c.fame, 40);    // en este modo no se cierra el club
    me.forma = Math.max(20, Math.round(me.forma - (played ? 12 * played + 4 : 0)));
    const S = me.season, T = me.total, gl = stats.gl || 0, as = stats.as || 0;
    out.pc = { note, played, gl, as, starter: played === 1, rewards: [], xp: 0, ups: 0, stats: simulated ? null : stats };
    if (played) {
      S.apps++; T.apps++; if (played === 1) { S.starts++; T.starts++; }
      S.goals += gl; S.assists += as; T.goals += gl; T.assists += as;
      if (note != null) S.notes.push(note);
      me.trust = Math.max(-8, Math.min(10, me.trust * 0.85 + (note - 6.3) * 1.3));
      const xp = Math.round(note * 10 * (played === 1 ? 1 : 0.8) * (simulated ? 0.7 : 1));
      out.pc.xp = xp; out.pc.ups = this.gainXp(xp);
      // Premios: tickets y monedas por logros
      const R = out.pc.rewards, P = Profile.data;
      if (note >= 8.5) { S.mvp++; T.mvp++; P.tickets += 1; P.coins += 50; R.push(TX('⭐ Jugador del partido: +1 🎟️ y +50 🪙')); }
      if (gl >= 3) { P.tickets += 5; R.push(TX('🎩 ¡Hat-trick! +5 🎟️')); }
      if (gl && T.goals === gl) { P.tickets += 3; R.push(TX('⚽ Tu primer gol: +3 🎟️')); }
      if (R.length) Profile.save();
    } else {
      me.trust = Math.min(10, me.trust + 0.6);   // entrenando y esperando, el entrenador te va conociendo
      out.pc.xp = 12; out.pc.ups = this.gainXp(12);
    }
    out.pc.lv = me.lv;
    // Reto 1 contra 1: de vez en cuando, si ganas y eres el mejor (o ganas a tu rival)
    const won = gA > gB || (gA === gB && pens && pens[0] > pens[1]);
    if (played && won && nm && (note >= 8 || (this.rivalsIn(nm.rival).length && note >= 7.5)) && cRnd() < 0.35) out.pc.duel = this.makeDuel(nm.rival);
    if (played && nm && !out.pc.duel && !me.event && cRnd() < 0.2) this.makeEvent(false, { after: won ? 'win' : 'loss', club: nm.rival });
    this.save();
    return out;
  },
  advance() {
    const sum = Career.advance.call(this);
    if (!sum && !this.data.me.event && cRnd() < 0.2) this.makeEvent();
    return sum;
  },

  /* ---------- Fin de temporada ---------- */
  endSeason() {
    const c = this.data, me = c.me, mm = this.mine();
    c.squad = c.squad.filter(m => m.id !== me.id);   // la Carrera gradúa a los de 6º: tú lo gestionas aparte (y nunca hay dos copias tuyas)
    c.fame = Math.max(c.fame, 40);
    const proSet = c.pro ? c.divs[1].slice() : null;
    const sum = Career.endSeason.call(this);
    if (proSet) {   // Liga Pro: nadie sube ni baja entre la Liga Pro y la liga japonesa
      const up = c.divs[1].filter(k => !proSet.includes(k));
      c.divs[1] = proSet; c.divs[2] = c.divs[2].filter(k => !proSet.includes(k)).concat(up);
      sum.moves = sum.moves.filter(x => !(x === 'down' && sum.div === 1) && !(x === 'up' && sum.div === 2));
      this.newSeason(false);
    }
    mm.year++; STAT_KEYS.forEach(k => this.addStat(mm, k, YEAR_GROWTH));
    c.squad.push(mm);
    c.pendingYouth = []; c.wc = null; c.over = null; c.fame = 50; c.forma = 100;
    sum.pc = this.seasonReview(sum, mm);
    me.forma = 100;
    this.autoLineup();
    this.save();
    return sum;
  },
  avg(notes) { return notes.length ? Math.round(notes.reduce((a, b) => a + b, 0) / notes.length * 10) / 10 : null; },
  seasonReview(sum, mm) {
    const c = this.data, me = c.me, S = me.season, P = Profile.data, R = [], avg = this.avg(S.notes);
    let tickets = 0, coins = S.goals * 20 + S.assists * 10 + S.apps * 5;
    if (S.goals >= 8) { tickets += 8; R.push(TX('👟 Bota de oro del club ({0} goles): +8 🎟️', S.goals)); me.awards.push({ season: sum.season, name: TX('Bota de oro del club') }); }
    if (avg != null && avg >= 7.5 && S.apps >= 5) { tickets += 10; R.push(TX('🏅 Mejor jugador de la temporada (nota {0}): +10 🎟️', avg)); me.awards.push({ season: sum.season, name: TX('Mejor jugador de la temporada') }); }
    if (sum.champion) R.push(TX('🏆 ¡Campeones de liga con tu club!'));
    if (sum.moves.includes('up')) R.push(TX('⬆️ ¡Tu club asciende!'));
    if (c.pro && sum.div === 1) { coins = Math.round(coins * 1.5) + 300; tickets += 3; R.push(TX('🌍 Temporada en la Liga Pro: +3 🎟️ y más monedas')); }
    // Rookie del año (tu primera temporada) y Balón de Oro (en la máxima categoría)
    const role = PLAYER(me.id).role, aw = { rookie: false, balon: false, balonWinner: null };
    if (!me.seasons.length && S.apps >= 5 && avg != null && avg >= 6.6) {
      tickets += 8; coins += 300; aw.rookie = true; me.awards.push({ season: sum.season, name: TX('Rookie del año') });
      R.push(TX('🌱 ¡Rookie del año! +8 🎟️ y +300 🪙'));
    }
    if (sum.div === 1 && S.apps >= 6 && avg != null && sum.pos <= 4 && (avg >= 7.5 && S.goals + S.assists >= 8 || role === 'DEF' && avg >= 7.8)) {
      tickets += 25; coins += 1500; P.rayos += 2; aw.balon = true; me.balon = (me.balon || 0) + 1;
      me.awards.push({ season: sum.season, name: TX('Balón de Oro') });
      R.push(TX('🏆 ¡BALÓN DE ORO! +25 🎟️, +1500 🪙 y +2 ⚡'));
    } else aw.balonWinner = this.balonWinner();
    P.tickets += tickets; P.coins += coins; Profile.save();
    me.seasons.push({ season: sum.season, club: c.club, div: sum.div, pro: !!c.pro, pos: sum.pos, apps: S.apps, starts: S.starts, goals: S.goals, assists: S.assists, avg, lv: me.lv });
    const review = { avg, apps: S.apps, starts: S.starts, goals: S.goals, assists: S.assists, rewards: R, tickets, coins, offers: [], callup: false, graduated: false, year: mm.year, awards: aw };
    // Ofertas de otros clubes: si juegas bien, de más arriba; si apenas juegas, alguno de abajo
    const ovr = this.ovr(mm), d = this.divOf(YOU), offers = [];
    const pickFrom = div => c.divs[div].filter(k => k !== YOU && TEAM(k)).sort(() => cRnd() - 0.5);
    if (avg != null && avg >= 6.9 && d > 1) pickFrom(d - 1).slice(0, avg >= 7.6 ? 2 : 1).forEach(k => offers.push({ key: k, why: 'up' }));
    if (avg != null && (avg >= 7.3 || (me.rumor === c.season && avg >= 6.6))) pickFrom(d).filter(k => this.rating(k) > this.myRating()).slice(0, 1).forEach(k => offers.push({ key: k, why: 'same' }));
    if (S.apps < 4 && d < 3) pickFrom(d + 1).slice(0, 1).forEach(k => offers.push({ key: k, why: 'down' }));
    // Un amigo de otro club te recomienda
    for (const [id, r] of Object.entries(me.rel)) {
      const k = this.clubOfPlayer(+id);
      if (r.t === 'amigo' && k && k !== YOU && !offers.some(o => o.key === k) && cRnd() < 0.4) { offers.push({ key: k, why: 'amigo', friend: +id }); break; }
    }
    me.offers = offers.length ? offers : null; review.offers = offers;
    // Convocatoria con tu selección (cada 3 temporadas) si destacas; el papel (titular, suplente o reserva) depende de tu nivel
    if (sum.season % 3 === 0 && (ovr >= 60 - 3 * (me.scout || 0) || (avg != null && avg >= 7.2))) {
      c.pwc = this.wcNew(sum.season); c.pwc.role = this.wcRole(avg); review.callup = c.pwc.role; me.callups++;
    }
    // Graduación: al acabar 3º → premios, colección y ofertas de la Liga Pro
    if (mm.year > PC_GRAD_YEAR && !me.graduated) { review.graduated = true; this.graduate(); review.offers = me.offers || []; }
    me.season = this.blankSeason();
    return review;
  },
  acceptOffer(key) {
    const c = this.data, o = (c.me.offers || []).find(x => x.key === key); if (!o) return false;
    const toPro = !!c.goPro;
    if (toPro) { this.enterPro(); c.goPro = false; }
    const old = c.club;
    this.joinClub(key); c.me.offers = null;
    if (c.week <= 1 || toPro) { this.newSeason(false); c.lastActivity = null; }   // la Liga Pro empieza siempre desde la semana 1
    else { this.renameSeason({ [YOU]: old, [key]: YOU }); c.me.trust = Math.min(c.me.trust, 0); this.autoLineup(); }   // a mitad de temporada: heredas la clasificación de tu nuevo club
    c.news.unshift(`${TX('T{0} S{1}', c.season, c.week)}${TX(': fichaje de')} ${PLAYER(c.me.id).name} ${TX('por')} ${this.teamName(YOU)}`); c.news.length = Math.min(c.news.length, 30);
    this.save(); return true;
  },
  rejectOffers() {
    const c = this.data;
    if (c.goPro && c.me.offers && c.me.offers.length) return this.acceptOffer(c.me.offers[0].key);   // a la Liga Pro se va sí o sí
    c.me.offers = null; this.save();
  },
  divLabel(d) {
    if (this.data && this.data.pro) return { 1: TX('Liga Pro'), 2: TX('Liga japonesa'), 3: TX('Segunda japonesa') }[d];
    return DIV_NAME[d] + ' ' + TX('División');
  },
  isPro(key) { const T = TEAM(key); return !!(T && T.pro); },

  /* ---------- Liga Pro ---------- */
  // Tres clubes de la Liga Pro según tu nivel (cuanto mejor, más fuertes)
  proOffers() {
    ensureProTeams();
    const c = this.data, o = this.ovrMe();
    const list = PRO_CLUBS.map(C => C.key).filter(k => TEAM(k) && k !== c.club).sort((a, b) => this.proRating(a) - this.proRating(b));
    const s = Math.max(0, Math.min(list.length - 3, Math.floor((o - 50) / 3)));
    return list.slice(s, s + 3).map(key => ({ key, why: 'pro' }));
  },
  proRating(k) {
    const T = TEAM(k); return Math.round(T.players.reduce((t, p) => t + STAT_KEYS.reduce((a, s) => a + careerIE(PLAYER(p.id), s), 0) / STAT_KEYS.length, 0) / T.players.length * PRO_FACTOR * RIVAL_K);
  },
  // La Liga Pro pasa a ser la 1.ª; la antigua Primera y Segunda japonesas quedan por debajo
  enterPro() {
    ensureProTeams();
    const c = this.data; if (c.pro) return;
    const pro = PRO_CLUBS.map(C => C.key).filter(k => TEAM(k)), old = c.divs, d = this.myDiv();
    c.divs = { 1: pro, 2: old[1].slice(), 3: old[2].slice() };
    if (d === 3) c.divs[3][c.divs[3].length - 1] = YOU;   // tu club entra en el hueco del último
    c.pro = true;
    this.defaults();   // plantillas de los clubes nuevos
    c.ratings = {};
  },
  // Renombra claves de club en la temporada en curso (calendario, resultados, tablas, Copa y playoffs)
  renameSeason(map) {
    const c = this.data, R = x => (typeof x === 'string' && map[x] !== undefined ? map[x] : x);
    const deep = v => Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : R(v);
    c.fix = deep(c.fix); c.results = deep(c.results);
    for (const d in c.tables) c.tables[d] = Object.fromEntries(Object.entries(c.tables[d]).map(([k, r]) => [R(k), r]));
    if (c.cup) { c.cup = deep(c.cup); if (!c.cup.winner) c.cup.out = c.cup.round > 0 && !c.cup.ties.some(p => p.includes(YOU)); }
    if (c.po) c.po = deep(c.po);
    c.ratings = {};
  },

  /* ---------- Pedir el traspaso ---------- */
  window() {
    const w = this.data.week; return Object.keys(PC_WINDOWS).find(k => PC_WINDOWS[k].includes(w)) || null;
  },
  canAsk() { const c = this.data, w = this.window(); return !!w && !c.me.offers && c.me.asked !== c.season + ':' + w; },
  askTransfer() {
    const c = this.data, me = c.me, w = this.window(); if (!this.canAsk()) return null;
    me.asked = c.season + ':' + w;
    const d = this.myDiv(), o = this.ovrMe(), last = me.seasons[me.seasons.length - 1];
    const avg = me.season.notes.length ? this.avg(me.season.notes) : last ? last.avg : null;
    const pick = div => (c.divs[div] || []).filter(k => k !== YOU && TEAM(k)).sort(() => cRnd() - 0.5);
    const offers = [];
    // clubes de tu división de un nivel parecido; si destacas, alguno de arriba; si no juegas, alguno de abajo
    pick(d).filter(k => Math.abs(this.rating(k) - this.myRating()) <= 8).slice(0, 2).forEach(k => offers.push({ key: k, why: 'same' }));
    if (d > 1 && (o >= this.myRating() + 2 || (avg != null && avg >= 7))) pick(d - 1).slice(0, 1).forEach(k => offers.push({ key: k, why: 'up' }));
    if (d < 3 && !this.starter()) pick(d + 1).slice(0, 1).forEach(k => offers.push({ key: k, why: 'down' }));
    me.trust = Math.max(-8, me.trust - 1.5);   // al entrenador no le gusta que quieras irte
    if (offers.length) me.offers = offers;
    this.save();
    return offers;
  },

  /* ---------- Mundial con tu selección ---------- */
  // El creado elige país al crearse; los jugadores reales van con su selección de verdad (los japoneses, Inazuma Japón)
  myNat() { const me = this.data.me; return me.nat || natOfPlayer(me.pd || PLAYER(me.id)); },
  natName(k) { return natName(k); },
  natCrest(k) { return natCrest(k); },
  wcNew(season) {
    const nat = this.myNat();
    // rivales: las selecciones del Inazuma 3 menos la tuya; si no eres japonés, Inazuma Japón ocupa el sitio de Neo Japan
    const n = NATIONS.filter(k => TEAM(k) && k !== nat && !(nat !== 'JP' && k === 'Neo Japan')).sort(() => cRnd() - 0.5);
    if (nat !== 'JP') { n.splice(Math.floor(cRnd() * 5), 0, 'JP'); }
    return { season, nat, opps: n.slice(0, 5), round: 0, pts: 0, gf: 0, ga: 0, log: [], state: 'on', notes: [], role: 'titular', moves: [] };
  },
  wcRoundName(r) { return r < 3 ? TX('Fase de grupos · partido {0}', r + 1) : r === 3 ? TX('Semifinal') : TX('Final'); },
  // Jugadores que puede convocar una selección (sin ti)
  natPool(nat) {
    const c = this.data, pool = [], seen = new Set([c.me.id, this.twinOf()]);
    const add = m => { const pd = PLAYER(m.id); if (!pd || !pd.cs || pd.custom || seen.has(m.id)) return; seen.add(m.id); pool.push(m); };
    if (nat === 'JP') {
      c.squad.forEach(m => { if (!m.spr && !PLAYER(m.id).abroad) add(m); });
      for (const k in c.clubs) c.clubs[k].forEach(m => { if (PLAYER(m.id) && !PLAYER(m.id).abroad) add({ id: m.id, up: {}, known: startingTechs(PLAYER(m.id)) }); });
    } else {
      c.squad.forEach(m => { if (!m.spr && PLAYER(m.id).abroad === nat) add(m); });
      (TEAM(nat) ? TEAM(nat).players : []).forEach(p => add({ id: p.id, up: {}, known: startingTechs(PLAYER(p.id)) }));
      GAME.players.forEach(p => { if (p.abroad === nat) add({ id: p.id, up: {}, known: startingTechs(p) }); });
    }
    return pool;
  },
  // Once de una selección por puestos (los mejores); withMe: tu jugador en un hueco de su puesto
  natLineup(nat, withMe) {
    const c = this.data, roles = FORMATIONS[c.formation].roles, myRole = PLAYER(c.me.id).role, pool = this.natPool(nat);
    const used = new Set([c.me.id]), ids = roles.map(() => null), myI = roles.indexOf(myRole) >= 0 ? roles.lastIndexOf(myRole) : roles.length - 1;
    if (withMe) ids[myI] = c.me.id;
    roles.forEach((r, i) => {
      if (ids[i] != null) return;
      const best = pool.filter(m => !used.has(m.id) && (r !== 'POR' || PLAYER(m.id).role === 'POR')).sort((a, b) => Career.rate.call(this, b, r) - Career.rate.call(this, a, r))[0];
      if (best) { ids[i] = best.id; used.add(best.id); }
    });
    return { roles, ids: ids.filter(x => x != null).length === roles.length ? ids : ids.map((x, i) => x == null ? pool[i] && pool[i].id : x), pool, myI };
  },
  natTeam(nat, withMe, factor = 1) {
    const c = this.data, L = this.natLineup(nat, withMe), pos = layout(L.roles);
    const memberOf = id => id === c.me.id ? this.mine() : L.pool.find(m => m.id === id);
    const kit = nat === 'JP' ? { a: '#1a3aa8', b: '#f2f2f2' } : (TEAM(nat).kit || { a: '#f2f2f2', b: '#1a1a1a' });
    return { name: natName(nat), crest: natCrest(nat), myI: L.myI, players: L.ids.map((id, i) => {
      const m = memberOf(id), pd = PLAYER(id), mul = id === c.me.id ? this.myForma() : factor;
      const techs = id === c.me.id ? this.equipped(m) : (m.known || []).slice(0, TECH_SLOTS);
      return Object.assign(buildMatchPlayer(id, L.roles[i], k => Math.round(this.stat(m, k) * mul), techs, [], i, pos[i]),
        { sprite: Object.assign({}, Sprites.refOf(pd), L.roles[i] === 'POR' ? {} : { kit }) });
    }) };
  },
  // Tu papel en la convocatoria: lo que te separa del titular de tu puesto (y tu nota media)
  wcRole(avg) {
    const c = this.data, myRole = PLAYER(c.me.id).role, roles = FORMATIONS[c.formation].roles, slots = Math.max(1, roles.filter(r => r === myRole).length);
    const mine = Career.rate.call(this, this.mine(), myRole);
    const rivals = this.natPool(this.myNat()).filter(m => PLAYER(m.id).role === myRole).map(m => Career.rate.call(this, m, myRole)).sort((x, y) => y - x);
    const gap = (rivals[slots - 1] != null ? rivals[slots - 1] : 0) - mine;   // cuánto le falta para quitarle el sitio al último titular
    let lv = gap <= PC_WC_GAP[0] ? 0 : gap <= PC_WC_GAP[1] ? 1 : 2;
    if (avg != null && avg >= 7.5 && lv > 0) lv--;
    return PC_WC_ROLES[lv];
  },
  wcFix() { const W = this.data.pwc; if (W) { W.role = W.role || 'titular'; W.moves = W.moves || []; W.nat = W.nat || this.myNat(); } return W; },   // partidas de antes
  wcTeams(opts = {}) {
    this.wcFix();
    const c = this.data, W = c.pwc, nat = W.nat || this.myNat();
    const avg = t => Math.round(t.players.reduce((s, p) => s + (p.kick + p.control + p.defense + p.body) / 4, 0) / t.players.length);
    const playing = W.role === 'titular' || opts.subIn;
    const A = this.natTeam(nat, playing);
    const opp = W.opps[W.round];
    // Las selecciones se ajustan a la fuerza de la tuya: un poco mejores, y más en las eliminatorias
    const jp = avg(A), raw = opp === 'JP' ? avg(this.natTeam('JP', false)) : avg(rivalTeam(opp, 1, 1)), f = Math.max(0.6, Math.min(1.3, (jp + 3 + W.round * 1.5) / raw));
    const B = opp === 'JP' ? this.natTeam('JP', false, f) : rivalTeam(opp, f, 1);
    return { A, B, lockId: playing ? 'A' + A.myI : null, opp, rA: jp, rB: avg(B), nat };
  },
  // Suplente: se simula la primera parte y sales en la segunda
  wcBenchPlan() {
    const t = this.wcTeams(), lam = (x, y) => Math.max(0.1, 1.35 * Math.exp((x - y) / 12)) * (1 - PC_SUB_PART);
    return { gA: this.poisson(lam(t.rA, t.rB)), gB: this.poisson(lam(t.rB, t.rA)) };
  },
  wcPart() { const W = this.wcFix(); return W.role === 'titular' ? 1 : W.role === 'suplente' ? PC_SUB_PART : 0; },
  wcSimulate() {
    const t = this.wcTeams(), part = this.wcPart(), [gA, gB] = this.simScore(t.rA, t.rB, undefined, undefined, 14);
    const won = gA > gB, goals = part && gA ? Array.from({ length: gA }, () => cRnd() < 0.3 * part ? 1 : 0).reduce((a, b) => a + b, 0) : 0;
    const note = part ? Math.round(Math.max(3, Math.min(9.5, 6 + (won ? 0.45 : gA === gB ? 0 : -0.3) + goals + (cRnd() - 0.5) * 1.4)) * 10) / 10 : null;
    return this.wcFinish(gA, gB, note, { gl: goals }, true);
  },
  wcFinish(gA, gB, note, stats, simulated) {
    this.wcFix();
    const c = this.data, W = c.pwc, me = c.me, ko = W.round >= 3, part = this.wcPart();
    let pens = null;
    if (ko && gA === gB) pens = this.penalties(60, 60);
    const won = gA > gB || (gA === gB && pens && pens[0] > pens[1]);
    W.log.push({ round: W.round, opp: W.opps[W.round], gA, gB, pens, note, role: W.role });
    if (note != null) W.notes.push(note);
    W.gf += gA; W.ga += gB;
    const P = Profile.data; let msg = '';
    me.total.goals += (stats && stats.gl) || 0;
    if (note != null) this.gainXp(Math.round(note * 12 * (simulated ? 0.7 : 1) * (part < 1 ? 0.7 : 1)));
    // Ganarse (o perder) el puesto
    let move = null;
    if (W.role === 'titular' && note != null && note < 5.5) move = 'suplente';
    else if (W.role === 'suplente' && note != null && note >= 7.2) move = 'titular';
    else if (W.role === 'reserva') {
      const t = this.wcTeams(), worst = Math.min(...t.A.players.filter(p => p.role === PLAYER(me.id).role).map(p => (p.kick + p.control + p.defense + p.body) / 4));
      const gap = worst - this.ovrMe();
      W.resN = (W.resN || 0) + 1;   // a los 2 partidos de reserva, el seleccionador te da minutos seguro
      if (W.resN >= 2 || cRnd() < Math.max(0.25, Math.min(0.85, 0.55 - gap * 0.05))) move = 'suplente';
    }
    const from = W.role;
    if (move) { W.moves.push({ round: W.round, from: W.role, to: move }); W.role = move; }
    if (!ko) {
      W.pts += won ? 3 : gA === gB ? 1 : 0;
      W.round++;
      if (W.round === 3) {
        if (W.pts >= 4 || (W.pts === 3 && W.gf > W.ga)) msg = TX('¡Pasáis a semifinales!');
        else { W.state = 'out'; W.place = 'grupo'; msg = TX('Eliminados en la fase de grupos'); }
      }
    } else if (!won) { W.state = 'out'; W.place = W.round === 3 ? 'semi' : 'final'; msg = W.round === 3 ? TX('Eliminados en semifinales') : TX('Subcampeones del mundo'); }
    else if (W.round === 3) { W.round++; msg = TX('¡A la final!'); }
    else { W.state = 'champion'; W.place = 'campeón'; msg = TX('¡Campeones del mundo!'); }
    if (W.state !== 'on') {
      const R = { campeón: [25, 3000], final: [12, 1500], semi: [6, 700], grupo: [2, 300] }[W.place];
      P.tickets += R[0]; P.coins += R[1]; Profile.save();
      W.reward = { tickets: R[0], coins: R[1] };
      if (W.place === 'campeón') { me.awards.push({ season: W.season, name: TX('Campeón del mundo con {0}', natName(W.nat || this.myNat())) }); me.wcChamp = (me.wcChamp || 0) + 1; }
    }
    this.save();
    return { gA, gB, pens, won, msg, note, done: W.state !== 'on', move, from };
  },
  wcClose() { this.data.pwc = null; this.save(); },

  /* ---------- Amistades y rivalidades ---------- */
  // Club en el que juega ahora (solo clubes que están en alguna liga)
  clubOfPlayer(id) { const c = this.data; if (c.squad.some(m => m.id === id)) return YOU; return [1, 2, 3].flatMap(d => c.divs[d]).find(k => k !== YOU && c.clubs[k] && c.clubs[k].some(p => p.id === id)) || null; },
  addRel(id, t) {
    const me = this.data.me, r = me.rel[id];
    if (r && r.t === t) { r.lv = Math.min(3, r.lv + 1); return r; }
    const same = Object.entries(me.rel).filter(([k, x]) => x.t === t && +k !== id);
    if (same.length >= PC_REL_MAX[t]) { const old = same.sort((a, b) => a[1].lv - b[1].lv || a[1].since - b[1].since)[0]; delete me.rel[old[0]]; }
    me.rel[id] = { t, lv: 1, since: this.data.season };
    return me.rel[id];
  },
  friendKeys() { const c = this.data; return Object.entries(c.me.rel).filter(([id, r]) => r.t === 'amigo' && (c.lineup || []).includes(+id)).map(([id]) => +id); },
  rivalsIn(club) { const c = this.data, L = club && c.clubs[club]; return L ? Object.entries(c.me.rel).filter(([id, r]) => r.t === 'rival' && L.some(p => p.id === +id)).map(([id]) => +id) : []; },
  relList() { return Object.entries(this.data.me.rel).map(([id, r]) => Object.assign({ id: +id, club: this.clubOfPlayer(+id) }, r)).filter(r => PLAYER(r.id)).sort((a, b) => b.lv - a.lv); },
  // El mejor de la Liga (para el Balón de Oro cuando no lo ganas tú)
  balonWinner() {
    const c = this.data; let best = null, bv = -1;
    for (const k of c.divs[1]) if (k !== YOU) for (const p of c.clubs[k] || []) { const pd = PLAYER(p.id); if (pd && p.role !== 'POR') { const v = this.sumIE(pd) + cRnd() * 40; if (v > bv) { bv = v; best = { id: p.id, club: k }; } } }
    return best;
  },

  /* ---------- Reto 1 contra 1 (minicampo, cada uno con su portero) ---------- */
  weekNo() { return this.data.season * 20 + this.data.week; },
  makeDuel(club, force) {
    const c = this.data, me = c.me, L = c.clubs[club];
    if (!L || me.duel || (!force && this.weekNo() - (me.lastDuel || -99) < PC_DUEL_GAP)) return null;
    const riv = this.rivalsIn(club).find(id => L.find(p => p.id === id).role !== 'POR');
    const pick = riv || L.filter(p => p.role !== 'POR').sort((a, b) => this.sumIE(PLAYER(b.id)) - this.sumIE(PLAYER(a.id)))[0];
    if (!pick) return null;
    const id = riv || pick.id;
    if (!riv) this.addRel(id, 'rival');
    me.duel = { id, club, week: this.weekNo() }; me.lastDuel = this.weekNo();
    this.save();
    return PLAYER(id).name;
  },
  duelTeams() {
    const c = this.data, D = c.me.duel, L = c.clubs[D.club], f = this.aiFactor(D.club);
    if (!this.lineupOk()) this.autoLineup();
    const gkSlot = FORMATIONS[c.formation].roles.indexOf('POR');
    const myGk = c.squad.filter(m => m.id !== c.me.id && playsAs(PLAYER(m.id), 'POR')).sort((a, b) => this.ovr(b) - this.ovr(a))[0]
      || this.m(c.lineup[gkSlot]) || c.squad.find(m => m.id !== c.me.id);   // si no hay portero de verdad, el que juega de portero
    const theirGk = L.find(p => p.role === 'POR'), them = L.find(p => p.id === D.id) || L.find(p => p.role !== 'POR');
    const spot = { home: [0, 12], ko: [0, 11] };
    const mine = this.mine(), A = { name: c.school, players: [] }, B = { name: this.teamName(D.club), key: D.club, players: [] };
    if (myGk) A.players.push(Object.assign(buildMatchPlayer(myGk.id, 'POR', k => this.stat(myGk, k), this.equipped(myGk).filter(t => TECH(t).type === 'parada'), [], 0), { sprite: myGk.spr ? { file: myGk.spr.file, row: myGk.spr.row } : Sprites.refOf(PLAYER(myGk.id)) }));
    A.players.push(Object.assign(buildMatchPlayer(c.me.id, PLAYER(c.me.id).role, k => Math.round(this.stat(mine, k) * this.myForma()), this.equipped(mine), [], 1, spot),
      { sprite: Object.assign({}, Sprites.refOf(PLAYER(c.me.id)), { kit: c.kit }) }));
    const T = TEAM(D.club), kit = T && (T.kit || T.kitAuto);
    [theirGk, them].filter(Boolean).forEach((p, i) => {
      const pd = PLAYER(p.id), techs = pd.moves.map(x => x[0]).filter(t => TECH(t) && (i === 0 ? TECH(t).type === 'parada' : TECH(t).type !== 'parada')).slice(0, 2);
      B.players.push(Object.assign(buildMatchPlayer(p.id, i === 0 ? 'POR' : p.role, k => Math.round(careerIE(pd, k) * f * RIVAL_K), techs, [], 5 + i, i === 0 ? null : spot),
        { sprite: p.file ? { file: p.file, row: p.row } : Object.assign(Sprites.refOf(pd), i === 0 || !kit ? {} : { kit }) }));
    });
    // Cada jugador usa su fila de la hoja de sprites del partido (A primero, luego B)
    [...A.players, ...B.players].forEach((p, i) => { p.row = i; });
    return { A, B, lockId: 'A' + (myGk ? 1 : 0), club: D.club, rival: D.id };
  },
  // Simulado: gana el primero en llegar a 3
  duelSimulate() {
    const D = this.data.me.duel, pd = PLAYER(D.id), them = Math.round(STAT_KEYS.reduce((t, k) => t + careerIE(pd, k), 0) / STAT_KEYS.length * this.aiFactor(D.club) * RIVAL_K);
    const pA = 1 / (1 + Math.exp(-(this.ovrMe() - them) / 7)); let a = 0, b = 0;
    while (a < 3 && b < 3) { if (cRnd() < pA) a++; else b++; }
    return this.duelResult(a, b, true);
  },
  duelResult(gA, gB, simulated) {
    const c = this.data, me = c.me, D = me.duel; if (!D) return null;
    const win = gA > gB, draw = gA === gB, P = Profile.data, name = PLAYER(D.id).name;
    const xp = win ? 45 : draw ? 25 : 15, res = { win, draw, gA, gB, name, xp, tickets: 0, msg: '' };
    this.gainXp(Math.round(xp * (simulated ? 0.8 : 1)));
    if (win) {
      me.duels.w++; me.trust = Math.min(10, me.trust + 0.5);
      const r = this.addRel(D.id, 'rival'); if (cRnd() < 0.4) { res.tickets = 2; P.tickets += 2; Profile.save(); }
      res.msg = r.lv >= 3 ? TX('¡Le ganas a {0}! Vuestra rivalidad ya es legendaria.', name) : TX('¡Le ganas a {0}! La rivalidad sube de nivel.', name);
    } else if (draw) res.msg = TX('Empate con {0}: esto no ha terminado.', name);
    else { me.duels.l++; me.trust = Math.max(-8, me.trust - 0.5); res.msg = TX('{0} te gana el reto. El míster se ha enterado…', name); }
    me.duel = null; this.save();
    return res;
  },
  duelDecline() { const me = this.data.me, name = PLAYER(me.duel.id).name; me.duel = null; me.forma = Math.max(20, me.forma - 5); this.save(); return TX('No aceptas. {0} dice por ahí que te dio miedo.', name); },

  /* ---------- Decisiones (prensa, vida fuera del campo, vestuario) ---------- */
  mates() { const c = this.data; return c.squad.filter(m => m.id !== c.me.id && PLAYER(m.id)); },
  makeEvent(force, ctx = {}) {
    const c = this.data, me = c.me;
    if (me.event || (!force && this.weekNo() - (me.lastEvent || -99) < 3)) return null;
    const mates = this.mates(), pick = a => a[Math.floor(cRnd() * a.length)];
    const rivals = this.relList().filter(r => r.t === 'rival');
    const list = [];
    const cap0 = mates.slice().sort((a, b) => this.ovr(b) - this.ovr(a))[0], ovr = this.ovrMe();
    if (ctx.after === 'win') {
      list.push({ k: 'prensaWin', club: ctx.club }, { k: 'futuro', club: ctx.club }, { k: 'fans' });
      if (rivals.length) list.push({ k: 'prensaRival', a: rivals[0].id });
      if (ovr >= 60 && !c.pro) list.push({ k: 'rumor' });
      if (ovr >= 55) list.push({ k: 'tele' });
    }
    if (ctx.after === 'loss') list.push({ k: 'prensaLoss', club: ctx.club }, { k: 'critica' });
    if (!ctx.after) {
      list.push({ k: 'fiesta' }, { k: 'madrugar' }, { k: 'anuncio' }, { k: 'lluvia' }, { k: 'abuela' }, { k: 'examen' }, { k: 'dieta' },
        { k: 'perro' }, { k: 'tobillo' }, { k: 'leyenda' }, { k: 'tactica' }, { k: 'streamer' }, { k: 'ojeador' });
      if (mates.length) { list.push({ k: 'botas', a: pick(mates).id }, { k: 'cena' }, { k: 'penalti', a: pick(mates).id }, { k: 'lesionado', a: pick(mates).id }); }
      if (cap0) list.push({ k: 'brazalete', a: cap0.id });
      if (c.season === 1 && mates.length) list.push({ k: 'novatada', a: pick(mates).id });
      if (me.clubs.length > 1) list.push({ k: 'exclub', club: me.clubs[me.clubs.length - 2] });
      if (c.pro) list.push({ k: 'refresco' }, { k: 'charla' });
      const kids = mates.filter(m => m.year <= 1); if (kids.length) list.push({ k: 'canterano', a: pick(kids).id });
      if (mates.length >= 2) { const a = pick(mates), b = pick(mates.filter(m => m !== a)); list.push({ k: 'pelea', a: a.id, b: b.id }); }
      const cap = mates.slice().sort((a, b) => this.ovr(b) - this.ovr(a))[0]; if (cap) list.push({ k: 'capitan', a: cap.id });
      if (rivals.length) list.push({ k: 'pique', a: rivals[0].id });
    }
    if (!list.length) return null;
    // Que no se repitan: fuera las 12 últimas que te han salido (si no queda ninguna, cualquiera)
    me.evSeen = me.evSeen || [];
    const fresh = list.filter(e => !me.evSeen.includes(e.k)), E = pick(fresh.length ? fresh : list);
    me.evSeen = me.evSeen.filter(k => k !== E.k).concat(E.k).slice(-12);
    me.event = E; me.lastEvent = this.weekNo();
    this.save();
    return me.event;
  },
  // Texto y opciones de la decisión pendiente
  eventView() {
    const c = this.data, E = c.me.event; if (!E) return null;
    const N = id => (PLAYER(id) || {}).name || '?', club = E.club ? this.teamName(E.club) : '';
    const V = {
      prensaWin: [TX('Rueda de prensa'), TX('Los periodistas te rodean tras ganar al {0}. ¿Qué dices?', club), [TX('«El mérito es del equipo»'), TX('«Hoy he sido el mejor del campo»'), TX('No decir nada')]],
      prensaLoss: [TX('Rueda de prensa'), TX('Habéis perdido contra el {0}. Te preguntan qué ha pasado.', club), [TX('«La culpa es mía»'), TX('«El árbitro nos ha robado»'), TX('«Habrá revancha»')]],
      fiesta: [TX('Fiesta el sábado'), TX('Tus compañeros montan una fiesta. El lunes hay entrenamiento.'), [TX('Ir a la fiesta'), TX('Quedarse en casa')]],
      madrugar: [TX('Entrenamiento al amanecer'), TX('El preparador físico ofrece una sesión extra a las 6 de la mañana.'), [TX('Allí estaré'), TX('Prefiero dormir')]],
      anuncio: [TX('Un anuncio de botas'), TX('Una marca de botas quiere grabar un anuncio contigo.'), [TX('Aceptar el anuncio'), TX('Centrarme en el fútbol')]],
      canterano: [TX('Un canterano te pide consejo'), TX('{0} no se atreve con los mayores y te pide ayuda.', N(E.a)), [TX('Ayudarle'), TX('No tengo tiempo')]],
      pelea: [TX('Bronca en el vestuario'), TX('{0} y {1} discuten a gritos por una jugada.', N(E.a), N(E.b)), [TX('Dar la razón a {0}', N(E.a)), TX('Dar la razón a {0}', N(E.b)), TX('Poner paz')]],
      capitan: [TX('El capitán te busca'), TX('{0} te pide que te quedes a entrenar con él después de la sesión.', N(E.a)), [TX('Claro que sí'), TX('Hoy no puedo')]],
      pique: [TX('Pique en las redes'), TX('Tu rival {0} se burla de ti en las redes.', N(E.a)), [TX('Contestarle'), TX('Ignorarle')]],
      futuro: [TX('Entrevista en la radio'), TX('Te preguntan: «¿Dónde te ves dentro de cinco años?»'), [TX('«Aquí, en mi club»'), TX('«Ganando el Balón de Oro»'), TX('«Paso a paso»')]],
      fans: [TX('Niños a la salida'), TX('Un grupo de niños te espera a la salida del estadio para pedirte autógrafos.'), [TX('Firmar a todos'), TX('Saludar e irte, que llueve')]],
      prensaRival: [TX('Te preguntan por tu rival'), TX('«¿Qué opinas de {0}?»', N(E.a)), [TX('«Es un gran jugador»'), TX('«¿Quién?»'), TX('Cambiar de tema')]],
      rumor: [TX('Rumores de fichaje'), TX('Un periódico dice que un club de Primera te quiere fichar.'), [TX('Desmentirlo'), TX('Dejarlo caer…'), TX('No comentar')]],
      tele: [TX('Programa de televisión'), TX('Te invitan a un programa de televisión el domingo por la noche.'), [TX('Ir al programa'), TX('Mejor descansar')]],
      critica: [TX('Te critican en la radio'), TX('Un comentarista dice que hoy has sido «un fantasma».'), [TX('Responderle en las redes'), TX('Callar y entrenar el doble')]],
      lluvia: [TX('Diluvio'), TX('Llueve a mares y el entrenamiento de hoy es voluntario.'), [TX('Ir igualmente'), TX('Quedarse en casa')]],
      abuela: [TX('Cumpleaños de tu abuela'), TX('Tu abuela cumple 80 años, pero coincide con el entrenamiento.'), [TX('Ir a la fiesta de la abuela'), TX('Mandarle un mensaje e ir a entrenar')]],
      examen: [TX('Semana de exámenes'), TX('Tienes un examen importante y el míster ha puesto una sesión de vídeo.'), [TX('Estudiar'), TX('Ir a la sesión de vídeo')]],
      dieta: [TX('El nutricionista'), TX('El nutricionista te propone una dieta muy estricta durante un mes.'), [TX('Aceptar la dieta'), TX('Ni hablar, el ramen es sagrado')]],
      perro: [TX('Un perro callejero'), TX('Un perro callejero te sigue a casa después del entrenamiento.'), [TX('Adoptarlo'), TX('Llevarlo a una protectora')]],
      tobillo: [TX('Molestias en el tobillo'), TX('Notas un pinchazo en el tobillo antes de entrenar.'), [TX('Parar y descansar'), TX('Aguantar y entrenar')]],
      leyenda: [TX('Una leyenda en el campo'), TX('Un exjugador legendario pasa por el entrenamiento y se ofrece a enseñarte un truco.'), [TX('¡Enséñeme, por favor!'), TX('Gracias, pero tengo prisa')]],
      tactica: [TX('Charla con el míster'), TX('El míster te pregunta en qué quieres mejorar este mes.'), [TX('En el tiro'), TX('En el regate'), TX('En defensa')]],
      streamer: [TX('Un streamer famoso'), TX('Un streamer muy famoso quiere jugar contigo a un videojuego en directo.'), [TX('Aceptar el directo'), TX('Rechazarlo')]],
      ojeador: [TX('Ojeador en la grada'), TX('Te avisan de que un ojeador de Inazuma Japón viene a ver el entrenamiento.'), [TX('Darlo todo'), TX('Entrenar como siempre')]],
      botas: [TX('¿Y mis botas?'), TX('{0} ha escondido tus botas antes del entrenamiento.', N(E.a)), [TX('Reírte y devolvérsela'), TX('Enfadarte de verdad')]],
      cena: [TX('Cena de equipo'), TX('El equipo organiza una cena para unir al grupo. Paga cada uno lo suyo.'), [TX('Ir a la cena'), TX('Quedarse en casa')]],
      penalti: [TX('¿Quién tira el penalti?'), TX('Tú y {0} queréis tirar los penaltis esta temporada.', N(E.a)), [TX('Pedirlo para ti'), TX('Cedérselo a {0}', N(E.a))]],
      lesionado: [TX('Un compañero lesionado'), TX('{0} se ha lesionado y está muy desanimado.', N(E.a)), [TX('Ir a verle'), TX('Mandarle un mensaje')]],
      brazalete: [TX('Capitán por un día'), TX('El míster busca capitán para el próximo partido. {0} también lo quiere.', N(E.a)), [TX('Ofrecerte'), TX('Proponer a {0}', N(E.a))]],
      novatada: [TX('La novatada'), TX('Los veteranos te preparan la novatada de los nuevos: cantar delante de todos.'), [TX('Cantar con ganas'), TX('Negarte')]],
      exclub: [TX('Tu antiguo club'), TX('El {0} te invita a sacar de honor en su próximo partido.', club), [TX('Ir con mucho gusto'), TX('No tengo tiempo')]],
      refresco: [TX('Contrato publicitario'), TX('Una marca de refrescos te ofrece un contrato de publicidad.'), [TX('Firmar'), TX('No, me centro en jugar')]],
      charla: [TX('Charla en tu instituto'), TX('Tu antiguo instituto te invita a dar una charla a los chavales del equipo.'), [TX('Ir a la charla'), TX('No puedo ir')]],
    }[E.k];
    return V ? { title: V[0], text: V[1], opts: V[2] } : null;
  },
  resolveEvent(i) {
    const c = this.data, me = c.me, E = me.event; if (!E) return null;
    const m = this.mine(), N = id => (PLAYER(id) || {}).name || '?', forma = d => { me.forma = Math.max(20, Math.min(100, me.forma + d)); };
    const trust = d => { me.trust = Math.max(-8, Math.min(10, me.trust + d)); }, mates = this.mates(), anyMate = () => mates[Math.floor(cRnd() * mates.length)];
    const bestOf = club => { const L = c.clubs[club] || []; const p = L.filter(q => q.role !== 'POR').sort((a, b) => this.sumIE(PLAYER(b.id)) - this.sumIE(PLAYER(a.id)))[0]; return p && p.id; };
    let msg = '';
    switch (E.k + ':' + i) {
      case 'prensaWin:0': { trust(1); const f = anyMate(); if (f) { this.addRel(f.id, 'amigo'); msg = TX('Al míster le gusta. {0} te lo agradece: ahora sois amigos.', N(f.id)); } else msg = TX('Al míster le gusta.'); break; }
      case 'prensaWin:1': { forma(5); this.gainXp(10); const r = bestOf(E.club); if (r) { this.addRel(r, 'rival'); msg = TX('Subidón de moral… pero {0} no lo olvidará: ahora es tu rival.', N(r)); } else msg = TX('Subidón de moral.'); break; }
      case 'prensaWin:2': forma(5); msg = TX('Te vas a casa tranquilo. +5 de forma.'); break;
      case 'prensaLoss:0': trust(1.5); msg = TX('El vestuario valora que des la cara.'); break;
      case 'prensaLoss:1': forma(5); trust(-0.5); msg = TX('Te desahogas, pero al míster no le hace gracia.'); break;
      case 'prensaLoss:2': { this.gainXp(10); const r = bestOf(E.club); if (r) { this.addRel(r, 'rival'); msg = TX('{0} recoge el guante: ahora es tu rival.', N(r)); } else msg = TX('Te motivas para el próximo partido.'); break; }
      case 'fiesta:0': { forma(-15); this.gainXp(10); const f = anyMate(); if (f) { this.addRel(f.id, 'amigo'); msg = TX('Noche épica con {0}: ahora sois amigos. El lunes cuesta…', N(f.id)); } else msg = TX('Noche épica. El lunes cuesta…'); break; }
      case 'fiesta:1': forma(10); msg = TX('Descansas como un bebé. +10 de forma.'); break;
      case 'madrugar:0': { const k = pickR(PC_BASE[PLAYER(me.id).role] ? Object.keys(PC_BASE[PLAYER(me.id).role]).filter(x => STAT_KEYS.includes(x)) : STAT_KEYS); this.addStat(m, k, 1); this.checkTier(); forma(-10); msg = TX('+1 en {0}, aunque acabas reventado.', STAT_LABEL[k]); break; }
      case 'madrugar:1': forma(5); msg = TX('Dormir también es entrenar. +5 de forma.'); break;
      case 'anuncio:0': Profile.data.coins += 250; Profile.save(); forma(-5); msg = TX('+250 🪙. Grabar cansa más de lo que parece.'); break;
      case 'anuncio:1': trust(0.5); msg = TX('El míster valora que te centres en el fútbol.'); break;
      case 'canterano:0': this.addRel(E.a, 'amigo'); this.gainXp(8); msg = TX('{0} no lo olvidará: ahora sois amigos.', N(E.a)); break;
      case 'canterano:1': msg = TX('{0} se va cabizbajo.', N(E.a)); break;
      case 'pelea:0': this.addRel(E.a, 'amigo'); msg = TX('{0} te lo agradece: ahora sois amigos.', N(E.a)); break;
      case 'pelea:1': this.addRel(E.b, 'amigo'); msg = TX('{0} te lo agradece: ahora sois amigos.', N(E.b)); break;
      case 'pelea:2': trust(1); this.gainXp(5); msg = TX('Pones paz. El míster te ve madera de capitán.'); break;
      case 'capitan:0': this.addRel(E.a, 'amigo'); this.addStat(m, 'control', 1); this.checkTier(); msg = TX('+1 en control y un amigo nuevo: {0}.', N(E.a)); break;
      case 'capitan:1': forma(5); msg = TX('Otra vez será.'); break;
      case 'pique:0': this.addRel(E.a, 'rival'); this.gainXp(5); msg = TX('La rivalidad con {0} se calienta.', N(E.a)); break;
      case 'pique:1': trust(0.5); msg = TX('Ni caso. El míster valora tu cabeza fría.'); break;
      case 'futuro:0': trust(1.5); msg = TX('A la afición le encanta. El míster, también.'); break;
      case 'futuro:1': forma(8); this.gainXp(8); msg = TX('¡Qué ambición! Sales a entrenar con todo.'); break;
      case 'futuro:2': trust(0.5); this.gainXp(5); msg = TX('Respuesta de veterano.'); break;
      case 'fans:0': forma(-3); this.gainXp(12); msg = TX('Los niños se van felices. Eso también motiva.'); break;
      case 'fans:1': forma(4); msg = TX('Te vas rápido a casa. +4 de forma.'); break;
      case 'prensaRival:0': { const r = me.rel[E.a]; if (r && r.lv > 1) { r.lv--; msg = TX('Tu rivalidad con {0} se enfría un poco.', N(E.a)); } else { delete me.rel[E.a]; msg = TX('{0} te lo agradece: ya no sois rivales.', N(E.a)); } trust(0.5); break; }
      case 'prensaRival:1': this.addRel(E.a, 'rival'); forma(5); this.gainXp(5); msg = TX('La rivalidad con {0} se calienta.', N(E.a)); break;
      case 'prensaRival:2': msg = TX('Esquivas la pregunta como un profesional.'); break;
      case 'rumor:0': trust(1.5); msg = TX('El míster agradece tu compromiso con el club.'); break;
      case 'rumor:1': trust(-1); me.rumor = c.season; msg = TX('Los grandes clubes se fijan en ti… y al míster no le gusta nada.'); break;
      case 'rumor:2': msg = TX('Sin comentarios. El rumor se apaga solo.'); break;
      case 'tele:0': Profile.data.coins += 150; Profile.save(); forma(-6); msg = TX('+150 🪙. Te acuestas tardísimo.'); break;
      case 'tele:1': forma(6); msg = TX('Descansas. +6 de forma.'); break;
      case 'critica:0': forma(4); trust(-0.5); msg = TX('Te desahogas, pero la polémica dura toda la semana.'); break;
      case 'critica:1': { const k = pickR(STAT_KEYS); this.addStat(m, k, 1); this.checkTier(); forma(-8); msg = TX('Le callarás la boca en el campo. +1 en {0}.', STAT_LABEL[k]); break; }
      case 'lluvia:0': this.addStat(m, 'fisico', 1); this.checkTier(); forma(-8); msg = TX('Acabas empapado, pero más fuerte. +1 en físico.'); break;
      case 'lluvia:1': forma(8); msg = TX('Chocolate caliente y manta. +8 de forma.'); break;
      case 'abuela:0': forma(10); trust(-0.5); msg = TX('Tu abuela está feliz. Al míster no le ha hecho gracia que faltes.'); break;
      case 'abuela:1': this.gainXp(6); msg = TX('Tu abuela lo entiende: «¡Mete un gol por mí!».'); break;
      case 'examen:0': forma(-4); this.gainXp(6); msg = TX('¡Aprobado! Te lo has ganado.'); break;
      case 'examen:1': trust(1); msg = TX('Aprendes mucho del vídeo. El examen… ya veremos.'); break;
      case 'dieta:0': this.addStat(m, 'rapidez', 1); this.checkTier(); forma(-6); msg = TX('Más ligero y más rápido. +1 en rapidez.'); break;
      case 'dieta:1': forma(8); msg = TX('Un buen ramen lo cura todo. +8 de forma.'); break;
      case 'perro:0': forma(10); Profile.data.coins = Math.max(0, Profile.data.coins - 40); Profile.save(); me.dog = true; msg = TX('Tienes un perro nuevo. Te espera feliz después de cada partido.'); break;
      case 'perro:1': this.gainXp(6); msg = TX('Le encuentran una familia. Buena acción.'); break;
      case 'tobillo:0': forma(15); trust(-0.5); msg = TX('El tobillo se recupera. +15 de forma.'); break;
      case 'tobillo:1': forma(-10); trust(1); msg = TX('El míster valora tu sacrificio, pero lo notas.'); break;
      case 'leyenda:0': this.gainXp(25); msg = TX('¡Te enseña un truco increíble! +25 XP.'); break;
      case 'leyenda:1': msg = TX('Otra vez será…'); break;
      case 'tactica:0': this.addStat(m, 'tiro', 1); this.checkTier(); msg = TX('+1 en tiro.'); break;
      case 'tactica:1': this.addStat(m, 'control', 1); this.checkTier(); msg = TX('+1 en control.'); break;
      case 'tactica:2': this.addStat(m, 'defensa', 1); this.checkTier(); msg = TX('+1 en defensa.'); break;
      case 'streamer:0': Profile.data.tickets += 2; Profile.save(); forma(-5); msg = TX('¡Medio millón de personas mirando! +2 🎟️.'); break;
      case 'streamer:1': forma(5); msg = TX('Te acuestas pronto. +5 de forma.'); break;
      case 'ojeador:0': forma(-8); this.gainXp(15); me.scout = (me.scout || 0) + 1; msg = TX('El ojeador apunta tu nombre en su libreta.'); break;
      case 'ojeador:1': forma(3); msg = TX('Entrenas tranquilo. Otra vez será.'); break;
      case 'botas:0': this.addRel(E.a, 'amigo'); msg = TX('Os reís un rato: {0} y tú sois amigos.', N(E.a)); break;
      case 'botas:1': this.addRel(E.a, 'rival'); forma(3); msg = TX('{0} no se lo esperaba. Ahora es tu rival.', N(E.a)); break;
      case 'cena:0': { Profile.data.coins = Math.max(0, Profile.data.coins - 30); Profile.save(); const f = anyMate(); if (f) { this.addRel(f.id, 'amigo'); msg = TX('Gran noche: {0} y tú sois amigos.', N(f.id)); } else msg = TX('Gran noche.'); break; }
      case 'cena:1': forma(5); msg = TX('Descansas. +5 de forma.'); break;
      case 'penalti:0': trust(0.5); this.addRel(E.a, 'rival'); msg = TX('Serás el lanzador… y {0} no lo olvida.', N(E.a)); break;
      case 'penalti:1': this.addRel(E.a, 'amigo'); msg = TX('{0} te lo agradece: ahora sois amigos.', N(E.a)); break;
      case 'lesionado:0': this.addRel(E.a, 'amigo'); forma(-3); msg = TX('{0} se anima mucho con tu visita.', N(E.a)); break;
      case 'lesionado:1': this.gainXp(3); msg = TX('{0} te responde con un pulgar arriba.', N(E.a)); break;
      case 'brazalete:0': if (me.trust >= 3) { trust(1); this.gainXp(10); msg = TX('¡El míster te da el brazalete!'); } else { trust(-0.5); this.addRel(E.a, 'rival'); msg = TX('El míster elige a {0}… y él se ha dado cuenta.', N(E.a)); } break;
      case 'brazalete:1': this.addRel(E.a, 'amigo'); trust(0.5); msg = TX('{0} será el capitán. Te lo agradece.', N(E.a)); break;
      case 'novatada:0': { const f = anyMate(); if (f) this.addRel(f.id, 'amigo'); forma(3); msg = TX('¡Desafinas, pero el vestuario te adora!'); break; }
      case 'novatada:1': trust(-0.5); forma(-3); msg = TX('Los veteranos no se lo toman bien.'); break;
      case 'exclub:0': forma(5); this.gainXp(10); msg = TX('Te reciben con una ovación. Qué recuerdos.'); break;
      case 'exclub:1': msg = TX('Otra vez será.'); break;
      case 'refresco:0': Profile.data.coins += 400; Profile.save(); forma(-5); msg = TX('+400 🪙. Te toca grabar el anuncio en la playa.'); break;
      case 'refresco:1': trust(0.5); msg = TX('El míster valora que te centres en el fútbol.'); break;
      case 'charla:0': forma(-4); this.gainXp(12); msg = TX('Los chavales te miran como a un héroe.'); break;
      case 'charla:1': msg = TX('Les mandas un vídeo de ánimo.'); break;
    }
    me.event = null; this.save();
    return msg;
  },

  /* ---------- Modo desarrollador ---------- */
  devEndSeason() {
    const c = this.data; let sum = null, g = 0;
    while (!sum && !c.pwc && g++ < 40) {
      if (c.me.techChoice) this.chooseTech(c.me.techChoice[0]);
      if (c.me.offers && !c.goPro) this.rejectOffers();
      if (c.me.duel) this.duelDecline();
      if (c.me.event) this.resolveEvent(0);
      if (!this.activityDone()) this.doActivity('entrenar', 'tiro');
      if (this.nextMatch()) { if (this.starter()) this.simulateWeek(); else this.simulateWeek(this.benchPlan()); }
      sum = this.advance();
    }
    return sum;
  },
  devLevel() { this.gainXp(PC_XP(this.data.me.lv) - this.data.me.xp); this.save(); },
  devStats(n = 10) { const m = this.mine(); STAT_KEYS.forEach(k => this.addStat(m, k, n)); this.checkTier(); this.save(); },
  devDuel() { const c = this.data, k = pickR(c.divs[this.myDiv()].filter(x => x !== YOU)); return this.makeDuel(k, true); },
  devEvent() { this.data.me.event = null; return this.makeEvent(true); },
  // (desarrollador) Todas las decisiones, para probar una concreta
  devEventKeys() {
    return ['prensaWin', 'prensaLoss', 'prensaRival', 'futuro', 'fans', 'rumor', 'tele', 'critica', 'fiesta', 'madrugar', 'anuncio', 'lluvia', 'abuela', 'examen',
      'dieta', 'perro', 'tobillo', 'leyenda', 'tactica', 'streamer', 'ojeador', 'canterano', 'pelea', 'capitan', 'pique', 'botas', 'cena', 'penalti',
      'lesionado', 'brazalete', 'novatada', 'exclub', 'refresco', 'charla'];
  },
  devEventForce(k, peek) {
    const c = this.data, me = c.me, mates = this.mates(), pick = a => a[Math.floor(cRnd() * a.length)];
    const other = c.divs[this.myDiv()].filter(x => x !== YOU), club = pick(other);
    let riv = this.relList().find(r => r.t === 'rival');
    if (!riv && (k === 'pique' || k === 'prensaRival')) { const p = c.clubs[club].find(q => q.role !== 'POR'); if (!peek) this.addRel(p.id, 'rival'); riv = { id: p.id }; }
    const a = mates.length ? pick(mates).id : null, b = mates.length > 1 ? pick(mates.filter(m => m.id !== a)).id : a;
    const cap = mates.slice().sort((x, y) => this.ovr(y) - this.ovr(x))[0];
    const E = { k };
    if (['prensaWin', 'prensaLoss', 'futuro'].includes(k)) E.club = club;
    if (['canterano', 'botas', 'penalti', 'lesionado', 'novatada'].includes(k)) E.a = a;
    if (k === 'pelea') { E.a = a; E.b = b; }
    if (k === 'capitan' || k === 'brazalete') E.a = cap ? cap.id : a;
    if (k === 'pique' || k === 'prensaRival') E.a = riv.id;
    if (k === 'exclub') E.club = me.clubs.find(x => x !== c.club) || club;
    if (E.a === null) return false;
    me.event = E; if (!peek) this.save(); return true;
  },
  devTrust() { const me = this.data.me; me.trust = 10; me.forma = 100; me.forceStart = true; this.data.lineup = null; this.autoLineup(); this.save(); },
  devTech() { const o = this.techOptions(3); if (o.length) { this.data.me.techChoice = o; this.save(); } return o.length; },
  devWC(role) { const c = this.data; c.pwc = this.wcNew(c.season); c.pwc.role = PC_WC_ROLES.includes(role) ? role : this.wcRole(null); this.save(); },
  devGraduate() { const me = this.data.me; if (me.graduated) return false; this.graduate(); return true; },
  devOffers() {
    const c = this.data, d = this.myDiv(), all = [d - 1, d, d + 1].filter(x => c.divs[x]).flatMap(x => c.divs[x]).filter(k => k !== YOU && TEAM(k));
    c.me.offers = all.sort(() => cRnd() - 0.5).slice(0, 3).map(key => ({ key, why: 'same' })); this.save();
  },

  /* ---------- Graduación ---------- */
  graduate() {
    const c = this.data, me = c.me, mm = this.mine(), P = Profile.data;
    if (me.graduated) return;
    me.graduated = true;
    const avgAll = this.avg(me.seasons.map(s => s.avg).filter(x => x != null)) || 6;
    let tickets = 15 + Math.round((avgAll - 6) * 10), coins = 500 + me.total.goals * 30;
    tickets = Math.max(10, tickets);
    const res = { tickets, coins, joined: null, star: false };
    if (me.pd) {   // el jugador creado entra en tu colección con lo que ha mejorado
      const pd = PLAYER(me.id), ie = {};
      STAT_KEYS.forEach(k => { ie[k] = Math.min(99, Math.round(this.stat(mm, k) / 0.82)); });
      ie.aguante = pd.ie.aguante;
      const o = this.ovr(mm);
      Object.assign(pd, { ie, moves: mm.known.map(t => [t, 1]), rarity: o >= 70 ? 'epica' : o >= 56 ? 'rara' : 'comun' });
      P.custom = (P.custom || []).filter(x => x.id !== pd.id).concat([JSON.parse(JSON.stringify(pd))]);
      P.coll[pd.id] = { stars: 1, up: {} }; res.joined = pd.id;
    } else if (P.coll[me.id] && P.coll[me.id].stars < MAX_STARS) { P.coll[me.id].stars++; res.star = true; }
    P.tickets += tickets; P.coins += coins; Profile.save();
    c.graduation = res;
    c.goPro = true; me.offers = this.proOffers();   // ¡a la Liga Pro!
    this.save();
    return res;
  },
});
