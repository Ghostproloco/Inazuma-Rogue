/* =====================================================================
   EVENTO «SOBRE SELVA» (v0.35, del 25 al 28 de octubre, ambos incluidos)
   - Gacha especial con tickets: jugadores de diseños raros (Mar de Árboles, Occult, Wild, Farm,
     Shuriken, Otaku…) y 6 legendarios exclusivos con diseño de evento «selva y oro»
     (pelo verde selva u oro y botas doradas, marco de madera y lianas).
   - 4 «top» (uno por puesto, al nivel de los mejores del juego) y 2 «de relleno» más flojos.
     Legendario 3 %: los 4 top se reparten el 1 % y los 2 de relleno el 2 % (1 % más).
     Legendario asegurado a las 50 tiradas en este sobre.
   - Los legendarios se registran siempre: si los consigues, son tuyos para siempre.
   ===================================================================== */
const SV_START = '2026-10-25', SV_END = '2026-10-28';   // ambos incluidos (hora del dispositivo)
const SV_BANNER = 77, SV_PRICE = 1, SV_PITY = 50;
const SV_RATES = [['legendaria', 3], ['epica', 15], ['rara', 32], ['comun', 50]];
const SV_TOP_SHARE = 1 / 3;   // del 3 % legendario: 1 % para los 4 top, 2 % para los 2 de relleno
const SV_TEAMS = ['Mar de Árboles', 'Occult', 'Wild', 'Farm', 'Shuriken', 'Otaku', 'Brain', 'Royal Academy Redux', 'Servicio Secreto', 'Mary Times', 'Triple C',
  'Tormenta de Géminis', 'Épsilon', 'Épsilon Plus', 'Génesis', 'Prominence', 'Polvo de Diamantes', 'Caos', 'Team Zoolan', 'Team D', 'Dark Angel', 'Demons Z', 'The Ogre', 'Claustro Sagrado'];
// Técnicas de evento (con animaciones de la selva: hojarasca, lianas, ciclón, tsunami…)
const SV_TECHS = [
  { id: 30901, name: 'Hojarasca de la pantera', name_en: 'Panther Leafstorm', type: 'parada', power: 105, elem: 'bosque' },
  { id: 30902, name: 'Ciclón de lianas', name_en: 'Vine Cyclone', type: 'bloqueo', power: 105, elem: 'viento' },
  { id: 30903, name: 'Remolino de la jungla', name_en: 'Jungle Whirl', type: 'regate', power: 105, elem: 'montaña' },
  { id: 30904, name: 'Tsunami del kappa', name_en: 'Kappa Tsunami', type: 'tiro', power: 120, elem: 'viento' },
  { id: 30905, name: 'Remolino de musgo', name_en: 'Moss Whirl', type: 'regate', power: 94, elem: 'bosque' },
  { id: 30906, name: 'Tarzán de la selva', name_en: 'Jungle Tarzan', type: 'tiro', power: 110, elem: 'bosque' },
];
// Legendarios: versión de evento de jugadores con diseños raros. mean = media; techs = las que lleva (las mejores de su elemento + la de evento)
const SV_GOLD = '#e0b030', SV_GREEN = '#24701f';
const SV_LEGENDS = [
  { id: 995001, base: 21532, role: 'POR', elem: 'bosque', mean: 96, top: true, techs: [30901, 401, 30428], look: { hair: SV_GREEN, boots: SV_GOLD, hs: ['#9c4a10', '#733100', '#cd6a20'], hf: ['#833908', '#5a2908', '#6a3108', '#a44a10', '#6a2008', '#8b2000', '#b42900', '#391018', '#4a1818'] } },   // Joseph King (Royal Academy Redux)
  { id: 995002, base: 1419, role: 'DEF', mean: 95, top: true, techs: [30902, 391, 132, 30356], look: { hair: SV_GREEN, boots: SV_GOLD, hs: ['#736a52', '#625241', '#524a31', '#947b62'], hf: ['#413929', '#5a4a39', '#736252', '#a49483'] } },   // Harry Boufante (Mar de Árboles)
  { id: 995003, base: 1425, role: 'MED', mean: 95, top: true, techs: [30903, 332, 380, 289], look: { hair: SV_GOLD, boots: SV_GOLD, hs: [], hf: ['#5a6200', '#738300'] } },   // Chase Faithfull (Mar de Árboles)
  { id: 995004, base: 31992, role: 'DEL', mean: 96, top: true, techs: [30904, 295, 283, 30356], look: { hair: SV_GOLD, boots: SV_GOLD, hs: ['#18315a', '#204183', '#3962ac'], hf: ['#295294', '#203973', '#4a6aac'] } },   // Karl Kappa, de delantero
  { id: 995005, base: 1423, role: 'MED', elem: 'bosque', mean: 89, top: false, techs: [30905, 339, 468], look: { hair: SV_GOLD, boots: SV_GOLD, hs: ['#7b9c39', '#526a29'], hf: ['#525a20', '#738329', '#627320', '#394118', '#8b9c39'] } },   // Garjan Cypress (relleno)
  { id: 995006, base: 1428, role: 'DEL', elem: 'bosque', mean: 89, top: false, techs: [30906, 30344], look: { hair: SV_GOLD, boots: SV_GOLD, hs: ['#205220'], hf: ['#314a18', '#5a7329', '#739441'] } },   // Scaber Enoki (relleno)
];
// Qué estadísticas pesan más en cada puesto (suben un poco; el resto baja un poco)
const SV_ROLE_KEYS = { POR: ['defensa', 'fisico'], DEF: ['defensa', 'fisico'], MED: ['control', 'rapidez'], DEL: ['tiro', 'rapidez'] };
(function registerSelva() {
  if (typeof GAME === 'undefined') return;
  for (const t of SV_TECHS) if (!GAME.techniques[t.id]) GAME.techniques[t.id] = Object.assign({}, t);
  const KEYS = ['tiro', 'control', 'defensa', 'rapidez', 'fisico'];
  for (const L of SV_LEGENDS) {
    const b = PLAYER(L.base); if (!b || PBY[L.id]) continue;
    // su perfil (en qué destaca) a la mitad, más lo que pide su puesto, y luego se cuadra la media sin pasar de 99
    const mean = KEYS.reduce((t, k) => t + b.ie[k], 0) / KEYS.length, ie = {}, up = SV_ROLE_KEYS[L.role];
    for (const k in b.ie) ie[k] = Math.round(L.mean + (b.ie[k] - mean) * 0.5 + (up.includes(k) ? 3 : k === 'aguante' ? 0 : -2));
    const clamp = k => { ie[k] = Math.max(40, Math.min(99, ie[k])); };
    KEYS.forEach(clamp); clamp('aguante');
    for (let n = 0; n < 200; n++) {
      const m = KEYS.reduce((t, k) => t + ie[k], 0) / KEYS.length; if (Math.abs(m - L.mean) < 0.3) break;
      const k = KEYS[n % 5]; if (m < L.mean && ie[k] < 99) ie[k]++; else if (m > L.mean && ie[k] > 40) ie[k]--;
    }
    const moves = L.techs.filter(t => GAME.techniques[t]).map((t, i) => [t, i ? 1 + i * 8 : 1]);
    const p = Object.assign({}, b, { id: L.id, name: b.name.replace(/ \((IE2|IE3)\)$/, ''), full: (b.full || b.name).replace(/ \((IE2|IE3)\)$/, '') + ' (Selva)', role: L.role, elem: L.elem || b.elem, rarity: 'legendaria', ie, ie0: undefined, moves,
      gacha: false, banner: null, inf: false, selva: true, hwBase: L.base, look: Object.assign({}, L.look) });
    GAME.players.push(p); PBY[p.id] = p;
  }
})();

