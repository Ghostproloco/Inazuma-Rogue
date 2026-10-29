/* =====================================================================
   PASE DE BATALLA (temporada 1)
   - 40 niveles. Se sube de nivel con experiencia (XP): +20 por partido, +30 más si ganas
     (en cualquier modo) y misiones diarias. También se pueden comprar niveles con tickets.
   - Dos caminos: GRATIS (todos) y PASE ORO (se desbloquea una vez con monedas: PB_PREMIUM_COST).
   - Premios finales: nivel 40 del Pase Oro = jugador exclusivo «Xene (Pase de batalla)» (id 993001,
     rareza `pase`, etiqueta «Pase de batalla» en vez de «Legendaria»). Solo se consigue aquí.
   - Datos: Profile.data.pb = { xp, premium, free:[niveles cobrados], gold:[…], day, d:{matches,wins,goals,got:[]} }
   - Para cambiar de temporada: PB_SEASON, PB_END (AAAA-MM-DD o null) y los premios en Pase.rewardOf.
   ===================================================================== */
const PB_SEASON = 1, PB_END = null;
const PB_LEVELS = 40, PB_XP = 100;              // XP por nivel
const PB_PREMIUM_COST = 1500;                   // monedas del Pase Oro
const PB_BUY_COST = 5;                          // tickets por nivel comprado
const PB_XP_MATCH = 20, PB_XP_WIN = 30;
const PB_PLAYER = 993001, PB_BASE = 21406;      // Xene

(function registerPase() {
  if (typeof GAME === 'undefined' || PBY[PB_PLAYER]) return;
  const b = PLAYER(PB_BASE); if (!b) return;
  const KEYS = ['tiro', 'control', 'defensa', 'rapidez', 'fisico'];
  const mk = f => { const ie = {}; for (const k in b.ie) ie[k] = Math.min(104, Math.round(b.ie[k] * f)); return ie; };
  const mean = ie => KEYS.reduce((t, k) => t + ie[k], 0) / KEYS.length;
  let lo = 0.5, hi = 3, ie = mk(1);
  for (let i = 0; i < 40; i++) { const f = (lo + hi) / 2; ie = mk(f); if (mean(ie) < 99) lo = f; else hi = f; }
  ie = mk(hi);
  b.gacha = false;   // la versión normal de Xene sale ya solo en el Pase (quien la tiene se la queda)
  const top = (b.moves || []).map(m => m[0]).filter(id => TECH(id)).sort((x, y) => TECH(y).power - TECH(x).power).slice(0, 2);
  const moves = top.map(id => [id, 100]).concat((b.moves || []).filter(m => !top.includes(m[0])).map(m => m.slice()));
  const p = Object.assign({}, b, { id: PB_PLAYER, full: (b.full || b.name).replace(/ \((IE2|IE3)\)$/, '') + ' (Pase de batalla)', rarity: 'pase', ie, ie0: undefined, also: undefined,
    moves, gacha: false, banner: null, inf: false, pase: true });
  GAME.players.push(p); PBY[p.id] = p;
  if (typeof LM_FX !== 'undefined') LM_FX[PB_PLAYER] = { a: 0xff4fd8, b: 0xffe27a };   // aura rosa y dorada en el campo
})();

