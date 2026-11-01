/* =====================================================================
   JUGADORES LIMITADOS: cada uno con su propio estilo visual
   - Aura en el campo (LimFX.aura): se dibuja con la API de Graphics de Phaser (view.js › drawLimited)
   - Escena de cámara al lanzar una supertécnica (LimFX.cine): capa 2D a pantalla completa con barras de cine,
     el jugador en pose de chute, su efecto propio y el nombre de la técnica
   Estilos:  hielo (Samford) · oro/cadenas (Da Silva) · esmeralda/tornado (Almeida) · tormenta/relámpagos (Trick) · estelar (Pase)
   ===================================================================== */
const LIM_STYLE = { 994001: 'hielo', 994002: 'oro', 994003: 'esmeralda', 994004: 'tormenta' };
const LIM_NAME = { hielo: TX('ESCARCHA ETERNA'), oro: TX('CADENAS DORADAS'), esmeralda: TX('TORNADO ESMERALDA'), tormenta: TX('TORMENTA ELÉCTRICA'), estelar: TX('ESTRELLA FUGAZ') };
const LimFX = (() => {
  const hex = n => '#' + (n & 0xffffff).toString(16).padStart(6, '0');
  const rgba = (n, a) => `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  const rn = (seed, i) => { const t = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453; return t - Math.floor(t); };
  const styleOf = key => LIM_STYLE[key] || (typeof PB_PLAYER !== 'undefined' && key === PB_PLAYER ? 'estelar' : 'tormenta');

  /* ---------------- Aura en el campo (API de Phaser Graphics) ---------------- */
  // g: Graphics · x,y: pies del jugador (px) · fx: {a,b} colores · time: ms · spd: velocidad · row: semilla
  function aura(g, x, y, fx, style, time, spd, row) {
    const k = 0.5 + 0.5 * Math.sin(time / 130 + row), seed = Math.floor(time / 90) * 7 + row * 13, r = i => rn(seed, i);
    if (style === 'hielo') {
      // Cristales de hielo en el suelo y copos que giran alrededor
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + time / 900, l = 13 + 5 * k, cx = x + Math.cos(a) * 17, cy = y + 5 + Math.sin(a) * 6;
        g.fillStyle(fx.b, 0.75).fillTriangle(cx - 3, cy, cx + 3, cy, cx, cy - l); g.fillStyle(fx.a, 0.5).fillTriangle(cx - 2, cy, cx + 2, cy, cx + 1, cy - l * 0.6); }
      for (let i = 0; i < 7; i++) { const a = time / 700 + i * 0.9, fy = y - 8 - ((time / 40 + i * 17) % 62), fx2 = x + Math.cos(a) * (14 + (i % 3) * 5);
        g.lineStyle(1.5, 0xffffff, 0.85).lineBetween(fx2 - 2.5, fy, fx2 + 2.5, fy).lineBetween(fx2, fy - 2.5, fx2, fy + 2.5); }
      g.lineStyle(2, fx.a, 0.5 + 0.3 * k).strokeEllipse(x, y + 5, 46 + 8 * k, 16);
    } else if (style === 'oro') {
      // Cadenas doradas que giran alrededor del cuerpo (dos aros inclinados de eslabones)
      for (let c = 0; c < 2; c++) {
        const n = 16, cy0 = y - (c ? 16 : 40);
        for (let i = 0; i < n; i++) {
          const a = time / (c ? -520 : 460) + i * Math.PI * 2 / n, lx = x + Math.cos(a) * 24, ly = cy0 + Math.sin(a) * 7, front = Math.sin(a) > 0, w = i % 2 ? 3.5 : 8, h = i % 2 ? 8 : 3.5;
          g.lineStyle(front ? 2.5 : 1.5, front ? fx.a : fx.b, front ? 1 : 0.45).strokeEllipse(lx, ly, w, h);
        }
      }
      g.fillStyle(fx.a, 0.1 + 0.07 * k).fillEllipse(x, y - 26, 44 + 8 * k, 74 + 10 * k);
      for (let i = 0; i < 3; i++) { const px = x + (r(i) - 0.5) * 36, py = y - 10 - r(i + 9) * 52; g.fillStyle(0xffffff, 0.8 * r(i + 4)).fillCircle(px, py, 1.5 + r(i + 2) * 1.5); }
    } else if (style === 'esmeralda') {
      // Hélice de hojas y viento verde que sube por el cuerpo
      for (let h = 0; h < 2; h++) {
        g.lineStyle(2.5, h ? fx.b : fx.a, 0.85).beginPath();
        for (let i = 0; i <= 16; i++) { const t = i / 16, a = time / 260 + t * 9 + h * Math.PI, px = x + Math.cos(a) * (18 - 6 * t), py = y + 4 - t * 62; i ? g.lineTo(px, py) : g.moveTo(px, py); }
        g.strokePath();
      }
      for (let i = 0; i < 5; i++) { const t = ((time / 700 + i * 0.21) % 1), a = time / 300 + i * 1.7, px = x + Math.cos(a) * (20 - 8 * t), py = y + 2 - t * 64;
        g.fillStyle(i % 2 ? fx.a : fx.b, 0.9 * (1 - t * 0.5)).fillTriangle(px - 3, py, px + 3, py, px, py - 6); }
      g.fillStyle(fx.a, 0.09 + 0.06 * k).fillEllipse(x, y - 26, 44 + 8 * k, 74 + 10 * k);
    } else if (style === 'estelar') {
      for (let i = 0; i < 6; i++) { const a = time / 520 + i * Math.PI / 3, px = x + Math.cos(a) * 20, py = y - 28 + Math.sin(a) * 26;
        g.fillStyle(i % 2 ? fx.a : fx.b, 0.9).fillTriangle(px - 3, py, px + 3, py, px, py - 7).fillTriangle(px - 3, py - 4, px + 3, py - 4, px, py + 3); }
      g.fillStyle(fx.a, 0.1 + 0.07 * k).fillEllipse(x, y - 26, 44 + 8 * k, 74 + 10 * k);
    } else {
      // Tormenta: relámpagos en zigzag (el clásico) y rayo por el suelo al correr
      g.fillStyle(fx.a, 0.1 + 0.07 * k).fillEllipse(x, y - 26, 44 + 8 * k, 74 + 10 * k);
      for (let b = 0, nb = spd > 0.6 ? 4 : 2; b < nb; b++) {
        let bx = x + (r(b * 9) - 0.5) * 38, by = y - 62 + r(b * 9 + 1) * 10;
        g.lineStyle(2, b % 2 ? fx.b : fx.a, 0.9).beginPath().moveTo(bx, by);
        for (let i = 1; i <= 4; i++) { bx += (r(b * 9 + i * 2) - 0.5) * 18; by += 12 + r(b * 9 + i * 2 + 1) * 6; g.lineTo(bx, by); }
        g.strokePath();
      }
    }
    g.lineStyle(2, fx.b, 0.35 + 0.25 * k).strokeEllipse(x, y + 8, 40 + 6 * k, 14);
  }

  /* ---------------- Escena de cámara (canvas 2D a pantalla completa) ---------------- */
  // Efecto de fondo de cada estilo: t = 0..1 de la escena, (cx,cy) = centro del jugador, S = tamaño de referencia
  const BG = {
    hielo(g, t, cx, cy, S, W, H, c) {
      for (let i = 0; i < 26; i++) {   // esquirlas de hielo que salen disparadas
        const a = i / 26 * Math.PI * 2 + rn(i, 1), d = S * (0.35 + 1.6 * Math.min(1, t * 1.6) * (0.5 + rn(i, 2))), l = S * (0.14 + rn(i, 3) * 0.2);
        const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
        g.fillStyle = rgba(i % 2 ? 0xffffff : c.a, 0.85 - t * 0.5); g.beginPath(); g.moveTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.lineTo(x + Math.cos(a + 2.5) * l * 0.28, y + Math.sin(a + 2.5) * l * 0.28); g.lineTo(x + Math.cos(a - 2.5) * l * 0.28, y + Math.sin(a - 2.5) * l * 0.28); g.fill();
      }
      for (let i = 0; i < 40; i++) { const x = (rn(i, 5) * W + t * 60 * (rn(i, 6) - 0.5)) % W, y = ((rn(i, 7) * H + t * H * (0.5 + rn(i, 8))) % H); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.moveTo(x, y - 4); g.lineTo(x, y + 4); g.stroke(); }
      g.font = (S * 0.34) + 'px serif'; g.textAlign = 'center'; g.globalAlpha = 0.95;   // pingüinos que se deslizan
      for (let i = 0; i < 3; i++) { const p = (t * 1.5 - i * 0.18); if (p < 0 || p > 1) continue; g.save(); g.translate(W * p - S * 0.2, H * (0.78 + 0.05 * i) + Math.sin(p * 20 + i) * 6); g.rotate(Math.PI / 2 * 0.0 + Math.sin(p * 14) * 0.15); g.fillText('🐧', 0, 0); g.restore(); }
      g.globalAlpha = 1;
      const fr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); fr.addColorStop(0, 'rgba(160,230,255,0)'); fr.addColorStop(1, 'rgba(190,240,255,.55)'); g.fillStyle = fr; g.fillRect(0, 0, W, H);
    },
    oro(g, t, cx, cy, S, W, H, c) {
      // Cadenas que se enroscan al cuerpo, se tensan y estallan en eslabones al final
      const tight = Math.min(1, t * 1.8), burst = Math.max(0, (t - 0.72) / 0.28);
      for (let ch = 0; ch < 3; ch++) {
        const n = 34;
        for (let i = 0; i < n; i++) {
          const u = i / (n - 1), a = u * 10 + ch * 2.1 + t * 3 * (ch % 2 ? -1 : 1), rad = S * (1.35 - 0.8 * tight + 0.18 * Math.sin(u * 6)) + burst * S * (0.8 + rn(i + ch * 50, 3) * 2.2);
          const x = cx + Math.cos(a) * rad + burst * (rn(i + ch * 50, 4) - 0.5) * S * 2, y = cy + S * 0.95 - u * S * 1.9 + Math.sin(a) * rad * 0.16 + burst * S * (rn(i + ch * 50, 5) - 0.3) * 1.5, front = Math.sin(a) > -0.1;
          g.save(); g.translate(x, y); g.rotate(Math.PI * 0.5 * (i % 2) + a * 0.3 + burst * i);
          g.strokeStyle = rgba(front ? c.a : 0x8a6a10, (front ? 1 : 0.5) * (1 - burst * 0.85)); g.lineWidth = S * (front ? 0.05 : 0.03);
          g.beginPath(); g.ellipse(0, 0, S * (i % 2 ? 0.045 : 0.1), S * (i % 2 ? 0.1 : 0.045), 0, 0, 7); g.stroke(); g.restore();
        }
      }
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + t * 2, d = S * (0.5 + 1.3 * t); g.fillStyle = rgba(0xffffff, 0.85 * (1 - t)); g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, 2 + rn(i, 4) * 3, 0, 7); g.fill(); }
      const lg = g.createRadialGradient(cx, cy, 0, cx, cy, S * 2.2); lg.addColorStop(0, rgba(c.a, 0.35 + burst * 0.3)); lg.addColorStop(1, rgba(c.a, 0)); g.fillStyle = lg; g.fillRect(0, 0, W, H);
    },
    esmeralda(g, t, cx, cy, S, W, H, c) {
      // Tornado de viento y hojas + constelación de la Cruz del Sur
      for (let h = 0; h < 3; h++) {
        g.strokeStyle = rgba(h % 2 ? c.b : c.a, 0.7); g.lineWidth = S * 0.05; g.beginPath();
        for (let i = 0; i <= 40; i++) { const u = i / 40, a = t * 9 + u * 14 + h * 2.1, rad = S * (0.25 + 1.4 * u), x = cx + Math.cos(a) * rad, y = cy + S * 1.1 - u * S * 2.8 + Math.sin(a) * rad * 0.18; i ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
      for (let i = 0; i < 30; i++) { const u = (t * 1.2 + i / 30) % 1, a = t * 12 + i * 1.9, rad = S * (0.2 + 1.5 * u), x = cx + Math.cos(a) * rad, y = cy + S * 1.1 - u * S * 2.8; g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = rgba(i % 2 ? c.a : 0xb8ff9a, 0.9 * (1 - u * 0.6)); g.beginPath(); g.ellipse(0, 0, S * 0.07, S * 0.03, 0, 0, 7); g.fill(); g.restore(); }
      const stars = [[0.5, 0.18], [0.5, 0.52], [0.36, 0.34], [0.64, 0.36]];   // Cruz del Sur
      g.strokeStyle = rgba(0xffffff, Math.min(1, t * 2) * 0.7); g.lineWidth = 2; g.beginPath(); g.moveTo(W * stars[0][0], H * stars[0][1]); g.lineTo(W * stars[1][0], H * stars[1][1]); g.moveTo(W * stars[2][0], H * stars[2][1]); g.lineTo(W * stars[3][0], H * stars[3][1]); g.stroke();
      stars.forEach(([sx, sy], i) => { const a = Math.min(1, Math.max(0, t * 2.4 - i * 0.2)); g.fillStyle = rgba(0xffffff, a); g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? S * 0.04 : S * 0.13 * (0.8 + 0.2 * Math.sin(t * 20 + i)); g.lineTo(W * sx + Math.cos(k * Math.PI / 4) * rr, H * sy + Math.sin(k * Math.PI / 4) * rr); } g.closePath(); g.fill(); });
    },
    tormenta(g, t, cx, cy, S, W, H, c) {
      // Relámpagos desde arriba y haces cruzados en X (Cañón X)
      const seed = Math.floor(t * 18);
      for (let b = 0; b < 5; b++) {
        let x = rn(seed + b, 1) * W, y = 0; const tx = cx + (rn(seed + b, 2) - 0.5) * S * 2, ty = cy + (rn(seed + b, 3) - 0.5) * S;
        const pts = [[x, y]]; for (let i = 1; i <= 8; i++) { const u = i / 8; pts.push([x + (tx - x) * u + (rn(seed + b, 10 + i) - 0.5) * S * 0.5, ty * u]); }
        g.save(); g.lineJoin = g.lineCap = 'round'; g.shadowColor = hex(c.a); g.shadowBlur = 18;
        [[c.a, S * 0.07], [c.b, S * 0.035], [0xffffff, S * 0.012]].forEach(([col, lw]) => { g.strokeStyle = hex(col); g.lineWidth = lw; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }); g.restore();
      }
      const grow = Math.min(1, Math.max(0, (t - 0.25) * 2.2)); g.save(); g.translate(cx, cy); g.globalCompositeOperation = 'lighter';
      [Math.PI / 4, -Math.PI / 4].forEach((a, i) => { g.save(); g.rotate(a); const L = Math.max(W, H) * grow; const gr = g.createLinearGradient(-L, 0, L, 0); gr.addColorStop(0, rgba(i ? c.b : c.a, 0)); gr.addColorStop(0.5, rgba(i ? c.b : c.a, 0.9)); gr.addColorStop(1, rgba(i ? c.b : c.a, 0)); g.fillStyle = gr; g.fillRect(-L, -S * 0.09, L * 2, S * 0.18); g.restore(); });
      g.restore();
    },
    estelar(g, t, cx, cy, S, W, H, c) {
      for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2 + t * 3, d = S * (0.4 + 1.5 * t * (0.4 + rn(i, 2))), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; g.fillStyle = rgba(i % 2 ? c.a : c.b, 0.9 * (1 - t * 0.6)); g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? S * 0.025 : S * 0.09; g.lineTo(x + Math.cos(k * Math.PI / 4) * rr, y + Math.sin(k * Math.PI / 4) * rr); } g.closePath(); g.fill(); }
    },
  };

  let overlay = null, stopFn = null;
  // opts: { ref: sprite del jugador, style, name: técnica, tag: texto pequeño, a, b: colores, ms, kind }
  function cine(opts) {
    stop();
    const shell = document.getElementById('shell') || document.body, o = opts || {}, style = o.style || 'tormenta';
    const cv = document.createElement('canvas'); cv.className = 'limcine'; shell.appendChild(cv); overlay = cv;
    const W = cv.width = Math.max(2, shell.clientWidth), H = cv.height = Math.max(2, shell.clientHeight), g = cv.getContext('2d'), c = { a: o.a != null ? o.a : 0x35d6ff, b: o.b != null ? o.b : 0xffffff };
    const ms = o.ms || 1500; let sheet = null, alive = true, t0 = 0;
    const frame = typeof FR !== 'undefined' && ANIM && ANIM.kick ? FR[ANIM.kick[2][1]] : 50;
    if (o.ref && typeof Sprites !== 'undefined') Sprites.matchSheet([o.ref]).then(s => { sheet = s; }).catch(() => {});
    const done = () => { alive = false; if (cv.parentNode) cv.remove(); if (overlay === cv) overlay = null; if (stopFn === done) stopFn = null; o.onDone && o.onDone(); };
    stopFn = done;
    const draw = now => {
      if (!alive) return; if (!t0) t0 = now;
      const el = now - t0, t = Math.min(1, el / ms), S = Math.min(W, H * 0.62) * 0.46, cx = W / 2, cy = H * 0.5;
      g.clearRect(0, 0, W, H);
      const inT = Math.min(1, el / 160), outT = t > 0.86 ? (t - 0.86) / 0.14 : 0, a = Math.min(inT, 1 - outT);
      g.globalAlpha = a;
      // fondo oscuro con viñeta y líneas de velocidad hacia el centro
      g.fillStyle = 'rgba(2,4,18,.72)'; g.fillRect(0, 0, W, H);
      const rg = g.createRadialGradient(cx, cy, S * 0.2, cx, cy, Math.max(W, H) * 0.7); rg.addColorStop(0, rgba(c.a, 0.38)); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
      g.save(); g.translate(cx, cy); g.strokeStyle = rgba(c.b, 0.35); g.lineWidth = 2;
      for (let i = 0; i < 46; i++) { const an = i / 46 * Math.PI * 2 + rn(i, 9) * 0.1, r0 = S * (0.9 + rn(i, 3) * 0.5 + t * 0.4), r1 = r0 + S * (0.5 + rn(i, 4) * 1.2); g.beginPath(); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); g.stroke(); }
      g.restore();
      (BG[style] || BG.tormenta)(g, t, cx, cy, S, W, H, c);
      // jugador en pose de chute: entra con zoom, vibra y se agranda un poco
      if (sheet) {
        const zoom = 0.55 + 0.45 * (1 - Math.pow(1 - Math.min(1, el / 320), 3)) + t * 0.12, sz = S * 2.25 * zoom, sh = (Math.random() - 0.5) * 3 * (t > 0.2 && t < 0.8 ? 1 : 0);
        g.imageSmoothingEnabled = false; g.save(); g.translate(cx + sh, cy + S * 0.15 + sh);
        if (!(o.team === 'B')) g.scale(-1, 1);   // el muñeco base mira a la izquierda
        g.shadowColor = hex(c.a); g.shadowBlur = 30; g.drawImage(sheet, frame * 48, 0, 48, 48, -sz / 2, -sz * 0.72, sz, sz); g.restore();
      }
      // barras de cine, nombre y etiqueta
      const bar = H * 0.13 * Math.min(1, el / 220); g.fillStyle = '#000'; g.fillRect(0, 0, W, bar); g.fillRect(0, H - bar, W, bar);
      g.fillStyle = hex(c.a); g.fillRect(0, bar - 3, W * Math.min(1, el / 400), 3); g.fillRect(W - W * Math.min(1, el / 400), H - bar, W * Math.min(1, el / 400), 3);
      g.textAlign = 'center'; g.save(); g.translate(cx, H - bar - S * 0.12); const sc = 0.6 + 0.4 * Math.min(1, el / 240); g.scale(sc, sc);
      g.font = `${Math.round(S * 0.3)}px 'Press Start 2P','VT323',monospace`; g.lineWidth = 6; g.strokeStyle = '#000'; g.shadowColor = hex(c.a); g.shadowBlur = 16; g.strokeText(o.name || '', 0, 0); g.fillStyle = '#fff'; g.fillText(o.name || '', 0, 0);
      g.shadowBlur = 0; g.font = `${Math.round(S * 0.14)}px 'Press Start 2P','VT323',monospace`; g.fillStyle = hex(c.b); g.strokeText('★ ' + (o.tag || LIM_NAME[style]) + ' ★', 0, -S * 0.34); g.fillText('★ ' + (o.tag || LIM_NAME[style]) + ' ★', 0, -S * 0.34); g.restore();
      // destello blanco al principio y al final
      const fl = Math.max(0, 1 - el / 180) * 0.8 + outT * 0.9; if (fl > 0) { g.globalAlpha = 1; g.fillStyle = `rgba(255,255,255,${Math.min(1, fl)})`; g.fillRect(0, 0, W, H); }
      g.globalAlpha = 1;
      if (el >= ms) return done();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    // para pruebas: dibujar el fotograma en un instante concreto sin esperar a la animación
    return { stop: done, at(ms2) { t0 = performance.now() - ms2; } };
  }
  function stop() { if (stopFn) stopFn(); }
  return { styleOf, aura, cine, stop, STYLES: ['hielo', 'oro', 'esmeralda', 'tormenta', 'estelar'] };
})();
