# TRASPASO · Inazuma Rogue (para continuar en otra cuenta de Claude)

> Pásale a Claude este archivo + `inazuma-rogue-codigo.zip` y dile: «Lee TRASPASO.md y sigue con el proyecto».
> Si tiene GitHub conectado, mejor aún: que clone `franmndezzzz/inazuma-rogue` (ahí está todo, sprites y música incluidos).

## 1. Qué es
Fan game gratuito de **Inazuma Eleven** para navegador (Phaser 3.80.1): fútbol 5 contra 5 en tiempo real, roguelite, gacha,
modo Carrera (mánager), Mundial y, desde la v0.32, **Modo Carrera Jugador**. Pensado sobre todo para **móvil en vertical**.

- Juego publicado: https://franmndezzzz.github.io/Inazuma-Rogue/juego/
- Repositorio: `franmndezzzz/inazuma-rogue` (**debe seguir PRIVADO**: `juego/` lleva recursos de los juegos originales).
- Versión actual: **0.34.0** (rama `carrera-jugador`, incluye la 0.32). En `main` (publicada) está la **0.31.0**.

## 2. Cómo trabajamos (preferencias de Fran)
- Claude escribe el código; Fran prueba y da feedback.
- Explicaciones **en español**, sencillas y paso a paso.
- Proponer alternativas en vez de inventar decisiones de diseño. Preguntas en tandas de **máx. 3**, con opciones.
- Plan por fases antes de construir algo grande.
- **Cada actualización**: primero se sube como **artefacto privado** de prueba en Claude; solo cuando Fran lo aprueba se fusiona a `main` y se sube a GitHub.
- **Cada actualización**: dejar a Fran este `TRASPASO.md` actualizado + un zip pequeño con el código (sin sprites ni música).

## 3. Estado de la rama `carrera-jugador` (v0.32 + v0.33) — PENDIENTE DE APROBAR
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

## 4. Cómo se construye y se prueba
- Todo el código está en `src/`. `python3 build.py` lo junta en `juego/index.html`
  (orden: i18n, en, media, logic, run, career, pcareer, ach, cloud-config, cloud, view, techfx, app). Datos en `juego/gamedata.json`.
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
