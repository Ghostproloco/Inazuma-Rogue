# Marca para traducir los textos visibles de un archivo JS: los envuelve en TX('…').
#  - Cadenas '…' con texto (espacios, tildes, ¡¿ o una palabra con mayúscula).
#  - Texto entre etiquetas dentro de plantillas `…` y de cadenas '…' con HTML.
#  - Atributos placeholder / title / label / alt con texto.
# No toca: claves de equipos (están en gamedata), comparaciones (=== 'x'), selectores,
# nombres de teclas, almacenamiento, sonidos… Uso: python3 tools/i18n_wrap.py src/archivo.js
import json, os, re, sys

ROOT = os.path.join(os.path.dirname(__file__), '..')
G = json.load(open(os.path.join(ROOT, 'juego', 'gamedata.json')))
TEAM_KEYS = {t['key'] for t in G['teams']} | {t['name'] for t in G['teams']}
SKIP_EXACT = TEAM_KEYS | {p['name'] for p in G['players']} | {'montaña', '?v=4', '(pointer: coarse)', '(pointer: fine)', 'Escape', 'Enter', 'Space', 'Jingles', 'InaPixel', 'Inazuma Rogue'}
ALPHA = re.compile(r'[A-Za-zÁÉÍÓÚÜÑáéíóúüñ¡¿]')
SPANISH = re.compile(r'[áéíóúüñÁÉÍÓÚÜÑ¡¿]')

def is_text(s):
    if not ALPHA.search(s) or s.strip() in SKIP_EXACT: return False
    core = s.strip()
    if re.fullmatch(r'[\w.\-#/:%]+', core) and not SPANISH.search(core) and not re.fullmatch(r'[A-ZÁÉÍÓÚ][a-záéíóúñ]+', core): return False
    if re.search(r'^(https?:|ui/|sprites/|#[0-9a-f]{3})', core): return False
    if re.fullmatch(r'&\w+;', core): return False
    if re.search(r'(px|Arial|sans-serif|\\[nu])', core) and not SPANISH.search(core.replace('px', '')): return False
    if re.fullmatch(r'[a-z0-9_\-]+( [a-z0-9_\-]+)*', core) and not SPANISH.search(core) and ' ' in core and len(core.split()) <= 3 and all(len(w) < 12 for w in core.split()):
        # «cta mini», «ghost big», «note cmsg bad»: clases de CSS
        if all(re.fullmatch(r'[a-z][a-z0-9\-]*', w) for w in core.split()) and not re.search(r'\b(de|la|el|en|y|a|con|sin|por|para|del|tu|su|se|no|un|una)\b', core): return False
    return True

def q(s):  # literal JS con comillas simples
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"

def wrap_core(text, joiner):
    """Envuelve el núcleo de un trozo de texto, dejando fuera los espacios de los bordes."""
    m = re.match(r'^(\s*)(.*?)(\s*)$', text, re.S)
    lead, core, trail = m.groups()
    if not core or not is_text(core): return None
    return lead, core, trail

SKIP_CTX = re.compile(r'(===|!==|==|!=|case|\.includes\(|querySelector(All)?\(|getElementById\(|\$\(|classList\.\w+\(|className\s*=|setAttribute\(|getItem\(|setItem\(|removeItem\(|Sound\.\w+\(|tutorial\(|dataset\.\w+\s*=|\.code\s*===|\.key\s*===|addEventListener\(|matchMedia\(|new Error\(|\.startsWith\(|\.endsWith\(|\.test\(|\.match\(|\.replace\()\s*$')

