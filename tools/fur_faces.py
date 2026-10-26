# Retratos «modo furia» de los 4 jugadores limitados (juego/sprites/ffur.png, una fila de 64 px por jugador, mismo orden que LM_PLAYERS).
# Parte de los retratos normales (fNN.png): aura de fuego/rayos del color de cada uno, ojos brillantes, cejas fruncidas y venas.
# Uso: python3 tools/fur_faces.py
import os, random, math
from PIL import Image, ImageFilter, ImageEnhance
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SP = os.path.join(ROOT, 'juego', 'sprites')
# (fichero, fila, color del aura, color del destello, ojos izq/der, y de las cejas)
SRC = [
  (1, 1,   (120, 225, 255), (255, 255, 255), ((30, 36), (44, 36))),    # Samford (hielo)
  (126, 7, (255, 205, 40),  (255, 245, 160), ((27, 34), (42, 34))),    # Da Silva (oro)
  (126, 15, (50, 255, 130), (230, 255, 215), ((25, 37), (40, 37))),    # Almeida (esmeralda)
  (114, 10, (60, 210, 255), (255, 226, 120), ((26, 32), (38, 32))),    # Trick (relámpago)
]
def face(f, r): return Image.open(os.path.join(SP, 'f%02d.png' % f)).convert('RGBA').crop((0, r * 64, 64, r * 64 + 64))
def furia(im, a, b, eyes, seed):
    rnd = random.Random(seed)
    # 1) más contraste y color
    rgb = im.convert('RGB'); rgb = ImageEnhance.Contrast(rgb).enhance(1.25); rgb = ImageEnhance.Color(rgb).enhance(1.3)
    base = Image.merge('RGBA', (*rgb.split(), im.split()[3]))
    px = base.load()
    # 2) venas de furia en las sienes y cejas fruncidas
    for (ex, ey), s in zip(eyes, (-1, 1)):
        for k in range(4):   # ceja diagonal hacia el centro
            x, y = ex - s * 4 + s * k * 2 + (0), ey - 6 + (k if s == -1 else k) * 0
        for k in range(7):
            x = ex - 4 + k if s == -1 else ex + 4 - k
            y = ey - 6 + (k // 2 if s == -1 else k // 2)
            if 0 <= x < 64 and 0 <= y < 64 and px[x, y][3]: px[x, y] = (40, 20, 20, 255)
        for dx in (-1, 0, 1):   # ojo brillante
            for dy in (0, 1):
                x, y = ex + dx, ey + dy
                if 0 <= x < 64 and 0 <= y < 64 and px[x, y][3]: px[x, y] = b + (255,) if dy == 0 else a + (255,)
    for s in (-1, 1):   # vena en la sien
        x0 = 32 + s * 17
        for k in range(5):
            x, y = x0 + s * (k % 2), 24 + k * 2
            if 0 <= x < 64 and px[x, y][3]: px[x, y] = (210, 40, 40, 255)
    # 3) aura: silueta dilatada y desenfocada del color de cada uno + llamas dentadas
    alpha = base.split()[3]
    glow = alpha.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(2.2))
    bg = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    gp = bg.load(); gl = glow.load(); al = alpha.load()
    for x in range(64):
        for y in range(64):
            v = gl[x, y]
            if v > 8 and al[x, y] < 200:
                flick = 0.75 + 0.25 * math.sin(x * 0.9 + y * 0.6 + seed)
                t = min(1.0, v / 255 * 1.5 * flick)
                col = tuple(int(a[i] * t + b[i] * max(0, t - 0.65) * 1.2) for i in range(3))
                gp[x, y] = (min(255, col[0]), min(255, col[1]), min(255, col[2]), int(230 * min(1, t * 1.3)))
    for _ in range(14):   # chispas
        x, y = rnd.randrange(2, 62), rnd.randrange(2, 62)
        if al[x, y] < 50: gp[x, y] = b + (255,)
    for _ in range(3):    # rayos en zigzag por los bordes
        x, y = rnd.choice((rnd.randrange(1, 10), rnd.randrange(54, 63))), rnd.randrange(2, 20)
        for k in range(10):
            if 0 <= x < 64 and 0 <= y < 64 and al[x, y] < 50: gp[x, y] = b + (255,)
            x += rnd.choice((-1, 1)); y += 2
    out = bg; out.alpha_composite(base)
    return out
sheet = Image.new('RGBA', (64, 64 * len(SRC)), (0, 0, 0, 0))
for i, (f, r, a, b, eyes) in enumerate(SRC):
    sheet.paste(furia(face(f, r), a, b, eyes, 7 + i * 13), (0, i * 64))
sheet.save(os.path.join(SP, 'ffur.png'))
big = sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST)
os.makedirs('/home/claude', exist_ok=True)
row = Image.new('RGBA', (64 * 4 * len(SRC), 64 * 4), (24, 24, 34, 255))
for i in range(len(SRC)): row.alpha_composite(big.crop((0, i * 256, 256, i * 256 + 256)), (i * 256, 0))
row.save('/home/claude/fur_preview.png')
print('ok', sheet.size)
