# TRASPASO · Inazuma Gold v0.36.0 (fusión del 25 oct 2026)

> **Qué es este archivo:** nuestro proyecto (Inazuma Gold, v0.31.14) con todo lo nuevo de la otra versión (v0.35.5) metido dentro.
> Se partió de la versión nueva y se le volvió a poner encima lo nuestro. El menú y el diseño son los nuestros.

## 0. Qué trae la fusión
**De la versión nueva (v0.35.x):** Carrera Jugador (3 ranuras; crear y personalizar a tu jugador), Modo Carrera con ranuras y jornadas, Mundial (también el de jugador),
bloqueo de tiros (porteros y defensas), supertécnicas en equipo, Tienda (sobres, equipaciones, escudos, técnicas, álbum, «Tu jugador»), Álbum de equipos con premios, Logros, Cadena Leyenda (evento),
Sobre Selva (evento), porteros más listos, minicampo 1 contra 1, botones del móvil colocables, campos nuevos (playa, galaxia, dorado), 13 jugadores y 4 equipos nuevos, guardado en la nube con ranuras.
**Lo nuestro, que se conserva:** menú principal (diseño nuevo, marca Gold, portada), Navidad, Gacha limitado, globos de diálogo, cinemática de supertécnica,
faltas/tarjetas/penaltis y «elegir jugador con el balón parado» (ver abajo), 99999 monedas y tickets al empezar, nuestra configuración de Firebase y nuestra web.

**Cosas que se tocaron al fusionar (por si algo se ve raro):**
- Menú: botones añadidos con el mismo estilo → «Carrera Jugador» (bajo Modo Carrera), «Álbum» y «Logros» (mosaicos), «Tienda» (barra inferior, que ahora tiene 5 botones) y «Cadena Leyenda» (arriba, solo con el evento activo). «Modo Carrera» ahora abre las 3 ranuras.
- No se ha traído el botón «En directo» de Twitch de Fran (código `Live` en app.js, sin usar).
- **Ids de jugador:** los de ellos que chocaban con los nuestros se renumeraron: Sobre Selva 997001-997006 → **995001-995006**, Leyenda 998001 → **995010**. Nuestros 997001-8 (Navidad) y 998001-4 (GO y Bai Long) siguen igual, así que las partidas guardadas no se rompen.
- `limited.js`: añadida `Limitado.chanceOf()` (faltaba y rompía la pantalla del Gacha de Bai Long).
- `cloud.js` es el de ellos (ranuras); `cloud-config.js`, las reglas de Firestore y `manifest.json` son los nuestros.
- `build.py`: orden de módulos con los nuestros (`christmas, go, limited, dialog`). `tools/i18n_sync.js` también los revisa.
- `test/solo.js` (de ellos) falla a veces por azar, también en su versión original.


---

# PARTE A · Lo nuestro (Inazuma Gold)

### Evento de Navidad (pedido de Fran, 24 oct) — `src/christmas.js` · SIN SUBIR A GITHUB, PENDIENTE DE PROBAR
**Estado (24 oct):** hecho y probado en local, con `XM_START = '2026-10-24'` para que se vea ya (el botón 🎄 sale junto al de Halloween hasta el 6 ene). Dos commits locales sin push (GitHub no estaba enlazado en esa conversación): Fran recibió los archivos sueltos para copiarlos: `src/christmas.js` (nuevo), `src/app.js`, `src/en.js`, `src/event.js`, `src/run.js`, `src/shell.html`, `build.py` y este `TRASPASO.md`; después `python3 build.py` y subir. Los tests (`test/christmas.js`, `test/i18n.js`, `tools/i18n_sync.js`) no se mandaron; están en el repo local de esa sesión y en `navidad-codigo.zip`.
Misma estructura que Halloween, con tema navideño y **botón 🎄 Navidad justo debajo del de Halloween** en el menú.
- **Fechas** (por la fecha del dispositivo): del **24 oct 2026 (visible ya desde hoy, a petición de Fran) al 6 ene 2027** (`XM_START`, `XM_END`). Fuera de fechas no se ve nada. Son una propuesta mía: cámbialas si Fran quiere otras.
- **Moneda ❄️ copos** (`Profile.data.xm = { snow, pulls, pity, daily, boss, bossWins, matches, retos, legends, gift, login, day }`): +5 por partido (+10 si ganas), +20 regalo diario, +60 al ganar al jefe (1 vez al día), retos del día y del evento.
- **Sobre Navideño** (`XM_BANNER = 67`): 15 ❄️ (150 la ×10), legendario 3 % · épica 15 % · rara 32 % · común 50 %, legendario asegurado a las 40. Bote: 6 legendarios exclusivos
  (ids 997001–997006: Shawn Froste, Axel Blaze, Mark Evans, Jude Sharp, Byron Love, Xavier Foster, versiones «(Navidad)» con media ~93) + jugadores de nieve/hielo (nombre con nieve/frost/ice…, el equipo Alpino y elemento viento).
- **Partido jefe**: Alpino con media 85 y Shawn Froste (IE2) a 93, en el campo `nieve` que ya existía. Modo `api.mode = 'xmboss'`.
- **Retos**: 3 del evento (Rey del hielo, Cartas a Papá Noel, Regalo de Reyes) y 4 del día. Al completar los 3 se regala **Shawn Froste de Navidad** (épico especial, id 997007, media 86).
- **Premios por entrar** (5 días, no hace falta que sean seguidos): 150 ❄️ · 10 tickets · 1000 monedas · elegir 1 de 3 de +80 · Shawn Froste de Navidad.
- Marcos rojo/verde con brillo dorado para sus jugadores (clase `.xm`, `xmas: true`); nieve cayendo y tema verde (`.xmtheme`, `.xmfx`). Sin retratos nuevos: usan los sprites de los originales.
- **Modo desarrollador** (beta): sección Navidad → forzar el evento (`settings.xmForce`), +300 ❄️, completar retos, reiniciar.
- Pruebas: `test/christmas.js` (todas pasan) y `test/i18n.js`; el resto de pruebas sigue igual. Recorrido en navegador (menú, pantalla, premio de entrada, tirada ×10) sin errores.
- Tocado fuera del archivo nuevo: `build.py` (añade `christmas.js` tras `event.js`), `tools/i18n_sync.js`, `test/i18n.js`, `run.js` (los de Navidad no salen en el roguelite), `app.js`, `shell.html`, `en.js`.
- Arreglo de paso: el menú principal ya solo pone el tema de Halloween mientras Halloween está activo (antes lo ponía siempre).
- **Bianchi Christmas** (id 997008, base Paolo Bianchi 31855): delantero legendario de **media 105** (tiro 110, control 103, defensa 98, rapidez 108, físico 106; por encima del tope normal de 99). Retrato con gorro de Papá Noel en `juego/sprites/fxm.png` (`python3 tools/xm_faces.py`; `xmFace` en `media.js`). Solo se consigue con el código **BIANCHINAVIDAD** (`GIFT_CODES` en `run.js`, 1 uso); no sale en gacha ni en el Sobre. En el campo usa el muñeco normal de Bianchi.
- Falta: versión (`VERSION`) y entrada en `NEWS` (sin spoilers), decidir si Fran quiere un mánager o equipación de Navidad, y subir el código a GitHub (`git add . && git commit && git push`).
- Si cambian las fechas: `XM_START` y `XM_END` arriba de `src/christmas.js`; `test/christmas.js` usa esas fechas (sección 1) y hay que ajustarlas a la vez.

### v0.31.14 · Faltas, tarjetas y penaltis + elegir jugador con el balón parado (pedido de Fran, 25 oct)
- **Faltas** (`logic.js`: `foulCheck`, `foulCall`): al entrar a un rival con balón, por detrás o sin tocar el balón es muy probable falta (por delante y con éxito, casi nunca).
  Se para el juego y saca el que la sufre (`restart(..., 'falta')`, barrera a 6 m). Dentro del área del que la hace → **penalti**.
- **Tarjetas**: amarilla (la 2ª = roja) o roja directa; el expulsado sale del campo (`sendOff`, se quita de `s.players`; la vista lo oculta). Nunca al portero y nunca por debajo de 4 jugadores (3 de campo + portero). `s.cards` lleva la cuenta.
- **Penalti** (`startPenalty`, `penaltyStep`): balón en el punto, portero en su línea, todos los demás fuera del área y quietos hasta el chut. Rival: chuta solo a una esquina; tú: apuntas con el joystick y mantienes Tiro (si no chutas en 12 s, chuta solo). Si se acaba el tiempo con un penalti pendiente, se tira igual.
- **Ajustes → Partido**: «Faltas, tarjetas y penaltis» (`settings.fouls`, por defecto Sí) y «Elegir jugador con el balón parado» (`settings.pickStop`, por defecto No).
  Con `pickStop`, en saques de banda/córner/puerta rival, fuera de juego, faltas y tu penalti, el partido **espera** (`s.pick`, el reloj no corre) y sale un panel (`UI.pickSync` en `view.js`, `#pick` en `shell.html`): eliges quién saca (si es tuyo) o a quién controlas (si es del rival). `Logic.pickPlayer(s, id)`; `id = null` = seguir igual.
- Pruebas: `test/fouls.js` (falta, penalti propio y rival, tarjetas, selector, partidos IA vs IA). Las demás pruebas siguen pasando. La interfaz del selector se probó en navegador con un Phaser falso (Phaser viene de internet).
- NEWS 0.31.14 y traducciones al inglés añadidas. Posible mejora futura: marcador de tarjetas en pantalla y estadísticas de faltas al final del partido.

## Gacha limitado «Tormenta Celestial» (v0.36.1, 26 oct 2026)

