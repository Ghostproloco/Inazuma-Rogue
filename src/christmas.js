/* =====================================================================
   EVENTO DE NAVIDAD (24 oct – 6 ene): todo fuera de los modos, igual que Halloween.
   - Moneda ❄️ copos de nieve (perfil: Profile.data.xm): +5 por partido en
     cualquier modo (+10 si ganas), +20 de regalo diario, +60 al ganar al
     Alpino jefe (una vez al día) y los retos del evento.
   - Sobre Navideño: 15 ❄️ por tirada (150 la de 10); jugadores de nieve/hielo y
     6 legendarios exclusivos (versiones Navidad, nuevos ids 997001…).
     Legendario 3 % · épica 15 % · rara 32 % · común 50 %; legendario
     asegurado a las 40 tiradas sin uno.
   - 3 retos del evento + 4 retos del día; al completar los 3 del evento
     se regala Shawn Froste de Navidad (épico especial).
   - Premios por entrar: 5 días (no hace falta que sean seguidos).
   - Fuera de fechas no se ve nada (salvo forzarlo en el modo desarrollador).
   Los jugadores se registran siempre: si los consigues, son tuyos para siempre.
   ===================================================================== */
const XM_START = '2026-10-24', XM_END = '2027-01-06';   // ambos incluidos (hora del dispositivo)
const XM_BANNER = 67;
const XM_PRICE = 15, XM_PITY = 40;
const XM_RATES = [['legendaria', 3], ['epica', 15], ['rara', 32], ['comun', 50]];
const XM_BOSS_AVG = 85, XM_BOSS_STAR = 93, XM_BOSS_TEAM = 'Alpino', XM_BOSS_STAR_ID = 21505;   // Alpino jefe; su estrella es Shawn Froste (IE2)
const XM_DAILY = 20, XM_BOSS = 60, XM_MATCH = 5, XM_WIN = 10;

// Legendarios exclusivos: versión Navidad de jugadores reales (mismo aspecto, stats de legendario)
const XM_LEGENDS = [
  { id: 997001, base: 1514 },    // Shawn Froste
  { id: 997002, base: 10 },      // Axel Blaze
  { id: 997003, base: 1 },       // Mark Evans
  { id: 997004, base: 29 },      // Jude Sharp
  { id: 997005, base: 157 },     // Byron Love
  { id: 997006, base: 32370 },   // Xavier Foster
];
// Épico especial (premio del día 5 y del último reto): Shawn Froste (IE3) con la mejor media de los épicos
const XM_EPIC = { id: 997007, base: 31170, mean: 86 };
(function registerChristmas() {
  if (typeof GAME === 'undefined') return;
  const reg = (p, list) => { if (PBY[p.id]) return; if (list) GAME.players.push(p); PBY[p.id] = p; };
  const KEYS = ['tiro', 'control', 'defensa', 'rapidez', 'fisico'];
  const scaled = (b, target) => {
    const mean = KEYS.reduce((t, k) => t + b.ie[k], 0) / KEYS.length, f = target / mean, ie = {};
    for (const k in b.ie) ie[k] = Math.min(99, Math.round(b.ie[k] * f));
    return ie;
  };
  XM_LEGENDS.forEach(L => {
    const b = PLAYER(L.base); if (!b) return;
    reg(Object.assign({}, b, { id: L.id, full: (b.full || b.name) + ' (Navidad)', rarity: 'legendaria', ie: scaled(b, 93), ie0: undefined,
      moves: (b.moves || []).map(m => m.slice()), gacha: false, banner: null, inf: false, xmas: true, xmBase: L.base }), true);
  });
  { const b = PLAYER(XM_EPIC.base);
    if (b) reg(Object.assign({}, b, { id: XM_EPIC.id, full: (b.full || b.name).replace(/ \((IE2|IE3)\)$/, '') + ' (Navidad)', rarity: 'epica', ie: scaled(b, XM_EPIC.mean), ie0: undefined,
      moves: (b.moves || []).map(m => m.slice()), gacha: false, banner: null, inf: false, xmas: true, xmBase: XM_EPIC.base }), true);
  }
})();

