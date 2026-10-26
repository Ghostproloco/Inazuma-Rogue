/* =====================================================================
   GACHA LIMITADO «TORMENTA CELESTIAL» + AVISO DE JUGADORES NUEVOS
   - Rareza «limitada» (RARITY.limitada en run.js): 4 jugadores con nota 100, solo en este gacha.
       David Samford · Falcèo Da Silva · Leonardo Almeida · Isabelle Trick
     (versiones nuevas con ids 994001-994004; las normales ya NO salen en el gacha de siempre)
   - Sobre limitado: 10 🎟️ = 10 jugadores. Bote de 10 jugadores:
       limitada · Samford, Da Silva, Almeida y Trick (0,5 % cada uno)
       legendaria · Bianchi Christmas (ya NO se consigue con código: solo aquí)
       épica · Jang Cho, Jim Flareson · rara · Changsu Choi, Umi Wang · común · Sol Crater
   - Cada sobre de 10 trae al menos una épica o mejor; uno de los 4 limitados asegurado a las 100 tiradas sin ninguno.
   - Imagen del banner: juego/ui/tormenta.jpg. Nombre del gacha: TX('Tormenta Celestial') (app.js, 3 sitios).
   - Bai Long, Arion, Victor y Riccardo (gacha anterior) YA NO EXISTEN: Profile.load y Run.repair (run.js) los quitan de las partidas guardadas.
   - NEW_PLAYERS: al añadir un jugador nuevo, pon aquí su id y la versión: al abrir
     el juego sale una pantalla con él (una sola vez por dispositivo).
   ===================================================================== */
const LM_BANNER = 68;
const LM_PRICE = 10, LM_N = 10;                   // 10 tickets por sobre de 10 jugadores
const LM_PITY = 100;                              // uno de los 4 limitados asegurado a las 100 tiradas (10 sobres) sin ninguno
const LM_RATES = [['limitada', 2], ['legendaria', 3], ['epica', 28], ['rara', 30], ['comun', 37]];   // la de «limitada» se reparte entre los 4 (0,5 % cada uno): muy difíciles
const LM_END = null;                              // último día del gacha limitado (AAAA-MM-DD); null = sin fecha de fin
const LM_AVG = 100, LM_STAT_MAX = 105;            // nota de los limitados y tope por estadística
// base = jugador del que copian aspecto y técnicas; lead = técnicas de nivel 100 (la primera es su supertécnica; el resto de técnicas de la base se conserva)
const LM_PLAYERS = [
  { id: 994001, base: 30,    lead: [[295, 100], [101, 100]] },       // David Samford: Pingüino espacial + Regate múltiple
  { id: 994002, base: 31862, lead: [[30429, 100], [30438, 100]] },   // Falcèo Da Silva (POR): Parada celestial + Parada de capoeira
  { id: 994003, base: 31870, lead: [[339, 100], [30292, 100]] },     // Leonardo Almeida: Cruz del Sur + Tornado doble
  { id: 994004, base: 31061, lead: [[30353, 100], [30452, 100]] },   // Isabelle Trick: Superelástico + Cañón X
];
// Aura y rayos de cada limitado en el campo (view.js, drawLimited): a = color principal, b = color de los destellos
const LM_FX = {
  994001: { a: 0x9fe8ff, b: 0xffffff },   // Samford: hielo y pingüinos
  994002: { a: 0xffd23a, b: 0xfff2a0 },   // Da Silva: oro
  994003: { a: 0x3dff8a, b: 0xe6ffd8 },   // Almeida: esmeralda
  994004: { a: 0x35d6ff, b: 0xffe27a },   // Trick: relámpago azul y dorado
};
const LM_POOL_IDS = {
  limitada: LM_PLAYERS.map(l => l.id),
  legendaria: [997008],
  epica: [31766, 21459],
  rara: [31775, 31767],
  comun: [277],
};
// Jugadores nuevos: se enseñan al abrir el juego la primera vez (settings.seenPlayers)
const NEW_PLAYERS = LM_PLAYERS.map(l => ({ id: l.id, v: '0.36.1' }));