- `src/limited.js`: rareza **limitada** con 4 jugadores de nota 100, versiones nuevas (ids **994001-994004**, nombre «(Limitado)», `lim: true`) de David Samford (base 30), Falcèo Da Silva (31862, POR), Leonardo Almeida (31870) e Isabelle Trick (31061). Copian aspecto y técnicas de la base; `LM_PLAYERS.lead` pone sus técnicas de nivel 100. Los normales (ids 30, 31862, 31870, 31061) **ya no salen en el gacha de siempre** (`gacha=false` al registrarse; quien ya los tiene se los queda).
- Sobre: **10 🎟️ = 10 jugadores**. Bote: los 4 limitados + Bianchi Christmas (legendaria, solo sale aquí) + Jang Cho, Jim Flareson, Changsu Choi, Umi Wang y Sol Crater. Probabilidades (`LM_RATES`): Limitada 2 % (0,5 % cada uno) · Legendaria 3 % · Épica 28 % · Rara 30 % · Común 37 %. Uno de los 4 asegurado a las 100 tiradas (10 sobres) sin ninguno (`LM_PITY`). `LM_END` = fecha de fin (null = sin fin).
- Efectos de limitado en el campo: `LM_FX` (limited.js) da color a cada uno; `drawLimited` (view.js) dibuja aura, rayos en zigzag, rayo por el suelo y chispas al correr; en sus supertécnicas la cinemática usa los rayos azules y dorados (techfx.js).
- Imagen del banner: `juego/ui/tormenta.jpg` (recorte de la foto original; se usa en la pantalla y en las tarjetas `.limbg`). Nombre: `TX('Tormenta Celestial')` en app.js (menú, tarjeta del Gacha, máquina).
- **Bai Long, Arion, Victor y Riccardo ya NO existen**: borrados `src/go.js`, `test/go.js`, `fgo.png` y `bailong.jpg`. `REMOVED_PLAYERS` (run.js) los quita de la colección en `Profile.load` y de rondas guardadas en `Run.repair`. Códigos ARIONGOLD, VICTORGOLD, RICCARDOGOLD, BAILONGGOLD y BIANCHINAVIDAD eliminados.
- `startMul` (run.js): los limitados empiezan con todas sus estadísticas, igual que los legendarios.
- Aviso de jugador nuevo: `NEW_PLAYERS` tiene los 4 (v 0.36.1); al abrir el juego sale una pantalla por cada uno (una vez por dispositivo).
- Tests: `node test/limited.js` (incluye partida guardada vieja y reparto de probabilidades) y `node test/i18n.js`.
- `index.html` se compiló sin comprimir (sin red): para comprimir, `cd tools/minify && npm install && cd ../.. && python3 build.py`.

## v0.36.2 · Cambios de Navidad y Gacha limitado (26 oct 2026)

- **Bianchi Christmas (997008) ya NO está en el Gacha limitado**: ahora solo sale en el **Sobre Navideño** (`src/christmas.js`), súper difícil: **0,2 % por tirada** (`XM_BIANCHI_RATE`, aparte de las demás) y **asegurado a las 300 tiradas sin él** (`XM_BIANCHI_PITY`, contador `Profile.data.xm.bpity`). Cuenta para el reto «Regalo de Reyes».
- **Navidad se abre el 12 de diciembre** (`XM_START = '2026-12-12'`, fin 6 ene). Antes de esa fecha el menú enseña un botón apagado «PRÓXIMAMENTE · se abrirá el 12 de diciembre» (`Navidad.upcoming()`, `xmSoonBtn`) que abre una pantalla de aviso con la cuenta atrás (`renderNavidadSoon`). El modo desarrollador sigue pudiendo forzar el evento.
- **Gacha limitado**: sobre de **50 🎟️** (`LM_PRICE`); limitados más difíciles (`LM_RATES` limitada 1 % = 0,25 % cada uno; garantía a las **200** tiradas, `LM_PITY`); legendarias 6 %, épica 33 %, rara 25 %, común 35 %. El bote ahora lleva los **12 mejores legendarios** y los **40 mejores épicos** del gacha (`LM_N_LEG`, `LM_N_EPIC`; se calculan solos en `Limitado.pool()`).
- **Ilustraciones «modo furia»** de los 4 limitados: `juego/sprites/ffur.png` (hecho con `python3 tools/fur_faces.py`), campo `furFace` en `limited.js` y `refOf` (media.js). Aura del color de cada uno, ojos brillantes y cejas fruncidas.
- `VERSION` 0.36.2 con NEWS (sin mencionar a Bianchi). Traducciones al inglés añadidas. `test/limited.js` ampliado (precio, bote, Bianchi en Navidad, garantías).
- `index.html` se compiló sin comprimir (sin red).

---

# PARTE B · Lo de la versión nueva (texto de sus traspasos)

# TRASPASO · Inazuma Rogue (para seguir en otra conversación de Claude)

> **Cómo seguir:** pásale a Claude este archivo y dile: «Lee TRASPASO.md y sigue con el proyecto». **Todo está en GitHub** (no hace falta bundle).
> ```
> git clone https://github.com/franmndezzzz/Inazuma-Rogue inazuma-rogue && cd inazuma-rogue
> cd tools/minify && npm install terser@5.31.0 && cd ../..   # compresor (node_modules no va en git: .gitignore)
> python3 build.py
> ```

## 0. Estado a 25 oct 2026, 02:20 — v0.35.4 PUBLICADA
- Rivales que suben más: Historia (0,80 + 0,32·progreso), Cadenas (0,97 + 0,10·progreso), Infinito (0,84 + 0,04 por oleada, hasta 1,5; jefes ×1,1).
- IA agresiva (`press`: presionan dos) en Difícil y en el Infinito por oleadas (`Run.diffOf`: Difícil desde la 10, «leyenda» desde la 25).
- Willy LEYENDA no se puede mejorar con Rayos (`useRayo`); solo sube repitiendo la Cadena Leyenda.
- **Siguiente (pedido por Fran): Evoluciones tipo FIFA** con caminos. Respuestas ya dadas: se consiguen con **retos + monedas**; cambian **estadísticas, supertécnicas, aspecto, elemento/posición y rareza**. Falta plantear la primera evolución.

## 0. Estado a 25 oct 2026, 02:10 — v0.35.3 PUBLICADA
- **Cadena Leyenda más difícil** (ya se la habían pasado): rivales del 100 % al 125 % de sus stats del partido 1 al 14 (`LY_RAMP`, `Leyenda.factor`), jefe final **Leyendas** (los mejores POR, DEF, MED y 2 DEL del gacha; `kind: 'leyenda'`, 115 %; no sale en Infinito ni en el álbum),
  IA `leyenda` agresiva (presionan dos, roban/entran más, piensan más rápido), sin mejoras de supertécnicas de la tienda, y **al repetirla** (ya completada: `lyRepeat()`) sin legendarios (`lyBanned`, también fichajes temporales). Los que ya tienen a Willy se lo quedan. Las cadenas empezadas antes pasan a los rivales nuevos (`Run.repair`).
- **Retos 1 contra 1**: se congelaban en los saques de banda si tu jugador es portero (en `restart` no había candidato → error en cada fotograma). Arreglado. Los porteros en el minicampo sacan a ~7-16 m (antes 28 m, todo el campo) y pasan corto si su jugador está algo libre.
- Novedades 0.35.3 solo con los arreglos del 1v1 (lo del evento no va, es spoiler).

## 0. Estado a 25 oct 2026, 01:40 — v0.35.2 PUBLICADA (arreglos de congelados; Fran: «nada más lo arregles publica»)
- Infinito: salían clubes de la Liga Pro (p. ej. «Los Angeles Stars», `kind: 'pro'`) y el Raimon de la Carrera; sus jugadores no tienen muñeco de rival y el partido no cargaba (pantalla sin salida).
  Ahora `Run.playable(key)` filtra (`infiniteTeam`), `Run.repair(run)` arregla las partidas guardadas al cargarlas y `rivalTeam` usa el muñeco de la colección si falta el del rival.
- Red de seguridad (`onCrash` en `app.js`): cualquier error sin capturar saca una barra «⚠️ Algo ha fallado» con el mensaje y «Volver al menú» (cierra el partido y los avisos). Así los jugadores pueden contar qué falla.
- Teclado: además del `blur`, al cambiar de pestaña (`visibilitychange`) se sueltan las teclas.
- Revisado en el navegador (ordenador): las 34 decisiones de la Carrera Jugador con cada opción y todas las pantallas del menú pulsando botones al azar; no se congeló nada. Si siguen las quejas de «eventos de la carrera» o controles, pedir el texto de la barra de error.

## 0a. Estado a 25 oct 2026, 01:15 — v0.35.1 PUBLICADA (Fran: «Publícalo»), rama `leyenda` fusionada en `main`
- **Evento «Cadena Leyenda»** (`src/leyenda.js`, en `build.py` tras `selva.js`): del **25 al 27 de octubre** (`LY_START/LY_END`; en la beta siempre).
  15 partidos contra los 15 mejores equipos por media (`LY_TEAMS`, de Unicorn a Emperadores Oscuros), **una derrota y fuera** (Run kind `leyenda`, 1 vida).
  Dificultad `leyenda` en `DIFF` (logic.js): sin ventajas (aiSpeed 1, steal 1.1 como tú, sin el ×1,05 al defender: `fair`), pero piensan y reaccionan más rápido (think 0.1, react 0.015, smart 1.25).
  Rivales con sus stats de verdad (factor 1) y sus **2 mejores técnicas** (`rivalTeam(..., best)`). Juegas con tu colección y las mejoras de la tienda.
  Premios una vez cada uno (`Profile.data.ly.got`): P3 10 🎟️ · P6 1500 🪙 · P9 «elige 1 de 3» épico+ · P12 «elige 1 de 3» legendario · P15 **Willy Glass LEYENDA** + 10 🎟️ (repetir: +1 ★).
- **Willy Glass LEYENDA** (id 998001, DEL, Bosque, media 97, `leyenda: true`, fuera del gacha): muñeco y foto con corona (`juego/sprites/c161.png`, `f161.png`, hechos con `python3 tools/leyenda_sprites.py`),
  marco dorado y blanco con «LEYENDA» (clase `.ly`; Fran pidió quitar el emoji de corona del marco). Técnicas: **Gafas Royale** (30910, tiro 125, animación propia `royale` en `techfx.js`: gafas gigantes, corona, pilar de luz, rayos de los cristales; en vuelo dos rayos enroscados; gol con estallido de corona), Supernova, Cruz del Sur, Zona sigma.
- **Equilibrio (va en Novedades 0.35.1)**: los rivales llevan como mucho 2 técnicas en todos los modos (antes, al final, 3 + la del portero; `rivalTeam` y `Career.clubTeam`).
  Contra la 0-2-2: los delanteros (IA, no el que llevas) no bajan a defender si el balón está en su campo (`holdsUp`, `HOLD_DEPTH` 24), se quedan arriba; el que roba busca la contra con pase al hueco y el portero saca largo al delantero libre si no hay nadie detrás.
  En simulaciones IA contra IA las formaciones casi no cambian (hay mucho ruido); hay que ver con jugadores de verdad si basta.