const Pase = {
  active() {
    if (!PB_END) return true;
    const d = new Date(), t = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return t <= PB_END;
  },
  today() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },
  data() {
    const P = Profile.data, D = { xp: 0, premium: false, free: [], gold: [], day: '', d: { matches: 0, wins: 0, goals: 0, got: [] } }, H = P.pb = P.pb || {};
    for (const k in D) if (H[k] === undefined) H[k] = JSON.parse(JSON.stringify(D[k]));
    if (H.day !== this.today()) { H.day = this.today(); H.d = { matches: 0, wins: 0, goals: 0, got: [] }; }
    return H;
  },
  level() { return Math.min(PB_LEVELS, Math.floor(this.data().xp / PB_XP)); },
  xpInLevel() { const H = this.data(); return this.level() >= PB_LEVELS ? PB_XP : H.xp % PB_XP; },
  // Premios de cada nivel: { coins, tickets, rayos, pull, player }
  rewardOf(lv, gold) {
    const R = {};
    if (!gold) {
      R.coins = 100 + lv * 10;
      if (lv % 2 === 0) R.tickets = lv % 10 === 0 ? 5 : 2;
      if (lv % 10 === 0) R.rayos = 1;
    } else {
      R.coins = 250 + lv * 15;
      R.tickets = lv % 10 === 0 ? 8 : 3;
      if (lv % 5 === 0) R.rayos = 1;
      if (lv === 15 || lv === 30) R.pull = 10;
      if (lv === PB_LEVELS) R.player = PB_PLAYER;
    }
    return R;
  },
  rewardTx(R) {
    const a = [];
    if (R.player) a.push('⭐ ' + (PLAYER(R.player) || {}).name);
    if (R.pull) a.push('🎰 ×' + R.pull);
    if (R.coins) a.push('🪙 ' + R.coins);
    if (R.tickets) a.push('🎟️ ' + R.tickets);
    if (R.rayos) a.push('⚡ ' + R.rayos);
    return a.join(' · ');
  },
  state(lv, gold) {
    const H = this.data(), got = (gold ? H.gold : H.free).includes(lv);
    if (got) return 'got';
    if (lv > this.level()) return 'locked';
    if (gold && !H.premium) return 'premium';
    return 'ready';
  },
  pending() { let n = 0; for (let lv = 1; lv <= this.level(); lv++) for (const g of [false, true]) if (this.state(lv, g) === 'ready') n++; return n + this.MISSIONS.filter(m => this.missionState(m) === 'ready').length; },
  // Cobra un premio. Devuelve { res (tirada o null), player }
  claim(lv, gold, acc) {
    if (this.state(lv, gold) !== 'ready') return null;
    const P = Profile.data, H = this.data(), R = this.rewardOf(lv, gold);
    (gold ? H.gold : H.free).push(lv);
    P.coins += R.coins || 0; P.tickets += R.tickets || 0; P.rayos += R.rayos || 0;
    const out = acc || { res: [], player: false, R: {} };
    for (const k of ['coins', 'tickets', 'rayos']) out.R[k] = (out.R[k] || 0) + (R[k] || 0);
    if (R.pull) out.res = out.res.concat(Gacha.pull(R.pull, { banner: 1 }));
    if (R.player) {
      const o = P.coll[R.player]; out.player = true;
      if (!o) { P.coll[R.player] = { stars: 1, up: {} }; out.res.push({ id: R.player, tier: 'pase', isNew: true }); }
      else if (o.stars < MAX_STARS) { o.stars++; out.res.push({ id: R.player, tier: 'pase', star: o.stars }); }
      else { P.coins += RARITY.pase.dupCoins; out.res.push({ id: R.player, tier: 'pase', coins: RARITY.pase.dupCoins }); }
    }
    Profile.save(); return out;
  },
  claimAll() {
    const acc = { res: [], player: false, R: {} };
    for (let lv = 1; lv <= PB_LEVELS; lv++) for (const g of [false, true]) this.claim(lv, g, acc);
    return acc;
  },
  addXp(n) {
    const H = this.data(), before = this.level();
    H.xp = Math.min(PB_LEVELS * PB_XP, H.xp + n); Profile.save();
    return this.level() - before;
  },
  buyLevel() {
    const P = Profile.data;
    if (this.level() >= PB_LEVELS || P.tickets < PB_BUY_COST) return false;
    P.tickets -= PB_BUY_COST; const H = this.data(); H.xp = (this.level() + 1) * PB_XP; Profile.save(); return true;
  },
  buyPremium() {
    const P = Profile.data, H = this.data();
    if (H.premium || P.coins < PB_PREMIUM_COST) return false;
    P.coins -= PB_PREMIUM_COST; H.premium = true; Profile.save(); return true;
  },
  MISSIONS: [
    { id: 'm1', name: TX('Calentamiento'), desc: TX('Juega 3 partidos'), goal: 3, xp: 60, val: d => d.matches },
    { id: 'm2', name: TX('A ganar'), desc: TX('Gana 2 partidos'), goal: 2, xp: 80, val: d => d.wins },
    { id: 'm3', name: TX('Goleador'), desc: TX('Marca 5 goles'), goal: 5, xp: 70, val: d => d.goals },
  ],
  missionState(m) { const d = this.data().d; return d.got.includes(m.id) ? 'got' : m.val(d) >= m.goal ? 'ready' : 'locked'; },
  claimMission(id) {
    const m = this.MISSIONS.find(x => x.id === id); if (!m || this.missionState(m) !== 'ready') return 0;
    this.data().d.got.push(id); this.addXp(m.xp); return m.xp;
  },
  // Al acabar un partido (cualquier modo, salvo rendirse). Devuelve la XP ganada
  matchPlayed(won, goals) {
    if (!this.active()) return 0;
    const H = this.data(), n = PB_XP_MATCH + (won ? PB_XP_WIN : 0);
    H.d.matches++; if (won) H.d.wins++; H.d.goals += goals || 0;
    this.addXp(n); return n;
  },
};
