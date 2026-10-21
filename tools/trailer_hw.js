// Tráiler corto del evento de Halloween (v0.31.6: 6 legendarios con Zohen, premios por entrar), solo en español, con «La sombra negra» (tema de Ray Dark).
// Lo lanza tools/trailer.py:
//   TRAILER_JS=tools/trailer_hw.js TRAILER_MUSIC=e204 TRAILER_SHOTS=<carpeta de capturas 1170×2532> python3 tools/trailer.py es salida.mp4
// Capturas esperadas: 01_menu, 02_evento, 04_cartas, 05_jefe, 07_retos, 09_login (.png) — /tmp/claude-0/hwshots2.py las hace
(() => {
  const URL_TXT = 'franmndezzzz.github.io/Inazuma-Rogue';
  const el = document.getElementById('intro'), stage = el.querySelector('.in-stage'), cap = el.querySelector('.in-cap'), flash = el.querySelector('.in-flash');
  el.querySelector('.in-skip').style.display = 'none';
  document.getElementById('screen').hidden = true;
  cap.style.display = 'none';
  flash.style.background = '#ff8a1a';
  const css = document.createElement('style');
  css.textContent = `
    .hw-slide{position:absolute;inset:0;overflow:hidden;background:#0a0512;animation:inFade .5s ease-out both}
    .hw-blur{position:absolute;inset:-40px;background-size:cover;background-position:center;filter:blur(22px) brightness(.3) saturate(.8) hue-rotate(-20deg);transform:scale(1.1)}
    .hw-fog{position:absolute;left:-40%;width:180%;height:30%;border-radius:50%;pointer-events:none;z-index:4;
      background:radial-gradient(ellipse at center,rgba(220,205,255,.2),transparent 70%);filter:blur(8px);animation:hwFogT 6s ease-in-out infinite alternate}
    .hw-fog.a{top:8%}.hw-fog.b{top:55%;animation-delay:-3s;animation-duration:7s}.hw-fog.c{bottom:-8%;animation-duration:5s}
    .hw-vig{position:absolute;inset:0;z-index:4;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,transparent 45%,rgba(0,0,0,.75) 100%)}
    .hw-head{position:absolute;left:18px;right:18px;top:44px;text-align:center;z-index:5}
    .hw-head b{display:block;font:42px var(--font-ui);line-height:1.02;color:#ff9a2a;text-transform:uppercase;letter-spacing:1px;
      text-shadow:3px 0 0 #2a0a3a,-3px 0 0 #2a0a3a,0 3px 0 #2a0a3a,0 -3px 0 #2a0a3a,4px 4px 0 #000,0 0 22px rgba(255,120,20,.7);animation:slam .5s cubic-bezier(.2,1.6,.4,1) both}
    .hw-head small{display:block;margin-top:10px;font:22px var(--font-ui);color:#eadcff;text-shadow:2px 2px 0 #000;animation:capIn .45s ease-out .2s both}
    .hw-phone{position:absolute;left:50%;top:224px;width:304px;height:658px;margin-left:-152px;border:9px solid #0b0b12;border-radius:34px;overflow:hidden;z-index:3;
      box-shadow:0 0 0 3px #ff8a1a,0 0 34px rgba(255,120,20,.45),0 26px 50px rgba(0,0,0,.7);background:#000;animation:phIn .6s cubic-bezier(.2,1.3,.4,1) both}
    .hw-phone img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;animation:phPan 3.4s ease-in-out both}
    .hw-phone.zoom img{transform-origin:var(--zx,50%) var(--zy,40%);animation:phZoom 3.4s ease-in-out both}
    .hw-tag{position:absolute;z-index:6;right:54px;top:204px;transform:rotate(9deg);font:22px var(--font-ui);color:#fff;background:#6a1fa8;padding:6px 12px;border:3px solid #000;
      box-shadow:3px 3px 0 #000,0 0 14px rgba(160,80,255,.6);animation:tagIn .5s cubic-bezier(.2,1.8,.4,1) .35s both}
    .hw-tag.left{right:auto;left:50px;transform:rotate(-8deg)}
    .hw-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px;z-index:5;text-align:center}
    .hw-whisper{font:30px var(--font-ui);color:#d8c8ff;letter-spacing:3px;text-shadow:0 0 18px rgba(170,120,255,.9),2px 2px 0 #000;animation:hwWh 2.6s ease-in-out both}
    .hw-big{font:68px var(--font-ui);line-height:.98;color:#ff9a2a;text-transform:uppercase;letter-spacing:2px;
      text-shadow:4px 0 0 #2a0a3a,-4px 0 0 #2a0a3a,0 4px 0 #2a0a3a,0 -4px 0 #2a0a3a,6px 6px 0 #000,0 0 30px rgba(255,120,20,.8);animation:slam .55s cubic-bezier(.2,1.6,.4,1) both}
    .hw-big span{display:block}.hw-big small{display:block;font-size:34px;color:#eadcff;margin-top:8px}
    .hw-date{font:26px var(--font-ui);color:#000;background:#ff9a2a;padding:6px 16px;letter-spacing:2px;border:3px solid #000;box-shadow:4px 4px 0 #000;animation:capIn .4s ease-out .35s both}
    .hw-now{font:40px var(--font-ui);color:#fff;letter-spacing:2px;text-shadow:3px 3px 0 #000,0 0 22px rgba(255,140,30,.9);animation:slam .55s cubic-bezier(.2,1.6,.4,1) .5s both}
    .hw-mid{font:28px var(--font-ui);color:#fff;text-shadow:2px 2px 0 #000;animation:capIn .5s ease-out .3s both}
    .hw-url{font:22px var(--font-ui);color:#fff;background:rgba(0,0,0,.6);padding:6px 12px;border:2px solid #ff9a2a;animation:capIn .5s ease-out .5s both}
    .hw-logo{width:440px;max-width:86%;filter:drop-shadow(0 4px 0 rgba(0,0,0,.5)) drop-shadow(0 0 18px rgba(255,120,20,.55));animation:slam .5s cubic-bezier(.2,1.6,.4,1) both}
    .hw-pk{position:absolute;bottom:40px;width:120px;height:120px;z-index:5;animation:pkGlow 1.4s ease-in-out infinite alternate}
    .hw-legs{display:grid;grid-template-columns:repeat(3,132px);gap:12px;justify-content:center;margin-top:6px}
    .hw-leg{display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0;animation:legIn .5s cubic-bezier(.2,1.6,.4,1) both}
    .hw-leg i{display:block;width:128px;height:128px;background:url('sprites/fhw.png') no-repeat;background-size:128px 768px;image-rendering:pixelated;
      border:3px solid #9a4a16;box-shadow:0 0 16px rgba(130,40,180,.7),3px 3px 0 #000;background-color:#140a20}
    .hw-leg span{font:18px var(--font-ui);color:#fff;text-shadow:2px 2px 0 #000}
    .hw-zo{width:300px;height:300px;background:url('sprites/fhw.png') no-repeat 0 -1500px;background-size:300px 1800px;image-rendering:pixelated;border:5px solid #9a4a16;
      box-shadow:0 0 40px rgba(130,40,180,.9),6px 6px 0 #000;background-color:#140a20;animation:rayIn 1s ease-out both}
    .hw-new{font:30px var(--font-ui);color:#fff;background:#b0281a;padding:6px 16px;border:3px solid #000;box-shadow:4px 4px 0 #000;transform:rotate(-4deg);animation:tagIn .5s cubic-bezier(.2,1.8,.4,1) .2s both}
    .hw-ray{width:200px;height:200px;image-rendering:pixelated;filter:drop-shadow(0 0 22px rgba(160,60,255,.9));animation:rayIn 1.2s ease-out both}
    @keyframes hwFogT{from{transform:translateX(-10%)}to{transform:translateX(10%)}}
    @keyframes hwWh{0%{opacity:0;filter:blur(8px);letter-spacing:14px}35%,75%{opacity:1;filter:none;letter-spacing:3px}100%{opacity:.85}}
    @keyframes phIn{from{transform:translateY(140px) rotate(-6deg);opacity:0}to{transform:none;opacity:1}}
    @keyframes phPan{from{transform:scale(1)}to{transform:scale(1.05)}}
    @keyframes phZoom{0%,25%{transform:scale(1)}100%{transform:scale(1.4)}}
    @keyframes tagIn{from{transform:scale(0) rotate(30deg)}to{transform:rotate(9deg)}}
    @keyframes legIn{from{opacity:0;transform:scale(.3) rotate(-10deg)}to{opacity:1;transform:none}}
    @keyframes rayIn{from{opacity:0;transform:scale(1.4);filter:brightness(0)}to{opacity:1;transform:none}}
    @keyframes pkGlow{from{filter:drop-shadow(0 0 6px rgba(255,138,26,.4))}to{filter:drop-shadow(0 0 22px rgba(255,138,26,1))}}`;
  document.head.appendChild(css);
  // Calabaza en pixel art (dibujada aquí, sin emojis: en la grabación no siempre salen)
  const pumpkin = () => {
    const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d');
    const P = ['......gg........', '.......g........', '....oooooooo....', '..oooOoooOoooo..', '.ooOoooooooOooo.', 'ooOoKKoooKKoOooo', 'ooOoKKoooKKoOooo', 'ooOooooooooooOoo',
      'ooOoKoKoKoKooOoo', 'ooOooKKKKKKooOoo', '.ooOooooooooOoo.', '..ooOooooooOoo..', '....oooooooo....'];
    const C = { o: '#ff8a1a', O: '#c85a0a', g: '#3a8a2a', K: '#ffe066' };
    P.forEach((r, y) => [...r].forEach((ch, x) => { if (C[ch]) { g.fillStyle = C[ch]; g.fillRect(x, y + 2, 1, 1); } }));
    return c.toDataURL();
  };
  const PK = pumpkin();
  let z = 1;
  const boom = () => { flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); };
  const fog = '<div class="hw-fog a"></div><div class="hw-fog b"></div><div class="hw-fog c"></div><div class="hw-vig"></div>';
  const layer = html => { const d = document.createElement('div'); d.className = 'hw-slide'; d.style.zIndex = ++z; d.innerHTML = html + fog; stage.appendChild(d); [...stage.children].slice(0, -2).forEach(o => o.remove()); return d; };
  const shot = (img, title, sub, opt = {}) => layer(`<div class="hw-blur" style="background-image:url('tshots/${img}.png')"></div>
    <div class="hw-head"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>
    <div class="hw-phone${opt.zoom ? ' zoom' : ''}" style="${opt.zoom ? `--zx:${opt.zoom[0]};--zy:${opt.zoom[1]}` : ''}"><img src="tshots/${img}.png" alt=""></div>
    ${opt.tag ? `<div class="hw-tag${opt.left ? ' left' : ''}">${opt.tag}</div>` : ''}`);
  const BG = 'radial-gradient(circle at 50% 110%,#7a2a05 0,#2a0a3a 45%,#07030c 80%)';
  const card = (html, bg = BG) => layer(`<div class="hw-center">${html}</div>`).style.background = bg;
  el.hidden = false; stage.innerHTML = '';
  const SLOW = window.__trailerSlow || 1;
  const at = (ms, fn) => setTimeout(fn, ms * SLOW);
  const S = []; let t = 0; const add = (dur, fn) => { S.push([t, fn]); t += dur; };

  add(2600, () => card(`<div class="hw-whisper">Algo oscuro se acerca…</div>`, 'radial-gradient(circle at 50% 50%,#1a0a2a 0,#000 75%)'));
  add(3200, () => { boom(); card(`<img class="hw-logo" src="ui/logo_rogue.png" alt=""><div class="hw-big"><span>Halloween</span><small>Evento especial</small></div>
    <div class="hw-date">22 OCT – 3 NOV</div><img class="hw-pk" style="left:40px" src="${PK}"><img class="hw-pk" style="right:40px" src="${PK}">`); });
  add(2700, () => shot('01_menu', 'El menú se viste de miedo', 'Calabazas, niebla y caramelos', { tag: 'EVENTO' }));
  add(4000, () => { boom(); card(`<div class="hw-big" style="font-size:52px"><span>6 legendarios</span><span>de miedo</span></div>
    <div class="hw-legs">${['Johan Tassman', 'Nathan Jones', 'Destra', 'Hebimos', 'Bash Lancer', 'Zohen'].map((n, i) =>
      `<div class="hw-leg" style="animation-delay:${0.35 + i * 0.32}s"><i style="background-position:0 -${i * 128}px"></i><span>${n}</span></div>`).join('')}</div>
    <div class="hw-mid" style="animation-delay:2s">Solo durante el evento</div>`); });
  add(3000, () => { boom(); card(`<div class="hw-new">¡NUEVO!</div><div class="hw-zo"></div><div class="hw-big" style="font-size:60px"><span>Zohen</span><small>defensa legendario · media 94</small></div>`,
    'radial-gradient(circle at 50% 42%,#2a3a1a 0,#14081e 45%,#050208 80%)'); });
  add(2700, () => shot('02_evento', 'Sobre Calabaza', 'Solo villanos y jugadores de miedo', { zoom: ['50%', '30%'] }));
  add(2700, () => { boom(); shot('04_cartas', '¡Gasta caramelos!', '15 la tirada · legendario asegurado a las 40', { tag: 'x10 = 150', left: true }); });
  add(2900, () => shot('05_jefe', 'El Ocultismo te espera', 'Partido jefe en un campo nocturno con niebla', { tag: 'JEFE' }));
  add(2900, () => { boom(); shot('09_login', 'Entra 5 días y llévate…', '150 caramelos · 10 tickets · 1000 monedas · un +80 · Jim Oscuro', { tag: 'REGALOS', zoom: ['50%', '12%'] }); });
  add(2700, () => shot('07_retos', 'Supera los 3 retos…', 'Exorcista · Truco o trato · Coleccionista'));
  add(3200, () => { boom(); card(`<img class="hw-ray" src="ui/raydark.png" alt=""><div class="hw-big" style="font-size:56px"><span>Ray Dark</span><small>ficha como tu mánager</small></div>
    <div class="hw-date" style="background:#b07aff">+10 % DE INGRESOS</div>`, 'radial-gradient(circle at 50% 40%,#3a0a5a 0,#07030c 75%)'); });
  add(4000, () => { boom(); card(`<img class="hw-logo" src="ui/logo_rogue.png" alt=""><div class="hw-big" style="font-size:58px"><span>Halloween</span></div>
    <div class="hw-date">22 OCT – 3 NOV</div><div class="hw-now">¡YA DISPONIBLE!</div><div class="hw-mid">¡Juega gratis!</div><div class="hw-url">${URL_TXT}</div>
    <img class="hw-pk" style="left:40px" src="${PK}"><img class="hw-pk" style="right:40px" src="${PK}">`); });
  add(0, () => { window.__trailerDone = true; });
  S.forEach(([ms, fn]) => at(ms, fn));
})();
