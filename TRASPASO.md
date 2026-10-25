# TRASPASO · Inazuma Gold (para continuar en otra cuenta de Claude)

> Pásale a Claude este archivo + `inazuma-rogue-codigo.zip` y dile: «Lee TRASPASO.md y sigue con el proyecto».
> Si tiene GitHub conectado, mejor aún: que clone `franmndezzzz/inazuma-rogue` (ahí está todo, sprites y música incluidos).

## 1. Qué es
Fan game gratuito de **Inazuma Eleven** para navegador (Phaser 3.80.1): fútbol 5 contra 5 en tiempo real, roguelite, gacha,
modo Carrera (mánager) y Mundial. Pensado sobre todo para **móvil en vertical**.

- Juego publicado: https://franmndezzzz.github.io/Inazuma-Rogue/juego/
- Repositorio: `franmndezzzz/inazuma-rogue` (**debe seguir PRIVADO**: `juego/` lleva recursos de los juegos originales).
- En `main` (publicada) está la **0.31.0**.
- Hay **dos ramas sin subir** (ninguna está en GitHub todavía):
  - `halloween` → **v0.31.1 · Evento de Halloween** (publicada el 21 oct; luego 0.31.2 con el arreglo de controles, ver abajo) (sobre la 0.31). Es la que se publica primero (22 de octubre de 2026).
  - `carrera-jugador` → v0.32–0.34 (Modo Carrera Jugador, Liga Pro, logros…). **En espera**; ver sección 7.

## 2. Cómo trabajamos (preferencias de Fran)
- Claude escribe el código; Fran prueba y da feedback.
- Explicaciones **en español**, sencillas y paso a paso.
- Proponer alternativas en vez de inventar decisiones de diseño. Preguntas en tandas de **máx. 3**, con opciones.
- Plan por fases antes de construir algo grande.
- **Cada actualización**: primero se sube como **artefacto privado** de prueba en Claude; solo cuando Fran lo aprueba se fusiona a `main` y se sube a GitHub.
- **Modo desarrollador solo en la beta** (22 oct, sin cambio de versión ni nota): `const BETA = false` en `app.js`; al publicar la beta se cambia a `true`
  (igual que `forced: true` de Halloween). En la web pública los 20 toques no hacen nada y a quien lo tuviera encendido se le apaga solo (dev, debug, hwForce, devWin, speed).
- **Novedades del juego (`NEWS` en `app.js`): NUNCA poner spoilers** — nada de eventos (Halloween…), legendarios, premios, códigos de regalo ni sorpresas. Solo mejoras y arreglos (controles, nube, ajustes…). Lo pidió Fran el 22 oct.
- **Cada actualización**: dejar a Fran este `TRASPASO.md` actualizado + un zip pequeño con el código (sin sprites ni música).

## 3. Rama `halloween` (v0.31.1) — PENDIENTE DE APROBAR
- Commits sobre `main` (3512e6e): arreglos de la nube traídos de la 0.34 y el evento de Halloween.
- Si solo tienes el zip: copia `src/`, `test/`, `tools/`, `build.py`, `README.md` y `TRASPASO.md` encima del repo (rama `main`), ejecuta `python3 build.py` y listo
  (`juego/gamedata.json` no cambia; imágenes nuevas: `juego/ui/raydark.png` y `juego/sprites/fhw.png`, incluidas en el zip).
- Cuando Fran apruebe: `git checkout main && git merge halloween && git push` (GitHub Pages se actualiza solo). **Fecha: 22 oct 2026.**
- Artefacto de prueba (privado, cuenta de Fran actual): «Inazuma Gold Beta». Ahí las **cuentas en la nube están desactivadas**
  (los artefactos no pueden cargar Firebase). Para publicarlo se quita el `<!doctype html>` y se vacía `apiKey`.

### Evento de Halloween (encargo de Fran) — `src/event.js`
**Alcance: solo fuera de los modos.** No se toca el roguelite, la Carrera mánager por dentro (salvo la pasiva de Ray Dark), ni el Mundial.

