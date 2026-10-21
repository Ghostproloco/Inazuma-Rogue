# Corrige el desfase de los muñecos del partido en las hojas c118..c136 (Inazuma 3).
# Desde la fila 7 de c118 hay un muñeco de más, así que cada jugador hasta la fila 9 de c136 tenía el muñeco
# del jugador anterior (p. ej. Partinus salía con pelo marrón en vez de azul claro). Se comprobó comparando el
# color del pelo de cada foto (fNN.png) con los muñecos y alineando las dos listas: el mejor ajuste es un único
# muñeco sobrante en c118 fila 7 y ningún muñeco para c136 fila 10.
# Este script sube una fila todos los muñecos de c118 fila 8 .. c136 fila 10 (se ejecuta UNA sola vez).
# A c136 fila 10 (que se queda sin muñeco propio) se le pone su mismo muñeco con el pelo recoloreado como su foto
# (lo hace después tools/fix_sprite_hair.py --only 136,10).
import os
from PIL import Image
SP = os.path.join(os.path.dirname(__file__), '..', 'juego', 'sprites')
ROWS = 16
def glob(s, r): return (s - 118) * ROWS + r
first, last = glob(118, 8), glob(136, 10)   # muñecos que se suben una fila
sheets = {s: Image.open(os.path.join(SP, 'c%d.png' % s)).convert('RGBA') for s in range(118, 137)}
src = {s: im.copy() for s, im in sheets.items()}
W = sheets[118].width
for k in range(first, last + 1):
    s, r = 118 + k // ROWS, k % ROWS
    t = k - 1; ts, tr = 118 + t // ROWS, t % ROWS
    sheets[ts].paste(src[s].crop((0, r * 48, W, r * 48 + 48)), (0, tr * 48))
for s, im in sheets.items(): im.save(os.path.join(SP, 'c%d.png' % s))
print('muñecos subidos una fila:', last - first + 1)
