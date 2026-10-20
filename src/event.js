/* =====================================================================
   EVENTO DE HALLOWEEN (23 oct – 3 nov): todo fuera de los modos.
   - Moneda 🍬 caramelos (perfil: Profile.data.hw): +5 por partido en
     cualquier modo (+10 si ganas), +20 de regalo diario, +60 al ganar al
     Ocultismo jefe (una vez al día) y los retos del evento.
   - Sobre Calabaza: 30 🍬 por tirada; jugadores villanos/de miedo y
     5 legendarios exclusivos (versiones Halloween, nuevos ids 996001…).
     Legendario 3 % · épica 15 % · rara 32 % · común 50 %; legendario
     asegurado a las 40 tiradas sin uno.
   - 3 retos; al completarlos, Ray Dark se puede elegir como mánager en el
     Modo Carrera (+10 % de ingresos).
   - Fuera de fechas no se ve nada (salvo forzarlo en el modo desarrollador).
   Los legendarios se registran siempre: si los consigues, son tuyos para siempre.
   ===================================================================== */
const HW_START = '2026-10-23', HW_END = '2026-11-03';   // ambos incluidos (hora del dispositivo)
const HW_BANNER = 66;
const HW_PRICE = 30, HW_PITY = 40;
const HW_RATES = [['legendaria', 3], ['epica', 15], ['rara', 32], ['comun', 50]];
const HW_DAILY = 20, HW_BOSS = 60, HW_MATCH = 5, HW_WIN = 10;

// Legendarios exclusivos: versión Halloween de jugadores reales (mismo aspecto, stats de legendario)
const HW_LEGENDS = [
  { id: 996001, base: 30037, extra: 'Tiro fantasma' },   // Johan Tassman
  { id: 996002, base: 36 },                              // Nathan Jones
  { id: 996003, base: 32025 },                           // Destra
  { id: 996004, base: 32018 },                           // Hebimos
  { id: 996005, base: 32001 },                           // Bash Lancer
];
(function registerHalloween() {
  if (typeof GAME === 'undefined') return;
  const reg = (p, list) => { if (PBY[p.id]) return; if (list) GAME.players.push(p); PBY[p.id] = p; };
  const KEYS = ['tiro', 'control', 'defensa', 'rapidez', 'fisico'];
  for (const L of HW_LEGENDS) {
    const b = PLAYER(L.base); if (!b) continue;
    const mean = KEYS.reduce((t, k) => t + b.ie[k], 0) / KEYS.length, f = 93 / mean, ie = {};
    for (const k in b.ie) ie[k] = Math.min(99, Math.round(b.ie[k] * f));
    const moves = (b.moves || []).map(m => m.slice());
    if (L.extra) { const t = Object.values(GAME.techniques).find(x => x.name === L.extra && x.id < 30000); if (t && !moves.some(m => m[0] === t.id)) moves.unshift([t.id, 1]); }
    reg(Object.assign({}, b, { id: L.id, full: b.full + ' (Halloween)', rarity: 'legendaria', ie, ie0: undefined, moves, gacha: false, banner: null, halloween: true }), true);
  }
  // Ray Dark: solo como mánager (su retrato es el escudo de los Emperadores Oscuros); no entra en las listas de jugadores
  reg({ id: RAY_DARK, name: 'Ray Dark', full: 'Ray Dark', role: 'MED', elem: 'neutro', rarity: 'legendaria', crestFace: 41, ie: { tiro: 50, control: 50, defensa: 50, rapidez: 50, fisico: 50, aguante: 50 }, moves: [], gacha: false, halloween: true });
})();

