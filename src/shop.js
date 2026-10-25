/* =====================================================================
   TIENDA 🛒 (v0.35): en qué gastar las monedas
   - Tickets (150 cada uno, 10 al día) · sobres «elige 1 de 3» (raro+, épico+, épico+ de un puesto y legendario semanal)
   - Equipación: diseños y colores especiales · escudo propio y formas especiales · campos para jugar en casa
   - Mejorar supertécnicas (niveles y evolución) · Álbum de colección (completar equipos da premio; comprar el que falta)
   Todo se guarda en el perfil: P.shop = { day, t, legWeek, own: { 'd:aros': 1, 'c:#d4a62a': 1, 'f:noche': 1, crest: 1, 's:hexagono': 1 }, album: { equipo: 1 } },
   P.techLv = { idTécnica: nivel (1–3) }, P.field (campo de casa), P.crest (escudo de tu equipo).
   ===================================================================== */
const SHOP = {
  ticket: 150, ticketsDay: 10,
  clubs: [[86, 15000], [82, 10000], [78, 6000], [75, 3000], [71, 1500], [66, 800], [0, 300]],   // media de la plantilla → precio
  packs: {
    rara:       { cost: 700,  w: { rara: 0.75, epica: 0.22, legendaria: 0.03 }, name: TX('Sobre raro'), desc: TX('Elige 1 de 3 jugadores raros o mejores') },
    epica:      { cost: 2500, w: { epica: 0.92, legendaria: 0.08 }, name: TX('Sobre épico'), desc: TX('Elige 1 de 3 jugadores épicos o mejores') },
    puesto:     { cost: 3500, w: { epica: 0.92, legendaria: 0.08 }, role: true, name: TX('Sobre épico de un puesto'), desc: TX('Eliges el puesto y luego 1 de 3 épicos o mejores') },
    legendaria: { cost: 7000, w: { legendaria: 1 }, weekly: true, name: TX('Sobre legendario'), desc: TX('Elige 1 de 3 legendarios · uno por semana') },
  },
  // Diseños y colores nuevos (los de siempre siguen gratis)
  designs: { aros: 600, franja: 600, hombros: 800, cruz: 1000, chevron: 1200, puntos: 1500 },
  colors: { '#d4a62a': 400, '#c0c8d0': 400, '#39e01a': 400, '#ff2fb4': 400, '#00d8f0': 400, '#6a0f24': 400, '#14162a': 400, '#f05a00': 400 },
  crest: 1500, shapes: { hexagono: 800, estrella: 1200 },
  fields: { noche: 1000, atardecer: 1000, jungla: 1000, nieve: 1000, acero: 1000, cielo: 1500, volcan: 1500, playa: 2000, galaxia: 2500, dorado: 3000 },
  techLv: [null, null, 500, 1500], techEvo: 3000, TECH_MAX: 3, LV_POWER: 8,
  albumPrize: { coins: 300, tickets: 5 },
  buyPrice: { comun: 400, rara: 1500, epica: 5000, legendaria: 15000 },
};
// Nombres para mostrar
const DESIGN_NAME = { aros: TX('Aros'), franja: TX('Franja'), hombros: TX('Hombros'), cruz: TX('Cruz'), chevron: TX('Pico'), puntos: TX('Lunares') };
const COLOR_NAME = { '#d4a62a': TX('Oro'), '#c0c8d0': TX('Plata'), '#39e01a': TX('Verde neón'), '#ff2fb4': TX('Rosa neón'), '#00d8f0': TX('Cian eléctrico'), '#6a0f24': TX('Granate'), '#14162a': TX('Medianoche'), '#f05a00': TX('Naranja fuego') };
const SHAPE_NAME = { escudo: TX('Escudo'), circulo: TX('Círculo'), rombo: TX('Rombo'), hexagono: TX('Hexágono'), estrella: TX('Estrella') };