const Selva = {
  get forced() { return typeof Halloween !== 'undefined' && Halloween.forced; },   // la beta lo enseña siempre
  today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  active() { return false; },   // el Sobre Selva se quitó (28 oct): no sale más; los legendarios que ya tengas siguen siendo tuyos
  daysLeft() { const end = new Date(SV_END + 'T23:59:59'); return Math.max(0, Math.ceil((end - new Date()) / 86400000)); },
  data() { const P = Profile.data, S = P.sv = P.sv || {}; if (S.pity == null) S.pity = 0; if (S.pulls == null) S.pulls = 0; return S; },
  legends() { return SV_LEGENDS.map(L => PLAYER(L.id)).filter(Boolean); },
  pool() {
    if (this._pool) return this._pool;
    const ids = new Set();
    for (const k of SV_TEAMS) { const T = TEAM(k); if (T) T.players.forEach(m => { const p = Shop.poolOf(PLAYER(m.id)); if (p) ids.add(p.id); }); }
    const P = {};
    for (const t of ['epica', 'rara', 'comun']) {
      P[t] = [...ids].filter(id => PLAYER(id).rarity === t);
      // comunes y raros: también los del sobre de Villanos (aliens, demonios, ogros…), que son pocos en esos equipos
      if (t !== 'epica') { const have = new Set(P[t]); GAME.players.forEach(p => { if (p.cs && p.gacha !== false && p.banner === 3 && !p.halloween && !p.original && !p.special && !p.selva && p.rarity === t && !have.has(p.id)) { have.add(p.id); P[t].push(p.id); } }); }
    }
    return (this._pool = P);
  },
  // Legendario: los de relleno salen más (2 % entre los dos) que los top (1 % entre los cuatro)
  pickLegend(rnd = Math.random()) {
    const tops = SV_LEGENDS.filter(L => L.top), fill = SV_LEGENDS.filter(L => !L.top);
    const list = rnd < SV_TOP_SHARE ? tops : fill;
    return list[Math.floor(Math.random() * list.length)].id;
  },
  pull(n) {
    const S = this.data(), P = Profile.data, pool = this.pool(), res = [];
    if (P.tickets < SV_PRICE * n) return null;
    P.tickets -= SV_PRICE * n;
    for (let i = 0; i < n; i++) {
      let tier = 'comun';
      if (S.pity >= SV_PITY - 1) tier = 'legendaria';
      else { let r = Math.random() * 100; for (const [t, w] of SV_RATES) { if (r < w) { tier = t; break; } r -= w; } }
      S.pity = tier === 'legendaria' ? 0 : S.pity + 1;
      const id = tier === 'legendaria' ? this.pickLegend() : pool[tier][Math.floor(Math.random() * pool[tier].length)];
      res.push({ id, tier });
    }
    for (const r of res) {   // igual que el gacha normal: nuevo, una estrella más o monedas
      const o = P.coll[r.id];
      if (!o) { P.coll[r.id] = { stars: 1, up: {} }; r.isNew = true; }
      else if (o.stars < MAX_STARS) { o.stars++; r.star = o.stars; }
      else { const c = RARITY[r.tier].dupCoins; P.coins += c; r.coins = c; }
    }
    S.pulls += n; P.pulls = (P.pulls || 0) + n;
    Profile.save();
    return res;
  },
};
