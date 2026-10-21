# Recolorea el pelo de los muñecos del partido (sprites/cNN.png) cuyo color no coincide con el de su foto (sprites/fNN.png).
# En algunas hojas (sobre todo del Inazuma 3) el muñeco tiene otro color de pelo que la foto (p. ej. Partinus: marrón en el
# muñeco, azul claro en la foto). Para cada jugador del gacha:
#   1) compara el color del pelo del muñeco (zona alta de la cabeza) con el de la foto;
#   2) si son distintos, cambia los colores del pelo del muñeco (en todos sus fotogramas) por los de la foto,
#      ordenados de oscuro a claro, sin tocar la piel, el contorno ni los colores de la equipación.
# Uso: python3 tools/fix_sprite_hair.py [--dry] [--min 0.35] [--only hoja,fila]      (--dry: solo informa y crea la muestra antes/después)
import os, sys, json, colorsys
from collections import Counter
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SP = os.path.join(ROOT, 'juego', 'sprites')
DRY = '--dry' in sys.argv
MIN = float(sys.argv[sys.argv.index('--min') + 1]) if '--min' in sys.argv else 0.35
ONLY = tuple(int(x) for x in sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None   # p. ej. --only 136,10
KIT = {(213, 180, 16), (164, 131, 16), (57, 82, 123), (74, 131, 172), (57, 131, 197), (65, 65, 139), (57, 82, 139), (74, 106, 189), (41, 98, 123)}
g = json.load(open(os.path.join(ROOT, 'juego', 'gamedata.json')))
cache = {}
def img(name):
    if name not in cache: cache[name] = Image.open(os.path.join(SP, name)).convert('RGBA')
    return cache[name]
lum = lambda c: 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]
def colors(im, box):
    px = [p[:3] for p in im.crop(box).getdata() if p[3] > 200]
    return Counter(c for c in px if lum(c) > 45)   # sin el contorno
def avg(cnt, n=3):
    top = cnt.most_common(n); k = sum(v for _, v in top) or 1
    return tuple(sum(c[i] * v for c, v in top) / k for i in range(3))
def score(a, b):
    (h1, l1, s1), (h2, l2, s2) = [colorsys.rgb_to_hls(*[x / 255 for x in c]) for c in (a, b)]
    dh = min(abs(h1 - h2), 1 - abs(h1 - h2))
    return (dh * 2 if min(s1, s2) > 0.2 else 0) + abs(l1 - l2) + abs(s1 - s2) * 0.6
def near(a, b): return sum(abs(a[i] - b[i]) for i in range(3)) < 40

done, report, sample = set(), [], []
for p in g['players']:
    if not p.get('cs') or p.get('gacha') is False: continue
    f, r = p['cs']
    key = (f, r)
    if key in done or (ONLY and key != ONLY): continue
    done.add(key)
    cn, fn = 'c%02d.png' % f, 'f%02d.png' % f
    c, fc = img(cn), img(fn)
    y0 = r * 48
    hairS = colors(c, (16, y0 + 14, 32, y0 + 23))          # pelo del muñeco (de frente)
    skinS = colors(c, (18, y0 + 24, 30, y0 + 30))          # cara del muñeco
    hairF = colors(fc, (14, r * 64 + 1, 50, r * 64 + 12))  # pelo de la foto
    if not hairS or not hairF: continue
    sc = score(avg(hairS), avg(hairF))
    if sc < MIN and not ONLY: continue
    skin = {s for s, _ in skinS.most_common(3)}
    src = [col for col, n in hairS.most_common(6) if n >= 2 and col not in skin and col not in KIT and not any(near(col, s) for s in skin)][:4]
    dst = [col for col, n in hairF.most_common(5) if n >= 3][:4]
    if len(src) < 1 or len(dst) < 1: continue
    src.sort(key=lum); dst.sort(key=lum)
    # cada color del muñeco va al color de la foto en la misma posición de oscuro a claro
    mp = {s: dst[min(len(dst) - 1, round(i * (len(dst) - 1) / max(1, len(src) - 1)))] for i, s in enumerate(src)}
    report.append({'id': p['id'], 'name': p['name'], 'sheet': f, 'row': r, 'score': round(sc, 2), 'map': {str(k): v for k, v in mp.items()}})
    before = c.crop((0, y0, 48, y0 + 48)).copy()
    if not DRY or len(sample) < 40:
        row = c.crop((0, y0, c.width, y0 + 48)); px = row.load()
        for x in range(row.width):
            for y in range(48):
                q = px[x, y]
                if q[3] and q[:3] in mp: px[x, y] = mp[q[:3]] + (q[3],)
        after = row.crop((0, 0, 48, 48))
        if not DRY: c.paste(row, (0, y0))
        if len(sample) < 40: sample.append((before, after, fc.crop((0, r * 64, 64, r * 64 + 64))))
if not DRY:
    for name, im in cache.items():
        if name.startswith('c'): im.save(os.path.join(SP, name))
json.dump(report, open('/tmp/claude-0/hair_fix_report.json', 'w'), ensure_ascii=False, indent=1)
# muestra antes / después / foto
W = 8; out = Image.new('RGBA', (W * 170, ((len(sample) + W - 1) // W) * 70), (255, 255, 255, 255))
for i, (b, a, f) in enumerate(sample):
    x, y = (i % W) * 170, (i // W) * 70
    out.alpha_composite(b, (x, y + 8)); out.alpha_composite(a, (x + 50, y + 8)); out.alpha_composite(f, (x + 100, y))
out.resize((out.width * 2, out.height * 2), Image.NEAREST).save('/tmp/claude-0/hair_fix_sample.png')
print(('(prueba) ' if DRY else '') + 'jugadores recoloreados:', len(report))
