# Capturas del tráiler de la v0.35 (tools/trailer_035.js). Necesita /tmp/claude-0/index_test.html (build de la 0.35) y Phaser local.
import asyncio
from playwright.async_api import async_playwright
exec(open('/tmp/claude-0/hw.py').read().split('TUTS=')[0])
O='/tmp/claude-0/t35/'
INIT="if(!sessionStorage.x){sessionStorage.x=1;localStorage.setItem('inazuma-idioma','es');localStorage.setItem('inazuma-ajustes', JSON.stringify({seenNews:'0.35.0',newsShown:'0.35.0',intro:0,minutes:3,techMode:'boton',tuts:{story:1,special:1,chains:1,infinite:1,gacha:1,team:1,career:1,wc:1,pcareer:1}}));localStorage.setItem('inazuma-cuenta', JSON.stringify({guest:true}));localStorage.setItem('inazuma-sonido', JSON.stringify({music:false,sfx:false}))}"
MKPC="""(()=>{const pc=PlayerCareer;const look=pc.lookChoices(3,'DEL')[0];const pd=pc.newCustom({name:'Rayo',role:'DEL',elem:'fuego',look:look.id});pc.create(pd.id,pc.startOffers(pd.id)[0].key,pd);pc.data.me.forceStart=true;pc.autoLineup();pc.save();})()"""
async def page(br):
    ctx=await br.new_context(viewport={'width':390,'height':844}, device_scale_factor=3, is_mobile=True, has_touch=True); await ctx.route('**/*', serve)
    pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(INIT); await pg.goto('https://game.test/'); await pg.wait_for_timeout(2500)
    await pg.evaluate("Profile.data.firstDone=true;try{UI.toast=()=>{}}catch(e){};for(let i=0;i<4;i++)Gacha.pull(10,{keeper:true});Profile.data.coins=3200;Profile.data.tickets=24;Profile.save();App.renderMenu()")
    return pg, errs
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--no-proxy-server','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        allerr=[]
        # 1 crear
        pg,e=await page(br); await pg.click('#mPlayer'); await pg.locator('#slots .slot').first.click(); await pg.click('#pcCreate'); await pg.wait_for_timeout(500)
        await pg.fill('#pcName','Rayo'); await pg.locator('button:has-text("Delantero")').first.click(); await pg.wait_for_timeout(300)
        await pg.locator('button:has-text("Fuego")').first.click(); await pg.wait_for_timeout(400); await pg.screenshot(path=O+'01_crear.png'); allerr+=e; await pg.context.close()
        # 2 centro + 3 partido con «¡Pásamela!»
        pg,e=await page(br); await pg.evaluate(MKPC); await pg.click('#mPlayer'); await pg.locator('#slots .slot').first.click(); await pg.wait_for_timeout(600)
        await pg.screenshot(path=O+'02_centro.png')
        await pg.locator('button:has-text("Descansar")').first.click(); await pg.wait_for_timeout(800); await pg.click('#pcPlay'); await pg.wait_for_timeout(8000)
        await pg.evaluate("""(()=>{const s=App.match,me=s.players.find(p=>p.id===s.settings.lockId),m=s.players.find(p=>p.team==='A'&&p!==me&&p.role==='MED')||s.players.find(p=>p.team==='A'&&p!==me&&p.role!=='POR');s.pause=null;Logic._t.take(s,m);m.x=me.x-3;m.y=me.y+4;Input.press('A');})()""")
        await pg.wait_for_timeout(500); await pg.screenshot(path=O+'03_partido.png'); allerr+=e; await pg.context.close()
        # 4 Liga Pro
        pg,e=await page(br); await pg.evaluate(MKPC+";PlayerCareer.devGraduate();PlayerCareer.save()"); await pg.click('#mPlayer'); await pg.locator('#slots .slot').first.click(); await pg.wait_for_timeout(800)
        await pg.screenshot(path=O+'04_pro.png'); allerr+=e; await pg.context.close()
        # 5 Mundial
        pg,e=await page(br); await pg.evaluate(MKPC+";PlayerCareer.devWC();PlayerCareer.data.pwc.role='titular';PlayerCareer.save()"); await pg.click('#mPlayer'); await pg.locator('#slots .slot').first.click(); await pg.wait_for_timeout(800)
        await pg.screenshot(path=O+'05_mundial.png'); allerr+=e; await pg.context.close()
        # 6 Raimon en la Carrera (elegir club)
        pg,e=await page(br); await pg.click('#mCareer'); await pg.locator('#slots .slot').first.click(); await pg.wait_for_timeout(600)
        await pg.locator('button:has-text("Elegir un club")').first.click(); await pg.wait_for_timeout(600)
        await pg.evaluate("(()=>{const b=[...document.querySelectorAll('.cclub')].find(x=>/Raimon/.test(x.innerText)); if(b){b.click();} })()"); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{const b=[...document.querySelectorAll('.cclub')].find(x=>/Raimon/.test(x.innerText)); if(b) b.scrollIntoView({block:'center'}); })()"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=O+'06_raimon.png'); allerr+=e; await pg.context.close()
        # 7 bloqueo de tiro (partido jefe de Halloween: el evento está activo)
        pg,e=await page(br); await pg.click('#mHw'); await pg.wait_for_timeout(500); await pg.click('#hwBoss'); await pg.wait_for_timeout(6000)
        await pg.evaluate("""(()=>{ const s=App.match, F=Logic.FIELD; s.pause=null; s.diff.techUse=1;
          const sh=s.players.find(q=>q.team==='B'&&q.role==='DEL'), d=s.players.find(q=>q.team==='A'&&q.role==='DEF');
          for (const q of s.players) if (q!==sh&&q!==d&&q.role!=='POR') q.stun=3;
          sh.x=F.w/2; sh.y=F.l-16; d.x=F.w/2+1; d.y=F.l-9; d.defense=95; d.body=95; d.cd={};
          const bt=Object.values(GAME.techniques).filter(t=>t.type==='bloqueo').sort((a,b)=>b.power-a.power)[0];
          d.techs=[Object.assign({cd:10},bt)]; s.controlledId=d.id;
          Logic._t.take(s, sh); sh.aim=Math.PI/2; Logic._t.shoot(s, sh, 1, 0, null); })()""")
        for i in range(60):
            await pg.wait_for_timeout(30)
            if await pg.evaluate("!!App.match.blockAsk"): break
        await pg.screenshot(path=O+'07a_aviso.png')
        await pg.evaluate("Input.press('tech')")
        for k,w in enumerate([120,200,250,300]): await pg.wait_for_timeout(w); await pg.screenshot(path=O+'07_bloqueo%d.png'%k)
        allerr+=e; await pg.context.close()
        print('errores:', allerr or 'ninguno')
        await br.close()
asyncio.run(main())
