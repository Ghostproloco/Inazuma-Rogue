# Muñecos del partido de los jugadores del Inazuma 3, sacados de los datos del juego original (DS / 3DS, carpeta data_iz).
# En el juego cada muñeco se monta con un CUERPO (spr/char/pcb) y una CABEZA (spr/char/pch) con su paleta (pph):
#   - unitbase.dat: 104 bytes por jugador; el id del juego es 30000 + n.º de ficha. Bytes 84-85 = cabeza, 86-87 = paleta de la cabeza.
#   - Los archivos van dentro de .pkh/.pkb con el CRC32 del nombre: pch%08d.pac_ (cabeza*100), pph%04d.PLT, pcb%08d.pac_, ppb%04d.PLT.
#   - Cada .pac_ (LZ10) tiene 72 fotogramas; cada fotograma: ancho, alto, x, y y la posición de su imagen (4 bpp, lineal).
#   - Cuerpo: el 1 con la paleta 1 (la del Raimon, amarilla y azul, como las hojas del 1 y del 2: así se le puede cambiar la equipación al jugar);
#     los porteros, con la paleta 2 (equipación de portero naranja, como en las hojas del 1 y del 2);
#     su piel (colores 13-15) se toma de la paleta de la cabeza para que brazos y piernas sean del mismo tono que la cara.
# Las 47 columnas de cada fila son los fotogramas GAME.frames (los mismos números que en el juego original).
# Uso: python3 tools/ie3_sprites.py "/ruta/a/data_iz" [--only id,id,...] [--dry]
import os, sys, json, struct, zlib
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SP = os.path.join(ROOT, 'juego', 'sprites')
D = sys.argv[1].rstrip('/') + '/'
ONLY = set(int(x) for x in sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
DRY = '--dry' in sys.argv

def lz10(d):
    n = d[1] | d[2] << 8 | d[3] << 16; out = bytearray(); i = 4
    while len(out) < n:
        f = d[i]; i += 1
        for b in range(8):
            if len(out) >= n: break
            if f & (0x80 >> b):
                x = d[i] << 8 | d[i + 1]; i += 2
                for _ in range((x >> 12) + 3): out.append(out[-((x & 0xfff) + 1)])
            else: out.append(d[i]); i += 1
    return bytes(out)
class Pack:
    def __init__(s, path):
        h = open(D + path + '.pkh', 'rb').read(); s.b = open(D + path + '.pkb', 'rb').read()
        s.ent = {e[0]: e for e in (struct.unpack_from('<4I', h, i) for i in range(0, len(h), 16))}
    def get(s, name):
        for nm in (name, name.lower(), name.upper()):
            e = s.ent.get(zlib.crc32(nm.encode()))
            if e:
                d = s.b[e[1]:e[1] + e[2]]
                return lz10(d) if e[3] and d[:1] == b'\x10' else d
        return None
PCH, PCB, PPH, PPB = (Pack('spr/char/' + n) for n in ('pch', 'pcb', 'pph', 'ppb'))
def pal(d): return [((v & 31) * 255 // 31, ((v >> 5) & 31) * 255 // 31, ((v >> 10) & 31) * 255 // 31) for v in struct.unpack('<16H', d[:32])]
def frames(d):
    h = struct.unpack_from('<6I', d, 0); S = 0x20; w = struct.unpack_from('<4I', d, S); F = S + w[1]
    n, _ = struct.unpack_from('<HH', d, F); fo = struct.unpack_from('<%dI' % n, d, F + 4)
    return h, [struct.unpack_from('<14h', d, S + o) for o in fo]
def draw(cv, d, h, r, P, ox, oy):
    W, H = r[2], r[3]; off = h[3] + (r[12] & 0xffff); px = cv.load()
    for i in range(W * H):
        c = (d[off + i // 2] >> ((i & 1) * 4)) & 15
        x, y = ox + r[6] + i % W, oy + r[7] + i // W
        if c and 0 <= x < 48 and 0 <= y < 48: px[x, y] = P[c] + (255,)

G = json.load(open(os.path.join(ROOT, 'juego', 'gamedata.json')))
FR = G['frames']
U = open(D + 'logic/unitbase.dat', 'rb').read()
body = PCB.get('pcb%08d.pac_' % 100); bh, bf = frames(body); bpal0 = pal(PPB.get('ppb%04d.PLT' % 1)); bpalgk = pal(PPB.get('ppb%04d.PLT' % 2))   # 2 = equipación de portero
sheets, done, miss = {}, 0, []
for p in G['players']:
    cs = p.get('cs')
    if not cs or cs[0] < 112 or not (30000 <= p['id'] < 40000) or (ONLY and p['id'] not in ONLY): continue
    u = p['id'] - 30000
    if u * 104 + 104 > len(U): miss.append(p['id']); continue
    head_n, pal_n = struct.unpack_from('<HH', U, u * 104 + 84)
    head = PCH.get('pch%08d.pac_' % (head_n * 100)); hp = PPH.get('pph%04d.PLT' % pal_n)
    if not head or not hp: miss.append(p['id']); continue
    hh, hf = frames(head); HP = pal(hp); BP = (bpalgk if p['role'] == 'POR' else bpal0)[:13] + HP[13:16]
    row = Image.new('RGBA', (48 * len(FR), 48), (0, 0, 0, 0))
    for col, k in enumerate(FR):
        cv = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        draw(cv, body, bh, bf[k], BP, 8, 12); draw(cv, head, hh, hf[k], HP, 8, 12)
        row.alpha_composite(cv, (col * 48, 0))
    name = 'c%d.png' % cs[0]
    if name not in sheets: sheets[name] = Image.open(os.path.join(SP, name)).convert('RGBA')
    sh = sheets[name]; sh.paste(Image.new('RGBA', (sh.width, 48), (0, 0, 0, 0)), (0, cs[1] * 48)); sh.paste(row, (0, cs[1] * 48))
    done += 1
if not DRY:
    for name, sh in sheets.items(): sh.save(os.path.join(SP, name), optimize=True)
print('muñecos rehechos:', done, '· hojas:', len(sheets), '· sin datos:', miss)
