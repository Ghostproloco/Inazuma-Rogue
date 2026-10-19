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