def transform(src):
    out = []
    i, n = 0, len(src)
    stack = []          # para ${ … } anidados dentro de plantillas: guarda la profundidad de llaves
    mode = 'code'       # code | tpl
    brace = 0
    in_tag = False      # dentro de < … > en el HTML de una plantilla
    last_sig = ''
    def prev_code(k=60):
        return ''.join(out)[-k:]
    while i < n:
        c = src[i]
        if mode == 'code':
            if src.startswith('//', i):
                j = src.find('\n', i); j = n if j < 0 else j; out.append(src[i:j]); i = j; continue
            if src.startswith('/*', i):
                j = src.find('*/', i + 2) + 2; out.append(src[i:j]); i = j; continue
            if c == '/' and last_sig in '(,=:[!&|?{};+-*%<>~^' :   # expresión regular
                j = i + 1; cls = False
                while j < n:
                    if src[j] == '\\': j += 2; continue
                    if src[j] == '[': cls = True
                    elif src[j] == ']': cls = False
                    elif src[j] == '/' and not cls: break
                    j += 1
                j += 1
                while j < n and src[j].isalpha(): j += 1
                out.append(src[i:j]); i = j; last_sig = '/'; continue
            if c in '"\'':
                j = i + 1
                while j < n and src[j] != c:
                    if src[j] == '\\': j += 1
                    j += 1
                lit = src[i:j + 1]; val = lit[1:-1]
                rest = src[j + 1:j + 20].lstrip()
                if rest.startswith(':') and last_sig in '{,': out.append(lit)       # clave de objeto
                else: out.append(literal(lit, val, c, prev_code()))
                i = j + 1; last_sig = 'x'; continue
            if c == '`':
                out.append('`'); mode = 'tpl'; i += 1; in_tag = False; continue
            if c == '{': brace += 1
            if c == '}':
                if stack and brace == stack[-1]:
                    stack.pop(); brace -= 1; out.append('}'); mode = 'tpl'; i += 1; continue
                brace -= 1
            if not c.isspace(): last_sig = c if not (c.isalnum() or c in '_$') else 'x'
            if src.startswith('return', i) and (i == 0 or not src[i-1].isalnum()): last_sig = '('
            out.append(c); i += 1; continue
        # dentro de una plantilla: junta el texto hasta ${ o `
        j = i; buf = []
        while j < n and src[j] != '`' and not src.startswith('${', j):
            if src[j] == '\\': buf.append(src[j:j+2]); j += 2; continue
            buf.append(src[j]); j += 1
        seg = ''.join(buf)
        res, in_tag = html_text(seg, in_tag, 'tpl')
        out.append(res)
        if j >= n: break
        if src[j] == '`':
            out.append('`'); i = j + 1; mode = 'code'; last_sig = 'x'
            if stack is None: pass
            continue
        out.append('${'); i = j + 2; mode = 'code'; brace += 1; stack.append(brace); last_sig = '('
    return ''.join(out)

ATTR = re.compile(r'\b(placeholder|title|label|alt|aria-label)="([^"$]*)"')

def html_text(seg, in_tag, kind):
    """Envuelve el texto entre etiquetas. kind: 'tpl' → ${TX('…')} ; 'str' → ' + TX('…') + '"""
    res = []; k = 0; L = len(seg)
    while k < L:
        if in_tag:
            e = seg.find('>', k)
            part = seg[k:] if e < 0 else seg[k:e + 1]
            res.append(attrs(part, kind)); k = L if e < 0 else e + 1
            in_tag = e < 0
            continue
        s = seg.find('<', k)
        text = seg[k:] if s < 0 else seg[k:s]
        res.append(text_piece(text, kind))
        if s < 0: break
        in_tag = True; k = s
        # «<» suelto (comparación en texto) no debería pasar en plantillas HTML
    return ''.join(res), in_tag

def attrs(part, kind):
    def rep(m):
        name, v = m.group(1), m.group(2)
        if not v or not is_text(v) or name == 'alt' and v.strip() in SKIP_EXACT: return m.group(0)
        return f'{name}="' + (f"${{TX({q(v)})}}" if kind == 'tpl' else f"' + TX({q(v)}) + '") + '"'
    return ATTR.sub(rep, part)

def text_piece(text, kind):
    m = re.match(r'^(\s*)(.*?)(\s*)$', text, re.S)
    lead, core, trail = m.groups()
    if not core or not ALPHA.search(core) or core.strip() in SKIP_EXACT: return text
    if re.fullmatch(r'[A-Z]{1,3}|v|VS|FPS|WASD|[A-Z]\d?', core): return text     # teclas, siglas
    if re.fullmatch(r'[\s·•|/()\-–—:,.+×%★☆♥\d]*', core): return text
    if re.search(r'url\(|[{}]|=>|^[\w-]+="|\)\s*\.', core): return text          # trozos de código, no texto
    if kind == 'tpl': return f"{lead}${{TX({q(core)})}}{trail}"
    return f"{lead}' + TX({q(core)}) + '{trail}"

def literal(lit, val, quote, ctx):
    if not ALPHA.search(val): return lit
    if SKIP_CTX.search(ctx): return lit
    if re.search(r'(TX|TXn)\(\s*$', ctx): return lit          # ya marcado
    if '<' in val and '>' in val:                            # cadena con HTML: se trocea
        res, _ = html_text(val if quote == "'" else val.replace("'", "\\'"), False, 'str')
        if res == (val if quote == "'" else val): return lit
        out = "'" + res + "'"
        out = out.replace(" + ''", '').replace("'' + ", '')
        return out
    if '${' in val: return lit
    if not is_text(val): return lit
    # propiedades de objetos que son claves internas: { tiro: 'Tiro' } sí; ['POR', 'DEF'] ya excluido por is_text
    return f"TX({q(val) if quote == chr(39) else lit})"

if __name__ == '__main__':
    for f in sys.argv[1:]:
        src = open(f).read()
        new = transform(src)
        open(f, 'w').write(new)
        print(f, 'TX añadidos:', new.count('TX(') - src.count('TX('))
