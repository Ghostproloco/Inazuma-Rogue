p='/home/claude/inazuma/src/techfx.js'; s=open(p).read()
def R(a,b):
    global s
    assert s.count(a)==1,a[:70]; s=s.replace(a,b)
R("""const famOf = t => { for (const [f, re] of FAM_RULES[t.type] || []) if (re.test(t.name)) return f; return 'beam'; };""",
"""// Técnicas famosas con animación propia (van antes que las familias)
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
};""")
R("""        const fam = famOf({ type: 'bloqueo', name: e.name || '' });
        this.impacts.push({ kind: fam === 'tierra' ? 'rocks' : 'slash', x: e.x * PX, y: e.y * PX, elem: e.elem, t: 0, life: 0.7 });
        if (fam === 'tierra') this.sc.cameras.main.shake(200, 0.008);""","""        const fam = famOf({ type: 'bloqueo', name: e.name || '' });
        const kind = { tierra: 'rocks', hielo: 'icerocks', murobloq: 'wall', terremoto: 'quake', gravedad: 'gravity' }[fam] || 'slash';
        this.impacts.push({ kind, x: e.x * PX, y: e.y * PX, elem: e.elem, t: 0, life: kind === 'slash' ? 0.7 : 0.9 });
        if (kind !== 'slash') this.sc.cameras.main.shake(220, kind === 'quake' ? 0.012 : 0.007);""")
R("""      if (fam === 'ilusion') {""","""      if (fam === 'hora') {
        this.dim.fillAlpha = Math.max(this.dim.fillAlpha, 0.55);
        this.clock(gA, px, py - 22, 34, time, E);
        [4, 8].forEach((j, i) => { const h = v.hist[j]; if (h) clone(v, h.x, h.y, 0.4 - i * 0.15, 0xfff6c0); });
      } else if (fam === 'espejismo') {
        for (let i = 0; i < 3; i++) { const a = time / 90 + i * 2.09; gN.fillStyle(0xffffff, 0.75).fillCircle(px + Math.cos(a) * 22, py - 6 + Math.sin(a) * 8, 5); gN.lineStyle(1.5, 0x222222, 0.8).strokeCircle(px + Math.cos(a) * 22, py - 6 + Math.sin(a) * 8, 5); }
        [4, 8, 12].forEach((j, i) => { const h = v.hist[j]; if (h) clone(v, h.x + Math.sin(time / 40 + i) * 8, h.y, 0.45 - i * 0.1, E.tints[1]); });
      } else if (fam === 'ilusion') {""")
R("""  windup(fam, E, x, y, k, time, v, clone) {
    const gN = this.gN""","""  windup(fam, E, x, y, k, time, v, clone) {
    if (this.sigWindup(fam, E, x, y, k, time, v, clone)) return;
    const gN = this.gN""")
R("""  flightFX(fam, E, bx, by, time) {
    const gN = this.gN""","""  flightFX(fam, E, bx, by, time) {
    if (this.sigFlight(fam, E, bx, by, time)) return;
    const gN = this.gN""")
R("""  parada(fam, E, x, y, age, time, team, pulse) {
    const gN = this.gN""","""  parada(fam, E, x, y, age, time, team, pulse) {
    if (this.sigParada(fam, E, x, y, age, time, team, pulse)) return;
    const gN = this.gN""")
R("""    } else if (m.kind === 'puff') {""","""    } else if (m.kind === 'icerocks') {
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
    } else if (m.kind === 'puff') {""")
R("""  impact(m, time) {""", open('/home/claude/inazuma/test/sig_methods.js').read() + """
  impact(m, time) {""")
open(p,'w').write(s)
open('/tmp/claude-0/-home-claude/e42e78f0-c4bf-5f77-b468-3dcfd5187e93/scratchpad/techfx_only.js','w').write(s)
print('ok')
