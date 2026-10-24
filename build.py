import json
S='./src/'; P='./juego/'
shell=open(S+'shell.html').read()
data=open(P+'gamedata.json').read()
js='\n'.join(open(S+f).read() for f in ['i18n.js','en.js','media.js','logic.js','run.js','career.js','event.js','christmas.js','go.js','cloud-config.js','cloud.js','view.js','techfx.js','app.js'])
boot="""
App.boot();
new Phaser.Game({ type: Phaser.AUTO, parent: 'app', backgroundColor: '#1d4a22', scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' }, scene: [MatchScene] });
"""
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
open(P+'index.html','w').write(html)
open('./check.js','w').write(js)
print(len(html))
