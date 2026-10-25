// Tráiler de anuncio de la v0.35 (sale el domingo 26 de octubre): Carrera Jugador, Liga Pro, Mundial, Raimon y bloqueos de tiro.
// Corto y para crear hype: solo lo importante. Capturas: /tmp/claude-0/t35shots.py (tools/t35_shots.py).
// Usa capturas reales del juego (servidas como tshots/NOMBRE.png) dentro de un móvil.
// Lo lanza tools/trailer.py con TRAILER_JS=tools/trailer_035.js TRAILER_MUSIC=op2 TRAILER_SHOTS=<carpeta>.
(() => {
  const URL_TXT = 'franmndezzzz.github.io/Inazuma-Rogue';
  const el = document.getElementById('intro'), stage = el.querySelector('.in-stage'), cap = el.querySelector('.in-cap'), flash = el.querySelector('.in-flash');
  el.querySelector('.in-skip').style.display = 'none';
  document.getElementById('screen').hidden = true;
  cap.style.display = 'none';
  const css = document.createElement('style');
  css.textContent = `
    .py-slide{position:absolute;inset:0;overflow:hidden;background:#05081a;animation:inFade .45s ease-out both}
    .py-blur{position:absolute;inset:-40px;background-size:cover;background-position:center;filter:blur(22px) brightness(.38) saturate(1.3);transform:scale(1.1)}
    .py-rays{position:absolute;inset:-50%;background:repeating-conic-gradient(from 0deg,rgba(255,232,26,.07) 0 10deg,transparent 10deg 20deg);animation:pyspin 30s linear infinite}
    .py-head{position:absolute;left:18px;right:18px;top:46px;text-align:center;z-index:3}
    .py-head b{display:block;font:44px var(--font-ui);line-height:1.02;color:var(--yellow);text-transform:uppercase;letter-spacing:1px;
      text-shadow:3px 0 0 var(--ink),-3px 0 0 var(--ink),0 3px 0 var(--ink),0 -3px 0 var(--ink),4px 4px 0 #000;animation:slam .5s cubic-bezier(.2,1.6,.4,1) both}
    .py-head small{display:block;margin-top:10px;font:23px var(--font-ui);color:#fff;text-shadow:2px 2px 0 #000;animation:capIn .45s ease-out .2s both}
    .py-phone{position:absolute;left:50%;top:228px;width:304px;height:658px;margin-left:-152px;border:9px solid #0b0b12;border-radius:34px;overflow:hidden;z-index:2;
      box-shadow:0 0 0 3px #3a4a8a,0 26px 50px rgba(0,0,0,.65);background:#000;animation:phIn .6s cubic-bezier(.2,1.3,.4,1) both}
    .py-phone img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;animation:phPan 3.2s ease-in-out both}
    .py-phone.zoom img{transform-origin:var(--zx,50%) var(--zy,40%);animation:phZoom 3.2s ease-in-out both}
    .py-tag{position:absolute;z-index:3;right:58px;top:206px;transform:rotate(9deg);font:22px var(--font-ui);color:#000;background:var(--yellow);padding:6px 12px;border:3px solid #000;
      box-shadow:3px 3px 0 #000;animation:tagIn .5s cubic-bezier(.2,1.8,.4,1) .35s both}
    .py-tag.left{right:auto;left:52px;transform:rotate(-8deg)}
    .py-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px;z-index:3;text-align:center}
    .py-kicker{font:24px var(--font-ui);color:#000;background:var(--yellow);padding:6px 16px;letter-spacing:3px;animation:capIn .4s ease-out both}
    .py-big{font:72px var(--font-ui);line-height:.98;color:var(--yellow);text-transform:uppercase;letter-spacing:2px;
      text-shadow:4px 0 0 var(--ink),-4px 0 0 var(--ink),0 4px 0 var(--ink),0 -4px 0 var(--ink),6px 6px 0 #000;animation:slam .55s cubic-bezier(.2,1.6,.4,1) both}
    .py-big span{display:block}.py-big .amp{font-size:40px;color:#fff;margin:4px 0}
    .py-mid{font:28px var(--font-ui);color:#fff;text-shadow:2px 2px 0 #000;animation:capIn .5s ease-out .3s both}
    .py-ch{font:96px var(--font-ui);color:#fff;letter-spacing:4px;text-shadow:5px 5px 0 #000;animation:chIn .6s cubic-bezier(.2,1.5,.4,1) both}
    .py-ch.gold{color:var(--yellow)}
    .py-icons{font-size:64px;display:flex;gap:18px;animation:capIn .5s ease-out .25s both}
    .py-url{font:22px var(--font-ui);color:#fff;background:rgba(0,0,0,.55);padding:6px 12px;border:2px solid var(--yellow);animation:capIn .5s ease-out .5s both}
    .py-logo{width:440px;max-width:86%;filter:drop-shadow(0 4px 0 rgba(0,0,0,.5));animation:slam .5s cubic-bezier(.2,1.6,.4,1) both}
    @keyframes phIn{from{transform:translateY(140px) rotate(-6deg);opacity:0}to{transform:none;opacity:1}}
    @keyframes phPan{from{transform:scale(1)}to{transform:scale(1.05)}}
    @keyframes phZoom{0%,25%{transform:scale(1)}100%{transform:scale(1.45)}}
    @keyframes tagIn{from{transform:scale(0) rotate(30deg)}to{transform:rotate(9deg)}}
    @keyframes chIn{from{transform:scale(.2);opacity:0;letter-spacing:40px}to{transform:none;opacity:1}}
    @keyframes pyspin{to{transform:rotate(360deg)}}`;
  document.head.appendChild(css);
  let z = 1;
  const boom = () => { flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); };
  const layer = html => { const d = document.createElement('div'); d.className = 'py-slide'; d.style.zIndex = ++z; d.innerHTML = html; stage.appendChild(d); [...stage.children].slice(0, -2).forEach(o => o.remove()); return d; };
  // Una captura dentro de un móvil, con titular arriba y una etiqueta opcional
  const shot = (img, title, sub, opt = {}) => layer(`<div class="py-blur" style="background-image:url('tshots/${img}.png')"></div>
    <div class="py-head"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>
    <div class="py-phone${opt.zoom ? ' zoom' : ''}" style="${opt.zoom ? `--zx:${opt.zoom[0]};--zy:${opt.zoom[1]}` : ''}"><img src="tshots/${img}.png" alt=""></div>
    ${opt.tag ? `<div class="py-tag${opt.left ? ' left' : ''}">${opt.tag}</div>` : ''}`);
  const card = (html, bg = 'radial-gradient(circle at 50% 45%,#2a2a7a 0,#05081a 72%)') => layer(`<div class="py-rays"></div><div class="py-center">${html}</div>`).style.background = bg;
  el.hidden = false; stage.innerHTML = '';
  const SLOW = window.__trailerSlow || 1;
  const at = (ms, fn) => setTimeout(fn, ms * SLOW);
  const S = [];
  let t = 0; const add = (dur, fn) => { S.push([t, fn]); t += dur; };
  add(2200, () => card(`<div class="py-kicker">v0.35</div><div class="py-mid" style="font-size:34px">Algo grande se acerca…</div>`, 'radial-gradient(circle at 50% 50%,#1a1a4a 0,#000 75%)'));
  add(1800, () => { boom(); card(`<div class="py-ch gold">CARRERA</div><div class="py-ch">JUGADOR</div>`, 'radial-gradient(circle at 50% 50%,#7a3a00 0,#05081a 75%)'); });
  add(2600, () => shot('01_crear', 'Crea tu jugador', 'Nombre, puesto, elemento y aspecto', { tag: '¡NUEVO!' }));
  add(2600, () => shot('03_partido', 'Solo controlas a tu jugador', 'Pide el balón: «¡Pásamela!»', { zoom: ['50%', '12%'] }));
  add(2600, () => { boom(); shot('04_pro', 'Gradúate…', '…y salta a la Liga Pro', { tag: 'PRO', left: true }); });
  add(2600, () => shot('05_mundial', 'Juega el Mundial', 'Con tu selección', { tag: 'MUNDIAL' }));
  add(2800, () => { boom(); shot('06_raimon', '¡El Raimon llega a la Carrera!', 'Elige club o crea el tuyo', { zoom: ['28%', '48%'] }); });
  add(2200, () => shot('07a_aviso', 'Bloquea los tiros', 'Como en el Inazuma DS', { tag: '¡NUEVO!', left: true }));
  add(1700, () => { boom(); shot('07_bloqueo2', '¡Bloqueado!', 'Frena el tiro… o páralo') ; });
  add(4200, () => { boom(); card(`<img class="py-logo" src="ui/logo_rogue.png" alt=""><div class="py-kicker">ESTE DOMINGO</div><div class="py-big" style="font-size:80px"><span>26 OCT</span></div>
    <div class="py-mid">v0.35 · ¡Juega gratis!</div><div class="py-url">${URL_TXT}</div>`); });
  add(0, () => { window.__trailerDone = true; });
  S.forEach(([ms, fn]) => at(ms, fn));
})();
