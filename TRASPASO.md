# TRASPASO · Inazuma Rogue (para continuar en otra cuenta de Claude)

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
- **Cada actualización**: dejar a Fran este `TRASPASO.md` actualizado + un zip pequeño con el código (sin sprites ni música).

## 3. Rama `halloween` (v0.31.1) — PENDIENTE DE APROBAR
- Commits sobre `main` (3512e6e): arreglos de la nube traídos de la 0.34 y el evento de Halloween.
- Si solo tienes el zip: copia `src/`, `test/`, `tools/`, `build.py`, `README.md` y `TRASPASO.md` encima del repo (rama `main`), ejecuta `python3 build.py` y listo
  (`juego/gamedata.json` no cambia; imágenes nuevas: `juego/ui/raydark.png` y `juego/sprites/fhw.png`, incluidas en el zip).
- Cuando Fran apruebe: `git checkout main && git merge halloween && git push` (GitHub Pages se actualiza solo). **Fecha: 22 oct 2026.**
- Artefacto de prueba (privado, cuenta de Fran actual): «Inazuma Rogue Beta». Ahí las **cuentas en la nube están desactivadas**
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

### v0.31.4 · Halloween: premios por entrar (5 días)
- Respuestas de Fran: cuentan **cualquier día que entres** (no hace falta que sean seguidos), **además** del regalo diario de 20 🍬, y el día 4 sale de **todo el juego**.
- Día 1: 150 🍬 · día 2: 10 tickets · día 3: 1000 monedas · día 4: elige 1 de 3 jugadores de media +80 (las 3 opciones se guardan) · día 5: Jim (Oscuro), id 21583.
- `Halloween.LOGIN`, `login()`, `loginReady()`, `pickOptions()`, `claimLogin()`, `give()` en `src/event.js`; sección «Premios por entrar» y `renderHwPick` en `src/app.js`. Pruebas en `test/halloween.js` (apartado 8).

### PENDIENTE (pedido de Fran el 21 oct, a medias: se paró para mirar la nube)
1. **Sprites con colores distintos a la foto** (p. ej. Partinus: muñeco con pelo marrón, foto azul claro). Diagnóstico hecho:
   ~200-300 jugadores (sobre todo hojas `c118`–`c136`, Inazuma 3) tienen el muñeco de otro jugador cercano o colores cambiados.
   Script de análisis: compara el color del pelo del sprite (`cNN.png`, fila r, zona 16-32 x 16-23) con el de la foto (`fNN.png`, zona 16-48 x 1-10).
   Idea propuesta: recolorear automáticamente el pelo del muñeco con los colores de su foto y enseñar a Fran un antes/después. **Falta preguntarle.**
2. **Roguelite**: el partido se acaba al llegar a 5 goles de diferencia.
3. **Recompensas de técnicas tras cada partido** (roguelite, `run.js` ~línea 505): que salgan sobre todo de la posición del jugador (un portero no debe recibir una de tiro).
4. **Guía de controles** explicándolos (móvil, PC y mando).
5. ~~Halloween: recompensas por iniciar sesión~~ **hecho en la 0.31.4**: día 1 150 🍬 · día 2 10 tickets · día 3 1000 de oro · día 4 elegir 1 de 3 jugadores aleatorios de +80 de media · día 5 Jim (Oscuro) (id 21583) regalado.
   Preguntas pendientes para Fran: ¿días seguidos o cualquier día?, ¿además del regalo diario de 20 🍬?, ¿de qué jugadores sale la elección de +80?
   Va en la versión publicada (el evento empieza el 22).

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
- 0.32–0.34 (en espera, rama `carrera-jugador`): Modo Carrera Jugador, Liga Pro, fichajes, logros, Balón de Oro, 1v1, decisiones, galería de técnicas, botón dev.

## 7. Siguientes pasos
1. Plan de Fran: el 21 sube el teaser a TikTok; el **22 de octubre** Claude fusiona `halloween` a `main` y lo sube (hay un aviso programado en la conversación para las 00:10 del 22), y Fran sube el tráiler largo.
2. Después: retomar la rama `carrera-jugador` (0.34). Al fusionarla habrá que juntar con la 0.31.1: `build.py` (añadir `event.js`),
   `VERSION`, `MANAGERS`/`RAY_DARK`, el menú y `cloud.js` (ya es el mismo). Su TRASPASO detallado está en esa rama.
3. Siguiente versión: **el Mundial en la Liga Pro** (Carrera Jugador).
4. La semana siguiente: **PvP en tiempo real** como prueba en el modo dev (WebRTC, el anfitrión simula, gratis, código de sala).
