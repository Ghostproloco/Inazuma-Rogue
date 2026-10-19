/* =====================================================================
   SPRITES: las hojas se cargan solo cuando hacen falta
   ===================================================================== */
const Sprites = (() => {
  const cache = {};
  const img = file => cache[file] || (cache[file] = new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => { delete cache[file]; rej(new Error('No se pudo cargar ' + file)); };
    i.src = 'sprites/' + file + (file.includes('?') ? '' : '?v=4');   // ?v=3: hojas actualizadas (Inazuma 2)
  }));
  const collFile = pd => 'c' + String(pd.cs[0]).padStart(2, '0') + '.png';
  const refOf = pd => ({ file: collFile(pd), row: pd.cs[1] });
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
  const KIT_A = [[213, 180, 16], [164, 131, 16]], KIT_B = [[57, 82, 123], [74, 131, 172], [57, 131, 197], [65, 65, 139], [57, 82, 139], [74, 106, 189], [41, 98, 123]];
  function kitMap(kit) {
    const m = new Map(), A = hex(kit.a), B = hex(kit.b);
    const put = (src, tgt, ref) => src.forEach(s => {
      const k = lum(s) / ref, o = tgt.map(v => Math.max(0, Math.min(255, Math.round(v * k + (k > 1 ? (k - 1) * 60 : 0)))));
      m.set((s[0] << 16) | (s[1] << 8) | s[2], o);
    });
    put(KIT_A, A, lum(KIT_A[0])); put(KIT_B, B, lum([57, 131, 197]));
    return m;
  }
  function recolor(g, w, y0, kit) {
    const map = kitMap(kit), y = y0 + 20, h = 28, d = g.getImageData(0, y, w, h), p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      if (!p[i + 3]) continue;
      const o = map.get((p[i] << 16) | (p[i + 1] << 8) | p[i + 2]);
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
    const file = ref.file.replace(/^c/, 'f').replace(/^r/, 'q') + '?v=4';   // ?v=3: caras actualizadas, evita la copia vieja guardada
    img(file).then(i => c.getContext('2d').drawImage(i, 0, ref.row * 64, 64, 64, 0, 0, 64, 64)).catch(() => {});
    return c;
  }
  const crest = id => `<img class="crest" src="ui/crest${id || 1}.png" alt="" width="40" height="40">`;
  return { img, collFile, refOf, portrait, face, crest, matchSheet, kitPreview };
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
const TRACK_GROUPS = ['Inicio', 'Partidos · Inazuma Eleven', 'Partidos · Inazuma Eleven 2', 'Rivales · Inazuma Eleven 2', 'Historia · Inazuma Eleven 2', 'Lugares · Inazuma Eleven 2', 'Jingles'];
const TRACKS = {};
[
  ['Inicio', [
    ['title', 'Título · Inazuma Eleven', [0, 0]], ['title2', 'Título · Inazuma Eleven 2', [0, 0]],
    ['op00', 'Opening · Inazuma Eleven', null], ['op2', 'Opening · Inazuma Eleven 2', null], ['bg_end', 'Ending · Inazuma Eleven', null]]],
  ['Partidos · Inazuma Eleven', [
    ['m01', 'Partido 1', [3.5, 68.32]], ['m02', 'Partido 2', [0, 65.93]], ['m03', 'Partido 3', [5.05, 79.07]], ['m04', 'Partido 4', [4.29, 70.71]], ['m05', 'Partido 5', [0.28, 67.57]],
    ['p07', 'Ritmo rápido', [0, 50.37]], ['pb01', 'Contraataque - ¡Al rojo vivo!', [6.48, 77.59]], ['p01', 'Tema épico', [20.79, 93.93]],
    ['e01', 'Tensión', [0, 33.68]], ['d01', 'El centro de entrenamiento Osakaland', [0, 79.32]]]],
  ['Partidos · Inazuma Eleven 2', [
    ['p10', 'El poder del Raimon', [1.55, 76.9]], ['p11', 'Ataque relámpago', [9.93, 72.83]], ['p05', 'Cruzada gloriosa', [6.1, 94.58]],
    ['p06', 'Centro de entrenamiento', [6.77, 66.77]], ['p15', 'Tema de partido (P15)', [1.66, 93.1]]]],
  ['Rivales · Inazuma Eleven 2', [
    ['p04', 'Atronadora Royal Academy', [0, 76.6]], ['e07', 'Royal Academy', [0.25, 65.81]], ['p16', 'R. A. Redux - Supertécnicas milagrosas', [0, 84.48]],
    ['p12', 'Emperadores Oscuros - El campo del trueno', [1.45, 73.21]], ['e204', 'La sombra negra - Tema de Ray Dark', [0, 58.29]],
    ['p17', 'Géminis - El balón negro', [3.69, 62.77]], ['p18', 'Épsilon - Ira infernal', [14.64, 86.43]], ['p19', 'Génesis - El equipo G', [6, 81]],
    ['e211', 'Génesis - Los superhumanos', [7.3, 87.92]], ['e210', 'El poder de la Academia Alius', [12.8, 93.87]]]],
  ['Historia · Inazuma Eleven 2', [
    ['e201', 'Los sueños del Raimon', [0.09, 79]], ['e01b', 'El club de fútbol', [0, 50.53]], ['e205', '¡Vamos allá!', [0.23, 37.73]], ['e208', 'Alma de luchador', [0, 81.25]],
    ['e206', 'La amenaza del trueno', [4, 73.33]], ['e03', 'La última batalla', [0.23, 29.77]], ['e05', 'Terreno sagrado', [0.21, 73.73]], ['e202', 'Su Majestad', [0, 61.97]],
    ['e209', 'Tiempos difíciles', [0, 96.77]], ['e207', 'Sueños rotos', [0, 86.81]], ['e203', 'Axel y Julia - Un final feliz', [0, 89.46]],
    ['e212', 'El astro del balón - Versión para piano', [0, 56.49]], ['s201', 'El óvalo - Estadio', [0, 32]]]],
  ['Lugares · Inazuma Eleven 2', [
    ['m201', 'La Caravana Inazuma', [8.64, 79.55]], ['m205', 'La ciudad de Inazuma', [12, 71.52]], ['m206', 'Zona residencial - Una promesa solemne', [4.88, 74.59]],
    ['m207', '¡Hacia el infinito!', [9.7, 104.21]], ['m208', 'Hokkaido - Paraíso nevado', [0, 55.27]], ['m213', 'Okinawa - Fútbol bajo el sol', [6, 84]],
    ['m214', 'Osakaland', [12.41, 105.52]], ['m216', 'Royal Academy - Versión del juego', [0, 62.5]], ['m217', 'El bosque del monte Fuji', [0, 89.14]],
    ['m218', 'La base de la Academia Alius', [4.8, 76.8]]]],
  ['Jingles', [['j13', 'Gol', null], ['j01', 'Victoria', null], ['j07', 'Derrota', null]]],
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
