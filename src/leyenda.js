/* =====================================================================
   EVENTO «CADENA LEYENDA» (v0.35.1, del 25 al 27 de octubre, ambos incluidos)
   - 15 partidos seguidos contra los 15 mejores equipos del juego, de menos a más.
   - Una derrota y vuelves a empezar desde el partido 1.
   - Dificultad real, sin ventajas: los rivales juegan con sus estadísticas de verdad
     y como mucho 2 supertécnicas (igual que tú), no corren ni roban más fácil que tú
     (dificultad 'leyenda' en logic.js); lo que tienen es cabeza: piensan rápido, se colocan
     bien, buscan el pase bueno y te castigan las contras.
   - Premios (una vez cada uno): partido 3 → 10 🎟️ · 6 → 1500 🪙 · 9 → «elige 1 de 3» épico+ ·
     12 → «elige 1 de 3» legendario · 15 → Willy Glass LEYENDA (marco dorado y blanco, corona
     en el muñeco y en la foto, técnica propia «Gafas Royale»). Es tuyo para siempre.
   ===================================================================== */
const LY_START = '2026-10-25', LY_END = '2026-10-27';   // ambos incluidos (hora del dispositivo)
const LY_ID = 995010, LY_TECH = 30910;
// Los 15 mejores equipos (media de sus jugadores), del más flojo al más fuerte
const LY_BOSS = 'Leyendas';   // jefe final: los mejores del juego juntos
const LY_TEAMS = ['Triple C', 'Servicio Secreto', 'Mar de Árboles', 'Kirkwood', 'Dark Angel', 'The Kingdom', 'Tanques Centella',
  'Little Gigant', 'Veteranos', 'Génesis', 'Zeus', 'Ultra Zeus', 'Royal Academy', 'Emperadores Oscuros', LY_BOSS];
// Más difícil (0.35.3): los rivales suben del 100 % al 125 % de sus stats del partido 1 al 14; el jefe final, al 115 % (ya son los mejores)
const LY_RAMP = 0.25, LY_BOSS_F = 1.15;
// Reglas para tu equipo: sin las mejoras de supertécnicas de la tienda; y al repetirla (ya la completaste), sin legendarios (tampoco los de evento ni los fichajes temporales)
const lyBanned = id => { const p = PLAYER(id); return !p || p.rarity === 'legendaria'; };
const lyRepeat = () => { try { return (Profile.data.ly || {}).done > 0; } catch (_) { return false; } };
const LY_PRIZES = {
  3: { tickets: 10, txt: TX('10 tickets') },
  6: { coins: 1500, txt: TX('1500 monedas') },
  9: { pick: { rarity: 'epica' }, txt: TX('Elige 1 de 3 jugadores épicos o legendarios') },
  12: { pick: { rarity: 'legendaria' }, txt: TX('Elige 1 de 3 jugadores legendarios') },
};
(function registerLeyenda() {
  if (typeof GAME === 'undefined') return;
  if (!GAME.techniques[LY_TECH]) GAME.techniques[LY_TECH] = { id: LY_TECH, name: 'Gafas Royale', name_en: 'Royale Glasses', type: 'tiro', power: 125, elem: 'bosque' };
  const b = PLAYER(12); if (!b || PBY[LY_ID]) return;   // William Glass
  const p = Object.assign({}, b, { id: LY_ID, name: 'Willy Glass', full: 'Willy Glass (Leyenda)', nick: 'Willy', role: 'DEL', elem: 'bosque', rarity: 'legendaria',
    ie: { tiro: 99, control: 98, defensa: 95, rapidez: 97, fisico: 96, aguante: 96 }, ie0: undefined, ie_orig: undefined, also: undefined,
    // Gafas Royale + Supernova (tiro), Cruz del Sur (regate) y Zona sigma (bloqueo): de lo mejor del juego
    moves: [[LY_TECH, 1], [294, 10], [339, 20], [375, 30]],
    cs: [161, 0], gacha: false, banner: null, inf: false, leyenda: true, hwBase: 12 });
  GAME.players.push(p); PBY[p.id] = p;
})();
(function registerBoss() {   // Leyendas: el mejor portero, el mejor defensa, el mejor medio y los dos mejores delanteros del juego (con sus muñecos de la colección)
  if (typeof GAME === 'undefined' || TEAM(LY_BOSS)) return;
  const K = ['tiro', 'control', 'defensa', 'rapidez', 'fisico'], av = p => K.reduce((t, k) => t + p.ie[k], 0) / 5;
  const pool = GAME.players.filter(p => p.cs && p.gacha !== false && !p.halloween && !p.selva && !p.original && !p.special && !p.inf && !p.leyenda).sort((a, b) => av(b) - av(a));
  const players = [];
  for (const [role, n] of [['POR', 1], ['DEF', 1], ['MED', 1], ['DEL', 2]]) pool.filter(p => p.role === role && !players.some(q => q.name === p.name)).slice(0, n).forEach(p => players.push({ id: p.id, role }));
  if (players.length === 5) GAME.teams.push({ key: LY_BOSS, name: TX('Leyendas'), kind: 'leyenda', crest: 599, players });
})();

const Leyenda = {
  get forced() { return typeof Halloween !== 'undefined' && Halloween.forced; },   // la beta lo enseña siempre
  today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  active() { if (this.forced) return true; const t = this.today(); return t >= LY_START && t <= LY_END; },
  // Lo que queda: «2 días» o «5 horas»
  left() {
    const ms = new Date(LY_END + 'T23:59:59') - new Date();
    if (ms <= 0) return '';
    const h = Math.ceil(ms / 3600000);
    return h > 24 ? TXn(Math.ceil(h / 24), 'Queda {0} día', 'Quedan {0} días') : TXn(h, 'Queda {0} hora', 'Quedan {0} horas');
  },
  data() { const P = Profile.data, L = P.ly = P.ly || {}; if (!L.got) L.got = {}; if (L.best == null) L.best = 0; if (L.done == null) L.done = 0; if (L.tries == null) L.tries = 0; return L; },
  legend() { return PLAYER(LY_ID); },
  factor(i) { return LY_TEAMS[i] === LY_BOSS ? LY_BOSS_F : 1 + LY_RAMP * Math.min(1, i / (LY_TEAMS.length - 2)); },
  // Al ganar el partido n (1–15): premio de tramo (la primera vez) o el premio final
  prize(n, out) {
    const P = Profile.data, L = this.data();
    L.best = Math.max(L.best, n);
    const T = LY_PRIZES[n];
    if (T && !L.got[n]) {
      L.got[n] = 1; out.lyPrize = T.txt;
      out.tickets += T.tickets || 0; out.coins += T.coins || 0;
      if (T.pick) {
        const opts = giftPickOptions(T.pick, 3);
        if (opts.length) { const uid = Date.now(); (P.giftPicks = P.giftPicks || []).push({ code: '👑', uid, opts, desc: TX('Cadena Leyenda · partido {0}: {1}', n, T.txt) }); out.lyPick = uid; }
      }
    }
    if (n === LY_TEAMS.length) {   // ¡cadena completada!
      L.done++; out.tickets += 10;
      const o = P.coll[LY_ID];
      if (!o) { P.coll[LY_ID] = { stars: 1, up: {}, equip: [LY_TECH, 294] }; out.legend = { id: LY_ID, tier: 'legendaria', isNew: true }; }
      else if (o.stars < MAX_STARS) { o.stars++; out.legend = { id: LY_ID, tier: 'legendaria', star: o.stars }; }
      else { P.coins += 500; out.legend = { id: LY_ID, tier: 'legendaria', coins: 500 }; }
    }
  },
};