| Decisión | Respuesta de Fran |
|---|---|
| Fechas | Activo solo del **22 oct al 3 nov (incluidos)** (Fran lo adelantó del 23 al 22), por la fecha del dispositivo (`HW_START`, `HW_END`). Fuera de fechas no se ve nada |
| Base | Solo sobre la 0.31 (no la 0.34) |
| Legendarios exclusivos | Los 5: **Johan Tassman, Nathan Jones** (Ocultismo) y **Destra, Hebimos, Bash Lancer** (demonios) |
| Sobre Calabaza | **15 🍬** por tirada (**150** la ×10) · legendario 3 % · épica 15 % · rara 32 % · común 50 % · legendario asegurado a las **40** |
| Caramelos 🍬 | +5 por partido en cualquier modo (+10 más si ganas; rendirse no da) · +20 regalo diario · +60 al ganar al jefe (1 vez al día) · retos |
| Logros | **3 retos dentro de la pantalla del evento** (la 0.31 no tiene sistema de logros) |
| Equipación | No. En su lugar: al completar los 3 retos, **Ray Dark** se puede elegir como mánager en el Modo Carrera, con **+10 % de ingresos** |
| Nube | Sí, incluir los arreglos de la 0.34 |

Cómo está hecho:
- **Legendarios** (ids 996001–996005): copias de los originales (30037, 36, 32025, 32018, 32001) con el mismo aspecto, rareza legendaria y
  estadísticas escaladas a ~93 de media; Johan Tassman con Tiro fantasma. `gacha: false` y `halloween: true` → no salen en el gacha normal.
  Se registran **siempre** (también fuera de fechas), así que quien los consiga los conserva. En las cartas salen con 🎃; en la ficha, «(Halloween)».
  **Retratos de miedo** (pedido de Fran): color apagado y caracterización — Tassman fantasma, Nathan Jones con la máscara ensangrentada,
  Destra con maquillaje de zombi, Hebimos con cicatrices, Bash Lancer vampiro. Están en `juego/sprites/fhw.png` (una fila de 64 px por jugador),
  generados con `python3 tools/hw_faces.py`; el jugador lleva `hwFace` y `Sprites.refOf/face` usan esa hoja solo para el retrato (en el partido, sprite normal).
- **Bote del Sobre Calabaza** (`Halloween.pool()`): los 5 legendarios + jugadores con sprite del gacha «Villanos» (banner 3) y del Ocultismo
  (66 épicas, 131 raras, 534 comunes). Usa la máquina de gachapón normal en naranja y morado con el escudo del Ocultismo (`HW_BANNER = 66`).
- **Partido jefe**: Ocultismo con **media 85** y Johan Tassman con **93** (como su legendario): `rivalTeam` acepta ahora un factor por jugador (`HW_BOSS_AVG`, `HW_BOSS_STAR`), en el campo nuevo `niebla` (`view.js`: noche con velo morado,
  chispas naranjas y niebla que se mece). Modo `api.mode = 'hwboss'`; pantalla final `renderBossEnd`.
- **Retos** (`Halloween.RETOS`): Exorcista (ganar al jefe) · Truco o trato (20 tiradas) · Coleccionista de sustos (un legendario de Halloween).
  Premios en caramelos y tickets. Al recoger los 3 → `Profile.data.hw.ray = true`.
- **Ray Dark** (`RAY_DARK = 996100`, en `career.js`): solo existe como mánager (no está en `GAME.players`). No está en las hojas de sprites: su
  retrato (64×64, del juego, lo pasó Fran) es `juego/ui/raydark.png` (`faceImg`, `mgrFace` en `app.js`). **Va en el zip.** `Career.incomeMul()` = 1.1 con él: patrocinio,
  taquilla, premios de liga/Copa y del Mundial. Se queda para siempre una vez desbloqueado.