const Halloween = {
  forced: false,   // (desarrollador) ver el evento fuera de fechas
  today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  active() { if (this.forced) return true; const t = this.today(); return t >= HW_START && t <= HW_END; },
  daysLeft() { const end = new Date(HW_END + 'T23:59:59'); return Math.max(0, Math.ceil((end - new Date()) / 86400000)); },
  data() {
    const P = Profile.data;
    const D = { candy: 0, pulls: 0, pity: 0, daily: null, boss: null, bossWins: 0, matches: 0, retos: {}, legends: 0, ray: false };
    const H = P.hw = P.hw || {};
    for (const k in D) if (H[k] === undefined) H[k] = D[k];
    return H;
  },
  // Regalo diario (devuelve los caramelos dados o 0)
  daily() {
    if (!this.active()) return 0;
    const H = this.data(), t = this.today(); if (H.daily === t) return 0;
    H.daily = t; H.candy += HW_DAILY; Profile.save(); return HW_DAILY;
  },
  // Al acabar un partido de cualquier modo
  matchPlayed(won) {
    if (!this.active()) return 0;
    const H = this.data(), n = HW_MATCH + (won ? HW_WIN : 0);
    H.candy += n; H.matches++; Profile.save(); return n;
  },
  bossDone() { return this.data().boss === this.today(); },
  bossResult(won) {
    const H = this.data(); let n = 0;
    if (won) { H.bossWins++; if (H.boss !== this.today()) { H.boss = this.today(); n = HW_BOSS; H.candy += n; } }
    Profile.save(); return n;
  },
  // Rival jefe: el Instituto Ocultismo muy reforzado, en campo nocturno con niebla
  bossTeam() { return rivalTeam('Occult', 1.3, 1); },

  /* ---------- Sobre Calabaza ---------- */
  pool() {
    if (this._pool) return this._pool;
    const occ = (TEAM('Occult') || { players: [] }).players.map(p => p.id);
    const ok = p => p.cs && p.gacha !== false && !p.halloween && (p.banner === 3 || occ.includes(p.id));
    const P = { legendaria: HW_LEGENDS.map(L => L.id).filter(id => PLAYER(id)) };
    for (const t of ['epica', 'rara', 'comun']) P[t] = GAME.players.filter(p => ok(p) && p.rarity === t).map(p => p.id);
    return (this._pool = P);
  },
  pull(n) {
    const H = this.data(), P = Profile.data, pool = this.pool(), res = [];
    if (H.candy < HW_PRICE * n) return null;
    H.candy -= HW_PRICE * n;
    for (let i = 0; i < n; i++) {
      let tier = 'comun';
      if (H.pity >= HW_PITY - 1) tier = 'legendaria';
      else { let r = Math.random() * 100; for (const [t, w] of HW_RATES) { if (r < w) { tier = t; break; } r -= w; } }
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
    H.pulls += n; H.legends = HW_LEGENDS.filter(L => P.coll[L.id]).length;
    P.pulls = (P.pulls || 0) + n;
    Profile.save();
    return res;
  },

  /* ---------- Retos del evento ---------- */
  RETOS: [
    { id: 'boss', name: TX('Exorcista'), desc: TX('Gana al Ocultismo jefe'), goal: 1, val: H => H.bossWins, reward: { candy: 40, tickets: 5 } },
    { id: 'pulls', name: TX('Truco o trato'), desc: TX('Haz 20 tiradas del Sobre Calabaza'), goal: 20, val: H => H.pulls, reward: { candy: 60, tickets: 8 } },
    { id: 'legend', name: TX('Coleccionista de sustos'), desc: TX('Consigue un legendario de Halloween'), goal: 1, val: H => H.legends, reward: { candy: 80, tickets: 12 } },
  ],
  retoState(R) { const H = this.data(); return H.retos[R.id] ? 'got' : R.val(H) >= R.goal ? 'ready' : 'locked'; },
  claim(id) {
    const R = this.RETOS.find(x => x.id === id), H = this.data(); if (!R || this.retoState(R) !== 'ready') return null;
    H.retos[id] = Date.now(); H.candy += R.reward.candy || 0; Profile.data.tickets += R.reward.tickets || 0;
    const all = this.RETOS.every(x => H.retos[x.id]); if (all && !H.ray) H.ray = true;
    Profile.save();
    return { reward: R.reward, ray: all };
  },
  pending() { return this.active() ? this.RETOS.filter(R => this.retoState(R) === 'ready').length : 0; },
  rayUnlocked() { return !!(Profile.data.hw && Profile.data.hw.ray); },
};
