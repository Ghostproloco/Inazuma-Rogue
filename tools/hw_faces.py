# Retratos de miedo de los 6 legendarios y del Jim épico especial de Halloween (juego/sprites/fhw2.png, una fila de 64 px por jugador).
# Parte de los retratos del juego (fNN.png) y les pone maquillaje/cicatrices + color apagado.
# Uso: python3 tools/hw_faces.py
import os, colorsys
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SP = os.path.join(ROOT, 'juego', 'sprites')
SRC = [(112, 12), (1, 7), (136, 10), (136, 3), (135, 2), (76, 15), (82, 10)]   # Tassman, Nathan Jones, Destra, Hebimos, Bash Lancer, Zohen, Jim (Oscuro, épico especial)
# Filas 7-12 (evento rehecho el 28 oct): Astaroth, Bump Trungus, Bellatrix, Oni Triumvir, Gaiel y Sael (épico especial). Las filas 0-6 siguen para quien ya las tenga.
SRC += [(136, 0), (134, 12), (64, 11), (134, 13), (135, 14), (135, 15)]

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
def zohen(im):     # necrófago: piel gris verdosa, ojos rojos que brillan y máscara agrietada que gotea
    px = im.load()
    for x in range(20, 46):
        for y in range(26, 36):
            q = px[x, y]
            if q[3] and sum(q[:3]) > 560: px[x, y] = (255, 64, 48, 255)   # solo el blanco de los ojos, rojo vivo
    remap(im, {(180, 148, 123): (150, 160, 140), (148, 115, 90): (118, 128, 110), (106, 74, 57): (80, 90, 76), (213, 131, 74): (160, 150, 120)})
    put(im, line((27, 38), (30, 43)) + line((30, 43), (29, 46)) + line((38, 38), (36, 43)), (150, 140, 130))   # grietas
    for x0, n in ((27, 3), (32, 5), (38, 3)):
        put(im, [(x0, 48 + k) for k in range(n)], (120, 190, 70))   # gotas tóxicas

def jim(im):       # espantapájaros del bosque: piel de fantasma, pelo musgo, un ojo verde entre el pelo y boca cosida
    remap(im, {(213, 139, 90): (176, 184, 196), (164, 106, 65): (128, 136, 152), (123, 82, 57): (88, 92, 112),
               (238, 180, 115): (208, 214, 222), (213, 131, 74): (160, 168, 184), (82, 49, 16): (52, 52, 70),
               (189, 156, 156): (132, 150, 120), (164, 131, 139): (108, 124, 100), (148, 115, 115): (94, 110, 86),
               (180, 148, 148): (122, 140, 110), (123, 90, 90): (76, 90, 70), (98, 74, 74): (60, 72, 56)})
    put(im, line((29, 44), (37, 44)), STITCH)
    for x in (30, 32, 34, 36): put(im, [(x, 43), (x, 45)], STITCH)   # boca cosida
    put(im, [(28, 47), (28, 48), (37, 47)], (96, 70, 110))
def jim_eye(im):   # después del color apagado, para que brille: ojo almendrado verde entre el pelo
    glow = [(30, 35), (31, 34), (32, 34), (33, 34), (34, 34), (35, 35), (31, 36), (32, 36), (33, 36), (34, 36), (30, 36), (35, 36)]
    put(im, [(29, 35), (36, 35), (32, 33), (33, 33), (32, 37), (33, 37)], (36, 90, 44))
    put(im, glow, (90, 200, 80)); put(im, [(31, 35), (32, 35), (33, 35), (34, 35)], (190, 255, 150)); put(im, [(32, 35)], (20, 30, 20))


def tint(im, col, k=0.85):   # tiñe solo la piel (tonos naranja/rosa) hacia un color, conservando las luces y sombras
    px = im.load()
    for x in range(64):
        for y in range(64):
            r, g, b, a = px[x, y]
            if not a: continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if 0.0 <= h <= 0.12 and s > 0.18 and 0.3 < l < 0.9:
                f = l / 0.62
                px[x, y] = tuple(int(max(0, min(255, c * f * k + v * (1 - k)))) for c, v in zip(col, (r, g, b))) + (a,)
