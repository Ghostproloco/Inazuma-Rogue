# Saca los colores de la equipación de cada equipo a partir de sus sprites de rival (rNN.png)
# y los guarda en juego/gamedata.json como «kitAuto» ({a: camiseta, b: pantalón}).
# Sirve para vestir con los colores del club a los jugadores que tienen sprite de colección
# (con la ropa del Raimon) cuando juegan en ese club en el modo Carrera.
# Uso: python3 tools/kits.py
import json, os
from collections import Counter
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..', 'juego')
G = json.load(open(os.path.join(ROOT, 'gamedata.json')))
sheets = {}
def frame(file, row):
    if file not in sheets: sheets[file] = Image.open(os.path.join(ROOT, 'sprites', file)).convert('RGBA')
    return sheets[file].crop((0, row * 48, 48, row * 48 + 48))
def colors(f, y0, y1):
    return Counter(f.getpixel((x, y))[:3] for y in range(y0, y1) for x in range(6, 42) if f.getpixel((x, y))[3])
lum = lambda c: c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114
hexc = lambda c: '#%02x%02x%02x' % c
out = {}
for t in G['teams']:
    field = [p for p in t['players'] if p['role'] != 'POR' and p.get('file', '').startswith('r')]
    if not field: continue
    shirt, shorts = Counter(), Counter()
    for p in field:
        f = frame(p['file'], p['row'])
        head = set(colors(f, 12, 26))                 # pelo, piel y contorno: no son ropa
        for c, n in colors(f, 27, 34).items():
            if c not in head: shirt[c] += n
        for c, n in colors(f, 34, 38).items():
            if c not in head: shorts[c] += n
    if not shirt: continue
    a = max(shirt.items(), key=lambda kv: kv[1] * (1 if 40 < lum(kv[0]) < 235 else 0.4))[0]
    rest = [(c, n) for c, n in shorts.items() if c != a]
    b = max(rest, key=lambda kv: kv[1])[0] if rest else a
    out[t['key']] = {'a': hexc(a), 'b': hexc(b)}
for t in G['teams']:
    if t['key'] in out: t['kitAuto'] = out[t['key']]
json.dump(G, open(os.path.join(ROOT, 'gamedata.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'equipos'); [print(' ', k, v) for k, v in out.items()]