- Modo dev: «Cadena Leyenda: al partido 15» y «Reiniciar la Cadena Leyenda». Test nuevo `test/leyenda.js`.
- Compresión: en esta sesión npm estaba bloqueado, así que se comprimió con **esbuild** (un sustituto local de terser en `tools/minify/node_modules/terser`, que no va en git). En la próxima sesión basta con instalar terser como siempre.
  No se pudo leer la beta de siempre (sin acceso a *.frame.claudeusercontent.com), así que la 0.35.1 está en una **beta nueva**: https://claude.ai/artifact/NrcrdkjUtZwwwajTYpz7M7 (privada; todos los sprites, ui y audio subidos).
- Galería de supertécnicas (dev): también salen las técnicas de evento (id ≥ 30900), hechas por su dueño (Gafas Royale → Willy LEYENDA).

## 0. Estado a 25 oct 2026, 00:20
- **v0.35.0 PUBLICADA** (25 oct, 00:00; Fran: «Sube ya a github la 0,35»). `main` = `origin/main` (353d5a7) = `mundial-pro`. A partir de ahora se trabaja en `main`
  (o en una rama nueva para la siguiente versión grande). Web: https://franmndezzzz.github.io/Inazuma-Rogue/juego/
  (el repositorio es **público**: este TRASPASO también se ve; los datos de la ROM **nunca** se suben, solo las hojas ya montadas).
- La 0.35 lleva: Tienda, Álbum, Carrera Jugador (con Mundial y personalizar jugador), Modo Carrera con 12/12/12 y clubes de pago, cadena «Los olvidados del 2», bloqueos de tiro
  (solo a mano), técnicas de varios jugadores, 3 ranuras, logros, evento **Selva del 25 al 28 de octubre**, nombres oficiales de técnicas y los mini parches 0.31.10–0.31.14.
- Códigos de lanzamiento: **SELVALEYENDA** (1 de 3 legendarios de Selva) e **INAZUMA035** (20 tickets + 2 «elige 1 de 3» de +80). Anuncio de Discord/TikTok preparado para Fran.
- Al publicar se quitó del repositorio `tools/minify/node_modules` (se había colado en algún commit de `mundial-pro`); ahora está en `.gitignore`.
- **Siguiente:** estar atento a fallos que digan los jugadores tras la 0.35. Ideas apuntadas: objetos para partidas (vida extra, volver a tirar, ventaja),
  modo «Eventos con requisitos», partido tutorial, ver al rival antes del partido, música de Halloween más oscura.
