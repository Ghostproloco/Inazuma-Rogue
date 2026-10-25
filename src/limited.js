/* =====================================================================
   GACHA LIMITADO DE BAI LONG + AVISO DE JUGADORES NUEVOS
   - Rareza nueva «limitada» (RARITY.limitada en run.js): solo Bai Long.
   - Bai Long (id 998004, registrado en go.js): media 100, delantero de fuego,
     con su tiro «Dragón relámpago» y su técnica «Estela del dragón blanco».
   - Sobre limitado: 100 🎟️ = 10 jugadores. Bote de 10 jugadores:
       limitada · Bai Long
       legendaria · Arion, Victor, Riccardo y Bianchi Christmas
         (ya NO se consiguen con códigos: solo aquí)
       épica · Jang Cho, Jim Flareson · rara · Changsu Choi, Umi Wang · común · Sol Crater
   - Cada sobre de 10 trae al menos una épica o mejor; Bai Long asegurado a las 30 tiradas sin él.
   - NEW_PLAYERS: al añadir un jugador nuevo, pon aquí su id y la versión: al abrir
     el juego sale una pantalla con él (una sola vez por dispositivo).
   ===================================================================== */
const LM_BANNER = 68;
const LM_PRICE = 100, LM_N = 10;                  // 100 tickets por sobre de 10 jugadores
const LM_PITY = 30;                               // Bai Long asegurado a las 30 tiradas sin él
const LM_RATES = [['limitada', 2], ['legendaria', 10], ['epica', 23], ['rara', 30], ['comun', 35]];
const LM_END = null;                              // último día del gacha limitado (AAAA-MM-DD); null = sin fecha de fin
const BAI_ID = 998004;
const LM_POOL_IDS = {
  limitada: [BAI_ID],
  legendaria: [998001, 998002, 998003, 997008],
  epica: [31766, 21459],
  rara: [31775, 31767],
  comun: [277],
};
// Jugadores nuevos: se enseñan al abrir el juego la primera vez (settings.seenPlayers)
const NEW_PLAYERS = [
  { id: BAI_ID, v: '0.31.13' },
];

// Técnicas de Bai Long (solo suyas: `lim` las saca de los premios aleatorios y de las técnicas legendarias del gacha)
const BAI_TECHS = [
  { id: 30490, name: 'Dragón relámpago', name_en: 'Lightning Dragon', type: 'tiro', tp: 80, power: 125, elem: 'fuego', lim: true },
  { id: 30491, name: 'Estela del dragón blanco', name_en: 'White Dragon Trail', type: 'regate', tp: 60, power: 100, elem: 'fuego', lim: true },
];
(function registerBaiLong() {
  if (typeof GAME === 'undefined') return;
  BAI_TECHS.forEach(t => { if (!GAME.techniques[String(t.id)]) GAME.techniques[String(t.id)] = Object.assign({}, t, typeof I18N !== 'undefined' && I18N.en() ? { name: t.name_en } : {}); });
  const b = PLAYER(BAI_ID); if (!b) return;
  const rest = (b.moves || []).filter(m => m[1] !== 100 && !BAI_TECHS.some(t => t.id === m[0])).map(m => m.slice());
  b.moves = [[30490, 100], [30491, 100]].concat(rest);   // nivel 100 = técnica de historia: la primera es su tiro
  b.rarity = 'limitada'; b.lim = true;
  b.ie = Object.assign({}, b.ie, { tiro: 104, control: 98, defensa: 96, rapidez: 102, fisico: 100, aguante: 100 });   // media 100 (tiro+control+defensa+rapidez+físico)
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
