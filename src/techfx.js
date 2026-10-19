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
    ['lobo', /aullido de lobo/i],
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
    ['tornadoF', /^tornado de fuego$|tornado inverso|tornado doble/i],
    ['relampago', /rel[áa]mpago|trampol[íi]n/i],
  ],
  parada: [
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
  ],
  bloqueo: [
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
const TYPE_TXT = { tiro: 'Supertécnica de tiro', parada: 'Supertécnica de portero', regate: 'Supertécnica de regate', bloqueo: 'Supertécnica de bloqueo' };

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
        const kind = { tierra: 'rocks', hielo: 'icerocks', murobloq: 'wall', terremoto: 'quake', gravedad: 'gravity' }[fam] || 'slash';
        this.impacts.push({ kind, x: e.x * PX, y: e.y * PX, elem: e.elem, t: 0, life: kind === 'slash' ? 0.7 : 0.9 });
        if (kind !== 'slash') this.sc.cameras.main.shake(220, kind === 'quake' ? 0.012 : 0.007);
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
      if (!p.dash) continue;
      if (p.dash.tech.plain) {   // regate normal: solo una estela suave
        [3, 6].forEach((j, i) => { const h = v.hist[j]; if (h) clone(v, h.x, h.y, 0.28 - i * 0.1, 0xffffff); });
        continue;
      }
      const E = EL(p.dash.tech.elem), fam = famOf(p.dash.tech), px = p.x * PX, py = p.y * PX;
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
    } else if (m.kind === 'puff') {
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; gN.fillStyle(0xe8e8e8, 0.7 * (1 - k)).fillCircle(m.x + Math.cos(a) * k * 26, m.y - 10 + Math.sin(a) * k * 12, 8 * (1 - k * 0.5)); }
    }
  }
}
