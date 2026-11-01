/* =====================================================================
   OBJETOS 🎒: equipo que se pone a un jugador (1 por jugador) y mejora sus estadísticas en los partidos de tu equipo
   (Partido rápido, 11 contra 11, Historia, Equipos especiales; no en las Carreras).
   Salen en el gacha (con cada tirada puede caer uno; la de ×10 asegura al menos uno) y se compran en la Tienda
   (ofertas del día con descuento). Dos objetos hacen algo más que subir estadísticas:
   · 🧲 Imán de monedas: +20 % de monedas al ganar partidos (acumulable por cada imán equipado)
   · 🍀 Trébol de la suerte: +50 % de probabilidad de que el gacha te dé objetos (acumulable)
   Se guarda en el perfil: P.items = { own: { idObjeto: cantidad }, eq: { idJugador: idObjeto }, deal: { day, bought: [] } }
   ===================================================================== */
const ITEM_RAR = { comun: { name: TX('Común'), price: 400, w: 55, c: '#b8bcc8' }, rara: { name: TX('Raro'), price: 1500, w: 30, c: '#3f8fff' }, epica: { name: TX('Épico'), price: 5000, w: 12, c: '#a24cff' }, legendaria: { name: TX('Legendario'), price: 15000, w: 3, c: '#ffcc22' } };
const ITEM_STAT = { tiro: TX('Tiro'), control: TX('Control'), defensa: TX('Defensa'), rapidez: TX('Rapidez'), fisico: TX('Físico') };
const ITEMS = {
  botas_entreno:  { icon: '👟', rar: 'comun',      name: TX('Botas de entrenamiento'), st: { rapidez: 3 } },
  espinilleras:   { icon: '🦵', rar: 'comun',      name: TX('Espinilleras reforzadas'), st: { fisico: 3 } },
  balon_practica: { icon: '⚽', rar: 'comun',      name: TX('Balón de práctica'), st: { tiro: 3 } },
  guantes_goma:   { icon: '🧤', rar: 'comun',      name: TX('Guantes de goma'), st: { defensa: 3 } },
  botas_rayo:     { icon: '🥾', rar: 'rara',       name: TX('Botas Relámpago'), st: { rapidez: 6, control: 2 } },
  cinta_capitan:  { icon: '🎗️', rar: 'rara',       name: TX('Cinta de capitán'), st: { control: 5, tiro: 3 } },
  guantes_acero:  { icon: '🥊', rar: 'rara',       name: TX('Guantes de acero'), st: { defensa: 7 } },
  iman:           { icon: '🧲', rar: 'rara',       name: TX('Imán de monedas'), st: { control: 2 }, coin: 20, extra: TX('+20 % de monedas al ganar partidos') },
  botas_huracan:  { icon: '🌪️', rar: 'epica',      name: TX('Botas Huracán'), st: { rapidez: 10, tiro: 4 } },
  balon_oro:      { icon: '🥇', rar: 'epica',      name: TX('Balón de oro'), st: { tiro: 9, control: 3 } },
  coraza:         { icon: '🛡️', rar: 'epica',      name: TX('Coraza de titanio'), st: { fisico: 9, defensa: 4 } },
  trebol:         { icon: '🍀', rar: 'epica',      name: TX('Trébol de la suerte'), st: { control: 3 }, luck: 50, extra: TX('+50 % de objetos en el gacha') },
  guantes_dios:   { icon: '🖐️', rar: 'legendaria', name: TX('Guantes del Dios'), st: { defensa: 14, fisico: 6 } },
  estrella:       { icon: '🌟', rar: 'legendaria', name: TX('Estrella Inazuma'), st: { tiro: 12, rapidez: 8, control: 6 } },
  corona:         { icon: '👑', rar: 'legendaria', name: TX('Corona del campeón'), st: { tiro: 6, control: 6, defensa: 6, rapidez: 6, fisico: 6 } },
};
const ITEM_IDS = Object.keys(ITEMS);
const Items = {
  DROP: 0.12,   // probabilidad de objeto por tirada de gacha (la de ×10 asegura al menos uno)
  st() {
    const P = Profile.data, I = P.items = P.items || {};
    I.own = I.own || {}; I.eq = I.eq || {}; I.deal = I.deal || { day: '', bought: [] };
    return I;
  },
  def: id => ITEMS[id],
  count(id) { return this.st().own[id] || 0; },
  worn(id) { return Object.values(this.st().eq).filter(x => x === id).length; },
  free(id) { return this.count(id) - this.worn(id); },
  of(pid) { return this.st().eq[pid] || null; },
  add(id, n = 1) { if (!ITEMS[id]) return; const I = this.st(); I.own[id] = (I.own[id] || 0) + n; Profile.save(); },
  equip(pid, id) {
    const I = this.st();
    if (!ITEMS[id]) return { ok: false, msg: TX('Ese objeto no existe') };
    if (I.eq[pid] === id) return { ok: true };
    if (this.free(id) <= 0) return { ok: false, msg: TX('No te quedan de ese objeto sin usar') };
    I.eq[pid] = id; Profile.save(); return { ok: true };
  },
  unequip(pid) { const I = this.st(); delete I.eq[pid]; Profile.save(); },
  // Estadística extra que da el objeto de un jugador
  bonus(pid, k) { const it = ITEMS[this.of(pid)]; return it && it.st[k] || 0; },
  // Aplica el objeto a un jugador ya construido para el partido (m.key = id del jugador)
  apply(m) {
    const it = m && ITEMS[this.of(m.key)]; if (!it) return m;
    const s = it.st;
    if (s.tiro) m.kick += s.tiro;
    if (s.control) m.control += s.control;
    if (s.defensa) m.defense += s.defensa;
    if (s.fisico) m.body += s.fisico;
    if (s.rapidez) m.speed = +(m.speed + s.rapidez * 0.05).toFixed(2);
    m.gk += Math.round(((s.defensa || 0) + (s.fisico || 0)) / 2);
    m.item = m.item || this.of(m.key);
    return m;
  },
  // Bonos de los objetos que llevas puestos en alguien de tu club
  total(field) { return Object.values(this.st().eq).reduce((a, id) => a + ((ITEMS[id] && ITEMS[id][field]) || 0), 0); },
  coinPct() { return this.total('coin'); },
  luck() { return this.total('luck'); },
  bonusText(id) {
    const it = ITEMS[id]; if (!it) return '';
    return Object.entries(it.st).map(([k, v]) => '+' + v + ' ' + ITEM_STAT[k]).join(' · ') + (it.extra ? ' · ' + it.extra : '');
  },
  pickRar(rnd = Math.random) {
    let r = rnd() * Object.values(ITEM_RAR).reduce((a, x) => a + x.w, 0);
    for (const k in ITEM_RAR) { r -= ITEM_RAR[k].w; if (r < 0) return k; }
    return 'comun';
  },
  // Objetos que caen al abrir un sobre de n jugadores. Los guarda en la mochila
  rollDrops(n, rnd = Math.random) {
    const p = Math.min(0.9, this.DROP * (1 + this.luck() / 100)), out = [];
    for (let i = 0; i < n; i++) if (rnd() < p) out.push(this.randomOf(this.pickRar(rnd), rnd));
    if (n >= 10 && !out.length) out.push(this.randomOf(this.pickRar(rnd), rnd));
    out.forEach(id => this.add(id));
    return out;
  },
  randomOf(rar, rnd = Math.random) { const l = ITEM_IDS.filter(id => ITEMS[id].rar === rar); return l[Math.floor(rnd() * l.length)]; },
  /* ---- Tienda ---- */
  price: id => ITEM_RAR[ITEMS[id].rar].price,
  buy(id) {
    if (!ITEMS[id]) return { ok: false, msg: TX('Ese objeto no existe') };
    const c = this.price(id), P = Profile.data;
    if (P.coins < c) return { ok: false, msg: TX('No tienes monedas suficientes') };
    P.coins -= c; this.add(id); return { ok: true, id, msg: '+1 ' + ITEMS[id].name };
  },
  // Ofertas del día: 3 objetos fijos para toda la jornada, con un 25 % de descuento (1 de cada uno)
  dealDay(now = Date.now()) { return Shop.today(now); },
  deals(now = Date.now()) {
    const day = this.dealDay(now), I = this.st();
    if (I.deal.day !== day) { I.deal.day = day; I.deal.bought = []; }
    let seed = 0; for (const ch of day) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const pool = ITEM_IDS.filter(id => ITEMS[id].rar !== 'legendaria'), ids = [];
    while (ids.length < 3) { const id = pool[Math.floor(rnd() * pool.length)]; if (!ids.includes(id)) ids.push(id); }
    return ids.map(id => ({ id, price: Math.round(this.price(id) * 0.75), bought: I.deal.bought.includes(id) }));
  },
  buyDeal(id, now = Date.now()) {
    const d = this.deals(now).find(x => x.id === id);
    if (!d) return { ok: false, msg: TX('Esa oferta ya no está') };
    if (d.bought) return { ok: false, msg: TX('Ya has comprado esta oferta hoy') };
    const P = Profile.data; if (P.coins < d.price) return { ok: false, msg: TX('No tienes monedas suficientes') };
    P.coins -= d.price; this.st().deal.bought.push(id); this.add(id); return { ok: true, id, msg: '+1 ' + ITEMS[id].name };
  },
};
