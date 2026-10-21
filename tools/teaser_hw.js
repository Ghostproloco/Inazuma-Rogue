// Teaser corto del evento de Halloween (para TikTok el día antes): «Mañana…», un vistazo rápido y la fecha.
//   TRAILER_JS=tools/teaser_hw.js TRAILER_MUSIC=e204 TRAILER_SHOTS=<capturas> python3 tools/trailer.py es teaser.mp4
// Usa las capturas 05_jefe y 04_cartas (solo un instante, para dar ganas) y los retratos de miedo (sprites/fhw.png).
(() => {
  const el = document.getElementById('intro'), stage = el.querySelector('.in-stage'), cap = el.querySelector('.in-cap'), flash = el.querySelector('.in-flash');
  el.querySelector('.in-skip').style.display = 'none';
  document.getElementById('screen').hidden = true;
  cap.style.display = 'none';
  flash.style.background = '#ff8a1a';
  const css = document.createElement('style');
  css.textContent = `
    .tz{position:absolute;inset:0;overflow:hidden;background:#000;animation:inFade .4s ease-out both}
    .tz-fog{position:absolute;left:-40%;width:180%;height:30%;border-radius:50%;pointer-events:none;z-index:4;
      background:radial-gradient(ellipse at center,rgba(220,205,255,.2),transparent 70%);filter:blur(8px);animation:tzFog 5s ease-in-out infinite alternate}
    .tz-fog.a{top:10%}.tz-fog.b{top:58%;animation-delay:-2.5s}
    .tz-vig{position:absolute;inset:0;z-index:5;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,transparent 40%,rgba(0,0,0,.85) 100%)}
    .tz-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:20px;z-index:6;text-align:center}
    .tz-wh{font:30px var(--font-ui);color:#d8c8ff;letter-spacing:3px;text-shadow:0 0 18px rgba(170,120,255,.9),2px 2px 0 #000;animation:tzWh 2.4s ease-in-out both}
    .tz-shot{position:absolute;inset:0;background-size:cover;background-position:center 30%;filter:brightness(.55) saturate(.7) hue-rotate(-15deg) contrast(1.15);animation:tzGlimpse .9s ease-out both}
    .tz-face{width:220px;height:220px;background:url('sprites/fhw.png') no-repeat;background-size:220px 1100px;image-rendering:pixelated;filter:brightness(.15) drop-shadow(0 0 24px rgba(255,110,20,.9));animation:tzFace 1.6s ease-in both}
    .tz-q{font:64px var(--font-ui);color:#ff9a2a;text-shadow:4px 4px 0 #000,0 0 26px rgba(255,120,20,.9);animation:slam .5s cubic-bezier(.2,1.6,.4,1) .5s both}
    .tz-big{font:92px var(--font-ui);line-height:.95;color:#ff9a2a;text-transform:uppercase;letter-spacing:3px;
      text-shadow:5px 0 0 #2a0a3a,-5px 0 0 #2a0a3a,0 5px 0 #2a0a3a,0 -5px 0 #2a0a3a,7px 7px 0 #000,0 0 34px rgba(255,120,20,.85);animation:slam .55s cubic-bezier(.2,1.6,.4,1) both}
    .tz-date{font:30px var(--font-ui);color:#000;background:#ff9a2a;padding:8px 18px;letter-spacing:2px;border:3px solid #000;box-shadow:4px 4px 0 #000;animation:capIn .4s ease-out .45s both}
    .tz-logo{width:400px;max-width:84%;filter:drop-shadow(0 4px 0 rgba(0,0,0,.5)) drop-shadow(0 0 18px rgba(255,120,20,.55));animation:capIn .5s ease-out .8s both}
    .tz-small{font:24px var(--font-ui);color:#eadcff;text-shadow:2px 2px 0 #000;animation:capIn .5s ease-out 1.1s both}
    @keyframes tzFog{from{transform:translateX(-10%)}to{transform:translateX(10%)}}
    @keyframes tzWh{0%{opacity:0;filter:blur(8px);letter-spacing:14px}35%,80%{opacity:1;filter:none;letter-spacing:3px}100%{opacity:.8}}
    @keyframes tzGlimpse{0%{opacity:0;transform:scale(1.25)}20%{opacity:1}100%{opacity:.85;transform:scale(1.05)}}
    @keyframes tzFace{0%{filter:brightness(0);transform:scale(.9)}70%{filter:brightness(.15) drop-shadow(0 0 24px rgba(255,110,20,.9))}85%{filter:brightness(.9) drop-shadow(0 0 24px rgba(255,110,20,.9))}100%{filter:brightness(.1);transform:scale(1.05)}}`;
  document.head.appendChild(css);
  let z = 1;
  const boom = () => { flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); };
  const fog = '<div class="tz-fog a"></div><div class="tz-fog b"></div><div class="tz-vig"></div>';
  const layer = (html, bg) => { const d = document.createElement('div'); d.className = 'tz'; d.style.zIndex = ++z; if (bg) d.style.background = bg; d.innerHTML = html + fog; stage.appendChild(d); [...stage.children].slice(0, -2).forEach(o => o.remove()); return d; };
  el.hidden = false; stage.innerHTML = '';
  const SLOW = window.__trailerSlow || 1;
  const S = []; let t = 0; const add = (dur, fn) => { S.push([t, fn]); t += dur; };
  const BG = 'radial-gradient(circle at 50% 110%,#7a2a05 0,#2a0a3a 45%,#07030c 80%)';

  add(2400, () => layer(`<div class="tz-c"><div class="tz-wh">Algo oscuro se acerca…</div></div>`, 'radial-gradient(circle at 50% 50%,#1a0a2a 0,#000 75%)'));
  add(900, () => { boom(); layer(`<div class="tz-shot" style="background-image:url('tshots/05_jefe.png')"></div>`); });
  add(1700, () => layer(`<div class="tz-c"><div class="tz-face" style="background-position:0 -${2 * 220}px"></div><div class="tz-q">¿?</div></div>`, '#000'));
  add(700, () => { boom(); layer(`<div class="tz-shot" style="background-image:url('tshots/04_cartas.png');background-position:center 85%"></div>`); });
  add(3800, () => { boom(); layer(`<div class="tz-c"><div class="tz-big">Mañana…</div><div class="tz-date">22 OCT</div><img class="tz-logo" src="ui/logo_rogue.png" alt=""><div class="tz-small">Evento especial de Halloween</div></div>`, BG); });
  add(0, () => { window.__trailerDone = true; });
  S.forEach(([ms, fn]) => setTimeout(fn, ms * SLOW));
})();
