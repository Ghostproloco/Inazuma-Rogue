import json
S='./src/'; P='./juego/'
shell=open(S+'shell.html').read()
data=open(P+'gamedata.json').read()
js='\n'.join(open(S+f).read() for f in ['i18n.js','en.js','media.js','logic.js','run.js','career.js','event.js','cloud-config.js','cloud.js','view.js','techfx.js','app.js'])
boot="""
App.boot();
new Phaser.Game({ type: Phaser.AUTO, parent: 'app', backgroundColor: '#1d4a22', scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' }, scene: [MatchScene] });
"""
html=shell+'\n<script>const GAME = '+data+';</script>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js"></script>\n<script>\n'+js+boot+'</script>\n'
open(P+'index.html','w').write(html)
open('./check.js','w').write(js)
print(len(html))
