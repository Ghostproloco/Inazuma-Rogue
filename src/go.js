/* =====================================================================
   JUGADORES DE INAZUMA ELEVEN GO: Arion Sherwind, Victor Blade, Riccardo Di Rigo y Bai Long.
   - Legendarios que NO salen en el gacha: se consiguen con códigos de regalo (GIFT_CODES en run.js).
   - Retrato propio en sprites/fgo.png (una fila de 64 px por jugador; fila = goFace).
   - Muñeco del partido provisional: el de otro jugador parecido (goBase); se cambia poniendo otro `cs`.
   - Estadísticas y técnicas: editar aquí (técnicas copiadas de un jugador de referencia, ref).
   ===================================================================== */
const GO_PLAYERS = [
  { id: 998001, name: 'Arion Sherwind', nick: 'Arion', role: 'MED', elem: 'viento',  face: 1, sprite: 31763, ref: 29,
    ie: { tiro: 88, control: 96, defensa: 84, rapidez: 94, fisico: 86, aguante: 96 } },
  { id: 998002, name: 'Victor Blade', nick: 'Victor', role: 'MED', elem: 'bosque', face: 2, sprite: 21905, ref: 157,
    ie: { tiro: 86, control: 97, defensa: 85, rapidez: 90, fisico: 84, aguante: 94 } },
  { id: 998003, name: 'Riccardo Di Rigo', nick: 'Riccardo', role: 'DEF', elem: 'montaña', face: 3, sprite: 21770, ref: 21399,
    ie: { tiro: 76, control: 88, defensa: 98, rapidez: 90, fisico: 97, aguante: 94 } },
  { id: 998004, name: 'Bai Long', nick: 'Bai Long', role: 'DEL', elem: 'fuego', face: 0, sprite: 21607, ref: 10,
    ie: { tiro: 98, control: 90, defensa: 72, rapidez: 96, fisico: 90, aguante: 92 } },
];
(function registerGO() {
  if (typeof GAME === 'undefined') return;
  const reg = (p, list) => { if (PBY[p.id]) return; if (list) GAME.players.push(p); PBY[p.id] = p; };
  GO_PLAYERS.forEach(G => {
    const body = PLAYER(G.sprite), ref = PLAYER(G.ref);
    if (!body || !ref) return;
    reg(Object.assign({}, body, { id: G.id, name: G.name, full: G.name, nick: G.nick, role: G.role, elem: G.elem, rarity: 'legendaria',
      ie: Object.assign({}, G.ie), ie0: undefined, also: undefined, moves: (ref.moves || []).map(m => m.slice()),
      gacha: false, banner: null, inf: false, go: true, goBase: G.sprite, goFace: G.face }), true);
  });
})();
