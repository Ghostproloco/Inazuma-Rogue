# Quita TX(…) de textos que en realidad son código (colores, rutas, selectores…)
import sys, re
CODE = ['#partida=', '.png', '.png")', '[data-tut]', 'rgba(0,0,0,.18)', 'rgba(190,225,255,.25)', 'rgba(255,255,255,.25)',
        'rgba(255,255,255,.75)', 'ui/crest', 'px)', 'px,', 'translate(', 'Changing language…', 'Cambiando el idioma…', 'IRZ1:', 'campeón']
for f in sys.argv[1:]:
    s = open(f).read(); n0 = s
    for k in CODE:
        lit = "'" + k.replace("'", "\\'") + "'"
        s = s.replace("${TX(" + lit + ")}", k)        # dentro de una plantilla
        s = s.replace("TX(" + lit + ")", lit)          # cadena normal
    if s != n0: open(f, 'w').write(s); print('arreglado', f)
