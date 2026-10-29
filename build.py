import json
S='./src/'; P='./juego/'
shell=open(S+'shell.html').read()
data=open(P+'gamedata.json').read()
js='\n'.join(open(S+f).read() for f in ['i18n.js','en.js','media.js','logic.js','run.js','career.js','pcareer.js','ach.js','event.js','christmas.js','limited.js','pase.js','shop.js','selva.js','leyenda.js','cloud-config.js','cloud.js','dialog.js','view.js','techfx.js','app.js'])
boot="""
App.boot();
new Phaser.Game({ type: Phaser.AUTO, parent: 'app', backgroundColor: '#1d4a22', scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' }, scene: [MatchScene] });
"""
# Beta privada (BETA_OUT=ruta python3 build.py): se cambia ANTES de comprimir (el compresor mete el valor de BETA dentro del código)
import os
BETA_OUT=os.environ.get('BETA_OUT')
if BETA_OUT:
    for a,b in [("const BETA = false;","const BETA = true; "),("  forced: false,","  forced: true,   // BETA")]:
        assert js.count(a)==1,a; js=js.replace(a,b)
    import re
    js,n=re.subn(r"apiKey: 'AIza[^']*'","apiKey: ''",js); assert n==1
# Código comprimido (tools/minify; si no está instalado, va sin comprimir y lo avisa)
import os, subprocess, sys
code=js+boot
if os.path.isdir('./tools/minify/node_modules/terser'):
    open('./min_in.js','w').write(code)
    r=subprocess.run(['node','./tools/minify/min.js','./min_in.js','./min_out.js'])
    if r.returncode==0: code=open('./min_out.js').read()
    else: sys.exit('build.py: no se pudo comprimir el código')
    os.remove('./min_in.js'); os.remove('./min_out.js')
else: print('aviso: código sin comprimir (instala: cd tools/minify && npm install)')
html=shell+'\n<script>const GAME = '+data+';</script>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js"></script>\n<script>\n'+code+'\n</script>\n'
if BETA_OUT:
    html=html.replace('<!doctype html>\n','',1).replace('<title>Inazuma Gold</title>','<title>Inazuma Gold Beta</title>')
    assert 'AIza' not in html and '<title>Inazuma Gold Beta</title>' in html
    open(BETA_OUT,'w').write(html)
else: open(P+'index.html','w').write(html)
open('./check.js','w').write(js)
print(len(html))