const Shop = {
  st() {
    const P = Profile.data;
    const S = P.shop = P.shop || {};   // siempre el mismo objeto (no se sustituye)
    for (const [k, v] of Object.entries({ day: '', t: 0, legWeek: -1 })) if (S[k] == null) S[k] = v;
    S.own = S.own || {}; S.album = S.album || {};
    P.techLv = P.techLv || {};
    return P.shop;
  },
  today(now = Date.now()) { const d = new Date(now); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  // Semana (de lunes a domingo, hora local) para el sobre legendario
  week(now = Date.now()) { const d = new Date(now); const days = Math.floor((now - d.getTimezoneOffset() * 60000) / 864e5); return Math.floor((days + 3) / 7); },
  pay(cost) { const P = Profile.data; if (P.coins < cost) return false; P.coins -= cost; return true; },
  fail(msg) { return { ok: false, msg }; },
  noCoins() { return this.fail(TX('No tienes monedas suficientes')); },

  /* ---- Tickets ---- */
  ticketsLeft(now) { const S = this.st(); return S.day === this.today(now) ? Math.max(0, SHOP.ticketsDay - S.t) : SHOP.ticketsDay; },
  buyTickets(n = 1, now) {
    const S = this.st(), left = this.ticketsLeft(now); n = Math.max(1, Math.floor(n));
    if (left <= 0) return this.fail(TX('Ya has comprado los 10 tickets de hoy. ¡Vuelve mañana!'));
    n = Math.min(n, left);
    if (!this.pay(n * SHOP.ticket)) return this.noCoins();
    if (S.day !== this.today(now)) { S.day = this.today(now); S.t = 0; }
    S.t += n; Profile.data.tickets += n; Profile.save();
    return { ok: true, n, msg: TXn(n, '+{0} ticket', '+{0} tickets') };
  },

  /* ---- Sobres «elige 1 de 3» ---- */
  legReady(now) { return this.st().legWeek !== this.week(now); },
  packOptions(kind, role, n = 3) {
    const K = SHOP.packs[kind], P = Profile.data;
    const base = GAME.players.filter(p => p.cs && p.gacha !== false && !p.halloween && !p.selva && !p.original && !p.special && (!role || p.role === role));
    const byTier = {}; for (const p of base) (byTier[p.rarity] = byTier[p.rarity] || []).push(p.id);
    const out = [];
    for (let k = 0; k < 40 && out.length < n; k++) {
      let r = Math.random(), tier = null;
      for (const [t, w] of Object.entries(K.w)) { if ((r -= w) < 0) { tier = t; break; } }
      tier = tier || Object.keys(K.w)[0];
      const pool = (byTier[tier] || []).filter(id => !out.includes(id));
      if (!pool.length) continue;
      // mejor jugadores que no tengas al máximo de estrellas
      const fresh = pool.filter(id => !P.coll[id] || P.coll[id].stars < MAX_STARS);
      const from = fresh.length ? fresh : pool;
      out.push(from[Math.floor(Math.random() * from.length)]);
    }
    return out;
  },
  buyPack(kind, role, now) {
    const K = SHOP.packs[kind]; if (!K) return this.fail('?');
    if (K.role && !['POR', 'DEF', 'MED', 'DEL'].includes(role)) return this.fail(TX('Elige un puesto'));
    if (K.weekly && !this.legReady(now)) return this.fail(TX('Ya compraste el sobre legendario esta semana'));
    const opts = this.packOptions(kind, K.role ? role : null); if (opts.length < 1) return this.fail(TX('No hay jugadores para este sobre'));
    if (!this.pay(K.cost)) return this.noCoins();
    const S = this.st(); if (K.weekly) S.legWeek = this.week(now);
    const uid = Date.now() + Math.floor(Math.random() * 1000);
    (Profile.data.giftPicks = Profile.data.giftPicks || []).push({ code: '🛒', uid, opts, desc: K.name + ' · ' + K.desc });
    Profile.save();
    return { ok: true, uid, opts };
  },

  /* ---- Equipación, escudo y campo ---- */
  owns(key) { return !!this.st().own[key]; },
  /* ---- Clubes para «Elegir un club» del Modo Carrera: se compran una vez y son tuyos para siempre; cuanto mejor la plantilla, más caros ---- */
  clubPrice(avg) { for (const [m, c] of SHOP.clubs) if (avg >= m) return c; return SHOP.clubs[SHOP.clubs.length - 1][1]; },
  ownsClub(k) { return this.owns('club:' + k); },
  buyClub(k, avg) { return this.buyItem('club:' + k, this.clubPrice(avg)); },
  buyItem(key, cost) {
    if (this.owns(key)) return this.fail(TX('Ya lo tienes'));
    if (!this.pay(cost)) return this.noCoins();
    this.st().own[key] = 1; Profile.save(); return { ok: true };
  },
  buyDesign(d) { return SHOP.designs[d] ? this.buyItem('d:' + d, SHOP.designs[d]) : this.fail('?'); },
  buyColor(c) { return SHOP.colors[c] ? this.buyItem('c:' + c, SHOP.colors[c]) : this.fail('?'); },
  buyShape(s) { return SHOP.shapes[s] ? this.buyItem('s:' + s, SHOP.shapes[s]) : this.fail('?'); },
  buyField(f) { return SHOP.fields[f] ? this.buyItem('f:' + f, SHOP.fields[f]) : this.fail('?'); },
  buyCrest() {
    const r = this.buyItem('crest', SHOP.crest);
    if (r.ok && !Profile.data.crest) { Profile.data.crest = { shape: 'escudo', c1: '#1f4fc0', c2: '#e8c21a', sym: 'rayo' }; Profile.save(); }
    return r;
  },
  // Lo que se puede elegir en los editores (los de siempre + lo comprado)
  kitColors() { return KIT_COLORS.concat(Object.keys(SHOP.colors).filter(c => this.owns('c:' + c))); },
  kitDesigns() { return KIT_DESIGNS.concat(Object.keys(SHOP.designs).filter(d => this.owns('d:' + d)).map(d => [d, DESIGN_NAME[d]])); },
  crestShapes() { return CREST_SHAPES.concat(Object.keys(SHOP.shapes).filter(s => this.owns('s:' + s))); },
  fieldsOwned() { return ['normal'].concat(Object.keys(SHOP.fields).filter(f => this.owns('f:' + f))); },
  setField(f) { if (f !== 'normal' && !this.owns('f:' + f)) return false; Profile.data.field = f === 'normal' ? null : f; Profile.save(); return true; },
  myField() { const f = Profile.data.field; return f && this.owns('f:' + f) ? f : null; },
  crestData() { return this.owns('crest') && Profile.data.crest ? Profile.data.crest : null; },   // para el editor
  myCrest() { return Profile.data.crestOff ? null : this.crestData(); },                           // el que sale en el marcador
  setCrest(ch) {
    if (!this.owns('crest')) return false;
    const c = Object.assign({ shape: 'escudo', c1: '#1f4fc0', c2: '#e8c21a', sym: 'rayo' }, Profile.data.crest || {}, ch);
    if (!this.crestShapes().includes(c.shape)) return false;
    Profile.data.crest = c; Profile.save(); return true;
  },

  /* ---- Supertécnicas: nivel 1 → 2 → 3 (+8 de potencia cada uno) y, al 3, evolución si la tiene ---- */
  techLevel(tid) { return Math.max(1, Math.min(SHOP.TECH_MAX, (this.st(), Profile.data.techLv[tid]) || 1)); },
  levelCost(tid) { const lv = this.techLevel(tid); return lv < SHOP.TECH_MAX ? SHOP.techLv[lv + 1] : null; },
  // Técnicas que usan tus jugadores (lo que tienen equipado) y las del gacha
  myTechs() {
    const set = new Set();
    for (const id of Profile.ids()) if (PLAYER(id)) Profile.equipOf(id).forEach(t => set.add(t));
    Object.keys(Profile.data.techs || {}).forEach(t => set.add(+t));
    return [...set].filter(t => TECH(t));
  },
  levelUp(tid) {
    if (!TECH(tid)) return this.fail('?');
    const c = this.levelCost(tid); if (c == null) return this.fail(TX('Ya está al máximo'));
    if (!this.pay(c)) return this.noCoins();
    Profile.data.techLv[tid] = this.techLevel(tid) + 1; Profile.save();
    return { ok: true, lv: Profile.data.techLv[tid] };
  },
  canEvolve(tid) { const e = EVO(tid); return e != null && TECH(e) && this.techLevel(tid) >= SHOP.TECH_MAX && !(Profile.data.techs || {})[e]; },
  evolve(tid) {
    if (!this.canEvolve(tid)) return this.fail(TX('Todavía no puede evolucionar'));
    if (!this.pay(SHOP.techEvo)) return this.noCoins();
    const e = EVO(tid); Profile.data.techs[e] = 1; Profile.save();
    return { ok: true, to: e };
  },
  // Aplica los niveles a las técnicas de un jugador de partido de tu equipo
  boost(m) {
    if (!m || !m.techs) return m;
    m.techs = m.techs.map(t => { const lv = this.techLevel(t.id); return lv > 1 ? Object.assign({}, t, { power: t.power + SHOP.LV_POWER * (lv - 1), lv }) : t; });
    return m;
  },
  boostTeam(team) { (team.players || []).forEach(m => this.boost(m)); return team; },

  /* ---- Álbum de colección: cada equipo con sus jugadores del gacha ---- */
  poolOf(p) {
    if (!p) return null;
    if (p.cs && p.gacha !== false && !p.halloween && !p.selva && !p.original && !p.special) return p;
    const baseN = n => String(n || '').replace(/ \((IE2|IE3)\)$/, '');
    const m = (GAME.idmap && GAME.idmap[p.id] && PLAYER(GAME.idmap[p.id])) || GAME.players.find(q => q.cs && q.gacha !== false && !q.halloween && !q.selva && !q.original && !q.special && (baseN(q.full) === baseN(p.full) || (q.also || []).includes(p.full)));
    return m && m.cs && m.gacha !== false && !m.original ? m : null;
  },
  _album: null,
  album() {
    if (this._album) return this._album;
    const out = [], seen = new Set();
    for (const t of GAME.teams) {
      if (t.kind === 'career' || t.kind === 'leyenda' || seen.has(t.name)) continue;
      const ids = [...new Set(t.players.map(m => this.poolOf(PLAYER(m.id))).filter(Boolean).map(p => p.id))];
      if (ids.length < 3) continue;
      seen.add(t.name); out.push({ key: t.key, name: t.name, crest: t.crest, ids });
    }
    return (this._album = out);
  },
  albumState(key) {
    const A = this.album().find(a => a.key === key); if (!A) return null;
    const have = A.ids.filter(id => Profile.data.coll[id]);
    return { team: A, have: have.length, total: A.ids.length, done: have.length === A.ids.length, claimed: !!this.st().album[key] };
  },
  albumPending() { return this.album().filter(a => { const s = this.albumState(a.key); return s.done && !s.claimed; }).length; },
  claimAlbum(key) {
    const s = this.albumState(key); if (!s) return this.fail('?');
    if (!s.done) return this.fail(TX('Te faltan jugadores de este equipo'));
    if (s.claimed) return this.fail(TX('Ya recogiste este premio'));
    const P = Profile.data; this.st().album[key] = 1;
    P.coins += SHOP.albumPrize.coins; P.tickets += SHOP.albumPrize.tickets; Profile.save();
    return { ok: true, coins: SHOP.albumPrize.coins, tickets: SHOP.albumPrize.tickets };
  },
  priceOf(id) { const pd = PLAYER(id); return pd ? SHOP.buyPrice[pd.rarity] || SHOP.buyPrice.comun : null; },
  buyPlayer(id) {
    const pd = PLAYER(id); if (!pd || !this.album().some(a => a.ids.includes(id))) return this.fail('?');
    if (Profile.data.coll[id]) return this.fail(TX('Ya lo tienes'));
    if (!this.pay(this.priceOf(id))) return this.noCoins();
    Profile.data.coll[id] = { stars: 1, up: {} }; Profile.save();
    return { ok: true, id, isNew: true, tier: pd.rarity };
  },
};