- **Estado** en el perfil: `Profile.data.hw = { candy, pulls, pity, daily, boss, bossWins, matches, retos, legends, ray }` (va a la nube con el perfil).
- **Menú**: botón 🎃 Halloween con punto naranja si hay regalo o reto por recoger; ambiente con borde naranja, panel morado, calabazas y niebla suave (sin murciélagos, pedido de Fran) (CSS `.hwtheme`, `.hwfx`).
- **Modo desarrollador** (20 toques en la versión) → sección Halloween: forzar el evento fuera de fechas (`settings.hwForce`), +300 caramelos, completar retos, reiniciar el evento.
- Pruebas: `test/halloween.js` (fechas, caramelos, bote y probabilidades en 3000 tiradas, garantía de 40, jefe, retos, +10 % de Ray Dark).
  Recorrido en el navegador (ES y EN) sin errores: menú, evento, tirada ×10, partido jefe, retos, Ray Dark en la Carrera.

### v0.31.2 · Controles (publicada el 21 oct)
- Código PESCADINHA: el Kappa de Papi Gavi baja a media 85 (estaba a 99).
- **Fallo del móvil «no chuta y no pasa»**: las pulsaciones se perdían si caían cuando tu jugador no podía actuar (al recibir, tras una entrada,
  en el congelado de un golpe) o si el toque de Tiro duraba menos que un fotograma. Arreglo: búfer de entrada de 0,25 s (`bufferInput` en `src/logic.js`)
  y acción `shoot` al pulsar Tiro; los botones táctiles no cambian mientras tienes el dedo encima (`src/view.js`). Prueba: `test/input.js`.
- **Teclas de PC**: WASD o flechas · Shift esprint · J/Z pase-entrada · K/X tiro (mantén) - cambiar jugador · L/C profundidad - saque largo ·
  I/V regate · Espacio supertécnica · E cambiar técnica · P/Esc pausa.
- **Aviso del mando** en PC: en el menú y en los 3 primeros partidos.

### v0.31.3 · Nube: «Error al guardar en la nube (resource-exhausted)»
- No era un fallo del juego: es la **cuota gratuita diaria de Firebase agotada** (plan Spark: ~20.000 escrituras/día para todos los jugadores).
  El juego subía la partida 3 s después de cada cambio (cientos de subidas por sesión).
- Ahora (`src/cloud.js`): como mucho **una subida por minuto** mientras juegas (`PUSH_DELAY = 60000`, y un guardado nuevo ya no retrasa la subida pendiente),
  sube al salir o cambiar de app (`visibilitychange`, `pagehide`) y al cerrar sesión; **cambiar solo ajustes o sonido no gasta subidas**;
  si la cuota está agotada avisa «La nube está saturada… tu partida está a salvo» y reintenta a los 10, 30 y 60 min (`RETRY_QUOTA`).
- Escenarios nuevos 20–22 en `test/cloud.js`. Si aun así se queda corto, la solución es pasar Firebase al plan Blaze (de pago por uso, con alerta de gasto).

### v0.31.5 · Novedades y otro arreglo de controles
- **Controles**: pulsar Pase o Tiro justo antes de recibir hacía una **entrada** (el jugador aún no tenía el balón). Ahora, si el balón viene hacia ti
  (pase tuyo o suelto de tu equipo cerca), Pase/Tiro esperan a que lo recibas (`pr.keep`): pase o tiro al primer toque. Pase ya no hace entradas a un compañero.
  Pruebas 6–8 en `test/input.js` (fallan con el código de antes).
- **📰 Novedades**: botón en el menú (con punto si no las has visto) y se abren solas la primera vez tras actualizar (`settings.seenNews`).
  Las notas están en `NEWS` (`src/app.js`); **al sacar una versión nueva, añade su entrada arriba** (con traducción).

### v0.31.4 · Teclas del ordenador a elegir
- Ajustes → Controles → «Teclas del ordenador»: **Nuevas** (K tiro / cambiar, L profundidad, E técnica) o **Clásicas** (como hasta la 0.31.1: L tiro, K profundidad, Q cambiar, U técnica).
  Z X C V (con las flechas), Q, U y E valen en las dos. `settings.keys`, `SCHEMES` en `src/view.js`; la barra de teclas y el texto de Ajustes cambian según la elección.

