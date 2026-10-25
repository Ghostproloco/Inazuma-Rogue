/* =====================================================================
   LOGROS: retos de todo el juego con premio para recoger.
   - Se comprueban con lo que ya tienes guardado (colección, Historia,
     Carrera, Carrera Jugador…): si ya lo habías conseguido, aparece listo
     para recoger.
   - Una vez conseguido se queda apuntado (Profile.data.achDone) aunque
     borres esa carrera; al recogerlo, Profile.data.achGot.
   - Premios escalados: bronce, plata, oro y diamante.
   ===================================================================== */
const ACH_TIERS = {
  bronce:   { name: TX('Bronce'), icon: '🥉', reward: { tickets: 3, coins: 200 } },
  plata:    { name: TX('Plata'), icon: '🥈', reward: { tickets: 8, coins: 500 } },
  oro:      { name: TX('Oro'), icon: '🥇', reward: { tickets: 15, coins: 1000, rayos: 1 } },
  diamante: { name: TX('Diamante'), icon: '💎', reward: { tickets: 30, coins: 2000, rayos: 2, epica: 1 } },
};
const ACH_CATS = { col: TX('Colección'), his: TX('Historia y modos'), car: TX('Carrera mánager'), pc: TX('Carrera Jugador (solo con tu jugador creado)') };

