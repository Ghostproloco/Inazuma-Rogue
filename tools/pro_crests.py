# Escudos de la Liga Pro: recolorea el escudo de cada selección con los colores del club
# al que homenajea (Barça, Madrid, Milan…). Conserva sombreado, contornos negros y dorados.
# Uso: python3 tools/pro_crests.py   → juego/ui/crest4001.png … crest4010.png (+ vista previa en /tmp)
import colorsys, os, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
UI = os.path.join(ROOT, 'juego', 'ui')
hx = lambda h: tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
# id nuevo, escudo base, colores del club (por orden: principal, secundario, tercero), ¿mantener dorados?, opciones
# opciones: whites = color para las zonas blancas · merge = False para no juntar tonos parecidos
CLUBS = [
    (4001, 3054, ['#a50044', '#004d98', '#edbb00'], True, {'whites': '#004d98'}),   # Barcelona Atlètic · franjas azulgrana
    (4002, 3057, ['#f4f4f4', '#3d195b', '#febe10'], True, {}),    # Madrid Imperial · blanco, morado y oro
    (4003, 3059, ['#c8102e', '#1a1a1a', '#f4f4f4'], False, {'merge': False}),     # Milano Calcio · rojinegro, con cuernos de «diavolo»
    (4004, 3050, ['#db0007', '#f4f4f4', '#063672'], True, {}),    # London Royals · rojo y blanco
    (4005, 3058, ['#004170', '#da291c', '#f4f4f4'], True, {}),    # Paris Étoile · azul marino y rojo
    (4006, 3060, ['#dc052d', '#0066b2', '#f4f4f4'], True, {}),    # München Adler · rojo, blanco y azul
    (4007, 3055, ['#c4122e', '#111111', '#f4f4f4'], True, {}),    # Rio Samba FC · rojinegro
    (4008, 3052, ['#103f79', '#f3b229', '#f4f4f4'], False, {}),   # Buenos Aires Gauchos · azul y oro
    (4009, 3053, ['#00245d', '#ffd200', '#f4f4f4'], True, {}),    # Los Angeles Stars · azul marino y oro
    (4010, 3027, ['#f4f4f4', '#111111', '#7a7a7a'], True, {}),    # Doha Leones · blanco y negro
]

def family(rgb):
    """Grupo de color de un píxel: None si es negro, blanco o gris; 'oro' si es dorado; si no, el tono (0-11)."""
    h, l, s = colorsys.rgb_to_hls(*rgb)
    if s < 0.22 or l < 0.12 or l > 0.9: return None
    if 0.10 <= h <= 0.17 and s > 0.4: return 'oro'
    return int(h * 12) % 12

def recolor(src, targets, keep_gold, opt=None):
    opt = opt or {}
    im = Image.open(os.path.join(UI, f'crest{src}.png')).convert('RGBA')
    px = list(im.get_flattened_data()) if hasattr(im, 'get_flattened_data') else list(im.getdata())
    count = {}
    for p in px:
        if p[3] == 0: continue
        f = family(tuple(c / 255 for c in p[:3]))
        if f is None or (f == 'oro' and keep_gold): continue
        count[f] = count.get(f, 0) + 1
    # Une tonos vecinos (p. ej. dos verdes) en un mismo grupo
    fams = sorted(count, key=lambda f: -count[f])
    groups = []
    for f in fams:
        g = opt.get('merge', True) and next((g for g in groups if f != 'oro' and g[0] != 'oro' and min(abs(f - g[0]), 12 - abs(f - g[0])) <= 1), None)
        if g: g.append(f)
        else: groups.append([f])
    tgt = {}
    for i, g in enumerate(groups):
        for f in g: tgt[f] = hx(targets[min(i, len(targets) - 1)])
    # Luz media de cada grupo, para conservar el sombreado
    acc = {}
    for p in px:
        if p[3] == 0: continue
        f = family(tuple(c / 255 for c in p[:3]))
        if f in tgt: acc.setdefault(f, []).append(colorsys.rgb_to_hls(*(c / 255 for c in p[:3]))[1])
    mean = {f: sum(v) / len(v) for f, v in acc.items()}
    out = []
    for p in px:
        if p[3] == 0: out.append(p); continue
        rgb = tuple(c / 255 for c in p[:3]); f = family(rgb)
        h0, l0, s0 = colorsys.rgb_to_hls(*rgb)
        if opt.get('whites') and s0 < 0.22 and l0 > 0.7:   # zonas blancas → color del club, conservando el brillo
            th, tl, ts = colorsys.rgb_to_hls(*hx(opt['whites']))
            r, g, b = colorsys.hls_to_rgb(th, max(0.05, min(0.9, tl + (l0 - 0.85) * 0.9)), ts)
            out.append((round(r * 255), round(g * 255), round(b * 255), p[3])); continue
        if f not in tgt: out.append(p); continue
        th, tl, ts = colorsys.rgb_to_hls(*tgt[f])
        l = colorsys.rgb_to_hls(*rgb)[1]
        nl = max(0.04, min(0.97, tl + (l - mean[f]) * 0.9))
        r, g, b = colorsys.hls_to_rgb(th, nl, ts)
        out.append((round(r * 255), round(g * 255), round(b * 255), p[3]))
    res = Image.new('RGBA', im.size); res.putdata(out)
    return im, res

if __name__ == '__main__':
    prev = Image.new('RGBA', (130 * len(CLUBS), 260), (60, 60, 90, 255))
    for k, (nid, src, targets, gold, opt) in enumerate(CLUBS):
        a, b = recolor(src, targets, gold, opt)
        b.save(os.path.join(UI, f'crest{nid}.png'))
        prev.alpha_composite(a.resize((120, 120), Image.NEAREST), (k * 130 + 5, 5))
        prev.alpha_composite(b.resize((120, 120), Image.NEAREST), (k * 130 + 5, 135))
    out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/pro_crests.png'
    prev.save(out); print('escudos guardados · vista previa:', out)