### v0.31.4 · Halloween: premios por entrar (5 días)
- Respuestas de Fran: cuentan **cualquier día que entres** (no hace falta que sean seguidos), **además** del regalo diario de 20 🍬, y el día 4 sale de **todo el juego**.
- Día 1: 150 🍬 · día 2: 10 tickets · día 3: 1000 monedas · día 4: elige 1 de 3 jugadores de media +80 (las 3 opciones se guardan) · día 5: Jim (Oscuro), id 21583.
- `Halloween.LOGIN`, `login()`, `loginReady()`, `pickOptions()`, `claimLogin()`, `give()` en `src/event.js`; sección «Premios por entrar» y `renderHwPick` en `src/app.js`. Pruebas en `test/halloween.js` (apartado 8).

### Hecho el 21-22 oct (dentro de la v0.31.5, la que sale el 22 con Halloween)
1. **Muñecos del Inazuma 3 desfasados** (p. ej. Partinus con pelo marrón y foto azul claro). Causa real: en `c118.png` fila 7
   hay un muñeco de más, así que desde ahí hasta `c136` fila 9 **cada jugador tenía el muñeco del anterior** (291 jugadores).
   Se comprobó alineando el color del pelo de todas las fotos con todos los muñecos (un único desfase de +1).
   Arreglo: `tools/fix_sprite_shift.py` (ya ejecutado, **no volver a ejecutarlo**) sube una fila esos muñecos; el de `c136` fila 10
   (Destra, que se quedaba sin muñeco propio) se recoloreó con `tools/fix_sprite_hair.py --only 136,10`.
   El recoloreado general de `fix_sprite_hair.py` NO se aplicó: lo que queda fuera de ese rango son máscaras/cascos (falsos positivos).
   `src/media.js`: las hojas se piden con `?v=5` para que nadie vea la copia vieja.
2. **Roguelite**: el partido se acaba al llegar a 5 goles de diferencia (`settings.mercy = 5` solo en el modo `run`; `logic.js` `goal()`; aviso en `view.js`). Test: `test/mercy.js`.
3. **Técnicas tras cada partido según la posición** (`run.js` `ROLE_FIT` + `rollFitType`): POR solo parada; DEF 75 % bloqueo; MED regate/tiro/bloqueo; DEL 70 % tiro. Test: `test/rewards.js`.
4. **Guía de controles** (móvil / ordenador / mando) en Pausa y en Ajustes (`renderControlsGuide`).
5. **Halloween: premios por entrar 5 días** (0.31.4): 150 🍬 · 10 tickets · 1000 monedas · elegir 1 de 3 de +80 · Jim (Oscuro) id 21583. Cualquier día cuenta, además del regalo diario de 20 🍬; la elección sale de todo el juego.
6. Pantalla de **Novedades** con la lista de cambios (al añadir versión, poner su entrada arriba de `NEWS` en `app.js`).
7. **Supertécnicas con animación propia** (~70 técnicas, `src/techfx.js`): traídas de la rama 0.34 (commit 83dff4b) a la 0.31.5 por petición de Fran.
8. Revisión completa del código de Halloween antes de publicar: tests + recorridos en navegador (evento, premios de entrada, jefe, controles, teclas, novedades, guía) sin errores.

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
- Técnicas nuevas: **Torbellino de fuego** (30480, tiro fuego 110: Axel y Axel IE3) y **Leyenda del lobo** (30481, tiro viento 110: Shawn y Shawn IE3).
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

## 4. Cómo se construye y se prueba
- Todo el código está en `src/`. `python3 build.py` lo junta en `juego/index.html`
  (orden en esta rama: i18n, en, media, logic, run, career, **event**, cloud-config, cloud, view, techfx, app). Datos en `juego/gamedata.json`.
- Probar en local: `cd juego && python3 -m http.server 8000` → http://localhost:8000
- Pruebas automáticas (Node, sin dependencias): `for f in test/*.js; do node $f; done` (saltar `sig_methods.js`). Las 20 pasan en la v0.31.1.
- Textos: siempre en español dentro de `TX('…')` (huecos `{0}`) o `TXn(n,'singular','plural')`; traducción en `src/en.js`.
  `node tools/i18n_sync.js missing` lista los que faltan; `node tools/i18n_sync.js add archivo.txt` los añade (`"clave"|traducción`).
  Si creas un archivo nuevo en `src/`, añádelo a las listas de `tools/i18n_sync.js` y `test/i18n.js`.