const Navidad = {
  forced: false,   // (desarrollador) ver el evento fuera de fechas
  today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  active() { if (this.forced) return true; const t = this.today(); return t >= XM_START && t <= XM_END; },
  daysLeft() { const end = new Date(XM_END + 'T23:59:59'); return Math.max(0, Math.ceil((end - new Date()) / 86400000)); },
  data() {
    const P = Profile.data;
    const D = { snow: 0, pulls: 0, pity: 0, daily: null, boss: null, bossWins: 0, matches: 0, retos: {}, legends: 0, gift: false };
    const H = P.xm = P.xm || {};
    for (const k in D) if (H[k] === undefined) H[k] = D[k];
    return H;
  },
  // Regalo diario (devuelve los copos dados o 0)
  daily() {
    if (!this.active()) return 0;
    const H = this.data(), t = this.today(); if (H.daily === t) return 0;
    H.daily = t; H.snow += XM_DAILY; Profile.save(); return XM_DAILY;
  },
  // Al acabar un partido de cualquier modo
  matchPlayed(won) {
    if (!this.active()) return 0;
    const H = this.data(), n = XM_MATCH + (won ? XM_WIN : 0);
    H.snow += n; H.matches++;
    const T = this.dayData(); T.matches++; if (won) T.wins++;
    Profile.save(); return n;
  },
  bossDone() { return this.data().boss === this.today(); },
  bossResult(won) {
    const H = this.data(); let n = 0;
    if (won) { H.bossWins++; this.dayData().boss++; if (H.boss !== this.today()) { H.boss = this.today(); n = XM_BOSS; H.snow += n; } }
    Profile.save(); return n;
  },
  // Rival jefe: el Alpino con media 85 (Shawn Froste, 93), en campo nevado
  bossTeam() {
    const mean = pd => ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + pd.ie[k], 0) / 5;
    return rivalTeam(XM_BOSS_TEAM, pd => (pd.id === XM_BOSS_STAR_ID ? XM_BOSS_STAR : XM_BOSS_AVG) / mean(pd), 1);
  },

  /* ---------- Sobre Navideño ---------- */
  pool() {
    if (this._pool) return this._pool;
    const alp = (TEAM(XM_BOSS_TEAM) || { players: [] }).players.map(p => p.id);
    const snowy = p => /nieve|snow|frost|froste|ice|hielo|ártic|artic|polar|alpin/i.test(p.name + ' ' + (p.full || '')) || alp.includes(p.id) || p.elem === 'viento';
    const ok = p => p.cs && p.gacha !== false && !p.halloween && !p.xmas && snowy(p);
    const P = { legendaria: XM_LEGENDS.map(L => L.id).filter(id => PLAYER(id)) };
    for (const t of ['epica', 'rara', 'comun']) P[t] = GAME.players.filter(p => ok(p) && p.rarity === t).map(p => p.id);
    return (this._pool = P);
  },
  pull(n) {
    const H = this.data(), P = Profile.data, pool = this.pool(), res = [];
    if (H.snow < XM_PRICE * n) return null;
    H.snow -= XM_PRICE * n;
    for (let i = 0; i < n; i++) {
      let tier = 'comun';
      if (H.pity >= XM_PITY - 1) tier = 'legendaria';
      else { let r = Math.random() * 100; for (const [t, w] of XM_RATES) { if (r < w) { tier = t; break; } r -= w; } }
      H.pity = tier === 'legendaria' ? 0 : H.pity + 1;
      const list = pool[tier].length ? pool[tier] : pool.epica;
      res.push({ id: list[Math.floor(Math.random() * list.length)], tier });
    }
    for (const r of res) {   // igual que el gacha normal: nuevo, una estrella más o monedas
      const o = P.coll[r.id];
      if (!o) { P.coll[r.id] = { stars: 1, up: {} }; r.isNew = true; }
      else if (o.stars < MAX_STARS) { o.stars++; r.star = o.stars; }
      else { const c = RARITY[r.tier].dupCoins; P.coins += c; r.coins = c; }
    }
    H.pulls += n; this.dayData().pulls += n; H.legends = XM_LEGENDS.filter(L => P.coll[L.id]).length;
    P.pulls = (P.pulls || 0) + n;
    Profile.save();
    return res;
  },

  /* ---------- Retos del evento ---------- */
  RETOS: [
    { id: 'boss', name: TX('Rey del hielo'), desc: TX('Gana al Alpino jefe'), goal: 1, val: H => H.bossWins, reward: { snow: 40, tickets: 5 } },
    { id: 'pulls', name: TX('Cartas a Papá Noel'), desc: TX('Haz 20 tiradas del Sobre Navideño'), goal: 20, val: H => H.pulls, reward: { snow: 60, tickets: 8 } },
    { id: 'legend', name: TX('Regalo de Reyes'), desc: TX('Consigue un legendario de Navidad'), goal: 1, val: H => H.legends, reward: { snow: 80, tickets: 12 } },
  ],
  retoState(R) { const H = this.data(); return H.retos[R.id] ? 'got' : R.val(H) >= R.goal ? 'ready' : 'locked'; },
  claim(id) {
    const R = this.RETOS.find(x => x.id === id), H = this.data(); if (!R || this.retoState(R) !== 'ready') return null;
    H.retos[id] = Date.now(); H.snow += R.reward.snow || 0; Profile.data.tickets += R.reward.tickets || 0;
    const all = this.RETOS.every(x => H.retos[x.id]); let gift = null;
    if (all && !H.gift) { H.gift = true; gift = this.give(XM_EPIC.id); }
    Profile.save();
    return { reward: R.reward, gift };
  },
  /* ---------- Retos diarios: se renuevan cada medianoche (hora del dispositivo) ---------- */
  DAILY: [
    { id: 'd_play', name: TX('Tarde de partidos'), desc: TX('Juega 3 partidos hoy'), goal: 3, val: T => T.matches, reward: { snow: 25, tickets: 1 } },
    { id: 'd_win', name: TX('Victoria navideña'), desc: TX('Gana 2 partidos hoy'), goal: 2, val: T => T.wins, reward: { snow: 35, tickets: 2 } },
    { id: 'd_pull', name: TX('Abre un regalo'), desc: TX('Haz 3 tiradas del Sobre Navideño hoy'), goal: 3, val: T => T.pulls, reward: { snow: 20, tickets: 3 } },
    { id: 'd_boss', name: TX('Rey del hielo del día'), desc: TX('Gana hoy al Alpino jefe'), goal: 1, val: T => T.boss, reward: { snow: 20, tickets: 2 } },
  ],
  dayData() {
    const H = this.data(), t = this.today();
    if (!H.day || H.day.date !== t) H.day = { date: t, matches: 0, wins: 0, pulls: 0, boss: 0, got: {} };
    return H.day;
  },
  dailyState(R) { const T = this.dayData(); return T.got[R.id] ? 'got' : R.val(T) >= R.goal ? 'ready' : 'locked'; },
  claimDaily(id) {
    const R = this.DAILY.find(x => x.id === id); if (!R || !this.active() || this.dailyState(R) !== 'ready') return null;
    const T = this.dayData(); T.got[id] = Date.now(); this.data().snow += R.reward.snow || 0; Profile.data.tickets += R.reward.tickets || 0;
    Profile.save(); return R.reward;
  },
  pending() { return this.active() ? this.RETOS.filter(R => this.retoState(R) === 'ready').length + this.DAILY.filter(R => this.dailyState(R) === 'ready').length : 0; },
  giftUnlocked() { return !!(Profile.data.xm && Profile.data.xm.gift); },

  /* ---------- Premios por entrar: 5 días (no hace falta que sean seguidos), además del regalo diario ---------- */
  LOGIN: [
    { snow: 150, label: TX('150 copos'), icon: '❄️' },
    { tickets: 10, label: TX('10 tickets'), icon: '🎟️' },
    { coins: 1000, label: TX('1000 monedas'), icon: '🪙' },
    { pick: true, label: TX('Elige 1 de 3 jugadores de +80'), icon: '⭐' },
    { player: XM_EPIC.id, label: TX('Shawn Froste de Navidad (épico especial) de regalo'), icon: '🎁' },
  ],
  login() { const H = this.data(); H.login = H.login || { n: 0, last: null, pick: null }; return H.login; },
  loginReady() { const L = this.login(); return this.active() && L.n < this.LOGIN.length && L.last !== this.today(); },
  // Media de un jugador (las 5 estadísticas) y bote del día 4: cualquier jugador del juego con media 80 o más
  avgOf(pd) { return ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + pd.ie[k], 0) / 5; },
  pickPool() { return GAME.players.filter(p => p.cs && p.gacha !== false && !p.halloween && !p.xmas && this.avgOf(p) >= 80).map(p => p.id); },
  // Las 3 opciones se guardan: aunque salgas y vuelvas, son las mismas
  pickOptions() {
    const L = this.login();
    if (!L.pick) { const pool = this.pickPool().slice(); L.pick = []; while (L.pick.length < 3 && pool.length) L.pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); Profile.save(); }
    return L.pick;
  },
  // Da un jugador como el gacha: nuevo, una estrella más o monedas si ya está al máximo
  give(id) {
    const P = Profile.data, pd = PLAYER(id), o = P.coll[id], r = { id, tier: pd.rarity };
    if (!o) { P.coll[id] = { stars: 1, up: {} }; r.isNew = true; }
    else if (o.stars < MAX_STARS) { o.stars++; r.star = o.stars; }
    else { const c = (RARITY[pd.rarity] || RARITY.comun).dupCoins; P.coins += c; r.coins = c; }
    return r;
  },
  claimLogin(choice) {
    if (!this.loginReady()) return null;
    const L = this.login(), R = this.LOGIN[L.n], P = Profile.data, H = this.data(), out = { day: L.n + 1, reward: R, players: [] };
    if (R.pick) { if (!this.pickOptions().includes(+choice)) return null; out.players.push(this.give(+choice)); L.pick = null; }
    if (R.player && PLAYER(R.player)) out.players.push(this.give(R.player));
    H.snow += R.snow || 0; P.tickets += R.tickets || 0; P.coins += R.coins || 0;
    L.n++; L.last = this.today();
    Profile.save();
    return out;
  },
};