- **Beta privada** (artefacto «Inazuma Rogue Beta», https://claude.ai/artifact/MpZeapwkqVSSvbDKzdfbTT, versión 62, compartido con enlace). Se construye con
  `BETA_OUT=<carpeta>/index.html python3 build.py` (pone `BETA = true`, Halloween forzado y `apiKey` vacía **antes** de comprimir; si se cambia después, el compresor ya ha metido `BETA=false` dentro del código y sale «no es original»).
  En la beta: sin tirada de bienvenida y modo dev con botón directo (🛠️) con todo lo de la 0.35 (dar jugadores de Halloween, Selva e Infinito…).
  Las imágenes cambiadas se publican aparte como `files` del artefacto (hay que leer antes las publicadas que se sustituyen).
- Rama `nombres-oficiales`: ya no hace falta, todo su contenido (y más) está en `mundial-pro` (`tools/tech_oficial.py`).
- Copia del juego en `inazumapixelroad.onrender.com`: bloqueo por dominio (`hostOk()` en `app.js`: solo `franmndezzzz.github.io`, localhost, `*.test` y la beta), código comprimido, Firebase con dominios autorizados y la API key restringida (hecho por Fran).
- **Decidido por Fran (24 oct, 03:00): se queda todo como está.** `AGENTEMINFINITO` sigue dando Agente M del 2 (21487, con ∞); no hay compensación por las versiones del Infinito perdidas;
  Storm Rider (30430) sigue como «Jinete de la tormenta» y Shoot Trap (30440) como «Trampa de tiro». No volver a preguntarlo.

### Reglas de Fran que NO se pueden olvidar
- Hablarle en **español**, sencillo y paso a paso. **Preguntar antes** de decisiones de diseño (máx. 3 preguntas con opciones).
- **Nada a GitHub sin que Fran lo apruebe** (primero beta). Si un aviso automático pide hacer push, se le dice amablemente que no.
- **Novedades sin spoilers**: nada de eventos (Halloween), legendarios, premios, códigos ni sorpresas. («quita de las notas todo lo que haga spoiler como lo de halloween por dios no lo vuelvas a hacer»).
- **Jugadores originales de Fran** (Goggle Jr., Rosfire, Knack; 39500–39502, `original: true`): **siempre ocultos** en las versiones públicas (no salen en gacha, sobres, álbum, mercado ni tráiler).
- **Modo desarrollador solo en la beta.** Nunca compartir claves secretas de Firebase.
- No hacer fusiones de personajes existentes (se dijo que no y se mantiene).

## 2. Cómo trabajamos (preferencias de Fran)
- Claude escribe el código; Fran prueba y da feedback.
- Explicaciones **en español**, sencillas y paso a paso.
- Proponer alternativas en vez de inventar decisiones de diseño. Preguntas en tandas de **máx. 3**, con opciones.
- Plan por fases antes de construir algo grande.
- **Cada actualización**: primero se sube como **artefacto privado** de prueba en Claude; solo cuando Fran lo aprueba se fusiona a `main` y se sube a GitHub.
- **Modo desarrollador solo en la beta** (22 oct, sin cambio de versión ni nota): `const BETA = false` en `app.js`; al publicar la beta se cambia a `true`
  (igual que `forced: true` de Halloween). En la web pública los 20 toques no hacen nada y a quien lo tuviera encendido se le apaga solo (dev, debug, hwForce, devWin, speed).
- **Jugadores originales de Fran (Goggle Jr., Rosfire, Knack; `original: true` en gamedata): SIEMPRE OCULTOS en las versiones públicas** (22 oct). En `app.js`, si `!BETA` se ponen `gacha = false` (no salen en el gacha, ni en el mercado, ni en el tráiler). Solo se ven en la beta. Fran decide cuándo y cómo publicarlos; no meterlos al sacar versiones ni en Novedades.
- **Novedades del juego (`NEWS` en `app.js`): NUNCA poner spoilers** — nada de eventos (Halloween…), legendarios, premios, códigos de regalo ni sorpresas. Solo mejoras y arreglos (controles, nube, ajustes…). Lo pidió Fran el 22 oct.
- **Cada actualización**: dejar a Fran este `TRASPASO.md` actualizado + un zip pequeño con el código (sin sprites ni música).

## 3. Rama `mundial-pro` (v0.35.0) — PREPARADA, SIN PUBLICAR
- Sale de `carrera-jugador` (0.34) + el Mundial nuevo. **Ya está juntada con la versión publicada (0.31.5, Halloween)** (commit bce9b68, 21 oct):
  trae el evento de Halloween (`src/event.js`, en `build.py` tras `ach.js`), los premios por entrar, Ray Dark en la lista de mánagers
  de «Nueva carrera», los 5 goles de diferencia del roguelite, las técnicas según la posición, la guía de controles, Novedades
  (con una entrada 0.35.0 arriba) y los muñecos del Inazuma 3 arreglados.
  En `logic.js` se juntaron «¡Pásamela!» de la Carrera Jugador (`lockId`) con el pase/tiro al primer toque (`toMe`),
  y el fin por `goalLimit` (reto 1v1) con el de 5 goles (`mercy`). 31 tests y los recorridos en el navegador, sin errores.
- Para publicarla: `git checkout main && git merge mundial-pro && git push` (solo cuando Fran lo diga).

### v0.35 · Mundial en la Carrera Jugador (también en la Liga Pro) — respuestas de Fran
| Decisión | Respuesta |
|---|---|
| Selección | **El creado elige país al crearse** (desplegable «Selección (para el Mundial)»); los jugadores reales van con **su selección de verdad** (`abroad`; los japoneses, Inazuma Japón) |
| Formato | **Igual que ahora**: cada 3 temporadas, grupo de 4 (3 partidos), semifinal y final |
| Convocatoria | **Por rendimiento y con papel**: titular, suplente o reserva según tu nivel, y te puedes ganar el puesto |

Cómo está hecho (`src/pcareer.js`, «Mundial con tu selección»):
- `PC_NATS`: 'JP' (Inazuma Japón) + las 14 selecciones del Inazuma 3 con jugadores propios. `me.nat` (el creado: `pd.nat`; partidas antiguas: `natOfPlayer`).
- Plantilla de tu selección (`natPool`/`natLineup`/`natTeam`): Japón = japoneses de las ligas (como antes); otro país = sus jugadores (`abroad`, también los que juegan en la Liga Pro) y los de su equipo. Equipación de su selección.
- Rivales (`wcNew`): las selecciones menos la tuya; si no eres japonés, **Inazuma Japón** es rival (en lugar de Neo Japan). Se ajustan a tu fuerza como antes.
- Papel (`wcRole`): diferencia con el último titular de tu puesto en tu selección (`PC_WC_GAP = [1, 10]`): ≤1 titular, ≤10 suplente, más reserva; nota media ≥ 7,5 sube un escalón.
  Ojo: en Japón hay delanteros/medios de 93–97 (Axel, etc.), así que un creado suele ir de reserva o suplente; en otros países enseguida es titular.
- En los partidos: **titular** juega entero; **suplente** se simula la 1.ª parte (`wcBenchPlan`) y sales en la 2.ª (`PC_SUB_PART`); **reserva** lo ve desde la grada (sin nota).
- Ganarse el puesto (`wcFinish`): suplente con nota ≥ 7,2 → titular; titular con nota < 5,5 → suplente; reserva → suplente con probabilidad y seguro a los 2 partidos.
- Pantalla `renderPCWC` (escudo y nombre de tu selección, tu papel y qué significa), aviso del papel en el fin de temporada, premio «Campeón del mundo con {selección}».
- Modo dev → Carrera Jugador: «Mundial ahora / de suplente / de reserva» y «Selección: X» (toca para cambiarla).
- Prueba nueva `test/pcwc.js` (selecciones, España con Japón de rival, reales con su país, papeles, suplente/reserva, ganar el puesto, partidas antiguas). `test/pcareer.js` actualizado.

### v0.35 · Raimon, Primera de 12 y elegir club (pedido de Fran)
- **El Raimon ya existe como club** (`CAREER_TEAMS` en `src/career.js`, se añade a `GAME.teams` con `kind: 'career'`, así no sale en la Historia ni en el partido rápido):
  Mark (POR), Nathan (DEF), Axel (DEL), Erik y Steve (MED), escudo 1 y equipación amarilla y azul. Antes Mark, Axel… solo eran agentes libres.
- **Primera con 12 equipos**: entran el Raimon y el Alpino (`CAREER_START[1]`). Segunda y Tercera siguen con 10. Total 32 equipos.
- Calendario de **18 semanas** con **11 de liga** (`SCHED`): Primera juega 11 jornadas; las divisiones de 10 tienen 2 **jornadas de descanso** repartidas
  (`fixtures` mete rondas vacías; `nextMatch` devuelve `null` y `advance` juega igual las demás). Mercado de invierno en la semana 9 (`WINTER_WEEK`).
- Copa: los exentos se calculan según el número de equipos (con 32, nadie espera; 16 eliminatorias). `Career.jornadaNum` / `leagueRounds` para mostrar «Jornada X de Y».
- Partidas de antes: al empezar la temporada siguiente entran el Raimon y el Alpino en Primera (`ensureTeams`).
- **Carrera mánager → «Elegir un club»**: en la pantalla de Nueva carrera eliges «✨ Crear tu club» (como antes, en Tercera) o «🏟️ Elegir un club» (lista de las 3 divisiones con su media).
  Con un club existente ocupas su sitio, con su nombre, escudo (`c.crestImg`), equipación y jugadores (completados hasta 7). Fama y dinero según división (`CLUB_START`).
  En «Club» puedes cambiar el escudo y volver al de siempre. El logro «A Primera» solo cuenta si asciendes (`c.startDiv`).
- En la Carrera Jugador también puedes acabar en el Raimon (sale en las ofertas de Primera si tu media es alta).
- Arreglado (venía de la 0.34): si jugabas con un jugador real y fichabas por un club donde también estaba (p. ej. Nathan en los Emperadores), había dos copias tuyas en la plantilla y la graduación llegaba una temporada tarde o temprano (`joinClub`, `endSeason`).
- Prueba nueva `test/clubs.js` (Raimon, 12/10/10, descansos, 11 PJ en Primera, Copa de 32, empezar con el Raimon o con uno de Tercera, partidas antiguas).

### v0.35 · Goggle Jr., Rosfire y Knack (legendarios originales, 22 oct)
- Jugador original de Fran (no es la fusión de ningún personaje; con nombres tipo «Juleb/Casharp» se dijo que no). Id **39500**, MED, Bosque,
  legendario del gacha general. Técnicas: Barrido defensivo (122), Triángulo letal (147), Pingüino emperador n.º 1 (277; el n.º 2 no existe) y Vendimia (138, bloqueo; en vez de Campo de fuerza, que es de portero).
- **Knack** (id 39502, DEF, Montaña, legendario del gacha general): Escudo corporal (380), Trama (137), Mega terremoto (230) y Rueda infernal (106). Retrato `f159.png` (dibujo de Fran), muñeco `c159.png` (base: Jay Asher, gorro blanco).
- **Rosfire** (id 39501, DEL, Fuego, legendario del gacha general): Vórtice de fuego (30480, desde la 0.31.7; antes Tornado de fuego; se llamaba Torbellino de fuego hasta la 0.35, que es el nombre oficial de Fireball Screw), Tornado dragón (204), Corte flamígero (107) y Fénix (215). Retrato `f158.png` (dibujo de Fran), muñeco `c158.png` (base: Montaine Skalin, pelo rosa).
- Retrato `juego/sprites/f157.png` (hecho con el dibujo de Fran, reducido a 64 px); muñeco `juego/sprites/c157.png` (base: Colin Mando, pelo verde azulado y gafas en la cinta).

### v0.35 · Medias de carrera propias, logros y arreglo de «Fichajes» (22 oct, respuestas de Fran)
- **Medias de carrera** (mánager y jugador, también rivales): ya no son las del gacha. `careerIE(pd, k)` en `career.js`: mismo orden pero comprimidas,
  media del gacha 46 → 50 y cada punto vale 0,6 (legendarios 77-80, épicos 64-71, raros 58-63, comunes 50-57). Los legendarios de evento, como uno más
  (Tassman de Halloween 93 → 78; Poseidon 63 → 71). Rivales = `careerIE × aiFactor × RIVAL_K` (1,2). Tus mejoras (`m.up`) se mantienen.
  El valor de mercado (`value`) sigue con la escala antigua para no cambiar la economía. Al cargar se recalcula la fuerza de los clubes (`c.cmv = 1`).
  Números (tu club nuevo en Tercera 55): Tercera 51-57 · Segunda 65-73 · Primera 70-85. El jugador creado empieza en 57.
- **Logros de la Carrera Jugador solo con un jugador creado** (`ach.js`: `D()` exige `me.pd`).
- **(Desarrollador) 🧱 Probar bloqueos de tiro**: minicampo donde el rival te chuta una y otra vez; eliges tiro (normal, cargado o supertécnica), defensa/físico (50-99), botón o automático y la técnica. Lleva la cuenta: parados · frenados · sin bloquear (`renderDevBlocks`, `blockLoop`).
- **«📰 Fichajes» abría las Novedades**: había dos funciones `renderNews`; la de las notas de versión ahora es `renderPatchNotes` (en `main` sigue llamándose `renderNews`).

### v0.35 · Bloqueos de tiro como en el Inazuma DS (respuestas de Fran, 22 oct)
- Se activa **como los ajustes**: con «Con botón», a tu jugador le sale «¡Bloquéalo! Pulsa Técnica» y cámara lenta cuando el tiro va hacia él; en automático sale solo.
  **Desde el 24 oct (Fran: «que solo sean manuales»)**: en tu equipo solo bloquea tu jugador y solo si pulsas Técnica, también en automático; tus compañeros no bloquean solos.
  **Los rivales** (IA) sí, según la dificultad (`diff.techUse`). En partidos `allAI` el equipo A bloquea como la IA. Cada defensa, una vez por tiro.
- **Frena o para** (`logic.js` `shotBlocks` / `blockShot`): fuerza del bloqueo = media de defensa y físico + la técnica (`techEff`); la del tiro = su potencia
  (los tiros normales restan 12, los cargados 4). Si gana el bloqueo, el balón se queda en el defensa; si no, el tiro sigue con menos potencia y velocidad.
  Contra **todos los tiros** (los normales se paran casi siempre). Radio `BLOCK_R` = 2,3 (el defensa se lanza a por el balón); ~1 bloqueo de tiro por partido entre IAs. Test: `test/blocks.js`. Truco en la guía de controles.

### v0.35 · Arreglo: Carrera Jugador con un legendario de evento (22 oct)
- Un legendario de Halloween (stats altas en todo) acababa de portero o defensa y su «copia normal» (p. ej. Hebimos) jugaba a su lado, así que parecía que controlabas a otro.
- Ahora: `PC.autoLineup` te pone siempre en un hueco de tu puesto; `twinOf()` (campo `hwBase` del legendario, en `event.js`) saca la copia del equipo y de la selección;
  al cargar una partida de antes se quita la copia y se rehace el once si estabas fuera de tu puesto. Test: `test/pchalloween.js` (6 legendarios × 32 clubes).

### v0.35 · 3 ranuras de guardado (pedido de Fran)
- **3 ranuras para la Carrera mánager y 3 para la Carrera Jugador.** Al tocar «Modo Carrera» o «Carrera Jugador» en el menú sale la pantalla de ranuras
  (`renderSlots`): cada una muestra su resumen (escudo/cara, club, temporada, división o nivel); se toca para abrirla y 🗑 (dos toques) para borrarla.
- `Slots` en `src/career.js`: la ranura 1 es la clave de siempre (`inazuma-carrera`, `inazuma-jugador`), así las partidas de antes siguen ahí;
  las otras son `-2` y `-3`. La ranura abierta se recuerda por dispositivo en `inazuma-ranuras`.
- Nube: las 4 claves nuevas van en `SAVE_KEYS` y `PROGRESS_KEYS`; `inazuma-ranuras` es de dispositivo (`DEVICE_KEYS`). `describe` resume la primera ranura con partida.
- Borrar una ranura de mánager la manda al Salón de la fama (como abandonar). Prueba nueva `test/slots.js`.

### Teclas del ordenador a elegir (v0.31.4, publicado; también en la 0.35)
- Ajustes → Controles → «Teclas del ordenador»: Nuevas (K tiro) o Clásicas (L tiro, como antes). `settings.keys`, `SCHEMES` en `src/view.js`.
- Ojo al juntar con `halloween`: allí están además los premios por entrar de Halloween (v0.31.4, `src/event.js`).

### Nube (v0.31.3, publicado; también en la 0.35)
- «Error al guardar en la nube (resource-exhausted)» = cuota gratuita diaria de Firebase agotada. Ahora como mucho una subida por minuto mientras juegas,
  y al salir de la app; cambiar solo ajustes no sube nada; con la cuota agotada avisa y reintenta a los 10/30/60 min. Escenarios 20–22 en `test/cloud.js`.

### Controles (v0.31.2, publicado el 21 oct; también en la 0.35)
- **Fallo del móvil «no chuta y no pasa»**: las pulsaciones se perdían si caían cuando tu jugador no podía actuar (justo al recibir, tras una entrada,
  en el congelado de un golpe) o si el toque de Tiro duraba menos que un fotograma. Arreglo en `src/logic.js`: **búfer de entrada de 0,25 s**
  (`bufferInput`) y acción `shoot` al pulsar Tiro (toque rápido = chuta). En `src/view.js` los botones táctiles ya no cambian mientras tienes el dedo encima. Prueba: `test/input.js`.
- **Teclas de PC** (respuesta de Fran: las dos a la vez): WASD o flechas · Shift esprint · J/Z pase-entrada (¡Pásamela!) · K/X tiro (mantén) - cambiar jugador ·
  L/C profundidad - saque largo · I/V regate · Espacio supertécnica · E cambiar técnica · P/Esc pausa. (Q y U siguen valiendo.)
- **Aviso del mando** en PC: línea en el menú y aviso corto en los 3 primeros partidos (`settings.padTip`); los botones del mando están en Ajustes.

## 3b. Rama `carrera-jugador` (v0.32 + v0.33 + v0.34) — base de la 0.35
- Commits sobre `main` (3512e6e): `v0.32.0: Modo Carrera Jugador`, `TRASPASO.md…`, `v0.33.0: Liga Pro, fichajes entre clubes, logros, partido rápido en dev`.
  **Nada de esto está subido a GitHub todavía.**
- Si solo tienes el zip: copia `src/`, `test/`, `tools/`, `build.py`, `README.md` y `TRASPASO.md` encima del repo, ejecuta `python3 build.py` y listo
  (`juego/gamedata.json` no ha cambiado).
- Cuando Fran apruebe: `git checkout main && git merge carrera-jugador && git push` (GitHub Pages se actualiza solo).
- Artefacto de prueba (privado, cuenta de Fran actual): «Inazuma Rogue Beta». Ahí las **cuentas en la nube están desactivadas**
  (los artefactos no pueden cargar Firebase); el guardado es solo en ese navegador. Para publicarlo se quita el `<!doctype html>` y se vacía `apiKey`.

### v0.32 · Modo Carrera Jugador (lo que pidió Fran)
| Decisión | Respuesta de Fran |
|---|---|
| Jugador | Crear uno **o** elegir uno de la colección |
| Partido | Solo controlas a tu jugador (pides el pase con «¡Pásamela!») |
| Progreso | Nota del partido da puntos + entrenamiento semanal |
| Camino | Instituto y luego selección (Inazuma Japón en el Mundial) |
| Titular | Depende: Axel Blaze es titular; uno creado empieza en el banquillo |
| Premios | Sobres y monedas; el jugador creado entra en la colección al graduarse |
| Técnicas | Al subir de nivel (elige 1 de 3) y practicándolas |
| Suplente | Entra en la 2.ª parte |
| Aspecto | Elegir un sprite del juego |

### v0.33 (pedido de Fran tras probar la 0.32)
- Jugador creado: empieza con **media 45**, la **primera técnica en 1 semana** (luego 3), algo más «promesa» (más confianza, banquillo solo 2 semanas, más XP).
- **Graduación a las 3 temporadas** (`PC_GRAD_YEAR`), luego **Liga Pro sin fin**: 10 clubes inventados tipo Barcelona/Madrid (`PRO_CLUBS` en `pcareer.js`)
  con jugadores de las selecciones del Inazuma 3. La Liga Pro pasa a ser la división 1; la japonesa queda debajo y no hay ascensos/descensos entre ellas.
  Fuerza de los rivales Pro: `PRO_FACTOR = 0.87` (ajustado con pruebas: un creado queda a mitad de tabla, Axel gana la liga).
- **Fichajes entre clubes** (`Career.aiTransfers`, en verano y en invierno semana 8) en los dos modos, con noticias (📰).
  En mánager, **ofertas por tus jugadores** (`c.bid`, vender/rechazar). En Carrera Jugador, **pedir el traspaso** en semanas 1-2 y 8-9 (`askTransfer`;
  a mitad de temporada heredas la clasificación del club nuevo con `renameSeason`).
- **Logros** (`src/ach.js`): 40 retos con premios bronce/plata/oro/diamante; detecta lo ya conseguido en la partida (retroactivo) y se recoge en 🏅 Logros.
- Escudos y equipaciones de la Liga Pro con los colores del club al que homenajean (Barça azulgrana, Madrid blanco y oro, Milan rojinegro…):
  `juego/ui/crest4001.png`…`crest4010.png`, creados con `python3 tools/pro_crests.py` a partir de los escudos de las selecciones. **Van en el zip** (son imágenes nuevas).
- **Partido rápido** solo en el modo desarrollador (20 toques en la versión), que tiene ahora herramientas de Carrera Jugador, fichajes y logros.
- Arreglado: al irte de un club, ese club se quedaba con 7 jugadores (jugaba 7 contra 5).

### v0.34 (pedido de Fran tras probar la 0.33)
- Modo dev accesible desde cualquier pantalla: botón 🛠 (`#devFab`) cuando está activado; «Volver» lleva a la pantalla principal del modo en que estabas.
- Supertécnicas que se desbloquean por media (70 medio buenas, 80 bastante buenas, 85 muy buenas) también con jugadores reales: `PC_TIERS`, `checkTier`.
- Premios **Balón de Oro** y **Rookie del año** (+ logros nuevos `pcBalon`, `pcRookie`, `pcDuel3`).
- **Amistades y rivalidades** (`me.rel`): respuestas de Fran → amigo te pasa más (Logic `friendKeys`) y te recomienda; rival = más motivación; el 1v1 da premios.
- **Reto 1 contra 1** en minicampo con portero (Logic `settings.mini`, `noOffside`, `goalLimit`); sale de vez en cuando al ganar siendo el mejor (35 %, cada 5 semanas como mínimo).
- **Decisiones** de prensa, vida fuera del campo y vestuario (`makeEvent`, `eventView`, `resolveEvent`).
- Liga Pro: nadie es solo de un país (portero y defensa de su selección + 3 fichajes de otros países, reparto fijo).
- **34 decisiones distintas** (prensa, radio, tele, rumores, familia, exámenes, perro, lesiones, vestuario, capitanía, penaltis, novatada, patrocinios…); no se repiten las 12 últimas (`me.evSeen`). Algunas cambian algo más: «dejarlo caer» un rumor trae más ofertas esa temporada; impresionar al ojeador facilita la convocatoria. Prueba: `test/events.js`.
- Los avisos largos ya no se cortan (ocupan dos líneas).
- Modo dev → **✨ Galería de supertécnicas**: lista de todas (filtros por tipo y elemento, buscador); al tocar una se ejecuta de verdad en un minicampo 2 contra 2 y se repite sola (`renderDevTechs`, `techDemo`, `techLoop`, modo `techview`). Pausa → «Salir» vuelve a la lista.
- Modo dev → Carrera Jugador → **💬 Probar decisiones**: lista de las 34; tocas una y sale ya (`devEventKeys`, `devEventForce`).
- Arreglos: forma con decimales raros, portero del reto, oferta de un amigo desde un club que ya no está en ninguna liga, técnicas repetidas en las opciones.

### v0.31.6 · Nube con menos gasto de Firebase (pedido de Fran, 21 oct)
- La partida se sube **comprimida** (gzip) en cuanto pasa de 20 000 letras (`MAX_RAW` en `src/cloud.js`; antes solo por encima de 500 000).
  Una carrera normal ocupa y descarga ~8 veces menos. Todas las versiones desde la 0.28 ya saben leerla comprimida.
- **Subidas**: como mucho una cada 5 minutos mientras juegas (`PUSH_DELAY` 300000), y siempre al acabar cada partido (`Cloud.flush()` desde
  `api.matchEnded`) y al salir o cambiar de app. Tests: `test/cloud.js` escenarios 23 y 24.
- No se quitó la lectura de cada subida (Fran prefirió no arriesgar que dos móviles se pisen).
- **Zohen (DF) legendario de Halloween** (id 996006, base 21399): sexto legendario del Sobre Calabaza; retrato de miedo en `fhw.png` fila 5
  (`tools/hw_faces.py`: piel gris verdosa, ojos rojos, máscara agrietada con gotas tóxicas). `media.js` pide `fhw.png?v=2`.
- **Marcos de los legendarios de Halloween** en naranja apagado con brillo morado (clase `.hw` que pone `hwc(pd)` en `app.js`: cartas del gacha, fichas, plantilla y campo).
- **Teclas «A tu gusto»** (Ajustes → Teclas del ordenador): `settings.keys = 'custom'`, `settings.keyMap` (acción → `e.code`) y `settings.keyLabels`
  (letra de tu teclado, p. ej. Ñ). Acciones: arriba/abajo/izquierda/derecha, esprint, pase, tiro, cambiar jugador, profundidad, regate, supertécnica,
  cambiar técnica y pausa (Esc siempre pausa). Tiro y Cambiar pueden compartir tecla; las demás repetidas salen en rojo. `Input.capture()` en `view.js`
  coge la siguiente tecla. La barra de teclas y la guía de controles enseñan tus teclas. Probado en el navegador (`/tmp/claude-0/ui_custom.py`).
- Si aun así se agota la cuota: plan Blaze (~0,09 $ por 100 000 escrituras de más) con alerta de gasto. Ver qué límite se gasta en Firebase → Firestore → Uso.

### v0.31.7 · Técnicas del Inazuma 3 en español (pedido de Fran, 22 oct; se sube el 22 a las 12:00)
- `tools/ie3_es.py` (ya ejecutado; se puede repetir sin problema): las 103 técnicas del Inazuma 3 venían en inglés; ahora `name` en español y `name_en` con el inglés original.
  Son traducciones (el 3 no salió en España): «Grand Fire» → «Gran fuego», «God Hand X» → «Mano celestial X», «Emperor Penguin No. 3» → «Pingüino emperador n.º 3»…
- Técnicas nuevas: **Vórtice de fuego** (30480, antes «Torbellino de fuego», tiro fuego 110: Axel y Axel IE3) y **Leyenda del lobo** (30481, tiro viento 110: Shawn y Shawn IE3).
  Con animación propia (`techfx.js`: tornadoF y lobo).

### v0.31.8 · Controles del móvil (quejas de jugadores, 22 oct)
- Joystick (`view.js`): radio 36 → 44 px (dibujo 100 px), zona muerta 16 %, **esprint solo más allá del aro** (`SPRINT_AT` 1,3 × radio; antes cualquier empujón a tope
  esprintaba y el jugador se cansaba), y el centro sigue al dedo si se aleja mucho (`FOLLOW`).
- Botones más grandes, separados y **en arco alrededor de Tiro** (Pase y, encima, Regate/Cambiar; lejos del joystick; `shell.html` `.act.*`, `#pad` 240×240).
  **Pase al hueco eliminado del juego** (móvil, teclado y mando; Fran: estorbaba). La tecla/botón (L/C, K/C clásicas, B del mando) solo sirve para el saque largo del portero; la IA rival sí sigue usando pases al hueco. Joystick: radio 44 px, dibujo 100 px. + **Ajustes → Tamaño de los botones** (pequeños/normales/grandes: `settings.padSize`, `--padk`).
- En defensa «Cambiar» va donde Regate (no donde Pase): al perder el balón, un toque en Pase ya no cambia de jugador.
- `switchPlayer` (`logic.js`): al compañero que antes llega al balón; otra pulsación en 1,2 s → el siguiente; el cambio automático respeta el manual 1,2 s.
- Botón «💬 Únete al Discord de la comunidad» en el menú (`DISCORD_URL` en `app.js`: https://discord.gg/W8bn6ZCV3).
- Probado con toques reales simulados (CDP): tiros y pases 5/5 con el joystick puesto, sin cambios sin querer, ciclo de Cambiar correcto.

## 4. Cómo se construye y se prueba
- Todo el código está en `src/`. `python3 build.py` lo junta en `juego/index.html`
  (orden: i18n, en, media, logic, run, career, pcareer, ach, event, shop, cloud-config, cloud, view, techfx, app; comprimido con `tools/minify`). Datos en `juego/gamedata.json`.
- Probar en local: `cd juego && python3 -m http.server 8000` → http://localhost:8000
- Pruebas automáticas (Node, sin dependencias): `for f in test/*.js; do node $f; done` (saltar `sig_methods.js`).
  Todas pasaban en la v0.32.0. `test/i18n.js` avisa si falta alguna traducción.
- Textos: siempre en español dentro de `TX('…')` (huecos `{0}`) o `TXn(n,'singular','plural')`; traducción en `src/en.js`.
  `node tools/i18n_sync.js missing` lista los que faltan; `node tools/i18n_sync.js add archivo.txt` los añade (`"clave"|traducción`).
- Tráiler vertical: `python3 tools/trailer.py es salida.mp4` (Playwright + ffmpeg; textos en `tools/trailer.js`).
  Tráiler «Promesas y Negocios» (v0.33, solo español, canción op2, con capturas reales dentro de un móvil):
  `TRAILER_JS=tools/trailer_pyn.js TRAILER_MUSIC=op2 TRAILER_SHOTS=<carpeta de capturas 1170×2532> python3 tools/trailer.py es salida.mp4`.
- Equipaciones de clubes: `tools/kits.py`.

## 5. Cuentas y nube (Firebase) — ya configurado
- Proyecto Firebase `inazuma-rogue`. Datos públicos en `src/cloud-config.js` (son públicos por diseño; **nunca** compartir claves secretas/service account).
- Login con Google o usuario+contraseña (el usuario `fran` se guarda como `fran@jugadores.inazumarogue.app`).
- Firestore: documento `saves/{uid}` = `{username, rev, data|z, updatedAt}`. Reglas en `firestore.rules` (cada uno solo su documento, `rev` siempre +1).
- `src/cloud.js` sube sola la partida 3 s después de cada guardado de las claves de `SAVE_KEYS` (incluye `inazuma-jugador`). Si hay conflicto, pregunta al jugador.
- Dominio autorizado en Firebase: `franmndezzzz.github.io`.

### Animaciones de supertécnicas (v0.34)
- En `src/techfx.js`, nuevas reglas por nombre en `SIG_RULES` y sus dibujos en `sigWindup2` (carga del tiro), `sigFlight2` (balón en vuelo), `sigParada2` (porteros),
  `dashSig` (regates) y nuevos `impact` de bloqueo. Ejemplos: Tiro fantasma (fantasmas), Remate misil (cohete con humo), Tiro dinamita, Bateo/Golf total (palo),
  kung-fu (puños y ondas), Psicorremate (ojo y ondas), Remate Tarzán (liana y hojas), Lecho de rosas, Baile de mariposas, Tormenta de fuego, Torre de Osaka,
  Bola de fango; porteros: Lanzallamas, Tormenta de pétalos, Salto del cisne, Constelación estelar, Destrozataladros, Despeje cohete, Puños voladores, Bloque de hielo;
  regates: Rueda infernal, huracanes, Zigzag chispeante, Superarmadillo, Pompa de chicle, Luna creciente, Aurora/Cruz del Sur, Paipay gigante, Bomba géiser,
  Regate topo, Sprint triple, Lluvia de meteoros; bloqueos: Telaraña, Bloqueo ballena, Tren loco, Pisotón de sumo, Cortafuegos, Flash de fotones, Ciclón,
  Olor embriagador, Doppelgänger. Probadas con una galería en el navegador (se dibuja cada animación en un partido congelado).

### Arreglos del guardado en la nube (v0.34)
- Cerrar sesión borra también `inazuma-jugador` (antes la Carrera Jugador se quedaba en el móvil y se subía a la siguiente cuenta).
- Conflictos solo si cambia el **progreso** (`PROGRESS_KEYS`, huella `meta.phash`); ajustes y sonido son de cada dispositivo y se conservan al bajar.
- Mientras se compara con la nube al arrancar no se sube nada (`syncing`); si se jugó en el móvil durante la espera, se pregunta en vez de pisar.
- Tras bajar la partida, el móvil queda «congelado» (`frozen`) hasta recargar: ningún guardado viejo pisa lo bajado.
- Reintentos automáticos tras un error o sin conexión (20 s, 45 s, 90 s… `RETRY`), y también al volver internet.
- La pantalla «¿Qué partida conservas?» muestra la Carrera Jugador. `test/cloud.js` tiene 19 escenarios.

## 6. Historial resumido
- 0.35 (preparada, rama `mundial-pro`): Mundial con tu selección (país elegible, papel titular/suplente/reserva).
- 0.31.1 (rama `halloween`, la publica Fran): evento de Halloween.
- 0.2x: guardado en la nube con cuentas, pantalla para traer la partida del enlace antiguo (https://claude.ai/artifact/J4Hbvgaj1rHQC3mtFDSL2C).
- Carrera mánager pulida: graduación tras 6.º curso, agentes libres buenos a veces, inicio más fácil, +1 stat por curso, canteranos siempre.
- Joystick más pequeño, mejores botones, equipaciones coherentes, arreglo de robos que congelaban jugadores, sin zoom del navegador.
- Notas de parche con código regalo **MUNDIAL**, textos para TikTok y guion de vídeo.
- 0.31: traducción completa al inglés con selector de idioma; mini tráilers ES/EN.
- 0.32 (pendiente de aprobar): Modo Carrera Jugador.
- 0.33 (pendiente de aprobar): Liga Pro, fichajes entre clubes, logros, partido rápido solo en dev.
- 0.34 (pendiente de aprobar): técnicas por media, Balón de Oro, amigos/rivales, reto 1v1, decisiones, botón dev.

## 7. Ideas / pendientes
- Supertécnicas (hecho en v0.34): ~70 técnicas que usaban una animación genérica tienen ahora una propia según su nombre (ver abajo). Si Fran quiere más, seguir con las familias genéricas que quedan (`node` + script de recuento en `src/techfx.js` → `famOf`).
- Esperar el feedback de Fran sobre la beta (v0.33) y ajustar.
- Tras aprobarla: fusionar a `main`, subir, nota de parche y tráiler/TikTok de las novedades si Fran lo pide.
- Pruebas nuevas: `test/pcareer.js` (carrera entera con Liga Pro), `test/transfers.js`, `test/ach.js`. Recorrido de la interfaz con Playwright: ver sección 4.

### Sugerencias de un jugador (22 oct) — hechas la 1, 3, 6 y 7; quedan la 2 (partido tutorial), la 4 (rivales antes del partido) y la 5 (música de Halloween)
1. **Jugadores (Plantilla → Jugadores)**: mostrar el nivel y el elemento de cada uno, como en «Mi equipo».
2. **Partido tutorial** para los nuevos, con indicaciones de controles paso a paso (la guía de controles ya existe en Pausa y Ajustes).
3. Saltar recompensas tras los partidos: **ya está hecho** (botón «Saltar (no quiero ninguna)», `#rwSkip`, publicado). Revisar que salga en todas las pantallas de recompensa (etapas, cadenas, infinito).
4. **Antes del partido**: enseñar los nombres de los jugadores rivales y su nivel o media.
5. **Halloween**: música del menú más oscura mientras dura el evento. Candidata: `e204` «La sombra negra - Tema de Ray Dark» (encaja con Ray Dark del evento).
6. **Equipos especiales con premio repetido**: Tanques Centella y Ultra Zeus dan los dos a Byron Love (id 157), y Torch puede salir dos veces (Prominence / Caos). Poner un premio distinto en cada equipo (otra versión del jugador o el segundo mejor).
7. **Muñecos del Inazuma 3 que no cuadran con su foto** (muchos en `c115`–`c156`; 19 tienen el pelo en colores de relleno: magenta, cian o verde puro). Hace falta la hoja original: Fran puede permitir `www.spriters-resource.com` y `static.spriters-resource.com` en Ajustes → Capacidades, o adjuntar las hojas.

### Idea de Fran (22 oct): modo «Eventos con requisitos» (sin hacer)
- Desafíos con reglas para formar el equipo. Ejemplos de Fran: **todo de un elemento** (p. ej. solo Aire), **solo comunes**, **sin legendarios**, **solo jugadores de la 1.ª temporada** (Inazuma Eleven 1).
- Ideas para concretarlo: la regla se comprueba al elegir el equipo (los que no valen salen en gris); premios propios (tickets, Rayos, algún jugador); que roten cada semana o que haya varios abiertos a la vez.
- Ya existe el filtro «Juego» en el buscador de jugadores, que sirve para la regla de temporada.

### Muñecos del Inazuma 3 desde la ROM (22 oct, en `main` sin subir y en `mundial-pro`; beta publicada)
- Fran pasó la carpeta `data_iz` (de su copia de *Inazuma Eleven 3 - Team Ogre Attacks!*, 3DS). En el juego cada muñeco = cuerpo `spr/char/pcb` + cabeza `pch` con su paleta `pph`.
- `unitbase.dat`: 104 bytes por jugador (id del juego = 30000 + n.º de ficha); bytes 84-85 = cabeza, 86-87 = paleta. Los archivos van en `.pkh/.pkb` con el CRC32 del nombre (`pch%08d.pac_` con cabeza×100, `pph%04d.PLT`, `pcb%08d.pac_`, `ppb%04d.PLT`; los nombres salen de `cro/ina_main3ogre.cro`).
- `tools/ie3_sprites.py "<ruta>/data_iz"` rehace las 720 filas de `c112`–`c156` (cuerpo 1 con la paleta 2, piel de la paleta de la cabeza). Las hojas se piden con `?v=6`.
- Los datos de la ROM NO van al repositorio (es público): solo las hojas ya montadas.

### Pendiente (Fran, 23 oct) — HECHO las dos cosas (ver abajo y sección 0)
- Meter en la 0.35 la cadena «Los olvidados del 2» (`tools/ie2_teams.py`, commit ddc88cb en `main`, sin subir) y poner esos 4 equipos (Servicio Secreto, Mary Times, Triple C, Mar de Árboles) también en el Modo Carrera.
- Le han copiado el juego: decidir cómo proteger el repositorio (privado + otro alojamiento, bloqueo por dominio, dominios autorizados de Firebase).

### Plan acordado con Fran (23 oct, 12:12) — antes de empezar
1. Carrera mánager: las supertécnicas solo se pueden usar cuando el jugador las aprende (ahora las usa todas desde el principio).
2. Tienda (🛒 en el menú):
   a. Tickets por monedas: 150 🪙 cada uno, máximo 10 al día.
   b. Sobre de jugador elegido («elige 1 de 3», por rareza/posición/elemento).
   c. Equipaciones y diseños de pago (más diseños y colores especiales para el creador).
   d. Escudos y campos para tu equipo.
   e. Mejorar supertécnicas (evolucionar con monedas).
   f. Álbum de colección (completar equipos da premios).
3. MÁS ADELANTE (apuntado): cosas para las partidas — vida extra, volver a tirar recompensas, empezar con ventaja.
Referencia: los jugadores suelen tener entre 1.000 y 10.000 monedas.
Decisiones de Fran: en la Carrera cada jugador empieza con su primera técnica (la de nivel 1). Sobres: raro+ 700 · épico+ 2500 · épico+ de una posición 3500 · legendario 7000 (uno por semana). Todo sale junto en la 0.35 (rama mundial-pro).

### v0.35 · HECHO (23 oct, tarde) — beta publicada, sin subir a GitHub
- `mundial-pro` trae todo lo de `main` (merge 14088a6) + la cadena «Los olvidados del 2» (33a9855).
- Modo Carrera: las 3 divisiones tienen 12 equipos (Servicio Secreto y Mar de Árboles en Segunda; Mary Times y Triple C en Tercera). `ensureTeams` los mete en partidas antiguas la temporada siguiente. Copa: máximo 32 (se quedan fuera los más flojos de Tercera, nunca tú).
- **Tienda** (`src/shop.js`, en `build.py` tras `event.js`; pantalla `renderShop` en `app.js`; botones 🛒 Tienda y 📖 Álbum en el menú):
  tickets 150 (10/día) · sobres raro+ 700 / épico+ 2500 / épico+ de un puesto 3500 / legendario 7000 (1 por semana, lunes) — van a `giftPicks` y se eligen al momento ·
  6 diseños (`aros`, `franja`, `hombros`, `cruz`, `chevron`, `puntos` en `media.js`) y 8 colores · escudo propio 1500 + formas hexágono/estrella (también en la Carrera) ·
  10 campos (3 nuevos en `view.js`: playa, galaxia, dorado); en casa = partidos pares menos el último (Historia/Cadenas/Infinito) ·
  supertécnicas Nv.2 (500) y Nv.3 (1500), +8 de potencia por nivel en los modos con tu colección (no en las Carreras); al Nv.3, evolución (3000) si tiene `GAME.evo` ·
  Álbum: 58 equipos, completo = 300 🪙 + 5 🎟️; comprar el que falta: común 400, rara 1500, épica 5000, legendaria 15000.
- Test nuevo `test/shop.js`. `test/clubs.js`, `career.js`, `pcareer.js` actualizados a 12/12/12.
- Novedades 0.35.0 reescritas (sin spoilers).
- MÁS ADELANTE: objetos para partidas (vida extra, volver a tirar, ventaja), modo «Eventos con requisitos», nombres oficiales de técnicas (rama `nombres-oficiales`).
- **Beta**: se construye con `BETA_OUT=<ruta> python3 build.py` (pone BETA, Halloween forzado y apiKey vacía ANTES de comprimir; si se cambia después, el bloqueo de copias salta).
- **Personalizar jugador creado (Carrera Jugador)**: `pd.look = { hair, skin, boots, num }` (colores de `PC_HAIR/PC_SKIN/PC_BOOTS` en `pcareer.js`), gratis al crearlo; luego `PC.setLook` cobra `PC_LOOK_COST` (cara 800, pelo 300, piel 300, botas 200, dorsal 200). Pantalla `renderPCLook` (botón ✂️ en la Carrera Jugador y pestaña «✂️ Tu jugador» de la Tienda).
  Dibujo en `media.js`: `analyzeRow` busca pelo/piel por colores en cada fila del muñeco; botas = 2 filas de abajo; dorsal en los fotogramas de espaldas 17, 18 y 36–39 (`paintNum`, color que contrasta con la equipación); cara con relleno por tono (`faceLook`). Test `test/pclook.js`.

### v0.35 · Evento «Sobre Selva» (23 oct, tarde) — en la beta
- `src/selva.js` (en `build.py` tras `shop.js`): del **25 al 28 de octubre** (`SV_START/SV_END`; en la beta siempre, va con `Halloween.forced`).
  Gacha con tickets (1 por tirada): épicos de equipos de diseños raros (`SV_TEAMS`: Mar de Árboles, Occult, aliens, demonios, Ogro, Royal Redux…), comunes y raros de esos equipos + los del sobre de Villanos (banner 3) + 6 legendarios de evento (ids 997001–997006, `selva: true`, `hwBase` = el original):
  Joseph King (Royal Redux, POR 96), Harry Boufante (DEF 95), Chase Faithfull (MED 95), Karl Kappa (DEL 96) y de relleno Garjan Cypress y Scaber Enoki (89).
  Legendario 3 %: los 4 top se reparten el 1 % y los 2 de relleno el 2 % (Fran: «los peores tienen un 1 % más»). Asegurado a las 50 (`Profile.data.sv.pity`).
  Diseño «selva y oro»: `pd.look` con pelo verde u oro y botas doradas; colores exactos del pelo elegidos a mano (`hs` muñeco, `hf` cara). Marco `.sv` (madera, oro y 🍃).
  6 técnicas nuevas 30901–30906 (nombres pensados para que `techfx.js` use animaciones de hojarasca, ciclón, remolino, tsunami, remolino y Tarzán). King, Cypress y Enoki pasan a Bosque (Fran). Marco .sv verde, madera y oro con 🍃 y 🌿 (brilla en el gacha).
  No salen en el gacha normal, sobres de la tienda, álbum ni Infinito (filtros `!p.selva`). **No va en Novedades** (es evento). Test `test/selva.js`.
- Velocidad: con el balón se esprinta ×1,30 (antes ×1,38) y ×0,92 al llevarlo; la IA rival (equipo B) corre ×1,05 cuando defiende (`speedOf` en `logic.js`).

### Mini parches publicados en `main` el 23 oct (y metidos también en `mundial-pro`)
- 0.31.11 · Ajustes → Controles → «Colocar los botones a tu gusto» (`padEditor` en `app.js`, `settings.padLayout`, `Pad.applyLayout` en `view.js`).
- 0.31.12 · Velocidad (con el balón se esprinta ×1,30; la IA rival ×1,05 defendiendo).
- Fantasma (sin nota) · Nube con menos gasto: `push` hace **una escritura sin leer antes** (las reglas solo aceptan rev + 1; si se rechaza, se lee y se compara;
  si la versión de la nube es de este mismo dispositivo —campo `dev`— se sube encima). Subidas como mucho cada **10 min** (`PUSH_DELAY`), al salir de la app
  y al acabar un partido solo si la última fue hace más de 10 min (`Cloud.flushOld`). Test `cloud.js` escenarios 25 y 26.
- Ojo: `tools/minify/node_modules` desaparece al cambiar de rama; si `build.py` avisa «sin comprimir», reinstalar terser antes de subir.
- 23 oct · Infinito: las versiones especiales desaparecían al recargar (la migración `idmap` de `Profile.load` las cambiaba por el jugador normal). Arreglado: el bucle se salta `PLAYER(o).inf`. Test `test/infkeep.js`.
- 23 oct · Marco ∞ del Infinito con fondo de galaxia (`juego/ui/galaxia.png`, clase `.inf` en `shell.html`).
- 23 oct · Códigos (en `GIFT_CODES`, `run.js`; admiten `player` por nombre o id, `pick: {inf, n}` y `uses`): `INFINITO10` (elige 1 de 10 versiones del Infinito con las probabilidades del gacha, 2 usos),
  `KANEINFINITO` 31223, `LEANINFINITO` 1457, `TORCHINFINITO` 31774, `MERCURYINFINITO` 1415, `AGENTEMINFINITO` 21487, `NAKATAINFINITO` 31278 (uno por persona). Fran: Torch y Kane, las del Inazuma 3.
- 23 oct · Abuso «tiro al portero y recupero» (formación 0-0-4): el portero de la IA solo pasa si hay pase seguro (compañero libre ≥ 4,5 m y sin rivales en la línea); si no, despeja en largo a un lado (x 0,18–0,35);
  los rechaces de las paradas salen a un lado; la IA carga el tiro 0,55–0,85. Simulaciones: robos tras el saque 16 % → 7 %, rechaces recuperados 16 % → 10 %, ~4 goles por partido.
- 23 oct · Icono para añadir la web a la pantalla de inicio (iPhone y Android): `juego/ui/apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `juego/manifest.json` y metas en `shell.html`.

### v0.35 · 24 oct (madrugada) — en `mundial-pro` y en la beta, sin subir
- **Supertécnicas de varios jugadores** (idea de Fran; respuestas: 1.a compañeros más cercanos, 2.b bonus si están los que la saben, 3. «lo que mejor quede»):
  `crewSize(t)` y `CREW_RULES` arriba de `logic.js`: solo técnicas de **tiro**; 2 ayudantes (triángulo, triple, trillizo, Pingüino emperador n.º 2/3, múltiple) o 1 (doble, dual, gemelo, combinado, cruzado, «en V»).
  Solo se ve (`TechFX.crewStart/crewFX` en `techfx.js`): los compañeros más cercanos (no el portero) aparecen con destello junto al que tira (±2,4 m y 1,5 m detrás; con 1, a 2,2 m de su lado),
  saltan con él en postura de tiro, líneas de energía / triángulo (morado en el Triángulo letal) y al chutar vuelven corriendo a su sitio con estela (0,55 s). En la lógica nadie se mueve.
  **+5 %** (`CREW_BONUS`, `comboOf` en `logic.js`): si hay en el campo de su equipo tantos compañeros que **tienen equipada** la misma técnica (por nombre) como ayudantes hacen falta; aviso «¡Combinación perfecta! Potencia +5 %» y aro dorado. Vale también para la IA.
  Línea en Novedades 0.35. Test `test/crew.js`. 
- **Arreglo Carrera Jugador**: el despeje del portero (`clearance`) y el «vuelves a un jugador de campo» cambiaban el control aunque `settings.lockId` (llevas siempre al tuyo). Ahora no. `test/solo.js` (umbral de toques bajado a ≥ 6) y `test/careertechs.js` (era inestable) arreglados.
- **Nombres oficiales de técnicas** (`tools/tech_oficial.py`, se puede repetir): +15 (buscando el nombre inglés en inazuma.fandom.com/es y comprobando en la lista de guiasnintendo.com) y +8 que buscó Fran:
  Fuego total, Remate celestial, Torbellino de fuego (Fireball Screw), Remate gafas, Full goleador, Ignición, Cúpula sónica, Gran sabio, Espada defensora, Dientes de roca, Placaje extremo, Engaño yoyó,
  Golpes de luz, Rechace de fuego, El olvido, Círculo de espadas, Tiro torre Eiffel, Mangual letal, Lluvia oscura, Descenso estelar, Baraja fugaz, Voltaje dual, Martillo defensor.
  La técnica inventada de Axel/Rosfire (30480) pasa a **«Vórtice de fuego»** (añadida a la regla `tornadoF` de `techfx.js`). Storm Rider y Shoot Trap se quedan con su nombre (Fran).
- `check.js` lo deja `build.py` en la carpeta: está en `.git/info/exclude` (no se sube).

### 0.31.13 · Botón «Franmen está en directo» (24 oct, publicado en `main` y metido en `mundial-pro`)
- `Live` en `app.js` (antes de `renderMenu`): pregunta a DecAPI `https://decapi.me/twitch/uptime/franmen_` (sin claves; en directo devuelve «1 hour, 5 minutes», si no «franmen_ is offline»)
  al abrir el menú (como mucho cada ~3 min) y cada 3 min. Si está en directo pinta en `#liveSlot` (arriba del menú) un botón morado con punto rojo que abre twitch.tv/franmen_. Si DecAPI falla, no sale nada.
  Fran eligió automático (no interruptor manual). Sin probar aún con un directo de verdad (probado simulando la respuesta): si no sale estando en directo, mirar CORS de DecAPI.

### v0.35 · Porteros contra «atraer al portero y pase atrás» (24 oct, mediodía; en `mundial-pro` y beta)
- `gkAI` (`logic.js`): si el que lleva el balón está en el área y hay otro atacante (no portero) a < 12 m, cerca del área (profundidad < 12) y con la línea de pase limpia,
  el portero solo sale a por él si lo tiene a < 2,2 m (antes, < 5 m siempre). Si el rival pasa cerca del área (balón suelto del rival a > 4 m/s), el portero vuelve esprintando
  (×1,15) a tapar la portería según a dónde va el balón. Simulación (`/tmp/claude-0/sim/pase.js`, no está en el repo): pase atrás desde el lateral 63–95 % de gol → 8–17 %; goles por partido igual (~3,2).
  Línea en Novedades 0.35 («🧤 Porteros más listos…»). Publicado en la web como **0.31.14** (24 oct, 16:25, «súbelo a la pública»); `main` ya está fusionado dentro de `mundial-pro`, así que publicar la 0.35 es un merge directo.
- `test/solo.js` a veces falla en «los goles se reparten entre sus jugadores»: los goles de rechace (sin `ball.shot`) no se apuntan a nadie. Ya pasaba antes; no es de este cambio.

### v0.35 · Clubes de pago en «Elegir un club» (24 oct, 18:50; en `mundial-pro` y beta)
- Modo Carrera (mánager) → Nueva carrera → 🏟️ Elegir un club: cada club se compra una vez con monedas y queda para siempre (`Shop.ownsClub/buyClub/clubPrice`, clave `club:<equipo>` en `P.shop.own`).
  Precio por la media de la plantilla (`SHOP.clubs`): ≥86 15000 (Raimon) · ≥82 10000 · ≥78 6000 · ≥75 3000 · ≥71 1500 · ≥66 800 · resto 300. Crear tu club sigue gratis. Carrera Jugador no cambia.
  El botón de abajo pasa a «🔓 Comprar X · N 🪙» si no es tuyo. Test en `test/shop.js`. Nota 0.35 actualizada; arreglado el texto «Segunda y Tercera, 10» → «Las 3 divisiones tienen 12 equipos».

### v0.35 · Código SELVALEYENDA (24 oct, 20:20; en `mundial-pro` y beta)
- `GIFT_CODES.SELVALEYENDA` = `pick: { selva: true }`: elige 1 de 3 de los 6 legendarios del evento Selva (al azar, sin repetir). Una vez por persona. Para dar cuando salga la 0.35. Test en `test/selva.js`.

### v0.35 · Código INAZUMA035 (24 oct, 23:59; en `mundial-pro` y beta)
- 20 tickets + **2** «elige 1 de 3» (`picks: 2`): cada opción 1 % legendario de evento (Halloween o Selva), 2 % legendario normal y el resto jugadores no legendarios de media ≥ 80
  (`pick: { min: 80, mix: { evt: 1, leg: 2 } }` en `giftPickOptions`). Fran pidió +85, pero ningún no legendario llega a 85 (máx. 83): se puso +80. Test en `test/selva.js`.

### Kit de stream «Franmen» (fuera del juego; archivos en la conversación, no en el repo)
- Colores: azul noche #0e1028 / #08081a, magenta #ff3caa, cian #3ce6ff, violeta #8a4bff, amarillo #ffe65a; estilo pixel.
- Hecho: marco de cámara 1280×720 y 1920×1080, panel 760×640 para el hueco bajo la cámara (con QR del juego), avatar de Twitch 512, escenas de OBS (`franmen_escenas.html`)
  y **chat de Twitch propio 250×400** (`franmen_chat.html`: lee el chat sin cuenta por `wss://irc-ws.chat.twitch.tv`, `?canal=…`, `&borrar=60`, `&demo=1`; en OBS: Navegador, SIN «Archivo local», URL `file:///…/franmen_chat.html?canal=…`).
  Escena de Fran: 1920×1080, cámara arriba a la izquierda (~745×420), panel debajo, juego a la derecha.


## v0.37.0 · Menús de decisión (pedido de Fran, 27 oct 2026)

Como en el Inazuma Eleven de la DS: el tiempo se para y eliges. Ajuste **Ajustes → Partido → «Menús de decisión»** (`settings.decide`, por defecto Sí en la app; en `Logic` sin el ajuste todo se comporta como antes, así que los tests viejos no cambian).

- **Te sale un rival** (`decideOwner` en `logic.js`): si llevas el balón y un rival (no portero) está a menos de 2,1 m delante, sale el menú `regate`: Regatear (sin técnica), tus técnicas de regate y hasta 3 pases, cada uno con su probabilidad (`dribbleOdds` usa las mismas fórmulas que `updateDash`; `passOdds` cuenta rivales en la línea de pase y cerca del receptor). Tras elegir (2,8 s) o cancelar (2,2 s) no vuelve a salir enseguida (`s.menuCd`).
- **Tiro**: al pulsar (ya no hace falta mantener) con la portería a ≤ 24 m (`MENU_DIST`) sale `tiro`: Chutar, Chute con poder, **Vaselina** y las técnicas de tiro listas; con selector de puntería (izq./centro/der.). Más lejos chuta directamente. Los % de gol vienen de `saveChance` (la misma que usa `resolveSave`), así lo que ves es lo que pasa.
- **Vaselina** (`lob`): balón alto, tiro con `shot.lob`. `lobSave`: el portero en su línea la caza casi siempre (~95 %); cada metro que se adelante baja un 30 %. Medido en `test/decide.js`: ~3 % de gol con el portero en la línea y ~67 % con el portero 2,4 m fuera.
- **Rayo (Técnica)**: abre `tecnica` con tus técnicas (con balón: tiro y regate; sin balón: bloqueo si el rival con balón está a ≤ 4,5 m). El bloqueo de tiro «¡Bloquéalo!» sigue funcionando con un toque como antes.
- **Balón parado** (`s.hold`, puesto en `restart`): si sacas tú (falta, córner, banda, tiro libre) no te mueves; Pase → lista de compañeros con probabilidad; Tiro → opciones de chute si la portería está cerca (a ≤ 24 m; si no, chuta directo; en saque de banda no se puede chutar). A los 14 s sin hacer nada pasa solo. **Penalti propio**: Pase no hace nada; Tiro abre las opciones (el reloj no corre mientras eliges).
- **Interfaz** (`UI.menuSync` en `view.js`, `#menu` en `shell.html`): panel con botones grandes y el % en verde/amarillo/rojo. Se maneja con toque, teclas 1-9 (↑↓ Intro, ←→ puntería, Retroceso = volver) o mando (cruceta, A, B). El botón Tiro del móvil pone «elegir» en vez de «mantener».
- `pass()` admite un 6.º parámetro (receptor forzado). `Logic.chooseMenu(s, i)` / `setMenuAim(s, v)`; `i = null` cancela.
- Tests: `node test/decide.js` (nuevo) y `node test/i18n.js`. `solo.js` y `sig_methods.js` fallan igual en el código original (ya estaba anotado).
- Pendiente: probarlo en el navegador con Phaser real (aquí se probó el panel con un arnés sin Phaser) y ajustar a gusto: distancia a la que salta el menú del regate (2,1 m), % de la vaselina y pausas entre menús.
