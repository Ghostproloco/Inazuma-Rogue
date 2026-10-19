/* =====================================================================
   APP: menús, modos, gacha, plantilla, recorridos y pantallas (DOM).
   ===================================================================== */
const ELEM_LABEL = { fuego: 'Fuego', viento: 'Viento', bosque: 'Bosque', 'montaña': 'Montaña', neutro: '—' };
const TYPE_LABEL = { tiro: 'Tiro', regate: 'Regate', bloqueo: 'Bloqueo', parada: 'Parada' };
const ROLE_LABEL = { POR: 'Portero', DEF: 'Defensa', MED: 'Medio', DEL: 'Delantero' };
const ROLES4 = ['POR', 'DEF', 'MED', 'DEL'];
const FIELD_LABEL = { normal: 'Campo clásico', noche: 'Campo nocturno', jungla: 'Campo de la jungla', atardecer: 'Campo al atardecer', nieve: 'Campo nevado', acero: 'Estadio de acero', cielo: 'Campo celestial', volcan: 'Campo volcánico' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chip = e => `<span class="chip ${EL(e).css}">${ELEM_LABEL[e] || e}</span>`;
const rchip = r => `<span class="rar ${r}">${RARITY[r].label}</span>`;
const stars = n => `<span class="stars">${'★'.repeat(n)}<s>${'★'.repeat(MAX_STARS - n)}</s></span>`;
const TYPE_ICON = { tiro: '⚽', regate: '💨', bloqueo: '🛡️', parada: '✋' };
const techLine = t => `<span class="tline">${chip(t.elem)}<b>${esc(t.name)}</b><i>${TYPE_LABEL[t.type] || ''} · ${t.power}</i></span>`;

const VERSION = '0.24.1';
const App = (() => {
  const $ = id => document.getElementById(id);
  const settings = { minutes: 3, techMode: 'boton', formation: '1-2-1-1', slowmo: 1, intro: 1, controls: 'auto', autoSwitch: 1 };
  try { Object.assign(settings, JSON.parse(localStorage.getItem('inazuma-ajustes') || '{}')); } catch (_) {}
  const saveSettings = () => { try { localStorage.setItem('inazuma-ajustes', JSON.stringify(settings)); } catch (_) {} };
  Profile.load();

  const api = { match: null, matchSheet: null, running: false, scene: null, mode: null, run: Run.load(), settings, pick: null, draft: null };
  const body = $('screenBody');
  api.inMatch = () => api.running;

  function show(id) {
    ['screen', 'pause'].forEach(k => $(k).hidden = k !== id);
    Pad.show(!id);
    $('hud').hidden = !!id && id !== 'pause';
    $('pauseBtn').hidden = !!id;
  }
  // Fondo de cada pantalla: imágenes del juego (carpeta ui/); sin fondo = rayas azules del menú
  function screen(html, bg) {
    const sc = $('screen');
    sc.classList.toggle('bg-cover', !!bg);
    sc.style.backgroundImage = bg ? `url("ui/${bg}.png")` : '';
    body.classList.toggle('cardbg-clear', !!bg);
    body.innerHTML = html; sc.scrollTop = 0; show('screen');
  }
  const crestOf = key => (TEAM(key) || {}).crest || 1;
  // Barra fija arriba con «Volver» y el título; barra fija abajo para el botón principal
  const top = (title, id = 'back', label = 'Volver') => `<div class="top"><button class="ghost back" id="${id}">◀ ${label}</button><h2>${title}</h2></div>`;
  const bottom = html => `<div class="bottom">${html}</div>`;
  const face = (ref, size) => Sprites.face(ref, size);
  function wallet() { const P = Profile.data; return `<div class="runbar"><span>🪙 ${P.coins}</span><span>🎟️ ${P.tickets}</span><span title="Rayos Raimon">⚡ ${P.rayos}</span><span>👥 ${Profile.ids().length}</span></div>`; }
  function opts(group, key, list, obj = settings) {
    return `<div class="group"><label>${group}</label><div class="opts">${list.map(([v, t]) =>
      `<button data-k="${key}" data-v="${v}" aria-pressed="${obj[key] == v}">${t}</button>`).join('')}</div></div>`;
  }
  function bindOpts(obj, onChange) {
    body.querySelectorAll('.opts button[data-k]').forEach(b => b.addEventListener('click', () => {
      obj[b.dataset.k] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v;
      b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      onChange && onChange(b.dataset.k);
    }));
  }
  const formSelect = (obj, key = 'formation') => `<div class="group"><label>Formación</label><select id="formSel">${Object.entries(FORMATIONS).map(([k, f]) =>
    `<option value="${k}" ${obj[key] === k ? 'selected' : ''}>${k} · ${f.name}</option>`).join('')}</select></div>`;
  document.addEventListener('pointerdown', () => Sound.unlock(), { capture: true });

  /* ---------- Menú principal: modos ---------- */
  function renderMenu() {
    if (!Profile.data.firstDone) return renderWelcome();
    const P = Profile.data, r = api.run && api.run.state !== 'over' ? api.run : null;
    const done = P.story.s1.done;
    screen(`<div class="title"><img class="logo" id="logo" src="ui/logo_rogue.png" alt="Inazuma Rogue"><span>5 contra 5 · roguelite</span></div>${wallet()}
      ${r ? `<button class="cta" id="mContinue">Continuar: ${esc(r.name)}<small>Partido ${r.index + 1}${r.kind === 'infinite' ? '' : ' de ' + r.schedule.length} · ${'♥'.repeat(r.lives)}</small></button>` : ''}
      <div class="modes">
        <button class="mode" id="mCareer"><span class="cicon">🏆</span><span class="mt"><b>Modo Carrera</b><small>${Career.data && !Career.data.over ? 'Temporada ' + Career.data.season + ' · ' + DIV_NAME[Career.myDiv()] + ' · semana ' + Career.data.week : 'Eres el mánager: 3 divisiones y ascensos'}</small></span></button>
        <button class="mode" id="mStory">${Sprites.crest(1)}<span class="mt"><b>Historia</b><small>${P.story.s4.done ? 'Etapas 1, 2 y 3 completadas ✓' : P.story.s3.done ? 'Etapa 3 · Fase 2 abierta (mejor: ' + P.story.s4.best + ')' : P.story.s2.done ? 'Etapa 3 abierta: el Inazuma 3' : done ? 'Etapa 1 ✓ · Etapa 2 abierta (mejor: ' + P.story.s2.best + ')' : 'Etapa 1 · mejor: ' + P.story.s1.best + ' victorias'}</small></span></button>
        <button class="mode" id="mSpecial">${Sprites.crest(588)}<span class="mt"><b>Equipos especiales</b><small>${SPECIALS.filter(x => Profile.unlocked({ special: x })).length} de ${SPECIALS.length} abiertos</small></span></button>
        <button class="mode ${done ? '' : 'locked'}" id="mChain">${Sprites.crest(599)}<span class="mt"><b>Cadenas</b><small>${done ? 'Desafíos cortos · premio: Rayo Raimon' : '🔒 Completa la Etapa 1'}</small></span></button>
        <button class="mode ${done ? '' : 'locked'}" id="mInf">${Sprites.crest(15)}<span class="mt"><b>Infinito</b><small>${done ? 'Por oleadas · récord: ' + P.infBest : '🔒 Completa la Etapa 1'}</small></span></button>
      </div>
      <div class="grid2">
        <button class="ghost big" id="mGacha">Gacha<small>${P.tickets} tickets</small></button>
        <button class="ghost big" id="mTeam">Plantilla<small>Entrenar y Rayos</small></button>
        <button class="ghost big" id="mQuick">Partido rápido<small>Tus mejores 5</small></button>
        <button class="ghost big" id="mSound">Ajustes<small>Partido, controles y sonido</small></button>
      </div>
      <div class="grid2"><button class="ghost" id="mGift">🎁 Código de regalo</button><button class="ghost" id="mSaves">💾 Guardar / cargar</button></div>
      ${r ? '<button class="ghost" id="mAbandon">Abandonar partida en curso</button>' : ''}
      <button class="ver" id="ver">v${VERSION}${settings.dev ? ' · dev' : ''}</button>`, 'bg_title');
    let vt = 0, vtT = 0;   // 20 toques seguidos en la versión: modo desarrollador
    $('ver').onclick = () => {
      const now = Date.now(); vt = now - vtT < 1500 ? vt + 1 : 1; vtT = now;
      if (vt >= 20) { vt = 0; if (!settings.dev) { settings.dev = true; settings.devWin = 1; saveSettings(); UI.toast('Modo desarrollador activado', 1800); } Sound.sfx('reveal'); renderDev(); }
      else if (vt >= 15) UI.toast('Faltan ' + (20 - vt) + ' toques…', 600);
    };
    const busy = () => { if (r) { UI.toast('Termina o abandona la partida en curso'); return true; } return false; };
    if (r) { $('mContinue').onclick = openRun; $('mAbandon').onclick = () => { Run.clear(); api.run = null; renderMenu(); }; }
    $('mStory').onclick = () => { if (!busy()) renderStory(); };
    $('mCareer').onclick = () => renderCareer();
    $('mSpecial').onclick = () => { if (!busy()) renderSpecials(); };
    $('mChain').onclick = () => { if (!done) return UI.toast('Completa la Etapa 1 de la Historia'); if (!busy()) renderChains(); };
    $('mInf').onclick = () => { if (!done) return UI.toast('Completa la Etapa 1 de la Historia'); if (!busy()) newDraft('infinite', {}); };
    $('mGacha').onclick = renderGacha; $('mTeam').onclick = () => renderTeam();
    $('mGift').onclick = renderGift;
    $('mSaves').onclick = () => renderSaves(renderMenu);
    $('mQuick').onclick = startQuick; $('mSound').onclick = renderSettings;
    Sound.music('menu');
  }

  const mini = keys => `<span class="mini">${keys.map(k => Sprites.crest(crestOf(k))).join('')}</span>`;
  function renderStory() {
    const P = Profile.data;
    screen(`${top('Historia')}${wallet()}
      <div class="modes">${STAGES.map((s, i) => { const open = s.available && Profile.unlocked({ stage: s }), ord = STAGE_ORDER[s.key] || [];
        return `<button class="mode ${open ? '' : 'locked'}" data-st="${s.key}">${Sprites.crest([1, 33, 3021, 3057][i] || 15)}<span class="mt"><b>${s.name}</b>
        <small>${open ? (P.story[s.key] && P.story[s.key].done ? 'Completada ✓ · puedes repetirla' : ord.length ? 'De ' + esc(ord[0]) + ' a ' + esc(ord[ord.length - 1]) : '') : '🔒 ' + s.note}</small>${open && ord.length ? mini(ord) : ''}</span></button>`; }).join('')}</div>
      <p class="note">Cada intento es roguelite: las técnicas, habilidades y fichajes se pierden al acabar. La etapa que completas queda superada para siempre y abre las Cadenas, el Infinito y más equipos especiales.</p>
`, 'bg_team');
    body.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
      const st = STAGES.find(s => s.key === b.dataset.st);
      if (!st.available || !Profile.unlocked({ stage: st })) return UI.toast(st.note);
      newDraft('story', { diff: 'medio', stage: st.key });
    });
    $('back').onclick = renderMenu;
  }
  function renderSpecials() {
    const P = Profile.data;
    screen(`${top('Especiales')}${wallet()}
      <p class="note">Un solo partido, sin segundas oportunidades. Si ganas, te llevas a su estrella para tu plantilla (o una estrella más si ya la tienes).</p>
      <div class="modes" id="sp"></div>`);
    SPECIALS.forEach(x => {
      const t = TEAM(x.key), open = Profile.unlocked({ special: x });
      const sum = p => Object.values(p.ie).reduce((a, b) => a + b, 0);
      const star = t.players.filter(m => m.role !== 'POR').map(m => PLAYER(m.id)).filter(p => p.cs).sort((a, b) => sum(b) - sum(a))[0];
      const b = document.createElement('button'); b.className = 'mode' + (open ? '' : ' locked');
      b.innerHTML = `${Sprites.crest(t.crest)}<span class="mt"><b>${esc(t.name)}</b><small>${open ? `${FIELD_LABEL[TEAM_FIELD[t.key]] || ''} · Premio: ${star ? esc(star.name) : '—'}${P.specials[t.key] ? ' · ganado ×' + P.specials[t.key] : ''}`
        : '🔒 ' + (x.unlock === 'done' ? 'Completa la Etapa 1' : x.unlock === 'done2' ? 'Completa la Etapa 2' : `Gana ${x.unlock} partidos en la Etapa 1`)}</small></span>`;
      b.onclick = () => { if (!open) return UI.toast('Aún bloqueado'); newDraft('special', { team: t.key }); };
      $('sp').appendChild(b);
    });
    $('back').onclick = renderMenu;
  }
  function renderChains() {
    const P = Profile.data;
    screen(`${top('Cadenas')}${wallet()}
      <p class="note">Varios partidos seguidos sin recuperar vidas. <b>Premios por completarla:</b> ⚡ Rayo Raimon · 5 🎟️ · 150 🪙 · la estrella del último rival se une a tu plantilla (o sube una ★).
      <b>La primera vez:</b> una técnica legendaria y 10 🎟️ más. <b>Sin perder vidas:</b> +5 🎟️ 💎. <b>Medallas:</b> 🥉 1 vez · 🥈 3 veces · 🥇 5 veces (15 🎟️ y otro Rayo).</p>
      <div class="modes">${CHAINS.map(c => { const open = Profile.unlocked({ chain: c });
        return `<button class="mode${open ? '' : ' locked'}" data-ch="${c.key}">${Sprites.crest(crestOf(c.teams[0]))}<span class="mt"><b>${open ? '' : '🔒 '}${esc(c.name)}</b><small>${open ? esc(c.desc) : c.needs === 's4' ? 'Completa la Etapa 3' : 'Completa la Etapa 2'} · ${c.teams.length} partidos · ${'♥'.repeat(c.lives)}${P.chains[c.key] ? ' · ' + (P.chains[c.key] >= 5 ? '🥇' : P.chains[c.key] >= 3 ? '🥈' : '🥉') + ' ×' + P.chains[c.key] + (P.chainPerfect && P.chainPerfect[c.key] ? ' 💎' : '') : ' · 📜 técnica legendaria la 1.ª vez'}</small>${mini(c.teams)}</span></button>`; }).join('')}</div>`);
    body.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => {
      const c = CHAINS.find(x => x.key === b.dataset.ch);
      if (!Profile.unlocked({ chain: c })) return UI.toast('Se abre al completar la Etapa 2');
      newDraft('chain', { chain: c.key });
    });
    $('back').onclick = renderMenu;
  }

  function renderWelcome() {
    screen(`<div class="title"><img class="logo" src="ui/logo_rogue.png" alt="Inazuma Rogue"><span>¡Bienvenido!</span></div>
      <p class="note">Tu plantilla empieza vacía. Haz tu tirada de bienvenida: <b>10 jugadores</b> del juego, con un <b>portero asegurado</b> y al menos uno épico o mejor. Además recibes 60 monedas para entrenar.</p>
      <p class="note">Probabilidades: común 60 % · rara 28 % · épica 10 % · legendaria 2 %. Cada 10 tiradas sin épica, la siguiente lo es seguro.</p>
      <button class="cta" id="wPull">Tirada de bienvenida ×10</button>`, 'bg_title');
    $('wPull').onclick = () => {
      Sound.unlock();
      Profile.data.pity = 0;
      const res = Gacha.pull(10, { keeper: true });
      Profile.data.firstDone = true; Profile.data.coins += 60; Profile.save();
      renderMachine(res, 1, renderMenu, 'Tirada de bienvenida');
    };
  }

  /* ---------- Gacha ---------- */
  function renderGacha() {
    const P = Profile.data, B = BANNERS.find(b => b.id === P.banner) || BANNERS[0];
    screen(`${top('Gacha')}${wallet()}
      <div class="banners" id="bn"></div>
      <p class="note">Común 60 % · Rara 28 % · Épica 10 % · Legendaria 2 %. En el tramo legendario, la mitad de las veces sale una <b>técnica legendaria</b> (de las más fuertes del juego).<br>
      Épica o mejor asegurada cada 10 tiradas (llevas ${P.pity} de 10). Los repetidos suben una estrella (máx. ${MAX_STARS}); con 5 estrellas, o una técnica repetida, dan monedas.</p>
      <p class="note">Tickets: Historia (1 por victoria y 3 al completarla), Especiales (2), Cadenas (2 al completarlas) e Infinito (2 por oleada especial).</p>
      ${bottom(`<div class="grid2"><button class="cta" id="g1" ${P.tickets < 1 ? 'disabled' : ''}>Tirar ×1<small>1 ticket</small></button><button class="cta" id="g10" ${P.tickets < 10 ? 'disabled' : ''}>Tirar ×10<small>10 tickets</small></button></div>`)}`, 'bg_green');
    BANNERS.forEach(b => {
      const seenL = new Set(), legs = GAME.players.filter(p => p.banner === b.id && p.rarity === 'legendaria').filter(p => { const k = p.full.replace(/ \((IE2|IE3)\)$/, ''); return !seenL.has(k) && seenL.add(k); });
      const el = document.createElement('button');
      el.className = 'banner-card' + (b.id === B.id ? ' sel' : '');
      const n = GAME.players.filter(p => p.banner === b.id && p.gacha !== false).length;
      el.innerHTML = `${Sprites.crest(b.crest)}<span class="mt"><b>${esc(b.name)}</b><small>${esc(b.desc)} · ${n} jugadores</small><span class="legs"></span></span>`;
      legs.forEach(p => el.querySelector('.legs').appendChild(face(Sprites.refOf(p), 32)));
      el.onclick = () => { P.banner = b.id; Profile.save(); Sound.sfx('click'); renderGacha(); };
      $('bn').appendChild(el);
    });
    const go = n => { if (P.tickets < n) return; P.tickets -= n; Profile.save(); renderMachine(Gacha.pull(n, { banner: B.id }), B.id, renderGacha); };
    $('g1').onclick = () => go(1); $('g10').onclick = () => go(10); $('back').onclick = renderMenu;
  }
  // Carta de un resultado del gacha (jugador o técnica legendaria)
  function makeCard(r) {
    const c = document.createElement('div');
    c.className = 'gcard ' + r.tier;
    if (r.tech != null) {
      const t = TECH(r.tech);
      c.classList.add('techcard', EL(t.elem).css);
      c.innerHTML = `<div class="scroll">${TYPE_ICON[t.type] || '★'}</div><div class="gname">${esc(t.name)}</div>
        <div class="gmeta">${rchip('legendaria')}${chip(t.elem)}</div><div class="gmeta">${TYPE_LABEL[t.type]} · ${t.power}</div>
        <div class="gtag">${r.isNew ? '¡TÉCNICA NUEVA!' : '+' + r.coins + ' 🪙'}</div>`;
      return c;
    }
    const pd = PLAYER(r.id);
    c.appendChild(face(Sprites.refOf(pd), 80));
    c.insertAdjacentHTML('beforeend', `<div class="gname">${esc(pd.name)}</div><div class="gmeta">${rchip(r.tier)}<span>${pd.role}</span>${chip(pd.elem)}</div>
      <div class="gtag">${r.isNew ? 'NUEVO' : r.coins ? '+' + r.coins + ' 🪙' : '★ ' + r.star}</div>`);
    return c;
  }
  function renderReveal(res, done, title = '¡Nuevos jugadores!') {
    screen(`<h2>${title}</h2><div class="reveal" id="rv"></div>${bottom('<button class="cta" id="ok" hidden>Continuar</button>')}`, 'bg_whistle');
    const box = $('rv');
    res.forEach((r, i) => {
      const c = makeCard(r); c.style.animationDelay = (i * 0.18) + 's'; box.appendChild(c);
      setTimeout(() => Sound.sfx(r.tier === 'legendaria' || r.tier === 'epica' ? 'reveal' : 'click'), i * 180);
    });
    setTimeout(() => { $('ok').hidden = false; }, res.length * 180 + 300);
    $('ok').onclick = done;
  }

  /* ---------- Máquina de gachapón ---------- */
  const MACHINE_COLORS = { 1: ['#e8c21a', '#1f4fc0'], 2: ['#2a5fd0', '#e8e8f0'], 3: ['#5a1a8a', '#e01a4a'], 4: ['#b8742a', '#f2e6c0'] };
  const CAP_COLORS = { comun: '#b8bcc8', rara: '#3f8fff', epica: '#a24cff', legendaria: '#ffcc22' };
  function drawMachine(cv, st) {
    const g = cv.getContext('2d'), [c1, c2] = st.colors;
    g.imageSmoothingEnabled = false; g.clearRect(0, 0, 96, 128);
    const ring = (x, y, r, fill, line) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = 2; g.stroke(); } };
    // cúpula con cápsulas dentro
    ring(48, 40, 34, 'rgba(190,225,255,.25)', '#10183a');
    g.save(); g.beginPath(); g.arc(48, 40, 32, 0, Math.PI * 2); g.clip();
    st.balls.forEach(b => {
      const y = b.y + (st.shake ? Math.sin(st.t / 30 + b.x) * 1.5 : 0);
      g.beginPath(); g.arc(b.x, y, 6, Math.PI, 0); g.fillStyle = b.c; g.fill();
      g.beginPath(); g.arc(b.x, y, 6, 0, Math.PI); g.fillStyle = '#f4f4f4'; g.fill();
      g.strokeStyle = '#10183a'; g.lineWidth = 1; g.beginPath(); g.arc(b.x, y, 6, 0, Math.PI * 2); g.stroke();
    });
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2; g.beginPath(); g.arc(48, 40, 27, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
    // cuerpo
    g.fillStyle = '#10183a'; g.fillRect(12, 66, 72, 58);
    g.fillStyle = c1; g.fillRect(14, 68, 68, 54);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(70, 68, 12, 54);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(14, 68, 4, 54);
    g.fillStyle = c2; g.fillRect(14, 72, 68, 6);
    g.fillStyle = '#10183a'; g.fillRect(10, 64, 76, 4);
    if (st.crest && st.crest.complete) g.drawImage(st.crest, 22, 82, 24, 24);
    // ranura de salida
    g.fillStyle = '#10183a'; g.fillRect(30, 108, 24, 12); g.fillStyle = '#2a2a3a'; g.fillRect(32, 110, 20, 8);
    g.fillStyle = c2; g.fillRect(32, 110, 20, 3);
    // manivela
    ring(66, 94, 9, '#9aa4b8', '#10183a'); ring(66, 94, 4, '#5a6478');
    const hx = 66 + Math.cos(st.crank) * 9, hy = 94 + Math.sin(st.crank) * 9;
    g.strokeStyle = '#10183a'; g.lineWidth = 4; g.beginPath(); g.moveTo(66, 94); g.lineTo(hx, hy); g.stroke();
    g.strokeStyle = '#d8dce6'; g.lineWidth = 2; g.beginPath(); g.moveTo(66, 94); g.lineTo(hx, hy); g.stroke();
    ring(hx, hy, 4, c2, '#10183a');
    // pie
    g.fillStyle = '#10183a'; g.fillRect(16, 122, 64, 6);
  }
  function renderMachine(res, bannerId, done, title) {
    const B = BANNERS.find(b => b.id === bannerId) || BANNERS[0];
    screen(`<h2>${esc(title || B.name)}</h2>
      <div class="gmach"><canvas id="mc" width="96" height="128"></canvas><div class="gm-hint" id="mHint">${Controls.pc() ? 'Arrastra la manivela en círculo (o pulsa Espacio)' : 'Gira la manivela con el dedo ↻'}</div></div>
      <div class="caps" id="caps"></div>
      ${bottom('<div class="grid2"><button class="ghost" id="mSkip">Saltar</button><button class="cta" id="mAll" hidden>Abrir todas</button></div><button class="cta" id="mOk" hidden>Continuar</button>')}`, 'bg_whistle');
    const cv = $('mc'), caps = $('caps');
    const crest = new Image(); crest.src = `ui/crest${B.crest}.png`;
    let seed = bannerId * 97; const rr = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const ballCols = Object.values(CAP_COLORS);
    const balls = Array.from({ length: 22 }, () => { const a = rr() * Math.PI * 2, d = Math.sqrt(rr()) * 26; return { x: 48 + Math.cos(a) * d, y: 40 + Math.abs(Math.sin(a)) * d * 0.9, c: ballCols[Math.floor(rr() * 4)] }; });
    const st = { colors: MACHINE_COLORS[bannerId] || MACHINE_COLORS[1], crest, balls, crank: -Math.PI / 2, shake: false, t: 0 };
    let raf = 0, dispensed = false, alive = true;
    const loop = t => { if (!alive || !cv.isConnected) return; st.t = t; drawMachine(cv, st); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    crest.onload = () => drawMachine(cv, st);
    // Cápsulas: a veces una legendaria llega disfrazada de épica y sube al abrirla
    const items = res.map(r => ({ r, shown: r.tier === 'legendaria' && Math.random() < 0.5 ? 'epica' : r.tier, opened: false }));
    let left = items.length;
    const finish = () => { $('mHint').textContent = '¡Ya están todas abiertas!'; $('mAll').hidden = true; $('mSkip').hidden = true; $('mOk').hidden = false; };
    function openCap(it, el) {
      if (it.opened) return Promise.resolve(); it.opened = true;
      return new Promise(res2 => {
        const up = it.shown !== it.r.tier;
        el.classList.add('shake'); Sound.sfx('click');
        setTimeout(() => {
          if (up) { el.classList.remove('t-' + it.shown); el.classList.add('t-' + it.r.tier, 'upgrade'); Sound.sfx('tech'); flash(CAP_COLORS.legendaria); }
          setTimeout(() => {
            el.classList.remove('shake'); el.classList.add('open');
            if (it.r.tier === 'legendaria' || it.r.tier === 'epica') { flash(CAP_COLORS[it.r.tier]); Sound.sfx('reveal'); } else Sound.sfx('pass');
            setTimeout(() => {
              const card = makeCard(it.r); card.classList.add('fromcap'); if (items.length === 1) card.classList.add('solo'); el.replaceWith(card);
              if (--left === 0) finish();
              res2();
            }, 260);
          }, up ? 700 : 0);
        }, up ? 900 : 380);
      });
    }
    function flash(col) { const f = document.createElement('div'); f.className = 'gflash'; f.style.background = col; document.body.appendChild(f); setTimeout(() => f.remove(), 450); }
    function dispense() {
      if (dispensed) return; dispensed = true; st.shake = true;
      $('mHint').textContent = items.length > 1 ? 'Toca cada cápsula para abrirla' : 'Toca la cápsula para abrirla';
      items.forEach((it, i) => setTimeout(() => {
        const el = document.createElement('button');
        el.className = 'cap t-' + it.shown + (items.length === 1 ? ' big' : '');
        el.innerHTML = '<i class="ct"></i><i class="cb"></i>';
        el.onclick = () => openCap(it, el);
        caps.appendChild(el); Sound.sfx('pass');
        if (i === items.length - 1) { st.shake = false; if (items.length > 1) $('mAll').hidden = false; }
      }, 250 + i * 140));
    }
    // Manivela: arrastrar en círculo; un toque la hace girar sola
    let drag = null, total = 0, lastTick = 0;
    const center = () => { const b = cv.getBoundingClientRect(); return { x: b.left + 66 / 96 * b.width, y: b.top + 94 / 128 * b.height }; };
    const turn = d => { st.crank += d; total += Math.abs(d); if (total - lastTick > Math.PI / 2) { lastTick = total; Sound.sfx('click'); } if (total >= Math.PI * 2) dispense(); };
    const autoSpin = () => { if (dispensed || autoSpin.on) return; autoSpin.on = true; let k = 0; const iv = setInterval(() => { turn(Math.PI / 10); if (++k >= 20 || dispensed) { clearInterval(iv); dispense(); } }, 35); };
    cv.addEventListener('pointerdown', e => { if (dispensed) return; const c = center(); drag = { a: Math.atan2(e.clientY - c.y, e.clientX - c.x), moved: 0, t: Date.now() }; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
    cv.addEventListener('pointermove', e => {
      if (!drag || dispensed) return; const c = center(), a = Math.atan2(e.clientY - c.y, e.clientX - c.x);
      let d = a - drag.a; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      drag.a = a; drag.moved += Math.abs(d); turn(Math.abs(d));
    });
    cv.addEventListener('pointerup', () => { if (drag && drag.moved < 0.3) autoSpin(); drag = null; });
    const key = e => { if (!cv.isConnected) return removeEventListener('keydown', key); if ((e.code === 'Space' || e.code === 'Enter') && !dispensed) { e.preventDefault(); autoSpin(); } };
    addEventListener('keydown', key);
    $('mAll').onclick = async () => { $('mAll').hidden = true; for (const el of [...caps.querySelectorAll('.cap')]) { const it = items[[...caps.children].indexOf(el)]; await openCap(it, el); await new Promise(r => setTimeout(r, 120)); } };
    $('mSkip').onclick = () => { alive = false; cancelAnimationFrame(raf); removeEventListener('keydown', key); renderReveal(res, done, title || '¡Nuevos jugadores!'); };
    $('mOk').onclick = () => { alive = false; cancelAnimationFrame(raf); removeEventListener('keydown', key); done(); };
  }

  /* ---------- Plantilla, entrenamiento y Rayos ---------- */
  const RORDER = { legendaria: 0, epica: 1, rara: 2, comun: 3 };
  function sortedIds(filter) {
    return Profile.ids().filter(id => !filter || PLAYER(id).role === filter)
      .sort((a, b) => RORDER[PLAYER(a).rarity] - RORDER[PLAYER(b).rarity] || Profile.owned(b).stars - Profile.owned(a).stars || PLAYER(a).name.localeCompare(PLAYER(b).name));
  }
  function miniCard(id, extra = '') {
    const pd = PLAYER(id), o = Profile.owned(id);
    const el = document.createElement('button'); el.className = 'pcard ' + pd.rarity;
    el.appendChild(face(Sprites.refOf(pd), 56));
    el.insertAdjacentHTML('beforeend', `<div class="pinfo"><div class="pname">${esc(pd.name)}</div>
      <div class="pmeta">${rchip(pd.rarity)} ${ROLE_LABEL[pd.role]} ${chip(pd.elem)} ${o ? stars(o.stars) : ''}</div>${extra}</div>`);
    return el;
  }
  // Ficha pequeña para cuadrículas (plantilla y elegir jugador)
  function tile(id, extra = '') {
    const pd = PLAYER(id), o = Profile.owned(id);
    const el = document.createElement('button'); el.className = 'ptile ' + pd.rarity;
    el.appendChild(face(Sprites.refOf(pd), 64));
    el.insertAdjacentHTML('beforeend', `<span class="tn">${esc(pd.name)}</span><span class="tm">${rchip(pd.rarity)}<i>${pd.role}</i></span>${o ? stars(o.stars) : ''}${extra}`);
    return el;
  }
  let teamFilter = '', teamSort = 'rareza', teamTab = 'equipo';
  // Buscador y filtros de jugadores (plantilla y elegir jugador)
  const PF = { q: '', rar: '', elem: '', game: '' };
  const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const gameOf = id => id >= 30000 ? '3' : id >= 20000 ? '2' : '1';
  function pfMatch(id) {
    const p = PLAYER(id);
    if (PF.q) { const q = norm(PF.q.trim()); if (q && !norm(p.name).includes(q) && !norm(p.full).includes(q)) return false; }
    return (!PF.rar || p.rarity === PF.rar) && (!PF.elem || p.elem === PF.elem) && (!PF.game || gameOf(id) === PF.game);
  }
  const pfActive = () => !!(PF.q || PF.rar || PF.elem || PF.game);
  function pfBar() {
    const opt = (v, t, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${t}</option>`;
    return `<div class="pfbar"><div class="pfq"><input id="pfQ" type="search" placeholder="Buscar por nombre o mote…" value="${esc(PF.q)}" autocomplete="off"><button class="ghost" id="pfX" ${pfActive() ? '' : 'hidden'} title="Quitar filtros">✕</button></div>
      <div class="pfsel"><select id="pfR" aria-label="Rareza">${opt('', 'Rareza', PF.rar)}${['legendaria', 'epica', 'rara', 'comun'].map(r => opt(r, RARITY[r].label, PF.rar)).join('')}</select>
      <select id="pfE" aria-label="Elemento">${opt('', 'Elemento', PF.elem)}${['fuego', 'bosque', 'viento', 'montaña'].map(e => opt(e, ELEM_LABEL[e], PF.elem)).join('')}</select>
      <select id="pfG" aria-label="Juego">${opt('', 'Juego', PF.game)}${opt('1', 'Inazuma 1', PF.game)}${opt('2', 'Inazuma 2', PF.game)}${opt('3', 'Inazuma 3', PF.game)}</select></div></div>`;
  }
  // Conecta la barra: al escribir solo se redibuja la lista (no se pierde el foco)
  function pfWire(root, redrawList, redrawAll) {
    const q = root.querySelector('#pfQ'), x = root.querySelector('#pfX');
    q.oninput = () => { PF.q = q.value; x.hidden = !pfActive(); redrawList(); };
    [['#pfR', 'rar'], ['#pfE', 'elem'], ['#pfG', 'game']].forEach(([s, k]) => root.querySelector(s).onchange = e => { PF[k] = e.target.value; redrawAll(); });
    x.onclick = () => { PF.q = PF.rar = PF.elem = PF.game = ''; redrawAll(); };
  }
  const SORTS = { rareza: null, fuerza: (a, b) => sumIE(b) - sumIE(a), nombre: (a, b) => PLAYER(a).name.localeCompare(PLAYER(b).name) };
  const sumIE = id => STAT_KEYS.reduce((t, k) => t + statOf(id, Profile.owned(id), k), 0);

  /* ---------- Mi equipo: pizarra con el campo, puestos y candidatos ---------- */
  const st = (id, k) => statOf(id, Profile.owned(id), k);
  // Nota de un jugador para un puesto (media de lo que importa en ese puesto)
  const ROLE_RATE = {
    POR: id => (st(id, 'defensa') + st(id, 'fisico')) / 2,
    DEF: id => (st(id, 'defensa') * 2 + st(id, 'fisico') + st(id, 'rapidez')) / 4,
    MED: id => (st(id, 'control') * 2 + st(id, 'tiro') + st(id, 'rapidez')) / 4,
    DEL: id => (st(id, 'tiro') * 2 + st(id, 'rapidez') + st(id, 'control')) / 4,
  };
  const rate = (id, role) => Math.round(ROLE_RATE[role](id) * (playsAs(PLAYER(id), role) ? 1 : 0.85));
  function bestFor(roles, pool) {   // el mejor de cada puesto, porteros primero
    const used = new Set(), out = roles.map(() => null);
    const order = roles.map((r, i) => i).sort((a, b) => (roles[a] === 'POR' ? -1 : 0) - (roles[b] === 'POR' ? -1 : 0));
    for (const i of order) {
      const free = pool.filter(id => !used.has(id)), gks = free.filter(id => playsAs(PLAYER(id), 'POR'));
      const c = (roles[i] === 'POR' && gks.length ? gks : free).sort((a, b) => rate(b, roles[i]) - rate(a, roles[i]))[0];   // la portería, solo para porteros
      if (c != null) { out[i] = c; used.add(c); }
    }
    return out;
  }
  const autoLineup = formation => bestFor(FORMATIONS[formation].roles, Profile.ids());
  function savedTeam() {
    const t = settings.team, owned = new Set(Profile.ids());
    if (t && FORMATIONS[t.formation] && Array.isArray(t.ids) && t.ids.length === 5) {
      const ids = t.ids.map(id => owned.has(id) ? id : null);
      if (ids.some(x => x == null)) {   // huecos (jugador que ya no está): se rellenan solos
        const roles = FORMATIONS[t.formation].roles, rest = Profile.ids().filter(id => !ids.includes(id));
        ids.forEach((id, i) => { if (id == null) { const c = rest.sort((a, b) => rate(b, roles[i]) - rate(a, roles[i])).shift(); ids[i] = c ?? null; } });
      }
      return { formation: t.formation, ids };
    }
    return { formation: settings.formation, ids: autoLineup(settings.formation) };
  }
  function saveTeam(t) { settings.team = { formation: t.formation, ids: t.ids.slice() }; settings.formation = t.formation; saveSettings(); }
  const firstName = n => n.split(' ')[0];

  // Campo con los 5 puestos. items[i] = { ref, name, rarity, badge } o null
  function pitch(roles, items, sel, onSlot) {
    const pos = layout(roles), el = document.createElement('div');
    el.className = 'pitch';
    el.innerHTML = '<i class="pl-mid"></i><i class="pl-circle"></i><i class="pl-box"></i><i class="pl-small"></i>';
    roles.forEach((r, i) => {
      const it = items[i], b = document.createElement('button');
      b.className = 'pslot' + (i === sel ? ' sel' : '') + (it ? ' ' + (it.rarity || '') : ' empty');
      b.style.left = (50 + pos[i].home[0] / 17 * 44) + '%';
      b.style.top = (85 - pos[i].home[1] / 31 * 71) + '%';
      const fc = document.createElement('span'); fc.className = 'pf';
      if (it) fc.appendChild(face(it.ref, 46)); else fc.textContent = '+';
      b.appendChild(fc);
      b.insertAdjacentHTML('beforeend', `<span class="pr">${r}${it && it.badge != null ? ' · ' + it.badge : ''}</span><span class="pn">${it ? esc(firstName(it.name)) : 'Elegir'}</span>`);
      b.onclick = () => onSlot(i);
      el.appendChild(b);
    });
    return el;
  }
  // Editor completo: formación, campo y lista de candidatos para el puesto marcado
  function teamEditor(box, t, onChange) {
    const roles = FORMATIONS[t.formation].roles;
    if (t.sel == null || t.sel > 4) t.sel = Math.max(0, t.ids.findIndex(x => x == null));
    t.show = t.show || 'pos';
    const role = roles[t.sel];
    const avg = t.ids.every(x => x != null) ? Math.round(t.ids.reduce((a, id, i) => a + rate(id, roles[i]), 0) / 5) : null;
    box.innerHTML = `${formSelect(t)}
      <div class="edbar"><button class="ghost" id="edAuto">⚡ Mejor equipo</button><span class="note">${avg != null ? 'Media del equipo: <b>' + avg + '</b>' : 'Faltan jugadores'}</span></div>
      <div id="edPitch"></div>
      <h3>Puesto: ${ROLE_LABEL[role]} <small>toca un jugador para ponerlo; toca otro puesto del campo para cambiarlo</small></h3>
      ${pfBar()}<div class="opts small" id="edShow"><button data-v="pos" aria-pressed="${t.show === 'pos'}">De ${ROLE_LABEL[role].toLowerCase()}</button><button data-v="all" aria-pressed="${t.show === 'all'}">Todos</button></div>
      <div class="pgrid" id="edList"></div>`;
    const redraw = () => { onChange && onChange(); teamEditor(box, t, onChange); };
    box.querySelector('#edPitch').appendChild(pitch(roles, t.ids.map((id, i) => id == null ? null :
      { ref: Sprites.refOf(PLAYER(id)), name: PLAYER(id).name, rarity: PLAYER(id).rarity, badge: rate(id, roles[i]) }), t.sel, i => { t.sel = i; Sound.sfx('click'); teamEditor(box, t, onChange); }));
    box.querySelector('#formSel').onchange = e => {   // al cambiar de formación se recolocan los mismos 5
      t.formation = e.target.value; const keep = t.ids.filter(x => x != null);
      t.ids = bestFor(FORMATIONS[t.formation].roles, keep.length === 5 ? keep : Profile.ids()); t.sel = 0; redraw();
    };
    box.querySelector('#edAuto').onclick = () => { t.ids = autoLineup(t.formation); Sound.sfx('reveal'); redraw(); };
    box.querySelectorAll('#edShow button').forEach(b => b.onclick = () => { t.show = b.dataset.v; teamEditor(box, t, onChange); });
    let pool = Profile.ids();
    if (t.show === 'pos' || role === 'POR') pool = pool.filter(id => playsAs(PLAYER(id), role));   // a portería solo van porteros
    pool.sort((a, b) => rate(b, role) - rate(a, role));
    const list = box.querySelector('#edList');
    const drawList = () => {
    const ids = pool.filter(pfMatch); list.innerHTML = '';
    if (!ids.length) list.innerHTML = pool.length ? '<p class="note">Ningún jugador coincide con la búsqueda.</p>' : '<p class="note">No tienes jugadores de este puesto. Toca «Todos».</p>';
    ids.forEach(id => {
      const at = t.ids.indexOf(id);
      const c = tile(id, `<span class="slot">${at >= 0 ? 'En el equipo · ' + roles[at] : 'Nota ' + rate(id, role)}</span>`);
      if (at >= 0) c.classList.add('sel');
      c.onclick = () => {
        if (at >= 0 && roles[at] === 'POR' && t.ids[t.sel] != null && !playsAs(PLAYER(t.ids[t.sel]), 'POR')) return UI.toast('Así la portería se quedaría sin portero');
        if (at >= 0) t.ids[at] = t.ids[t.sel];   // si ya juega, se cambian de puesto
        t.ids[t.sel] = id; Sound.sfx('click');
        const empty = t.ids.findIndex(x => x == null); if (empty >= 0) t.sel = empty;
        redraw();
        box.querySelector('#edPitch').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };
      list.appendChild(c);
    });
    };
    pfWire(box, drawList, () => teamEditor(box, t, onChange)); drawList();
  }

  function renderTeam() {
    const myTechs = Object.keys(Profile.data.techs).map(Number).filter(t => TECH(t));
    const tabs = `<div class="opts" id="tt"><button data-t="equipo" aria-pressed="${teamTab === 'equipo'}">Mi equipo</button><button data-t="jug" aria-pressed="${teamTab === 'jug'}">Jugadores (${Profile.ids().length})</button><button data-t="tec" aria-pressed="${teamTab === 'tec'}">Técnicas (${myTechs.length})</button></div>`;
    if (teamTab === 'tec') {
      screen(`${top('Plantilla')}${tabs}<p class="note">Técnicas legendarias que has sacado en el gacha. Las puede equipar cualquier jugador de su elemento desde su ficha.</p><div class="cards" id="tk"></div>`);
      if (!myTechs.length) $('tk').innerHTML = '<p class="note">Aún no tienes ninguna. Salen en el tramo legendario del gacha.</p>';
      myTechs.forEach(tid => {
        const t = TECH(tid), who = Profile.ids().filter(id => Profile.learnable(id).gacha.includes(tid));
        const c = document.createElement('div'); c.className = 'pcard techrow ' + EL(t.elem).css;
        c.innerHTML = `<div class="scroll small">${TYPE_ICON[t.type] || '★'}</div><div class="pinfo">${techLine(t)}<div class="pmeta">${who.length ? who.length + ' de tus jugadores pueden equiparla' : 'Ninguno de tus jugadores es de ' + (ELEM_LABEL[t.elem] || t.elem)}</div></div>`;
        $('tk').appendChild(c);
      });
    } else if (teamTab === 'equipo') {
      screen(`${top('Plantilla')}${tabs}<p class="note">Este es el equipo que sale en el partido rápido y al empezar cualquier modo. Se guarda solo.</p><div id="ed"></div>`);
      if (!api.myTeam) api.myTeam = savedTeam();
      teamEditor($('ed'), api.myTeam, () => saveTeam(api.myTeam));
    } else {
      const all = sortedIds(teamFilter); if (SORTS[teamSort]) all.sort(SORTS[teamSort]);
      screen(`${top('Plantilla')}${tabs}${wallet()}${pfBar()}
        <div class="opts" id="tf">${[['', 'Todos'], ...ROLES4.map(r => [r, r])].map(([v, t]) => `<button data-f="${v}" aria-pressed="${teamFilter === v}">${t}</button>`).join('')}</div>
        <div class="sortrow"><span id="tcount"></span><span class="opts small" id="ts">${Object.keys(SORTS).map(k => `<button data-s="${k}" aria-pressed="${teamSort === k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</span></div>
        <div class="pgrid" id="tl"></div>`);
      body.querySelectorAll('#tf button').forEach(b => b.onclick = () => { teamFilter = b.dataset.f; renderTeam(); });
      body.querySelectorAll('#ts button').forEach(b => b.onclick = () => { teamSort = b.dataset.s; renderTeam(); });
      const drawList = () => {
        const ids = all.filter(pfMatch), tl = $('tl'); tl.innerHTML = '';
        $('tcount').textContent = (pfActive() ? ids.length + ' de ' + all.length : ids.length) + ' jugadores · toca uno para entrenarlo';
        if (!ids.length) tl.innerHTML = '<p class="note">Ningún jugador coincide. Prueba con otro nombre o quita filtros (✕).</p>';
        ids.forEach(id => { const c = tile(id); c.onclick = () => renderPlayer(id); tl.appendChild(c); });
      };
      pfWire(body, drawList, renderTeam); drawList();
    }
    body.querySelectorAll('#tt button').forEach(b => b.onclick = () => { teamTab = b.dataset.t; renderTeam(); });
    $('back').onclick = renderMenu;
  }
  function renderPlayer(id) {
    const pd = PLAYER(id), o = Profile.owned(id), P = Profile.data;
    screen(`${top(esc(pd.name))}<div class="phead" id="ph"></div>${wallet()}
      <button class="cta" id="rayo" ${P.rayos < 1 || o.stars >= MAX_STARS ? 'disabled' : ''}>⚡ Usar Rayo Raimon<small>${o.stars >= MAX_STARS ? 'Ya tiene 5 estrellas' : '+1 estrella sin necesitar repetidos (tienes ' + P.rayos + ')'}</small></button>
      <h3>Entrenar <small>+3 por mejora; el límite sube con las estrellas</small></h3><div class="ups" id="ups"></div>
      <h3>Técnicas equipadas <small>las ${TECH_SLOTS} con las que empieza cada partida · toca un hueco y elige</small></h3>
      <div class="eqslots" id="eqs"></div>
      <h3>Puede aprender</h3><div class="eqlist" id="eql"></div>
      <p class="note">Puede equipar sus propias técnicas y las técnicas legendarias del gacha de su elemento (${ELEM_LABEL[pd.elem] || pd.elem}).</p>`);
    const eq = Profile.equipOf(id), L = Profile.learnable(id);
    api.eqSlot = Math.min(api.eqSlot || 0, TECH_SLOTS - 1);
    for (let k = 0; k < TECH_SLOTS; k++) {
      const t = eq[k] != null ? TECH(eq[k]) : null, b = document.createElement('button');
      b.className = 'eqslot' + (k === api.eqSlot ? ' sel' : '');
      b.innerHTML = `<i>Hueco ${k + 1}</i>${t ? techLine(t) : '<span class="tline">Vacío</span>'}`;
      b.onclick = () => { api.eqSlot = k; renderPlayer(id); };
      $('eqs').appendChild(b);
    }
    const addOpt = (tid, src) => {
      const t = TECH(tid), on = eq.includes(tid), b = document.createElement('button');
      b.className = 'eqopt' + (on ? ' on' : '') + (src === 'gacha' ? ' leg' : '');
      b.innerHTML = `${techLine(t)}<i>${on ? 'Equipada' : src === 'gacha' ? 'Del gacha' : 'Suya'}${EVO(tid) != null ? ' · evoluciona a ' + esc(TECH(EVO(tid)).name) : ''}</i>`;
      b.onclick = () => { Profile.setEquip(id, api.eqSlot, tid); Sound.sfx('click'); api.eqSlot = (api.eqSlot + 1) % TECH_SLOTS; renderPlayer(id); };
      $('eql').appendChild(b);
    };
    L.gacha.forEach(t => addOpt(t, 'gacha')); L.own.forEach(t => addOpt(t, 'own'));
    if (!L.own.length && !L.gacha.length) $('eql').innerHTML = '<p class="note">No tiene técnicas que aprender.</p>';
    const ph = $('ph'); ph.appendChild(face(Sprites.refOf(pd), 112));
    ph.insertAdjacentHTML('beforeend', `<div><div class="pname">${esc(pd.name)}</div>${pd.full !== pd.name ? `<div class="pfull">${esc(pd.full)}</div>` : ''}${pd.also ? `<div class="pfull">También: ${pd.also.map(esc).join(' · ')}</div>` : ''}<div class="pmeta">${rchip(pd.rarity)} ${pd.anyRole ? 'Todos los puestos' : ROLE_LABEL[pd.role]} ${chip(pd.elem)} ${stars(o.stars)}</div></div>`);
    STAT_KEYS.forEach(k => {
      const b = document.createElement('button'), can = Profile.canUpgrade(id, k), cost = Profile.upgradeCost(id, k);
      b.innerHTML = `${STAT_LABEL[k]} <b>${statOf(id, o, k)}</b><small>${can ? '+3 · ' + cost + '🪙' : 'máx. ' + statCap(id, o, k)}</small>`;
      b.disabled = !can || P.coins < cost;
      b.onclick = () => { if (Profile.upgrade(id, k)) { Sound.sfx('click'); renderPlayer(id); } };
      $('ups').appendChild(b);
    });
    $('rayo').onclick = () => { if (Profile.useRayo(id)) { Sound.sfx('reveal'); UI.toast(pd.name + ' sube a ' + Profile.owned(id).stars + ' estrellas'); renderPlayer(id); } };
    $('back').onclick = () => renderTeam();
  }

  /* ---------- Antes de empezar un modo: tu equipo y la dificultad ---------- */
  function newDraft(kind, o) {
    const t = savedTeam();
    api.draft = { kind, o, formation: t.formation, diff: o.diff || 'medio', ids: t.ids };
    renderDraft();
  }
  const KIND_TITLE = { story: 'Historia', special: 'Equipo especial', chain: 'Cadena', infinite: 'Infinito' };
  function renderDraft() {
    const d = api.draft;
    const sub = d.kind === 'special' ? esc(d.o.team) : d.kind === 'chain' ? esc(CHAINS.find(c => c.key === d.o.chain).name) : '';
    screen(`${top(KIND_TITLE[d.kind] + (d.kind === 'story' ? ' · ' + STAGE_NAME[d.o.stage || 's1'] : '') + (sub ? ' · ' + sub : ''))}
      ${d.kind === 'story' ? opts('Dificultad', 'diff', [['facil', 'Fácil'], ['medio', 'Medio'], ['dificil', 'Difícil']], d) +
        '<p class="note">Fácil: 5 partidos y 3 vidas · Medio: 6 y 2 · Difícil: 7 y 1.</p>' : ''}
      ${d.kind === 'infinite' ? '<p class="note">Rivales cada vez más fuertes y 2 vidas. Cada 5 partidos, una oleada especial con premio extra.</p>' : ''}
      <div id="ed"></div>
      <p class="note">Las técnicas, habilidades y fichajes se pierden al acabar; monedas, tickets y Rayos se quedan.</p>
      ${bottom(`<button class="cta" id="go">Empezar</button>`)}`);
    bindOpts(d);
    const go = $('go'), sync = () => { go.disabled = d.ids.some(x => x == null); saveTeam(d); api.myTeam = null; };
    teamEditor($('ed'), d, sync); sync();
    go.onclick = () => {
      if (d.ids.some(x => x == null)) return;
      api.run = Run.create(d.kind, d.ids, Object.assign({}, d.o, { diff: d.diff, formation: d.formation }));
      Run.save(api.run); api.pick = null; openRun();
    };
    $('back').onclick = renderMenu;
  }

  /* ---------- Partidos ---------- */
  async function startMatch(teams, golden, field, musicRole, rival) {
    GAME_SPEED = settings.dev && settings.speed ? +settings.speed : 0.75;
    const s = Object.assign({}, settings, { golden, field, difficulty: api.mode === 'run' ? api.run.diff : api.mode === 'career' || api.mode === 'wc' ? Career.matchDiff() : 'facil' });
    screen('<h2>Cargando…</h2>');
    try {
      api.matchSheet = await Sprites.matchSheet([...teams.A.players, ...teams.B.players].map(p => p.sprite));
    } catch (e) { screen(`<h2>No se pudieron cargar los jugadores</h2><p class="note">${esc(e.message)}</p><button class="cta" id="back">Volver</button>`); $('back').onclick = renderMenu; return; }
    api.match = Logic.createMatch(s, teams);
    $('cA').src = api.mode === 'wc' ? 'ui/crest3016.png' : api.mode === 'career' && Career.data ? ClubCrest.url(Career.data.crest, Career.data.school) : 'ui/crest1.png';
    $('nA').textContent = api.mode === 'wc' ? 'Japón' : api.mode === 'career' && Career.data ? Career.data.school.replace(/^Instituto\s+/i, '') : 'Tú';
    UI.reset();
    api.scene && api.scene.bind(api.match, api.matchSheet);
    show(null);
    api.running = true;
    Sound.music(musicRole || 'match', rival);
    if (field && field !== 'normal') UI.toast(FIELD_LABEL[field] || '', 1600);
  }
  function startQuick() {
    if (api.run && api.run.state !== 'over') return UI.toast('Termina o abandona la partida en curso');
    api.mode = 'quick';
    const T = savedTeam(), F = FORMATIONS[T.formation], pos = layout(F.roles), L = T.ids;
    if (L.some(x => x == null)) return UI.toast('Completa tu equipo en Plantilla');
    const A = { name: 'Tu equipo', players: L.map((id, i) => {
      const pd = PLAYER(id);
      return Object.assign(buildMatchPlayer(id, F.roles[i], k => statOf(id, Profile.owned(id), k), runMember(id).techs, [], i, pos[i]), { sprite: Sprites.refOf(pd) });
    }) };
    const key = RIVAL_ORDER[Math.floor(Math.random() * RIVAL_ORDER.length)];
    startMatch({ A, B: rivalTeam(key, 0.9, 0.5) }, false, TEAM_FIELD[key], 'match', key);
  }
  api.togglePause = () => {
    if (!api.match || api.match.over || !$('screen').hidden) return;
    if (api.running) {
      api.running = false;
      $('pauseBody').innerHTML = `<h1>Pausa</h1><button class="cta" id="pResume">Seguir</button>
        <div class="group"><label>Supertécnicas</label><div class="opts">${[['boton', 'Con botón'], ['auto', 'Automáticas']].map(([v, t]) => `<button data-v="${v}" aria-pressed="${settings.techMode === v}">${t}</button>`).join('')}</div></div>
        ${settings.dev && settings.devWin ? '<button class="ghost" id="pWin">🛠 Ganar ahora (desarrollador)</button>' : ''}
        <button class="ghost" id="pQuit">${api.mode === 'run' || api.mode === 'career' || api.mode === 'wc' ? 'Rendirse (cuenta como derrota)' : 'Salir al menú'}</button>`;
      $('pauseBody').querySelectorAll('.opts button').forEach(b => b.addEventListener('click', () => {
        settings.techMode = b.dataset.v; saveSettings(); api.match.settings.techMode = b.dataset.v;
        b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      }));
      $('pResume').onclick = () => api.togglePause();
      if ($('pWin')) $('pWin').onclick = () => { const m = api.match; m.score.A = m.score.B + 1; m.time = 0.01; m.golden = false; api.togglePause(); };
      $('pQuit').onclick = () => {
        if (api.mode === 'run') { api.match.over = true; api.match.result = 'loss'; api.matchEnded(api.match); }
        else if (api.mode === 'career' || api.mode === 'wc') { const m = api.match; m.over = true; m.score.A = 0; m.score.B = Math.max(3, m.score.B); m.result = 'loss'; api.matchEnded(m); }
        else { api.match.over = true; renderMenu(); }
      };
      show('pause');
    } else { show(null); api.running = true; }
  };
  api.matchEnded = s => {
    api.running = false;
    setTimeout(() => {
      Sound.stop(0.6);
      if (api.mode === 'wc') { const r = Career.wcResult(s.score.A, s.score.B); Sound.jingle(r.gA > r.gB || (r.pens && r.pens[0] > r.pens[1]) ? 'win' : r.gA === r.gB && !r.pens ? null : 'lose'); renderWC(r); }
      else if (api.mode === 'career') {
        const nm = Career.nextMatch();
        const pens = nm && nm.ko && s.score.A === s.score.B ? Career.penalties(Career.myRating(), Career.rating(nm.rival)) : null;
        const out = Career.finishMatch(s.score.A, s.score.B, pens, 0, (s.goalLog || []).filter(g => g.team === 'A' && g.key != null).map(g => g.key));
        jingleFor(out);
        renderCareerJornada(out);
      } else if (api.mode === 'run') {
        Run.applyResult(api.run, s.result === 'win' ? 'win' : 'loss', s.score.A);
        Run.save(api.run);
        Sound.jingle(api.run.last.result === 'win' ? 'win' : 'lose');
        renderResult(s);
      } else {
        let rayo = false;
        if (s.result === 'win') rayo = Profile.addWin();
        Sound.jingle(s.result === 'win' ? 'win' : s.result === 'loss' ? 'lose' : null); renderQuickEnd(s, rayo);
      }
    }, 900);
  };

  /* ---------- Partida en curso ---------- */
  function runHeader() {
    const r = api.run;
    return `<div class="runbar"><span>${esc(r.name)}${r.kind === 'story' ? ' · ' + { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' }[r.diff] : ''}</span>
      <span class="hearts">${'♥'.repeat(r.lives)}<s>${'♥'.repeat(Math.max(0, r.maxLives - r.lives))}</s></span>
      <span>🪙 +${r.coinsEarned}</span><span>🎟️ +${r.ticketsEarned}</span><span>⚡ ${Profile.data.rayos}</span></div>`;
  }
  function memberCard(mi, slot) {
    const r = api.run, m = r.roster[mi], pd = PLAYER(m.id), o = m.temp ? null : Profile.owned(m.id);
    const el = document.createElement('div');
    el.className = 'pcard ' + pd.rarity + (api.pick === mi ? ' sel' : '');
    el.appendChild(face(Sprites.refOf(pd), 56));
    el.insertAdjacentHTML('beforeend', `<div class="pinfo"><div class="pname">${esc(pd.name)}${m.temp ? ' <em>temporal</em>' : ''}</div>
      <div class="pmeta"><b>${slot}</b> · ${ROLE_LABEL[pd.role]} ${chip(pd.elem)} ${o ? stars(o.stars) : ''}</div>
      <div class="ptechs">${m.techs.map(TECH).map(techLine).join('') || '<i>Sin técnicas</i>'}</div>
      ${m.passives.length ? `<div class="ppass">${m.passives.map(esc).join(' · ')}</div>` : ''}</div>`);
    return el;
  }
  function openRun() {
    const r = api.run;
    if (r.state === 'reward') return renderReward();
    if (r.state === 'over') return renderOver();
    renderMap();
  }
  function renderMap() {
    const r = api.run, rival = Run.rivalName(r), F = FORMATIONS[r.formation];
    const path = r.kind === 'infinite'
      ? `<p class="note">Oleada ${r.index + 1}${Run.isBoss(r) ? ' · <b>¡oleada especial!</b>' : ''} · récord ${Profile.data.infBest}</p>`
      : `<ol class="path">${r.schedule.map((t, i) => `<li class="${i < r.index ? 'done' : i === r.index ? 'now' : ''}">${Sprites.crest(crestOf(t))}<span>${esc(t)}</span></li>`).join('')}</ol>`;
    screen(`${top(r.kind === 'infinite' ? 'Oleada ' + (r.index + 1) : 'Partido ' + (r.index + 1) + ' de ' + r.schedule.length, 'toMenu', 'Menú')}${runHeader()}
      ${path}<div class="vsrow">${Sprites.crest(crestOf(rival))}<div><b>${esc(rival)}</b><span class="note">${FIELD_LABEL[Run.field(r)] || ''}</span><div class="faces" id="rfaces"></div></div></div>
      ${formSelect(r)}
      <h3>Alineación <small>toca un puesto y luego un suplente (u otro puesto) para cambiarlos</small></h3>
      <div id="lineup"></div>
      <h3>Banquillo</h3><div class="pgrid" id="bench"></div>
      <details class="techs"><summary>Ver técnicas del equipo</summary><div class="cards" id="tdet"></div></details>
      ${bottom(`<button class="cta" id="goMatch">Jugar contra ${esc(rival)}</button>`)}`, 'bg_vs');
    const rt = TEAM(rival);
    if (rt) rt.players.forEach(m => $('rfaces').appendChild(face({ file: m.file, row: m.row }, 40)));
    $('formSel').onchange = e => { r.formation = e.target.value; Run.save(r); renderMap(); };
    const sel = api.mapSel;
    const items = r.lineup.slice(0, 5).map(mi => { const pd = PLAYER(r.roster[mi].id); return { ref: Sprites.refOf(pd), name: pd.name, rarity: pd.rarity }; });
    $('lineup').appendChild(pitch(F.roles, items, sel, i => {
      if (sel != null && sel !== i) { Run.swapLineup(r, sel, r.lineup[i]); api.mapSel = null; Run.save(r); }
      else api.mapSel = sel === i ? null : i;
      Sound.sfx('click'); renderMap();
    }));
    r.roster.forEach((m, mi) => {
      if (r.lineup.slice(0, 5).includes(mi)) return;
      const pd = PLAYER(m.id), c = document.createElement('button');
      c.className = 'ptile ' + pd.rarity; c.appendChild(face(Sprites.refOf(pd), 56));
      c.insertAdjacentHTML('beforeend', `<span class="tn">${esc(pd.name)}</span><span class="tm"><i>${pd.role}</i>${m.temp ? '<em class="tmp">temporal</em>' : ''}</span>`);
      c.onclick = () => {
        if (api.mapSel == null) return UI.toast('Primero toca el puesto del campo');
        Run.swapLineup(r, api.mapSel, mi); api.mapSel = null; Run.save(r); Sound.sfx('click'); renderMap();
      };
      $('bench').appendChild(c);
    });
    if (!$('bench').children.length) $('bench').innerHTML = '<p class="note">Sin suplentes todavía: los fichajes temporales aparecen aquí.</p>';
    r.lineup.slice(0, 5).forEach((mi, si) => $('tdet').appendChild(memberCard(mi, F.roles[si])));
    $('goMatch').onclick = () => { api.mode = 'run'; startMatch(Run.matchTeams(r), true, Run.field(r), Run.musicRole(r), Run.rivalName(r)); };
    $('toMenu').onclick = renderMenu;
    Sound.music('menu');
  }
  function renderResult(s) {
    const r = api.run, L = r.last;
    const gains = [`<li>🪙 +${L.coins} monedas</li>`];
    if (L.tickets) gains.push(`<li>🎟️ +${L.tickets} ticket${L.tickets > 1 ? 's' : ''}</li>`);
    if (L.rayo) gains.push('<li>⚡ ¡5 victorias más: ganas un Rayo Raimon!</li>');
    if (L.chainRayo) gains.push('<li>⚡ Cadena completada: ¡Rayo Raimon!</li>');
    if (L.chainTech != null) gains.push(`<li>📜 Primera vez: técnica legendaria <b>${esc(TECH(L.chainTech).name)}</b></li>`);
    if (L.perfect) gains.push('<li>💎 ¡Cadena perfecta sin perder vidas! +5 🎟️</li>');
    if (L.medal) gains.push(`<li>${L.medal === 'oro' ? '🥇' : '🥈'} Medalla de ${L.medal}: +15 🎟️ y otro ⚡ Rayo</li>`);
    if (L.lifeLost) gains.push(`<li>♥ −1 vida${r.lives > 0 ? ' · repites contra el mismo rival' : ''}</li>`);
    screen(`<img class="finimg" src="ui/fin.png" alt="Fin del partido">${runHeader()}<h2>${L.result === 'win' ? '¡Victoria!' : 'Derrota'}</h2>
      ${scoreLine(s)}
      <ul class="gains">${gains.join('')}</ul><div id="excl"></div>
      <button class="cta" id="next">Continuar</button>`, L.result === 'win' ? 'ill27' : 'ill15');
    if (L.exclusive) {
      const x = L.exclusive, pd = PLAYER(x.id), c = miniCard(x.id, `<div class="slot">${x.isNew ? '¡Se une a tu plantilla!' : x.star ? 'Sube a ' + x.star + ' estrellas' : '+' + x.coins + ' 🪙'}</div>`);
      $('excl').insertAdjacentHTML('beforeend', '<h3>Premio del equipo especial</h3>'); $('excl').appendChild(c);
    }
    $('next').onclick = openRun;
  }
  const scoreLine = s => `<div class="result">${Sprites.crest(1)}<span class="sc">${s.score.A}–${s.score.B}<small>Tu equipo · ${esc(s.teams.B.name)}</small></span>${Sprites.crest(crestOf(s.teams.B.name))}</div>`;
  function renderReward() {
    const r = api.run;
    screen(`${runHeader()}<h2>Elige una recompensa</h2><div id="rw" class="cards"></div>`, 'bg_green');
    r.rewards.forEach(o => {
      const c = document.createElement('button'); c.className = 'rcard';
      const who = o.member != null ? PLAYER(r.roster[o.member].id) : o.id != null ? PLAYER(o.id) : null;
      if (who) c.appendChild(face(Sprites.refOf(who), 64));
      let html = '';
      if (o.kind === 'tech') html = `<div class="rk">Supertécnica${o.rare ? ' <em>rara</em>' : ''}</div><div class="pname">${esc(who.name)} aprende</div>${techLine(TECH(o.tech))}${o.replace != null ? `<div class="pmeta">Sustituye a ${esc(TECH(o.replace).name)} (máx. ${TECH_SLOTS} técnicas)</div>` : ''}`;
      if (o.kind === 'evolve') html = `<div class="rk">Evolución</div><div class="pname">${esc(who.name)}</div>${techLine(TECH(o.from))}<span class="evo">↓</span>${techLine(TECH(o.to))}`;
      if (o.kind === 'recruit') html = `<div class="rk">Fichaje temporal</div><div class="pname">${esc(who.name)}</div><div class="pmeta">${ROLE_LABEL[who.role]} ${chip(who.elem)} · Tiro ${who.ie.tiro} · Rapidez ${who.ie.rapidez}</div>`;
      if (o.kind === 'passive') html = `<div class="rk">Habilidad</div><div class="pname">${esc(o.name)} para ${esc(who.name)}</div><div class="pmeta">${esc(PASSIVES[o.name].desc)}</div>`;
      if (o.kind === 'coins') html = `<div class="rk">Monedas</div><div class="pname">+${o.amount} 🪙</div>`;
      c.insertAdjacentHTML('beforeend', `<div>${html}</div>`);
      c.onclick = () => { Run.takeReward(r, o); Run.save(r); Sound.sfx('reveal'); renderMap(); };
      $('rw').appendChild(c);
    });
  }
  function renderOver() {
    const r = api.run, win = r.last && r.last.victory;
    const what = r.kind === 'infinite' ? `Has llegado a la oleada ${r.index + 1} (récord: ${Profile.data.infBest}).`
      : `Victorias: ${r.wins}${r.kind !== 'special' ? ' de ' + r.schedule.length : ''}.`;
    screen(`${runHeader()}<h2>${win ? (r.kind === 'story' ? '¡Etapa completada!' : r.kind === 'chain' ? '¡Cadena completada!' : '¡Victoria!') : 'Fin de la partida'}</h2>
      <p class="note">${what} Has ganado <b>${r.coinsEarned} monedas</b> y <b>${r.ticketsEarned} tickets</b>, que se quedan en tu perfil.<br>
      Las técnicas, habilidades y fichajes temporales se pierden.</p>
      ${win && r.kind === 'story' ? (r.stage === 's4' ? '<p class="note"><b>Desbloqueado:</b> la cadena «El lado oscuro».</p>' : r.stage === 's3' ? '<p class="note"><b>Desbloqueado:</b> la Fase 2 de la Etapa 3: el Mundial.</p>' : r.stage === 's2' ? '<p class="note"><b>Desbloqueado:</b> el equipo especial Caos y la Etapa 3.</p>' : '<p class="note"><b>Desbloqueado:</b> la Etapa 2, Cadenas, Infinito y nuevos equipos especiales.</p>') : ''}
      <button class="cta" id="toGacha">Ir al gacha</button><button class="ghost" id="toMenu">Menú</button>`, win ? (r.kind === 'story' ? 'ill25' : 'ill27') : 'ill14');
    const end = () => { Run.clear(); api.run = null; };
    $('toGacha').onclick = () => { end(); renderGacha(); };
    $('toMenu').onclick = () => { end(); renderMenu(); };
  }
  function renderQuickEnd(s, rayo) {
    const a = s.score.A, b = s.score.B;
    screen(`<img class="finimg" src="ui/fin.png" alt="Fin del partido"><h2>${a > b ? '¡Victoria!' : a < b ? 'Derrota' : 'Empate'}</h2>
      ${scoreLine(s)}
      <p class="note">El partido rápido no da monedas ni tickets, pero las victorias cuentan para el Rayo Raimon.${rayo ? '<br><b>⚡ ¡Has ganado un Rayo Raimon!</b>' : ''}</p>
      <button class="cta" id="again">Otro partido rápido</button><button class="ghost" id="toMenu">Menú</button>`, a > b ? 'ill27' : a < b ? 'ill15' : 'ill28');
    $('again').onclick = startQuick; $('toMenu').onclick = renderMenu;
  }

  /* =====================================================================
     MODO CARRERA (pantallas)
     ===================================================================== */
  const myCrestUrl = () => ClubCrest.url(Career.data.crest, Career.data.school);
  const cCrest = key => key === YOU ? `<img class="ccrest" src="${myCrestUrl()}" alt="">` : `<img class="ccrest" src="ui/crest${crestOf(key)}.png" alt="">`;
  const bar = (v, cls) => `<span class="cbar ${cls || ''}"><i style="width:${Math.max(0, Math.min(100, v))}%"></i></span>`;
  const money = n => '💰 ' + (Career.data && Career.data.devMoney && n >= 9999999 ? '∞' : n);
  const WEEK_LABEL = { C: 'Semana de Copa', P1: 'Playoff de ascenso · semifinales', P2: 'Playoff de ascenso · final' };
  function renderCareer() {
    const c = Career.data;
    if (!c) return renderCareerNew();
    if (c.over) return renderCareerOver();
    if (c.wc) return renderWC();
    const nm = Career.nextMatch(), d = Career.myDiv(), mgr = PLAYER(c.manager), wt = Career.weekType();
    const act = (k, A) => `<button class="ghost big act-${k}" data-act="${k}">${A.name}<small>${A.desc}</small></button>`;
    const kindTxt = !nm ? '' : nm.type === 'liga' ? `Jornada ${nm.j + 1}` : nm.type === 'copa' ? `Copa · ${CUP_ROUND[nm.round]}` : nm.type === 'semi' ? 'Playoff · semifinal' : 'Playoff · ¡FINAL!';
    const cupTxt = !c.cup ? 'La Copa empieza la temporada que viene' : c.cup.winner ? (c.cup.winner === YOU ? '¡Campeones de Copa!' : 'Campeón de Copa: ' + Career.teamName(c.cup.winner)) : c.cup.out ? 'Eliminados de la Copa: se juega sin ti' : 'Siguiente ronda: ' + CUP_ROUND[c.cup.round];
    const sponsor = Math.round((8 + c.fame * 0.5) * DIV_SPONSOR[d]);
    screen(`${top('Modo Carrera')}
      ${c.migrated ? '<p class="note cmsg">Tu carrera se ha adaptado a las ligas de 10 equipos: la temporada actual empieza de nuevo (conservas plantilla, fama y dinero).</p>' : ''}
      <div class="chead"><img class="ccrest big" src="${myCrestUrl()}" alt=""><span id="cMgr"></span><div><b>${esc(c.school)}</b><small>Mánager: ${esc(mgr.name)} · Temporada ${c.season}${c.goal ? ' · ★ Campeón de Primera' : ''}</small></div></div>
      <div class="cstats">
        <div><label>Fama</label>${bar(c.fame, c.fame < 15 ? 'bad' : '')}<small>${c.fame}/100${c.fame < 15 ? ' · ¡ojo!' : ''}</small></div>
        <div><label>Forma</label>${bar(c.forma, c.forma < 50 ? 'warn' : 'ok')}<small>${c.forma} %</small></div>
        <div><label>Dinero</label><b class="cmoney">${money(c.money)}</b><small>+${sponsor}/semana</small></div>
      </div>
      <p class="cweek">Semana <b>${c.week}</b>/${WEEKS} · ${DIV_NAME[d]} División · ${Career.myPos()}º · 🏆 ${esc(cupTxt)}</p>
      ${nm ? `<div class="cnext">${cCrest(nm.rival)}<div><b>${kindTxt}: ${esc(Career.teamName(nm.rival))}</b><small>${nm.home ? 'En casa' : 'Fuera'} · tu media ${Career.myRating()} · rival ${Career.rating(nm.rival)}${nm.ko ? ' · si hay empate, penaltis' : ''}</small></div></div>`
        : `<div class="cnext free"><span class="cicon">${wt === 'C' ? '🏆' : '📣'}</span><div><b>${WEEK_LABEL[wt] || 'Semana libre'}</b><small>${wt === 'C' ? esc(cupTxt) : d === 1 ? 'En Primera no hay playoff: aprovecha para entrenar.' : 'No juegas el playoff esta temporada: se juega sin ti.'}</small></div></div>`}
      <h3>Actividad de la semana <small>${nm ? 'después juegas el partido' : 'y pasa la semana'}</small></h3>
      <div class="grid2">${Object.entries(ACTIVITIES).map(([k, A]) => act(k, A)).join('')}</div>
      <div id="cTrain" hidden><p class="note">¿Qué entrenáis esta semana? (+${2 + c.fac.campo} a todo el equipo)</p><div class="opts">${STAT_KEYS.map(k => `<button data-st="${k}">${STAT_LABEL[k]}</button>`).join('')}</div></div>
      <div class="grid2 cnav"><button class="ghost" id="cSquad">👥 Plantilla</button><button class="ghost" id="cMarket">💸 Fichajes${(c.scout || []).length ? ' (' + c.scout.length + ' ojeados)' : ''}</button>
        <button class="ghost" id="cClub">🏟️ Club</button><button class="ghost" id="cTable">📊 Clasificación</button>
        <button class="ghost" id="cCal">📅 Calendario</button><button class="ghost" id="cCup">🏆 Copa</button>
        <button class="ghost" id="cHall">🏛️ Salón de la fama</button><button class="ghost" id="cSave">💾 Guardar</button></div>
      <button class="ghost" id="cQuit">Abandonar carrera</button>`, 'bg_green');
    c.migrated = false;
    $('cMgr').appendChild(face(Sprites.refOf(mgr), 40));
    const after = msg => {
      if (Career.nextMatch()) return renderCareerPre(msg);
      const wt0 = Career.weekType(), wasPO = /^P/.test(wt0);
      Career.data.lastCup = null;
      const sum = Career.advance(); UI.toast(msg, 2600);
      if (sum) renderCareerSeason(sum); else if (wasPO && Career.data.po && Career.myDiv() > 1) renderCareerPOInfo(); else if (wt0 === 'C' && Career.data.lastCup) renderCareerCupRound(Career.data.lastCup); else renderCareer();
    };
    body.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
      const k = b.dataset.act; Sound.sfx('click');
      if (k === 'entrenar') { $('cTrain').hidden = false; $('cTrain').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
      after(Career.doActivity(k));
    });
    body.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { Sound.sfx('reveal'); after(Career.doActivity('entrenar', b.dataset.st)); });
    $('cSquad').onclick = () => renderCareerSquad(renderCareer);
    $('cMarket').onclick = () => renderCareerMarket(c.scout && c.scout.length ? 'ojeados' : 'libres');
    $('cClub').onclick = () => renderCareerClub();
    $('cTable').onclick = () => renderCareerTable(d, renderCareer);
    $('cCal').onclick = renderCareerCal;
    $('cSave').onclick = () => renderSaves(renderCareer);
    $('cCup').onclick = renderCareerCup;
    $('cHall').onclick = () => renderHall(renderCareer);
    $('cQuit').onclick = () => {
      if ($('cQuit').dataset.sure) { Career.clear(); renderMenu(); return; }
      $('cQuit').dataset.sure = 1; $('cQuit').textContent = '¿Seguro? Toca otra vez para borrarla';
    };
    $('back').onclick = renderMenu;
  }
  function renderCareerCup() {
    const c = Career.data, C = c.cup;
    const rounds = C ? C.rounds.map((res, i) => `<h3>${CUP_ROUND[i]}</h3><div class="cres">${res.map(poLine).join('')}</div>`).reverse().join('') : '';
    const next = C && !C.winner ? `<h3>${CUP_ROUND[C.round]} <small>semana ${CUP_WEEKS[C.round]}</small></h3><div class="cres">${C.ties.map(([a, b]) => `<p class="${a === YOU || b === YOU ? 'you' : ''}">${esc(Career.teamName(a))} – ${esc(Career.teamName(b))}</p>`).join('')}${C.round === 0 ? `<p><small>Esperan en octavos: ${C.byes.map(k => esc(Career.teamName(k))).join(', ')}</small></p>` : ''}</div>` : '';
    screen(`${top('Copa Inazuma')}
      <p class="note">Los 30 equipos de las 3 divisiones, a partido único (con penaltis si hay empate). Ganarla da dinero, fama y <b>10 tickets</b> para el gacha.</p>
      ${!C ? '<p class="note">La Copa empieza la temporada que viene.</p>' : C.winner ? `<p class="note cmsg gold">🏆 Campeón: <b>${esc(Career.teamName(C.winner))}</b></p>` : C.out ? '<p class="note cmsg bad">Tu club está eliminado.</p>' : ''}
      ${next}${rounds}`, 'bg_green');
    $('back').onclick = renderCareer;
  }
  function renderCareerCupRound(res) {
    const c = Career.data, i = c.cup ? c.cup.rounds.length - 1 : 0;
    screen(`<h2>Copa Inazuma · ${CUP_ROUND[i]}</h2>${c.cup && c.cup.winner ? `<p class="note cmsg gold">🏆 Campeón: <b>${esc(Career.teamName(c.cup.winner))}</b></p>` : ''}
      <div class="cres">${res.map(poLine).join('')}</div>${bottom('<button class="cta" id="cNext">Continuar</button>')}`, 'bg_green');
    $('cNext').onclick = renderCareer;
  }
  function renderHall(back) {
    const list = Career.hall(), c = Career.data;
    const row = (r, now) => `<div class="cpl fac"><img class="ccrest big" src="${ClubCrest.url(r.crest || { shape: 'escudo', c1: '#1f4fc0', c2: '#e8c21a', sym: 'rayo' }, r.school)}" alt=""><div class="cplb"><b>${esc(r.school)}</b>
      <small>${now ? 'En curso' : new Date(r.date).toLocaleDateString('es-ES')} · mánager ${esc((PLAYER(r.manager) || {}).name || '?')} · ${(CAREER_DIFF[r.diff] || CAREER_DIFF.normal).name}</small>
      <span class="cst">${r.seasons} temporadas · mejor división: ${DIV_NAME[r.best]}${r.goal ? ' · ★ campeón de Primera' : ''}${r.closed ? ' · club cerrado' : ''}</span>
      <span class="cst">Títulos: ${r.titles.length ? r.titles.map(esc).join(', ') : 'ninguno'}${r.scorer ? ' · máximo goleador: ' + esc(PLAYER(r.scorer[0]).name) + ' (' + r.scorer[1] + ')' : ''}</span></div></div>`;
    const cur = c && c.history.length ? row({ school: c.school, manager: c.manager, crest: c.crest, seasons: c.history.length, titles: c.titles.map(t => t.name), best: Math.min(...c.history.map(h => h.div)), goal: c.goal, diff: c.diff,
      scorer: (m => m && m.goals ? [m.id, m.goals] : null)(c.squad.slice().sort((a, b) => b.goals - a.goals)[0]) }, true) : '';
    screen(`${top('Salón de la fama')}<p class="note">Tus carreras de mánager: las terminadas, las abandonadas y la que llevas ahora.</p>
      <div class="csquad">${cur}${list.map(r => row(r)).join('') || (cur ? '' : '<p class="note">Aún no hay ninguna carrera terminada.</p>')}</div>`, 'bg_team');
    $('back').onclick = back;
  }
  // Resultados de los playoffs en los que no jugabas
  function renderCareerPOInfo() {
    const c = Career.data;
    const rows = [2, 3].map(d => { const P = c.po[d]; const r = (P.finalRes ? [P.finalRes] : P.res) || [];
      return `<h3>Playoff · ${DIV_NAME[d]}</h3><div class="cres">${r.map(poLine).join('')}</div>`; }).join('');
    screen(`<h2>Playoffs de ascenso</h2>${rows}${bottom('<button class="cta" id="cNext">Continuar</button>')}`, 'bg_green');
    $('cNext').onclick = renderCareer;
  }
  const poLine = ([a, b, ga, gb, pens, w]) => `<p class="${a === YOU || b === YOU ? 'you' : ''}">${esc(Career.teamName(a))} <b>${ga} - ${gb}</b> ${esc(Career.teamName(b))}${pens ? ` <small>(pen. ${pens[0]}-${pens[1]})</small>` : ''} → <b>${esc(Career.teamName(w))}</b></p>`;
  function renderCareerNew() {
    let pick = MANAGERS[0];
    screen(`${top('Nueva carrera')}
      <p class="note">Eres el <b>mánager</b> de un club de instituto a punto de desaparecer. Empiezas en <b>Tercera División</b> con 7 chavales normales.<br>
      3 divisiones de 10 equipos. Los 2 primeros suben y del 3º al 6º juegan un <b>playoff</b> por la tercera plaza; los 3 últimos bajan. Ficha jugadores, mejora el club y gana la <b>Primera</b>… pero si la fama llega a 0, cierran el club.</p>
      <h3>Elige a tu mánager</h3><div class="cmgrs" id="cMgrs"></div>
      <h3>Nombre del instituto</h3><div class="giftin"><input id="cSchool" type="text" maxlength="24" value="Instituto Inazuma" autocomplete="off" spellcheck="false" style="text-transform:none"></div>
      <h3>Dificultad</h3><div class="opts" id="cDiff">${Object.entries(CAREER_DIFF).map(([k, D]) => `<button data-diff="${k}" aria-pressed="${k === 'normal'}">${D.name}</button>`).join('')}</div>
      <p class="note">La equipación y el escudo se eligen después en «Club». Ganar ligas, la Copa o ascender da tickets para el gacha.</p>
      ${Career.hall().length ? '<button class="ghost" id="cHall">🏛️ Salón de la fama</button>' : ''}
      ${bottom('<button class="cta" id="cGo">Empezar carrera</button>')}`, 'bg_title');
    let diff = 'normal';
    body.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => { diff = b.dataset.diff; body.querySelectorAll('[data-diff]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    if ($('cHall')) $('cHall').onclick = () => renderHall(renderCareerNew);
    const box = $('cMgrs');
    MANAGERS.filter(id => PLAYER(id)).forEach(id => {
      const b = document.createElement('button'); b.className = 'cmgr' + (id === pick ? ' sel' : '');
      b.appendChild(face(Sprites.refOf(PLAYER(id)), 64)); b.insertAdjacentHTML('beforeend', `<span>${esc(PLAYER(id).name)}</span>`);
      b.onclick = () => { pick = id; box.querySelectorAll('.cmgr').forEach(x => x.classList.toggle('sel', x === b)); Sound.sfx('click'); };
      box.appendChild(b);
    });
    $('cSchool').addEventListener('keydown', e => e.stopPropagation());
    $('cGo').onclick = () => { Career.create(pick, $('cSchool').value.trim() || 'Instituto Inazuma', diff); Sound.sfx('reveal'); renderCareerClub(true); };
    $('back').onclick = renderMenu;
  }
  /* ---------- Mundial de Carrera ---------- */
  const wcCrest = k => k === 'JP' ? '<img class="ccrest" src="ui/crest3016.png" alt="">' : `<img class="ccrest" src="ui/crest${crestOf(k)}.png" alt="">`;
  const wcName = k => k === 'JP' ? 'Inazuma Japón' : k;
  function renderWC(last) {
    const c = Career.data, w = c.wc;
    if (w.state === 'call') {
      const cands = Career.wcCandidates(), sel = new Set(w.pick || []);
      screen(`${top('Mundial · Convocatoria', 'cBack', 'Club')}
        <div class="chead"><img class="ccrest big" src="ui/crest3016.png" alt=""><div><b>Inazuma Japón</b><small>Mundial · temporada ${w.season} · eres el seleccionador</small></div></div>
        <p class="note">Convoca a <b>10 jugadores</b> (dos equipos de 5): los de tu club y los mejores de las ligas (los que juegan en Primera y en los equipos de arriba destacan más). Antes de cada partido eliges qué 5 juegan.</p>
        <div class="sortrow"><span id="wcN"></span><button class="ghost mini" id="wcAuto">⚡ Los 10 mejores</button></div>
        <div class="pgrid" id="wcL"></div>
        ${bottom('<button class="cta" id="wcGo" disabled>🌍 Empezar el Mundial</button>')}`, 'bg_team');
      const draw = () => {
        const L = $('wcL'); L.innerHTML = '';
        cands.forEach(x => {
          const pd = PLAYER(x.id), el = tile(x.id, `<span class="slot">${x.club === YOU ? 'Tu club' : esc(Career.teamName(x.club))} · media ${Career.wcScore(x.id)}</span>`);
          if (sel.has(x.id)) el.classList.add('sel');
          el.onclick = () => { if (sel.has(x.id)) sel.delete(x.id); else if (sel.size < 10) sel.add(x.id); else return UI.toast('Ya tienes 10: quita uno antes'); Sound.sfx('click'); w.pick = [...sel]; draw(); };
          L.appendChild(el);
        });
        $('wcN').textContent = sel.size + ' de 10 convocados'; $('wcGo').disabled = sel.size !== 10;
      };
      $('wcAuto').onclick = () => {
        const roles = FORMATIONS[c.formation].roles, pool = cands.map(x => x.id);
        sel.clear(); const ranked = pool.slice().sort((a, b) => Career.wcScore(b) - Career.wcScore(a));
        Career.wcRoles(ranked).forEach(id => sel.add(id)); Career.wcRoles(ranked.filter(id => !sel.has(id))).forEach(id => sel.add(id));
        ranked.forEach(id => { if (sel.size < 10) sel.add(id); });
        w.pick = [...sel]; Sound.sfx('reveal'); draw();
      };
      $('wcGo').onclick = () => { Career.wcStart([...sel]); Sound.sfx('reveal'); renderWC(); };
      $('cBack').onclick = () => UI.toast('Primero convoca a tu selección');
      draw(); return;
    }
    const tableHtmlWC = () => w.group ? `<table class="ctable"><tr><th></th><th></th><th>Grupo</th><th>Pts</th><th>DG</th></tr>${Career.wcTable().map((r, i) =>
      `<tr class="${r.key === 'JP' ? 'you' : ''} ${i < 2 ? 'zup' : ''}"><td>${i + 1}</td><td>${wcCrest(r.key)}</td><td class="tn">${esc(wcName(r.key))}</td><td><b>${r.pts}</b></td><td>${r.gf - r.gc > 0 ? '+' : ''}${r.gf - r.gc}</td></tr>`).join('')}</table>` : '';
    const lastHtml = last ? `<div class="cvs"><div>${wcCrest('JP')}<b>Japón</b></div><span>${last.gA} - ${last.gB}</span><div>${wcCrest(last.opp)}<b>${esc(last.opp)}</b></div></div>
      ${last.pens ? `<p class="cweek">Penaltis: <b>${last.pens[0]} - ${last.pens[1]}</b></p>` : ''}${last.msg ? `<p class="note cmsg ${w.state === 'out' ? 'bad' : 'gold'}">${esc(last.msg)}</p>` : ''}` : '';
    if (w.state === 'out' || w.state === 'champion') {
      const R = w.reward || {};
      screen(`<h2>${w.state === 'champion' ? '🏆 ¡Campeones del mundo!' : 'Fin del Mundial'}</h2>${lastHtml}
        <p class="cweek">Resultado: <b>${{ campeón: 'Campeones', final: 'Subcampeones', semi: 'Semifinalistas', grupo: 'Fase de grupos' }[w.place]}</b></p>
        <p class="note cmsg gold">Fama ${R.fame >= 0 ? '+' : ''}${R.fame} · +${R.money} 💰 para tu club · +${R.tickets} 🎟️ para el gacha</p>
        <div class="cres">${w.log.map(l => `<p>${l.r}: Japón <b>${l.gA} - ${l.gB}</b> ${esc(l.opp)}${l.pens ? ` (pen. ${l.pens[0]}-${l.pens[1]})` : ''}</p>`).join('')}</div>
        ${tableHtmlWC()}
        ${bottom('<button class="cta" id="wcEnd">Volver al club</button>')}`, w.state === 'champion' ? 'ill27' : 'bg_green');
      $('wcEnd').onclick = () => { Career.wcClose(); Sound.music('menu'); renderCareer(); };
      return;
    }
    const stage = w.state === 'group' ? `Fase de grupos · partido ${w.round + 1} de 3` : w.state === 'semi' ? 'Semifinal' : '¡FINAL!';
    screen(`${top('Mundial · ' + (w.state === 'group' ? 'Grupo' : w.state === 'semi' ? 'Semifinal' : 'Final'), 'cBack', 'Club')}
      ${lastHtml}
      <div class="cvs"><div>${wcCrest('JP')}<b>Inazuma Japón</b><small>media ${Career.wcRating('JP')}</small></div><span>VS</span><div>${wcCrest(w.opp)}<b>${esc(w.opp)}</b><small>media ${Career.wcRating(w.opp)}</small></div></div>
      <p class="cweek">${stage}${w.state !== 'group' ? ' · si hay empate, penaltis' : ''}</p>
      <div class="cres"><p>Juegan: ${w.squad.map(id => esc(PLAYER(id).name)).join(', ')}</p></div><button class="ghost" id="wcLine">👥 Alineación (10 convocados · 2 equipos)</button>
      ${tableHtmlWC()}
      ${bottom('<div class="grid2"><button class="cta" id="wcPlay">⚽ Jugar<small>tú controlas</small></button><button class="cta" id="wcSim">📋 Simular<small>como seleccionador</small></button></div>')}`, 'bg_vs');
    $('wcLine').onclick = () => renderWCLine();
    $('wcPlay').onclick = () => { api.mode = 'wc'; startMatch(Career.wcTeams(), w.state !== 'group', TEAM_FIELD[w.opp] || 'normal', w.state === 'final' ? 'match_final' : 'match_hard', w.opp); };
    $('wcSim').onclick = () => { const s = Career.wcSim(), r = Career.wcResult(s.gA, s.gB); Sound.sfx(r.gA > r.gB ? 'reveal' : 'click'); renderWC(r); };
    $('cBack').onclick = () => UI.toast('Termina el Mundial para volver al club');
  }
  function renderCareerPre(msg) {
    const c = Career.data, nm = Career.nextMatch(), d = Career.myDiv();
    const title = nm.type === 'liga' ? 'Partido de liga' : nm.type === 'copa' ? 'Copa · ' + CUP_ROUND[nm.round] : nm.type === 'semi' ? 'Playoff · semifinal' : 'Playoff · FINAL';
    screen(`${top(title, 'cBack', 'Club')}
      ${msg ? `<p class="note cmsg">${esc(msg)}</p>` : ''}
      <div class="cvs"><div>${cCrest(YOU)}<b>${esc(c.school)}</b><small>media ${Career.myRating()}</small></div><span>VS</span><div>${cCrest(nm.rival)}<b>${esc(Career.teamName(nm.rival))}</b><small>media ${Career.rating(nm.rival)}</small></div></div>
      <p class="cweek">${nm.type === 'liga' ? `Jornada ${nm.j + 1} de 9` : nm.type === 'copa' ? `Copa Inazuma · ${CUP_ROUND[nm.round]} · a partido único, con penaltis` : 'Eliminatoria: si hay empate, penaltis'} · ${DIV_NAME[d]} · ${nm.home ? 'en casa' : 'fuera'} · forma ${c.forma} %</p>
      <button class="ghost" id="cLine">👥 Alineación (${c.formation} · ${FORMATIONS[c.formation].name})</button>
      <h3>Táctica <small>cuenta sobre todo al simular</small></h3>
      <div class="opts">${Object.entries(TACTICS).map(([k, t]) => `<button data-tac="${k}" aria-pressed="${c.tactic === k}">${t.name}</button>`).join('')}</div>
      <p class="note" id="cTacD">${TACTICS[c.tactic].desc}</p>
      ${bottom('<div class="grid2"><button class="cta" id="cPlay">⚽ Jugar<small>tú controlas</small></button><button class="cta" id="cSim">📋 Simular<small>como mánager</small></button></div>')}`, 'bg_vs');
    body.querySelectorAll('[data-tac]').forEach(b => b.onclick = () => {
      c.tactic = b.dataset.tac; Career.save(); body.querySelectorAll('[data-tac]').forEach(x => x.setAttribute('aria-pressed', x === b)); $('cTacD').textContent = TACTICS[c.tactic].desc;
    });
    $('cLine').onclick = () => renderCareerSquad(() => renderCareerPre());
    $('cPlay').onclick = () => {
      if (!Career.lineupOk()) Career.autoLineup();
      api.mode = 'career';
      startMatch(Career.matchTeams(), !!nm.ko, TEAM_FIELD[nm.rival], nm.ko && (nm.type !== 'copa' || nm.round >= 3) ? 'match_final' : { 1: 'match_hard', 2: 'match_mid', 3: 'match_easy' }[d], nm.rival);
    };
    $('cSim').onclick = () => { if (!Career.lineupOk()) Career.autoLineup(); renderCareerSim(Career.simulateMine(c.tactic)); };
    $('cBack').onclick = () => UI.toast('Primero juega o simula el partido de esta semana');
  }
  function renderCareerSim(r) {
    const c = Career.data;
    screen(`<h2>Simulación</h2>
      <div class="cvs sim"><div>${cCrest(YOU)}<b>${esc(c.school)}</b></div><span id="cSc">0 - 0</span><div>${cCrest(r.rival)}<b>${esc(Career.teamName(r.rival))}</b></div></div>
      <p class="cweek" id="cMin">0'</p><div class="cfeed" id="cFeed"></div>
      ${bottom('<button class="ghost" id="cSkip">Saltar al final ▶▶</button><button class="cta" id="cDone" hidden>Continuar</button>')}`, 'bg_vs');
    let min = 0, i = 0, a = 0, b = 0, done = false;
    Sound.music('match_mid');
    const feed = $('cFeed');
    const show = e => {
      if (e.type === 'goal') { if (e.team === 'A') a++; else b++; $('cSc').textContent = a + ' - ' + b; Sound.sfx('goal'); }
      const line = e.type === 'pens' ? `🥅 <b>Penaltis: ${e.a} - ${e.b}</b> · ${e.a > e.b ? '¡pasáis!' : 'eliminados…'}`
        : e.type === 'goal' ? `⚽ <b>¡Gol${e.team === 'A' ? '' : ' rival'}!</b> ${esc(e.name)}${e.tech ? ' con <b>' + esc(e.tech) + '</b>' : ''}` : `🧤 Parada de ${esc(e.name || 'el portero')}`;
      feed.insertAdjacentHTML('afterbegin', `<p class="${e.team === 'B' ? 'rival' : 'mine'}"><i>${e.min}'</i> ${line}</p>`);
    };
    const finish = () => {
      if (done) return; done = true; clearInterval(iv);
      while (i < r.events.length) show(r.events[i++]);
      $('cMin').textContent = 'Final'; Sound.sfx('whistleEnd');
      $('cSkip').hidden = true; $('cDone').hidden = false;
    };
    const iv = setInterval(() => {
      min++; $('cMin').textContent = min + "'";
      while (i < r.events.length && r.events[i].min <= min) show(r.events[i++]);
      if (min >= 90) finish();
    }, 65);
    $('cSkip').onclick = finish;
    $('cDone').onclick = () => {
      const out = Career.finishMatch(r.gA, r.gB, r.pens, r.forma, r.events.filter(e => e.type === 'goal' && e.team === 'A').map(e => e.id));
      Sound.stop(0.3); jingleFor(out);
      renderCareerJornada(out);
    };
  }
  const careerWon = out => out.gA > out.gB || (out.gA === out.gB && out.pens && out.pens[0] > out.pens[1]);
  const jingleFor = out => Sound.jingle(careerWon(out) ? 'win' : out.gA === out.gB && !out.pens ? null : 'lose');
  function tableHtml(d, rows) {
    return `<table class="ctable"><tr><th></th><th></th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>Pts</th></tr>${rows.map((r, i) =>
      `<tr class="${r.key === YOU ? 'you' : ''} ${d > 1 && i < 2 ? 'zup' : ''} ${d > 1 && i >= 2 && i < 6 ? 'zpo' : ''} ${d < 3 && i >= rows.length - 3 ? 'zdown' : ''}"><td>${i + 1}</td><td>${cCrest(r.key)}</td><td class="tn">${esc(Career.teamName(r.key))}</td><td>${r.pj}</td><td>${r.g}</td><td>${r.e}</td><td>${r.p}</td><td>${r.gf - r.gc > 0 ? '+' : ''}${r.gf - r.gc}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table>
      <p class="note ckey">${d > 1 ? '<span class="zup">■</span> ascenso · <span class="zpo">■</span> playoff · ' : ''}${d < 3 ? '<span class="zdown">■</span> descenso' : 'Tercera: los 3 últimos pierden fama'}</p>`;
  }
  function renderCareerJornada(out) {
    const c = Career.data, d = Career.myDiv(), win = careerWon(out), draw = out.gA === out.gB && !out.pens;
    const isPO = out.type !== 'L';
    screen(`<h2>${win ? '¡Victoria!' : draw ? 'Empate' : 'Derrota'}</h2>
      <div class="cvs"><div>${cCrest(YOU)}<b>${esc(c.school)}</b></div><span>${out.gA} - ${out.gB}</span><div>${cCrest(out.rival)}<b>${esc(Career.teamName(out.rival))}</b></div></div>
      ${out.pens ? `<p class="cweek">Penaltis: <b>${out.pens[0]} - ${out.pens[1]}</b></p>` : ''}
      <p class="cweek">Fama ${out.fame >= 0 ? '+' : ''}${out.fame} · Taquilla +${out.money} 💰 · Forma ${c.forma} %</p>
      ${out.prog && out.prog.length ? `<p class="note cprog">${out.prog.map(x => `${x.d > 0 ? '📈' : '📉'} ${esc(PLAYER(x.id).name)} ${x.d > 0 ? '+1' : '−1'} ${STAT_LABEL[x.k]}`).join(' · ')}</p>` : ''}
      ${c.over ? '<p class="note cmsg bad">La fama ha llegado a 0…</p>' : ''}
      ${out.vencido ? `<div class="cnext vencido" id="cVen"><span id="cVenF"></span><div><b>¡${esc(PLAYER(out.vencido.id).name)} quiere unirse a tu club!</b><small>Jugaba en ${esc(Career.teamName(out.vencido.key))} · ${PLAYER(out.vencido.id).role} · ${rchip(PLAYER(out.vencido.id).rarity)}</small>
        <button class="cta" id="cVenOk">Fichar por ${out.vencido.price} 💰</button></div></div>` : ''}
      ${out.cupWinner ? `<p class="note cmsg gold">🏆 ${out.cupWinner === YOU ? '<b>¡Campeones de la Copa Inazuma!</b> +10 🎟️ para el gacha' : 'Campeón de Copa: ' + esc(Career.teamName(out.cupWinner))}</p>` : ''}
      ${out.type === 'C' ? `<h3>Copa Inazuma · ${CUP_ROUND[out.cupRound]}</h3><div class="cres">${(out.results.cup || []).map(poLine).join('')}</div>`
        : isPO ? `<h3>Playoff de ascenso · ${DIV_NAME[d]}</h3><div class="cres">${(out.results[d] || []).map(poLine).join('')}</div>`
        : `<h3>Resultados de la jornada · ${DIV_NAME[d]}</h3>
      <div class="cres">${out.results[d].map(([a, b, ga, gb]) => `<p class="${a === YOU || b === YOU ? 'you' : ''}">${esc(Career.teamName(a))} <b>${ga} - ${gb}</b> ${esc(Career.teamName(b))}</p>`).join('')}</div>
      <h3>Clasificación</h3>${tableHtml(d, Career.standings(d))}`}
      ${bottom('<button class="cta" id="cNext">Continuar</button>')}`, win ? 'ill27' : draw ? 'bg_green' : 'ill14');
    if (out.vencido) {
      $('cVenF').appendChild(face(Sprites.refOf(PLAYER(out.vencido.id)), 48));
      $('cVenOk').onclick = () => { const r = Career.sign(out.vencido.id, out.vencido.price, out.vencido.key); UI.toast(r.msg, 2200); if (r.ok) { Sound.sfx('reveal'); $('cVen').remove(); } };
    }
    $('cNext').onclick = () => {
      if (c.over) return renderCareerOver();
      const sum = Career.advance();
      Sound.music('menu');
      if (sum) renderCareerSeason(sum); else renderCareer();
    };
  }
  function renderCareerSeason(sum) {
    const c = Career.data, d = sum.div;
    const msg = sum.goal ? '<p class="note cmsg gold">🏆 <b>¡Campeones de Primera División!</b> Has completado la carrera. Tu club entra en el salón de la fama… y puedes seguir jugando temporadas para siempre (los rivales mejoran cada año).</p>'
      : sum.champion ? `<p class="note cmsg gold">🏆 ¡Campeones de ${DIV_NAME[d]}!</p>` : '';
    const move = sum.moves.includes('up') ? `<p class="note cmsg gold">⬆️ ¡Ascenso a ${DIV_NAME[d - 1]}!${sum.playoff ? ' (por el playoff)' : ''}</p>` : sum.moves.includes('down') ? `<p class="note cmsg bad">⬇️ Descenso a ${DIV_NAME[d + 1]}…</p>` : sum.warning ? '<p class="note cmsg bad">El director no está contento: últimos de Tercera.</p>' : '';
    const names = ids => ids.map(id => esc(PLAYER(id).name)).join(', ') || 'nadie';
    screen(`<h2>Fin de la temporada ${sum.season}</h2>
      <p class="cweek">${DIV_NAME[d]} División · puesto <b>${sum.pos}º</b> · fama ${sum.fame >= 0 ? '+' : ''}${sum.fame} · premio +${sum.money} 💰</p>
      ${msg}${move}
      ${sum.cupWinner ? `<p class="note">🏆 Copa Inazuma: ${sum.cupWinner === YOU ? '<b>¡tu club!</b>' : esc(Career.teamName(sum.cupWinner))}</p>` : ''}
      ${sum.wc ? '<p class="note cmsg gold">🌍 <b>¡Llega el Mundial!</b> Te han nombrado seleccionador de Inazuma Japón: convoca a los mejores de las ligas.</p>' : ''}
      ${sum.tickets ? `<p class="note cmsg gold">🎟️ +${sum.tickets} tickets para el gacha por tus logros de la temporada</p>` : ''}
      ${c.over ? '<p class="note cmsg bad">La fama ha llegado a 0 y el director cierra el club.</p>' : ''}
      <h3>Ascensos y descensos</h3>
      <p class="note">⬆️ A Primera: ${sum.promoted[1].map(k => esc(Career.teamName(k))).join(', ')}<br>⬆️ A Segunda: ${sum.promoted[2].map(k => esc(Career.teamName(k))).join(', ')}<br>
      ⬇️ A Segunda: ${sum.relegated[1].map(k => esc(Career.teamName(k))).join(', ')}<br>⬇️ A Tercera: ${sum.relegated[2].map(k => esc(Career.teamName(k))).join(', ')}</p>
      <h3>Tu plantilla</h3>
      <p class="note">🎓 Se gradúan (3º curso): ${names(sum.grads)}<br>🌱 Llegan de la cantera: ${names(sum.youth)}<br>El resto pasa de curso.</p>
      ${sum.goal ? hallHtml() : ''}
      ${bottom(`<button class="cta" id="cNext">${c.over ? 'Ver resumen' : sum.goal ? 'Seguir jugando (infinito)' : 'Empezar temporada ' + c.season}</button>`)}`, sum.champion || sum.moves.includes('up') ? 'ill25' : 'bg_team');
    if (sum.champion || sum.moves.includes('up')) Sound.jingle('win');
    $('cNext').onclick = () => { Sound.music('menu'); c.over ? renderCareerOver() : renderCareer(); };
  }
  function hallHtml() {
    const c = Career.data;
    return `<h3>Salón de la fama</h3><p class="note">${esc(c.school)} · mánager ${esc(PLAYER(c.manager).name)}<br>
      Temporadas: <b>${c.history.length}</b> · Títulos: <b>${c.titles.length}</b>${c.titles.length ? ' (' + c.titles.map(t => esc(t.name) + ' T' + t.season).join(', ') + ')' : ''}<br>
      Recorrido: ${c.history.map(h => 'T' + h.season + ' ' + DIV_NAME[h.div][0] + h.pos + 'º' + (h.up ? '⬆' : h.down ? '⬇' : '')).join(' · ') || '—'}</p>`;
  }
  function renderCareerOver() {
    screen(`<h2>Fin de la carrera</h2><p class="note cmsg bad">La fama del club ha llegado a 0 y el director ha cerrado el club de fútbol.</p>
      ${hallHtml()}
      ${bottom('<div class="grid2"><button class="cta" id="cNew">Nueva carrera</button><button class="ghost" id="cMenu">Menú</button></div>')}`, 'ill15');
    $('cNew').onclick = () => { Career.clear(); renderCareerNew(); };
    $('cMenu').onclick = renderMenu;
  }
  function renderCareerTable(d, back) {
    const c = Career.data;
    const po = c.po && c.po[d] ? `<h3>Playoff</h3><div class="cres">${[...(c.po[d].res || []), ...(c.po[d].finalRes ? [c.po[d].finalRes] : [])].map(poLine).join('') || '<p>Semifinales: ' + c.po[d].semis.map(([a, b]) => esc(Career.teamName(a)) + ' – ' + esc(Career.teamName(b))).join(' · ') + '</p>'}</div>` : '';
    screen(`${top('Clasificación')}
      <div class="opts">${[1, 2, 3].map(k => `<button data-dv="${k}" aria-pressed="${k === d}">${DIV_NAME[k]}</button>`).join('')}</div>
      ${tableHtml(d, Career.standings(d))}${po}`, 'bg_green');
    body.querySelectorAll('[data-dv]').forEach(b => b.onclick = () => renderCareerTable(+b.dataset.dv, back));
    $('back').onclick = back;
  }
  function renderCareerCal() {
    const c = Career.data, d = Career.myDiv();
    const rows = Array.from({ length: WEEKS }, (_, i) => {
      const w = i + 1, t = SCHED[w], j = Career.jornadaOf(w);
      if (t === 'C') {
        const r = CUP_WEEKS.indexOf(w), C = c.cup, played = C && C.rounds[r], mine = played && played.find(x => x[0] === YOU || x[1] === YOU);
        const txt = mine ? `${esc(Career.teamName(mine[0] === YOU ? mine[1] : mine[0]))} <b>${mine[0] === YOU ? mine[2] + ' - ' + mine[3] : mine[3] + ' - ' + mine[2]}</b>${mine[5] === YOU ? ' ✓' : ' ✗'}`
          : C && C.round === r && Career.cupTie() ? 'vs ' + esc(Career.teamName(Career.cupTie().find(k => k !== YOU))) : C && (C.out || C.winner) && r >= C.round ? '<small>(sin ti)</small>' : '';
        return `<p class="${w === c.week ? 'now' : ''}"><i>S${w}</i> 🏆 Copa · ${CUP_ROUND[r]} ${txt}</p>`;
      }
      if (t !== 'L') return `<p class="${w === c.week ? 'now' : ''}"><i>S${w}</i> ${t === 'P1' ? 'Playoff · semifinales' : 'Playoff · final'} <small>(3º a 6º de Segunda y Tercera)</small></p>`;
      const m = c.fix[d][j].find(p => p.includes(YOU)), rv = m[0] === YOU ? m[1] : m[0];
      const res = c.results[d][j].find(r => r[0] === YOU || r[1] === YOU);
      const sc = res ? (res[0] === YOU ? res[2] + ' - ' + res[3] : res[3] + ' - ' + res[2]) : '';
      return `<p class="${w === c.week ? 'now' : ''}"><i>S${w}</i> J${j + 1} ${m[0] === YOU ? 'vs' : 'en'} ${cCrest(rv)} ${esc(Career.teamName(rv))} ${sc ? '<b>' + sc + '</b>' : ''}</p>`;
    }).join('');
    screen(`${top('Calendario')}<p class="cweek">Temporada ${c.season} · ${DIV_NAME[d]} División</p><div class="cres ccal">${rows}</div>`, 'bg_green');
    $('back').onclick = renderCareer;
  }
  const statsLine = m => STAT_KEYS.map(k => `${STAT_LABEL[k].slice(0, 3)} <b>${Career.stat(m, k)}</b>`).join(' · ');
  function playerRow(id, extra, m) {
    const pd = PLAYER(id), el = document.createElement('div'); el.className = 'cpl';
    el.appendChild(face(Sprites.refOf(pd), 48));
    m = m || Career.member(id);
    el.insertAdjacentHTML('beforeend', `<div class="cplb"><b>${esc(pd.name)}</b> <small>${pd.role} · ${rchip(pd.rarity)} · media ${Career.ovr(m)}</small>
      <span class="cst">${statsLine(m)}</span>${extra || ''}</div>`);
    return el;
  }
  function renderCareerSquad(back, sel = 0) {
    const c = Career.data;
    if (!Career.lineupOk()) Career.autoLineup();
    const roles = FORMATIONS[c.formation].roles;
    screen(`${top('Plantilla')}
      ${formSelect(c)}
      <div class="edbar"><button class="ghost" id="cAuto">⚡ Mejor equipo</button><span class="note">Media: <b>${Career.myRating()}</b> · ${c.squad.length}/${SQUAD_MAX} jugadores</span></div>
      <div id="cPitch"></div>
      <h3>Puesto: ${ROLE_LABEL[roles[sel]]} <small>toca un jugador para ponerlo</small></h3>
      <div class="csquad" id="cList"></div>`, 'bg_green');
    $('cPitch').appendChild(pitch(roles, c.lineup.map((id, i) => { const m = Career.m(id), pd = PLAYER(id); return { ref: Sprites.refOf(pd), name: pd.name, rarity: pd.rarity, badge: Career.rate(m, roles[i]) }; }),
      sel, i => renderCareerSquad(back, i)));
    $('formSel').onchange = e => { c.formation = e.target.value; Career.autoLineup(); Career.save(); renderCareerSquad(back, 0); };
    $('cAuto').onclick = () => { Career.autoLineup(); Career.save(); Sound.sfx('reveal'); renderCareerSquad(back, sel); };
    const list = $('cList');
    c.squad.slice().sort((a, b) => Career.rate(b, roles[sel]) - Career.rate(a, roles[sel])).forEach(m => {
      const at = c.lineup.indexOf(m.id);
      const el = playerRow(m.id, `<span class="cst">${m.year}º curso${m.year >= 3 ? ' (se gradúa al acabar)' : ''}${at >= 0 ? ' · titular (' + roles[at] + ')' : ''} · nota aquí ${Career.rate(m, roles[sel])} · ${m.games} PJ · ${m.goals} goles</span>
        <span class="cst">⚡ ${Career.equipped(m).map(t => esc(TECH(t).name)).join(' · ') || 'sin técnicas'} <button class="ghost mini ctech">Técnicas</button></span>`, m);
      el.classList.add('btn'); if (at >= 0) el.classList.add('sel');
      el.querySelector('.ctech').onclick = e => { e.stopPropagation(); renderCareerTechs(m.id, () => renderCareerSquad(back, sel)); };
      el.onclick = () => {
        if (roles[sel] === 'POR' && !playsAs(PLAYER(m.id), 'POR')) return UI.toast('A portería solo pueden ir porteros');
        if (at >= 0 && roles[at] === 'POR' && !playsAs(PLAYER(c.lineup[sel]), 'POR')) return UI.toast('Así la portería se quedaría sin portero');
        if (at >= 0) c.lineup[at] = c.lineup[sel];
        c.lineup[sel] = m.id; Career.save(); Sound.sfx('click'); renderCareerSquad(back, sel);
      };
      list.appendChild(el);
    });
    $('back').onclick = back;
  }

  function renderCareerTechs(id, back) {
    const m = Career.m(id), pd = PLAYER(id), eq = Career.equipped(m), ls = Career.learnset(id);
    screen(`${top('Técnicas · ' + esc(pd.name))}
      <p class="note">Elige hasta <b>${TECH_SLOTS}</b> técnicas para los partidos. Solo puedes usar las que <b>${esc(pd.name)}</b> aprende en el juego (${ls.length}).</p>
      <div class="csquad" id="ctL"></div>`, 'bg_green');
    const L = $('ctL');
    ls.forEach(t => {
      const T = TECH(t), on = eq.includes(t), el = document.createElement('button');
      el.className = 'cpl btn' + (on ? ' sel' : '');
      el.innerHTML = `<div class="cplb"><b>${TYPE_ICON[T.type] || '★'} ${esc(T.name)}</b> <small>${TYPE_LABEL[T.type]} · potencia ${T.power} · ${chip(T.elem)}</small><span class="cst">${on ? '✅ Equipada' : m.known.includes(t) ? 'Aprendida · toca para equipar' : 'Toca para equipar'}</span></div>`;
      el.onclick = () => { Career.toggleEquip(id, t); Sound.sfx('click'); renderCareerTechs(id, back); };
      L.appendChild(el);
    });
    if (!ls.length) L.innerHTML = '<p class="note">Este jugador no aprende técnicas.</p>';
    $('back').onclick = back;
  }
  function renderWCLine(sel = 0) {
    const c = Career.data, w = c.wc, roles = FORMATIONS[c.formation].roles;
    screen(`${top('Mundial · Alineación')}
      <div class="edbar"><button class="ghost" id="wlBest">⚡ Mejores 5</button><button class="ghost" id="wl2">🔄 Equipo 2 (los otros 5)</button></div>
      <p class="note">Media: <b>${Career.wcRating('JP')}</b> · formación ${c.formation} · toca un puesto del campo y luego a un convocado.</p>
      <div id="wlPitch"></div><h3>Puesto: ${ROLE_LABEL[roles[sel]]}</h3><div class="pgrid" id="wlL"></div>`, 'bg_green');
    $('wlPitch').appendChild(pitch(roles, w.squad.map(id => ({ ref: Sprites.refOf(PLAYER(id)), name: PLAYER(id).name, rarity: PLAYER(id).rarity, badge: Career.wcScore(id) })), sel, i => renderWCLine(i)));
    (w.call || w.squad).forEach(id => {
      const at = w.squad.indexOf(id), el = tile(id, `<span class="slot">${at >= 0 ? 'Juega · ' + roles[at] : 'Banquillo'} · media ${Career.wcScore(id)}</span>`);
      if (at >= 0) el.classList.add('sel');
      el.onclick = () => { if (Career.wcSet(sel, id) === false) return UI.toast('A portería solo pueden ir porteros'); Sound.sfx('click'); renderWCLine(Math.min(4, sel + 1)); };
      $('wlL').appendChild(el);
    });
    $('wlBest').onclick = () => { if (w.call) Career.wcBest(); Sound.sfx('reveal'); renderWCLine(sel); };
    $('wl2').onclick = () => { if (w.call) Career.wcTeam2(); Sound.sfx('reveal'); renderWCLine(sel); };
    $('back').onclick = () => renderWC();
  }

  /* ---------- Fichajes ---------- */
  let mkDiv = null, mkRole = '', mkAbroad = '';
  function renderCareerMarket(tab = 'libres') {
    const c = Career.data, err = Career.canSign();
    mkDiv = mkDiv || Career.myDiv();
    const tabs = [['ojeados', `Ojeados (${(c.scout || []).length})`], ['libres', 'Libres'], ['clubes', 'Otros clubes'], ['fuera', '🌍 Fuera'], ['vender', 'Vender']];
    const roleF = `<div class="opts small">${[['', 'Todos'], ['POR', 'POR'], ['DEF', 'DEF'], ['MED', 'MED'], ['DEL', 'DEL']].map(([v, t]) => `<button data-role="${v}" aria-pressed="${mkRole === v}">${t}</button>`).join('')}</div>`;
    screen(`${top('Fichajes')}
      <p class="cweek">${money(c.money)} · plantilla ${c.squad.length}/${SQUAD_MAX}${err ? ' · <b>llena</b>' : ''}</p>
      <div class="opts">${tabs.map(([k, t]) => `<button data-tab="${k}" aria-pressed="${k === tab}">${t}</button>`).join('')}</div>
      <div id="mkHead"></div><div class="csquad" id="mkList"></div>`, 'bg_green');
    body.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => renderCareerMarket(b.dataset.tab));
    $('back').onclick = renderCareer;
    const list = $('mkList'), head = $('mkHead');
    const buyBtn = (id, price, from, label) => {
      const pd = PLAYER(id), el = playerRow(id, `<span class="cst">${from ? 'En ' + esc(Career.teamName(from)) + ' · ' : ''}${label || ''}</span><button class="cta mini">${from ? 'Negociar' : 'Fichar · ' + price + ' 💰'}</button>`);
      el.querySelector('button').onclick = () => {
        if (from) return renderNegotiation(from, id, tab);
        const r = Career.sign(id, price); UI.toast(r.msg, 2200); if (r.ok) { Sound.sfx('reveal'); renderCareerMarket(tab); }
      };
      return el;
    };
    const roleOk = id => !mkRole || PLAYER(id).role === mkRole;
    if (tab === 'ojeados') {
      head.innerHTML = '<p class="note">Joyas que han encontrado tus ojeadores: mucho más baratas que en el mercado, pero solo durante unas semanas. Usa la actividad «Ojear» para buscar más.</p>';
      if (!(c.scout || []).length) list.innerHTML = '<p class="note">Aún no hay nadie ojeado.</p>';
      (c.scout || []).forEach(s => list.appendChild(buyBtn(s.id, s.price, null, `Disponible hasta la semana ${Math.min(WEEKS, s.until)}`)));
    } else if (tab === 'libres') {
      head.innerHTML = '<p class="note">Agentes libres de esta semana (la lista cambia cada semana). Se fichan al momento, sin negociar.</p>' + roleF;
      Career.marketList().libres.filter(roleOk).forEach(id => list.appendChild(buyBtn(id, Math.round(Career.value(id) * 0.8 / 5) * 5)));
    } else if (tab === 'clubes') {
      head.innerHTML = `<p class="note">Haz una oferta a otro club. Sus estrellas cuestan más, y a los clubes de divisiones superiores no les gusta vender a uno de abajo. Si te pasas de tacaño, cortan la negociación hasta la semana siguiente.</p>
        <div class="opts">${[1, 2, 3].map(k => `<button data-mdv="${k}" aria-pressed="${k === mkDiv}">${DIV_NAME[k]}</button>`).join('')}</div>${roleF}`;
      Career.clubPlayers(mkDiv).filter(x => roleOk(x.id)).sort((a, b) => Career.value(b.id, b.key) - Career.value(a.id, a.key))
        .forEach(x => list.appendChild(buyBtn(x.id, 0, x.key, 'valor aprox. ' + Career.value(x.id, x.key) + ' 💰' + (x.star ? ' · ⭐ su estrella: pedirán más' : ''))));
    } else if (tab === 'fuera') {
      const countries = [...new Set(GAME.players.filter(p => p.abroad).map(p => p.abroad))].sort();
      mkAbroad = countries.includes(mkAbroad) ? mkAbroad : '';
      head.innerHTML = `<p class="note">Jugadores <b>fuera del país</b>: las selecciones del mundo del Inazuma 3. Se fichan al momento, pero el traspaso internacional cuesta un 30 % más.</p>
        <div class="pfsel" style="grid-template-columns:1fr"><select id="mkCountry"><option value="">Todos los países</option>${countries.map(k => `<option value="${esc(k)}" ${k === mkAbroad ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></div>${roleF}`;
      $('mkCountry').onchange = e => { mkAbroad = e.target.value; renderCareerMarket(tab); };
      const ids = Career.abroadList(mkAbroad).filter(p => roleOk(p.id)).sort((a, b) => Career.value(b.id) - Career.value(a.id));
      if (!ids.length) list.innerHTML = '<p class="note">No queda nadie disponible con ese filtro.</p>';
      ids.slice(0, 60).forEach(p => list.appendChild(buyBtn(p.id, Career.abroadPrice(p.id), null, '🌍 Fuera del país · ' + esc(p.abroad))));
    } else {
      head.innerHTML = `<p class="note">Vender: un club paga el 70 % de su valor. Liberar: se va gratis (para hacer hueco). Mínimo ${SQUAD_MIN} jugadores.</p>`;
      c.squad.forEach(m => {
        const el = playerRow(m.id, `<span class="cst">${m.year}º curso · valor ${Career.value(m.id)} 💰</span><span class="row2"><button class="ghost mini" data-sell>Vender · ${Math.round(Career.value(m.id) * 0.7 / 5) * 5} 💰</button><button class="ghost mini" data-rel>Liberar</button></span>`, m);
        el.querySelector('[data-sell]').onclick = () => { const r = Career.sell(m.id); UI.toast(r.msg, 2200); if (r.ok) renderCareerMarket(tab); };
        el.querySelector('[data-rel]').onclick = e => {
          if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = '¿Seguro?'; return; }
          const r = Career.release(m.id); UI.toast(r.msg, 2000); if (r.ok) renderCareerMarket(tab);
        };
        list.appendChild(el);
      });
    }
    body.querySelectorAll('[data-mdv]').forEach(b => b.onclick = () => { mkDiv = +b.dataset.mdv; renderCareerMarket(tab); });
    body.querySelectorAll('[data-role]').forEach(b => b.onclick = () => { mkRole = b.dataset.role; renderCareerMarket(tab); });
  }
  function renderNegotiation(key, id, tab) {
    const c = Career.data, pd = PLAYER(id), val = Career.value(id, key);
    let amount = Math.round(val * 0.85 / 5) * 5, counter = null;
    screen(`${top('Negociación', 'nBack', 'Fichajes')}
      <div class="cvs"><div>${cCrest(YOU)}<b>${esc(c.school)}</b><small>${money(c.money)}</small></div><span>⇄</span><div>${cCrest(key)}<b>${esc(Career.teamName(key))}</b><small>${DIV_NAME[Career.divOf(key)]}</small></div></div>
      <div id="nPl"></div>
      <p class="cweek">Valor de mercado aproximado: <b>${val} 💰</b></p>
      <div class="negbox"><button class="ghost" data-d="-0.1">−10 %</button><b id="nAmt">${amount} 💰</b><button class="ghost" data-d="0.1">+10 %</button></div>
      <p class="note cmsg" id="nMsg">Haz tu oferta.</p>
      ${bottom('<div class="grid2"><button class="cta" id="nOffer">Ofertar</button><button class="cta" id="nCounter" hidden>Aceptar</button></div>')}`, 'bg_vs');
    $('nPl').appendChild(playerRow(id));
    const upd = () => { $('nAmt').textContent = amount + ' 💰'; };
    body.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { amount = Math.max(5, Math.round(amount * (1 + +b.dataset.d) / 5) * 5); upd(); });
    const done = price => {
      const r = Career.sign(id, price, key); UI.toast(r.msg, 2400);
      if (r.ok) { Sound.sfx('reveal'); renderCareerMarket(tab); } else $('nMsg').textContent = r.msg;
    };
    $('nOffer').onclick = () => {
      if (amount > c.money) { $('nMsg').textContent = 'No tienes tanto dinero.'; return; }
      const r = Career.offer(key, id, amount);
      if (r.res === 'accept') return done(amount);
      $('nMsg').textContent = r.msg;
      if (r.res === 'counter') { counter = r.price; $('nCounter').hidden = false; $('nCounter').textContent = 'Aceptar ' + counter + ' 💰'; }
      if (r.res === 'closed' || (r.res === 'reject' && /cierra/.test(r.msg))) { $('nOffer').disabled = true; $('nCounter').hidden = true; }
    };
    $('nCounter').onclick = () => { if (counter > c.money) { $('nMsg').textContent = 'No tienes tanto dinero.'; return; } const r = Career.offer(key, id, counter); if (r.res === 'accept') done(counter); else $('nMsg').textContent = r.msg; };
    $('nBack').onclick = () => renderCareerMarket(tab);
  }

  /* ---------- Club: mejoras, equipación y escudo ---------- */
  function renderCareerClub(first) {
    const c = Career.data;
    const sw = (k, v) => `<div class="swatches">${KIT_COLORS.map(col => `<button class="sw" data-k="${k}" data-c="${col}" style="background:${col}" aria-pressed="${v === col}"></button>`).join('')}</div>`;
    screen(`${top(first ? 'Tu club' : 'Club', 'back', first ? 'Listo' : 'Volver')}
      <div class="clubpv"><img class="ccrest huge" id="crPv" src="${myCrestUrl()}" alt=""><span id="kitPv"></span><div><b>${esc(c.school)}</b><small>${money(c.money)}</small></div></div>
      <h3>Equipación</h3><p class="note">Camiseta</p>${sw('a', c.kit.a)}<p class="note">Mangas y pantalón</p>${sw('b', c.kit.b)}
      <h3>Escudo</h3>
      <div class="opts">${CREST_SHAPES.map(s => `<button data-shape="${s}" aria-pressed="${c.crest.shape === s}">${s[0].toUpperCase() + s.slice(1)}</button>`).join('')}</div>
      <p class="note">Color de fondo</p>${sw('c1', c.crest.c1)}<p class="note">Color del borde y símbolo</p>${sw('c2', c.crest.c2)}
      <div class="opts syms">${[['iniciales', 'Iniciales'], ...Object.entries(CREST_SYMBOLS)].map(([k, s]) => `<button data-sym="${k}" aria-pressed="${c.crest.sym === k}">${s}</button>`).join('')}</div>
      ${first ? '' : `<h3>Mejoras del club</h3><div class="csquad">${Object.entries(FACILITIES).map(([k, F]) => { const lv = c.fac[k], cost = F.cost[lv];
        return `<div class="cpl fac"><div class="cplb"><b>${F.name}</b> <small>nivel ${lv}/${F.cost.length}</small><span class="cst">${F.desc}</span></div>${cost != null ? `<button class="cta mini" data-up="${k}" ${c.money < cost ? 'disabled' : ''}>Mejorar · ${cost} 💰</button>` : '<span class="cst">Máximo</span>'}</div>`; }).join('')}</div>`}
      ${first ? bottom('<button class="cta" id="cDone">¡A jugar!</button>') : ''}`, 'bg_green');
    const ref = Sprites.refOf(PLAYER(c.lineup && c.lineup[2] || c.squad[0].id));
    const drawPv = () => { const k = $('kitPv'); k.innerHTML = ''; k.appendChild(Sprites.kitPreview(ref, c.kit, 2)); $('crPv').src = myCrestUrl(); };
    drawPv();
    body.querySelectorAll('.sw').forEach(b => b.onclick = () => {
      const k = b.dataset.k; if (k === 'a' || k === 'b') c.kit[k] = b.dataset.c; else c.crest[k] = b.dataset.c;
      Career.save(); b.parentNode.querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv();
    });
    body.querySelectorAll('[data-shape]').forEach(b => b.onclick = () => { c.crest.shape = b.dataset.shape; Career.save(); body.querySelectorAll('[data-shape]').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv(); });
    body.querySelectorAll('[data-sym]').forEach(b => b.onclick = () => { c.crest.sym = b.dataset.sym; Career.save(); body.querySelectorAll('[data-sym]').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv(); });
    body.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const r = Career.upgrade(b.dataset.up); UI.toast(r.msg, 2000); if (r.ok) { Sound.sfx('reveal'); renderCareerClub(); } });
    $('back').onclick = renderCareer;
    if ($('cDone')) $('cDone').onclick = renderCareer;
  }

  /* ---------- Guardar y cargar partidas ---------- */
  const SAVE_KEYS = ['inazuma-perfil', 'inazuma-carrera', 'inazuma-ajustes', 'inazuma-run3', 'inazuma-sonido'];
  const snapshot = () => { const o = {}; SAVE_KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v != null) o[k] = v; } catch (_) {} }); return o; };
  const restore = o => { SAVE_KEYS.forEach(k => { try { if (o[k] != null) localStorage.setItem(k, o[k]); else localStorage.removeItem(k); } catch (_) {} }); };
  const slotKey = i => 'inazuma-slot-' + i;
  async function packCode(obj) {
    const json = JSON.stringify(obj);
    try {
      const cs = new CompressionStream('gzip'), w = new Blob([json]).stream().pipeThrough(cs);
      const buf = new Uint8Array(await new Response(w).arrayBuffer());
      let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
      return 'IRZ1:' + btoa(s);
    } catch (_) { return 'IRJ1:' + btoa(unescape(encodeURIComponent(json))); }
  }
  async function unpackCode(code) {
    code = code.trim().replace(/\s+/g, '');
    if (code.startsWith('IRJ1:')) return JSON.parse(decodeURIComponent(escape(atob(code.slice(5)))));
    if (!code.startsWith('IRZ1:')) throw new Error('formato');
    const bin = atob(code.slice(5)), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const ds = new DecompressionStream('gzip'), r = new Blob([buf]).stream().pipeThrough(ds);
    return JSON.parse(await new Response(r).text());
  }
  const describe = o => { try { const p = JSON.parse(o['inazuma-perfil'] || '{}'), cr = o['inazuma-carrera'] ? JSON.parse(o['inazuma-carrera']) : null;
    return `${Object.keys(p.coll || {}).length} jugadores · ${p.tickets || 0} 🎟️${cr ? ' · Carrera: ' + esc(cr.school) + ' T' + cr.season : ''}`; } catch (_) { return ''; } };
  function renderSaves(back = renderMenu) {
    const slots = [1, 2, 3].map(i => { try { return JSON.parse(localStorage.getItem(slotKey(i)) || 'null'); } catch (_) { return null; } });
    screen(`${top('Guardar partida')}
      <p class="note">El juego se guarda solo en este navegador. Aquí puedes guardar copias en <b>3 ranuras</b> o sacar un <b>código de partida</b> para llevarla a otro móvil u ordenador.</p>
      <div class="csquad">${slots.map((s, i) => `<div class="cpl fac"><div class="cplb"><b>Ranura ${i + 1}</b><span class="cst">${s ? new Date(s.date).toLocaleString('es-ES') + ' · ' + describe(s.data) : 'Vacía'}</span></div>
        <span class="row2"><button class="cta mini" data-save="${i + 1}">Guardar</button>${s ? `<button class="ghost mini" data-load="${i + 1}">Cargar</button>` : ''}</span></div>`).join('')}</div>
      <h3>Código de partida</h3>
      <button class="ghost" id="sExport">📤 Sacar código de mi partida</button>
      <textarea id="sCode" rows="4" placeholder="Pega aquí un código de partida para cargarlo" spellcheck="false"></textarea>
      <div class="grid2"><button class="ghost" id="sCopy">Copiar</button><button class="cta" id="sImport">📥 Cargar este código</button></div>
      <p class="note" id="sMsg"></p>`, 'bg_green');
    const msg = t => { $('sMsg').textContent = t; };
    const ta = $('sCode'); ta.addEventListener('keydown', e => e.stopPropagation());
    body.querySelectorAll('[data-save]').forEach(b => b.onclick = () => {
      if (Career.data) Career.save(); Profile.save(); saveSettings();
      try { localStorage.setItem(slotKey(b.dataset.save), JSON.stringify({ date: Date.now(), data: snapshot() })); UI.toast('Partida guardada en la ranura ' + b.dataset.save); Sound.sfx('reveal'); renderSaves(back); }
      catch (_) { msg('No se ha podido guardar (el navegador no deja más espacio).'); }
    });
    body.querySelectorAll('[data-load]').forEach(b => b.onclick = () => {
      if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = '¿Seguro?'; msg('Cargar sustituye tu partida actual. Toca otra vez para confirmar.'); return; }
      const s = slots[+b.dataset.load - 1]; restore(s.data); msg('Cargando…'); setTimeout(() => location.reload(), 300);
    });
    $('sExport').onclick = async () => { ta.value = await packCode(snapshot()); ta.select(); msg('Código creado: cópialo y guárdalo (por ejemplo en tus notas). Para cargarlo, pégalo aquí en el otro dispositivo.'); };
    $('sCopy').onclick = async () => { ta.select(); try { await navigator.clipboard.writeText(ta.value); msg('Copiado.'); } catch (_) { try { document.execCommand('copy'); msg('Copiado.'); } catch (__) { msg('Selecciónalo y cópialo a mano.'); } } };
    $('sImport').onclick = async () => {
      if (!ta.value.trim()) return msg('Pega primero un código.');
      try { const o = await unpackCode(ta.value); if (!o['inazuma-perfil'] && !o['inazuma-carrera']) throw new Error('vacío'); restore(o); msg('¡Partida cargada! Reiniciando…'); setTimeout(() => location.reload(), 400); }
      catch (_) { msg('Ese código no es válido.'); }
    };
    $('back').onclick = back;
  }

  /* ---------- Códigos de regalo ---------- */
  function renderGift() {
    const P = Profile.data, used = Object.entries(P.codes || {}).sort((x, y) => y[1] - x[1]);
    screen(`${top('Código de regalo')}${wallet()}
      <p class="note">Escribe un código para recibir su premio. Cada código se puede canjear una vez.</p>
      <div class="giftin"><input id="gcode" type="text" maxlength="32" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="CÓDIGO"><button class="cta" id="gok">Canjear</button></div>
      <p class="giftmsg" id="gmsg"></p>
      ${used.length ? `<h3>Canjeados</h3><p class="note">${used.map(([k, t]) => `<b>${esc(k)}</b> · ${new Date(t).toLocaleDateString('es-ES')}`).join('<br>')}</p>` : ''}`, 'bg_green');
    const inp = $('gcode');
    const go = () => {
      const r = Profile.redeem(inp.value), m = $('gmsg');
      m.textContent = r.msg; m.className = 'giftmsg ' + (r.ok ? 'ok' : 'bad');
      if (r.ok) { Sound.sfx('reveal'); UI.toast(r.msg, 2200); setTimeout(renderGift, 1400); } else Sound.sfx('click');
    };
    $('gok').onclick = go;
    inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') go(); if (e.key === 'Escape') renderMenu(); });
    $('back').onclick = renderMenu;
    if (Controls.pc()) inp.focus();
  }

  /* ---------- Sonido ---------- */
  function renderSettings() {
    const c = Sound.cfg;
    const keys = Object.keys(TRACKS);
    const ROLE_NAMES = { menu: 'Menús', intro: 'Intro', match: 'Partido rápido', match_easy: 'Etapa 1 · inicio', match_mid: 'Etapa 1 · mitad', match_hard: 'Etapa 1 · recta final',
      match_final: 'Etapa 1 · final y jefes', s2_easy: 'Etapa 2 · inicio', s2_mid: 'Etapa 2 · mitad', s2_hard: 'Etapa 2 · recta final', s2_final: 'Etapa 2 · final y jefes',
      match_special: 'Equipos especiales', goal: 'Gol', win: 'Victoria', lose: 'Derrota' };
    // Desplegable con las pistas agrupadas como en el juego
    const grouped = jingles => TRACK_GROUPS.filter(g => (g === 'Jingles') === jingles).map(g => `<optgroup label="${g}">${keys.filter(k => TRACKS[k].group === g)
      .map(k => `<option value="${k}">${TRACKS[k].name}</option>`).join('')}</optgroup>`).join('');
    const sel = (role, jingles, extra = []) => `<div class="group"><label>${ROLE_NAMES[role]}</label>
      <select data-role="${role}">${extra.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}${grouped(jingles)}</select></div>`;
    const rnd = [['random', 'Aleatorio (temas de partido)']], none = [['', 'Ninguno']];
    screen(`${top('Ajustes')}
      <h3>Partido</h3>
      ${opts('Duración del partido', 'minutes', [[2, '2 min'], [3, '3 min'], [5, '5 min']])}
      ${opts('Supertécnicas', 'techMode', [['boton', 'Con botón'], ['auto', 'Automáticas']])}
      ${opts('Cámara lenta en supertécnicas', 'slowmo', [[1, 'Sí'], [0, 'No']])}
      ${opts('Cambio automático de jugador', 'autoSwitch', [[1, 'Sí'], [0, 'No']])}
      <h3>Controles</h3>
      ${opts('Botones en pantalla', 'controls', [['auto', 'Auto'], ['tactil', 'Siempre'], ['teclado', 'Nunca (PC)']])}
      <p class="keys"><b>Móvil:</b> joystick a la izquierda (a tope = esprint). Mantén Pase para un pase fuerte y usa Regate para un recorte rápido sin técnica. Para cambiar de jugador apunta con el joystick y pulsa Cambiar (también cambia solo al ir a por el balón).<br>
      <b>PC:</b> WASD/flechas · Shift esprint · J pase (mantén = pase fuerte) o entrada · K profundidad · I regate · L tiro (mantener) · Espacio técnica · Q cambiar · P pausa</p>
      <h3>Sonido</h3>
      <div class="grid2"><button class="ghost" id="sm" aria-pressed="${c.music}">Música: ${c.music ? 'sí' : 'no'}</button><button class="ghost" id="se" aria-pressed="${c.sfx}">Efectos: ${c.sfx ? 'sí' : 'no'}</button></div>
      <p class="note">La música sale de tus archivos del Inazuma 1 y 2, reconstruida desde las partituras del juego. Los nombres son los de la colección de música del Inazuma 2.</p>
      ${opts('Intro al abrir el juego', 'intro', [[1, 'Sí'], [0, 'No']])}
      <button class="ghost" id="seeIntro">▶ Ver la intro</button>
      <div class="group"><label>Rivales con tema propio</label><div class="opts"><button id="tt1" aria-pressed="${c.teamThemes !== false}">Su música</button><button id="tt0" aria-pressed="${c.teamThemes === false}">La de la etapa</button></div></div>
      <details class="roles"><summary>Elegir música de cada momento</summary>
      ${sel('menu', false)}${sel('intro', false)}${sel('match', false, rnd)}${['match_easy', 'match_mid', 'match_hard', 'match_final', 's2_easy', 's2_mid', 's2_hard', 's2_final', 'match_special'].map(r => sel(r, false, rnd)).join('')}
      ${sel('goal', true, none)}${sel('win', true, none)}${sel('lose', true, none)}
      <button class="ghost" id="resetRoles">Volver a la música de serie</button></details>
      <h3>Escuchar <small>toca para oír cada pista</small></h3>
      ${TRACK_GROUPS.map(g => `<details class="tgroup"><summary>${g} <small>${keys.filter(k => TRACKS[k].group === g).length}</small></summary><div class="tracks">${keys.filter(k => TRACKS[k].group === g).map(k => `<button class="ghost" data-play="${k}">▶ ${TRACKS[k].name}</button>`).join('')}</div></details>`).join('')}
      <button class="ghost" id="stopAll">Parar</button>
      ${settings.dev ? '<button class="ghost" id="toDev">🛠 Modo desarrollador</button>' : ''}
      <p class="note">Inazuma Rogue v${VERSION} · fan game gratuito y no oficial. Inazuma Eleven es de Level-5.</p>`);
    bindOpts(settings, k => { saveSettings(); if (k === 'controls') Controls.apply(); });
    if ($('toDev')) $('toDev').onclick = () => { Sound.stop(0.2); renderDev(); };
    $('sm').onclick = () => { Sound.setMusic(!c.music); renderSettings(); };
    $('se').onclick = () => { Sound.setSfx(!c.sfx); renderSettings(); };
    body.querySelectorAll('select[data-role]').forEach(s => { s.value = c.roles[s.dataset.role] ?? ''; s.onchange = () => Sound.setRole(s.dataset.role, s.value); });
    $('seeIntro').onclick = () => { Sound.stop(0.2); playIntro(renderSettings); };
    $('tt1').onclick = () => { Sound.setTeamThemes(true); renderSettings(); };
    $('tt0').onclick = () => { Sound.setTeamThemes(false); renderSettings(); };
    $('resetRoles').onclick = () => { Object.entries(Sound.DEF_ROLES).forEach(([r, k]) => Sound.setRole(r, k)); renderSettings(); UI.toast('Música de serie'); };
    body.querySelectorAll('[data-play]').forEach(b => b.onclick = () => Sound.preview(b.dataset.play));
    $('stopAll').onclick = () => Sound.stop(0.2);
    $('back').onclick = () => { Sound.stop(0.2); renderMenu(); };
  }

  /* ---------- Modo desarrollador (20 toques en la versión) ---------- */
  function renderDevClub() {
    const c = Career.data;
    screen(`${top('Elegir club')}<p class="note">Ocupas el sitio del club que elijas: su división, su nombre y sus jugadores. Ellos se quedan con tu plantilla. La temporada empieza de nuevo.</p>
      ${[1, 2, 3].map(d => `<h3>${DIV_NAME[d]}</h3><div class="modes">${c.divs[d].filter(k => k !== YOU).map(k => `<button class="mode" data-club="${esc(k)}">${Sprites.crest(crestOf(k))}<span class="mt"><b>${esc(Career.teamName(k))}</b><small>media ${Career.rating(k)}</small></span></button>`).join('')}</div>`).join('')}`);
    body.querySelectorAll('[data-club]').forEach(b => b.onclick = () => { Career.devTakeClub(b.dataset.club); Sound.sfx('reveal'); UI.toast('Ahora eres ' + Career.data.school, 1800); renderCareer(); });
    $('back').onclick = renderDev;
  }
  function renderDevSign() {
    screen(`${top('Fichar gratis')}<p class="note">Busca cualquier jugador del gacha y tócalo para meterlo en tu plantilla de Carrera (sin límite).</p>
      <div class="pfbar"><div class="pfq"><input id="dsQ" type="search" placeholder="Buscar por nombre o mote…" autocomplete="off"></div></div><div class="pgrid" id="dsL"></div>`);
    const draw = () => {
      const q = norm($('dsQ').value.trim()), L = $('dsL'); L.innerHTML = '';
      if (q.length < 2) { L.innerHTML = '<p class="note">Escribe al menos 2 letras.</p>'; return; }
      GAME.players.filter(p => p.cs && p.gacha !== false && (norm(p.name).includes(q) || norm(p.full).includes(q))).slice(0, 40).forEach(p => {
        const inSq = !!Career.m(p.id), el = tile(p.id, `<span class="slot">${inSq ? 'Ya está en tu club' : 'Fichar gratis'}</span>`);
        if (inSq) el.classList.add('sel');
        el.onclick = () => { if (Career.devSign(p.id)) { Sound.sfx('reveal'); UI.toast(p.name + ' se une a ' + Career.data.school, 1400); draw(); } };
        L.appendChild(el);
      });
    };
    $('dsQ').oninput = draw; draw();
    $('back').onclick = renderDev;
  }
  function renderDev() {
    const P = Profile.data;
    const b = (id, t, sub = '') => `<button class="ghost big" id="${id}">${t}<small>${sub}</small></button>`;
    screen(`${top('Desarrollador')}
      <p class="note">v${VERSION} · ${GAME.players.filter(p => p.gacha !== false).length} jugadores en el gacha · ${Object.keys(GAME.techniques).length} técnicas (${LEG_TECHS.length} legendarias) · ${GAME.teams.length} equipos rivales</p>
      ${wallet()}
      <h3>Recursos</h3>
      <div class="grid2">${b('dTick', '+1000 tickets')}${b('dCoin', '+100.000 monedas')}${b('dRayo', '+10 Rayos')}${b('dPity', 'Épica asegurada', 'la próxima tirada')}</div>
      <h3>Colección</h3>
      <div class="grid2">${b('dAll', 'Todos los jugadores')}${b('dStars', 'Todos a 5 ★')}${b('dTechs', 'Todas las técnicas', 'legendarias')}${b('dTrain', 'Entrenar al máximo')}</div>
      <h3>Progreso</h3>
      <div class="grid2">${b('dStory', 'Completar todas las etapas', '1, 2 y 3 · abre todo')}${b('dChains', 'Completar las cadenas', '×5 con medalla de oro')}${b('dRun', 'Borrar partida', 'en curso')}${b('dReset', 'Borrar perfil', 'empezar de cero')}</div>
      <h3>Carrera</h3>
      ${Career.data ? `<p class="note">${esc(Career.data.school)} · temporada ${Career.data.season} · ${DIV_NAME[Career.myDiv()]} · ${money(Career.data.money)}</p>
      <div class="grid2">${b('dMoney', Career.data.devMoney ? '💰 Dinero infinito: SÍ' : '💰 Dinero infinito: NO', 'toca para cambiar')}${b('dClub', 'Elegir club', 'ocupas su sitio y sus jugadores')}
        ${b('dSign', 'Fichar gratis', 'cualquier jugador')}${b('dFame', 'Fama y forma al 100')}
        ${b('dWC', '🌍 Empezar el Mundial', 'ahora mismo')}${b('dSeason', 'Terminar temporada', 'simula lo que queda')}
        ${b('dDiv1', 'Subir a Primera', 'la temporada empieza de nuevo')}${b('dDiv3', 'Bajar a Tercera', 'la temporada empieza de nuevo')}</div>`
        : `<p class="note">No hay ninguna carrera empezada.</p><div class="grid2">${b('dNewCar', 'Crear carrera rápida', 'normal, con Nelly')}</div>`}
      <h3>Modo</h3>
      <div class="grid2">${b('dOff', 'Salir del modo', 'desarrollador')}</div>
      <h3>Partido</h3>
      ${opts('Velocidad del juego', 'speed', [[0.5, '50 %'], [0.75, '75 % (normal)'], [1, '100 %']])}
      ${opts('Datos en pantalla (FPS, recargas…)', 'debug', [[1, 'Sí'], [0, 'No']])}
      ${opts('Botón «Ganar ahora» en la pausa', 'devWin', [[1, 'Sí'], [0, 'No']])}
      <h3>Gacha</h3>
      <div class="grid2">${b('dLeg', 'Legendario asegurado', (P.devLeg ? P.devLeg + ' pendientes · ' : '') + 'las próximas 10 tiradas')}</div>
      <button class="ghost" id="dSim">Simular 1000 tiradas en cada gacha <small>(no gasta nada)</small></button>
      <div id="simOut" class="note"></div>`);
    if (settings.speed == null) settings.speed = 0.75;
    bindOpts(settings, saveSettings);
    const done = msg => { Profile.save(); Sound.sfx('reveal'); UI.toast(msg, 1400); renderDev(); };
    $('dTick').onclick = () => { P.tickets += 1000; done('+1000 tickets'); };
    $('dCoin').onclick = () => { P.coins += 100000; done('+100.000 monedas'); };
    $('dRayo').onclick = () => { P.rayos += 10; done('+10 Rayos Raimon'); };
    $('dPity').onclick = () => { P.pity = 9; done('La próxima tirada será épica o mejor'); };
    $('dAll').onclick = () => { GAME.players.forEach(p => { if (p.gacha !== false && !P.coll[p.id]) P.coll[p.id] = { stars: 1, up: {} }; }); done('Colección completa'); };
    $('dStars').onclick = () => { Object.values(P.coll).forEach(o => { o.stars = MAX_STARS; }); done('Todos con 5 estrellas'); };
    $('dTechs').onclick = () => { LEG_TECHS.forEach(t => { P.techs[t] = 1; }); done('Todas las técnicas legendarias'); };
    $('dTrain').onclick = () => { Object.values(P.coll).forEach(o => STAT_KEYS.forEach(k => { o.up[k] = 40; })); done('Entrenamiento al máximo'); };
    $('dStory').onclick = () => { ['s1', 's2', 's3', 's4'].forEach(k => { P.story[k] = P.story[k] || {}; P.story[k].done = true; P.story[k].best = Math.max(P.story[k].best || 0, 9); }); done('Etapas 1, 2 y 3 completadas'); };
    $('dChains').onclick = () => { CHAINS.forEach(ch => { P.chains[ch.key] = Math.max(P.chains[ch.key] || 0, 5); }); done('Cadenas completadas con oro'); };
    $('dLeg').onclick = () => { P.devLeg = (P.devLeg || 0) + 10; done('Las próximas 10 tiradas serán legendarias'); };
    const cdone = msg => { Career.save(); done(msg); };
    if (Career.data) {
      const C = Career.data;
      $('dMoney').onclick = () => { C.devMoney = !C.devMoney; if (!C.devMoney) C.money = Math.min(C.money, 5000); cdone(C.devMoney ? 'Dinero infinito activado' : 'Dinero infinito desactivado'); };
      $('dFame').onclick = () => { C.fame = 100; C.forma = 100; cdone('Fama y forma al 100'); };
      $('dWC').onclick = () => { C.wc = Career.wcCreate(C.season); Career.save(); Sound.sfx('reveal'); renderCareer(); };
      $('dSeason').onclick = () => { const sum = Career.devEndSeason(); Sound.music('menu'); if (sum) renderCareerSeason(sum); else renderCareer(); };
      $('dDiv1').onclick = () => { Career.devToDiv(1); cdone('Ahora estás en Primera'); };
      $('dDiv3').onclick = () => { Career.devToDiv(3); cdone('Ahora estás en Tercera'); };
      $('dClub').onclick = () => renderDevClub();
      $('dSign').onclick = () => renderDevSign();
    } else $('dNewCar').onclick = () => { Career.create(13, 'Instituto Inazuma'); done('Carrera creada'); };
    $('dRun').onclick = () => { Run.clear(); api.run = null; done('Partida en curso borrada'); };
    let resetArm = false;
    $('dReset').onclick = () => {
      if (!resetArm) { resetArm = true; $('dReset').firstChild.textContent = '¿Seguro? Toca otra vez'; return; }
      try { localStorage.removeItem('inazuma-perfil'); } catch (_) {}
      Run.clear(); api.run = null; api.myTeam = null; Profile.load(); UI.toast('Perfil borrado', 1400); renderMenu();
    };
    $('dOff').onclick = () => { settings.dev = false; settings.debug = 0; saveSettings(); renderMenu(); };
    $('dSim').onclick = () => {
      const rows = BANNERS.map(B => {
        const c = { comun: 0, rara: 0, epica: 0, legendaria: 0, tec: 0 }; let pity = 0;
        for (let i = 0; i < 1000; i++) {
          const t = Gacha.rollTier(pity >= 9); if (t === 'epica' || t === 'legendaria') pity = 0; else pity++;
          if (t === 'legendaria' && Math.random() < 0.5) c.tec++; else c[t]++;
        }
        return `<b>${esc(B.name)}</b>: ${c.comun} comunes · ${c.rara} raras · ${c.epica} épicas · ${c.legendaria} legendarios · ${c.tec} técnicas`;
      });
      $('simOut').innerHTML = rows.join('<br>');
    };
    $('back').onclick = renderMenu;
  }

  $('pauseBtn').addEventListener('click', () => api.togglePause());
  /* ---------- Intro: imágenes del juego con la música del opening; se puede saltar ---------- */
  function playIntro(done) {
    const el = $('intro'), stage = el.querySelector('.in-stage'), cap = el.querySelector('.in-cap'), flash = el.querySelector('.in-flash');
    const timers = []; let finished = false, z = 1;
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    // Rótulos de tráiler: titular grande + línea pequeña debajo
    const say = (t, sub = '') => {
      cap.classList.remove('on'); void cap.offsetWidth;
      cap.innerHTML = t ? `<b>${t}</b>${sub ? `<small>${sub}</small>` : ''}` : '';
      if (t) cap.classList.add('on');
    };
    const boom = () => { flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); };
    const finish = () => {
      if (finished) return; finished = true; timers.forEach(clearTimeout);
      el.hidden = true; el.onclick = null; stage.innerHTML = ''; say('');
      Sound.stop(0.6); done();
    };
    const layer = (html, cls) => {
      const d = document.createElement('div'); d.className = cls; d.style.zIndex = ++z; d.innerHTML = html; stage.appendChild(d);
      const old = [...stage.children].slice(0, -2); old.forEach(o => o.remove());   // deja solo la anterior para el fundido
      return d;
    };
    // Imagen entera (ajustada al ancho) con un fondo difuminado de la misma imagen detrás
    const slide = (img, text, kb, sub) => {
      const d = layer('<div class="in-bg"></div><div class="in-fg ' + kb + '"></div>', 'in-slide');
      d.firstChild.style.backgroundImage = d.lastChild.style.backgroundImage = `url("ui/${img}.png")`; say(text, sub);
      return d;
    };
    el.hidden = false; stage.innerHTML = ''; say('');
    el.querySelector('.in-skip').onclick = e => { e.stopPropagation(); finish(); };
    layer(`<img class="in-logo" src="ui/logo_rogue.png" alt="Inazuma Rogue"><p class="in-tap">${Controls.pc() ? 'Haz clic o pulsa una tecla' : 'Toca para empezar'}</p>`, 'in-center');
    el.onclick = () => {
      el.onclick = null; Sound.unlock(); Sound.music('intro');
      const n = GAME.players.filter(p => p.gacha !== false).length;
      const stars = GAME.players.filter(p => p.gacha !== false && p.rarity === 'legendaria').sort(() => Math.random() - 0.5).slice(0, 12);
      // Final: logo; tocar durante las imágenes salta directamente aquí
      const end = () => {
        timers.forEach(clearTimeout); boom(); say('');
        layer(`<img class="in-logo slam" src="ui/logo_rogue.png" alt="Inazuma Rogue"><p class="in-sub">5 contra 5 · roguelite</p><p class="in-tap">${Controls.pc() ? 'Haz clic o pulsa una tecla' : 'Toca para continuar'}</p>`, 'in-center in-final');
        el.onclick = finish;
      };
      el.onclick = end;
      const miles = String(Math.floor(n / 100) * 100).replace(/\B(?=(\d{3})+$)/g, '.');
      const nTracks = Object.values(TRACKS).filter(t => !t.jingle).length;
      const crests = [1, 2, 10, 15, 33, 41, 48, 49, 31, 38, 599, 588];
      const T = 3000;   // cada plano del tráiler
      const ie3 = GAME.players.filter(p => p.id >= 30000 && p.cs && (p.rarity === 'legendaria' || p.rarity === 'epica')).sort(() => Math.random() - 0.5).slice(0, 12);
      const faces = (list, t, sub) => {
        const d = layer('<div class="in-faces"></div>', 'in-slide');
        list.forEach((p, i) => { const c = face(Sprites.refOf(p), 64); c.style.animationDelay = (i * 0.1) + 's'; d.firstChild.appendChild(c); });
        say(t, sub); return d;
      };
      const S = [
        [0, () => { layer('', 'in-slide'); boom(); slide('bg_title', 'Un fan game de Inazuma Eleven', 'kbZoom'); }],
        [T * 0.8, () => slide('ill05', 'Fútbol 5 contra 5', 'kbA', 'En tiempo real · en el móvil y en el PC')],
        [T * 1.8, () => slide('ill22', 'Modo roguelite', 'kbB', 'Cada partida es distinta: vidas, mejoras y jefes')],
        [T * 2.8, () => { boom(); slide('ill31', `Más de ${miles} jugadores`, 'kbA', 'Del Inazuma 1, 2 y 3, cada uno con su cara y sus técnicas'); }],
        [T * 3.8, () => { boom(); faces(ie3, '¡Llega el Inazuma 3!', 'Inazuma Japón y las selecciones del mundo: Unicorn, Orpheus, Little Gigant…'); }],
        [T * 4.8, () => {
          const d = layer('<div class="in-mach"></div>', 'in-slide');
          [1, 2, 3].forEach((id, i) => {
            const cv = document.createElement('canvas'); cv.width = 96; cv.height = 128; cv.style.animationDelay = (i * 0.15) + 's';
            const crest = new Image(); crest.src = `ui/crest${BANNERS[i].crest}.png`;
            const balls = Array.from({ length: 18 }, (_, k) => ({ x: 26 + (k * 37) % 44, y: 30 + (k * 23) % 30, c: Object.values(CAP_COLORS)[k % 4] }));
            const st = { colors: MACHINE_COLORS[id], crest, balls, crank: -Math.PI / 2 + i, shake: false, t: 0 };
            drawMachine(cv, st); crest.onload = () => drawMachine(cv, st);
            d.firstChild.appendChild(cv);
          });
          say('Máquina de gachapón', 'Gira la manivela: Héroes, Rivales y Villanos');
        }],
        [T * 5.8, () => { boom(); faces(stars, 'Legendarios de verdad', 'Media de 90 o más desde el primer día'); }],
        [T * 6.8, () => slide('bg_team', 'Supertécnicas legendarias', 'kbA', 'Elige cuál usar en cada momento: animación propia y cámara lenta')],
        [T * 7.8, () => slide('ill23', 'Modo Carrera', 'kbB', 'Eres el mánager: tus jugadores mejoran (o bajan) según cómo jueguen')],
        [T * 8.8, () => {
          const d = slide('bg_vs', '🌍 El Mundial', 'kbA', 'Cada 3 temporadas: convoca a 10 y lleva a Inazuma Japón a lo más alto');
          d.insertAdjacentHTML('beforeend', `<div class="in-faces in-crests">${[3016, 3053, 3054, 3055, 3057, 3050, 3021, 3058, 3059, 3060, 3061, 3052].map((c, i) => `<img src="ui/crest${c}.png" alt="" style="animation-delay:${i * 0.08}s">`).join('')}</div>`);
        }],
        [T * 9.8, () => slide('ill25', 'La historia, en 3 etapas', 'kbB', 'Del Fútbol Frontier a la Academia Alius… y al Mundial')],
        [T * 10.8, () => {
          const d = slide('bg_vs', 'Cadenas, especiales e Infinito', 'kbB', 'Rivales cada vez más duros');
          d.insertAdjacentHTML('beforeend', `<div class="in-faces in-crests">${crests.map((c, i) => `<img src="ui/crest${c}.png" alt="" style="animation-delay:${i * 0.08}s">`).join('')}</div>`);
        }],
        [T * 11.8, () => slide('ill15', 'Banda sonora original', 'kbA', `${nTracks} temas del Inazuma 1 y 2`)],
        [T * 12.8, () => { boom(); slide('ill03', '¿Preparado?', 'kbB', 'Forma tu equipo y llega a la cima'); }],
        [T * 13.8, end],
      ];
      S.forEach(([ms, fn]) => at(ms, fn));
    };
  }

  // Teclado fuera del partido: en la intro cualquier tecla avanza (Esc la salta); en menús Esc = Volver
  api.menuKey = e => {
    const intro = $('intro');
    if (!intro.hidden) {
      if (e.code === 'Escape') intro.querySelector('.in-skip').click(); else intro.click();
      e.preventDefault(); return true;
    }
    if (api.running || $('screen').hidden) return false;
    if (e.code === 'Escape') { const b = $('back'); if (b) { b.click(); e.preventDefault(); return true; } }
    return false;
  };

  api.renderMenu = () => renderMenu();
  api.boot = () => {
    Controls.apply();
    Career.load();
    if (api.run && (!api.run.roster || !api.run.kind)) api.run = null;
    if (settings.intro !== 0) playIntro(renderMenu); else renderMenu();
  };
  return api;
})();
