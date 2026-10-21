// Mini vídeo de agradecimiento (10 s): «¡Muchísimas gracias!», el servidor reventado y «se vienen muchas cositas».
//   TRAILER_JS=tools/teaser_gracias.js TRAILER_MUSIC=e205 TRAILER_SHOTS=<capturas a.png b.png c.png d.png> python3 tools/trailer.py es gracias.mp4
(() => {
  const el = document.getElementById('intro'), stage = el.querySelector('.in-stage'), cap = el.querySelector('.in-cap'), flash = el.querySelector('.in-flash');
  el.querySelector('.in-skip').style.display = 'none';
  document.getElementById('screen').hidden = true;
  cap.style.display = 'none';
  const css = document.createElement('style');
  css.textContent = `
    .gx{position:absolute;inset:0;overflow:hidden;animation:inFade .3s ease-out both}
    .gx-rays{position:absolute;inset:-50%;background:repeating-conic-gradient(from 0deg,rgba(255,232,26,.10) 0 10deg,transparent 10deg 20deg);animation:gxspin 14s linear infinite}
    .gx-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:22px;z-index:3;text-align:center}
    .gx-big{font:78px var(--font-ui);line-height:.95;color:var(--yellow);text-transform:uppercase;letter-spacing:2px;
      text-shadow:4px 0 0 var(--ink),-4px 0 0 var(--ink),0 4px 0 var(--ink),0 -4px 0 var(--ink),6px 6px 0 #000;animation:slam .5s cubic-bezier(.2,1.6,.4,1) both}
    .gx-big span{display:block}
    .gx-mid{font:30px var(--font-ui);color:#fff;text-shadow:2px 2px 0 #000;animation:capIn .4s ease-out .3s both}
    .gx-small{font:24px var(--font-ui);color:#fff;text-shadow:2px 2px 0 #000;animation:capIn .4s ease-out both}
    .gx-tag{font:26px var(--font-ui);color:#000;background:var(--yellow);padding:6px 16px;border:3px solid #000;box-shadow:4px 4px 0 #000;animation:gxPop .4s cubic-bezier(.2,1.8,.4,1) both}
    .gx-tag.ok{background:#5fe06a}
    .gx-conf{position:absolute;top:-20px;width:12px;height:18px;z-index:2;animation:gxFall linear forwards}
    .gx-srv{position:relative;width:170px;height:210px;animation:gxShake .12s linear infinite}
    .gx-srv i{position:absolute;left:0;right:0;height:56px;background:#2b3448;border:4px solid #0b0f1a;box-shadow:inset 0 0 0 3px #46516e}
    .gx-srv i::after{content:'';position:absolute;right:14px;top:18px;width:14px;height:14px;background:#ff3b30;box-shadow:-26px 0 0 #ffcc00,-52px 0 0 #ff3b30;animation:gxBlink .18s steps(2) infinite}
    .gx-srv i:nth-child(1){top:0}.gx-srv i:nth-child(2){top:70px}.gx-srv i:nth-child(3){top:140px}
    .gx-boom{position:absolute;left:50%;top:50%;width:420px;height:420px;margin:-210px 0 0 -210px;border-radius:50%;z-index:2;pointer-events:none;
      background:radial-gradient(circle,#fff 0,#ffe21a 18%,#ff8a1a 38%,rgba(232,54,26,.6) 55%,transparent 70%);animation:gxBoom .7s ease-out both}
    .gx-smoke{position:absolute;width:60px;height:60px;border-radius:50%;background:rgba(80,80,90,.7);z-index:3;animation:gxSmoke 1.6s ease-out forwards}
    .gx-shots{position:relative;width:300px;height:540px;margin-top:6px}
    .gx-shots img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;border:8px solid #0b0b12;border-radius:28px;box-shadow:0 0 0 3px #3a4a8a,0 20px 40px rgba(0,0,0,.6);
      filter:blur(5px) brightness(.85);opacity:0;animation:gxShot .75s ease-out forwards}
    .gx-q{position:absolute;z-index:4;font:120px var(--font-ui);color:var(--yellow);text-shadow:5px 5px 0 #000;left:50%;top:50%;transform:translate(-50%,-50%);animation:gxPop .4s cubic-bezier(.2,1.8,.4,1) both}
    .gx-logo{width:420px;max-width:86%;filter:drop-shadow(0 4px 0 rgba(0,0,0,.5));animation:slam .5s cubic-bezier(.2,1.6,.4,1) both}
    .gx-url{font:22px var(--font-ui);color:#fff;background:rgba(0,0,0,.55);padding:6px 12px;border:2px solid var(--yellow);animation:capIn .4s ease-out .4s both}
    @keyframes gxspin{to{transform:rotate(360deg)}}
    @keyframes gxFall{to{transform:translateY(1100px) rotate(720deg)}}
    @keyframes gxPop{from{transform:scale(0) rotate(-12deg)}to{transform:none}}
    @keyframes gxShake{0%{transform:translate(-3px,1px) rotate(-1deg)}50%{transform:translate(3px,-1px) rotate(1deg)}100%{transform:translate(-3px,1px)}}
    @keyframes gxBlink{to{opacity:.2}}
    @keyframes gxBoom{0%{transform:scale(.1);opacity:1}100%{transform:scale(1.6);opacity:0}}
    @keyframes gxSmoke{from{transform:translate(0,0) scale(.4);opacity:.9}to{transform:translate(var(--dx),-260px) scale(2.2);opacity:0}}
    @keyframes gxShot{0%{opacity:0;transform:scale(1.15) rotate(var(--r))}25%{opacity:1}100%{opacity:1;transform:scale(1) rotate(var(--r))}}`;
  document.head.appendChild(css);
  let z = 1;
  const boom = () => { flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); };
  const layer = (html, bg) => { const d = document.createElement('div'); d.className = 'gx'; d.style.zIndex = ++z; d.style.background = bg; d.innerHTML = html; stage.appendChild(d); [...stage.children].slice(0, -2).forEach(o => o.remove()); return d; };
  const COLS = ['#ffd23a', '#ff5a3a', '#3fa0ff', '#5fe06a', '#ff7ad8', '#ffffff'];
  const confetti = n => Array.from({ length: n }, (_, i) => `<i class="gx-conf" style="left:${(i * 37) % 100}%;background:${COLS[i % COLS.length]};animation-duration:${1.6 + (i % 5) * 0.35}s;animation-delay:${(i % 7) * 0.08}s"></i>`).join('');
  const BLUE = 'radial-gradient(circle at 50% 45%,#2a3a9a 0,#05081a 75%)', RED = 'radial-gradient(circle at 50% 50%,#5a1010 0,#120404 75%)', GREEN = 'radial-gradient(circle at 50% 45%,#0a5a3a 0,#03140c 75%)';
  el.hidden = false; stage.innerHTML = '';
  const SLOW = window.__trailerSlow || 1;
  const S = []; let t = 0; const add = (dur, fn) => { S.push([t, fn]); t += dur; };

  // 1. Gracias (0–2,3 s)
  add(2300, () => { boom(); layer(`<div class="gx-rays"></div>${confetti(36)}<div class="gx-c"><div class="gx-big"><span>¡Muchísimas</span><span>gracias!</span></div><div class="gx-mid">por todo vuestro apoyo</div></div>`, BLUE); });
  // 2. El servidor reventado (2,3–5,6 s)
  add(1300, () => layer(`<div class="gx-c"><div class="gx-small">¿El fallo del guardado en la nube?</div><div class="gx-srv"><i></i><i></i><i></i></div></div>`, RED));
  add(2000, () => { boom(); layer(`<div class="gx-boom"></div>${[-120, -40, 40, 120].map((dx, i) => `<i class="gx-smoke" style="left:calc(50% - 30px);top:52%;--dx:${dx}px;animation-delay:${i * 0.12}s"></i>`).join('')}
    <div class="gx-c"><div class="gx-big" style="font-size:58px"><span>¡Habíais</span><span>reventado</span><span>el servidor!</span></div><div class="gx-tag ok" style="animation-delay:.9s">YA ESTÁ ARREGLADO ✓</div></div>`, RED); });
  // 3. Se vienen cositas (5,6–8,4 s)
  add(2800, () => { boom(); layer(`<div class="gx-rays"></div><div class="gx-c"><div class="gx-big" style="font-size:54px"><span>Se vienen</span><span>muchas cositas…</span></div>
    <div class="gx-shots">${['a', 'b', 'c', 'd'].map((n, i) => `<img src="tshots/${n}.png" alt="" style="--r:${[-6, 5, -3, 4][i]}deg;animation-delay:${0.25 + i * 0.5}s">`).join('')}<div class="gx-q" style="animation-delay:2.2s">?</div></div></div>`, GREEN); });
  // 4. Final (8,4–10,2 s)
  add(1800, () => { boom(); layer(`<div class="gx-rays"></div>${confetti(24)}<div class="gx-c"><img class="gx-logo" src="ui/logo_rogue.png" alt=""><div class="gx-mid">¡Seguid jugando!</div><div class="gx-url">franmndezzzz.github.io/Inazuma-Rogue</div></div>`, BLUE); });
  add(0, () => { window.__trailerDone = true; });
  S.forEach(([ms, fn]) => setTimeout(fn, ms * SLOW));
})();
