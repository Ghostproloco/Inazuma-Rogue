# Willy Glass LEYENDA: su muñeco y su retrato con una corona dorada encima (evento Cadena Leyenda).
# Crea juego/sprites/c161.png (1 fila de 48 px) y f161.png (1 retrato de 64 px) a partir de c00.png fila 3 y f00.png fila 3.
from PIL import Image
S = 'juego/sprites/'
O, G, L, B, W, R, U = (90, 58, 0, 255), (255, 210, 58, 255), (255, 244, 170, 255), (214, 150, 24, 255), (255, 255, 255, 255), (230, 40, 70, 255), (60, 170, 255, 255)
SMALL = [   # 9×5 (muñeco)
  'O...O...O',
  'GO.OLO.OG',
  'GGOGRGOGG',
  'GLGGGGGLG',
  'BBBBBBBBB']
BIG = [     # 15×9 (retrato)
  '.O.....O.....O.',
  'OLO...OLO...OLO',
  'OGO..OGLGO..OGO',
  'OGGO.OGGGO.OGGO',
  'OGGGOGGRGGOGGGO',
  'OGLGGGGGGGGGLGO',
  'OGGGGGGGGGGGGGO',
  'OBWBWBUBUBWBWBO',
  'OOOOOOOOOOOOOOO']
COL = {'O': O, 'G': G, 'L': L, 'B': B, 'W': W, 'R': R, 'U': U}
def stamp(img, art, x0, y0):
    for j, row in enumerate(art):
        for i, ch in enumerate(row):
            if ch in COL and 0 <= x0 + i < img.width and 0 <= y0 + j < img.height: img.putpixel((x0 + i, y0 + j), COL[ch])
def head_top(fr, rows=3):
    a = fr.getchannel('A'); w, h = fr.size
    for y in range(h):
        xs = [x for x in range(w) if a.getpixel((x, y)) > 0]
        if xs:
            xs2 = []
            for yy in range(y, min(h, y + rows)): xs2 += [x for x in range(w) if a.getpixel((x, yy)) > 0]
            return y, (min(xs2) + max(xs2)) / 2
    return None, None
c = Image.open(S + 'c00.png').convert('RGBA')
row = c.crop((0, 3 * 48, c.width, 4 * 48))
out = row.copy()
for k in range(row.width // 48):
    fr = row.crop((k * 48, 0, k * 48 + 48, 48)); bb = fr.getbbox()
    if not bb or (bb[2] - bb[0]) >= (bb[3] - bb[1]): continue   # tumbado: sin corona
    y, x = head_top(fr)
    stamp(out, SMALL, k * 48 + round(x) - 4, y - 3)
out.save(S + 'c161.png')
f = Image.open(S + 'f00.png').convert('RGBA').crop((0, 3 * 64, 64, 4 * 64))
y, x = head_top(f, 6)
stamp(f, BIG, round(x) - 7, max(0, y - 3))
f.save(S + 'f161.png')
print('ok', out.size, f.size, 'cara: pelo arriba en', y)
