# Capturas para el tráiler de Halloween (tools/trailer_hw.js): python3 tools/hw_trailer_shots.py (necesita /tmp/claude-0/index_test.html y Phaser local)
import asyncio
from playwright.async_api import async_playwright
ROOT='/home/claude/inazuma-rogue/juego'; O='/tmp/claude-0/hwtshots2/'
async def serve(route):
    u=route.request.url
    if 'cdnjs' in u: return await route.fulfill(path='/tmp/claude-0/phaser-src/dist/phaser.min.js', content_type='application/javascript')
    if 'fonts.' in u or 'gstatic' in u: return await route.abort()
    path=u.split('game.test/',1)[1].split('#')[0].split('?')[0] or 'index.html'
    if path=='index.html': return await route.fulfill(path='/tmp/claude-0/index_test.html', content_type='text/html')
    try: return await route.fulfill(path=ROOT+'/'+path)
    except Exception: return await route.fulfill(status=404, body='')
TUTS="{story:1,special:1,chains:1,infinite:1,gacha:1,team:1,career:1,wc:1}"
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--no-proxy-server','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ctx=await br.new_context(viewport={'width':390,'height':844}, device_scale_factor=3, is_mobile=True, has_touch=True)
        await ctx.route('**/*', serve)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(f"if(!sessionStorage.getItem('x')){{sessionStorage.setItem('x',1);localStorage.setItem('inazuma-idioma','es');localStorage.setItem('inazuma-ajustes', JSON.stringify({{seenNews:'0.31.6',newsShown:'0.31.6',intro:0,minutes:3,hwForce:true,tuts:{TUTS}}}));localStorage.setItem('inazuma-cuenta', JSON.stringify({{guest:true}}));localStorage.setItem('inazuma-sonido', JSON.stringify({{music:false,sfx:false}}))}}")
        await pg.goto('https://game.test/', wait_until='domcontentloaded'); await pg.wait_for_timeout(2500)
        # perfil con buenos jugadores para el partido
        await pg.evaluate("""Profile.data.firstDone=true;for(let i=0;i<6;i++)Gacha.pull(10,{keeper:true});
          Profile.data.coins=4820;Profile.data.tickets=37;Profile.data.rayos=2;
          const H=Halloween.data();H.candy=465;H.daily=Halloween.today();Profile.save();App.renderMenu()""")
        await pg.wait_for_timeout(1500); await pg.screenshot(path=O+'01_menu.png')
        await pg.click('#mHw'); await pg.wait_for_timeout(1200); await pg.screenshot(path=O+'02_evento.png')
        await pg.evaluate("document.querySelector('.hwlogin').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(500); await pg.screenshot(path=O+'09_login.png'); await pg.evaluate("Halloween.data().pity=39;Halloween.pool().legendaria=[996006]"); await pg.click('#hw10'); await pg.wait_for_timeout(700)
        await pg.click('#mc'); await pg.wait_for_timeout(2500); await pg.screenshot(path=O+'03_capsulas.png')
        await pg.click('#mAll'); await pg.wait_for_timeout(9000); await pg.screenshot(path=O+'04_cartas.png')
        await pg.click('#mOk'); await pg.wait_for_timeout(600)
        await pg.click('#hwBoss'); await pg.wait_for_timeout(12000); await pg.screenshot(path=O+'05_jefe.png')
        await pg.wait_for_timeout(6000); await pg.screenshot(path=O+'05b_jefe.png')
        await pg.evaluate("const m=App.match;m.score.A=m.score.B+1;m.time=0.01;m.golden=false"); await pg.wait_for_timeout(4000)
        await pg.screenshot(path=O+'06_fin.png')
        await pg.evaluate("Profile.data.hw.pulls=20"); await pg.click('#again'); await pg.wait_for_timeout(800)
        await pg.evaluate("document.querySelector('.hwretos').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(500); await pg.screenshot(path=O+'07_retos.png')
        for i in range(3):
            b=pg.locator('[data-reto]:not([disabled])')
            if await b.count(): await b.first.click(); await pg.wait_for_timeout(600)
        await pg.evaluate("Career.data=null;try{localStorage.removeItem('inazuma-carrera')}catch(e){};App.renderMenu()"); await pg.wait_for_timeout(300)
        await pg.click('#mCareer'); await pg.wait_for_timeout(800)
        await pg.locator('.cmgr.ray').click(); await pg.evaluate("document.getElementById('cMgrs').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=O+'08_ray.png')
        print('errores:', errs[:5] or 'ninguno')
        await br.close()
asyncio.run(main())
