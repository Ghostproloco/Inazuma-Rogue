/* =====================================================================
   IDIOMAS: español (el original) e inglés.
   Los textos se escriben en español dentro de TX('…') y, si el juego está
   en inglés, se buscan en EN_TEXT (src/en.js). Lo que falte se queda en
   español. Los huecos {0}, {1}… se rellenan con los argumentos:
     TX('Partido {0} de {1}', 3, 10)  →  «Partido 3 de 10» / «Match 3 of 10»
   El idioma se guarda en este dispositivo; la primera vez se elige el del
   navegador (español si está en español; si no, inglés).
   ===================================================================== */
const I18N = (() => {
  const KEY = 'inazuma-idioma', LANGS = { es: 'Español', en: 'English' };
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (_) {}
  if (!LANGS[lang]) {
    let nav = 'es';
    try { nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'es'; } catch (_) {}
    lang = /^es\b/i.test(nav) ? 'es' : 'en';
  }
  const missing = new Set();
  function set(l) { if (!LANGS[l]) return; try { localStorage.setItem(KEY, l); } catch (_) {} }
  // Nombres de los datos del juego (técnicas y equipos) en el idioma elegido
  function applyData() {
    if (lang !== 'en' || typeof GAME === 'undefined') return;
    for (const id in GAME.techniques) { const t = GAME.techniques[id]; if (t.name_en) t.name = t.name_en; }
    for (const t of GAME.teams || []) if (t.name_en) t.name = t.name_en;
  }
  return { lang, LANGS, set, missing, applyData, en: () => lang === 'en' };
})();

function TX(s, ...a) {
  let r = s;
  if (I18N.lang === 'en') {
    const e = typeof EN_TEXT !== 'undefined' ? EN_TEXT[s] : undefined;
    if (e != null) r = e; else I18N.missing.add(s);
  }
  return a.length ? r.replace(/\{(\d+)\}/g, (m, i) => (a[i] != null ? a[i] : '')) : r;
}
// Plural sencillo: TXn(n, '{0} jugador', '{0} jugadores') → «1 jugador» / «3 players»
function TXn(n, one, many) { return TX(n === 1 ? one : many, n); }

/* =====================================================================
   TEXTOS EN INGLÉS. La clave es el texto original en español (tal cual
   aparece dentro de TX('…') en el código); el valor, su traducción.
   test/i18n.js avisa si falta alguna.
   ===================================================================== */
const EN_TEXT = {
  ' (Google)': ' (Google)',
  ' (por el playoff)': ' (through the playoff)',
  ' (se gradúa al acabar)': ' (graduates at the end)',
  ' Después crea tu cuenta para no tener que hacer esto nunca más.': ' Then create your account so you never have to do this again.',
  ' Se reintentará más tarde.': ' It will try again later.',
  ' Si sales igualmente, perderás lo que no se haya subido.': ' If you leave anyway, you\'ll lose anything that hasn\'t been uploaded.',
  ' de ': ' of ',
  ' de 10 convocados': ' of 10 called up',
  ' de tus jugadores pueden equiparla': ' of your players can equip it',
  ' entra en la plantilla.': ' joins the squad.',
  ' estrellas': ' stars',
  ' jugadores · toca uno para entrenarlo': ' players · tap one to train them',
  ' lee el regate!': ' reads the dribble!',
  ' no tiene técnica de bloqueo': ' has no block technique',
  ' no tiene técnica de tiro ni de regate': ' has no shot or dribble technique',
  ' ojeados)': ' scouted)',
  ' pendientes · ': ' pending · ',
  ' resiste el bloqueo!': ' resists the block!',
  ' se une a ': ' joins ',
  ' se va a otro instituto.': ' goes to another school.',
  ' sube a ': ' goes up to ',
  ' tiradas épicas o mejores': ' epic-or-better pulls',
  ' toques…': ' taps…',
  ' victorias': ' wins',
  ' y ': ' and ',
  ' · Carrera: ': ' · Career: ',
  ' · club cerrado': ' · club closed',
  ' · dev': ' · dev',
  ' · evoluciona a ': ' · evolves into ',
  ' · ganado ×': ' · won ×',
  ' · máximo goleador: ': ' · top scorer: ',
  ' · repites contra el mismo rival': ' · you face the same rival again',
  ' · semana ': ' · week ',
  ' · si hay empate, penaltis': ' · penalties if it\'s a draw',
  ' · temporada ': ' · season ',
  ' · tiro ': ' · shot ',
  ' · titular (': ' · starter (',
  ' · ¡ojo!': ' · careful!',
  ' · ★ Campeón de Primera': ' · ★ First Division champion',
  ' · ★ campeón de Primera': ' · ★ First Division champion',
  ' · ⭐ su estrella: pedirán más': ' · ⭐ their star: they\'ll ask for more',
  ' · 📜 técnica legendaria la 1.ª vez': ' · 📜 legendary technique the 1st time',
  ' ⚡ Rayos': ' ⚡ Bolts',
  ' 🎟️ tickets': ' 🎟️ tickets',
  ' 🪙 monedas': ' 🪙 coins',
  '(3º a 6º de Segunda y Tercera)': '(3rd to 6th in Second and Third)',
  '(de las más fuertes del juego).': '(among the strongest in the game).',
  '(dos equipos de 5) y elige qué 5 juegan cada partido. Grupo de 4 (pasan 2), semifinal y final, con penaltis si hay empate.': '(two teams of 5) and choose which 5 play each match. Group of 4 (top 2 go through), semi-final and final, with penalties if it\'s a draw.',
  '(dos equipos de 5): los de tu club y los mejores de las ligas (los que juegan en Primera y en los equipos de arriba destacan más). Antes de cada partido eliges qué 5 juegan.': '(two teams of 5): your club\'s players and the best from the leagues (those in the First Division and in top teams stand out more). Before each match you choose which 5 play.',
  '(máx.': '(max.',
  '(no gasta nada)': '(costs nothing)',
  '(o mantén el dedo en el recuadro y elige «Pegar»).': '(or press and hold the box and choose «Paste»).',
  '(o sube una ★ si ya la tenías).': '(or gets one more ★ if you already had them).',
  '(pen.': '(pen.',
  '(récord:': '(record:',
  '(sin ti)': '(without you)',
  ').': ').',
  '). Se reintentará.': '). It will try again.',
  '). Vende o libera a alguien.': '). Sell or release someone.',
  '). ¿Le haces hueco?': '). Will you make room?',
  '); con 5 estrellas dan monedas.': '); at 5 stars they give coins.',
  '); con 5 estrellas, o una técnica repetida, dan monedas.': '); at 5 stars, or with a duplicate technique, they give coins.',
  '+1 estrella sin necesitar repetidos (tienes ': '+1 star without needing duplicates (you have ',
  '+1 extra en cada entrenamiento por nivel': '+1 extra on each training session per level',
  '+10 % de ingresos': '+10% income',
  '+10 Rayos': '+10 Bolts',
  '+10 Rayos Raimon': '+10 Raimon Bolts',
  '+10 a las técnicas de bloqueo': '+10 to block techniques',
  '+10 a las técnicas de regate': '+10 to dribble techniques',
  '+10 a las técnicas de tiro': '+10 to shot techniques',
  '+10 🎟️ para el gacha': '+10 🎟️ for the gacha',
  '+100.000 monedas': '+100,000 coins',
  '+1000 tickets': '+1000 tickets',
  '+25 % de taquilla por nivel': '+25% gate money per level',
  '+3 por mejora; el límite sube con las estrellas': '+3 per upgrade; the limit goes up with stars',
  '+300 caramelos': '+300 candies',
  '+300 copos': '+300 snowflakes',
  '+4 de tiro y control': '+4 shot and control',
  '+6 % de velocidad': '+6% speed',
  '+6 de defensa': '+6 defence',
  '+6 de portero': '+6 goalkeeping',
  '+6 de tiro': '+6 shot',
  ', 1º curso) quiere entrar en el club, pero tu plantilla está llena (': ', Year 1) wants to join the club, but your squad is full (',
  ', para volver a un punto anterior.': ', to go back to an earlier point.',
  ', que se quedan en tu perfil.': ', which stay in your profile.',
  '. Al completarla: Rayo Raimon, tickets, monedas y la estrella del último rival. La primera vez, una técnica legendaria. Sin perder vidas, 💎 extra. Medallas 🥉🥈🥇 al repetirlas.': '. When you finish it: a Raimon Bolt, tickets, coins and the last rival\'s star. The first time, a legendary technique. Without losing a life, an extra 💎. Medals 🥉🥈🥇 for replaying them.',
  '. Vuelve a la versión antigua, toca «Copiar» y pégalo entero.': '. Go back to the old version, tap «Copy» and paste it in full.',
  '/semana': '/week',
  '1 ticket': '1 ticket',
  '1, 2 y 3 · abre todo': '1, 2 and 3 · unlocks everything',
  '10 jugadores': '10 players',
  '10 tickets': '10 tickets',
  '1000 monedas': '1000 coins',
  '150 caramelos': '150 candies',
  '150 copos': '150 snowflakes',
  '1º curso · de la cantera': 'Year 1 · from the academy',
  '2 min': '2 min',
  '3 divisiones de 10 equipos. Los 2 primeros suben y del 3º al 6º juegan un': '3 divisions of 10 teams. The top 2 go up and 3rd to 6th play a',
  '3 min': '3 min',
  '5 contra 5 · roguelite': '5 vs 5 · roguelite',
  '5 días del evento (no hace falta que sean seguidos)': '5 days of the event (they don\'t have to be in a row)',
  '5 goles de diferencia: se acabó el partido': '5-goal difference: the match is over',
  '5 min': '5 min',
  '75 % (normal)': '75% (normal)',
  ': +15 🎟️ y otro ⚡ Rayo': ': +15 🎟️ and another ⚡ Bolt',
  ': Japón': ': Japan',
  ': busca y entrena (monedas) o usa Rayos Raimon para subir estrellas.': ': search and train (coins) or use Raimon Bolts to add stars.',
  ': elige formación y quién juega (a portería solo porteros).': ': choose the formation and who plays (only goalkeepers in goal).',
  ': equipa las supertécnicas.': ': equip the special moves.',
  ': fichaje de': ': signing of',
  ': las selecciones del mundo del Inazuma 3. Se fichan al momento, pero el traspaso internacional cuesta un 30 % más.': ': the national teams of Inazuma 3. They join right away, but the international transfer costs 30% more.',
  ': nivel': ': level',
  ': tienes vidas ♥, tras cada victoria eliges una mejora (técnica, habilidad o fichaje temporal) y todo eso se pierde al acabar el intento. Completar una etapa la deja superada para siempre y abre más modos.': ': you have lives ♥, after every win you pick an upgrade (technique, skill or temporary signing) and you lose all of it when the run ends. Completing a stage clears it forever and unlocks more modes.',
  'A portería solo pueden ir porteros': 'Only goalkeepers can play in goal',
  'A tu gusto': 'Custom',
  'A ver si puedes ganarme.': 'Let\'s see if you can beat me.',
  'Abajo': 'Down',
  'Abandonar carrera': 'Abandon career',
  'Abandonar:': 'Abandon:',
  'Abre la versión antigua': 'Open the old version',
  'Abre un regalo': 'Open a present',
  'Abriendo Google…': 'Opening Google…',
  'Abrir todas': 'Open all',
  'Aceptar': 'Accept',
  'Aceptar ': 'Accept ',
  'Acepto el reto. ¡Que gane el mejor!': 'Challenge accepted. May the best team win!',
  'Actividad de la semana': 'Activity of the week',
  'Acércate al rival que lleva el balón': 'Get closer to the rival with the ball',
  'Acércate más a la portería': 'Get closer to the goal',
  'Agente M (versión del Infinito)': 'Agent M (Infinite version)',
  'Agentes libres de esta semana (la lista cambia cada semana). Se fichan al momento, sin negociar.': 'This week\'s free agents (the list changes every week). They sign right away, no negotiating.',
  'Ahora eres ': 'You are now ',
  'Ahora estás en Primera': 'You\'re now in the First Division',
  'Ahora estás en Tercera': 'You\'re now in the Third Division',
  'Ajustes': 'Settings',
  'Al perder el balón, un toque en Pase ya no te cambia de jugador sin querer.': 'When you lose the ball, tapping Pass no longer switches player by accident.',
  'Aleatorio (temas de partido)': 'Random (match themes)',
  'Alineación': 'Line-up',
  'Allí toca': 'There, tap',
  'Alma de luchador': 'Fighting Spirit',
  'Alpino': 'Alpine',
  'Antes de traer la partida': 'Before bringing the save over',
  'Aprendida · toca para equipar': 'Learned · tap to equip',
  'Arrastra cada botón a donde quieras. Toca uno para cambiar su tamaño.': 'Drag each button wherever you want. Tap one to change its size.',
  'Arrastra la manivela en círculo (o pulsa Espacio)': 'Drag the crank in a circle (or press Space)',
  'Arreglado: ya no se puede salir por la línea de fondo con el balón para rodear al portero. Si cruzas una línea con el balón, es fuera.': 'Fixed: you can no longer run past the goal line with the ball to get round the keeper. If you cross a line with the ball, it\'s out.',
  'Arriba': 'Up',
  'Ascensos y descensos': 'Promotions and relegations',
  'Así la portería se quedaría sin portero': 'The goal would be left without a goalkeeper',
  'Ataque relámpago': 'Lightning Attack',
  'Ataque total': 'All-Out Attack',
  'Ataque+': 'Attack+',
  'Atronadora Royal Academy': 'Thundering Royal Academy',
  'Auto': 'Auto',
  'Automáticas': 'Automatic',
  'Axel y Julia - Un final feliz': 'Axel and Julia - A Happy Ending',
  'Aún bloqueado': 'Still locked',
  'Aún no hay nadie ojeado.': 'Nobody has been scouted yet.',
  'Aún no hay ninguna carrera terminada.': 'No careers finished yet.',
  'Aún no tienes ninguna. Salen en el tramo legendario del gacha.': 'You don\'t have any yet. They come from the legendary tier of the gacha.',
  'Bai Long': 'Bai Long',
  'Bajar a Tercera': 'Drop to Third Division',
  'Banda': 'Band',
  'Banda sonora original': 'Original soundtrack',
  'Banquillo': 'Bench',
  'Bloq Mayús': 'Caps Lock',
  'Bloqueo': 'Block',
  'Borrar partida': 'Delete run',
  'Borrar perfil': 'Delete profile',
  'Bosque': 'Wood',
  'Botones en pantalla': 'On-screen buttons',
  'Botones guardados': 'Buttons saved',
  'Botón «Ganar ahora» en la pausa': '«Win now» button in the pause menu',
  'Busca cualquier jugador del gacha y tócalo para meterlo en tu plantilla de Carrera (sin límite).': 'Search any gacha player and tap them to add them to your Career squad (no limit).',
  'Busca joyas baratas por la ciudad': 'Look for cheap gems around town',
  'Buscar por nombre o mote…': 'Search by name or nickname…',
  'Cada 3 temporadas: convoca a 10 y lleva a Inazuma Japón a lo más alto': 'Every 3 seasons: call up 10 and take Inazuma Japan to the top',
  'Cada intento es roguelite: las técnicas, habilidades y fichajes se pierden al acabar. La etapa que completas queda superada para siempre y abre las Cadenas, el Infinito y más equipos especiales.': 'Each attempt is roguelite: techniques, skills and signings are lost when it ends. A stage you complete stays cleared forever and unlocks Chains, Infinite and more special teams.',
  'Cada partida es distinta: vidas, mejoras y jefes': 'Every run is different: lives, upgrades and bosses',
  'Cada sobre trae al menos una épica o mejor, y Bai Long está asegurado a las': 'Every pack has at least one epic or better, and Bai Long is guaranteed after',
  'Cadena': 'Chain',
  'Cadenas': 'Chains',
  'Cadenas completadas con oro': 'Chains completed with gold',
  'Cadenas, especiales e Infinito': 'Chains, specials and Infinite',
  'Calendario': 'Fixtures',
  'Cambiar': 'Switch',
  'Cambiar de jugador': 'Switch player',
  'Cambiar de jugador te lleva al compañero que antes llega al balón; si vuelves a pulsar, al siguiente.': 'Switch takes you to the teammate who reaches the ball first; press again for the next one.',
  'Cambiar técnica': 'Change move',
  'Cambio automático de jugador': 'Automatic player switching',
  'Camino a Zeus': 'Road to Zeus',
  'Camiseta': 'Shirt',
  'Campeones': 'Champions',
  'Campeón de Copa: ': 'Cup winner: ',
  'Campo al atardecer': 'Sunset pitch',
  'Campo celestial': 'Heavenly pitch',
  'Campo clásico': 'Classic pitch',
  'Campo de entrenamiento': 'Training ground',
  'Campo de la jungla': 'Jungle pitch',
  'Campo nevado': 'Snowy pitch',
  'Campo nocturno': 'Night pitch',
  'Campo nocturno con niebla': 'Foggy night pitch',
  'Campo volcánico': 'Volcano pitch',
  'Cancelar': 'Cancel',
  'Canjeados': 'Redeemed',
  'Canjear': 'Redeem',
  'Caramelo o susto': 'Trick or sweet',
  'Caramelos: +5 por partido en cualquier modo (+10 más si ganas), +20 de regalo cada día, +60 al ganar al Ocultismo jefe, los retos del día y los del evento. El evento dura hasta el 3 de noviembre; los jugadores que consigas son tuyos para siempre.': 'Candy: +5 per match in any mode (+10 more if you win), +20 daily gift, +60 for beating the Occult boss, plus the daily and event challenges. The event runs until 3 November; any players you get are yours forever.',
  'Cargando tu partida de la nube…': 'Loading your save from the cloud…',
  'Cargando tu partida…': 'Loading your save…',
  'Cargando…': 'Loading…',
  'Cargar': 'Load',
  'Cargar sustituye tu partida actual. Toca otra vez para confirmar.': 'Loading replaces your current save. Tap again to confirm.',
  'Carrera': 'Career',
  'Carrera creada': 'Career created',
  'Carrera:': 'Career:',
  'Cartas a Papá Noel': 'Letters to Santa',
  'Centro de entrenamiento': 'Training centre',
  'Cerrar': 'Close',
  'Cerrar sesión': 'Log out',
  'Cerrojo': 'Lockdown',
  'Clasificación': 'Standings',
  'Club': 'Club',
  'Clásicas (L tiro)': 'Classic (L shoots)',
  'Coleccionista de sustos': 'Fright Collector',
  'Colección': 'Collection',
  'Colección completa': 'Full collection',
  'Color de fondo': 'Background colour',
  'Color del borde y símbolo': 'Border and symbol colour',
  'Como venía': 'Default',
  'Completa la Etapa 1': 'Complete Stage 1',
  'Completa la Etapa 1 de la Historia': 'Complete Stage 1 of the Story',
  'Completa la Etapa 2': 'Complete Stage 2',
  'Completa la Etapa 3': 'Complete Stage 3',
  'Completa la Fase 1 de la Etapa 3': 'Complete Phase 1 of Stage 3',
  'Completa los 3 retos y': 'Complete the 3 challenges and',
  'Completa los 3 retos y recibirás de regalo a': 'Complete the 3 challenges and you\'ll receive a free',
  'Completa tu equipo en Plantilla': 'Complete your team in Squad',
  'Completada ✓ · puedes repetirla': 'Completed ✓ · you can replay it',
  'Completar las cadenas': 'Complete the chains',
  'Completar los retos': 'Complete the challenges',
  'Completar todas las etapas': 'Complete every stage',
  'Comprobando tu partida…': 'Checking your save…',
  'Comprobar': 'Check',
  'Común': 'Common',
  'Común 60 % · Rara 28 % · Épica 10 % · Legendaria 2 %. En el tramo legendario, la mitad de las veces sale una': 'Common 60% · Rare 28% · Epic 10% · Legendary 2%. In the legendary tier, half the time you get a',
  'Con balón': 'With the ball',
  'Con botón': 'With button',
  'Con el portero: Despeje (suelta) manda el balón lejos, Pase y Saque largo.': 'With the keeper: Clearance (release) sends the ball far, plus Pass and Long kick.',
  'Con una cuenta tu partida se guarda en la nube y la recuperas en cualquier móvil u ordenador.': 'With an account your save is stored in the cloud and you can get it back on any phone or computer.',
  'Con usuario y contraseña, apúntala: como no usamos correo,': 'With a username and password, write it down: since we don\'t use email,',
  'Consigue un legendario de Halloween': 'Get a Halloween legendary',
  'Consigue un legendario de Navidad': 'Get a Christmas legendary',
  'Continuar': 'Continue',
  'Continuar con Google': 'Continue with Google',
  'Continuar:': 'Continue:',
  'Contraataque - ¡Al rojo vivo!': 'Counter-attack - Red Hot!',
  'Contraseña': 'Password',
  'Control': 'Control',
  'Controles': 'Controls',
  'Controles: si pulsas Pase o Tiro justo antes de recibir el balón, ahora pasas o chutas al primer toque (antes hacías una entrada sin querer).': 'Controls: if you press Pass or Shoot just before receiving the ball, you now pass or shoot first-time (before, you did a tackle by mistake).',
  'Convoca a': 'Call up',
  'Copa Inazuma': 'Inazuma Cup',
  'Copa Inazuma ·': 'Inazuma Cup ·',
  'Copa ·': 'Cup ·',
  'Copa · ': 'Cup · ',
  'Copia de la nube': 'Cloud copy',
  'Copia del móvil': 'Phone copy',
  'Copia el enlace del recuadro y ábrelo en el otro dispositivo.': 'Copy the link from the box and open it on the other device.',
  'Copiar': 'Copy',
  'Copias en este móvil': 'Copies on this device',
  'Copias extra que se quedan solo en este navegador, por si quieres volver a un punto anterior.': 'Extra copies that stay only in this browser, in case you want to go back to an earlier point.',
  'Copias que se quedan': 'Copies that stay',
  'Copos: +5 por partido en cualquier modo (+10 más si ganas), +20 de regalo cada día, +60 al ganar al Alpino jefe, los retos del día y los del evento. El evento dura hasta el 6 de enero; los jugadores que consigas son tuyos para siempre.': 'Snowflakes: +5 per match in any mode (+10 more if you win), +20 free every day, +60 for beating the boss Alpine, plus the daily and event challenges. The event lasts until January 6; the players you get are yours forever.',
  'Crea una cuenta': 'Create an account',
  'Creando cuenta…': 'Creating account…',
  'Crear carrera rápida': 'Create quick career',
  'Crear cuenta': 'Create account',
  'Cruzada gloriosa': 'Glorious Crusade',
  'Ctrl dcho.': 'Right Ctrl',
  'Cuadros': 'Checks',
  'Cuartos': 'Quarter-finals',
  'Cuatro selecciones de estrellas, cada una más dura.': 'Four all-star national teams, each tougher than the last.',
  'Cuenta': 'Account',
  'CÓDIGO': 'CODE',
  'Cámara lenta en supertécnicas': 'Slow motion on special moves',
  'Código creado: cópialo y guárdalo (por ejemplo en tus notas). Para cargarlo, pégalo aquí en el otro dispositivo.': 'Code created: copy it and keep it somewhere safe (for example in your notes). To load it, paste it here on the other device.',
  'Código de apertura': 'Launch code',
  'Código de partida (sin cuenta)': 'Save code (no account)',
  'Código de regalo': 'Gift code',
  'Córner': 'Corner',
  'Dame un buen partido, si eres capaz.': 'Give me a good game, if you can.',
  'Datos en pantalla (FPS, recargas…)': 'On-screen data (FPS, cooldowns…)',
  'De': 'From',
  'De ': 'From ',
  'Defensa': 'Defender',
  'Defensa+': 'Defence+',
  'Defensiva': 'Defensive',
  'Dejar ir': 'Let go',
  'Del Fútbol Frontier a la Academia Alius… y al Mundial': 'From the Football Frontier to the Alius Academy… and the World Cup',
  'Del Inazuma 1, 2 y 3, cada uno con su cara y sus técnicas': 'From Inazuma 1, 2 and 3, each with their own face and techniques',
  'Del gacha': 'From the gacha',
  'Delantero': 'Forward',
  'Demasiados intentos seguidos. Espera un poco y vuelve a probar.': 'Too many attempts in a row. Wait a moment and try again.',
  'Derecha': 'Right',
  'Derrota': 'Defeat',
  'Desafío elemental': 'Elemental Challenge',
  'Desafíos cortos · premio: Rayo Raimon': 'Short challenges · prize: Raimon Bolt',
  'Desarrollador': 'Developer',
  'Desbloqueado:': 'Unlocked:',
  'Descansar': 'Rest',
  'Descansar recupera más y los partidos cansan menos': 'Resting recovers more and matches tire less',
  'Despeje': 'Clear',
  'Diagonal': 'Diagonal',
  'Dieciseisavos': 'Round of 32',
  'Dificultad': 'Difficulty',
  'Difícil': 'Hard',
  'Dinero': 'Money',
  'Dinero infinito activado': 'Infinite money on',
  'Dinero infinito desactivado': 'Infinite money off',
  'Dioses y alienígenas': 'Gods and Aliens',
  'Directa': 'Direct',
  'Diseño': 'Design',
  'Disponible hasta la semana': 'Available until week',
  'División': 'Division',
  'División ·': 'Division ·',
  'División · puesto': 'Division · position',
  'Dos tiradas legendarias aseguradas': 'Two guaranteed legendary pulls',
  'Duración del partido': 'Match length',
  'Día {0}': 'Day {0}',
  'Día {0}:': 'Day {0}:',
  'El Alpino te ha congelado…': 'Alpine has frozen you out…',
  'El Mundial': 'The World Cup',
  'El Ocultismo te ha asustado…': 'Occult gave you a fright…',
  'El astro del balón - Versión para piano': 'The Football Star - Piano Version',
  'El bosque del monte Fuji': 'The Mount Fuji Forest',
  'El centro de entrenamiento Osakaland': 'The Osakaland Training Centre',
  'El club de fútbol': 'The Football Club',
  'El código está': 'The code is',
  'El director no está contento: últimos de Tercera.': 'The headmaster isn\'t happy: bottom of the Third Division.',
  'El equipo descansa y recupera la forma.': 'The team rests and recovers its form.',
  'El joystick aparece donde pongas el dedo en la mitad izquierda de la pantalla. Para esprintar, lleva el dedo más allá del aro (se pone naranja). Los botones de la derecha cambian según tu equipo tenga el balón o no.': 'The joystick appears wherever you put your finger on the left half of the screen. To sprint, drag your finger past the ring (it turns orange). The buttons on the right change depending on whether your team has the ball.',
  'El joystick sale donde pongas el dedo (mitad izquierda)': 'The joystick appears where you put your finger (left half)',
  'El juego, traducido al inglés (cámbialo en Ajustes).': 'The game, translated into English (change it in Settings).',
  'El lado oscuro': 'The Dark Side',
  'El nombre de usuario debe tener entre 3 y 16 letras o números.': 'Usernames must be 3 to 16 letters or numbers.',
  'El partido rápido no da monedas ni tickets, pero las victorias cuentan para el Rayo Raimon.': 'Quick matches give no coins or tickets, but wins count towards the Raimon Bolt.',
  'El poder de la Academia Alius': 'The Power of the Alius Academy',
  'El poder del Raimon': 'The Power of Raimon',
  'El portero legendario': 'The Legendary Goalkeeper',
  'El portero rival la atrapa': 'The rival goalkeeper catches it',
  'El premio del jefe ya lo cobraste hoy.': 'You already claimed today\'s boss prize.',
  'El primero que marque, gana': 'First to score wins',
  'El regreso del Royal': 'The Return of Royal',
  'El viento sopla a mi favor hoy.': 'The wind is on my side today.',
  'El óvalo - Estadio': 'The Oval - Stadium',
  'Elegir': 'Choose',
  'Elegir club': 'Choose club',
  'Elegir música de cada momento': 'Choose the music for each moment',
  'Elemento': 'Element',
  'Elige 1 de 10 versiones del Infinito (con las probabilidades del gacha)': 'Pick 1 of 10 Infinite versions (with the gacha odds)',
  'Elige 1 de 3 defensas épicos o mejores': 'Pick 1 of 3 epic-or-better defenders',
  'Elige 1 de 3 delanteros épicos o mejores': 'Pick 1 of 3 epic-or-better forwards',
  'Elige 1 de 3 jugadores de +80': 'Pick 1 of 3 players rated 80+',
  'Elige 1 de 3 jugadores de fuego épicos o mejores': 'Pick 1 of 3 epic-or-better fire players',
  'Elige 1 de 3 jugadores legendarios': 'Pick 1 of 3 legendary players',
  'Elige 1 de 3 jugadores épicos o legendarios': 'Pick 1 of 3 epic or legendary players',
  'Elige 1 de 3 medios épicos o mejores': 'Pick 1 of 3 epic-or-better midfielders',
  'Elige 1 de 3 porteros épicos o mejores': 'Pick 1 of 3 epic-or-better goalkeepers',
  'Elige a quién dejas ir': 'Choose who you let go',
  'Elige a tu jugador': 'Pick your player',
  'Elige a tu mánager': 'Choose your manager',
  'Elige colores para crear la tuya': 'Pick colours to create your own',
  'Elige cuál usar en cada momento: animación propia y cámara lenta': 'Choose which one to use each time: its own animation and slow motion',
  'Elige hasta': 'Choose up to',
  'Elige una recompensa': 'Choose a reward',
  'Eliminados de la Copa: se juega sin ti': 'Knocked out of the Cup: it goes on without you',
  'Eliminados en la fase de grupos': 'Knocked out in the group stage',
  'Eliminados en semifinales': 'Knocked out in the semi-finals',
  'Eliminatoria: si hay empate, penaltis': 'Knockout: penalties if it\'s a draw',
  'Empate': 'Draw',
  'Emperadores Oscuros - El campo del trueno': 'Dark Emperors - The Thunder Pitch',
  'Empezar': 'Start',
  'Empezar carrera': 'Start career',
  'Empezar temporada ': 'Start season ',
  'En ': 'In ',
  'En Ajustes puedes poner las supertécnicas automáticas y quitar el cambio automático de jugador.': 'In Settings you can make special moves automatic and turn off automatic player switching.',
  'En Primera no hay playoff: aprovecha para entrenar.': 'There\'s no playoff in the First Division: make the most of it to train.',
  'En casa': 'Home',
  'En curso': 'In progress',
  'En el equipo · ': 'In the team · ',
  'En tiempo real · en el móvil y en el PC': 'Real time · on phone and PC',
  'Encerrarse atrás': 'Park the bus',
  'Ending · Inazuma Eleven': 'Ending · Inazuma Eleven',
  'Enfermería': 'Medical room',
  'Enlace copiado. Mándatelo (WhatsApp, notas…) y ábrelo en el otro dispositivo.': 'Link copied. Send it to yourself (WhatsApp, notes…) and open it on the other device.',
  'Entra con la misma forma que usaste al crear la cuenta.': 'Log in the same way you did when you created the account.',
  'Entrada': 'Tackle',
  'Entrada fallida': 'Tackle missed',
  'Entrando…': 'Logging in…',
  'Entrar': 'Log in',
  'Entrenamiento al máximo': 'Training maxed out',
  'Entrenamiento de': 'Training:',
  'Entrenar': 'Train',
  'Entrenar al máximo': 'Max out training',
  'Equilibrada': 'Balanced',
  'Equipación': 'Kit',
  'Equipación del Raimon': 'Raimon kit',
  'Equipada': 'Equipped',
  'Equipo': 'Team',
  'Equipo especial': 'Special team',
  'Equipos especiales': 'Special teams',
  'Equipos especiales: cada equipo da un jugador distinto (ya no se repite el premio).': 'Special teams: each team now gives a different player (no more repeated rewards).',
  'Eres el': 'You are the',
  'Eres el mánager de un instituto: 3 divisiones, Copa y playoffs. Cada semana haz una actividad (entrenar, ojear…), juega o simula el partido y ficha (también a jugadores del extranjero). Tus titulares': 'You\'re the manager of a school: 3 divisions, a Cup and playoffs. Each week pick an activity (train, scout…), play or simulate the match and sign players (from abroad too). Your starters',
  'Eres el mánager: 3 divisiones y ascensos': 'You\'re the manager: 3 divisions and promotions',
  'Eres el mánager: tus jugadores mejoran (o bajan) según cómo jueguen': 'You\'re the manager: your players improve (or drop) depending on how they play',
  'Eres el seleccionador de Inazuma Japón. Convoca a': 'You\'re the Inazuma Japan coach. Call up',
  'Error al guardar en la nube (': 'Error saving to the cloud (',
  'Error con la nube; se reintentará': 'Cloud error; it will try again',
  'Escribe al menos 2 letras.': 'Type at least 2 letters.',
  'Escribe tu usuario y tu contraseña.': 'Type your username and password.',
  'Escribe un código': 'Type a code',
  'Escribe un código para recibir su premio. Cada código se puede canjear una vez.': 'Type a code to get its reward. Each code can be redeemed once.',
  'Escuchar': 'Listen',
  'Escudo': 'Crest',
  'Ese código no existe': 'That code doesn\'t exist',
  'Ese código no tiene ninguna partida dentro.': 'That code doesn\'t contain a save.',
  'Ese nombre de usuario ya está cogido. Prueba con otro.': 'That username is already taken. Try another one.',
  'Espacio': 'Space',
  'Especiales': 'Specials',
  'Esperan en octavos:': 'Waiting in the round of 16:',
  'Esprint': 'Sprint',
  'Esta copia del juego no es oficial': 'This copy of the game is not official',
  'Esta cuenta está desactivada.': 'This account is disabled.',
  'Esta forma de entrar no está activada en Firebase (Authentication → Método de inicio de sesión).': 'This login method isn\'t enabled in Firebase (Authentication → Sign-in method).',
  'Esta web no está autorizada en Firebase (Authentication → Configuración → Dominios autorizados).': 'This website isn\'t authorised in Firebase (Authentication → Settings → Authorised domains).',
  'Estadio': 'Stadium',
  'Estadio de acero': 'Steel stadium',
  'Este campo es mi bosque. ¡Perderás en casa ajena!': 'This field is my forest. You\'ll lose on my turf!',
  'Este código ha caducado': 'This code has expired',
  'Este código todavía no está activo': 'This code isn\'t active yet',
  'Este es el equipo que sale en el partido rápido y al empezar cualquier modo. Se guarda solo.': 'This is the team used in quick matches and when you start any mode. It saves automatically.',
  'Este jugador no aprende técnicas.': 'This player doesn\'t learn techniques.',
  'Etapa 1': 'Stage 1',
  'Etapa 1 · Inazuma Eleven': 'Stage 1 · Inazuma Eleven',
  'Etapa 1 · final y jefes': 'Stage 1 · final and bosses',
  'Etapa 1 · inicio': 'Stage 1 · start',
  'Etapa 1 · mejor: ': 'Stage 1 · best: ',
  'Etapa 1 · mitad': 'Stage 1 · middle',
  'Etapa 1 · recta final': 'Stage 1 · home stretch',
  'Etapa 1 ✓ · Etapa 2 abierta (mejor: ': 'Stage 1 ✓ · Stage 2 unlocked (best: ',
  'Etapa 2': 'Stage 2',
  'Etapa 2 · Inazuma Eleven 2': 'Stage 2 · Inazuma Eleven 2',
  'Etapa 2 · final y jefes': 'Stage 2 · final and bosses',
  'Etapa 2 · inicio': 'Stage 2 · start',
  'Etapa 2 · mitad': 'Stage 2 · middle',
  'Etapa 2 · recta final': 'Stage 2 · home stretch',
  'Etapa 3 abierta: el Inazuma 3': 'Stage 3 unlocked: Inazuma 3',
  'Etapa 3 · Fase 1': 'Stage 3 · Phase 1',
  'Etapa 3 · Fase 2': 'Stage 3 · Phase 2',
  'Etapa 3 · Fase 2 abierta (mejor: ': 'Stage 3 · Phase 2 unlocked (best: ',
  'Etapa 3 · Fase 2 · el Mundial': 'Stage 3 · Phase 2 · the World Cup',
  'Etapas 1, 2 y 3 completadas': 'Stages 1, 2 and 3 completed',
  'Etapas 1, 2 y 3 completadas ✓': 'Stages 1, 2 and 3 completed ✓',
  'Evento de Halloween forzado': 'Halloween event forced on',
  'Evento de Halloween según la fecha': 'Halloween event follows the date',
  'Evento de Navidad forzado': 'Christmas event forced on',
  'Evento de Navidad según la fecha': 'Christmas event by date',
  'Evento reiniciado': 'Event reset',
  'Evolución': 'Evolution',
  'Exorcista': 'Exorcist',
  'Exorcista del día': 'Exorcist of the day',
  'Faltan ': 'Missing ',
  'Faltan jugadores': 'Not enough players',
  'Fama': 'Fame',
  'Fama y forma al 100': 'Fame and form at 100',
  'Fase de grupos': 'Group stage',
  'Fase de grupos · partido': 'Group stage · match',
  'Fichaje temporal': 'Temporary signing',
  'Fichajes': 'Transfers',
  'Fichar gratis': 'Sign for free',
  'Fichar por': 'Sign for',
  'Fichar · ': 'Sign · ',
  'Fin de la carrera': 'End of the career',
  'Fin de la partida': 'End of the run',
  'Fin de la temporada': 'End of the season',
  'Fin del Mundial': 'End of the World Cup',
  'Fin del partido': 'Full time',
  'Final': 'Final',
  'Forma': 'Form',
  'Forma tu equipo y llega a la cima': 'Build your team and reach the top',
  'Formación': 'Formation',
  'Fuego': 'Fire',
  'Fuego y hielo': 'Fire and Ice',
  'Fuera': 'Away',
  'Fuerza de tiro': 'Shooting Power',
  'Fuerza defensiva': 'Defensive Power',
  'Fuerza veloz': 'Swift Power',
  'Funciona con mandos de Xbox, PlayStation y la mayoría de genéricos: conéctalo (por cable o Bluetooth) y pulsa un botón.': 'Works with Xbox, PlayStation and most generic controllers: connect it (cable or Bluetooth) and press a button.',
  'Fácil': 'Easy',
  'Fácil: 5 partidos y 3 vidas · Medio: 6 y 2 · Difícil: 7 y 1.': 'Easy: 5 matches and 3 lives · Medium: 6 and 2 · Hard: 7 and 1.',
  'Físico': 'Body',
  'Fútbol 5 contra 5': '5-a-side football',
  'Gacha': 'Gacha',
  'Gacha de Bai Long': 'Bai Long gacha',
  'Gacha limitado': 'Limited gacha',
  'Gacha limitado · 100 🎟️ = 10 jugadores': 'Limited gacha · 100 🎟️ = 10 players',
  'Gana': 'Win',
  'Gana 2 partidos hoy': 'Win 2 matches today',
  'Gana al Alpino jefe': 'Beat the boss Alpine',
  'Gana al Ocultismo jefe': 'Beat the Occult boss',
  'Gana hoy al Alpino jefe': 'Beat the boss Alpine today',
  'Gana hoy al Ocultismo jefe': 'Beat the Occult boss today',
  'Gasta tickets para tirar: gira la manivela de la máquina y abre las cápsulas. Probabilidades: común 60 %, rara 28 %, épica 10 %, legendaria 2 % (cada 10 tiradas sin épica, la siguiente lo es seguro). Los repetidos suben estrellas a tu jugador.': 'Spend tickets to pull: turn the machine\'s crank and open the capsules. Odds: common 60%, rare 28%, epic 10%, legendary 2% (after 10 pulls without an epic, the next one is guaranteed). Duplicates add stars to your player.',
  'Gira de la Caravana': 'Caravan Tour',
  'Gira la manivela con el dedo ↻': 'Turn the crank with your finger ↻',
  'Gira la manivela: Héroes, Rivales y Villanos': 'Turn the crank: Heroes, Rivals and Villains',
  'Gol': 'Goal',
  'Gol de ': 'Goal by ',
  'Grandes': 'Large',
  'Grupo': 'Group',
  'Guardada el ': 'Saved on ',
  'Guardada en la nube ✓': 'Saved to the cloud ✓',
  'Guardado en la nube arreglado: ¡erais tantos que reventasteis el servidor! Ahora la partida se sube como mucho una vez por minuto y al salir del juego.': 'Cloud saving fixed: there were so many of you that you blew up the server! Your save is now uploaded at most once a minute and when you leave the game.',
  'Guardado en la nube ✓': 'Saved to the cloud ✓',
  'Guardando antes de salir…': 'Saving before leaving…',
  'Guardando…': 'Saving…',
  'Guardar': 'Save',
  'Guardar en la nube': 'Save to the cloud',
  'Gánale: +60 ❄️ (una vez al día)': 'Beat them: +60 ❄️ (once a day)',
  'Gánale: +60 🍬 (una vez al día)': 'Beat them: +60 🍬 (once a day)',
  'Géminis - El balón negro': 'Gemini - The Black Ball',
  'Génesis - El equipo G': 'Genesis - Team G',
  'Génesis - Los superhumanos': 'Genesis - The Superhumans',
  'Habilidad': 'Skill',
  'Hablar es fácil. ¡Demuéstralo en el campo!': 'Talk is cheap. Prove it on the pitch!',
  'Halloween': 'Halloween',
  'Has completado la carrera. Tu club entra en el salón de la fama… y puedes seguir jugando temporadas para siempre (los rivales mejoran cada año).': 'You\'ve completed the career. Your club enters the hall of fame… and you can keep playing seasons forever (rivals get better every year).',
  'Has ganado': 'You won',
  'Has llegado a la oleada': 'You reached wave',
  'Hay dos versiones distintas de tu partida.': 'There are two different versions of your save.',
  'Hay otra versión de tu partida en la nube. Resuélvelo antes de salir.': 'There\'s another version of your save in the cloud. Sort it out before leaving.',
  'Hay teclas repetidas (en rojo): cámbialas para que cada una haga una sola cosa.': 'Some keys are repeated (in red): change them so each one does only one thing.',
  'Haz 20 tiradas del Sobre Calabaza': 'Do 20 Pumpkin Pack pulls',
  'Haz 20 tiradas del Sobre Navideño': 'Do 20 pulls of the Christmas Pack',
  'Haz 3 tiradas del Sobre Calabaza hoy': 'Do 3 Pumpkin Pack pulls today',
  'Haz 3 tiradas del Sobre Navideño hoy': 'Do 3 pulls of the Christmas Pack today',
  'Haz clic o pulsa una tecla': 'Click or press a key',
  'Haz tu oferta.': 'Make your offer.',
  'Haz una oferta a otro club. Sus estrellas cuestan más, y a los clubes de divisiones superiores no les gusta vender a uno de abajo. Si te pasas de tacaño, cortan la negociación hasta la semana siguiente.': 'Make an offer to another club. Their stars cost more, and clubs from higher divisions don\'t like selling to one below. If you\'re too stingy, they end the negotiation until next week.',
  'Hidetoshi Nakata (versión del Infinito)': 'Hidetoshi Nakata (Infinite version)',
  'Historia': 'Story',
  'Historia · Inazuma Eleven 2': 'Story · Inazuma Eleven 2',
  'Hokkaido - Paraíso nevado': 'Hokkaido - Snowy Paradise',
  'Hoy mi balón arde. ¡Aguanta si puedes!': 'My ball is burning today. Hold on if you can!',
  'Hoy no pienso perder. ¡Prepárate!': 'I\'m not losing today. Get ready!',
  'Hueco': 'Slot',
  'Hurley Kane (versión del Infinito)': 'Hurley Kane (Infinite version)',
  'Héroes': 'Heroes',
  'Inazuma 1': 'Inazuma 1',
  'Inazuma 2': 'Inazuma 2',
  'Inazuma 3': 'Inazuma 3',
  'Inazuma Gold es gratis y solo se juega en su web oficial, donde tienes tu partida guardada, las novedades y los eventos.': 'Inazuma Gold is free and is only played on its official website, where your save, news and events are.',
  'Inazuma Gold v': 'Inazuma Gold v',
  'Inazuma Japón': 'Inazuma Japan',
  'Inazuma Japón y las selecciones del mundo: Unicorn, Orpheus, Little Gigant…': 'Inazuma Japan and the world\'s national teams: Unicorn, Orpheus, Little Gigant…',
  'Infinito': 'Infinite',
  'Iniciales': 'Initials',
  'Iniciar sesión': 'Log in',
  'Inicio': 'Start',
  'Instituto Inazuma': 'Inazuma School',
  'Instituto Ocultismo': 'Occult',
  'Intro': 'Intro',
  'Intro al abrir el juego': 'Intro when opening the game',
  'Invasión Alius': 'Alius Invasion',
  'Invitado · tu partida solo está en este móvil.': 'Guest · your save is only on this device.',
  'Ir al gacha': 'Go to the gacha',
  'Izquierda': 'Left',
  'Japón': 'Japan',
  'Jefe de la oleada {0} del Infinito: elige una versión': 'Endless wave {0} boss: choose a version',
  'Jim de Halloween (épico especial) de regalo': 'Halloween Jim (special epic) as a gift',
  'Jornada': 'Matchday',
  'Joyas que han encontrado tus ojeadores: mucho más baratas que en el mercado, pero solo durante unas semanas. Usa la actividad «Ojear» para buscar más.': 'Gems your scouts have found: much cheaper than on the market, but only for a few weeks. Use the «Scout» activity to find more.',
  'Joystick': 'Joystick',
  'Juega 3 partidos hoy': 'Play 3 matches today',
  'Juega · ': 'Play · ',
  'Juegan:': 'Playing:',
  'Juego': 'Game',
  'Jugaba en': 'Played for',
  'Jugadores': 'Players',
  'Jugadores (': 'Players (',
  'Jugadores de nieve y hielo, y 6 legendarios exclusivos de Navidad.': 'Snow and ice players, and 6 exclusive Christmas legendaries.',
  'Jugadores del sobre': 'Players in the pack',
  'Jugar como invitado': 'Play as a guest',
  'Jugar contra': 'Play against',
  'J{0}': 'MD{0}',
  'Kappa legendario, vale para cualquier puesto': 'Legendary Kappa, fits any position',
  'Kirkwood, Royal Academy y Zeus, uno detrás de otro y al máximo.': 'Kirkwood, Royal Academy and Zeus, back to back and at full strength.',
  'LIMITADO': 'LIMITED',
  'LIMITADO · 100 🎟️ = 10 jugadores · nota 100': 'LIMITED · 100 🎟️ = 10 players · rating 100',
  'La Caravana Inazuma': 'The Inazuma Caravan',
  'La Copa empieza la temporada que viene': 'The Cup starts next season',
  'La Copa empieza la temporada que viene.': 'The Cup starts next season.',
  'La amenaza del trueno': 'The Thunder Threat',
  'La base de la Academia Alius': 'The Alius Academy Base',
  'La ciudad de Inazuma': 'Inazuma Town',
  'La contraseña debe tener al menos 6 caracteres.': 'The password must be at least 6 characters long.',
  'La contraseña es demasiado corta (mínimo 6 caracteres).': 'The password is too short (at least 6 characters).',
  'La de la etapa': 'The stage\'s own',
  'La equipación y el escudo se eligen después en «Club». Ganar ligas, la Copa o ascender da tickets para el gacha.': 'You choose the kit and crest later in «Club». Winning leagues, the Cup or getting promoted gives tickets for the gacha.',
  'La fama del club ha llegado a 0 y el director ha cerrado el club de fútbol.': 'The club\'s fame has reached 0 and the headmaster has closed the football club.',
  'La fama ha llegado a 0 y el director cierra el club.': 'Fame has reached 0 and the headmaster closes the club.',
  'La fama ha llegado a 0…': 'Fame has reached 0…',
  'La historia, en 3 etapas': 'The story, in 3 stages',
  'La música sale de tus archivos del Inazuma 1 y 2, reconstruida desde las partituras del juego. Los nombres son los de la colección de música del Inazuma 2.': 'The music comes from your Inazuma 1 and 2 files, rebuilt from the game\'s sheet music. The names are the ones from Inazuma 2\'s music collection.',
  'La nube está saturada ahora mismo. Tu partida está a salvo en este dispositivo y se subirá más tarde.': 'The cloud is overloaded right now. Your save is safe on this device and will be uploaded later.',
  'La nube tarda en responder: juegas con la partida de este móvil': 'The cloud is slow to respond: you\'re playing with the save on this device',
  'La primera vez:': 'The first time:',
  'La próxima tirada será épica o mejor': 'Your next pull will be epic or better',
  'La que tienes ahora aquí': 'The one you have here now',
  'La sombra negra - Tema de Ray Dark': 'The Black Shadow - Ray Dark\'s Theme',
  'La última batalla': 'The Final Battle',
  'Las contraseñas no coinciden.': 'The passwords don\'t match.',
  'Las cuentas aún no están activadas en esta versión del juego.': 'Accounts aren\'t enabled in this version of the game yet.',
  'Las cuentas todavía no están activadas en esta versión del juego. Tu partida se guarda en este móvil.': 'Accounts aren\'t enabled in this version of the game yet. Your save is stored on this device.',
  'Las paradas de la Caravana Inazuma por Japón.': 'The Inazuma Caravan\'s stops around Japan.',
  'Las próximas 10 tiradas serán legendarias': 'Your next 10 pulls will be legendary',
  'Las supertécnicas del Inazuma 3 ya salen en español (antes estaban en inglés) y se han añadido algunas que faltaban.': 'Inazuma Eleven 3 special moves now have Spanish names in the Spanish version, and some missing ones have been added.',
  'Las supertécnicas tienen recarga: el botón se va llenando hasta que vuelve a estar lista.': 'Special moves have a cooldown: the button fills up until it\'s ready again.',
  'Las técnicas que ganas tras cada partido ahora encajan con la posición del jugador (un portero ya no recibe técnicas de tiro).': 'The moves you earn after each match now fit the player\'s position (a goalkeeper no longer gets shooting moves).',
  'Las técnicas recargan un 20 % antes': 'Techniques recharge 20% faster',
  'Las técnicas, habilidades y fichajes se pierden al acabar; monedas, tickets y Rayos se quedan.': 'Techniques, skills and signings are lost when it ends; coins, tickets and Bolts stay.',
  'Las técnicas, habilidades y fichajes temporales se pierden.': 'Techniques, skills and temporary signings are lost.',
  'Lean (versión del Infinito)': 'Lean (Infinite version)',
  'Legendaria': 'Legendary',
  'Legendario 3 % · Épica 15 % · Rara 32 % · Común 50 %. Legendario asegurado a las': 'Legendary 3% · Epic 15% · Rare 32% · Common 50%. Legendary guaranteed after',
  'Legendario asegurado': 'Guaranteed legendary',
  'Legendarios de verdad': 'True legendaries',
  'Leyendo el código…': 'Reading the code…',
  'Liberar': 'Release',
  'Libres': 'Free agents',
  'Liga ': 'League ',
  'Liga Centella': 'Lightning League',
  'Limitada': 'Limited',
  'Lisa': 'Plain',
  'Listo': 'Done',
  'Llega de la Academia Alius': 'Arrives from the Alius Academy',
  'Lluvia de tickets': 'Ticket shower',
  'Los 30 equipos de las 3 divisiones, a partido único (con penaltis si hay empate). Ganarla da dinero, fama y': 'The 30 teams of the 3 divisions, single-leg ties (penalties if it\'s a draw). Winning it gives money, fame and',
  'Los botones están en Ajustes.': 'The buttons are in Settings.',
  'Los equipos de la Academia Alius, de Géminis a Génesis.': 'The Alius Academy teams, from Gemini to Genesis.',
  'Los equipos del Fútbol Frontier, la gira por Japón y las selecciones del mundo': 'The Football Frontier teams, the tour around Japan and the world\'s national teams',
  'Los repetidos suben una estrella (máx.': 'Duplicates add a star (max.',
  'Los sueños del Raimon': 'Raimon\'s Dreams',
  'Lugares · Inazuma Eleven 2': 'Places · Inazuma Eleven 2',
  'Mando desconectado': 'Controller disconnected',
  'Mando:': 'Controller:',
  'Mangas y pantalón': 'Sleeves and shorts',
  'Medalla de': 'Medal:',
  'Medallas:': 'Medals:',
  'Media de 90 o más desde el primer día': 'Rating of 90 or more from day one',
  'Media del equipo:': 'Team rating:',
  'Media:': 'Rating:',
  'Medio': 'Midfielder',
  'Mejorar ·': 'Upgrade ·',
  'Mejoras del club': 'Club upgrades',
  'Menú': 'Menu',
  'Menús': 'Menus',
  'Mercury (versión del Infinito)': 'Mercury (Infinite version)',
  'Mi equipo': 'My team',
  'Mi equipo no se rinde jamás.': 'My team never gives up.',
  'Mis raíces son profundas. ¡No me moverás!': 'My roots run deep. You won\'t move me!',
  'Mitades': 'Halves',
  'Modo': 'Mode',
  'Modo Carrera': 'Career Mode',
  'Modo desarrollador activado': 'Developer mode on',
  'Modo roguelite': 'Roguelite mode',
  'Monedas': 'Coins',
  'Monedas del pingüino': 'Penguin coins',
  'Montaña': 'Mountain',
  'Mostrar contraseña': 'Show password',
  'Muchos jugadores del 3 llevaban en el campo un muñeco que no era el suyo. Ahora todos llevan su muñeco de verdad, sacado del juego original: su peinado, sus colores y su tono de piel. Mac Robingo, Hector Helio, Edgar Partinus, Dylan Keith, Byron Love y muchos más ya se ven como tienen que verse.': 'Many Inazuma Eleven 3 players wore someone else\'s sprite on the pitch. Now every one of them has their real sprite, taken from the original game: their hairstyle, their colours and their skin tone. Mac Robingo, Hector Helio, Edgar Partinus, Dylan Keith, Byron Love and many more finally look the way they should.',
  'Mundial con Inazuma Japón': 'World Cup with Inazuma Japan',
  'Mundial · ': 'World Cup · ',
  'Mundial · Alineación': 'World Cup · Line-up',
  'Mundial · Convocatoria': 'World Cup · Call-up',
  'Mundial · temporada': 'World Cup · season',
  'Muralla': 'The Wall',
  'Muñecos del Inazuma 3 arreglados: muchos tenían el muñeco de otro jugador (p. ej. Partinus salía con el pelo marrón).': 'Inazuma 3 sprites fixed: many had another player\'s sprite (e.g. Partinus had brown hair).',
  'Mánager:': 'Manager:',
  'Máquina de gachapón': 'Gachapon machine',
  'Más de': 'More than',
  'Más goles a favor… y en contra': 'More goals for… and against',
  'Más joyas al ojear y de mejor nivel': 'More and better gems when scouting',
  'Máximo': 'Maximum',
  'Móvil:': 'Phone:',
  'Móvil: botones más grandes y en arco alrededor de Tiro; nueva opción de tamaño en Ajustes.': 'Mobile: bigger buttons arranged in an arc around Shoot; new size option in Settings.',
  'Móvil: joystick más grande y con zona muerta; ya no esprintas sin querer (para esprintar, lleva el dedo más allá del aro).': 'Mobile: bigger joystick with a dead zone; no more accidental sprinting (to sprint, drag your finger past the ring).',
  'Móvil: los botones ya no se «comen» los toques (antes a veces no chutaba ni pasaba).': 'Mobile: the buttons no longer "swallow" taps (sometimes you couldn\'t shoot or pass).',
  'Música de serie': 'Default music',
  'Nadie ha aprendido nada nuevo esta vez, pero todos mejoran el control (+1).': 'Nobody learned anything new this time, but everyone improves their control (+1).',
  'Nadie ha movido esta montaña. ¿Serás tú el primero?': 'Nobody has ever moved this mountain. Will you be the first?',
  'Navidad': 'Christmas',
  'Necesitas al menos': 'You need at least',
  'Negociación': 'Negotiation',
  'Negociar': 'Negotiate',
  'Ninguno': 'None',
  'Ninguno de tus jugadores es de ': 'None of your players are ',
  'Ningún jugador coincide con la búsqueda.': 'No player matches the search.',
  'Ningún jugador coincide. Prueba con otro nombre o quita filtros (✕).': 'No player matches. Try another name or clear the filters (✕).',
  'Nivel': 'Level',
  'No': 'No',
  'No encuentro ningún código. Tiene que empezar por': 'I can\'t find any code. It has to start with',
  'No hay conexión. Prueba otra vez cuando tengas internet.': 'No connection. Try again when you have internet.',
  'No hay ninguna carrera empezada.': 'No career has been started.',
  'No juegas el playoff esta temporada: se juega sin ti.': 'You\'re not in the playoff this season: it goes on without you.',
  'No me asustas. ¡Empecemos!': 'You don\'t scare me. Let\'s start!',
  'No me subestimes. ¡Voy a por todas!': 'Don\'t underestimate me. I\'m going all out!',
  'No queda nadie disponible con ese filtro.': 'Nobody left with that filter.',
  'No se ha podido crear la cuenta': 'The account couldn\'t be created',
  'No se ha podido entrar': 'Couldn\'t log in',
  'No se ha podido guardar (el navegador no deja más espacio).': 'Couldn\'t save (the browser has no more space).',
  'No se ha podido guardar ahora. Se reintentará solo.': 'Couldn\'t save right now. It will try again by itself.',
  'No se ha podido subir': 'Couldn\'t upload',
  'No se ha podido subir tu última partida (¿sin conexión?).': 'Couldn\'t upload your latest save (no connection?).',
  'No se pudieron cargar los jugadores': 'The players couldn\'t be loaded',
  'No se puede conectar con el servidor de cuentas. Comprueba tu internet.': 'Can\'t connect to the account server. Check your internet.',
  'No tiene técnicas que aprender.': 'There are no techniques to learn.',
  'No tienes caramelos suficientes': 'Not enough candies',
  'No tienes copos suficientes': 'You don\'t have enough snowflakes',
  'No tienes dinero suficiente.': 'You don\'t have enough money.',
  'No tienes jugadores de este puesto. Toca «Todos».': 'You have no players in this position. Tap «All».',
  'No tienes tanto dinero.': 'You don\'t have that much money.',
  'No tienes tickets suficientes': 'You don\'t have enough tickets',
  'No, que': 'No, let',
  'Noche de partidos': 'Match night',
  'Nombre del instituto': 'School name',
  'Normal': 'Normal',
  'Normales': 'Normal',
  'Nota': 'Rating',
  'Nota ': 'Rating ',
  'Nube: la partida se guarda comprimida (ocupa unas 8 veces menos) y se sube al acabar cada partido, al salir del juego y, mientras juegas, cada 5 minutos. Así el servidor aguanta a muchos más jugadores.': 'Cloud: your save is now compressed (about 8 times smaller) and uploads after every match, when you leave the game and, while playing, every 5 minutes. This way the server can handle many more players.',
  'Nueva carrera': 'New career',
  'Nueva guía de controles (móvil, ordenador y mando) en Pausa y en Ajustes.': 'New controls guide (mobile, PC and gamepad) in Pause and Settings.',
  'Nuevas (K tiro)': 'New (K shoots)',
  'Nuevo apartado de Novedades (este).': 'New "What\'s new" section (this one).',
  'Nunca (PC)': 'Never (PC)',
  'Octavos': 'Round of 16',
  'Ocupas el sitio del club que elijas: su división, su nombre y sus jugadores. Ellos se quedan con tu plantilla. La temporada empieza de nuevo.': 'You take the place of the club you choose: its division, its name and its players. They keep your squad. The season starts again.',
  'Ofensiva': 'Attacking',
  'Ofertar': 'Offer',
  'Ojeados (': 'Scouted (',
  'Ojear': 'Scout',
  'Okinawa - Fútbol bajo el sol': 'Okinawa - Football in the Sun',
  'Oleada': 'Wave',
  'Oleada ': 'Wave ',
  'Oleadas de rivales cada vez más fuertes hasta que te quedes sin vidas. Cada 5 oleadas, un jefe. Intenta batir tu récord.': 'Waves of ever stronger rivals until you run out of lives. Every 5 waves, a boss. Try to beat your record.',
  'Once de Raimon': 'Raimon Eleven',
  'Opciones avanzadas': 'Advanced options',
  'Opening · Inazuma Eleven': 'Opening · Inazuma Eleven',
  'Opening · Inazuma Eleven 2': 'Opening · Inazuma Eleven 2',
  'Ordenador: en Ajustes puedes elegir las teclas nuevas (K tiro) o las clásicas (L tiro), como antes.': 'Computer: in Settings you can pick the new keys (K shoots) or the classic ones (L shoots), like before.',
  'Ordenador: nuevas teclas «A tu gusto» en Ajustes → Controles. Elige la tecla de cada acción, también para moverte.': 'PC: new Custom keys in Settings → Controls. Choose the key for every action, movement included.',
  'Ordenador: teclas más cómodas (J/Z pase, K/X tiro, L/C profundidad, I/V regate, E cambiar técnica) y aviso de que se puede jugar con mando.': 'Computer: comfier keys (J/Z pass, K/X shoot, L/C through ball, I/V dribble, E change move) and a note that you can play with a controller.',
  'Ordenados de peor a mejor. Se va del club sin cobrar nada.': 'Sorted from worst to best. They leave the club for nothing.',
  'Oro ': 'Gold ',
  'Osakaland': 'Osakaland',
  'Otro partido rápido': 'Another quick match',
  'Otros clubes': 'Other clubs',
  'PC:': 'PC:',
  'PJ ·': 'GP ·',
  'Paciencia… el balón acabará en mis manos.': 'Patience… the ball will end up with me.',
  'Para llevar tu partida a otro dispositivo usa tu': 'To take your save to another device, use your',
  'Parada': 'Save',
  'Parar': 'Stop',
  'Partida en curso borrada': 'Current run deleted',
  'Partida guardada en la ranura ': 'Save stored in slot ',
  'Partido': 'Match',
  'Partido ': 'Match ',
  'Partido 1': 'Match 1',
  'Partido 2': 'Match 2',
  'Partido 3': 'Match 3',
  'Partido 4': 'Match 4',
  'Partido 5': 'Match 5',
  'Partido de liga': 'League match',
  'Partido jefe': 'Boss match',
  'Partido rápido': 'Quick match',
  'Partidos más equilibrados: con el balón se esprinta un poco menos y los rivales corren algo más cuando defienden. Ya no te escapas solo corriendo.': 'More balanced matches: you sprint a bit less with the ball and rivals run a bit more when defending. You can no longer escape just by running.',
  'Partidos · Inazuma Eleven': 'Matches · Inazuma Eleven',
  'Partidos · Inazuma Eleven 2': 'Matches · Inazuma Eleven 2',
  'Pase': 'Pass',
  'Pase / entrada': 'Pass / tackle',
  'Pase ya no hace entradas a tus propios compañeros.': 'Pass no longer tackles your own teammates.',
  'Pausa': 'Pause',
  'Pega aquí el código (empieza por IRZ1:)': 'Paste the code here (it starts with IRZ1:)',
  'Pega aquí un código de partida para cargarlo': 'Paste a save code here to load it',
  'Pega primero un código.': 'Paste a code first.',
  'Penaltis:': 'Penalties:',
  'Pequeños': 'Small',
  'Pequeños ajustes y mejoras en el gacha y en los avisos al abrir el juego.': 'Small tweaks and improvements to the gacha and to the notices when you open the game.',
  'Perfil borrado': 'Profile deleted',
  'Plantilla': 'Squad',
  'Plantilla: en Jugadores ves la nota y el elemento de cada uno, y en Mi equipo el elemento de cada jugador en el campo.': 'Squad: Players now shows each player\'s rating and element, and My team shows each player\'s element on the pitch.',
  'Playoff': 'Playoff',
  'Playoff de ascenso': 'Promotion playoff',
  'Playoff de ascenso ·': 'Promotion playoff ·',
  'Playoff de ascenso · final': 'Promotion playoff · final',
  'Playoff de ascenso · semifinales': 'Promotion playoff · semi-finals',
  'Playoff ·': 'Playoff ·',
  'Playoff · FINAL': 'Playoff · FINAL',
  'Playoff · final': 'Playoff · final',
  'Playoff · semifinal': 'Playoff · semi-final',
  'Playoff · semifinales': 'Playoff · semi-finals',
  'Playoff · ¡FINAL!': 'Playoff · THE FINAL!',
  'Playoffs de ascenso': 'Promotion playoffs',
  'Por oleadas · récord: ': 'Waves · record: ',
  'Portero': 'Goalkeeper',
  'Portero con balón: J pase · K saque largo · L despeje.': 'Keeper with the ball: J pass · K long kick · L clearance.',
  'Portero con balón: J pase · L saque largo · K despeje.': 'Keeper with the ball: J pass · L long kick · K clearance.',
  'Portero con balón: {0} pase · {1} saque largo · {2} despeje.': 'Goalkeeper with the ball: {0} pass · {1} long kick · {2} clearance.',
  'Portero+': 'Keeper+',
  'Porteros: salen a por el que entra con el balón en el área, y ya no se puede entrar andando con el balón en la portería. Para marcar, hay que chutar.': 'Goalkeepers: they now rush whoever enters the box with the ball, and you can no longer walk the ball into the net. To score, you have to shoot.',
  'Practicar técnicas': 'Practise techniques',
  'Premio de hoy ya cobrado (puedes repetir)': 'Today\'s prize already claimed (you can replay)',
  'Premio del Mundial': 'World Cup prize',
  'Premio del día 4: quédate con uno de estos tres jugadores de media 80 o más.': 'Day 4 prize: keep one of these three players rated 80 or more.',
  'Premio del equipo especial': 'Special team prize',
  'Premio del jefe: elige una versión': 'Boss reward: choose a version',
  'Premio:': 'Prize:',
  'Premios por completarla:': 'Rewards for completing it:',
  'Premios por entrar': 'Login rewards',
  'Prepárate: mis tiros pesan como piedras.': 'Get ready: my shots hit like boulders.',
  'Presión alta': 'High press',
  'Primera': 'First',
  'Primero convoca a tu selección': 'Call up your national team first',
  'Primero juega o simula el partido de esta semana': 'Play or simulate this week\'s match first',
  'Primero pega el código.': 'Paste the code first.',
  'Primero toca el puesto del campo': 'Tap a position on the pitch first',
  'Probabilidades: común 60 % · rara 28 % · épica 10 % · legendaria 2 %. Cada 10 tiradas sin épica, la siguiente lo es seguro.': 'Odds: common 60% · rare 28% · epic 10% · legendary 2%. After 10 pulls without an epic, the next one is guaranteed.',
  'Progreso': 'Progress',
  'Prominence, Polvo de Diamantes y su fusión, Caos.': 'Prominence, Diamond Dust and their fusion, Chaos.',
  'Pts': 'Pts',
  'Puede aprender': 'Can learn',
  'Puede equipar sus propias técnicas y las técnicas legendarias del gacha de su elemento (': 'Can equip their own techniques and the gacha\'s legendary techniques of their element (',
  'Pueden aprender supertécnicas nuevas': 'Can learn new special moves',
  'Puesto:': 'Position:',
  'Pulsa Pase o Tiro un poco antes de que te llegue el balón: pasarás o chutarás al primer toque.': 'Press Pass or Shoot just before the ball reaches you: you\'ll pass or shoot first-time.',
  'Pulsa una tecla…': 'Press a key…',
  'Quedan': 'Ends in',
  'Quitar filtros': 'Clear filters',
  'R. A. Redux - Supertécnicas milagrosas': 'R. A. Redux - Miraculous Special Moves',
  'Raimon en todas sus versiones, Inazuma Japón, los Veteranos y los amigos de Ciudad Inazuma': 'Raimon in all its versions, Inazuma Japan, the Veterans and friends from Inazuma Town',
  'Ranura': 'Slot',
  'Rapidez': 'Speed',
  'Rapidez+': 'Speed+',
  'Rara': 'Rare',
  'Rareza': 'Rarity',
  'Ray Dark': 'Ray Dark',
  'Rayas': 'Stripes',
  'Rayos Raimon': 'Raimon Bolts',
  'Recobro': 'Recovery',
  'Recoger': 'Claim',
  'Recorre los torneos del 1, 2 y 3 con tu equipo. Es': 'Play through the tournaments of 1, 2 and 3 with your team. It\'s',
  'Recorrido:': 'Journey:',
  'Recupera aguante un 60 % más rápido': 'Recovers stamina 60% faster',
  'Recupera la forma del equipo': 'Recovers the team\'s form',
  'Recuperar mi partida': 'Recover my save',
  'Recursos': 'Resources',
  'Red de ojeadores': 'Scouting network',
  'Regalo de Reyes': 'Three Kings\' gift',
  'Regalo de la comunidad': 'Community gift',
  'Regate': 'Dribble',
  'Regate / Cambiar': 'Dribble / Switch',
  'Reiniciar el evento': 'Reset the event',
  'Rendirse (cuenta como derrota)': 'Give up (counts as a defeat)',
  'Repite la contraseña': 'Repeat the password',
  'Resultado:': 'Result:',
  'Resultados de la jornada ·': 'Matchday results ·',
  'Retos completados: Ray Dark desbloqueado': 'Challenges done: Ray Dark unlocked',
  'Retos completados: regalo especial recibido': 'Challenges completed: special gift received',
  'Retos del día': 'Daily challenges',
  'Retos del evento': 'Event challenges',
  'Revisa que es tu partida y toca': 'Check that it\'s your save and tap',
  'Rey del hielo': 'Ice king',
  'Rey del hielo del día': 'Ice king of the day',
  'Ritmo rápido': 'Fast Pace',
  'Rival': 'Rival',
  'Rival · ': 'Rival · ',
  'Rivales': 'Rivals',
  'Rivales cada vez más duros': 'Ever tougher rivals',
  'Rivales cada vez más fuertes y 2 vidas. Cada 5 partidos, una oleada especial con premio extra.': 'Ever stronger rivals and 2 lives. Every 5 matches, a special wave with an extra prize.',
  'Rivales con tema propio': 'Rivals with their own theme',
  'Rivales · Inazuma Eleven 2': 'Rivals · Inazuma Eleven 2',
  'Roba arriba, cansa más': 'Win it high, tires more',
  'Roguelite: el partido se acaba si un equipo gana por 5 goles de diferencia.': 'Roguelite: the match ends when a team leads by 5 goals.',
  'Royal Academy - Versión del juego': 'Royal Academy - Game Version',
  'Royal Academy, su versión Redux y los Emperadores Oscuros.': 'Royal Academy, its Redux version and the Dark Emperors.',
  'Salir al menú': 'Back to menu',
  'Salir del modo': 'Leave the mode',
  'Salir igualmente': 'Leave anyway',
  'Saltar': 'Skip',
  'Saltar (no quiero ninguna)': 'Skip (I don\'t want any)',
  'Saltar al final ▶▶': 'Skip to the end ▶▶',
  'Saltar ▶▶': 'Skip ▶▶',
  'Salón de la fama': 'Hall of fame',
  'Saque de banda': 'Throw-in',
  'Saque de puerta': 'Goal kick',
  'Saque largo': 'Long kick',
  'Saque largo (portero)': 'Long kick (goalkeeper)',
  'Saque<br>largo': 'Long<br>kick',
  'Se abre al completar la Etapa 2': 'Unlocks when you complete Stage 2',
  'Se guardará tu partida en la nube y este móvil quedará vacío para que pueda entrar otra cuenta. Toca otra vez para confirmar.': 'Your save will be uploaded to the cloud and this device will be left empty so another account can log in. Tap again to confirm.',
  'Se quita el pase al hueco (móvil, teclado y mando): estorbaba. El portero sigue sacando en largo.': 'The through ball is gone (mobile, keyboard and gamepad): it got in the way. The goalkeeper can still kick long.',
  'Seguir': 'Continue',
  'Seguir jugando (infinito)': 'Keep playing (endless)',
  'Segunda': 'Second',
  'Selecciónalo y cópialo a mano.': 'Select it and copy it by hand.',
  'Semana': 'Week',
  'Semana de Copa': 'Cup week',
  'Semana libre': 'Free week',
  'Semifinal': 'Semi-final',
  'Semifinales:': 'Semi-finals:',
  'Semifinalistas': 'Semi-finalists',
  'Seré más rápido que tu mirada. ¡Parpadea y pierdes!': 'I\'m faster than your eyes. Blink and you lose!',
  'Sesión caducada: vuelve a entrar en 👤 Cuenta': 'Session expired: log in again in 👤 Account',
  'Sesión cerrada': 'Logged out',
  'Shawn Froste de Navidad': 'Christmas Shawn Froste',
  'Shawn Froste de Navidad (épico especial) de regalo': 'Christmas Shawn Froste (special epic) as a gift',
  'Shift': 'Shift',
  'Shift dcho.': 'Right Shift',
  'Si jugabas en la': 'If you used to play on the',
  'Si la nube está saturada, tu partida sigue a salvo en tu dispositivo y se sube más tarde sola.': 'If the cloud is overloaded, your save stays safe on your device and uploads later on its own.',
  'Si no eliges ahora, la tienes en 🎁 Código de regalo.': 'If you don\'t choose now, you\'ll find it in 🎁 Gift code.',
  'Siempre': 'Always',
  'Siguiente ronda: ': 'Next round: ',
  'Simulación': 'Simulation',
  'Simular 1000 tiradas en cada gacha': 'Simulate 1000 pulls on each gacha',
  'Sin balón': 'Without the ball',
  'Sin conexión: se guardará en la nube cuando vuelva internet.': 'Offline: it will be saved to the cloud when the internet is back.',
  'Sin conexión: tu partida se subirá cuando vuelva internet': 'Offline: your save will be uploaded when the internet is back',
  'Sin perder vidas:': 'Without losing a life:',
  'Sin riesgos': 'No risks',
  'Sin suplentes todavía: los fichajes temporales aparecen aquí.': 'No substitutes yet: temporary signings show up here.',
  'Sin técnica': 'No technique',
  'Sin técnicas': 'No techniques',
  'Sobre Calabaza': 'Pumpkin Pack',
  'Sobre Calabaza, partido jefe y retos': 'Pumpkin Pack, boss match and challenges',
  'Sobre Navideño': 'Christmas Pack',
  'Sobre Navideño, partido jefe y retos': 'Christmas Pack, boss match and challenges',
  'Solo jugadores villanos y de miedo, y 6 legendarios exclusivos de Halloween.': 'Only villains and spooky players, plus 6 exclusive Halloween legendaries.',
  'Sonido': 'Sound',
  'Soy una muralla. ¡Pasa si te atreves!': 'I\'m a wall. Get past me if you dare!',
  'Stick / cruceta': 'Stick / D-pad',
  'Su Majestad': 'His Majesty',
  'Su música': 'Their music',
  'Subcampeones': 'Runners-up',
  'Subcampeones del mundo': 'World Cup runners-up',
  'Sube a ': 'Goes up to ',
  'Sube una estadística a todo el equipo': 'Raises one stat for the whole team',
  'Subiendo la partida de este móvil…': 'Uploading the save from this device…',
  'Subir a Primera': 'Go up to First Division',
  'Sueños rotos': 'Broken Dreams',
  'Supertécnica': 'Special move',
  'Supertécnica de bloqueo': 'Block special move',
  'Supertécnica de portero': 'Goalkeeper special move',
  'Supertécnica de regate': 'Dribble special move',
  'Supertécnica de tiro': 'Shot special move',
  'Supertécnicas': 'Special moves',
  'Supertécnicas legendarias': 'Legendary special moves',
  'Supertécnicas más espectaculares: unas 70 técnicas tienen ahora su propia animación (tiros, paradas, regates y bloqueos).': 'Flashier special moves: about 70 moves now have their own animation (shots, saves, dribbles and blocks).',
  'Sustituye a': 'Replaces',
  'Suya': 'Theirs',
  'S{0}': 'W{0}',
  'Sí': 'Yes',
  'Tamaño de los botones (móvil)': 'Button size (mobile)',
  'También:': 'Also:',
  'Tarde de partidos': 'Match afternoon',
  'Te han nombrado seleccionador de Inazuma Japón: convoca a los mejores de las ligas.': 'You\'ve been named Inazuma Japan coach: call up the best players from the leagues.',
  'Team D, Dark Angel, Demons Z y el Ogro: los villanos del 3.': 'Team D, Dark Angel, Demons Z and the Ogre: the villains of 3.',
  'Teclas como de serie': 'Default keys restored',
  'Teclas del ordenador': 'Computer keys',
  'Tema de partido (P15)': 'Match theme (P15)',
  'Tema épico': 'Epic Theme',
  'Temporada': 'Season',
  'Temporada ': 'Season ',
  'Temporadas:': 'Seasons:',
  'Tensión': 'Tension',
  'Tercera': 'Third',
  'Tercera División': 'Third Division',
  'Tercera: los 3 últimos pierden fama': 'Third: the bottom 3 lose fame',
  'Termina el Mundial para volver al club': 'Finish the World Cup to return to the club',
  'Terminar temporada': 'Finish season',
  'Terreno sagrado': 'Sacred Ground',
  'Tickets ardientes': 'Burning tickets',
  'Tickets: Historia (1 por victoria y 3 al completarla), Especiales (2), Cadenas (2 al completarlas) e Infinito (2 por oleada especial).': 'Tickets: Story (1 per win and 3 for completing it), Specials (2), Chains (2 for completing them) and Infinite (2 per special wave).',
  'Tiempos difíciles': 'Hard Times',
  'Tienes las teclas clásicas (puedes cambiarlas en Ajustes → Controles).': 'You have the classic keys (change them in Settings → Controls).',
  'Tienes las teclas nuevas (puedes cambiarlas en Ajustes → Controles).': 'You have the new keys (change them in Settings → Controls).',
  'Tienes tus teclas «A tu gusto» (puedes cambiarlas en Ajustes → Controles).': 'You\'re using your Custom keys (you can change them in Settings → Controls).',
  'Tirada de bienvenida': 'Welcome pull',
  'Tirada de bienvenida ×10': 'Welcome pull ×10',
  'Tirar ×1': 'Pull ×1',
  'Tirar ×10': 'Pull ×10',
  'Tiro': 'Shot',
  'Tiro / Entrada': 'Shoot / Tackle',
  'Tiro / despeje': 'Shot / clearance',
  'Tiro cargado a tope (barra llena) = tiro mucho más fuerte.': 'Fully charged shot (full bar) = a much stronger shot.',
  'Tiro+': 'Shot+',
  'Toca cada cápsula para abrirla': 'Tap each capsule to open it',
  'Toca la cápsula para abrirla': 'Tap the capsule to open it',
  'Toca para continuar': 'Tap to continue',
  'Toca para empezar': 'Tap to start',
  'Toca para equipar': 'Tap to equip',
  'Toca una acción y pulsa la tecla que quieras (Esc cancela).': 'Tap an action and press the key you want (Esc cancels).',
  'Todas las técnicas': 'All techniques',
  'Todas las técnicas legendarias': 'All legendary techniques',
  'Todos': 'All',
  'Todos a 5 ★': 'Everyone to 5 ★',
  'Todos con 5 estrellas': 'Everyone with 5 stars',
  'Todos los jugadores': 'All players',
  'Todos los países': 'All countries',
  'Todos los puestos': 'All positions',
  'Torch (versión del Infinito)': 'Torch (Infinite version)',
  'Torneo internacional': 'International tournament',
  'Trae tu partida aquí': 'Bring your save here',
  'Traer mi partida': 'Bring my save',
  'Tres Rayos Raimon': 'Three Raimon Bolts',
  'Tres tiradas épicas o mejores': 'Three epic-or-better pulls',
  'Truco o trato': 'Trick or Treat',
  'Trucos': 'Tips',
  'Tu carrera se ha adaptado a las ligas de 10 equipos: la temporada actual empieza de nuevo (conservas plantilla, fama y dinero).': 'Your career has been adapted to 10-team leagues: the current season starts again (you keep your squad, fame and money).',
  'Tu club': 'Your club',
  'Tu club está eliminado.': 'Your club is knocked out.',
  'Tu cuenta': 'Your account',
  'Tu equipación': 'Your kit',
  'Tu equipo': 'Your team',
  'Tu equipo ·': 'Your team ·',
  'Tu navegador no deja pegar con el botón: mantén el dedo en el recuadro y elige «Pegar».': 'Your browser won\'t paste with the button: press and hold the box and choose «Paste».',
  'Tu partida (plantilla, gacha, Historia, Carrera y la partida en curso) se guarda': 'Your save (squad, gacha, Story, Career and the current run) is saved',
  'Tu partida ha cambiado en otro dispositivo. Elige cuál conservar en 👤 Cuenta.': 'Your save has changed on another device. Choose which one to keep in 👤 Account.',
  'Tu partida solo se guardará en este móvil': 'Your save will only be kept on this device',
  'Tu plantilla': 'Your squad',
  'Tu plantilla empieza vacía. Haz tu tirada de bienvenida:': 'Your squad starts empty. Do your welcome pull:',
  'Tu plantilla está llena (máximo ': 'Your squad is full (maximum ',
  'Tu portero la atrapa': 'Your goalkeeper catches it',
  'Tu portero tiene el balón: pasa (J) o despeja (L)': 'Your goalkeeper has the ball: pass (J) or clear (L)',
  'Tu progreso actual se pasará a la cuenta.': 'Your current progress will be moved to the account.',
  'Tu sesión se ha cerrado. Entra otra vez para seguir guardando en la nube.': 'You\'ve been logged out. Log in again to keep saving to the cloud.',
  'Tu sesión se ha cerrado. Vuelve a entrar para seguir guardando en la nube.': 'You\'ve been logged out. Log in again to keep saving to the cloud.',
  'Tus carreras de mánager: las terminadas, las abandonadas y la que llevas ahora.': 'Your manager careers: finished, abandoned and the one you\'re playing now.',
  'Tus ojeadores han encontrado': 'Your scouts have found',
  'T{0}': 'S{0}',
  'T{0} S{1}': 'S{0} W{1}',
  'Táctica': 'Tactics',
  'Técnica': 'Technique',
  'Técnica: ': 'Technique: ',
  'Técnicas': 'Techniques',
  'Técnicas (': 'Techniques (',
  'Técnicas de Bai Long': 'Bai Long\'s techniques',
  'Técnicas equipadas': 'Equipped techniques',
  'Técnicas legendarias que has sacado en el gacha. Las puede equipar cualquier jugador de su elemento desde su ficha.': 'Legendary techniques you\'ve pulled from the gacha. Any player of their element can equip them from their profile.',
  'Técnicas · ': 'Techniques · ',
  'Título · Inazuma Eleven': 'Title · Inazuma Eleven',
  'Título · Inazuma Eleven 2': 'Title · Inazuma Eleven 2',
  'Títulos:': 'Titles:',
  'Tú': 'You',
  'Ultratécnica': 'Ultra Technique',
  'Un equipo de cada elemento: viento, bosque, fuego y montaña.': 'One team of each element: wind, wood, fire and mountain.',
  'Un fan game de Inazuma Eleven': 'An Inazuma Eleven fan game',
  'Un solo partido, sin segundas oportunidades. Si ganas,': 'A single match, no second chances. If you win,',
  'Un solo partido, sin segundas oportunidades. Si ganas, te llevas a su estrella para tu plantilla (o una estrella más si ya la tienes).': 'A single match, no second chances. If you win, you take their star for your squad (or one more star if you already have them).',
  'Una tirada legendaria asegurada': 'One guaranteed legendary pull',
  'Usa solo letras sin tildes, números y guion bajo (_). Sin espacios ni ñ.': 'Use only letters without accents, numbers and underscores (_). No spaces or ñ.',
  'Usuario': 'Username',
  'Usuario o contraseña incorrectos.': 'Wrong username or password.',
  'Vacía': 'Empty',
  'Vacío': 'Empty',
  'Valor de mercado aproximado:': 'Approximate market value:',
  'Varios partidos seguidos': 'Several matches in a row',
  'Varios partidos seguidos sin recuperar vidas.': 'Several matches in a row without recovering lives.',
  'Velocidad del juego': 'Game speed',
  'Vender': 'Sell',
  'Vender ·': 'Sell ·',
  'Vender: un club paga el 70 % de su valor. Liberar: se va gratis (para hacer hueco). Mínimo': 'Sell: a club pays 70% of their value. Release: they leave for free (to make room). Minimum',
  'Ver el gacha limitado': 'See the limited gacha',
  'Ver resumen': 'See summary',
  'Ver técnicas del equipo': 'See team techniques',
  'Versión jefe · campo nevado': 'Boss version · snowy pitch',
  'Versión jefe · campo nocturno con niebla': 'Boss version · foggy night pitch',
  'Victoria': 'Win',
  'Victoria de ultratumba': 'Victory from beyond the grave',
  'Victoria navideña': 'Christmas victory',
  'Victorias:': 'Wins:',
  'Viento': 'Wind',
  'Villanos': 'Villains',
  'Volver': 'Back',
  'Volver a Halloween': 'Back to Halloween',
  'Volver a Navidad': 'Back to Christmas',
  'Volver a la del Raimon': 'Back to the Raimon kit',
  'Volver a la música de serie': 'Back to the default music',
  'Volver a las de serie': 'Back to default',
  'Volver al club': 'Back to the club',
  'Vuelve a esta pestaña y toca': 'Come back to this tab and tap',
  'Vuelve mañana a por el siguiente premio.': 'Come back tomorrow for the next prize.',
  'WASD o flechas para moverte · Shift esprint · J o Z: pase (mantén = fuerte) / entrada · K o C: saque largo (portero) · L o X: tiro (mantén) / despeje · I o V: regate · Q: cambiar jugador · Espacio: supertécnica · U: cambiar técnica · P o Esc: pausa': 'WASD or arrows to move · Shift sprint · J or Z: pass (hold = strong) / tackle · K or C: long kick (goalkeeper) · L or X: shoot (hold) / clearance · I or V: dribble · Q: switch player · Space: special move · U: change technique · P or Esc: pause',
  'WASD o flechas para moverte · Shift esprint · J o Z: pase (mantén = fuerte) / entrada · K o X: tiro (mantén) / cambiar jugador · L o C: saque largo (portero) · I o V: regate · Espacio: supertécnica · E: cambiar técnica · P o Esc: pausa': 'WASD or arrows to move · Shift sprint · J or Z: pass (hold = strong) / tackle · K or X: shoot (hold) / switch player · L or C: long kick (goalkeeper) · I or V: dribble · Space: special move · E: change technique · P or Esc: pause',
  'Ya canjeaste este código': 'You\'ve already redeemed this code',
  'Ya está al máximo.': 'Already maxed out.',
  'Ya está en tu club': 'Already in your club',
  'Ya hay una cuenta con ese correo de otra forma.': 'There\'s already an account with that email using another login method.',
  'Ya tengo cuenta': 'I have an account',
  'Ya tiene 5 estrellas': 'Already has 5 stars',
  'Ya tienes 10: quita uno antes': 'You already have 10: remove one first',
  'Ya veremos quién se ríe al final.': 'We\'ll see who\'s laughing at the end.',
  'Zeus, Ultra Zeus y Génesis: lo más duro del 1 y del 2.': 'Zeus, Ultra Zeus and Genesis: the toughest of 1 and 2.',
  'Zeus, la Academia Alius, los Emperadores Oscuros, el Ogro, Team D y los demonios': 'Zeus, the Alius Academy, the Dark Emperors, the Ogre, Team D and the demons',
  'Zona residencial - Una promesa solemne': 'Residential Area - A Solemn Promise',
  'a todo el equipo)': 'for the whole team)',
  'a todo el equipo.': 'for the whole team.',
  'abiertos': 'unlocked',
  'al compañero que antes llega al balón (pulsa otra vez para el siguiente)': 'to the teammate who reaches the ball first (press again for the next one)',
  'aprende': 'learns',
  'aprende en el juego (': 'learns in the game (',
  'ascenso ·': 'promotion ·',
  'balón': 'ball',
  'cambiar de jugador': 'switch player',
  'cambiar técnica': 'switch technique',
  'cambiar ·': 'switch ·',
  'caramelos de Halloween': 'Halloween candies',
  'caramelos, retos y regalo': 'candies, challenges and gift',
  'como mánager': 'as manager',
  'como seleccionador': 'as coach',
  'comunes ·': 'common ·',
  'con': 'with',
  'con 7 chavales normales.': 'with 7 ordinary kids.',
  'con este botón.': 'with this button.',
  'con las que empieza cada partida · toca un hueco y elige': 'they start every match with · tap a slot and choose',
  'copos de Navidad': 'Christmas snowflakes',
  'copos, retos y regalo': 'snowflakes, challenges and gift',
  'cualquier jugador': 'any player',
  'cuenta': 'account',
  'cuenta sobre todo al simular': 'matters most when simulating',
  'de': 'of',
  'de 10). Los repetidos suben una estrella (máx.': 'of 10). Duplicates add one star (max.',
  'de 3': 'of 3',
  'de 9': 'of 9',
  'de la cantera': 'from the academy',
  'de un club de instituto a punto de desaparecer. Empiezas en': 'of a school club about to disappear. You start in the',
  'deja el club y entra': 'leaves the club and in comes',
  'deja el club.': 'leaves the club.',
  'del juego (o en otro móvil sin cuenta), sigue estos pasos para traer tu partida aquí.': 'of the game (or on another device without an account), follow these steps to bring your save here.',
  'del juego, con un': 'from the game, with a',
  'desbloquea a Ray Dark': 'unlocks Ray Dark',
  'descenso': 'relegation',
  'despeje': 'clearance',
  'despeje ·': 'clearance ·',
  'después juegas el partido': 'then you play the match',
  'destaca (+1': 'stands out (+1',
  'días': 'days',
  'ej.: fran_10': 'e.g.: fran_10',
  'el Mundial': 'the World Cup',
  'el equipo especial Caos y la Etapa 3.': 'the special team Chaos and Stage 3.',
  'el portero': 'the goalkeeper',
  'elegir otra supertécnica': 'pick another special move',
  'elige 1 de {0} jugadores': 'pick 1 of {0} players',
  'elige cuál conservar': 'choose which one to keep',
  'eliminados…': 'knocked out…',
  'empezar de cero': 'start from scratch',
  'en': 'at',
  'en casa': 'at home',
  'en curso': 'in progress',
  'en la nube cada vez que cambia. En otro móvil u ordenador, entra con tu usuario y contraseña y la tendrás igual.': 'to the cloud every time it changes. On another phone or computer, log in with your username and password and you\'ll have it just the same.',
  'en todas sus stats': 'on all their stats',
  'entrada': 'tackle',
  'entrada ·': 'tackle ·',
  'entrar, pero la plantilla está llena: ahora eliges si haces hueco.': 'join, but the squad is full: now you choose whether to make room.',
  'equipos rivales': 'rival teams',
  'esprint': 'sprint',
  'esprint ·': 'sprint ·',
  'ficha por': 'signs for',
  'flechas': 'arrows',
  'fuera del país': 'abroad',
  'goles': 'goals',
  'gradúan al acabar 6º curso': 'graduate at the end of 6th year',
  'incompleto o roto': 'incomplete or broken',
  'joystick a la izquierda (más allá del aro = esprint). Mantén Pase para un pase fuerte y usa Regate para un recorte rápido sin técnica. Cambiar te pasa al compañero que antes llega al balón (también cambia solo al ir a por el balón).': 'joystick on the left (past the ring = sprint). Hold Pass for a strong pass and use Dribble for a quick move without a technique. Switch takes you to the teammate who reaches the ball first (it also switches automatically when going for the ball).',
  'jugadores': 'players',
  'jugadores en el gacha ·': 'players in the gacha ·',
  'jugadores ·': 'players ·',
  'jugadores · 🎟️': 'players · 🎟️',
  'jugadores.': 'players.',
  'jugadores. Míralos en Fichajes → Ojeados (baratos, pero solo durante 3 semanas).': 'players. See them in Transfers → Scouted (cheap, but only for 3 weeks).',
  'la Etapa 2, Cadenas, Infinito y nuevos equipos especiales.': 'Stage 2, Chains, Infinite and new special teams.',
  'la Fase 2 de la Etapa 3: el Mundial.': 'Phase 2 of Stage 3: the World Cup.',
  'la cadena «El lado oscuro».': 'the chain «The Dark Side».',
  'la llevan tus jugadores de campo en todos los modos (menos en la Carrera)': 'worn by your outfield players in every mode (except Career)',
  'la próxima tirada': 'the next pull',
  'la temporada empieza de nuevo': 'the season starts again',
  'las': 'the',
  'las próximas 10 tiradas': 'the next 10 pulls',
  'legendarias) ·': 'legendary) ·',
  'legendarios ·': 'legendary ·',
  'llena': 'full',
  'm/s · z': 'm/s · z',
  'mantén': 'hold',
  'mantén para cargar, suelta para chutar (un toque = tiro rápido)': 'hold to charge, release to shoot (a tap = quick shot)',
  'media': 'rating',
  'monedas': 'coins',
  'mover': 'move',
  'mover por el área ·': 'move around the box ·',
  'mover y apuntar': 'move and aim',
  'mover ·': 'move ·',
  'mánager': 'manager',
  'máx. ': 'max. ',
  'mínimo 6 caracteres': 'at least 6 characters',
  'nivel': 'level',
  'no quiere seguir negociando esta semana.': 'doesn\'t want to keep negotiating this week.',
  'no se puede recuperar': 'it can\'t be recovered',
  'normal, con Nelly': 'normal, with Nelly',
  'o con usuario y contraseña': 'or with username and password',
  'ocupas su sitio y sus jugadores': 'you take its place and its players',
  'para': 'for',
  'para el gacha.': 'for the gacha.',
  'para guardar en la nube.': 'to save to the cloud.',
  'para no perderla.': 'so you don\'t lose it.',
  'para ti': 'for you',
  'partidos en la Etapa 1': 'matches in Stage 1',
  'partidos ·': 'matches ·',
  'pase (mantén = fuerte)': 'pass (hold = strong)',
  'pase (mantén = fuerte) ·': 'pass (hold = strong) ·',
  'pausa': 'pause',
  'pide': 'asks for',
  'playoff': 'playoff',
  'playoff ·': 'playoff ·',
  'por': 'for',
  'por jugar': 'for playing',
  'por la tercera plaza; los 3 últimos bajan. Ficha jugadores, mejora el club y gana la': 'for the third spot; the bottom 3 go down. Sign players, upgrade the club and win the',
  'portero asegurado': 'guaranteed goalkeeper',
  'quiere unirse a tu club!': 'wants to join your club!',
  'rara': 'rare',
  'raras ·': 'rare ·',
  'rechaza la oferta: es demasiado poco.': 'turns down the offer: it\'s far too little.',
  'recorte rápido sin técnica': 'quick cut without a special move',
  'regate': 'dribble',
  'regate ·': 'dribble ·',
  'robar el balón': 'win the ball',
  'roguelite': 'roguelite',
  'saque largo': 'long kick',
  'saque largo ·': 'long kick ·',
  'se cansa y cierra la negociación hasta la semana que viene.': 'gets fed up and closes the negotiation until next week.',
  'se podrá elegir como mánager en el Modo Carrera, con': 'can be picked as manager in Career Mode, with',
  'se renuevan cada medianoche': 'they reset every midnight',
  'se va al': 'moves to',
  'se vaya a otro instituto': 'go to another school',
  'según su rendimiento. Los jugadores se': 'depending on how they play. Players',
  'semana': 'week',
  'si la olvidas. Con Google no hay contraseña que recordar.': 'if you forget it. With Google there\'s no password to remember.',
  'simula lo que queda': 'simulate the rest',
  'sin recuperar vidas': 'without recovering lives',
  'sin técnicas': 'no techniques',
  'sola': 'automatically',
  'solo en este navegador': 'only in this browser',
  'stick o cruceta para moverte · RT esprint · A pase (mantén = fuerte) / entrada · X tiro (mantén) · B saque largo (portero) · Y supertécnica · LT cambiar técnica · RB regate · LB cambiar jugador · Start pausa.': 'stick or D-pad to move · RT sprint · A pass (hold = strong) / tackle · X shoot (hold) · B long kick (goalkeeper) · Y special move · LT change technique · RB dribble · LB switch player · Start pause.',
  'su estrella se une a tu plantilla': 'their star joins your squad',
  'suben o bajan': 'go up or down',
  'supertécnica': 'special move',
  'supertécnica de bloqueo': 'block special move',
  'supertécnica de tiro o regate': 'shot or dribble special move',
  'temas del Inazuma 1 y 2': 'themes from Inazuma 1 and 2',
  'temporadas · mejor división:': 'seasons · best division:',
  'temporal': 'temp',
  'ticket': 'ticket',
  'tickets': 'tickets',
  'tickets para el gacha por tus logros de la temporada': 'tickets for the gacha for your achievements this season',
  'tiene una partida en la nube distinta de la de este móvil. Elige con cuál sigues. La otra se guarda como copia en este móvil (Cuenta → Opciones avanzadas), así que no se pierde.': 'has a save in the cloud that\'s different from the one on this device. Choose which one to continue with. The other one is kept as a copy on this device (Account → Advanced options), so nothing is lost.',
  'tiradas (llevas': 'pulls (you\'re at',
  'tiradas sin él (llevas': 'pulls without him (you have',
  'tiro (mantén para cargar)': 'shoot (hold to charge)',
  'tiro (mantén) ·': 'shot (hold) ·',
  'titular': 'starter',
  'toca para cambiar': 'tap to change',
  'toca para oír cada pista': 'tap to hear each track',
  'toca un jugador para ponerlo': 'tap a player to put them in',
  'toca un jugador para ponerlo; toca otro puesto del campo para cambiarlo': 'tap a player to put them in; tap another position on the pitch to change it',
  'toca un puesto y luego un suplente (u otro puesto) para cambiarlos': 'tap a position and then a substitute (or another position) to swap them',
  'toque = pase · mantén = pase fuerte': 'tap = pass · hold = strong pass',
  'tus teclas están justo encima (Esc también pausa).': 'your keys are just above (Esc also pauses).',
  'técnica legendaria': 'legendary technique',
  'técnicas': 'techniques',
  'técnicas (': 'techniques (',
  'técnicas para los partidos. Solo puedes usar las que': 'techniques for matches. You can only use the ones',
  'técnicas)': 'techniques)',
  'tú controlas': 'you control',
  'una técnica legendaria y 10 🎟️ más.': 'a legendary technique and 10 more 🎟️.',
  'valor aprox. ': 'approx. value ',
  'vendido al': 'sold to',
  'verlo fuera de fechas': 'see it outside its dates',
  'versión antigua': 'old version',
  'vuelve a entrar': 'log in again',
  'y': 'and',
  'y al menos uno épico o mejor. Además recibes 60 monedas para entrenar.': 'and at least one epic or better. You also get 60 coins for training.',
  'y es un texto largo.': 'and it\'s a long text.',
  'y la cantera trae chavales nuevos. Cuida la fama: si llega a 0, cierran el club. Cada 3 temporadas,': 'and the academy brings new kids. Look after your fame: if it reaches 0, they close the club. Every 3 seasons,',
  'y pasa la semana': 'and the week goes by',
  'y recibir el regalo especial': 'and receive the special gift',
  'ya lo tienes (+1 ★)': 'you already have him (+1 ★)',
  '{0} tirada legendaria': '{0} legendary pull',
  '{0}º curso': 'Year {0}',
  '¡': '!',
  '¡5 goles de diferencia! Partido ganado': '5-goal lead! Match won',
  '¡A jugar!': 'Let\'s play!',
  '¡A la final!': 'Into the final!',
  '¡Allá va mi técnica!': 'Here comes my technique!',
  '¡Aquí me quedo yo!': 'This is where I stand!',
  '¡Aquí no pasa nada!': 'Nothing gets through here!',
  '¡Arde, balón, arde!': 'Burn, ball, burn!',
  '¡Así se hace, equipo!': 'That\'s how it\'s done, team!',
  '¡Balón recuperado!': 'Ball won back!',
  '¡Bienvenido!': 'Welcome!',
  '¡Bloqueo!': 'Block!',
  '¡Cadena completada!': 'Chain completed!',
  '¡Campeones de Copa!': 'Cup champions!',
  '¡Campeones de Primera División!': 'First Division champions!',
  '¡Campeones de la Copa Inazuma!': 'Inazuma Cup champions!',
  '¡Campeones del mundo!': 'World champions!',
  '¡Casi, pero no!': 'Close, but no!',
  '¡Con todas mis fuerzas!': 'With all my strength!',
  '¡Corre, balón, corre!': 'Run, ball, run!',
  '¡Crece, mi técnica!': 'Grow, my technique!',
  '¡Cuenta creada! Tu partida ya se guarda en la nube.': 'Account created! Your save is now stored in the cloud.',
  '¡Código canjeado!': 'Code redeemed!',
  '¡Código canjeado! ': 'Code redeemed! ',
  '¡Demasiado fácil!': 'Too easy!',
  '¡Entendido!': 'Got it!',
  '¡Entrada!': 'Tackle!',
  '¡Eso quería oír! Vamos a jugar.': 'That\'s what I wanted to hear! Let\'s play.',
  '¡Esta es la buena!': 'This is the one!',
  '¡Esto es solo el principio!': 'This is only the beginning!',
  '¡Esto pesa mucho!': 'This one\'s heavy!',
  '¡Está parado!': 'Saved!',
  '¡Etapa completada!': 'Stage completed!',
  '¡FINAL!': 'THE FINAL!',
  '¡Firme como una roca!': 'Solid as a rock!',
  '¡Fuera de juego!': 'Offside!',
  '¡GOOOL! ¡Lo hemos conseguido!': 'GOOOAL! We did it!',
  '¡Gol': 'Goal',
  '¡Gol de oro!': 'Golden goal!',
  '¡Gol!': 'Goal!',
  '¡Gracias por unirte! +10 tickets 🎟️': 'Thanks for joining! +10 tickets 🎟️',
  '¡Hacia el infinito!': 'To infinity!',
  '¡Has vencido al Alpino!': 'You beat Alpine!',
  '¡Has vencido al Ocultismo!': 'You beat Occult!',
  '¡Hola, ': 'Hi, ',
  '¡La fuerza del bosque!': 'The power of the forest!',
  '¡La técnica supera al portero!': 'The technique beats the goalkeeper!',
  '¡Llega el Inazuma 3!': 'Inazuma 3 is here!',
  '¡Llega el Mundial!': 'The World Cup is here!',
  '¡Lo paro, lo paro!': 'I\'ve got it, I\'ve got it!',
  '¡Mejor suerte la próxima!': 'Better luck next time!',
  '¡Mi portería es sagrada!': 'My goal is sacred!',
  '¡Más rápido que el viento!': 'Faster than the wind!',
  '¡NUEVO JUGADOR!': 'NEW PLAYER!',
  '¡NUEVO!': 'NEW!',
  '¡Ni lo verás pasar!': 'You won\'t even see it pass!',
  '¡No pasarás!': 'You shall not pass!',
  '¡No podrás ni tocar el balón!': 'You won\'t even touch the ball!',
  '¡Nos vemos en el campo!': 'See you on the pitch!',
  '¡Nueva versión!': 'New version!',
  '¡Nuevos jugadores!': 'New players!',
  '¡Os lo dije!': 'I told you so!',
  '¡Para el portero rival!': 'The rival goalkeeper stops it!',
  '¡Parada!': 'Save!',
  '¡Paradón!': 'Great save!',
  '¡Partida cargada! Reiniciando…': 'Save loaded! Restarting…',
  '¡Partida traída!': 'Save brought over!',
  '¡Partida traída! Cargando…': 'Save brought over! Loading…',
  '¡Partida traída! Crea una cuenta en 👤 Cuenta para tenerla siempre a salvo': 'Save brought over! Create an account in 👤 Account to keep it safe forever',
  '¡Pasáis a semifinales!': 'Through to the semi-finals!',
  '¡Por aquí no pasa nadie!': 'Nobody gets past me!',
  '¡Premio del día {0}!': 'Day {0} prize!',
  '¡Que tiemble el suelo!': 'Let the ground shake!',
  '¡Ray Dark desbloqueado como mánager!': 'Ray Dark unlocked as manager!',
  '¡Raíces, sostenedme!': 'Roots, hold me up!',
  '¡Regalo de Navidad!': 'Christmas gift!',
  '¡Regate!': 'Dribble!',
  '¡Robo!': 'Stolen!',
  '¡Se une a tu plantilla!': 'Joins your squad!',
  '¡Siente mi fuego!': 'Feel my fire!',
  '¡Supertécnicas nuevas! ': 'New special moves! ',
  '¡Todo mi calor en este tiro!': 'All my heat in this shot!',
  '¡Tranquilos, lo tengo!': 'Relax, I\'ve got it!',
  '¡Tu tiro no me asusta!': 'Your shot doesn\'t scare me!',
  '¡TÉCNICA NUEVA!': 'NEW TECHNIQUE!',
  '¡Uno menos para vosotros!': 'One more against you!',
  '¡Uno más para nosotros!': 'One more for us!',
  '¡Vamos allá!': 'Let\'s go!',
  '¡Vas a quemarte antes del descanso!': 'You\'ll burn out before halftime!',
  '¡Victoria!': 'Victory!',
  '¡Ya están todas abiertas!': 'They\'re all open!',
  '¡oleada especial!': 'special wave!',
  '¡pasáis!': 'you\'re through!',
  '¡premio del jefe!': 'boss prize!',
  '¡tu club!': 'your club!',
  '¡Último día!': 'Last day!',
  '«Saque largo» solo sale con el portero: está debajo de «Regate», mueve Regate para verlo.': '"Long kick" only appears with the goalkeeper: it is under "Dribble", move Dribble to see it.',
  '· Etapas completadas:': '· Stages completed:',
  '· Premio:': '· Prize:',
  '· Rapidez': '· Speed',
  '· Taquilla +': '· Gate +',
  '· Temporada': '· Season',
  '· Tiro': '· Shot',
  '· Títulos:': '· Titles:',
  '· a partido único, con penaltis': '· single match, with penalties',
  '· eres el seleccionador': '· you\'re the coach',
  '· fama': '· fame',
  '· fan game gratuito y no oficial. Inazuma Eleven es de Level-5.': '· free, unofficial fan game. Inazuma Eleven belongs to Level-5.',
  '· forma': '· form',
  '· formación': '· formation',
  '· guardando en la nube…': '· saving to the cloud…',
  '· hay dos versiones de tu partida:': '· there are two versions of your save:',
  '· media': '· rating',
  '· mánager': '· manager',
  '· nota aquí': '· rating here',
  '· plantilla': '· squad',
  '· potencia': '· power',
  '· premio +': '· prize +',
  '· rival': '· rival',
  '· récord': '· record',
  '· sesión caducada:': '· session expired:',
  '· sin conexión: se guardará en la nube al volver internet.': '· offline: it will be saved to the cloud when the internet is back.',
  '· temporada': '· season',
  '· toca un puesto del campo y luego a un convocado.': '· tap a position on the pitch and then a called-up player.',
  '· tu media': '· your rating',
  '· valor': '· value',
  '· velocidad': '· speed',
  '· ☁️ guardado en la nube': '· ☁️ saved to the cloud',
  '¿Así que tú eres mi rival? ¡Será divertido!': 'So you\'re my opponent? This will be fun!',
  '¿Crees que puedes apagar mi fuego? ¡Inténtalo!': 'Think you can put my fire out? Try it!',
  '¿Eso es todo lo que tenéis?': 'Is that all you\'ve got?',
  '¿Jugabas en la versión antigua?': 'Did you play the old version?',
  '¿Preparado?': 'Ready?',
  '¿Qué entrenáis esta semana? (+': 'What are you training this week? (+',
  '¿Qué partida conservas?': 'Which save do you keep?',
  '¿Seguro?': 'Sure?',
  '¿Seguro? Toca otra vez': 'Sure? Tap again',
  '¿Seguro? Toca otra vez para abandonar': 'Sure? Tap again to abandon',
  '¿Seguro? Toca otra vez para borrarla': 'Sure? Tap again to delete it',
  'Ábrelo en el otro dispositivo y se carga solo': 'Open it on the other device and it loads by itself',
  'Épica': 'Epic',
  'Épica asegurada': 'Guaranteed epic',
  'Épica o mejor asegurada cada 10 tiradas (llevas': 'Epic or better guaranteed every 10 pulls (you\'re on',
  'Épsilon - Ira infernal': 'Epsilon - Infernal Wrath',
  '×5 con medalla de oro': '×5 with a gold medal',
  'épicas ·': 'epic ·',
  '… pero si la fama llega a 0, cierran el club.': '… but if fame reaches 0, they close the club.',
  '∞ Al ganar a cada jefe eliges una versión especial de un jugador (del 2, del 3…) que no sale en el gacha: cuanto más lejos llegues, más rara.': '∞ Beat each boss to choose a special version of a player (from IE2, IE3…) that isn\'t in the gacha: the further you go, the rarer it gets.',
  '∞ Infinito: al ganar a cada jefe eliges 1 de 3 versiones especiales de jugadores que no salen en el gacha (del 2, del 3…). Cuanto más lejos llegues, más raras. Llevan su propio marco ∞.': '∞ Endless: beat each boss to choose 1 of 3 special versions of players that aren\'t in the gacha (from IE2, IE3…). The further you go, the rarer they get. They have their own ∞ frame.',
  '⌨️ Ordenador': '⌨️ Computer',
  '▶ Ir a la web oficial': '▶ Go to the official website',
  '▶ Ver la intro': '▶ Watch the intro',
  '☁️ Guardar ahora': '☁️ Save now',
  '☁️ La de la nube': '☁️ The cloud one',
  '♥ −1 vida': '♥ −1 life',
  '⚠️ Cargar sustituye la partida que tienes ahora en este dispositivo.': '⚠️ Loading replaces the save you have on this device now.',
  '⚡ Cadena completada: ¡Rayo Raimon!': '⚡ Chain completed: Raimon Bolt!',
  '⚡ Los 10 mejores': '⚡ The best 10',
  '⚡ Mejor equipo': '⚡ Best team',
  '⚡ Mejores 5': '⚡ Best 5',
  '⚡ Rayo Raimon · 5 🎟️ · 150 🪙 · la estrella del último rival se une a tu plantilla (o sube una ★).': '⚡ Raimon Bolt · 5 🎟️ · 150 🪙 · the last rival\'s star joins your squad (or gets one more ★).',
  '⚡ Usar Rayo Raimon': '⚡ Use Raimon Bolt',
  '⚡ ¡5 victorias más: ganas un Rayo Raimon!': '⚡ 5 more wins: you earn a Raimon Bolt!',
  '⚡ ¡Has ganado un Rayo Raimon!': '⚡ You\'ve earned a Raimon Bolt!',
  '⚽ Jugar': '⚽ Play',
  '✅ Equipada': '✅ Equipped',
  '✅ Partida encontrada': '✅ Save found',
  '✓ Ray Dark ya es mánager en el Modo Carrera (+10 % de ingresos).': '✓ Ray Dark is now a Career Mode manager (+10% income).',
  '✓ Ya has recibido a Shawn Froste de Navidad.': '✓ You\'ve already received Christmas Shawn Froste.',
  '❓ Cómo funciona': '❓ How it works',
  '⬆️ A Primera:': '⬆️ To First:',
  '⬆️ A Segunda:': '⬆️ To Second:',
  '⬆️ ¡Ascenso a': '⬆️ Promoted to',
  '⬇️ A Segunda:': '⬇️ To Second:',
  '⬇️ A Tercera:': '⬇️ To Third:',
  '⬇️ Descenso a': '⬇️ Relegated to',
  '⭐ Oportunidad de la semana': '⭐ Opportunity of the week',
  '🌍 El Mundial': '🌍 The World Cup',
  '🌍 Empezar el Mundial': '🌍 Start the World Cup',
  '🌍 Fuera': '🌍 Abroad',
  '🌍 Fuera del país · ': '🌍 Abroad · ',
  '🌐 Idioma · Language': '🌐 Idioma · Language',
  '🌱 Llega un juvenil': '🌱 A youngster arrives',
  '🌱 Llegan de la cantera:': '🌱 New from the academy:',
  '🎁 Código de regalo': '🎁 Gift code',
  '🎁 Recoger el premio del día {0}': '🎁 Claim the day {0} prize',
  '🎁 Regalo diario:': '🎁 Daily gift:',
  '🎁 regalo': '🎁 gift',
  '🎃 Evento forzado: NO': '🎃 Event forced: NO',
  '🎃 Evento forzado: SÍ': '🎃 Event forced: YES',
  '🎄 Evento forzado: NO': '🎄 Event forced: NO',
  '🎄 Evento forzado: SÍ': '🎄 Event forced: YES',
  '🎓 Se gradúan ({0}):': '🎓 Graduating ({0}):',
  '🎟️ para el gacha': '🎟️ for the gacha',
  '🎨 Muñecos del Inazuma 3 arreglados: todos llevan su muñeco de verdad, sacado del juego original (peinado, colores y tono de piel), y ahora cambian a los colores de su equipo.': '🎨 Inazuma Eleven 3 sprites fixed: every player now has their real sprite from the original game (hairstyle, colours and skin tone), and they now change to their team\'s colours.',
  '🎨 ¡Muñecos del Inazuma 3 arreglados!': '🎨 Inazuma Eleven 3 sprites fixed!',
  '🎮 Guía de controles': '🎮 Controls guide',
  '🎮 Mando': '🎮 Controller',
  '🎮 Mando conectado: ': '🎮 Controller connected: ',
  '🎮 También puedes jugar con mando': '🎮 You can also play with a controller',
  '🎮 ¿Tienes mando? Conéctalo y juega: Xbox, PlayStation o genérico.': '🎮 Got a controller? Plug it in and play: Xbox, PlayStation or generic.',
  '🎵 Música': '🎵 Music',
  '🏆 Campeón:': '🏆 Champion:',
  '🏆 Copa': '🏆 Cup',
  '🏆 Copa Inazuma:': '🏆 Inazuma Cup:',
  '🏆 Copa ·': '🏆 Cup ·',
  '🏆 ¡Campeones de': '🏆 Champions of',
  '🏆 ¡Campeones del mundo!': '🏆 World champions!',
  '🏛️ Salón de la fama': '🏛️ Hall of fame',
  '🏟️ Club': '🏟️ Club',
  '👕 ¡Crea tu equipación! En Plantilla → Mi equipo eliges los colores y el diseño (rayas, mitades, banda, cuadros…). En la Carrera también hay diseños nuevos.': '👕 Create your own kit! In Squad → My team you choose the colours and the design (stripes, halves, band, checks…). Career mode gets the new designs too.',
  '👤 Cuenta': '👤 Account',
  '👥 Alineación (': '👥 Line-up (',
  '👥 Alineación (10 convocados · 2 equipos)': '👥 Line-up (10 called up · 2 teams)',
  '👥 Plantilla': '👥 Squad',
  '💎 ¡Cadena perfecta sin perder vidas! +5 🎟️': '💎 Perfect chain without losing a life! +5 🎟️',
  '💬 ¡Ya tenemos Discord! Entra desde el botón del menú.': '💬 We have a Discord! Join from the menu button.',
  '💬 Únete al Discord de la comunidad': '💬 Join the community Discord',
  '💬 Únete al Discord · +10 tickets 🎟️': '💬 Join the Discord · +10 tickets 🎟️',
  '💰 Dinero infinito: NO': '💰 Infinite money: NO',
  '💰 Dinero infinito: SÍ': '💰 Infinite money: YES',
  '💰 para tu club · +': '💰 for your club · +',
  '💰 · Forma': '💰 · Form',
  '💸 Fichajes': '💸 Transfers',
  '💾 Copias en este móvil': '💾 Copies on this device',
  '💾 Copias y código de partida': '💾 Copies and save code',
  '💾 Guardar': '💾 Save',
  '💾 Guardar / cargar': '💾 Save / load',
  '📅 Calendario': '📅 Fixtures',
  '📈 El resto pasa de curso y gana experiencia:': '📈 The rest move up a year and gain experience:',
  '📊 Clasificación': '📊 Standings',
  '📋 Pegar': '📋 Paste',
  '📋 Simular': '📋 Simulate',
  '📜 Primera vez: técnica legendaria': '📜 First time: legendary technique',
  '📤 Sacar código de mi partida': '📤 Get my save code',
  '📥 Cargar esta partida': '📥 Load this save',
  '📥 Cargar este código': '📥 Load this code',
  '📦 Traer partida de la versión antigua': '📦 Bring a save from the old version',
  '📦 ¿Jugabas en la versión antigua? Trae tu partida': '📦 Did you play the old version? Bring your save',
  '📰 Novedades': '📰 What\'s new',
  '📱 Ajustes → Controles → «Colocar los botones a tu gusto»: en el móvil puedes mover cada botón a donde quieras y cambiar su tamaño.': '📱 Settings → Controls → "Place the buttons your way": on mobile you can move each button wherever you want and change its size.',
  '📱 Colocar los botones a tu gusto': '📱 Place the buttons your way',
  '📱 La de este móvil': '📱 The one on this device',
  '📱 Móvil': '📱 Mobile',
  '🔄 Equipo 2 (los otros 5)': '🔄 Team 2 (the other 5)',
  '🔊 Efectos': '🔊 Effects',
  '🔒 Completa la Etapa 1': '🔒 Complete Stage 1',
  '🔗 Abrir la versión antigua': '🔗 Open the old version',
  '🔗 Copiar enlace de transferencia': '🔗 Copy transfer link',
  '🛠 Ganar ahora (desarrollador)': '🛠 Win now (developer)',
  '🛠 Modo desarrollador': '🛠 Developer mode',
  '🥉 1 vez · 🥈 3 veces · 🥇 5 veces (15 🎟️ y otro Rayo).': '🥉 1 time · 🥈 3 times · 🥇 5 times (15 🎟️ and another Bolt).',
  '🧤 Parada de': '🧤 Save by',
};
I18N.applyData();
// Textos fijos del HTML (marcados con data-tx / data-tx-aria)
if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-tx]').forEach(e => { e.textContent = TX(e.textContent); });
  document.querySelectorAll('[data-tx-aria]').forEach(e => { e.setAttribute('aria-label', TX(e.getAttribute('aria-label'))); });
  document.documentElement.lang = I18N.lang;
}

/* =====================================================================
   SPRITES: las hojas se cargan solo cuando hacen falta
   ===================================================================== */
const Sprites = (() => {
  const cache = {};
  const img = file => cache[file] || (cache[file] = new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => { delete cache[file]; rej(new Error('No se pudo cargar ' + file)); };
    i.src = 'sprites/' + file + (file.includes('?') ? '' : '?v=7');   // ?v=7: muñecos del Inazuma 3 rehechos con los datos del juego (tools/ie3_sprites.py)
  }));
  const collFile = pd => 'c' + String(pd.cs[0]).padStart(2, '0') + '.png';
  // hwFace: retrato de miedo de los legendarios de Halloween (sprites/fhw.png, hecho con tools/hw_faces.py)
  const refOf = pd => Object.assign({ file: collFile(pd), row: pd.cs[1] }, pd.hwFace != null ? { ff: 'fhw.png', fr: pd.hwFace } : pd.xmFace != null ? { ff: 'fxm.png', fr: pd.xmFace } : pd.goFace != null ? { ff: 'fgo.png', fr: pd.goFace } : {});   // goFace: jugadores de GO (sprites/fgo.png)   // xmFace: retrato navideño (sprites/fxm.png, tools/xm_faces.py)
  // Dibuja el primer fotograma (de frente) de un jugador en un <canvas>
  function portrait(ref, scale = 2) {
    const c = document.createElement('canvas');
    c.width = 48; c.height = 48; c.className = 'pix';
    c.style.width = c.style.height = (48 * scale) + 'px';
    img(ref.file).then(i => c.getContext('2d').drawImage(i, 0, ref.row * 48, 48, 48, 0, 0, 48, 48)).catch(() => {});
    return c;
  }
  // Monta una hoja con una fila por jugador del partido
  async function matchSheet(refs) {
    const imgs = await Promise.all(refs.map(r => img(r.file)));
    const w = imgs[0].width;
    const c = document.createElement('canvas');
    c.width = w; c.height = refs.length * 48;
    const g = c.getContext('2d');
    refs.forEach((r, k) => { g.drawImage(imgs[k], 0, r.row * 48, w, 48, 0, k * 48, w, 48); if (r.kit) recolor(g, w, k * 48, r.kit); });
    return c;
  }
  // Equipación propia: cambia los colores de la camiseta del Raimon (amarillo) y de mangas/pantalón (azul)
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const lum = c => c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114;
  // Equipación de portero: camiseta y pantalón azul marino (GA), mangas naranjas y medias (GB)
  const KIT_GA = [[32, 65, 82], [41, 98, 123]], KIT_GB = [[180, 90, 16], [255, 139, 32], [238, 106, 32], [230, 115, 32], [180, 90, 24], [41, 82, 98], [57, 123, 156]];
  const KIT_A = [[213, 180, 16], [164, 131, 16]], KIT_B = [[57, 82, 123], [74, 131, 172], [57, 131, 197], [65, 65, 139], [57, 82, 139], [74, 106, 189], [41, 98, 123]];
  function kitMap(kit) {
    const m = new Map(), A = hex(kit.a), B = hex(kit.b);
    const put = (src, tgt, ref) => src.forEach(s => {
      const k = lum(s) / ref, o = tgt.map(v => Math.max(0, Math.min(255, Math.round(v * k + (k > 1 ? (k - 1) * 60 : 0)))));
      m.set((s[0] << 16) | (s[1] << 8) | s[2], o);
    });
    put(KIT_A, A, lum(KIT_A[0])); put(KIT_B, B, lum([57, 131, 197]));
    // Portero jugando de campo: su equipación naranja de portero también toma los colores del equipo
    if (kit.gk) { put(KIT_GA, A, lum([41, 98, 123])); put(KIT_GB, B, lum([255, 139, 32])); }
    return m;
  }
  // Diseños de la camiseta (kit.d): en las zonas del dibujo la camiseta toma el segundo color (kit.b)
  const DESIGNS = {
    rayas: (x, y) => ((x >> 1) & 1) === 0,             // rayas verticales
    mitades: (x, y) => x >= 24,                         // media camiseta de cada color
    banda: (x, y) => y >= 29 && y <= 31,                // franja en el pecho
    cuadros: (x, y) => (((x >> 1) + (y >> 1)) & 1) === 0,
    diagonal: (x, y) => Math.abs((x - 14) - (y - 22)) <= 2,
  };
  function recolor(g, w, y0, kit) {
    const map = kitMap(kit), y = y0 + 20, h = 28, d = g.getImageData(0, y, w, h), p = d.data;
    const pat = kit.d && DESIGNS[kit.d], alt = pat && kitMap(Object.assign({}, kit, { a: kit.b })), shirt = new Set([...KIT_A, ...(kit.gk ? KIT_GA : [])].map(c => (c[0] << 16) | (c[1] << 8) | c[2]));
    for (let i = 0; i < p.length; i += 4) {
      if (!p[i + 3]) continue;
      const key = (p[i] << 16) | (p[i + 1] << 8) | p[i + 2];
      let o = map.get(key);
      if (o && pat && shirt.has(key)) { const n = i >> 2; if (pat((n % w) % 48, 20 + ((n / w) | 0))) o = alt.get(key); }
      if (o) { p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
    }
    g.putImageData(d, 0, y);
  }
  // Muñeco de muestra con una equipación (para el editor del club)
  function kitPreview(ref, kit, scale = 2) {
    const c = document.createElement('canvas'); c.width = c.height = 48; c.className = 'pix kitpv';
    c.style.width = c.style.height = (48 * scale) + 'px';
    img(ref.file).then(i => { const g = c.getContext('2d'); g.drawImage(i, 0, ref.row * 48, 48, 48, 0, 0, 48, 48); recolor(g, 48, 0, kit); }).catch(() => {});
    return c;
  }
  // Retrato del juego (cara + cuerpo, 64×64): fNN.png para la colección, qNN.png para los rivales
  function face(ref, size = 64) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64; c.className = 'pix';
    c.style.width = c.style.height = size + 'px';
    const file = ref.ff ? ref.ff + '?v=4' : ref.file.replace(/^c/, 'f').replace(/^r/, 'q') + '?v=4';   // ?v=3: caras actualizadas, evita la copia vieja guardada
    const row = ref.ff ? ref.fr : ref.row;
    img(file).then(i => c.getContext('2d').drawImage(i, 0, row * 64, 64, 64, 0, 0, 64, 64)).catch(() => {});
    return c;
  }
  const crest = id => `<img class="crest" src="ui/crest${id || 1}.png" alt="" width="40" height="40">`;
  return { img, collFile, refOf, portrait, face, crest, matchSheet, kitPreview, DESIGNS };
})();

/* =====================================================================
   ESCUDO PROPIO (modo carrera): forma, dos colores y un símbolo
   ===================================================================== */
const ClubCrest = (() => {
  const cache = {};
  function url(cr, school) {
    const key = JSON.stringify(cr) + '|' + (school || '');
    if (cache[key]) return cache[key];
    const S = 80, c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    const path = (inset) => {
      g.beginPath();
      const a = inset, b = S - inset;
      if (cr.shape === 'circulo') g.arc(S / 2, S / 2, S / 2 - inset, 0, Math.PI * 2);
      else if (cr.shape === 'rombo') { g.moveTo(S / 2, a); g.lineTo(b, S / 2); g.lineTo(S / 2, b); g.lineTo(a, S / 2); g.closePath(); }
      else { g.moveTo(a + 4, a); g.lineTo(b - 4, a); g.lineTo(b - 4, S * 0.55); g.quadraticCurveTo(b - 6, b - 8, S / 2, b); g.quadraticCurveTo(a + 6, b - 8, a + 4, S * 0.55); g.closePath(); }
    };
    path(2); g.fillStyle = '#111'; g.fill();
    path(6); g.fillStyle = cr.c2; g.fill();
    path(11); g.fillStyle = cr.c1; g.fill();
    // banda diagonal con el segundo color
    g.save(); path(11); g.clip(); g.globalAlpha = 0.35; g.fillStyle = cr.c2; g.beginPath(); g.moveTo(0, S * 0.7); g.lineTo(S * 0.7, 0); g.lineTo(S, 0); g.lineTo(0, S); g.closePath(); g.fill(); g.restore();
    const sym = cr.sym === 'iniciales' ? (school || 'IR').split(/\s+/).filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'IR' : (CREST_SYMBOLS[cr.sym] || '★');
    g.font = (sym.length > 1 && cr.sym === 'iniciales' ? 26 : 34) + 'px "InaPixel", "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 5; g.strokeStyle = '#111'; g.strokeText(sym, S / 2, S / 2 + 2);
    g.fillStyle = cr.c2; g.fillText(sym, S / 2, S / 2 + 2);
    return (cache[key] = c.toDataURL());
  }
  return { url };
})();

/* =====================================================================
   SONIDO: música y jingles de tus archivos; efectos generados aquí
   ===================================================================== */
// Pistas ordenadas por grupo (el orden de aquí es el de Ajustes). loop: [inicio, fin] en segundos.
const TRACK_GROUPS = [TX('Inicio'), TX('Partidos · Inazuma Eleven'), TX('Partidos · Inazuma Eleven 2'), TX('Rivales · Inazuma Eleven 2'), TX('Historia · Inazuma Eleven 2'), TX('Lugares · Inazuma Eleven 2'), 'Jingles'];
const TRACKS = {};
[
  [TX('Inicio'), [
    ['title', TX('Título · Inazuma Eleven'), [0, 0]], ['title2', TX('Título · Inazuma Eleven 2'), [0, 0]],
    ['op00', TX('Opening · Inazuma Eleven'), null], ['op2', TX('Opening · Inazuma Eleven 2'), null], ['bg_end', TX('Ending · Inazuma Eleven'), null]]],
  [TX('Partidos · Inazuma Eleven'), [
    ['m01', TX('Partido 1'), [3.5, 68.32]], ['m02', TX('Partido 2'), [0, 65.93]], ['m03', TX('Partido 3'), [5.05, 79.07]], ['m04', TX('Partido 4'), [4.29, 70.71]], ['m05', TX('Partido 5'), [0.28, 67.57]],
    ['p07', TX('Ritmo rápido'), [0, 50.37]], ['pb01', TX('Contraataque - ¡Al rojo vivo!'), [6.48, 77.59]], ['p01', TX('Tema épico'), [20.79, 93.93]],
    ['e01', TX('Tensión'), [0, 33.68]], ['d01', TX('El centro de entrenamiento Osakaland'), [0, 79.32]]]],
  [TX('Partidos · Inazuma Eleven 2'), [
    ['p10', TX('El poder del Raimon'), [1.55, 76.9]], ['p11', TX('Ataque relámpago'), [9.93, 72.83]], ['p05', TX('Cruzada gloriosa'), [6.1, 94.58]],
    ['p06', TX('Centro de entrenamiento'), [6.77, 66.77]], ['p15', TX('Tema de partido (P15)'), [1.66, 93.1]]]],
  [TX('Rivales · Inazuma Eleven 2'), [
    ['p04', TX('Atronadora Royal Academy'), [0, 76.6]], ['e07', 'Royal Academy', [0.25, 65.81]], ['p16', TX('R. A. Redux - Supertécnicas milagrosas'), [0, 84.48]],
    ['p12', TX('Emperadores Oscuros - El campo del trueno'), [1.45, 73.21]], ['e204', TX('La sombra negra - Tema de Ray Dark'), [0, 58.29]],
    ['p17', TX('Géminis - El balón negro'), [3.69, 62.77]], ['p18', TX('Épsilon - Ira infernal'), [14.64, 86.43]], ['p19', TX('Génesis - El equipo G'), [6, 81]],
    ['e211', TX('Génesis - Los superhumanos'), [7.3, 87.92]], ['e210', TX('El poder de la Academia Alius'), [12.8, 93.87]]]],
  [TX('Historia · Inazuma Eleven 2'), [
    ['e201', TX('Los sueños del Raimon'), [0.09, 79]], ['e01b', TX('El club de fútbol'), [0, 50.53]], ['e205', TX('¡Vamos allá!'), [0.23, 37.73]], ['e208', TX('Alma de luchador'), [0, 81.25]],
    ['e206', TX('La amenaza del trueno'), [4, 73.33]], ['e03', TX('La última batalla'), [0.23, 29.77]], ['e05', TX('Terreno sagrado'), [0.21, 73.73]], ['e202', TX('Su Majestad'), [0, 61.97]],
    ['e209', TX('Tiempos difíciles'), [0, 96.77]], ['e207', TX('Sueños rotos'), [0, 86.81]], ['e203', TX('Axel y Julia - Un final feliz'), [0, 89.46]],
    ['e212', TX('El astro del balón - Versión para piano'), [0, 56.49]], ['s201', TX('El óvalo - Estadio'), [0, 32]]]],
  [TX('Lugares · Inazuma Eleven 2'), [
    ['m201', TX('La Caravana Inazuma'), [8.64, 79.55]], ['m205', TX('La ciudad de Inazuma'), [12, 71.52]], ['m206', TX('Zona residencial - Una promesa solemne'), [4.88, 74.59]],
    ['m207', TX('¡Hacia el infinito!'), [9.7, 104.21]], ['m208', TX('Hokkaido - Paraíso nevado'), [0, 55.27]], ['m213', TX('Okinawa - Fútbol bajo el sol'), [6, 84]],
    ['m214', TX('Osakaland'), [12.41, 105.52]], ['m216', TX('Royal Academy - Versión del juego'), [0, 62.5]], ['m217', TX('El bosque del monte Fuji'), [0, 89.14]],
    ['m218', TX('La base de la Academia Alius'), [4.8, 76.8]]]],
  ['Jingles', [['j13', TX('Gol'), null], ['j01', TX('Victoria'), null], ['j07', TX('Derrota'), null]]],
].forEach(([group, list]) => list.forEach(([k, name, loop]) => {
  TRACKS[k] = { file: k + '.mp3', name, loop, group, jingle: group === 'Jingles' };
}));
// Cada rival con tema propio en el juego suena con su música (se puede apagar en Ajustes)
const TEAM_THEMES = { 'Royal Academy': 'p04', 'Royal Academy Redux': 'p16', 'Emperadores Oscuros': 'p12', 'Tormenta de Géminis': 'p17',
  'Épsilon': 'p18', 'Épsilon Plus': 'p18', 'Génesis': 'p19', Caos: 'e210' };
const RANDOM_POOL = ['m01', 'm02', 'm03', 'm04', 'm05', 'p10', 'p11', 'pb01'];

const Sound = (() => {
  let ctx = null, musicGain = null, sfxGain = null, cur = null, curKey = null;
  const buffers = {};
  // Música por dificultad: de alegre (fácil) a oscura y épica (final y especiales)
  const DEF_ROLES = { menu: 'title', intro: 'op00', match: 'random', match_easy: 'm01', match_mid: 'm04', match_hard: 'm02', match_final: 'd01', match_special: 'p01',
    s2_easy: 'p10', s2_mid: 'p11', s2_hard: 'p05', s2_final: 'e210', goal: 'j13', win: 'j01', lose: 'j07' };
  const cfg = { music: true, sfx: true, teamThemes: true, roles: Object.assign({}, DEF_ROLES) };
  try { const c = JSON.parse(localStorage.getItem('inazuma-sonido') || 'null'); if (c) { Object.assign(cfg, c); cfg.roles = Object.assign({}, DEF_ROLES, c.roles); } } catch (_) {}
  // Si una pista guardada ya no existe (versión anterior), vuelve a la de serie
  for (const r in cfg.roles) { const v = cfg.roles[r]; if (v && v !== 'random' && !TRACKS[v]) cfg.roles[r] = DEF_ROLES[r] || ''; }
  const saveCfg = () => { try { localStorage.setItem('inazuma-sonido', JSON.stringify(cfg)); } catch (_) {} };

  function unlock() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    musicGain = ctx.createGain(); musicGain.gain.value = cfg.music ? 0.55 * (cfg.mv ?? 1) : 0; musicGain.connect(ctx.destination);
    sfxGain = ctx.createGain(); sfxGain.gain.value = cfg.sfx ? 0.7 * (cfg.sv ?? 1) : 0; sfxGain.connect(ctx.destination);
  }
  function load(key) {
    if (buffers[key]) return buffers[key];
    return (buffers[key] = fetch('audio/' + TRACKS[key].file).then(r => r.arrayBuffer())
      .then(b => new Promise((res, rej) => ctx.decodeAudioData(b, res, rej))).catch(e => { delete buffers[key]; throw e; }));
  }
  async function play(key, opts = {}) {
    if (!ctx || !TRACKS[key]) return;
    if (key === curKey && cur && !opts.restart) return;
    stop(0.4);
    curKey = key;
    let buf; try { buf = await load(key); } catch (_) { return; }
    if (curKey !== key) return;
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = buf;
    const L = TRACKS[key].loop;
    if (L && !opts.once) { src.loop = true; src.loopStart = L[0]; src.loopEnd = L[1] || buf.duration; }
    g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.4);
    src.connect(g).connect(musicGain); src.start();
    src.onended = () => { if (cur && cur.src === src) { cur = null; curKey = null; } };
    cur = { src, g };
  }
  function stop(fade = 0.3) {
    if (!cur || !ctx) { curKey = null; return; }
    const { src, g } = cur; cur = null; curKey = null;
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime); g.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
    try { src.stop(ctx.currentTime + fade + 0.05); } catch (_) {}
  }
  function music(role, rival) {
    let key = cfg.roles[role];
    // Durante Halloween el menú suena más oscuro: «La sombra negra», el tema de Ray Dark (si no has elegido otra pista para el menú)
    if (role === 'menu' && key === DEF_ROLES.menu && typeof Halloween !== 'undefined' && Halloween.active() && TRACKS.e204) key = 'e204';
    if (rival && cfg.teamThemes !== false && TEAM_THEMES[rival]) key = TEAM_THEMES[rival];
    if (key === 'random') key = RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)];
    if (key) play(key);
  }
  // Jingle corto encima de la música (gol, victoria…)
  async function jingle(role) {
    const key = role && cfg.roles[role];
    if (!ctx || !key || !TRACKS[key]) return;
    let buf; try { buf = await load(key); } catch (_) { return; }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = 0.9;
    if (cur) { cur.g.gain.setTargetAtTime(0.25, ctx.currentTime, 0.1); setTimeout(() => cur && cur.g.gain.setTargetAtTime(1, ctx.currentTime, 0.3), buf.duration * 1000); }
    src.connect(g).connect(musicGain); src.start();
  }

  /* Efectos generados con WebAudio (no necesitan archivos) */
  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function env(g, t, a, d, peak) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function tone(type, f0, f1, dur, peak, t = 0) {
    const o = ctx.createOscillator(), g = ctx.createGain(), T = ctx.currentTime + t;
    o.type = type; o.frequency.setValueAtTime(f0, T); o.frequency.exponentialRampToValueAtTime(f1, T + dur);
    env(g, T, 0.005, dur, peak); o.connect(g).connect(sfxGain); o.start(T); o.stop(T + dur + 0.05);
  }
  function hiss(freq, q, dur, peak, t = 0, sweep) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), T = ctx.currentTime + t;
    s.buffer = noise(); f.type = 'bandpass'; f.frequency.setValueAtTime(freq, T); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, T + dur);
    env(g, T, Math.min(0.08, dur / 3), dur, peak); s.connect(f).connect(g).connect(sfxGain); s.start(T); s.stop(T + dur + 0.1);
  }
  const FX = {
    kick: () => { tone('sine', 160, 50, 0.12, 0.9); hiss(1800, 1, 0.05, 0.4); },
    pass: () => { tone('sine', 220, 90, 0.08, 0.5); hiss(2200, 1.5, 0.04, 0.25); },
    tackle: () => { hiss(500, 0.8, 0.22, 0.6); tone('triangle', 120, 60, 0.15, 0.5); },
    whiff: () => hiss(900, 0.7, 0.18, 0.3, 0, 300),
    whistle: () => { for (const t of [0, 0.22]) { tone('sine', 2850, 2750, 0.16, 0.25, t); tone('sine', 3050, 2950, 0.16, 0.12, t); } },
    whistleEnd: () => { [0, 0.25, 0.5].forEach(t => tone('sine', 2850, 2750, t === 0.5 ? 0.6 : 0.16, 0.25, t)); },
    save: () => { tone('sine', 110, 55, 0.2, 0.9); hiss(400, 0.6, 0.18, 0.4); },
    tech: () => { hiss(300, 0.9, 0.7, 0.5, 0, 3200); tone('sawtooth', 110, 440, 0.6, 0.12); },
    goal: () => { hiss(1200, 0.4, 2.6, 0.5); hiss(700, 0.5, 2.2, 0.35, 0.1); },
    click: () => tone('square', 900, 700, 0.04, 0.12),
    reveal: () => { tone('triangle', 520, 1040, 0.25, 0.25); tone('sine', 780, 1560, 0.3, 0.15, 0.05); },
  };
  function sfx(name) { if (ctx && cfg.sfx && FX[name]) { try { FX[name](); } catch (_) {} } }

  function setMusic(on) { cfg.music = on; saveCfg(); if (musicGain) musicGain.gain.value = on ? 0.55 * (cfg.mv ?? 1) : 0; }
  function setSfx(on) { cfg.sfx = on; saveCfg(); if (sfxGain) sfxGain.gain.value = on ? 0.7 * (cfg.sv ?? 1) : 0; }
  // Mezclador: volumen de 0 a 1 para música y efectos
  function setVol(kind, v) { if (kind === 'music') { cfg.mv = v; setMusic(v > 0); } else { cfg.sv = v; setSfx(v > 0); } }
  function setRole(role, key) { cfg.roles[role] = key; saveCfg(); }
  function setTeamThemes(on) { cfg.teamThemes = on; saveCfg(); }
  function preview(key) { unlock(); play(key, { restart: true, once: true }); }
  return { unlock, music, jingle, sfx, stop, cfg, setMusic, setSfx, setVol, setRole, setTeamThemes, preview, DEF_ROLES, current: () => curKey };
})();

/* =====================================================================
   LÓGICA DEL PARTIDO (no usa Phaser). Metros y segundos.
   El equipo A (tú) ataca hacia arriba (y = 0); el B, hacia abajo.
   ===================================================================== */
// Fácil = el antiguo Difícil; Medio y Difícil suben desde ahí
const DIFF = {
  facil:   { aiSpeed: 1.03, steal: 1.1,  shootRange: 15, think: 0.26, tackle: 0.85, react: 0.04, techUse: 0.9, smart: 0.6 },
  medio:   { aiSpeed: 1.07, steal: 1.35, shootRange: 16, think: 0.2,  tackle: 0.95, react: 0.03, techUse: 1,   smart: 0.85 },
  dificil: { aiSpeed: 1.12, steal: 1.6,  shootRange: 17, think: 0.15, tackle: 1.05, react: 0.02, techUse: 1,   smart: 1 },
};
let GAME_SPEED = 0.75;   // todo el juego un 25 % más pausado (el reloj del partido no cambia)

const Logic = (() => {
  // Campo para 5 contra 5 (provisional)
  const F = { w: 34, l: 52, margin: 4, goalW: 5.5, goalDepth: 1.5, barZ: 2.0,
              boxW: 18, boxD: 7.5, smallW: 9, smallD: 2.5, spot: 6.5, circleR: 5.5 };
  const cx = F.w / 2;
  const rnd = Math.random;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const snap8 = a => Math.round(a / (Math.PI / 4)) * (Math.PI / 4);
  const angDiff = (a, b) => { let d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; };
  const turnTo = (a, b, max) => { let d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + clamp(d, -max, max); };
  const attackDir = t => t === 'A' ? -1 : 1;
  const ownGoalY = t => t === 'A' ? F.l : 0;
  const oppGoalY = t => t === 'A' ? 0 : F.l;
  const depthOf = (t, y) => t === 'A' ? F.l - y : y;
  const toAbs = (t, ox, depth) => t === 'A' ? { x: cx + ox, y: F.l - depth } : { x: cx - ox, y: depth };
  const possession = s => s.ball.owner ? s.ball.owner.team : s.ball.lastTeam;
  const controlled = s => s.players.find(p => p.id === s.controlledId);
  const inOwnBox = (t, pt) => Math.abs(pt.x - cx) < F.boxW / 2 && depthOf(t, pt.y) < F.boxD && depthOf(t, pt.y) > -1;
  const goalDist = p => Math.hypot(cx - p.x, oppGoalY(p.team) - p.y);
  // Fuera de juego: línea del penúltimo rival (contando al portero), nunca antes de medio campo ni por detrás del balón
  function offLine(s, team) {
    const opp = s.players.filter(o => o.team !== team).map(o => depthOf(team, o.y)).sort((a, b) => b - a);
    return Math.max(opp[1] ?? F.l, depthOf(team, s.ball.y), F.l / 2);
  }
  const isOffside = (s, m) => depthOf(m.team, m.y) > offLine(s, m.team) + 0.4;
  const onside = (s, p, y) => { const lim = offLine(s, p.team) - 0.6; return depthOf(p.team, y) > lim ? toAbs(p.team, 0, lim).y : y; };

  const BASE = { POR: [0, 1.2], DEF: [-4, 11], MED: [6, 19], DEL: [-2, 27] };
  const KO = { POR: [0, 1.2], DEF: [-5, 9], MED: [6, 15] };

  /* ---------- Creación ---------- */
  function createMatch(settings, teams) {
    const diff = DIFF[settings.difficulty] || DIFF.medio;
    const s = { field: F, settings, diff, teams, players: [], score: { A: 0, B: 0 }, time: settings.minutes * 60, t: 0,
      pause: null, hitstop: 0, over: false, result: null, golden: false, controlledId: null, events: [], slow: 0, tech: null, effects: [],
      shoot: { charging: false, charge: 0, aimX: 0 },
      ball: { x: cx, y: F.l / 2, z: 0, vx: 0, vy: 0, vz: 0, owner: null, lastTeam: 'A', intended: null, shot: null, fire: null, ang: 0, phase: 0 } };
    for (const team of ['A', 'B']) {
      teams[team].players.forEach((d, i) => {
        const ai = team === 'B';
        const home = d.home || BASE[d.role], ko = d.ko || [home[0], Math.min(home[1], 22)];
        s.players.push(Object.assign({}, d, { id: team + i, team, num: i + 1, home, ko,
          speed: d.speed * (ai ? diff.aiSpeed : 1),
          cd: {}, x: 0, y: 0, z: 0, vx: 0, vy: 0, dvx: 0, dvy: 0, facing: 0, aim: 0, moving: false,
          stamina: 1, tired: false, sprint: false, stun: 0, kickLock: 0, kickT: 0, tackle: null, tackleCd: 0, windup: null, tkWind: 0,
          dash: null, think: 0, holdT: 0, react: 0, diving: false, gkTech: null, invuln: 0 }));
      });
    }
    // Recarga: unas 3 veces por partido; las técnicas fuertes tardan más
    const span = settings.minutes * 60 * GAME_SPEED / 3;
    for (const p of s.players) {
      p.techs = p.techs.map(t => Object.assign({}, t, { cd: +(span * (0.75 + t.power / 240) * (p.bonus.cdMul || 1)).toFixed(1) }));
      for (const t of p.techs) p.cd[t.id] = t.cd * 0.5;   // al empezar, a mitad de recarga
    }
    kickoff(s, 'A');
    return s;
  }

  // Delantero que saca de centro (o el jugador más adelantado)
  function striker(s, team) {
    const order = { DEL: 0, MED: 1, DEF: 2, POR: 3 };
    return s.players.filter(p => p.team === team).sort((a, b) => order[a.role] - order[b.role] || b.ko[1] - a.ko[1])[0];
  }
  function kickoff(s, team) {
    const tk = striker(s, team);
    for (const p of s.players) {
      const o = p === tk ? [0, F.l / 2 - 0.6] : [p.ko[0], Math.min(p.ko[1], F.l / 2 - (p.team === team ? 1.5 : 6))];
      const a = toAbs(p.team, o[0], o[1]);
      Object.assign(p, { x: a.x, y: a.y, z: 0, vx: 0, vy: 0, dvx: 0, dvy: 0, stun: 0, tackle: null, dash: null, windup: null, tkWind: 0,
        kickLock: 0, moving: false, diving: false, gkTech: null, invuln: 0 });
      p.facing = p.aim = attackDir(p.team) < 0 ? -Math.PI / 2 : Math.PI / 2;
    }
    s.tech = null; s.slow = 0; s.shoot.charging = false; s.shoot.charge = 0;
    take(s, tk);
    s.controlledId = striker(s, 'A').id;
    s.pause = { t: 0.9 };
    s.events.push({ type: 'kickoff' });
  }

  function take(s, p) {
    const b = s.ball;
    Object.assign(b, { owner: p, intended: null, shot: null, fire: null, offside: null, setPiece: null, lastTeam: p.team, vx: 0, vy: 0, vz: 0, z: 0 });
    b.ang = p.aim;
    p.holdT = 0; p.think = 0.2 + rnd() * 0.25;
    if (p.team === 'A') s.controlledId = p.id;   // también el portero, mientras tenga el balón
    if (p.role === 'POR' && p.team === 'A') { s.gkHold = 0; if (!s.gkHint) { s.gkHint = true; s.events.push({ type: 'msg', text: TX('Tu portero tiene el balón: pasa (J) o despeja (L)') }); } }
    syncBall(s, 1);
  }

  // El balón va pegado al pie, gira con suavidad y "rebota" un poco al correr (toques)
  function syncBall(s, dt) {
    const b = s.ball, p = b.owner;
    if (!p) return;
    b.ang = turnTo(b.ang, p.aim, 14 * dt);
    const sp = Math.hypot(p.vx, p.vy);
    b.phase += dt * sp * 1.6;
    const r = 0.45 + (sp > 1 ? 0.18 * (0.5 + 0.5 * Math.sin(b.phase)) : 0);
    b.x = p.x + Math.cos(b.ang) * r; b.y = p.y + Math.sin(b.ang) * r; b.z = 0;
  }

  function kick(s, p, vx, vy, vz) {
    Object.assign(s.ball, { owner: null, vx, vy, vz, lastTeam: p.team, intended: null, shot: null, fire: null, offside: null });
    p.kickLock = 0.3; p.kickT = 0.28;
  }

  function speedOf(s, p, sprint) {
    let v = p.speed;
    if (s.ball.owner === p) v *= 0.93;
    if (sprint && !p.tired && p.stamina > 0.02) { v *= 1.38; p.sprint = true; }
    if (p.id === s.controlledId && s.shoot.charging) v *= 0.45;
    return v;
  }

  function moveTo(s, p, tx, ty, sprint) {
    const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
    if (d < 0.35) { p.dvx = p.dvy = 0; return; }
    const sp = speedOf(s, p, sprint && d > 3) * Math.min(1, d / 1.2);
    p.dvx = dx / d * sp; p.dvy = dy / d * sp;
  }

  /* ---------- Acciones con balón ---------- */
  function pass(s, p, kind, dir, power = 0) {
    const mates = s.players.filter(m => m.team === p.team && m !== p && m.role !== 'POR');
    const aim = dir && Math.hypot(dir.x, dir.y) > 0.3 ? Math.atan2(dir.y, dir.x) : p.aim;
    let best = null, bestScore = Infinity;
    for (const m of mates) {
      const d = dist(m, p); if (d < 2) continue;
      const score = angDiff(aim, Math.atan2(m.y - p.y, m.x - p.x)) * 3 + d * 0.035;
      if (score < bestScore) { bestScore = score; best = m; }
    }
    if (!best) return false;
    const off = s.ball.setPiece !== p.id && isOffside(s, best);
    let tx, ty, speed, vz;
    if (kind === 'through') {
      tx = clamp(best.x + best.vx * 0.6 + (cx - best.x) * 0.15, 1, F.w - 1);
      ty = clamp(best.y + best.vy * 0.6 + attackDir(p.team) * 5, 1.5, F.l - 1.5);
      speed = clamp(Math.hypot(tx - p.x, ty - p.y) * 0.85 + 6, 8, 15); vz = 3;
    } else {
      tx = best.x + best.vx * 0.35; ty = best.y + best.vy * 0.35;
      // Pase raso: más fuerte que antes y, si se carga, un pase tenso y rápido
      speed = clamp(Math.hypot(tx - p.x, ty - p.y) * 1.15 + 8.5, 10.5, 19) * (1 + 0.45 * power) * (0.92 + p.kick / 900); vz = 0;
    }
    const d = Math.hypot(tx - p.x, ty - p.y) || 1;
    p.aim = Math.atan2(ty - p.y, tx - p.x); p.facing = snap8(p.aim);
    s.ball.ang = p.aim; syncBall(s, 1);
    kick(s, p, (tx - p.x) / d * speed, (ty - p.y) / d * speed, vz);
    s.ball.intended = best.id;
    s.ball.passPower = power;
    if (off) s.ball.offside = best.id;
    if (p.team === 'A') s.controlledId = best.id;
    s.events.push({ type: 'pass', power });
    return true;
  }

  // Lo que aporta una técnica: crece con su potencia, pero sin aplastar a las estadísticas
  const techEff = (t, bonus) => 2 + t.power * 0.25 + (bonus || 0) * 0.4;
  // Un tiro bien cargado (85 % o más) pega más fuerte y el portero ya no tiene tanta ventaja
  function shotStrength(p, charge, tech) { return p.kick * (0.6 + 0.4 * charge) + (tech ? techEff(tech, p.bonus.tiro) : charge >= 0.85 ? 6 : 0); }

  function shoot(s, p, charge, aimX, tech) {
    const goalY = oppGoalY(p.team), half = F.goalW / 2 - 0.35;
    let tx = cx + clamp(aimX, -1, 1) * half;
    const scatter = (1 - p.kick / 110) * 2.2 * (0.6 + charge * 0.6) * (tech ? 0.3 : 1);
    tx += (rnd() - 0.5) * scatter * 2;
    const speed = (15 + charge * 13) * (0.8 + p.kick / 250) * (tech ? 1.2 + tech.power / 250 : 1);
    const dx = tx - p.x, dy = goalY - p.y, d = Math.hypot(dx, dy) || 1;
    p.aim = Math.atan2(dy, dx); p.facing = snap8(p.aim);
    s.ball.ang = p.aim; syncBall(s, 1);
    kick(s, p, dx / d * speed, dy / d * speed, tech ? -1 : 1 + charge * 2.6 + rnd() * 0.6);
    s.ball.shot = { team: p.team, by: p.id, power: shotStrength(p, charge, tech), tech: tech || null, charged: !tech && charge >= 0.85, resolved: false, dist: d };
    s.events.push({ type: 'shot', team: p.team });
  }

  /* ---------- Supertécnicas ---------- */
  const ready = (p, t) => (p.cd[t.id] || 0) <= 0;
  function bestTech(p, type) {
    let best = null;
    for (const t of p.techs) if (t.type === type && ready(p, t) && (!best || t.power > best.power)) best = t;
    return best;
  }
  function anyTech(p, type) { return p.techs.some(t => t.type === type); }
  // Elegir qué supertécnica usar cuando tienes varias del mismo tipo (botón ⇄ / tecla U)
  function cycleTech(s, p) {
    const c = contextTech(s, p); if (!c) return;
    const list = p.techs.filter(t => t.type === c.tech.type); if (list.length < 2) return;
    const i = list.findIndex(t => t.id === c.tech.id), n = list[(i + 1) % list.length];
    p.techPick = p.techPick || {}; p.techPick[c.tech.type] = n.id;
    s.events.push({ type: 'msg', text: TX('Técnica: ') + n.name });
  }
  const techChoices = (s, p) => { const c = p && contextTech(s, p); return c ? p.techs.filter(t => t.type === c.tech.type).length : 0; };

  // Qué técnica usaría ahora el jugador al pulsar el botón (según la situación)
  function contextTech(s, p) {
    const b = s.ball;
    if (b.owner === p) {
      if (anyTech(p, 'tiro') && goalDist(p) < 22) return pickReady(p, 'tiro');
      if (anyTech(p, 'regate')) return pickReady(p, 'regate');
      if (anyTech(p, 'tiro')) return pickReady(p, 'tiro');
      return null;
    }
    if (anyTech(p, 'bloqueo')) return pickReady(p, 'bloqueo');
    return null;
  }
  function pickReady(p, type) {
    const pick = p.techPick && p.techPick[type] != null && p.techs.find(t => t.id === p.techPick[type] && t.type === type);
    if (pick) return { tech: pick, ready: ready(p, pick), frac: ready(p, pick) ? 0 : p.cd[pick.id] / pick.cd };
    const r = bestTech(p, type);
    if (r) return { tech: r, ready: true, frac: 0 };
    let soon = null;
    for (const t of p.techs) if (t.type === type && (!soon || p.cd[t.id] < p.cd[soon.id])) soon = t;
    return soon ? { tech: soon, ready: false, frac: p.cd[soon.id] / soon.cd } : null;
  }

  // Cada técnica tiene su propia recarga: usar una no bloquea las demás
  const spend = (p, tech) => { p.cd[tech.id] = tech.cd; };
  function startTech(s, p, tech, aimX) {
    spend(p, tech);
    s.shoot.charging = false; s.shoot.charge = 0;
    const holder = s.ball.owner;
    const dur = tech.type === 'tiro' ? 0.55 : tech.type === 'regate' ? 0.3 : 0.25;
    s.tech = { p, tech, t: 0, dur, aimX, target: tech.type === 'bloqueo' ? holder : null };
    p.invuln = dur + 0.4;
    s.events.push({ type: 'techStart', name: tech.name, elem: tech.elem, kind: tech.type, team: p.team, id: p.id });
    return true;
  }

  function tryTech(s, p, aimX, quiet) {
    if (s.tech) return false;
    const c = contextTech(s, p);
    const say = text => { if (!quiet) s.events.push({ type: 'msg', text }); return false; };
    if (!c) return say(s.ball.owner === p ? p.name + TX(' no tiene técnica de tiro ni de regate') : p.name + TX(' no tiene técnica de bloqueo'));
    if (!c.ready) return say(c.tech.name + ' recargando');
    const t = c.tech;
    if (t.type === 'tiro' && goalDist(p) > 24) return say(TX('Acércate más a la portería'));
    if (t.type === 'bloqueo') {
      const h = s.ball.owner;
      if (!h || h.team === p.team || dist(h, p) > 4.5) return say(TX('Acércate al rival que lleva el balón'));
    }
    return startTech(s, p, t, aimX);
  }

  function updateTech(s, dt) {
    const T = s.tech; if (!T) return;
    const p = T.p, b = s.ball, k = Math.min(1, (T.t += dt) / T.dur);
    p.dvx = p.dvy = 0; p.vx *= 0.5; p.vy *= 0.5;
    if (T.tech.type === 'tiro') {
      if (b.owner !== p) { s.tech = null; return; }
      p.z = Math.sin(k * Math.PI / 2) * 1.6;
      const a = T.t * 16;
      b.x = p.x + Math.cos(a) * 0.7; b.y = p.y + Math.sin(a) * 0.42; b.z = p.z + 0.8 + k * 0.8;
      if (k >= 1) {
        s.tech = null;
        b.x = p.x; b.y = p.y + attackDir(p.team) * 0.4;
        shoot(s, p, 1, T.aimX, T.tech);
        b.z = 1.6; b.vz = -1; b.fire = T.tech.elem;
        s.events.push({ type: 'techKick', x: b.x, y: b.y, elem: T.tech.elem, name: T.tech.name, team: p.team });
        s.hitstop = 0.08;
      }
    } else if (k >= 1) {
      s.tech = null;
      if (T.tech.type === 'regate') {
        if (b.owner !== p) return;
        p.dash = { t: 0.35, dir: p.aim, speed: 15, tech: T.tech };
        p.invuln = 0.6;
        s.events.push({ type: 'techBurst', x: p.x, y: p.y, elem: T.tech.elem });
      } else if (T.tech.type === 'bloqueo') {
        const h = b.owner;
        if (!h || h.team === p.team) return;
        p.dash = { t: 0.25, dir: Math.atan2(h.y - p.y, h.x - p.x), speed: 13, tech: T.tech, target: h };
      }
    }
  }

  function updateDash(s, p, dt) {
    const D = p.dash;
    p.dvx = Math.cos(D.dir) * D.speed; p.dvy = Math.sin(D.dir) * D.speed;
    p.vx = p.dvx; p.vy = p.dvy;
    D.t -= dt;
    if (D.tech.type === 'regate') {
      D.met = D.met || new Set();
      for (const o of s.players) {
        if (o.team === p.team || (o.role === 'POR' && !D.tech.plain) || o.stun > 0 || D.met.has(o) || dist(o, p) > (o.role === 'POR' ? 1.8 : 2.4)) continue;
        if (o.dash && o.dash.tech.type === 'bloqueo') continue;
        D.met.add(o);
        const chance = D.tech.plain && o.role === 'POR' ? 0.1                                    // regate normal al portero: solo 1 de cada 10
          : D.tech.plain ? clamp(0.58 + (p.control - o.defense) / 55, 0.3, 0.85)   // regate normal: más arriesgado
          : clamp(0.72 + (p.control + techEff(D.tech, p.bonus.regate) * 1.2 - o.defense) / 50, 0.4, 0.95);
        if (rnd() < chance || s.ball.owner !== p) {
          o.stun = D.tech.plain ? 0.55 : 0.9; o.tackle = null;
          if (D.tech.plain) { p.invuln = 0.45; if (p.team === 'A') s.events.push({ type: 'msg', text: TX('¡Regate!') }); }
          else s.events.push({ type: 'knock', x: o.x, y: o.y, elem: D.tech.elem });
        } else {   // el defensa lee el regate y se queda el balón
          take(s, o); p.stun = D.tech.plain ? 0.45 : 0.6; p.kickLock = 0.5; p.dash = null;
          s.events.push({ type: 'dodgeFail', x: o.x, y: o.y, elem: D.tech.elem, team: o.team, name: o.name });
          return;
        }
      }
    } else if (D.tech.type === 'bloqueo' && D.target) {
      const h = D.target;
      if (s.ball.owner === h && dist(h, p) < 1.3) {
        const hp = h.control * 0.6 + h.body * 0.4 + (h.dash ? techEff(h.dash.tech) * 1.2 : 0);
        const chance = clamp(0.5 + (p.defense + techEff(D.tech, p.bonus.bloqueo) * 1.2 - hp) / 60, 0.2, 0.93);
        if (rnd() < chance) {
          h.stun = 0.9; h.kickLock = 0.5; h.dash = null;
          take(s, p);
          s.events.push({ type: 'blockOk', x: p.x, y: p.y, elem: D.tech.elem, team: p.team, name: D.tech.name });
        } else s.events.push({ type: 'msg', text: TX('¡') + h.name + TX(' resiste el bloqueo!') });
        D.t = 0;
      }
    }
    if (D.t <= 0) { p.dash = null; if (D.tech.type === 'bloqueo' && s.ball.owner !== p) p.stun = Math.max(p.stun, 0.35); }
  }

  /* ---------- Regate normal (sin técnica) ----------
     Un recorte rápido con el balón: si hay un rival delante, intenta superarlo
     (control contra defensa); si sale bien, el rival pierde el equilibrio. */
  const DRIBBLE = { name: TX('Regate'), type: 'regate', power: 0, elem: 'neutro', plain: true };
  const DRIBBLE_CD = 2.6;   // segundos entre regates normales
  function dribble(s, p, dir) {
    if (s.ball.owner !== p || (p.dribbleCd || 0) > 0 || p.stun > 0 || p.dash) return false;
    const a = dir && Math.hypot(dir.x, dir.y) > 0.3 ? Math.atan2(dir.y, dir.x) : p.aim;
    p.aim = a; p.facing = snap8(a); s.ball.ang = a;
    p.dash = { t: 0.28, dir: a, speed: Math.max(11, p.speed * 1.55), tech: DRIBBLE };
    p.invuln = 0.3; p.dribbleCd = DRIBBLE_CD;
    s.events.push({ type: 'dribble', id: p.id, x: p.x, y: p.y, team: p.team });
    return true;
  }

  /* ---------- Entradas ---------- */
  function startTackle(s, p) {
    if (p.tackleCd > 0 || p.stun > 0 || p.tackle || p.dash) return;
    const h = s.ball.owner, b = s.ball;
    let dir = p.aim;
    if (h && h.team !== p.team && dist(h, p) < 4.5) dir = Math.atan2(h.y + h.vy * 0.15 - p.y, h.x + h.vx * 0.15 - p.x);
    else if (!h && dist(b, p) < 4.5) dir = Math.atan2(b.y - p.y, b.x - p.x);
    p.aim = dir; p.facing = snap8(dir);
    p.tackle = { t: 0.26, dir, hit: false, ok: false, target: h && h.team !== p.team ? h : null };
    p.tackleCd = 0.9;
  }

  function updateTackle(s, p, dt) {
    const T = p.tackle;
    if (T.target && s.ball.owner === T.target) {   // la carga se corrige un poco hacia el rival
      T.dir = turnTo(T.dir, Math.atan2(T.target.y - p.y, T.target.x - p.x), 7 * dt);
      p.aim = T.dir; p.facing = snap8(T.dir);
    }
    p.dvx = Math.cos(T.dir) * 10.5; p.dvy = Math.sin(T.dir) * 10.5;
    T.t -= dt;
    const h = s.ball.owner;
    if (!T.hit && h && h.team !== p.team && h.role !== 'POR' && h.invuln <= 0 && dist(h, p) < 1.15) {
      T.hit = true;
      const front = Math.cos(angDiff(Math.atan2(p.y - h.y, p.x - h.x), h.aim)) > 0 ? 0.1 : -0.12;
      const chance = clamp(0.55 + (p.defense - (h.control * 0.6 + h.body * 0.4)) / 70 + front, 0.2, 0.92);
      if (rnd() < chance) {
        T.ok = true;
        h.stun = 0.8; h.kickLock = 0.5;
        h.vx = Math.cos(T.dir) * 4; h.vy = Math.sin(T.dir) * 4;   // empujón
        if (rnd() < 0.7) take(s, p);
        else Object.assign(s.ball, { owner: null, vx: Math.cos(T.dir) * 6, vy: Math.sin(T.dir) * 6, vz: 1, lastTeam: p.team, intended: null });
        s.events.push({ type: 'tackle', ok: true, team: p.team, x: h.x, y: h.y });
        T.t = Math.min(T.t, 0.06);
      } else s.events.push({ type: 'tackle', ok: false, team: p.team, x: h.x, y: h.y });
    }
    if (T.t <= 0) {
      p.tackle = null; p.recover = T.ok ? 0.1 : 0.4;
      if (!T.ok && p.team === 'A' && p.id === s.controlledId) s.events.push({ type: 'msg', text: TX('Entrada fallida') });
    }
  }

  // Cambia al compañero que está hacia donde apunta el joystick; sin dirección, al más cercano al balón
  // Cambiar de jugador: al compañero que antes llega al balón (antes, con el joystick movido, elegía «hacia donde apuntabas»
  // y en el móvil casi siempre lo estás moviendo, así que cambiaba a quien no querías). Si pulsas otra vez enseguida, al siguiente.
  function switchPlayer(s, dir) {
    const cur = controlled(s), b = s.ball, tgt = b.owner || b;
    const mates = s.players.filter(p => p.team === 'A' && p.role !== 'POR' && p !== cur);
    const eta = p => (b.owner ? dist(p, tgt) : dist(p, interceptPoint(s, p))) / Math.max(4, p.speed);
    const order = mates.sort((m, q) => eta(m) - eta(q));
    s.swHist = (s.swHist || []).filter(h => s.t - h.t < 1.2);
    const c = order.find(m => !s.swHist.some(h => h.id === m.id)) || order[0];
    if (c) {
      s.swHist.push({ id: cur ? cur.id : null, t: s.t });
      s.controlledId = c.id; s.swT = 1.2;   // el cambio automático no te lo deshace enseguida
      s.events.push({ type: 'switch', id: c.id });
    }
  }

  // Cambio automático: si el balón está suelto o lo tiene el rival y otro compañero llega mucho antes, pasas a él
  function autoSwitch(s, dt) {
    if (s.settings.autoSwitch === 0) return;
    const me = controlled(s), b = s.ball;
    s.swT = Math.max(0, (s.swT || 0) - dt);
    const lost = s.lastOwnerTeam === 'A' && b.owner && b.owner.team === 'B';
    s.lastOwnerTeam = b.owner ? b.owner.team : s.lastOwnerTeam;
    if (!me || (b.owner && b.owner.team === 'A') || me.tackle || me.dash || (s.tech && s.tech.p === me)) return;
    if (!b.owner && b.intended && b.intended.startsWith('A')) return;   // un pase tuyo en el aire: ya va a tu jugador
    if (s.swT > 0 && !lost) return;
    const tgt = b.owner || b;
    const eta = p => (b.owner ? dist(p, tgt) : dist(p, interceptPoint(s, p))) / Math.max(4, p.speed);
    let best = me, be = eta(me);
    for (const p of s.players) {
      if (p.team !== 'A' || p.role === 'POR' || p === me || p.stun > 0) continue;
      const e = eta(p); if (e < be) { be = e; best = p; }
    }
    if (best !== me && be < eta(me) * (lost ? 0.85 : 0.6) - 0.1) {
      s.controlledId = best.id; s.swT = 0.9;
      s.events.push({ type: 'switch', id: best.id, auto: true });
    }
  }

  // Despeje del portero: balón largo y alto hacia donde apuntas (o hacia arriba)
  function clearance(s, p, dir) {
    const a = dir && Math.hypot(dir.x, dir.y) > 0.3 ? Math.atan2(dir.y, dir.x) : Math.atan2(attackDir(p.team), 0);
    const fwd = Math.sin(a) * attackDir(p.team) > 0 ? a : Math.atan2(attackDir(p.team), Math.cos(a) * 0.6);   // nunca hacia tu portería
    p.aim = fwd; p.facing = snap8(fwd); s.ball.ang = fwd; syncBall(s, 1);
    const sp = 19 + p.kick / 25;
    kick(s, p, Math.cos(fwd) * sp, Math.sin(fwd) * sp, 7.5);
    s.events.push({ type: 'shot' });
    // pasas a controlar al compañero que mejor llega a la caída del balón
    const land = { x: p.x + Math.cos(fwd) * 16, y: p.y + Math.sin(fwd) * 16 };
    const mate = s.players.filter(m => m.team === p.team && m.role !== 'POR').sort((m, q) => dist(m, land) - dist(q, land))[0];
    if (p.team === 'A' && mate) s.controlledId = mate.id;
  }
  // El portero con balón no sale de su área
  function keepInBox(p) {
    const half = F.boxW / 2 - 0.4, d = depthOf(p.team, p.y);
    p.x = clamp(p.x, cx - half, cx + half);
    if (d > F.boxD - 0.4) p.y = toAbs(p.team, 0, F.boxD - 0.4).y;
    if (d < 0.3) p.y = toAbs(p.team, 0, 0.3).y;
  }

  /* ---------- Control del jugador ---------- */
  function handleUser(s, input) {
    const me = controlled(s), b = s.ball;
    me.tkWind = 0; me.windup = null;   // al pasar a controlarlo, se olvida lo que estaba preparando su IA
    let { x, y } = input.move;
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    const pr = input.pressed;
    if (pr.has('techNext')) cycleTech(s, me);   // ⇄: cambiar de supertécnica en cualquier momento
    if (s.tech && s.tech.p === me) return;
    if (me.stun > 0 || me.recover > 0 || me.tackle || me.dash) { s.shoot.charging = false; s.pass = null; return; }

    const sprint = input.sprint || len > 0.95;
    if (len > 0.15) {
      const sp = speedOf(s, me, sprint);
      me.dvx = x * sp; me.dvy = y * sp;
      me.aim = Math.atan2(y, x); me.facing = snap8(me.aim);
    } else if ((b.intended === me.id || dist(me, b) < 7) && !b.owner) {
      const ip = interceptPoint(s, me); moveTo(s, me, ip.x, ip.y, b.intended !== me.id);   // recepción asistida / va solo a por el balón suelto
    } else { me.dvx = me.dvy = 0; }

    const auto = s.settings.techMode === 'auto';
    if (b.owner === me && me.role === 'POR') {
      // Portero con balón: pasa (toque o fuerte), saca en largo (K) o despeja (L). Si tardas mucho, despeja solo
      s.gkHold = (s.gkHold || 0) + input.dt;
      if (pr.has('A')) { if (input.passHeld) s.pass = { charge: 0, dir: { x, y } }; else { pass(s, me, 'strong', { x, y }); return; } }
      if (s.pass) {
        if (input.passHeld) { s.pass.charge = Math.min(1, s.pass.charge + input.dt / 0.7); if (len > 0.15) s.pass.dir = { x, y }; }
        else { const c = s.pass.charge, d = s.pass.dir; s.pass = null; pass(s, me, 'strong', d, c > 0.18 ? c : 0); return; }
      }
      if (pr.has('B')) { pass(s, me, 'through', { x, y }); return; }
      const gkTap = pr.has('shoot');   // un toque rápido en Despeje también vale
      if (input.shootHeld) s.shoot.charging = true;
      else if (s.shoot.charging || gkTap) { s.shoot.charging = false; s.shoot.charge = 0; clearance(s, me, { x, y }); return; }
      if (s.gkHold > 7) { clearance(s, me, null); return; }
      return;
    }
    if (me.role === 'POR') {   // sin balón vuelves a un jugador de campo
      const m = s.players.filter(q => q.team === 'A' && q.role !== 'POR').sort((q, r) => dist(q, b) - dist(r, b))[0];
      if (m) s.controlledId = m.id;
      return;
    }
    if (b.owner === me) {
      // Pase: toque = pase normal; mantener = se carga la fuerza y sale al soltar
      if (pr.has('A')) { if (input.passHeld) s.pass = { charge: 0, dir: { x, y } }; else { pass(s, me, 'strong', { x, y }); return; } }
      if (s.pass) {
        if (input.passHeld) { s.pass.charge = Math.min(1, s.pass.charge + input.dt / 0.7); if (len > 0.15) s.pass.dir = { x, y }; }
        else { const c = s.pass.charge, d = s.pass.dir; s.pass = null; pass(s, me, 'strong', d, c > 0.18 ? c : 0); return; }
      }
      if (pr.has('dribble')) { dribble(s, me, { x, y }); return; }
      pr.has('B');   // el pase al hueco se quitó del juego (22 oct, Fran): la tecla/botón ya no hace nada con balón (el portero sí saca en largo)
      if (pr.has('tech')) { tryTech(s, me, x); return; }
      if (auto && !s.shoot.charging) {
        const t = bestTech(me, 'regate');
        if (t && s.players.some(o => o.team !== me.team && o.role !== 'POR' && o.stun <= 0 && dist(o, me) < 1.8 &&
            angDiff(Math.atan2(o.y - me.y, o.x - me.x), me.aim) < 1)) { startTech(s, me, t, x); return; }
      }
      const tap = pr.has('shoot');   // toque rápido de Tiro: aunque suelte antes del siguiente fotograma, chuta
      if (tap || input.shootHeld) pr.has('switch');   // K/X con balón es tiro: que no quede pendiente «cambiar jugador»
      if (input.shootHeld) {
        s.shoot.charging = true;
        s.shoot.charge = Math.min(1, s.shoot.charge + input.dt / 0.9);
        s.shoot.aimX = x;
      } else if (s.shoot.charging || tap) {
        const ch = s.shoot.charge;
        s.shoot.charging = false; s.shoot.charge = 0;
        const t = bestTech(me, 'tiro');
        if (auto && t && goalDist(me) < 24) startTech(s, me, t, x);
        else shoot(s, me, ch, x);
      }
    } else {
      // Balón que viene hacia ti (un pase tuyo o suelto de tu equipo cerca): Pase/Tiro esperan a que lo recibas
      // (antes, pulsar Pase un instante antes de recibir hacía una entrada y no pasaba)
      const toMe = !b.owner && (b.intended === me.id || (b.lastTeam === me.team && dist(me, b) < 4));
      if (!(toMe && input.shootHeld)) { s.shoot.charging = false; s.shoot.charge = 0; }
      s.pass = null;
      if (toMe) { pr.keep('A'); pr.keep('shoot'); }
      else if (b.owner && b.owner.team === me.team) pr.has('A');   // un compañero lleva el balón: no hay entrada que hacer
      else if (pr.has('A')) startTackle(s, me);
      if (pr.has('switch')) switchPlayer(s, { x, y });
      if (pr.has('tech')) tryTech(s, me, x);
      else if (auto) {
        const h = b.owner, t = bestTech(me, 'bloqueo');
        if (t && h && h.team !== me.team && h.role !== 'POR' && dist(h, me) < 2.5) startTech(s, me, t, 0);
      }
    }
  }

  /* ---------- IA ---------- */
  function homeTarget(s, p) {
    const [ox, oy] = p.home || BASE[p.role], b = s.ball;
    const att = possession(s) === p.team;
    let depth = oy + (depthOf(p.team, b.y) - F.l / 2) * 0.45 + (att ? (p.role === 'DEF' ? 2 : 6) : -2);
    depth = clamp(depth, p.role === 'DEF' ? 5 : 8, F.l - 3);
    const bRel = (b.x - cx) * (p.team === 'A' ? 1 : -1);
    const a = toAbs(p.team, ox + bRel * 0.35, depth);
    a.x = clamp(a.x, 1.5, F.w - 1.5);
    if (att) a.y = onside(s, p, a.y);   // los atacantes no se quedan en fuera de juego
    return a;
  }

  function chaserFor(s, team) {
    let best = null, bd = Infinity;
    for (const p of s.players) {
      if (p.team !== team || p.role === 'POR' || p.stun > 0) continue;
      const d = dist(p, s.ball); if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  function interceptPoint(s, p) {
    const b = s.ball, k = b.z > 0.05 ? 0.12 : 0.85;
    let t = dist(p, b) / Math.max(4, p.speed * 1.3), x = b.x, y = b.y;
    for (let i = 0; i < 3; i++) {
      const f = (1 - Math.exp(-k * t)) / k;
      x = b.x + b.vx * f; y = b.y + b.vy * f;
      t = Math.hypot(x - p.x, y - p.y) / Math.max(4, p.speed * 1.3);
    }
    return { x: clamp(x, -1, F.w + 1), y: clamp(y, -1, F.l + 1) };
  }

  function openMate(s, p) {
    let best = null, bs = -Infinity;
    for (const m of s.players) {
      if (m.team !== p.team || m === p || m.role === 'POR' || dist(m, p) < 3) continue;
      let open = 99;
      for (const o of s.players) if (o.team !== p.team) open = Math.min(open, dist(o, m));
      const sc = Math.min(open, 8) + (depthOf(p.team, m.y) - depthOf(p.team, p.y)) * 0.25;
      if (sc > bs) { bs = sc; best = m; }
    }
    return best;
  }

  function ai(s, p, dt) {
    const b = s.ball;
    if (p.stun > 0 || p.recover > 0 || p.tackle || p.dash || (s.tech && s.tech.p === p)) { if (!p.tackle && !p.dash) p.dvx = p.dvy = 0; return; }
    if (b.owner === p) p.tkWind = 0;   // si se queda el balón, ya no hay entrada que hacer
    else if (p.tkWind > 0) {          // preparando la entrada (aviso «!»)
      p.tkWind -= dt; p.dvx = p.dvy = 0;
      if (p.tkWind <= 0) { p.tkWind = 0; if (b.owner && b.owner.team !== p.team) startTackle(s, p); }
      return;
    }
    if (p.role === 'POR') return gkAI(s, p, dt);
    if (b.owner === p) return holderAI(s, p, dt);
    p.windup = null;
    if (!b.owner) {
      const rec = b.intended ? s.players.find(q => q.id === b.intended) : null;
      const chase = rec && rec.team === p.team ? rec === p : chaserFor(s, p.team) === p;
      if (chase) { const ip = interceptPoint(s, p); moveTo(s, p, ip.x, ip.y, true); return; }
      const h = homeTarget(s, p); moveTo(s, p, h.x, h.y, false); return;
    }
    if (b.owner.team === p.team) {
      const h = homeTarget(s, p);
      let tx = h.x + Math.sin(s.t * 0.7 + p.num) * 2, ty = h.y;
      const hd = dist(p, b.owner);
      if (hd < 5) { tx += (p.x - b.owner.x) / (hd || 1) * 3; ty += (p.y - b.owner.y) / (hd || 1) * 3; }
      ty = onside(s, p, ty);
      moveTo(s, p, tx, ty, dist(p, { x: tx, y: ty }) > 7);
      return;
    }
    defendAI(s, p, dt);
  }

  function defendAI(s, p, dt) {
    const h = s.ball.owner, gy = ownGoalY(p.team);
    const pressers = s.players.filter(q => q.team === p.team && q.role !== 'POR' && q.stun <= 0 && q.id !== s.controlledId)
      .sort((a, q) => dist(a, h) - dist(q, h));
    if (h.role === 'POR') {   // portero con el balón: no se le puede robar, así que se cubren los pases
      const o = (s.marks && s.marks[p.id]) || null;
      if (o && o !== h) { const gx = cx - o.x, gl = Math.hypot(gx, h.y - o.y) || 1; moveTo(s, p, o.x + gx / gl * 1.2, o.y + (h.y - o.y) / gl * 1.2, false); }
      else { const t = toAbs(h.team, 0, F.boxD + 3); moveTo(s, p, t.x + (p.x - cx) * 0.6, t.y, false); }
      return;
    }
    if (pressers[0] === p) {
      // Presión: va a donde estará el rival (no a donde está), siempre por el lado de su portería
      const fx = h.x + h.vx * 0.35, fy = h.y + h.vy * 0.35;
      const gx = cx - fx, gyy = gy - fy, gl = Math.hypot(gx, gyy) || 1;
      moveTo(s, p, fx + gx / gl * 0.6, fy + gyy / gl * 0.6, true);
      if (h.role !== 'POR' && h.invuln <= 0) {
        const d = dist(p, h), use = p.team === 'B' ? s.diff.techUse : 0.6;
        const t = bestTech(p, 'bloqueo');
        if (t && !s.tech && d < 3 && rnd() < use * dt * 1.5) { startTech(s, p, t, 0); return; }
        const tk = p.team === 'B' ? s.diff.tackle : 0.6;
        if (d < 2.2 && p.tackleCd <= 0 && rnd() < tk * dt * 2.5) { p.tkWind = p.team === 'B' ? 0.18 : 0.22; }
      }
      return;
    }
    const o = (s.marks && s.marks[p.id]) || null;   // rival asignado a este defensor
    if (!o || o === h) {
      const gx = cx - h.x, gyy = gy - h.y, gl = Math.hypot(gx, gyy) || 1;
      moveTo(s, p, h.x + gx / gl * 4, h.y + gyy / gl * 4, true); return;
    }
    const gx = cx - o.x, gyy = gy - o.y, gl = Math.hypot(gx, gyy) || 1;
    const hm = homeTarget(s, p), sm = p.team === 'B' ? s.diff.smart : 0.8;
    const sideX = o.x + gx / gl * 1.8, sideY = o.y + gyy / gl * 1.8;                 // entre su marca y la portería
    const laneX = o.x + (h.x - o.x) * 0.3, laneY = o.y + (h.y - o.y) * 0.3;          // tapando la línea de pase
    const mx = sideX * (1 - sm * 0.45) + laneX * sm * 0.45, my = sideY * (1 - sm * 0.45) + laneY * sm * 0.45;
    const tx = mx * 0.8 + hm.x * 0.2, ty = my * 0.8 + hm.y * 0.2;
    moveTo(s, p, tx, ty, dist(p, { x: tx, y: ty }) > 5);
  }

  function assignMarks(s) {
    const h = s.ball.owner; s.marks = {};
    if (!h) return;
    const def = h.team === 'A' ? 'B' : 'A';
    const ds = s.players.filter(p => p.team === def && p.role !== 'POR' && p.id !== s.controlledId);
    const os = s.players.filter(q => q.team === h.team && q.role !== 'POR' && q !== h);
    const used = new Set();
    for (const d of ds.sort((a, b) => depthOf(def, a.y) - depthOf(def, b.y))) {
      let best = null, bd = Infinity;
      for (const o of os) { if (used.has(o)) continue; const dd = dist(d, o); if (dd < bd) { bd = dd; best = o; } }
      if (best) { used.add(best); s.marks[d.id] = best; }
    }
  }

  // Cuántos rivales tapan la línea entre p y un punto (para pases y tiros)
  function laneBlock(s, p, tx, ty, margin, skipGK) {
    let n = 0; const dx = tx - p.x, dy = ty - p.y, L2 = dx * dx + dy * dy || 1;
    for (const o of s.players) {
      if (o.team === p.team || o.stun > 0 || (skipGK && o.role === 'POR')) continue;
      const t = ((o.x - p.x) * dx + (o.y - p.y) * dy) / L2; if (t < 0.05 || t > 1) continue;
      if (Math.hypot(p.x + dx * t - o.x, p.y + dy * t - o.y) < margin) n++;
    }
    return n;
  }
  // Mejor compañero para pasar: libre, con la línea limpia y, si puede ser, más adelantado
  function bestPassTarget(s, p) {
    let best = null;
    for (const m of s.players) {
      if (m.team !== p.team || m === p || m.role === 'POR' || m.stun > 0) continue;
      const d = dist(m, p); if (d < 3) continue;
      let open = 9; for (const o of s.players) if (o.team !== p.team) open = Math.min(open, dist(o, m));
      const prog = depthOf(p.team, m.y) - depthOf(p.team, p.y);
      const sc = Math.min(open, 7) + prog * 0.3 - laneBlock(s, p, m.x, m.y, 1.1, false) * 5 - (d > 18 ? 2 : 0) - (isOffside(s, m) ? 20 : 0);
      if (!best || sc > best.score) best = { p: m, score: sc, open };
    }
    return best;
  }

  function holderAI(s, p, dt) {
    const goalY = oppGoalY(p.team), g = { x: cx, y: goalY }, d = dist(p, g);
    if (p.windup) {      // cargando el tiro
      const w = p.windup; w.t -= dt; w.c = Math.min(1, w.c + dt / 0.42);
      p.dvx = p.dvy = 0; p.aim = Math.atan2(goalY - p.y, cx - p.x); p.facing = snap8(p.aim);
      if (w.t <= 0 || p.stun > 0) { p.windup = null; if (p.stun <= 0) shoot(s, p, w.c, w.aimX); }
      return;
    }
    let near = null, nd = Infinity;
    const opp = s.players.filter(q => q.team !== p.team && q.role !== 'POR' && q.stun <= 0);
    for (const q of opp) { const e = dist(q, p); if (e < nd) { nd = e; near = q; } }
    const rival = p.team === 'B', smart = rival ? s.diff.smart : 0.8;
    p.think -= dt;
    if (p.think <= 0) {
      p.think = (rival ? s.diff.think : 0.3) * (0.6 + rnd() * 0.8);
      const gk = s.players.find(q => q.team !== p.team && q.role === 'POR');
      const side = gk && Math.abs(gk.x - cx) > 0.3 ? (gk.x > cx ? -1 : 1) : (rnd() < 0.5 ? -1 : 1);   // al palo contrario al portero
      const aimX = side * (0.55 + rnd() * 0.4);
      const lateral = Math.abs(p.x - cx), ahead = Math.abs(goalY - p.y);
      const goodAngle = lateral < ahead * 0.9 + 2.5;
      const clear = laneBlock(s, p, cx + aimX * (F.goalW / 2 - 0.35), goalY, 1.0, true) === 0;
      const shotT = bestTech(p, 'tiro'), dribT = bestTech(p, 'regate');
      const aimGoal = () => { p.aim = Math.atan2(goalY - p.y, cx - p.x); p.facing = snap8(p.aim); };
      // Supertécnica de tiro: cerca y con buen ángulo
      if (!s.tech && shotT && d < 16 && goodAngle && (clear || d < 10) && rnd() < s.diff.techUse * (rival ? 1 : 0.8)) { aimGoal(); startTech(s, p, shotT, aimX); return; }
      // Tiro normal: solo con una buena ocasión (o si está encima de la portería)
      // La IA también carga el tiro: se para un momento (se ve la barra) y chuta con fuerza
      if ((d < (rival ? s.diff.shootRange : 14) && goodAngle && clear && rnd() < 0.35 + 0.65 * smart) || d < 6.5) {
        aimGoal(); p.windup = { t: d < 6.5 ? 0.22 : 0.38 + rnd() * 0.2, c: 0.3 + rnd() * 0.2, aimX }; return;
      }
      if (!s.tech && dribT && nd < 2.4 && rnd() < s.diff.techUse) { startTech(s, p, dribT, 0); return; }
      const m = bestPassTarget(s, p), mine = Math.min(nd, 7);
      if (m && m.score > 0 && ((nd < 2.8 && rnd() < 0.5 + 0.4 * smart) || (m.score > mine + 2.5 && rnd() < 0.4 * smart) || rnd() < 0.04)) {
        const ahead2 = depthOf(p.team, m.p.y) > depthOf(p.team, p.y) + 3;
        pass(s, p, ahead2 && m.open > 3 && rnd() < 0.5 ? 'through' : 'strong', { x: m.p.x - p.x, y: m.p.y - p.y }); return;
      }
    }
    // Conducción: hacia la portería buscando el hueco más libre y lejos de la banda
    const base = Math.atan2(goalY - p.y, cx - p.x);
    let bestA = base, bs = -Infinity;
    for (const off of [0, -0.45, 0.45, -0.9, 0.9]) {
      const a = base + off, px = p.x + Math.cos(a) * 3, py = p.y + Math.sin(a) * 3;
      let free = 9; for (const o of opp) free = Math.min(free, Math.hypot(o.x - px, o.y - py));
      const edge = Math.min(px, F.w - px), pen = edge < 2.5 ? (2.5 - edge) * 3 : 0;
      const sc = Math.min(free, 5) * smart - Math.abs(off) * 0.8 - pen;
      if (sc > bs) { bs = sc; bestA = a; }
    }
    const dx = Math.cos(bestA), dy = Math.sin(bestA);
    const sp = speedOf(s, p, nd > 3 && p.stamina > 0.35);
    p.dvx = dx * sp; p.dvy = dy * sp;
    p.aim = bestA; p.facing = snap8(p.aim);
  }

  function gkAI(s, p, dt) {
    const b = s.ball, half = F.goalW / 2;
    const homeY = ownGoalY(p.team) + attackDir(p.team) * 1.2;
    if (b.owner === p) {
      p.dvx = p.dvy = 0; p.holdT += dt;
      if (p.holdT > 1.1) { const m = openMate(s, p); if (m) pass(s, p, 'strong', { x: m.x - p.x, y: m.y - p.y }); else p.holdT = 0.5; }
      return;
    }
    if (b.shot && !b.shot.resolved && b.shot.team !== p.team) {
      // Parada especial: el portero usa su técnica si el tiro es peligroso
      if (!p.gkTech) {
        const t = bestTech(p, 'parada');
        const vy0 = Math.abs(b.vy) > 0.1 ? b.vy : 0.1, tt = (ownGoalY(p.team) - b.y) / vy0;
        const onTarget = tt > 0 && Math.abs(b.x + b.vx * tt - cx) < F.goalW / 2 + 0.6;
        if (t && onTarget && (b.shot.tech || b.shot.power > p.gk + 4) && (p.team === 'A' || b.shot.tech || rnd() < s.diff.techUse)) {
          p.gkTech = t; spend(p, t);
          s.events.push({ type: 'techStart', name: t.name, elem: t.elem, kind: 'parada', team: p.team, id: p.id, quick: true });
          s.slow = Math.max(s.slow, 0.9);
        } else p.gkTech = 'none';
      }
      p.react -= dt;
      if (p.react > 0) { p.dvx = p.dvy = 0; return; }
      const vy = Math.abs(b.vy) > 0.1 ? b.vy : 0.1, t = (p.y - b.y) / vy;
      const cross = clamp(t > 0 ? b.x + b.vx * t : b.x, cx - half - 0.8, cx + half + 0.8);
      const dive = 5.6 + p.gk / 28 + (p.gkTech && p.gkTech !== 'none' ? 2 : 0), dx = cross - p.x, dy = homeY - p.y, d = Math.hypot(dx, dy);
      if (d > 0.05) { const sp = Math.min(dive, d / Math.max(dt, 0.001)); p.dvx = dx / d * sp; p.dvy = dy / d * sp; }
      else p.dvx = p.dvy = 0;
      p.diving = true; return;
    }
    p.diving = false; p.gkTech = null;
    p.react = p.team === 'B' ? s.diff.react + 0.05 : 0.09;
    if (!b.owner && inOwnBox(p.team, b)) {
      const opp = s.players.filter(q => q.team !== p.team).reduce((m, q) => Math.min(m, dist(q, b)), 99);
      if (dist(p, b) < opp) { moveTo(s, p, b.x, b.y, true); return; }
    }
    // Cubre el ángulo: se pone entre el balón y el centro de la portería y sale un poco si el balón se acerca
    const bd = depthOf(p.team, b.y), out = clamp((14 - bd) * 0.12, 0, 1.4);
    moveTo(s, p, cx + clamp((b.x - cx) * 0.42, -half + 0.3, half - 0.3), homeY + attackDir(p.team) * out, false);
  }

  /* ---------- Balón, paradas, robos y saques ---------- */
  function resolveSave(s, g) {
    const b = s.ball, shot = b.shot;
    shot.resolved = true;
    const gt = g.gkTech && g.gkTech !== 'none' ? g.gkTech : null;
    const saveStr = g.gk + (gt ? techEff(gt, g.bonus.parada) : 0);
    // Desde lejos el tiro pierde fuerza; sin técnica, el portero tiene ventaja
    const far = Math.max(0, shot.dist - 10);
    const edge = shot.power - saveStr - 7 - (shot.tech ? 0 : shot.charged ? 3 : 9) - far * (shot.tech ? 1.8 : 2.2);
    const chance = clamp(1 / (1 + Math.exp(edge / 14)), 0.04, 0.96);
    if (rnd() < chance) {
      if (edge < -14 && !shot.tech) { take(s, g); s.events.push({ type: 'catch', team: g.team, tech: !!gt }); return; }
      b.vy = -b.vy * 0.3; b.vx = (rnd() - 0.5) * 10; b.vz = 3; b.shot = null; b.fire = null; b.lastTeam = g.team;
      g.kickLock = 0.5;
      s.events.push({ type: 'save', team: g.team, x: b.x, y: b.y, big: !!shot.tech || !!gt, elem: gt ? gt.elem : null, name: gt ? gt.name : null });
      if (gt || shot.tech) s.hitstop = 0.22;
    } else {
      b.vx *= 0.85; b.vy *= 0.85; g.stun = 0.9;
      if (gt) s.events.push({ type: 'beaten', x: g.x, y: g.y, elem: gt.elem });
    }
  }

  // Balón fuera: saque de banda, de puerta o córner, según por dónde sale y quién la tocó
  function outOfPlay(s) {
    const b = s.ball, other = b.lastTeam === 'A' ? 'B' : 'A';
    let kind, team, x, y;
    if (b.x < 0 || b.x > F.w) { kind = 'banda'; team = other; x = b.x < 0 ? 0.25 : F.w - 0.25; y = clamp(b.y, 1, F.l - 1); }
    else {
      const def = b.y < 0 ? 'B' : 'A';            // quién defiende esa portería
      if (b.lastTeam === def) { kind = 'corner'; team = def === 'A' ? 'B' : 'A'; x = b.x < cx ? 0.5 : F.w - 0.5; y = b.y < 0 ? 0.5 : F.l - 0.5; }
      else { kind = 'puerta'; team = def; const a = toAbs(def, 0, 2.6); x = a.x; y = a.y; }
    }
    Object.assign(b, { vx: 0, vy: 0, vz: 0, shot: null, fire: null, intended: null, offside: null });
    s.events.push({ type: 'setpiece', kind, team });
    s.pause = { t: 1.0, then: () => restart(s, team, x, y, kind) };
  }
  function offsideCall(s, m) {
    const team = m.team === 'A' ? 'B' : 'A', x = clamp(m.x, 1, F.w - 1), y = clamp(m.y, 1, F.l - 1);
    Object.assign(s.ball, { vx: 0, vy: 0, vz: 0, shot: null, fire: null, intended: null, offside: null });
    s.events.push({ type: 'setpiece', kind: 'offside', team, x, y });
    s.pause = { t: 1.2, then: () => restart(s, team, x, y, 'libre') };
  }

  function restart(s, team, x, y, kind) {
    const spot = { x, y };
    const cand = kind === 'puerta' ? s.players.find(p => p.team === team && p.role === 'POR')
      : s.players.filter(p => p.team === team && (p.role !== 'POR' || inOwnBox(team, spot))).sort((a, q) => dist(a, spot) - dist(q, spot))[0];
    cand.x = x; cand.y = y; cand.vx = cand.vy = 0;
    cand.aim = kind === 'corner' ? Math.atan2(oppGoalY(team) + attackDir(team) * -6 - y, cx - x) : Math.atan2(F.l / 2 - y, cx - x);
    cand.facing = snap8(cand.aim);
    const room = kind === 'corner' ? 6 : 4;
    for (const o of s.players) {
      if (o.team === team || o === cand) continue;
      const d = dist(o, spot);
      if (d < room) { const ux = (o.x - x) / (d || 1), uy = (o.y - y) / (d || 1); o.x = clamp(x + ux * room, 0.5, F.w - 0.5); o.y = clamp(y + uy * room, 0.5, F.l - 0.5); }
    }
    take(s, cand);
    s.ball.setPiece = cand.id;   // el primer pase de un saque no puede ser fuera de juego
    cand.think = 0.5;
    s.pause = { t: 0.35 };
  }

  function goal(s, team) {
    s.score[team]++;
    s.ball.fire = null;
    const scorer = s.ball.shot && s.players.find(q => q.id === s.ball.shot.by && q.team === team);
    (s.goalLog = s.goalLog || []).push({ team, key: scorer ? scorer.key : null });
    s.events.push({ type: 'goal', team, x: s.ball.x, y: s.ball.y, tech: s.ball.shot && s.ball.shot.tech ? s.ball.shot.tech.elem : null });
    if (s.ball.shot && s.ball.shot.tech) s.hitstop = 0.3;
    // Golden goal, o «paliza»: con settings.mercy (roguelite = 5) el partido acaba al llegar a esa diferencia de goles
    const mercy = s.settings.mercy > 0 && Math.abs(s.score.A - s.score.B) >= s.settings.mercy;
    if (s.golden || mercy) { if (mercy) s.events.push({ type: 'mercy', team }); s.pause = { t: 2.0, then: () => finish(s) }; return; }
    s.pause = { t: 2.0, then: () => kickoff(s, team === 'A' ? 'B' : 'A') };
  }

  function finish(s) {
    s.over = true;
    s.result = s.score.A > s.score.B ? 'win' : s.score.A < s.score.B ? 'loss' : 'draw';
    s.events.push({ type: 'end', result: s.result });
  }

  function updateBall(s, dt) {
    const b = s.ball;
    if (s.tech && s.tech.tech.type === 'tiro') return;
    if (b.owner) {
      syncBall(s, dt);
      // Llevar el balón más allá de una línea = fuera (banda, puerta o córner). Ya no se puede rodear la portería por detrás.
      // Solo cuenta como gol si entras con él por la boca de la portería.
      if (b.y < 0 || b.y > F.l || b.x < 0 || b.x > F.w) {
        const p = b.owner, inMouth = (b.y < 0 || b.y > F.l) && b.x > 0 && b.x < F.w && Math.abs(b.x - cx) < F.goalW / 2;
        Object.assign(b, { owner: null, lastTeam: p.team, vx: 0, vy: 0, vz: 0 });
        if (inMouth) goal(s, b.y < 0 ? 'A' : 'B'); else outOfPlay(s);
      }
      return;
    }
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.vz -= 20 * dt;
    if (b.z < 0) { b.z = 0; b.vz = b.vz < -2 ? -b.vz * 0.45 : 0; }
    const k = b.z > 0.05 ? 0.12 : 0.85, f = Math.exp(-k * dt);
    b.vx *= f; b.vy *= f;
    const sp = Math.hypot(b.vx, b.vy);
    if (b.intended && sp < 1.5) b.intended = null;

    if (b.y < 0 || b.y > F.l) {
      const inMouth = Math.abs(b.x - cx) < F.goalW / 2 && b.z < F.barZ;
      if (inMouth) goal(s, b.y < 0 ? 'A' : 'B'); else outOfPlay(s);
      return;
    }
    if (b.x < 0 || b.x > F.w) { outOfPlay(s); return; }

    if (b.shot && !b.shot.resolved) {
      const g = s.players.find(p => p.role === 'POR' && p.team !== b.shot.team);
      const reach = 1.1 + g.gk / 100 * 0.9 + (g.gkTech && g.gkTech !== 'none' ? 0.5 : 0);
      // Duelo: un tiro especial a puerta siempre se enfrenta al portero cuando pasa a su altura
      const crossed = b.shot.tech && (b.y - g.y) * (b.y - b.vy * dt - g.y) <= 0 && Math.abs(b.x - cx) < F.goalW / 2 + 0.8;
      if (g.stun <= 0 && ((dist(g, b) < reach && b.z < 2.4) || crossed)) resolveSave(s, g);
      if (b.owner) return;
    }

    // Imán suave: el balón suelto y lento se acerca a tu jugador si está cerca
    const me = controlled(s);
    if (me && sp < 7 && b.z < 0.5 && me.stun <= 0 && me.kickLock <= 0) {
      const d = dist(me, b);
      if (d < 2.6 && d > 0.3) { b.vx += (me.x - b.x) / d * 12 * dt; b.vy += (me.y - b.y) / d * 12 * dt; }
    }

    let best = null, bd = Infinity;
    for (const p of s.players) {
      if (p.stun > 0 || p.kickLock > 0) continue;
      const isGK = p.role === 'POR' && inOwnBox(p.team, b);
      if (isGK && b.shot && !b.shot.resolved && b.shot.team !== p.team) continue;
      const r = isGK ? 1.0 : p.id === s.controlledId ? 1.25 : 0.75, maxZ = isGK ? 2.3 : p.id === s.controlledId ? 1.2 : 1.0;
      if (b.z > maxZ) continue;
      if (!isGK && sp > 16 && b.intended !== p.id) continue;
      const d = dist(p, b);
      if (d < r && d < bd) { bd = d; best = p; }
    }
    if (best) {
      if (b.offside && best.id === b.offside) { offsideCall(s, best); return; }
      const prevTeam = b.lastTeam;
      take(s, best);
      if (best.team !== prevTeam && best.team === 'A') s.events.push({ type: 'msg', text: TX('¡Balón recuperado!') });
    }
  }

  function checkSteals(s, dt) {
    const h = s.ball.owner;
    if (!h || h.role === 'POR' || h.invuln > 0) return;
    const hs = Math.hypot(h.vx, h.vy);
    for (const d of s.players) {
      if (d.team === h.team || d.stun > 0 || d.tackle || d.dash || dist(d, h) > 0.95) continue;
      const behind = Math.cos(angDiff(Math.atan2(d.y - h.y, d.x - h.x), h.aim)) < 0;
      let rate = (d.team === 'B' ? s.diff.steal : 1.1) * (d.defense / (h.control * 0.6 + h.body * 0.4));
      if (behind && hs > 5) rate *= 0.3;
      if (rnd() < rate * dt) {
        h.stun = 0.45; h.kickLock = 0.4;
        take(s, d);
        if (d.team === 'A') s.events.push({ type: 'msg', text: TX('¡Robo!') });
        return;
      }
    }
  }

  // Búfer de entrada: un botón pulsado se guarda 0,25 s. Así no se pierde si cae en un momento en que tu jugador
  // no puede actuar (justo al recibir, tras una entrada, en el «congelado» de un golpe…) o entre dos fotogramas.
  const BUF_T = 0.25;
  function bufferInput(s, input, dtRaw) {
    const B = s.inBuf || (s.inBuf = {});
    for (const k in B) { B[k] -= dtRaw; if (B[k] <= 0) delete B[k]; }
    for (const a of input.pressed || []) B[a] = BUF_T;
    return Object.assign({}, input, { pressed: { has: a => { if (B[a] > 0) { delete B[a]; return true; } return false; }, peek: a => B[a] > 0,
      keep: a => { if (B[a] > 0) B[a] = BUF_T; } } });   // copia: no se toca la entrada original; keep = alargar la espera
  }

  function update(s, input, dtRaw) {
    if (s.over) return;
    input = bufferInput(s, input, dtRaw);
    if (s.hitstop > 0) { s.hitstop -= dtRaw; return; }   // congelado de impacto
    // Cámara lenta: al cargar una técnica y mientras vuela un tiro especial
    const sm = s.settings.slowmo !== 0, sh = s.ball.shot;
    const flying = sh && sh.tech && !sh.resolved;
    const slowK = s.tech ? (s.tech.tech.type === 'tiro' ? (sm ? 0.3 : 0.6) : (sm ? 0.45 : 0.7))
      : flying ? (sm ? 0.45 : 1) : s.slow > 0 ? (sm ? 0.45 : 0.75) : 1;
    const dt = dtRaw * slowK * GAME_SPEED;
    s.slow = Math.max(0, s.slow - dtRaw);
    if (s.pause) {
      s.pause.t -= dtRaw;
      if (s.pause.t <= 0) { const fn = s.pause.then; s.pause = null; fn && fn(); }
      return;
    }
    s.t += dt;
    s.time -= dt / GAME_SPEED;
    if (s.time <= 0) {
      s.time = 0;
      if (s.score.A === s.score.B && s.settings.golden && !s.golden) {
        s.golden = true; s.time = 60;
        s.events.push({ type: 'golden' });
        s.pause = { t: 1.6, then: () => kickoff(s, Math.random() < 0.5 ? 'A' : 'B') };
        return;
      }
      finish(s); return;
    }

    for (const p of s.players) p.sprint = false;
    assignMarks(s);
    input.dt = dt;
    if (!s.settings.allAI) { autoSwitch(s, dt); handleUser(s, input); }
    for (const p of s.players) if (s.settings.allAI || p.id !== s.controlledId) ai(s, p, dt);
    updateTech(s, dt);

    for (const p of s.players) {
      p.stun = Math.max(0, p.stun - dt); p.recover = Math.max(0, (p.recover || 0) - dt); p.kickT = Math.max(0, p.kickT - dt); p.kickLock = Math.max(0, p.kickLock - dt);
      p.tackleCd = Math.max(0, p.tackleCd - dt); p.invuln = Math.max(0, p.invuln - dt); p.dribbleCd = Math.max(0, (p.dribbleCd || 0) - dt);
      for (const k in p.cd) p.cd[k] = Math.max(0, p.cd[k] - dt);
      if (p.dash) updateDash(s, p, dt);
      else if (p.tackle) updateTackle(s, p, dt);
      else if (p.stun > 0 || p.recover > 0) { p.dvx = p.dvy = 0; }
      // Aceleración alta = frenadas y giros secos, sin deslizar
      const accRate = p.diving ? 60 : (p.tackle || p.dash) ? 90 : p.id === s.controlledId ? 55 : 38;
      const acc = accRate * dt;
      let ax = p.dvx - p.vx, ay = p.dvy - p.vy; const al = Math.hypot(ax, ay);
      if (al > acc) { ax *= acc / al; ay *= acc / al; }
      p.vx += ax; p.vy += ay;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const e = 1.3;   // no se meten en las gradas
      p.x = clamp(p.x, -e, F.w + e); p.y = clamp(p.y, -e, F.l + e);
      if (p.role === 'POR' && s.ball.owner === p) keepInBox(p);
      const spd = Math.hypot(p.vx, p.vy);
      p.moving = spd > 0.6;
      if (p.id !== s.controlledId && spd > 0.8 && !p.tackle && !p.dash && s.ball.owner !== p) { p.aim = Math.atan2(p.vy, p.vx); p.facing = snap8(p.aim); }
      if (p.sprint && p.moving) { p.stamina -= 0.24 * p.stamDrain * dt; if (p.stamina <= 0) { p.stamina = 0; p.tired = true; } }
      else p.stamina = Math.min(1, p.stamina + 0.1 * (p.bonus.recobro || 1) * dt);
      if (p.tired && p.stamina > 0.3) p.tired = false;
      if (!(s.tech && s.tech.p === p)) p.z = Math.max(0, p.z - 6 * dt);
    }
    const ps = s.players;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], c = ps[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy);
      if (d > 0 && d < 0.7) { const push = (0.7 - d) / 2; a.x -= dx / d * push; a.y -= dy / d * push; c.x += dx / d * push; c.y += dy / d * push; }
    }
    updateBall(s, dt);
    if (!s.pause) checkSteals(s, dt);
  }

  return { FIELD: F, DRIBBLE_CD, techChoices, createMatch, update, possession, controlled, contextTech, _t: { take, startTech, shoot, goal } };
})();

/* =====================================================================
   DATOS, COLECCIÓN (gacha) Y RECORRIDO (roguelite)
   GAME viene de tus archivos del juego de DS (jugadores, técnicas, equipos).
   ===================================================================== */
const TECH = id => GAME.techniques[String(id)];
// Se muestra el mote oficial del juego (Gazelle, Torch, Sharp…); el nombre completo queda en p.full para el perfil
const PBY = {}; GAME.players.forEach(p => { PBY[p.id] = p; p.full = p.name; if (p.nick) p.name = p.nick + ((p.full.match(/ \((IE2|IE3|Oscuro)\)$/) || [''])[0]); });
const PLAYER = id => PBY[id];
const playsAs = (pd, r) => !!pd && (pd.role === r || !!pd.anyRole);   // anyRole: jugadores especiales que valen para cualquier puesto
const TEAM = key => GAME.teams.find(t => t.key === key);
const EVO = id => GAME.evo[String(id)];
const RIVAL_ORDER = GAME.teams.filter(t => t.kind === 'story').map(t => t.key);   // Etapa 1, en orden de la historia
const STAGE_ORDER = { s1: RIVAL_ORDER, s2: GAME.teams.filter(t => t.kind === 'story2').map(t => t.key),   // Etapa 2: Inazuma Eleven 2
  s3: GAME.teams.filter(t => t.kind === 'story3').map(t => t.key), s4: GAME.teams.filter(t => t.kind === 'story4').map(t => t.key) };   // Etapa 3: fase 1 y fase 2
const STAGE_NAME = { s1: TX('Etapa 1'), s2: TX('Etapa 2'), s3: TX('Etapa 3 · Fase 1'), s4: TX('Etapa 3 · Fase 2') };
const NATIONS = GAME.teams.filter(t => t.kind === 'story3' || t.kind === 'story4').map(t => t.key);

/* ---------- Formaciones de 5 ---------- */
const FORMATIONS = {
  '1-2-1-1': { name: TX('Defensiva'),    roles: ['POR', 'DEF', 'DEF', 'MED', 'DEL'] },
  '1-1-2-1': { name: TX('Equilibrada'),  roles: ['POR', 'DEF', 'MED', 'MED', 'DEL'] },
  '1-1-1-2': { name: TX('Ofensiva'),     roles: ['POR', 'DEF', 'MED', 'DEL', 'DEL'] },
  '1-2-0-2': { name: TX('Directa'),      roles: ['POR', 'DEF', 'DEF', 'DEL', 'DEL'] },
  '1-0-2-2': { name: TX('Ataque total'), roles: ['POR', 'MED', 'MED', 'DEL', 'DEL'] },
  '1-2-2-0': { name: TX('Muralla'),      roles: ['POR', 'DEF', 'DEF', 'MED', 'MED'] },
  '1-3-0-1': { name: TX('Cerrojo'),      roles: ['POR', 'DEF', 'DEF', 'DEF', 'DEL'] },
};
const SPREAD = { 1: [0], 2: [-7, 7], 3: [-10, 0, 10] };
const DEPTH = { POR: 1.2, DEF: 11, MED: 21, DEL: 31 };
const KODEPTH = { POR: 1.2, DEF: 9, MED: 16, DEL: 22 };
// Posición base (x, distancia a tu portería) de cada puesto según cuántos hay de cada tipo
function layout(roles) {
  const cnt = {}, idx = {};
  roles.forEach(r => { cnt[r] = (cnt[r] || 0) + 1; });
  return roles.map(r => {
    const i = idx[r] = (idx[r] || 0); idx[r]++;
    const x = r === 'POR' ? 0 : (SPREAD[cnt[r]] || [0])[i] + (cnt[r] === 1 ? (r === 'MED' ? 3 : r === 'DEL' ? -2 : 0) : 0);
    return { role: r, home: [x, DEPTH[r]], ko: [x * 0.8, KODEPTH[r]] };
  });
}

/* ---------- Campos por equipo ---------- */
const TEAM_FIELD = { Occult: 'noche', Wild: 'jungla', Brain: 'normal', Otaku: 'atardecer', Shuriken: 'nieve', Farm: 'atardecer',
  Kirkwood: 'normal', 'Royal Academy': 'acero', Zeus: 'cielo', 'Inazuma Kids FC': 'normal', Sallys: 'atardecer', Umbrella: 'noche',
  Veteranos: 'acero', 'Tanques Centella': 'volcan', 'Ultra Zeus': 'volcan', Airosos: 'cielo', Guardabosques: 'jungla',
  Ardientes: 'volcan', 'Montañeros': 'nieve', 'Pistolas Centella': 'noche', 'Bombas Centella': 'noche', 'Cohetes Centella': 'noche', 'Jets Centella': 'noche',
  'Tormenta de Géminis': 'noche', Alpino: 'nieve', 'Épsilon': 'acero', 'Claustro Sagrado': 'atardecer', Fauxshore: 'normal', 'Royal Academy Redux': 'acero',
  'Épsilon Plus': 'noche', 'Emperadores Oscuros': 'volcan', 'Génesis': 'cielo', Prominence: 'volcan', 'Polvo de Diamantes': 'nieve', Caos: 'volcan' };

/* ---------- Modos ---------- */
const SPECIALS = [   // equipos especiales: se abren al avanzar en la Etapa 1
  { key: 'Inazuma Kids FC', unlock: 0, boost: 0.92 },
  { key: 'Sallys', unlock: 2, boost: 0.95 },
  { key: 'Umbrella', unlock: 4, boost: 1.0 },
  { key: 'Veteranos', unlock: 'done', boost: 1.05 },
  { key: 'Tanques Centella', unlock: 'done', boost: 1.08 },
  { key: 'Ultra Zeus', unlock: 'done', boost: 1.15 },
  { key: 'Prominence', unlock: 'done', boost: 1.12 },
  { key: 'Polvo de Diamantes', unlock: 'done', boost: 1.12 },
  { key: 'Caos', unlock: 'done2', boost: 1.2 },
];
const CHAINS = [   // cadenas: desafíos cortos, sin recuperar vidas
  { key: 'elemental', name: TX('Desafío elemental'), desc: TX('Un equipo de cada elemento: viento, bosque, fuego y montaña.'), teams: ['Airosos', 'Guardabosques', 'Ardientes', 'Montañeros'], lives: 2, factor: 1.0 },
  { key: 'centella', name: TX('Liga Centella'), desc: TX('Cuatro selecciones de estrellas, cada una más dura.'), teams: ['Jets Centella', 'Cohetes Centella', 'Pistolas Centella', 'Bombas Centella'], lives: 2, factor: 1.02 },
  { key: 'final', name: TX('Camino a Zeus'), desc: TX('Kirkwood, Royal Academy y Zeus, uno detrás de otro y al máximo.'), teams: ['Kirkwood', 'Royal Academy', 'Zeus'], lives: 1, factor: 1.08 },
  { key: 'gira', name: TX('Gira de la Caravana'), desc: TX('Las paradas de la Caravana Inazuma por Japón.'), teams: ['Alpino', 'Claustro Sagrado', 'Fauxshore', 'Royal Academy Redux'], lives: 2, factor: 1.03 },
  { key: 'alius', name: TX('Invasión Alius'), desc: TX('Los equipos de la Academia Alius, de Géminis a Génesis.'), teams: ['Tormenta de Géminis', 'Épsilon', 'Épsilon Plus', 'Génesis'], lives: 2, factor: 1.06 },
  { key: 'royal', name: TX('El regreso del Royal'), desc: TX('Royal Academy, su versión Redux y los Emperadores Oscuros.'), teams: ['Royal Academy', 'Royal Academy Redux', 'Emperadores Oscuros'], lives: 1, factor: 1.08 },
  { key: 'fuego', name: TX('Fuego y hielo'), desc: TX('Prominence, Polvo de Diamantes y su fusión, Caos.'), teams: ['Prominence', 'Polvo de Diamantes', 'Caos'], lives: 1, factor: 1.12, needs: 's2' },
  { key: 'oscuro', name: TX('El lado oscuro'), desc: TX('Team D, Dark Angel, Demons Z y el Ogro: los villanos del 3.'), teams: ['Team D', 'Dark Angel', 'Demons Z', 'The Ogre'], lives: 1, factor: 1.12, needs: 's4' },
  { key: 'dioses', name: TX('Dioses y alienígenas'), desc: TX('Zeus, Ultra Zeus y Génesis: lo más duro del 1 y del 2.'), teams: ['Zeus', 'Ultra Zeus', 'Génesis'], lives: 1, factor: 1.15, needs: 's2' },
];
const STAGES = [
  { key: 's1', name: TX('Etapa 1 · Inazuma Eleven'), available: true },
  { key: 's2', name: TX('Etapa 2 · Inazuma Eleven 2'), available: true, needs: 's1', note: TX('Completa la Etapa 1') },
  { key: 's3', name: TX('Etapa 3 · Fase 1'), available: true, needs: 's2', note: TX('Completa la Etapa 2') },
  { key: 's4', name: TX('Etapa 3 · Fase 2 · el Mundial'), available: true, needs: 's3', note: TX('Completa la Fase 1 de la Etapa 3') },
];
const ROLE_TYPE = { POR: 'parada', DEF: 'bloqueo', MED: 'regate', DEL: 'tiro' };
const STAT_KEYS = ['tiro', 'control', 'defensa', 'rapidez', 'fisico'];
const STAT_LABEL = { tiro: TX('Tiro'), control: TX('Control'), defensa: TX('Defensa'), rapidez: TX('Rapidez'), fisico: TX('Físico') };
const RARITY = {
  comun:      { label: TX('Común'),      rate: 60, dupCoins: 10 },
  rara:       { label: TX('Rara'),       rate: 28, dupCoins: 25 },
  epica:      { label: TX('Épica'),      rate: 10, dupCoins: 60 },
  legendaria: { label: TX('Legendaria'), rate: 2,  dupCoins: 150 },
  limitada:   { label: TX('Limitada'),   rate: 0,  dupCoins: 300 },   // solo en el Gacha limitado (src/limited.js)
};
const MAX_STARS = 5;
const TECH_SLOTS = 2;   // técnicas equipadas por jugador

/* ---------- Gachas por equipos y técnicas legendarias ---------- */
const BANNERS = [
  { id: 1, name: TX('Héroes'), crest: 1, desc: TX('Raimon en todas sus versiones, Inazuma Japón, los Veteranos y los amigos de Ciudad Inazuma') },
  { id: 2, name: TX('Rivales'), crest: 2, desc: TX('Los equipos del Fútbol Frontier, la gira por Japón y las selecciones del mundo') },
  { id: 3, name: TX('Villanos'), crest: 41, desc: TX('Zeus, la Academia Alius, los Emperadores Oscuros, el Ogro, Team D y los demonios') },
];
// Las técnicas más chetadas (potencia 100 o más), una por nombre
const LEG_TECHS = (() => {
  const seen = new Set(), out = [];
  Object.values(GAME.techniques).filter(t => t.power >= 100 && t.name && !/^[^A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(t.name))
    .sort((a, b) => b.power - a.power).forEach(t => { if (!seen.has(t.name)) { seen.add(t.name); out.push(t.id); } });
  return out;
})();

// Habilidades pasivas: nombres del juego, efectos nuestros (provisionales)
// Nombres de las habilidades, para traducirlos al mostrarlos: TX('Tiro+') TX('Rapidez+') TX('Defensa+') TX('Portero+') TX('Ataque+')
// TX('Recobro') TX('Fuerza veloz') TX('Fuerza de tiro') TX('Fuerza defensiva') TX('Ultratécnica')
const PASSIVES = {
  'Tiro+':            { desc: TX('+6 de tiro'), apply: m => { m.kick += 6; } },
  'Rapidez+':         { desc: TX('+6 % de velocidad'), apply: m => { m.speed *= 1.06; } },
  'Defensa+':         { desc: TX('+6 de defensa'), apply: m => { m.defense += 6; } },
  'Portero+':         { desc: TX('+6 de portero'), apply: m => { m.gk += 6; } },
  'Ataque+':          { desc: TX('+4 de tiro y control'), apply: m => { m.kick += 4; m.control += 4; } },
  'Recobro':          { desc: TX('Recupera aguante un 60 % más rápido'), apply: m => { m.bonus.recobro = 1.6; } },
  'Fuerza veloz':     { desc: TX('+10 a las técnicas de regate'), apply: m => { m.bonus.regate = 10; } },
  'Fuerza de tiro':   { desc: TX('+10 a las técnicas de tiro'), apply: m => { m.bonus.tiro = 10; } },
  'Fuerza defensiva': { desc: TX('+10 a las técnicas de bloqueo'), apply: m => { m.bonus.bloqueo = 10; } },
  'Ultratécnica':     { desc: TX('Las técnicas recargan un 20 % antes'), apply: m => { m.bonus.cdMul = 0.8; } },
};

/* ---------- Estadísticas ---------- */
// Valor de una estadística de un jugador de tu colección (permanente)
// Los legendarios empiezan ya al máximo (media de 90 o más); el resto empieza al 82 % y se entrena
const startMul = pd => pd.rarity === 'legendaria' ? 1 : 0.82;
function statOf(id, owned, k) {
  const pd = PLAYER(id), ie = pd.ie[k], stars = owned ? owned.stars : 1, up = owned ? (owned.up[k] || 0) : 0;
  return Math.min(ie + 2 * (stars - 1), Math.round(ie * startMul(pd)) + up * 3 + (stars - 1) * 2);
}
function statCap(id, owned, k) { return PLAYER(id).ie[k] + 2 * ((owned ? owned.stars : 1) - 1); }

// Técnica de "historia" (nivel 100) o la primera que aprende
function signatureTech(pd) {
  const ms = pd.moves.filter(([id]) => TECH(id));
  const story = ms.filter(([, l]) => l === 100);
  const pref = (story.length ? story : ms.slice().sort((a, b) => a[1] - b[1]));
  const natural = pref.find(([id]) => TECH(id).type === ROLE_TYPE[pd.role]);
  return (natural || pref[0] || [null])[0];
}
// Técnicas con las que empieza un recorrido: la suya + una de defensa o regate si la tiene
function startingTechs(pd) {
  const sig = signatureTech(pd), out = sig != null ? [sig] : [];
  const want = pd.role === 'DEF' ? ['bloqueo', 'regate'] : pd.role === 'POR' ? ['bloqueo'] : ['regate', 'bloqueo'];
  for (const type of want) {
    const m = pd.moves.find(([id]) => TECH(id) && TECH(id).type === type && !out.includes(id));
    if (m) { out.push(m[0]); break; }
  }
  const gkt = keeperTech(pd, out); if (gkt != null) out.unshift(gkt);
  return out.slice(0, TECH_SLOTS);
}
// Un portero sin técnica de parada recibe la más floja de su elemento (para que pueda usarla)
function keeperTech(pd, have) {
  if (pd.role !== 'POR' || have.some(id => TECH(id).type === 'parada')) return null;
  const own = pd.moves.find(([id]) => TECH(id) && TECH(id).type === 'parada');
  if (own) return own[0];
  const pool = Object.values(GAME.techniques).filter(t => t.type === 'parada' && Object.values(GAME.evo).indexOf(t.id) < 0)
    .sort((a, b) => (a.elem === pd.elem ? 0 : 1) - (b.elem === pd.elem ? 0 : 1) || a.power - b.power);
  return pool.length ? pool[0].id : null;
}

// Jugador de partido a partir de estadísticas
function buildMatchPlayer(id, role, stat, techs, passives, row, pos) {
  const pd = PLAYER(id), s = pd.ie;
  const m = { key: id, name: pd.name, role, row, elem: pd.elem, home: pos && pos.home, ko: pos && pos.ko,
    speed: +(5.6 + (stat('rapidez') - 50) * 0.05).toFixed(2),
    kick: stat('tiro'), control: stat('control'), defense: stat('defensa'), body: stat('fisico'),
    gk: Math.round((stat('defensa') + stat('fisico')) / 2) + (role === 'POR' ? 0 : -25),
    stamDrain: +(1.3 - s.aguante / 200).toFixed(2), bonus: {}, techs: [] };
  (passives || []).forEach(n => PASSIVES[n] && PASSIVES[n].apply(m));
  const cdMul = m.bonus.cdMul || 1;
  // Cada técnica recarga por separado (unos 13–32 s): con dos técnicas tienes más opciones, no el doble de disparos
  m.techs = (techs || []).map(TECH).filter(Boolean).map(t => Object.assign({}, t, { cd: +((9 + (t.cd - 6) * 0.5) * 1.4 * cdMul).toFixed(1) }));
  return m;
}

// Equipo rival: factor = fuerza (1 = sus estadísticas máximas del juego; también puede ser una función por jugador); progress decide cuántas técnicas trae
function rivalTeam(teamKey, factor, progress) {
  const t = TEAM(teamKey);
  const nTech = 1 + Math.floor(Math.min(1, progress) * 2.99);
  const order = { POR: 0, DEF: 1, MED: 2, DEL: 3 };
  const mem = t.players.slice().sort((a, b) => order[a.role] - order[b.role]);
  const pos = layout(mem.map(m => m.role));
  return { name: t.name, key: t.key, players: mem.map((m, i) => {
    const pd = PLAYER(m.id);
    let techs = pd.moves.slice().sort((a, b) => a[1] - b[1]).map(x => x[0]).filter(id => TECH(id)).slice(0, nTech);
    const sig = signatureTech(pd); if (sig != null && !techs.includes(sig)) techs[0] = sig;
    const gkt = keeperTech(pd, techs); if (gkt != null) techs.unshift(gkt);
    return Object.assign(buildMatchPlayer(m.id, m.role, k => Math.round(pd.ie[k] * (typeof factor === 'function' ? factor(pd) : factor)), techs, [], 5 + i, pos[i]),
      { sprite: Object.assign({ file: m.file, row: m.row }, t.kit && m.role !== 'POR' ? { kit: t.kit } : {}) });
  }) };
}
// Equipación de tu equipo (Plantilla → Mi equipo), como el creador del Modo Carrera: Profile.data.kit = { a: camiseta, b: mangas y pantalón, d: diseño } o null (la del Raimon)
const KIT_DESIGNS = [['', TX('Lisa')], ['rayas', TX('Rayas')], ['mitades', TX('Mitades')], ['banda', TX('Banda')], ['cuadros', TX('Cuadros')], ['diagonal', TX('Diagonal')]];
function myKit() { const k = Profile.data.kit; return k && typeof k === 'object' && k.a ? k : null; }
// Muñeco de un jugador de tu equipo con tu equipación (el portero va con la suya)
function mySprite(pd, role) {
  let k = role !== 'POR' && myKit();
  // Un portero que juega de campo deja su equipación de portero y lleva la del equipo (la del Raimon si no has elegido otra)
  if (role !== 'POR' && pd.role === 'POR') k = Object.assign({}, k || { a: '#d5b410', b: '#4a83ac' }, { gk: true });
  return Object.assign({ file: Sprites.collFile(pd), row: pd.cs[1] }, k ? { kit: k } : {});
}
const DIFF_MUL = { facil: 1.08, medio: 1.13, dificil: 1.2 };   // fácil = el antiguo difícil

/* ---------- Perfil permanente: colección, monedas, tickets ---------- */
/* ---------- Códigos de regalo ----------
   Para añadir uno nuevo, copia una línea y cambia el código y el premio.
   Premios posibles: tickets, coins (monedas), rayos. "hasta" es opcional (último día que funciona, AAAA-MM-DD). "uses": veces que se puede canjear (1 si no se pone). */
/* Premios: tickets, coins (monedas), rayos, leg (próximas tiradas legendarias aseguradas), epica (próximas tiradas épicas o mejor),
   player (nombre completo de un jugador: se une a tu plantilla o sube una estrella). "desde" y "hasta" son opcionales (AAAA-MM-DD). */
const GIFT_CODES = {
  APERTURA2026:      { tickets: 20, coins: 500, desc: TX('Código de apertura') },
  RAYOINAZUMA:       { rayos: 3, coins: 300, desc: TX('Tres Rayos Raimon') },
  TORNADOFUEGO:      { tickets: 15, desc: TX('Tickets ardientes') },
  PINGUINOEMPERADOR: { coins: 1500, rayos: 1, desc: TX('Monedas del pingüino') },
  RAIMON11:          { tickets: 11, coins: 1100, desc: TX('Once de Raimon') },
  MANODIOS:          { player: 'Mark Evans', tickets: 5, desc: TX('El portero legendario') },
  ALIUS:             { player: 'Xene', coins: 500, desc: TX('Llega de la Academia Alius') },
  CARAVANA:          { epica: 3, tickets: 10, desc: TX('Tres tiradas épicas o mejores') },
  FFI2026:           { tickets: 30, desc: TX('Torneo internacional') },
  MUNDIAL:           { tickets: 20, rayos: 2, coins: 1000, desc: TX('Premio del Mundial') },
  LEYENDA:           { leg: 1, tickets: 10, desc: TX('Una tirada legendaria asegurada') },
  KAPPARAYO:         { tickets: 100, coins: 1000, rayos: 3, player: 'Karl Kappa (Papi Gavi)', also: 'PESCADINHA', desc: TX('Kappa legendario, vale para cualquier puesto') },
  // Elige 1 de 3 ("pick"): rarity = rareza mínima, role = puesto, elem = elemento, min = media mínima
  FICHAJEESTRELLA:   { pick: { rarity: 'epica' }, tickets: 5, desc: TX('Elige 1 de 3 jugadores épicos o legendarios') },
  ELECCIONLEGENDARIA:{ pick: { rarity: 'legendaria' }, desc: TX('Elige 1 de 3 jugadores legendarios') },
  GUANTESDEORO:      { pick: { rarity: 'epica', role: 'POR' }, coins: 500, desc: TX('Elige 1 de 3 porteros épicos o mejores') },
  MURALLA:           { pick: { rarity: 'epica', role: 'DEF' }, coins: 500, desc: TX('Elige 1 de 3 defensas épicos o mejores') },
  CEREBRO:           { pick: { rarity: 'epica', role: 'MED' }, coins: 500, desc: TX('Elige 1 de 3 medios épicos o mejores') },
  GOLEADOR:          { pick: { rarity: 'epica', role: 'DEL' }, coins: 500, desc: TX('Elige 1 de 3 delanteros épicos o mejores') },
  KANEINFINITO:      { player: 31223, desc: TX('Hurley Kane (versión del Infinito)') },
  LEANINFINITO:      { player: 1457, desc: TX('Lean (versión del Infinito)') },
  TORCHINFINITO:     { player: 31774, desc: TX('Torch (versión del Infinito)') },
  MERCURYINFINITO:   { player: 1415, desc: TX('Mercury (versión del Infinito)') },
  AGENTEMINFINITO:   { player: 21487, desc: TX('Agente M (versión del Infinito)') },
  NAKATAINFINITO:    { player: 31278, desc: TX('Hidetoshi Nakata (versión del Infinito)') },
  INFINITO10:        { pick: { inf: true, n: 10 }, uses: 2, desc: TX('Elige 1 de 10 versiones del Infinito (con las probabilidades del gacha)') },
  FUEGOSAGRADO:      { pick: { rarity: 'epica', elem: 'fuego' }, tickets: 5, desc: TX('Elige 1 de 3 jugadores de fuego épicos o mejores') },
  DISCORDINAZUMA:    { tickets: 15, rayos: 2, desc: TX('Regalo de la comunidad') },
  TICKETAZO:         { tickets: 50, desc: TX('Lluvia de tickets') },
  // Arion, Victor, Riccardo, Bai Long y Bianchi Christmas ya NO se consiguen con códigos: solo en el Gacha limitado (src/limited.js)
  DOBLELEYENDA:      { leg: 2, desc: TX('Dos tiradas legendarias aseguradas') },
};
const PICK_TIERS = { comun: 0, rara: 1, epica: 2, legendaria: 3, limitada: 4 };
// Las 3 opciones de un "elige 1 de 3": jugadores del gacha (sin versiones de evento ni originales)
function giftPickOptions(f, n = 3) {
  if (f.inf) return infPickOptions(f.n || n);
  const avg = pd => ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + pd.ie[k], 0) / 5;
  const pool = GAME.players.filter(p => p.cs && p.gacha !== false && !p.halloween && !p.xmas && !p.original && !p.special
    && PICK_TIERS[p.rarity] >= PICK_TIERS[f.rarity || 'comun'] && (!f.role || p.role === f.role) && (!f.elem || p.elem === f.elem) && (!f.min || avg(p) >= f.min)).map(p => p.id);
  const out = []; while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}
// «Elige 1 de N» de versiones del Infinito: cada opción sale con las probabilidades del gacha (común 60 %, rara 28 %, épica 10 %, legendaria 2 %); sin repetir
function infPickOptions(n) {
  const all = GAME.players.filter(p => p.inf), out = [];
  for (let k = 0; k < n * 20 && out.length < n; k++) {
    let r = Math.random() * 100, tier = 'comun';
    for (const t of ['legendaria', 'epica', 'rara', 'comun']) { if (r < RARITY[t].rate) { tier = t; break; } r -= RARITY[t].rate; }
    const pool = all.filter(p => p.rarity === tier && !out.includes(p.id)); if (!pool.length) continue;
    out.push(pool[Math.floor(Math.random() * pool.length)].id);
  }
  return out;
}
// Versiones del Infinito: las otras versiones de jugadores (del 2, del 3, nombres alienígenas…) que no salen en el gacha.
// Se ganan al vencer a cada jefe del Infinito (elige 1 de 3) y llevan un marco propio con el símbolo ∞.
(function markVersions() {
  if (typeof GAME === 'undefined') return;
  for (const p of GAME.players) if (p.cs && p.gacha === false && !p.halloween && !p.xmas && !p.special && !p.original && p.id !== 39001) p.inf = true;
})();
const INF_TIERS = w => w >= 30 ? ['comun', 'rara', 'epica', 'legendaria'] : w >= 15 ? ['comun', 'rara', 'epica'] : ['comun', 'rara'];
function versionPickOptions(wave, n = 3) {
  const ok = INF_TIERS(wave), all = GAME.players.filter(p => p.inf && ok.includes(p.rarity));
  const fresh = all.filter(p => !Profile.data.coll[p.id]), pool = (fresh.length >= n ? fresh : all).map(p => p.id);
  const out = []; while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const Profile = {
  data: null,
  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem('inazuma-perfil') || 'null'); } catch (_) {}
    this.data = Object.assign({ coll: {}, coins: 99999, tickets: 99999, pity: 0, firstDone: false, pulls: 0,
      rayos: 0, wins: 0, story: { s1: { best: 0, done: false } }, specials: {}, chains: {}, infBest: 0, techs: {}, banner: 1 }, d || {});
    this.data.techs = this.data.techs || {};
    this.data.codes = this.data.codes || {};
    this.data.story.s2 = this.data.story.s2 || { best: 0, done: false };
    for (const k of ['s3', 's4']) this.data.story[k] = this.data.story[k] || { best: 0, done: false };
    // Cambios de id entre versiones (p. ej. Raimon del 1 en su versión base): se conserva lo que tenías
    for (const [o, n] of Object.entries(GAME.idmap || {})) {
      // Las versiones del Infinito usan esos ids «viejos»: son jugadores de verdad y NO se convierten (antes desaparecían al recargar)
      if (PLAYER(o) && PLAYER(o).inf) continue;
      const c = this.data.coll;
      if (c[o]) { if (!c[n]) c[n] = c[o]; else c[n].stars = Math.max(c[n].stars, c[o].stars); delete c[o]; }
    }
    return this.data;
  },
  save() { try { localStorage.setItem('inazuma-perfil', JSON.stringify(this.data)); } catch (_) {} },
  // Canjea un código de regalo: cada código sirve una vez por partida guardada
  redeem(raw) {
    const k = normCode(raw), G = GIFT_CODES[k];
    if (!k) return { ok: false, msg: TX('Escribe un código') };
    if (!G) return { ok: false, msg: TX('Ese código no existe') };
    // uses: cuántas veces se puede canjear cada código (1 si no se dice). P.codeUses cuenta las veces; los canjeados antes cuentan como 1
    const used = (this.data.codeUses || {})[k] || (this.data.codes[k] ? 1 : 0);
    if (used >= (G.uses || 1) || (G.also && this.data.codes[G.also])) return { ok: false, msg: TX('Ya canjeaste este código') };
    const today = new Date().toISOString().slice(0, 10);
    if (G.hasta && today > G.hasta) return { ok: false, msg: TX('Este código ha caducado') };
    if (G.desde && today < G.desde) return { ok: false, msg: TX('Este código todavía no está activo') };
    const P = this.data;
    P.tickets += G.tickets || 0; P.coins += G.coins || 0; P.rayos += G.rayos || 0;
    if (G.leg) P.giftLeg = (P.giftLeg || 0) + G.leg;
    if (G.epica) P.giftEpic = (P.giftEpic || 0) + G.epica;
    let who = null;
    if (G.player) {
      const pd = typeof G.player === 'number' ? PLAYER(G.player) : GAME.players.find(p => (p.gacha !== false || p.special) && p.cs && (p.full === G.player || p.name === G.player));   // número = id exacto (p. ej. una versión del Infinito)
      if (pd) { const o = P.coll[pd.id]; if (!o) P.coll[pd.id] = { stars: 1, up: {} }; else if (o.stars < MAX_STARS) o.stars++; else P.coins += 200; who = pd; }
    }
    if (G.pick) { const opts = giftPickOptions(G.pick, G.pick.n || 3); if (opts.length) (P.giftPicks = P.giftPicks || []).push({ code: k, opts, desc: G.desc }); }
    P.codes[k] = Date.now(); P.codeUses = P.codeUses || {}; P.codeUses[k] = used + 1; this.save();
    const parts = [who && '⭐ ' + who.name, G.leg && TXn(G.leg, '{0} tirada legendaria', '{0} tiradas legendarias'), G.epica && G.epica + TX(' tiradas épicas o mejores'),
      G.pick && TX('elige 1 de {0} jugadores', G.pick.n || 3), G.tickets && G.tickets + TX(' 🎟️ tickets'), G.coins && G.coins + TX(' 🪙 monedas'), G.rayos && G.rayos + TX(' ⚡ Rayos')].filter(Boolean);
    return { ok: true, msg: TX('¡Código canjeado! ') + parts.join(TX(' y ')), code: k, gift: G };
  },
  // Resuelve un "elige 1 de 3" pendiente: nuevo, una estrella más o monedas si ya está al máximo
  takePick(i, id) {
    const P = this.data, g = (P.giftPicks || [])[i]; if (!g || !g.opts.includes(id)) return null;
    const pd = PLAYER(id), o = P.coll[id], r = { id, tier: pd.rarity };
    if (!o) { P.coll[id] = { stars: 1, up: {} }; r.isNew = true; }
    else if (o.stars < MAX_STARS) { o.stars++; r.star = o.stars; }
    else { const c = (RARITY[pd.rarity] || RARITY.comun).dupCoins; P.coins += c; r.coins = c; }
    P.giftPicks.splice(i, 1); this.save();
    return r;
  },
  owned(id) { return this.data.coll[id] || null; },
  ids() { return Object.keys(this.data.coll).map(Number); },
  // Cada victoria suma; cada 5 victorias, un Rayo Raimon
  addWin() {
    const P = this.data; P.wins++;
    const got = P.wins % 5 === 0; if (got) P.rayos++;
    this.save(); return got;
  },
  useRayo(id) {
    const o = this.owned(id), P = this.data;
    if (!o || P.rayos < 1 || o.stars >= MAX_STARS) return false;
    P.rayos--; o.stars++; this.save(); return true;
  },
  unlocked(what) {
    const S = this.data.story.s1;
    if (what === 'chains' || what === 'infinite') return S.done;
    if (what && what.chain) return S.done && (!what.chain.needs || this.data.story[what.chain.needs].done);
    if (what && what.special) { const u = what.special.unlock; return u === 'done' ? S.done : u === 'done2' ? this.data.story.s2.done : S.done || S.best >= u; }
    if (what && what.stage) return !what.stage.needs || this.data.story[what.stage.needs].done;
    return true;
  },
  // Técnicas que puede equipar: las suyas + las del gacha de su elemento (o que aprende en el juego original)
  learnable(id) {
    const pd = PLAYER(id), own = pd.moves.map(m => m[0]).filter(t => TECH(t));
    const gacha = Object.keys(this.data.techs).map(Number).filter(t => TECH(t) && !own.includes(t) && (TECH(t).elem === pd.elem || TECH(t).elem === 'neutro'));
    return { own, gacha };
  },
  equipOf(id) {
    const o = this.owned(id), L = this.learnable(id), ok = new Set([...L.own, ...L.gacha]);
    const eq = o && Array.isArray(o.equip) ? o.equip.filter(t => ok.has(t)).slice(0, TECH_SLOTS) : null;
    return eq && eq.length ? eq : startingTechs(PLAYER(id));
  },
  setEquip(id, slot, techId) {
    const o = this.owned(id); if (!o) return;
    const eq = this.equipOf(id).slice();
    const k = eq.indexOf(techId); if (k >= 0) eq[k] = eq[slot];
    eq[slot] = techId;
    o.equip = eq.filter(t => t != null).slice(0, TECH_SLOTS); this.save();
  },
  upgradeCost(id, k) { const o = this.owned(id); return 15 + (o.up[k] || 0) * 10; },
  canUpgrade(id, k) { const o = this.owned(id); return statOf(id, Object.assign({}, o, { up: Object.assign({}, o.up, { [k]: (o.up[k] || 0) + 1 }) }), k) > statOf(id, o, k); },
  upgrade(id, k) {
    const o = this.owned(id), c = this.upgradeCost(id, k);
    if (!o || this.data.coins < c || !this.canUpgrade(id, k)) return false;
    this.data.coins -= c; o.up[k] = (o.up[k] || 0) + 1; this.save(); return true;
  },
};

/* ---------- Gacha ---------- */
const Gacha = {
  pools: {},
  byTier(banner) {
    const k = banner || 0;
    if (!this.pools[k]) { const P = this.pools[k] = {}; for (const t in RARITY) P[t] = GAME.players.filter(p => p.rarity === t && p.gacha !== false && (!banner || p.banner === banner)); }
    return this.pools[k];
  },
  rollTier(forceHigh) {
    if (forceHigh) return Math.random() < RARITY.legendaria.rate / (RARITY.legendaria.rate + RARITY.epica.rate) ? 'legendaria' : 'epica';
    let r = Math.random() * 100;
    for (const t of ['legendaria', 'epica', 'rara', 'comun']) { if (r < RARITY[t].rate) return t; r -= RARITY[t].rate; }
    return 'comun';
  },
  // n tiradas; cada 10 sin épica o mejor, la siguiente la garantiza
  pull(n, opts = {}) {
    const P = Profile.data, pools = this.byTier(opts.banner), res = [];
    for (let i = 0; i < n; i++) {
      let tier = P.devLeg > 0 ? (P.devLeg--, 'legendaria') : P.giftLeg > 0 ? (P.giftLeg--, 'legendaria') : this.rollTier(P.pity >= 9);   // (códigos y desarrollador: legendarios asegurados)
      if (P.giftEpic > 0 && (tier === 'comun' || tier === 'rara')) { P.giftEpic--; tier = 'epica'; }
      if (tier === 'epica' || tier === 'legendaria') P.pity = 0; else P.pity++;
      // En el tramo legendario, la mitad de las veces sale una técnica legendaria
      if (tier === 'legendaria' && opts.banner && Math.random() < 0.5) { res.push({ tech: LEG_TECHS[Math.floor(Math.random() * LEG_TECHS.length)], tier }); continue; }
      if (!pools[tier].length && tier === 'legendaria') { res.push({ tech: LEG_TECHS[Math.floor(Math.random() * LEG_TECHS.length)], tier }); continue; }
      const list = pools[tier].length ? pools[tier] : pools.epica;
      res.push({ id: list[Math.floor(Math.random() * list.length)].id, tier });
    }
    if (opts.keeper && !res.some(r => r.id != null && PLAYER(r.id).role === 'POR')) {
      const gks = GAME.players.filter(p => p.gacha !== false && p.role === 'POR' && (p.rarity === 'rara' || p.rarity === 'comun'));
      const k = res.findIndex(r => r.tier === 'comun'); const g = gks[Math.floor(Math.random() * gks.length)];
      res[k >= 0 ? k : res.length - 1] = { id: g.id, tier: g.rarity };
    }
    for (const r of res) {
      if (r.tech != null) {
        if (!P.techs[r.tech]) { P.techs[r.tech] = 1; r.isNew = true; } else { P.coins += 150; r.coins = 150; }
        continue;
      }
      const o = P.coll[r.id];
      if (!o) { P.coll[r.id] = { stars: 1, up: {} }; r.isNew = true; }
      else if (o.stars < MAX_STARS) { o.stars++; r.star = o.stars; }
      else { const c = RARITY[r.tier].dupCoins; P.coins += c; r.coins = c; }
    }
    P.pulls += n;
    Profile.save();
    return res;
  },
};

/* ---------- Recorrido ---------- */
const RUN_RULES = {
  facil:   { matches: 5, lives: 3 },
  medio:   { matches: 6, lives: 2 },
  dificil: { matches: 7, lives: 1 },
};

function runMember(id, temp) {
  const pd = PLAYER(id);
  let techs = temp || !Profile.owned(id) ? startingTechs(pd) : Profile.equipOf(id).slice();
  if (pd.role === 'POR' && !techs.some(t => TECH(t).type === 'parada')) { const k = keeperTech(pd, techs); if (k != null) techs = [k, ...techs].slice(0, TECH_SLOTS); }
  return { id, temp: !!temp, techs, passives: [] };
}

// La estrella de un equipo: su mejor jugador de campo. En los equipos especiales no se repite el premio:
// si la estrella ya es el premio de un equipo especial anterior (p. ej. Byron en Tanques Centella y Ultra Zeus), se da la siguiente.
function teamStar(teamKey, special) {
  const sum = p => Object.values(p.ie).reduce((x, y) => x + y, 0);
  // si la ficha del rival no está en el gacha, se usa su versión del gacha (mismo nombre o «(IE2)»/«(IE3)»)
  const baseN = n => n.replace(/ \((IE2|IE3)\)$/, '');
  const inPool = p => p.cs && p.gacha !== false ? p : (GAME.idmap && GAME.idmap[p.id] && PLAYER(GAME.idmap[p.id])) || GAME.players.find(q => q.cs && q.gacha !== false && (baseN(q.full) === baseN(p.full) || (q.also || []).includes(p.full)));
  const list = TEAM(teamKey).players.filter(m => m.role !== 'POR').map(m => inPool(PLAYER(m.id))).filter(Boolean).sort((a, b) => sum(b) - sum(a));
  if (!special || typeof SPECIALS === 'undefined') return list[0] || null;
  const i = SPECIALS.findIndex(x => x.key === teamKey); if (i < 0) return list[0] || null;
  const taken = new Set(SPECIALS.slice(0, i).map(x => teamStar(x.key, true)).filter(Boolean).map(p => p.id));
  return list.find(p => !taken.has(p.id)) || list[0] || null;
}
// Jugador exclusivo: la estrella del equipo vencido (nuevo, una estrella más o monedas)
function teamStarReward(P, teamKey, special) {
  const best = teamStar(teamKey, special);
  if (!best) return null;
  const o = P.coll[best.id];
  if (!o) { P.coll[best.id] = { stars: 1, up: {} }; return { id: best.id, isNew: true }; }
  if (o.stars < MAX_STARS) { o.stars++; return { id: best.id, star: o.stars }; }
  P.coins += 100; return { id: best.id, coins: 100 };
}
// Qué tipo de técnica le sirve a cada posición (probabilidades de las recompensas tras cada partido)
const ROLE_FIT = { POR: { parada: 1 }, DEF: { bloqueo: 0.75, regate: 0.15, tiro: 0.1 }, MED: { regate: 0.45, tiro: 0.3, bloqueo: 0.25 }, DEL: { tiro: 0.7, regate: 0.3 } };
function rollFitType(role) {
  const F = ROLE_FIT[role] || ROLE_FIT.MED; let r = Math.random();
  for (const [t, w] of Object.entries(F)) { if ((r -= w) < 0) return t; }
  return Object.keys(F)[0];
}
const Run = {
  // kind: story | special | chain | infinite
  create(kind, lineupIds, opts = {}) {
    let schedule = [], lives = 1, diff = opts.diff || 'medio', name = '';
    if (kind === 'story') {
      const O = STAGE_ORDER[opts.stage || 's1'], R = RUN_RULES[diff], order = O.slice(0, -1);
      for (let i = 0; i < R.matches - 1; i++) schedule.push(order[Math.round(i * (order.length - 1) / Math.max(1, R.matches - 2))]);
      schedule.push(O[O.length - 1]);
      lives = R.lives; name = STAGE_NAME[opts.stage || 's1'];
    } else if (kind === 'special') { schedule = [opts.team]; lives = 1; name = opts.team; }
    else if (kind === 'chain') { const C = CHAINS.find(c => c.key === opts.chain); schedule = C.teams.slice(); lives = C.lives; name = C.name; }
    else if (kind === 'infinite') { schedule = [Run.infiniteTeam(0)]; lives = 2; name = TX('Infinito'); }
    const roster = lineupIds.map(id => runMember(id));
    return { kind, diff, name, stage: opts.stage || 's1', chain: opts.chain || null, schedule, index: 0, lives, maxLives: lives, wins: 0, coinsEarned: 0, ticketsEarned: 0,
      roster, lineup: roster.map((_, i) => i), formation: opts.formation || '1-2-1-1', state: 'map', rewards: null, last: null };
  },
  infiniteTeam(n) {
    const all = GAME.teams.filter(t => t.key !== 'Ultra Zeus');
    if ((n + 1) % 5 === 0) {   // oleada especial: los más duros
      const hard = all.slice().sort((a, b) => b.avg - a.avg).slice(0, 6);
      return (n + 1) % 10 === 0 ? 'Ultra Zeus' : hard[Math.floor(Math.random() * hard.length)].key;
    }
    return all[Math.floor(Math.random() * all.length)].key;
  },
  isBoss(run) { return run.kind === 'infinite' && (run.index + 1) % 5 === 0; },
  progress(run) {
    if (run.kind === 'infinite') return Math.min(1, run.index / 10);
    return run.schedule.length > 1 ? run.index / (run.schedule.length - 1) : 1;
  },
  rivalName(run) { return run.schedule[run.index]; },
  // Fuerza del rival según el modo
  rivalFactor(run) {
    const dm = DIFF_MUL[run.diff] || 1;
    if (run.kind === 'story') return (0.78 + 0.24 * Run.progress(run)) * dm;
    if (run.kind === 'special') return (SPECIALS.find(x => x.key === run.schedule[0]) || { boost: 1 }).boost;
    if (run.kind === 'chain') return CHAINS.find(c => c.key === run.chain).factor * (0.96 + 0.04 * Run.progress(run));
    return Math.min(1.35, 0.82 + 0.035 * run.index) * (Run.isBoss(run) ? 1.08 : 1);
  },
  // Música: alegre al principio, oscura y épica al final
  musicRole(run) {
    if (run.kind === 'special') return 'match_special';
    const last = run.kind !== 'infinite' && run.index >= run.schedule.length - 1, s2 = run.kind === 'story' && run.stage !== 's1';
    if (last || Run.isBoss(run)) return s2 ? 's2_final' : 'match_final';
    const p = Run.progress(run);
    return (s2 ? 's2_' : 'match_') + (p < 0.34 ? 'easy' : p < 0.67 ? 'mid' : 'hard');
  },
  field(run) { return TEAM_FIELD[Run.rivalName(run)] || 'normal'; },
  memberStat(m) {
    const o = m.temp ? null : Profile.owned(m.id);
    return k => m.temp ? Math.round(PLAYER(m.id).ie[k] * startMul(PLAYER(m.id))) : statOf(m.id, o, k);
  },
  matchTeams(run) {
    const F = FORMATIONS[run.formation] || FORMATIONS['1-2-1-1'];
    const pos = layout(F.roles);
    const A = { name: TX('Tu equipo'), players: run.lineup.slice(0, 5).map((ri, i) => {
      const m = run.roster[ri], pd = PLAYER(m.id);
      return Object.assign(buildMatchPlayer(m.id, F.roles[i], Run.memberStat(m), m.techs, m.passives, i, pos[i]),
        { sprite: mySprite(pd, F.roles[i]) });
    }) };
    const B = rivalTeam(Run.rivalName(run), Run.rivalFactor(run), Run.progress(run));
    return { A, B };
  },
  applyResult(run, result, goals) {
    const P = Profile.data;
    const out = { result, coins: 0, tickets: 0, lifeLost: false, done: false, victory: false, rayo: false, exclusive: null };
    const rival = Run.rivalName(run);
    if (result === 'win') {
      run.wins++; out.rayo = Profile.addWin();
      const finalMatch = run.kind !== 'infinite' && run.index >= run.schedule.length - 1;
      if (run.kind === 'story') {
        out.coins = 25 + goals * 5; out.tickets = 1;
        const SS = P.story[run.stage || 's1'];
        SS.best = Math.max(SS.best, run.index + 1);
        if (finalMatch) { out.tickets += 3; SS.done = true; }
      } else if (run.kind === 'special') {
        out.coins = 60 + goals * 5; out.tickets = 2;
        out.exclusive = teamStarReward(P, rival, true);
        P.specials[rival] = (P.specials[rival] || 0) + 1;
      } else if (run.kind === 'chain') {
        out.coins = 30 + run.index * 10 + goals * 5;
        if (finalMatch) {
          // Premios de cadena: Rayo, tickets, monedas, la estrella del último rival, técnica legendaria la 1.ª vez, extra por perfecta y medallas
          const n = (P.chains[run.chain] || 0) + 1; P.chains[run.chain] = n;
          P.rayos++; out.chainRayo = true; out.tickets = 5; out.coins += 150;
          out.exclusive = teamStarReward(P, rival);
          if (n === 1) {
            const free = LEG_TECHS.filter(t => !P.techs[t]), t = free.length ? free[Math.floor(Math.random() * free.length)] : null;
            out.tickets += 10; if (t != null) { P.techs[t] = 1; out.chainTech = t; }
          }
          if (run.lives === run.maxLives) { out.tickets += 5; out.perfect = true; P.chainPerfect = P.chainPerfect || {}; P.chainPerfect[run.chain] = 1; }
          if (n === 3 || n === 5) { out.tickets += 15; P.rayos++; out.medal = n === 3 ? 'plata' : 'oro'; }
        }
      } else if (run.kind === 'infinite') {
        out.coins = 20 + run.index * 3 + goals * 5;
        if (Run.isBoss(run)) {
          out.tickets = 2;
          const opts = versionPickOptions(run.index + 1);
          if (opts.length) { const uid = Date.now(); (P.giftPicks = P.giftPicks || []).push({ code: '∞', uid, opts, desc: TX('Jefe de la oleada {0} del Infinito: elige una versión', run.index + 1) }); out.versionPick = uid; }
        }
        P.infBest = Math.max(P.infBest, run.index + 1);
      }
      if (finalMatch) { out.done = true; out.victory = true; run.state = 'over'; }
      else { run.rewards = Run.makeRewards(run); run.state = 'reward'; }
    } else {
      out.coins = 10 + goals * 5; run.lives--; out.lifeLost = true;
      if (run.lives <= 0) { out.done = true; run.state = 'over'; }
      else run.state = 'map';
    }
    P.coins += out.coins; P.tickets += out.tickets; Profile.save();
    run.coinsEarned += out.coins; run.ticketsEarned += out.tickets;
    run.last = out;
    return out;
  },
  makeRewards(run) {
    const rnd = a => a[Math.floor(Math.random() * a.length)];
    const opts = [], members = run.roster.map((_, i) => i);
    // Evolución (si alguna técnica puede evolucionar)
    const evos = [];
    run.roster.forEach((m, mi) => m.techs.forEach(t => { if (EVO(t) != null && !m.techs.includes(EVO(t))) evos.push({ kind: 'evolve', member: mi, from: t, to: EVO(t) }); }));
    if (evos.length) opts.push(rnd(evos));
    // Técnicas nuevas según la posición (un portero solo paradas; un delantero sobre todo tiros…), de las suyas si puede
    for (let tries = 0; tries < 20 && opts.length < 3; tries++) {
      const mi = rnd(members), m = run.roster[mi], pd = PLAYER(m.id);
      if (opts.some(o => o.member === mi && o.kind === 'tech')) continue;
      const type = rollFitType(pd.role);
      const ok = t => t && !t.lim && t.type === type && !m.techs.includes(t.id) && Object.values(GAME.evo).indexOf(t.id) < 0;
      const own = pd.moves.map(x => TECH(x[0])).filter(ok).map(t => t.id);
      let id = null, rare = false;
      if (own.length && Math.random() > 0.25) id = rnd(own);
      else {
        const all = Object.values(GAME.techniques).filter(ok), mine = all.filter(t => t.elem === pd.elem);
        const pool = mine.length ? mine : all;
        if (pool.length) { id = rnd(pool).id; rare = true; }
      }
      if (id == null) continue;
      opts.push({ kind: 'tech', member: mi, tech: id, rare, replace: Run.replaceFor(m, id) });
      if (opts.length >= 2 && Math.random() < 0.5) break;
    }
    // Fichaje temporal o habilidad
    const beaten = TEAM(run.schedule[run.index]);
    const have = new Set(run.roster.map(m => m.id));
    const cands = beaten.players.map(m => m.id).filter(id => !have.has(id) && PLAYER(id).cs);
    if (opts.length < 3 && cands.length && run.roster.length < 7 && Math.random() < 0.6) opts.push({ kind: 'recruit', id: rnd(cands) });
    const names = Object.keys(PASSIVES);
    for (let tries = 0; tries < 10 && opts.length < 3; tries++) {
      const mi = rnd(members), m = run.roster[mi], n = rnd(names);
      if (m.passives.length >= 2 || m.passives.includes(n)) continue;
      opts.push({ kind: 'passive', member: mi, name: n });
    }
    while (opts.length < 3) opts.push({ kind: 'coins', amount: 30 });
    return opts.slice(0, 3);
  },
  // opt = null: saltas la recompensa (no te quedas con ninguna)
  takeReward(run, opt) {
    if (!opt) opt = { kind: 'skip' };
    if (opt.kind === 'tech') {
      const t = run.roster[opt.member].techs;
      if (opt.replace != null && t.includes(opt.replace)) t[t.indexOf(opt.replace)] = opt.tech; else if (t.length < TECH_SLOTS) t.push(opt.tech); else t[t.length - 1] = opt.tech;
    }
    if (opt.kind === 'evolve') { const t = run.roster[opt.member].techs; t[t.indexOf(opt.from)] = opt.to; }
    if (opt.kind === 'recruit') run.roster.push(runMember(opt.id, true));
    if (opt.kind === 'passive') run.roster[opt.member].passives.push(opt.name);
    if (opt.kind === 'coins') { Profile.data.coins += opt.amount; Profile.save(); run.coinsEarned += opt.amount; }
    run.rewards = null; run.index++; run.state = 'map';
    if (run.kind === 'infinite' && run.index >= run.schedule.length) run.schedule.push(Run.infiniteTeam(run.index));
  },
  // Con los huecos llenos, la técnica nueva sustituye a la más floja de su mismo tipo (o a la más floja)
  replaceFor(m, newId) {
    if (m.techs.length < TECH_SLOTS) return null;
    const nt = TECH(newId), keeper = PLAYER(m.id).role === 'POR';
    const cands = m.techs.filter(t => !(keeper && TECH(t).type === 'parada' && nt.type !== 'parada' && m.techs.filter(x => TECH(x).type === 'parada').length === 1));
    const same = cands.filter(t => TECH(t).type === nt.type);
    const pool = same.length ? same : cands;
    return pool.sort((a, b) => TECH(a).power - TECH(b).power)[0] ?? m.techs[m.techs.length - 1];
  },
  swapLineup(run, slot, rosterIdx) {
    const cur = run.lineup.indexOf(rosterIdx);
    if (cur >= 0) run.lineup[cur] = run.lineup[slot];
    run.lineup[slot] = rosterIdx;
  },
  // Una partida en curso por modo (Historia, especial, cadena, Infinito), todas a la vez: { kind: run }.
  // (Antes solo se guardaba una; si la clave tiene una partida suelta, se convierte.)
  all() {
    let o = null; try { o = JSON.parse(localStorage.getItem('inazuma-run3') || 'null'); } catch (_) {}
    if (!o || typeof o !== 'object') return {};
    if (o.kind) return o.roster ? { [o.kind]: o } : {};
    for (const k in o) if (!o[k] || !o[k].roster || !o[k].kind || o[k].state === 'over') delete o[k];
    return o;
  },
  write(all) { try { if (Object.keys(all).length) localStorage.setItem('inazuma-run3', JSON.stringify(all)); else localStorage.removeItem('inazuma-run3'); } catch (_) {} },
  save(run) { const all = Run.all(); all[run.kind] = run; Run.write(all); },
  load(kind) { return Run.all()[kind] || null; },
  clear(kind) { if (kind == null) return Run.write({}); const all = Run.all(); delete all[kind]; Run.write(all); },
};

/* =====================================================================
   MODO CARRERA (mánager): 3 divisiones de 10 equipos a una vuelta, playoffs
   de ascenso, fichajes (ojeo, mercado con negociación, fichar al vencido),
   graduaciones, cantera, mejoras del club, equipación y escudo propios.
   Aquí solo está la lógica; las pantallas están en app.js.
   ===================================================================== */
const CAREER_KEY = 'inazuma-carrera';
const YOU = 'TU';                               // clave de tu club en las tablas
const DIV_NAME = { 1: TX('Primera'), 2: TX('Segunda'), 3: TX('Tercera') };
const DIV_FACTOR = { 1: 0.95, 2: 0.85, 3: 0.72 }; // fuerza de los rivales según la división
const DIV_DIFF = { 1: 'dificil', 2: 'medio', 3: 'facil' };
const DIV_TICKET = { 1: 170, 2: 105, 3: 60 };   // taquilla por victoria
const DIV_PRIZE = { 1: 1500, 2: 800, 3: 400 };  // premio al campeón
const DIV_SPONSOR = { 1: 2.2, 2: 1.5, 3: 1 };   // patrocinio semanal (× fama)
const CAREER_START = {
  1: ['Emperadores Oscuros', 'Ultra Zeus', 'Zeus', 'Royal Academy', 'Génesis', 'Royal Academy Redux', 'Caos', 'Tormenta de Géminis', 'Épsilon', 'Polvo de Diamantes'],
  2: ['Veteranos', 'Tanques Centella', 'Bombas Centella', 'Ardientes', 'Kirkwood', 'Fauxshore', 'Airosos', 'Claustro Sagrado', 'Prominence', 'Épsilon Plus'],
  3: ['Farm', 'Wild', 'Occult', 'Umbrella', 'Shuriken', 'Otaku', 'Brain', 'Sallys', 'Inazuma Kids FC'],   // + tu club
};
// Calendario de 16 semanas: L = liga (9 jornadas), C = Copa (fase 3), P1/P2 = playoff de ascenso
const SCHED = [null, 'L', 'L', 'C', 'L', 'L', 'C', 'L', 'L', 'C', 'L', 'L', 'C', 'L', 'C', 'P1', 'P2'];
const WEEKS = SCHED.length - 1;
const LEAGUE_WEEKS = SCHED.map((t, w) => t === 'L' ? w : null).filter(w => w != null);
const CUP_WEEKS = SCHED.map((t, w) => t === 'C' ? w : null).filter(w => w != null);   // 5 rondas
const CUP_ROUND = [TX('Dieciseisavos'), TX('Octavos'), TX('Cuartos'), TX('Semifinal'), TX('Final')];
const CAREER_DIFF = { facil: { name: TX('Fácil'), mul: 0.93, shift: -1 }, normal: { name: TX('Normal'), mul: 1, shift: 0 }, dificil: { name: TX('Difícil'), mul: 1.07, shift: 1 } };
const HOF_KEY = 'inazuma-salon';
const MANAGERS = [13, 14, 15, 212, 21440];      // Nelly, Celia, Silvia, Seymour Hillman (1 y 2)
const RAY_DARK = 996100;   // mánager de Halloween (se desbloquea con los retos del evento): +10 % de ingresos
const SQUAD_MAX = 12, SQUAD_MIN = 7;
const LAST_YEAR = 6;   // los jugadores se gradúan (se van) al acabar 6º curso
const YEAR_GROWTH = 1; // puntos que sube cada stat al pasar de curso
const TACTICS = {
  equilibrada: { name: TX('Equilibrada'), desc: TX('Sin riesgos'), for: 1, ag: 1, forma: 0 },
  ofensiva:    { name: TX('Ofensiva'), desc: TX('Más goles a favor… y en contra'), for: 1.28, ag: 1.22, forma: 0 },
  defensiva:   { name: TX('Defensiva'), desc: TX('Encerrarse atrás'), for: 0.78, ag: 0.72, forma: 0 },
  presion:     { name: TX('Presión alta'), desc: TX('Roba arriba, cansa más'), for: 1.12, ag: 0.9, forma: -6 },
};
const ACTIVITIES = {
  entrenar: { name: TX('Entrenar'), desc: TX('Sube una estadística a todo el equipo'), forma: -12 },
  tecnicas: { name: TX('Practicar técnicas'), desc: TX('Pueden aprender supertécnicas nuevas'), forma: -8 },
  ojear:    { name: TX('Ojear'), desc: TX('Busca joyas baratas por la ciudad'), forma: 0 },
  descansar:{ name: TX('Descansar'), desc: TX('Recupera la forma del equipo'), forma: 35 },
};
const FACILITIES = {
  campo:     { name: TX('Campo de entrenamiento'), desc: TX('+1 extra en cada entrenamiento por nivel'), cost: [300, 800, 1800] },
  ojeadores: { name: TX('Red de ojeadores'), desc: TX('Más joyas al ojear y de mejor nivel'), cost: [250, 650, 1500] },
  spa:       { name: TX('Enfermería'), desc: TX('Descansar recupera más y los partidos cansan menos'), cost: [200, 550, 1200] },
  estadio:   { name: TX('Estadio'), desc: TX('+25 % de taquilla por nivel'), cost: [400, 1000, 2200] },
};
// Equipación y escudo
const KIT_COLORS = ['#e8c21a', '#f2f2f2', '#d8361a', '#1f4fc0', '#2f9a3a', '#ff7a1a', '#7a3ad8', '#222222', '#3fb6e8', '#ff8ac0', '#8a5a2a', '#0e2a6a'];
const CREST_SHAPES = ['escudo', 'circulo', 'rombo'];
const CREST_SYMBOLS = { rayo: '⚡', estrella: '★', balon: '⚽', llama: '🔥', hoja: '🍃', montana: '⛰', ola: '🌊', corona: '♛' };
const RARITY_MUL = { comun: 1, rara: 1.3, epica: 1.8, legendaria: 2.6, limitada: 3.2 };

const cRnd = Math.random, pickR = a => a[Math.floor(cRnd() * a.length)];
const Career = {
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(CAREER_KEY) || 'null'); } catch (_) { this.data = null; }
    if (this.data && (this.data.v || 1) < 2) this.migrate();
    if (this.data) this.remapIds();
    return this.data;
  },
  // Personajes fusionados (versiones del 1, 2 y 3): se usa la ficha única en tu plantilla y en los clubes
  remapIds() {
    const c = this.data, M = GAME.idmap || {}, to = id => M[id] != null ? M[id] : id;
    const seen = new Set();
    c.squad = c.squad.filter(m => { m.id = to(m.id); if (seen.has(m.id)) return false; seen.add(m.id); return true; });
    if (c.lineup) c.lineup = c.lineup.map(to);
    for (const k in c.clubs || {}) c.clubs[k].forEach(p => { const n = to(p.id); if (n !== p.id) { p.id = n; delete p.file; delete p.row; } });
  },
  save() { if (this.data && this.data.devMoney) this.data.money = 9999999; try { localStorage.setItem(CAREER_KEY, JSON.stringify(this.data)); } catch (_) {} },
  clear() { this.archive(); this.data = null; try { localStorage.removeItem(CAREER_KEY); } catch (_) {} },
  // Salón de la fama: guarda un resumen de cada carrera terminada o abandonada
  hall() { try { return JSON.parse(localStorage.getItem(HOF_KEY) || '[]'); } catch (_) { return []; } },
  archive() {
    const c = this.data; if (!c || !c.history || !c.history.length || c.archived) return;
    const best = Math.min(...c.history.map(h => h.div));
    const top = c.squad.slice().sort((a, b) => b.goals - a.goals)[0];
    const rec = { school: c.school, manager: c.manager, crest: c.crest, seasons: c.history.length, titles: c.titles.map(t => t.name), best, goal: c.goal,
      closed: c.over === 'cerrado', date: Date.now(), scorer: top && top.goals ? [top.id, top.goals] : null, diff: c.diff || 'normal' };
    const h = this.hall(); h.unshift(rec); try { localStorage.setItem(HOF_KEY, JSON.stringify(h.slice(0, 30))); } catch (_) {}
    c.archived = true;
  },
  // Carrera de la fase 1 (divisiones de 8): se conserva el club y se rehace la temporada en curso
  migrate() {
    const c = this.data, d = this.divOf(YOU) || 3;
    c.v = 2; c.divs = JSON.parse(JSON.stringify(CAREER_START));
    if (d !== 3) c.divs[3].push(c.divs[d].pop());   // hace hueco en tu división
    c.divs[d].push(YOU);
    this.defaults(); this.newSeason(true); this.save();
    c.migrated = true;
  },
  defaults() {
    const c = this.data;
    c.clubs = c.clubs || {}; c.fac = c.fac || { campo: 0, ojeadores: 0, spa: 0, estadio: 0 };
    c.kit = c.kit || { a: '#e8c21a', b: '#1f4fc0' };
    c.crest = c.crest || { shape: 'escudo', c1: '#1f4fc0', c2: '#e8c21a', sym: 'rayo' };
    c.scout = c.scout || []; c.market = c.market || null; c.neg = c.neg || {}; c.news = c.news || [];
    const M = GAME.idmap || {};
    for (const k of [1, 2, 3]) for (const key of c.divs[k]) if (key !== YOU && !c.clubs[key]) c.clubs[key] = TEAM(key).players.map(p => M[p.id] != null ? { id: M[p.id], role: p.role } : { id: p.id, role: p.role, file: p.file, row: p.row });
  },

  /* ---------- Crear ---------- */
  incomeMul() { return this.data && this.data.manager === RAY_DARK ? 1.1 : 1; },   // pasiva de Ray Dark
  create(manager, school, diff = 'normal') {
    const c = this.data = { v: 2, diff, manager, school: school || TX('Instituto Inazuma'), season: 1, week: 1, fame: 25, money: 300, forma: 100,
      squad: [], formation: '1-2-1-1', lineup: null, tactic: 'equilibrada', divs: JSON.parse(JSON.stringify(CAREER_START)),
      titles: [], history: [], over: null, goal: false, lastActivity: null, log: [] };
    c.divs[3].push(YOU);
    this.defaults();
    c.squad = this.startingSquad();
    this.autoLineup();
    this.newSeason(true);
    this.save();
    return c;
  },
  sumIE: p => STAT_KEYS.reduce((t, k) => t + p.ie[k], 0),
  // Jugadores que no están en ningún club ni en el tuyo (agentes libres)
  taken() {
    const c = this.data, s = new Set(c.squad.map(m => m.id));
    for (const k in c.clubs) c.clubs[k].forEach(p => s.add(p.id));
    return s;
  },
  freePool(filter) {
    const t = this.taken();
    return GAME.players.filter(p => p.gacha !== false && !p.abroad && !t.has(p.id) && (!filter || filter(p)));   // los de fuera del país van aparte
  },
  // Jugadores de selecciones extranjeras (Inazuma 3): «Fuera del país», fichables pagando un extra por el traspaso internacional
  abroadList(country) {
    const t = this.taken();
    return GAME.players.filter(p => p.abroad && p.cs && p.gacha !== false && !t.has(p.id) && (!country || p.abroad === country));
  },
  abroadPrice(id) { return Math.round(this.value(id) * 1.3 / 5) * 5; },
  // 7 chavales del montón: comunes flojos de cada puesto
  startingSquad() {
    const pool = this.freePool(p => p.rarity === 'comun' && p.id < 20000);
    const pick = (role, n) => {
      const c = pool.filter(p => p.role === role).sort((a, b) => this.sumIE(a) - this.sumIE(b));
      const band = c.slice(Math.floor(c.length * 0.6), Math.floor(c.length * 0.92)), out = [];   // chavales normalitos, pero capaces de competir en Tercera
      while (out.length < n && band.length) out.push(band.splice(Math.floor(cRnd() * band.length), 1)[0]);
      return out;
    };
    return [...pick('POR', 1), ...pick('DEF', 2), ...pick('MED', 2), ...pick('DEL', 2)].map((p, i) => this.member(p.id, 1 + (i % 3)));
  },
  member(id, year = 1, nTech = 1) {
    const pd = PLAYER(id);
    const moves = pd.moves.filter(([t]) => TECH(t)).map(([t]) => t).sort((a, b) => TECH(a).power - TECH(b).power);
    const known = moves.slice(0, nTech);
    const gk = keeperTech(pd, known); if (gk != null && !known.includes(gk)) known.unshift(gk);
    return { id, year, up: {}, known, games: 0, goals: 0 };
  },
  stat(m, k) { const pd = PLAYER(m.id); return Math.round(pd.ie[k] * (pd.rarity === 'legendaria' ? 1 : 0.78)) + (m.up[k] || 0); },
  ovr(m) { return Math.round(STAT_KEYS.reduce((t, k) => t + this.stat(m, k), 0) / STAT_KEYS.length); },
  m(id) { return this.data.squad.find(x => x.id === id); },
  // Nota de un jugador para un puesto
  rate(m, role) {
    const s = k => this.stat(m, k);
    const v = { POR: (s('defensa') + s('fisico')) / 2, DEF: (s('defensa') * 2 + s('fisico') + s('rapidez')) / 4,
      MED: (s('control') * 2 + s('tiro') + s('rapidez')) / 4, DEL: (s('tiro') * 2 + s('rapidez') + s('control')) / 4 }[role];
    return Math.round(v * (playsAs(PLAYER(m.id), role) ? 1 : role === 'POR' ? 0.7 : 0.85));   // un portero de verdad casi siempre es mejor bajo palos
  },
  autoLineup() {
    const c = this.data, roles = FORMATIONS[c.formation].roles, used = new Set(), out = roles.map(() => null);
    const order = roles.map((r, i) => i).sort((a, b) => (roles[a] === 'POR' ? -1 : 0) - (roles[b] === 'POR' ? -1 : 0));
    for (const i of order) {
      const free = c.squad.filter(m => !used.has(m.id)), gks = free.filter(m => playsAs(PLAYER(m.id), 'POR'));
      const best = (roles[i] === 'POR' && gks.length ? gks : free).sort((a, b) => this.rate(b, roles[i]) - this.rate(a, roles[i]))[0];   // la portería, solo para porteros
      if (best) { out[i] = best.id; used.add(best.id); }
    }
    c.lineup = out;
  },
  lineupOk() { const c = this.data; return c.lineup && c.lineup.length === 5 && c.lineup.every(id => id != null && this.m(id)) && new Set(c.lineup).size === 5; },
  formaMul() { return 0.85 + 0.15 * this.data.forma / 100; },
  myRating() {
    const c = this.data; if (!this.lineupOk()) this.autoLineup();
    const ms = c.lineup.map(id => this.m(id));
    return Math.round(ms.reduce((t, m) => t + (this.stat(m, 'tiro') + this.stat(m, 'control') + this.stat(m, 'defensa') + this.stat(m, 'fisico')) / 4, 0) / ms.length * this.formaMul());
  },

  /* ---------- Clubes rivales (con sus plantillas, que cambian al venderte jugadores) ---------- */
  aiFactor(key) {
    const c = this.data, champ = c.history.findIndex(h => h.champion && h.div === 1);
    return DIV_FACTOR[this.divOf(key)] * ((CAREER_DIFF[c.diff] || CAREER_DIFF.normal).mul) * (c.goal && champ >= 0 ? 1 + 0.03 * Math.min(10, c.history.length - champ - 1) : 1);   // en modo infinito los rivales mejoran
  },
  clubTeam(key, progress = 0.5) {
    const c = this.data, f = this.aiFactor(key), T = TEAM(key), kit = T && (T.kit || T.kitAuto);
    const nTech = 1 + Math.floor(Math.min(1, progress) * 2.99);
    const order = { POR: 0, DEF: 1, MED: 2, DEL: 3 };
    const mem = c.clubs[key].slice().sort((a, b) => order[a.role] - order[b.role]);
    const pos = layout(mem.map(m => m.role));
    return { name: TEAM(key).name, key, players: mem.map((m, i) => {
      const pd = PLAYER(m.id);
      let techs = pd.moves.slice().sort((a, b) => a[1] - b[1]).map(x => x[0]).filter(id => TECH(id)).slice(0, nTech);
      const sig = signatureTech(pd); if (sig != null && !techs.includes(sig)) techs[0] = sig;
      const gkt = keeperTech(pd, techs); if (gkt != null) techs.unshift(gkt);
      return Object.assign(buildMatchPlayer(m.id, m.role, k => Math.round(pd.ie[k] * f), techs, [], 5 + i, pos[i]),
        { sprite: m.file ? { file: m.file, row: m.row } : Object.assign(Sprites.refOf(pd), m.role !== 'POR' && kit ? { kit } : {}) });   // los fichados por el club, con su equipación
    }) };
  },
  matchDiff() {
    const L = ['facil', 'medio', 'dificil'], i = L.indexOf(DIV_DIFF[this.myDiv()]) + ((CAREER_DIFF[this.data.diff] || CAREER_DIFF.normal).shift);
    return L[Math.max(0, Math.min(2, i))];
  },
  divOf(key) { const d = this.data.divs; return +Object.keys(d).find(k => d[k].includes(key)); },
  myDiv() { return this.divOf(YOU); },
  teamName(key) { return key === YOU ? this.data.school : (TEAM(key) || { name: key }).name; },
  rating(key) {
    if (key === YOU) return this.myRating();
    const c = this.data; c.ratings = c.ratings || {};
    if (c.ratings[key] == null) {
      const t = this.clubTeam(key);
      c.ratings[key] = Math.round(t.players.reduce((s, p) => s + (p.kick + p.control + p.defense + p.body) / 4, 0) / t.players.length);
    }
    return c.ratings[key];
  },

  /* ---------- Temporada ---------- */
  // Liga a una vuelta (método del círculo): 9 jornadas de 5 partidos
  fixtures(teams) {
    const t = teams.slice().sort(() => cRnd() - 0.5), n = t.length, rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const ms = [];
      for (let i = 0; i < n / 2; i++) { const a = t[i], b = t[n - 1 - i]; ms.push(r % 2 ? [b, a] : [a, b]); }
      rounds.push(ms);
      t.splice(1, 0, t.pop());
    }
    return rounds;
  },
  newSeason(first) {
    const c = this.data;
    c.week = 1; c.ratings = {}; c.fix = {}; c.tables = {}; c.results = {}; c.po = null; c.market = null;
    for (const d of [1, 2, 3]) {
      c.fix[d] = this.fixtures(c.divs[d]);
      c.results[d] = c.fix[d].map(() => []);
      c.tables[d] = Object.fromEntries(c.divs[d].map(k => [k, { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 }]));
    }
    this.setupCup();
    if (!first) c.forma = Math.max(c.forma, 80);
  },
  // Copa Inazuma: los 30 equipos; los 2 mejores de Primera esperan en octavos
  setupCup() {
    const c = this.data, all = [1, 2, 3].flatMap(d => c.divs[d]);
    const byes = c.divs[1].filter(k => k !== YOU).sort((a, b) => this.rating(b) - this.rating(a)).slice(0, 2);
    const rest = all.filter(k => !byes.includes(k)).sort(() => cRnd() - 0.5);
    const ties = []; for (let i = 0; i < rest.length; i += 2) ties.push([rest[i], rest[i + 1]]);
    c.cup = { round: 0, ties, byes, rounds: [], winner: null, out: false };
  },
  cupTie() { const c = this.data; return c.cup && !c.cup.out && !c.cup.winner ? c.cup.ties.find(p => p.includes(YOU)) : null; },
  weekType(w = this.data.week) { return SCHED[w]; },
  jornadaOf(week) { const i = LEAGUE_WEEKS.indexOf(week); return i < 0 ? null : i; },
  // Tu partido de esta semana (o null si no juegas)
  nextMatch() {
    const c = this.data, t = this.weekType(), d = this.myDiv();
    if (t === 'L') {
      const j = this.jornadaOf(c.week), m = c.fix[d][j].find(p => p.includes(YOU));
      return { type: 'liga', j, rival: m[0] === YOU ? m[1] : m[0], home: m[0] === YOU };
    }
    if (t === 'C' && c.cup && c.cup.round === CUP_WEEKS.indexOf(c.week)) {
      const m = this.cupTie();
      if (m) return { type: 'copa', round: c.cup.round, rival: m[0] === YOU ? m[1] : m[0], home: m[0] === YOU, ko: true };
    }
    if ((t === 'P1' || t === 'P2') && c.po && c.po[d]) {
      const P = c.po[d], list = t === 'P1' ? P.semis : (P.final ? [P.final] : []);
      const m = list.find(p => p.includes(YOU));
      if (m) return { type: t === 'P1' ? 'semi' : 'final', rival: m[0] === YOU ? m[1] : m[0], home: m[0] === YOU, ko: true };
    }
    return null;
  },
  standings(d) {
    const T = this.data.tables[d];
    return Object.entries(T).map(([k, r]) => Object.assign({ key: k }, r))
      .sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf || this.teamName(a.key).localeCompare(this.teamName(b.key)));
  },
  myPos() { return this.standings(this.myDiv()).findIndex(r => r.key === YOU) + 1; },
  // Playoff de ascenso en Segunda y Tercera: 3º-6º (semis 3-6 y 4-5 en casa del mejor; final en casa del mejor clasificado)
  setupPlayoffs() {
    const c = this.data; c.po = {};
    for (const d of [2, 3]) { const s = this.standings(d).map(r => r.key); c.po[d] = { semis: [[s[2], s[5]], [s[3], s[4]]], res: [], final: null, finalRes: null, winner: null, seed: s }; }
  },

  /* ---------- Simulación ---------- */
  poisson(l) { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= cRnd(); } while (p > L); return k - 1; },
  simScore(rA, rB, tA = TACTICS.equilibrada, tB = TACTICS.equilibrada, scale = 12) {
    const lam = (x, y, tf, ta) => Math.max(0.15, Math.min(4.5, 1.35 * Math.exp((x - y) / scale) * tf.for * ta.ag));
    return [this.poisson(lam(rA, rB, tA, tB)), this.poisson(lam(rB, rA, tB, tA))];
  },
  // Tanda de penaltis: gana el mejor más a menudo
  penalties(rA, rB) {
    const pA = Math.max(0.3, Math.min(0.7, 0.5 + (rA - rB) / 100)), aWins = cRnd() < pA;
    const lo = 2 + Math.floor(cRnd() * 3), hi = lo + 1 + (cRnd() < 0.3 ? 1 : 0);
    return aWins ? [hi, lo] : [lo, hi];
  },
  // Partido simulado como mánager: marcador y crónica minuto a minuto
  simulateMine(tacticKey) {
    const c = this.data, nm = this.nextMatch(), tac = TACTICS[tacticKey] || TACTICS.equilibrada;
    const rival = this.clubTeam(nm.rival, Math.min(1, c.season / 3));
    let [gA, gB] = this.simScore(this.myRating() + (nm.home ? 1.5 : 0), this.rating(nm.rival) + (nm.home ? 0 : 1.5), tac);
    const mine = c.lineup.map(id => this.m(id)), ev = [];
    const pickScorer = list => {
      const w = list.map(p => (p.role === 'DEL' ? 2.2 : p.role === 'MED' ? 1.2 : p.role === 'DEF' ? 0.4 : 0.02) * (p.kick || 50));
      let r = cRnd() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; } return list[0];
    };
    const myPlayers = mine.map((m, i) => ({ name: PLAYER(m.id).name, role: FORMATIONS[c.formation].roles[i], kick: this.stat(m, 'tiro'), id: m.id,
      techs: m.known.map(TECH).filter(t => t && t.type === 'tiro') }));
    const rvPlayers = rival.players.map(p => ({ name: p.name, role: p.role, kick: p.kick, techs: p.techs.filter(t => t.type === 'tiro') }));
    const goal = (team, list) => { const p = pickScorer(list); const t = p.techs.length && cRnd() < 0.55 ? pickR(p.techs) : null; return { team, type: 'goal', name: p.name, tech: t && t.name, id: p.id }; };
    for (let i = 0; i < gA; i++) ev.push(goal('A', myPlayers));
    for (let i = 0; i < gB; i++) ev.push(goal('B', rvPlayers));
    const gkA = myPlayers.find(p => p.role === 'POR'), gkB = rival.players.find(p => p.role === 'POR');
    const nSaves = 2 + Math.floor(cRnd() * 4);
    for (let i = 0; i < nSaves; i++) { const mineSave = cRnd() < 0.5; ev.push({ team: mineSave ? 'A' : 'B', type: 'save', name: mineSave ? gkA && gkA.name : gkB && gkB.name }); }
    ev.forEach(e => { e.min = 1 + Math.floor(cRnd() * 89); });
    ev.sort((a, b) => a.min - b.min);
    let pens = null;
    if (nm.ko && gA === gB) { pens = this.penalties(this.myRating(), this.rating(nm.rival)); ev.push({ type: 'pens', min: 90, a: pens[0], b: pens[1] }); }
    return { gA, gB, pens, events: ev, rival: nm.rival, forma: tac.forma };
  },

  /* ---------- Semana ---------- */
  doActivity(act, statKey) {
    const c = this.data, A = ACTIVITIES[act]; if (!A) return null;
    let msg = '';
    if (act === 'entrenar') {
      const k = STAT_KEYS.includes(statKey) ? statKey : 'tiro', n = 2 + c.fac.campo;
      c.squad.forEach(m => { m.up[k] = (m.up[k] || 0) + n; });
      const lucky = pickR(c.squad), k2 = pickR(STAT_KEYS); lucky.up[k2] = (lucky.up[k2] || 0) + 1;
      msg = `${TX('Entrenamiento de')} ${STAT_LABEL[k]}: +${n} ${TX('a todo el equipo.')} ${PLAYER(lucky.id).name} ${TX('destaca (+1')} ${STAT_LABEL[k2]}).`;
    } else if (act === 'tecnicas') {
      const learned = [];
      c.squad.forEach(m => {
        const pd = PLAYER(m.id);
        const next = pd.moves.filter(([t]) => TECH(t) && !m.known.includes(t)).map(([t]) => t).sort((a, b) => TECH(a).power - TECH(b).power)[0];
        if (next != null && cRnd() < 0.45) { m.known.push(next); learned.push(pd.name.split(' ')[0] + ': ' + TECH(next).name); }
        m.up.control = (m.up.control || 0) + 1;
      });
      msg = learned.length ? TX('¡Supertécnicas nuevas! ') + learned.join(' · ') : TX('Nadie ha aprendido nada nuevo esta vez, pero todos mejoran el control (+1).');
    } else if (act === 'ojear') {
      const n = 3 + (c.fac.ojeadores >= 2 ? 1 : 0), lvl = c.fac.ojeadores;
      const want = { comun: 1, rara: 0.6 + lvl * 0.25, epica: 0.12 + lvl * 0.12, legendaria: lvl >= 3 ? 0.03 : 0 };
      const pool = this.freePool(p => want[p.rarity] > 0);
      const found = [];
      for (let i = 0; i < 60 && found.length < n; i++) {
        const p = pickR(pool); if (!p || found.includes(p.id) || cRnd() > want[p.rarity]) continue;
        found.push(p.id);
      }
      c.scout = found.map(id => ({ id, price: Math.round(this.value(id) * 0.55), until: c.week + 3 }));
      msg = `${TX('Tus ojeadores han encontrado')} ${found.length} ${TX('jugadores. Míralos en Fichajes → Ojeados (baratos, pero solo durante 3 semanas).')}`;
    } else if (act === 'descansar') msg = TX('El equipo descansa y recupera la forma.');
    const fm = act === 'descansar' ? A.forma + c.fac.spa * 8 : A.forma;
    c.forma = Math.max(10, Math.min(100, c.forma + fm));
    c.lastActivity = act;
    this.save();
    return msg;
  },
  // Juega/resuelve los partidos de la semana. mine = { gA, gB, pens } si jugabas
  resolveWeek(mine, extraForma = 0, scorers = []) {
    const c = this.data, t = this.weekType(), d = this.myDiv(), nm = mine ? this.nextMatch() : null;
    const out = { type: t, results: {}, fame: 0, money: 0 };
    if (nm) Object.assign(out, { gA: mine.gA, gB: mine.gB, pens: mine.pens || null, rival: nm.rival, kind: nm.type });
    const pair = (a, b, home = 1.5, scale = 12) => {
      if (a === YOU) return [mine.gA, mine.gB, mine.pens];
      if (b === YOU) return [mine.gB, mine.gA, mine.pens && [mine.pens[1], mine.pens[0]]];
      const [ga, gb] = this.simScore(this.rating(a) + home, this.rating(b), undefined, undefined, scale);
      return [ga, gb, null];
    };
    if (t === 'L') {
      const j = this.jornadaOf(c.week);
      for (const dv of [1, 2, 3]) {
        out.results[dv] = [];
        for (const [a, b] of c.fix[dv][j]) {
          const [ga, gb] = pair(a, b), T = c.tables[dv], A = T[a], B = T[b];
          A.pj++; B.pj++; A.gf += ga; A.gc += gb; B.gf += gb; B.gc += ga;
          if (ga > gb) { A.g++; B.p++; A.pts += 3; } else if (ga < gb) { B.g++; A.p++; B.pts += 3; } else { A.e++; B.e++; A.pts++; B.pts++; }
          c.results[dv][j].push([a, b, ga, gb]); out.results[dv].push([a, b, ga, gb]);
        }
      }
    } else if (t === 'C' && c.cup && !c.cup.winner && c.cup.round === CUP_WEEKS.indexOf(c.week)) {
      const C = c.cup, res = C.ties.map(([a, b]) => {
        let [ga, gb, pens] = pair(a, b, 1, 20);   // en la Copa hay más sorpresas
        if (ga === gb && !pens) pens = this.penalties(this.rating(a), this.rating(b));
        return [a, b, ga, gb, pens, ga > gb || (ga === gb && pens[0] > pens[1]) ? a : b];
      });
      C.rounds.push(res); out.results.cup = res; out.cupRound = C.round;
      const win = res.map(r => r[5]).concat(C.round === 0 ? C.byes : []);
      if (!win.includes(YOU) && (C.ties.some(p => p.includes(YOU)))) C.out = true;
      if (win.length === 1) { C.winner = win[0]; out.cupWinner = win[0]; if (win[0] === YOU) c.titles.push({ season: c.season, name: TX('Copa Inazuma') }); }
      else { const w = win.sort(() => cRnd() - 0.5); C.ties = []; for (let i = 0; i < w.length; i += 2) C.ties.push([w[i], w[i + 1]]); }
      C.round++;
    } else if ((t === 'P1' || t === 'P2') && c.po) {
      for (const dv of [2, 3]) {
        const P = c.po[dv]; out.results[dv] = [];
        const play = ([a, b]) => {
          let [ga, gb, pens] = pair(a, b, 1.5);
          if (ga === gb && !pens) pens = this.penalties(this.rating(a), this.rating(b));
          const w = ga > gb || (ga === gb && pens[0] > pens[1]) ? a : b;
          const r = [a, b, ga, gb, pens, w]; out.results[dv].push(r); return r;
        };
        if (t === 'P1') { P.res = P.semis.map(play); P.final = [P.res[0][5], P.res[1][5]].sort((x, y) => P.seed.indexOf(x) - P.seed.indexOf(y)); }
        else { P.finalRes = play(P.final); P.winner = P.finalRes[5]; }
      }
    }
    if (nm) {
      const won = mine.gA > mine.gB || (mine.gA === mine.gB && mine.pens && mine.pens[0] > mine.pens[1]);
      const draw = mine.gA === mine.gB && !mine.pens;
      const tk = DIV_TICKET[d] * (1 + c.fame / 120) * (1 + 0.25 * c.fac.estadio) * (nm.ko ? 1.6 : 1) * (nm.type === 'copa' ? 1 + nm.round * 0.35 : 1);
      out.fame = won ? (nm.ko ? 7 : 5) : draw ? 1 : (nm.type === 'copa' ? -1 : nm.ko ? -2 : -4);
      if (out.cupWinner === YOU) { out.fame += 12; out.money += DIV_PRIZE[1]; out.tickets = 10; Profile.data.tickets += 10; Profile.save(); }
      out.money += Math.round(won ? tk : draw ? tk * 0.5 : tk * 0.25);
      out.money = Math.round(out.money * this.incomeMul());
      c.fame = Math.max(0, Math.min(100, c.fame + out.fame)); c.money += out.money;
      c.forma = Math.max(10, c.forma - Math.max(4, 10 - c.fac.spa * 2) + extraForma);
      // Rendimiento: los titulares suben o bajan según el resultado, sus goles y (porteros) los goles recibidos
      const roles = FORMATIONS[c.formation].roles, GROW = { POR: ['defensa', 'fisico'], DEF: ['defensa', 'fisico', 'rapidez'], MED: ['control', 'rapidez', 'tiro'], DEL: ['tiro', 'rapidez', 'control'] };
      const goalsBy = {}; scorers.forEach(id => { goalsBy[id] = (goalsBy[id] || 0) + 1; const m = this.m(id); if (m) m.goals++; });
      out.prog = [];
      c.lineup.forEach((id, i) => {
        const m = this.m(id); if (!m) return; m.games++;
        let sc = (won ? 1 : draw ? 0 : -1) + 0.6 * (goalsBy[id] || 0);
        if (roles[i] === 'POR') sc += mine.gB === 0 ? 0.7 : mine.gB >= 3 ? -0.7 : 0;
        if (sc > 0 && cRnd() < Math.min(0.9, 0.4 + 0.18 * sc)) {
          const k = (goalsBy[id] && cRnd() < 0.6) ? 'tiro' : pickR(GROW[roles[i]] || STAT_KEYS);
          m.up[k] = (m.up[k] || 0) + 1; out.prog.push({ id, k, d: 1 });
        } else if (sc < 0 && cRnd() < 0.35) {
          const k = pickR(STAT_KEYS); if ((m.up[k] || 0) > -8) { m.up[k] = (m.up[k] || 0) - 1; out.prog.push({ id, k, d: -1 }); }
        }
      });
      c.log.unshift({ s: c.season, w: c.week, txt: `${this.teamName(YOU)} ${mine.gA}-${mine.gB} ${this.teamName(nm.rival)}` }); c.log.length = Math.min(c.log.length, 30);
      // Fichar al vencido: a veces un jugador del rival quiere venirse contigo
      if (won && c.squad.length < SQUAD_MAX && cRnd() < 0.4 + c.fame / 400) {
        const club = c.clubs[nm.rival], best = club.slice().sort((a, b) => this.sumIE(PLAYER(b.id)) - this.sumIE(PLAYER(a.id)))[0];
        const cand = club.filter(p => p !== best && this.buyable(p.id));
        if (cand.length) { const p = pickR(cand); out.vencido = { key: nm.rival, id: p.id, price: Math.round(this.value(p.id, nm.rival) * 0.6) }; c.vencido = out.vencido; }
      }
      if (c.fame <= 0 && c.season > 1) { c.over = 'cerrado'; this.archive(); }
      if (c.season === 1) c.fame = Math.max(1, c.fame);   // la primera temporada el director da margen
    }
    this.save();
    return out;
  },
  finishMatch(gA, gB, pens, extraForma = 0, scorers = []) { return this.resolveWeek({ gA, gB, pens }, extraForma, scorers); },
  // Pasa a la semana siguiente; al acabar la última cierra la temporada
  advance() {
    const c = this.data;
    // Semanas con partidos en los que no juegas (playoffs ajenos): se simulan al pasar
    const t = this.weekType();
    if ((t === 'P1' || t === 'P2') && c.po && !this.nextMatch() && !c.poDone) this.resolveWeek(null);
    if (t === 'C' && c.cup && !this.nextMatch() && c.cup.round === CUP_WEEKS.indexOf(c.week)) { const r = this.resolveWeek(null); c.lastCup = r.results.cup || null; }
    c.poDone = false;
    c.vencido = null;
    // Ingresos semanales por patrocinio
    c.money += Math.round((8 + c.fame * 0.5) * DIV_SPONSOR[this.myDiv()] * this.incomeMul());
    c.scout = (c.scout || []).filter(s => s.until > c.week + 1);
    if (c.week < WEEKS) {
      c.week++;
      if (this.weekType() === 'P1' && !c.po) this.setupPlayoffs();
      this.save(); return null;
    }
    return this.endSeason();
  },
  endSeason() {
    const c = this.data, d = this.myDiv(), sum = { season: c.season, div: d, pos: this.myPos(), moves: [], fame: 0, money: 0, champion: false };
    const table = {}; for (const k of [1, 2, 3]) table[k] = this.standings(k).map(r => r.key);
    if (!c.po) { this.setupPlayoffs(); c.week = 15; this.resolveWeek(null); c.week = 16; this.resolveWeek(null); }
    const poW = { 2: c.po[2].winner, 3: c.po[3].winner };
    const up2 = [...table[2].slice(0, 2), poW[2]], up3 = [...table[3].slice(0, 2), poW[3]];
    const down1 = table[1].slice(-3), down2 = table[2].slice(-3);
    const pos = sum.pos;
    if (pos === 1) { sum.champion = true; c.titles.push({ season: c.season, name: TX('Liga ') + DIV_NAME[d] }); sum.fame += 15; sum.money += DIV_PRIZE[d]; }
    else sum.money += Math.round(DIV_PRIZE[d] * Math.max(0.08, (11 - pos) / 20));
    sum.cupWinner = c.cup && c.cup.winner;
    if (d === 1 && pos === 1 && !c.goal) { c.goal = true; sum.goal = true; }
    if (d > 1 && up2.concat(up3).includes(YOU)) { sum.moves.push('up'); sum.fame += 10; if (poW[d] === YOU) { sum.playoff = true; c.titles.push({ season: c.season, name: TX('Playoff de ascenso') }); } }
    if (d < 3 && (d === 1 ? down1 : down2).includes(YOU)) { sum.moves.push('down'); sum.fame -= 15; }
    if (d === 3 && pos >= 8) { sum.fame -= c.season === 1 ? 4 : 12; sum.warning = true; }   // el primer año, el director es comprensivo
    c.divs[1] = c.divs[1].filter(k => !down1.includes(k)).concat(up2);
    c.divs[2] = c.divs[2].filter(k => !up2.includes(k) && !down2.includes(k)).concat(down1, up3);
    c.divs[3] = c.divs[3].filter(k => !up3.includes(k)).concat(down2);
    sum.table = table[d]; sum.po = c.po[d] || null;
    sum.promoted = { 1: up2, 2: up3 }; sum.relegated = { 1: down1, 2: down2 };
    sum.money = Math.round(sum.money * this.incomeMul());
    c.fame = Math.max(c.season === 1 ? 10 : 0, Math.min(100, c.fame + sum.fame)); c.money += sum.money;   // tras el primer año, al menos 10 de fama
    c.history.push({ season: c.season, div: d, pos, champion: sum.champion, up: sum.moves.includes('up'), down: sum.moves.includes('down'), cup: sum.cupWinner === YOU, cupRound: c.cup ? c.cup.rounds.length : 0 });
    // Premios para el gacha: tickets por cada logro de la temporada
    sum.tickets = (sum.champion ? 10 : 0) + (sum.moves.includes('up') ? 5 : 0) + (sum.goal ? 20 : 0);
    if (sum.tickets) { Profile.data.tickets += sum.tickets; Profile.save(); }
    // Graduaciones (los de 6º se van) y cantera (llegan juveniles)
    sum.grads = c.squad.filter(m => m.year >= LAST_YEAR).map(m => m.id);
    c.squad = c.squad.filter(m => m.year < LAST_YEAR);
    c.squad.forEach(m => { m.year++; STAT_KEYS.forEach(k => { m.up[k] = (m.up[k] || 0) + YEAR_GROWTH; }); });   // un año más de experiencia
    sum.growth = YEAR_GROWTH;
    // Cantera: siempre llegan al menos 2; si no caben, el jugador elige a quién deja ir (c.pendingYouth)
    const youth = this.youth(Math.max(2, SQUAD_MIN - c.squad.length));
    sum.youth = youth.map(m => m.id);
    const room = Math.max(0, SQUAD_MAX - c.squad.length);
    c.squad.push(...youth.slice(0, room));
    c.pendingYouth = youth.slice(room);
    sum.pendingYouth = c.pendingYouth.map(m => m.id);
    // Los clubes rivales reponen jugadores que les falten
    for (const k in c.clubs) while (c.clubs[k].length < 5) c.clubs[k].push(this.replacement(c.clubs[k][0] ? 'MED' : 'POR', 50));
    if (sum.season % 3 === 0 && !(c.fame <= 0 && c.history.length > 1)) { c.wc = this.wcCreate(sum.season); sum.wc = true; }   // cada 3 temporadas: Mundial
    c.season++;
    if (c.fame <= 0 && c.history.length > 1) { c.over = 'cerrado'; this.archive(); }
    c.fame = Math.max(c.fame, c.over ? 0 : 1);
    this.autoLineup();
    this.newSeason(false);
    this.save();
    return sum;
  },
  // Juveniles de la cantera: comunes de 1º curso (mejores con más fama)
  youth(n) {
    const pool = this.freePool(p => p.rarity === 'comun' || (p.rarity === 'rara' && cRnd() < this.data.fame / 300));
    const out = [];
    const roles = ['POR', 'DEF', 'MED', 'DEL'];
    const have = r => this.data.squad.filter(m => PLAYER(m.id).role === r).length + out.filter(m => PLAYER(m.id).role === r).length;
    for (let i = 0; i < n; i++) {
      const need = roles.find(r => have(r) < (r === 'POR' ? 1 : 2)) || pickR(roles);
      const p = pickR(pool.filter(q => q.role === need && !out.some(m => m.id === q.id)));
      if (p) out.push(this.member(p.id, 1));
    }
    return out;
  },

  // Juvenil que no cabe: entra si dejas ir a alguien de la plantilla (releaseId), o se va (releaseId = null)
  resolveYouth(youthId, releaseId) {
    const c = this.data, i = (c.pendingYouth || []).findIndex(m => m.id === youthId); if (i < 0) return { ok: false };
    const kid = c.pendingYouth.splice(i, 1)[0];
    if (releaseId == null) { this.save(); return { ok: true, msg: PLAYER(kid.id).name + TX(' se va a otro instituto.') }; }
    const out = c.squad.find(m => m.id === releaseId); if (!out) { c.pendingYouth.splice(i, 0, kid); return { ok: false }; }
    c.squad = c.squad.filter(m => m !== out); c.squad.push(kid);
    if (c.lineup.includes(releaseId)) this.autoLineup();   // solo se recoloca si se iba un titular
    c.news.unshift(`${TX('T{0}', c.season)}: ${PLAYER(out.id).name} ${TX('deja el club y entra')} ${PLAYER(kid.id).name} ${TX('de la cantera')}`); c.news.length = Math.min(c.news.length, 20);
    this.save(); return { ok: true, msg: PLAYER(kid.id).name + TX(' entra en la plantilla.') };
  },

  /* ---------- Fichajes ---------- */
  // Valor de mercado: nivel, rareza y división del club que lo tiene
  value(id, clubKey) {
    const pd = PLAYER(id), ovr = this.sumIE(pd) / STAT_KEYS.length * 0.78;
    const base = 15 + Math.pow(Math.max(0, ovr - 30), 2) * 0.9;
    const dv = clubKey ? this.divOf(clubKey) : 0;
    return Math.round(base * (RARITY_MUL[pd.rarity] || 1) * ({ 1: 1.4, 2: 1.15, 3: 1, 0: 0.8 }[dv] || 1) / 5) * 5;
  },
  // ¿Tiene sprite de colección? (algunos jugadores del 2 solo existen como rivales)
  buyable(id) { const pd = PLAYER(id); return !!(pd && pd.cs && pd.gacha !== false); },
  // Mercado de la semana: agentes libres y jugadores de otros clubes
  marketList() {
    const c = this.data;
    if (!c.market || c.market.week !== c.week || c.market.season !== c.season) {
      const free = this.freePool(p => p.rarity !== 'legendaria');
      const libres = [];
      // De vez en cuando, un agente libre destacado (más probable con más fama): épico o uno de los mejores raros
      let star = null;
      const r = cRnd(), pEpic = 0.15 + c.fame / 400, pRare = 0.35;
      const best = list => list.sort((a, b) => this.sumIE(b) - this.sumIE(a)).slice(0, Math.max(1, Math.ceil(list.length * 0.3)));
      if (r < pEpic) star = pickR(free.filter(p => p.rarity === 'epica'));
      else if (r < pEpic + pRare) star = pickR(best(free.filter(p => p.rarity === 'rara')));
      if (star) libres.push(star.id);
      for (let i = 0; i < 80 && libres.length < 8; i++) { const p = pickR(free); if (p && !libres.includes(p.id) && (p.rarity === 'comun' || cRnd() < 0.5)) libres.push(p.id); }
      c.market = { week: c.week, season: c.season, libres, star: star ? star.id : null };
      this.save();
    }
    return c.market;
  },
  clubPlayers(div) {
    const c = this.data, out = [];
    for (const key of c.divs[div]) if (key !== YOU) {
      const best = c.clubs[key].slice().sort((a, b) => this.sumIE(PLAYER(b.id)) - this.sumIE(PLAYER(a.id)))[0];
      c.clubs[key].forEach(p => { if (this.buyable(p.id)) out.push({ key, id: p.id, star: p === best }); });
    }
    return out;
  },
  canSign() {
    const c = this.data;
    if (c.squad.length >= SQUAD_MAX) return TX('Tu plantilla está llena (máximo ') + SQUAD_MAX + TX('). Vende o libera a alguien.');
    return null;
  },
  sign(id, price, from) {
    const c = this.data, err = this.canSign(); if (err) return { ok: false, msg: err };
    if (c.money < price) return { ok: false, msg: TX('No tienes dinero suficiente.') };
    c.money -= price;
    const pd = PLAYER(id), fromClub = from && c.clubs[from];
    const year = 1 + Math.floor(cRnd() * (LAST_YEAR - 1));   // nunca llega alguien a punto de irse
    c.squad.push(this.member(id, year, fromClub ? 2 : 1));
    if (fromClub) {   // el club rival rellena el hueco con otro jugador del mismo puesto (algo peor)
      const i = fromClub.findIndex(p => p.id === id), role = fromClub[i].role;
      fromClub[i] = this.replacement(role, this.sumIE(pd) / STAT_KEYS.length * 0.9);
      delete c.ratings[from];
    }
    c.scout = (c.scout || []).filter(s => s.id !== id);
    if (c.market) c.market.libres = c.market.libres.filter(x => x !== id);
    c.news.unshift(`${TX('T{0} S{1}', c.season, c.week)}${TX(': fichaje de')} ${pd.name} ${TX('por')} ${price} 💰${from ? ' (' + this.teamName(from) + ')' : ''}`); c.news.length = Math.min(c.news.length, 20);
    this.save();
    return { ok: true, msg: `${TX('¡')}${pd.name} ${TX('ficha por')} ${c.school}! (${TX('{0}º curso', year)})` };
  },
  replacement(role, maxAvg) {
    const pool = this.freePool(p => p.role === role && this.sumIE(p) / STAT_KEYS.length <= maxAvg);
    const p = pickR(pool.length ? pool : this.freePool(p => p.role === role));
    return { id: p.id, role };
  },
  // Negociación con un club: acepta, rechaza o contraoferta
  offer(key, id, amount) {
    const c = this.data, k = key + ':' + id, N = c.neg[k] = c.neg[k] && c.neg[k].week === c.week ? c.neg[k] : { week: c.week, tries: 0, closed: false, counter: null };
    if (N.closed) return { res: 'closed', msg: `${this.teamName(key)} ${TX('no quiere seguir negociando esta semana.')}` };
    const club = c.clubs[key], best = club.slice().sort((a, b) => this.sumIE(PLAYER(b.id)) - this.sumIE(PLAYER(a.id)))[0];
    let ask = this.value(id, key);
    if (best && best.id === id) ask *= 1.5;                           // su estrella cuesta más
    const gap = this.divOf(key) - this.myDiv(); if (gap < 0) ask *= 1 + 0.25 * -gap;   // un club de más arriba no vende barato a uno de abajo
    ask *= 1.1 - c.fame / 500;                                        // la fama ayuda
    ask = Math.round(ask / 5) * 5;
    N.tries++;
    if (N.counter && amount >= N.counter) { this.save(); return { res: 'accept', price: amount }; }
    if (amount >= ask) { this.save(); return { res: 'accept', price: amount }; }
    if (amount >= ask * 0.8 && N.tries < 3) {
      N.counter = Math.round((ask * (1 + cRnd() * 0.08)) / 5) * 5;
      this.save(); return { res: 'counter', price: N.counter, msg: `${this.teamName(key)} ${TX('pide')} ${N.counter} 💰.` };
    }
    if (N.tries >= 3) N.closed = true;
    this.save();
    return { res: 'reject', msg: N.closed ? `${this.teamName(key)} ${TX('se cansa y cierra la negociación hasta la semana que viene.')}` : `${this.teamName(key)} ${TX('rechaza la oferta: es demasiado poco.')}` };
  },
  // Vender: un club de la liga paga el 70 % de su valor
  sell(id) {
    const c = this.data;
    if (c.squad.length <= SQUAD_MIN) return { ok: false, msg: `${TX('Necesitas al menos')} ${SQUAD_MIN} ${TX('jugadores.')}` };
    const pd = PLAYER(id), price = Math.round(this.value(id) * 0.7 / 5) * 5;
    const buyers = Object.keys(c.clubs).filter(k => c.divs[this.myDiv()].includes(k) || c.divs[Math.max(1, this.myDiv() - 1)].includes(k));
    const buyer = pickR(buyers);
    c.squad = c.squad.filter(m => m.id !== id); c.money += price;
    if (c.lineup.includes(id)) this.autoLineup();
    c.news.unshift(`${TX('T{0} S{1}', c.season, c.week)}: ${pd.name} ${TX('vendido al')} ${this.teamName(buyer)} ${TX('por')} ${price} 💰`);
    this.save();
    return { ok: true, msg: `${pd.name} ${TX('se va al')} ${this.teamName(buyer)} ${TX('por')} ${price} 💰.` };
  },
  release(id) {
    const c = this.data;
    if (c.squad.length <= SQUAD_MIN) return { ok: false, msg: `${TX('Necesitas al menos')} ${SQUAD_MIN} ${TX('jugadores.')}` };
    c.squad = c.squad.filter(m => m.id !== id); if (c.lineup.includes(id)) this.autoLineup(); this.save();
    return { ok: true, msg: `${PLAYER(id).name} ${TX('deja el club.')}` };
  },
  upgrade(k) {
    const c = this.data, F = FACILITIES[k], lv = c.fac[k];
    if (lv >= F.cost.length) return { ok: false, msg: TX('Ya está al máximo.') };
    if (c.money < F.cost[lv]) return { ok: false, msg: TX('No tienes dinero suficiente.') };
    c.money -= F.cost[lv]; c.fac[k]++; this.save();
    return { ok: true, msg: `${F.name}${TX(': nivel')} ${c.fac[k]}.` };
  },

  // Equipos para jugar tu partido de la semana
  /* ---------- Técnicas equipadas: el jugador elige entre las que aprende (su lista del juego) ---------- */
  learnset(id) { const pd = PLAYER(id); return [...new Set(pd.moves.map(x => x[0]).filter(t => TECH(t)))]; },
  equipped(m) {
    const ok = new Set(this.learnset(m.id).concat(m.known));
    if (m.equip && m.equip.length && m.equip.every(t => ok.has(t))) return m.equip.slice(0, TECH_SLOTS);
    return m.known.slice().sort((a, b) => TECH(b).power - TECH(a).power).slice(0, TECH_SLOTS);
  },
  toggleEquip(id, t) {
    const m = this.m(id); if (!m) return;
    let e = (m.equip && m.equip.length ? m.equip : this.equipped(m)).slice();
    if (e.includes(t)) e = e.filter(x => x !== t); else { if (e.length >= TECH_SLOTS) e.shift(); e.push(t); }
    m.equip = e; this.save();
  },
  /* ---------- Modo desarrollador ---------- */
  // Ocupar el sitio de otro club: su división, su nombre y sus jugadores (ellos se quedan con tu plantilla); la temporada empieza de nuevo
  devTakeClub(key) {
    const c = this.data, d = this.divOf(key), myd = this.myDiv(), old = c.squad.map(m => ({ id: m.id, role: PLAYER(m.id).role }));
    c.divs[myd] = c.divs[myd].map(k => k === YOU ? key : k); c.divs[d] = c.divs[d].map(k => k === key ? YOU : k);
    c.squad = c.clubs[key].map(m => this.member(m.id, 2, 2));
    c.clubs[key] = old.slice(0, 7);
    c.school = TEAM(key).name; c.lineup = null; this.autoLineup(); this.newSeason(false); this.save();
  },
  devToDiv(d) {
    const c = this.data, myd = this.myDiv(); if (d === myd) return;
    const other = c.divs[d].slice().sort((a, b) => this.rating(a) - this.rating(b))[0];
    c.divs[myd] = c.divs[myd].map(k => k === YOU ? other : k); c.divs[d] = c.divs[d].map(k => k === other ? YOU : k);
    this.newSeason(false); this.save();
  },
  devSign(id) { const c = this.data; if (c.squad.some(m => m.id === id)) return false; c.squad.push(this.member(id, 1, 2)); this.save(); return true; },
  devEndSeason() {
    const c = this.data; let sum = null, guard = 0;
    while (!sum && !c.over && guard++ < 40) { if (this.nextMatch()) { const r = this.simulateMine(c.tactic); this.finishMatch(r.gA, r.gB, r.pens, r.forma); } if (!c.over) sum = this.advance(); }
    return sum;
  },
  /* ---------- Mundial (cada 3 temporadas): eres el seleccionador de Inazuma Japón ---------- */
  wcCreate(season) { return { season, state: 'call', squad: [], group: null, round: 0, opp: null, log: [] }; },
  wcStat(id, k) {             // jugadores de tu club: con su entrenamiento; convocados de otros clubes: su nivel actual
    const m = this.m(id), pd = PLAYER(id);
    return m ? this.stat(m, k) : Math.round(pd.ie[k] * 0.85);
  },
  wcScore(id) { return Math.round(STAT_KEYS.reduce((t, k) => t + this.wcStat(id, k), 0) / STAT_KEYS.length); },
  // Convocables: toda tu plantilla y los mejores de las ligas (más fácil cuanto mejor ha ido su temporada)
  wcCandidates() {
    const c = this.data, out = c.squad.map(m => ({ id: m.id, club: YOU, score: this.wcScore(m.id) }));
    const seen = new Set(out.map(x => x.id)), others = [];
    for (const key in c.clubs) for (const m of c.clubs[key]) if (!seen.has(m.id) && PLAYER(m.id) && PLAYER(m.id).cs) {
      seen.add(m.id);
      const d = this.divOf(key), pos = this.standings(d).findIndex(r => r.key === key);
      others.push({ id: m.id, club: key, score: this.wcScore(m.id) + (3 - d) * 2 + (pos >= 0 && pos < 3 ? 2 : 0) });
    }
    others.sort((a, b) => b.score - a.score);
    return out.concat(others.slice(0, 24));
  },
  wcRoles(ids) {               // coloca a los 5 en los puestos de tu formación
    const roles = FORMATIONS[this.data.formation].roles, used = new Set(), out = roles.map(() => null);
    const rr = (id, r) => { const s = k => this.wcStat(id, k), v = r === 'POR' ? (s('defensa') + s('fisico')) / 2 : r === 'DEF' ? (s('defensa') * 2 + s('fisico') + s('rapidez')) / 4 : r === 'MED' ? (s('control') * 2 + s('tiro') + s('rapidez')) / 4 : (s('tiro') * 2 + s('rapidez') + s('control')) / 4; return v * (playsAs(PLAYER(id), r) ? 1 : 0.85); };
    roles.map((r, i) => i).sort((a, b) => (roles[a] === 'POR' ? -1 : 0) - (roles[b] === 'POR' ? -1 : 0)).forEach(i => {
      const free = ids.filter(id => !used.has(id)), gks = free.filter(id => playsAs(PLAYER(id), 'POR'));
      const best = (roles[i] === 'POR' && gks.length ? gks : free).sort((a, b) => rr(b, roles[i]) - rr(a, roles[i]))[0];
      out[i] = best; used.add(best);
    });
    return out;
  },
  wcStart(ids) {
    const w = this.data.wc, pool = NATIONS.slice().sort(() => cRnd() - 0.5);
    w.call = ids.slice(); w.squad = this.wcRoles(ids);
    const group = pool.slice(0, 3);
    w.group = { teams: ['JP', ...group], table: Object.fromEntries(['JP', ...group].map(k => [k, { pts: 0, gf: 0, gc: 0 }])) };
    w.rest = pool.slice(3); w.state = 'group'; w.round = 0; w.opp = group[0];
    this.save();
  },
  wcFactor() { return 1.22 * ((CAREER_DIFF[this.data.diff] || CAREER_DIFF.normal).mul); },   // las selecciones son lo más duro de la carrera
  wcRating(key) {
    const t = key === 'JP' ? this.wcTeams().A : rivalTeam(key, this.wcFactor(), 1);
    return Math.round(t.players.reduce((s, p) => s + (p.kick + p.control + p.defense + p.body) / 4, 0) / t.players.length);
  },
  wcTeams() {
    const w = this.data.wc, roles = FORMATIONS[this.data.formation].roles, pos = layout(roles);
    const A = { name: TX('Inazuma Japón'), players: w.squad.map((id, i) => {
      const m = this.m(id), pd = PLAYER(id);
      let techs = (m ? m.known : pd.moves.map(x => x[0]).filter(t => TECH(t))).slice().sort((a, b) => TECH(b).power - TECH(a).power).slice(0, TECH_SLOTS);
      if (roles[i] === 'POR') { const gk = keeperTech(pd, techs); if (gk != null) techs = [gk, ...techs].slice(0, TECH_SLOTS); }
      return Object.assign(buildMatchPlayer(id, roles[i], k => this.wcStat(id, k), techs, [], i, pos[i]),
        { sprite: Object.assign({}, Sprites.refOf(pd), roles[i] === 'POR' ? {} : { kit: { a: '#1a3aa8', b: '#f2f2f2' } }) });
    }) };
    return { A, B: rivalTeam(w.opp, this.wcFactor(), 1) };
  },
  wcSim() { const s = this.simScore(this.wcRating('JP'), this.wcRating(this.data.wc.opp), undefined, undefined, 14); return { gA: s[0], gB: s[1] }; },
  wcResult(gA, gB) {
    const c = this.data, w = c.wc, opp = w.opp; let pens = null, msg = '';
    if (w.state === 'group') {
      const T = w.group.table, add = (k, f, a) => { T[k].gf += f; T[k].gc += a; T[k].pts += f > a ? 3 : f === a ? 1 : 0; };
      add('JP', gA, gB); add(opp, gB, gA);
      const others = w.group.teams.filter(k => k !== 'JP' && k !== opp), s = this.simScore(this.wcRating(others[0]), this.wcRating(others[1]), undefined, undefined, 14);
      add(others[0], s[0], s[1]); add(others[1], s[1], s[0]);
      w.log.push({ r: TX('Grupo'), opp, gA, gB, other: [others[0], others[1], s[0], s[1]] });
      w.round++;
      if (w.round < 3) { w.opp = w.group.teams[w.round + 1]; }
      else {
        const rank = this.wcTable().map(r => r.key);
        if (rank.indexOf('JP') < 2) { w.state = 'semi'; w.opp = w.rest.shift(); msg = TX('¡Pasáis a semifinales!'); }
        else { w.state = 'out'; w.place = 'grupo'; msg = TX('Eliminados en la fase de grupos'); }
      }
    } else {
      if (gA === gB) pens = this.penalties(this.wcRating('JP'), this.wcRating(opp));
      const won = gA > gB || (pens && pens[0] > pens[1]);
      w.log.push({ r: w.state === 'semi' ? TX('Semifinal') : TX('Final'), opp, gA, gB, pens });
      if (w.state === 'semi') {
        if (won) { w.state = 'final'; w.opp = w.rest.includes('Little Gigant') ? 'Little Gigant' : w.rest.shift(); msg = TX('¡A la final!'); }
        else { w.state = 'out'; w.place = 'semi'; msg = TX('Eliminados en semifinales'); }
      } else { w.state = won ? 'champion' : 'out'; w.place = won ? 'campeón' : 'final'; msg = won ? TX('¡Campeones del mundo!') : TX('Subcampeones del mundo'); }
    }
    if (w.state === 'out' || w.state === 'champion') {
      const R = { campeón: [20, 2500, 15], final: [10, 1200, 8], semi: [5, 600, 4], grupo: [0, 200, 1] }[w.place].slice(); R[1] = Math.round(R[1] * this.incomeMul());
      c.fame = Math.min(100, c.fame + R[0]); c.money += R[1]; Profile.data.tickets += R[2]; Profile.save();
      w.reward = { fame: R[0], money: R[1], tickets: R[2] };
      if (w.place === 'campeón') c.titles.push({ season: w.season, name: TX('Mundial con Inazuma Japón') });
    }
    this.save();
    return { gA, gB, pens, msg, opp };
  },
  wcTable() {
    const T = this.data.wc.group.table;
    return Object.entries(T).map(([key, r]) => Object.assign({ key }, r)).sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf);
  },
  wcSet(i, id) { if (FORMATIONS[this.data.formation].roles[i] === 'POR' && !playsAs(PLAYER(id), 'POR')) return false; const w = this.data.wc, at = w.squad.indexOf(id); if (at >= 0) w.squad[at] = w.squad[i]; w.squad[i] = id; this.save(); },
  wcTeam2() { const w = this.data.wc, rest = w.call.filter(id => !w.squad.includes(id)); if (rest.length >= 5) { w.squad = this.wcRoles(rest); this.save(); } },
  wcBest() { const w = this.data.wc; w.squad = this.wcRoles(w.call); this.save(); },
  wcClose() { const c = this.data; (c.wcHistory = c.wcHistory || []).push({ season: c.wc.season, place: c.wc.place }); c.wc = null; this.save(); },
  matchTeams() {
    const c = this.data, nm = this.nextMatch(), roles = FORMATIONS[c.formation].roles, pos = layout(roles), fm = this.formaMul();
    const A = { name: c.school, players: c.lineup.map((id, i) => {
      const m = this.m(id), pd = PLAYER(id);
      let techs = this.equipped(m);
      if (!m.equip && roles[i] === 'POR') { const gk = m.known.find(t => TECH(t).type === 'parada'); if (gk != null && !techs.includes(gk)) techs = [gk, ...techs].slice(0, TECH_SLOTS); }
      return Object.assign(buildMatchPlayer(id, roles[i], k => Math.round(this.stat(m, k) * fm), techs, [], i, pos[i]),
        { sprite: Object.assign({}, Sprites.refOf(pd), roles[i] === 'POR' ? {} : { kit: c.kit }) });
    }) };
    return { A, B: this.clubTeam(nm.rival, Math.min(1, c.season / 3)) };
  },
};

/* =====================================================================
   EVENTO DE HALLOWEEN (22 oct – 3 nov): todo fuera de los modos.
   - Moneda 🍬 caramelos (perfil: Profile.data.hw): +5 por partido en
     cualquier modo (+10 si ganas), +20 de regalo diario, +60 al ganar al
     Ocultismo jefe (una vez al día) y los retos del evento.
   - Sobre Calabaza: 15 🍬 por tirada (150 la de 10); jugadores villanos/de miedo y
     6 legendarios exclusivos (versiones Halloween, nuevos ids 996001…).
     Legendario 3 % · épica 15 % · rara 32 % · común 50 %; legendario
     asegurado a las 40 tiradas sin uno.
   - 3 retos; al completarlos, Ray Dark se puede elegir como mánager en el
     Modo Carrera (+10 % de ingresos).
   - Fuera de fechas no se ve nada (salvo forzarlo en el modo desarrollador).
   Los legendarios se registran siempre: si los consigues, son tuyos para siempre.
   ===================================================================== */
const HW_START = '2026-10-22', HW_END = '2026-11-03';   // ambos incluidos (hora del dispositivo)
const HW_BANNER = 66;
const HW_PRICE = 15, HW_PITY = 40;
const HW_RATES = [['legendaria', 3], ['epica', 15], ['rara', 32], ['comun', 50]];
const HW_BOSS_AVG = 85, HW_BOSS_STAR = 93;   // media del Ocultismo jefe y de su estrella (Tassman)
const HW_DAILY = 20, HW_BOSS = 60, HW_MATCH = 5, HW_WIN = 10;

// Legendarios exclusivos: versión Halloween de jugadores reales (mismo aspecto, stats de legendario)
const HW_LEGENDS = [
  { id: 996001, base: 30037, extra: 'Tiro fantasma' },   // Johan Tassman
  { id: 996002, base: 36 },                              // Nathan Jones
  { id: 996003, base: 32025 },                           // Destra
  { id: 996004, base: 32018 },                           // Hebimos
  { id: 996005, base: 32001 },                           // Bash Lancer
  { id: 996006, base: 21399 },                           // Zohen (DF, añadido el 22 oct)
];
// Épico especial (premio del día 5): Jim (Oscuro) con retrato de evento y la mejor media de los épicos
const HW_EPIC = { id: 996007, base: 21583, mean: 86, face: 6 };
(function registerHalloween() {
  if (typeof GAME === 'undefined') return;
  const reg = (p, list) => { if (PBY[p.id]) return; if (list) GAME.players.push(p); PBY[p.id] = p; };
  const KEYS = ['tiro', 'control', 'defensa', 'rapidez', 'fisico'];
  HW_LEGENDS.forEach((L, i) => {
    const b = PLAYER(L.base); if (!b) return;
    const mean = KEYS.reduce((t, k) => t + b.ie[k], 0) / KEYS.length, f = 93 / mean, ie = {};
    for (const k in b.ie) ie[k] = Math.min(99, Math.round(b.ie[k] * f));
    const moves = (b.moves || []).map(m => m.slice());
    if (L.extra) { const t = Object.values(GAME.techniques).find(x => x.name === L.extra && x.id < 30000); if (t && !moves.some(m => m[0] === t.id)) moves.unshift([t.id, 1]); }
    reg(Object.assign({}, b, { id: L.id, full: b.full + ' (Halloween)', rarity: 'legendaria', ie, ie0: undefined, moves, gacha: false, banner: null, halloween: true, hwFace: i, hwBase: L.base }), true);
  });
  { const b = PLAYER(HW_EPIC.base);
    if (b) {
      const mean = KEYS.reduce((t, k) => t + b.ie[k], 0) / KEYS.length, f = HW_EPIC.mean / mean, ie = {};
      for (const k in b.ie) ie[k] = Math.min(99, Math.round(b.ie[k] * f));
      reg(Object.assign({}, b, { id: HW_EPIC.id, full: b.full.replace(/ \(Oscuro\)$/, '') + ' (Halloween)', rarity: 'epica', ie, ie0: undefined, moves: (b.moves || []).map(m => m.slice()),
        gacha: false, banner: null, halloween: true, hwFace: HW_EPIC.face, hwBase: HW_EPIC.base }), true);
    }
  }
  // Ray Dark: solo como mánager (retrato propio: juego/ui/raydark.png); no entra en las listas de jugadores
  reg({ id: RAY_DARK, name: 'Ray Dark', full: 'Ray Dark', role: 'MED', elem: 'neutro', rarity: 'legendaria', faceImg: 'ui/raydark.png', ie: { tiro: 50, control: 50, defensa: 50, rapidez: 50, fisico: 50, aguante: 50 }, moves: [], gacha: false, halloween: true });
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
    H.candy += n; H.matches++;
    const T = this.dayData(); T.matches++; if (won) T.wins++;
    Profile.save(); return n;
  },
  bossDone() { return this.data().boss === this.today(); },
  bossResult(won) {
    const H = this.data(); let n = 0;
    if (won) { H.bossWins++; this.dayData().boss++; if (H.boss !== this.today()) { H.boss = this.today(); n = HW_BOSS; H.candy += n; } }
    Profile.save(); return n;
  },
  // Rival jefe: el Instituto Ocultismo con media 85 (Johan Tassman, 93 como su legendario), en campo nocturno con niebla
  bossTeam() {
    const mean = pd => ['tiro', 'control', 'defensa', 'rapidez', 'fisico'].reduce((t, k) => t + pd.ie[k], 0) / 5;
    return rivalTeam('Occult', pd => (pd.id === 44 ? HW_BOSS_STAR : HW_BOSS_AVG) / mean(pd), 1);
  },

  /* ---------- Sobre Calabaza ---------- */
  pool() {
    if (this._pool) return this._pool;
    const occ = (TEAM('Occult') || { players: [] }).players.map(p => p.id);
    const ok = p => p.cs && p.gacha !== false && !p.halloween && !p.xmas && (p.banner === 3 || occ.includes(p.id));
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
    H.pulls += n; this.dayData().pulls += n; H.legends = HW_LEGENDS.filter(L => P.coll[L.id]).length;
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
  /* ---------- Retos diarios: se renuevan cada medianoche (hora del dispositivo) ---------- */
  DAILY: [
    { id: 'd_play', name: TX('Noche de partidos'), desc: TX('Juega 3 partidos hoy'), goal: 3, val: T => T.matches, reward: { candy: 25, tickets: 1 } },
    { id: 'd_win', name: TX('Victoria de ultratumba'), desc: TX('Gana 2 partidos hoy'), goal: 2, val: T => T.wins, reward: { candy: 35, tickets: 2 } },
    { id: 'd_pull', name: TX('Caramelo o susto'), desc: TX('Haz 3 tiradas del Sobre Calabaza hoy'), goal: 3, val: T => T.pulls, reward: { candy: 20, tickets: 3 } },
    { id: 'd_boss', name: TX('Exorcista del día'), desc: TX('Gana hoy al Ocultismo jefe'), goal: 1, val: T => T.boss, reward: { candy: 20, tickets: 2 } },
  ],
  dayData() {
    const H = this.data(), t = this.today();
    if (!H.day || H.day.date !== t) H.day = { date: t, matches: 0, wins: 0, pulls: 0, boss: 0, got: {} };
    return H.day;
  },
  dailyState(R) { const T = this.dayData(); return T.got[R.id] ? 'got' : R.val(T) >= R.goal ? 'ready' : 'locked'; },
  claimDaily(id) {
    const R = this.DAILY.find(x => x.id === id); if (!R || !this.active() || this.dailyState(R) !== 'ready') return null;
    const T = this.dayData(); T.got[id] = Date.now(); this.data().candy += R.reward.candy || 0; Profile.data.tickets += R.reward.tickets || 0;
    Profile.save(); return R.reward;
  },
  pending() { return this.active() ? this.RETOS.filter(R => this.retoState(R) === 'ready').length + this.DAILY.filter(R => this.dailyState(R) === 'ready').length : 0; },
  rayUnlocked() { return !!(Profile.data.hw && Profile.data.hw.ray); },

  /* ---------- Premios por entrar: 5 días (no hace falta que sean seguidos), además del regalo diario ---------- */
  LOGIN: [
    { candy: 150, label: TX('150 caramelos'), icon: '🍬' },
    { tickets: 10, label: TX('10 tickets'), icon: '🎟️' },
    { coins: 1000, label: TX('1000 monedas'), icon: '🪙' },
    { pick: true, label: TX('Elige 1 de 3 jugadores de +80'), icon: '⭐' },
    { player: HW_EPIC.id, label: TX('Jim de Halloween (épico especial) de regalo'), icon: '🎁' },
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
    H.candy += R.candy || 0; P.tickets += R.tickets || 0; P.coins += R.coins || 0;
    L.n++; L.last = this.today();
    Profile.save();
    return out;
  },
};

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
// Bianchi Christmas: delantero legendario de media 105 (por encima del tope normal de 99), con gorro de Papá Noel en el retrato (sprites/fxm.png, tools/xm_faces.py).
// Solo se consigue con el código BIANCHINAVIDAD (GIFT_CODES en run.js).
const XM_BIANCHI = { id: 997008, base: 31855, face: 0, ie: { tiro: 110, control: 103, defensa: 98, rapidez: 108, fisico: 106, aguante: 105 } };
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
  { const b = PLAYER(XM_BIANCHI.base);
    if (b) reg(Object.assign({}, b, { id: XM_BIANCHI.id, name: 'Bianchi Christmas', full: 'Bianchi Christmas', nick: undefined, rarity: 'legendaria', ie: Object.assign({}, XM_BIANCHI.ie), ie0: undefined,
      moves: (b.moves || []).map(m => m.slice()), gacha: false, banner: null, inf: false, xmas: true, xmBase: XM_BIANCHI.base, xmFace: XM_BIANCHI.face }), true);
  }
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

/* =====================================================================
   JUGADORES DE INAZUMA ELEVEN GO: Arion Sherwind, Victor Blade, Riccardo Di Rigo y Bai Long.
   - Ya NO se consiguen con códigos: salen en el Gacha limitado de Bai Long (src/limited.js).
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
    ie: { tiro: 104, control: 98, defensa: 96, rapidez: 102, fisico: 100, aguante: 100 } },   // media 100; su rareza «limitada» y sus técnicas se ponen en limited.js
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

/* =====================================================================
   CONFIGURACIÓN DE LAS CUENTAS (Firebase)
   Pega aquí los datos de tu app web de Firebase:
   Consola de Firebase → ⚙️ Configuración del proyecto → General →
   «Tus apps» → la app web → «firebaseConfig».
   Estos datos son públicos a propósito (van en cualquier web que use
   Firebase): lo que protege las partidas son las reglas de firestore.rules.
   Si los dejas vacíos, el juego funciona igual, pero sin cuentas.
   ===================================================================== */
const CLOUD_CONFIG = {
  apiKey: 'AIzaSyA5QG6MPoYlLcot1wb72DM5UpGnoSoT8P4',
  authDomain: 'inazuma-gold-834e5.firebaseapp.com',
  projectId: 'inazuma-gold-834e5',
  appId: '1:484099983178:web:3ecaad2ba62e500563e3b3',
};

/* =====================================================================
   NUBE: cuentas (Google o usuario y contraseña) y guardado de la partida.
   Usa Firebase: Authentication para las cuentas y Firestore para guardar
   (un documento por jugador en «saves/{uid}»). La librería de Firebase
   solo se descarga si src/cloud-config.js está rellenado.
   La partida es la misma de siempre (las claves de localStorage de
   SAVE_KEYS); aquí solo se sube y se baja entera.

   Cómo decide qué partida manda (rev = número de versión en la nube):
   - Nube sin cambios desde la última vez y móvil con cambios → se sube.
   - Nube con cambios y móvil sin cambios → se baja.
   - Las dos con cambios (o partida de invitado contra una cuenta que
     ya tiene partida) → se pregunta al jugador. Nunca se borra nada
     sin preguntar.
   ===================================================================== */
const SAVE_KEYS = ['inazuma-perfil', 'inazuma-carrera', 'inazuma-ajustes', 'inazuma-run3', 'inazuma-sonido', 'inazuma-jugador'];
// Progreso de verdad (lo que se compara para decidir si hay dos partidas distintas); ajustes y sonido son de cada dispositivo
const PROGRESS_KEYS = ['inazuma-perfil', 'inazuma-carrera', 'inazuma-run3', 'inazuma-jugador'];
const DEVICE_KEYS = ['inazuma-ajustes', 'inazuma-sonido'];

const Cloud = (() => {
  const META_KEY = 'inazuma-cuenta';
  const EMAIL_DOMAIN = 'jugadores.inazumarogue.app';   // el usuario «fran» se guarda como fran@jugadores… (no se envía ningún correo)
  const FB_VERSION = '10.12.2';
  const CFG = (typeof CLOUD_CONFIG !== 'undefined' && CLOUD_CONFIG) || {};
  // Cada subida gasta cuota de Firebase (plan gratis: ~20.000 escrituras al día para todos los jugadores).
  // Antes se subía 3 s después de cada cambio; ahora como mucho una vez cada 5 minutos mientras juegas, al acabar cada partido y al salir de la app.
  const PUSH_DELAY = (typeof CLOUD_PUSH_DELAY !== 'undefined' && CLOUD_PUSH_DELAY) || 300000;   // como mucho una subida cada 5 min (y siempre al acabar un partido y al salir)
  const TIMEOUT = 15000;
  const MAX_RAW = 20000;        // por encima (casi siempre), la partida se guarda comprimida: ocupa y descarga ~8 veces menos de la cuota de Firebase
  const RETRY = (typeof CLOUD_RETRY !== 'undefined' && CLOUD_RETRY) || [20000, 45000, 90000, 180000, 300000];   // reintentos tras un error (cada vez más espaciados)
  const RETRY_QUOTA = (typeof CLOUD_RETRY_QUOTA !== 'undefined' && CLOUD_RETRY_QUOTA) || [600000, 1800000, 3600000];   // cuota de Firebase agotada: esperar mucho más

  /* ---------- Datos de la cuenta en este dispositivo ---------- */
  const origSet = Storage.prototype.setItem, origRemove = Storage.prototype.removeItem;
  let meta = {};
  try { meta = JSON.parse(localStorage.getItem(META_KEY) || '{}') || {}; } catch (_) { meta = {}; }
  const saveMeta = () => { try { origSet.call(localStorage, META_KEY, JSON.stringify(meta)); } catch (_) {} };

  /* ---------- Partida local ---------- */
  let applying = false, frozen = false;   // frozen: se va a recargar con la partida bajada; no dejar que nada la pise
  function snapshot() { const o = {}; SAVE_KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v != null) o[k] = v; } catch (_) {} }); return o; }
  function restore(o, freeze) {
    if (freeze) frozen = true;
    applying = true;
    try { SAVE_KEYS.forEach(k => { try { if (o && o[k] != null) origSet.call(localStorage, k, o[k]); else origRemove.call(localStorage, k); } catch (_) {} }); }
    finally { applying = false; }
  }
  function hash(o, keys = SAVE_KEYS) {   // huella corta de la partida para saber si ha cambiado
    const s = keys.map(k => k + '=' + (o && o[k] != null ? o[k] : '')).join('\\u0001');
    let h1 = 0x811c9dc5, h2 = 0x1000193;
    for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822519); }
    return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36) + ':' + s.length;
  }
  const hashP = o => hash(o, PROGRESS_KEYS);   // solo el progreso
  // ¿Hay progreso de verdad? (ya hizo la tirada de bienvenida o tiene Carrera o Carrera Jugador)
  function hasProgress(o) {
    try { const p = JSON.parse((o || {})['inazuma-perfil'] || 'null'); if (p && (p.firstDone || Object.keys(p.coll || {}).length)) return true; } catch (_) {}
    return !!(o && (o['inazuma-carrera'] || o['inazuma-jugador']));
  }
  function describe(o) {
    try {
      const p = JSON.parse(o['inazuma-perfil'] || '{}'), cr = o['inazuma-carrera'] ? JSON.parse(o['inazuma-carrera']) : null;
      const pc = o['inazuma-jugador'] ? JSON.parse(o['inazuma-jugador']) : null;
      const st = p.story || {}, etapas = ['s1', 's2', 's3', 's4'].filter(k => st[k] && st[k].done).length;
      const pcName = pc && pc.me ? ((typeof PLAYER === 'function' && PLAYER(pc.me.id)) || pc.me.pd || {}).name : '';
      return { players: Object.keys(p.coll || {}).length, tickets: p.tickets || 0, coins: p.coins || 0, wins: p.wins || 0, etapas,
        career: cr ? (cr.school || TX('Carrera')) + TX(' · temporada ') + (cr.season || 1) : '',
        pcareer: pc && pc.me ? `${pcName || '?'} · ${pc.school || ''} · ${TX('Temporada')} ${pc.season || 1} · ${TX('Nivel')} ${pc.me.lv || 1}` : '' };
    } catch (_) { return { players: 0, tickets: 0, coins: 0, wins: 0, etapas: 0, career: '', pcareer: '' }; }
  }

  /* ---------- Avisos de cambios: cualquier guardado del juego programa una subida ---------- */
  Storage.prototype.setItem = function (k, v) {
    if (frozen && this === localStorage && SAVE_KEYS.includes(k)) return;   // a punto de recargar con la partida de la nube
    origSet.call(this, k, v); if (!applying && this === localStorage && SAVE_KEYS.includes(k)) touch();
  };
  Storage.prototype.removeItem = function (k) {
    if (frozen && this === localStorage && SAVE_KEYS.includes(k)) return;
    origRemove.call(this, k); if (!applying && this === localStorage && SAVE_KEYS.includes(k)) touch();
  };

  /* ---------- Estado visible para la interfaz ---------- */
  const state = { status: 'idle', msg: '', lastOk: meta.lastOk || 0, conflict: null };
  const listeners = new Set();
  function setStatus(status, msg) { state.status = status; state.msg = msg || ''; listeners.forEach(f => { try { f(state); } catch (_) {} }); }
  const EXPIRED_MSG = TX('Tu sesión se ha cerrado. Vuelve a entrar para seguir guardando en la nube.');

  /* ---------- Firebase (se carga solo si hace falta) ---------- */
  const enabled = () => !!(CFG.apiKey && CFG.projectId);
  const loggedIn = () => !!meta.uid;
  const user = () => meta.user || null;
  let app = null, auth = null, db = null, readyP = null, signingOut = false;
  function loadScript(src) {
    return new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.async = false; s.onload = ok; s.onerror = () => ko(new Error('no carga ' + src)); document.head.appendChild(s); });
  }
  function ready() {
    if (!enabled()) return Promise.resolve(false);
    if (!readyP) readyP = (async () => {
      if (typeof firebase === 'undefined') {
        const B = 'https://www.gstatic.com/firebasejs/' + FB_VERSION + '/';
        await loadScript(B + 'firebase-app-compat.js');
        await Promise.all([loadScript(B + 'firebase-auth-compat.js'), loadScript(B + 'firebase-firestore-compat.js')]);
      }
      app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(CFG);
      auth = app.auth(); db = app.firestore();
      // Vuelta de un inicio con Google por redirección (cuando el navegador no deja abrir ventanas)
      if (meta.redirect) {
        try { const r = await auth.getRedirectResult(); if (r && r.user) startSession(r.user, nameOf(r.user), 'google'); } catch (_) {}
        meta.redirect = false; saveMeta();
      }
      await new Promise(res => { const off = auth.onAuthStateChanged(() => { off(); res(); }); });
      watchAuth();
      return true;
    })().catch(() => { readyP = null; return false; });
    return readyP;
  }
  // Si Firebase cierra la sesión por su cuenta (cuenta borrada, contraseña cambiada…), se avisa
  function watchAuth() {
    const check = u => {
      if (!meta.uid || signingOut) return;
      if (!u || u.uid !== meta.uid) { if (!meta.expired) { meta.expired = true; saveMeta(); setStatus('expired', EXPIRED_MSG); } }
      else if (meta.expired) { meta.expired = false; saveMeta(); }
    };
    auth.onAuthStateChanged(check); check(auth.currentUser);
  }
  const withTimeout = p => Promise.race([p, new Promise((_, ko) => setTimeout(() => ko({ code: 'timeout' }), TIMEOUT))]);
  const ref = () => db.collection('saves').doc(meta.uid);
  function errOf(e) {
    const c = String((e && e.code) || '');
    if (c === 'timeout' || c === 'unavailable' || c.includes('network') || c === 'deadline-exceeded') return { offline: true, code: c };
    if (c === 'resource-exhausted') return { quota: true, code: c };   // cuota del día de Firebase agotada (no es culpa del jugador)
    if (c === 'permission-denied' || c === 'unauthenticated') { if (!auth || !auth.currentUser) return { expired: true, code: c }; }
    return { code: c || 'desconocido' };
  }

  /* ---------- Cuentas ---------- */
  const cleanUser = u => String(u || '').trim().toLowerCase();
  function checkUser(u) {
    if (u.length < 3 || u.length > 16) return TX('El nombre de usuario debe tener entre 3 y 16 letras o números.');
    if (!/^[a-z0-9_]+$/.test(u)) return TX('Usa solo letras sin tildes, números y guion bajo (_). Sin espacios ni ñ.');
    return '';
  }
  const emailOf = u => u + '@' + EMAIL_DOMAIN;
  const nameOf = u => String(u.displayName || (u.email || '').split('@')[0] || 'jugador').slice(0, 24);
  function authError(e, signup) {
    const c = String((e && e.code) || '');
    if (c === 'auth/email-already-in-use') return TX('Ese nombre de usuario ya está cogido. Prueba con otro.');
    if (c === 'auth/invalid-credential' || c === 'auth/wrong-password' || c === 'auth/user-not-found' || c === 'auth/invalid-login-credentials') return TX('Usuario o contraseña incorrectos.');
    if (c === 'auth/weak-password') return TX('La contraseña es demasiado corta (mínimo 6 caracteres).');
    if (c === 'auth/too-many-requests') return TX('Demasiados intentos seguidos. Espera un poco y vuelve a probar.');
    if (c === 'auth/network-request-failed') return TX('No hay conexión. Prueba otra vez cuando tengas internet.');
    if (c === 'auth/user-disabled') return TX('Esta cuenta está desactivada.');
    if (c === 'auth/unauthorized-domain') return TX('Esta web no está autorizada en Firebase (Authentication → Configuración → Dominios autorizados).');
    if (c === 'auth/operation-not-allowed') return TX('Esta forma de entrar no está activada en Firebase (Authentication → Método de inicio de sesión).');
    if (c === 'auth/account-exists-with-different-credential') return TX('Ya hay una cuenta con ese correo de otra forma.');
    return (signup ? TX('No se ha podido crear la cuenta') : TX('No se ha podido entrar')) + (c ? ' (' + c.replace('auth/', '') + ').' : '.');
  }
  const offlineMsg = TX('No se puede conectar con el servidor de cuentas. Comprueba tu internet.');
  async function signUp(username, password) {
    if (!enabled()) return { ok: false, msg: TX('Las cuentas aún no están activadas en esta versión del juego.') };
    const u = cleanUser(username), bad = checkUser(u); if (bad) return { ok: false, msg: bad };
    if (String(password || '').length < 6) return { ok: false, msg: TX('La contraseña debe tener al menos 6 caracteres.') };
    if (!await ready()) return { ok: false, msg: offlineMsg };
    try {
      const c = await auth.createUserWithEmailAndPassword(emailOf(u), password);
      try { await c.user.updateProfile({ displayName: u }); } catch (_) {}
      return startSession(c.user, u, 'password');
    } catch (e) { return { ok: false, msg: authError(e, true) }; }
  }
  async function signIn(username, password) {
    if (!enabled()) return { ok: false, msg: TX('Las cuentas aún no están activadas en esta versión del juego.') };
    const u = cleanUser(username); if (!u || !password) return { ok: false, msg: TX('Escribe tu usuario y tu contraseña.') };
    if (!await ready()) return { ok: false, msg: offlineMsg };
    try { const c = await auth.signInWithEmailAndPassword(emailOf(u), password); return startSession(c.user, u, 'password'); }
    catch (e) { return { ok: false, msg: authError(e, false) }; }
  }
  async function signInGoogle() {
    if (!enabled()) return { ok: false, msg: TX('Las cuentas aún no están activadas en esta versión del juego.') };
    if (!await ready()) return { ok: false, msg: offlineMsg };
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try { const r = await auth.signInWithPopup(provider); return startSession(r.user, nameOf(r.user), 'google'); }
    catch (e) {
      const c = String((e && e.code) || '');
      if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request' || c === 'auth/user-cancelled') return { ok: false, msg: '' };
      if (c === 'auth/popup-blocked' || c === 'auth/operation-not-supported-in-this-environment' || c === 'auth/web-storage-unsupported') {
        meta.redirect = true; saveMeta();
        try { await auth.signInWithRedirect(provider); return { ok: false, redirect: true, msg: TX('Abriendo Google…') }; }
        catch (e2) { meta.redirect = false; saveMeta(); return { ok: false, msg: authError(e2, false) }; }
      }
      return { ok: false, msg: authError(e, false) };
    }
  }
  function startSession(fbUser, name, via) {
    if (meta.uid !== fbUser.uid) { meta.owner = null; meta.rev = null; meta.hash = null; }   // otra cuenta: lo que haya en el móvil aún no es suyo
    meta.uid = fbUser.uid; meta.user = name; meta.via = via; meta.expired = false; saveMeta();
    return { ok: true };
  }
  // Cerrar sesión: sube lo último y deja el móvil limpio para que otro pueda entrar.
  async function signOut({ keepLocal = false, force = false } = {}) {
    if (loggedIn() && !meta.expired && !force) {
      const r = await push(true);
      if (r !== 'uploaded' && r !== 'same') return { ok: false, msg: r === 'conflict' ? TX('Hay otra versión de tu partida en la nube. Resuélvelo antes de salir.') : TX('No se ha podido subir tu última partida (¿sin conexión?).') };
    }
    signingOut = true;
    try { if (await ready()) await auth.signOut(); } catch (_) {}
    signingOut = false;
    const guest = meta.guest; meta = { guest }; saveMeta();
    if (!keepLocal) { applying = true; try { PROGRESS_KEYS.forEach(k => { try { origRemove.call(localStorage, k); } catch (_) {} }); } finally { applying = false; } }   // todo el progreso (también la Carrera Jugador)
    clearTimeout(timer); timer = 0; clearTimeout(retryT); retryT = 0; tries = 0;
    state.lastOk = 0; state.conflict = null; setStatus('idle');
    return { ok: true };
  }

  /* ---------- Empaquetar la partida para Firestore ---------- */
  async function gz(str) {
    const cs = new CompressionStream('gzip'), buf = new Uint8Array(await new Response(new Blob([str]).stream().pipeThrough(cs)).arrayBuffer());
    let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return btoa(s);
  }
  async function ungz(b64) {
    const bin = atob(b64), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  }
  async function packData(data) {
    const json = JSON.stringify(data);
    if (json.length < MAX_RAW || typeof CompressionStream === 'undefined') return { data, z: null };
    return { data: null, z: await gz(json) };
  }
  async function rowOf(d) {
    const x = d.data() || {};
    let data = x.data || {};
    if (x.z) { try { data = JSON.parse(await ungz(x.z)); } catch (_) { data = {}; } }
    const t = x.updatedAt && x.updatedAt.toDate ? x.updatedAt.toDate() : null;
    return { rev: x.rev || 0, data, updated_at: t ? t.toISOString() : null };
  }

  /* ---------- Subir y bajar ---------- */
  async function fetchCloud() {
    if (!await ready()) return { error: { offline: true } };
    if (!auth.currentUser || auth.currentUser.uid !== meta.uid) return { error: { expired: true } };
    try { const d = await withTimeout(ref().get({ source: 'server' })); return { row: d.exists ? await rowOf(d) : null }; }
    catch (e) { return { error: errOf(e) }; }
  }
  function synced(rev, data) { meta.owner = meta.uid; meta.rev = rev; meta.hash = hash(data); meta.phash = hashP(data); meta.lastOk = state.lastOk = Date.now(); tries = 0; saveMeta(); }
  // Reintento automático tras un error o sin conexión (antes solo se reintentaba al volver a guardar algo)
  let retryT = 0, tries = 0;
  function retryLater(quota) {
    if (retryT || !loggedIn() || meta.expired) return;
    const L = quota ? RETRY_QUOTA : RETRY, d = L[Math.min(tries, L.length - 1)]; tries++;
    retryT = setTimeout(() => { retryT = 0; if (!state.conflict && !syncing) push(true); }, d);
  }
  function failStatus(r) {
    if (r && r.expired) { meta.expired = true; saveMeta(); setStatus('expired', EXPIRED_MSG); return; }
    if (r && r.offline) setStatus('offline', TX('Sin conexión: se guardará en la nube cuando vuelva internet.'));
    else if (r && r.quota) setStatus('error', TX('La nube está saturada ahora mismo. Tu partida está a salvo en este dispositivo y se subirá más tarde.'));
    else setStatus('error', TX('Error al guardar en la nube (') + ((r && r.code) || '?') + TX('). Se reintentará.'));
    retryLater(r && r.quota);
  }
  // Sube la partida del móvil. «overRev» = pisar a propósito esa versión de la nube (cuando el jugador elige la del móvil).
  let pushing = null, again = false, syncing = false;
  async function push(now, overRev) {
    if (!enabled() || !loggedIn() || meta.expired || frozen) return 'off';
    if (state.conflict && overRev == null) return 'conflict';
    if (syncing && overRev == null) { schedule(); return 'queued'; }   // primero se termina de comparar con la nube
    if (pushing) { again = true; await pushing; if (!now) return 'queued'; }
    const run = (async () => {
      const data = snapshot(), h = hash(data);
      if (meta.owner === meta.uid && h === meta.hash && overRev == null) { setStatus('ok'); return 'same'; }
      // Solo han cambiado ajustes o sonido (son de cada dispositivo): no se gasta una subida
      if (meta.owner === meta.uid && meta.phash && hashP(data) === meta.phash && overRev == null) { meta.hash = h; saveMeta(); setStatus('ok'); return 'same'; }
      if (!hasProgress(data) && meta.owner !== meta.uid && overRev == null) return 'same';   // no subir una partida vacía a una cuenta nueva
      if (!await ready()) { failStatus({ offline: true }); return 'error'; }
      if (!auth.currentUser || auth.currentUser.uid !== meta.uid) { failStatus({ expired: true }); return 'error'; }
      setStatus('saving');
      const base = overRev != null ? overRev : meta.owner === meta.uid ? (meta.rev || 0) : 0;
      const packed = await packData(data);
      let res;
      try {
        res = await withTimeout(db.runTransaction(async tx => {
          const d = await tx.get(ref()), cur = d.exists ? (d.data().rev || 0) : 0;
          if (cur !== base) return { conflict: true };
          tx.set(ref(), { username: meta.user || '', rev: base + 1, data: packed.data, z: packed.z, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
          return { rev: base + 1 };
        }));
      } catch (e) { failStatus(errOf(e)); return 'error'; }
      if (res.conflict) { const c = await fetchCloud(); if (c.row) return conflict(c.row); failStatus(c.error); return 'error'; }
      synced(res.rev, data); setStatus('ok');
      return 'uploaded';
    })();
    pushing = run;
    let r; try { r = await run; } finally { pushing = null; }
    if (again) { again = false; if (r === 'uploaded' || r === 'same') schedule(); }
    return r;
  }
  let timer = 0;
  // Si ya hay una subida programada, no se retrasa (antes cada guardado la empujaba otra vez): así sube cada minuto aunque no pares de jugar
  function schedule() { if (timer) return; timer = setTimeout(() => { timer = 0; push(); }, PUSH_DELAY); }
  function touch() { if (enabled() && loggedIn() && !meta.expired) schedule(); }
  function conflict(row) {
    const local = snapshot();
    state.conflict = { cloud: row, local, cloudInfo: describe(row.data || {}), localInfo: describe(local), cloudDate: row.updated_at };
    setStatus('conflict', TX('Hay dos versiones distintas de tu partida.'));
    return 'conflict';
  }
  // Al arrancar o al iniciar sesión: decide si subir, bajar o preguntar.
  // Devuelve 'off' | 'offline' | 'expired' | 'error' | 'same' | 'uploaded' | 'downloaded' | 'conflict'
  async function sync() {
    syncing = true;
    try { return await syncNow(); } finally { syncing = false; }
  }
  async function syncNow() {
    if (!enabled()) return 'off';
    if (!await ready()) { if (loggedIn()) setStatus('offline', TX('Sin conexión: se guardará en la nube cuando vuelva internet.')); return loggedIn() ? 'offline' : 'off'; }
    if (!loggedIn()) return 'off';
    if (meta.expired) { setStatus('expired', EXPIRED_MSG); return 'expired'; }
    setStatus('saving');
    const c = await fetchCloud();
    if (c.error) { failStatus(c.error); return c.error.expired ? 'expired' : c.error.offline ? 'offline' : 'error'; }
    const local = snapshot(), mine = meta.owner === meta.uid;
    const localChanged = !mine || hash(local) !== meta.hash;
    // ¿Ha cambiado el progreso del móvil? (cambiar solo ajustes o sonido no cuenta como «otra partida»)
    const localProgChanged = !mine || (meta.phash ? hashP(local) !== meta.phash : localChanged);
    if (!c.row) {   // cuenta sin partida en la nube: se sube la del móvil (si hay algo)
      if (!hasProgress(local)) { meta.owner = meta.uid; meta.rev = 0; meta.hash = hash(local); meta.phash = hashP(local); saveMeta(); setStatus('ok'); return 'same'; }
      syncing = false; return push(true, 0);
    }
    const cloudChanged = !mine || c.row.rev !== meta.rev;
    if (!cloudChanged) { if (localChanged) { syncing = false; return push(true); } synced(c.row.rev, local); setStatus('ok'); return 'same'; }
    const cloudData = c.row.data || {};
    if (!localProgChanged || !hasProgress(local) || hashP(local) === hashP(cloudData)) {
      // Mientras se comparaba, ¿se ha jugado en este móvil? Entonces no se pisa nada: se pregunta
      if (hash(snapshot()) !== hash(local)) return conflict(c.row);
      useCloud(c.row, local); return 'downloaded';
    }
    return conflict(c.row);
  }
  // Baja la partida de la nube; ajustes y sonido de este dispositivo se conservan
  function useCloud(row, keepFrom) {
    const data = Object.assign({}, row.data || {});
    if (keepFrom) DEVICE_KEYS.forEach(k => { if (keepFrom[k] != null) data[k] = keepFrom[k]; });
    restore(data, true); synced(row.rev, row.data || {}); state.conflict = null; setStatus('ok');
  }
  // El jugador resuelve el conflicto: 'cloud' (baja la de la nube) o 'local' (sube la del móvil encima)
  async function resolve(choice) {
    const C = state.conflict; if (!C) return 'same';
    if (choice === 'cloud') { useCloud(C.cloud, snapshot()); return 'downloaded'; }
    state.conflict = null;
    return push(true, C.cloud.rev);
  }

  // Al salir del juego, cambiar de app o acabar un partido: subir ya lo pendiente
  const flush = () => { if (timer) { clearTimeout(timer); timer = 0; push(true); } };
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('pagehide', flush);
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('online', () => { if (loggedIn() && (state.status === 'offline' || state.status === 'error')) { clearTimeout(retryT); retryT = 0; push(true); } });

  // Partida de invitado: recuerda que ya eligió no crear cuenta (para no insistir)
  const guestChosen = () => !!meta.guest;
  function chooseGuest() { meta.guest = true; saveMeta(); }

  return { SAVE_KEYS, enabled, ready, loggedIn, user, via: () => meta.via || '', expired: () => !!meta.expired, pendingRedirect: () => !!meta.redirect,
    state, onChange: f => (listeners.add(f), () => listeners.delete(f)),
    signUp, signIn, signInGoogle, signOut, sync, push, flush, resolve, snapshot, restore, describe, hasProgress, guestChosen, chooseGuest, checkUser, cleanUser, PROGRESS_KEYS,
    _meta: () => meta };
})();

/* =====================================================================
   DIÁLOGOS: frases que dicen los jugadores (antes del partido y durante él).
   Son frases originales con el espíritu de la serie. Se pasan por TX(), así que
   las traducciones están en src/en.js.
   ===================================================================== */
const Dialog = (() => {
  const L = {
 "taunt_fuego": [
  "¿Crees que puedes apagar mi fuego? ¡Inténtalo!",
  "Hoy mi balón arde. ¡Aguanta si puedes!",
  "¡Vas a quemarte antes del descanso!"
 ],
 "taunt_viento": [
  "Seré más rápido que tu mirada. ¡Parpadea y pierdes!",
  "El viento sopla a mi favor hoy.",
  "¡No podrás ni tocar el balón!"
 ],
 "taunt_bosque": [
  "Mis raíces son profundas. ¡No me moverás!",
  "Este campo es mi bosque. ¡Perderás en casa ajena!",
  "Paciencia… el balón acabará en mis manos."
 ],
 "taunt_montaña": [
  "Soy una muralla. ¡Pasa si te atreves!",
  "Nadie ha movido esta montaña. ¿Serás tú el primero?",
  "Prepárate: mis tiros pesan como piedras."
 ],
 "taunt_neutro": [
  "¿Así que tú eres mi rival? ¡Será divertido!",
  "A ver si puedes ganarme.",
  "No me subestimes. ¡Voy a por todas!",
  "Hoy no pienso perder. ¡Prepárate!",
  "Dame un buen partido, si eres capaz."
 ],
 "reply": [
  "¡Eso quería oír! Vamos a jugar.",
  "Hablar es fácil. ¡Demuéstralo en el campo!",
  "Mi equipo no se rinde jamás.",
  "Acepto el reto. ¡Que gane el mejor!",
  "Ya veremos quién se ríe al final.",
  "No me asustas. ¡Empecemos!",
  "¡Nos vemos en el campo!"
 ],
 "shout_fuego": [
  "¡Siente mi fuego!",
  "¡Arde, balón, arde!",
  "¡Todo mi calor en este tiro!"
 ],
 "shout_viento": [
  "¡Más rápido que el viento!",
  "¡Ni lo verás pasar!",
  "¡Corre, balón, corre!"
 ],
 "shout_bosque": [
  "¡La fuerza del bosque!",
  "¡Crece, mi técnica!",
  "¡Raíces, sostenedme!"
 ],
 "shout_montaña": [
  "¡Firme como una roca!",
  "¡Esto pesa mucho!",
  "¡Que tiemble el suelo!"
 ],
 "shout_neutro": [
  "¡Allá va mi técnica!",
  "¡Con todas mis fuerzas!",
  "¡Esta es la buena!"
 ],
 "kind_parada": [
  "¡Por aquí no pasa nadie!",
  "¡Mi portería es sagrada!",
  "¡Lo paro, lo paro!"
 ],
 "kind_bloqueo": [
  "¡No pasarás!",
  "¡Aquí me quedo yo!"
 ],
 "goal": [
  "¡GOOOL! ¡Lo hemos conseguido!",
  "¡Así se hace, equipo!",
  "¡Uno más para nosotros!",
  "¡Esto es solo el principio!"
 ],
 "goalRival": [
  "¿Eso es todo lo que tenéis?",
  "¡Os lo dije!",
  "¡Demasiado fácil!",
  "¡Uno menos para vosotros!"
 ],
 "save": [
  "¡Aquí no pasa nada!",
  "¡Tranquilos, lo tengo!",
  "¡Está parado!"
 ],
 "saveRival": [
  "¡Tu tiro no me asusta!",
  "¡Casi, pero no!",
  "¡Mejor suerte la próxima!"
 ]
};
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const key = e => (L['taunt_' + e] ? e : 'neutro');
  return {
    taunt: e => TX(pick(L['taunt_' + key(e)].concat(L.taunt_neutro))),   // el rival antes del partido
    reply: () => TX(pick(L.reply)),                                        // tu mejor jugador le contesta
    shout: (e, kind) => TX(pick(L['kind_' + kind] || L['shout_' + key(e)].concat(L.shout_neutro))),   // al lanzar una técnica
    goal: () => TX(pick(L.goal)), goalRival: () => TX(pick(L.goalRival)),
    save: () => TX(pick(L.save)), saveRival: () => TX(pick(L.saveRival)),
  };
})();

/* =====================================================================
   CONTROLES: en PC (ratón y teclado) se quitan el joystick y los botones
   de la pantalla; en móvil y tablet se muestran. Se puede forzar en Ajustes.
   ===================================================================== */
const Controls = (() => {
  const mm = q => { try { return matchMedia(q).matches; } catch (_) { return false; } };
  let sawTouch = mm('(pointer: coarse)') || (navigator.maxTouchPoints > 0 && !mm('(pointer: fine)'));
  const pref = () => { try { return App.settings.controls || 'auto'; } catch (_) { return 'auto'; } };   // App aún no existe al cargar
  const isTouch = () => { const c = pref(); return c === 'tactil' ? true : c === 'teclado' ? false : sawTouch; };
  function apply() {
    document.documentElement.classList.toggle('pc', !isTouch());
    let k = 1; try { k = App.settings.padSize === 'grande' ? 1.15 : App.settings.padSize === 'pequeno' ? 0.88 : 1; } catch (_) {}
    document.documentElement.style.setProperty('--padk', k);
  }
  addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !sawTouch) { sawTouch = true; apply(); } }, { capture: true });
  apply();
  return { apply, isTouch, pc: () => !isTouch() };
})();

// Textos fijos del HTML (data-tx en shell.html), para la traducción: TX('Saltar ▶▶') TX('Tú') TX('Rival') TX('Pausa') TX('Espacio') TX('Técnica')

/* ---------- Sin zoom en el navegador ----------
   El iPhone ignora «user-scalable=no», así que se bloquean a mano: pellizco
   y, en ordenador, Ctrl + rueda o Ctrl + / Ctrl -. */
(() => {
  const no = e => { e.preventDefault(); };
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, no, { passive: false }));
  document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
  // El doble toque ya lo quita «touch-action: manipulation» (CSS), sin comerse toques rápidos en los botones
  document.addEventListener('dblclick', no, { passive: false });
  addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) e.preventDefault(); });
})();

/* =====================================================================
   ENTRADA: teclado + joystick táctil + botones.
   ===================================================================== */
const Input = (() => {
  const keys = new Set(), pressed = new Set();
  const joy = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
  let shootTouch = null;
  // Joystick (móvil): más grande que antes (36 px) para poder apuntar fino; zona muerta para que el dedo quieto no mueva al jugador;
  // el esprint solo al llevar el dedo MÁS ALLÁ del aro (antes cualquier empujón a tope esprintaba y el jugador se cansaba sin querer);
  // y si el dedo se aleja mucho, el joystick lo sigue (así girar en seco responde al momento).
  const R = 44, DEAD = 0.16, SPRINT_AT = 1.3, FOLLOW = 1.9;
  const shell = document.getElementById('shell'), touch = document.getElementById('touch');
  const stick = document.getElementById('stick'), knob = document.getElementById('knob');
  // Teclas (Ajustes → «Teclas del ordenador»): «nuevas» = J pase · K tiro/cambiar · L saque largo (portero) · E técnica;
  // «clásicas» = como hasta la 0.31.1: J pase · K saque largo (portero) · L tiro · Q cambiar · U técnica. (El pase al hueco ya no existe.) Z X C V valen en las dos (con las flechas).
  const COMMON = { KeyZ: 'A', KeyX: 'switch', KeyC: 'B', KeyV: 'dribble', Space: 'tech', KeyQ: 'switch', KeyU: 'techNext', KeyE: 'techNext' };
  const PASS_KEYS = ['KeyJ', 'KeyZ'];
  const STD = { move: { up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'] },
    sprint: ['ShiftLeft', 'ShiftRight'], pass: PASS_KEYS, pause: ['KeyP', 'Escape'] };
  const SCHEMES = {
    nuevas: Object.assign({ map: Object.assign({}, COMMON, { KeyJ: 'A', KeyK: 'switch', KeyL: 'B', KeyI: 'dribble' }), shoot: ['KeyK', 'KeyX'] }, STD),
    clasicas: Object.assign({ map: Object.assign({}, COMMON, { KeyJ: 'A', KeyK: 'B', KeyI: 'dribble' }), shoot: ['KeyL', 'KeyX'] }, STD),
  };
  // «A tu gusto» (Ajustes → Teclas del ordenador): cada acción, también moverse, con la tecla que elijas.
  // Tiro y Cambiar de jugador pueden compartir tecla (como la K de las nuevas: con balón chuta, sin balón cambia).
  const CUSTOM_DEF = { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', sprint: 'ShiftLeft', pass: 'KeyJ', shoot: 'KeyK', switch: 'KeyK',
    through: 'KeyL', dribble: 'KeyI', tech: 'Space', techNext: 'KeyE', pause: 'KeyP' };
  const customKeys = () => { let m = null; try { m = App.settings.keyMap; } catch (_) {} return Object.assign({}, CUSTOM_DEF, m || {}); };
  let customSig = '', customCache = null;
  function customScheme() {
    const k = customKeys(), sig = JSON.stringify(k);
    if (sig === customSig) return customCache;
    const map = {};
    [['techNext', 'techNext'], ['tech', 'tech'], ['dribble', 'dribble'], ['through', 'B'], ['switch', 'switch'], ['pass', 'A']].forEach(([a, act]) => { if (k[a]) map[k[a]] = act; });
    customSig = sig;
    return (customCache = { map, shoot: [k.shoot], pass: [k.pass], sprint: [k.sprint], pause: [k.pause, 'Escape'], move: { up: [k.up], down: [k.down], left: [k.left], right: [k.right] } });
  }
  const scheme = () => { try { return App.settings.keys === 'custom' ? customScheme() : SCHEMES[App.settings.keys] || SCHEMES.nuevas; } catch (_) { return SCHEMES.nuevas; } };
  const inScheme = (K, c) => !!K.map[c] || K.shoot.includes(c) || K.sprint.includes(c) || Object.values(K.move).some(l => l.includes(c));
  // Nombre corto de una tecla para enseñarlo (con la letra de tu teclado si se guardó al elegirla, p. ej. Ñ)
  function keyName(c) {
    let L = null; try { L = App.settings.keyLabels; } catch (_) {}
    if (!c) return '—';
    if (L && L[c]) return L[c];
    if (c.startsWith('Key')) return c.slice(3);
    if (c.startsWith('Digit')) return c.slice(5);
    if (c.startsWith('Numpad')) return 'Num ' + c.slice(6);
    return { Space: TX('Espacio'), ShiftLeft: 'Shift', ShiftRight: TX('Shift dcho.'), ControlLeft: 'Ctrl', ControlRight: TX('Ctrl dcho.'), AltLeft: 'Alt', AltRight: 'AltGr',
      ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Enter: 'Enter', Tab: 'Tab', Backspace: '⌫', CapsLock: TX('Bloq Mayús') }[c] || c;
  }
  let capture = null;   // Ajustes: esperando a que pulses la tecla nueva para una acción
  let passTouch = null;
  const BLOCK = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];

  addEventListener('keydown', e => {
    if (capture) { e.preventDefault(); e.stopPropagation(); if (e.repeat) return; const f = capture; capture = null; f(e); return; }
    const K = scheme();
    if (App.inMatch() && (BLOCK.includes(e.code) || inScheme(K, e.code))) e.preventDefault();
    if (e.repeat) return;
    if (App.menuKey && App.menuKey(e)) return;   // teclas en menús e intro (Esc = volver…)
    keys.add(e.code);
    if (K.map[e.code]) pressed.add(K.map[e.code]);
    if (K.shoot.includes(e.code)) pressed.add('shoot');
    if (K.pause.includes(e.code)) App.togglePause();
  }, true);
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => { keys.clear(); shootTouch = null; passTouch = null; });

  touch.addEventListener('pointerdown', e => {
    if (joy.id !== null) return;
    if (Controls.pc() && e.pointerType === 'mouse') return;   // en PC el ratón no hace de joystick
    const r = shell.getBoundingClientRect();
    if (e.clientX - r.left > r.width * 0.6) return;
    joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY;
    stick.className = 'live';
    stick.style.left = (e.clientX - r.left) + 'px'; stick.style.top = (e.clientY - r.top) + 'px';
    try { touch.setPointerCapture(e.pointerId); } catch (_) {}
  });
  touch.addEventListener('pointermove', e => {
    if (e.pointerId !== joy.id) return;
    let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy, len = Math.hypot(dx, dy);
    if (len > R * FOLLOW) {   // el centro sigue al dedo
      const k = (len - R * FOLLOW) / len; joy.ox += dx * k; joy.oy += dy * k; dx -= dx * k; dy -= dy * k; len = R * FOLLOW;
      const r = shell.getBoundingClientRect(); stick.style.left = (joy.ox - r.left) + 'px'; stick.style.top = (joy.oy - r.top) + 'px';
    }
    const sprint = len > R * SPRINT_AT, m = len < R * DEAD ? 0 : Math.min(1, (len - R * DEAD) / (R * (1 - DEAD)));
    const out = sprint ? 1 : m * 0.92;   // por debajo de 0,95: corre sin esprintar
    joy.x = len ? dx / len * out : 0; joy.y = len ? dy / len * out : 0;
    const kl = Math.min(len, R); knob.style.transform = `translate(${len ? dx / len * kl : 0}px,${len ? dy / len * kl : 0}px)`;
    stick.classList.toggle('sprint', sprint);
  });
  const end = e => {
    if (e.pointerId !== joy.id) return;
    joy.id = null; joy.x = joy.y = 0; knob.style.transform = '';
    stick.className = 'rest'; stick.style.left = stick.style.top = '';
  };
  touch.addEventListener('pointerup', end);
  touch.addEventListener('pointercancel', end);
  addEventListener('pointerup', e => { if (shootTouch === e.pointerId) shootTouch = null; if (passTouch === e.pointerId) passTouch = null; });
  addEventListener('pointercancel', e => { if (shootTouch === e.pointerId) shootTouch = null; if (passTouch === e.pointerId) passTouch = null; });

  // Mando (Xbox/PlayStation/genérico, mapeo estándar): A pase · X tiro (mantener) · B saque largo del portero · Y técnica · RB regate
  // LB cambiar jugador · LT cambiar técnica · RT esprint · Start pausa · stick izquierdo o cruceta para moverte
  const GP = { 0: 'A', 1: 'B', 3: 'tech', 5: 'dribble', 4: 'switch', 6: 'techNext' };
  let gpPrev = [], gpState = { x: 0, y: 0, sprint: false, shoot: false, pass: false };
  addEventListener('gamepadconnected', e => { try { UI.toast(TX('🎮 Mando conectado: ') + (e.gamepad.id || '').split('(')[0].trim().slice(0, 30), 2200); } catch (_) {} document.body.classList.add('gamepad'); });
  addEventListener('gamepaddisconnected', () => { try { UI.toast(TX('Mando desconectado'), 1600); } catch (_) {} if (![...(navigator.getGamepads ? navigator.getGamepads() : [])].some(Boolean)) document.body.classList.remove('gamepad'); });
  function pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const g = [...pads].find(p => p && p.connected);
    gpState = { x: 0, y: 0, sprint: false, shoot: false, pass: false };
    if (!g) return;
    const b = i => !!(g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > 0.5));
    let x = g.axes[0] || 0, y = g.axes[1] || 0;
    if (Math.hypot(x, y) < 0.18) x = y = 0;
    if (b(14)) x = -1; if (b(15)) x = 1; if (b(12)) y = -1; if (b(13)) y = 1;
    gpState = { x, y, sprint: b(7), shoot: b(2), pass: b(0) };
    for (const i in GP) if (b(i) && !gpPrev[i]) pressed.add(GP[i]);
    if (b(2) && !gpPrev[2]) pressed.add('shoot');
    if (b(9) && !gpPrev[9]) App.togglePause();
    gpPrev = g.buttons.map((_, i) => b(i));
  }
  function read() {
    pollPad();
    let x = 0, y = 0;
    const K = scheme(), on = l => l.some(k => keys.has(k));
    if (on(K.move.left)) x -= 1;
    if (on(K.move.right)) x += 1;
    if (on(K.move.up)) y -= 1;
    if (on(K.move.down)) y += 1;
    if (x || y) { const l = Math.hypot(x, y); x /= l; y /= l; }
    x += joy.x + gpState.x; y += joy.y + gpState.y;
    const out = { move: { x, y }, sprint: on(K.sprint) || gpState.sprint,
      shootHeld: on(K.shoot) || shootTouch !== null || gpState.shoot, passHeld: on(K.pass) || passTouch !== null || gpState.pass, pressed: new Set(pressed) };
    pressed.clear();
    return out;
  }
  return {
    read,
    CUSTOM_DEF, customKeys, keyName,
    capture: f => { capture = f; },
    press: a => pressed.add(a),
    holdShoot: (on, id) => { if (on) { shootTouch = id; pressed.add('shoot'); } else if (id === undefined || shootTouch === id) shootTouch = null; },
    holdPass: (on, id) => { if (on) passTouch = id; else if (id === undefined || passTouch === id) passTouch = null; },
  };
})();

/* =====================================================================
   BOTONES TÁCTILES: cambian según tu equipo tenga el balón o no.
   ===================================================================== */
const Pad = (() => {
  const SETS = {
    attack: [
      { label: TX('Tiro'), sub: 'mantener', cls: 'big', hold: true },
      { label: TX('Pase'), sub: TX('mantén'), cls: 's2', action: 'A', holdPass: true },
      { label: TX('Técnica'), cls: 's3 fire', action: 'tech', tech: true },
      { label: '⇄', cls: 's6 tnext', action: 'techNext' },
      { label: TX('Regate'), cls: 's5', action: 'dribble' },
    ],
    gk: [
      { label: TX('Despeje'), sub: 'suelta', cls: 'big', hold: true },
      { label: TX('Pase'), sub: TX('mantén'), cls: 's2', action: 'A', holdPass: true },
      { label: TX('Saque<br>largo'), cls: 's4', action: 'B' },
    ],
    defense: [   // «Cambiar» va donde Regate, no donde Pase: al perder el balón, un toque en Pase ya no te cambia de jugador sin querer
      { label: TX('Entrada'), cls: 'big', action: 'A' },
      { label: TX('Cambiar'), cls: 's5', action: 'switch' },
      { label: TX('Técnica'), cls: 's3 fire', action: 'tech', tech: true },
      { label: '⇄', cls: 's6 tnext', action: 'techNext' },
    ],
  };
  const pad = document.getElementById('pad'), kh = document.getElementById('keyhud');
  const KEYS_CLASICAS = {
    attack: '<b>WASD</b>/<b>' + TX('flechas') + '</b> ' + TX('mover ·') + ' <b>' + TX('Shift') + '</b> ' + TX('esprint ·') + ' <b>J/Z</b> ' + TX('pase (mantén = fuerte) ·') + ' <b>I/V</b> ' + TX('regate ·') + ' <b>L/X</b> ' + TX('tiro (mantén) ·') + ' <b>U</b> ' + TX('cambiar técnica'),
    defense: '<b>WASD</b>/<b>' + TX('flechas') + '</b> ' + TX('mover ·') + ' <b>' + TX('Shift') + '</b> ' + TX('esprint ·') + ' <b>J/Z</b> ' + TX('entrada ·') + ' <b>Q/X</b> ' + TX('cambiar ·') + ' <b>U</b> ' + TX('cambiar técnica'),
    gk: '<b>' + TX('Portero') + '</b>: <b>WASD</b>/<b>' + TX('flechas') + '</b> ' + TX('mover por el área ·') + ' <b>J/Z</b> ' + TX('pase (mantén = fuerte) ·') + ' <b>K/C</b> ' + TX('saque largo ·') + ' <b>L/X</b> ' + TX('despeje'),
  };
  const KEYS = {
    attack: '<b>WASD</b>/<b>' + TX('flechas') + '</b> ' + TX('mover ·') + ' <b>' + TX('Shift') + '</b> ' + TX('esprint ·') + ' <b>J/Z</b> ' + TX('pase (mantén = fuerte) ·') + ' <b>K/X</b> ' + TX('tiro (mantén) ·') + ' <b>I/V</b> ' + TX('regate ·') + ' <b>E</b> ' + TX('cambiar técnica'),
    defense: '<b>WASD</b>/<b>' + TX('flechas') + '</b> ' + TX('mover ·') + ' <b>' + TX('Shift') + '</b> ' + TX('esprint ·') + ' <b>J/Z</b> ' + TX('entrada ·') + ' <b>K/X</b> ' + TX('cambiar ·') + ' <b>E</b> ' + TX('cambiar técnica'),
    gk: '<b>' + TX('Portero') + '</b>: <b>WASD</b>/<b>' + TX('flechas') + '</b> ' + TX('mover por el área ·') + ' <b>J/Z</b> ' + TX('pase (mantén = fuerte) ·') + ' <b>K/X</b> ' + TX('despeje ·') + ' <b>L/C</b> ' + TX('saque largo'),
  };
  // Barra de teclas con las teclas «A tu gusto»
  function customHud(m) {
    const k = Input.customKeys(), n = c => '<b>' + esc(Input.keyName(c)) + '</b>';
    const mv = [k.up, k.left, k.down, k.right].every(c => /^Key.$/.test(c)) ? '<b>' + [k.up, k.left, k.down, k.right].map(c => c.slice(3)).join('') + '</b>' : [k.up, k.left, k.down, k.right].map(n).join('');
    const sp = ' ' + n(k.sprint) + ' ' + TX('esprint ·') + ' ';
    const parts = {
      attack: mv + ' ' + TX('mover ·') + sp + n(k.pass) + ' ' + TX('pase (mantén = fuerte) ·') + ' ' + n(k.shoot) + ' ' + TX('tiro (mantén) ·') + ' ' + n(k.dribble) + ' ' + TX('regate ·') + ' ' + n(k.techNext) + ' ' + TX('cambiar técnica'),
      defense: mv + ' ' + TX('mover ·') + sp + n(k.pass) + ' ' + TX('entrada ·') + ' ' + n(k.switch) + ' ' + TX('cambiar ·') + ' ' + n(k.techNext) + ' ' + TX('cambiar técnica'),
      gk: '<b>' + TX('Portero') + '</b>: ' + mv + ' ' + TX('mover por el área ·') + ' ' + n(k.pass) + ' ' + TX('pase (mantén = fuerte) ·') + ' ' + n(k.shoot) + ' ' + TX('despeje ·') + ' ' + n(k.through) + ' ' + TX('saque largo'),
    };
    return (parts[m] || parts.attack) + ' · ' + n(k.pause) + ' ' + TX('pausa');
  }
  let mode = null, techBtn = null, techLbl = null, lastName = null, lastKH = null, dribBtn = null, lastDrib = -1, nextBtn = null;
  const down = new Set();   // dedos sobre los botones: mientras haya alguno, los botones no cambian (si no, el botón desaparecía bajo el dedo)
  function render(m) {
    if (m === mode || down.size) return;
    let sch = 'nuevas'; try { sch = App.settings.keys || 'nuevas'; } catch (_) {}
    kh.querySelector('.kh-keys').innerHTML = sch === 'custom' ? customHud(m) : (sch === 'clasicas' ? KEYS_CLASICAS : KEYS)[m] + ' · <b>P</b> ' + TX('pausa');
    mode = m; pad.innerHTML = ''; techBtn = null; dribBtn = null; nextBtn = null; lastDrib = -1; lastName = null;
    Input.holdShoot(false); Input.holdPass(false);
    SETS[m].forEach(b => {
      const el = document.createElement('button');
      el.className = 'act ' + b.cls;
      el.innerHTML = (b.tech ? `<span class="tt">${b.label}</span>` : b.label) + (b.sub ? `<small>${b.sub}</small>` : '') + (b.tech ? '<small class="tn"></small>' : '');
      el.addEventListener('pointerdown', e => {
        e.preventDefault(); el.classList.add('down'); down.add(e.pointerId);
        if (b.hold) { Input.holdShoot(true, e.pointerId); try { el.setPointerCapture(e.pointerId); } catch (_) {} }
        else { Input.press(b.action); if (b.holdPass) { Input.holdPass(true, e.pointerId); try { el.setPointerCapture(e.pointerId); } catch (_) {} } }
      });
      const up = e => { el.classList.remove('down'); down.delete(e.pointerId); if (b.hold) Input.holdShoot(false, e.pointerId); if (b.holdPass) Input.holdPass(false, e.pointerId); };
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => el.addEventListener(t, up));
      el.addEventListener('pointerleave', () => { if (!b.hold) el.classList.remove('down'); });
      if (b.tech) { techBtn = el; techLbl = el.querySelector('.tn'); }
      if (b.action === 'dribble') dribBtn = el;
      if (b.action === 'techNext') nextBtn = el;
      pad.appendChild(el);
    });
  }
  function setTech(ctx) {
    const khKey = ctx ? ctx.tech.name + '|' + (ctx.ready ? 1 : Math.round(ctx.frac * 20)) : '';
    if (khKey !== lastKH) {   // en PC: nombre de la técnica y su recarga junto a la tecla Espacio
      lastKH = khKey;
      const t = kh.querySelector('.kh-tech');
      t.classList.toggle('off', !ctx); t.classList.toggle('ready', !!(ctx && ctx.ready));
      t.dataset.elem = ctx ? ctx.tech.elem : '';
      t.querySelector('span').textContent = ctx ? ctx.tech.name : TX('Sin técnica');
      t.style.setProperty('--cd', ctx && !ctx.ready ? ctx.frac.toFixed(2) : 0);
    }
    if (!techBtn) return;
    techBtn.classList.toggle('off', !ctx);
    techBtn.style.setProperty('--cd', ctx && !ctx.ready ? ctx.frac.toFixed(3) : 0);
    const n = ctx ? ctx.tech.name : '—';
    if (n !== lastName) { techLbl.textContent = n; lastName = n; }
    techBtn.dataset.elem = ctx ? ctx.tech.elem : '';
  }
  // Recarga del regate normal (círculo oscuro que se va vaciando)
  function setChoices(n) { if (nextBtn) nextBtn.hidden = n < 2; }
  function setDribble(frac) {
    const k = Math.round(frac * 30); if (!dribBtn || k === lastDrib) return; lastDrib = k;
    dribBtn.style.setProperty('--cd', (k / 30).toFixed(2)); dribBtn.classList.toggle('cool', k > 0);
  }
  addEventListener('pointerup', e => down.delete(e.pointerId)); addEventListener('pointercancel', e => down.delete(e.pointerId));
  function show(on) { if (!on) down.clear(); pad.hidden = !on; document.getElementById('stick').hidden = !on; kh.hidden = !on; }
  return { render, setTech, setDribble, setChoices, show };
})();

/* =====================================================================
   HUD y mensajes (DOM)
   ===================================================================== */
const UI = (() => {
  const $ = id => document.getElementById(id);
  let toastT, bannerT, sayT, sayCool = 0, last = {};
  function toast(text, ms = 1300) {
    const t = $('toast'); t.textContent = text; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms);
  }
  function banner(text, cls = '', ms = 1500) {
    const b = $('banner'); b.textContent = text; b.className = 'banner on ' + cls;
    clearTimeout(bannerT); bannerT = setTimeout(() => b.className = 'banner ' + cls, ms);
  }
  let fpsT = performance.now(), fps = 60, dbgT = 0;
  function debug(s) {   // datos en pantalla del modo desarrollador
    const now = performance.now(); fps = fps * 0.9 + 100 / Math.max(1, now - fpsT); fpsT = now;
    const el = $('dbg'); if (!App.settings.debug) { el.hidden = true; return; }
    if (now - dbgT < 250) return; dbgT = now; el.hidden = false;
    const me = Logic.controlled(s), b = s.ball;
    el.textContent = `FPS ${fps.toFixed(0)} ${TX('· velocidad')} ${GAME_SPEED} · ${s.settings.difficulty}${'\\n'}` +
      `${TX('balón')} ${Math.hypot(b.vx, b.vy).toFixed(1)} ${TX('m/s · z')} ${b.z.toFixed(1)}${b.shot ? TX(' · tiro ') + b.shot.power.toFixed(0) : ''}${'\\n'}` +
      `${me.name}: ${me.techs.map(t => t.name + ' ' + Math.ceil(me.cd[t.id] || 0) + 's').join(' · ') || TX('sin técnicas')}`;
  }
  function update(s) {
    debug(s);
    const clock = (s.golden ? TX('Oro ') : '') + Math.floor(s.time / 60) + ':' + String(Math.floor(s.time % 60)).padStart(2, '0');
    if (last.clock !== clock) { $('clock').textContent = clock; last.clock = clock; }
    if (last.a !== s.score.A) { $('sA').textContent = s.score.A; last.a = s.score.A; }
    if (last.b !== s.score.B) { $('sB').textContent = s.score.B; last.b = s.score.B; }
    if (last.nb !== s.teams.B.name) { $('nB').textContent = s.teams.B.name; last.nb = s.teams.B.name; const T = TEAM(s.teams.B.name); $('cB').src = 'ui/crest' + (T && T.crest || 2) + '.png'; }
    const me = Logic.controlled(s);
    Pad.render(me && me.role === 'POR' && s.ball.owner === me ? 'gk' : Logic.possession(s) === 'A' ? 'attack' : 'defense');
    Pad.setTech(Logic.contextTech(s, Logic.controlled(s)));
    Pad.setDribble(me ? (me.dribbleCd || 0) / Logic.DRIBBLE_CD : 0);
    Pad.setChoices(Logic.techChoices(s, me));
  }
  function reset() { last = {}; sayCool = 0; const d = $('say'); if (d) d.className = 'say'; }
  // Globo de diálogo de un jugador (con su retrato). Sin «force» respeta una pausa entre frases para no saturar.
  function say(ref, name, text, team, force, ms = 2300) {
    const d = $('say'), now = performance.now();
    if (!d || !text || (!force && now < sayCool)) return false;
    sayCool = now + ms + 1200;
    d.className = 'say'; void d.offsetWidth;
    d.className = 'say on' + (team === 'B' ? ' rival' : '');
    d.querySelector('.sy-txt small').textContent = name || '';
    d.querySelector('.sy-txt span').textContent = text;
    const slot = d.querySelector('.sy-face'); slot.innerHTML = '';
    if (ref) slot.appendChild(Sprites.face(ref, 56));
    clearTimeout(sayT); sayT = setTimeout(() => { d.classList.add('out'); sayT = setTimeout(() => { d.className = 'say'; }, 260); }, ms);
    return true;
  }
  // Presentación de una supertécnica: franja con el retrato del jugador y el nombre
  let cutT;
  function cutin(name, elem, team, kind, ref, ms) {
    const c = $('cutin');
    c.className = 'cutin'; void c.offsetWidth;
    c.className = 'cutin on ' + (EL(elem).css || 'neutro') + (team === 'B' ? ' rival' : '');
    c.querySelector('.ci-txt b').textContent = name;
    c.querySelector('.ci-txt small').textContent = (team === 'B' ? TX('Rival · ') : '') + (TYPE_TXT[kind] || TX('Supertécnica'));
    const slot = c.querySelector('.ci-face'); slot.innerHTML = '';
    if (ref) slot.appendChild(Sprites.face(ref, 80));
    clearTimeout(cutT);
    cutT = setTimeout(() => { c.classList.add('out'); cutT = setTimeout(() => { c.className = 'cutin'; }, 240); }, ms);
  }
  return { toast, banner, update, reset, cutin, say };
})();

/* =====================================================================
   DIBUJO CON PHASER: solo lee el estado de la lógica y lo pinta.
   ===================================================================== */
const PX = 18;
const COLORS = { runoff: 0x2a6a2c, stripeA: 0x3f8f3a, stripeB: 0x479c41, line: 0xf2f6ec, fire: 0xff7a1a };
// Colores de cada elemento para los efectos
const ELEM = {
  fuego:   { main: 0xff7a1a, tints: [0xfff1a0, 0xffc23a, 0xff7a1a, 0xe8361a], tex: 'spark', css: 'fuego' },
  viento:  { main: 0x6fe3ff, tints: [0xffffff, 0xd2f7ff, 0x8fe9ff, 0x3fb6e8], tex: 'streak', css: 'viento' },
  bosque:  { main: 0x5ccf4a, tints: [0xe2ffa8, 0x9ee860, 0x52b83e, 0x2c7d2c], tex: 'leaf', css: 'bosque' },
  montaña: { main: 0xd29a4a, tints: [0xffe6b0, 0xe0aa60, 0xae7232, 0x6e4622], tex: 'shard', css: 'montana' },
  neutro:  { main: 0xffffff, tints: [0xffffff, 0xdddddd], tex: 'spark', css: '' },
};
const EL = e => ELEM[e] || ELEM.neutro;
// Fotogramas del juego de DS: 5 direcciones base; el resto se voltea
const ANIM = {
  stand: [0, 6, 10, 14, 18],
  run: [[21,20,21,0,22,23,22,0],[25,24,25,6,26,27,26,6],[29,28,29,10,30,31,30,10],[33,32,33,14,34,35,34,14],[37,36,37,18,38,39,38,18]],
  runT: [2,6,2,4,2,6,2,4],
  kick: [[22,48],[26,49],[30,50],[34,51],[38,52]],
  down: [62, 63],
};
// Fotogramas guardados (47 de los 64 originales) y su posición en la hoja
const NF = GAME.frames.length;
const FR = {}; GAME.frames.forEach((f, i) => { FR[f] = i; });
function dirOf(facing) {
  const k = ((Math.round(facing / (Math.PI / 4)) % 8) + 8) % 8;
  return [[2, true], [1, true], [0, false], [1, false], [2, false], [3, false], [4, false], [3, true]][k];
}

// Campos: colores del césped, líneas y partículas de ambiente
const FIELDS = {
  normal:    { runoff: 0x2a6a2c, a: 0x3f8f3a, b: 0x479c41, line: 0xf2f6ec, bg: '#1d4a22' },
  noche:     { runoff: 0x0f2a24, a: 0x1f4a3c, b: 0x255443, line: 0xcfe8ff, bg: '#0a1714', dark: 0.25, stands: 0x8a92b8, amb: { tex: 'spark', tint: [0xbfe3ff, 0xffffff], up: false, n: 0.5 } },
  jungla:    { runoff: 0x1d3f17, a: 0x2f6a24, b: 0x377a2b, line: 0xe8f5d0, bg: '#102a0d', amb: { tex: 'leaf', tint: [0x6fbf3a, 0x9ee860, 0x3f8f2a], up: false, n: 0.7 } },
  atardecer: { runoff: 0x5a5a22, a: 0x6c8a32, b: 0x789a3a, line: 0xfff1d0, bg: '#3a3016', tint: 0xffb070, stands: 0xffd8b0 },
  nieve:     { runoff: 0xb8c8d4, a: 0xd8e6ef, b: 0xe6f0f6, line: 0x5a7fa0, bg: '#9fb3c2', amb: { tex: 'spark', tint: [0xffffff], up: false, n: 1.4 } },
  acero:     { runoff: 0x2a2e34, a: 0x3d5a40, b: 0x456446, line: 0xe0e6ec, bg: '#181b1f', dark: 0.12, stands: 0xb0b8c4 },
  cielo:     { runoff: 0xd8c890, a: 0x7fbf6a, b: 0x8ccc76, line: 0xfff6c8, bg: '#c9b878', amb: { tex: 'spark', tint: [0xfff2a0, 0xffffff], up: true, n: 0.8 } },
  niebla:    { runoff: 0x161026, a: 0x22402f, b: 0x284a35, line: 0xe2d4ff, bg: '#0b0714', dark: 0.3, tint: 0x14062a, stands: 0x9a7ab8, fog: true, amb: { tex: 'spark', tint: [0xff8a1a, 0xffc04a, 0xb07aff], up: true, n: 0.45 } },
  volcan:    { runoff: 0x2a120c, a: 0x4a2a1c, b: 0x55311f, line: 0xffb070, bg: '#160806', dark: 0.18, stands: 0xc8907a, amb: { tex: 'spark', tint: [0xff7a1a, 0xffc23a, 0xe8361a], up: true, n: 1.6 } },
};
// Gradas: cuatro texturas (una por lado) con la valla de publicidad y el público en pixel art
const STAND = { len: 240, deep: 260, side: 1.8, end: 2.7 };
function makeStands(scene) {
  if (scene.textures.exists('standD')) return;
  const SHIRTS = [0xe8e8e8, 0xd84a3a, 0x3a6ad8, 0xf0c030, 0x40a050, 0xff8a2a, 0x7a4ad8, 0x2a2a2a, 0x9fd0ff, 0xff9fc0];
  const SKIN = [0xf0c8a0, 0xd9a878, 0xb8875a, 0xf6d8b8], HAIR = [0x2a1a10, 0x5a3a1a, 0x111111, 0xc89a40];
  const ADS = [0x1f2e68, 0xff7a1a, 0xffd23a, 0xd8361a, 0x2f8f3a, 0xe8e8e8];
  const L = STAND.len, D = STAND.deep;
  for (const key of ['standD', 'standU', 'standL', 'standR']) {
    let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const vert = key === 'standL' || key === 'standR';
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    // u: a lo largo de la grada · v: distancia al campo. Se pasa a x/y según el lado
    const rect = (u, v, w, h, c) => {
      const q = key === 'standD' ? [u, v, w, h] : key === 'standU' ? [u, D - v - h, w, h] : key === 'standR' ? [v, u, h, w] : [D - v - h, u, h, w];
      g.fillStyle(c, 1).fillRect(q[0], q[1], q[2], q[3]);
    };
    for (let u = 0, k = 0; u < L; u += 40, k++) { rect(u, 0, 40, 8, ADS[k % ADS.length]); rect(u, 3, 40, 1, 0xffffff); rect(u, 0, 1, 8, 0x111111); }
    rect(0, 8, L, 4, 0x1e2024);
    for (let v = 12, row = 0; v < D; v += 9, row++) {
      rect(0, v, L, 9, row % 2 ? 0x5a5f6a : 0x50555f);
      rect(0, v + 8, L, 1, 0x34373f);
      for (let u = (row % 2) * 2; u < L - 4; u += 5) {
        if (r() < 0.3) continue;
        const shirt = SHIRTS[Math.floor(r() * SHIRTS.length)], head = SKIN[Math.floor(r() * SKIN.length)], hair = HAIR[Math.floor(r() * HAIR.length)];
        if (!vert) {
          // de frente (grada de arriba) o de espaldas (grada de abajo): cabeza encima del cuerpo en pantalla
          const top = key === 'standU' ? D - v - 9 : v;
          g.fillStyle(shirt, 1).fillRect(u, top + 4, 3, 4);
          g.fillStyle(key === 'standU' ? head : hair, 1).fillRect(u + 0.5, top + 1.5, 2, 2.5);
        } else {
          const left = key === 'standR' ? v : D - v - 9;
          g.fillStyle(shirt, 1).fillRect(left + 2, u + 2, 4, 3);
          g.fillStyle(head, 1).fillRect(left + (key === 'standR' ? 2 : 4), u, 2, 2);
        }
      }
    }
    g.generateTexture(key, vert ? D : L, vert ? L : D); g.destroy();
  }
}
function drawStands(scene, F, T) {
  const W = F.w * PX, L = F.l * PX, sg = STAND.side * PX, eg = STAND.end * PX, D = STAND.deep, X = 420;
  const tint = T.stands || 0xffffff;
  const add = (x, y, w, h, key) => scene.add.tileSprite(x, y, w, h, key).setOrigin(0, 0).setDepth(-999).setTint(tint);
  return [add(-X, -eg - D, W + 2 * X, D, 'standU'), add(-X, L + eg, W + 2 * X, D, 'standD'),
    add(-sg - D, -eg, D, L + 2 * eg, 'standL'), add(W + sg, -eg, D, L + 2 * eg, 'standR')];
}
function drawPitch(scene, F, theme) {
  const T = FIELDS[theme] || FIELDS.normal;
  const W = F.w * PX, L = F.l * PX, m = F.margin * PX, cx = W / 2;
  const g = scene.add.graphics().setDepth(-1000);
  g.fillStyle(T.runoff).fillRect(-m - 200, -m - 240, W + 2 * m + 400, L + 2 * m + 480);
  for (let i = 0, y = 0; y < L; i++, y += 4 * PX) g.fillStyle(i % 2 ? T.b : T.a).fillRect(0, y, W, Math.min(4 * PX, L - y));
  if (theme === 'volcan') {   // grietas de lava en la banda
    g.lineStyle(3, 0xff5a1a, 0.7);
    for (let y = 30; y < L; y += 90) { g.lineBetween(-m + 10, y, -14, y + 30); g.lineBetween(W + 14, y + 40, W + m - 10, y + 70); }
  }
  g.lineStyle(2, T.line, 0.9);
  g.strokeRect(0, 0, W, L);
  g.lineBetween(0, L / 2, W, L / 2);
  g.strokeCircle(cx, L / 2, F.circleR * PX);
  g.fillStyle(COLORS.line, 0.9).fillCircle(cx, L / 2, 3);
  const a0 = Math.asin((F.boxD - F.spot) / F.circleR);
  [[0, 1], [L, -1]].forEach(([base, s]) => {
    g.strokeRect(cx - F.boxW * PX / 2, s > 0 ? base : base - F.boxD * PX, F.boxW * PX, F.boxD * PX);
    g.strokeRect(cx - F.smallW * PX / 2, s > 0 ? base : base - F.smallD * PX, F.smallW * PX, F.smallD * PX);
    const spotY = base + s * F.spot * PX;
    g.fillCircle(cx, spotY, 3);
    g.beginPath();
    if (s > 0) g.arc(cx, spotY, F.circleR * PX, a0, Math.PI - a0, false);
    else g.arc(cx, spotY, F.circleR * PX, Math.PI + a0, Math.PI * 2 - a0, false);
    g.strokePath();
  });
  [[0, 0, 0, Math.PI / 2], [W, 0, Math.PI / 2, Math.PI], [0, L, -Math.PI / 2, 0], [W, L, Math.PI, Math.PI * 1.5]]
    .forEach(([x, y, a, b]) => { g.beginPath(); g.arc(x, y, PX, a, b, false); g.strokePath(); });
  const objs = [g, ...drawStands(scene, F, T), ...drawGoal(scene, F, 0, -1), ...drawGoal(scene, F, L, 1)];
  scene.cameras.main.setBackgroundColor(T.bg);
  return objs;
}

function drawGoal(scene, F, lineY, outward) {
  const cx = F.w * PX / 2, half = F.goalW * PX / 2, depth = F.goalDepth * PX, h = 26;
  const net = scene.add.graphics().setDepth(outward < 0 ? -500 : lineY + 3);
  const y0 = outward < 0 ? lineY - depth : lineY;
  net.fillStyle(0xffffff, 0.14).fillRect(cx - half, y0, half * 2, depth);
  net.lineStyle(1, 0xffffff, 0.3);
  for (let x = cx - half; x <= cx + half; x += 6) net.lineBetween(x, y0, x, y0 + depth);
  for (let y = y0; y <= y0 + depth; y += 6) net.lineBetween(cx - half, y, cx + half, y);
  const frame = scene.add.graphics().setDepth(outward < 0 ? 0 : lineY + 4);
  frame.fillStyle(0x000000, 0.25).fillRect(cx - half, lineY - 1, half * 2, 4);
  frame.lineStyle(4, 0xffffff, 1);
  frame.lineBetween(cx - half, lineY, cx - half, lineY - h);
  frame.lineBetween(cx + half, lineY, cx + half, lineY - h);
  frame.lineBetween(cx - half - 2, lineY - h, cx + half + 2, lineY - h);
  return [net, frame];
}

function makePlayerView(scene, p) {
  const root = scene.add.container(0, 0);
  const shadow = scene.add.ellipse(0, 1, 26, 10, 0x000000, 0.32);
  const ground = scene.add.container(0, 0).setScale(1, 0.5);
  const ring = scene.add.graphics(); ring.lineStyle(3, COLORS.fire, 1).strokeCircle(0, 0, 15);
  const arrow = scene.add.graphics();
  ground.add([ring, arrow]);
  const spr = scene.add.sprite(0, 0, 'match', p.row * NF).setOrigin(24 / 48, 43 / 48).setScale(1.4);
  const ghost = scene.add.sprite(0, 0, 'match', p.row * NF).setOrigin(24 / 48, 43 / 48).setScale(1.4).setAlpha(0.35).setVisible(false);
  const fig = scene.add.container(0, 0, [ghost, spr]);
  const marker = scene.add.graphics();
  marker.fillStyle(COLORS.fire).fillTriangle(-6, 0, 6, 0, 0, 8);
  const warn = scene.add.text(0, -62, '!', { fontFamily: 'Arial Black, Arial', fontSize: '18px', color: '#ffd23a', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setVisible(false);
  const tag = scene.add.text(0, 12, p.name.split(' ')[0], { fontFamily: 'InaPixel, Arial, sans-serif', fontSize: '12px',
    color: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5, 0);
  root.add([shadow, ground, fig, marker, warn, tag]);
  return { root, ring, arrow, fig, spr, ghost, marker, warn, tag, ctrl: null, shadow, animT: 0 };
}

function paintControl(v, on) {
  if (v.ctrl === on) return;
  v.ctrl = on;
  v.arrow.clear();
  v.arrow.fillStyle(on ? COLORS.fire : 0xffffff, on ? 1 : 0.55).fillTriangle(24, 0, 15, -6, 15, 6);
  v.ring.setVisible(on); v.marker.setVisible(on); v.tag.setVisible(on);
}

class MatchScene extends Phaser.Scene {
  constructor() { super('match'); }
  create() {
    const F = Logic.FIELD, m = F.margin * PX;
    this.makeTextures();
    this.setField('normal');
    this.views = new Map();
    this.ballShadow = this.add.ellipse(0, 0, 11, 5, 0x000000, 0.35);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff).fillCircle(0, 0, 5); bg.lineStyle(1.2, 0x111111, 0.9).strokeCircle(0, 0, 5);
    bg.fillStyle(0x222222).fillCircle(1.3, -0.8, 1.8);
    this.ballC = this.add.container(0, 0, [bg]);
    // Un rastro y un emisor de partículas por elemento
    this.trails = {}; this.fx = {};
    for (const [k, e] of Object.entries(ELEM)) {
      const tr = this.add.particles(0, 0, e.tex, { lifespan: 380, speed: { min: 10, max: 60 }, scale: { start: 0.9, end: 0 },
        alpha: { start: 0.9, end: 0 }, tint: e.tints, blendMode: k === 'montaña' ? 'NORMAL' : 'ADD', frequency: 14, quantity: 2,
        rotate: { min: 0, max: 360 }, emitting: false });
      tr.startFollow(this.ballC);
      this.trails[k] = tr;
      this.fx[k] = this.add.particles(0, 0, e.tex, { lifespan: 480, speed: { min: 20, max: 120 }, scale: { start: 0.9, end: 0 },
        alpha: { start: 1, end: 0 }, tint: e.tints, blendMode: k === 'montaña' ? 'NORMAL' : 'ADD', rotate: { min: 0, max: 360 }, emitting: false });
    }
    this.dust = this.add.particles(0, 0, 'spark', { lifespan: 380, speed: { min: 20, max: 70 }, scale: { start: 0.7, end: 0 },
      alpha: { start: 0.6, end: 0 }, tint: [0xe8dcb8, 0xc9b98a], emitting: false });
    this.ui = this.add.graphics().setDepth(5000);
    this.shield = [];
    const cam = this.cameras.main;
    cam.setBounds(-m, -m - 40, F.w * PX + 2 * m, F.l * PX + 2 * m + 80);
    cam.setFollowOffset(0, 60);
    this.camT = { x: 0, y: 0 };          // punto que sigue la cámara; se desliza suave hacia tu jugador
    cam.startFollow(this.camT, true, 1, 1);
    this.camInit = false;
    this.tfx = new TechFX(this);
    App.scene = this;
    if (App.match && App.matchSheet) this.bind(App.match, App.matchSheet);
  }

  makeTextures() {
    const mk = (key, w, h, draw) => { const g = this.make.graphics({ x: 0, y: 0, add: false }); draw(g); g.generateTexture(key, w, h); g.destroy(); };
    mk('spark', 16, 16, g => { for (let r = 8; r > 0; r--) { g.fillStyle(0xffffff, 0.14 + (8 - r) * 0.1); g.fillCircle(8, 8, r); } });
    mk('streak', 20, 6, g => { g.fillStyle(0xffffff, 0.5); g.fillRoundedRect(0, 1, 20, 4, 2); g.fillStyle(0xffffff, 1); g.fillRoundedRect(4, 2, 12, 2, 1); });
    mk('leaf', 12, 8, g => { g.fillStyle(0xffffff, 1); g.fillEllipse(6, 4, 12, 7); g.fillStyle(0x000000, 0.25); g.fillRect(1, 3.5, 10, 1); });
    makeStands(this);
    mk('shard', 10, 10, g => { g.fillStyle(0xffffff, 1); g.fillTriangle(5, 0, 10, 8, 0, 10); g.fillStyle(0x000000, 0.25); g.fillTriangle(5, 0, 10, 8, 6, 9); });
  }

  // Cambia el campo (césped, colores y ambiente)
  setField(theme) {
    (this.pitch || []).forEach(o => o.destroy());
    if (this.amb) { this.amb.destroy(); this.amb = null; }
    if (this.shade) { this.shade.destroy(); this.shade = null; }
    if (this.fog) { this.fog.forEach(o => { this.tweens.killTweensOf(o); o.destroy(); }); this.fog = null; }
    this.pitch = drawPitch(this, Logic.FIELD, theme);
    const T = FIELDS[theme] || FIELDS.normal, cam = this.cameras.main;
    if (T.amb) {
      const w = cam.width || 400, h = cam.height || 800;
      this.amb = this.add.particles(0, 0, T.amb.tex, { x: { min: -20, max: w + 20 }, y: T.amb.up ? h + 10 : -10,
        speedY: T.amb.up ? { min: -70, max: -30 } : { min: 30, max: 70 }, speedX: { min: -20, max: 20 }, lifespan: 9000,
        scale: { min: 0.25, max: 0.6 }, alpha: { start: 0.9, end: 0.2 }, tint: T.amb.tint, rotate: { min: 0, max: 360 },
        frequency: 160 / T.amb.n, blendMode: T.amb.up ? 'ADD' : 'NORMAL' }).setScrollFactor(0).setDepth(4000);
    }
    if (T.dark || T.tint) {   // velo de color para noche, atardecer, volcán…
      this.shade = this.add.rectangle(0, 0, 4000, 4000, T.tint || 0x000820, T.dark || 0.12).setOrigin(0).setScrollFactor(0).setDepth(3900);
    }
    if (T.fog) {   // niebla suave: nubes grandes y difusas que se mecen despacio por encima del campo
      if (!this.textures.exists('fogpuff')) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        for (let i = 14; i > 0; i--) { g.fillStyle(0xd8d0f0, 0.045); g.fillCircle(64, 64, i * 4.5); }
        g.generateTexture('fogpuff', 128, 128); g.destroy();
      }
      const w = cam.width || 400, h = cam.height || 800;
      this.fog = [];
      for (let i = 0; i < 8; i++) {
        const o = this.add.image(Math.random() * w, (i + 0.5) * h / 8, 'fogpuff').setScrollFactor(0).setDepth(3950)
          .setScale(3 + Math.random() * 2.5, 1.4 + Math.random()).setAlpha(0.5 + Math.random() * 0.3);
        this.tweens.add({ targets: o, x: o.x + (i % 2 ? -1 : 1) * (120 + Math.random() * 120), alpha: o.alpha * 0.55, duration: 7000 + Math.random() * 7000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.fog.push(o);
      }
    }
  }
  bind(s, sheet) {
    this.setField(s.settings.field || 'normal');
    if (sheet) {
      if (this.textures.exists('match')) this.textures.remove('match');
      this.textures.addSpriteSheet('match', sheet, { frameWidth: 48, frameHeight: 48 });
      this.textures.get('match').setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    for (const v of this.views.values()) v.root.destroy();
    this.views = new Map();
    for (const p of s.players) this.views.set(p.id, makePlayerView(this, p));
    this.camInit = false;
    for (const t of Object.values(this.trails)) t.stop();
    this.tfx.reset();
    this.cameras.main.setZoom(1);
  }

  fxRing(x, y, color, scale, depth, width = 4) {
    const g = this.add.graphics({ x, y }).setDepth(depth);
    g.lineStyle(width, color, 1).strokeEllipse(0, 0, 40, 20);
    this.tweens.add({ targets: g, scaleX: scale, scaleY: scale, alpha: 0, duration: 450, ease: 'Cubic.easeOut', onComplete: () => g.destroy() });
  }
  burst(elem, x, y, n, depth) { const e = this.fx[elem] || this.fx.neutro; e.setDepth(depth); e.explode(n, x, y); }

  update(time, delta) {
    const s = App.match;
    if (!s || !this.views.size) return;
    if (App.running) Logic.update(s, Input.read(), Math.min(delta / 1000, 0.05)); else Input.read();
    this.drawAura(s, time);

    for (const p of s.players) {
      const v = this.views.get(p.id);
      v.root.setPosition(p.x * PX, p.y * PX).setDepth(p.y * PX);
      v.arrow.rotation = p.aim;
      paintControl(v, p.id === s.controlledId);
      const [di, flip] = dirOf(p.facing);
      let f = ANIM.stand[di];
      const techP = s.tech && s.tech.p === p;
      const spd = Math.hypot(p.vx, p.vy);
      const down = p.stun > 0.3 && !p.tackle && !p.dash;
      // Caído: el fotograma de pie tumbado (los fotogramas de caído del juego no traen el cuerpo en muchos jugadores)
      if (down) f = ANIM.stand[2];
      else if (p.tackle || (p.dash && p.dash.tech.type === 'bloqueo')) f = ANIM.run[di][(Math.floor(time / 70) % 2) * 4 + 1];
      else if (p.kickT > 0) f = ANIM.kick[di][1];
      else if (techP || p.windup || p.tkWind > 0 || (s.shoot.charging && p.id === s.controlledId)) f = ANIM.kick[di][0];
      else if (spd > 0.6) {
        // La animación avanza según la distancia recorrida: los pies no patinan
        v.animT += delta / 1000 * spd * 13 * GAME_SPEED;
        let t = v.animT % 28, k = 0;
        while (t >= ANIM.runT[k]) { t -= ANIM.runT[k]; k++; }
        f = ANIM.run[di][k];
      }
      v.spr.setFrame(p.row * NF + FR[f]).setFlipX(flip);
      if (down !== !!v.down) { v.down = down; v.spr.setAngle(down ? (flip ? -82 : 82) : 0).setY(down ? -10 : 0); }
      if (p.tackle) {   // carga: estela de polvo y un fantasma detrás
        this.dust.setDepth(p.y * PX - 1); this.dust.emitParticleAt(p.x * PX, p.y * PX, 2);
        v.ghost.setVisible(true).setFrame(p.row * NF + FR[f]).setFlipX(flip).setPosition(-Math.cos(p.aim) * 10, -Math.sin(p.aim) * 6);
      } else v.ghost.setVisible(false);
      // Parada especial: escudo grande del elemento delante del portero mientras llega el tiro
      if (p.gkTech && p.gkTech !== 'none' && s.ball.shot && !s.ball.shot.resolved) {
        const e = this.fx[p.gkTech.elem] || this.fx.neutro; e.setDepth(p.y * PX + 2);
        for (let k = 0; k < 4; k++) { const a = time * 0.02 + k * 1.57; e.emitParticleAt(p.x * PX + Math.cos(a) * 34, p.y * PX - 22 + Math.sin(a) * 26, 1); }
      }
      v.spr.setTint(p.invuln > 0 && p.dash && !p.dash.tech.plain ? 0xfff2c0 : 0xffffff);
      v.fig.y = -p.z * PX;
      v.warn.setVisible(p.tkWind > 0);
      if (v.ctrl) v.marker.y = -56 - p.z * PX + Math.sin(time / 220) * 2;
      if (p.dash && !p.dash.tech.plain && Math.random() < 0.6) this.burst(p.dash.tech.elem, p.x * PX, p.y * PX - 14, 1, p.y * PX - 1);
    }

    const b = s.ball;
    this.ballShadow.setPosition(b.x * PX, b.y * PX + 1).setDepth(b.y * PX - 0.5).setScale(Math.max(0.4, 1 - b.z * 0.15));
    this.ballC.setPosition(b.x * PX, (b.y - b.z) * PX - 4).setDepth(b.y * PX + 0.6 + (b.z > 1.2 ? 2000 : 0));
    for (const [k, tr] of Object.entries(this.trails)) {
      const on = b.fire === k;
      tr.setDepth(this.ballC.depth - 0.3);
      if (on && !tr.emitting) tr.start();
      if (!on && tr.emitting) tr.stop();
    }

    if (s.tech) {
      const p = s.tech.p, k = s.tech.t / s.tech.dur, e = this.fx[s.tech.tech.elem] || this.fx.neutro;
      e.setDepth(p.y * PX + 1);
      const n = s.tech.tech.type === 'tiro' ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const a = time * 0.02 + i * 2.094;
        e.emitParticleAt(p.x * PX + Math.cos(a) * 20, p.y * PX - p.z * PX + Math.sin(a) * 9 - k * 34, 1);
      }
    }

    this.tfx.update(s, time, delta);
    const me = Logic.controlled(s), foc = this.tfx.focus(s, me), bl = s.ball;
    let tx = foc.x, ty = foc.y;
    if (foc.z === 1) {
      // Juego normal: la cámara mira a tu jugador pero se inclina hacia el balón; con el balón en el aire
      // (un pase) lo acompaña a él, así al cambiar de jugador no pega un salto
      const w = bl.owner ? (bl.owner === me ? 0 : 0.35) : 0.65;
      tx = (me.x + (bl.x - me.x) * w) * PX; ty = (me.y + (bl.y - me.y) * w) * PX;
      const bv = bl.owner ? me : bl;   // un poco de adelanto en la dirección de la jugada
      tx += Math.max(-40, Math.min(40, (bv.vx || 0) * 3)); ty += Math.max(-60, Math.min(60, (bv.vy || 0) * 4));
    }
    if (!this.camInit) { this.camT.x = tx; this.camT.y = ty; this.camV = { x: 0, y: 0 }; this.camInit = true; }
    // Muelle amortiguado: acelera y frena suave, sin tirones (con tope de velocidad)
    const dt = Math.min(0.05, delta / 1000), W = foc.z === 1 ? 4.2 : 6.5, V = this.camV;
    V.x += ((tx - this.camT.x) * W * W - V.x * 2 * W) * dt; V.y += ((ty - this.camT.y) * W * W - V.y * 2 * W) * dt;
    const vl = Math.hypot(V.x, V.y), VMAX = 1100;
    if (vl > VMAX) { V.x *= VMAX / vl; V.y *= VMAX / vl; }
    this.camT.x += V.x * dt; this.camT.y += V.y * dt;
    this.drawUI(s, me);
    this.handleEvents(s);
    UI.update(s);
  }

  drawUI(s, me) {
    const g = this.ui; g.clear();
    for (const sh of this.shield) {   // escudo del portero
      const r = 30 + Math.sin(sh.t / 60) * 3;
      g.fillStyle(sh.c, 0.28).fillEllipse(sh.x, sh.y, r * 2.2, r * 2.4);
      g.lineStyle(4, sh.c, 0.95).strokeEllipse(sh.x, sh.y, r * 2.2, r * 2.4);
      g.lineStyle(2, 0xffffff, 0.8).strokeEllipse(sh.x, sh.y, r * 1.6, r * 1.8);
    }
    this.shield.length = 0;
    const x = me.x * PX, y = me.y * PX;
    if (me.stamina < 0.99) {
      g.fillStyle(0x000000, 0.5).fillRect(x - 15, y + 26, 30, 4);
      g.fillStyle(me.tired ? 0xe04a3a : 0x7ee36a).fillRect(x - 15, y + 26, 30 * me.stamina, 4);
    }
    if (s.pass && s.pass.charge > 0.12) {   // fuerza del pase
      const c = s.pass.charge;
      g.fillStyle(0x000000, 0.55).fillRect(x - 18, y - 74, 36, 6);
      g.fillStyle(c > 0.85 ? 0xffffff : 0x6fe3ff).fillRect(x - 18, y - 74, 36 * c, 6);
    }
    for (const q of s.players) if (q.windup) {     // la IA cargando el tiro
      const qx = q.x * PX, qy = q.y * PX, c = q.windup.c;
      g.fillStyle(0x000000, 0.55).fillRect(qx - 18, qy - 74, 36, 6);
      g.fillStyle(c > 0.85 ? 0xff7a1a : 0xffd23a).fillRect(qx - 18, qy - 74, 36 * c, 6);
    }
    if (s.shoot.charging) {
      const c = s.shoot.charge;
      g.fillStyle(0x000000, 0.55).fillRect(x - 18, y - 74, 36, 6);
      g.fillStyle(c > 0.85 ? 0xff7a1a : 0xffd23a).fillRect(x - 18, y - 74, 36 * c, 6);
      const F = Logic.FIELD, half = F.goalW / 2 - 0.35;
      const tx = (F.w / 2 + Math.max(-1, Math.min(1, s.shoot.aimX)) * half) * PX;
      g.lineStyle(2, 0xffd23a, 1).strokeCircle(tx, -12, 7);
      g.lineBetween(tx - 10, -12, tx + 10, -12); g.lineBetween(tx, -22, tx, -2);
    }
  }

  // El mejor jugador de campo de cada equipo (suma de estadísticas): habla al marcar y brilla con el balón
  starOf(s, team) {
    s._stars = s._stars || {};
    if (s._stars[team] === undefined) {
      const sum = p => (p.kick || 0) + (p.control || 0) + (p.defense || 0) + (p.body || 0);
      const l = s.players.filter(p => p.team === team && p.role !== 'POR').sort((a, b) => sum(b) - sum(a));
      s._stars[team] = l[0] ? l[0].id : null;
    }
    return s.players.find(p => p.id === s._stars[team]);
  }
  // Aura: llamas del color del elemento mientras lanzas una técnica; brillo suave en la estrella que lleva el balón
  drawAura(s, time) {
    if (!this.auraG) { this.auraG = this.add.graphics(); this.starG = this.add.graphics(); }
    const g = this.auraG, h = this.starG; g.clear(); h.clear();
    const k = 0.5 + 0.5 * Math.sin(time / 90), t = s.tech && s.tech.p;
    if (t) {
      const el = (s.tech.tech && s.tech.tech.elem) || t.elem, col = EL(el).main, x = t.x * PX, y = t.y * PX;
      g.setDepth(y - 2);
      g.fillStyle(col, 0.14 + 0.1 * k).fillEllipse(x, y - 26, 70 + 12 * k, 112 + 14 * k);
      g.fillStyle(col, 0.2).fillEllipse(x, y - 26, 48 + 8 * k, 84 + 10 * k);
      g.lineStyle(2, 0xffffff, 0.55).strokeEllipse(x, y - 26, 58 + 10 * k, 98 + 12 * k);
      for (let i = 0; i < 5; i++) { const px = x + (i - 2) * 11, hh = 22 + 12 * Math.abs(Math.sin(time / 110 + i * 1.7)); g.lineStyle(3, col, 0.55).lineBetween(px, y + 6, px + Math.sin(time / 130 + i) * 3, y - hh - 24); }
      if (time - (this.auraT || 0) > 120) { this.auraT = time; this.burst(el, x, y - 24, 2, y + 4); }
    }
    const o = s.ball && s.ball.owner;
    if (o && !t) {
      const st = this.starOf(s, o.team);
      if (st && st.id === o.id) {
        const col = EL(o.elem).main, x = o.x * PX, y = o.y * PX; h.setDepth(y - 2);
        h.fillStyle(col, 0.1 + 0.06 * k).fillEllipse(x, y - 26, 56 + 6 * k, 96 + 8 * k);
        h.lineStyle(2, col, 0.4).strokeEllipse(x, y + 10, 44 + 6 * k, 18);
      }
    }
  }

  handleEvents(s) {
    for (const e of s.events) {
      this.tfx.event(e, s);
      switch (e.type) {
        case 'goal':
          Sound.sfx('goal'); Sound.jingle(e.team === 'A' ? 'goal' : null);
          UI.banner(e.team === 'A' ? TX('¡Gol!') : TX('Gol de ') + s.teams.B.name, e.team === 'A' ? '' : 'rival', 1800);
          this.cameras.main.shake(260, 0.006);
          { const who = this.starOf(s, e.team); if (who) UI.say(who.sprite, who.name, e.team === 'A' ? Dialog.goal() : Dialog.goalRival(), e.team, true, 2600); }
          break;
        case 'golden': UI.banner(TX('¡Gol de oro!'), 'gold', 1600); UI.toast(TX('El primero que marque, gana'), 2000); break;
        case 'mercy': UI.toast(e.team === 'A' ? TX('¡5 goles de diferencia! Partido ganado') : TX('5 goles de diferencia: se acabó el partido'), 2400); break;
        case 'save':
          Sound.sfx('save');
          { const k = s.players.find(q => q.team === e.team && q.role === 'POR'); if (k && Math.random() < 0.7) UI.say(k.sprite, k.name, e.team === 'A' ? Dialog.save() : Dialog.saveRival(), e.team); }
          if (e.elem) { this.cameras.main.shake(220, 0.008); UI.banner(TX('¡Parada!'), 'gold', 900); }
          UI.toast(e.team === 'A' ? TX('¡Paradón!') : TX('¡Para el portero rival!'));
          this.fxRing(e.x * PX, e.y * PX, e.elem ? EL(e.elem).main : 0xffffff, e.big ? 3.4 : 2, e.y * PX + 5);
          if (e.elem) this.burst(e.elem, e.x * PX, e.y * PX - 10, 26, e.y * PX + 6);
          break;
        case 'catch': UI.toast(e.team === 'A' ? TX('Tu portero la atrapa') : TX('El portero rival la atrapa')); break;
        case 'beaten': UI.toast(TX('¡La técnica supera al portero!')); break;
        case 'setpiece': {
          Sound.sfx('whistle');
          const who = e.team === 'A' ? TX('para ti') : 'para ' + s.teams.B.name;
          const T = { banda: TX('Saque de banda'), puerta: TX('Saque de puerta'), corner: TX('Córner'), offside: TX('¡Fuera de juego!') }[e.kind];
          if (e.kind === 'offside' || e.kind === 'corner') UI.banner(T, e.kind === 'offside' ? 'flag' : 'gold', 1100);
          UI.toast(T + ' ' + who, 1400);
          break;
        }
        case 'tackle':
          Sound.sfx(e.ok ? 'tackle' : 'whiff');
          if (e.ok) { this.dust.setDepth(e.y * PX + 5); this.dust.explode(14, e.x * PX, e.y * PX); if (e.team === 'A') UI.toast(TX('¡Entrada!')); }
          break;
        case 'shot': Sound.sfx('kick'); break;
        case 'dribble': Sound.sfx('whiff'); this.dust.setDepth(e.y * PX - 1); this.dust.explode(6, e.x * PX, e.y * PX); break;
        case 'pass': Sound.sfx('pass'); break;
        case 'switch': if (!e.auto) Sound.sfx('click'); break;
        case 'kickoff': Sound.sfx('whistle'); break;
        case 'techStart': {
          Sound.sfx('tech');
          if (e.kind === 'parada') {
            const c = Phaser.Display.Color.IntegerToRGB(EL(e.elem).main);
            this.cameras.main.flash(180, c.r, c.g, c.b);
          }
          const p = s.players.find(q => q.id === e.id);
          if (p) { this.fxRing(p.x * PX, p.y * PX, EL(e.elem).main, 2.4, p.y * PX + 5, 3); this.burst(e.elem, p.x * PX, p.y * PX - 16, 16, p.y * PX + 2); }
          break;
        }
        case 'techKick':
          this.fxRing(e.x * PX, e.y * PX, EL(e.elem).main, 3.2, e.y * PX + 5);
          this.burst(e.elem, e.x * PX, e.y * PX - 20, 30, e.y * PX + 6);
          this.cameras.main.shake(180, e.elem === 'montaña' ? 0.009 : 0.005);
          break;
        case 'techBurst': this.burst(e.elem, e.x * PX, e.y * PX - 14, 22, e.y * PX + 2); break;
        case 'knock': this.burst(e.elem, e.x * PX, e.y * PX - 14, 8, e.y * PX + 2); break;
        case 'blockOk':
          this.fxRing(e.x * PX, e.y * PX, EL(e.elem).main, 2.6, e.y * PX + 5);
          this.burst(e.elem, e.x * PX, e.y * PX - 14, 24, e.y * PX + 3);
          if (e.team === 'A') UI.toast(TX('¡Bloqueo!'));
          break;
        case 'dodgeFail': UI.toast(TX('¡') + e.name + TX(' lee el regate!')); break;
        case 'msg': UI.toast(e.text); break;
        case 'end': Sound.sfx('whistleEnd'); App.matchEnded(s); break;
      }
    }
    s.events.length = 0;
  }
}

/* =====================================================================
   SUPERTÉCNICAS: animaciones propias (dibujadas con código, inspiradas
   en las del juego), presentación con retrato, zoom y cámara lenta.
   ===================================================================== */

// Familia visual de cada técnica según su nombre
const FAM_RULES = {
  tiro: [
    ['pinguino', /ping[üu]ino/i],
    ['dragon', /drag|guiverno|serpiente/i],
    ['ave', /f[ée]nix|c[óo]ndor|halc[óo]n|[áa]guila|p[áa]jaro|pegaso|mariposa|lobo/i],
    ['tornado', /tornado|torbellino|ventisca|remolino|espiral|giratorio|cicl[óo]n|tsunami|yoy|pirueta|rodante/i],
    ['rayo', /rel[áa]mpago|rayo|trueno|chispa|lanza|flecha|divin|sagrad|cegador|arco iris|luminoso|sabidur/i],
    ['meteoro', /meteor|cometa|astro|c[óo]smico|gal[áa]ctic|supernova|gan[íi]medes|at[óo]mica|tierra|gaia|iceberg|congelante|llamarada|fango|granada/i],
    ['multi', /m[úu]ltiple|doble|triple|trillizo|gemelo|dual|combinado|cruzado|tri[áa]ngulo|empuje|toques|en v/i],
    ['beam', /./],
  ],
  parada: [
    ['puno', /pu[ñn]o|despeje|cabezoner/i],
    ['mano', /mano|garra|u[ñn]as|colmillo/i],
    ['muro', /muralla|muro|bloque|escudo|defensa|cortina|campo|parada m|cuchilla/i],
    ['vortex', /./],
  ],
  regate: [
    ['ilusion', /espejismo|ilusi|fantasma|magia|truco|teleport|confusi|niebla|maldici|m[úu]ltiple|descodific|esc[áa]ner|tuya|prima/i],
    ['veloz', /./],
  ],
  bloqueo: [
    ['tierra', /muro|torre|terremoto|sismo|pisot|graved|gravit|apisonad|aplanad|presa|escudo|ballena|planeta|sumo|embestida|zona|vendimia|sabio|trama|emboscada|cinto|tren|d[úu]o|magma|robo/i],
    ['corte', /./],
  ],
};
// Técnicas famosas con animación propia (van antes que las familias)
const SIG_RULES = {
  tiro: [
    ['fantasma', /fantasma/i],
    ['cohete', /misil|cohete/i],
    ['explosivo', /dinamita|granada|bomba acrob/i],
    ['bate', /bateo|golf/i],
    ['kungfu', /kung-?fu/i],
    ['psiquico', /psico/i],
    ['tarzan', /tarz[áa]n/i],
    ['rosas', /rosas/i],
    ['mariposas', /mariposa/i],
    ['tormentaF', /tormenta de fuego|llamarada/i],
    ['torre', /torre de osaka|torre/i],
    ['rebotes', /rebote/i],
    ['fango', /fango/i],
    ['lobo', /aullido de lobo|leyenda del lobo/i],
    ['divino', /sabidur[íi]a divina|disparo sagrado|flecha divina|rapto divino/i],
    ['fenix', /f[ée]nix|p[áa]jaro de fuego/i],
    ['pegaso', /pegaso/i],
    ['triangulo', /tri[áa]ngulo/i],
    ['globo', /^la tierra$|remate de gaia/i],
    ['ventisca', /ventisca eterna|ventisca guiverno|bal[óo]n iceberg|chut congelante/i],
    ['cruzado', /fuego cruzado|ventisca de fuego/i],
    ['lluvia', /meteorit|meteoro/i],
    ['galaxia', /gal[áa]ctic|supernova|c[óo]smico|gan[íi]medes/i],
    ['tsunami', /tsunami/i],
    ['tornadoF', /^tornado de fuego$|torbellino de fuego|tornado inverso|tornado doble/i],
    ['relampago', /rel[áa]mpago|trampol[íi]n/i],
  ],
  parada: [
    ['llamas', /lanzallamas|combusti/i],
    ['petalos', /p[ée]talos|hojarasca/i],
    ['cisne', /cisne/i],
    ['constelacion', /constelaci|estelar/i],
    ['taladro', /taladr/i],
    ['cohetep', /cohete/i],
    ['punos', /pu[ñn]os voladores/i],
    ['hielop', /bloque de hielo/i],
    ['trimano', /trimano/i],
    ['manoceleste', /mano celestial/i],
    ['manomagica', /mano m[áa]gica/i],
    ['manosinf', /manos infinitas/i],
    ['muralla', /muralla|muro dimensional/i],
    ['agujero', /agujero/i],
  ],
  regate: [
    ['hora', /hora celestial/i],
    ['espejismo', /espejismo/i],
    ['lluviaR', /meteor/i],
    ['flama', /flam[íi]g|infernal|[íi]gnea|llamas/i],
    ['remolino', /torbellino|tornado|remolino|hurac[áa]n|tormenta|cicl[óo]n/i],
    ['chispa', /chispeante|rel[áa]mpago|acelerrel/i],
    ['armadillo', /armadillo/i],
    ['chicle', /chicle|pompa/i],
    ['luna', /luna/i],
    ['aurora', /aurora|cruz del sur/i],
    ['paipay', /paipay|abanico/i],
    ['geiser', /g[ée]iser/i],
    ['topo', /topo/i],
    ['triple', /3 piernas|triple/i],
  ],
  bloqueo: [
    ['telarana', /telara/i],
    ['ballena', /ballena/i],
    ['tren', /tren/i],
    ['sumo', /sumo|apisonad|aplanad/i],
    ['fuegoB', /llamas|volc[áa]n|cortafuegos|bombazo/i],
    ['fotones', /fot[óo]n/i],
    ['torbellinoB', /cicl[óo]n|torbellino|bobina|peonza|giratorio/i],
    ['niebla', /olor|embriag|niebla/i],
    ['doppel', /doppel|sombr/i],
    ['murobloq', /^el muro$|torre/i],
    ['terremoto', /terremoto|sismo/i],
    ['gravedad', /graved|gravit/i],
    ['hielo', /helado|rompehielos/i],
  ],
};
const famOf = t => {
  for (const [f, re] of SIG_RULES[t.type] || []) if (re.test(t.name)) return f;
  for (const [f, re] of FAM_RULES[t.type] || []) if (re.test(t.name)) return f;
  return 'beam';
};
// Paletas fijas para técnicas con color propio
const PAL = {
  oro: { main: 0xffd23a, tints: [0xffffff, 0xfff1a0, 0xffd23a, 0xb07a10] },
  luz: { main: 0xfff0a0, tints: [0xffffff, 0xfff8e0, 0xffe080, 0xc8a040] },
  mal: { main: 0xa040ff, tints: [0xf0d0ff, 0xc080ff, 0x8020e0, 0x300060] },
  hielo: { main: 0x8fe9ff, tints: [0xffffff, 0xd8f6ff, 0x8fe9ff, 0x2f7ab0] },
};
const TYPE_TXT = { tiro: TX('Supertécnica de tiro'), parada: TX('Supertécnica de portero'), regate: TX('Supertécnica de regate'), bloqueo: TX('Supertécnica de bloqueo') };

class TechFX {
  constructor(scene) {
    this.sc = scene;
    this.gN = scene.add.graphics().setDepth(4600);                                   // formas sólidas
    this.gA = scene.add.graphics().setDepth(4610).setBlendMode(Phaser.BlendModes.ADD); // brillos
    this.gL = scene.add.graphics().setDepth(3950).setScrollFactor(0);                // líneas de velocidad
    this.dim = scene.add.rectangle(0, 0, 4000, 4000, 0x000010, 0).setOrigin(0).setScrollFactor(0).setDepth(-400);
    this.trail = []; this.flight = null; this.impacts = []; this.clones = []; this.cine = false; this.zoom = 1;
    this.bolts = 0;
  }
  reset() {   // tras cambiar la hoja de jugadores (nuevo partido)
    this.clones.forEach(c => c.destroy());
    this.clones = [];
    for (let i = 0; i < 6; i++) this.clones.push(this.sc.add.sprite(0, 0, 'match', 0).setOrigin(24 / 48, 43 / 48).setScale(1.4).setVisible(false));
    this.trail = []; this.flight = null; this.impacts = []; this.zoom = 1; this.setCine(false);
  }
  setCine(on) {
    if (on === this.cine) return;
    this.cine = on;
    document.getElementById('shell').classList.toggle('cine', on);
  }

  /* ---------- Eventos de la lógica ---------- */
  event(e, s) {
    const P = id => s.players.find(q => q.id === id);
    switch (e.type) {
      case 'techStart': {
        const p = P(e.id), t = p && p.techs.find(x => x.name === e.name);
        UI.cutin(e.name, e.elem, e.team, e.kind, p && p.sprite, e.kind === 'tiro' || e.kind === 'parada' ? 1250 : 800);
        if (p) UI.say(p.sprite, p.name, Dialog.shout(e.elem, e.kind), e.team, false, 1500);
        if (t && (e.kind === 'tiro' || e.kind === 'parada')) { this.zoomBack = false; this.sc.cameras.main.zoomTo(1.3, 220, 'Sine.easeOut', true); }
        break;
      }
      case 'techKick': {
        const t = { type: 'tiro', name: e.name };
        this.flight = { fam: famOf(t), elem: e.elem, t: 0 };
        this.trail = [];
        const c = Phaser.Display.Color.IntegerToRGB(EL(e.elem).main);
        this.sc.cameras.main.flash(140, c.r, c.g, c.b);
        this.impacts.push({ kind: 'kickwave', x: e.x * PX, y: e.y * PX, elem: e.elem, t: 0, life: 0.5 });
        break;
      }
      case 'save':
        if (e.elem) {
          const g = s.players.find(q => q.role === 'POR' && q.team === e.team);
          this.impacts.push({ kind: 'slam', fam: famOf({ type: 'parada', name: e.name || '' }), x: g.x * PX, y: g.y * PX - 22, elem: e.elem, team: e.team, t: 0, life: 0.7 });
        }
        this.flight = null;
        break;
      case 'beaten':
        this.impacts.push({ kind: 'shatter', x: e.x * PX, y: e.y * PX - 22, elem: e.elem || 'neutro', t: 0, life: 0.6 });
        break;
      case 'goal':
        if (e.tech) this.impacts.push({ kind: 'boom', x: e.x * PX, y: e.y * PX, elem: e.tech, t: 0, life: 0.9 });
        this.flight = null;
        break;
      case 'blockOk': {
        const fam = famOf({ type: 'bloqueo', name: e.name || '' });
        const kind = { tierra: 'rocks', hielo: 'icerocks', murobloq: 'wall', terremoto: 'quake', gravedad: 'gravity', telarana: 'web', ballena: 'whale', tren: 'train',
          sumo: 'stomp', fuegoB: 'firewall', fotones: 'flashb', torbellinoB: 'whirl', niebla: 'mist', doppel: 'doppel' }[fam] || 'slash';
        this.impacts.push({ kind, x: e.x * PX, y: e.y * PX, elem: e.elem, t: 0, life: kind === 'slash' ? 0.7 : kind === 'train' || kind === 'whale' ? 1.1 : 0.9 });
        if (['rocks', 'icerocks', 'wall', 'quake', 'gravity', 'whale', 'train', 'stomp'].includes(kind)) this.sc.cameras.main.shake(220, kind === 'quake' || kind === 'stomp' || kind === 'train' ? 0.012 : 0.007);
        if (kind === 'flashb') this.sc.cameras.main.flash(160, 255, 255, 230);
        break;
      }
      case 'knock': this.impacts.push({ kind: 'puff', x: e.x * PX, y: e.y * PX, elem: e.elem, t: 0, life: 0.45 }); break;
      case 'dodgeFail': this.impacts.push({ kind: 'puff', x: e.x * PX, y: e.y * PX, elem: 'neutro', t: 0, life: 0.45 }); break;
    }
  }

  /* ---------- Hacia dónde mira la cámara ---------- */
  focus(s, me) {
    const b = s.ball, sh = b.shot;
    if (s.tech) return { x: s.tech.p.x * PX, y: s.tech.p.y * PX, z: s.tech.tech.type === 'tiro' ? 1.3 : 1.15 };
    if (sh && sh.tech && !sh.resolved) return { x: b.x * PX, y: b.y * PX, z: 1.18 };
    const gk = s.players.find(q => q.gkTech && q.gkTech !== 'none' && sh && !sh.resolved);
    if (gk) return { x: (gk.x + b.x) / 2 * PX, y: (gk.y + b.y) / 2 * PX, z: 1.2 };
    return { x: me.x * PX, y: me.y * PX, z: 1 };
  }

  /* ---------- Dibujo de cada fotograma ---------- */
  update(s, time, delta) {
    const dt = delta / 1000, gN = this.gN, gA = this.gA;
    gN.clear(); gA.clear(); this.gL.clear();
    this.clones.forEach(c => c.setVisible(false));
    let ci = 0;
    const clone = (v, x, y, alpha, tint) => {
      const c = this.clones[ci++]; if (!c || !v) return;
      c.setVisible(true).setFrame(v.spr.frame.name).setFlipX(v.spr.flipX).setPosition(x, y).setAlpha(alpha).setTint(tint).setDepth(y - 1);
    };
    const b = s.ball, bx = b.x * PX, by = (b.y - b.z) * PX - 4;
    const sh = b.shot, flying = sh && sh.tech && !sh.resolved;
    const gkOn = s.players.some(q => q.gkTech && q.gkTech !== 'none' && sh && !sh.resolved);
    const cine = !!(s.tech && s.tech.tech.type === 'tiro') || flying || gkOn;
    this.setCine(cine);
    this.dim.fillAlpha += ((s.tech ? 0.5 : cine ? 0.3 : 0) - this.dim.fillAlpha) * Math.min(1, dt * 10);
    if (cine) this.speedLines(time);
    if (!s.tech && !flying && !gkOn && this.sc.cameras.main.zoom > 1.01 && !this.zoomBack) {
      this.zoomBack = true; this.sc.cameras.main.zoomTo(1, 300, 'Sine.easeInOut', true, (c, p) => { if (p >= 1) this.zoomBack = false; });
    }

    // 1) Carga de la técnica (antes del disparo / regate / bloqueo)
    if (s.tech) {
      const T = s.tech, p = T.p, k = Math.min(1, T.t / T.dur), fam = famOf(T.tech), E = EL(T.tech.elem);
      const px = p.x * PX, py = p.y * PX - p.z * PX, v = this.sc.views.get(p.id);
      if (T.tech.type === 'tiro') this.windup(fam, E, px, py, k, time, v, clone);
      else this.gather(E, px, py - 18, k, time);
    }

    // 2) Balón en vuelo con una técnica de tiro
    if (b.fire && this.flight) {
      this.flight.t += dt;
      this.trail.unshift({ x: bx, y: by });
      if (this.trail.length > 26) this.trail.length = 26;
      this.flightFX(this.flight.fam, EL(this.flight.elem), bx, by, time);
    } else if (!b.fire) { this.flight = null; this.trail.length = 0; }

    // 3) Porteros con su técnica activa
    for (const g of s.players) {
      if (!(g.gkTech && g.gkTech !== 'none' && sh && !sh.resolved)) continue;
      const age = Math.min(1, (g.gkAge = (g.gkAge || 0) + dt) / 0.3);
      this.parada(famOf(g.gkTech), EL(g.gkTech.elem), g.x * PX, g.y * PX - 22, age, time, g.team, 0);
    }
    for (const g of s.players) if (!g.gkTech || g.gkTech === 'none') g.gkAge = 0;

    // 4) Regates y bloqueos en marcha
    for (const p of s.players) {
      const v = this.sc.views.get(p.id); if (!v) continue;
      v.hist = v.hist || [];
      v.hist.unshift({ x: p.x * PX, y: p.y * PX - p.z * PX });
      if (v.hist.length > 14) v.hist.length = 14;
      if (v.spr && v.spr.alpha < 1 && !(p.dash && /armadillo|topo/.test(famOf(p.dash.tech)))) v.spr.setAlpha(1);   // vuelve a verse tras rodar o excavar
      if (!p.dash) continue;
      if (p.dash.tech.plain) {   // regate normal: solo una estela suave
        [3, 6].forEach((j, i) => { const h = v.hist[j]; if (h) clone(v, h.x, h.y, 0.28 - i * 0.1, 0xffffff); });
        continue;
      }
      const E = EL(p.dash.tech.elem), fam = famOf(p.dash.tech), px = p.x * PX, py = p.y * PX;
      if (this.dashSig(fam, E, p, v, px, py, time, clone)) continue;
      if (fam === 'hora') {
        this.dim.fillAlpha = Math.max(this.dim.fillAlpha, 0.55);
        this.clock(gA, px, py - 22, 34, time, E);
        [4, 8].forEach((j, i) => { const h = v.hist[j]; if (h) clone(v, h.x, h.y, 0.4 - i * 0.15, 0xfff6c0); });
      } else if (fam === 'espejismo') {
        for (let i = 0; i < 3; i++) { const a = time / 90 + i * 2.09; gN.fillStyle(0xffffff, 0.75).fillCircle(px + Math.cos(a) * 22, py - 6 + Math.sin(a) * 8, 5); gN.lineStyle(1.5, 0x222222, 0.8).strokeCircle(px + Math.cos(a) * 22, py - 6 + Math.sin(a) * 8, 5); }
        [4, 8, 12].forEach((j, i) => { const h = v.hist[j]; if (h) clone(v, h.x + Math.sin(time / 40 + i) * 8, h.y, 0.45 - i * 0.1, E.tints[1]); });
      } else if (fam === 'ilusion') {
        [4, 8, 12].forEach((j, i) => { const h = v.hist[j]; if (h) clone(v, h.x + Math.sin(time / 40 + i) * 6, h.y, 0.45 - i * 0.1, E.tints[1]); });
        gA.fillStyle(E.main, 0.25).fillCircle(px, py - 18, 20 + Math.sin(time / 50) * 3);
      } else if (fam === 'veloz') {
        [3, 6].forEach((j, i) => { const h = v.hist[j]; if (h) clone(v, h.x, h.y, 0.35 - i * 0.12, E.main); });
        const a = p.dash.dir;
        for (let i = 0; i < 7; i++) {
          const o = (i - 3) * 5, L = 30 + (i % 3) * 14;
          const x0 = px - Math.cos(a) * 14 - Math.sin(a) * o, y0 = py - 18 - Math.sin(a) * 14 + Math.cos(a) * o;
          gA.lineStyle(2, E.tints[0], 0.7).lineBetween(x0, y0, x0 - Math.cos(a) * L, y0 - Math.sin(a) * L);
        }
      } else if (fam === 'tierra') {
        gN.fillStyle(E.tints[3] || E.main, 0.9);
        for (let i = 0; i < 4; i++) { const h = v.hist[i * 3]; if (h) this.spike(gN, h.x + (i % 2 ? 8 : -8), h.y + 2, 12 + i * 2, E); }
      } else {   // corte
        const a = p.dash.dir;
        gA.lineStyle(4, E.tints[0], 0.9).beginPath();
        gA.arc(px + Math.cos(a) * 16, py - 18 + Math.sin(a) * 16, 22, a - 1.2 + time / 60 % 1, a + 1.2 + time / 60 % 1, false).strokePath();
      }
    }

    // 5) Impactos con duración
    this.impacts = this.impacts.filter(m => (m.t += dt) < m.life);
    for (const m of this.impacts) this.impact(m, time);
  }

  /* ---------- Piezas de dibujo ---------- */
  speedLines(time) {
    const cam = this.sc.cameras.main, w = cam.width, h = cam.height, g = this.gL, cxs = w / 2, cys = h / 2;
    g.lineStyle(2, 0xffffff, 0.22);
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + Math.sin(time / 90 + i) * 0.05, r0 = Math.max(w, h) * (0.42 + ((time / 7 + i * 37) % 50) / 400);
      g.lineBetween(cxs + Math.cos(a) * r0, cys + Math.sin(a) * r0, cxs + Math.cos(a) * r0 * 1.6, cys + Math.sin(a) * r0 * 1.6);
    }
  }
  gather(E, x, y, k, time) {   // energía que se concentra en el jugador
    for (let i = 0; i < 3; i++) {
      const r = 50 * (1 - ((k * 1.6 + i / 3) % 1));
      this.gA.lineStyle(3, E.tints[i % E.tints.length], 0.8).strokeCircle(x, y, Math.max(2, r));
    }
    this.gA.fillStyle(E.main, 0.35 + 0.2 * Math.sin(time / 40)).fillCircle(x, y, 14 + k * 8);
  }
  spike(g, x, y, h, E) {
    const w = 6 + h * 0.18;
    g.fillStyle(E.tints[E.tints.length - 1], 1).fillTriangle(x - w, y, x + w, y, x, y - h);
    g.fillStyle(E.tints[1], 1).fillTriangle(x - w * 0.25, y, x + w, y, x, y - h);
  }
  // Ala de plumas en abanico (tres capas de color, de oscuro a claro)
  wing(g, x0, y, side, span, flap, E) {
    const x = x0 + side * 9;
    const layers = [[E.tints[E.tints.length - 1], 1], [E.main, 0.8], [E.tints[1], 0.58]], edge = E.tints[E.tints.length - 1];
    for (const [col, L] of layers) {
      for (let i = 0; i < 7; i++) {
        const t = i / 6, a = -1.25 + t * 1.4, len = span * L * (0.5 + 0.5 * (1 - t));
        const tip = { x: x + side * Math.cos(a) * len, y: y + Math.sin(a) * len * flap };
        const r1 = { x: x + side * Math.cos(a - 0.38) * len * 0.32, y: y + Math.sin(a - 0.38) * len * 0.32 * flap };
        const r2 = { x: x + side * Math.cos(a + 0.38) * len * 0.32, y: y + Math.sin(a + 0.38) * len * 0.32 * flap + 4 };
        g.fillStyle(col, 1).fillTriangle(x, y + 2, r1.x, r1.y, r2.x, r2.y);
        g.fillStyle(col, 1).fillTriangle(r1.x, r1.y, r2.x, r2.y, tip.x, tip.y);
        g.lineStyle(1.5, edge, 0.9).strokeTriangle(r1.x, r1.y, r2.x, r2.y, tip.x, tip.y);
      }
    }
  }
  hand(g, x, y, s, E, fist) {
    const col = E.tints[1], dark = E.tints[E.tints.length - 1];
    if (fist) {
      g.fillStyle(col, 0.95).fillRoundedRect(x - 22 * s, y - 20 * s, 44 * s, 40 * s, 10 * s);
      g.lineStyle(3, dark, 1).strokeRoundedRect(x - 22 * s, y - 20 * s, 44 * s, 40 * s, 10 * s);
      for (let i = 1; i < 4; i++) g.lineBetween(x - 22 * s + i * 11 * s, y - 20 * s, x - 22 * s + i * 11 * s, y - 6 * s);
      g.lineBetween(x - 22 * s, y - 6 * s, x + 22 * s, y - 6 * s);
      return;
    }
    g.fillStyle(col, 0.95).fillEllipse(x, y + 8 * s, 46 * s, 42 * s);
    [-15, -5, 5, 15].forEach((fx, i) => {
      const h = [26, 32, 30, 24][i] * s;
      g.fillRoundedRect(x + fx * s - 5 * s, y - h, 10 * s, h + 6 * s, 5 * s);
      g.lineStyle(2, dark, 1).strokeRoundedRect(x + fx * s - 5 * s, y - h, 10 * s, h + 6 * s, 5 * s);
    });
    g.fillStyle(col, 0.95).fillEllipse(x - 26 * s, y + 10 * s, 14 * s, 26 * s);
    g.lineStyle(3, dark, 1).strokeEllipse(x, y + 8 * s, 46 * s, 42 * s);
    g.lineStyle(2, dark, 0.6).strokeCircle(x, y + 10 * s, 8 * s);
  }
  penguin(g, x, y, s) {
    g.fillStyle(0x1a1a2a, 1).fillEllipse(x, y, 14 * s, 20 * s);
    g.fillStyle(0xffffff, 1).fillEllipse(x, y + 2 * s, 8 * s, 13 * s);
    g.fillStyle(0xffa020, 1).fillTriangle(x - 2 * s, y - 6 * s, x + 2 * s, y - 6 * s, x, y - 3 * s);
    g.fillStyle(0xffffff, 1).fillCircle(x - 2.5 * s, y - 8 * s, 1.4 * s).fillCircle(x + 2.5 * s, y - 8 * s, 1.4 * s);
  }
  bolt(g, x0, y0, x1, y1, color, w) {
    const pts = [{ x: x0, y: y0 }], n = 7;
    for (let i = 1; i < n; i++) pts.push({ x: x0 + (x1 - x0) * i / n + (Math.random() - 0.5) * 26, y: y0 + (y1 - y0) * i / n });
    pts.push({ x: x1, y: y1 });
    g.lineStyle(w * 3, color, 0.25).strokePoints(pts); g.lineStyle(w, 0xffffff, 0.95).strokePoints(pts);
  }

  // Carga de un tiro: cada familia tiene su animación
  windup(fam, E, x, y, k, time, v, clone) {
    if (this.sigWindup(fam, E, x, y, k, time, v, clone)) return;
    const gN = this.gN, gA = this.gA, c0 = E.tints[0], c1 = E.tints[1], c2 = E.main, c3 = E.tints[E.tints.length - 1];
    gA.fillStyle(c2, 0.22).fillCircle(x, y - 18, 34 + k * 14);
    if (fam === 'tornado') {
      for (let i = 0; i < 9; i++) {
        const yy = y - i * 9 * (0.4 + k), r = 10 + i * 4 * (0.5 + k * 0.6), ph = time * 0.025 + i * 0.7;
        gA.lineStyle(3, i % 2 ? c1 : c2, 0.85).strokeEllipse(x + Math.sin(ph) * 4, yy, r * 2, r * 0.55);
      }
    } else if (fam === 'dragon') {
      const n = 16;
      for (let i = n - 1; i >= 0; i--) {
        const a = time * 0.007 + i * 0.42, rr = 38 + k * 10;
        const sx = x + Math.cos(a) * rr, sy = y - 24 - i * 2 * k + Math.sin(a) * rr * 0.45, r = 13 - i * 0.55;
        gN.fillStyle(i === 0 ? c1 : c2, 1).fillCircle(sx, sy, r); gN.lineStyle(2, c3, 1).strokeCircle(sx, sy, r);
        if (i === 0) { gN.fillStyle(0xffffff, 1).fillCircle(sx - 3, sy - 3, 2).fillCircle(sx + 3, sy - 3, 2); gN.fillStyle(c3, 1).fillTriangle(sx - 6, sy - 6, sx - 9, sy - 16, sx - 2, sy - 8).fillTriangle(sx + 6, sy - 6, sx + 9, sy - 16, sx + 2, sy - 8); }
      }
    } else if (fam === 'ave') {
      const flap = 0.75 + 0.25 * Math.sin(time / 70), span = 34 + k * 36;
      this.wing(gN, x, y - 34, -1, span, flap, E); this.wing(gN, x, y - 34, 1, span, flap, E);
      gA.fillStyle(c0, 0.5).fillCircle(x, y - 34, 12);
    } else if (fam === 'pinguino') {
      [-30, 0, 30].forEach((ox, i) => this.penguin(gN, x + ox, y + 16 - k * 26 - (i === 1 ? 8 : 0), 1.4));
      gA.lineStyle(3, c1, 0.7).strokeEllipse(x, y + 10, 90, 26);
    } else if (fam === 'rayo') {
      if ((this.bolts = (this.bolts + 1) % 3) === 0 || Math.random() < 0.5) this.bolt(gA, x + (Math.random() - 0.5) * 60, y - 320, x, y - 26, c1, 3);
      gA.fillStyle(c0, 0.5).fillCircle(x, y - 26, 10 + Math.random() * 6);
    } else if (fam === 'meteoro') {
      const oy = y - 50 - k * 70, r = 10 + k * 18;
      gA.fillStyle(c2, 0.4).fillCircle(x, oy, r * 1.8); gA.fillStyle(c1, 0.8).fillCircle(x, oy, r); gA.fillStyle(0xffffff, 0.9).fillCircle(x, oy, r * 0.45);
      gA.lineStyle(2, c0, 0.8).strokeCircle(x, oy, r * 2.4 + Math.sin(time / 60) * 4);
    } else if (fam === 'multi') {
      if (v) { clone(v, x - 26, y + 6, 0.5, c1); clone(v, x + 26, y + 6, 0.5, c1); }
      gA.lineStyle(3, c1, 0.8).strokeTriangle(x, y - 70, x - 40, y + 10, x + 40, y + 10);
    } else {   // beam: energía que se concentra
      this.gather(E, x, y - 18, k, time);
    }
  }

  // Balón en vuelo con su técnica
  flightFX(fam, E, bx, by, time) {
    if (this.sigFlight(fam, E, bx, by, time)) return;
    const gN = this.gN, gA = this.gA, T = this.trail, n = T.length, c0 = E.tints[0], c1 = E.tints[1], c2 = E.main, c3 = E.tints[E.tints.length - 1];
    gA.fillStyle(c2, 0.35).fillCircle(bx, by, 16); gA.fillStyle(c0, 0.6).fillCircle(bx, by, 8);
    if (fam === 'dragon') {
      const wave = j => Math.sin(j * 0.55 - time / 70) * 9;
      for (let j = n - 1; j >= 1; j -= 1) {
        const p = T[j], r = 4 + 11 * (1 - j / n), wy = p.y + wave(j);
        if (j % 3 === 0) gN.fillStyle(c3, 1).fillTriangle(p.x - r * 0.5, wy - r * 0.6, p.x + r * 0.5, wy - r * 0.6, p.x, wy - r * 1.7);
        gN.fillStyle(j % 2 ? c2 : c1, 1).fillCircle(p.x, wy, r);
        gN.lineStyle(2, c3, 0.9).strokeCircle(p.x, wy, r);
      }
      const q = T[Math.min(3, n - 1)] || { x: bx, y: by + 1 }, a = Math.atan2(by - q.y, bx - q.x), ca = Math.cos(a), sa = Math.sin(a);
      const at = (f, s) => ({ x: bx + ca * f - sa * s, y: by + sa * f + ca * s });   // f: hacia delante, s: de lado
      const sn = at(16, 0), j1 = at(26, 7), j2 = at(8, 10), e1 = at(2, -8), e2 = at(2, 8), h1 = at(-10, -10), h2 = at(-10, 10), t1 = at(-24, -20), t2 = at(-24, 20);
      gN.fillStyle(c3, 1).fillTriangle(h1.x, h1.y, at(-4, -6).x, at(-4, -6).y, t1.x, t1.y).fillTriangle(h2.x, h2.y, at(-4, 6).x, at(-4, 6).y, t2.x, t2.y);
      gN.fillStyle(c1, 1).fillCircle(bx, by, 18).fillEllipse(sn.x, sn.y, 26, 24);
      gN.fillStyle(c3, 1).fillTriangle(at(10, 2).x, at(10, 2).y, j1.x, j1.y, j2.x, j2.y);
      gN.lineStyle(2, c3, 1).strokeCircle(bx, by, 18);
      gN.fillStyle(0xffffff, 1).fillCircle(e1.x, e1.y, 3.5).fillCircle(e2.x, e2.y, 3.5);
      gN.fillStyle(0x200000, 1).fillCircle(e1.x + ca, e1.y + sa, 1.6).fillCircle(e2.x + ca, e2.y + sa, 1.6);
    } else if (fam === 'tornado') {
      for (let j = 0; j < n; j++) {
        const p = T[j], a = j * 0.9 + time * 0.03, r = 4 + 12 * (1 - j / n);
        gA.fillStyle(j % 2 ? c1 : c2, 0.8).fillCircle(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r * 0.5, 3.5);
        gA.fillStyle(c0, 0.6).fillCircle(p.x - Math.cos(a) * r, p.y - Math.sin(a) * r * 0.5, 2.5);
      }
    } else if (fam === 'ave') {
      const flap = 0.7 + 0.3 * Math.sin(time / 55);
      this.wing(gN, bx, by, -1, 46, flap, E); this.wing(gN, bx, by, 1, 46, flap, E);
      for (let j = 2; j < n; j += 3) gA.fillStyle(c2, 0.5 * (1 - j / n)).fillTriangle(T[j].x - 6, T[j].y, T[j].x + 6, T[j].y, T[j].x, T[j].y + 14);
    } else if (fam === 'pinguino') {
      [5, 10, 15, 20].forEach((j, i) => { const p = T[j]; if (p) this.penguin(gN, p.x + (i % 2 ? 10 : -10), p.y + Math.sin(time / 70 + i) * 4, 1.3); });
      gA.lineStyle(3, c1, 0.6); for (let j = 1; j < n; j++) gA.lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y);
    } else if (fam === 'rayo') {
      if (n > 4) { const pts = T.filter((_, j) => j % 3 === 0).map(p => ({ x: p.x + (Math.random() - 0.5) * 12, y: p.y + (Math.random() - 0.5) * 12 })); gA.lineStyle(8, c2, 0.3).strokePoints(pts); gA.lineStyle(3, 0xffffff, 1).strokePoints(pts); }
      if (Math.random() < 0.4) this.bolt(gA, bx, by, bx + (Math.random() - 0.5) * 60, by + (Math.random() - 0.5) * 60, c1, 2);
    } else if (fam === 'meteoro') {
      for (let j = n - 1; j >= 0; j--) { const p = T[j], r = 4 + 16 * (1 - j / n); gA.fillStyle(j < 4 ? c0 : c2, 0.45).fillCircle(p.x, p.y, r); }
      gA.fillStyle(c1, 0.9).fillCircle(bx, by, 14); gA.fillStyle(0xffffff, 0.9).fillCircle(bx, by, 7);
    } else if (fam === 'multi') {
      if (n > 2) {
        const a = Math.atan2(T[0].y - T[n - 1].y, T[0].x - T[n - 1].x), ox = -Math.sin(a), oy = Math.cos(a);
        [-12, 0, 12].forEach((o, i) => { gA.lineStyle(i === 1 ? 6 : 4, i === 1 ? c0 : c1, 0.8); gA.lineBetween(bx + ox * o, by + oy * o, T[n - 1].x + ox * o * 1.8, T[n - 1].y + oy * o * 1.8); });
      }
    } else {   // beam: rayo de energía que se estrecha
      for (let j = 1; j < n; j++) {
        const w = 18 * (1 - j / n) + 2;
        gA.lineStyle(w, c2, 0.5).lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y);
        gA.lineStyle(w * 0.4, c0, 0.9).lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y);
      }
    }
  }

  // Técnica del portero: aparece delante de él mientras llega el tiro
  parada(fam, E, x, y, age, time, team, pulse) {
    if (this.sigParada(fam, E, x, y, age, time, team, pulse)) return;
    const gN = this.gN, gA = this.gA, s = (0.4 + 0.6 * age) * (1 + pulse * 0.35), c1 = E.tints[1], c2 = E.main, c3 = E.tints[E.tints.length - 1];
    const fy = y + (team === 'B' ? 18 : -18);   // hacia el lado del que llega el tiro
    gA.fillStyle(c2, 0.25).fillCircle(x, fy, 46 * s);
    if (fam === 'mano' || fam === 'puno') {
      const wob = Math.sin(time / 90) * 2;
      gA.fillStyle(0xfff6c0, 0.35).fillCircle(x, fy - 4, 40 * s);
      this.hand(gN, x, fy - 4 + wob, 1.35 * s, E, fam === 'puno');
    } else if (fam === 'muro') {
      const cols = 7, bw = 17 * s, rows = 3;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const bx = x - cols * bw / 2 + c * bw + (r % 2) * bw / 2, by = fy + 14 - r * 13 * s * Math.min(1, age * 1.5 - r * 0.2);
        gN.fillStyle((r + c) % 2 ? c2 : c1, 1).fillRect(bx, by - 12 * s, bw - 2, 12 * s);
        gN.lineStyle(2, c3, 1).strokeRect(bx, by - 12 * s, bw - 2, 12 * s);
      }
    } else {   // vórtice / escudo giratorio
      for (let i = 0; i < 3; i++) {
        const r = (18 + i * 13) * s, a = time * (0.006 + i * 0.003) * (i % 2 ? -1 : 1);
        gA.lineStyle(4, [c1, c2, E.tints[0]][i], 0.9).beginPath(); gA.arc(x, fy, r, a, a + 4.2, false); gA.strokePath();
      }
      gA.fillStyle(0xffffff, 0.5).fillCircle(x, fy, 6 * s);
    }
  }

  /* ---------- Piezas de las técnicas famosas ---------- */
  wolf(g, x, y, s, E, open) {   // cabeza de lobo de frente
    const fur = E.tints[1], dark = E.tints[E.tints.length - 1];
    const P = (a, b) => ({ x: x + a * s, y: y + b * s });
    const tri = (a, b, c) => g.fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y);
    g.fillStyle(dark, 1); tri(P(-23, -6), P(-7, -15), P(-19, -38)); tri(P(23, -6), P(7, -15), P(19, -38));
    g.fillStyle(fur, 1); tri(P(-20, -8), P(-9, -14), P(-17, -32)); tri(P(20, -8), P(9, -14), P(17, -32));
    const head = [P(-24, -10), P(-12, -18), P(0, -16), P(12, -18), P(24, -10), P(27, 4), P(14, 14), P(0, 28), P(-14, 14), P(-27, 4)];
    g.fillStyle(fur, 1).fillPoints(head, true); g.lineStyle(2.5 * s, dark, 1).strokePoints(head, true);
    g.fillStyle(dark, 0.5); tri(P(-27, 4), P(-18, 2), P(-24, 12)); tri(P(27, 4), P(18, 2), P(24, 12));
    const muzzle = [P(-9, 4), P(9, 4), P(7, 20 + (open ? 6 : 0)), P(-7, 20 + (open ? 6 : 0))];
    g.fillStyle(E.tints[0], 1).fillPoints(muzzle, true);
    g.fillStyle(0x101820, 1); tri(P(-5, 7), P(5, 7), P(0, 13));
    g.fillStyle(0xffffff, 1); tri(P(-16, -4), P(-5, -2), P(-12, 1)); tri(P(16, -4), P(5, -2), P(12, 1));
    g.fillStyle(0x0a1a3a, 1).fillCircle(P(-10, -1).x, P(-10, -1).y, 1.8 * s).fillCircle(P(10, -1).x, P(10, -1).y, 1.8 * s);
    if (open) {
      g.fillStyle(0x400010, 1).fillRect(P(-6, 20).x, P(-6, 20).y, 12 * s, 6 * s);
      g.fillStyle(0xffffff, 1); tri(P(-6, 20), P(-3, 20), P(-4.5, 24)); tri(P(6, 20), P(3, 20), P(4.5, 24));
    }
  }
  snowflake(g, x, y, r, col, a) {
    g.lineStyle(2, col, 0.95);
    for (let i = 0; i < 3; i++) {
      const t = a + i * Math.PI / 3, cx = Math.cos(t) * r, cy = Math.sin(t) * r;
      g.lineBetween(x - cx, y - cy, x + cx, y + cy);
      for (const sgn of [-1, 1]) { const bx = x + sgn * cx * 0.55, by = y + sgn * cy * 0.55; g.lineBetween(bx, by, bx + Math.cos(t + sgn * 0.8) * r * 0.35, by + Math.sin(t + sgn * 0.8) * r * 0.35); }
    }
  }
  globe(g, x, y, r, time) {
    g.fillStyle(0x2a6ad8, 1).fillCircle(x, y, r);
    const rot = time / 600;
    [[0.2, -0.3, 0.45], [-0.45, 0.2, 0.35], [0.5, 0.35, 0.3], [-0.1, 0.55, 0.25]].forEach(([ox, oy, rr], i) => {
      const px = ((ox + rot) % 2 + 2) % 2 - 1; if (Math.abs(px) > 0.85) return;
      g.fillStyle(i % 2 ? 0x3ca048 : 0x58b84a, 1).fillEllipse(x + px * r, y + oy * r, rr * r * (1 - Math.abs(px) * 0.6), rr * r * 0.8);
    });
    g.lineStyle(3, 0x0a2a6a, 1).strokeCircle(x, y, r);
    this.gA.lineStyle(4, 0x9fe0ff, 0.5).strokeCircle(x, y, r + 4);
  }
  clock(g, x, y, r, time, E) {
    g.lineStyle(4, 0xfff0b0, 0.9).strokeCircle(x, y, r); g.lineStyle(2, 0xffffff, 0.6).strokeCircle(x, y, r - 6);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.lineStyle(2, 0xfff0b0, 0.9).lineBetween(x + Math.cos(a) * (r - 8), y + Math.sin(a) * (r - 8), x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3)); }
    const a1 = time / 80, a2 = time / 900;
    g.lineStyle(3, 0xffffff, 1).lineBetween(x, y, x + Math.cos(a1) * (r - 8), y + Math.sin(a1) * (r - 8));
    g.lineStyle(4, 0xffd23a, 1).lineBetween(x, y, x + Math.cos(a2) * (r - 16), y + Math.sin(a2) * (r - 16));
  }
  stars(g, x, y, R, n, time, col) {
    for (let i = 0; i < n; i++) {
      const arm = i % 2, t = i / n, a = t * 9 + arm * Math.PI + time / 300, r = 6 + t * R;
      g.fillStyle(i % 3 ? col : 0xffffff, 0.9).fillCircle(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.55, 1.5 + (1 - t) * 2.5);
    }
  }
  sigWindup(key, E, x, y, k, time, v, clone) {
    if (this.sigWindup2(key, E, x, y, k, time, v, clone)) return true;
    const gN = this.gN, gA = this.gA;
    if (key === 'lobo') {
      gA.fillStyle(E.main, 0.25).fillCircle(x, y - 70, 50 * k + 16);
      for (let i = 0; i < 3; i++) { const r = 20 + ((time / 6 + i * 25) % 75); gA.lineStyle(3, E.tints[0], 0.8 * (1 - r / 95)); gA.beginPath(); gA.arc(x, y - 112, r, -2.6, -0.54, false); gA.strokePath(); }
      this.wolf(gN, x, y - 76 - k * 14, 1.1 + k * 0.6, E, true);
      return true;
    }
    if (key === 'divino') {
      gA.fillStyle(0xfff6c0, 0.22).fillRect(x - 26, y - 420, 52, 420); gA.fillStyle(0xffffff, 0.3).fillRect(x - 10, y - 420, 20, 420);
      const flap = 0.85 + 0.15 * Math.sin(time / 90);
      this.wing(gN, x, y - 40, -1, 44 + k * 26, flap, PAL.luz); this.wing(gN, x, y - 40, 1, 44 + k * 26, flap, PAL.luz);
      gA.lineStyle(4, 0xffd23a, 1).strokeEllipse(x, y - 66, 26, 9);
      for (let i = 0; i < 5; i++) { const fy = y - 120 + ((time / 8 + i * 30) % 120); gN.fillStyle(0xffffff, 0.9).fillEllipse(x - 40 + i * 20, fy, 5, 10); }
      return true;
    }
    if (key === 'fenix') {
      const flap = 0.75 + 0.25 * Math.sin(time / 65), span = 46 + k * 40;
      this.wing(gN, x, y - 40, -1, span, flap, E); this.wing(gN, x, y - 40, 1, span, flap, E);
      for (let i = 0; i < 6; i++) { const fx = x + Math.sin(time / 70 + i) * 8, fy = y - 20 + i * 10; gA.fillStyle(E.tints[i % E.tints.length], 0.8).fillTriangle(fx - 6, fy, fx + 6, fy, fx, fy + 16); }
      gN.fillStyle(E.tints[1], 1).fillCircle(x, y - 50, 9); gN.fillStyle(E.tints[E.tints.length - 1], 1).fillTriangle(x - 3, y - 48, x + 3, y - 48, x, y - 38);
      return true;
    }
    if (key === 'pegaso') {
      const flap = 0.75 + 0.25 * Math.sin(time / 70);
      [-34, 0, 34].forEach((ox, i) => { const yy = y - 40 - (i === 1 ? 18 : 0); this.wing(gN, x + ox, yy, -1, 30 + k * 16, flap, PAL.luz); this.wing(gN, x + ox, yy, 1, 30 + k * 16, flap, PAL.luz); });
      return true;
    }
    if (key === 'triangulo') {
      const c = PAL.mal, R = 70 - k * 40, a0 = time / 200;
      const pts = [0, 1, 2].map(i => ({ x: x + Math.cos(a0 + i * 2.094) * R, y: y - 40 + Math.sin(a0 + i * 2.094) * R * 0.6 }));
      gA.fillStyle(c.main, 0.25).fillPoints(pts, true); gA.lineStyle(4, c.tints[1], 0.9).strokePoints(pts, true);
      pts.forEach(q => { gA.fillStyle(c.main, 0.5).fillCircle(q.x, q.y, 16); gA.fillStyle(c.tints[0], 0.9).fillCircle(q.x, q.y, 9); });
      return true;
    }
    if (key === 'globo') { const r = 12 + k * 28; this.globe(gN, x, y - 70 - k * 30, r, time); return true; }
    if (key === 'ventisca') {
      for (let i = 0; i < 10; i++) { const a = time / 300 + i * 0.63, r = 30 + (i % 3) * 14; this.snowflake(gA, x + Math.cos(a) * r, y - 30 + Math.sin(a) * r * 0.5, 7 + (i % 2) * 3, i % 2 ? 0xffffff : 0xbff4ff, time / 400 + i); }
      gN.fillStyle(0xd8f6ff, 0.5).fillRect(x - 12, y - 46, 24, 24); gN.lineStyle(2, 0x2f7ab0, 1).strokeRect(x - 12, y - 46, 24, 24);
      return true;
    }
    if (key === 'cruzado') {
      for (const [col, sgn] of [[0xff5a10, 1], [0x3fb6e8, -1]]) {
        const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push({ x: x + sgn * (60 - t * 120) * (1 - k * 0.3), y: y - 90 + t * 70 + Math.sin(t * 6 + time / 80) * 6 }); }
        gA.lineStyle(10, col, 0.5).strokePoints(pts); gA.lineStyle(4, 0xffffff, 0.8).strokePoints(pts);
      }
      return true;
    }
    if (key === 'lluvia') {
      for (let i = 0; i < 5; i++) { const t = ((time / 600 + i * 0.21) % 1), mx = x - 80 + i * 40 + t * 60, my = y - 260 + t * 220; gA.lineStyle(8, E.main, 0.4).lineBetween(mx, my, mx - 36, my - 60); gA.fillStyle(E.tints[0], 0.9).fillCircle(mx, my, 8); }
      return true;
    }
    if (key === 'galaxia') { gA.fillStyle(0x200040, 0.35).fillCircle(x, y - 40, 70); this.stars(gA, x, y - 40, 70, 40, time, 0xb0a0ff); return true; }
    if (key === 'tsunami') {
      const h = 40 + k * 60, pts = [{ x: x - 90, y: y + 10 }];
      for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push({ x: x - 90 + t * 180, y: y + 10 - h * Math.sin(t * Math.PI) * (0.6 + 0.4 * t) }); }
      pts.push({ x: x + 90, y: y + 10 });
      gN.fillStyle(0x2a8ad8, 0.85).fillPoints(pts, true); gN.lineStyle(3, 0xffffff, 0.9).strokePoints(pts.slice(1, -1));
      for (let i = 0; i < 8; i++) gN.fillStyle(0xffffff, 0.9).fillCircle(x + 40 + i * 6, y + 10 - h * 0.85 + Math.sin(time / 60 + i) * 4, 4);
      return true;
    }
    if (key === 'tornadoF') {
      for (let i = 0; i < 26; i++) {
        const t = i / 26, a = time * 0.03 + t * 12, r = 10 + t * 34, yy = y - t * 110 * (0.5 + k * 0.5);
        gA.fillStyle(E.tints[i % E.tints.length], 0.85).fillTriangle(x + Math.cos(a) * r - 5, yy + 4, x + Math.cos(a) * r + 5, yy + 4, x + Math.cos(a) * r, yy - 10);
      }
      return true;
    }
    if (key === 'relampago') {
      gA.fillStyle(0xfff6a0, 0.25).fillCircle(x, y - 30, 40);
      this.bolt(gA, x - 20 + Math.random() * 40, y - 360, x, y - 30, 0xffe040, 6);
      if (Math.random() < 0.5) this.bolt(gA, x - 80, y - 300, x - 10, y - 40, 0xfff6a0, 3);
      return true;
    }
    return false;
  }
  sigFlight(key, E, bx, by, time) {
    if (this.sigFlight2(key, E, bx, by, time)) return true;
    const gN = this.gN, gA = this.gA, T = this.trail, n = T.length;
    if (key === 'lobo') {
      for (let j = 1; j < n; j++) { const w = 22 * (1 - j / n) + 2; gA.lineStyle(w, E.main, 0.35).lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y); }
      for (let j = 3; j < n; j += 4) { const p = T[j]; gA.lineStyle(2, 0xffffff, 0.8).lineBetween(p.x - 16, p.y, p.x - 30, p.y + 4); gA.lineBetween(p.x + 16, p.y, p.x + 30, p.y + 4); }
      this.wolf(gN, bx, by - 6, 1.05, E, Math.sin(time / 60) > 0);
      return true;
    }
    if (key === 'divino') {
      for (let j = 1; j < n; j++) { const w = 16 * (1 - j / n) + 2; gA.lineStyle(w, 0xffe080, 0.5).lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y); gA.lineStyle(w * 0.35, 0xffffff, 1).lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y); }
      for (let j = 4; j < n; j += 5) gN.fillStyle(0xffffff, 0.85).fillEllipse(T[j].x + Math.sin(time / 90 + j) * 14, T[j].y, 6, 12);
      gA.fillStyle(0xffffff, 0.8).fillCircle(bx, by, 12); gA.lineStyle(3, 0xffd23a, 1).strokeEllipse(bx, by - 18, 22, 8);
      return true;
    }
    if (key === 'fenix') {
      const flap = 0.7 + 0.3 * Math.sin(time / 55);
      for (let j = 2; j < n; j += 2) { const p = T[j], w = 12 * (1 - j / n) + 3; gA.fillStyle(E.tints[j % E.tints.length], 0.7).fillTriangle(p.x - w, p.y, p.x + w, p.y, p.x + Math.sin(j + time / 60) * 6, p.y + w * 2); }
      this.wing(gN, bx, by, -1, 58, flap, E); this.wing(gN, bx, by, 1, 58, flap, E);
      gN.fillStyle(E.tints[1], 1).fillCircle(bx, by - 8, 9); gN.fillStyle(E.tints[E.tints.length - 1], 1).fillTriangle(bx - 3, by - 16, bx + 3, by - 16, bx, by - 26);
      return true;
    }
    if (key === 'pegaso') {
      const flap = 0.7 + 0.3 * Math.sin(time / 55);
      [0, 6, 12].forEach((j, i) => { const p = T[j] || { x: bx, y: by }; this.wing(gN, p.x, p.y, -1, 34 - i * 4, flap, PAL.luz); this.wing(gN, p.x, p.y, 1, 34 - i * 4, flap, PAL.luz); });
      return true;
    }
    if (key === 'triangulo') {
      const c = PAL.mal, a0 = time / 120;
      for (let j = 1; j < n; j++) gA.lineStyle(14 * (1 - j / n) + 2, c.main, 0.4).lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y);
      const pts = [0, 1, 2].map(i => ({ x: bx + Math.cos(a0 + i * 2.094) * 22, y: by + Math.sin(a0 + i * 2.094) * 22 }));
      gA.fillStyle(c.main, 0.45).fillPoints(pts, true); gA.lineStyle(3, c.tints[0], 1).strokePoints(pts, true);
      return true;
    }
    if (key === 'globo') {
      for (let j = 1; j < n; j++) gA.lineStyle(20 * (1 - j / n) + 2, 0x6fc0ff, 0.35).lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y);
      this.globe(gN, bx, by, 22, time);
      return true;
    }
    if (key === 'ventisca') {
      for (let j = 2; j < n; j += 2) this.snowflake(gA, T[j].x + Math.sin(j + time / 80) * 10, T[j].y, 6 * (1 - j / n) + 3, 0xffffff, time / 200 + j);
      gN.fillStyle(0xd8f6ff, 0.85).fillRect(bx - 11, by - 11, 22, 22); gN.lineStyle(2, 0x2f7ab0, 1).strokeRect(bx - 11, by - 11, 22, 22);
      gA.fillStyle(0xffffff, 0.6).fillTriangle(bx - 9, by - 9, bx, by - 9, bx - 9, by);
      return true;
    }
    if (key === 'cruzado') {
      [[0xff5a10, 1], [0x3fb6e8, -1]].forEach(([col, sgn]) => {
        const pts = T.map((p, j) => ({ x: p.x + sgn * Math.sin(j * 0.5 + time / 70) * 12, y: p.y }));
        if (pts.length > 1) { gA.lineStyle(8, col, 0.5).strokePoints(pts); gA.lineStyle(3, 0xffffff, 0.8).strokePoints(pts); }
      });
      return true;
    }
    if (key === 'lluvia') {
      for (let j = n - 1; j >= 0; j--) gA.fillStyle(j < 4 ? E.tints[0] : E.main, 0.45).fillCircle(T[j].x, T[j].y, 4 + 14 * (1 - j / n));
      for (let i = 0; i < 3; i++) { const t = ((time / 500 + i / 3) % 1), mx = bx - 60 + i * 50 + t * 30, my = by - 120 + t * 110; gA.lineStyle(6, E.main, 0.4).lineBetween(mx, my, mx - 24, my - 40); gA.fillStyle(E.tints[0], 0.9).fillCircle(mx, my, 6); }
      return true;
    }
    if (key === 'galaxia') {
      for (let j = 1; j < n; j++) gA.lineStyle(16 * (1 - j / n) + 2, 0x7040e0, 0.35).lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y);
      this.stars(gA, bx, by, 34, 24, time * 2, 0xd0c0ff);
      gA.fillStyle(0xffffff, 0.9).fillCircle(bx, by, 9);
      return true;
    }
    if (key === 'tsunami') {
      for (let j = 1; j < n; j++) { const w = 24 * (1 - j / n) + 3; gN.lineStyle(w, 0x2a8ad8, 0.75).lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y); }
      for (let j = 0; j < n; j += 3) gN.fillStyle(0xffffff, 0.9).fillCircle(T[j].x + Math.sin(j + time / 50) * 10, T[j].y, 3 + (1 - j / n) * 3);
      return true;
    }
    if (key === 'tornadoF') {
      for (let j = 0; j < n; j++) { const p = T[j], a = j * 0.9 + time * 0.03, r = 5 + 14 * (1 - j / n); gA.fillStyle(E.tints[j % E.tints.length], 0.85).fillTriangle(p.x + Math.cos(a) * r - 4, p.y + 3, p.x + Math.cos(a) * r + 4, p.y + 3, p.x + Math.cos(a) * r, p.y - 9); }
      gA.fillStyle(E.tints[0], 0.8).fillCircle(bx, by, 10);
      return true;
    }
    if (key === 'relampago') {
      if (n > 4) { const pts = T.filter((_, j) => j % 2 === 0).map(p => ({ x: p.x + (Math.random() - 0.5) * 16, y: p.y + (Math.random() - 0.5) * 16 })); gA.lineStyle(12, 0xffe040, 0.35).strokePoints(pts); gA.lineStyle(4, 0xffffff, 1).strokePoints(pts); }
      gA.fillStyle(0xfff6a0, 0.8).fillCircle(bx, by, 12);
      return true;
    }
    return false;
  }
  sigParada(key, E, x, y, age, time, team, pulse) {
    if (this.sigParada2(key, E, x, y, age, time, team, pulse)) return true;
    const gN = this.gN, gA = this.gA, s = (0.4 + 0.6 * age) * (1 + pulse * 0.35);
    const fy = y + (team === 'B' ? 18 : -18);
    if (key === 'manoceleste' || key === 'trimano') {
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + time / 900; gA.lineStyle(3, 0xffe080, 0.6).lineBetween(x + Math.cos(a) * 30 * s, fy - 4 + Math.sin(a) * 30 * s, x + Math.cos(a) * 70 * s, fy - 4 + Math.sin(a) * 70 * s); }
      gA.fillStyle(0xfff6c0, 0.45).fillCircle(x, fy - 4, 44 * s);
      if (key === 'trimano') { this.hand(gN, x - 46 * s, fy + 4, 0.95 * s, PAL.oro, false); this.hand(gN, x + 46 * s, fy + 4, 0.95 * s, PAL.oro, false); }
      this.hand(gN, x, fy - 4 + Math.sin(time / 90) * 2, 1.45 * s, PAL.oro, false);
      return true;
    }
    if (key === 'manomagica') {
      const by = y + (team === 'B' ? -26 : 26);   // sale por detrás del portero
      gN.fillStyle(0x200030, 0.55).fillEllipse(x, by, 110 * s, 80 * s);
      gA.fillStyle(0x8020e0, 0.35).fillCircle(x, by - 10, 50 * s);
      this.hand(gN, x, by - 12 + Math.sin(time / 70) * 3, 1.5 * s, PAL.mal, false);
      [-15, -5, 5, 15].forEach(fx => gN.fillStyle(0xffffff, 1).fillTriangle(x + fx * 1.5 * s - 3, by - 12 - 40 * s, x + fx * 1.5 * s + 3, by - 12 - 40 * s, x + fx * 1.5 * s, by - 12 - 50 * s));
      gN.fillStyle(0xff3030, 1).fillCircle(x - 10 * s, by - 2, 3 * s).fillCircle(x + 10 * s, by - 2, 3 * s);
      return true;
    }
    if (key === 'manosinf') {
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + time / 500; this.hand(gN, x + Math.cos(a) * 44 * s, fy + Math.sin(a) * 26 * s, 0.6 * s, PAL.oro, false); }
      this.hand(gN, x, fy, 1.1 * s, PAL.oro, false);
      return true;
    }
    if (key === 'muralla') {
      const rows = 5, cols = 8, bw = 16 * s;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const bx = x - cols * bw / 2 + c * bw + (r % 2) * bw / 2, by = fy + 22 - r * 12 * s * Math.max(0, Math.min(1, age * 2 - r * 0.15));
        gN.fillStyle((r + c) % 2 ? 0x9a8a78 : 0xb8a890, 1).fillRect(bx, by - 11 * s, bw - 2, 11 * s); gN.lineStyle(2, 0x4a3e30, 1).strokeRect(bx, by - 11 * s, bw - 2, 11 * s);
      }
      gA.lineStyle(4, E.tints[0], 0.9).strokeCircle(x - 9 * s, fy - 50 * s, 9 * s); gA.strokeCircle(x + 9 * s, fy - 50 * s, 9 * s);   // ∞
      return true;
    }
    if (key === 'agujero') {
      gN.fillStyle(0x08000f, 0.95).fillCircle(x, fy, 26 * s);
      for (let i = 0; i < 4; i++) { const a = time / (140 - i * 20) + i * 1.5; gA.lineStyle(4, i % 2 ? 0xff9040 : 0xa040ff, 0.85); gA.beginPath(); gA.arc(x, fy, (30 + i * 9) * s, a, a + 3.6, false); gA.strokePath(); }
      return true;
    }
    return false;
  }

  /* ---------- Más técnicas con animación propia (según su nombre) ---------- */
  ghost(g, x, y, s, alpha, time) {   // fantasma: sábana ondulante con ojos
    const w = 22 * s, h = 30 * s, pts = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; pts.push({ x: x + Math.cos(a) * w, y: y - h * 0.4 + Math.sin(a) * w }); }
    for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push({ x: x + w - t * 2 * w, y: y + h * 0.5 + Math.sin(t * Math.PI * 4 + time / 80) * 4 * s }); }
    g.fillStyle(0xeef4ff, alpha).fillPoints(pts, true); g.lineStyle(2, 0x6a7aa8, alpha).strokePoints(pts, true);
    g.fillStyle(0x101830, alpha).fillEllipse(x - 7 * s, y - h * 0.45, 6 * s, 9 * s).fillEllipse(x + 7 * s, y - h * 0.45, 6 * s, 9 * s);
    g.fillStyle(0x101830, alpha * 0.8).fillEllipse(x, y - h * 0.1, 7 * s, 9 * s);
  }
  rocket(g, x, y, a, s, E) {   // cohete apuntando en el ángulo a
    const c = Math.cos(a), sn = Math.sin(a), P = (f, l) => ({ x: x + c * f * s - sn * l * s, y: y + sn * f * s + c * l * s });
    const body = [P(18, 0), P(8, -6), P(-14, -6), P(-14, 6), P(8, 6)];
    g.fillStyle(0xe8e8f0, 1).fillPoints(body, true); g.lineStyle(2, 0x404058, 1).strokePoints(body, true);
    g.fillStyle(0xe8361a, 1).fillTriangle(P(18, 0).x, P(18, 0).y, P(8, -6).x, P(8, -6).y, P(8, 6).x, P(8, 6).y);
    g.fillStyle(0xe8361a, 1).fillTriangle(P(-8, -6).x, P(-8, -6).y, P(-16, -13).x, P(-16, -13).y, P(-14, -6).x, P(-14, -6).y);
    g.fillTriangle(P(-8, 6).x, P(-8, 6).y, P(-16, 13).x, P(-16, 13).y, P(-14, 6).x, P(-14, 6).y);
    g.fillStyle(0x3fb6e8, 1).fillCircle(P(2, 0).x, P(2, 0).y, 3 * s);
    const f = 8 + Math.random() * 8; this.gA.fillStyle(E.tints[0], 0.9).fillTriangle(P(-14, -4).x, P(-14, -4).y, P(-14, 4).x, P(-14, 4).y, P(-14 - f, 0).x, P(-14 - f, 0).y);
  }
  dynamite(g, x, y, s, time) {
    [-9, 0, 9].forEach((o, i) => { g.fillStyle(0xd0302a, 1).fillRoundedRect(x + o * s - 4 * s, y - 14 * s, 8 * s, 26 * s, 2 * s); g.lineStyle(1.5, 0x5a1010, 1).strokeRoundedRect(x + o * s - 4 * s, y - 14 * s, 8 * s, 26 * s, 2 * s); });
    g.fillStyle(0x3a2a1a, 1).fillRect(x - 13 * s, y - 2 * s, 26 * s, 4 * s);
    g.lineStyle(2, 0x5a4a30, 1).lineBetween(x, y - 14 * s, x + 6 * s, y - 24 * s);
    for (let i = 0; i < 5; i++) { const a = Math.random() * 6.28, r = 3 + Math.random() * 7; this.gA.fillStyle(i % 2 ? 0xfff1a0 : 0xff7a1a, 1).fillCircle(x + 6 * s + Math.cos(a) * r, y - 24 * s + Math.sin(a) * r, 1.6); }
  }
  petal(g, x, y, a, s, col) {
    const c = Math.cos(a), sn = Math.sin(a), P = (f, l) => ({ x: x + c * f * s - sn * l * s, y: y + sn * f * s + c * l * s });
    g.fillStyle(col, 0.95).fillTriangle(P(-5, 0).x, P(-5, 0).y, P(0, -3).x, P(0, -3).y, P(6, 0).x, P(6, 0).y).fillTriangle(P(-5, 0).x, P(-5, 0).y, P(0, 3).x, P(0, 3).y, P(6, 0).x, P(6, 0).y);
  }
  rose(g, x, y, s) {
    g.fillStyle(0x2c7d2c, 1).fillTriangle(x - 10 * s, y + 6 * s, x, y + 2 * s, x - 2 * s, y + 10 * s).fillTriangle(x + 10 * s, y + 6 * s, x, y + 2 * s, x + 2 * s, y + 10 * s);
    g.fillStyle(0xc81a4a, 1).fillCircle(x, y, 9 * s); g.fillStyle(0xe8406a, 1).fillCircle(x - 2 * s, y - 2 * s, 6 * s); g.fillStyle(0xff7a9a, 1).fillCircle(x - 1 * s, y - 3 * s, 3 * s);
    g.lineStyle(1.5, 0x7a0a2a, 1).strokeCircle(x, y, 9 * s);
  }
  butterfly(g, x, y, s, flap, col, col2) {
    const f = 0.35 + 0.65 * Math.abs(flap);
    g.fillStyle(col, 0.95).fillEllipse(x - 7 * s * f, y - 4 * s, 12 * s * f, 12 * s).fillEllipse(x + 7 * s * f, y - 4 * s, 12 * s * f, 12 * s);
    g.fillStyle(col2, 0.95).fillEllipse(x - 5 * s * f, y + 5 * s, 8 * s * f, 8 * s).fillEllipse(x + 5 * s * f, y + 5 * s, 8 * s * f, 8 * s);
    g.fillStyle(0x201010, 1).fillRect(x - 1, y - 8 * s, 2, 16 * s);
  }
  flame(g, x, y, h, col, col2, time, seed = 0) {   // llama de 3 lenguas
    const sw = Math.sin(time / 70 + seed) * h * 0.12;
    g.fillStyle(col, 0.9).fillTriangle(x - h * 0.35, y, x + h * 0.35, y, x + sw, y - h);
    g.fillStyle(col2, 0.95).fillTriangle(x - h * 0.18, y, x + h * 0.18, y, x + sw * 0.6, y - h * 0.6);
  }
  web(g, x, y, r, a, col) {
    for (let i = 0; i < 8; i++) { const t = a + i / 8 * Math.PI * 2; g.lineStyle(1.5, col, 0.9).lineBetween(x, y, x + Math.cos(t) * r, y + Math.sin(t) * r * 0.6); }
    for (let k = 1; k <= 3; k++) { const pts = []; for (let i = 0; i <= 8; i++) { const t = a + i / 8 * Math.PI * 2; pts.push({ x: x + Math.cos(t) * r * k / 3, y: y + Math.sin(t) * r * 0.6 * k / 3 }); } g.lineStyle(1.5, col, 0.85).strokePoints(pts); }
  }
  star5(g, x, y, r, col, a = -Math.PI / 2) {
    const pts = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r, t = a + i * Math.PI / 5; pts.push({ x: x + Math.cos(t) * rr, y: y + Math.sin(t) * rr }); }
    g.fillStyle(col, 0.95).fillPoints(pts, true);
  }
  heading(T, bx, by) { const q = T[Math.min(3, T.length - 1)] || { x: bx, y: by + 1 }; return Math.atan2(by - q.y, bx - q.x); }

  sigWindup2(key, E, x, y, k, time, v, clone) {
    const gN = this.gN, gA = this.gA;
    switch (key) {
      case 'fantasma':
        gN.fillStyle(0x10102a, 0.35).fillEllipse(x, y + 4, 90, 26);
        [-1, 1].forEach((sg, i) => this.ghost(gA, x + sg * (24 + Math.sin(time / 200 + i) * 8), y - 40 - k * 20 + Math.sin(time / 120 + i * 2) * 6, 0.9 + k * 0.3, 0.55, time));
        this.ghost(gN, x, y - 64 - k * 26, 1.1 + k * 0.4, 0.8, time);
        return true;
      case 'cohete': {
        gA.fillStyle(0xffd23a, 0.25).fillCircle(x, y - 20, 40);
        for (let i = 0; i < 6; i++) { const r = 8 + ((time / 10 + i * 12) % 40); gN.fillStyle(0xb8b8c0, 0.5 * (1 - r / 50)).fillCircle(x - 30 + i * 12, y + 4 - r * 0.3, r * 0.4); }
        this.rocket(gN, x, y - 40 - k * 40, -Math.PI / 2, 1.3 + k * 0.4, E);
        return true;
      }
      case 'explosivo':
        this.dynamite(gN, x, y - 48 - k * 10, 1.4 + k * 0.5, time);
        gA.lineStyle(3, 0xffd23a, 0.6 + 0.4 * Math.sin(time / 40)).strokeCircle(x, y - 48, 30 + k * 10);
        return true;
      case 'bate': {   // palo que se arma hacia atrás
        const a = -2.4 + k * 0.5 + Math.sin(time / 90) * 0.05, L = 46;
        gN.lineStyle(8, 0x8a5a2a, 1).lineBetween(x, y - 26, x + Math.cos(a) * L, y - 26 + Math.sin(a) * L);
        gN.lineStyle(3, 0xd8a868, 1).lineBetween(x, y - 26, x + Math.cos(a) * L, y - 26 + Math.sin(a) * L);
        gA.lineStyle(4, E.tints[0], 0.6); gA.beginPath(); gA.arc(x, y - 26, L, a, a + 2.2, false); gA.strokePath();
        return true;
      }
      case 'kungfu':
        for (let i = 0; i < 3; i++) { const r = 14 + ((time / 5 + i * 22) % 66); gA.lineStyle(4, E.tints[1], 0.9 * (1 - r / 80)).strokeEllipse(x, y - 30, r * 2, r * 1.2); }
        [-1, 1].forEach(sg => this.hand(gN, x + sg * (38 - k * 12), y - 40 + Math.sin(time / 60 + sg) * 6, 0.55, E, true));
        gA.fillStyle(0xffffff, 0.6).fillCircle(x, y - 30, 8 + k * 6);
        return true;
      case 'psiquico':
        gA.fillStyle(0x6020c0, 0.3).fillCircle(x, y - 40, 60);
        for (let i = 0; i < 4; i++) { const r = 10 + ((time / 8 + i * 18) % 72); gA.lineStyle(3, 0xd080ff, 0.9 * (1 - r / 82)).strokeCircle(x, y - 40, r); }
        gN.fillStyle(0xffffff, 0.95).fillEllipse(x, y - 70, 34, 18); gN.fillStyle(0x8020e0, 1).fillCircle(x, y - 70, 7); gN.fillStyle(0x100020, 1).fillCircle(x, y - 70, 3.5);
        gN.lineStyle(2, 0x401070, 1).strokeEllipse(x, y - 70, 34, 18);
        return true;
      case 'tarzan': {   // liana desde arriba y hojas
        const a = Math.sin(time / 260) * 0.6, L = 150, tx = x + Math.sin(a) * 40, ty = y - 40;
        gN.lineStyle(5, 0x5a3a1a, 1).lineBetween(x - 20, y - 40 - L, tx, ty); gN.lineStyle(2, 0x2c7d2c, 1).lineBetween(x - 20, y - 40 - L, tx, ty);
        for (let i = 0; i < 6; i++) { const t = i / 6, lx = x - 20 + (tx - x + 20) * t, ly = y - 40 - L + L * t; this.petal(gN, lx + 6, ly, 0.6 + i, 1.3, 0x52b83e); }
        for (let i = 0; i < 8; i++) { const fy = y - 120 + ((time / 9 + i * 19) % 130); this.petal(gN, x - 60 + i * 16 + Math.sin(time / 200 + i) * 8, fy, time / 300 + i, 1.1, i % 2 ? 0x9ee860 : 0x52b83e); }
        return true;
      }
      case 'rosas':
        for (let i = 0; i < 18; i++) { const a = time / 400 + i * 0.7, r = 20 + (i % 4) * 14; this.petal(gN, x + Math.cos(a) * r, y - 30 + Math.sin(a) * r * 0.55, a * 2, 1.4, i % 3 ? 0xe8406a : 0xff9ab0); }
        this.rose(gN, x, y - 54 - k * 16, 1.2 + k * 0.6);
        return true;
      case 'mariposas':
        for (let i = 0; i < 6; i++) { const a = time / 500 + i * 1.05, r = 26 + (i % 2) * 18; this.butterfly(gN, x + Math.cos(a) * r, y - 40 + Math.sin(a) * r * 0.5 - k * 14, 1.1, Math.sin(time / 50 + i), i % 2 ? E.tints[1] : 0xff9ab0, E.main); }
        return true;
      case 'tormentaF':
        gA.fillStyle(0xff3010, 0.25).fillCircle(x, y - 40, 70);
        for (let i = 0; i < 12; i++) { const a = time / 250 + i * 0.52, r = 26 + (i % 3) * 16; this.flame(gA, x + Math.cos(a) * r, y - 20 + Math.sin(a) * r * 0.45, 22 + (i % 3) * 8 + k * 10, 0xff5a10, 0xfff1a0, time, i); }
        return true;
      case 'torre': {   // la torre se levanta detrás
        const h = 40 + k * 120, bx = x - 14;
        gN.fillStyle(0x6a6a7a, 1).fillRect(bx, y - h, 28, h); gN.lineStyle(2, 0x2a2a3a, 1).strokeRect(bx, y - h, 28, h);
        for (let i = 0; i < Math.floor(h / 18); i++) gN.fillStyle(0xfff0a0, 0.9).fillRect(bx + 6 + (i % 2) * 10, y - 14 - i * 18, 6, 7);
        gN.fillStyle(0x4a4a5a, 1).fillTriangle(bx - 8, y - h, bx + 36, y - h, x, y - h - 26);
        gA.fillStyle(0xffd23a, 0.9).fillCircle(x, y - h - 26, 4 + Math.sin(time / 60) * 2);
        return true;
      }
      case 'rebotes':
        for (let i = 0; i < 4; i++) { const t = ((time / 500 + i * 0.25) % 1), bx2 = x - 60 + t * 120, by2 = y - 20 - Math.abs(Math.sin(t * Math.PI * 3)) * 60; gA.fillStyle(E.tints[0], 0.9).fillCircle(bx2, by2, 6); gA.lineStyle(2, E.main, 0.6).strokeEllipse(bx2, y - 20, 18 * (1 - t) + 4, 6); }
        this.gather(E, x, y - 18, k, time);
        return true;
      case 'fango':
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + time / 600, r = 20 + k * 30; gN.fillStyle(i % 2 ? 0x6e4622 : 0x8a5a2a, 0.95).fillCircle(x + Math.cos(a) * r, y - 20 + Math.sin(a) * r * 0.5, 7 + (i % 3) * 2); }
        gN.fillStyle(0x5a3a1a, 1).fillCircle(x, y - 34, 10 + k * 10);
        return true;
    }
    return false;
  }
  sigFlight2(key, E, bx, by, time) {
    const gN = this.gN, gA = this.gA, T = this.trail, n = T.length, a = this.heading(T, bx, by);
    const tail = (w0, col, al) => { for (let j = 1; j < n; j++) gA.lineStyle(w0 * (1 - j / n) + 2, col, al).lineBetween(T[j - 1].x, T[j - 1].y, T[j].x, T[j].y); };
    switch (key) {
      case 'fantasma':
        for (let j = 4; j < n; j += 6) this.ghost(gA, T[j].x + Math.sin(time / 90 + j) * 10, T[j].y, 0.6, 0.35 * (1 - j / n), time);
        this.ghost(gN, bx, by - 4, 0.8, 0.85, time);
        return true;
      case 'cohete':
        for (let j = 1; j < n; j++) { const p = T[j], r = 3 + j * 0.9; gN.fillStyle(0xc8c8d0, 0.55 * (1 - j / n)).fillCircle(p.x + Math.sin(j * 1.3) * 3, p.y, r); }
        this.rocket(gN, bx, by, a, 1.1, E);
        return true;
      case 'explosivo':
        tail(14, 0xff7a1a, 0.45);
        for (let i = 0; i < 6; i++) { const t = Math.random() * 6.28, r = 8 + Math.random() * 14; gA.fillStyle(i % 2 ? 0xfff1a0 : 0xff5a10, 0.9).fillCircle(bx + Math.cos(t) * r, by + Math.sin(t) * r, 2); }
        this.dynamite(gN, bx, by, 0.75, time);
        return true;
      case 'bate':
        tail(10, E.main, 0.4);
        for (let j = 3; j < n; j += 3) gA.lineStyle(2, 0xffffff, 0.7 * (1 - j / n)).strokeCircle(T[j].x, T[j].y, 6 + j);
        gA.fillStyle(0xffffff, 0.85).fillCircle(bx, by, 10);
        return true;
      case 'kungfu':
        tail(16, E.main, 0.4);
        for (let j = 2; j < n; j += 5) gA.lineStyle(3, E.tints[0], 0.8 * (1 - j / n)).strokeEllipse(T[j].x, T[j].y, 26 - j * 0.4, 12);
        this.hand(gN, bx, by - 2, 0.42, E, true);
        return true;
      case 'psiquico':
        tail(14, 0x8020e0, 0.4);
        for (let i = 0; i < 3; i++) { const r = 8 + ((time / 6 + i * 10) % 30); gA.lineStyle(2, 0xd080ff, 0.9 * (1 - r / 38)).strokeCircle(bx, by, r); }
        gA.fillStyle(0xf0d0ff, 0.9).fillCircle(bx, by, 8);
        return true;
      case 'tarzan':
        tail(12, 0x52b83e, 0.4);
        for (let j = 2; j < n; j += 3) this.petal(gN, T[j].x + Math.sin(j + time / 80) * 10, T[j].y, time / 150 + j, 1.2, j % 2 ? 0x9ee860 : 0x52b83e);
        gA.fillStyle(0xe2ffa8, 0.8).fillCircle(bx, by, 10);
        return true;
      case 'rosas':
        for (let j = 1; j < n; j += 1) this.petal(gN, T[j].x + Math.sin(j * 0.8 + time / 70) * 12, T[j].y, time / 120 + j, 1.1, j % 3 ? 0xe8406a : 0xff9ab0);
        this.rose(gN, bx, by, 1.1);
        return true;
      case 'mariposas':
        [3, 8, 13, 18].forEach((j, i) => { const p = T[j]; if (p) this.butterfly(gN, p.x + (i % 2 ? 14 : -14), p.y + Math.sin(time / 60 + i) * 6, 0.9, Math.sin(time / 45 + i), i % 2 ? E.tints[1] : 0xff9ab0, E.main); });
        gA.fillStyle(E.tints[0], 0.8).fillCircle(bx, by, 9);
        return true;
      case 'tormentaF':
        for (let j = 1; j < n; j += 2) this.flame(gA, T[j].x + Math.sin(j) * 6, T[j].y + 6, 22 * (1 - j / n) + 6, 0xff5a10, 0xfff1a0, time, j);
        gA.fillStyle(0xfff1a0, 0.9).fillCircle(bx, by, 11);
        return true;
      case 'torre':
        tail(18, 0xffd23a, 0.4);
        gN.fillStyle(0x6a6a7a, 1).fillRect(bx - 6, by - 26, 12, 26); gN.fillStyle(0x4a4a5a, 1).fillTriangle(bx - 9, by - 26, bx + 9, by - 26, bx, by - 38);
        gA.fillStyle(0xffffff, 0.85).fillCircle(bx, by, 9);
        return true;
      case 'rebotes':
        tail(10, E.main, 0.4);
        for (let j = 4; j < n; j += 6) gA.lineStyle(3, E.tints[0], 0.8 * (1 - j / n)).strokeEllipse(T[j].x, T[j].y + 6, 24, 8);
        gA.fillStyle(E.tints[0], 0.9).fillCircle(bx, by - Math.abs(Math.sin(time / 60)) * 8, 10);
        return true;
      case 'fango':
        for (let j = 1; j < n; j += 2) gN.fillStyle(j % 4 ? 0x6e4622 : 0x8a5a2a, 0.8 * (1 - j / n)).fillCircle(T[j].x + Math.sin(j * 1.7) * 8, T[j].y, 5 + (1 - j / n) * 6);
        gN.fillStyle(0x5a3a1a, 1).fillCircle(bx, by, 13); gN.fillStyle(0x8a5a2a, 1).fillCircle(bx - 3, by - 3, 6);
        return true;
    }
    return false;
  }
  sigParada2(key, E, x, y, age, time, team, pulse) {
    const gN = this.gN, gA = this.gA, s = (0.4 + 0.6 * age) * (1 + pulse * 0.35), fy = y + (team === 'B' ? 18 : -18), dir = team === 'B' ? 1 : -1;
    switch (key) {
      case 'llamas':
        gA.fillStyle(0xff3010, 0.3).fillCircle(x, fy, 50 * s);
        for (let i = 0; i < 9; i++) { const fx = x - 52 * s + i * 13 * s; this.flame(gA, fx, fy + 14 * s, (30 + (i % 3) * 12) * s, 0xff5a10, 0xfff1a0, time, i); }
        return true;
      case 'petalos':
        for (let i = 0; i < 22; i++) { const a = time / 300 + i * 0.29, r = (14 + (i % 5) * 9) * s; this.petal(gN, x + Math.cos(a) * r, fy + Math.sin(a) * r * 0.6, a * 3, 1.4 * s, i % 3 ? E.tints[1] : 0xff9ab0); }
        return true;
      case 'cisne': {
        const flap = 0.8 + 0.2 * Math.sin(time / 90);
        this.wing(gN, x, fy, -1, 58 * s, flap, PAL.luz); this.wing(gN, x, fy, 1, 58 * s, flap, PAL.luz);
        gN.lineStyle(6 * s, 0xffffff, 1).beginPath(); gN.arc(x + 6 * s, fy - 22 * s, 14 * s, Math.PI * 0.6, Math.PI * 1.9, false); gN.strokePath();
        gN.fillStyle(0xff9a20, 1).fillTriangle(x + 18 * s, fy - 30 * s, x + 26 * s, fy - 28 * s, x + 18 * s, fy - 25 * s);
        return true;
      }
      case 'constelacion': {
        gN.fillStyle(0x080828, 0.55).fillCircle(x, fy, 60 * s);
        const P = [[-40, -10], [-18, -30], [6, -12], [26, -34], [44, -6], [14, 18], [-22, 16]].map(([a, b]) => ({ x: x + a * s, y: fy + b * s }));
        gA.lineStyle(2, 0xb0c8ff, 0.8).strokePoints(P, true);
        P.forEach((q, i) => this.star5(gA, q.x, q.y, (6 + Math.sin(time / 90 + i) * 2) * s, i % 2 ? 0xffffff : 0xfff0a0, time / 500));
        return true;
      }
      case 'taladro': {
        gA.fillStyle(E.main, 0.25).fillCircle(x, fy, 44 * s);
        const L = 56 * s, w = 22 * s;
        gN.fillStyle(0x9aa0b0, 1).fillTriangle(x - w, fy, x + w, fy, x, fy + dir * L);
        for (let i = 1; i < 6; i++) { const t = (i / 6 + time / 300) % 1, yy = fy + dir * L * t, ww = w * (1 - t); gN.lineStyle(2, 0x404858, 1).lineBetween(x - ww, yy, x + ww, yy + dir * 6); }
        gN.lineStyle(2, 0x303848, 1).strokeTriangle(x - w, fy, x + w, fy, x, fy + dir * L);
        return true;
      }
      case 'cohetep':
        for (let i = 0; i < 5; i++) { const r = 6 + ((time / 6 + i * 10) % 40); gN.fillStyle(0xc8c8d0, 0.5 * (1 - r / 46)).fillCircle(x + Math.sin(i) * 10, fy - dir * (20 + r), r * 0.5); }
        this.hand(gN, x, fy, 1.15 * s, E, true);
        gA.fillStyle(0xffd23a, 0.9).fillTriangle(x - 12 * s, fy - dir * 22 * s, x + 12 * s, fy - dir * 22 * s, x, fy - dir * (40 + Math.random() * 10) * s);
        return true;
      case 'punos':
        for (let i = 0; i < 5; i++) { const a = time / 160 + i * 1.26; this.hand(gN, x + Math.cos(a) * 40 * s, fy + Math.sin(a) * 22 * s, 0.5 * s, E, true); }
        this.hand(gN, x, fy, 0.95 * s, E, true);
        return true;
      case 'hielop':
        gN.fillStyle(0xd8f6ff, 0.75).fillRect(x - 44 * s, fy - 34 * s, 88 * s, 60 * s); gN.lineStyle(3, 0x2f7ab0, 1).strokeRect(x - 44 * s, fy - 34 * s, 88 * s, 60 * s);
        gA.fillStyle(0xffffff, 0.6).fillTriangle(x - 40 * s, fy - 30 * s, x - 10 * s, fy - 30 * s, x - 40 * s, fy);
        for (let i = 0; i < 4; i++) this.snowflake(gA, x - 30 * s + i * 20 * s, fy + 14 * s, 5 * s, 0xffffff, time / 300 + i);
        return true;
    }
    return false;
  }
  // Regates con animación propia
  dashSig(fam, E, p, v, px, py, time, clone) {
    const gN = this.gN, gA = this.gA, a = p.dash.dir, H = v.hist || [];
    const ghosts = (cols, al = 0.4) => [4, 8, 12].forEach((j, i) => { const h = H[j]; if (h) clone(v, h.x, h.y, al - i * 0.1, cols[i % cols.length]); });
    switch (fam) {
      case 'lluviaR':
        for (let i = 0; i < 4; i++) { const t = ((time / 400 + i * 0.25) % 1), mx = px - 50 + i * 30 + t * 30, my = py - 150 + t * 130; gA.lineStyle(6, E.main, 0.45).lineBetween(mx, my, mx - 20, my - 34); gA.fillStyle(E.tints[0], 0.95).fillCircle(mx, my, 5); }
        ghosts([E.main]);
        return true;
      case 'flama':
        for (let j = 1; j < H.length; j += 2) this.flame(gA, H[j].x + Math.sin(j) * 4, H[j].y + 2, 24 * (1 - j / H.length) + 8, 0xff5a10, 0xfff1a0, time, j);
        if (/rueda|infernal/i.test(p.dash.tech.name)) for (let i = 0; i < 8; i++) { const t = time / 40 + i * 0.785; gA.lineStyle(4, i % 2 ? 0xff5a10 : 0xffc23a, 0.9).lineBetween(px, py - 18, px + Math.cos(t) * 24, py - 18 + Math.sin(t) * 24); }
        return true;
      case 'remolino':
        for (let i = 0; i < 7; i++) { const yy = py - i * 8, r = 10 + i * 5, ph = time * 0.03 + i * 0.7; gA.lineStyle(3, i % 2 ? E.tints[1] : E.main, 0.85).strokeEllipse(px + Math.sin(ph) * 3, yy, r * 2, r * 0.5); }
        ghosts([E.tints[1]], 0.3);
        return true;
      case 'chispa': {
        const pts = H.filter((_, j) => j % 2 === 0).map((h, j) => ({ x: h.x + (j % 2 ? 10 : -10), y: h.y - 16 }));
        if (pts.length > 1) { gA.lineStyle(9, 0xffe040, 0.35).strokePoints(pts); gA.lineStyle(3, 0xffffff, 1).strokePoints(pts); }
        if (Math.random() < 0.5) this.bolt(gA, px, py - 18, px + (Math.random() - 0.5) * 70, py - 18 + (Math.random() - 0.5) * 50, 0xffe040, 2);
        ghosts([0xfff6a0], 0.35);
        return true;
      }
      case 'armadillo': {   // bola acorazada que rueda
        const r = 18, rot = time / 60;
        gN.fillStyle(0x8a6a4a, 1).fillCircle(px, py - 16, r); gN.lineStyle(2, 0x3a2a1a, 1).strokeCircle(px, py - 16, r);
        for (let i = 0; i < 4; i++) { const t = rot + i * 0.785; gN.lineStyle(2, 0x3a2a1a, 1).lineBetween(px + Math.cos(t) * r, py - 16 + Math.sin(t) * r, px - Math.cos(t) * r, py - 16 - Math.sin(t) * r); }
        for (let j = 3; j < H.length; j += 3) gN.fillStyle(0xc9b98a, 0.6 * (1 - j / H.length)).fillCircle(H[j].x, H[j].y, 6);
        if (v && v.spr) v.spr.setAlpha(0.15);
        return true;
      }
      case 'chicle': {
        const r = 22 + Math.sin(time / 90) * 4;
        gA.fillStyle(0xff8ac0, 0.45).fillCircle(px, py - 20, r); gN.lineStyle(3, 0xff4a9a, 0.9).strokeCircle(px, py - 20, r);
        gA.fillStyle(0xffffff, 0.7).fillEllipse(px - r * 0.4, py - 20 - r * 0.4, r * 0.5, r * 0.3);
        ghosts([0xff9ac8], 0.3);
        return true;
      }
      case 'luna':
        gA.lineStyle(10, 0xfff0a0, 0.8); gA.beginPath(); gA.arc(px, py - 20, 30, a + 0.6, a + 0.6 + 3.6, false); gA.strokePath();
        gA.lineStyle(4, 0xffffff, 1); gA.beginPath(); gA.arc(px, py - 20, 30, a + 0.6, a + 0.6 + 3.6, false); gA.strokePath();
        ghosts([0xfff6c0], 0.35);
        return true;
      case 'aurora':
        for (let r = 0; r < 3; r++) { const pts = H.map((h, j) => ({ x: h.x, y: h.y - 30 - r * 8 + Math.sin(j * 0.6 + time / 100 + r) * 6 })); if (pts.length > 1) gA.lineStyle(7, [0x5cff9a, 0x6fe3ff, 0xc080ff][r], 0.45).strokePoints(pts); }
        if (/cruz/i.test(p.dash.tech.name)) [[0, -46], [-14, -30], [14, -30], [0, -14], [6, -24]].forEach(([ox, oy], i) => this.star5(gA, px + ox, py + oy, i === 4 ? 3 : 6, 0xffffff, time / 400));
        return true;
      case 'paipay': {   // abanico gigante que sopla
        const ox = px - Math.cos(a) * 26, oy = py - 20 - Math.sin(a) * 26, sw = Math.sin(time / 50) * 0.4;
        for (let i = 0; i < 7; i++) { const t = a + Math.PI - 0.9 + i * 0.3 + sw; gN.fillStyle(i % 2 ? 0xffe6b0 : 0xe8c890, 1).fillTriangle(ox, oy, ox + Math.cos(t) * 40, oy + Math.sin(t) * 40, ox + Math.cos(t + 0.3) * 40, oy + Math.sin(t + 0.3) * 40); }
        for (let i = 0; i < 6; i++) { const o = (i - 2.5) * 8; gA.lineStyle(2, 0xffffff, 0.7).lineBetween(px - Math.sin(a) * o, py - 20 + Math.cos(a) * o, px - Math.sin(a) * o + Math.cos(a) * 36, py - 20 + Math.cos(a) * o + Math.sin(a) * 36); }
        return true;
      }
      case 'geiser':
        for (let j = 2; j < H.length; j += 3) { const h = H[j], hh = 50 * (1 - j / H.length) + 10; gN.fillStyle(0x6fc0ff, 0.6).fillRect(h.x - 6, h.y - hh, 12, hh); for (let i = 0; i < 3; i++) gN.fillStyle(0xffffff, 0.9).fillCircle(h.x + (i - 1) * 7, h.y - hh, 4); }
        return true;
      case 'topo':
        for (let j = 0; j < H.length; j += 2) gN.fillStyle(j % 4 ? 0x6e4622 : 0x8a5a2a, 1).fillEllipse(H[j].x, H[j].y + 2, 16, 8);
        gN.fillStyle(0x5a3a1a, 1).fillEllipse(px, py, 34, 14);
        if (v && v.spr) v.spr.setAlpha(0.25);
        return true;
      case 'triple':
        [-18, 18].forEach((o, i) => clone(v, px - Math.sin(a) * o, py + Math.cos(a) * o * 0.5, 0.55, i ? E.tints[1] : E.main));
        [3, 6].forEach((j, i) => { const h = H[j]; if (h) clone(v, h.x, h.y, 0.3 - i * 0.1, 0xffffff); });
        return true;
    }
    return false;
  }

  impact(m, time) {
    const k = m.t / m.life, E = EL(m.elem), gA = this.gA, gN = this.gN;
    if (m.kind === 'kickwave') {
      gA.lineStyle(6 * (1 - k), E.tints[0], 1 - k).strokeEllipse(m.x, m.y, 40 + k * 160, 18 + k * 70);
    } else if (m.kind === 'slam') {
      this.parada(m.fam, E, m.x, m.y, 1, time, m.team, Math.sin(Math.min(1, k * 3) * Math.PI) * (1 - k));
      gA.lineStyle(5 * (1 - k), 0xffffff, 1 - k).strokeCircle(m.x, m.y, 30 + k * 90);
    } else if (m.kind === 'shatter') {
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2, d = 10 + k * 70;
        gN.fillStyle(E.tints[i % E.tints.length], 1 - k).fillTriangle(m.x + Math.cos(a) * d, m.y + Math.sin(a) * d, m.x + Math.cos(a + 0.2) * (d + 10), m.y + Math.sin(a + 0.2) * (d + 10), m.x + Math.cos(a - 0.15) * (d + 6), m.y + Math.sin(a - 0.15) * (d + 6));
      }
    } else if (m.kind === 'boom') {
      gA.fillStyle(E.main, 0.6 * (1 - k)).fillCircle(m.x, m.y, 20 + k * 120);
      gA.lineStyle(8 * (1 - k), E.tints[0], 1 - k).strokeCircle(m.x, m.y, 30 + k * 160);
    } else if (m.kind === 'rocks') {
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2, d = 26 + k * 14, h = 40 * Math.sin(Math.min(1, k * 2.2) * Math.PI / 2) * (1 - Math.max(0, k - 0.6) * 2.5);
        if (h > 1) this.spike(gN, m.x + Math.cos(a) * d, m.y + Math.sin(a) * d * 0.5, h, E);
      }
    } else if (m.kind === 'slash') {
      for (let i = 0; i < 3; i++) {
        const a = -0.8 + i * 0.8 + k * 0.6;
        gA.lineStyle(5 * (1 - k), E.tints[0], 1 - k).beginPath(); gA.arc(m.x, m.y - 18, 24 + i * 8, a, a + 1.6, false); gA.strokePath();
      }
    } else if (m.kind === 'icerocks') {
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * Math.PI * 2, d = 24 + k * 12, h = 44 * Math.sin(Math.min(1, k * 2.2) * Math.PI / 2) * (1 - Math.max(0, k - 0.6) * 2.5);
        if (h > 1) this.spike(gN, m.x + Math.cos(a) * d, m.y + Math.sin(a) * d * 0.5, h, PAL.hielo);
      }
    } else if (m.kind === 'wall') {
      const h = Math.min(1, k * 4) * (1 - Math.max(0, k - 0.75) * 4);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
        const bx = m.x - 54 + c * 18 + (r % 2) * 9, by = m.y + 6 - r * 15 * h;
        if (h <= 0.05) continue;
        gN.fillStyle((r + c) % 2 ? 0x9a8a78 : 0xb8a890, 1).fillRect(bx, by - 14, 17, 14); gN.lineStyle(2, 0x4a3e30, 1).strokeRect(bx, by - 14, 17, 14);
      }
    } else if (m.kind === 'quake') {
      gN.lineStyle(4, 0x3a2410, 1 - k);
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2 + 0.3; let x = m.x, y = m.y; const pts = [{ x, y }];
        for (let j = 1; j <= 4; j++) { x += Math.cos(a + (j % 2 ? 0.4 : -0.4)) * 14 * Math.min(1, k * 3); y += Math.sin(a + (j % 2 ? 0.4 : -0.4)) * 7 * Math.min(1, k * 3); pts.push({ x, y }); }
        gN.strokePoints(pts);
      }
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, d = 10 + k * 50; gN.fillStyle(E.tints[E.tints.length - 1], 1 - k).fillCircle(m.x + Math.cos(a) * d, m.y - 20 * Math.sin(k * Math.PI) + Math.sin(a) * d * 0.5, 5); }
    } else if (m.kind === 'gravity') {
      gN.fillStyle(0x1a0028, 0.55 * (1 - k)).fillEllipse(m.x, m.y, 120, 50);
      for (let i = 0; i < 3; i++) { const r = ((1 - k) * 60 + i * 20) % 60 + 10; gA.lineStyle(3, 0xa040ff, 0.8 * (1 - k)).strokeEllipse(m.x, m.y, r * 2, r * 0.8); }
      for (let i = -1; i <= 1; i++) { const ax = m.x + i * 24, ay = m.y - 70 + k * 50; gA.lineStyle(4, 0xc080ff, 1 - k).lineBetween(ax, ay, ax, ay + 24); gA.fillStyle(0xc080ff, 1 - k).fillTriangle(ax - 7, ay + 22, ax + 7, ay + 22, ax, ay + 32); }
    } else if (m.kind === 'web') {
      this.web(gN, m.x, m.y - 14, 26 + Math.min(1, k * 4) * 30, k * 0.5, 0xf4f4f4);
      gN.lineStyle(2, 0xffffff, 1 - k);
    } else if (m.kind === 'whale') {   // ballena que sale del suelo
      const h = Math.sin(Math.min(1, k * 1.4) * Math.PI) * 50, wx = m.x, wy = m.y - h;
      if (h > 2) {
        gN.fillStyle(0x2a5aa8, 1).fillEllipse(wx, wy, 120, 54); gN.fillStyle(0xe8f0ff, 1).fillEllipse(wx + 6, wy + 12, 90, 22);
        gN.lineStyle(3, 0x0a2a6a, 1).strokeEllipse(wx, wy, 120, 54);
        gN.fillStyle(0x2a5aa8, 1).fillTriangle(wx - 56, wy - 4, wx - 86, wy - 26, wx - 80, wy + 12);
        gN.fillStyle(0xffffff, 1).fillCircle(wx + 34, wy - 8, 5); gN.fillStyle(0x0a1a3a, 1).fillCircle(wx + 35, wy - 8, 2.5);
        for (let i = 0; i < 5; i++) gN.fillStyle(0x9fe0ff, 0.9).fillCircle(wx + 20 + (i - 2) * 6, wy - 30 - Math.abs(i - 2) * -4 - k * 30, 4);
      }
      gN.lineStyle(3, 0x6fc0ff, 1 - k).strokeEllipse(m.x, m.y + 6, 140 * (0.5 + k), 30 * (0.5 + k));
    } else if (m.kind === 'train') {   // tren que cruza
      const tx = m.x - 140 + k * 280, ty = m.y - 10;
      for (let c = 0; c < 3; c++) {
        const x0 = tx - c * 46;
        gN.fillStyle(c ? 0x3a6ad8 : 0xd8361a, 1).fillRect(x0 - 20, ty - 26, 42, 26); gN.lineStyle(2, 0x101820, 1).strokeRect(x0 - 20, ty - 26, 42, 26);
        gN.fillStyle(0xfff0a0, 1).fillRect(x0 - 14, ty - 22, 10, 8).fillRect(x0 + 2, ty - 22, 10, 8);
        gN.fillStyle(0x202020, 1).fillCircle(x0 - 10, ty + 2, 6).fillCircle(x0 + 12, ty + 2, 6);
      }
      gN.fillStyle(0x202020, 1).fillRect(tx + 14, ty - 40, 8, 14);
      for (let i = 0; i < 4; i++) gN.fillStyle(0xd8d8d8, 0.7).fillCircle(tx + 18 - i * 14, ty - 46 - i * 6, 6 + i * 2);
    } else if (m.kind === 'stomp') {   // pisotón: onda y polvo
      for (let i = 0; i < 3; i++) gN.lineStyle(5 * (1 - k), 0x6e4622, 1 - k).strokeEllipse(m.x, m.y, (40 + i * 30) * (0.4 + k), (14 + i * 10) * (0.4 + k));
      for (let i = 0; i < 10; i++) { const t = i / 10 * Math.PI * 2, d = 20 + k * 70; gN.fillStyle(0xc9b98a, 0.8 * (1 - k)).fillCircle(m.x + Math.cos(t) * d, m.y + Math.sin(t) * d * 0.4 - Math.sin(k * Math.PI) * 14, 7); }
    } else if (m.kind === 'firewall') {
      const h = Math.sin(Math.min(1, k * 1.6) * Math.PI);
      for (let i = 0; i < 9; i++) this.flame(gA, m.x - 64 + i * 16, m.y + 4, (30 + (i % 3) * 14) * h + 4, 0xff5a10, 0xfff1a0, time, i);
    } else if (m.kind === 'flashb') {
      gA.fillStyle(0xffffe0, 0.8 * (1 - k)).fillCircle(m.x, m.y - 16, 30 + k * 120);
      for (let i = 0; i < 12; i++) { const t = i / 12 * Math.PI * 2; gA.lineStyle(3, 0xffffff, 1 - k).lineBetween(m.x + Math.cos(t) * 20, m.y - 16 + Math.sin(t) * 20, m.x + Math.cos(t) * (40 + k * 120), m.y - 16 + Math.sin(t) * (40 + k * 120)); }
    } else if (m.kind === 'whirl') {
      for (let i = 0; i < 6; i++) { const yy = m.y - i * 10, r = 14 + i * 7, ph = time * 0.03 + i; gA.lineStyle(4, i % 2 ? E.tints[1] || 0xffffff : E.main, 0.9 * (1 - k)).strokeEllipse(m.x + Math.sin(ph) * 4, yy, r * 2 * (0.6 + k * 0.6), r * 0.5); }
    } else if (m.kind === 'mist') {
      for (let i = 0; i < 9; i++) { const t = i / 9 * Math.PI * 2 + time / 400, d = 16 + k * 40; gN.fillStyle(i % 2 ? 0xff9ac8 : 0xd080ff, 0.45 * (1 - k)).fillCircle(m.x + Math.cos(t) * d, m.y - 14 + Math.sin(t) * d * 0.5, 14 + k * 10); }
    } else if (m.kind === 'doppel') {
      for (let i = 0; i < 4; i++) { const t = i / 4 * Math.PI * 2 + k * 3, d = 30 + k * 20; gN.fillStyle(0x201030, 0.7 * (1 - k)).fillEllipse(m.x + Math.cos(t) * d, m.y - 18 + Math.sin(t) * d * 0.4, 18, 34); gN.lineStyle(2, 0xc080ff, 0.9 * (1 - k)).strokeEllipse(m.x + Math.cos(t) * d, m.y - 18 + Math.sin(t) * d * 0.4, 18, 34); gN.fillStyle(0xff3030, 0.9 * (1 - k)).fillCircle(m.x + Math.cos(t) * d - 3, m.y - 28 + Math.sin(t) * d * 0.4, 2).fillCircle(m.x + Math.cos(t) * d + 3, m.y - 28 + Math.sin(t) * d * 0.4, 2); }
    } else if (m.kind === 'puff') {
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; gN.fillStyle(0xe8e8e8, 0.7 * (1 - k)).fillCircle(m.x + Math.cos(a) * k * 26, m.y - 10 + Math.sin(a) * k * 12, 8 * (1 - k * 0.5)); }
    }
  }
}

/* =====================================================================
   APP: menús, modos, gacha, plantilla, recorridos y pantallas (DOM).
   ===================================================================== */
const ELEM_LABEL = { fuego: TX('Fuego'), viento: TX('Viento'), bosque: TX('Bosque'), 'montaña': TX('Montaña'), neutro: '—' };
const TYPE_LABEL = { tiro: TX('Tiro'), regate: TX('Regate'), bloqueo: TX('Bloqueo'), parada: TX('Parada') };
const ROLE_LABEL = { POR: TX('Portero'), DEF: TX('Defensa'), MED: TX('Medio'), DEL: TX('Delantero') };
const ROLES4 = ['POR', 'DEF', 'MED', 'DEL'];
// Abreviatura del puesto para mostrar (en inglés: GK, DF, MF, FW) y curso del jugador («3º curso» / «Year 3»)
const RAB = r => (I18N.en() ? { POR: 'GK', DEF: 'DF', MED: 'MF', DEL: 'FW' }[r] : null) || r;
const yearTx = n => TX('{0}º curso', n);
const ordTx = n => I18N.en() ? n + ([, 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] || 'th') : n + 'º';
const FIELD_LABEL = { normal: TX('Campo clásico'), noche: TX('Campo nocturno'), niebla: TX('Campo nocturno con niebla'), jungla: TX('Campo de la jungla'), atardecer: TX('Campo al atardecer'), nieve: TX('Campo nevado'), acero: TX('Estadio de acero'), cielo: TX('Campo celestial'), volcan: TX('Campo volcánico') };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chip = e => `<span class="chip ${EL(e).css}">${ELEM_LABEL[e] || e}</span>`;
const rchip = r => `<span class="rar ${r}">${RARITY[r].label}</span>`;
const stars = n => `<span class="stars">${'★'.repeat(n)}<s>${'★'.repeat(MAX_STARS - n)}</s></span>`;
const TYPE_ICON = { tiro: '⚽', regate: '💨', bloqueo: '🛡️', parada: '✋' };
const techLine = t => `<span class="tline">${chip(t.elem)}<b>${esc(t.name)}</b><i>${TYPE_LABEL[t.type] || ''} · ${t.power}</i></span>`;

const VERSION = '0.31.13';
const DISCORD_URL = 'https://discord.gg/G6SyT2rZW', DISCORD_GIFT = 10;   // servidor de la comunidad (lo hizo un colega de Fran)
const BETA = false;   // solo la beta privada (artefacto) lo pone a true: ahí está el modo desarrollador
const App = (() => {
  const $ = id => document.getElementById(id);
  const settings = { minutes: 3, techMode: 'boton', formation: '1-2-1-1', slowmo: 1, intro: 1, controls: 'auto', autoSwitch: 1 };
  try { Object.assign(settings, JSON.parse(localStorage.getItem('inazuma-ajustes') || '{}')); } catch (_) {}
  const saveSettings = () => { try { localStorage.setItem('inazuma-ajustes', JSON.stringify(settings)); } catch (_) {} };
  // Fuera de la beta no hay modo desarrollador: si alguien lo tenía encendido, se apaga sin avisar
  if (!BETA && (settings.dev || settings.debug || settings.hwForce || settings.xmForce || settings.devWin || settings.speed)) {
    settings.dev = false; settings.debug = 0; settings.hwForce = false; settings.xmForce = false; settings.devWin = 0; settings.speed = 0; saveSettings();
  }
  Profile.load();
  Halloween.forced = Halloween.forced || !!settings.hwForce;   // la beta lo trae encendido de serie
  Navidad.forced = Navidad.forced || !!settings.xmForce;

  const api = { match: null, matchSheet: null, running: false, scene: null, mode: null, run: null, settings, pick: null, draft: null };
  const body = $('screenBody');
  api.inMatch = () => api.running;

  function show(id) {
    ['screen', 'pause'].forEach(k => $(k).hidden = k !== id);
    Pad.show(!id);
    $('hud').hidden = !!id && id !== 'pause';
    $('pauseBtn').hidden = !!id;
  }
  // Fondo de cada pantalla: imágenes del juego (carpeta ui/); sin fondo = rayas azules del menú
  function screen(html, bg) {
    const sc = $('screen');
    sc.classList.remove('hwtheme', 'xmtheme'); sc.querySelectorAll('.hwfx, .xmfx').forEach(x => x.remove());
    sc.classList.toggle('bg-cover', !!bg);
    sc.style.backgroundImage = bg ? `url("ui/${bg}.png")` : '';
    body.classList.toggle('cardbg-clear', !!bg);
    body.innerHTML = html; sc.scrollTop = 0; show('screen');
  }
  const crestOf = key => (TEAM(key) || {}).crest || 1;
  // Barra fija arriba con «Volver» y el título; barra fija abajo para el botón principal
  const top = (title, id = 'back', label = TX('Volver')) => `<div class="top"><button class="ghost back" id="${id}">◀ ${label}</button><h2>${title}</h2></div>`;
  const bottom = html => `<div class="bottom">${html}</div>`;
  const face = (ref, size) => Sprites.face(ref, size);
  // Cara del mánager (Ray Dark no está en las hojas de sprites: tiene su retrato en ui/raydark.png)
  function mgrFace(id, size) {
    const pd = PLAYER(id);
    if (pd && pd.faceImg) { const i = document.createElement('img'); i.src = pd.faceImg; i.alt = ''; i.width = i.height = size; i.className = 'mgrcrest pix'; return i; }
    return face(Sprites.refOf(pd), size);
  }
  function wallet() { const P = Profile.data; return `<div class="runbar"><span>🪙 ${P.coins}</span><span>🎟️ ${P.tickets}</span><span title="${TX('Rayos Raimon')}">⚡ ${P.rayos}</span><span>👥 ${Profile.ids().length}</span></div>`; }
  function opts(group, key, list, obj = settings) {
    return `<div class="group"><label>${group}</label><div class="opts">${list.map(([v, t]) =>
      `<button data-k="${key}" data-v="${v}" aria-pressed="${obj[key] == v}">${t}</button>`).join('')}</div></div>`;
  }
  function bindOpts(obj, onChange) {
    body.querySelectorAll('.opts button[data-k]').forEach(b => b.addEventListener('click', () => {
      obj[b.dataset.k] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v;
      b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      onChange && onChange(b.dataset.k);
    }));
  }
  const formSelect = (obj, key = 'formation') => `<div class="group"><label>${TX('Formación')}</label><select id="formSel">${Object.entries(FORMATIONS).map(([k, f]) =>
    `<option value="${k}" ${obj[key] === k ? 'selected' : ''}>${k} · ${f.name}</option>`).join('')}</select></div>`;
  document.addEventListener('pointerdown', () => Sound.unlock(), { capture: true });

  /* ---------- Menú principal: modos ---------- */
  function renderMenu() {
    if (!Profile.data.firstDone) return renderWelcome();
    if (Cloud.state.conflict) return renderConflict(renderMenu);
    let traida = false; try { traida = !!localStorage.getItem('inazuma-traida'); if (traida) localStorage.removeItem('inazuma-traida'); } catch (_) {}
    if (traida) { setTimeout(() => UI.toast(Cloud.enabled() && !Cloud.loggedIn() ? TX('¡Partida traída! Crea una cuenta en 👤 Cuenta para tenerla siempre a salvo') : TX('¡Partida traída!'), 3500), 300); }
    const P = Profile.data, runs = Run.all(), RUN_ORDER = ['story', 'special', 'chain', 'infinite'], open = RUN_ORDER.filter(k => runs[k]).map(k => runs[k]);
    const done = P.story.s1.done;
    screen(`<div class="nm"><div class="nm-tools">
        <button class="nm-ico" id="mGift" title="${TX('🎁 Código de regalo')}" aria-label="${TX('🎁 Código de regalo')}">🎁</button>
        <button class="nm-ico" id="mSaves" title="${TX('👤 Cuenta')}${Cloud.loggedIn() ? ' · ' + esc(Cloud.user()) : ''}" aria-label="${TX('👤 Cuenta')}">👤${Cloud.loggedIn() ? '<span class="nm-on"></span>' : ''}</button>
        <button class="nm-ico" id="mNews" title="${TX('📰 Novedades')} · v${VERSION}" aria-label="${TX('📰 Novedades')}">📰${settings.seenNews !== VERSION ? '<i class="newdot"></i>' : ''}</button>
        <button class="nm-ico discord" id="mDiscord" title="${P.discordGift ? TX('💬 Únete al Discord de la comunidad') : TX('💬 Únete al Discord · +10 tickets 🎟️')}" aria-label="Discord">💬${P.discordGift ? '' : '<span class="nm-badge">+10 🎟️</span>'}</button>
      </div>
      <div class="title nm-title"><img class="logo" id="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${TX('5 contra 5 · roguelite')}</span></div>${wallet()}
      ${Halloween.active() ? hwMenuBtn() : ''}
      ${Navidad.active() ? xmMenuBtn() : ''}
      ${Limitado.active() ? lmMenuBtn() : ''}
      ${open.map(r => `<button class="cta" data-cont="${r.kind}">${TX('Continuar:')} ${esc(r.name)}<small>${TX('Partido')} ${r.index + 1}${r.kind === 'infinite' ? '' : TX(' de ') + r.schedule.length} · ${'♥'.repeat(r.lives)}</small></button>`).join('')}
      <div class="modes">
        <button class="mode nm-hero" id="mCareer"><span class="cicon">🏆</span><span class="mt"><b>${TX('Modo Carrera')}</b><small>${Career.data && !Career.data.over ? TX('Temporada ') + Career.data.season + ' · ' + DIV_NAME[Career.myDiv()] + TX(' · semana ') + Career.data.week : TX('Eres el mánager: 3 divisiones y ascensos')}</small></span></button>
        <div class="nm-tiles">
        <button class="mode nm-tile" id="mStory">${Sprites.crest(1)}<span class="mt"><b>${TX('Historia')}</b><small>${P.story.s4.done ? TX('Etapas 1, 2 y 3 completadas ✓') : P.story.s3.done ? TX('Etapa 3 · Fase 2 abierta (mejor: ') + P.story.s4.best + ')' : P.story.s2.done ? TX('Etapa 3 abierta: el Inazuma 3') : done ? TX('Etapa 1 ✓ · Etapa 2 abierta (mejor: ') + P.story.s2.best + ')' : TX('Etapa 1 · mejor: ') + P.story.s1.best + TX(' victorias')}</small></span></button>
        <button class="mode nm-tile" id="mSpecial">${Sprites.crest(588)}<span class="mt"><b>${TX('Equipos especiales')}</b><small>${SPECIALS.filter(x => Profile.unlocked({ special: x })).length} ${TX('de')} ${SPECIALS.length} ${TX('abiertos')}</small></span></button>
        <button class="mode nm-tile ${done ? '' : 'locked'}" id="mChain">${Sprites.crest(599)}<span class="mt"><b>${TX('Cadenas')}</b><small>${done ? TX('Desafíos cortos · premio: Rayo Raimon') : TX('🔒 Completa la Etapa 1')}</small></span></button>
        <button class="mode nm-tile ${done ? '' : 'locked'}" id="mInf">${Sprites.crest(15)}<span class="mt"><b>${TX('Infinito')}</b><small>${done ? TX('Por oleadas · récord: ') + P.infBest : TX('🔒 Completa la Etapa 1')}</small></span></button>
        </div>
      </div>
      <div data-cloudline>${cloudLine()}</div>
      ${Controls.pc() ? `<p class="note gpnote">${TX('🎮 ¿Tienes mando? Conéctalo y juega: Xbox, PlayStation o genérico.')} <small>${TX('Los botones están en Ajustes.')}</small></p>` : ''}
      ${open.map(r => `<button class="ghost" data-aband="${r.kind}">${TX('Abandonar:')} ${esc(r.name)}</button>`).join('')}
      <button class="ver" id="ver">v${VERSION}${settings.dev ? TX(' · dev') : ''}</button>
      <nav class="nm-dock">
        <button class="nm-dk main" id="mGacha"><i>🎰</i><span>${TX('Gacha')}</span><em class="nm-badge">${P.tickets} 🎟️</em></button>
        <button class="nm-dk" id="mTeam"><i>👥</i><span>${TX('Plantilla')}</span></button>
        <button class="nm-dk" id="mQuick"><i>⚽</i><span>${TX('Partido rápido')}</span></button>
        <button class="nm-dk" id="mSound"><i>⚙️</i><span>${TX('Ajustes')}</span></button>
      </nav></div>`, 'bg_title_hw');
    let vt = 0, vtT = 0;   // 20 toques seguidos en la versión: modo desarrollador
    $('ver').onclick = () => {
      const now = Date.now(); vt = now - vtT < 1500 ? vt + 1 : 1; vtT = now;
      if (!BETA) return;
      if (vt >= 20) { vt = 0; if (!settings.dev) { settings.dev = true; settings.devWin = 1; saveSettings(); UI.toast(TX('Modo desarrollador activado'), 1800); } Sound.sfx('reveal'); renderDev(); }
      else if (vt >= 15) UI.toast(TX('Faltan ') + (20 - vt) + TX(' toques…'), 600);
    };
    // Cada modo guarda su partida: si ya tienes una de ese modo, el botón la continúa (puedes tener varias a la vez)
    const resume = k => { if (!runs[k]) return false; api.run = runs[k]; openRun(); return true; };
    body.querySelectorAll('[data-cont]').forEach(b => b.onclick = () => resume(b.dataset.cont));
    body.querySelectorAll('[data-aband]').forEach(b => b.onclick = () => {
      if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = TX('¿Seguro? Toca otra vez para abandonar'); return; }
      Run.clear(b.dataset.aband); if (api.run && api.run.kind === b.dataset.aband) api.run = null; renderMenu();
    });
    $('mStory').onclick = () => { if (!resume('story')) renderStory(); };
    $('mCareer').onclick = () => renderCareer();
    $('mSpecial').onclick = () => { if (!resume('special')) renderSpecials(); };
    $('mChain').onclick = () => { if (!done) return UI.toast(TX('Completa la Etapa 1 de la Historia')); if (!resume('chain')) renderChains(); };
    $('mInf').onclick = () => { if (!done) return UI.toast(TX('Completa la Etapa 1 de la Historia')); if (!resume('infinite')) { newDraft('infinite', {}); tutorial('infinite'); } };
    $('mGacha').onclick = renderGacha; $('mTeam').onclick = () => renderTeam();
    $('mGift').onclick = renderGift;
    $('mNews').onclick = () => renderNews(renderMenu);
    $('mDiscord').onclick = () => {
      Sound.sfx('click');
      // Regalo de bienvenida: 10 tickets la primera vez que se pulsa (una sola vez por perfil)
      if (!P.discordGift) { P.discordGift = Date.now(); P.tickets += DISCORD_GIFT; Profile.save(); setTimeout(() => { renderMenu(); UI.toast(TX('¡Gracias por unirte! +10 tickets 🎟️'), 2600); }, 400); }
      try { window.open(DISCORD_URL, '_blank', 'noopener'); } catch (_) { location.href = DISCORD_URL; }
    };
    const newPl = Limitado.pendingNew(settings.seenPlayers);   // jugadores nuevos: sale su pantalla al abrir el juego (y luego las Novedades)
    if (newPl.length) setTimeout(() => { if ($('mNews')) showNewPlayers(newPl, 0, renderMenu); }, 450);
    else if (settings.seenNews !== VERSION && settings.newsShown !== VERSION) { settings.newsShown = VERSION; saveSettings(); setTimeout(() => { if ($('mNews')) renderNews(renderMenu); }, 400); }   // la primera vez tras actualizar
    $('mSaves').onclick = () => renderAccount(renderMenu);
    body.querySelector('[data-cloudline]').onclick = () => renderAccount(renderMenu);
    $('mQuick').onclick = startQuick; $('mSound').onclick = renderSettings;
    if ($('mHw')) $('mHw').onclick = renderHalloween;
    if ($('mXm')) $('mXm').onclick = renderNavidad;
    if ($('mLm')) $('mLm').onclick = renderLimitado;
    if (Navidad.active()) xmDecor(); else if (Halloween.active()) hwDecor();   // el menú lleva el tema del evento activo (niebla y calabazas, o nieve)
    if (settings.seenNews === VERSION || settings.newsShown === VERSION) setTimeout(aviso, 500);
    Sound.music('menu');
  }

  const mini = keys => `<span class="mini">${keys.map(k => Sprites.crest(crestOf(k))).join('')}</span>`;
  /* ---------- Tutoriales: se enseñan la primera vez que entras en cada modo (y con el botón ❓) ---------- */
  const TUTS = {
    story: [TX('Historia'), TX('Recorre los torneos del 1, 2 y 3 con tu equipo. Es') + ' <b>' + TX('roguelite') + '</b>' + TX(': tienes vidas ♥, tras cada victoria eliges una mejora (técnica, habilidad o fichaje temporal) y todo eso se pierde al acabar el intento. Completar una etapa la deja superada para siempre y abre más modos.')],
    special: [TX('Equipos especiales'), TX('Un solo partido, sin segundas oportunidades. Si ganas,') + ' <b>' + TX('su estrella se une a tu plantilla') + '</b> ' + TX('(o sube una ★ si ya la tenías).')],
    chains: [TX('Cadenas'), TX('Varios partidos seguidos') + ' <b>' + TX('sin recuperar vidas') + '</b>' + TX('. Al completarla: Rayo Raimon, tickets, monedas y la estrella del último rival. La primera vez, una técnica legendaria. Sin perder vidas, 💎 extra. Medallas 🥉🥈🥇 al repetirlas.')],
    infinite: [TX('Infinito'), TX('Oleadas de rivales cada vez más fuertes hasta que te quedes sin vidas. Cada 5 oleadas, un jefe. Intenta batir tu récord.') + ' <b>' + TX('∞ Al ganar a cada jefe eliges una versión especial de un jugador (del 2, del 3…) que no sale en el gacha: cuanto más lejos llegues, más rara.') + '</b>'],
    gacha: [TX('Gacha'), TX('Gasta tickets para tirar: gira la manivela de la máquina y abre las cápsulas. Probabilidades: común 60 %, rara 28 %, épica 10 %, legendaria 2 % (cada 10 tiradas sin épica, la siguiente lo es seguro). Los repetidos suben estrellas a tu jugador.')],
    team: [TX('Plantilla'), '<b>' + TX('Mi equipo') + '</b>' + TX(': elige formación y quién juega (a portería solo porteros).') + ' <b>' + TX('Jugadores') + '</b>' + TX(': busca y entrena (monedas) o usa Rayos Raimon para subir estrellas.') + ' <b>' + TX('Técnicas') + '</b>' + TX(': equipa las supertécnicas.')],
    career: [TX('Modo Carrera'), TX('Eres el mánager de un instituto: 3 divisiones, Copa y playoffs. Cada semana haz una actividad (entrenar, ojear…), juega o simula el partido y ficha (también a jugadores del extranjero). Tus titulares') + ' <b>' + TX('suben o bajan') + '</b> ' + TX('según su rendimiento. Los jugadores se') + ' <b>' + TX('gradúan al acabar 6º curso') + '</b> ' + TX('y la cantera trae chavales nuevos. Cuida la fama: si llega a 0, cierran el club. Cada 3 temporadas,') + ' <b>' + TX('el Mundial') + '</b>.'],
    wc: [TX('El Mundial'), TX('Eres el seleccionador de Inazuma Japón. Convoca a') + ' <b>' + TX('10 jugadores') + '</b> ' + TX('(dos equipos de 5) y elige qué 5 juegan cada partido. Grupo de 4 (pasan 2), semifinal y final, con penaltis si hay empate.')],
  };
  function tutorial(key, force) {
    const T = TUTS[key]; settings.tuts = settings.tuts || {};
    if (!T || (settings.tuts[key] && !force)) return;
    settings.tuts[key] = 1; saveSettings();
    const d = document.createElement('div'); d.className = 'tutbox';
    d.innerHTML = `<div class="tutin"><h2>❓ ${T[0]}</h2><p>${T[1]}</p><button class="cta">${TX('¡Entendido!')}</button></div>`;
    d.querySelector('button').onclick = () => d.remove();
    document.body.appendChild(d);
  }
  // Aviso que sale una sola vez al entrar al menú (cambia AVISO.key para sacar uno nuevo)
  const AVISO = { key: 'munecos-ie3', title: TX('🎨 ¡Muñecos del Inazuma 3 arreglados!'),
    text: TX('Muchos jugadores del 3 llevaban en el campo un muñeco que no era el suyo. Ahora todos llevan su muñeco de verdad, sacado del juego original: su peinado, sus colores y su tono de piel. Mac Robingo, Hector Helio, Edgar Partinus, Dylan Keith, Byron Love y muchos más ya se ven como tienen que verse.') };
  function aviso() {
    if (!Profile.data.firstDone || settings.aviso === AVISO.key || document.querySelector('.tutbox') || $('newsOk') || !$('mNews')) return;   // no encima de las Novedades
    settings.aviso = AVISO.key; saveSettings();
    const d = document.createElement('div'); d.className = 'tutbox';
    d.innerHTML = `<div class="tutin"><h2>${AVISO.title}</h2><p>${AVISO.text}</p><button class="cta">${TX('¡A jugar!')}</button></div>`;
    d.querySelector('button').onclick = () => d.remove();
    document.body.appendChild(d);
  }
  const tutBtn = key => `<button class="ghost mini tutq" data-tut="${key}">${TX('❓ Cómo funciona')}</button>`;
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tut]'); if (b) tutorial(b.dataset.tut, true); });
  function renderStory() {
    const P = Profile.data;
    screen(`${top(TX('Historia'))}${wallet()}
      <div class="modes">${STAGES.map((s, i) => { const open = s.available && Profile.unlocked({ stage: s }), ord = STAGE_ORDER[s.key] || [];
        return `<button class="mode ${open ? '' : 'locked'}" data-st="${s.key}">${Sprites.crest([1, 33, 3021, 3057][i] || 15)}<span class="mt"><b>${s.name}</b>
        <small>${open ? (P.story[s.key] && P.story[s.key].done ? TX('Completada ✓ · puedes repetirla') : ord.length ? TX('De ') + esc(ord[0]) + ' a ' + esc(ord[ord.length - 1]) : '') : '🔒 ' + s.note}</small>${open && ord.length ? mini(ord) : ''}</span></button>`; }).join('')}</div>
      <p class="note">${TX('Cada intento es roguelite: las técnicas, habilidades y fichajes se pierden al acabar. La etapa que completas queda superada para siempre y abre las Cadenas, el Infinito y más equipos especiales.')}</p>
`, 'bg_team');
    body.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
      const st = STAGES.find(s => s.key === b.dataset.st);
      if (!st.available || !Profile.unlocked({ stage: st })) return UI.toast(st.note);
      newDraft('story', { diff: 'medio', stage: st.key });
    });
    tutorial('story'); if (!$('tutq-story')) body.insertAdjacentHTML('beforeend', `<p class="note" id="tutq-story">${tutBtn('story')}</p>`);
    $('back').onclick = renderMenu;
  }
  function renderSpecials() {
    const P = Profile.data;
    screen(`${top(TX('Especiales'))}${wallet()}
      <p class="note">${TX('Un solo partido, sin segundas oportunidades. Si ganas, te llevas a su estrella para tu plantilla (o una estrella más si ya la tienes).')}</p>
      <div class="modes" id="sp"></div>`);
    SPECIALS.forEach(x => {
      const t = TEAM(x.key), open = Profile.unlocked({ special: x });
      const star = teamStar(t.key, true);
      const b = document.createElement('button'); b.className = 'mode' + (open ? '' : ' locked');
      b.innerHTML = `${Sprites.crest(t.crest)}<span class="mt"><b>${esc(t.name)}</b><small>${open ? `${FIELD_LABEL[TEAM_FIELD[t.key]] || ''} ${TX('· Premio:')} ${star ? esc(star.name) : '—'}${P.specials[t.key] ? TX(' · ganado ×') + P.specials[t.key] : ''}`
        : '🔒 ' + (x.unlock === 'done' ? TX('Completa la Etapa 1') : x.unlock === 'done2' ? TX('Completa la Etapa 2') : `${TX('Gana')} ${x.unlock} ${TX('partidos en la Etapa 1')}`)}</small></span>`;
      b.onclick = () => { if (!open) return UI.toast(TX('Aún bloqueado')); newDraft('special', { team: t.key }); };
      $('sp').appendChild(b);
    });
    tutorial('special'); if (!$('tutq-special')) body.insertAdjacentHTML('beforeend', `<p class="note" id="tutq-special">${tutBtn('special')}</p>`);
    $('back').onclick = renderMenu;
  }
  function renderChains() {
    const P = Profile.data;
    screen(`${top(TX('Cadenas'))}${wallet()}
      <p class="note">${TX('Varios partidos seguidos sin recuperar vidas.')} <b>${TX('Premios por completarla:')}</b> ${TX('⚡ Rayo Raimon · 5 🎟️ · 150 🪙 · la estrella del último rival se une a tu plantilla (o sube una ★).')}
      <b>${TX('La primera vez:')}</b> ${TX('una técnica legendaria y 10 🎟️ más.')} <b>${TX('Sin perder vidas:')}</b> +5 🎟️ 💎. <b>${TX('Medallas:')}</b> ${TX('🥉 1 vez · 🥈 3 veces · 🥇 5 veces (15 🎟️ y otro Rayo).')}</p>
      <div class="modes">${CHAINS.map(c => { const open = Profile.unlocked({ chain: c });
        return `<button class="mode${open ? '' : ' locked'}" data-ch="${c.key}">${Sprites.crest(crestOf(c.teams[0]))}<span class="mt"><b>${open ? '' : '🔒 '}${esc(c.name)}</b><small>${open ? esc(c.desc) : c.needs === 's4' ? TX('Completa la Etapa 3') : TX('Completa la Etapa 2')} · ${c.teams.length} ${TX('partidos ·')} ${'♥'.repeat(c.lives)}${P.chains[c.key] ? ' · ' + (P.chains[c.key] >= 5 ? '🥇' : P.chains[c.key] >= 3 ? '🥈' : '🥉') + ' ×' + P.chains[c.key] + (P.chainPerfect && P.chainPerfect[c.key] ? ' 💎' : '') : TX(' · 📜 técnica legendaria la 1.ª vez')}</small>${mini(c.teams)}</span></button>`; }).join('')}</div>`);
    body.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => {
      const c = CHAINS.find(x => x.key === b.dataset.ch);
      if (!Profile.unlocked({ chain: c })) return UI.toast(TX('Se abre al completar la Etapa 2'));
      newDraft('chain', { chain: c.key });
    });
    tutorial('chains'); if (!$('tutq-chains')) body.insertAdjacentHTML('beforeend', `<p class="note" id="tutq-chains">${tutBtn('chains')}</p>`);
    $('back').onclick = renderMenu;
  }

  function renderWelcome() {
    screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${TX('¡Bienvenido!')}</span></div>
      <p class="note">${TX('Tu plantilla empieza vacía. Haz tu tirada de bienvenida:')} <b>${TX('10 jugadores')}</b> ${TX('del juego, con un')} <b>${TX('portero asegurado')}</b> ${TX('y al menos uno épico o mejor. Además recibes 60 monedas para entrenar.')}</p>
      <p class="note">${TX('Probabilidades: común 60 % · rara 28 % · épica 10 % · legendaria 2 %. Cada 10 tiradas sin épica, la siguiente lo es seguro.')}</p>
      <button class="cta" id="wPull">${TX('Tirada de bienvenida ×10')}</button>
      ${Cloud.enabled() && !Cloud.loggedIn() ? `<div class="grid2"><button class="ghost big" id="wIn">${TX('Ya tengo cuenta')}<small>${TX('Recuperar mi partida')}</small></button><button class="ghost big" id="wUp">${TX('Crear cuenta')}<small>${TX('Guardar en la nube')}</small></button></div>` : ''}
      <button class="ghost" id="wLang">🌐 ${I18N.lang === 'en' ? 'Español' : 'English'}</button>
      <button class="ghost big" id="wOld">${TX('¿Jugabas en la versión antigua?')}<small>${TX('Trae tu partida aquí')}</small></button>
      <div data-cloudline>${Cloud.loggedIn() ? cloudLine() : ''}</div>`, 'bg_title');
    $('wOld').onclick = () => renderTransfer(renderMenu);
    $('wLang').onclick = () => { const l = I18N.lang === 'en' ? 'es' : 'en'; I18N.set(l); screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${l === 'en' ? 'Changing language…' : 'Cambiando el idioma…'}</span></div>`, 'bg_title'); setTimeout(() => location.reload(), 250); };
    if ($('wIn')) { $('wIn').onclick = () => renderLogin(renderMenu, 'in'); $('wUp').onclick = () => renderLogin(renderMenu, 'up'); }
    $('wPull').onclick = () => {
      Sound.unlock();
      Profile.data.pity = 0;
      const res = Gacha.pull(10, { keeper: true });
      Profile.data.firstDone = true; Profile.data.coins += 60; Profile.save();
      renderMachine(res, 1, renderMenu, TX('Tirada de bienvenida'));
    };
  }

  /* ---------- Gacha ---------- */
  function renderGacha() {
    const P = Profile.data, B = BANNERS.find(b => b.id === P.banner) || BANNERS[0];
    screen(`${top(TX('Gacha'))}${wallet()}
      <div class="banners" id="bn"></div>
      <p class="note">${TX('Común 60 % · Rara 28 % · Épica 10 % · Legendaria 2 %. En el tramo legendario, la mitad de las veces sale una')} <b>${TX('técnica legendaria')}</b> ${TX('(de las más fuertes del juego).')}<br>
      ${TX('Épica o mejor asegurada cada 10 tiradas (llevas')} ${P.pity} ${TX('de 10). Los repetidos suben una estrella (máx.')} ${MAX_STARS}${TX('); con 5 estrellas, o una técnica repetida, dan monedas.')}</p>
      <p class="note">${TX('Tickets: Historia (1 por victoria y 3 al completarla), Especiales (2), Cadenas (2 al completarlas) e Infinito (2 por oleada especial).')}</p>
      ${bottom(`<div class="grid2"><button class="cta" id="g1" ${P.tickets < 1 ? 'disabled' : ''}>${TX('Tirar ×1')}<small>${TX('1 ticket')}</small></button><button class="cta" id="g10" ${P.tickets < 10 ? 'disabled' : ''}>${TX('Tirar ×10')}<small>${TX('10 tickets')}</small></button></div>`)}`, 'bg_green');
    if (Limitado.active()) {
      const lim = document.createElement('button'); lim.className = 'banner-card lim';
      lim.innerHTML = `<span class="limbg"></span>${lmBolts()}<span class="mt"><b>⚡ ${TX('Gacha de Bai Long')}</b><small>${TX('LIMITADO · 100 🎟️ = 10 jugadores · nota 100')}</small></span>`;
      lim.onclick = () => { Sound.sfx('click'); renderLimitado(); };
      $('bn').appendChild(lim);
    }
    BANNERS.forEach(b => {
      const seenL = new Set(), legs = GAME.players.filter(p => p.banner === b.id && p.rarity === 'legendaria').filter(p => { const k = p.full.replace(/ \((IE2|IE3)\)$/, ''); return !seenL.has(k) && seenL.add(k); });
      const el = document.createElement('button');
      el.className = 'banner-card' + (b.id === B.id ? ' sel' : '');
      const n = GAME.players.filter(p => p.banner === b.id && p.gacha !== false).length;
      el.innerHTML = `${Sprites.crest(b.crest)}<span class="mt"><b>${esc(b.name)}</b><small>${esc(b.desc)} · ${n} ${TX('jugadores')}</small><span class="legs"></span></span>`;
      legs.forEach(p => el.querySelector('.legs').appendChild(face(Sprites.refOf(p), 32)));
      el.onclick = () => { P.banner = b.id; Profile.save(); Sound.sfx('click'); renderGacha(); };
      $('bn').appendChild(el);
    });
    const go = n => { if (P.tickets < n) return; P.tickets -= n; Profile.save(); renderMachine(Gacha.pull(n, { banner: B.id }), B.id, renderGacha); };
    $('g1').onclick = () => go(1); $('g10').onclick = () => go(10); $('back').onclick = renderMenu;
    tutorial('gacha'); if (!$('tutq-gacha')) body.insertAdjacentHTML('beforeend', `<p class="note" id="tutq-gacha">${tutBtn('gacha')}</p>`);
  }
  // Legendarios de Halloween: marco naranja apagado, estilo miedo (clase .hw)
  const hwc = pd => pd && pd.halloween ? ' hw' : pd && pd.xmas ? ' xm' : pd && pd.lim ? ' lim' : pd && pd.inf ? ' inf' : '';   // marcos especiales: Halloween y versiones del Infinito
  // Carta de un resultado del gacha (jugador o técnica legendaria)
  function makeCard(r) {
    const c = document.createElement('div');
    c.className = 'gcard ' + r.tier + (r.tech == null ? hwc(PLAYER(r.id)) : '');
    if (r.tech != null) {
      const t = TECH(r.tech);
      c.classList.add('techcard', EL(t.elem).css);
      c.innerHTML = `<div class="scroll">${TYPE_ICON[t.type] || '★'}</div><div class="gname">${esc(t.name)}</div>
        <div class="gmeta">${rchip('legendaria')}${chip(t.elem)}</div><div class="gmeta">${TYPE_LABEL[t.type]} · ${t.power}</div>
        <div class="gtag">${r.isNew ? TX('¡TÉCNICA NUEVA!') : '+' + r.coins + ' 🪙'}</div>`;
      return c;
    }
    const pd = PLAYER(r.id);
    c.appendChild(face(Sprites.refOf(pd), 80));
    c.insertAdjacentHTML('beforeend', `<div class="gname">${pd.halloween ? '🎃' : pd.xmas ? '🎄' : pd.lim ? '⚡' : ''}${esc(pd.name)}</div><div class="gmeta">${rchip(r.tier)}<span>${RAB(pd.role)}</span>${chip(pd.elem)}</div>
      <div class="gtag">${r.isNew ? 'NUEVO' : r.coins ? '+' + r.coins + ' 🪙' : '★ ' + r.star}</div>`);
    return c;
  }
  function renderReveal(res, done, title = TX('¡Nuevos jugadores!')) {
    screen(`<h2>${title}</h2><div class="reveal" id="rv"></div>${bottom('<button class="cta" id="ok" hidden>' + TX('Continuar') + '</button>')}`, 'bg_whistle');
    const box = $('rv');
    res.forEach((r, i) => {
      const c = makeCard(r); c.style.animationDelay = (i * 0.18) + 's'; box.appendChild(c);
      setTimeout(() => Sound.sfx(r.tier === 'limitada' || r.tier === 'legendaria' || r.tier === 'epica' ? 'reveal' : 'click'), i * 180);
    });
    setTimeout(() => { $('ok').hidden = false; }, res.length * 180 + 300);
    $('ok').onclick = done;
  }

  /* ---------- Máquina de gachapón ---------- */
  const MACHINE_COLORS = { 1: ['#e8c21a', '#1f4fc0'], 2: ['#2a5fd0', '#e8e8f0'], 3: ['#5a1a8a', '#e01a4a'], 4: ['#b8742a', '#f2e6c0'], [HW_BANNER]: ['#ff7a1a', '#6a2aa8'], [XM_BANNER]: ['#d8283a', '#1f7a3a'], [LM_BANNER]: ['#1f3fb0', '#ffd23a'] };
  const CAP_COLORS = { comun: '#b8bcc8', rara: '#3f8fff', epica: '#a24cff', legendaria: '#ffcc22', limitada: '#35d6ff' };
  function drawMachine(cv, st) {
    const g = cv.getContext('2d'), [c1, c2] = st.colors;
    g.imageSmoothingEnabled = false; g.clearRect(0, 0, 96, 128);
    const ring = (x, y, r, fill, line) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = 2; g.stroke(); } };
    // cúpula con cápsulas dentro
    ring(48, 40, 34, 'rgba(190,225,255,.25)', '#10183a');
    g.save(); g.beginPath(); g.arc(48, 40, 32, 0, Math.PI * 2); g.clip();
    st.balls.forEach(b => {
      const y = b.y + (st.shake ? Math.sin(st.t / 30 + b.x) * 1.5 : 0);
      g.beginPath(); g.arc(b.x, y, 6, Math.PI, 0); g.fillStyle = b.c; g.fill();
      g.beginPath(); g.arc(b.x, y, 6, 0, Math.PI); g.fillStyle = '#f4f4f4'; g.fill();
      g.strokeStyle = '#10183a'; g.lineWidth = 1; g.beginPath(); g.arc(b.x, y, 6, 0, Math.PI * 2); g.stroke();
    });
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2; g.beginPath(); g.arc(48, 40, 27, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
    // cuerpo
    g.fillStyle = '#10183a'; g.fillRect(12, 66, 72, 58);
    g.fillStyle = c1; g.fillRect(14, 68, 68, 54);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(70, 68, 12, 54);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(14, 68, 4, 54);
    g.fillStyle = c2; g.fillRect(14, 72, 68, 6);
    g.fillStyle = '#10183a'; g.fillRect(10, 64, 76, 4);
    if (st.crest && st.crest.complete) g.drawImage(st.crest, 22, 82, 24, 24);
    // ranura de salida
    g.fillStyle = '#10183a'; g.fillRect(30, 108, 24, 12); g.fillStyle = '#2a2a3a'; g.fillRect(32, 110, 20, 8);
    g.fillStyle = c2; g.fillRect(32, 110, 20, 3);
    // manivela
    ring(66, 94, 9, '#9aa4b8', '#10183a'); ring(66, 94, 4, '#5a6478');
    const hx = 66 + Math.cos(st.crank) * 9, hy = 94 + Math.sin(st.crank) * 9;
    g.strokeStyle = '#10183a'; g.lineWidth = 4; g.beginPath(); g.moveTo(66, 94); g.lineTo(hx, hy); g.stroke();
    g.strokeStyle = '#d8dce6'; g.lineWidth = 2; g.beginPath(); g.moveTo(66, 94); g.lineTo(hx, hy); g.stroke();
    ring(hx, hy, 4, c2, '#10183a');
    // pie
    g.fillStyle = '#10183a'; g.fillRect(16, 122, 64, 6);
  }
  function renderMachine(res, bannerId, done, title) {
    const B = BANNERS.find(b => b.id === bannerId) || (bannerId === HW_BANNER ? { name: TX('Sobre Calabaza'), crest: 3 } : bannerId === XM_BANNER ? { name: TX('Sobre Navideño'), crest: 36 } : bannerId === LM_BANNER ? { name: TX('Gacha de Bai Long'), crest: 3021 } : BANNERS[0]);
    screen(`<h2>${esc(title || B.name)}</h2>
      <div class="gmach"><canvas id="mc" width="96" height="128"></canvas><div class="gm-hint" id="mHint">${Controls.pc() ? TX('Arrastra la manivela en círculo (o pulsa Espacio)') : TX('Gira la manivela con el dedo ↻')}</div></div>
      <div class="caps" id="caps"></div>
      ${bottom('<div class="grid2"><button class="ghost" id="mSkip">' + TX('Saltar') + '</button><button class="cta" id="mAll" hidden>' + TX('Abrir todas') + '</button></div><button class="cta" id="mOk" hidden>' + TX('Continuar') + '</button>')}`, 'bg_whistle');
    const cv = $('mc'), caps = $('caps');
    const crest = new Image(); crest.src = `ui/crest${B.crest}.png`;
    let seed = bannerId * 97; const rr = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const ballCols = Object.values(CAP_COLORS);
    const balls = Array.from({ length: 22 }, () => { const a = rr() * Math.PI * 2, d = Math.sqrt(rr()) * 26; return { x: 48 + Math.cos(a) * d, y: 40 + Math.abs(Math.sin(a)) * d * 0.9, c: ballCols[Math.floor(rr() * 4)] }; });
    const st = { colors: MACHINE_COLORS[bannerId] || MACHINE_COLORS[1], crest, balls, crank: -Math.PI / 2, shake: false, t: 0 };
    let raf = 0, dispensed = false, alive = true;
    const loop = t => { if (!alive || !cv.isConnected) return; st.t = t; drawMachine(cv, st); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    crest.onload = () => drawMachine(cv, st);
    // Cápsulas: a veces una legendaria llega disfrazada de épica y sube al abrirla
    const items = res.map(r => ({ r, shown: (r.tier === 'legendaria' || r.tier === 'limitada') && Math.random() < 0.5 ? 'epica' : r.tier, opened: false }));
    let left = items.length;
    const finish = () => { $('mHint').textContent = TX('¡Ya están todas abiertas!'); $('mAll').hidden = true; $('mSkip').hidden = true; $('mOk').hidden = false; };
    function openCap(it, el) {
      if (it.opened) return Promise.resolve(); it.opened = true;
      return new Promise(res2 => {
        const up = it.shown !== it.r.tier;
        el.classList.add('shake'); Sound.sfx('click');
        setTimeout(() => {
          if (up) { el.classList.remove('t-' + it.shown); el.classList.add('t-' + it.r.tier, 'upgrade'); Sound.sfx('tech'); flash(CAP_COLORS[it.r.tier] || CAP_COLORS.legendaria); }
          setTimeout(() => {
            el.classList.remove('shake'); el.classList.add('open');
            if (it.r.tier === 'limitada') { lmBoom(); Sound.sfx('reveal'); } else if (it.r.tier === 'legendaria' || it.r.tier === 'epica') { flash(CAP_COLORS[it.r.tier]); Sound.sfx('reveal'); } else Sound.sfx('pass');
            setTimeout(() => {
              const card = makeCard(it.r); card.classList.add('fromcap'); if (items.length === 1) card.classList.add('solo'); el.replaceWith(card);
              if (--left === 0) finish();
              res2();
            }, 260);
          }, up ? 700 : 0);
        }, up ? 900 : 380);
      });
    }
    function flash(col) { const f = document.createElement('div'); f.className = 'gflash'; f.style.background = col; document.body.appendChild(f); setTimeout(() => f.remove(), 450); }
    function dispense() {
      if (dispensed) return; dispensed = true; st.shake = true;
      $('mHint').textContent = items.length > 1 ? TX('Toca cada cápsula para abrirla') : TX('Toca la cápsula para abrirla');
      items.forEach((it, i) => setTimeout(() => {
        const el = document.createElement('button');
        el.className = 'cap t-' + it.shown + (items.length === 1 ? ' big' : '');
        el.innerHTML = '<i class="ct"></i><i class="cb"></i>';
        el.onclick = () => openCap(it, el);
        caps.appendChild(el); Sound.sfx('pass');
        if (i === items.length - 1) { st.shake = false; if (items.length > 1) $('mAll').hidden = false; }
      }, 250 + i * 140));
    }
    // Manivela: arrastrar en círculo; un toque la hace girar sola
    let drag = null, total = 0, lastTick = 0;
    const center = () => { const b = cv.getBoundingClientRect(); return { x: b.left + 66 / 96 * b.width, y: b.top + 94 / 128 * b.height }; };
    const turn = d => { st.crank += d; total += Math.abs(d); if (total - lastTick > Math.PI / 2) { lastTick = total; Sound.sfx('click'); } if (total >= Math.PI * 2) dispense(); };
    const autoSpin = () => { if (dispensed || autoSpin.on) return; autoSpin.on = true; let k = 0; const iv = setInterval(() => { turn(Math.PI / 10); if (++k >= 20 || dispensed) { clearInterval(iv); dispense(); } }, 35); };
    cv.addEventListener('pointerdown', e => { if (dispensed) return; const c = center(); drag = { a: Math.atan2(e.clientY - c.y, e.clientX - c.x), moved: 0, t: Date.now() }; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
    cv.addEventListener('pointermove', e => {
      if (!drag || dispensed) return; const c = center(), a = Math.atan2(e.clientY - c.y, e.clientX - c.x);
      let d = a - drag.a; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      drag.a = a; drag.moved += Math.abs(d); turn(Math.abs(d));
    });
    cv.addEventListener('pointerup', () => { if (drag && drag.moved < 0.3) autoSpin(); drag = null; });
    const key = e => { if (!cv.isConnected) return removeEventListener('keydown', key); if ((e.code === 'Space' || e.code === 'Enter') && !dispensed) { e.preventDefault(); autoSpin(); } };
    addEventListener('keydown', key);
    $('mAll').onclick = async () => { $('mAll').hidden = true; for (const el of [...caps.querySelectorAll('.cap')]) { const it = items[[...caps.children].indexOf(el)]; await openCap(it, el); await new Promise(r => setTimeout(r, 120)); } };
    $('mSkip').onclick = () => { alive = false; cancelAnimationFrame(raf); removeEventListener('keydown', key); renderReveal(res, done, title || TX('¡Nuevos jugadores!')); };
    $('mOk').onclick = () => { alive = false; cancelAnimationFrame(raf); removeEventListener('keydown', key); done(); };
  }

  /* =====================================================================
     EVENTO DE HALLOWEEN (pantalla propia, fuera de los modos)
     ===================================================================== */
  function hwMenuBtn() {
    const H = Halloween.data(), gift = H.daily !== Halloween.today() || Halloween.loginReady(), n = Halloween.pending();
    return `<button class="mode hwmode" id="mHw"><span class="cicon">🎃</span><span class="mt"><b>${TX('Halloween')}${gift || n ? ' <i class="hwdot"></i>' : ''}</b><small>${TX('Sobre Calabaza, partido jefe y retos')} · 🍬 ${H.candy}${gift ? ' · ' + TX('🎁 regalo') : ''}</small></span></button>`;
  }
  // Calabazas y niebla suave
  function hwDecor() {
    const sc = $('screen'); sc.classList.add('hwtheme');
    sc.insertAdjacentHTML('afterbegin', `<div class="hwfx" aria-hidden="true"><i class="fog f1"></i><i class="fog f2"></i><i class="fog f3"></i>
      <span class="pk p1">🎃</span><span class="pk p2">🎃</span></div>`);
  }
  function renderHalloween() {
    if (!Halloween.active()) return renderMenu();
    const gift = Halloween.daily(), H = Halloween.data(), d = Halloween.daysLeft();
    const legs = HW_LEGENDS.map(L => PLAYER(L.id)).filter(Boolean);
    const retos = Halloween.RETOS.map(R => {
      const st = Halloween.retoState(R), v = Math.min(R.goal, R.val(H));
      return `<div class="hwreto ${st}"><div><b>${R.name}</b><small>${R.desc} · ${v}/${R.goal}</small><small>${TX('Premio:')} ${R.reward.candy} 🍬 · ${R.reward.tickets} 🎟️</small></div>
        ${st === 'got' ? '<span class="hwok">✓</span>' : `<button class="cta" data-reto="${R.id}" ${st === 'ready' ? '' : 'disabled'}>${TX('Recoger')}</button>`}</div>`;
    }).join('');
    const daily = Halloween.DAILY.map(R => {
      const st = Halloween.dailyState(R), v = Math.min(R.goal, R.val(Halloween.dayData()));
      return `<div class="hwreto ${st}"><div><b>${R.name}</b><small>${R.desc} · ${v}/${R.goal}</small><small>${TX('Premio:')} ${R.reward.candy} 🍬 · ${R.reward.tickets} 🎟️</small></div>
        ${st === 'got' ? '<span class="hwok">✓</span>' : `<button class="cta" data-daily="${R.id}" ${st === 'ready' ? '' : 'disabled'}>${TX('Recoger')}</button>`}</div>`;
    }).join('');
    screen(`${top('🎃 ' + TX('Halloween'))}
      <div class="runbar hwbar"><span>🍬 ${H.candy}</span><span>🎟️ ${Profile.data.tickets}</span><span>${d <= 1 ? TX('¡Último día!') : TX('Quedan') + ' ' + d + ' ' + TX('días')}</span></div>
      <h3>${TX('Premios por entrar')} <small>${TX('5 días del evento (no hace falta que sean seguidos)')}</small></h3>
      <div class="hwlogin">${Halloween.LOGIN.map((R, i) => { const L = Halloween.login(), st = i < L.n ? 'got' : i === L.n && Halloween.loginReady() ? 'ready' : 'locked';
        return `<div class="hwday ${st}"><small>${TX('Día {0}', i + 1)}</small><span>${st === 'got' ? '✓' : R.icon}</span><small>${esc(R.label)}</small></div>`; }).join('')}</div>
      ${Halloween.loginReady() ? `<button class="cta" id="hwLogin">${TX('🎁 Recoger el premio del día {0}', Halloween.login().n + 1)}</button>` : Halloween.login().n < Halloween.LOGIN.length ? `<p class="note">${TX('Vuelve mañana a por el siguiente premio.')}</p>` : ''}
      <h3>${TX('Sobre Calabaza')}</h3>
      <div class="hwlegs" id="hwLegs"></div>
      <p class="note">${TX('Solo jugadores villanos y de miedo, y 6 legendarios exclusivos de Halloween.')}<br>
        ${TX('Legendario 3 % · Épica 15 % · Rara 32 % · Común 50 %. Legendario asegurado a las')} ${HW_PITY} ${TX('tiradas (llevas')} ${H.pity}${TX(').')}</p>
      <div class="grid2"><button class="cta" id="hw1" ${H.candy < HW_PRICE ? 'disabled' : ''}>${TX('Tirar ×1')}<small>${HW_PRICE} 🍬</small></button><button class="cta" id="hw10" ${H.candy < HW_PRICE * 10 ? 'disabled' : ''}>${TX('Tirar ×10')}<small>${HW_PRICE * 10} 🍬</small></button></div>
      <h3>${TX('Partido jefe')}</h3>
      <button class="mode hwmode" id="hwBoss">${Sprites.crest(3)}<span class="mt"><b>${TX('Instituto Ocultismo')}</b><small>${TX('Versión jefe · campo nocturno con niebla')}<br>${Halloween.bossDone() ? TX('Premio de hoy ya cobrado (puedes repetir)') : TX('Gánale: +60 🍬 (una vez al día)')}</small></span></button>
      <h3>${TX('Retos del día')} <small>${TX('se renuevan cada medianoche')}</small></h3>
      <div class="hwretos">${daily}</div>
      <h3>${TX('Retos del evento')}</h3>
      <div class="hwretos">${retos}</div>
      <p class="note">${Halloween.rayUnlocked() ? '<b>' + TX('✓ Ray Dark ya es mánager en el Modo Carrera (+10 % de ingresos).') + '</b>' : TX('Completa los 3 retos y') + ' <b>' + TX('Ray Dark') + '</b> ' + TX('se podrá elegir como mánager en el Modo Carrera, con') + ' <b>' + TX('+10 % de ingresos') + '</b>.'}</p>
      <p class="note">${TX('Caramelos: +5 por partido en cualquier modo (+10 más si ganas), +20 de regalo cada día, +60 al ganar al Ocultismo jefe, los retos del día y los del evento. El evento dura hasta el 3 de noviembre; los jugadores que consigas son tuyos para siempre.')}</p>`, 'bg_title');
    hwDecor();
    legs.forEach(p => { const w = document.createElement('div'); w.className = 'hwleg' + (Profile.data.coll[p.id] ? ' own' : ''); w.appendChild(face(Sprites.refOf(p), 48)); w.insertAdjacentHTML('beforeend', `<small>${esc(p.full.replace(/ \(Halloween\)$/, ''))}</small>`); $('hwLegs').appendChild(w); });
    const go = n => { const res = Halloween.pull(n); if (!res) return UI.toast(TX('No tienes caramelos suficientes')); renderMachine(res, HW_BANNER, renderHalloween, TX('Sobre Calabaza')); };
    $('hw1').onclick = () => go(1); $('hw10').onclick = () => go(10);
    $('hwBoss').onclick = startBoss;
    if ($('hwLogin')) $('hwLogin').onclick = () => {
      const R = Halloween.LOGIN[Halloween.login().n];
      if (R.pick) return renderHwPick();
      const out = Halloween.claimLogin(); if (!out) return;
      Sound.sfx('reveal');
      if (out.players.length) return renderReveal(out.players, renderHalloween, TX('¡Premio del día {0}!', out.day));
      UI.toast(TX('Día {0}:', out.day) + ' ' + R.label, 2400); renderHalloween();
    };
    body.querySelectorAll('[data-daily]').forEach(b => b.onclick = () => {
      const r = Halloween.claimDaily(b.dataset.daily); if (!r) return;
      Sound.sfx('reveal'); renderHalloween(); UI.toast('+' + r.candy + ' 🍬 · +' + r.tickets + ' 🎟️', 2600);
    });
    body.querySelectorAll('[data-reto]').forEach(b => b.onclick = () => {
      const r = Halloween.claim(b.dataset.reto); if (!r) return;
      Sound.sfx('reveal'); renderHalloween();
      UI.toast(r.ray ? TX('¡Ray Dark desbloqueado como mánager!') : '+' + r.reward.candy + ' 🍬 · +' + r.reward.tickets + ' 🎟️', 3200);
    });
    $('back').onclick = renderMenu;
    if (gift) setTimeout(() => UI.toast(TX('🎁 Regalo diario:') + ' +' + gift + ' 🍬', 2400), 300);
    Sound.music('menu');
  }
  // Día 4: eliges 1 de 3 jugadores de +80 (las 3 opciones no cambian aunque salgas)
  function renderHwPick() {
    const ids = Halloween.pickOptions();
    screen(`${top('🎃 ' + TX('Elige a tu jugador'), 'back', TX('Volver'))}
      <p class="note">${TX('Premio del día 4: quédate con uno de estos tres jugadores de media 80 o más.')}</p>
      <div class="hwpick" id="hwPick"></div>`, 'bg_title');
    hwDecor();
    ids.forEach(id => {
      const pd = PLAYER(id), b = document.createElement('button'); b.className = 'hwpk';
      b.appendChild(face(Sprites.refOf(pd), 72));
      b.insertAdjacentHTML('beforeend', `<b>${esc(pd.name)}</b><small>${rchip(pd.rarity)} ${RAB(pd.role)} ${chip(pd.elem)}</small><small>${TX('media')} ${Math.round(Halloween.avgOf(pd))}${Profile.data.coll[id] ? ' · ' + TX('ya lo tienes (+1 ★)') : ''}</small>`);
      b.onclick = () => { const out = Halloween.claimLogin(id); if (!out) return; Sound.sfx('reveal'); renderReveal(out.players, renderHalloween, TX('¡Premio del día {0}!', out.day)); };
      $('hwPick').appendChild(b);
    });
    $('back').onclick = renderHalloween;
  }
  function startBoss() {
    const T = savedTeam(), F = FORMATIONS[T.formation], pos = layout(F.roles), L = T.ids;
    if (L.some(x => x == null)) return UI.toast(TX('Completa tu equipo en Plantilla'));
    api.mode = 'hwboss';
    const A = { name: TX('Tu equipo'), players: L.map((id, i) => {
      const pd = PLAYER(id);
      return Object.assign(buildMatchPlayer(id, F.roles[i], k => statOf(id, Profile.owned(id), k), runMember(id).techs, [], i, pos[i]), { sprite: mySprite(pd, F.roles[i]) });
    }) };
    startMatch({ A, B: Halloween.bossTeam() }, false, 'niebla', 'match', 'Occult');
  }
  function renderBossEnd(s, candy, bonus) {
    const a = s.score.A, b = s.score.B;
    screen(`<img class="finimg" src="ui/fin.png" alt="${TX('Fin del partido')}"><h2>${a > b ? TX('¡Has vencido al Ocultismo!') : a < b ? TX('El Ocultismo te ha asustado…') : TX('Empate')}</h2>
      ${scoreLine(s)}
      <p class="note">${candy ? '+' + candy + ' 🍬 ' + TX('por jugar') : ''}${bonus ? '<br><b>+' + bonus + ' 🍬 ' + TX('¡premio del jefe!') + '</b>' : a > b ? '<br>' + TX('El premio del jefe ya lo cobraste hoy.') : ''}</p>
      <button class="cta" id="again">${TX('Volver a Halloween')}</button><button class="ghost" id="toMenu">${TX('Menú')}</button>`, a > b ? 'ill27' : a < b ? 'ill15' : 'ill28');
    $('again').onclick = renderHalloween; $('toMenu').onclick = renderMenu;
  }

  /* =====================================================================
     EVENTO DE NAVIDAD (pantalla propia, fuera de los modos; misma estructura que Halloween)
     ===================================================================== */
  function xmMenuBtn() {
    const H = Navidad.data(), gift = H.daily !== Navidad.today() || Navidad.loginReady(), n = Navidad.pending();
    return `<button class="mode xmmode" id="mXm"><span class="cicon">🎄</span><span class="mt"><b>${TX('Navidad')}${gift || n ? ' <i class="xmdot"></i>' : ''}</b><small>${TX('Sobre Navideño, partido jefe y retos')} · ❄️ ${H.snow}${gift ? ' · ' + TX('🎁 regalo') : ''}</small></span></button>`;
  }
  // Nieve cayendo y adornos
  function xmDecor() {
    const sc = $('screen'); sc.classList.add('xmtheme');
    const flakes = Array.from({ length: 16 }, (_, i) => `<i class="fl" style="left:${(i * 37 + 8) % 100}%;animation-duration:${9 + (i * 7) % 8}s;animation-delay:-${(i * 5) % 12}s;font-size:${10 + (i * 3) % 9}px">❄</i>`).join('');
    sc.insertAdjacentHTML('afterbegin', `<div class="xmfx" aria-hidden="true">${flakes}<span class="xt x1">🎄</span><span class="xt x2">🎁</span></div>`);
  }
  function renderNavidad() {
    if (!Navidad.active()) return renderMenu();
    const gift = Navidad.daily(), H = Navidad.data(), d = Navidad.daysLeft();
    const legs = XM_LEGENDS.map(L => PLAYER(L.id)).filter(Boolean);
    const row = (R, key, st, v) => `<div class="xmreto ${st}"><div><b>${R.name}</b><small>${R.desc} · ${v}/${R.goal}</small><small>${TX('Premio:')} ${R.reward.snow} ❄️ · ${R.reward.tickets} 🎟️</small></div>
        ${st === 'got' ? '<span class="xmok">✓</span>' : `<button class="cta" data-${key}="${R.id}" ${st === 'ready' ? '' : 'disabled'}>${TX('Recoger')}</button>`}</div>`;
    const retos = Navidad.RETOS.map(R => row(R, 'xreto', Navidad.retoState(R), Math.min(R.goal, R.val(H)))).join('');
    const daily = Navidad.DAILY.map(R => row(R, 'xdaily', Navidad.dailyState(R), Math.min(R.goal, R.val(Navidad.dayData())))).join('');
    screen(`${top('🎄 ' + TX('Navidad'))}
      <div class="runbar xmbar"><span>❄️ ${H.snow}</span><span>🎟️ ${Profile.data.tickets}</span><span>${d <= 1 ? TX('¡Último día!') : TX('Quedan') + ' ' + d + ' ' + TX('días')}</span></div>
      <h3>${TX('Premios por entrar')} <small>${TX('5 días del evento (no hace falta que sean seguidos)')}</small></h3>
      <div class="xmlogin">${Navidad.LOGIN.map((R, i) => { const L = Navidad.login(), st = i < L.n ? 'got' : i === L.n && Navidad.loginReady() ? 'ready' : 'locked';
        return `<div class="xmday ${st}"><small>${TX('Día {0}', i + 1)}</small><span>${st === 'got' ? '✓' : R.icon}</span><small>${esc(R.label)}</small></div>`; }).join('')}</div>
      ${Navidad.loginReady() ? `<button class="cta" id="xmLogin">${TX('🎁 Recoger el premio del día {0}', Navidad.login().n + 1)}</button>` : Navidad.login().n < Navidad.LOGIN.length ? `<p class="note">${TX('Vuelve mañana a por el siguiente premio.')}</p>` : ''}
      <h3>${TX('Sobre Navideño')}</h3>
      <div class="xmlegs" id="xmLegs"></div>
      <p class="note">${TX('Jugadores de nieve y hielo, y 6 legendarios exclusivos de Navidad.')}<br>
        ${TX('Legendario 3 % · Épica 15 % · Rara 32 % · Común 50 %. Legendario asegurado a las')} ${XM_PITY} ${TX('tiradas (llevas')} ${H.pity}${TX(').')}</p>
      <div class="grid2"><button class="cta" id="xm1" ${H.snow < XM_PRICE ? 'disabled' : ''}>${TX('Tirar ×1')}<small>${XM_PRICE} ❄️</small></button><button class="cta" id="xm10" ${H.snow < XM_PRICE * 10 ? 'disabled' : ''}>${TX('Tirar ×10')}<small>${XM_PRICE * 10} ❄️</small></button></div>
      <h3>${TX('Partido jefe')}</h3>
      <button class="mode xmmode" id="xmBoss">${Sprites.crest(36)}<span class="mt"><b>${TX('Alpino')}</b><small>${TX('Versión jefe · campo nevado')}<br>${Navidad.bossDone() ? TX('Premio de hoy ya cobrado (puedes repetir)') : TX('Gánale: +60 ❄️ (una vez al día)')}</small></span></button>
      <h3>${TX('Retos del día')} <small>${TX('se renuevan cada medianoche')}</small></h3>
      <div class="xmretos">${daily}</div>
      <h3>${TX('Retos del evento')}</h3>
      <div class="xmretos">${retos}</div>
      <p class="note">${Navidad.giftUnlocked() ? '<b>' + TX('✓ Ya has recibido a Shawn Froste de Navidad.') + '</b>' : TX('Completa los 3 retos y recibirás de regalo a') + ' <b>' + TX('Shawn Froste de Navidad') + '</b>.'}</p>
      <p class="note">${TX('Copos: +5 por partido en cualquier modo (+10 más si ganas), +20 de regalo cada día, +60 al ganar al Alpino jefe, los retos del día y los del evento. El evento dura hasta el 6 de enero; los jugadores que consigas son tuyos para siempre.')}</p>`, 'bg_title');
    xmDecor();
    legs.forEach(p => { const w = document.createElement('div'); w.className = 'xmleg' + (Profile.data.coll[p.id] ? ' own' : ''); w.appendChild(face(Sprites.refOf(p), 48)); w.insertAdjacentHTML('beforeend', `<small>${esc(p.full.replace(/ \(Navidad\)$/, ''))}</small>`); $('xmLegs').appendChild(w); });
    const go = n => { const res = Navidad.pull(n); if (!res) return UI.toast(TX('No tienes copos suficientes')); renderMachine(res, XM_BANNER, renderNavidad, TX('Sobre Navideño')); };
    $('xm1').onclick = () => go(1); $('xm10').onclick = () => go(10);
    $('xmBoss').onclick = startXmBoss;
    if ($('xmLogin')) $('xmLogin').onclick = () => {
      const R = Navidad.LOGIN[Navidad.login().n];
      if (R.pick) return renderXmPick();
      const out = Navidad.claimLogin(); if (!out) return;
      Sound.sfx('reveal');
      if (out.players.length) return renderReveal(out.players, renderNavidad, TX('¡Premio del día {0}!', out.day));
      UI.toast(TX('Día {0}:', out.day) + ' ' + R.label, 2400); renderNavidad();
    };
    body.querySelectorAll('[data-xdaily]').forEach(b => b.onclick = () => {
      const r = Navidad.claimDaily(b.dataset.xdaily); if (!r) return;
      Sound.sfx('reveal'); renderNavidad(); UI.toast('+' + r.snow + ' ❄️ · +' + r.tickets + ' 🎟️', 2600);
    });
    body.querySelectorAll('[data-xreto]').forEach(b => b.onclick = () => {
      const r = Navidad.claim(b.dataset.xreto); if (!r) return;
      Sound.sfx('reveal');
      if (r.gift) return renderReveal([r.gift], renderNavidad, TX('¡Regalo de Navidad!'));
      renderNavidad(); UI.toast('+' + r.reward.snow + ' ❄️ · +' + r.reward.tickets + ' 🎟️', 3200);
    });
    $('back').onclick = renderMenu;
    if (gift) setTimeout(() => UI.toast(TX('🎁 Regalo diario:') + ' +' + gift + ' ❄️', 2400), 300);
    Sound.music('menu');
  }
  // Día 4: eliges 1 de 3 jugadores de +80 (las 3 opciones no cambian aunque salgas)
  function renderXmPick() {
    const ids = Navidad.pickOptions();
    screen(`${top('🎄 ' + TX('Elige a tu jugador'), 'back', TX('Volver'))}
      <p class="note">${TX('Premio del día 4: quédate con uno de estos tres jugadores de media 80 o más.')}</p>
      <div class="xmpick" id="xmPick"></div>`, 'bg_title');
    xmDecor();
    ids.forEach(id => {
      const pd = PLAYER(id), b = document.createElement('button'); b.className = 'xmpk';
      b.appendChild(face(Sprites.refOf(pd), 72));
      b.insertAdjacentHTML('beforeend', `<b>${esc(pd.name)}</b><small>${rchip(pd.rarity)} ${RAB(pd.role)} ${chip(pd.elem)}</small><small>${TX('media')} ${Math.round(Navidad.avgOf(pd))}${Profile.data.coll[id] ? ' · ' + TX('ya lo tienes (+1 ★)') : ''}</small>`);
      b.onclick = () => { const out = Navidad.claimLogin(id); if (!out) return; Sound.sfx('reveal'); renderReveal(out.players, renderNavidad, TX('¡Premio del día {0}!', out.day)); };
      $('xmPick').appendChild(b);
    });
    $('back').onclick = renderNavidad;
  }
  function startXmBoss() {
    const T = savedTeam(), F = FORMATIONS[T.formation], pos = layout(F.roles), L = T.ids;
    if (L.some(x => x == null)) return UI.toast(TX('Completa tu equipo en Plantilla'));
    api.mode = 'xmboss';
    const A = { name: TX('Tu equipo'), players: L.map((id, i) => {
      const pd = PLAYER(id);
      return Object.assign(buildMatchPlayer(id, F.roles[i], k => statOf(id, Profile.owned(id), k), runMember(id).techs, [], i, pos[i]), { sprite: mySprite(pd, F.roles[i]) });
    }) };
    startMatch({ A, B: Navidad.bossTeam() }, false, 'nieve', 'match', XM_BOSS_TEAM);
  }
  function renderXmBossEnd(s, snow, bonus) {
    const a = s.score.A, b = s.score.B;
    screen(`<img class="finimg" src="ui/fin.png" alt="${TX('Fin del partido')}"><h2>${a > b ? TX('¡Has vencido al Alpino!') : a < b ? TX('El Alpino te ha congelado…') : TX('Empate')}</h2>
      ${scoreLine(s)}
      <p class="note">${snow ? '+' + snow + ' ❄️ ' + TX('por jugar') : ''}${bonus ? '<br><b>+' + bonus + ' ❄️ ' + TX('¡premio del jefe!') + '</b>' : a > b ? '<br>' + TX('El premio del jefe ya lo cobraste hoy.') : ''}</p>
      <button class="cta" id="again">${TX('Volver a Navidad')}</button><button class="ghost" id="toMenu">${TX('Menú')}</button>`, a > b ? 'ill27' : a < b ? 'ill15' : 'ill28');
    $('again').onclick = renderNavidad; $('toMenu').onclick = renderMenu;
  }

  /* =====================================================================
     GACHA LIMITADO DE BAI LONG (pantalla propia) y AVISO DE JUGADORES NUEVOS
     ===================================================================== */
  // Rayos animados (amarillos y azules) para el gacha limitado
  function lmBolts() {
    const P = ['M12 0 L22 30 L10 40 L26 70 L16 80 L30 100', 'M88 0 L76 26 L90 38 L70 66 L82 78 L64 100', 'M50 0 L44 22 L58 36 L40 62 L52 74 L42 100',
      'M0 40 L24 46 L18 56 L44 62', 'M100 55 L76 60 L84 70 L58 76', 'M30 100 L40 80 L34 74 L52 56'];
    return `<svg class="lmbolts" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${P.map((d, i) => `<path class="lb lb${i % 2}" style="animation-delay:${(i * 0.37).toFixed(2)}s" d="${d}"/>`).join('')}</svg>`;
  }
  // Destello de rayos a pantalla completa al salir Bai Long
  function lmBoom() { const d = document.createElement('div'); d.className = 'lmboom'; d.innerHTML = lmBolts() + lmBolts(); document.body.appendChild(d); setTimeout(() => d.remove(), 1500); }
  function lmMenuBtn() {
    const H = Limitado.data();
    return `<button class="mode lmmode" id="mLm"><span class="limbg"></span>${lmBolts()}<span class="mt"><b>⚡ ${TX('Bai Long')} <em class="lmnew">${TX('LIMITADO')}</em></b><small>${TX('Gacha limitado · 100 🎟️ = 10 jugadores')}${H.pity ? ' · ' + H.pity + '/' + LM_PITY : ''}</small></span></button>`;
  }
  function renderLimitado() {
    const H = Limitado.data(), P = Profile.data, bai = PLAYER(BAI_ID);
    const rates = LM_RATES.map(([t, w]) => RARITY[t].label + ' ' + w + ' %').join(' · ');
    screen(`${top('⚡ ' + TX('Gacha limitado'))}${wallet()}
      <div class="lmhero"><img src="ui/bailong.jpg" alt="Bai Long">${lmBolts()}<span class="lmtag">${TX('LIMITADO')}</span>
        <div class="lmname"><b>Bai Long</b><small>${TX('Nota')} ${Math.round(Limitado.avgOf(bai))} · ${RAB(bai.role)} · ${ELEM_LABEL[bai.elem]}</small></div></div>
      <h3>${TX('Técnicas de Bai Long')}</h3>
      <div class="lmtechs">${BAI_TECHS.map(b => { const t = TECH(b.id); return `<div class="lmtech ${EL(t.elem).css}"><b>${esc(t.name)}</b><small>${TYPE_LABEL[t.type]} · ${t.power}</small></div>`; }).join('')}</div>
      <h3>${TX('Jugadores del sobre')}</h3>
      <div class="lmlist" id="lmList"></div>
      <p class="note">${rates}.<br>${TX('Cada sobre trae al menos una épica o mejor, y Bai Long está asegurado a las')} ${LM_PITY} ${TX('tiradas sin él (llevas')} ${H.pity}${TX(').')}<br>
        ${TX('Los repetidos suben una estrella (máx.')} ${MAX_STARS}${TX('); con 5 estrellas dan monedas.')}</p>
      ${bottom(`<button class="cta lmgo" id="lm10" ${P.tickets < LM_PRICE ? 'disabled' : ''}>${TX('Tirar ×10')}<small>${LM_PRICE} 🎟️ · ${TX('10 jugadores')}</small></button>`)}`, 'bg_title');
    Limitado.ids().forEach(id => {
      const pd = PLAYER(id), w = document.createElement('div');
      w.className = 'lmp ' + pd.rarity + (P.coll[id] ? ' own' : '');
      w.appendChild(face(Sprites.refOf(pd), 48));
      w.insertAdjacentHTML('beforeend', `<small>${esc(pd.name)}</small>${rchip(pd.rarity)}`);
      $('lmList').appendChild(w);
    });
    $('lm10').onclick = () => {
      const res = Limitado.pull(); if (!res) return UI.toast(TX('No tienes tickets suficientes'));
      renderMachine(res, LM_BANNER, renderLimitado, TX('Gacha de Bai Long'));
    };
    $('back').onclick = renderGacha;
    Sound.music('menu');
  }
  // Aviso al abrir el juego cuando hay un jugador nuevo (NEW_PLAYERS en src/limited.js): una vez por dispositivo
  function showNewPlayers(list, i, after) {
    const n = list[i]; if (!n) { if (after) after(); return; }
    const pd = PLAYER(n.id); if (!pd) return showNewPlayers(list, i + 1, after);
    settings.seenPlayers = (settings.seenPlayers || []).concat(n.id); saveSettings();
    const ov = document.createElement('div'); ov.className = 'npov' + (pd.lim ? ' lim' : '');
    const techs = startingTechs(pd).map(TECH).filter(Boolean);
    ov.innerHTML = `<div class="npbox">${lmBolts()}<small class="npk">${TX('¡NUEVO JUGADOR!')}</small><div class="npface"></div><h2>${esc(pd.name)}</h2>
      <div class="gmeta">${rchip(pd.rarity)}<span>${RAB(pd.role)}</span>${chip(pd.elem)}</div>
      <b class="npavg">${TX('Nota')} ${Math.round(Limitado.avgOf(pd))}</b>
      <div class="nptechs">${techs.map(t => `<span>${esc(t.name)}</span>`).join('')}</div>
      <button class="cta" id="npGo">${pd.lim ? TX('Ver el gacha limitado') : TX('Ir al gacha')}</button><button class="ghost" id="npX">${TX('Cerrar')}</button></div>`;
    document.body.appendChild(ov);
    ov.querySelector('.npface').appendChild(face(Sprites.refOf(pd), 112));
    Sound.sfx('reveal'); if (pd.lim) lmBoom();
    $('npGo').onclick = () => { ov.remove(); pd.lim ? renderLimitado() : renderGacha(); };
    $('npX').onclick = () => { ov.remove(); showNewPlayers(list, i + 1, after); };
  }

  /* ---------- Plantilla, entrenamiento y Rayos ---------- */
  const RORDER = { limitada: -1, legendaria: 0, epica: 1, rara: 2, comun: 3 };
  function sortedIds(filter) {
    return Profile.ids().filter(id => !filter || PLAYER(id).role === filter)
      .sort((a, b) => RORDER[PLAYER(a).rarity] - RORDER[PLAYER(b).rarity] || Profile.owned(b).stars - Profile.owned(a).stars || PLAYER(a).name.localeCompare(PLAYER(b).name));
  }
  function miniCard(id, extra = '') {
    const pd = PLAYER(id), o = Profile.owned(id);
    const el = document.createElement('button'); el.className = 'pcard ' + pd.rarity + hwc(pd);
    el.appendChild(face(Sprites.refOf(pd), 56));
    el.insertAdjacentHTML('beforeend', `<div class="pinfo"><div class="pname">${esc(pd.name)}</div>
      <div class="pmeta">${rchip(pd.rarity)} ${ROLE_LABEL[pd.role]} ${chip(pd.elem)} ${o ? stars(o.stars) : ''}</div>${extra}</div>`);
    return el;
  }
  // Ficha pequeña para cuadrículas (plantilla y elegir jugador)
  function tile(id, extra = '') {
    const pd = PLAYER(id), o = Profile.owned(id);
    const el = document.createElement('button'); el.className = 'ptile ' + pd.rarity + hwc(pd);
    el.appendChild(face(Sprites.refOf(pd), 64));
    el.insertAdjacentHTML('beforeend', `<span class="tn">${esc(pd.name)}</span><span class="tm">${rchip(pd.rarity)}<i>${RAB(pd.role)}</i></span>${o ? stars(o.stars) : ''}${extra}`);
    return el;
  }
  let teamFilter = '', teamSort = 'rareza', teamTab = 'equipo';
  // Buscador y filtros de jugadores (plantilla y elegir jugador)
  const PF = { q: '', rar: '', elem: '', game: '' };
  const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const gameOf = id => id >= 30000 ? '3' : id >= 20000 ? '2' : '1';
  function pfMatch(id) {
    const p = PLAYER(id);
    if (PF.q) { const q = norm(PF.q.trim()); if (q && !norm(p.name).includes(q) && !norm(p.full).includes(q)) return false; }
    return (!PF.rar || p.rarity === PF.rar) && (!PF.elem || p.elem === PF.elem) && (!PF.game || gameOf(id) === PF.game);
  }
  const pfActive = () => !!(PF.q || PF.rar || PF.elem || PF.game);
  function pfBar() {
    const opt = (v, t, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${t}</option>`;
    return `<div class="pfbar"><div class="pfq"><input id="pfQ" type="search" placeholder="${TX('Buscar por nombre o mote…')}" value="${esc(PF.q)}" autocomplete="off"><button class="ghost" id="pfX" ${pfActive() ? '' : 'hidden'} title="${TX('Quitar filtros')}">✕</button></div>
      <div class="pfsel"><select id="pfR" aria-label="${TX('Rareza')}">${opt('', TX('Rareza'), PF.rar)}${['limitada', 'legendaria', 'epica', 'rara', 'comun'].map(r => opt(r, RARITY[r].label, PF.rar)).join('')}</select>
      <select id="pfE" aria-label="${TX('Elemento')}">${opt('', TX('Elemento'), PF.elem)}${['fuego', 'bosque', 'viento', 'montaña'].map(e => opt(e, ELEM_LABEL[e], PF.elem)).join('')}</select>
      <select id="pfG" aria-label="${TX('Juego')}">${opt('', TX('Juego'), PF.game)}${opt('1', TX('Inazuma 1'), PF.game)}${opt('2', TX('Inazuma 2'), PF.game)}${opt('3', TX('Inazuma 3'), PF.game)}</select></div></div>`;
  }
  // Conecta la barra: al escribir solo se redibuja la lista (no se pierde el foco)
  function pfWire(root, redrawList, redrawAll) {
    const q = root.querySelector('#pfQ'), x = root.querySelector('#pfX');
    q.oninput = () => { PF.q = q.value; x.hidden = !pfActive(); redrawList(); };
    [['#pfR', 'rar'], ['#pfE', 'elem'], ['#pfG', 'game']].forEach(([s, k]) => root.querySelector(s).onchange = e => { PF[k] = e.target.value; redrawAll(); });
    x.onclick = () => { PF.q = PF.rar = PF.elem = PF.game = ''; redrawAll(); };
  }
  const SORTS = { rareza: null, fuerza: (a, b) => sumIE(b) - sumIE(a), nombre: (a, b) => PLAYER(a).name.localeCompare(PLAYER(b).name) };
  const sumIE = id => STAT_KEYS.reduce((t, k) => t + statOf(id, Profile.owned(id), k), 0);

  /* ---------- Mi equipo: pizarra con el campo, puestos y candidatos ---------- */
  const st = (id, k) => statOf(id, Profile.owned(id), k);
  // Nota de un jugador para un puesto (media de lo que importa en ese puesto)
  const ROLE_RATE = {
    POR: id => (st(id, 'defensa') + st(id, 'fisico')) / 2,
    DEF: id => (st(id, 'defensa') * 2 + st(id, 'fisico') + st(id, 'rapidez')) / 4,
    MED: id => (st(id, 'control') * 2 + st(id, 'tiro') + st(id, 'rapidez')) / 4,
    DEL: id => (st(id, 'tiro') * 2 + st(id, 'rapidez') + st(id, 'control')) / 4,
  };
  const rate = (id, role) => Math.round(ROLE_RATE[role](id) * (playsAs(PLAYER(id), role) ? 1 : 0.85));
  function bestFor(roles, pool) {   // el mejor de cada puesto, porteros primero
    const used = new Set(), out = roles.map(() => null);
    const order = roles.map((r, i) => i).sort((a, b) => (roles[a] === 'POR' ? -1 : 0) - (roles[b] === 'POR' ? -1 : 0));
    for (const i of order) {
      const free = pool.filter(id => !used.has(id)), gks = free.filter(id => playsAs(PLAYER(id), 'POR'));
      const c = (roles[i] === 'POR' && gks.length ? gks : free).sort((a, b) => rate(b, roles[i]) - rate(a, roles[i]))[0];   // la portería, solo para porteros
      if (c != null) { out[i] = c; used.add(c); }
    }
    return out;
  }
  const autoLineup = formation => bestFor(FORMATIONS[formation].roles, Profile.ids());
  function savedTeam() {
    const t = settings.team, owned = new Set(Profile.ids());
    if (t && FORMATIONS[t.formation] && Array.isArray(t.ids) && t.ids.length === 5) {
      const ids = t.ids.map(id => owned.has(id) ? id : null);
      if (ids.some(x => x == null)) {   // huecos (jugador que ya no está): se rellenan solos
        const roles = FORMATIONS[t.formation].roles, rest = Profile.ids().filter(id => !ids.includes(id));
        ids.forEach((id, i) => { if (id == null) { const c = rest.sort((a, b) => rate(b, roles[i]) - rate(a, roles[i])).shift(); ids[i] = c ?? null; } });
      }
      return { formation: t.formation, ids };
    }
    return { formation: settings.formation, ids: autoLineup(settings.formation) };
  }
  function saveTeam(t) { settings.team = { formation: t.formation, ids: t.ids.slice() }; settings.formation = t.formation; saveSettings(); }
  const firstName = n => n.split(' ')[0];

  // Campo con los 5 puestos. items[i] = { ref, name, rarity, badge } o null
  function pitch(roles, items, sel, onSlot) {
    const pos = layout(roles), el = document.createElement('div');
    el.className = 'pitch';
    el.innerHTML = '<i class="pl-mid"></i><i class="pl-circle"></i><i class="pl-box"></i><i class="pl-small"></i>';
    roles.forEach((r, i) => {
      const it = items[i], b = document.createElement('button');
      b.className = 'pslot' + (i === sel ? ' sel' : '') + (it ? ' ' + (it.rarity || '') + hwc(it) : ' empty');
      b.style.left = (50 + pos[i].home[0] / 17 * 44) + '%';
      b.style.top = (85 - pos[i].home[1] / 31 * 71) + '%';
      const fc = document.createElement('span'); fc.className = 'pf';
      if (it) fc.appendChild(face(it.ref, 46)); else fc.textContent = '+';
      b.appendChild(fc);
      b.insertAdjacentHTML('beforeend', `<span class="pr">${RAB(r)}${it && it.badge != null ? ' · ' + it.badge : ''}</span><span class="pn">${it ? esc(firstName(it.name)) : TX('Elegir')}</span>${it && it.elem ? `<span class="pe">${chip(it.elem)}</span>` : ''}`);
      b.onclick = () => onSlot(i);
      el.appendChild(b);
    });
    return el;
  }
  // Editor completo: formación, campo y lista de candidatos para el puesto marcado
  function teamEditor(box, t, onChange) {
    const roles = FORMATIONS[t.formation].roles;
    if (t.sel == null || t.sel > 4) t.sel = Math.max(0, t.ids.findIndex(x => x == null));
    t.show = t.show || 'pos';
    const role = roles[t.sel];
    const avg = t.ids.every(x => x != null) ? Math.round(t.ids.reduce((a, id, i) => a + rate(id, roles[i]), 0) / 5) : null;
    box.innerHTML = `${formSelect(t)}
      <div class="edbar"><button class="ghost" id="edAuto">${TX('⚡ Mejor equipo')}</button><span class="note">${avg != null ? TX('Media del equipo:') + ' <b>' + avg + '</b>' : TX('Faltan jugadores')}</span></div>
      <div id="edPitch"></div>
      <h3>${TX('Puesto:')} ${ROLE_LABEL[role]} <small>${TX('toca un jugador para ponerlo; toca otro puesto del campo para cambiarlo')}</small></h3>
      ${pfBar()}<div class="opts small" id="edShow"><button data-v="pos" aria-pressed="${t.show === 'pos'}">${TX('De')} ${ROLE_LABEL[role].toLowerCase()}</button><button data-v="all" aria-pressed="${t.show === 'all'}">${TX('Todos')}</button></div>
      <div class="pgrid" id="edList"></div>`;
    const redraw = () => { onChange && onChange(); teamEditor(box, t, onChange); };
    box.querySelector('#edPitch').appendChild(pitch(roles, t.ids.map((id, i) => id == null ? null :
      { ref: Sprites.refOf(PLAYER(id)), name: PLAYER(id).name, rarity: PLAYER(id).rarity, halloween: PLAYER(id).halloween, xmas: PLAYER(id).xmas, inf: PLAYER(id).inf, elem: PLAYER(id).elem, badge: rate(id, roles[i]) }), t.sel, i => { t.sel = i; Sound.sfx('click'); teamEditor(box, t, onChange); }));
    box.querySelector('#formSel').onchange = e => {   // al cambiar de formación se recolocan los mismos 5
      t.formation = e.target.value; const keep = t.ids.filter(x => x != null);
      t.ids = bestFor(FORMATIONS[t.formation].roles, keep.length === 5 ? keep : Profile.ids()); t.sel = 0; redraw();
    };
    box.querySelector('#edAuto').onclick = () => { t.ids = autoLineup(t.formation); Sound.sfx('reveal'); redraw(); };
    box.querySelectorAll('#edShow button').forEach(b => b.onclick = () => { t.show = b.dataset.v; teamEditor(box, t, onChange); });
    let pool = Profile.ids();
    if (t.show === 'pos' || role === 'POR') pool = pool.filter(id => playsAs(PLAYER(id), role));   // a portería solo van porteros
    pool.sort((a, b) => rate(b, role) - rate(a, role));
    const list = box.querySelector('#edList');
    const drawList = () => {
    const ids = pool.filter(pfMatch); list.innerHTML = '';
    if (!ids.length) list.innerHTML = pool.length ? '<p class="note">' + TX('Ningún jugador coincide con la búsqueda.') + '</p>' : '<p class="note">' + TX('No tienes jugadores de este puesto. Toca «Todos».') + '</p>';
    ids.forEach(id => {
      const at = t.ids.indexOf(id);
      const c = tile(id, `<span class="slot">${at >= 0 ? TX('En el equipo · ') + RAB(roles[at]) : TX('Nota ') + rate(id, role)} ${chip(PLAYER(id).elem)}</span>`);
      if (at >= 0) c.classList.add('sel');
      c.onclick = () => {
        if (at >= 0 && roles[at] === 'POR' && t.ids[t.sel] != null && !playsAs(PLAYER(t.ids[t.sel]), 'POR')) return UI.toast(TX('Así la portería se quedaría sin portero'));
        if (at >= 0) t.ids[at] = t.ids[t.sel];   // si ya juega, se cambian de puesto
        t.ids[t.sel] = id; Sound.sfx('click');
        const empty = t.ids.findIndex(x => x == null); if (empty >= 0) t.sel = empty;
        redraw();
        box.querySelector('#edPitch').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };
      list.appendChild(c);
    });
    };
    pfWire(box, drawList, () => teamEditor(box, t, onChange)); drawList();
  }

  function renderTeam() {
    const myTechs = Object.keys(Profile.data.techs).map(Number).filter(t => TECH(t));
    const tabs = `<div class="opts" id="tt"><button data-t="equipo" aria-pressed="${teamTab === 'equipo'}">${TX('Mi equipo')}</button><button data-t="jug" aria-pressed="${teamTab === 'jug'}">${TX('Jugadores (')}${Profile.ids().length})</button><button data-t="tec" aria-pressed="${teamTab === 'tec'}">${TX('Técnicas (')}${myTechs.length})</button></div>`;
    if (teamTab === 'tec') {
      screen(`${top(TX('Plantilla'))}${tabs}<p class="note">${TX('Técnicas legendarias que has sacado en el gacha. Las puede equipar cualquier jugador de su elemento desde su ficha.')}</p><div class="cards" id="tk"></div>`);
      if (!myTechs.length) $('tk').innerHTML = '<p class="note">' + TX('Aún no tienes ninguna. Salen en el tramo legendario del gacha.') + '</p>';
      myTechs.forEach(tid => {
        const t = TECH(tid), who = Profile.ids().filter(id => Profile.learnable(id).gacha.includes(tid));
        const c = document.createElement('div'); c.className = 'pcard techrow ' + EL(t.elem).css;
        c.innerHTML = `<div class="scroll small">${TYPE_ICON[t.type] || '★'}</div><div class="pinfo">${techLine(t)}<div class="pmeta">${who.length ? who.length + TX(' de tus jugadores pueden equiparla') : TX('Ninguno de tus jugadores es de ') + (ELEM_LABEL[t.elem] || t.elem)}</div></div>`;
        $('tk').appendChild(c);
      });
    } else if (teamTab === 'equipo') {
      screen(`${top(TX('Plantilla'))}${tabs}<p class="note">${TX('Este es el equipo que sale en el partido rápido y al empezar cualquier modo. Se guarda solo.')}</p>
        <h3>${TX('Equipación')} <small>${TX('la llevan tus jugadores de campo en todos los modos (menos en la Carrera)')}</small></h3><div id="kitEd"></div><div id="ed"></div>`);
      if (!api.myTeam) api.myTeam = savedTeam();
      const drawKits = () => {
        const k = myKit(), sw = (key, v) => `<div class="swatches">${KIT_COLORS.map(col => `<button class="sw" data-k="${key}" data-c="${col}" style="background:${col}" aria-pressed="${v === col}"></button>`).join('')}</div>`;
        const who = PLAYER((api.myTeam.ids || []).find(id => id != null && PLAYER(id).role !== 'POR') || 10);
        $('kitEd').innerHTML = `<div class="clubpv"><span id="kitPv"></span><div><b>${k ? TX('Tu equipación') : TX('Equipación del Raimon')}</b><small>${k ? '' : TX('Elige colores para crear la tuya')}</small></div></div>
          <p class="note">${TX('Camiseta')}</p>${sw('a', k && k.a)}<p class="note">${TX('Mangas y pantalón')}</p>${sw('b', k && k.b)}
          <p class="note">${TX('Diseño')}</p><div class="opts kitdz">${KIT_DESIGNS.map(([d, n]) => `<button data-dz="${d}" aria-pressed="${!!k && (k.d || '') === d}">${n}</button>`).join('')}</div>
          ${k ? `<button class="ghost mini" id="kitReset">${TX('Volver a la del Raimon')}</button>` : ''}`;
        $('kitPv').appendChild(k ? Sprites.kitPreview(Sprites.refOf(who), k, 2) : Sprites.portrait(Sprites.refOf(who), 2));
        const set = ch => { Profile.data.kit = Object.assign({ a: '#e8c21a', b: '#1f4fc0', d: '' }, myKit() || {}, ch); Profile.save(); Sound.sfx('click'); drawKits(); };
        $('kitEd').querySelectorAll('.sw').forEach(b => b.onclick = () => set({ [b.dataset.k]: b.dataset.c }));
        $('kitEd').querySelectorAll('[data-dz]').forEach(b => b.onclick = () => set({ d: b.dataset.dz }));
        if ($('kitReset')) $('kitReset').onclick = () => { Profile.data.kit = null; Profile.save(); Sound.sfx('click'); drawKits(); };
      };
      drawKits();
      teamEditor($('ed'), api.myTeam, () => saveTeam(api.myTeam));
    } else {
      const all = sortedIds(teamFilter); if (SORTS[teamSort]) all.sort(SORTS[teamSort]);
      screen(`${top(TX('Plantilla'))}${tabs}${wallet()}${pfBar()}
        <div class="opts" id="tf">${[['', TX('Todos')], ...ROLES4.map(r => [r, RAB(r)])].map(([v, t]) => `<button data-f="${v}" aria-pressed="${teamFilter === v}">${t}</button>`).join('')}</div>
        <div class="sortrow"><span id="tcount"></span><span class="opts small" id="ts">${Object.keys(SORTS).map(k => `<button data-s="${k}" aria-pressed="${teamSort === k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</span></div>
        <div class="pgrid" id="tl"></div>`);
      body.querySelectorAll('#tf button').forEach(b => b.onclick = () => { teamFilter = b.dataset.f; renderTeam(); });
      body.querySelectorAll('#ts button').forEach(b => b.onclick = () => { teamSort = b.dataset.s; renderTeam(); });
      const drawList = () => {
        const ids = all.filter(pfMatch), tl = $('tl'); tl.innerHTML = '';
        $('tcount').textContent = (pfActive() ? ids.length + TX(' de ') + all.length : ids.length) + TX(' jugadores · toca uno para entrenarlo');
        if (!ids.length) tl.innerHTML = '<p class="note">' + TX('Ningún jugador coincide. Prueba con otro nombre o quita filtros (✕).') + '</p>';
        ids.forEach(id => { const pd = PLAYER(id), c = tile(id, `<span class="slot">${TX('Nota ')}${rate(id, pd.role)} ${chip(pd.elem)}</span>`); c.onclick = () => renderPlayer(id); tl.appendChild(c); });
      };
      pfWire(body, drawList, renderTeam); drawList();
    }
    body.querySelectorAll('#tt button').forEach(b => b.onclick = () => { teamTab = b.dataset.t; renderTeam(); });
    tutorial('team'); if (!$('tutq-team')) body.insertAdjacentHTML('beforeend', `<p class="note" id="tutq-team">${tutBtn('team')}</p>`);
    $('back').onclick = renderMenu;
  }
  function renderPlayer(id) {
    const pd = PLAYER(id), o = Profile.owned(id), P = Profile.data;
    screen(`${top(esc(pd.name))}<div class="phead" id="ph"></div>${wallet()}
      <button class="cta" id="rayo" ${P.rayos < 1 || o.stars >= MAX_STARS ? 'disabled' : ''}>${TX('⚡ Usar Rayo Raimon')}<small>${o.stars >= MAX_STARS ? TX('Ya tiene 5 estrellas') : TX('+1 estrella sin necesitar repetidos (tienes ') + P.rayos + ')'}</small></button>
      <h3>${TX('Entrenar')} <small>${TX('+3 por mejora; el límite sube con las estrellas')}</small></h3><div class="ups" id="ups"></div>
      <h3>${TX('Técnicas equipadas')} <small>${TX('las')} ${TECH_SLOTS} ${TX('con las que empieza cada partida · toca un hueco y elige')}</small></h3>
      <div class="eqslots" id="eqs"></div>
      <h3>${TX('Puede aprender')}</h3><div class="eqlist" id="eql"></div>
      <p class="note">${TX('Puede equipar sus propias técnicas y las técnicas legendarias del gacha de su elemento (')}${ELEM_LABEL[pd.elem] || pd.elem}).</p>`);
    const eq = Profile.equipOf(id), L = Profile.learnable(id);
    api.eqSlot = Math.min(api.eqSlot || 0, TECH_SLOTS - 1);
    for (let k = 0; k < TECH_SLOTS; k++) {
      const t = eq[k] != null ? TECH(eq[k]) : null, b = document.createElement('button');
      b.className = 'eqslot' + (k === api.eqSlot ? ' sel' : '');
      b.innerHTML = `<i>${TX('Hueco')} ${k + 1}</i>${t ? techLine(t) : '<span class="tline">' + TX('Vacío') + '</span>'}`;
      b.onclick = () => { api.eqSlot = k; renderPlayer(id); };
      $('eqs').appendChild(b);
    }
    const addOpt = (tid, src) => {
      const t = TECH(tid), on = eq.includes(tid), b = document.createElement('button');
      b.className = 'eqopt' + (on ? ' on' : '') + (src === 'gacha' ? ' leg' : '');
      b.innerHTML = `${techLine(t)}<i>${on ? TX('Equipada') : src === 'gacha' ? TX('Del gacha') : TX('Suya')}${EVO(tid) != null ? TX(' · evoluciona a ') + esc(TECH(EVO(tid)).name) : ''}</i>`;
      b.onclick = () => { Profile.setEquip(id, api.eqSlot, tid); Sound.sfx('click'); api.eqSlot = (api.eqSlot + 1) % TECH_SLOTS; renderPlayer(id); };
      $('eql').appendChild(b);
    };
    L.gacha.forEach(t => addOpt(t, 'gacha')); L.own.forEach(t => addOpt(t, 'own'));
    if (!L.own.length && !L.gacha.length) $('eql').innerHTML = '<p class="note">' + TX('No tiene técnicas que aprender.') + '</p>';
    const ph = $('ph'); ph.appendChild(face(Sprites.refOf(pd), 112));
    ph.insertAdjacentHTML('beforeend', `<div><div class="pname">${esc(pd.name)}</div>${pd.full !== pd.name ? `<div class="pfull">${esc(pd.full)}</div>` : ''}${pd.also ? `<div class="pfull">${TX('También:')} ${pd.also.map(esc).join(' · ')}</div>` : ''}<div class="pmeta">${rchip(pd.rarity)} ${pd.anyRole ? TX('Todos los puestos') : ROLE_LABEL[pd.role]} ${chip(pd.elem)} ${stars(o.stars)}</div></div>`);
    STAT_KEYS.forEach(k => {
      const b = document.createElement('button'), can = Profile.canUpgrade(id, k), cost = Profile.upgradeCost(id, k);
      b.innerHTML = `${STAT_LABEL[k]} <b>${statOf(id, o, k)}</b><small>${can ? '+3 · ' + cost + '🪙' : TX('máx. ') + statCap(id, o, k)}</small>`;
      b.disabled = !can || P.coins < cost;
      b.onclick = () => { if (Profile.upgrade(id, k)) { Sound.sfx('click'); renderPlayer(id); } };
      $('ups').appendChild(b);
    });
    $('rayo').onclick = () => { if (Profile.useRayo(id)) { Sound.sfx('reveal'); UI.toast(pd.name + TX(' sube a ') + Profile.owned(id).stars + TX(' estrellas')); renderPlayer(id); } };
    $('back').onclick = () => renderTeam();
  }

  /* ---------- Antes de empezar un modo: tu equipo y la dificultad ---------- */
  function newDraft(kind, o) {
    const t = savedTeam();
    api.draft = { kind, o, formation: t.formation, diff: o.diff || 'medio', ids: t.ids };
    renderDraft();
  }
  const KIND_TITLE = { story: TX('Historia'), special: TX('Equipo especial'), chain: TX('Cadena'), infinite: TX('Infinito') };
  function renderDraft() {
    const d = api.draft;
    const sub = d.kind === 'special' ? esc(d.o.team) : d.kind === 'chain' ? esc(CHAINS.find(c => c.key === d.o.chain).name) : '';
    screen(`${top(KIND_TITLE[d.kind] + (d.kind === 'story' ? ' · ' + STAGE_NAME[d.o.stage || 's1'] : '') + (sub ? ' · ' + sub : ''))}
      ${d.kind === 'story' ? opts(TX('Dificultad'), 'diff', [['facil', TX('Fácil')], ['medio', TX('Medio')], ['dificil', TX('Difícil')]], d) +
        '<p class="note">' + TX('Fácil: 5 partidos y 3 vidas · Medio: 6 y 2 · Difícil: 7 y 1.') + '</p>' : ''}
      ${d.kind === 'infinite' ? '<p class="note">' + TX('Rivales cada vez más fuertes y 2 vidas. Cada 5 partidos, una oleada especial con premio extra.') + '</p>' : ''}
      <div id="ed"></div>
      <p class="note">${TX('Las técnicas, habilidades y fichajes se pierden al acabar; monedas, tickets y Rayos se quedan.')}</p>
      ${bottom(`<button class="cta" id="go">${TX('Empezar')}</button>`)}`);
    bindOpts(d);
    const go = $('go'), sync = () => { go.disabled = d.ids.some(x => x == null); saveTeam(d); api.myTeam = null; };
    teamEditor($('ed'), d, sync); sync();
    go.onclick = () => {
      if (d.ids.some(x => x == null)) return;
      api.run = Run.create(d.kind, d.ids, Object.assign({}, d.o, { diff: d.diff, formation: d.formation }));
      Run.save(api.run); api.pick = null; openRun();
    };
    $('back').onclick = renderMenu;
  }

  /* ---------- Partidos ---------- */
  async function startMatch(teams, golden, field, musicRole, rival) {
    GAME_SPEED = settings.dev && settings.speed ? +settings.speed : 0.75;
    const hasPad = [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(Boolean);
    if (Controls.pc() && !hasPad && (settings.padTip || 0) < 3) { settings.padTip = (settings.padTip || 0) + 1; saveSettings(); setTimeout(() => UI.toast(TX('🎮 También puedes jugar con mando'), 2600), 1800); }
    const s = Object.assign({}, settings, { golden, field, difficulty: api.mode === 'run' ? api.run.diff : api.mode === 'career' || api.mode === 'wc' ? Career.matchDiff() : 'facil' });
    s.mercy = api.mode === 'run' ? 5 : 0;   // roguelite: con 5 goles de diferencia se acaba el partido
    screen('<h2>' + TX('Cargando…') + '</h2>');
    try {
      api.matchSheet = await Sprites.matchSheet([...teams.A.players, ...teams.B.players].map(p => p.sprite));
    } catch (e) { screen(`<h2>${TX('No se pudieron cargar los jugadores')}</h2><p class="note">${esc(e.message)}</p><button class="cta" id="back">${TX('Volver')}</button>`); $('back').onclick = renderMenu; return; }
    api.match = Logic.createMatch(s, teams);
    $('cA').src = api.mode === 'wc' ? 'ui/crest3016.png' : api.mode === 'career' && Career.data ? ClubCrest.url(Career.data.crest, Career.data.school) : 'ui/crest1.png';
    $('nA').textContent = api.mode === 'wc' ? TX('Japón') : api.mode === 'career' && Career.data ? Career.data.school.replace(/^Instituto\s+/i, '') : TX('Tú');
    UI.reset();
    api.scene && api.scene.bind(api.match, api.matchSheet);
    show(null);
    api.running = true;
    Sound.music(musicRole || 'match', rival);
    if (field && field !== 'normal') UI.toast(FIELD_LABEL[field] || '', 1600);
  }
  function startQuick() {
    api.mode = 'quick';
    const T = savedTeam(), F = FORMATIONS[T.formation], pos = layout(F.roles), L = T.ids;
    if (L.some(x => x == null)) return UI.toast(TX('Completa tu equipo en Plantilla'));
    const A = { name: TX('Tu equipo'), players: L.map((id, i) => {
      const pd = PLAYER(id);
      return Object.assign(buildMatchPlayer(id, F.roles[i], k => statOf(id, Profile.owned(id), k), runMember(id).techs, [], i, pos[i]), { sprite: mySprite(pd, F.roles[i]) });
    }) };
    const key = RIVAL_ORDER[Math.floor(Math.random() * RIVAL_ORDER.length)];
    startMatch({ A, B: rivalTeam(key, 0.9, 0.5) }, false, TEAM_FIELD[key], 'match', key);
  }
  api.togglePause = () => {
    if (!api.match || api.match.over || !$('screen').hidden) return;
    if (api.running) {
      api.running = false;
      $('pauseBody').innerHTML = `<h1>${TX('Pausa')}</h1><button class="cta" id="pResume">${TX('Seguir')}</button>
        <div class="group"><label>${TX('Supertécnicas')}</label><div class="opts">${[['boton', TX('Con botón')], ['auto', TX('Automáticas')]].map(([v, t]) => `<button data-v="${v}" aria-pressed="${settings.techMode === v}">${t}</button>`).join('')}</div></div>
        ${settings.dev && settings.devWin ? '<button class="ghost" id="pWin">' + TX('🛠 Ganar ahora (desarrollador)') + '</button>' : ''}
        <button class="ghost" id="pGuide">${TX('🎮 Guía de controles')}</button>
        <button class="ghost" id="pQuit">${api.mode === 'run' || api.mode === 'career' || api.mode === 'wc' ? TX('Rendirse (cuenta como derrota)') : TX('Salir al menú')}</button>`;
      $('pauseBody').querySelectorAll('.opts button').forEach(b => b.addEventListener('click', () => {
        settings.techMode = b.dataset.v; saveSettings(); api.match.settings.techMode = b.dataset.v;
        b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      }));
      $('pResume').onclick = () => api.togglePause();
      if ($('pWin')) $('pWin').onclick = () => { const m = api.match; m.score.A = m.score.B + 1; m.time = 0.01; m.golden = false; api.togglePause(); };
      $('pGuide').onclick = () => renderControlsGuide(() => show('pause'));
      $('pQuit').onclick = () => {
        api.match.quit = true;   // rendirse no da caramelos
        if (api.mode === 'run') { api.match.over = true; api.match.result = 'loss'; api.matchEnded(api.match); }
        else if (api.mode === 'career' || api.mode === 'wc') { const m = api.match; m.over = true; m.score.A = 0; m.score.B = Math.max(3, m.score.B); m.result = 'loss'; api.matchEnded(m); }
        else { api.match.over = true; Sound.stop(0.3); api.mode === 'hwboss' ? renderHalloween() : api.mode === 'xmboss' ? renderNavidad() : renderMenu(); }
      };
      show('pause');
    } else { show(null); api.running = true; }
  };
  api.matchEnded = s => {
    api.running = false;
    setTimeout(() => {
      Sound.stop(0.6);
      setTimeout(() => { try { Cloud.flushOld(); } catch (_) {} }, 2000);   // al acabar el partido se sube lo pendiente si hace rato de la última subida
      // Halloween: caramelos por jugar en cualquier modo (+5, +10 más si ganas)
      const candy = s.quit ? 0 : Halloween.matchPlayed(s.score.A > s.score.B);
      if (candy && api.mode !== 'hwboss') setTimeout(() => UI.toast('+' + candy + ' 🍬 ' + TX('caramelos de Halloween'), 2200), 500);
      // Navidad: copos por jugar en cualquier modo (+5, +10 más si ganas)
      const snow = s.quit ? 0 : Navidad.matchPlayed(s.score.A > s.score.B);
      if (snow && api.mode !== 'xmboss') setTimeout(() => UI.toast('+' + snow + ' ❄️ ' + TX('copos de Navidad'), 2200), candy ? 2900 : 500);
      if (api.mode === 'xmboss') { const won = s.score.A > s.score.B, bonus = Navidad.bossResult(won); Sound.jingle(won ? 'win' : s.score.A < s.score.B ? 'lose' : null); renderXmBossEnd(s, snow, bonus); }
      else if (api.mode === 'hwboss') { const won = s.score.A > s.score.B, bonus = Halloween.bossResult(won); Sound.jingle(won ? 'win' : s.score.A < s.score.B ? 'lose' : null); renderBossEnd(s, candy, bonus); }
      else if (api.mode === 'wc') { const r = Career.wcResult(s.score.A, s.score.B); Sound.jingle(r.gA > r.gB || (r.pens && r.pens[0] > r.pens[1]) ? 'win' : r.gA === r.gB && !r.pens ? null : 'lose'); renderWC(r); }
      else if (api.mode === 'career') {
        const nm = Career.nextMatch();
        const pens = nm && nm.ko && s.score.A === s.score.B ? Career.penalties(Career.myRating(), Career.rating(nm.rival)) : null;
        const out = Career.finishMatch(s.score.A, s.score.B, pens, 0, (s.goalLog || []).filter(g => g.team === 'A' && g.key != null).map(g => g.key));
        jingleFor(out);
        renderCareerJornada(out);
      } else if (api.mode === 'run') {
        Run.applyResult(api.run, s.result === 'win' ? 'win' : 'loss', s.score.A);
        Run.save(api.run);
        Sound.jingle(api.run.last.result === 'win' ? 'win' : 'lose');
        renderResult(s);
      } else {
        let rayo = false;
        if (s.result === 'win') rayo = Profile.addWin();
        Sound.jingle(s.result === 'win' ? 'win' : s.result === 'loss' ? 'lose' : null); renderQuickEnd(s, rayo);
      }
    }, 900);
  };

  /* ---------- Partida en curso ---------- */
  function runHeader() {
    const r = api.run;
    return `<div class="runbar"><span>${esc(r.name)}${r.kind === 'story' ? ' · ' + { facil: TX('Fácil'), medio: TX('Medio'), dificil: TX('Difícil') }[r.diff] : ''}</span>
      <span class="hearts">${'♥'.repeat(r.lives)}<s>${'♥'.repeat(Math.max(0, r.maxLives - r.lives))}</s></span>
      <span>🪙 +${r.coinsEarned}</span><span>🎟️ +${r.ticketsEarned}</span><span>⚡ ${Profile.data.rayos}</span></div>`;
  }
  function memberCard(mi, slot) {
    const r = api.run, m = r.roster[mi], pd = PLAYER(m.id), o = m.temp ? null : Profile.owned(m.id);
    const el = document.createElement('div');
    el.className = 'pcard ' + pd.rarity + hwc(pd) + (api.pick === mi ? ' sel' : '');
    el.appendChild(face(Sprites.refOf(pd), 56));
    el.insertAdjacentHTML('beforeend', `<div class="pinfo"><div class="pname">${esc(pd.name)}${m.temp ? ' <em>' + TX('temporal') + '</em>' : ''}</div>
      <div class="pmeta"><b>${RAB(slot)}</b> · ${ROLE_LABEL[pd.role]} ${chip(pd.elem)} ${o ? stars(o.stars) : ''}</div>
      <div class="ptechs">${m.techs.map(TECH).map(techLine).join('') || '<i>' + TX('Sin técnicas') + '</i>'}</div>
      ${m.passives.length ? `<div class="ppass">${m.passives.map(n => esc(TX(n))).join(' · ')}</div>` : ''}</div>`);
    return el;
  }
  function openRun() {
    const r = api.run;
    if (r.state === 'reward') return renderReward();
    if (r.state === 'over') return renderOver();
    renderMap();
  }
  // Antes del partido: la estrella rival te provoca y tu mejor jugador le contesta (la frase se queda fija en cada partido)
  function fillTalk(r, rival) {
    const box = $('talk'); if (!box) return;
    let star = null; try { star = teamStar(rival, false); } catch (_) {}
    const sum = pd => Object.values(pd.ie).reduce((x, y) => x + y, 0);
    const mine = r.lineup.slice(0, 5).map(mi => r.roster[mi] && PLAYER(r.roster[mi].id)).filter(Boolean).sort((a, b) => sum(b) - sum(a))[0];
    if (!star || !mine) { box.remove(); return; }
    const key = r.kind + ':' + r.index + ':' + rival;
    if (!api.talk || api.talk.key !== key) api.talk = { key, a: Dialog.taunt(star.elem), b: Dialog.reply() };
    box.innerHTML = `<div class="tk"><span class="tkf" id="tkR"></span><div class="tkb"><small>${esc(star.name)}</small>${esc(api.talk.a)}</div></div>
      <div class="tk me"><span class="tkf" id="tkM"></span><div class="tkb"><small>${esc(mine.name)}</small>${esc(api.talk.b)}</div></div>`;
    $('tkR').appendChild(face(Sprites.refOf(star), 48)); $('tkM').appendChild(face(Sprites.refOf(mine), 48));
  }
  function renderMap() {
    const r = api.run, rival = Run.rivalName(r), F = FORMATIONS[r.formation];
    const path = r.kind === 'infinite'
      ? `<p class="note">${TX('Oleada')} ${r.index + 1}${Run.isBoss(r) ? ' · <b>' + TX('¡oleada especial!') + '</b>' : ''} ${TX('· récord')} ${Profile.data.infBest}</p>`
      : `<ol class="path">${r.schedule.map((t, i) => `<li class="${i < r.index ? 'done' : i === r.index ? 'now' : ''}">${Sprites.crest(crestOf(t))}<span>${esc(t)}</span></li>`).join('')}</ol>`;
    screen(`${top(r.kind === 'infinite' ? TX('Oleada ') + (r.index + 1) : TX('Partido ') + (r.index + 1) + TX(' de ') + r.schedule.length, 'toMenu', TX('Menú'))}${runHeader()}
      ${path}<div class="vsrow">${Sprites.crest(crestOf(rival))}<div><b>${esc(rival)}</b><span class="note">${FIELD_LABEL[Run.field(r)] || ''}</span><div class="faces" id="rfaces"></div></div></div>
      <div class="talk" id="talk"></div>
      ${formSelect(r)}
      <h3>${TX('Alineación')} <small>${TX('toca un puesto y luego un suplente (u otro puesto) para cambiarlos')}</small></h3>
      <div id="lineup"></div>
      <h3>${TX('Banquillo')}</h3><div class="pgrid" id="bench"></div>
      <details class="techs"><summary>${TX('Ver técnicas del equipo')}</summary><div class="cards" id="tdet"></div></details>
      ${bottom(`<button class="cta" id="goMatch">${TX('Jugar contra')} ${esc(rival)}</button>`)}`, 'bg_vs');
    const rt = TEAM(rival);
    if (rt) rt.players.forEach(m => $('rfaces').appendChild(face({ file: m.file, row: m.row }, 40)));
    fillTalk(r, rival);
    $('formSel').onchange = e => { r.formation = e.target.value; Run.save(r); renderMap(); };
    const sel = api.mapSel;
    const items = r.lineup.slice(0, 5).map(mi => { const pd = PLAYER(r.roster[mi].id); return { ref: Sprites.refOf(pd), name: pd.name, rarity: pd.rarity, halloween: pd.halloween, xmas: pd.xmas }; });
    $('lineup').appendChild(pitch(F.roles, items, sel, i => {
      if (sel != null && sel !== i) { Run.swapLineup(r, sel, r.lineup[i]); api.mapSel = null; Run.save(r); }
      else api.mapSel = sel === i ? null : i;
      Sound.sfx('click'); renderMap();
    }));
    r.roster.forEach((m, mi) => {
      if (r.lineup.slice(0, 5).includes(mi)) return;
      const pd = PLAYER(m.id), c = document.createElement('button');
      c.className = 'ptile ' + pd.rarity + hwc(pd); c.appendChild(face(Sprites.refOf(pd), 56));
      c.insertAdjacentHTML('beforeend', `<span class="tn">${esc(pd.name)}</span><span class="tm"><i>${RAB(pd.role)}</i>${m.temp ? '<em class="tmp">' + TX('temporal') + '</em>' : ''}</span>`);
      c.onclick = () => {
        if (api.mapSel == null) return UI.toast(TX('Primero toca el puesto del campo'));
        Run.swapLineup(r, api.mapSel, mi); api.mapSel = null; Run.save(r); Sound.sfx('click'); renderMap();
      };
      $('bench').appendChild(c);
    });
    if (!$('bench').children.length) $('bench').innerHTML = '<p class="note">' + TX('Sin suplentes todavía: los fichajes temporales aparecen aquí.') + '</p>';
    r.lineup.slice(0, 5).forEach((mi, si) => $('tdet').appendChild(memberCard(mi, F.roles[si])));
    $('goMatch').onclick = () => { api.mode = 'run'; startMatch(Run.matchTeams(r), true, Run.field(r), Run.musicRole(r), Run.rivalName(r)); };
    $('toMenu').onclick = renderMenu;
    Sound.music('menu');
  }
  function renderResult(s) {
    const r = api.run, L = r.last;
    const gains = [`<li>🪙 +${L.coins} ${TX('monedas')}</li>`];
    if (L.tickets) gains.push(`<li>🎟️ +${L.tickets} ${TX('ticket')}${L.tickets > 1 ? 's' : ''}</li>`);
    if (L.rayo) gains.push('<li>' + TX('⚡ ¡5 victorias más: ganas un Rayo Raimon!') + '</li>');
    if (L.chainRayo) gains.push('<li>' + TX('⚡ Cadena completada: ¡Rayo Raimon!') + '</li>');
    if (L.chainTech != null) gains.push(`<li>${TX('📜 Primera vez: técnica legendaria')} <b>${esc(TECH(L.chainTech).name)}</b></li>`);
    if (L.perfect) gains.push('<li>' + TX('💎 ¡Cadena perfecta sin perder vidas! +5 🎟️') + '</li>');
    if (L.medal) gains.push(`<li>${L.medal === 'oro' ? '🥇' : '🥈'} ${TX('Medalla de')} ${L.medal}${TX(': +15 🎟️ y otro ⚡ Rayo')}</li>`);
    if (L.lifeLost) gains.push(`<li>${TX('♥ −1 vida')}${r.lives > 0 ? TX(' · repites contra el mismo rival') : ''}</li>`);
    screen(`<img class="finimg" src="ui/fin.png" alt="${TX('Fin del partido')}">${runHeader()}<h2>${L.result === 'win' ? TX('¡Victoria!') : TX('Derrota')}</h2>
      ${scoreLine(s)}
      <ul class="gains">${gains.join('')}</ul><div id="excl"></div>
      <button class="cta" id="next">${TX('Continuar')}</button>`, L.result === 'win' ? 'ill27' : 'ill15');
    if (L.exclusive) {
      const x = L.exclusive, pd = PLAYER(x.id), c = miniCard(x.id, `<div class="slot">${x.isNew ? TX('¡Se une a tu plantilla!') : x.star ? TX('Sube a ') + x.star + TX(' estrellas') : '+' + x.coins + ' 🪙'}</div>`);
      $('excl').insertAdjacentHTML('beforeend', '<h3>' + TX('Premio del equipo especial') + '</h3>'); $('excl').appendChild(c);
    }
    // Jefe del Infinito: elige 1 de 3 versiones (si no eliges ahora, queda guardado en 🎁 Código de regalo)
    const vi = L.versionPick != null ? (Profile.data.giftPicks || []).findIndex(g => g.uid === L.versionPick) : -1;
    if (vi >= 0) {
      $('excl').insertAdjacentHTML('beforeend', `<h3>∞ ${TX('Premio del jefe: elige una versión')}</h3><p class="note">${TX('Si no eliges ahora, la tienes en 🎁 Código de regalo.')}</p><div class="hwpick" id="vpick"></div>`);
      Profile.data.giftPicks[vi].opts.forEach(id => {
        const pd = PLAYER(id), b = document.createElement('button'); b.className = 'hwpk infpk';
        b.appendChild(face(Sprites.refOf(pd), 72));
        b.insertAdjacentHTML('beforeend', `<b>${esc(pd.full || pd.name)}</b><small>${rchip(pd.rarity)} ${RAB(pd.role)} ${chip(pd.elem)}</small>${Profile.data.coll[id] ? `<small>${TX('ya lo tienes (+1 ★)')}</small>` : ''}`);
        b.onclick = () => { const i = Profile.data.giftPicks.findIndex(g => g.uid === L.versionPick); const x = i >= 0 && Profile.takePick(i, id); if (!x) return; Sound.sfx('reveal'); renderReveal([x], openRun, TX('¡Nueva versión!')); };
        $('vpick').appendChild(b);
      });
    }
    $('next').onclick = openRun;
  }
  const scoreLine = s => `<div class="result">${Sprites.crest(1)}<span class="sc">${s.score.A}–${s.score.B}<small>${TX('Tu equipo ·')} ${esc(s.teams.B.name)}</small></span>${Sprites.crest(crestOf(s.teams.B.name))}</div>`;
  function renderReward() {
    const r = api.run;
    screen(`${runHeader()}<h2>${TX('Elige una recompensa')}</h2><div id="rw" class="cards"></div>`, 'bg_green');
    r.rewards.forEach(o => {
      const c = document.createElement('button'); c.className = 'rcard';
      const who = o.member != null ? PLAYER(r.roster[o.member].id) : o.id != null ? PLAYER(o.id) : null;
      if (who) c.appendChild(face(Sprites.refOf(who), 64));
      let html = '';
      if (o.kind === 'tech') html = `<div class="rk">${TX('Supertécnica')}${o.rare ? ' <em>' + TX('rara') + '</em>' : ''}</div><div class="pname">${esc(who.name)} ${TX('aprende')}</div>${techLine(TECH(o.tech))}${o.replace != null ? `<div class="pmeta">${TX('Sustituye a')} ${esc(TECH(o.replace).name)} ${TX('(máx.')} ${TECH_SLOTS} ${TX('técnicas)')}</div>` : ''}`;
      if (o.kind === 'evolve') html = `<div class="rk">${TX('Evolución')}</div><div class="pname">${esc(who.name)}</div>${techLine(TECH(o.from))}<span class="evo">↓</span>${techLine(TECH(o.to))}`;
      if (o.kind === 'recruit') html = `<div class="rk">${TX('Fichaje temporal')}</div><div class="pname">${esc(who.name)}</div><div class="pmeta">${ROLE_LABEL[who.role]} ${chip(who.elem)} ${TX('· Tiro')} ${who.ie.tiro} ${TX('· Rapidez')} ${who.ie.rapidez}</div>`;
      if (o.kind === 'passive') html = `<div class="rk">${TX('Habilidad')}</div><div class="pname">${esc(TX(o.name))} ${TX('para')} ${esc(who.name)}</div><div class="pmeta">${esc(PASSIVES[o.name].desc)}</div>`;
      if (o.kind === 'coins') html = `<div class="rk">${TX('Monedas')}</div><div class="pname">+${o.amount} 🪙</div>`;
      c.insertAdjacentHTML('beforeend', `<div>${html}</div>`);
      c.onclick = () => { Run.takeReward(r, o); Run.save(r); Sound.sfx('reveal'); renderMap(); };
      $('rw').appendChild(c);
    });
    $('rw').insertAdjacentHTML('afterend', `<button class="ghost" id="rwSkip">${TX('Saltar (no quiero ninguna)')}</button>`);
    $('rwSkip').onclick = () => { Run.takeReward(r, null); Run.save(r); Sound.sfx('click'); renderMap(); };
  }
  function renderOver() {
    const r = api.run, win = r.last && r.last.victory;
    const what = r.kind === 'infinite' ? `${TX('Has llegado a la oleada')} ${r.index + 1} ${TX('(récord:')} ${Profile.data.infBest}).`
      : `${TX('Victorias:')} ${r.wins}${r.kind !== 'special' ? TX(' de ') + r.schedule.length : ''}.`;
    screen(`${runHeader()}<h2>${win ? (r.kind === 'story' ? TX('¡Etapa completada!') : r.kind === 'chain' ? TX('¡Cadena completada!') : TX('¡Victoria!')) : TX('Fin de la partida')}</h2>
      <p class="note">${what} ${TX('Has ganado')} <b>${r.coinsEarned} ${TX('monedas')}</b> ${TX('y')} <b>${r.ticketsEarned} ${TX('tickets')}</b>${TX(', que se quedan en tu perfil.')}<br>
      ${TX('Las técnicas, habilidades y fichajes temporales se pierden.')}</p>
      ${win && r.kind === 'story' ? (r.stage === 's4' ? '<p class="note"><b>' + TX('Desbloqueado:') + '</b> ' + TX('la cadena «El lado oscuro».') + '</p>' : r.stage === 's3' ? '<p class="note"><b>' + TX('Desbloqueado:') + '</b> ' + TX('la Fase 2 de la Etapa 3: el Mundial.') + '</p>' : r.stage === 's2' ? '<p class="note"><b>' + TX('Desbloqueado:') + '</b> ' + TX('el equipo especial Caos y la Etapa 3.') + '</p>' : '<p class="note"><b>' + TX('Desbloqueado:') + '</b> ' + TX('la Etapa 2, Cadenas, Infinito y nuevos equipos especiales.') + '</p>') : ''}
      <button class="cta" id="toGacha">${TX('Ir al gacha')}</button><button class="ghost" id="toMenu">${TX('Menú')}</button>`, win ? (r.kind === 'story' ? 'ill25' : 'ill27') : 'ill14');
    const end = () => { Run.clear(r.kind); api.run = null; };
    $('toGacha').onclick = () => { end(); renderGacha(); };
    $('toMenu').onclick = () => { end(); renderMenu(); };
  }
  function renderQuickEnd(s, rayo) {
    const a = s.score.A, b = s.score.B;
    screen(`<img class="finimg" src="ui/fin.png" alt="${TX('Fin del partido')}"><h2>${a > b ? TX('¡Victoria!') : a < b ? TX('Derrota') : TX('Empate')}</h2>
      ${scoreLine(s)}
      <p class="note">${TX('El partido rápido no da monedas ni tickets, pero las victorias cuentan para el Rayo Raimon.')}${rayo ? '<br><b>' + TX('⚡ ¡Has ganado un Rayo Raimon!') + '</b>' : ''}</p>
      <button class="cta" id="again">${TX('Otro partido rápido')}</button><button class="ghost" id="toMenu">${TX('Menú')}</button>`, a > b ? 'ill27' : a < b ? 'ill15' : 'ill28');
    $('again').onclick = startQuick; $('toMenu').onclick = renderMenu;
  }

  /* =====================================================================
     MODO CARRERA (pantallas)
     ===================================================================== */
  const myCrestUrl = () => ClubCrest.url(Career.data.crest, Career.data.school);
  const cCrest = key => key === YOU ? `<img class="ccrest" src="${myCrestUrl()}" alt="">` : `<img class="ccrest" src="ui/crest${crestOf(key)}.png" alt="">`;
  const bar = (v, cls) => `<span class="cbar ${cls || ''}"><i style="width:${Math.max(0, Math.min(100, v))}%"></i></span>`;
  const money = n => '💰 ' + (Career.data && Career.data.devMoney && n >= 9999999 ? '∞' : n);
  const WEEK_LABEL = { C: TX('Semana de Copa'), P1: TX('Playoff de ascenso · semifinales'), P2: TX('Playoff de ascenso · final') };
  function renderCareer() {
    const c = Career.data;
    if (!c) return renderCareerNew();
    if (c.over) return renderCareerOver();
    if ((c.pendingYouth || []).length) return renderYouthChoice(renderCareer);
    if (c.wc) return renderWC();
    tutorial('career');
    const nm = Career.nextMatch(), d = Career.myDiv(), mgr = PLAYER(c.manager), wt = Career.weekType();
    const act = (k, A) => `<button class="ghost big act-${k}" data-act="${k}">${A.name}<small>${A.desc}</small></button>`;
    const kindTxt = !nm ? '' : nm.type === 'liga' ? `${TX('Jornada')} ${nm.j + 1}` : nm.type === 'copa' ? `${TX('Copa ·')} ${CUP_ROUND[nm.round]}` : nm.type === 'semi' ? TX('Playoff · semifinal') : TX('Playoff · ¡FINAL!');
    const cupTxt = !c.cup ? TX('La Copa empieza la temporada que viene') : c.cup.winner ? (c.cup.winner === YOU ? TX('¡Campeones de Copa!') : TX('Campeón de Copa: ') + Career.teamName(c.cup.winner)) : c.cup.out ? TX('Eliminados de la Copa: se juega sin ti') : TX('Siguiente ronda: ') + CUP_ROUND[c.cup.round];
    const sponsor = Math.round((8 + c.fame * 0.5) * DIV_SPONSOR[d] * Career.incomeMul());
    screen(`${top(TX('Modo Carrera'))}
      ${c.migrated ? '<p class="note cmsg">' + TX('Tu carrera se ha adaptado a las ligas de 10 equipos: la temporada actual empieza de nuevo (conservas plantilla, fama y dinero).') + '</p>' : ''}
      <div class="chead"><img class="ccrest big" src="${myCrestUrl()}" alt=""><span id="cMgr"></span><div><b>${esc(c.school)}</b><small>${TX('Mánager:')} ${esc(mgr.name)} ${TX('· Temporada')} ${c.season}${c.goal ? TX(' · ★ Campeón de Primera') : ''}</small></div></div>
      <div class="cstats">
        <div><label>${TX('Fama')}</label>${bar(c.fame, c.fame < 15 ? 'bad' : '')}<small>${c.fame}/100${c.fame < 15 ? TX(' · ¡ojo!') : ''}</small></div>
        <div><label>${TX('Forma')}</label>${bar(c.forma, c.forma < 50 ? 'warn' : 'ok')}<small>${c.forma} %</small></div>
        <div><label>${TX('Dinero')}</label><b class="cmoney">${money(c.money)}</b><small>+${sponsor}${TX('/semana')}</small></div>
      </div>
      <p class="cweek">${TX('Semana')} <b>${c.week}</b>/${WEEKS} · ${DIV_NAME[d]} ${TX('División ·')} ${ordTx(Career.myPos())} · 🏆 ${esc(cupTxt)}</p>
      ${nm ? `<div class="cnext">${cCrest(nm.rival)}<div><b>${kindTxt}: ${esc(Career.teamName(nm.rival))}</b><small>${nm.home ? TX('En casa') : TX('Fuera')} ${TX('· tu media')} ${Career.myRating()} ${TX('· rival')} ${Career.rating(nm.rival)}${nm.ko ? TX(' · si hay empate, penaltis') : ''}</small></div></div>`
        : `<div class="cnext free"><span class="cicon">${wt === 'C' ? '🏆' : '📣'}</span><div><b>${WEEK_LABEL[wt] || TX('Semana libre')}</b><small>${wt === 'C' ? esc(cupTxt) : d === 1 ? TX('En Primera no hay playoff: aprovecha para entrenar.') : TX('No juegas el playoff esta temporada: se juega sin ti.')}</small></div></div>`}
      <h3>${TX('Actividad de la semana')} <small>${nm ? TX('después juegas el partido') : TX('y pasa la semana')}</small></h3>
      <div class="grid2">${Object.entries(ACTIVITIES).map(([k, A]) => act(k, A)).join('')}</div>
      <div id="cTrain" hidden><p class="note">${TX('¿Qué entrenáis esta semana? (+')}${2 + c.fac.campo} ${TX('a todo el equipo)')}</p><div class="opts">${STAT_KEYS.map(k => `<button data-st="${k}">${STAT_LABEL[k]}</button>`).join('')}</div></div>
      <div class="grid2 cnav"><button class="ghost" id="cSquad">${TX('👥 Plantilla')}</button><button class="ghost" id="cMarket">${TX('💸 Fichajes')}${(c.scout || []).length ? ' (' + c.scout.length + TX(' ojeados)') : ''}</button>
        <button class="ghost" id="cClub">${TX('🏟️ Club')}</button><button class="ghost" id="cTable">${TX('📊 Clasificación')}</button>
        <button class="ghost" id="cCal">${TX('📅 Calendario')}</button><button class="ghost" id="cCup">${TX('🏆 Copa')}</button>
        <button class="ghost" id="cHall">${TX('🏛️ Salón de la fama')}</button><button class="ghost" id="cSave">${TX('💾 Guardar')}</button></div>
      <button class="ghost" id="cQuit">${TX('Abandonar carrera')}</button>`, 'bg_green');
    c.migrated = false;
    $('cMgr').appendChild(mgrFace(c.manager, 40));
    const after = msg => {
      if (Career.nextMatch()) return renderCareerPre(msg);
      const wt0 = Career.weekType(), wasPO = /^P/.test(wt0);
      Career.data.lastCup = null;
      const sum = Career.advance(); UI.toast(msg, 2600);
      if (sum) renderCareerSeason(sum); else if (wasPO && Career.data.po && Career.myDiv() > 1) renderCareerPOInfo(); else if (wt0 === 'C' && Career.data.lastCup) renderCareerCupRound(Career.data.lastCup); else renderCareer();
    };
    body.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
      const k = b.dataset.act; Sound.sfx('click');
      if (k === 'entrenar') { $('cTrain').hidden = false; $('cTrain').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
      after(Career.doActivity(k));
    });
    body.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { Sound.sfx('reveal'); after(Career.doActivity('entrenar', b.dataset.st)); });
    $('cSquad').onclick = () => renderCareerSquad(renderCareer);
    $('cMarket').onclick = () => renderCareerMarket(c.scout && c.scout.length ? 'ojeados' : 'libres');
    $('cClub').onclick = () => renderCareerClub();
    $('cTable').onclick = () => renderCareerTable(d, renderCareer);
    $('cCal').onclick = renderCareerCal;
    $('cSave').onclick = () => renderSaves(renderCareer);
    $('cCup').onclick = renderCareerCup;
    $('cHall').onclick = () => renderHall(renderCareer);
    $('cQuit').onclick = () => {
      if ($('cQuit').dataset.sure) { Career.clear(); renderMenu(); return; }
      $('cQuit').dataset.sure = 1; $('cQuit').textContent = TX('¿Seguro? Toca otra vez para borrarla');
    };
    $('back').onclick = renderMenu;
  }
  function renderCareerCup() {
    const c = Career.data, C = c.cup;
    const rounds = C ? C.rounds.map((res, i) => `<h3>${CUP_ROUND[i]}</h3><div class="cres">${res.map(poLine).join('')}</div>`).reverse().join('') : '';
    const next = C && !C.winner ? `<h3>${CUP_ROUND[C.round]} <small>${TX('semana')} ${CUP_WEEKS[C.round]}</small></h3><div class="cres">${C.ties.map(([a, b]) => `<p class="${a === YOU || b === YOU ? 'you' : ''}">${esc(Career.teamName(a))} – ${esc(Career.teamName(b))}</p>`).join('')}${C.round === 0 ? `<p><small>${TX('Esperan en octavos:')} ${C.byes.map(k => esc(Career.teamName(k))).join(', ')}</small></p>` : ''}</div>` : '';
    screen(`${top(TX('Copa Inazuma'))}
      <p class="note">${TX('Los 30 equipos de las 3 divisiones, a partido único (con penaltis si hay empate). Ganarla da dinero, fama y')} <b>${TX('10 tickets')}</b> ${TX('para el gacha.')}</p>
      ${!C ? '<p class="note">' + TX('La Copa empieza la temporada que viene.') + '</p>' : C.winner ? `<p class="note cmsg gold">${TX('🏆 Campeón:')} <b>${esc(Career.teamName(C.winner))}</b></p>` : C.out ? '<p class="note cmsg bad">' + TX('Tu club está eliminado.') + '</p>' : ''}
      ${next}${rounds}`, 'bg_green');
    $('back').onclick = renderCareer;
  }
  function renderCareerCupRound(res) {
    const c = Career.data, i = c.cup ? c.cup.rounds.length - 1 : 0;
    screen(`<h2>${TX('Copa Inazuma ·')} ${CUP_ROUND[i]}</h2>${c.cup && c.cup.winner ? `<p class="note cmsg gold">${TX('🏆 Campeón:')} <b>${esc(Career.teamName(c.cup.winner))}</b></p>` : ''}
      <div class="cres">${res.map(poLine).join('')}</div>${bottom('<button class="cta" id="cNext">' + TX('Continuar') + '</button>')}`, 'bg_green');
    $('cNext').onclick = renderCareer;
  }
  function renderHall(back) {
    const list = Career.hall(), c = Career.data;
    const row = (r, now) => `<div class="cpl fac"><img class="ccrest big" src="${ClubCrest.url(r.crest || { shape: 'escudo', c1: '#1f4fc0', c2: '#e8c21a', sym: 'rayo' }, r.school)}" alt=""><div class="cplb"><b>${esc(r.school)}</b>
      <small>${now ? TX('En curso') : new Date(r.date).toLocaleDateString('es-ES')} ${TX('· mánager')} ${esc((PLAYER(r.manager) || {}).name || '?')} · ${(CAREER_DIFF[r.diff] || CAREER_DIFF.normal).name}</small>
      <span class="cst">${r.seasons} ${TX('temporadas · mejor división:')} ${DIV_NAME[r.best]}${r.goal ? TX(' · ★ campeón de Primera') : ''}${r.closed ? TX(' · club cerrado') : ''}</span>
      <span class="cst">${TX('Títulos:')} ${r.titles.length ? r.titles.map(esc).join(', ') : 'ninguno'}${r.scorer ? TX(' · máximo goleador: ') + esc(PLAYER(r.scorer[0]).name) + ' (' + r.scorer[1] + ')' : ''}</span></div></div>`;
    const cur = c && c.history.length ? row({ school: c.school, manager: c.manager, crest: c.crest, seasons: c.history.length, titles: c.titles.map(t => t.name), best: Math.min(...c.history.map(h => h.div)), goal: c.goal, diff: c.diff,
      scorer: (m => m && m.goals ? [m.id, m.goals] : null)(c.squad.slice().sort((a, b) => b.goals - a.goals)[0]) }, true) : '';
    screen(`${top(TX('Salón de la fama'))}<p class="note">${TX('Tus carreras de mánager: las terminadas, las abandonadas y la que llevas ahora.')}</p>
      <div class="csquad">${cur}${list.map(r => row(r)).join('') || (cur ? '' : '<p class="note">' + TX('Aún no hay ninguna carrera terminada.') + '</p>')}</div>`, 'bg_team');
    $('back').onclick = back;
  }
  // Resultados de los playoffs en los que no jugabas
  function renderCareerPOInfo() {
    const c = Career.data;
    const rows = [2, 3].map(d => { const P = c.po[d]; const r = (P.finalRes ? [P.finalRes] : P.res) || [];
      return `<h3>${TX('Playoff ·')} ${DIV_NAME[d]}</h3><div class="cres">${r.map(poLine).join('')}</div>`; }).join('');
    screen(`<h2>${TX('Playoffs de ascenso')}</h2>${rows}${bottom('<button class="cta" id="cNext">' + TX('Continuar') + '</button>')}`, 'bg_green');
    $('cNext').onclick = renderCareer;
  }
  const poLine = ([a, b, ga, gb, pens, w]) => `<p class="${a === YOU || b === YOU ? 'you' : ''}">${esc(Career.teamName(a))} <b>${ga} - ${gb}</b> ${esc(Career.teamName(b))}${pens ? ` <small>${TX('(pen.')} ${pens[0]}-${pens[1]})</small>` : ''} → <b>${esc(Career.teamName(w))}</b></p>`;
  function renderCareerNew() {
    let pick = MANAGERS[0];
    screen(`${top(TX('Nueva carrera'))}
      <p class="note">${TX('Eres el')} <b>${TX('mánager')}</b> ${TX('de un club de instituto a punto de desaparecer. Empiezas en')} <b>${TX('Tercera División')}</b> ${TX('con 7 chavales normales.')}<br>
      ${TX('3 divisiones de 10 equipos. Los 2 primeros suben y del 3º al 6º juegan un')} <b>${TX('playoff')}</b> ${TX('por la tercera plaza; los 3 últimos bajan. Ficha jugadores, mejora el club y gana la')} <b>${TX('Primera')}</b>${TX('… pero si la fama llega a 0, cierran el club.')}</p>
      <h3>${TX('Elige a tu mánager')}</h3><div class="cmgrs" id="cMgrs"></div>
      <h3>${TX('Nombre del instituto')}</h3><div class="giftin"><input id="cSchool" type="text" maxlength="24" value="Instituto Inazuma" autocomplete="off" spellcheck="false" style="text-transform:none"></div>
      <h3>${TX('Dificultad')}</h3><div class="opts" id="cDiff">${Object.entries(CAREER_DIFF).map(([k, D]) => `<button data-diff="${k}" aria-pressed="${k === 'normal'}">${D.name}</button>`).join('')}</div>
      <p class="note">${TX('La equipación y el escudo se eligen después en «Club». Ganar ligas, la Copa o ascender da tickets para el gacha.')}</p>
      ${Career.hall().length ? '<button class="ghost" id="cHall">' + TX('🏛️ Salón de la fama') + '</button>' : ''}
      ${bottom('<button class="cta" id="cGo">' + TX('Empezar carrera') + '</button>')}`, 'bg_title');
    let diff = 'normal';
    body.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => { diff = b.dataset.diff; body.querySelectorAll('[data-diff]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    if ($('cHall')) $('cHall').onclick = () => renderHall(renderCareerNew);
    const box = $('cMgrs');
    [...MANAGERS, ...(Halloween.rayUnlocked() ? [RAY_DARK] : [])].filter(id => PLAYER(id)).forEach(id => {
      const b = document.createElement('button'); b.className = 'cmgr' + (id === pick ? ' sel' : '') + (id === RAY_DARK ? ' ray' : '');
      b.appendChild(mgrFace(id, 64)); b.insertAdjacentHTML('beforeend', `<span>${esc(PLAYER(id).name)}</span>${id === RAY_DARK ? `<small>${TX('+10 % de ingresos')}</small>` : ''}`);
      b.onclick = () => { pick = id; box.querySelectorAll('.cmgr').forEach(x => x.classList.toggle('sel', x === b)); Sound.sfx('click'); };
      box.appendChild(b);
    });
    $('cSchool').addEventListener('keydown', e => e.stopPropagation());
    $('cGo').onclick = () => { Career.create(pick, $('cSchool').value.trim() || TX('Instituto Inazuma'), diff); Sound.sfx('reveal'); renderCareerClub(true); };
    $('back').onclick = renderMenu;
  }
  /* ---------- Mundial de Carrera ---------- */
  const wcCrest = k => k === 'JP' ? '<img class="ccrest" src="ui/crest3016.png" alt="">' : `<img class="ccrest" src="ui/crest${crestOf(k)}.png" alt="">`;
  const wcName = k => k === 'JP' ? TX('Inazuma Japón') : k;
  function renderWC(last) {
    const c = Career.data, w = c.wc; tutorial('wc');
    if (w.state === 'call') {
      const cands = Career.wcCandidates(), sel = new Set(w.pick || []);
      screen(`${top(TX('Mundial · Convocatoria'), 'cBack', TX('Club'))}
        <div class="chead"><img class="ccrest big" src="ui/crest3016.png" alt=""><div><b>${TX('Inazuma Japón')}</b><small>${TX('Mundial · temporada')} ${w.season} ${TX('· eres el seleccionador')}</small></div></div>
        <p class="note">${TX('Convoca a')} <b>${TX('10 jugadores')}</b> ${TX('(dos equipos de 5): los de tu club y los mejores de las ligas (los que juegan en Primera y en los equipos de arriba destacan más). Antes de cada partido eliges qué 5 juegan.')}</p>
        <div class="sortrow"><span id="wcN"></span><button class="ghost mini" id="wcAuto">${TX('⚡ Los 10 mejores')}</button></div>
        <div class="pgrid" id="wcL"></div>
        ${bottom('<button class="cta" id="wcGo" disabled>' + TX('🌍 Empezar el Mundial') + '</button>')}`, 'bg_team');
      const draw = () => {
        const L = $('wcL'); L.innerHTML = '';
        cands.forEach(x => {
          const pd = PLAYER(x.id), el = tile(x.id, `<span class="slot">${x.club === YOU ? TX('Tu club') : esc(Career.teamName(x.club))} ${TX('· media')} ${Career.wcScore(x.id)}</span>`);
          if (sel.has(x.id)) el.classList.add('sel');
          el.onclick = () => { if (sel.has(x.id)) sel.delete(x.id); else if (sel.size < 10) sel.add(x.id); else return UI.toast(TX('Ya tienes 10: quita uno antes')); Sound.sfx('click'); w.pick = [...sel]; draw(); };
          L.appendChild(el);
        });
        $('wcN').textContent = sel.size + TX(' de 10 convocados'); $('wcGo').disabled = sel.size !== 10;
      };
      $('wcAuto').onclick = () => {
        const roles = FORMATIONS[c.formation].roles, pool = cands.map(x => x.id);
        sel.clear(); const ranked = pool.slice().sort((a, b) => Career.wcScore(b) - Career.wcScore(a));
        Career.wcRoles(ranked).forEach(id => sel.add(id)); Career.wcRoles(ranked.filter(id => !sel.has(id))).forEach(id => sel.add(id));
        ranked.forEach(id => { if (sel.size < 10) sel.add(id); });
        w.pick = [...sel]; Sound.sfx('reveal'); draw();
      };
      $('wcGo').onclick = () => { Career.wcStart([...sel]); Sound.sfx('reveal'); renderWC(); };
      $('cBack').onclick = () => UI.toast(TX('Primero convoca a tu selección'));
      draw(); return;
    }
    const tableHtmlWC = () => w.group ? `<table class="ctable"><tr><th></th><th></th><th>${TX('Grupo')}</th><th>${TX('Pts')}</th><th>DG</th></tr>${Career.wcTable().map((r, i) =>
      `<tr class="${r.key === 'JP' ? 'you' : ''} ${i < 2 ? 'zup' : ''}"><td>${i + 1}</td><td>${wcCrest(r.key)}</td><td class="tn">${esc(wcName(r.key))}</td><td><b>${r.pts}</b></td><td>${r.gf - r.gc > 0 ? '+' : ''}${r.gf - r.gc}</td></tr>`).join('')}</table>` : '';
    const lastHtml = last ? `<div class="cvs"><div>${wcCrest('JP')}<b>${TX('Japón')}</b></div><span>${last.gA} - ${last.gB}</span><div>${wcCrest(last.opp)}<b>${esc(last.opp)}</b></div></div>
      ${last.pens ? `<p class="cweek">${TX('Penaltis:')} <b>${last.pens[0]} - ${last.pens[1]}</b></p>` : ''}${last.msg ? `<p class="note cmsg ${w.state === 'out' ? 'bad' : 'gold'}">${esc(last.msg)}</p>` : ''}` : '';
    if (w.state === 'out' || w.state === 'champion') {
      const R = w.reward || {};
      screen(`<h2>${w.state === 'champion' ? TX('🏆 ¡Campeones del mundo!') : TX('Fin del Mundial')}</h2>${lastHtml}
        <p class="cweek">${TX('Resultado:')} <b>${{ campeón: TX('Campeones'), final: TX('Subcampeones'), semi: TX('Semifinalistas'), grupo: TX('Fase de grupos') }[w.place]}</b></p>
        <p class="note cmsg gold">${TX('Fama')} ${R.fame >= 0 ? '+' : ''}${R.fame} · +${R.money} ${TX('💰 para tu club · +')}${R.tickets} ${TX('🎟️ para el gacha')}</p>
        <div class="cres">${w.log.map(l => `<p>${l.r}${TX(': Japón')} <b>${l.gA} - ${l.gB}</b> ${esc(l.opp)}${l.pens ? ` ${TX('(pen.')} ${l.pens[0]}-${l.pens[1]})` : ''}</p>`).join('')}</div>
        ${tableHtmlWC()}
        ${bottom('<button class="cta" id="wcEnd">' + TX('Volver al club') + '</button>')}`, w.state === 'champion' ? 'ill27' : 'bg_green');
      $('wcEnd').onclick = () => { Career.wcClose(); Sound.music('menu'); renderCareer(); };
      return;
    }
    const stage = w.state === 'group' ? `${TX('Fase de grupos · partido')} ${w.round + 1} ${TX('de 3')}` : w.state === 'semi' ? TX('Semifinal') : TX('¡FINAL!');
    screen(`${top(TX('Mundial · ') + (w.state === 'group' ? TX('Grupo') : w.state === 'semi' ? TX('Semifinal') : TX('Final')), 'cBack', TX('Club'))}
      ${lastHtml}
      <div class="cvs"><div>${wcCrest('JP')}<b>${TX('Inazuma Japón')}</b><small>${TX('media')} ${Career.wcRating('JP')}</small></div><span>VS</span><div>${wcCrest(w.opp)}<b>${esc(w.opp)}</b><small>${TX('media')} ${Career.wcRating(w.opp)}</small></div></div>
      <p class="cweek">${stage}${w.state !== 'group' ? TX(' · si hay empate, penaltis') : ''}</p>
      <div class="cres"><p>${TX('Juegan:')} ${w.squad.map(id => esc(PLAYER(id).name)).join(', ')}</p></div><button class="ghost" id="wcLine">${TX('👥 Alineación (10 convocados · 2 equipos)')}</button>
      ${tableHtmlWC()}
      ${bottom('<div class="grid2"><button class="cta" id="wcPlay">' + TX('⚽ Jugar') + '<small>' + TX('tú controlas') + '</small></button><button class="cta" id="wcSim">' + TX('📋 Simular') + '<small>' + TX('como seleccionador') + '</small></button></div>')}`, 'bg_vs');
    $('wcLine').onclick = () => renderWCLine();
    $('wcPlay').onclick = () => { api.mode = 'wc'; startMatch(Career.wcTeams(), w.state !== 'group', TEAM_FIELD[w.opp] || 'normal', w.state === 'final' ? 'match_final' : 'match_hard', w.opp); };
    $('wcSim').onclick = () => { const s = Career.wcSim(), r = Career.wcResult(s.gA, s.gB); Sound.sfx(r.gA > r.gB ? 'reveal' : 'click'); renderWC(r); };
    $('cBack').onclick = () => UI.toast(TX('Termina el Mundial para volver al club'));
  }
  function renderCareerPre(msg) {
    const c = Career.data, nm = Career.nextMatch(), d = Career.myDiv();
    const title = nm.type === 'liga' ? TX('Partido de liga') : nm.type === 'copa' ? TX('Copa · ') + CUP_ROUND[nm.round] : nm.type === 'semi' ? TX('Playoff · semifinal') : TX('Playoff · FINAL');
    screen(`${top(title, 'cBack', TX('Club'))}
      ${msg ? `<p class="note cmsg">${esc(msg)}</p>` : ''}
      <div class="cvs"><div>${cCrest(YOU)}<b>${esc(c.school)}</b><small>${TX('media')} ${Career.myRating()}</small></div><span>VS</span><div>${cCrest(nm.rival)}<b>${esc(Career.teamName(nm.rival))}</b><small>${TX('media')} ${Career.rating(nm.rival)}</small></div></div>
      <p class="cweek">${nm.type === 'liga' ? `${TX('Jornada')} ${nm.j + 1} ${TX('de 9')}` : nm.type === 'copa' ? `${TX('Copa Inazuma ·')} ${CUP_ROUND[nm.round]} ${TX('· a partido único, con penaltis')}` : TX('Eliminatoria: si hay empate, penaltis')} · ${DIV_NAME[d]} · ${nm.home ? TX('en casa') : 'fuera'} ${TX('· forma')} ${c.forma} %</p>
      <button class="ghost" id="cLine">${TX('👥 Alineación (')}${c.formation} · ${FORMATIONS[c.formation].name})</button>
      <h3>${TX('Táctica')} <small>${TX('cuenta sobre todo al simular')}</small></h3>
      <div class="opts">${Object.entries(TACTICS).map(([k, t]) => `<button data-tac="${k}" aria-pressed="${c.tactic === k}">${t.name}</button>`).join('')}</div>
      <p class="note" id="cTacD">${TACTICS[c.tactic].desc}</p>
      ${bottom('<div class="grid2"><button class="cta" id="cPlay">' + TX('⚽ Jugar') + '<small>' + TX('tú controlas') + '</small></button><button class="cta" id="cSim">' + TX('📋 Simular') + '<small>' + TX('como mánager') + '</small></button></div>')}`, 'bg_vs');
    body.querySelectorAll('[data-tac]').forEach(b => b.onclick = () => {
      c.tactic = b.dataset.tac; Career.save(); body.querySelectorAll('[data-tac]').forEach(x => x.setAttribute('aria-pressed', x === b)); $('cTacD').textContent = TACTICS[c.tactic].desc;
    });
    $('cLine').onclick = () => renderCareerSquad(() => renderCareerPre());
    $('cPlay').onclick = () => {
      if (!Career.lineupOk()) Career.autoLineup();
      api.mode = 'career';
      startMatch(Career.matchTeams(), !!nm.ko, TEAM_FIELD[nm.rival], nm.ko && (nm.type !== 'copa' || nm.round >= 3) ? 'match_final' : { 1: 'match_hard', 2: 'match_mid', 3: 'match_easy' }[d], nm.rival);
    };
    $('cSim').onclick = () => { if (!Career.lineupOk()) Career.autoLineup(); renderCareerSim(Career.simulateMine(c.tactic)); };
    $('cBack').onclick = () => UI.toast(TX('Primero juega o simula el partido de esta semana'));
  }
  function renderCareerSim(r) {
    const c = Career.data;
    screen(`<h2>${TX('Simulación')}</h2>
      <div class="cvs sim"><div>${cCrest(YOU)}<b>${esc(c.school)}</b></div><span id="cSc">0 - 0</span><div>${cCrest(r.rival)}<b>${esc(Career.teamName(r.rival))}</b></div></div>
      <p class="cweek" id="cMin">0'</p><div class="cfeed" id="cFeed"></div>
      ${bottom('<button class="ghost" id="cSkip">' + TX('Saltar al final ▶▶') + '</button><button class="cta" id="cDone" hidden>' + TX('Continuar') + '</button>')}`, 'bg_vs');
    let min = 0, i = 0, a = 0, b = 0, done = false;
    Sound.music('match_mid');
    const feed = $('cFeed');
    const show = e => {
      if (e.type === 'goal') { if (e.team === 'A') a++; else b++; $('cSc').textContent = a + ' - ' + b; Sound.sfx('goal'); }
      const line = e.type === 'pens' ? `🥅 <b>${TX('Penaltis:')} ${e.a} - ${e.b}</b> · ${e.a > e.b ? TX('¡pasáis!') : TX('eliminados…')}`
        : e.type === 'goal' ? `⚽ <b>${TX('¡Gol')}${e.team === 'A' ? '' : ' rival'}!</b> ${esc(e.name)}${e.tech ? ' ' + TX('con') + ' <b>' + esc(e.tech) + '</b>' : ''}` : `${TX('🧤 Parada de')} ${esc(e.name || TX('el portero'))}`;
      feed.insertAdjacentHTML('afterbegin', `<p class="${e.team === 'B' ? 'rival' : 'mine'}"><i>${e.min}'</i> ${line}</p>`);
    };
    const finish = () => {
      if (done) return; done = true; clearInterval(iv);
      while (i < r.events.length) show(r.events[i++]);
      $('cMin').textContent = TX('Final'); Sound.sfx('whistleEnd');
      $('cSkip').hidden = true; $('cDone').hidden = false;
    };
    const iv = setInterval(() => {
      min++; $('cMin').textContent = min + "'";
      while (i < r.events.length && r.events[i].min <= min) show(r.events[i++]);
      if (min >= 90) finish();
    }, 65);
    $('cSkip').onclick = finish;
    $('cDone').onclick = () => {
      const out = Career.finishMatch(r.gA, r.gB, r.pens, r.forma, r.events.filter(e => e.type === 'goal' && e.team === 'A').map(e => e.id));
      Sound.stop(0.3); jingleFor(out);
      renderCareerJornada(out);
    };
  }
  const careerWon = out => out.gA > out.gB || (out.gA === out.gB && out.pens && out.pens[0] > out.pens[1]);
  const jingleFor = out => Sound.jingle(careerWon(out) ? 'win' : out.gA === out.gB && !out.pens ? null : 'lose');
  function tableHtml(d, rows) {
    return `<table class="ctable"><tr><th></th><th></th><th>${TX('Equipo')}</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>${TX('Pts')}</th></tr>${rows.map((r, i) =>
      `<tr class="${r.key === YOU ? 'you' : ''} ${d > 1 && i < 2 ? 'zup' : ''} ${d > 1 && i >= 2 && i < 6 ? 'zpo' : ''} ${d < 3 && i >= rows.length - 3 ? 'zdown' : ''}"><td>${i + 1}</td><td>${cCrest(r.key)}</td><td class="tn">${esc(Career.teamName(r.key))}</td><td>${r.pj}</td><td>${r.g}</td><td>${r.e}</td><td>${r.p}</td><td>${r.gf - r.gc > 0 ? '+' : ''}${r.gf - r.gc}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table>
      <p class="note ckey">${d > 1 ? '<span class="zup">■</span> ' + TX('ascenso ·') + ' <span class="zpo">■</span> ' + TX('playoff ·') + ' ' : ''}${d < 3 ? '<span class="zdown">■</span> ' + TX('descenso') : TX('Tercera: los 3 últimos pierden fama')}</p>`;
  }
  function renderCareerJornada(out) {
    const c = Career.data, d = Career.myDiv(), win = careerWon(out), draw = out.gA === out.gB && !out.pens;
    const isPO = out.type !== 'L';
    screen(`<h2>${win ? TX('¡Victoria!') : draw ? TX('Empate') : TX('Derrota')}</h2>
      <div class="cvs"><div>${cCrest(YOU)}<b>${esc(c.school)}</b></div><span>${out.gA} - ${out.gB}</span><div>${cCrest(out.rival)}<b>${esc(Career.teamName(out.rival))}</b></div></div>
      ${out.pens ? `<p class="cweek">${TX('Penaltis:')} <b>${out.pens[0]} - ${out.pens[1]}</b></p>` : ''}
      <p class="cweek">${TX('Fama')} ${out.fame >= 0 ? '+' : ''}${out.fame} ${TX('· Taquilla +')}${out.money} ${TX('💰 · Forma')} ${c.forma} %</p>
      ${out.prog && out.prog.length ? `<p class="note cprog">${out.prog.map(x => `${x.d > 0 ? '📈' : '📉'} ${esc(PLAYER(x.id).name)} ${x.d > 0 ? '+1' : '−1'} ${STAT_LABEL[x.k]}`).join(' · ')}</p>` : ''}
      ${c.over ? '<p class="note cmsg bad">' + TX('La fama ha llegado a 0…') + '</p>' : ''}
      ${out.vencido ? `<div class="cnext vencido" id="cVen"><span id="cVenF"></span><div><b>${TX('¡')}${esc(PLAYER(out.vencido.id).name)} ${TX('quiere unirse a tu club!')}</b><small>${TX('Jugaba en')} ${esc(Career.teamName(out.vencido.key))} · ${PLAYER(out.vencido.id).role} · ${rchip(PLAYER(out.vencido.id).rarity)}</small>
        <button class="cta" id="cVenOk">${TX('Fichar por')} ${out.vencido.price} 💰</button></div></div>` : ''}
      ${out.cupWinner ? `<p class="note cmsg gold">🏆 ${out.cupWinner === YOU ? '<b>' + TX('¡Campeones de la Copa Inazuma!') + '</b> ' + TX('+10 🎟️ para el gacha') : TX('Campeón de Copa: ') + esc(Career.teamName(out.cupWinner))}</p>` : ''}
      ${out.type === 'C' ? `<h3>${TX('Copa Inazuma ·')} ${CUP_ROUND[out.cupRound]}</h3><div class="cres">${(out.results.cup || []).map(poLine).join('')}</div>`
        : isPO ? `<h3>${TX('Playoff de ascenso ·')} ${DIV_NAME[d]}</h3><div class="cres">${(out.results[d] || []).map(poLine).join('')}</div>`
        : `<h3>${TX('Resultados de la jornada ·')} ${DIV_NAME[d]}</h3>
      <div class="cres">${out.results[d].map(([a, b, ga, gb]) => `<p class="${a === YOU || b === YOU ? 'you' : ''}">${esc(Career.teamName(a))} <b>${ga} - ${gb}</b> ${esc(Career.teamName(b))}</p>`).join('')}</div>
      <h3>${TX('Clasificación')}</h3>${tableHtml(d, Career.standings(d))}`}
      ${bottom('<button class="cta" id="cNext">' + TX('Continuar') + '</button>')}`, win ? 'ill27' : draw ? 'bg_green' : 'ill14');
    if (out.vencido) {
      $('cVenF').appendChild(face(Sprites.refOf(PLAYER(out.vencido.id)), 48));
      $('cVenOk').onclick = () => { const r = Career.sign(out.vencido.id, out.vencido.price, out.vencido.key); UI.toast(r.msg, 2200); if (r.ok) { Sound.sfx('reveal'); $('cVen').remove(); } };
    }
    $('cNext').onclick = () => {
      if (c.over) return renderCareerOver();
      const sum = Career.advance();
      Sound.music('menu');
      if (sum) renderCareerSeason(sum); else renderCareer();
    };
  }
  function renderCareerSeason(sum) {
    const c = Career.data, d = sum.div;
    const msg = sum.goal ? '<p class="note cmsg gold">🏆 <b>' + TX('¡Campeones de Primera División!') + '</b> ' + TX('Has completado la carrera. Tu club entra en el salón de la fama… y puedes seguir jugando temporadas para siempre (los rivales mejoran cada año).') + '</p>'
      : sum.champion ? `<p class="note cmsg gold">${TX('🏆 ¡Campeones de')} ${DIV_NAME[d]}!</p>` : '';
    const move = sum.moves.includes('up') ? `<p class="note cmsg gold">${TX('⬆️ ¡Ascenso a')} ${DIV_NAME[d - 1]}!${sum.playoff ? TX(' (por el playoff)') : ''}</p>` : sum.moves.includes('down') ? `<p class="note cmsg bad">${TX('⬇️ Descenso a')} ${DIV_NAME[d + 1]}…</p>` : sum.warning ? '<p class="note cmsg bad">' + TX('El director no está contento: últimos de Tercera.') + '</p>' : '';
    const names = ids => ids.map(id => esc(PLAYER(id).name)).join(', ') || 'nadie';
    screen(`<h2>${TX('Fin de la temporada')} ${sum.season}</h2>
      <p class="cweek">${DIV_NAME[d]} ${TX('División · puesto')} <b>${ordTx(sum.pos)}</b> ${TX('· fama')} ${sum.fame >= 0 ? '+' : ''}${sum.fame} ${TX('· premio +')}${sum.money} 💰</p>
      ${msg}${move}
      ${sum.cupWinner ? `<p class="note">${TX('🏆 Copa Inazuma:')} ${sum.cupWinner === YOU ? '<b>' + TX('¡tu club!') + '</b>' : esc(Career.teamName(sum.cupWinner))}</p>` : ''}
      ${sum.wc ? '<p class="note cmsg gold">🌍 <b>' + TX('¡Llega el Mundial!') + '</b> ' + TX('Te han nombrado seleccionador de Inazuma Japón: convoca a los mejores de las ligas.') + '</p>' : ''}
      ${sum.tickets ? `<p class="note cmsg gold">🎟️ +${sum.tickets} ${TX('tickets para el gacha por tus logros de la temporada')}</p>` : ''}
      ${c.over ? '<p class="note cmsg bad">' + TX('La fama ha llegado a 0 y el director cierra el club.') + '</p>' : ''}
      <h3>${TX('Ascensos y descensos')}</h3>
      <p class="note">${TX('⬆️ A Primera:')} ${sum.promoted[1].map(k => esc(Career.teamName(k))).join(', ')}<br>${TX('⬆️ A Segunda:')} ${sum.promoted[2].map(k => esc(Career.teamName(k))).join(', ')}<br>
      ${TX('⬇️ A Segunda:')} ${sum.relegated[1].map(k => esc(Career.teamName(k))).join(', ')}<br>${TX('⬇️ A Tercera:')} ${sum.relegated[2].map(k => esc(Career.teamName(k))).join(', ')}</p>
      <h3>${TX('Tu plantilla')}</h3>
      <p class="note">${TX('🎓 Se gradúan ({0}):', yearTx(LAST_YEAR))} ${names(sum.grads)}<br>${TX('🌱 Llegan de la cantera:')} ${names(sum.youth)}<br>${TX('📈 El resto pasa de curso y gana experiencia:')} <b>+${sum.growth || 1} ${TX('en todas sus stats')}</b>.</p>
      ${(sum.pendingYouth || []).length ? `<p class="note cmsg gold">🌱 ${names(sum.pendingYouth)} ${sum.pendingYouth.length > 1 ? 'quieren' : 'quiere'} ${TX('entrar, pero la plantilla está llena: ahora eliges si haces hueco.')}</p>` : ''}
      ${sum.goal ? hallHtml() : ''}
      ${bottom(`<button class="cta" id="cNext">${c.over ? TX('Ver resumen') : sum.goal ? TX('Seguir jugando (infinito)') : TX('Empezar temporada ') + c.season}</button>`)}`, sum.champion || sum.moves.includes('up') ? 'ill25' : 'bg_team');
    if (sum.champion || sum.moves.includes('up')) Sound.jingle('win');
    $('cNext').onclick = () => { Sound.music('menu'); c.over ? renderCareerOver() : renderCareer(); };
  }
  // Juveniles que no caben: entra si dejas ir a alguien, o se va a otro instituto
  function renderYouthChoice(next) {
    const c = Career.data, kid = (c.pendingYouth || [])[0];
    if (!kid) return next();
    const pd = PLAYER(kid.id);
    screen(`<h2>${TX('🌱 Llega un juvenil')}</h2>
      <p class="note"><b>${esc(pd.name)}</b> (${ROLE_LABEL[pd.role]}${TX(', 1º curso) quiere entrar en el club, pero tu plantilla está llena (')}${SQUAD_MAX}/${SQUAD_MAX}${TX('). ¿Le haces hueco?')}</p>
      <div class="csquad" id="yKid"></div>
      <h3>${TX('Elige a quién dejas ir')}</h3>
      <p class="note">${TX('Ordenados de peor a mejor. Se va del club sin cobrar nada.')}</p>
      <div class="csquad" id="ySquad"></div>
      ${bottom(`<button class="ghost" id="yNo">${TX('No, que')} ${esc(pd.name)} ${TX('se vaya a otro instituto')}</button>`)}`, 'bg_team');
    $('yKid').appendChild(playerRow(kid.id, `<span class="cst">${TX('1º curso · de la cantera')}</span>`, kid));
    c.squad.slice().sort((a, b) => Career.ovr(a) - Career.ovr(b)).forEach(m => {
      const el = playerRow(m.id, `<span class="cst">${yearTx(m.year)}${c.lineup.includes(m.id) ? ' · <b>' + TX('titular') + '</b>' : ''}</span><button class="ghost mini">${TX('Dejar ir')}</button>`, m);
      el.querySelector('button').onclick = () => { const r = Career.resolveYouth(kid.id, m.id); if (r.ok) { UI.toast(r.msg, 2000); Sound.sfx('reveal'); renderYouthChoice(next); } };
      $('ySquad').appendChild(el);
    });
    $('yNo').onclick = () => { const r = Career.resolveYouth(kid.id, null); if (r.ok) UI.toast(r.msg, 1800); renderYouthChoice(next); };
  }
  function hallHtml() {
    const c = Career.data;
    return `<h3>${TX('Salón de la fama')}</h3><p class="note">${esc(c.school)} ${TX('· mánager')} ${esc(PLAYER(c.manager).name)}<br>
      ${TX('Temporadas:')} <b>${c.history.length}</b> ${TX('· Títulos:')} <b>${c.titles.length}</b>${c.titles.length ? ' (' + c.titles.map(t => esc(t.name) + ' ' + TX('T{0}', t.season)).join(', ') + ')' : ''}<br>
      ${TX('Recorrido:')} ${c.history.map(h => TX('T{0}', h.season) + ' ' + DIV_NAME[h.div][0] + ordTx(h.pos) + (h.up ? '⬆' : h.down ? '⬇' : '')).join(' · ') || '—'}</p>`;
  }
  function renderCareerOver() {
    screen(`<h2>${TX('Fin de la carrera')}</h2><p class="note cmsg bad">${TX('La fama del club ha llegado a 0 y el director ha cerrado el club de fútbol.')}</p>
      ${hallHtml()}
      ${bottom('<div class="grid2"><button class="cta" id="cNew">' + TX('Nueva carrera') + '</button><button class="ghost" id="cMenu">' + TX('Menú') + '</button></div>')}`, 'ill15');
    $('cNew').onclick = () => { Career.clear(); renderCareerNew(); };
    $('cMenu').onclick = renderMenu;
  }
  function renderCareerTable(d, back) {
    const c = Career.data;
    const po = c.po && c.po[d] ? `<h3>${TX('Playoff')}</h3><div class="cres">${[...(c.po[d].res || []), ...(c.po[d].finalRes ? [c.po[d].finalRes] : [])].map(poLine).join('') || '<p>' + TX('Semifinales:') + ' ' + c.po[d].semis.map(([a, b]) => esc(Career.teamName(a)) + ' – ' + esc(Career.teamName(b))).join(' · ') + '</p>'}</div>` : '';
    screen(`${top(TX('Clasificación'))}
      <div class="opts">${[1, 2, 3].map(k => `<button data-dv="${k}" aria-pressed="${k === d}">${DIV_NAME[k]}</button>`).join('')}</div>
      ${tableHtml(d, Career.standings(d))}${po}`, 'bg_green');
    body.querySelectorAll('[data-dv]').forEach(b => b.onclick = () => renderCareerTable(+b.dataset.dv, back));
    $('back').onclick = back;
  }
  function renderCareerCal() {
    const c = Career.data, d = Career.myDiv();
    const rows = Array.from({ length: WEEKS }, (_, i) => {
      const w = i + 1, t = SCHED[w], j = Career.jornadaOf(w);
      if (t === 'C') {
        const r = CUP_WEEKS.indexOf(w), C = c.cup, played = C && C.rounds[r], mine = played && played.find(x => x[0] === YOU || x[1] === YOU);
        const txt = mine ? `${esc(Career.teamName(mine[0] === YOU ? mine[1] : mine[0]))} <b>${mine[0] === YOU ? mine[2] + ' - ' + mine[3] : mine[3] + ' - ' + mine[2]}</b>${mine[5] === YOU ? ' ✓' : ' ✗'}`
          : C && C.round === r && Career.cupTie() ? 'vs ' + esc(Career.teamName(Career.cupTie().find(k => k !== YOU))) : C && (C.out || C.winner) && r >= C.round ? '<small>' + TX('(sin ti)') + '</small>' : '';
        return `<p class="${w === c.week ? 'now' : ''}"><i>${TX('S{0}', w)}</i> ${TX('🏆 Copa ·')} ${CUP_ROUND[r]} ${txt}</p>`;
      }
      if (t !== 'L') return `<p class="${w === c.week ? 'now' : ''}"><i>${TX('S{0}', w)}</i> ${t === 'P1' ? TX('Playoff · semifinales') : TX('Playoff · final')} <small>${TX('(3º a 6º de Segunda y Tercera)')}</small></p>`;
      const m = c.fix[d][j].find(p => p.includes(YOU)), rv = m[0] === YOU ? m[1] : m[0];
      const res = c.results[d][j].find(r => r[0] === YOU || r[1] === YOU);
      const sc = res ? (res[0] === YOU ? res[2] + ' - ' + res[3] : res[3] + ' - ' + res[2]) : '';
      return `<p class="${w === c.week ? 'now' : ''}"><i>${TX('S{0}', w)}</i> ${TX('J{0}', j + 1)} ${m[0] === YOU ? 'vs' : TX('en')} ${cCrest(rv)} ${esc(Career.teamName(rv))} ${sc ? '<b>' + sc + '</b>' : ''}</p>`;
    }).join('');
    screen(`${top(TX('Calendario'))}<p class="cweek">${TX('Temporada')} ${c.season} · ${DIV_NAME[d]} ${TX('División')}</p><div class="cres ccal">${rows}</div>`, 'bg_green');
    $('back').onclick = renderCareer;
  }
  const statsLine = m => STAT_KEYS.map(k => `${STAT_LABEL[k].slice(0, 3)} <b>${Career.stat(m, k)}</b>`).join(' · ');
  function playerRow(id, extra, m) {
    const pd = PLAYER(id), el = document.createElement('div'); el.className = 'cpl';
    el.appendChild(face(Sprites.refOf(pd), 48));
    m = m || Career.member(id);
    el.insertAdjacentHTML('beforeend', `<div class="cplb"><b>${esc(pd.name)}</b> <small>${RAB(pd.role)} · ${rchip(pd.rarity)} ${TX('· media')} ${Career.ovr(m)}</small>
      <span class="cst">${statsLine(m)}</span>${extra || ''}</div>`);
    return el;
  }
  function renderCareerSquad(back, sel = 0) {
    const c = Career.data;
    if (!Career.lineupOk()) Career.autoLineup();
    const roles = FORMATIONS[c.formation].roles;
    screen(`${top(TX('Plantilla'))}
      ${formSelect(c)}
      <div class="edbar"><button class="ghost" id="cAuto">${TX('⚡ Mejor equipo')}</button><span class="note">${TX('Media:')} <b>${Career.myRating()}</b> · ${c.squad.length}/${SQUAD_MAX} ${TX('jugadores')}</span></div>
      <div id="cPitch"></div>
      <h3>${TX('Puesto:')} ${ROLE_LABEL[roles[sel]]} <small>${TX('toca un jugador para ponerlo')}</small></h3>
      <div class="csquad" id="cList"></div>`, 'bg_green');
    $('cPitch').appendChild(pitch(roles, c.lineup.map((id, i) => { const m = Career.m(id), pd = PLAYER(id); return { ref: Sprites.refOf(pd), name: pd.name, rarity: pd.rarity, badge: Career.rate(m, roles[i]) }; }),
      sel, i => renderCareerSquad(back, i)));
    $('formSel').onchange = e => { c.formation = e.target.value; Career.autoLineup(); Career.save(); renderCareerSquad(back, 0); };
    $('cAuto').onclick = () => { Career.autoLineup(); Career.save(); Sound.sfx('reveal'); renderCareerSquad(back, sel); };
    const list = $('cList');
    c.squad.slice().sort((a, b) => Career.rate(b, roles[sel]) - Career.rate(a, roles[sel])).forEach(m => {
      const at = c.lineup.indexOf(m.id);
      const el = playerRow(m.id, `<span class="cst">${yearTx(m.year)}${m.year >= LAST_YEAR ? TX(' (se gradúa al acabar)') : ''}${at >= 0 ? TX(' · titular (') + RAB(roles[at]) + ')' : ''} ${TX('· nota aquí')} ${Career.rate(m, roles[sel])} · ${m.games} ${TX('PJ ·')} ${m.goals} ${TX('goles')}</span>
        <span class="cst">⚡ ${Career.equipped(m).map(t => esc(TECH(t).name)).join(' · ') || TX('sin técnicas')} <button class="ghost mini ctech">${TX('Técnicas')}</button></span>`, m);
      el.classList.add('btn'); if (at >= 0) el.classList.add('sel');
      el.querySelector('.ctech').onclick = e => { e.stopPropagation(); renderCareerTechs(m.id, () => renderCareerSquad(back, sel)); };
      el.onclick = () => {
        if (roles[sel] === 'POR' && !playsAs(PLAYER(m.id), 'POR')) return UI.toast(TX('A portería solo pueden ir porteros'));
        if (at >= 0 && roles[at] === 'POR' && !playsAs(PLAYER(c.lineup[sel]), 'POR')) return UI.toast(TX('Así la portería se quedaría sin portero'));
        if (at >= 0) c.lineup[at] = c.lineup[sel];
        c.lineup[sel] = m.id; Career.save(); Sound.sfx('click'); renderCareerSquad(back, sel);
      };
      list.appendChild(el);
    });
    $('back').onclick = back;
  }

  function renderCareerTechs(id, back) {
    const m = Career.m(id), pd = PLAYER(id), eq = Career.equipped(m), ls = Career.learnset(id);
    screen(`${top(TX('Técnicas · ') + esc(pd.name))}
      <p class="note">${TX('Elige hasta')} <b>${TECH_SLOTS}</b> ${TX('técnicas para los partidos. Solo puedes usar las que')} <b>${esc(pd.name)}</b> ${TX('aprende en el juego (')}${ls.length}).</p>
      <div class="csquad" id="ctL"></div>`, 'bg_green');
    const L = $('ctL');
    ls.forEach(t => {
      const T = TECH(t), on = eq.includes(t), el = document.createElement('button');
      el.className = 'cpl btn' + (on ? ' sel' : '');
      el.innerHTML = `<div class="cplb"><b>${TYPE_ICON[T.type] || '★'} ${esc(T.name)}</b> <small>${TYPE_LABEL[T.type]} ${TX('· potencia')} ${T.power} · ${chip(T.elem)}</small><span class="cst">${on ? TX('✅ Equipada') : m.known.includes(t) ? TX('Aprendida · toca para equipar') : TX('Toca para equipar')}</span></div>`;
      el.onclick = () => { Career.toggleEquip(id, t); Sound.sfx('click'); renderCareerTechs(id, back); };
      L.appendChild(el);
    });
    if (!ls.length) L.innerHTML = '<p class="note">' + TX('Este jugador no aprende técnicas.') + '</p>';
    $('back').onclick = back;
  }
  function renderWCLine(sel = 0) {
    const c = Career.data, w = c.wc, roles = FORMATIONS[c.formation].roles;
    screen(`${top(TX('Mundial · Alineación'))}
      <div class="edbar"><button class="ghost" id="wlBest">${TX('⚡ Mejores 5')}</button><button class="ghost" id="wl2">${TX('🔄 Equipo 2 (los otros 5)')}</button></div>
      <p class="note">${TX('Media:')} <b>${Career.wcRating('JP')}</b> ${TX('· formación')} ${c.formation} ${TX('· toca un puesto del campo y luego a un convocado.')}</p>
      <div id="wlPitch"></div><h3>${TX('Puesto:')} ${ROLE_LABEL[roles[sel]]}</h3><div class="pgrid" id="wlL"></div>`, 'bg_green');
    $('wlPitch').appendChild(pitch(roles, w.squad.map(id => ({ ref: Sprites.refOf(PLAYER(id)), name: PLAYER(id).name, rarity: PLAYER(id).rarity, halloween: PLAYER(id).halloween, xmas: PLAYER(id).xmas, badge: Career.wcScore(id) })), sel, i => renderWCLine(i)));
    (w.call || w.squad).forEach(id => {
      const at = w.squad.indexOf(id), el = tile(id, `<span class="slot">${at >= 0 ? TX('Juega · ') + RAB(roles[at]) : TX('Banquillo')} ${TX('· media')} ${Career.wcScore(id)}</span>`);
      if (at >= 0) el.classList.add('sel');
      el.onclick = () => { if (Career.wcSet(sel, id) === false) return UI.toast(TX('A portería solo pueden ir porteros')); Sound.sfx('click'); renderWCLine(Math.min(4, sel + 1)); };
      $('wlL').appendChild(el);
    });
    $('wlBest').onclick = () => { if (w.call) Career.wcBest(); Sound.sfx('reveal'); renderWCLine(sel); };
    $('wl2').onclick = () => { if (w.call) Career.wcTeam2(); Sound.sfx('reveal'); renderWCLine(sel); };
    $('back').onclick = () => renderWC();
  }

  /* ---------- Fichajes ---------- */
  let mkDiv = null, mkRole = '', mkAbroad = '';
  function renderCareerMarket(tab = 'libres') {
    const c = Career.data, err = Career.canSign();
    mkDiv = mkDiv || Career.myDiv();
    const tabs = [['ojeados', `${TX('Ojeados (')}${(c.scout || []).length})`], ['libres', TX('Libres')], ['clubes', TX('Otros clubes')], ['fuera', TX('🌍 Fuera')], ['vender', TX('Vender')]];
    const roleF = `<div class="opts small">${[['', TX('Todos')], ...ROLES4.map(r => [r, RAB(r)])].map(([v, t]) => `<button data-role="${v}" aria-pressed="${mkRole === v}">${t}</button>`).join('')}</div>`;
    screen(`${top(TX('Fichajes'))}
      <p class="cweek">${money(c.money)} ${TX('· plantilla')} ${c.squad.length}/${SQUAD_MAX}${err ? ' · <b>' + TX('llena') + '</b>' : ''}</p>
      <div class="opts">${tabs.map(([k, t]) => `<button data-tab="${k}" aria-pressed="${k === tab}">${t}</button>`).join('')}</div>
      <div id="mkHead"></div><div class="csquad" id="mkList"></div>`, 'bg_green');
    body.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => renderCareerMarket(b.dataset.tab));
    $('back').onclick = renderCareer;
    const list = $('mkList'), head = $('mkHead');
    const buyBtn = (id, price, from, label) => {
      const pd = PLAYER(id), el = playerRow(id, `<span class="cst">${from ? TX('En ') + esc(Career.teamName(from)) + ' · ' : ''}${label || ''}</span><button class="cta mini">${from ? TX('Negociar') : TX('Fichar · ') + price + ' 💰'}</button>`);
      el.querySelector('button').onclick = () => {
        if (from) return renderNegotiation(from, id, tab);
        const r = Career.sign(id, price); UI.toast(r.msg, 2200); if (r.ok) { Sound.sfx('reveal'); renderCareerMarket(tab); }
      };
      return el;
    };
    const roleOk = id => !mkRole || PLAYER(id).role === mkRole;
    if (tab === 'ojeados') {
      head.innerHTML = '<p class="note">' + TX('Joyas que han encontrado tus ojeadores: mucho más baratas que en el mercado, pero solo durante unas semanas. Usa la actividad «Ojear» para buscar más.') + '</p>';
      if (!(c.scout || []).length) list.innerHTML = '<p class="note">' + TX('Aún no hay nadie ojeado.') + '</p>';
      (c.scout || []).forEach(s => list.appendChild(buyBtn(s.id, s.price, null, `${TX('Disponible hasta la semana')} ${Math.min(WEEKS, s.until)}`)));
    } else if (tab === 'libres') {
      head.innerHTML = '<p class="note">' + TX('Agentes libres de esta semana (la lista cambia cada semana). Se fichan al momento, sin negociar.') + '</p>' + roleF;
      const mk = Career.marketList();
      mk.libres.filter(roleOk).forEach(id => { const el = buyBtn(id, Math.round(Career.value(id) * 0.8 / 5) * 5, null, id === mk.star ? TX('⭐ Oportunidad de la semana') : ''); if (id === mk.star) el.classList.add('sel'); list.appendChild(el); });
    } else if (tab === 'clubes') {
      head.innerHTML = `<p class="note">${TX('Haz una oferta a otro club. Sus estrellas cuestan más, y a los clubes de divisiones superiores no les gusta vender a uno de abajo. Si te pasas de tacaño, cortan la negociación hasta la semana siguiente.')}</p>
        <div class="opts">${[1, 2, 3].map(k => `<button data-mdv="${k}" aria-pressed="${k === mkDiv}">${DIV_NAME[k]}</button>`).join('')}</div>${roleF}`;
      Career.clubPlayers(mkDiv).filter(x => roleOk(x.id)).sort((a, b) => Career.value(b.id, b.key) - Career.value(a.id, a.key))
        .forEach(x => list.appendChild(buyBtn(x.id, 0, x.key, TX('valor aprox. ') + Career.value(x.id, x.key) + ' 💰' + (x.star ? TX(' · ⭐ su estrella: pedirán más') : ''))));
    } else if (tab === 'fuera') {
      const countries = [...new Set(GAME.players.filter(p => p.abroad).map(p => p.abroad))].sort();
      mkAbroad = countries.includes(mkAbroad) ? mkAbroad : '';
      head.innerHTML = `<p class="note">${TX('Jugadores')} <b>${TX('fuera del país')}</b>${TX(': las selecciones del mundo del Inazuma 3. Se fichan al momento, pero el traspaso internacional cuesta un 30 % más.')}</p>
        <div class="pfsel" style="grid-template-columns:1fr"><select id="mkCountry"><option value="">${TX('Todos los países')}</option>${countries.map(k => `<option value="${esc(k)}" ${k === mkAbroad ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></div>${roleF}`;
      $('mkCountry').onchange = e => { mkAbroad = e.target.value; renderCareerMarket(tab); };
      const ids = Career.abroadList(mkAbroad).filter(p => roleOk(p.id)).sort((a, b) => Career.value(b.id) - Career.value(a.id));
      if (!ids.length) list.innerHTML = '<p class="note">' + TX('No queda nadie disponible con ese filtro.') + '</p>';
      ids.slice(0, 60).forEach(p => list.appendChild(buyBtn(p.id, Career.abroadPrice(p.id), null, TX('🌍 Fuera del país · ') + esc(p.abroad))));
    } else {
      head.innerHTML = `<p class="note">${TX('Vender: un club paga el 70 % de su valor. Liberar: se va gratis (para hacer hueco). Mínimo')} ${SQUAD_MIN} ${TX('jugadores.')}</p>`;
      c.squad.forEach(m => {
        const el = playerRow(m.id, `<span class="cst">${yearTx(m.year)} ${TX('· valor')} ${Career.value(m.id)} 💰</span><span class="row2"><button class="ghost mini" data-sell>${TX('Vender ·')} ${Math.round(Career.value(m.id) * 0.7 / 5) * 5} 💰</button><button class="ghost mini" data-rel>${TX('Liberar')}</button></span>`, m);
        el.querySelector('[data-sell]').onclick = () => { const r = Career.sell(m.id); UI.toast(r.msg, 2200); if (r.ok) renderCareerMarket(tab); };
        el.querySelector('[data-rel]').onclick = e => {
          if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = TX('¿Seguro?'); return; }
          const r = Career.release(m.id); UI.toast(r.msg, 2000); if (r.ok) renderCareerMarket(tab);
        };
        list.appendChild(el);
      });
    }
    body.querySelectorAll('[data-mdv]').forEach(b => b.onclick = () => { mkDiv = +b.dataset.mdv; renderCareerMarket(tab); });
    body.querySelectorAll('[data-role]').forEach(b => b.onclick = () => { mkRole = b.dataset.role; renderCareerMarket(tab); });
  }
  function renderNegotiation(key, id, tab) {
    const c = Career.data, pd = PLAYER(id), val = Career.value(id, key);
    let amount = Math.round(val * 0.85 / 5) * 5, counter = null;
    screen(`${top(TX('Negociación'), 'nBack', TX('Fichajes'))}
      <div class="cvs"><div>${cCrest(YOU)}<b>${esc(c.school)}</b><small>${money(c.money)}</small></div><span>⇄</span><div>${cCrest(key)}<b>${esc(Career.teamName(key))}</b><small>${DIV_NAME[Career.divOf(key)]}</small></div></div>
      <div id="nPl"></div>
      <p class="cweek">${TX('Valor de mercado aproximado:')} <b>${val} 💰</b></p>
      <div class="negbox"><button class="ghost" data-d="-0.1">−10 %</button><b id="nAmt">${amount} 💰</b><button class="ghost" data-d="0.1">+10 %</button></div>
      <p class="note cmsg" id="nMsg">${TX('Haz tu oferta.')}</p>
      ${bottom('<div class="grid2"><button class="cta" id="nOffer">' + TX('Ofertar') + '</button><button class="cta" id="nCounter" hidden>' + TX('Aceptar') + '</button></div>')}`, 'bg_vs');
    $('nPl').appendChild(playerRow(id));
    const upd = () => { $('nAmt').textContent = amount + ' 💰'; };
    body.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { amount = Math.max(5, Math.round(amount * (1 + +b.dataset.d) / 5) * 5); upd(); });
    const done = price => {
      const r = Career.sign(id, price, key); UI.toast(r.msg, 2400);
      if (r.ok) { Sound.sfx('reveal'); renderCareerMarket(tab); } else $('nMsg').textContent = r.msg;
    };
    $('nOffer').onclick = () => {
      if (amount > c.money) { $('nMsg').textContent = TX('No tienes tanto dinero.'); return; }
      const r = Career.offer(key, id, amount);
      if (r.res === 'accept') return done(amount);
      $('nMsg').textContent = r.msg;
      if (r.res === 'counter') { counter = r.price; $('nCounter').hidden = false; $('nCounter').textContent = TX('Aceptar ') + counter + ' 💰'; }
      if (r.res === 'closed' || (r.res === 'reject' && /cierra/.test(r.msg))) { $('nOffer').disabled = true; $('nCounter').hidden = true; }
    };
    $('nCounter').onclick = () => { if (counter > c.money) { $('nMsg').textContent = TX('No tienes tanto dinero.'); return; } const r = Career.offer(key, id, counter); if (r.res === 'accept') done(counter); else $('nMsg').textContent = r.msg; };
    $('nBack').onclick = () => renderCareerMarket(tab);
  }

  /* ---------- Club: mejoras, equipación y escudo ---------- */
  function renderCareerClub(first) {
    const c = Career.data;
    const sw = (k, v) => `<div class="swatches">${KIT_COLORS.map(col => `<button class="sw" data-k="${k}" data-c="${col}" style="background:${col}" aria-pressed="${v === col}"></button>`).join('')}</div>`;
    screen(`${top(first ? TX('Tu club') : TX('Club'), 'back', first ? TX('Listo') : TX('Volver'))}
      <div class="clubpv"><img class="ccrest huge" id="crPv" src="${myCrestUrl()}" alt=""><span id="kitPv"></span><div><b>${esc(c.school)}</b><small>${money(c.money)}</small></div></div>
      <h3>${TX('Equipación')}</h3><p class="note">${TX('Camiseta')}</p>${sw('a', c.kit.a)}<p class="note">${TX('Mangas y pantalón')}</p>${sw('b', c.kit.b)}
      <p class="note">${TX('Diseño')}</p><div class="opts kitdz">${KIT_DESIGNS.map(([d, n]) => `<button data-dz="${d}" aria-pressed="${(c.kit.d || '') === d}">${n}</button>`).join('')}</div>
      <h3>${TX('Escudo')}</h3>
      <div class="opts">${CREST_SHAPES.map(s => `<button data-shape="${s}" aria-pressed="${c.crest.shape === s}">${s[0].toUpperCase() + s.slice(1)}</button>`).join('')}</div>
      <p class="note">${TX('Color de fondo')}</p>${sw('c1', c.crest.c1)}<p class="note">${TX('Color del borde y símbolo')}</p>${sw('c2', c.crest.c2)}
      <div class="opts syms">${[['iniciales', TX('Iniciales')], ...Object.entries(CREST_SYMBOLS)].map(([k, s]) => `<button data-sym="${k}" aria-pressed="${c.crest.sym === k}">${s}</button>`).join('')}</div>
      ${first ? '' : `<h3>${TX('Mejoras del club')}</h3><div class="csquad">${Object.entries(FACILITIES).map(([k, F]) => { const lv = c.fac[k], cost = F.cost[lv];
        return `<div class="cpl fac"><div class="cplb"><b>${F.name}</b> <small>${TX('nivel')} ${lv}/${F.cost.length}</small><span class="cst">${F.desc}</span></div>${cost != null ? `<button class="cta mini" data-up="${k}" ${c.money < cost ? 'disabled' : ''}>${TX('Mejorar ·')} ${cost} 💰</button>` : '<span class="cst">' + TX('Máximo') + '</span>'}</div>`; }).join('')}</div>`}
      ${first ? bottom('<button class="cta" id="cDone">' + TX('¡A jugar!') + '</button>') : ''}`, 'bg_green');
    const ref = Sprites.refOf(PLAYER(c.lineup && c.lineup[2] || c.squad[0].id));
    const drawPv = () => { const k = $('kitPv'); k.innerHTML = ''; k.appendChild(Sprites.kitPreview(ref, c.kit, 2)); $('crPv').src = myCrestUrl(); };
    drawPv();
    body.querySelectorAll('.sw').forEach(b => b.onclick = () => {
      const k = b.dataset.k; if (k === 'a' || k === 'b') c.kit[k] = b.dataset.c; else c.crest[k] = b.dataset.c;
      Career.save(); b.parentNode.querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv();
    });
    body.querySelectorAll('[data-dz]').forEach(b => b.onclick = () => { c.kit.d = b.dataset.dz; Career.save(); body.querySelectorAll('[data-dz]').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv(); });
    body.querySelectorAll('[data-shape]').forEach(b => b.onclick = () => { c.crest.shape = b.dataset.shape; Career.save(); body.querySelectorAll('[data-shape]').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv(); });
    body.querySelectorAll('[data-sym]').forEach(b => b.onclick = () => { c.crest.sym = b.dataset.sym; Career.save(); body.querySelectorAll('[data-sym]').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv(); });
    body.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const r = Career.upgrade(b.dataset.up); UI.toast(r.msg, 2000); if (r.ok) { Sound.sfx('reveal'); renderCareerClub(); } });
    $('back').onclick = renderCareer;
    if ($('cDone')) $('cDone').onclick = renderCareer;
  }

  /* ---------- Guardar y cargar partidas ---------- */
  const snapshot = () => Cloud.snapshot();
  const restore = o => Cloud.restore(o);
  const slotKey = i => 'inazuma-slot-' + i;
  const reloadGame = (t = TX('Cargando tu partida…')) => { screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${t}</span></div>`, 'bg_title'); setTimeout(() => location.reload(), 350); };
  async function packCode(obj) {
    const json = JSON.stringify(obj);
    try {
      const cs = new CompressionStream('gzip'), w = new Blob([json]).stream().pipeThrough(cs);
      const buf = new Uint8Array(await new Response(w).arrayBuffer());
      let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
      return 'IRZ1:' + btoa(s);
    } catch (_) { return 'IRJ1:' + btoa(unescape(encodeURIComponent(json))); }
  }
  async function unpackCode(code) {
    code = code.trim().replace(/\s+/g, '');
    if (code.startsWith('IRJ1:')) return JSON.parse(decodeURIComponent(escape(atob(code.slice(5)))));
    if (!code.startsWith('IRZ1:')) throw new Error('formato');
    const bin = atob(code.slice(5)), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const ds = new DecompressionStream('gzip'), r = new Blob([buf]).stream().pipeThrough(ds);
    return JSON.parse(await new Response(r).text());
  }
  const describe = o => { const d = Cloud.describe(o || {}); return `${d.players} ${TX('jugadores ·')} ${d.tickets} 🎟️${d.career ? TX(' · Carrera: ') + esc(d.career) : ''}`; };
  const ago = t => { if (!t) return ''; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'ahora mismo' : m < 60 ? 'hace ' + m + ' min' : m < 1440 ? 'hace ' + Math.round(m / 60) + ' h' : new Date(t).toLocaleDateString('es-ES'); };
  // Línea de estado de la cuenta (menú y pantalla de cuenta)
  function cloudLine() {
    if (!Cloud.enabled()) return '';
    const S = Cloud.state;
    if (!Cloud.loggedIn()) return `<p class="cloudst warn">${TX('Invitado · tu partida solo está en este móvil.')} <b>${TX('Crea una cuenta')}</b> ${TX('para no perderla.')}</p>`;
    if (Cloud.expired() || S.status === 'expired') return `<p class="cloudst warn">👤 ${esc(Cloud.user())} ${TX('· sesión caducada:')} <b>${TX('vuelve a entrar')}</b> ${TX('para guardar en la nube.')}</p>`;
    if (S.status === 'conflict') return `<p class="cloudst warn">👤 ${esc(Cloud.user())} ${TX('· hay dos versiones de tu partida:')} <b>${TX('elige cuál conservar')}</b>.</p>`;
    if (S.status === 'offline') return `<p class="cloudst warn">👤 ${esc(Cloud.user())} ${TX('· sin conexión: se guardará en la nube al volver internet.')}</p>`;
    if (S.status === 'error') return `<p class="cloudst warn">👤 ${esc(Cloud.user())} · ${esc(S.msg)}</p>`;
    if (S.status === 'saving') return `<p class="cloudst">👤 ${esc(Cloud.user())} ${TX('· guardando en la nube…')}</p>`;
    return `<p class="cloudst ok">👤 ${esc(Cloud.user())}${Cloud.via() === 'google' ? TX(' (Google)') : ''} ${TX('· ☁️ guardado en la nube')}${S.lastOk ? ' ' + ago(S.lastOk) : ''}</p>`;
  }
  // Refresca la línea de estado si está en pantalla; avisa una vez si aparece un conflicto
  let lastCloudStatus = Cloud.state.status;
  Cloud.onChange(S => {
    document.querySelectorAll('[data-cloudline]').forEach(el => { el.innerHTML = cloudLine(); });
    if (S.status !== lastCloudStatus) {
      if (S.status === 'conflict') UI.toast(TX('Tu partida ha cambiado en otro dispositivo. Elige cuál conservar en 👤 Cuenta.'), 3500);
      else if (S.status === 'expired') UI.toast(TX('Sesión caducada: vuelve a entrar en 👤 Cuenta'), 3000);
    }
    lastCloudStatus = S.status;
  });

  /* ---------- Cuenta: entrar, crear cuenta y estado ---------- */
  function renderAccount(back = renderMenu, mode) {
    if (!Cloud.enabled()) {
      screen(`${top(TX('Cuenta'))}<p class="note">${TX('Las cuentas todavía no están activadas en esta versión del juego. Tu partida se guarda en este móvil.')}</p>
        <button class="ghost" id="aOld">${TX('📦 Traer partida de la versión antigua')}</button>
        <button class="ghost" id="aBackup">${TX('💾 Copias y código de partida')}</button>`, 'bg_green');
      $('aOld').onclick = () => renderTransfer(() => renderAccount(back));
      $('aBackup').onclick = () => renderSaves(() => renderAccount(back));
      $('back').onclick = back; return;
    }
    if (Cloud.state.conflict) return renderConflict(() => renderAccount(back));
    if (!Cloud.loggedIn() || Cloud.expired()) return renderLogin(back, mode || (Cloud.expired() ? 'in' : Profile.data.firstDone ? 'up' : 'in'));
    const S = Cloud.state;
    screen(`${top(TX('Cuenta'))}
      <div data-cloudline>${cloudLine()}</div>
      <p class="note">${TX('Tu partida (plantilla, gacha, Historia, Carrera y la partida en curso) se guarda')} <b>${TX('sola')}</b> ${TX('en la nube cada vez que cambia. En otro móvil u ordenador, entra con tu usuario y contraseña y la tendrás igual.')}</p>
      <div class="grid2"><button class="cta" id="aNow">${TX('☁️ Guardar ahora')}</button><button class="ghost" id="aOut">${TX('Cerrar sesión')}</button></div>
      <p class="note" id="aMsg"></p>
      <details class="adv"><summary>${TX('Opciones avanzadas')}</summary>
        <p class="note">${TX('Copias extra que se quedan solo en este navegador, por si quieres volver a un punto anterior.')}</p>
        <button class="ghost" id="aBackup">${TX('💾 Copias en este móvil')}</button>
      </details>
      <button class="ghost" id="aOld">${TX('📦 Traer partida de la versión antigua')}</button>`, 'bg_green');
    $('aOld').onclick = () => renderTransfer(() => renderAccount(back));
    const msg = t => { $('aMsg').textContent = t; };
    $('aNow').onclick = async () => {
      msg(TX('Guardando…')); if (Career.data) Career.save(); Profile.save(); saveSettings();
      const r = await Cloud.push(true);
      if (r === 'uploaded' || r === 'same') { msg(TX('Guardado en la nube ✓')); Sound.sfx('reveal'); }
      else if (r === 'conflict') renderConflict(() => renderAccount(back));
      else msg(Cloud.state.msg || TX('No se ha podido guardar ahora. Se reintentará solo.'));
    };
    $('aOut').onclick = async () => {
      const b = $('aOut');
      if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = TX('¿Seguro?'); msg(TX('Se guardará tu partida en la nube y este móvil quedará vacío para que pueda entrar otra cuenta. Toca otra vez para confirmar.')); return; }
      msg(TX('Guardando antes de salir…'));
      const r = await Cloud.signOut();
      if (!r.ok) {
        msg(r.msg + TX(' Si sales igualmente, perderás lo que no se haya subido.'));
        b.textContent = TX('Salir igualmente'); b.onclick = async () => { await Cloud.signOut({ force: true }); reloadGame(TX('Sesión cerrada')); };
        return;
      }
      reloadGame(TX('Sesión cerrada'));
    };
    $('aBackup').onclick = () => renderSaves(() => renderAccount(back));
    $('back').onclick = back;
  }
  function renderLogin(back = renderMenu, mode = 'in') {
    const up = mode === 'up', first = !Profile.data.firstDone, expired = Cloud.loggedIn() && Cloud.expired();
    screen(`${top(up ? TX('Crear cuenta') : TX('Iniciar sesión'))}
      <div class="grid2 tabs"><button class="ghost" id="tIn" aria-pressed="${!up}">${TX('Ya tengo cuenta')}</button><button class="ghost" id="tUp" aria-pressed="${up}">${TX('Crear cuenta')}</button></div>
      ${up ? `<p class="note">${TX('Con una cuenta tu partida se guarda en la nube y la recuperas en cualquier móvil u ordenador.')}${Profile.data.firstDone ? ' <b>' + TX('Tu progreso actual se pasará a la cuenta.') + '</b>' : ''}</p>`
        : `<p class="note">${expired ? TX('Tu sesión se ha cerrado. Entra otra vez para seguir guardando en la nube.') : TX('Entra con la misma forma que usaste al crear la cuenta.')}</p>`}
      <button class="gbtn" id="aGoogle" type="button"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.2C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.6 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.9-6.2C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.2 1.5-5 2.3-8.2 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>${TX('Continuar con Google')}</button>
      <p class="gsep"><span>${TX('o con usuario y contraseña')}</span></p>
      <form class="aform" id="aForm" autocomplete="on">
        <label>${TX('Usuario')}<input id="aUser" name="username" type="text" maxlength="16" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="${TX('ej.: fran_10')}" value="${expired ? esc(Cloud.user() || '') : ''}"></label>
        <label>${TX('Contraseña')}<input id="aPass" name="password" type="password" maxlength="72" autocomplete="${up ? 'new-password' : 'current-password'}" placeholder="${TX('mínimo 6 caracteres')}"></label>
        ${up ? '<label>' + TX('Repite la contraseña') + '<input id="aPass2" type="password" maxlength="72" autocomplete="new-password"></label>' : ''}
        <label class="showpw"><input type="checkbox" id="aShow"> ${TX('Mostrar contraseña')}</label>
        <button class="cta" id="aGo" type="submit">${up ? TX('Crear cuenta') : TX('Entrar')}</button>
      </form>
      <p class="giftmsg" id="aMsg"></p>
      ${up ? '<p class="note">' + TX('Con usuario y contraseña, apúntala: como no usamos correo,') + ' <b>' + TX('no se puede recuperar') + '</b> ' + TX('si la olvidas. Con Google no hay contraseña que recordar.') + '</p>' : ''}
      <button class="ghost" id="aOld">${TX('📦 ¿Jugabas en la versión antigua? Trae tu partida')}</button>
      ${first ? '<button class="ghost big" id="aGuest">' + TX('Jugar como invitado') + '<small>' + TX('Tu partida solo se guardará en este móvil') + '</small></button>' : ''}`, 'bg_green');
    const form = $('aForm'), m = $('aMsg'), go = $('aGo');
    form.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') back(); }));
    $('aShow').onchange = e => form.querySelectorAll('input[type=password],input[data-pw]').forEach(i => { i.dataset.pw = 1; i.type = e.target.checked ? 'text' : 'password'; });
    $('tIn').onclick = () => renderLogin(back, 'in'); $('tUp').onclick = () => renderLogin(back, 'up');
    const say = (t, ok) => { m.textContent = t; m.className = 'giftmsg ' + (ok ? 'ok' : 'bad'); };
    $('aUser').addEventListener('input', e => { if (up) { const u = Cloud.cleanUser(e.target.value), bad = u && Cloud.checkUser(u); say(bad && u.length >= 3 ? bad : ''); } });
    form.onsubmit = async e => {
      e.preventDefault(); if (go.disabled) return;
      const u = $('aUser').value, p = $('aPass').value;
      if (up && p !== $('aPass2').value) return say(TX('Las contraseñas no coinciden.'));
      go.disabled = true; say(up ? TX('Creando cuenta…') : TX('Entrando…'), true);
      if (Career.data) Career.save(); Profile.save(); saveSettings();
      const r = up ? await Cloud.signUp(u, p) : await Cloud.signIn(u, p);
      if (!r.ok) { go.disabled = false; Sound.sfx('click'); return say(r.msg); }
      say(TX('Comprobando tu partida…'), true);
      afterSync(await Cloud.sync(), back, up ? TX('¡Cuenta creada! Tu partida ya se guarda en la nube.') : TX('¡Hola, ') + Cloud.user() + '!');
    };
    $('aGoogle').onclick = async () => {
      const g = $('aGoogle'); if (g.disabled) return;
      g.disabled = true; say(TX('Abriendo Google…'), true);
      if (Career.data) Career.save(); Profile.save(); saveSettings();
      const r = await Cloud.signInGoogle();
      if (r.redirect) return;   // la página se va a Google y vuelve sola
      if (!r.ok) { g.disabled = false; return say(r.msg || ''); }
      say(TX('Comprobando tu partida…'), true);
      afterSync(await Cloud.sync(), back, TX('¡Hola, ') + Cloud.user() + '!');
    };
    if ($('aGuest')) $('aGuest').onclick = () => { Cloud.chooseGuest(); renderMenu(); };
    $('aOld').onclick = () => renderTransfer(() => renderLogin(back, mode));
    $('back').onclick = back;
    if (Controls.pc()) $('aUser').focus();
  }
  // Qué hacer tras sincronizar
  function afterSync(r, next, hello) {
    if (r === 'downloaded') return reloadGame(TX('Cargando tu partida de la nube…'));
    if (r === 'conflict') return renderConflict(next);
    if (hello) UI.toast(hello, 2500);
    if (r === 'offline') UI.toast(TX('Sin conexión: tu partida se subirá cuando vuelva internet'), 3000);
    if (r === 'error') UI.toast(Cloud.state.msg || TX('Error con la nube; se reintentará'), 3000);
    Sound.sfx('reveal'); next();
  }
  // Dos versiones distintas: el jugador elige; la otra se guarda como copia en este móvil por si acaso
  function renderConflict(next = renderMenu) {
    const C = Cloud.state.conflict; if (!C) return next();
    const card = (id, title, d, when, cls) => `<button class="cpl conf ${cls}" id="${id}"><span class="cplb"><b>${title}</b>
      <span class="cst">${when}</span>
      <span class="cst">👥 <b>${d.players}</b> ${TX('jugadores · 🎟️')} ${d.tickets} · 🪙 ${d.coins}</span>
      <span class="cst">${TX('Victorias:')} ${d.wins} ${TX('· Etapas completadas:')} ${d.etapas}</span>
      ${d.career ? `<span class="cst">${TX('Carrera:')} ${esc(d.career)}</span>` : ''}</span></button>`;
    screen(`<div class="top"><h2>${TX('¿Qué partida conservas?')}</h2></div>
      <p class="note">${TX('Tu cuenta')} <b>${esc(Cloud.user())}</b> ${TX('tiene una partida en la nube distinta de la de este móvil. Elige con cuál sigues. La otra se guarda como copia en este móvil (Cuenta → Opciones avanzadas), así que no se pierde.')}</p>
      ${card('cCloud', TX('☁️ La de la nube'), C.cloudInfo, C.cloudDate ? TX('Guardada el ') + new Date(C.cloudDate).toLocaleString('es-ES') : '', '')}
      ${card('cLocal', TX('📱 La de este móvil'), C.localInfo, TX('La que tienes ahora aquí'), '')}
      <p class="note" id="cMsg"></p>`, 'bg_green');
    const keepCopy = (data, label) => { try { localStorage.setItem(slotKey(3), JSON.stringify({ date: Date.now(), data, label })); } catch (_) {} };
    $('cCloud').onclick = async () => { keepCopy(C.local, TX('Copia del móvil')); await Cloud.resolve('cloud'); reloadGame(TX('Cargando tu partida de la nube…')); };
    $('cLocal').onclick = async () => {
      keepCopy(C.cloud.data, TX('Copia de la nube')); $('cMsg').textContent = TX('Subiendo la partida de este móvil…');
      const r = await Cloud.resolve('local');
      if (r === 'uploaded' || r === 'same') { UI.toast(TX('Guardada en la nube ✓'), 2000); next(); }
      else if (r === 'conflict') renderConflict(next);
      else { $('cMsg').textContent = (Cloud.state.msg || TX('No se ha podido subir')) + TX(' Se reintentará más tarde.'); setTimeout(next, 1800); }
    };
  }

  function renderSaves(back = renderMenu) {
    const slots = [1, 2, 3].map(i => { try { return JSON.parse(localStorage.getItem(slotKey(i)) || 'null'); } catch (_) { return null; } });
    screen(`${top(TX('Copias en este móvil'))}
      <p class="note">${TX('Copias que se quedan')} <b>${TX('solo en este navegador')}</b>${TX(', para volver a un punto anterior.')} ${Cloud.enabled() ? TX('Para llevar tu partida a otro dispositivo usa tu') + ' <b>' + TX('cuenta') + '</b>.' : ''}</p>
      <div class="csquad">${slots.map((s, i) => `<div class="cpl fac"><div class="cplb"><b>${TX('Ranura')} ${i + 1}${s && s.label ? ' · ' + esc(s.label) : ''}</b><span class="cst">${s ? new Date(s.date).toLocaleString('es-ES') + ' · ' + describe(s.data) : TX('Vacía')}</span></div>
        <span class="row2"><button class="cta mini" data-save="${i + 1}">${TX('Guardar')}</button>${s ? `<button class="ghost mini" data-load="${i + 1}">${TX('Cargar')}</button>` : ''}</span></div>`).join('')}</div>
      <details class="adv"><summary>${TX('Código de partida (sin cuenta)')}</summary>
      <button class="ghost" id="sExport">${TX('📤 Sacar código de mi partida')}</button>
      <textarea id="sCode" rows="4" placeholder="${TX('Pega aquí un código de partida para cargarlo')}" spellcheck="false"></textarea>
      <div class="grid2"><button class="ghost" id="sCopy">${TX('Copiar')}</button><button class="cta" id="sImport">${TX('📥 Cargar este código')}</button></div>
      <button class="ghost" id="sLink">${TX('🔗 Copiar enlace de transferencia')}<small>${TX('Ábrelo en el otro dispositivo y se carga solo')}</small></button></details>
      <p class="note" id="sMsg"></p>`, 'bg_green');
    const msg = t => { $('sMsg').textContent = t; };
    const ta = $('sCode'); ta.addEventListener('keydown', e => e.stopPropagation());
    body.querySelectorAll('[data-save]').forEach(b => b.onclick = () => {
      if (Career.data) Career.save(); Profile.save(); saveSettings();
      try { localStorage.setItem(slotKey(b.dataset.save), JSON.stringify({ date: Date.now(), data: snapshot() })); UI.toast(TX('Partida guardada en la ranura ') + b.dataset.save); Sound.sfx('reveal'); renderSaves(back); }
      catch (_) { msg(TX('No se ha podido guardar (el navegador no deja más espacio).')); }
    });
    // Cargar una copia: se escribe como cambio normal, así con cuenta también se sube a la nube
    const load = o => { SAVE_KEYS.forEach(k => { try { if (o[k] != null) localStorage.setItem(k, o[k]); else localStorage.removeItem(k); } catch (_) {} }); Cloud.push(true).finally(() => reloadGame()); };
    body.querySelectorAll('[data-load]').forEach(b => b.onclick = () => {
      if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = TX('¿Seguro?'); msg(TX('Cargar sustituye tu partida actual. Toca otra vez para confirmar.')); return; }
      msg(TX('Cargando…')); load(slots[+b.dataset.load - 1].data);
    });
    $('sExport').onclick = async () => { ta.value = await packCode(snapshot()); ta.select(); msg(TX('Código creado: cópialo y guárdalo (por ejemplo en tus notas). Para cargarlo, pégalo aquí en el otro dispositivo.')); };
    $('sCopy').onclick = async () => { ta.select(); try { await navigator.clipboard.writeText(ta.value); msg('Copiado.'); } catch (_) { try { document.execCommand('copy'); msg('Copiado.'); } catch (__) { msg(TX('Selecciónalo y cópialo a mano.')); } } };
    $('sLink').onclick = async () => {
      if (Career.data) Career.save(); Profile.save(); saveSettings();
      const link = location.origin + location.pathname + '#partida=' + encodeURIComponent(await packCode(snapshot()));
      ta.value = link;
      try { await navigator.clipboard.writeText(link); msg(TX('Enlace copiado. Mándatelo (WhatsApp, notas…) y ábrelo en el otro dispositivo.')); }
      catch (_) { ta.select(); msg(TX('Copia el enlace del recuadro y ábrelo en el otro dispositivo.')); }
    };
    $('sImport').onclick = async () => {
      if (!ta.value.trim()) return msg(TX('Pega primero un código.'));
      const rr = await readCode(ta.value); if (rr.error) return msg(rr.error.replace(/<[^>]+>/g, ''));
      const o = rr.data;
      msg(TX('¡Partida cargada! Reiniciando…')); load(o);
    };
    $('back').onclick = back;
  }

  /* ---------- Traer la partida de la versión antigua (u otro dispositivo sin cuenta) ---------- */
  const OLD_URL = 'https://claude.ai/artifact/J4Hbvgaj1rHQC3mtFDSL2C';
  // Busca el código dentro de lo que pegue el jugador (vale con texto de más, saltos de línea o un enlace #partida=)
  // Devuelve posibles códigos, del más largo al más corto (por si se pegó texto justo detrás)
  function findCodes(txt) {
    const raw = String(txt || '');
    let m = raw.replace(/\s+/g, '').match(/#partida=([^&]+)/);
    if (m) { try { return [decodeURIComponent(m[1])]; } catch (_) { return [m[1]]; } }
    m = raw.match(/IR[ZJ]1:[A-Za-z0-9+/=\s]+/); if (!m) return [];
    const parts = m[0].trim().split(/\s+/), out = [];
    for (let k = parts.length; k >= 1 && out.length < 6; k--) out.push(parts.slice(0, k).join(''));
    return out;
  }
  const findCode = txt => findCodes(txt)[0] || '';
  async function readCode(txt) {
    const cs = findCodes(txt);
    if (!cs.length) return { error: TX('No encuentro ningún código. Tiene que empezar por') + ' <b>' + 'IRZ1:' + '</b> ' + TX('y es un texto largo.') };
    let o = null;
    for (const c of cs) { try { o = await unpackCode(c); break; } catch (_) {} }
    if (!o) return { error: TX('El código está') + ' <b>' + TX('incompleto o roto') + '</b>' + TX('. Vuelve a la versión antigua, toca «Copiar» y pégalo entero.') };
    if (!o['inazuma-perfil'] && !o['inazuma-carrera']) return { error: TX('Ese código no tiene ninguna partida dentro.') };
    return { data: o };
  }
  function renderTransfer(back = renderMenu, preset = '') {
    const sync = Cloud.enabled();
    screen(`${top(TX('Traer mi partida'))}
      <p class="note">${TX('Si jugabas en la')} <b>${TX('versión antigua')}</b> ${TX('del juego (o en otro móvil sin cuenta), sigue estos pasos para traer tu partida aquí.')}</p>
      <ol class="steps">
        <li><b>${TX('Abre la versión antigua')}</b> ${TX('con este botón.')}<a class="ghost linkbtn" id="tOpen" href="${OLD_URL}" target="_blank" rel="noopener">${TX('🔗 Abrir la versión antigua')}</a></li>
        <li>${TX('Allí toca')} <b>${TX('💾 Guardar / cargar')}</b> → <b>${TX('📤 Sacar código de mi partida')}</b> → <b>${TX('Copiar')}</b>.</li>
        <li>${TX('Vuelve a esta pestaña y toca')} <b>${TX('📋 Pegar')}</b> ${TX('(o mantén el dedo en el recuadro y elige «Pegar»).')}</li>
        <li>${TX('Revisa que es tu partida y toca')} <b>${TX('Cargar')}</b>.${sync ? TX(' Después crea tu cuenta para no tener que hacer esto nunca más.') : ''}</li>
      </ol>
      <textarea id="tCode" rows="4" placeholder="${TX('Pega aquí el código (empieza por IRZ1:)')}" spellcheck="false" autocapitalize="off" autocorrect="off"></textarea>
      <div class="grid2"><button class="ghost" id="tPaste">${TX('📋 Pegar')}</button><button class="cta" id="tCheck">${TX('Comprobar')}</button></div>
      <div id="tOut"></div>
      ${Profile.data.firstDone ? '<p class="note">' + TX('⚠️ Cargar sustituye la partida que tienes ahora en este dispositivo.') + '</p>' : ''}`, 'bg_green');
    const ta = $('tCode'), out = $('tOut');
    ta.addEventListener('keydown', e => e.stopPropagation());
    if (preset) ta.value = preset;
    const check = async () => {
      if (!ta.value.trim()) { out.innerHTML = '<p class="giftmsg bad">' + TX('Primero pega el código.') + '</p>'; return; }
      out.innerHTML = '<p class="giftmsg ok">' + TX('Leyendo el código…') + '</p>';
      const r = await readCode(ta.value);
      if (r.error) { out.innerHTML = `<p class="giftmsg bad">${r.error}</p>`; Sound.sfx('click'); return; }
      const d = Cloud.describe(r.data);
      out.innerHTML = `<div class="cpl conf"><span class="cplb"><b>${TX('✅ Partida encontrada')}</b>
        <span class="cst">👥 <b>${d.players}</b> ${TX('jugadores · 🎟️')} ${d.tickets} · 🪙 ${d.coins}</span>
        <span class="cst">${TX('Victorias:')} ${d.wins} ${TX('· Etapas completadas:')} ${d.etapas}</span>
        ${d.career ? `<span class="cst">${TX('Carrera:')} ${esc(d.career)}</span>` : ''}</span></div>
        <button class="cta" id="tLoad">${TX('📥 Cargar esta partida')}</button>`;
      Sound.sfx('reveal');
      $('tLoad').onclick = async () => {
        $('tLoad').disabled = true;
        // Copia de seguridad de lo que había, por si acaso
        if (Profile.data.firstDone) { try { localStorage.setItem(slotKey(3), JSON.stringify({ date: Date.now(), data: snapshot(), label: TX('Antes de traer la partida') })); } catch (_) {} }
        SAVE_KEYS.forEach(k => { try { if (r.data[k] != null) localStorage.setItem(k, r.data[k]); else if (k !== 'inazuma-ajustes' && k !== 'inazuma-sonido') localStorage.removeItem(k); } catch (_) {} });
        try { localStorage.setItem('inazuma-traida', '1'); } catch (_) {}
        if (Cloud.loggedIn()) { await Cloud.push(true); }
        reloadGame(TX('¡Partida traída! Cargando…'));
      };
    };
    $('tPaste').onclick = async () => {
      try { const t = await navigator.clipboard.readText(); if (t) { ta.value = t; check(); return; } } catch (_) {}
      ta.focus(); out.innerHTML = '<p class="giftmsg bad">' + TX('Tu navegador no deja pegar con el botón: mantén el dedo en el recuadro y elige «Pegar».') + '</p>';
    };
    ta.addEventListener('paste', () => setTimeout(check, 50));
    $('tCheck').onclick = check;
    $('back').onclick = back;
    if (preset) check();
  }
  // Enlace de transferencia: …/juego/#partida=IRZ1:… abre esta pantalla con el código puesto
  function hashCode() {
    const h = location.hash || ''; if (!/^#partida=/.test(h)) return '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
    return findCode(h);
  }

  /* ---------- Códigos de regalo ---------- */
  /* ---------- Teclas «A tu gusto» (Ajustes): cada acción con la tecla que quieras ---------- */
  const KEY_ACTIONS = [['up', TX('Arriba')], ['down', TX('Abajo')], ['left', TX('Izquierda')], ['right', TX('Derecha')], ['sprint', TX('Esprint')],
    ['pass', TX('Pase / entrada')], ['shoot', TX('Tiro / despeje')], ['switch', TX('Cambiar de jugador')], ['through', TX('Saque largo (portero)')],
    ['dribble', TX('Regate')], ['tech', TX('Supertécnica')], ['techNext', TX('Cambiar técnica')], ['pause', TX('Pausa')]];
  // Teclas repetidas (Tiro y Cambiar de jugador sí pueden ir juntas: con balón chuta y sin balón cambia)
  function keyDups(k) {
    const by = {}; KEY_ACTIONS.forEach(([a]) => (by[k[a]] = by[k[a]] || []).push(a));
    const dup = new Set();
    for (const l of Object.values(by)) if (l.length > 1 && !(l.length === 2 && l.includes('shoot') && l.includes('switch'))) l.forEach(a => dup.add(a));
    return dup;
  }
  function keyMapHtml() {
    const k = Input.customKeys(), dup = keyDups(k);
    return `<p class="note">${TX('Toca una acción y pulsa la tecla que quieras (Esc cancela).')}</p>
      <div class="kmap">${KEY_ACTIONS.map(([a, n]) => `<button class="kbtn${dup.has(a) ? ' dup' : ''}" data-kact="${a}"><span>${n}</span><b>${esc(Input.keyName(k[a]))}</b></button>`).join('')}</div>
      ${dup.size ? `<p class="note kdup">${TX('Hay teclas repetidas (en rojo): cámbialas para que cada una haga una sola cosa.')}</p>` : ''}
      <button class="ghost" id="kReset">${TX('Volver a las de serie')}</button>`;
  }
  function bindKeyMap() {
    if (!$('kReset')) return;
    const redo = () => { const y = $('screen').scrollTop; renderSettings(); $('screen').scrollTop = y; };
    body.querySelectorAll('[data-kact]').forEach(b => b.onclick = () => {
      body.querySelectorAll('.kbtn.wait').forEach(x => x.classList.remove('wait'));
      b.classList.add('wait'); b.querySelector('b').textContent = TX('Pulsa una tecla…'); Sound.sfx('click');
      Input.capture(e => {
        if (e.code !== 'Escape' && e.code) {
          settings.keyMap = Object.assign({}, settings.keyMap, { [b.dataset.kact]: e.code });
          if (e.key && e.key.length === 1 && e.key !== ' ') settings.keyLabels = Object.assign({}, settings.keyLabels, { [e.code]: e.key.toUpperCase() });
          saveSettings(); Sound.sfx('click');
        }
        redo();
      });
    });
    $('kReset').onclick = () => { settings.keyMap = null; settings.keyLabels = null; saveSettings(); Sound.sfx('click'); UI.toast(TX('Teclas como de serie')); redo(); };
  }

  /* ---------- Guía de controles (móvil, ordenador y mando) ---------- */
  let guideTab = null;
  function renderControlsGuide(back = renderMenu) {
    const pad = [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(Boolean);
    const tab = guideTab || (pad ? 'mando' : Controls.pc() ? 'pc' : 'movil'), clas = settings.keys === 'clasicas';
    const row = (k, a, b) => `<tr><td><b>${k}</b></td><td>${a}</td><td>${b}</td></tr>`;
    const table = rows => `<table class="gtable"><tr><th></th><th>${TX('Con balón')}</th><th>${TX('Sin balón')}</th></tr>${rows}</table>`;
    const T = {
      movil: `<p class="note">${TX('El joystick aparece donde pongas el dedo en la mitad izquierda de la pantalla. Para esprintar, lleva el dedo más allá del aro (se pone naranja). Los botones de la derecha cambian según tu equipo tenga el balón o no.')}</p>
        ${table(row(TX('Joystick'), TX('mover y apuntar'), TX('mover')) + row(TX('Tiro'), TX('mantén para cargar, suelta para chutar (un toque = tiro rápido)'), '—') +
          row(TX('Pase'), TX('toque = pase · mantén = pase fuerte'), '—') + row(TX('Entrada'), '—', TX('robar el balón')) +
          row(TX('Regate'), TX('recorte rápido sin técnica'), '—') + row(TX('Cambiar'), '—', TX('al compañero que antes llega al balón (pulsa otra vez para el siguiente)')) +
          row(TX('Técnica'), TX('supertécnica de tiro o regate'), TX('supertécnica de bloqueo')) + row('⇄', TX('elegir otra supertécnica'), TX('elegir otra supertécnica')))}
        <p class="note">${TX('Con el portero: Despeje (suelta) manda el balón lejos, Pase y Saque largo.')}</p>`,
      pc: settings.keys === 'custom' ? (() => { const k = Input.customKeys(), n = c => esc(Input.keyName(c));
        return `<p class="note">${TX('Tienes tus teclas «A tu gusto» (puedes cambiarlas en Ajustes → Controles).')}</p>
        ${table(row([k.up, k.left, k.down, k.right].map(n).join(' '), TX('mover y apuntar'), TX('mover')) + row(n(k.sprint), TX('esprint'), TX('esprint')) +
          row(n(k.shoot), TX('tiro (mantén para cargar)'), k.switch === k.shoot ? TX('cambiar de jugador') : '—') + row(n(k.pass), TX('pase (mantén = fuerte)'), TX('entrada')) +
          row(n(k.dribble), TX('regate'), '—') + (k.switch !== k.shoot ? row(n(k.switch), '—', TX('cambiar de jugador')) : '') +
          row(n(k.tech), TX('supertécnica'), TX('supertécnica')) + row(n(k.techNext), TX('elegir otra supertécnica'), TX('elegir otra supertécnica')) + row(n(k.pause) + ' / Esc', TX('pausa'), TX('pausa')))}
        <p class="note">${TX('Portero con balón: {0} pase · {1} saque largo · {2} despeje.', n(k.pass), n(k.through), n(k.shoot))}</p>`; })() : `<p class="note">${clas ? TX('Tienes las teclas clásicas (puedes cambiarlas en Ajustes → Controles).') : TX('Tienes las teclas nuevas (puedes cambiarlas en Ajustes → Controles).')}</p>
        ${table(row('WASD / ' + TX('flechas'), TX('mover y apuntar'), TX('mover')) + row('Shift', TX('esprint'), TX('esprint')) +
          row(clas ? 'L / X' : 'K / X', TX('tiro (mantén para cargar)'), clas ? '—' : TX('cambiar de jugador')) + row('J / Z', TX('pase (mantén = fuerte)'), TX('entrada')) +
          row('I / V', TX('regate'), '—') + (clas ? row('Q', '—', TX('cambiar de jugador')) : '') +
          row(TX('Espacio'), TX('supertécnica'), TX('supertécnica')) + row(clas ? 'U' : 'E', TX('elegir otra supertécnica'), TX('elegir otra supertécnica')) + row('P / Esc', TX('pausa'), TX('pausa')))}
        <p class="note">${clas ? TX('Portero con balón: J pase · K saque largo · L despeje.') : TX('Portero con balón: J pase · L saque largo · K despeje.')}</p>`,
      mando: `<p class="note">${TX('Funciona con mandos de Xbox, PlayStation y la mayoría de genéricos: conéctalo (por cable o Bluetooth) y pulsa un botón.')}</p>
        ${table(row(TX('Stick / cruceta'), TX('mover y apuntar'), TX('mover')) + row('RT / R2', TX('esprint'), TX('esprint')) + row('X / ▢', TX('tiro (mantén para cargar)'), '—') +
          row('A / ✕', TX('pase (mantén = fuerte)'), TX('entrada')) + row('RB / R1', TX('regate'), '—') +
          row('LB / L1', '—', TX('cambiar de jugador')) + row('Y / △', TX('supertécnica'), TX('supertécnica')) + row('LT / L2', TX('elegir otra supertécnica'), TX('elegir otra supertécnica')) +
          row('Start', TX('pausa'), TX('pausa')))}`,
    };
    screen(`${top('🎮 ' + TX('Controles'))}
      <div class="opts" id="gTabs">${[['movil', TX('📱 Móvil')], ['pc', TX('⌨️ Ordenador')], ['mando', TX('🎮 Mando')]].map(([k, n]) => `<button data-gtab="${k}" aria-pressed="${k === tab}">${n}</button>`).join('')}</div>
      ${T[tab]}
      <h3>${TX('Trucos')}</h3>
      <ul class="gtips"><li>${TX('Pulsa Pase o Tiro un poco antes de que te llegue el balón: pasarás o chutarás al primer toque.')}</li>
        <li>${TX('Tiro cargado a tope (barra llena) = tiro mucho más fuerte.')}</li>
        <li>${TX('Las supertécnicas tienen recarga: el botón se va llenando hasta que vuelve a estar lista.')}</li>
        <li>${TX('En Ajustes puedes poner las supertécnicas automáticas y quitar el cambio automático de jugador.')}</li></ul>`, 'bg_green');
    body.querySelectorAll('[data-gtab]').forEach(b => b.onclick = () => { guideTab = b.dataset.gtab; renderControlsGuide(back); });
    $('back').onclick = back;
  }
  /* ---------- Novedades: notas de cada actualización (las más nuevas arriba) ---------- */
  const NEWS = [
    { v: '0.31.13', date: '24/10/2026', items: [
      TX('Pequeños ajustes y mejoras en el gacha y en los avisos al abrir el juego.')] },
    { v: '0.31.12', date: '23/10/2026', items: [
      TX('Partidos más equilibrados: con el balón se esprinta un poco menos y los rivales corren algo más cuando defienden. Ya no te escapas solo corriendo.')] },
    { v: '0.31.11', date: '23/10/2026', items: [
      TX('📱 Ajustes → Controles → «Colocar los botones a tu gusto»: en el móvil puedes mover cada botón a donde quieras y cambiar su tamaño.')] },
    { v: '0.31.10', date: '23/10/2026', items: [
      TX('∞ Infinito: al ganar a cada jefe eliges 1 de 3 versiones especiales de jugadores que no salen en el gacha (del 2, del 3…). Cuanto más lejos llegues, más raras. Llevan su propio marco ∞.'),
      TX('Porteros: salen a por el que entra con el balón en el área, y ya no se puede entrar andando con el balón en la portería. Para marcar, hay que chutar.')] },
    { v: '0.31.9', date: '23/10/2026', items: [
      TX('👕 ¡Crea tu equipación! En Plantilla → Mi equipo eliges los colores y el diseño (rayas, mitades, banda, cuadros…). En la Carrera también hay diseños nuevos.'),
      TX('🎨 Muñecos del Inazuma 3 arreglados: todos llevan su muñeco de verdad, sacado del juego original (peinado, colores y tono de piel), y ahora cambian a los colores de su equipo.'),
      TX('Plantilla: en Jugadores ves la nota y el elemento de cada uno, y en Mi equipo el elemento de cada jugador en el campo.'),
      TX('Equipos especiales: cada equipo da un jugador distinto (ya no se repite el premio).'),
      TX('Arreglado: ya no se puede salir por la línea de fondo con el balón para rodear al portero. Si cruzas una línea con el balón, es fuera.')] },
    { v: '0.31.8', date: '22/10/2026', items: [
      TX('💬 ¡Ya tenemos Discord! Entra desde el botón del menú.'),
      TX('Móvil: joystick más grande y con zona muerta; ya no esprintas sin querer (para esprintar, lleva el dedo más allá del aro).'),
      TX('Móvil: botones más grandes y en arco alrededor de Tiro; nueva opción de tamaño en Ajustes.'),
      TX('Se quita el pase al hueco (móvil, teclado y mando): estorbaba. El portero sigue sacando en largo.'),
      TX('Al perder el balón, un toque en Pase ya no te cambia de jugador sin querer.'),
      TX('Cambiar de jugador te lleva al compañero que antes llega al balón; si vuelves a pulsar, al siguiente.')] },
    { v: '0.31.7', date: '22/10/2026', items: [
      TX('Las supertécnicas del Inazuma 3 ya salen en español (antes estaban en inglés) y se han añadido algunas que faltaban.')] },
    { v: '0.31.6', date: '22/10/2026', items: [
      TX('Ordenador: nuevas teclas «A tu gusto» en Ajustes → Controles. Elige la tecla de cada acción, también para moverte.'),
      TX('Nube: la partida se guarda comprimida (ocupa unas 8 veces menos) y se sube al acabar cada partido, al salir del juego y, mientras juegas, cada 5 minutos. Así el servidor aguanta a muchos más jugadores.')] },
    { v: '0.31.5', date: '22/10/2026', items: [
      TX('Controles: si pulsas Pase o Tiro justo antes de recibir el balón, ahora pasas o chutas al primer toque (antes hacías una entrada sin querer).'),
      TX('Pase ya no hace entradas a tus propios compañeros.'),
      TX('Supertécnicas más espectaculares: unas 70 técnicas tienen ahora su propia animación (tiros, paradas, regates y bloqueos).'),
      TX('Nueva guía de controles (móvil, ordenador y mando) en Pausa y en Ajustes.'),
      TX('Roguelite: el partido se acaba si un equipo gana por 5 goles de diferencia.'),
      TX('Las técnicas que ganas tras cada partido ahora encajan con la posición del jugador (un portero ya no recibe técnicas de tiro).'),
      TX('Muñecos del Inazuma 3 arreglados: muchos tenían el muñeco de otro jugador (p. ej. Partinus salía con el pelo marrón).'),
      TX('Nuevo apartado de Novedades (este).')] },
    { v: '0.31.4', date: '21/10/2026', items: [
      TX('Ordenador: en Ajustes puedes elegir las teclas nuevas (K tiro) o las clásicas (L tiro), como antes.')] },
    { v: '0.31.3', date: '21/10/2026', items: [
      TX('Guardado en la nube arreglado: ¡erais tantos que reventasteis el servidor! Ahora la partida se sube como mucho una vez por minuto y al salir del juego.'),
      TX('Si la nube está saturada, tu partida sigue a salvo en tu dispositivo y se sube más tarde sola.')] },
    { v: '0.31.2', date: '21/10/2026', items: [
      TX('Móvil: los botones ya no se «comen» los toques (antes a veces no chutaba ni pasaba).'),
      TX('Ordenador: teclas más cómodas (J/Z pase, K/X tiro, L/C profundidad, I/V regate, E cambiar técnica) y aviso de que se puede jugar con mando.')] },
    { v: '0.31.0', date: '', items: [TX('El juego, traducido al inglés (cámbialo en Ajustes).')] },
  ];
  function renderNews(back = renderMenu) {
    settings.seenNews = VERSION; settings.aviso = AVISO.key; saveSettings();   // las Novedades ya cuentan lo del aviso
    screen(`${top(TX('📰 Novedades'))}
      ${NEWS.map((n, i) => `<div class="newsv${i === 0 ? ' last' : ''}"><h3>v${n.v}${n.date ? ` <small>${n.date}</small>` : ''}${i === 0 ? ` <span class="newtag">${TX('¡NUEVO!')}</span>` : ''}</h3>
        <ul>${n.items.map(t => `<li>${t}</li>`).join('')}</ul></div>`).join('')}
      ${bottom(`<button class="cta" id="newsOk">${TX('¡A jugar!')}</button>`)}`, 'bg_title');
    $('back').onclick = back; $('newsOk').onclick = back;
  }
  function renderGift() {
    const P = Profile.data, used = Object.entries(P.codes || {}).sort((x, y) => y[1] - x[1]);
    screen(`${top(TX('Código de regalo'))}${wallet()}
      <p class="note">${TX('Escribe un código para recibir su premio. Cada código se puede canjear una vez.')}</p>
      <div class="giftin"><input id="gcode" type="text" maxlength="32" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${TX('CÓDIGO')}"><button class="cta" id="gok">${TX('Canjear')}</button></div>
      <p class="giftmsg" id="gmsg"></p>
      ${(P.giftPicks || []).map((g, i) => `<h3>🎁 ${esc(g.code)} · ${TX('Elige a tu jugador')}</h3><p class="note">${esc(g.desc)}</p><div class="hwpick" data-gp="${i}"></div>`).join('')}
      ${used.length ? `<h3>${TX('Canjeados')}</h3><p class="note">${used.map(([k, t]) => `<b>${esc(k)}</b> · ${new Date(t).toLocaleDateString('es-ES')}`).join('<br>')}</p>` : ''}`, 'bg_green');
    document.querySelectorAll('[data-gp]').forEach(box => {
      const i = +box.dataset.gp;
      P.giftPicks[i].opts.forEach(id => {
        const pd = PLAYER(id); if (!pd) return;
        const b = document.createElement('button'); b.className = 'hwpk';
        b.appendChild(face(Sprites.refOf(pd), 72));
        b.insertAdjacentHTML('beforeend', `<b>${esc(pd.name)}</b><small>${rchip(pd.rarity)} ${RAB(pd.role)} ${chip(pd.elem)}</small>${P.coll[id] ? `<small>${TX('ya lo tienes (+1 ★)')}</small>` : ''}`);
        b.onclick = () => { const r = Profile.takePick(i, id); if (!r) return; Sound.sfx('reveal'); renderReveal([r], renderGift, TX('¡Código canjeado!')); };
        box.appendChild(b);
      });
    });
    const inp = $('gcode');
    const go = () => {
      const r = Profile.redeem(inp.value), m = $('gmsg');
      m.textContent = r.msg; m.className = 'giftmsg ' + (r.ok ? 'ok' : 'bad');
      if (r.ok) { Sound.sfx('reveal'); UI.toast(r.msg, 2200); setTimeout(renderGift, 1400); } else Sound.sfx('click');
    };
    $('gok').onclick = go;
    inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') go(); if (e.key === 'Escape') renderMenu(); });
    $('back').onclick = renderMenu;
    if (Controls.pc()) inp.focus();
  }

  /* ---------- Sonido ---------- */
  // Editor de los botones del móvil: arrastra cada botón y cambia su tamaño (se guarda en settings.padLayout)
  function padEditor(done) {
    const BTN = [['s4', TX('Saque largo')], ['big', TX('Tiro / Entrada')], ['s2', TX('Pase')], ['s3', TX('Técnica')], ['s5', TX('Regate / Cambiar')], ['s6', '⇄']];   // Saque largo (solo portero) va debajo de Regate
    const L = JSON.parse(JSON.stringify(settings.padLayout || {}));
    let sel = 'big';
    const ov = document.createElement('div'); ov.id = 'padEdit';
    ov.innerHTML = `<div class="pehead"><b>${TX('Arrastra cada botón a donde quieras. Toca uno para cambiar su tamaño.')}</b>
      <div class="row"><span id="peName"></span><input type="range" id="peSize" min="70" max="150" step="5"><b id="peVal"></b></div>
      <div class="row"><button class="ghost" id="peReset">${TX('Como venía')}</button><button class="ghost" id="peCancel">${TX('Cancelar')}</button><button class="cta" id="peOk">${TX('Guardar')}</button></div></div>
      <div class="pejoy">${TX('El joystick sale donde pongas el dedo (mitad izquierda)')}</div><div class="padbox" id="peBox"></div>`;
    document.getElementById('shell').appendChild(ov);
    const box = ov.querySelector('#peBox'), k = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--padk')) || 1;
    box.style.right = getComputedStyle($('pad')).right; box.style.bottom = getComputedStyle($('pad')).bottom;
    const els = {};
    const paint = key => { const el = els[key], v = L[key] || {}; el.style.translate = `${v.x || 0}px ${v.y || 0}px`; el.style.scale = String(v.s || 1); };
    const pick = key => { sel = key; Object.entries(els).forEach(([kk, el]) => el.classList.toggle('pesel', kk === key)); const v = L[key] || {};
      ov.querySelector('#peName').textContent = BTN.find(b => b[0] === key)[1] + ':'; ov.querySelector('#peSize').value = Math.round((v.s || 1) * 100); ov.querySelector('#peVal').textContent = Math.round((v.s || 1) * 100) + ' %'; };
    BTN.forEach(([key, name]) => {
      const el = document.createElement('button'); el.className = 'act ' + key + (key === 's3' ? ' fire' : ''); el.innerHTML = name.replace(' / ', '<br>'); box.appendChild(el); els[key] = el; paint(key);
      let drag = null;
      el.addEventListener('pointerdown', e => { e.preventDefault(); pick(key); const v = L[key] || {}; drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: v.x || 0, y: v.y || 0 }; try { el.setPointerCapture(e.pointerId); } catch (_) {} });
      el.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return;
        const v = L[key] = Object.assign({ s: 1 }, L[key]); v.x = Math.round(Math.max(-320, Math.min(60, drag.x + (e.clientX - drag.sx) / k))); v.y = Math.round(Math.max(-560, Math.min(40, drag.y + (e.clientY - drag.sy) / k))); paint(key); });
      const end = () => { drag = null; }; el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    });
    pick('big');
    ov.querySelector('.pehead').insertAdjacentHTML('beforeend', `<small>${TX('«Saque largo» solo sale con el portero: está debajo de «Regate», mueve Regate para verlo.')}</small>`);
    ov.querySelector('#peSize').oninput = e => { const v = L[sel] = Object.assign({ x: 0, y: 0 }, L[sel]); v.s = +e.target.value / 100; ov.querySelector('#peVal').textContent = e.target.value + ' %'; paint(sel); };
    ov.querySelector('#peReset').onclick = () => { for (const kk in L) delete L[kk]; Object.keys(els).forEach(paint); pick(sel); Sound.sfx('click'); };
    const close = save => { if (save) { settings.padLayout = Object.keys(L).length ? L : undefined; saveSettings(); Pad.refresh(); UI.toast(TX('Botones guardados'), 1400); } ov.remove(); done && done(); };
    ov.querySelector('#peCancel').onclick = () => close(false);
    ov.querySelector('#peOk').onclick = () => { Sound.sfx('reveal'); close(true); };
  }
  function renderSettings() {
    const c = Sound.cfg;
    const keys = Object.keys(TRACKS);
    const ROLE_NAMES = { menu: TX('Menús'), intro: TX('Intro'), match: TX('Partido rápido'), match_easy: TX('Etapa 1 · inicio'), match_mid: TX('Etapa 1 · mitad'), match_hard: TX('Etapa 1 · recta final'),
      match_final: TX('Etapa 1 · final y jefes'), s2_easy: TX('Etapa 2 · inicio'), s2_mid: TX('Etapa 2 · mitad'), s2_hard: TX('Etapa 2 · recta final'), s2_final: TX('Etapa 2 · final y jefes'),
      match_special: TX('Equipos especiales'), goal: TX('Gol'), win: TX('Victoria'), lose: TX('Derrota') };
    // Desplegable con las pistas agrupadas como en el juego
    const grouped = jingles => TRACK_GROUPS.filter(g => (g === 'Jingles') === jingles).map(g => `<optgroup label="${g}">${keys.filter(k => TRACKS[k].group === g)
      .map(k => `<option value="${k}">${TRACKS[k].name}</option>`).join('')}</optgroup>`).join('');
    const sel = (role, jingles, extra = []) => `<div class="group"><label>${ROLE_NAMES[role]}</label>
      <select data-role="${role}">${extra.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}${grouped(jingles)}</select></div>`;
    const rnd = [['random', TX('Aleatorio (temas de partido)')]], none = [['', TX('Ninguno')]];
    screen(`${top(TX('Ajustes'))}
      <div class="group"><label>${TX('🌐 Idioma · Language')}</label><div class="opts">${Object.entries(I18N.LANGS).map(([k, n]) => `<button data-lang="${k}" aria-pressed="${I18N.lang === k}">${n}</button>`).join('')}</div></div>
      <h3>${TX('Partido')}</h3>
      ${opts(TX('Duración del partido'), 'minutes', [[2, TX('2 min')], [3, TX('3 min')], [5, TX('5 min')]])}
      ${opts(TX('Supertécnicas'), 'techMode', [['boton', TX('Con botón')], ['auto', TX('Automáticas')]])}
      ${opts(TX('Cámara lenta en supertécnicas'), 'slowmo', [[1, TX('Sí')], [0, TX('No')]])}
      ${opts(TX('Cambio automático de jugador'), 'autoSwitch', [[1, TX('Sí')], [0, TX('No')]])}
      <h3>${TX('Controles')}</h3>
      ${opts(TX('Botones en pantalla'), 'controls', [['auto', TX('Auto')], ['tactil', TX('Siempre')], ['teclado', TX('Nunca (PC)')]])}
      ${opts(TX('Tamaño de los botones (móvil)'), 'padSize', [['pequeno', TX('Pequeños')], ['normal', TX('Normales')], ['grande', TX('Grandes')]], Object.assign({ padSize: 'normal' }, settings))}
      <button class="ghost" id="sPadEd">${TX('📱 Colocar los botones a tu gusto')}</button>
      ${opts(TX('Teclas del ordenador'), 'keys', [['nuevas', TX('Nuevas (K tiro)')], ['clasicas', TX('Clásicas (L tiro)')], ['custom', TX('A tu gusto')]], Object.assign({ keys: 'nuevas' }, settings))}
      ${settings.keys === 'custom' ? keyMapHtml() : ''}
      <button class="ghost" id="sGuide">${TX('🎮 Guía de controles')}</button>
      <p class="keys"><b>${TX('Mando:')}</b> ${TX('stick o cruceta para moverte · RT esprint · A pase (mantén = fuerte) / entrada · X tiro (mantén) · B saque largo (portero) · Y supertécnica · LT cambiar técnica · RB regate · LB cambiar jugador · Start pausa.')}<br>
      <b>${TX('Móvil:')}</b> ${TX('joystick a la izquierda (más allá del aro = esprint). Mantén Pase para un pase fuerte y usa Regate para un recorte rápido sin técnica. Cambiar te pasa al compañero que antes llega al balón (también cambia solo al ir a por el balón).')}<br>
      <b>${TX('PC:')}</b> ${settings.keys === 'custom' ? TX('tus teclas están justo encima (Esc también pausa).') : settings.keys === 'clasicas' ? TX('WASD o flechas para moverte · Shift esprint · J o Z: pase (mantén = fuerte) / entrada · K o C: saque largo (portero) · L o X: tiro (mantén) / despeje · I o V: regate · Q: cambiar jugador · Espacio: supertécnica · U: cambiar técnica · P o Esc: pausa') : TX('WASD o flechas para moverte · Shift esprint · J o Z: pase (mantén = fuerte) / entrada · K o X: tiro (mantén) / cambiar jugador · L o C: saque largo (portero) · I o V: regate · Espacio: supertécnica · E: cambiar técnica · P o Esc: pausa')}</p>
      <h3>${TX('Sonido')}</h3>
      <div class="mixer"><label>${TX('🎵 Música')} <b id="mvT">${Math.round((c.music ? c.mv ?? 1 : 0) * 100)} %</b><input type="range" id="mvR" min="0" max="100" step="5" value="${Math.round((c.music ? c.mv ?? 1 : 0) * 100)}"></label>
        <label>${TX('🔊 Efectos')} <b id="svT">${Math.round((c.sfx ? c.sv ?? 1 : 0) * 100)} %</b><input type="range" id="svR" min="0" max="100" step="5" value="${Math.round((c.sfx ? c.sv ?? 1 : 0) * 100)}"></label></div>
      <p class="note">${TX('La música sale de tus archivos del Inazuma 1 y 2, reconstruida desde las partituras del juego. Los nombres son los de la colección de música del Inazuma 2.')}</p>
      ${opts(TX('Intro al abrir el juego'), 'intro', [[1, TX('Sí')], [0, TX('No')]])}
      <button class="ghost" id="seeIntro">${TX('▶ Ver la intro')}</button>
      <div class="group"><label>${TX('Rivales con tema propio')}</label><div class="opts"><button id="tt1" aria-pressed="${c.teamThemes !== false}">${TX('Su música')}</button><button id="tt0" aria-pressed="${c.teamThemes === false}">${TX('La de la etapa')}</button></div></div>
      <details class="roles"><summary>${TX('Elegir música de cada momento')}</summary>
      ${sel('menu', false)}${sel('intro', false)}${sel('match', false, rnd)}${['match_easy', 'match_mid', 'match_hard', 'match_final', 's2_easy', 's2_mid', 's2_hard', 's2_final', 'match_special'].map(r => sel(r, false, rnd)).join('')}
      ${sel('goal', true, none)}${sel('win', true, none)}${sel('lose', true, none)}
      <button class="ghost" id="resetRoles">${TX('Volver a la música de serie')}</button></details>
      <h3>${TX('Escuchar')} <small>${TX('toca para oír cada pista')}</small></h3>
      ${TRACK_GROUPS.map(g => `<details class="tgroup"><summary>${g} <small>${keys.filter(k => TRACKS[k].group === g).length}</small></summary><div class="tracks">${keys.filter(k => TRACKS[k].group === g).map(k => `<button class="ghost" data-play="${k}">▶ ${TRACKS[k].name}</button>`).join('')}</div></details>`).join('')}
      <button class="ghost" id="stopAll">${TX('Parar')}</button>
      ${settings.dev ? '<button class="ghost" id="toDev">' + TX('🛠 Modo desarrollador') + '</button>' : ''}
      <p class="note">${TX('Inazuma Gold v')}${VERSION} ${TX('· fan game gratuito y no oficial. Inazuma Eleven es de Level-5.')}</p>`);
    $('sPadEd').onclick = () => padEditor(() => { const yy = $('screen').scrollTop; renderSettings(); $('screen').scrollTop = yy; });
    bindOpts(settings, k => { saveSettings(); if (k === 'controls' || k === 'padSize') Controls.apply(); if (k === 'keys') { const y = $('screen').scrollTop; renderSettings(); $('screen').scrollTop = y; } });
    body.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => {
      if (b.dataset.lang === I18N.lang) return;
      I18N.set(b.dataset.lang); Sound.sfx('click');
      screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${b.dataset.lang === 'en' ? 'Changing language…' : 'Cambiando el idioma…'}</span></div>`, 'bg_title');
      setTimeout(() => location.reload(), 250);
    });
    if ($('toDev')) $('toDev').onclick = () => { Sound.stop(0.2); renderDev(); };
    $('mvR').oninput = e => { const v = +e.target.value / 100; Sound.setVol('music', v); $('mvT').textContent = e.target.value + ' %'; };
    $('svR').oninput = e => { const v = +e.target.value / 100; Sound.setVol('sfx', v); $('svT').textContent = e.target.value + ' %'; };
    $('svR').onchange = () => Sound.sfx('click');
    body.querySelectorAll('select[data-role]').forEach(s => { s.value = c.roles[s.dataset.role] ?? ''; s.onchange = () => Sound.setRole(s.dataset.role, s.value); });
    $('seeIntro').onclick = () => { Sound.stop(0.2); playIntro(renderSettings); };
    $('sGuide').onclick = () => renderControlsGuide(renderSettings);
    bindKeyMap();
    $('tt1').onclick = () => { Sound.setTeamThemes(true); renderSettings(); };
    $('tt0').onclick = () => { Sound.setTeamThemes(false); renderSettings(); };
    $('resetRoles').onclick = () => { Object.entries(Sound.DEF_ROLES).forEach(([r, k]) => Sound.setRole(r, k)); renderSettings(); UI.toast(TX('Música de serie')); };
    body.querySelectorAll('[data-play]').forEach(b => b.onclick = () => Sound.preview(b.dataset.play));
    $('stopAll').onclick = () => Sound.stop(0.2);
    $('back').onclick = () => { Sound.stop(0.2); renderMenu(); };
  }

  /* ---------- Modo desarrollador (20 toques en la versión) ---------- */
  function renderDevClub() {
    const c = Career.data;
    screen(`${top(TX('Elegir club'))}<p class="note">${TX('Ocupas el sitio del club que elijas: su división, su nombre y sus jugadores. Ellos se quedan con tu plantilla. La temporada empieza de nuevo.')}</p>
      ${[1, 2, 3].map(d => `<h3>${DIV_NAME[d]}</h3><div class="modes">${c.divs[d].filter(k => k !== YOU).map(k => `<button class="mode" data-club="${esc(k)}">${Sprites.crest(crestOf(k))}<span class="mt"><b>${esc(Career.teamName(k))}</b><small>${TX('media')} ${Career.rating(k)}</small></span></button>`).join('')}</div>`).join('')}`);
    body.querySelectorAll('[data-club]').forEach(b => b.onclick = () => { Career.devTakeClub(b.dataset.club); Sound.sfx('reveal'); UI.toast(TX('Ahora eres ') + Career.data.school, 1800); renderCareer(); });
    $('back').onclick = renderDev;
  }
  function renderDevSign() {
    screen(`${top(TX('Fichar gratis'))}<p class="note">${TX('Busca cualquier jugador del gacha y tócalo para meterlo en tu plantilla de Carrera (sin límite).')}</p>
      <div class="pfbar"><div class="pfq"><input id="dsQ" type="search" placeholder="${TX('Buscar por nombre o mote…')}" autocomplete="off"></div></div><div class="pgrid" id="dsL"></div>`);
    const draw = () => {
      const q = norm($('dsQ').value.trim()), L = $('dsL'); L.innerHTML = '';
      if (q.length < 2) { L.innerHTML = '<p class="note">' + TX('Escribe al menos 2 letras.') + '</p>'; return; }
      GAME.players.filter(p => p.cs && p.gacha !== false && (norm(p.name).includes(q) || norm(p.full).includes(q))).slice(0, 40).forEach(p => {
        const inSq = !!Career.m(p.id), el = tile(p.id, `<span class="slot">${inSq ? TX('Ya está en tu club') : TX('Fichar gratis')}</span>`);
        if (inSq) el.classList.add('sel');
        el.onclick = () => { if (Career.devSign(p.id)) { Sound.sfx('reveal'); UI.toast(p.name + TX(' se une a ') + Career.data.school, 1400); draw(); } };
        L.appendChild(el);
      });
    };
    $('dsQ').oninput = draw; draw();
    $('back').onclick = renderDev;
  }
  function renderDev() {
    if (!BETA) return renderMenu();
    const P = Profile.data;
    const b = (id, t, sub = '') => `<button class="ghost big" id="${id}">${t}<small>${sub}</small></button>`;
    screen(`${top(TX('Desarrollador'))}
      <p class="note">v${VERSION} · ${GAME.players.filter(p => p.gacha !== false).length} ${TX('jugadores en el gacha ·')} ${Object.keys(GAME.techniques).length} ${TX('técnicas (')}${LEG_TECHS.length} ${TX('legendarias) ·')} ${GAME.teams.length} ${TX('equipos rivales')}</p>
      ${wallet()}
      <h3>${TX('Recursos')}</h3>
      <div class="grid2">${b('dTick', TX('+1000 tickets'))}${b('dCoin', TX('+100.000 monedas'))}${b('dRayo', TX('+10 Rayos'))}${b('dPity', TX('Épica asegurada'), TX('la próxima tirada'))}</div>
      <h3>${TX('Colección')}</h3>
      <div class="grid2">${b('dAll', TX('Todos los jugadores'))}${b('dStars', TX('Todos a 5 ★'))}${b('dTechs', TX('Todas las técnicas'), 'legendarias')}${b('dTrain', TX('Entrenar al máximo'))}</div>
      <h3>${TX('Progreso')}</h3>
      <div class="grid2">${b('dStory', TX('Completar todas las etapas'), TX('1, 2 y 3 · abre todo'))}${b('dChains', TX('Completar las cadenas'), TX('×5 con medalla de oro'))}${b('dRun', TX('Borrar partida'), TX('en curso'))}${b('dReset', TX('Borrar perfil'), TX('empezar de cero'))}</div>
      <h3>${TX('Carrera')}</h3>
      ${Career.data ? `<p class="note">${esc(Career.data.school)} ${TX('· temporada')} ${Career.data.season} · ${DIV_NAME[Career.myDiv()]} · ${money(Career.data.money)}</p>
      <div class="grid2">${b('dMoney', Career.data.devMoney ? TX('💰 Dinero infinito: SÍ') : TX('💰 Dinero infinito: NO'), TX('toca para cambiar'))}${b('dClub', TX('Elegir club'), TX('ocupas su sitio y sus jugadores'))}
        ${b('dSign', TX('Fichar gratis'), TX('cualquier jugador'))}${b('dFame', TX('Fama y forma al 100'))}
        ${b('dWC', TX('🌍 Empezar el Mundial'), 'ahora mismo')}${b('dSeason', TX('Terminar temporada'), TX('simula lo que queda'))}
        ${b('dDiv1', TX('Subir a Primera'), TX('la temporada empieza de nuevo'))}${b('dDiv3', TX('Bajar a Tercera'), TX('la temporada empieza de nuevo'))}</div>`
        : `<p class="note">${TX('No hay ninguna carrera empezada.')}</p><div class="grid2">${b('dNewCar', TX('Crear carrera rápida'), TX('normal, con Nelly'))}</div>`}
      <h3>${TX('Halloween')}</h3>
      <div class="grid2">${b('dHwOn', settings.hwForce ? TX('🎃 Evento forzado: SÍ') : TX('🎃 Evento forzado: NO'), TX('verlo fuera de fechas'))}${b('dHwCandy', TX('+300 caramelos'))}
        ${b('dHwRetos', TX('Completar los retos'), TX('desbloquea a Ray Dark'))}${b('dHwReset', TX('Reiniciar el evento'), TX('caramelos, retos y regalo'))}</div>
      <h3>${TX('Navidad')}</h3>
      <div class="grid2">${b('dXmOn', settings.xmForce ? TX('🎄 Evento forzado: SÍ') : TX('🎄 Evento forzado: NO'), TX('verlo fuera de fechas'))}${b('dXmSnow', TX('+300 copos'))}
        ${b('dXmRetos', TX('Completar los retos'), TX('y recibir el regalo especial'))}${b('dXmReset', TX('Reiniciar el evento'), TX('copos, retos y regalo'))}</div>
      <h3>${TX('Modo')}</h3>
      <div class="grid2">${b('dOff', TX('Salir del modo'), 'desarrollador')}</div>
      <h3>${TX('Partido')}</h3>
      ${opts(TX('Velocidad del juego'), 'speed', [[0.5, '50 %'], [0.75, TX('75 % (normal)')], [1, '100 %']])}
      ${opts(TX('Datos en pantalla (FPS, recargas…)'), 'debug', [[1, TX('Sí')], [0, TX('No')]])}
      ${opts(TX('Botón «Ganar ahora» en la pausa'), 'devWin', [[1, TX('Sí')], [0, TX('No')]])}
      <h3>${TX('Gacha')}</h3>
      <div class="grid2">${b('dLeg', TX('Legendario asegurado'), (P.devLeg ? P.devLeg + TX(' pendientes · ') : '') + TX('las próximas 10 tiradas'))}</div>
      <button class="ghost" id="dSim">${TX('Simular 1000 tiradas en cada gacha')} <small>${TX('(no gasta nada)')}</small></button>
      <div id="simOut" class="note"></div>`);
    if (settings.speed == null) settings.speed = 0.75;
    bindOpts(settings, saveSettings);
    const done = msg => { Profile.save(); Sound.sfx('reveal'); UI.toast(msg, 1400); renderDev(); };
    $('dTick').onclick = () => { P.tickets += 1000; done(TX('+1000 tickets')); };
    $('dCoin').onclick = () => { P.coins += 100000; done(TX('+100.000 monedas')); };
    $('dRayo').onclick = () => { P.rayos += 10; done(TX('+10 Rayos Raimon')); };
    $('dPity').onclick = () => { P.pity = 9; done(TX('La próxima tirada será épica o mejor')); };
    $('dAll').onclick = () => { GAME.players.forEach(p => { if (p.gacha !== false && !P.coll[p.id]) P.coll[p.id] = { stars: 1, up: {} }; }); done(TX('Colección completa')); };
    $('dStars').onclick = () => { Object.values(P.coll).forEach(o => { o.stars = MAX_STARS; }); done(TX('Todos con 5 estrellas')); };
    $('dTechs').onclick = () => { LEG_TECHS.forEach(t => { P.techs[t] = 1; }); done(TX('Todas las técnicas legendarias')); };
    $('dTrain').onclick = () => { Object.values(P.coll).forEach(o => STAT_KEYS.forEach(k => { o.up[k] = 40; })); done(TX('Entrenamiento al máximo')); };
    $('dStory').onclick = () => { ['s1', 's2', 's3', 's4'].forEach(k => { P.story[k] = P.story[k] || {}; P.story[k].done = true; P.story[k].best = Math.max(P.story[k].best || 0, 9); }); done(TX('Etapas 1, 2 y 3 completadas')); };
    $('dChains').onclick = () => { CHAINS.forEach(ch => { P.chains[ch.key] = Math.max(P.chains[ch.key] || 0, 5); }); done(TX('Cadenas completadas con oro')); };
    $('dLeg').onclick = () => { P.devLeg = (P.devLeg || 0) + 10; done(TX('Las próximas 10 tiradas serán legendarias')); };
    const cdone = msg => { Career.save(); done(msg); };
    if (Career.data) {
      const C = Career.data;
      $('dMoney').onclick = () => { C.devMoney = !C.devMoney; if (!C.devMoney) C.money = Math.min(C.money, 5000); cdone(C.devMoney ? TX('Dinero infinito activado') : TX('Dinero infinito desactivado')); };
      $('dFame').onclick = () => { C.fame = 100; C.forma = 100; cdone(TX('Fama y forma al 100')); };
      $('dWC').onclick = () => { C.wc = Career.wcCreate(C.season); Career.save(); Sound.sfx('reveal'); renderCareer(); };
      $('dSeason').onclick = () => { const sum = Career.devEndSeason(); Sound.music('menu'); if (sum) renderCareerSeason(sum); else renderCareer(); };
      $('dDiv1').onclick = () => { Career.devToDiv(1); cdone(TX('Ahora estás en Primera')); };
      $('dDiv3').onclick = () => { Career.devToDiv(3); cdone(TX('Ahora estás en Tercera')); };
      $('dClub').onclick = () => renderDevClub();
      $('dSign').onclick = () => renderDevSign();
    } else $('dNewCar').onclick = () => { Career.create(13, TX('Instituto Inazuma')); done(TX('Carrera creada')); };
    $('dRun').onclick = () => { Run.clear(); api.run = null; done(TX('Partida en curso borrada')); };
    $('dHwOn').onclick = () => { settings.hwForce = !settings.hwForce; Halloween.forced = settings.hwForce; saveSettings(); done(settings.hwForce ? TX('Evento de Halloween forzado') : TX('Evento de Halloween según la fecha')); };
    $('dHwCandy').onclick = () => { Halloween.data().candy += 300; done(TX('+300 caramelos')); };
    $('dHwRetos').onclick = () => { const H = Halloween.data(); Halloween.RETOS.forEach(R => { H.retos[R.id] = Date.now(); }); H.ray = true; done(TX('Retos completados: Ray Dark desbloqueado')); };
    $('dHwReset').onclick = () => { delete P.hw; Halloween.data(); done(TX('Evento reiniciado')); };
    $('dXmOn').onclick = () => { settings.xmForce = !settings.xmForce; Navidad.forced = settings.xmForce; saveSettings(); done(settings.xmForce ? TX('Evento de Navidad forzado') : TX('Evento de Navidad según la fecha')); };
    $('dXmSnow').onclick = () => { Navidad.data().snow += 300; done(TX('+300 copos')); };
    $('dXmRetos').onclick = () => { const H = Navidad.data(); Navidad.RETOS.forEach(R => { H.retos[R.id] = Date.now(); }); if (!H.gift) { H.gift = true; Navidad.give(XM_EPIC.id); } Profile.save(); done(TX('Retos completados: regalo especial recibido')); };
    $('dXmReset').onclick = () => { delete P.xm; Navidad.data(); done(TX('Evento reiniciado')); };
    let resetArm = false;
    $('dReset').onclick = () => {
      if (!resetArm) { resetArm = true; $('dReset').firstChild.textContent = TX('¿Seguro? Toca otra vez'); return; }
      try { localStorage.removeItem('inazuma-perfil'); } catch (_) {}
      Run.clear(); api.run = null; api.myTeam = null; Profile.load(); UI.toast(TX('Perfil borrado'), 1400); renderMenu();
    };
    $('dOff').onclick = () => { settings.dev = false; settings.debug = 0; saveSettings(); renderMenu(); };
    $('dSim').onclick = () => {
      const rows = BANNERS.map(B => {
        const c = { comun: 0, rara: 0, epica: 0, legendaria: 0, tec: 0 }; let pity = 0;
        for (let i = 0; i < 1000; i++) {
          const t = Gacha.rollTier(pity >= 9); if (t === 'epica' || t === 'legendaria') pity = 0; else pity++;
          if (t === 'legendaria' && Math.random() < 0.5) c.tec++; else c[t]++;
        }
        return `<b>${esc(B.name)}</b>: ${c.comun} ${TX('comunes ·')} ${c.rara} ${TX('raras ·')} ${c.epica} ${TX('épicas ·')} ${c.legendaria} ${TX('legendarios ·')} ${c.tec} ${TX('técnicas')}`;
      });
      $('simOut').innerHTML = rows.join('<br>');
    };
    $('back').onclick = renderMenu;
  }

  $('pauseBtn').addEventListener('click', () => api.togglePause());
  /* ---------- Intro: imágenes del juego con la música del opening; se puede saltar ---------- */
  function playIntro(done) {
    const el = $('intro'), stage = el.querySelector('.in-stage'), cap = el.querySelector('.in-cap'), flash = el.querySelector('.in-flash');
    const timers = []; let finished = false, z = 1;
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    // Rótulos de tráiler: titular grande + línea pequeña debajo
    const say = (t, sub = '') => {
      cap.classList.remove('on'); void cap.offsetWidth;
      cap.innerHTML = t ? `<b>${t}</b>${sub ? `<small>${sub}</small>` : ''}` : '';
      if (t) cap.classList.add('on');
    };
    const boom = () => { flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); };
    const finish = () => {
      if (finished) return; finished = true; timers.forEach(clearTimeout);
      el.hidden = true; el.onclick = null; stage.innerHTML = ''; say('');
      Sound.stop(0.6); done();
    };
    const layer = (html, cls) => {
      const d = document.createElement('div'); d.className = cls; d.style.zIndex = ++z; d.innerHTML = html; stage.appendChild(d);
      const old = [...stage.children].slice(0, -2); old.forEach(o => o.remove());   // deja solo la anterior para el fundido
      return d;
    };
    // Imagen entera (ajustada al ancho) con un fondo difuminado de la misma imagen detrás
    const slide = (img, text, kb, sub) => {
      const d = layer('<div class="in-bg"></div><div class="in-fg ' + kb + '"></div>', 'in-slide');
      d.firstChild.style.backgroundImage = d.lastChild.style.backgroundImage = `url("ui/${img}.png")`; say(text, sub);
      return d;
    };
    el.hidden = false; stage.innerHTML = ''; say('');
    el.querySelector('.in-skip').onclick = e => { e.stopPropagation(); finish(); };
    layer(`<img class="in-logo" src="ui/logo_gold.png" alt="Inazuma Gold"><p class="in-tap">${Controls.pc() ? TX('Haz clic o pulsa una tecla') : TX('Toca para empezar')}</p>`, 'in-center');
    el.onclick = () => {
      el.onclick = null; Sound.unlock(); Sound.music('intro');
      const n = GAME.players.filter(p => p.gacha !== false).length;
      const stars = GAME.players.filter(p => p.gacha !== false && p.rarity === 'legendaria').sort(() => Math.random() - 0.5).slice(0, 12);
      // Final: logo; tocar durante las imágenes salta directamente aquí
      const end = () => {
        timers.forEach(clearTimeout); boom(); say('');
        layer(`<img class="in-logo slam" src="ui/logo_gold.png" alt="Inazuma Gold"><p class="in-sub">${TX('5 contra 5 · roguelite')}</p><p class="in-tap">${Controls.pc() ? TX('Haz clic o pulsa una tecla') : TX('Toca para continuar')}</p>`, 'in-center in-final');
        el.onclick = finish;
      };
      el.onclick = end;
      const miles = String(Math.floor(n / 100) * 100).replace(/\B(?=(\d{3})+$)/g, '.');
      const nTracks = Object.values(TRACKS).filter(t => !t.jingle).length;
      const crests = [1, 2, 10, 15, 33, 41, 48, 49, 31, 38, 599, 588];
      const T = 3000;   // cada plano del tráiler
      const ie3 = GAME.players.filter(p => p.id >= 30000 && p.cs && (p.rarity === 'legendaria' || p.rarity === 'epica')).sort(() => Math.random() - 0.5).slice(0, 12);
      const faces = (list, t, sub) => {
        const d = layer('<div class="in-faces"></div>', 'in-slide');
        list.forEach((p, i) => { const c = face(Sprites.refOf(p), 64); c.style.animationDelay = (i * 0.1) + 's'; d.firstChild.appendChild(c); });
        say(t, sub); return d;
      };
      const S = [
        [0, () => { layer('', 'in-slide'); boom(); slide('bg_title', TX('Un fan game de Inazuma Eleven'), 'kbZoom'); }],
        [T * 0.8, () => slide('ill05', TX('Fútbol 5 contra 5'), 'kbA', TX('En tiempo real · en el móvil y en el PC'))],
        [T * 1.8, () => slide('ill22', TX('Modo roguelite'), 'kbB', TX('Cada partida es distinta: vidas, mejoras y jefes'))],
        [T * 2.8, () => { boom(); slide('ill31', `${TX('Más de')} ${miles} ${TX('jugadores')}`, 'kbA', TX('Del Inazuma 1, 2 y 3, cada uno con su cara y sus técnicas')); }],
        [T * 3.8, () => { boom(); faces(ie3, TX('¡Llega el Inazuma 3!'), TX('Inazuma Japón y las selecciones del mundo: Unicorn, Orpheus, Little Gigant…')); }],
        [T * 4.8, () => {
          const d = layer('<div class="in-mach"></div>', 'in-slide');
          [1, 2, 3].forEach((id, i) => {
            const cv = document.createElement('canvas'); cv.width = 96; cv.height = 128; cv.style.animationDelay = (i * 0.15) + 's';
            const crest = new Image(); crest.src = `ui/crest${BANNERS[i].crest}.png`;
            const balls = Array.from({ length: 18 }, (_, k) => ({ x: 26 + (k * 37) % 44, y: 30 + (k * 23) % 30, c: Object.values(CAP_COLORS)[k % 4] }));
            const st = { colors: MACHINE_COLORS[id], crest, balls, crank: -Math.PI / 2 + i, shake: false, t: 0 };
            drawMachine(cv, st); crest.onload = () => drawMachine(cv, st);
            d.firstChild.appendChild(cv);
          });
          say(TX('Máquina de gachapón'), TX('Gira la manivela: Héroes, Rivales y Villanos'));
        }],
        [T * 5.8, () => { boom(); faces(stars, TX('Legendarios de verdad'), TX('Media de 90 o más desde el primer día')); }],
        [T * 6.8, () => slide('bg_team', TX('Supertécnicas legendarias'), 'kbA', TX('Elige cuál usar en cada momento: animación propia y cámara lenta'))],
        [T * 7.8, () => slide('ill23', TX('Modo Carrera'), 'kbB', TX('Eres el mánager: tus jugadores mejoran (o bajan) según cómo jueguen'))],
        [T * 8.8, () => {
          const d = slide('bg_vs', TX('🌍 El Mundial'), 'kbA', TX('Cada 3 temporadas: convoca a 10 y lleva a Inazuma Japón a lo más alto'));
          d.insertAdjacentHTML('beforeend', `<div class="in-faces in-crests">${[3016, 3053, 3054, 3055, 3057, 3050, 3021, 3058, 3059, 3060, 3061, 3052].map((c, i) => `<img src="ui/crest${c}.png" alt="" style="animation-delay:${i * 0.08}s">`).join('')}</div>`);
        }],
        [T * 9.8, () => slide('ill25', TX('La historia, en 3 etapas'), 'kbB', TX('Del Fútbol Frontier a la Academia Alius… y al Mundial'))],
        [T * 10.8, () => {
          const d = slide('bg_vs', TX('Cadenas, especiales e Infinito'), 'kbB', TX('Rivales cada vez más duros'));
          d.insertAdjacentHTML('beforeend', `<div class="in-faces in-crests">${crests.map((c, i) => `<img src="ui/crest${c}.png" alt="" style="animation-delay:${i * 0.08}s">`).join('')}</div>`);
        }],
        [T * 11.8, () => slide('ill15', TX('Banda sonora original'), 'kbA', `${nTracks} ${TX('temas del Inazuma 1 y 2')}`)],
        [T * 12.8, () => { boom(); slide('ill03', TX('¿Preparado?'), 'kbB', TX('Forma tu equipo y llega a la cima')); }],
        [T * 13.8, end],
      ];
      S.forEach(([ms, fn]) => at(ms, fn));
    };
  }

  // Teclado fuera del partido: en la intro cualquier tecla avanza (Esc la salta); en menús Esc = Volver
  api.menuKey = e => {
    const intro = $('intro');
    if (!intro.hidden) {
      if (e.code === 'Escape') intro.querySelector('.in-skip').click(); else intro.click();
      e.preventDefault(); return true;
    }
    if (api.running || $('screen').hidden) return false;
    if (e.code === 'Escape') { const b = $('back'); if (b) { b.click(); e.preventDefault(); return true; } }
    return false;
  };

  api.renderMenu = () => renderMenu();
  // Solo arranca en la web oficial (o en la beta y en las pruebas). Las direcciones van como números para que no se cambien con un simple «buscar y reemplazar».
  const OFFICIAL = String.fromCharCode(104,116,116,112,115,58,47,47,102,114,97,110,109,110,100,101,122,122,122,122,46,103,105,116,104,117,98,46,105,111,47,73,110,97,122,117,109,97,45,82,111,103,117,101,47,106,117,101,103,111) + '/';
  function hostOk() {
    const h = (location.hostname || '').toLowerCase();
    if (BETA) return true;
    const ok = [[102,114,97,110,109,110,100,101,122,122,122,122,46,103,105,116,104,117,98,46,105,111], [103,104,111,115,116,112,114,111,108,111,99,111,46,103,105,116,104,117,98,46,105,111], [108,111,99,97,108,104,111,115,116], [49,50,55,46,48,46,48,46,49]].map(a => String.fromCharCode(...a));
    return ok.includes(h) || h.endsWith('.test');
  }
  function renderCopy() {
    screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold" onerror="this.remove()">
      <h2>${TX('Esta copia del juego no es oficial')}</h2>
      <p class="note">${TX('Inazuma Gold es gratis y solo se juega en su web oficial, donde tienes tu partida guardada, las novedades y los eventos.')}</p>
      <a class="cta linkbtn" href="${OFFICIAL}">${TX('▶ Ir a la web oficial')}</a></div>`, 'bg_title');
  }
  api.boot = () => {
    if (!hostOk()) return renderCopy();
    Controls.apply();
    Career.load();
    const pend = hashCode();
    const first = pend ? () => renderTransfer(renderMenu, pend) : renderMenu;
    const start = () => { if (settings.intro !== 0 && !pend) playIntro(first); else first(); };
    if (!Cloud.enabled() || (!(Cloud.loggedIn() && !Cloud.expired()) && !Cloud.pendingRedirect())) return start();
    // Con cuenta: mira la nube antes de empezar (máximo unos segundos; si no hay internet, se juega igual)
    screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${TX('Comprobando tu partida…')}</span></div>`, 'bg_title');
    let done = false;
    const fallback = setTimeout(() => { if (!done) { done = true; UI.toast(TX('La nube tarda en responder: juegas con la partida de este móvil'), 3000); start(); } }, 8000);
    Cloud.sync().then(r => {
      if (done) { if (r === 'downloaded') reloadGame(TX('Cargando tu partida de la nube…')); return; }
      done = true; clearTimeout(fallback);
      if (r === 'downloaded') return reloadGame(TX('Cargando tu partida de la nube…'));
      if (r === 'conflict') return renderConflict(start);
      if (r === 'offline') UI.toast(TX('Sin conexión: tu partida se subirá cuando vuelva internet'), 3000);
      start();
    });
  };
  return api;
})();