- Tráiler vertical: `python3 tools/trailer.py es salida.mp4` (Playwright + ffmpeg; textos en `tools/trailer.js`).
  Teaser del día antes («Mañana… 22 OCT», ~10 s): `TRAILER_JS=tools/teaser_hw.js TRAILER_MUSIC=e204 TRAILER_SHOTS=<capturas> python3 tools/trailer.py es teaser.mp4`.
  Tráiler de Halloween (solo español, música «La sombra negra», el tema de Ray Dark):
  `TRAILER_JS=tools/trailer_hw.js TRAILER_MUSIC=e204 TRAILER_SHOTS=<capturas 1170×2532: 01_menu, 02_evento, 04_cartas, 05_jefe, 07_retos, 08_ray> python3 tools/trailer.py es salida.mp4`.

## 5. Cuentas y nube (Firebase) — ya configurado
- Proyecto Firebase `inazuma-rogue`. Datos públicos en `src/cloud-config.js` (son públicos por diseño; **nunca** compartir claves secretas/service account).
- Login con Google o usuario+contraseña (el usuario `fran` se guarda como `fran@jugadores.inazumarogue.app`).
- Firestore: documento `saves/{uid}` = `{username, rev, data|z, updatedAt}`. Reglas en `firestore.rules` (cada uno solo su documento, `rev` siempre +1).
- `src/cloud.js` (el de la 0.34) sube sola la partida 3 s después de cada guardado. Arreglos incluidos:
  conflictos solo si cambia el **progreso** (`PROGRESS_KEYS`); ajustes y sonido son de cada dispositivo; no se sube nada mientras se compara al arrancar (`syncing`);
  tras bajar la partida el móvil queda «congelado» (`frozen`) hasta recargar; reintentos automáticos (`RETRY`). `test/cloud.js` tiene 19 escenarios.
- Dominio autorizado en Firebase: `franmndezzzz.github.io`.

## 6. Historial resumido
- 0.2x: guardado en la nube con cuentas, pantalla para traer la partida del enlace antiguo.
- Carrera mánager pulida, joystick y botones mejores, notas de parche con código **MUNDIAL**.
- 0.31: traducción completa al inglés con selector de idioma; mini tráilers ES/EN.
- 0.31.1 (pendiente de aprobar, rama `halloween`): evento de Halloween + arreglos de la nube.
- 24 oct: evento de Navidad (`src/christmas.js`, botón 🎄 bajo el de Halloween), visible ya hasta el 6 ene; sin versión nueva todavía.
- 0.32–0.34 (en espera, rama `carrera-jugador`): Modo Carrera Jugador, Liga Pro, fichajes, logros, Balón de Oro, 1v1, decisiones, galería de técnicas, botón dev.

## 7. Siguientes pasos
1. Plan de Fran: el 21 sube el teaser a TikTok; el **22 de octubre** Claude fusiona `halloween` a `main` y lo sube (hay un aviso programado en la conversación para las 00:10 del 22), y Fran sube el tráiler largo.
2. Después: retomar la rama `carrera-jugador` (0.34). Al fusionarla habrá que juntar con la 0.31.1: `build.py` (añadir `event.js`),
   `VERSION`, `MANAGERS`/`RAY_DARK`, el menú y `cloud.js` (ya es el mismo). Su TRASPASO detallado está en esa rama.
3. Siguiente versión: **el Mundial en la Liga Pro** (Carrera Jugador).
4. Subir la Navidad a GitHub y publicarla (decidir versión y `NEWS`).
5. La semana siguiente: **PvP en tiempo real** como prueba en el modo dev (WebRTC, el anfitrión simula, gratis, código de sala).

