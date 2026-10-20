# Junta las claves (tools/i18n_keys.py) con las traducciones «N|texto» y escribe src/en.js.
# Los espacios del principio y del final de cada clave se copian a la traducción.
import re, sys, glob
keys = [l.rstrip('\n') for l in open(sys.argv[1])]
tr = {}
for f in sorted(glob.glob(sys.argv[2] + '/*.txt')):
    for line in open(f):
        line = line.rstrip('\n')
        if not line: continue
        n, t = line.split('|', 1)
        tr[int(n)] = t
missing = [i + 1 for i in range(len(keys)) if i + 1 not in tr]
if missing: print('FALTAN', missing[:20]); sys.exit(1)
out = []
for i, k in enumerate(keys, 1):
    lead = re.match(r'^\s*', k).group(0); trail = re.search(r'\s*$', k).group(0)
    v = lead + tr[i].strip() + trail
    v = v.replace('\\', '\\\\').replace("'", "\\'")
    out.append(f"  '{k}': '{v}',")
src = open('src/en.js').read()
head, tail = src.split('const EN_TEXT = {', 1)
tail = tail[tail.index('};'):]
open('src/en.js', 'w').write(head + 'const EN_TEXT = {\n' + '\n'.join(out) + '\n' + tail)
print(len(out), 'traducciones')
