# Equipos del Inazuma 2 que faltaban (Servicio Secreto, Mary Times, Triple C y Mar de Árboles), sacados de los juegos originales.
#  - Plantilla y estadísticas: datos del Inazuma 2 (logic/sp: team.pkb 320 bytes por equipo, unitbase.dat 96 bytes, unitstat.dat 80 bytes).
#    Estadísticas = valor máximo de cada una (Tiro, Físico, Control, Defensa, Rapidez, Aguante); técnicas = las 4 que aprende.
#  - Nombre, puesto, elemento y muñeco: datos del Inazuma 3 (mismo número de jugador). Los nuevos llevan el id de los del 2 (20000 + n.º de ficha del 2).
#  - Foto: cara (face2d/fac) sobre el busto con la camiseta de su equipo (face2d/fab) del Inazuma 2.
#  - Escudo: hecho aquí con los colores de su camiseta. Muñecos en sprites/c160.png, fotos en sprites/f160.png.
# Uso: python3 tools/ie2_teams.py "<ruta>/Datafiles ie2/data_iz" "<ruta>/Datafiles ie3/data_iz"
import os, sys, json, struct, zlib, colorsys
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SP, UI = os.path.join(ROOT, 'juego', 'sprites'), os.path.join(ROOT, 'juego', 'ui')
D2, D3 = sys.argv[1].rstrip('/') + '/', sys.argv[2].rstrip('/') + '/'
SHEET = 160
TEAMS = [('Servicio Secreto', 'Servicio Secreto', 4101), ('Mary Times', 'Mary Times', 4102), ('Triple C', 'Triple C', 4103), ('Mar de', 'Mar de Árboles', 4104)]
# Equipos sin busto propio en el juego: camiseta del Raimon teñida de este color (y esta equipación)
NAME_EN = {'Servicio Secreto': 'Secret Service', 'Mar de Árboles': 'Sea of Trees'}
NO_FAB = {'Mar de Árboles': ((47, 122, 58), (106, 74, 42))}
ELEM = {1: 'viento', 2: 'bosque', 3: 'fuego', 4: 'montaña'}
ROLE = {32: 'POR', 64: 'DEF', 96: 'MED', 128: 'DEL'}
KEYS6 = ['tiro', 'fisico', 'control', 'defensa', 'rapidez', 'aguante']

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
def pal(d, o=0): return [((v & 31) * 255 // 31, ((v >> 5) & 31) * 255 // 31, ((v >> 10) & 31) * 255 // 31) for v in struct.unpack_from('<16H', d, o)]
class Hashed:   # .pkh/.pkb con el CRC32 del nombre (muñecos)
    def __init__(s, path):
        h = open(path + '.pkh', 'rb').read(); s.b = open(path + '.pkb', 'rb').read()
        s.ent = {e[0]: e for e in (struct.unpack_from('<4I', h, i) for i in range(0, len(h), 16))}
    def get(s, name):
        for nm in (name, name.lower(), name.upper()):
            e = s.ent.get(zlib.crc32(nm.encode()))
            if e: d = s.b[e[1]:e[1] + e[2]]; return lz10(d) if e[3] and d[:1] == b'\x10' else d
class Numbered:   # .pkh «PackNum» con el número del archivo (caras y bustos)
    def __init__(s, path):
        h = open(path + '.pkh', 'rb').read(); s.b = open(path + '.pkb', 'rb').read(); n = struct.unpack_from('<H', h, 22)[0]
        s.ent = {e[0]: e for e in (struct.unpack_from('<3I', h, 0x30 + 12 * i) for i in range(n))}
    def get(s, key):
        e = s.ent.get(key); return lz10(s.b[e[1]:e[1] + e[2]]) if e else None
def img64(d):   # imagen de 64×64 en baldosas de 8×8, 4 bpp, paleta en 0x40
    P = pal(d, 0x40); im = Image.new('RGBA', (64, 64), (0, 0, 0, 0)); px = im.load()
    for i in range(4096):
        c = (d[0xe0 + i // 2] >> ((i & 1) * 4)) & 15; t, w = i // 64, i % 64
        if c: px[(t % 8) * 8 + w % 8, (t // 8) * 8 + w // 8] = P[c] + (255,)
    return im

# ---------- datos ----------
G = json.load(open(os.path.join(ROOT, 'juego', 'gamedata.json'))); PBY = {p['id']: p for p in G['players']}
T2 = open(D2 + 'logic/sp/team.pkb', 'rb').read(); U2 = open(D2 + 'logic/sp/unitbase.dat', 'rb').read(); S2 = open(D2 + 'logic/sp/unitstat.dat', 'rb').read()
N2 = struct.unpack('<%dH' % (len(open(D2 + 'logic/sp/unitno.dat', 'rb').read()) // 2), open(D2 + 'logic/sp/unitno.dat', 'rb').read())
U3 = open(D3 + 'logic/unitbase.dat', 'rb').read(); b3 = open(D3 + 'logic/unitno.dat', 'rb').read(); N3 = struct.unpack('<%dH' % (len(b3) // 2), b3)
I2 = {n: i for i, n in enumerate(N2)}; I3 = {n: i for i, n in enumerate(N3)}
FAC, FAB = Numbered(D2 + 'face2d/fac'), Numbered(D2 + 'face2d/fab')
PCH, PCB, PPH, PPB = (Hashed(D3 + 'spr/char/' + n) for n in ('pch', 'pcb', 'pph', 'ppb'))
def frames(d):
    h = struct.unpack_from('<6I', d, 0); S = 0x20; w = struct.unpack_from('<4I', d, S); F = S + w[1]
    n, _ = struct.unpack_from('<HH', d, F); fo = struct.unpack_from('<%dI' % n, d, F + 4)
    return h, [struct.unpack_from('<14h', d, S + o) for o in fo]
def draw(cv, d, h, r, P, ox, oy):
    W, H = r[2], r[3]; off = h[3] + (r[12] & 0xffff); px = cv.load()
    for i in range(W * H):
        c = (d[off + i // 2] >> ((i & 1) * 4)) & 15; x, y = ox + r[6] + i % W, oy + r[7] + i // W
        if c and 0 <= x < 48 and 0 <= y < 48: px[x, y] = P[c] + (255,)
BODY = PCB.get('pcb%08d.pac_' % 100); BH, BF = frames(BODY); BP_FIELD = pal(PPB.get('ppb%04d.PLT' % 1)); BP_GK = pal(PPB.get('ppb%04d.PLT' % 2))
def sprite_row(i3, role):
    head_n, pal_n = struct.unpack_from('<HH', U3, i3 * 104 + 84)
    head = PCH.get('pch%08d.pac_' % (head_n * 100)); HP = pal(PPH.get('pph%04d.PLT' % pal_n)); hh, hf = frames(head)
    BP = (BP_GK if role == 'POR' else BP_FIELD)[:13] + HP[13:16]
    row = Image.new('RGBA', (48 * len(G['frames']), 48), (0, 0, 0, 0))
    for col, k in enumerate(G['frames']):
        cv = Image.new('RGBA', (48, 48), (0, 0, 0, 0)); draw(cv, BODY, BH, BF[k], BP, 8, 12); draw(cv, head, hh, hf[k], HP, 8, 12); row.alpha_composite(cv, (col * 48, 0))
    return row
def members(name):
    k = T2.find(name.encode()); rec = T2[k:k + 320]; out = []
    for o in range(0x40, 320 - 4, 8):
        unit = struct.unpack_from('<H', rec, o)[0]
        if unit in I2 and unit in I3: out.append((I2[unit], I3[unit]))
    return out
def stats(i2):
    s = S2[i2 * 80:i2 * 80 + 80]; mx = [s[17 + 4 * k] for k in range(6)]
    mv = [list(struct.unpack_from('<HH', s, 44 + 4 * k)) for k in range(4)]
    return dict(zip(KEYS6, mx)), [m for m in mv if str(m[0]) in G['techniques']]
txt = lambda b: b.split(b'\0')[0].decode('latin1')
crest_rows = []
sprites = Image.new('RGBA', (48 * len(G['frames']), 48 * 16), (0, 0, 0, 0)); faces = Image.new('RGBA', (64, 64 * 16), (0, 0, 0, 0)); row = 0
for search, tname, crest in TEAMS:
    mem = members(search)
    cand = []
    for i2, i3 in mem:
        r3 = U3[i3 * 104:(i3 + 1) * 104]; role = ROLE.get(r3[93], 'MED'); ie0, mv = stats(i2)
        cand.append(dict(i2=i2, i3=i3, role=role, ie0=ie0, mv=mv, tot=sum(ie0.values()), r3=r3))
    # Los 5: el mejor portero y los 4 mejores de campo (al menos un defensa, un medio y un delantero)
    gk = max((c for c in cand if c['role'] == 'POR'), key=lambda c: c['tot'])
    field = sorted((c for c in cand if c['role'] != 'POR'), key=lambda c: -c['tot']); pick = []
    for need in ('DEF', 'MED', 'DEL'):
        c = next((c for c in field if c['role'] == need and c not in pick), None)
        if c: pick.append(c)
    for c in field:
        if len(pick) < 4 and c not in pick: pick.append(c)
    five = [gk] + pick; tplayers = []
    team_code, = struct.unpack_from('<B', U2, gk['i2'] * 96 + 65)
    jersey = FAB.get(team_code * 1000000 + 10000)
    if not jersey:   # sin busto propio: el del Raimon con los colores de NO_FAB
        jersey = bytearray(FAB.get(1010000)); A, B = NO_FAB.get(tname, ((200, 200, 200), (90, 90, 90)))
        h0 = colorsys.rgb_to_hls(*[v / 255 for v in A])[0]
        for k in range(16):
            v = struct.unpack_from('<H', jersey, 0x40 + 2 * k)[0]; r, g, bb = (v & 31) / 31, ((v >> 5) & 31) / 31, ((v >> 10) & 31) / 31
            hh, ll, ss = colorsys.rgb_to_hls(r, g, bb)
            if ss > 0.35 and 0.5 < hh < 0.75:   # los azules de la camiseta
                r, g, bb = colorsys.hls_to_rgb(h0, ll, ss * 0.8); struct.pack_into('<H', jersey, 0x40 + 2 * k, round(r * 31) | round(g * 31) << 5 | round(bb * 31) << 10)
        jersey = bytes(jersey)
    for c in five:
        # Si ya está en el juego (versión del 2: 20000 + ficha del 2, o del 3: 30000 + ficha del 3), se usa esa; si no, se crea como jugador del 2
        r2 = U2[c['i2'] * 96:(c['i2'] + 1) * 96]
        pid = next((x for x in (20000 + c['i2'], 30000 + c['i3']) if x in PBY and PBY[x].get('cs')), 20000 + c['i2'])
        if pid not in PBY:
            ie = dict(c['ie0'])   # como los demás jugadores del 2: sus estadísticas máximas del juego
            avg = sum(ie[k] for k in ['tiro', 'control', 'defensa', 'rapidez', 'fisico']) / 5
            p = {'id': pid, 'name': txt(c['r3'][:28]), 'nick': txt(c['r3'][28:44]), 'role': c['role'],
                 'elem': ELEM.get(c['r3'][98], 'viento'), 'ie': ie, 'ie_orig': dict(c['ie0']), 'moves': c['mv'] or [[101, 1]],
                 'rarity': 'comun' if avg < 59.5 else 'rara' if avg < 69.5 else 'epica', 'gacha': True, 'banner': 2, 'cs': [SHEET, row]}
            sprites.paste(sprite_row(c['i3'], c['role']), (0, row * 48))
            fc = FAC.get(struct.unpack_from('<H', r2, 66)[0] * 100); bust = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
            if jersey: bust.alpha_composite(img64(jersey))
            if fc: bust.alpha_composite(img64(fc))
            faces.paste(bust, (0, row * 64)); row += 1
            G['players'].append(p); PBY[pid] = p
        p = PBY[pid]; tplayers.append({'id': pid, 'role': c['role'], 'file': 'c%02d.png' % p['cs'][0], 'row': p['cs'][1]})
    # Colores de la camiseta (para su equipación en el partido y su escudo)
    jp = pal(jersey, 0x40) if jersey else [(200, 200, 200)] * 16
    cols = sorted(set(jp[2:12]), key=lambda c: -colorsys.rgb_to_hls(*[v / 255 for v in c])[2] * 0)
    sat = sorted(jp[2:12], key=lambda c: -(max(c) - min(c)))
    a, b = (sat[0], sat[3] if len(sat) > 3 else (240, 240, 240)) if tname not in NO_FAB else NO_FAB[tname]
    kit = {'a': '#%02x%02x%02x' % a, 'b': '#%02x%02x%02x' % b}
    im = Image.new('RGBA', (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.polygon([(8, 6), (56, 6), (56, 34), (32, 60), (8, 34)], fill=a + (255,), outline=(30, 30, 40, 255), width=3)
    d.polygon([(32, 6), (56, 6), (56, 34), (32, 60)], fill=b + (255,))
    d.polygon([(8, 6), (56, 6), (56, 34), (32, 60), (8, 34)], outline=(30, 30, 40, 255), width=3)
    import unicodedata; ini = ''.join(unicodedata.normalize('NFD', w)[0] for w in tname.split() if w[0].isupper())[:2]; d.text((32, 26), ini, fill=(255, 255, 255, 255), anchor='mm', stroke_width=2, stroke_fill=(30, 30, 40, 255))
    im.save(os.path.join(UI, 'crest%d.png' % crest))
    key = tname
    G['teams'] = [t for t in G['teams'] if t['key'] != key]
    G['teams'].append({'key': key, 'name': tname, 'kind': 'chain', 'players': tplayers, 'avg': round(sum(sum(PBY[x['id']]['ie'].values()) for x in tplayers) / 5),
                       'crest': crest, 'kit': kit, 'kitAuto': kit, **({'name_en': NAME_EN[tname]} if tname in NAME_EN else {})})
    print(tname, '·', ', '.join('%s (%s)' % (PBY[x['id']]['name'], x['role']) for x in tplayers), '· equipación', kit)
if row:
    sprites.save(os.path.join(SP, 'c%d.png' % SHEET), optimize=True); faces.save(os.path.join(SP, 'f%d.png' % SHEET), optimize=True)
json.dump(G, open(os.path.join(ROOT, 'juego', 'gamedata.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('jugadores nuevos:', row)