## Jugadores de Inazuma Eleven GO (`src/go.js`)
- **Arion Sherwind** (998001, MED viento), **Victor Blade** (998002, MED bosque), **Riccardo Di Rigo** (998003, DEF montaña) y **Bai Long** (998004, DEL fuego): legendarios que no salen en gacha.
- Códigos de regalo (`GIFT_CODES` en `run.js`): `ARIONGOLD`, `VICTORGOLD`, `RICCARDOGOLD`, `BAILONGGOLD`.
- Retratos propios en `juego/sprites/fgo.png` (una fila de 64 px por jugador; la fila es `goFace`, igual que `fxm.png` en Navidad). `media.js` lo carga en `refOf`.
- Muñeco del partido **provisional**: copia el `cs` de otro jugador parecido (`sprite` en `GO_PLAYERS`). Para ponerles el suyo propio: añadir una fila a una hoja `cNN.png` y cambiar el `cs`.
- Estadísticas y técnicas (copiadas de un jugador de referencia, `ref`) se editan en `GO_PLAYERS`. Prueba: `node test/go.js`.
- `build.py` incluye `go.js` justo después de `christmas.js`.

---

## Gacha limitado de Bai Long (v0.31.13)

- `src/limited.js`: rareza **limitada** (`RARITY.limitada`), Bai Long (id 998004, media 100, empieza con todas sus stats: `startMul` en run.js) con **Dragón relámpago** (30490, tiro) y **Estela del dragón blanco** (30491, regate), marcadas `lim` para que no salgan como premio aleatorio.
- Sobre: 100 🎟️ = 10 jugadores. Bote de 10: Bai Long, Jang Cho, Jim Flareson, Clive Mooney, Changsu Choi, Umi Wang, Rick Hatter, Sol Crater, Lou Edmonds, Hugo Tallgeese. Probabilidades (se enseñan en pantalla): Limitada 0,3 % · Épica 12 % · Rara 32 % · Común 55,7 %. Sin garantías extra salvo Bai Long a las 200 tiradas (`LM_PITY`, `profile.lm`). `LM_END` = fecha de fin (null = sin fin).
- **Arion, Victor y Riccardo ya no existen**: `Profile.load` los quita de las colecciones guardadas. Bianchi Christmas sigue en el juego pero NO sale en este gacha ni con códigos (ahora no se puede conseguir: decidir dónde).
- Códigos ARIONGOLD, VICTORGOLD, RICCARDOGOLD, BAILONGGOLD y BIANCHINAVIDAD eliminados.
- **Economía de inicio:** perfil nuevo = 0 monedas + 100 de la tirada de bienvenida, 10 tickets. Los perfiles con exactamente 99999 monedas y 99999 tickets (valores de pruebas) pasan una sola vez a 100 / 10 (`econFix`).
- **Portada:** `juego/ui/portada.jpg` es la primera pantalla de la intro (en `startIntro`, `app.js`). Foto de Bai Long: `juego/ui/bailong.jpg`.
- **Aviso de jugador nuevo:** añade `{ id, v }` a `NEW_PLAYERS` (limited.js): al abrir el juego sale su pantalla una vez por dispositivo (`settings.seenPlayers`).
- `tools/i18n_sync.js` y `test/i18n.js` ahora incluyen christmas.js, go.js, dialog.js y limited.js.
- Tests: `node test/limited.js` y `node test/go.js`. `test/cloud.js` tenía ya una prueba intermitente antes de estos cambios.
- Pendiente: animación propia para las técnicas de Bai Long (ahora usan las de «dragón» y regate por nombre).

## Cinemática de supertécnica (partidos)

- `UI.cutin` (view.js) ahora tiene versión **grande** para tiros y paradas (no las paradas rápidas): fondo oscurecido (`#cineDim`), retrato de 128 px, rayos giratorios (`.ci-fx`) y nombre grande. Regates y bloqueos siguen con la franja pequeña.
- Las técnicas con `lim: true` (las de Bai Long) usan rayos azules y dorados (`.cutin.lim`).
- Probada en navegador (horizontal y vertical) lanzando `UI.cutin(...)` a mano; **falta verla dentro de un partido real** (Phaser no está en el sandbox).
- CSS al final de shell.html: «Cinemática de supertécnica».
