// Mini tráiler «ya disponible en inglés» con el estilo de la intro del juego.
// Se ejecuta dentro de la página del juego (lo lanza tools/trailer.py) y avisa al terminar.
// window.__trailerLang = 'en' | 'es'
(() => {
  const L = window.__trailerLang || 'en';
  const C = {
    en: {
      now: 'NOW IN ENGLISH', nowSub: 'Inazuma Rogue speaks your language',
      fan: 'An Inazuma Eleven fan game', fanSub: 'Free · play right in your browser',
      five: '5-a-side football', fiveSub: 'Real time · on phone and PC',
      players: 'Over 2,000 players', playersSub: 'From Inazuma 1, 2 and 3',
      moves: 'Legendary special moves', movesSub: 'Fire Tornado, God Hand, Death Zone…',
      career: 'Career Mode', careerSub: 'Manage your school… all the way to the World Cup',
      lang: 'English · Español', langSub: 'Switch any time in Settings → 🌐 Language',
      soon: 'COMING SOON', soonBig: 'Player Career Mode', soonSub: 'Live the career of a single player',
      end: 'Play free now',
    },
    es: {
      now: 'YA EN INGLÉS', nowSub: 'Inazuma Rogue ahora también en inglés',
      fan: 'Un fan game de Inazuma Eleven', fanSub: 'Gratis · se juega en el navegador',
      five: 'Fútbol 5 contra 5', fiveSub: 'En tiempo real · en el móvil y en el PC',
      players: 'Más de 2.000 jugadores', playersSub: 'Del Inazuma 1, 2 y 3',
      moves: 'Supertécnicas legendarias', movesSub: 'Tornado de fuego, Mano celestial, Triángulo letal…',
      career: 'Modo Carrera', careerSub: 'Lleva a tu instituto… hasta el Mundial',
      lang: 'Español · English', langSub: 'Cámbialo cuando quieras en Ajustes → 🌐 Idioma',
      soon: 'PRÓXIMAMENTE', soonBig: 'Modo Carrera Jugador', soonSub: 'Vive la carrera de un solo jugador',
      end: 'Juega gratis ya',
    },
  }[L];
  const URL_TXT = 'franmndezzzz.github.io/Inazuma-Rogue';
  const el = document.getElementById('intro'), stage = el.querySelector('.in-stage'), cap = el.querySelector('.in-cap'), flash = el.querySelector('.in-flash');
  el.querySelector('.in-skip').style.display = 'none';
  document.getElementById('screen').hidden = true;
  const css = document.createElement('style');
  css.textContent = `.in-cap b{font-size:40px!important}.in-cap small{font-size:22px!important}
    .tr-big{font:56px var(--font-ui);color:var(--yellow);text-align:center;line-height:1.05;text-transform:uppercase;letter-spacing:2px;
      text-shadow:3px 0 0 var(--ink),-3px 0 0 var(--ink),0 3px 0 var(--ink),0 -3px 0 var(--ink),4px 4px 0 #000;animation:slam .55s cubic-bezier(.2,1.6,.4,1) both}
    .tr-mid{font:30px var(--font-ui);color:#fff;text-align:center;text-shadow:2px 2px 0 #000;animation:capIn .5s ease-out .25s both}
    .tr-flags{display:flex;gap:26px;font-size:96px;animation:slam .6s cubic-bezier(.2,1.6,.4,1) .1s both}
    .tr-soon{background:radial-gradient(circle,#2a0a40 0,#000 75%)}
    .tr-tag{font:24px var(--font-ui);color:#000;background:var(--yellow);padding:6px 16px;letter-spacing:3px;animation:blink 1.1s steps(2) infinite}
    .tr-url{font:22px var(--font-ui);color:#fff;background:rgba(0,0,0,.55);padding:6px 12px;border:2px solid var(--yellow)}
    .in-faces canvas{width:84px!important;height:84px!important}`;
  document.head.appendChild(css);
  let z = 1;
  const say = (t, sub = '') => { cap.classList.remove('on'); void cap.offsetWidth; cap.innerHTML = t ? `<b>${t}</b>${sub ? `<small>${sub}</small>` : ''}` : ''; if (t) cap.classList.add('on'); };
  const boom = () => { flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); };
  const layer = (html, cls) => { const d = document.createElement('div'); d.className = cls; d.style.zIndex = ++z; d.innerHTML = html; stage.appendChild(d); [...stage.children].slice(0, -2).forEach(o => o.remove()); return d; };
  const slide = (img, t, kb, sub) => { const d = layer('<div class="in-bg"></div><div class="in-fg ' + kb + '"></div>', 'in-slide'); d.firstChild.style.backgroundImage = d.lastChild.style.backgroundImage = `url("ui/${img}.png")`; say(t, sub); return d; };
  const faces = (list, t, sub) => { const d = layer('<div class="in-faces"></div>', 'in-slide'); list.forEach((p, i) => { const c = Sprites.face(Sprites.refOf(p), 84); c.style.animationDelay = (i * 0.08) + 's'; d.firstChild.appendChild(c); }); say(t, sub); return d; };
  const legends = GAME.players.filter(p => p.gacha !== false && p.cs && (p.rarity === 'legendaria' || p.rarity === 'epica')).sort(() => Math.random() - 0.5).slice(0, 12);
  el.hidden = false; stage.innerHTML = ''; say('');
  const SLOW = window.__trailerSlow || 1;   // al grabar, todo va más lento para capturar cada fotograma
  const T = 2600, at = (ms, fn) => setTimeout(fn, ms * SLOW);
  const S = [
    [0, () => { boom(); layer(`<img class="in-logo slam" src="ui/logo_rogue.png" alt=""><div class="tr-big">${C.now}</div><div class="tr-mid">${C.nowSub}</div>`, 'in-center'); say(''); }],
    [T * 1.1, () => { boom(); slide('bg_title', C.fan, 'kbZoom', C.fanSub); }],
    [T * 2.1, () => slide('ill05', C.five, 'kbA', C.fiveSub)],
    [T * 3.1, () => { boom(); faces(legends, C.players, C.playersSub); }],
    [T * 4.1, () => slide('bg_team', C.moves, 'kbB', C.movesSub)],
    [T * 5.1, () => { boom(); slide('ill23', C.career, 'kbA', C.careerSub); }],
    [T * 6.1, () => { boom(); layer(`<div class="tr-flags"><span>🇬🇧</span><span>🇪🇸</span></div><div class="tr-big" style="font-size:44px">${C.lang}</div><div class="tr-mid" style="font-size:22px">${C.langSub}</div>`, 'in-center'); say(''); }],
    [T * 7.3, () => { boom(); layer(`<div class="tr-tag">${C.soon}</div><div class="tr-big">${C.soonBig}</div><div class="tr-mid">${C.soonSub}</div>`, 'in-center tr-soon'); say(''); }],
    [T * 8.7, () => { boom(); layer(`<img class="in-logo slam" src="ui/logo_rogue.png" alt=""><div class="tr-mid">${C.end}</div><div class="tr-url">${URL_TXT}</div>`, 'in-center in-final'); say(''); }],
    [T * 10.2, () => { window.__trailerDone = true; }],
  ];
  S.forEach(([ms, fn]) => at(ms, fn));
})();