(function registerLimited() {
  if (typeof GAME === 'undefined') return;
  const KEYS = ['tiro', 'control', 'defensa', 'rapidez', 'fisico'];
  // Sube (o baja) las estadísticas en la misma proporción hasta que la media sea `target`, sin pasar de `max` por estadística
  const scaled = (b, target, max) => {
    const mk = f => { const ie = {}; for (const k in b.ie) ie[k] = Math.min(max, Math.round(b.ie[k] * f)); return ie; };
    const mean = ie => KEYS.reduce((t, k) => t + ie[k], 0) / KEYS.length;
    let lo = 0.5, hi = 3, ie = mk(1);
    for (let i = 0; i < 40; i++) { const f = (lo + hi) / 2; ie = mk(f); if (mean(ie) < target) lo = f; else hi = f; }
    return mk(hi);
  };
  LM_PLAYERS.forEach(L => {
    if (PBY[L.id]) return;
    const b = PLAYER(L.base); if (!b) return;
    b.gacha = false;   // los limitados SOLO salen en este gacha: las versiones normales se quitan del gacha de siempre (quien ya las tiene se las queda)
    const lead = L.lead.filter(([id]) => TECH(id));
    const rest = (b.moves || []).filter(m => m[1] !== 100 && !lead.some(l => l[0] === m[0])).map(m => m.slice());
    const p = Object.assign({}, b, { id: L.id, full: (b.full || b.name).replace(/ \((IE2|IE3)\)$/, '') + ' (Limitado)', rarity: 'limitada', ie: scaled(b, LM_AVG, LM_STAT_MAX), ie0: undefined, also: undefined,
      moves: lead.map(m => m.slice()).concat(rest), gacha: false, banner: null, inf: false, lim: true, limBase: L.base });
    GAME.players.push(p); PBY[p.id] = p;
  });
})();

const Limitado = {
  active() {
    if (!LM_END) return true;
    const d = new Date(), t = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return t <= LM_END;
  },
  data() {
    const P = Profile.data, D = { pulls: 0, pity: 0, packs: 0 }, H = P.lm = P.lm || {};
    for (const k in D) if (H[k] === undefined) H[k] = D[k];
    return H;
  },
  pool() {
    if (this._pool) return this._pool;
    const P = {};
    for (const t in LM_POOL_IDS) P[t] = LM_POOL_IDS[t].filter(id => PLAYER(id));
    return (this._pool = P);
  },
  ids() { const P = this.pool(); return ['limitada', 'legendaria', 'epica', 'rara', 'comun'].reduce((a, t) => a.concat(P[t]), []); },
  // Los jugadores limitados del banner (los 4 que salen en la cabecera del gacha)
  featured() { return this.pool().limitada.slice(); },
  // % de que un jugador concreto salga en una tirada: la probabilidad de su rareza repartida entre los jugadores de esa rareza
  chanceOf(id) {
    const P = this.pool();
    for (const [t, w] of LM_RATES) if (P[t].includes(id)) return w / P[t].length;
    return 0;
  },
  avgOf(pd) { return ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + pd.ie[k], 0) / 5; },
  // Un sobre: 10 jugadores por 100 tickets (null si no te llegan)
  pull() {
    const P = Profile.data, H = this.data(), pool = this.pool(), res = [];
    if (P.tickets < LM_PRICE) return null;
    P.tickets -= LM_PRICE;
    for (let i = 0; i < LM_N; i++) {
      let tier = 'comun';
      if (H.pity >= LM_PITY - 1) tier = 'limitada';
      else { let r = Math.random() * 100; for (const [t, w] of LM_RATES) { if (r < w) { tier = t; break; } r -= w; } }
      H.pity = tier === 'limitada' ? 0 : H.pity + 1;
      const list = pool[tier].length ? pool[tier] : pool.epica;
      res.push({ id: list[Math.floor(Math.random() * list.length)], tier });
    }
    // cada sobre trae al menos una épica o mejor
    if (!res.some(r => r.tier === 'epica' || r.tier === 'legendaria' || r.tier === 'limitada')) {
      const k = res.length - 1, list = pool.epica;
      res[k] = { id: list[Math.floor(Math.random() * list.length)], tier: 'epica' };
    }
    for (const r of res) {   // igual que el gacha normal: nuevo, una estrella más o monedas
      const o = P.coll[r.id];
      if (!o) { P.coll[r.id] = { stars: 1, up: {} }; r.isNew = true; }
      else if (o.stars < MAX_STARS) { o.stars++; r.star = o.stars; }
      else { const c = (RARITY[r.tier] || RARITY.comun).dupCoins; P.coins += c; r.coins = c; }
    }
    H.pulls += LM_N; H.packs++; P.pulls = (P.pulls || 0) + LM_N;
    Profile.save();
    return res;
  },
  // Jugadores nuevos que este dispositivo todavía no ha visto
  pendingNew(seen) { return NEW_PLAYERS.filter(n => PLAYER(n.id) && !(seen || []).includes(n.id)); },
};