const Ach = (() => {
  const P = () => Profile.data;
  const C = () => (typeof Career !== 'undefined' && Career.data) || null;
  const hall = () => (typeof Career !== 'undefined' ? Career.hall() : []);
  // Los logros de la Carrera Jugador solo cuentan con un jugador CREADO por ti (con uno de la colección, como un legendario, no)
  const D = () => { const d = typeof PlayerCareer !== 'undefined' && PlayerCareer.data; return d && d.me && d.me.pd ? d : null; };
  const collN = () => Object.keys(P().coll).length;
  const rarityN = r => Object.keys(P().coll).filter(id => PLAYER(+id) && PLAYER(+id).rarity === r).length;
  const stars5 = () => Object.values(P().coll).filter(o => o.stars >= MAX_STARS).length;
  const legT = () => LEG_TECHS.filter(t => P().techs[t]).length;
  const specN = () => SPECIALS.filter(x => P().specials[x.key]).length;
  const chainN = (min = 1) => CHAINS.filter(ch => (P().chains[ch.key] || 0) >= min).length;
  const story = k => !!(P().story[k] && P().story[k].done);
  // Carrera de mánager: la actual y las del salón de la fama
  const carSeasons = () => Math.max(C() ? C().history.length : 0, ...hall().map(r => r.seasons || 0), 0);
  // llegar a Primera ascendiendo (si empiezas con un club de Primera no cuenta)
  const carPrimera = () => !!(C() && (C().startDiv || 3) > 1 && (C().history.some(h => h.div === 1) || (C().divs && C().divs[1].includes(YOU)))) || hall().some(r => r.best === 1 && (r.startDiv || 3) > 1);
  const carChamp = () => !!(C() && C().goal) || hall().some(r => r.goal);
  const carCup = () => !!(C() && C().history.some(h => h.cup)) || hall().some(r => (r.titles || []).some(t => /Copa|Cup/i.test(t)));
  const carWC = () => !!(C() && (C().wcHistory || []).some(w => w.place === 'campeón'));
  // Carrera Jugador
  const pcOvr = () => { const d = D(); try { return d ? PlayerCareer.ovrMe() : 0; } catch (_) { return 0; } };
  const pcT = k => { const d = D(); return d ? d.me.total[k] || 0 : 0; };
  const pcWC = () => { const d = D(); return !!(d && (d.me.wcChamp || d.me.awards.some(a => /mundo|world/i.test(a.name)))); };

  // id, categoría, nivel, nombre, descripción y comprobación: true/false o [actual, objetivo]
  const L = [
    ['col10', 'col', 'bronce', TX('Primeros fichajes'), TX('Ten 10 jugadores en tu colección'), () => [collN(), 10]],
    ['col50', 'col', 'plata', TX('Ojeador'), TX('Ten 50 jugadores en tu colección'), () => [collN(), 50]],
    ['col150', 'col', 'oro', TX('Coleccionista'), TX('Ten 150 jugadores en tu colección'), () => [collN(), 150]],
    ['col300', 'col', 'diamante', TX('Enciclopedia Inazuma'), TX('Ten 300 jugadores en tu colección'), () => [collN(), 300]],
    ['epic5', 'col', 'plata', TX('Talento épico'), TX('Consigue 5 jugadores épicos'), () => [rarityN('epica'), 5]],
    ['leg1', 'col', 'plata', TX('¡Legendario!'), TX('Consigue un jugador legendario'), () => [rarityN('legendaria'), 1]],
    ['leg10', 'col', 'oro', TX('Once de leyenda'), TX('Consigue 10 jugadores legendarios'), () => [rarityN('legendaria'), 10]],
    ['star5', 'col', 'oro', TX('Cinco estrellas'), TX('Sube un jugador a 5 ★'), () => [stars5(), 1]],
    ['legt3', 'col', 'oro', TX('Técnicas prohibidas'), TX('Consigue 3 técnicas legendarias'), () => [legT(), 3]],
    ['pull100', 'col', 'plata', TX('Manivela caliente'), TX('Haz 100 tiradas en el gacha'), () => [P().pulls || 0, 100]],
    ['pull500', 'col', 'oro', TX('Adicto a las cápsulas'), TX('Haz 500 tiradas en el gacha'), () => [P().pulls || 0, 500]],

    ['win10', 'his', 'bronce', TX('Primeras victorias'), TX('Gana 10 partidos'), () => [P().wins || 0, 10]],
    ['win100', 'his', 'plata', TX('Ganador nato'), TX('Gana 100 partidos'), () => [P().wins || 0, 100]],
    ['win500', 'his', 'oro', TX('Imparable'), TX('Gana 500 partidos'), () => [P().wins || 0, 500]],
    ['s1', 'his', 'plata', TX('Fútbol Frontier'), TX('Completa la Etapa 1 de la Historia'), () => story('s1')],
    ['s2', 'his', 'oro', TX('Contra la Academia Alius'), TX('Completa la Etapa 2 de la Historia'), () => story('s2')],
    ['s3', 'his', 'oro', TX('Rumbo al mundo'), TX('Completa la fase 1 de la Etapa 3'), () => story('s3')],
    ['s4', 'his', 'diamante', TX('Campeones del FFI'), TX('Completa la Etapa 3 entera'), () => story('s4')],
    ['spec3', 'his', 'bronce', TX('Cazaestrellas'), TX('Vence a 3 equipos especiales'), () => [specN(), 3]],
    ['specAll', 'his', 'oro', TX('Sin rival especial'), TX('Vence a todos los equipos especiales'), () => [specN(), SPECIALS.length]],
    ['chain1', 'his', 'bronce', TX('Primera cadena'), TX('Completa una cadena'), () => [chainN(1), 1]],
    ['chainAll', 'his', 'oro', TX('Rompecadenas'), TX('Completa todas las cadenas'), () => [chainN(1), CHAINS.length]],
    ['chainGold', 'his', 'diamante', TX('Medallero de oro'), TX('Consigue el oro (×5) en todas las cadenas'), () => [chainN(5), CHAINS.length]],
    ['inf10', 'his', 'plata', TX('Aguante'), TX('Llega a la oleada 10 del Infinito'), () => [P().infBest || 0, 10]],
    ['inf25', 'his', 'oro', TX('Infinito y más allá'), TX('Llega a la oleada 25 del Infinito'), () => [P().infBest || 0, 25]],

    ['car1', 'car', 'bronce', TX('Primer año en el banquillo'), TX('Termina una temporada como mánager'), () => [carSeasons(), 1]],
    ['carPrim', 'car', 'plata', TX('A Primera'), TX('Lleva a tu club a Primera División'), carPrimera],
    ['carCup', 'car', 'oro', TX('Rey de Copas'), TX('Gana la Copa Inazuma como mánager'), carCup],
    ['carChamp', 'car', 'oro', TX('Campeón de Primera'), TX('Gana la liga de Primera como mánager'), carChamp],
    ['car10', 'car', 'oro', TX('Leyenda del banquillo'), TX('Llega a 10 temporadas en una carrera'), () => [carSeasons(), 10]],
    ['carWC', 'car', 'diamante', TX('Seleccionador campeón'), TX('Gana el Mundial como seleccionador'), carWC],

    ['pcStart', 'pc', 'bronce', TX('Un sueño'), TX('Empieza una Carrera Jugador'), () => !!D()],
    ['pcLv10', 'pc', 'plata', TX('Promesa'), TX('Llega al nivel 10 con tu jugador'), () => [D() ? D().me.lv : 0, 10]],
    ['pcOvr70', 'pc', 'plata', TX('Crack'), TX('Llega a media 70 con tu jugador'), () => [pcOvr(), 70]],
    ['pcOvr85', 'pc', 'oro', TX('Estrella mundial'), TX('Llega a media 85 con tu jugador'), () => [pcOvr(), 85]],
    ['pcGoals50', 'pc', 'oro', TX('Goleador'), TX('Marca 50 goles en una Carrera Jugador'), () => [pcT('goals'), 50]],
    ['pcMvp10', 'pc', 'plata', TX('Jugador del partido'), TX('Sé el mejor del partido 10 veces'), () => [pcT('mvp'), 10]],
    ['pcCall', 'pc', 'oro', TX('Convocado'), TX('Te convoca tu selección para el Mundial'), () => !!(D() && D().me.callups)],
    ['pcGrad', 'pc', 'oro', TX('Graduado'), TX('Gradúate y salta a la Liga Pro'), () => !!(D() && D().me.graduated) || (P().custom || []).length > 0],
    ['pcRookie', 'pc', 'plata', TX('Rookie del año'), TX('Gana el premio al Rookie del año'), () => !!(D() && D().me.awards.some(a => /Rookie/i.test(a.name)))],
    ['pcDuel3', 'pc', 'bronce', TX('Duelista'), TX('Gana 3 retos 1 contra 1'), () => [D() && D().me.duels ? D().me.duels.w : 0, 3]],
    ['pcBalon', 'pc', 'diamante', TX('Balón de Oro'), TX('Gana el Balón de Oro con tu jugador'), () => !!(D() && D().me.balon)],
    ['pcWC', 'pc', 'diamante', TX('Campeón del mundo'), TX('Gana el Mundial con tu selección en tu Carrera Jugador'), pcWC],
  ];
  const LIST = L.map(([id, cat, tier, name, desc, check]) => ({ id, cat, tier, name, desc, check }));

  const data = () => { const p = P(); p.achDone = p.achDone || {}; p.achGot = p.achGot || {}; return p; };
  const progress = a => { try { const r = a.check(); return Array.isArray(r) ? { cur: Math.min(r[0], r[1]), goal: r[1], ok: r[0] >= r[1] } : { ok: !!r }; } catch (_) { return { ok: false }; } };
  // Apunta los logros nuevos; devuelve la lista de los recién conseguidos
  function scan() {
    if (!P()) return [];
    const p = data(), fresh = [];
    for (const a of LIST) if (!p.achDone[a.id] && progress(a).ok) { p.achDone[a.id] = Date.now(); fresh.push(a); }
    if (fresh.length) Profile.save();
    return fresh;
  }
  const state = a => { const p = data(); return p.achGot[a.id] ? 'got' : p.achDone[a.id] ? 'ready' : 'locked'; };
  const pending = () => { scan(); return LIST.filter(a => state(a) === 'ready').length; };
  function claim(id) {
    const a = LIST.find(x => x.id === id), p = data(); if (!a || state(a) !== 'ready') return null;
    const R = ACH_TIERS[a.tier].reward;
    p.tickets += R.tickets || 0; p.coins += R.coins || 0; p.rayos += R.rayos || 0;
    if (R.epica) p.giftEpic = (p.giftEpic || 0) + R.epica;
    p.achGot[a.id] = Date.now(); Profile.save();
    return R;
  }
  function claimAll() {
    const tot = { tickets: 0, coins: 0, rayos: 0, epica: 0, n: 0 };
    LIST.filter(a => state(a) === 'ready').forEach(a => { const R = claim(a.id); for (const k in R) tot[k] += R[k]; tot.n++; });
    return tot;
  }
  const rewardTx = R => [R.tickets && '+' + R.tickets + ' 🎟️', R.coins && '+' + R.coins + ' 🪙', R.rayos && '+' + R.rayos + ' ⚡', R.epica && TXn(R.epica, '{0} tirada épica', '{0} tiradas épicas')].filter(Boolean).join(' · ');
  // (desarrollador) marcar todos como conseguidos o empezar de cero
  function devAll() { const p = data(); LIST.forEach(a => { p.achDone[a.id] = p.achDone[a.id] || Date.now(); }); Profile.save(); }
  function devReset() { const p = data(); p.achDone = {}; p.achGot = {}; Profile.save(); }
  return { LIST, scan, state, pending, claim, claimAll, progress, rewardTx, devAll, devReset };
})();
