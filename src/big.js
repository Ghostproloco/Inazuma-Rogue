/* =====================================================================
   11 CONTRA 11: formaciones de 11, posiciones para el campo grande y equipo rival
   completado con refuerzos (cada equipo del juego trae 5 jugadores propios).
   ===================================================================== */
const BIG_FORMATIONS = {
  '4-4-2': { name: TX('Clásica'),     roles: ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'DEL', 'DEL'] },
  '4-3-3': { name: TX('Ofensiva'),    roles: ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'DEL', 'DEL', 'DEL'] },
  '3-5-2': { name: TX('Control'),     roles: ['POR', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'MED', 'DEL', 'DEL'] },
  '5-3-2': { name: TX('Muralla'),     roles: ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'DEL', 'DEL'] },
  '4-5-1': { name: TX('Defensiva'),   roles: ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'MED', 'DEL'] },
  '3-4-3': { name: TX('Ataque total'), roles: ['POR', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'DEL', 'DEL', 'DEL'] },
};
const BIG_DEPTH = { POR: 1.5, DEF: 17, MED: 34, DEL: 52 }, BIG_KO = { POR: 1.5, DEF: 14, MED: 26, DEL: 34 };
// Posición base (x, distancia a tu portería) de cada puesto: cada línea se reparte a lo ancho del campo
function layoutBig(roles) {
  const cnt = {}, idx = {};
  roles.forEach(r => { cnt[r] = (cnt[r] || 0) + 1; });
  return roles.map(r => {
    const n = cnt[r], i = idx[r] = (idx[r] || 0); idx[r]++;
    const sp = n === 1 ? 0 : Math.min(13, 36 / (n - 1)), x = r === 'POR' ? 0 : (i - (n - 1) / 2) * sp;
    return { role: r, home: [x, BIG_DEPTH[r]], ko: [x * 0.85, BIG_KO[r]] };
  });
}
// Rival de 11: sus 5 jugadores propios + refuerzos de equipos de su misma etapa. Elige la formación que más titulares suyos aprovecha
function rivalTeamBig(teamKey, factor, progress) {
  const t = TEAM(teamKey), nTech = progress < 0.5 ? 1 : TECH_SLOTS;
  const want = {}; t.players.forEach(m => { want[m.role] = (want[m.role] || 0) + 1; });
  let fKey = '4-4-2', bestUse = -1;
  for (const k in BIG_FORMATIONS) {
    const need = {}; BIG_FORMATIONS[k].roles.forEach(r => { need[r] = (need[r] || 0) + 1; });
    const use = Object.keys(want).reduce((a, r) => a + Math.min(want[r], need[r] || 0), 0);
    if (use > bestUse) { bestUse = use; fKey = k; }
  }
  const roles = BIG_FORMATIONS[fKey].roles, pos = layoutBig(roles);
  const kindGroup = k => k === 'story' ? 'story' : k === 'story2' ? 'story2' : (k === 'story3' || k === 'story4') ? 'story3' : 'other';
  const g = kindGroup(t.kind);
  const pool = GAME.teams.filter(o => o.key !== t.key && kindGroup(o.kind) === g && o.kind !== 'chain').flatMap(o => o.players.map(m => Object.assign({ from: o }, m)));
  const free = t.players.slice(), used = new Set();
  const members = roles.map(role => {
    let i = free.findIndex(m => m.role === role);
    if (i >= 0) return { m: free.splice(i, 1)[0], star: true };
    const cands = pool.filter(m => m.role === role && !used.has(m.id));
    const m = cands[Math.floor(Math.random() * cands.length)] || pool.filter(x => !used.has(x.id))[0];
    if (m) used.add(m.id);
    return { m, star: false };
  });
  const n = roles.length;
  return { name: t.name, key: t.key, formation: fKey, players: members.map(({ m, star }, i) => {
    const pd = PLAYER(m.id), f = (typeof factor === 'function' ? factor(pd) : factor) * (star ? 1 : 0.88);
    let techs = pd.moves.slice().sort((a, b) => a[1] - b[1]).map(x => x[0]).filter(id => TECH(id)).slice(0, nTech);
    const sig = signatureTech(pd); if (sig != null && !techs.includes(sig)) techs[0] = sig;
    const gkt = keeperTech(pd, techs); if (gkt != null) techs.unshift(gkt);
    techs = techs.slice(0, TECH_SLOTS);
    const kit = star ? t.kit : null;
    return Object.assign(buildMatchPlayer(m.id, roles[i], k => Math.round(pd.ie[k] * f), techs, [], n + i, pos[i]),
      { sprite: Object.assign(m.file ? { file: m.file, row: m.row } : pd.cs ? { file: 'c' + String(pd.cs[0]).padStart(2, '0') + '.png', row: pd.cs[1] } : { file: 'c00.png', row: 0 }, kit && roles[i] !== 'POR' ? { kit } : {}) });
  }) };
}
