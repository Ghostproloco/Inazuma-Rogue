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
