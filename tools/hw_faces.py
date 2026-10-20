# Retratos de miedo de los 5 legendarios de Halloween (juego/sprites/fhw.png, una fila de 64 px por jugador).
# Parte de los retratos del juego (fNN.png) y les pone maquillaje/cicatrices + color apagado.
# Uso: python3 tools/hw_faces.py
import os, colorsys
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SP = os.path.join(ROOT, 'juego', 'sprites')
SRC = [(112, 12), (1, 7), (136, 10), (136, 3), (135, 2)]   # Tassman, Nathan Jones, Destra, Hebimos, Bash Lancer

def face(f, r): return Image.open(os.path.join(SP, 'f%02d.png' % f)).convert('RGBA').crop((0, r * 64, 64, r * 64 + 64))
def remap(im, m):
    px = im.load()
    for x in range(64):
        for y in range(64):
            p = px[x, y]
            if p[3] and p[:3] in m: px[x, y] = m[p[:3]] + (p[3],)
def put(im, pts, col):
    px = im.load()
    for x, y in pts:
        if 0 <= x < 64 and 0 <= y < 64 and px[x, y][3]: px[x, y] = col + (255,)
def line(a, b):
    (x0, y0), (x1, y1) = a, b; n = max(abs(x1 - x0), abs(y1 - y0))
    return [(round(x0 + (x1 - x0) * t / n), round(y0 + (y1 - y0) * t / n)) for t in range(n + 1)]
BLOOD, BLOOD2, SCAR, STITCH = (150, 18, 24), (96, 8, 16), (120, 40, 50), (40, 24, 30)

def tassman(im):   # fantasma: piel gris azulada, venas oscuras bajo la venda
    remap(im, {(255, 222, 205): (196, 206, 222), (213, 180, 156): (140, 150, 176), (230, 205, 180): (168, 178, 200)})
    for s in (-1, 1):
        put(im, line((32 + s * 7, 37), (32 + s * 9, 43)) + line((32 + s * 9, 43), (32 + s * 8, 47)), (88, 70, 120))
    put(im, [(29, 47), (30, 48), (31, 48), (32, 48), (33, 48), (34, 47)], (60, 40, 80))   # boca oscura
def nathan(im):    # máscara de hockey con sangre y grietas
    put(im, line((40, 20), (36, 26)) + line((36, 26), (38, 30)) + line((24, 22), (27, 27)), (150, 130, 120))
    for x0, ys in ((23, 6), (25, 9), (38, 7), (40, 5), (33, 4)):
        put(im, [(x0, 38 + k) for k in range(ys)], BLOOD); put(im, [(x0, 38 + ys)], BLOOD2)
    put(im, [(43, 26), (44, 27), (42, 28), (45, 25), (44, 29), (46, 27), (20, 30), (19, 31), (21, 31)], BLOOD)
def destra(im):    # maquillaje de zombi: piel verdosa, ojeras moradas y puntos en la mejilla
    remap(im, {(205, 148, 106): (150, 168, 128), (172, 115, 57): (108, 128, 88), (189, 131, 82): (128, 148, 108),
               (213, 164, 123): (166, 180, 140), (123, 65, 41): (78, 92, 62), (222, 213, 197): (200, 210, 180)})
    for cx in (25, 39):
        put(im, [(cx - 3, 45), (cx - 2, 46), (cx - 1, 46), (cx, 46), (cx + 1, 46), (cx + 2, 46), (cx + 3, 45)], (92, 60, 104))
    put(im, line((34, 49), (42, 52)), STITCH)
    for x in (35, 38, 41): put(im, [(x, 48), (x, 51) if x < 41 else (x, 53)], STITCH)
    put(im, [(29, 55), (29, 56), (30, 57)], BLOOD)
def hebimos(im):   # cicatriz grande cruzando la cara, con puntos
    pts = line((40, 34), (46, 54))
    put(im, pts, SCAR); put(im, [(x + 1, y) for x, y in pts], (210, 150, 150))
    for k in range(2, len(pts) - 1, 4): x, y = pts[k]; put(im, [(x - 1, y + 1), (x + 2, y - 1)], STITCH)
    put(im, line((19, 40), (25, 50)), SCAR); put(im, [(20, 42), (23, 46)], STITCH)
def bash(im):      # vampiro: piel pálida, sangre en la boca y cicatriz en el ojo
    remap(im, {(189, 123, 74): (196, 186, 198), (156, 90, 41): (150, 134, 156), (172, 106, 57): (174, 160, 178),
               (213, 131, 74): (214, 204, 216), (123, 65, 41): (112, 92, 118), (82, 49, 32): (70, 52, 76)})
    put(im, [(28, 47), (28, 48), (29, 49), (28, 50), (34, 47), (34, 48), (34, 49)], BLOOD); put(im, [(29, 51), (34, 50)], BLOOD2)
    put(im, line((38, 30), (41, 41)), SCAR); put(im, line((39, 30), (42, 41)), (230, 190, 200))

def grade(im):     # color apagado: menos saturación, algo más oscuro y un toque morado
    px = im.load()
    for x in range(64):
        for y in range(64):
            r, g, b, a = px[x, y]
            if not a: continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            r2, g2, b2 = colorsys.hls_to_rgb(h, l * 0.82, s * 0.5)
            px[x, y] = (int(min(255, r2 * 255 * 0.95 + 10)), int(g2 * 255 * 0.92), int(min(255, b2 * 255 * 1.0 + 16)), a)

out = Image.new('RGBA', (64, 64 * len(SRC)), (0, 0, 0, 0))
for i, ((f, r), fx) in enumerate(zip(SRC, (tassman, nathan, destra, hebimos, bash))):
    im = face(f, r); fx(im); grade(im); out.paste(im, (0, i * 64))
out.save(os.path.join(SP, 'fhw.png'))
big = Image.new('RGBA', (64 * 5 * 5, 320), (240, 240, 240, 255))
for i in range(5): big.alpha_composite(out.crop((0, i * 64, 64, i * 64 + 64)).resize((320, 320), Image.NEAREST), (i * 320, 0))
big.save('/tmp/claude-0/fhw_big.png'); print('ok')
