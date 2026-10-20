# Graba el mini tráiler (tools/trailer.js) como vídeo vertical 1080×1920 con la música de la intro.
# Uso: python3 tools/trailer.py en|es salida.mp4
# Cómo: la página va 5 veces más lenta y se hacen capturas nítidas continuamente; luego ffmpeg
# las junta a velocidad normal. Necesita Playwright con Chromium y ffmpeg.
import asyncio, os, shutil, subprocess, sys, tempfile, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
GAME = os.path.join(ROOT, 'juego')
PHASER = os.environ.get('PHASER_JS', '')        # ruta local a phaser.min.js (si no hay red)
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
SLOW = 6
lang, out = sys.argv[1], os.path.abspath(sys.argv[2])

async def serve(route):
    u = route.request.url
    if 'cdnjs' in u and PHASER: return await route.fulfill(path=PHASER, content_type='application/javascript')
    if 'fonts.' in u: return await route.abort()
    path = u.split('game.test/', 1)[1].split('#')[0].split('?')[0] or 'index.html'
    try: return await route.fulfill(path=os.path.join(GAME, path))
    except Exception: return await route.fulfill(status=404, body='')

async def main():
    tmp = tempfile.mkdtemp(); frames = []
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path=CHROME, args=['--no-proxy-server'])
        ctx = await br.new_context(viewport={'width': 540, 'height': 960}, device_scale_factor=2)
        await ctx.route('**/*', serve)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(f"localStorage.setItem('inazuma-ajustes', JSON.stringify({{intro:0}}));localStorage.setItem('inazuma-idioma','{lang}');localStorage.setItem('inazuma-cuenta', JSON.stringify({{guest:true}}));localStorage.setItem('inazuma-sonido', JSON.stringify({{music:false,sfx:false}}))")
        await pg.goto('https://game.test/', wait_until='load'); await pg.wait_for_timeout(2500)
        await pg.evaluate("Promise.all(['bg_title','ill05','bg_team','ill23','logo_rogue'].map(n=>new Promise(r=>{const i=new Image();i.onload=i.onerror=r;i.src='ui/'+n+'.png'})))")
        cdp = await ctx.new_cdp_session(pg)
        await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', {'playbackRate': 1 / SLOW})
        await pg.evaluate(f"window.__trailerLang='{lang}';window.__trailerSlow={SLOW}")
        import base64
        async def on_frame(ev):
            ts = ev['metadata']['timestamp']
            f = os.path.join(tmp, f'{len(frames):05d}.jpg')
            open(f, 'wb').write(base64.b64decode(ev['data']))
            frames.append((f, ts))
            try: await cdp.send('Page.screencastFrameAck', {'sessionId': ev['sessionId']})
            except Exception: pass
        cdp.on('Page.screencastFrame', lambda ev: asyncio.ensure_future(on_frame(ev)))
        await cdp.send('Page.startScreencast', {'format': 'jpeg', 'quality': 92, 'maxWidth': 1080, 'maxHeight': 1920, 'everyNthFrame': 1})
        await pg.wait_for_timeout(300)
        await pg.add_script_tag(path=os.path.join(ROOT, 'tools', 'trailer.js'))
        t_start = time.time()
        await pg.wait_for_function('window.__trailerDone === true', timeout=600000, polling=500)
        await pg.wait_for_timeout(300)
        await cdp.send('Page.stopScreencast')
        frames.sort(key=lambda x: x[1])
        # tiempos reales → tiempo del tráiler (la página iba SLOW veces más lenta)
        base = min(ts for _, ts in frames if ts >= t_start - 1) if frames else 0
        frames[:] = [(f, (ts - base) / SLOW) for f, ts in frames if ts >= base]
        await br.close()
        if errs: print('errores JS:', errs)
    # Lista para ffmpeg: cada captura dura hasta la siguiente
    lst = os.path.join(tmp, 'list.txt')
    with open(lst, 'w') as L:
        for i, (f, t) in enumerate(frames):
            nxt = frames[i + 1][1] if i + 1 < len(frames) else t + 0.5
            L.write(f"file '{f}'\nduration {max(0.001, nxt - t):.4f}\n")
        L.write(f"file '{frames[-1][0]}'\n")
    dur = frames[-1][1] + 0.5
    music = os.path.join(GAME, 'audio', 'op00.mp3')
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', music, '-t', f'{dur:.2f}',
           '-map', '0:v', '-map', '1:a', '-vf', 'fps=30,scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
           '-af', f'afade=t=in:d=0.3,afade=t=out:st={max(0, dur - 2):.2f}:d=2', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]
    subprocess.run(cmd, check=True)
    print(out, f'{dur:.1f} s ·', len(frames), 'capturas')
    shutil.rmtree(tmp, ignore_errors=True)

asyncio.run(main())
