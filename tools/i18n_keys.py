# Lista las claves TX('…') de los archivos indicados (una por línea, con el archivo y la línea)
import re, sys
PAT = re.compile(r"TXn?\(\s*(?:[^,()']+,\s*)?'((?:[^'\\]|\\.)*)'")
for f in sys.argv[1:]:
    for n, line in enumerate(open(f), 1):
        for m in PAT.finditer(line):
            print(f"{f}:{n}\t{m.group(1)}")
