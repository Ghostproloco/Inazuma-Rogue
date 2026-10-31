/* =====================================================================
   MENÚ ANIMADO (canvas): tu equipo corriendo con el balón, con rayos,
   polvo, focos de estadio y público. Se usa en el menú principal
   (modo 'team') y en la pantalla de Partido rápido (modo 'vs').
   Los muñecos son los mismos de la hoja del partido (Sprites.matchSheet).
   ===================================================================== */
const MenuFX = (() => {
  const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = u => 1 - Math.pow(1 - Math.min(1, Math.max(0, u)), 3);
  const RUN = ANIM.run[2], KICK = ANIM.kick[2][1];   // perfil (el muñeco base mira a la izquierda)

  // Muñecos de un rival (igual que rivalTeam, sin montar el partido)
  function rivalRefs(key) {
    const t = TEAM(key); if (!t) return [];
    const order = { POR: 0, DEF: 1, MED: 2, DEL: 3 };
    return t.players.slice().sort((a, b) => order[a.role] - order[b.role]).map(m => {
      const pd = PLAYER(m.id);
      return Object.assign(m.file ? { file: m.file, row: m.row } : pd && pd.cs ? { file: 'c' + String(pd.cs[0]).padStart(2, '0') + '.png', row: pd.cs[1] } : { file: 'c00.png', row: 0 },
        t.kit && m.role !== 'POR' ? { kit: t.kit } : {});
    });
  }

  function poly(g, x, y, r, n, rot) {
    g.beginPath();
    for (let k = 0; k < n; k++) { const a = rot + k * Math.PI * 2 / n; k ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    g.closePath();
  }
  function drawBall(g, x, y, r, rot) {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = '#fff'; g.fill();
    g.save(); g.clip();
    g.fillStyle = '#1b1b24'; poly(g, 0, 0, r * 0.42, 5, -Math.PI / 2); g.fill();
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 5 + Math.PI / 5; poly(g, Math.cos(a) * r * 1.0, Math.sin(a) * r * 1.0, r * 0.38, 5, a); g.fill(); }
    g.restore();
    g.lineWidth = Math.max(1, r * 0.14); g.strokeStyle = '#1b1b24'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
    g.restore();
  }
  function makeBolt(x0, y0, x1, y1) {
    const pts = [[x0, y0]], n = 7;
    for (let i = 1; i < n; i++) { const u = i / n; pts.push([x0 + (x1 - x0) * u + rnd(-16, 16), y0 + (y1 - y0) * u]); }
    pts.push([x1, y1]);
    return { pts, life: 0.22, max: 0.22 };
  }

  // opts: { mode: 'team' | 'vs', mine: [refs], rival: [refs] }
  function scene(cv, opts) {
    const g = cv.getContext('2d'), mode = opts.mode || 'team', mine = opts.mine || [];
    let rival = opts.rival || [], sheet = null, rivalOk = false, tok = 0;
    let W = 0, H = 0, dpr = 1, alive = true, last = 0, T = 0, rivIn = 1, raf = 0;
    let flash = 0, nextBolt = 1.2, nextClash = 1.6, crowd = [];
    const parts = [], bolts = [], streaks = [], sq = [];
    for (let k = 0; k < 9; k++) streaks.push({ x: Math.random(), y: Math.random(), v: rnd(380, 760), len: rnd(40, 120), a: rnd(0.12, 0.3) });
    const ball = { holder: 0, mode: 'carry', x: 0, y: 0, z: 0, gy: 0, rot: 0, timer: 1.3, u: 0, dur: 0.6, fx: 0, fy: 0, to: 0, trail: [] };
    const TEAM_POS = [[.46, .5], [.2, .12], [.72, .82], [.34, .92], [.88, .3]];   // [x, carril] de cada jugador al correr en grupo
    const VS_POS = [[.62, .5], [.08, .1], [.92, .85], [.35, .92], [.78, .22]];

    function build() {
      sq.length = 0;
      mine.forEach((r, i) => sq.push({ row: i, team: 0, i, phase: rnd(0, 8), kick: 0, dust: 0, x: 0, y: 0 }));
      if (mode === 'vs') rival.forEach((r, i) => sq.push({ row: mine.length + i, team: 1, i, phase: rnd(0, 8), kick: 0, dust: 0, x: 0, y: 0 }));
    }
    function load() {
      const my = ++tok, refs = mine.concat(mode === 'vs' ? rival : []);
      if (!refs.length) return;
      Sprites.matchSheet(refs).then(c => { if (my !== tok) return; sheet = c; rivalOk = true; if (REDUCED) draw(); }).catch(() => {});
    }
    function buildCrowd() {
      crowd = []; const n = Math.round(W / 4);
      for (let i = 0; i < n * 3; i++) crowd.push({ x: Math.random() * W, y: Math.random(), c: ['#e8c21a', '#e63931', '#4fc8f0', '#ffffff', '#7ee36a', '#ff7a8a'][i % 6], p: Math.random() * 6 });
    }

    function layout() {
      const grassTop = H * 0.42, gh = H - grassTop, s = Math.max(1.6, Math.min(2.6, H / (mode === 'vs' ? 100 : 98)));
      sq.forEach(p => {
        const list = mode === 'vs' ? VS_POS : TEAM_POS, [fx, lane] = list[p.i % 5];
        p.s = s; p.dir = p.team === 0 ? 1 : -1;
        p.fy = grassTop + gh * (0.3 + 0.62 * lane);
        let x = mode === 'vs' ? W * (.03 + .45 * fx) : W * (.1 + .78 * fx);
        if (mode === 'vs') { if (p.team === 1) x = W - x + (1 - ease(rivIn)) * W * 0.6; }
        else if (ball.holder === p.i) x += W * 0.035;
        p.x = x + Math.sin(T * 1.1 + p.i * 1.7) * W * 0.012;
      });
      return { grassTop, gh, s };
    }

    function spark(x, y, n, add) {
      for (let k = 0; k < n; k++) { const a = rnd(0, 7), v = rnd(70, 230); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: rnd(.3, .6), max: .6, r0: rnd(2, 4), r1: 0, col: add || [255, 226, 70], add: true, gr: 260 }); }
    }
    function ring(x, y, big) { parts.push({ x, y, ring: true, life: .45, max: .45, r0: 4, r1: big || 36, col: [255, 232, 90] }); }
    function bolt(x) { const { grassTop } = layout(); bolts.push(makeBolt(x, -4, x + rnd(-30, 30), grassTop + (H - grassTop) * .5)); flash = .28; }
    function poke() {
      if (mode === 'team') { ball.timer = 0; bolt(rnd(W * .25, W * .75)); }
      else { bolt(W / 2); spark(W / 2, H * .72, 22); ring(W / 2, H * .74, 60); }
    }

    function step(dt) {
      T += dt; flash = Math.max(0, flash - dt);
      if (mode === 'vs' && rivIn < 1) { rivIn = Math.min(1, rivIn + dt / .55); if (rivIn >= 1) { spark(W / 2, H * .72, 14); ring(W / 2, H * .74, 48); } }
      const L = layout();
      // dust y patadas
      sq.forEach(p => {
        p.kick = Math.max(0, p.kick - dt);
        if (mode === 'vs' && p.team === 1 && rivIn < 1) return;
        p.dust -= dt;
        if (p.dust <= 0) { p.dust = rnd(.07, .13); parts.push({ x: p.x - p.dir * 12 * p.s / 2.6, y: p.fy - 2, vx: -p.dir * rnd(30, 70), vy: rnd(-26, -8), life: .55, max: .55, r0: 2, r1: 7 * p.s / 2.6, col: [222, 200, 150], a: .5, gr: -10 }); }
      });
      // balón
      const b = ball, k = L.s / 2.6;
      if (mode === 'team' && sq.length) {
        const h = sq[b.holder % sq.length];
        if (b.mode === 'carry') {
          const ph = (T * 1000 / 78 + h.phase) / 2 * Math.PI;
          b.x = h.x + h.dir * (15 + 11 * (0.5 + 0.5 * Math.sin(ph))) * k; b.gy = h.fy - 1; b.z = (2 + 3 * Math.abs(Math.sin(ph))) * k; b.rot += dt * 11;
          b.timer -= dt;
          if (b.timer <= 0 && sq.length > 1) {
            b.to = (b.holder + 1 + Math.floor(Math.random() * (sq.length - 1))) % sq.length;
            b.mode = 'pass'; b.u = 0; b.fx = b.x; b.fy = b.gy;
            const tp = sq[b.to]; b.dur = .45 + Math.hypot(tp.x - b.x, tp.fy - b.gy) / 900;
            h.kick = .28; spark(b.x, b.gy - 6, 8); b.trail.length = 0;
          }
        } else {
          b.u += dt / b.dur;
          const tp = sq[b.to], tx = tp.x + tp.dir * 16 * k, ty = tp.fy - 1, u = Math.min(1, b.u), e = u * (2 - u);
          b.x = b.fx + (tx - b.fx) * e; b.gy = b.fy + (ty - b.fy) * e; b.z = Math.sin(Math.PI * u) * 38 * k + 3 * k; b.rot += dt * 24;
          b.trail.push([b.x, b.gy - b.z]); if (b.trail.length > 12) b.trail.shift();
          if (b.u >= 1) { b.holder = b.to; b.mode = 'carry'; b.timer = rnd(1.3, 2.6); ring(b.x, b.gy - 4, 34 * k); spark(b.x, b.gy - 6, 10); }
        }
        if (b.mode === 'carry' && b.trail.length) b.trail.shift();
      } else if (mode === 'vs') {
        b.x = W / 2; b.gy = L.grassTop + L.gh * .66; b.z = Math.abs(Math.sin(T * 3.2)) * 46 * k + 4; b.rot += dt * 9;
        nextClash -= dt;
        if (nextClash <= 0 && rivIn >= 1) { nextClash = rnd(2.2, 3.6); bolt(W / 2); spark(W / 2, b.gy - 10, 16); ring(b.x, b.gy, 56); }
      }
      // rayos al azar
      nextBolt -= dt;
      if (nextBolt <= 0 && mode === 'team') { nextBolt = rnd(2.4, 4.6); bolt(rnd(W * .1, W * .9)); }
      bolts.forEach(o => o.life -= dt); for (let i = bolts.length - 1; i >= 0; i--) if (bolts[i].life <= 0) bolts.splice(i, 1);
      parts.forEach(p => { p.life -= dt; if (!p.ring) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.gr || 0) * dt; } });
      for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
      if (parts.length > 220) parts.splice(0, parts.length - 220);
      streaks.forEach(s => { s.x -= s.v * dt / Math.max(1, W); if (s.x < -.3) { s.x = 1.1; s.y = Math.random(); } });
    }

    function drawBG(L) {
      const { grassTop, gh } = L;
      // cielo de atardecer
      let gr = g.createLinearGradient(0, 0, 0, grassTop);
      gr.addColorStop(0, '#0b1538'); gr.addColorStop(.55, '#27479a'); gr.addColorStop(1, '#ff9a4a');
      g.fillStyle = gr; g.fillRect(0, 0, W, grassTop + 2);
      // focos
      [[.08, 1], [.92, -1]].forEach(([fx, sg], n) => {
        const x = W * fx, pul = .85 + .15 * Math.sin(T * 3 + n * 2);
        const cone = g.createLinearGradient(x, 0, x + sg * W * .4, grassTop);
        cone.addColorStop(0, `rgba(255,248,200,${.34 * pul})`); cone.addColorStop(1, 'rgba(255,248,200,0)');
        g.fillStyle = cone; g.beginPath(); g.moveTo(x, 6); g.lineTo(x - sg * 10, 6); g.lineTo(x - sg * W * .1, grassTop); g.lineTo(x + sg * W * .62, grassTop); g.closePath(); g.fill();
        const glow = g.createRadialGradient(x, 8, 0, x, 8, 46); glow.addColorStop(0, `rgba(255,255,230,${.95 * pul})`); glow.addColorStop(1, 'rgba(255,255,230,0)');
        g.fillStyle = glow; g.fillRect(x - 46, -38, 92, 92);
      });
      // grada + público
      const ct = grassTop - Math.max(30, H * .17);
      g.fillStyle = '#121a3d'; g.fillRect(0, ct, W, grassTop - ct + 1);
      crowd.forEach(c => {
        const y = ct + 3 + c.y * (grassTop - ct - 8), tw = Math.sin(T * 2.4 + c.p);
        g.globalAlpha = tw > .93 ? 1 : .55; g.fillStyle = tw > .93 ? '#fff' : c.c; g.fillRect(c.x, y, tw > .93 ? 3 : 2, tw > .93 ? 3 : 2);
      }); g.globalAlpha = 1;
      g.fillStyle = '#e8c21a'; g.fillRect(0, grassTop - 4, W, 3);   // valla
      g.fillStyle = '#c8102e'; g.fillRect(0, grassTop - 1, W, 2);
      // césped en bandas que se mueven
      const sw = Math.max(34, W / 8), off = mode === 'vs' ? (T * 120) % (sw * 2) : (T * 150) % (sw * 2);
      g.fillStyle = '#2c8537'; g.fillRect(0, grassTop, W, gh);
      g.fillStyle = '#36973f';
      for (let x = -sw * 2 + off; x < W + sw; x += sw * 2) { g.beginPath(); g.moveTo(x + sw * .25, grassTop); g.lineTo(x + sw * 1.25, grassTop); g.lineTo(x + sw * 1.25 + sw * .5, H); g.lineTo(x + sw * .25 + sw * .5, H); g.closePath(); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(0, grassTop + 5, W, 2);
      const sh = g.createLinearGradient(0, grassTop, 0, H); sh.addColorStop(0, 'rgba(0,0,0,.25)'); sh.addColorStop(.4, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.35)');
      g.fillStyle = sh; g.fillRect(0, grassTop, W, gh);
      // líneas de velocidad
      streaks.forEach(s => { g.globalAlpha = s.a; g.fillStyle = '#fff'; g.fillRect(s.x * W, grassTop + 8 + s.y * (gh - 12), s.len * (mode === 'vs' ? .7 : 1), 2); }); g.globalAlpha = 1;
    }

    function draw() {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      if (w !== W || h !== H) { W = w; H = h; dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); buildCrowd(); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false;
      const L = layout(), s = L.s, k = s / 2.6;
      drawBG(L);
      // foco bajo quien lleva el balón
      if (mode === 'team' && sq.length) {
        const h0 = sq[ball.holder % sq.length]; g.globalCompositeOperation = 'lighter';
        const gl = g.createRadialGradient(h0.x, h0.fy, 0, h0.x, h0.fy, 60 * k); gl.addColorStop(0, 'rgba(255,170,40,.5)'); gl.addColorStop(1, 'rgba(255,170,40,0)');
        g.fillStyle = gl; g.fillRect(h0.x - 70 * k, h0.fy - 70 * k, 140 * k, 140 * k); g.globalCompositeOperation = 'source-over';
      }
      // lista de dibujo ordenada por profundidad
      const items = [];
      if (sheet) sq.forEach(p => { if (p.team === 1 && !rivalOk) return; items.push({ y: p.fy, fn: () => drawPlayer(p, s) }); });
      items.push({ y: ball.gy + .5, fn: () => drawBallFx(k) });
      items.sort((a, b) => a.y - b.y).forEach(o => o.fn());
      // partículas
      parts.forEach(p => {
        const u = p.life / p.max;
        if (p.add) g.globalCompositeOperation = 'lighter';
        if (p.ring) { g.strokeStyle = `rgba(${p.col},${u})`; g.lineWidth = 3 * u + 1; g.beginPath(); g.ellipse(p.x, p.y, p.r0 + (p.r1 - p.r0) * (1 - u), (p.r0 + (p.r1 - p.r0) * (1 - u)) * .45, 0, 0, 7); g.stroke(); }
        else { g.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${u * (p.a || 1)})`; g.beginPath(); g.arc(p.x, p.y, p.r1 + (p.r0 - p.r1) * u, 0, 7); g.fill(); }
        g.globalCompositeOperation = 'source-over';
      });
      // rayos
      bolts.forEach(o => {
        const u = o.life / o.max; g.save(); g.globalAlpha = Math.min(1, u * 1.6); g.lineJoin = g.lineCap = 'round'; g.shadowColor = '#ffe81a'; g.shadowBlur = 18;
        [['#ff9d00', 7], ['#fff27a', 4], ['#fff', 1.6]].forEach(([c, lw]) => { g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); o.pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); });
        g.restore();
      });
      if (flash > 0) { g.fillStyle = `rgba(255,250,210,${flash * .7})`; g.fillRect(0, 0, W, H); }
      // viñeta
      const vg = g.createRadialGradient(W / 2, H * .55, H * .35, W / 2, H * .55, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)');
      g.fillStyle = vg; g.fillRect(0, 0, W, H);
    }
    function drawPlayer(p, s) {
      const holder = mode === 'team' && ball.holder === p.i;
      const fi = p.kick > 0 ? KICK : RUN[Math.floor(T * 1000 / 78 + p.phase) % 8], fx = FR[fi] != null ? FR[fi] : FR[RUN[0]];
      g.fillStyle = 'rgba(0,0,0,.38)'; g.beginPath(); g.ellipse(p.x, p.fy, 15 * s / 2.6 * (holder ? 1.1 : 1), 4.5 * s / 2.6, 0, 0, 7); g.fill();
      g.save(); g.translate(p.x, p.fy - 40 * s);
      if (p.dir > 0) g.scale(-1, 1);   // el muñeco base mira a la izquierda
      g.drawImage(sheet, fx * 48, p.row * 48, 48, 48, -24 * s, 0, 48 * s, 48 * s);
      g.restore();
    }
    function drawBallFx(k) {
      const b = ball, r = 6.5 * k + 1;
      if (b.trail.length > 1) b.trail.forEach((q, i) => { const u = (i + 1) / b.trail.length; g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,190,50,${u * .5})`; g.beginPath(); g.arc(q[0], q[1], r * u * .9, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; });
      g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(b.x, b.gy, r * (1.1 - Math.min(.4, b.z / 140)), r * .4, 0, 0, 7); g.fill();
      if (mode === 'vs') { g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(b.x, b.gy - b.z, 0, b.x, b.gy - b.z, 40 * k); gl.addColorStop(0, 'rgba(255,220,90,.55)'); gl.addColorStop(1, 'rgba(255,220,90,0)'); g.fillStyle = gl; g.fillRect(b.x - 40 * k, b.gy - b.z - 40 * k, 80 * k, 80 * k); g.globalCompositeOperation = 'source-over'; }
      drawBall(g, b.x, b.gy - b.z - r * .6, r, b.rot);
    }

    function tick(ts) {
      if (!alive) return;
      if (!cv.isConnected) { alive = false; return; }
      raf = requestAnimationFrame(tick);
      if (!last) last = ts; const dt = Math.min(.05, (ts - last) / 1000); last = ts;
      if (document.hidden) return;
      step(dt); draw();
    }
    build(); load();
    if (REDUCED) { requestAnimationFrame(() => { T = 1.2; step(.016); draw(); }); }
    else raf = requestAnimationFrame(tick);
    return {
      poke,
      setRival(refs) {
        if (mode !== 'vs') return;
        rival = refs || []; build(); rivalOk = false; rivIn = 0; load();
        if (REDUCED) { rivIn = 1; }
      },
      destroy() { alive = false; cancelAnimationFrame(raf); },
    };
  }
  return { scene, rivalRefs };
})();