def eyes(im, col):   # el blanco de los ojos brilla
    px = im.load()
    for x in range(18, 48):
        for y in range(25, 38):
            q = px[x, y]
            if q[3] and sum(q[:3]) > 600 and max(q[:3]) - min(q[:3]) < 36: px[x, y] = col + (255,)   # solo el blanco (neutro), no la piel clara
def drips(im, xs, col, col2):
    for x0, n in xs:
        put(im, [(x0, 40 + k) for k in range(n)], col); put(im, [(x0, 40 + n)], col2)
def astaroth(im):   # demonio: piel roja oscura, ojos amarillos y grietas de brasa
    eyes(im, (255, 214, 40)); tint(im, (150, 36, 40))
    put(im, line((22, 38), (25, 44)) + line((41, 38), (39, 45)), (255, 120, 30)); put(im, [(30, 49), (31, 49), (32, 49), (33, 49)], (60, 10, 16))
def bump(im):       # ogro zombi: piel verde, puntos de sutura en la frente y colmillo
    eyes(im, (230, 240, 120)); tint(im, (110, 150, 80))
    put(im, line((22, 20), (40, 18)), STITCH)
    for x in (25, 29, 33, 37): put(im, [(x, 18), (x, 21)], STITCH)
    put(im, [(27, 50), (27, 51), (36, 50), (36, 51)], (236, 232, 200))
def bellatrix(im):  # vampira: piel de cera, ojos rojos y sangre en los labios
    eyes(im, (255, 50, 60)); tint(im, (214, 200, 214), 0.9)
    put(im, [(29, 47), (30, 47), (31, 47), (32, 47), (33, 47), (34, 47)], BLOOD); drips(im, [(31, 3)], BLOOD, BLOOD2)
    put(im, line((38, 36), (39, 44)), (120, 20, 40))
def oni(im):        # máscara oni: piel azul, lágrimas de sangre y grietas blancas
    eyes(im, (255, 255, 255)); tint(im, (96, 120, 190))
    drips(im, [(24, 6), (40, 8)], BLOOD, BLOOD2)
    put(im, line((32, 24), (30, 30)) + line((30, 30), (33, 34)), (230, 230, 240)); put(im, [(28, 49), (28, 50), (35, 49), (35, 50)], (236, 232, 200))
def gaiel(im):      # espectro: piel azul hielo, ojos cian que brillan y venas oscuras
    eyes(im, (110, 255, 250)); tint(im, (150, 200, 220))
    for s in (-1, 1): put(im, line((32 + s * 6, 40), (32 + s * 9, 47)) + line((32 + s * 9, 47), (32 + s * 7, 52)), (50, 80, 120))
    put(im, [(30, 49), (31, 49), (32, 49), (33, 49)], (30, 40, 70))
def sael(im):       # maldito: piel morada con calavera pintada y ojos verdes
    eyes(im, (120, 255, 100)); tint(im, (140, 100, 180))
    put(im, [(26, 37), (27, 38), (28, 39), (26, 39), (27, 37), (28, 37)], (30, 20, 40)); put(im, [(37, 37), (36, 38), (35, 39), (37, 39), (36, 37), (35, 37)], (30, 20, 40))   # cuencas
    for x in range(27, 38, 2): put(im, [(x, 48), (x, 49), (x, 50)], (240, 236, 224))   # dientes pintados
    put(im, line((27, 48), (37, 48)) + line((27, 51), (37, 51)), (30, 20, 40))

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
for i, ((f, r), fx) in enumerate(zip(SRC, (tassman, nathan, destra, hebimos, bash, zohen, jim, astaroth, bump, bellatrix, oni, gaiel, sael))):
    im = face(f, r); fx(im); grade(im)
    if fx is jim: jim_eye(im)
    out.paste(im, (0, i * 64))
out.save(os.path.join(SP, 'fhw2.png'))   # fhw2: nombre nuevo para saltarse la caché del navegador
big = Image.new('RGBA', (320 * len(SRC), 320), (240, 240, 240, 255))
for i in range(len(SRC)): big.alpha_composite(out.crop((0, i * 64, 64, i * 64 + 64)).resize((320, 320), Image.NEAREST), (i * 320, 0))
big.save('/tmp/fhw_big.png'); print('ok')
