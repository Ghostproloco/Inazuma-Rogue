/* =====================================================================
   APP: menús, modos, gacha, plantilla, recorridos y pantallas (DOM).
   ===================================================================== */
const ELEM_LABEL = { fuego: TX('Fuego'), viento: TX('Viento'), bosque: TX('Bosque'), 'montaña': TX('Montaña'), neutro: '—' };
const TYPE_LABEL = { tiro: TX('Tiro'), regate: TX('Regate'), bloqueo: TX('Bloqueo'), parada: TX('Parada') };
const ROLE_LABEL = { POR: TX('Portero'), DEF: TX('Defensa'), MED: TX('Medio'), DEL: TX('Delantero') };
const ROLES4 = ['POR', 'DEF', 'MED', 'DEL'];
// Abreviatura del puesto para mostrar (en inglés: GK, DF, MF, FW) y curso del jugador («3º curso» / «Year 3»)
const RAB = r => (I18N.en() ? { POR: 'GK', DEF: 'DF', MED: 'MF', DEL: 'FW' }[r] : null) || r;
const yearTx = n => TX('{0}º curso', n);
const ordTx = n => I18N.en() ? n + ([, 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] || 'th') : n + 'º';
const FIELD_LABEL = { normal: TX('Campo clásico'), noche: TX('Campo nocturno'), niebla: TX('Campo nocturno con niebla'), jungla: TX('Campo de la jungla'), atardecer: TX('Campo al atardecer'), nieve: TX('Campo nevado'), acero: TX('Estadio de acero'), cielo: TX('Campo celestial'), volcan: TX('Campo volcánico'), playa: TX('Campo de la playa'), galaxia: TX('Campo galáctico'), dorado: TX('Campo dorado') };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chip = e => `<span class="chip ${EL(e).css}">${ELEM_LABEL[e] || e}</span>`;
const rchip = r => `<span class="rar ${r}">${RARITY[r].label}</span>`;
const stars = n => `<span class="stars">${'★'.repeat(n)}<s>${'★'.repeat(MAX_STARS - n)}</s></span>`;
const TYPE_ICON = { tiro: '⚽', regate: '💨', bloqueo: '🛡️', parada: '✋' };
const techLine = t => `<span class="tline">${chip(t.elem)}<b>${esc(t.name)}</b><i>${TYPE_LABEL[t.type] || ''} · ${t.power}</i></span>`;
// Igual, con el nivel comprado en la tienda (solo para las técnicas de tu colección)
const techLineMy = t => { const lv = Shop.techLevel(t.id); return lv > 1 ? techLine(Object.assign({}, t, { power: t.power + SHOP.LV_POWER * (lv - 1), name: t.name + ' · ' + TX('Nv.') + lv })) : techLine(t); };

const VERSION = '0.37.0';
const DISCORD_URL = 'https://discord.gg/G6SyT2rZW', DISCORD_GIFT = 10;   // servidor de la comunidad (lo hizo un colega de Fran)
const BETA = false;   // solo la beta privada (artefacto) lo pone a true: ahí está el modo desarrollador
// Jugadores originales de Fran (Goggle Jr., Rosfire, Knack…: «original» en gamedata): ocultos en las versiones públicas,
// solo salen en la beta. Fran decide cuándo (y cómo) se publican: NO meterlos directamente al sacar versiones.
if (!BETA && typeof GAME !== 'undefined') GAME.players.forEach(p => { if (p.original) p.gacha = false; });
const App = (() => {
  const $ = id => document.getElementById(id);
  const settings = { minutes: 3, techMode: 'boton', formation: '1-2-1-1', slowmo: 1, intro: 1, controls: 'auto', autoSwitch: 1, fouls: 1, pickStop: 0, decide: 1 };
  try { Object.assign(settings, JSON.parse(localStorage.getItem('inazuma-ajustes') || '{}')); } catch (_) {}
  const saveSettings = () => { try { localStorage.setItem('inazuma-ajustes', JSON.stringify(settings)); } catch (_) {} };
  // Fuera de la beta no hay modo desarrollador: si alguien lo tenía encendido, se apaga sin avisar
  if (!BETA && (settings.dev || settings.debug || settings.hwForce || settings.xmForce || settings.devWin || settings.speed)) {
    settings.dev = false; settings.debug = 0; settings.hwForce = false; settings.xmForce = false; settings.devWin = 0; settings.speed = 0; saveSettings();
  }
  Profile.load();
  Navidad.forced = Navidad.forced || !!settings.xmForce;
  Halloween.forced = Halloween.forced || !!settings.hwForce;   // la beta lo trae encendido de serie

  const api = { match: null, matchSheet: null, running: false, scene: null, mode: null, run: null, settings, pick: null, draft: null };
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
    sc.classList.remove('hwtheme', 'xmtheme'); sc.querySelectorAll('.hwfx, .xmfx').forEach(x => x.remove());
    sc.classList.toggle('bg-cover', !!bg);
    sc.style.backgroundImage = bg ? `url("ui/${bg}.png")` : '';
    body.classList.toggle('cardbg-clear', !!bg);
    body.innerHTML = html; sc.scrollTop = 0; show('screen');
    const fab = $('devFab'); if (fab) fab.hidden = !settings.dev || html.includes('id="dOff"');   // botón rápido del modo desarrollador
  }
  let hub = () => renderMenu();   // pantalla principal a la que vuelve el modo desarrollador
  const crestOf = key => (TEAM(key) || {}).crest || 1;
  // Barra fija arriba con «Volver» y el título; barra fija abajo para el botón principal
  const top = (title, id = 'back', label = TX('Volver')) => `<div class="top"><button class="ghost back" id="${id}">◀ ${label}</button><h2>${title}</h2></div>`;
  const bottom = html => `<div class="bottom">${html}</div>`;
  const face = (ref, size) => Sprites.face(ref, size);
  // Cara del mánager (Ray Dark no está en las hojas de sprites: tiene su retrato en ui/raydark.png)
  function mgrFace(id, size) {
    const pd = PLAYER(id);
    if (pd && pd.faceImg) { const i = document.createElement('img'); i.src = pd.faceImg; i.alt = ''; i.width = i.height = size; i.className = 'mgrcrest pix'; return i; }
    return face(Sprites.refOf(pd), size);
  }
  function wallet() { const P = Profile.data; return `<div class="runbar"><span>🪙 ${P.coins}</span><span>🎟️ ${P.tickets}</span><span title="${TX('Rayos Raimon')}">⚡ ${P.rayos}</span><span>👥 ${Profile.ids().length}</span></div>`; }
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
  const formSelect = (obj, key = 'formation') => `<div class="group"><label>${TX('Formación')}</label><select id="formSel">${Object.entries(FORMATIONS).map(([k, f]) =>
    `<option value="${k}" ${obj[key] === k ? 'selected' : ''}>${k} · ${f.name}</option>`).join('')}</select></div>`;
  document.addEventListener('pointerdown', () => Sound.unlock(), { capture: true });

  /* ---------- Menú principal: modos ---------- */
  // Botón «en directo»: DecAPI (servicio público, sin claves) dice si el canal de Twitch de Fran está emitiendo.
  // Se mira al abrir el menú (como mucho cada ~3 min) y cada 3 min con la página a la vista. Si falla, simplemente no sale.
  const TWITCH = 'franmen_';
  const Live = { on: false, at: 0, busy: false,
    async check(force) {
      if (this.busy || typeof fetch === 'undefined' || (!force && Date.now() - this.at < 170000)) return;
      this.busy = true; this.at = Date.now();
      let tm = null;
      try {
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        if (ctl) tm = setTimeout(() => ctl.abort(), 6000);
        const r = await fetch('https://decapi.me/twitch/uptime/' + TWITCH + '?t=' + Date.now(), { cache: 'no-store', signal: ctl ? ctl.signal : undefined });
        const t = r.ok ? (await r.text()).trim() : '';
        const on = !!t && t.length < 120 && /\d/.test(t) && !/offline|error|not found|no user|invalid/i.test(t);   // en directo: «1 hour, 5 minutes»
        if (on !== this.on) { this.on = on; this.paint(); }
      } catch (_) {} finally { clearTimeout(tm); this.busy = false; }
    },
    paint() {
      const el = $('liveSlot'); if (!el) return;
      el.innerHTML = this.on ? `<a class="livebtn" href="https://www.twitch.tv/${TWITCH}" target="_blank" rel="noopener"><i class="livedot"></i><span class="mt"><b>${TX('Franmen está en directo')}</b><small>${TX('Toca para verlo en Twitch')}</small></span><span class="livego">▶</span></a>` : '';
    },
  };
  setInterval(() => { if (!document.hidden && $('liveSlot')) Live.check(); }, 180000);
  function renderMenu() {
    if (!Profile.data.firstDone) return renderWelcome();
    if (Cloud.state.conflict) return renderConflict(renderMenu);
    let traida = false; try { traida = !!localStorage.getItem('inazuma-traida'); if (traida) localStorage.removeItem('inazuma-traida'); } catch (_) {}
    if (traida) { setTimeout(() => UI.toast(Cloud.enabled() && !Cloud.loggedIn() ? TX('¡Partida traída! Crea una cuenta en 👤 Cuenta para tenerla siempre a salvo') : TX('¡Partida traída!'), 3500), 300); }
    const P = Profile.data, runs = Run.all(), RUN_ORDER = ['leyenda', 'story', 'special', 'chain', 'infinite'], open = RUN_ORDER.filter(k => runs[k]).map(k => runs[k]);
    const done = P.story.s1.done; hub = renderMenu;
    achToast(); const achN = Ach.pending();
    screen(`<div class="nm"><div class="nm-tools">
        <button class="nm-ico" id="mGift" title="${TX('🎁 Código de regalo')}" aria-label="${TX('🎁 Código de regalo')}">🎁</button>
        <button class="nm-ico" id="mSaves" title="${TX('👤 Cuenta')}${Cloud.loggedIn() ? ' · ' + esc(Cloud.user()) : ''}" aria-label="${TX('👤 Cuenta')}">👤${Cloud.loggedIn() ? '<span class="nm-on"></span>' : ''}</button>
        <button class="nm-ico" id="mNews" title="${TX('📰 Novedades')} · v${VERSION}" aria-label="${TX('📰 Novedades')}">📰${settings.seenNews !== VERSION ? '<i class="newdot"></i>' : ''}</button>
        <button class="nm-ico discord" id="mDiscord" title="${P.discordGift ? TX('💬 Únete al Discord de la comunidad') : TX('💬 Únete al Discord · +10 tickets 🎟️')}" aria-label="Discord">💬${P.discordGift ? '' : '<span class="nm-badge">+10 🎟️</span>'}</button>
      </div>
      <div class="title nm-title"><img class="logo" id="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${TX('5 contra 5 · roguelite')}</span></div>${wallet()}
      ${Leyenda.active() ? lyMenuBtn() : ''}
      ${Halloween.active() ? hwMenuBtn() : ''}
      ${Navidad.active() ? xmMenuBtn() : Navidad.upcoming() ? xmSoonBtn() : ''}
      ${Limitado.active() ? lmMenuBtn() : ''}
      ${open.map(r => `<button class="cta" data-cont="${r.kind}">${TX('Continuar:')} ${esc(r.name)}<small>${TX('Partido')} ${r.index + 1}${r.kind === 'infinite' ? '' : TX(' de ') + r.schedule.length} · ${'♥'.repeat(r.lives)}</small></button>`).join('')}
      <div class="modes">
        <button class="mode nm-hero" id="mCareer"><span class="cicon">🏆</span><span class="mt"><b>${TX('Modo Carrera')}</b><small>${Career.data && !Career.data.over ? TX('Temporada ') + Career.data.season + ' · ' + DIV_NAME[Career.myDiv()] + TX(' · semana ') + Career.data.week : TX('Eres el mánager: 3 divisiones y ascensos')}</small></span></button>
        <button class="mode nm-hero" id="mPlayer"><span class="cicon">⭐</span><span class="mt"><b>${TX('Carrera Jugador')}</b><small>${pcSummary()}</small></span></button>
        <div class="nm-tiles">
        <button class="mode nm-tile" id="mStory">${Sprites.crest(1)}<span class="mt"><b>${TX('Historia')}</b><small>${P.story.s4.done ? TX('Etapas 1, 2 y 3 completadas ✓') : P.story.s3.done ? TX('Etapa 3 · Fase 2 abierta (mejor: ') + P.story.s4.best + ')' : P.story.s2.done ? TX('Etapa 3 abierta: el Inazuma 3') : done ? TX('Etapa 1 ✓ · Etapa 2 abierta (mejor: ') + P.story.s2.best + ')' : TX('Etapa 1 · mejor: ') + P.story.s1.best + TX(' victorias')}</small></span></button>
        <button class="mode nm-tile" id="mSpecial">${Sprites.crest(588)}<span class="mt"><b>${TX('Equipos especiales')}</b><small>${SPECIALS.filter(x => Profile.unlocked({ special: x })).length} ${TX('de')} ${SPECIALS.length} ${TX('abiertos')}</small></span></button>
        <button class="mode nm-tile ${done ? '' : 'locked'}" id="mChain">${Sprites.crest(599)}<span class="mt"><b>${TX('Cadenas')}</b><small>${done ? TX('Desafíos cortos · premio: Rayo Raimon') : TX('🔒 Completa la Etapa 1')}</small></span></button>
        <button class="mode nm-tile ${done ? '' : 'locked'}" id="mInf">${Sprites.crest(15)}<span class="mt"><b>${TX('Infinito')}</b><small>${done ? TX('Por oleadas · récord: ') + P.infBest : TX('🔒 Completa la Etapa 1')}</small></span></button>
        <button class="mode nm-tile${Shop.albumPending() ? ' glow' : ''}" id="mAlbum"><span class="cicon">📖</span><span class="mt"><b>${TX('📖 Álbum')}</b><small>${Shop.albumPending() ? TXn(Shop.albumPending(), '¡{0} premio por recoger!', '¡{0} premios por recoger!') : TX('Completa equipos')}</small></span></button>
        <button class="mode nm-tile${achN ? ' glow' : ''}" id="mAch"><span class="cicon">🏅</span><span class="mt"><b>${TX('🏅 Logros')}</b><small>${achN ? TXn(achN, '¡{0} por recoger!', '¡{0} por recoger!') : TX('{0} de {1}', Ach.LIST.filter(a => Ach.state(a) !== 'locked').length, Ach.LIST.length)}</small></span></button>
        </div>
      </div>
      <div data-cloudline>${cloudLine()}</div>
      ${Controls.pc() ? `<p class="note gpnote">${TX('🎮 ¿Tienes mando? Conéctalo y juega: Xbox, PlayStation o genérico.')} <small>${TX('Los botones están en Ajustes.')}</small></p>` : ''}
      ${open.map(r => `<button class="ghost" data-aband="${r.kind}">${TX('Abandonar:')} ${esc(r.name)}</button>`).join('')}
      <button class="ver" id="ver">v${VERSION}${settings.dev ? TX(' · dev') : ''}</button>
      <nav class="nm-dock">
        <button class="nm-dk main" id="mGacha"><i>🎰</i><span>${TX('Gacha')}</span><em class="nm-badge">${P.tickets} 🎟️</em></button>
        <button class="nm-dk${Shop.albumPending() ? ' glow' : ''}" id="mShop"><i>🛒</i><span>${TX('Tienda')}</span></button>
        <button class="nm-dk" id="mTeam"><i>👥</i><span>${TX('Plantilla')}</span></button>
        <button class="nm-dk" id="mQuick"><i>⚽</i><span>${TX('Partido rápido')}</span></button>
        <button class="nm-dk" id="mSound"><i>⚙️</i><span>${TX('Ajustes')}</span></button>
      </nav></div>`, 'bg_title_hw');
    let vt = 0, vtT = 0;   // 20 toques seguidos en la versión: modo desarrollador
    $('ver').onclick = () => {
      const now = Date.now(); vt = now - vtT < 1500 ? vt + 1 : 1; vtT = now;
      if (!BETA) return;
      if (vt >= 20) { vt = 0; if (!settings.dev) { settings.dev = true; settings.devWin = 1; saveSettings(); UI.toast(TX('Modo desarrollador activado'), 1800); } Sound.sfx('reveal'); renderDev(); }
      else if (vt >= 15) UI.toast(TX('Faltan ') + (20 - vt) + TX(' toques…'), 600);
    };
    // Cada modo guarda su partida: si ya tienes una de ese modo, el botón la continúa (puedes tener varias a la vez)
    const resume = k => { if (!runs[k]) return false; api.run = runs[k]; openRun(); return true; };
    body.querySelectorAll('[data-cont]').forEach(b => b.onclick = () => resume(b.dataset.cont));
    body.querySelectorAll('[data-aband]').forEach(b => b.onclick = () => {
      if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = TX('¿Seguro? Toca otra vez para abandonar'); return; }
      Run.clear(b.dataset.aband); if (api.run && api.run.kind === b.dataset.aband) api.run = null; renderMenu();
    });
    $('mStory').onclick = () => { if (!resume('story')) renderStory(); };
    $('mCareer').onclick = () => renderSlots('car');
    $('mPlayer').onclick = () => renderSlots('pc');
    $('mShop').onclick = () => renderShop('sobres'); $('mAlbum').onclick = () => renderShop('album');
    $('mAch').onclick = () => renderAch(renderMenu);
    $('mSpecial').onclick = () => { if (!resume('special')) renderSpecials(); };
    $('mChain').onclick = () => { if (!done) return UI.toast(TX('Completa la Etapa 1 de la Historia')); if (!resume('chain')) renderChains(); };
    $('mInf').onclick = () => { if (!done) return UI.toast(TX('Completa la Etapa 1 de la Historia')); if (!resume('infinite')) { newDraft('infinite', {}); tutorial('infinite'); } };
    $('mGacha').onclick = renderGacha; $('mTeam').onclick = () => renderTeam();
    $('mGift').onclick = renderGift;
    $('mNews').onclick = () => renderPatchNotes(renderMenu);
    $('mDiscord').onclick = () => {
      Sound.sfx('click');
      // Regalo de bienvenida: 10 tickets la primera vez que se pulsa (una sola vez por perfil)
      if (!P.discordGift) { P.discordGift = Date.now(); P.tickets += DISCORD_GIFT; Profile.save(); setTimeout(() => { renderMenu(); UI.toast(TX('¡Gracias por unirte! +10 tickets 🎟️'), 2600); }, 400); }
      try { window.open(DISCORD_URL, '_blank', 'noopener'); } catch (_) { location.href = DISCORD_URL; }
    };
    const newPl = Limitado.pendingNew(settings.seenPlayers);   // jugadores nuevos: sale su pantalla al abrir el juego (y luego las Novedades)
    if (newPl.length) setTimeout(() => { if ($('mNews')) showNewPlayers(newPl, 0, renderMenu); }, 450);
    else if (settings.seenNews !== VERSION && settings.newsShown !== VERSION) { settings.newsShown = VERSION; saveSettings(); setTimeout(() => { if ($('mNews')) renderPatchNotes(renderMenu); }, 400); }   // la primera vez tras actualizar
    $('mSaves').onclick = () => renderAccount(renderMenu);
    body.querySelector('[data-cloudline]').onclick = () => renderAccount(renderMenu);
    $('mQuick').onclick = startQuick; $('mSound').onclick = renderSettings;
    if ($('mHw')) $('mHw').onclick = renderHalloween;
    if ($('mLy')) $('mLy').onclick = () => { if (!resume('leyenda')) renderLeyenda(); };
    if ($('mXm')) $('mXm').onclick = renderNavidad;
    if ($('mXmSoon')) $('mXmSoon').onclick = renderNavidadSoon;
    if ($('mLm')) $('mLm').onclick = renderLimitado;
    if (Navidad.active()) xmDecor(); else if (Halloween.active()) hwDecor();   // el menú lleva el tema del evento activo (niebla y calabazas, o nieve)
    if (settings.seenNews === VERSION || settings.newsShown === VERSION) setTimeout(aviso, 500);
    Sound.music('menu');
  }

  /* ---------- Logros ---------- */
  // Avisa de los logros recién conseguidos
  function achToast() {
    const f = Ach.scan(); if (!f.length) return;
    setTimeout(() => { UI.toast('🏅 ' + (f.length === 1 ? TX('Logro conseguido: {0}', f[0].name) : TX('¡{0} logros conseguidos!', f.length)), 3000); Sound.sfx('reveal'); }, 400);
  }
  function renderAch(back) {
    Ach.scan();
    const L = Ach.LIST, got = L.filter(a => Ach.state(a) !== 'locked').length, ready = L.filter(a => Ach.state(a) === 'ready').length;
    const row = a => {
      const st = Ach.state(a), T = ACH_TIERS[a.tier], pr = Ach.progress(a);
      return `<div class="cpl ach ${st}"><span class="achi">${st === 'locked' ? '🔒' : T.icon}</span><div class="cplb"><b>${esc(a.name)}</b><span class="cst">${esc(a.desc)}${pr.goal && st === 'locked' ? ` · ${pr.cur}/${pr.goal}` : ''}</span>
        ${pr.goal && st === 'locked' ? bar(Math.round(pr.cur / pr.goal * 100), '') : ''}<span class="cst">${T.name} · ${Ach.rewardTx(T.reward)}</span></div>
        ${st === 'ready' ? `<button class="cta mini" data-ach="${a.id}">${TX('Recoger')}</button>` : st === 'got' ? '<b class="achok">✓</b>' : ''}</div>`;
    };
    screen(`${top(TX('Logros'))}
      <p class="cweek">${TX('{0} de {1} conseguidos', got, L.length)}</p>
      ${ready ? `<button class="cta" id="achAll">${TX('🎁 Recoger todo')}<small>${TXn(ready, '{0} logro', '{0} logros')}</small></button>` : `<p class="note">${TX('Los logros que ya tenías conseguidos con tu partida aparecen listos para recoger.')}</p>`}
      ${Object.entries(ACH_CATS).map(([k, name]) => `<h3>${name}</h3><div class="csquad">${L.filter(a => a.cat === k).sort((a, b) => ({ ready: 0, locked: 1, got: 2 }[Ach.state(a)] - { ready: 0, locked: 1, got: 2 }[Ach.state(b)])).map(row).join('')}</div>`).join('')}`, 'bg_title');
    body.querySelectorAll('[data-ach]').forEach(b => b.onclick = () => { const R = Ach.claim(b.dataset.ach); if (R) { Sound.sfx('reveal'); UI.toast(TX('¡Premio recogido!') + ' ' + Ach.rewardTx(R), 2200); } renderAch(back); });
    if ($('achAll')) $('achAll').onclick = () => { const t = Ach.claimAll(); Sound.jingle('win'); UI.toast(TX('¡Premios recogidos!') + ' ' + Ach.rewardTx(t), 3000); renderAch(back); };
    $('back').onclick = back;
  }
  /* ---------- Ranuras de guardado: 3 para cada carrera ---------- */
  function slotInfo(kind, n) {
    const d = Slots.read(kind === 'car' ? CAREER_KEY : PC_KEY, n);
    if (!d) return null;
    if (kind === 'car') {
      const dv = [1, 2, 3].find(k => (d.divs && d.divs[k] || []).includes(YOU));
      const crest = d.crestImg ? `ui/crest${d.crestImg}.png` : ClubCrest.url(d.crest || { shape: 'escudo', c1: '#1f4fc0', c2: '#e8c21a', sym: 'rayo' }, d.school);
      return { img: `<img class="ccrest big" src="${crest}" alt="">`, title: esc(d.school || ''),
        sub: d.over ? TX('Carrera terminada') : `${TX('Temporada')} ${d.season} · ${dv ? DIV_NAME[dv] : ''} · ${TX('semana')} ${d.week} · ${TX('mánager')} ${esc((PLAYER(d.manager) || {}).name || '?')}` };
    }
    if (!d.me) return null;
    if (d.me.pd && !PLAYER(d.me.id)) registerCustom(d.me.pd);
    const p = PLAYER(d.me.id) || d.me.pd || {};
    return { face: p.cs ? Sprites.refOf(p) : null, title: esc(p.name || '?'),
      sub: `${esc(d.school || '')}${d.pro ? ' · ' + TX('Liga Pro') : ''} · ${TX('Temporada')} ${d.season} · ${TX('Nivel')} ${d.me.lv}` };
  }
  function renderSlots(kind) {
    const base = kind === 'car' ? CAREER_KEY : PC_KEY, cur = Slots.get(kind);
    screen(`${top(kind === 'car' ? TX('Modo Carrera') : TX('Carrera Jugador'))}
      <p class="note">${TX('Tienes 3 ranuras de guardado: cada una es una carrera distinta. Todas se guardan en la nube con tu cuenta.')}</p>
      <div class="modes" id="slots"></div>`, 'bg_title');
    const box = $('slots');
    for (let n = 1; n <= SLOT_COUNT; n++) {
      const I = slotInfo(kind, n), row = document.createElement('div'); row.className = 'slotrow';
      const b = document.createElement('button'); b.className = 'mode slot' + (n === cur && I ? ' cur' : '');
      b.innerHTML = I ? `<span class="slotn">${n}</span><span class="slotimg"></span><span class="mt"><b>${I.title}</b><small>${I.sub}</small></span>`
        : `<span class="slotn">${n}</span><span class="cicon">➕</span><span class="mt"><b>${TX('Ranura vacía')}</b><small>${kind === 'car' ? TX('Empieza una carrera de mánager') : TX('Crea o elige a tu jugador')}</small></span>`;
      if (I && I.img) b.querySelector('.slotimg').innerHTML = I.img; else if (I && I.face) b.querySelector('.slotimg').appendChild(face(I.face, 44));
      b.onclick = () => {
        Slots.set(kind, n); Sound.sfx('click');
        if (kind === 'car') { Career.load(); renderCareer(); } else renderPC();
      };
      row.appendChild(b);
      if (I) {
        const del = document.createElement('button'); del.className = 'ghost slotdel'; del.textContent = '🗑'; del.title = TX('Borrar');
        del.onclick = () => {
          if (!del.dataset.sure) { del.dataset.sure = 1; del.textContent = TX('¿Borrar?'); return; }
          const keep = Slots.get(kind); Slots.set(kind, n);
          if (kind === 'car') { Career.load(); Career.clear(); } else { PC.load(); PC.clear(); }   // la de mánager pasa al salón de la fama
          Slots.set(kind, keep); if (kind === 'car') Career.load(); else PC.load();
          UI.toast(TX('Ranura {0} borrada', n)); renderSlots(kind);
        };
        row.appendChild(del);
      }
      box.appendChild(row);
    }
    $('back').onclick = renderMenu;
  }
  // Resumen del Modo Carrera Jugador para el menú
  function pcSummary() {
    const d = Slots.read(PC_KEY, Slots.get('pc'));
    if (!d || !d.me) return TX('Vive la carrera de un solo jugador · 3 ranuras');
    const p = PLAYER(d.me.id) || d.me.pd || {};
    return `${esc(p.name || '')} · ${esc(d.school)}${d.pro ? ' · ' + TX('Liga Pro') : ''} · ${TX('Temporada')} ${d.season} · ${TX('Nivel')} ${d.me.lv}`;
  }
  const mini = keys => `<span class="mini">${keys.map(k => Sprites.crest(crestOf(k))).join('')}</span>`;
  /* ---------- Tutoriales: se enseñan la primera vez que entras en cada modo (y con el botón ❓) ---------- */
  const TUTS = {
    story: [TX('Historia'), TX('Recorre los torneos del 1, 2 y 3 con tu equipo. Es') + ' <b>' + TX('roguelite') + '</b>' + TX(': tienes vidas ♥, tras cada victoria eliges una mejora (técnica, habilidad o fichaje temporal) y todo eso se pierde al acabar el intento. Completar una etapa la deja superada para siempre y abre más modos.')],
    special: [TX('Equipos especiales'), TX('Un solo partido, sin segundas oportunidades. Si ganas,') + ' <b>' + TX('su estrella se une a tu plantilla') + '</b> ' + TX('(o sube una ★ si ya la tenías).')],
    chains: [TX('Cadenas'), TX('Varios partidos seguidos') + ' <b>' + TX('sin recuperar vidas') + '</b>' + TX('. Al completarla: Rayo Raimon, tickets, monedas y la estrella del último rival. La primera vez, una técnica legendaria. Sin perder vidas, 💎 extra. Medallas 🥉🥈🥇 al repetirlas.')],
    infinite: [TX('Infinito'), TX('Oleadas de rivales cada vez más fuertes hasta que te quedes sin vidas. Cada 5 oleadas, un jefe. Intenta batir tu récord.') + ' <b>' + TX('∞ Al ganar a cada jefe eliges una versión especial de un jugador (del 2, del 3…) que no sale en el gacha: cuanto más lejos llegues, más rara.') + '</b>'],
    gacha: [TX('Gacha'), TX('Gasta tickets para tirar: gira la manivela de la máquina y abre las cápsulas. Probabilidades: común 60 %, rara 28 %, épica 10 %, legendaria 2 % (cada 10 tiradas sin épica, la siguiente lo es seguro). Los repetidos suben estrellas a tu jugador.')],
    team: [TX('Plantilla'), '<b>' + TX('Mi equipo') + '</b>' + TX(': elige formación y quién juega (a portería solo porteros).') + ' <b>' + TX('Jugadores') + '</b>' + TX(': busca y entrena (monedas) o usa Rayos Raimon para subir estrellas.') + ' <b>' + TX('Técnicas') + '</b>' + TX(': equipa las supertécnicas.')],
    career: [TX('Modo Carrera'), TX('Eres el mánager de un instituto: 3 divisiones, Copa y playoffs. Cada semana haz una actividad (entrenar, ojear…), juega o simula el partido y ficha (también a jugadores del extranjero). Tus titulares') + ' <b>' + TX('suben o bajan') + '</b> ' + TX('según su rendimiento. Los jugadores se') + ' <b>' + TX('gradúan al acabar 6º curso') + '</b> ' + TX('y la cantera trae chavales nuevos. Cuida la fama: si llega a 0, cierran el club. Cada 3 temporadas,') + ' <b>' + TX('el Mundial') + '</b>.'],
    pcareer: [TX('Carrera Jugador'), TX('Vives la carrera de un solo jugador. Cada semana eliges una actividad (entrenar, practicar una técnica o descansar) y luego llega el partido: <b>solo controlas a tu jugador</b>; pide el balón con <b>«¡Pásamela!»</b>. Tu <b>nota</b> da experiencia: al subir de nivel ganas puntos para tus stats y técnicas nuevas. El entrenador pone a los 5 mejores: si eres suplente, a veces sales en la 2.ª parte. Si destacas, te fichan otros clubes (y en las semanas 1-2 y 8-9 puedes pedir el traspaso) y te convoca tu selección para el Mundial (de titular, suplente o reserva, según tu nivel). Tras 3 temporadas te graduas y saltas a la Liga Pro, donde la carrera sigue sin fin.')],
    wc: [TX('El Mundial'), TX('Eres el seleccionador de Inazuma Japón. Convoca a') + ' <b>' + TX('10 jugadores') + '</b> ' + TX('(dos equipos de 5) y elige qué 5 juegan cada partido. Grupo de 4 (pasan 2), semifinal y final, con penaltis si hay empate.')],
  };
  function tutorial(key, force) {
    const T = TUTS[key]; settings.tuts = settings.tuts || {};
    if (!T || (settings.tuts[key] && !force)) return;
    settings.tuts[key] = 1; saveSettings();
    const d = document.createElement('div'); d.className = 'tutbox';
    d.innerHTML = `<div class="tutin"><h2>❓ ${T[0]}</h2><p>${T[1]}</p><button class="cta">${TX('¡Entendido!')}</button></div>`;
    d.querySelector('button').onclick = () => d.remove();
    document.body.appendChild(d);
  }
  // Aviso que sale una sola vez al entrar al menú (cambia AVISO.key para sacar uno nuevo)
  const AVISO = { key: 'munecos-ie3', title: TX('🎨 ¡Muñecos del Inazuma 3 arreglados!'),
    text: TX('Muchos jugadores del 3 llevaban en el campo un muñeco que no era el suyo. Ahora todos llevan su muñeco de verdad, sacado del juego original: su peinado, sus colores y su tono de piel. Mac Robingo, Hector Helio, Edgar Partinus, Dylan Keith, Byron Love y muchos más ya se ven como tienen que verse.') };
  function aviso() {
    if (!Profile.data.firstDone || settings.aviso === AVISO.key || document.querySelector('.tutbox') || $('newsOk') || !$('mNews')) return;   // no encima de las Novedades
    settings.aviso = AVISO.key; saveSettings();
    const d = document.createElement('div'); d.className = 'tutbox';
    d.innerHTML = `<div class="tutin"><h2>${AVISO.title}</h2><p>${AVISO.text}</p><button class="cta">${TX('¡A jugar!')}</button></div>`;
    d.querySelector('button').onclick = () => d.remove();
    document.body.appendChild(d);
  }
  const tutBtn = key => `<button class="ghost mini tutq" data-tut="${key}">${TX('❓ Cómo funciona')}</button>`;
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tut]'); if (b) tutorial(b.dataset.tut, true); });
  function renderStory() {
    const P = Profile.data;
    screen(`${top(TX('Historia'))}${wallet()}
      <div class="modes">${STAGES.map((s, i) => { const open = s.available && Profile.unlocked({ stage: s }), ord = STAGE_ORDER[s.key] || [];
        return `<button class="mode ${open ? '' : 'locked'}" data-st="${s.key}">${Sprites.crest([1, 33, 3021, 3057][i] || 15)}<span class="mt"><b>${s.name}</b>
        <small>${open ? (P.story[s.key] && P.story[s.key].done ? TX('Completada ✓ · puedes repetirla') : ord.length ? TX('De ') + esc(ord[0]) + ' a ' + esc(ord[ord.length - 1]) : '') : '🔒 ' + s.note}</small>${open && ord.length ? mini(ord) : ''}</span></button>`; }).join('')}</div>
      <p class="note">${TX('Cada intento es roguelite: las técnicas, habilidades y fichajes se pierden al acabar. La etapa que completas queda superada para siempre y abre las Cadenas, el Infinito y más equipos especiales.')}</p>
`, 'bg_team');
    body.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
      const st = STAGES.find(s => s.key === b.dataset.st);
      if (!st.available || !Profile.unlocked({ stage: st })) return UI.toast(st.note);
      newDraft('story', { diff: 'medio', stage: st.key });
    });
    tutorial('story'); if (!$('tutq-story')) body.insertAdjacentHTML('beforeend', `<p class="note" id="tutq-story">${tutBtn('story')}</p>`);
    $('back').onclick = renderMenu;
  }
  function renderSpecials() {
    const P = Profile.data;
    screen(`${top(TX('Especiales'))}${wallet()}
      <p class="note">${TX('Un solo partido, sin segundas oportunidades. Si ganas, te llevas a su estrella para tu plantilla (o una estrella más si ya la tienes).')}</p>
      <div class="modes" id="sp"></div>`);
    SPECIALS.forEach(x => {
      const t = TEAM(x.key), open = Profile.unlocked({ special: x });
      const star = teamStar(t.key, true);
      const b = document.createElement('button'); b.className = 'mode' + (open ? '' : ' locked');
      b.innerHTML = `${Sprites.crest(t.crest)}<span class="mt"><b>${esc(t.name)}</b><small>${open ? `${FIELD_LABEL[TEAM_FIELD[t.key]] || ''} ${TX('· Premio:')} ${star ? esc(star.name) : '—'}${P.specials[t.key] ? TX(' · ganado ×') + P.specials[t.key] : ''}`
        : '🔒 ' + (x.unlock === 'done' ? TX('Completa la Etapa 1') : x.unlock === 'done2' ? TX('Completa la Etapa 2') : `${TX('Gana')} ${x.unlock} ${TX('partidos en la Etapa 1')}`)}</small></span>`;
      b.onclick = () => { if (!open) return UI.toast(TX('Aún bloqueado')); newDraft('special', { team: t.key }); };
      $('sp').appendChild(b);
    });
    tutorial('special'); if (!$('tutq-special')) body.insertAdjacentHTML('beforeend', `<p class="note" id="tutq-special">${tutBtn('special')}</p>`);
    $('back').onclick = renderMenu;
  }
  function renderChains() {
    const P = Profile.data;
    screen(`${top(TX('Cadenas'))}${wallet()}
      <p class="note">${TX('Varios partidos seguidos sin recuperar vidas.')} <b>${TX('Premios por completarla:')}</b> ${TX('⚡ Rayo Raimon · 5 🎟️ · 150 🪙 · la estrella del último rival se une a tu plantilla (o sube una ★).')}
      <b>${TX('La primera vez:')}</b> ${TX('una técnica legendaria y 10 🎟️ más.')} <b>${TX('Sin perder vidas:')}</b> +5 🎟️ 💎. <b>${TX('Medallas:')}</b> ${TX('🥉 1 vez · 🥈 3 veces · 🥇 5 veces (15 🎟️ y otro Rayo).')}</p>
      <div class="modes">${CHAINS.map(c => { const open = Profile.unlocked({ chain: c });
        return `<button class="mode${open ? '' : ' locked'}" data-ch="${c.key}">${Sprites.crest(crestOf(c.teams[0]))}<span class="mt"><b>${open ? '' : '🔒 '}${esc(c.name)}</b><small>${open ? esc(c.desc) : c.needs === 's4' ? TX('Completa la Etapa 3') : TX('Completa la Etapa 2')} · ${c.teams.length} ${TX('partidos ·')} ${'♥'.repeat(c.lives)}${P.chains[c.key] ? ' · ' + (P.chains[c.key] >= 5 ? '🥇' : P.chains[c.key] >= 3 ? '🥈' : '🥉') + ' ×' + P.chains[c.key] + (P.chainPerfect && P.chainPerfect[c.key] ? ' 💎' : '') : TX(' · 📜 técnica legendaria la 1.ª vez')}</small>${mini(c.teams)}</span></button>`; }).join('')}</div>`);
    body.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => {
      const c = CHAINS.find(x => x.key === b.dataset.ch);
      if (!Profile.unlocked({ chain: c })) return UI.toast(TX('Se abre al completar la Etapa 2'));
      newDraft('chain', { chain: c.key });
    });
    tutorial('chains'); if (!$('tutq-chains')) body.insertAdjacentHTML('beforeend', `<p class="note" id="tutq-chains">${tutBtn('chains')}</p>`);
    $('back').onclick = renderMenu;
  }

  function renderWelcome() {
    screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${TX('¡Bienvenido!')}</span></div>
      <p class="note">${TX('Tu plantilla empieza vacía. Haz tu tirada de bienvenida:')} <b>${TX('10 jugadores')}</b> ${TX('del juego, con un')} <b>${TX('portero asegurado')}</b> ${TX('y al menos uno épico o mejor. Además recibes 100 monedas para entrenar.')}</p>
      <p class="note">${TX('Probabilidades: común 60 % · rara 28 % · épica 10 % · legendaria 2 %. Cada 10 tiradas sin épica, la siguiente lo es seguro.')}</p>
      <button class="cta" id="wPull">${TX('Tirada de bienvenida ×10')}</button>
      ${Cloud.enabled() && !Cloud.loggedIn() ? `<div class="grid2"><button class="ghost big" id="wIn">${TX('Ya tengo cuenta')}<small>${TX('Recuperar mi partida')}</small></button><button class="ghost big" id="wUp">${TX('Crear cuenta')}<small>${TX('Guardar en la nube')}</small></button></div>` : ''}
      <button class="ghost" id="wLang">🌐 ${I18N.lang === 'en' ? 'Español' : 'English'}</button>
      <button class="ghost big" id="wOld">${TX('¿Jugabas en la versión antigua?')}<small>${TX('Trae tu partida aquí')}</small></button>
      <div data-cloudline>${Cloud.loggedIn() ? cloudLine() : ''}</div>`, 'bg_title');
    $('wOld').onclick = () => renderTransfer(renderMenu);
    $('wLang').onclick = () => { const l = I18N.lang === 'en' ? 'es' : 'en'; I18N.set(l); screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${l === 'en' ? 'Changing language…' : 'Cambiando el idioma…'}</span></div>`, 'bg_title'); setTimeout(() => location.reload(), 250); };
    if ($('wIn')) { $('wIn').onclick = () => renderLogin(renderMenu, 'in'); $('wUp').onclick = () => renderLogin(renderMenu, 'up'); }
    $('wPull').onclick = () => {
      Sound.unlock();
      Profile.data.pity = 0;
      const res = Gacha.pull(10, { keeper: true });
      Profile.data.firstDone = true; Profile.data.coins += 100; Profile.save();
      renderMachine(res, 1, renderMenu, TX('Tirada de bienvenida'));
    };
  }

  /* ---------- Gacha ---------- */
  function renderGacha() {
    const P = Profile.data;
    if (P.banner === SV_BANNER && Selva.active()) return renderSelvaGacha();
    const B = BANNERS.find(b => b.id === P.banner) || BANNERS[0];
    screen(`${top(TX('Gacha'))}${wallet()}
      <div class="banners" id="bn"></div>
      <p class="note">${TX('Común 60 % · Rara 28 % · Épica 10 % · Legendaria 2 %. En el tramo legendario, la mitad de las veces sale una')} <b>${TX('técnica legendaria')}</b> ${TX('(de las más fuertes del juego).')}<br>
      ${TX('Épica o mejor asegurada cada 10 tiradas (llevas')} ${P.pity} ${TX('de 10). Los repetidos suben una estrella (máx.')} ${MAX_STARS}${TX('); con 5 estrellas, o una técnica repetida, dan monedas.')}</p>
      <p class="note">${TX('Tickets: Historia (1 por victoria y 3 al completarla), Especiales (2), Cadenas (2 al completarlas) e Infinito (2 por oleada especial).')}</p>
      ${bottom(`<div class="grid2"><button class="cta" id="g1" ${P.tickets < 1 ? 'disabled' : ''}>${TX('Tirar ×1')}<small>${TX('1 ticket')}</small></button><button class="cta" id="g10" ${P.tickets < 10 ? 'disabled' : ''}>${TX('Tirar ×10')}<small>${TX('10 tickets')}</small></button></div>`)}`, 'bg_green');
    if (Selva.active()) {   // Sobre Selva (evento): tarjeta destacada arriba
      const el = document.createElement('button'); el.className = 'banner-card svcard';
      el.innerHTML = `${Sprites.crest(4104)}<span class="mt"><b>🍃 ${TX('Sobre Selva')}</b><small>${TX('Diseños raros y 6 legendarios de evento · hasta el miércoles')}</small><span class="legs"></span></span>`;
      Selva.legends().forEach(p => el.querySelector('.legs').appendChild(face(Sprites.refOf(p), 32)));
      el.onclick = () => { P.banner = SV_BANNER; Profile.save(); Sound.sfx('click'); renderGacha(); };
      $('bn').appendChild(el);
    }
    if (Limitado.active()) {
      const lim = document.createElement('button'); lim.className = 'banner-card lim';
      lim.innerHTML = `<span class="limbg"></span>${lmBolts()}<span class="mt"><b>⚡ ${TX('Tormenta Celestial')}</b><small>${TX('LIMITADO · 50 🎟️ = 10 jugadores · nota 100')}</small></span>`;
      lim.onclick = () => { Sound.sfx('click'); renderLimitado(); };
      $('bn').appendChild(lim);
    }
    BANNERS.forEach(b => {
      const seenL = new Set(), legs = GAME.players.filter(p => p.banner === b.id && p.rarity === 'legendaria').filter(p => { const k = p.full.replace(/ \((IE2|IE3)\)$/, ''); return !seenL.has(k) && seenL.add(k); });
      const el = document.createElement('button');
      el.className = 'banner-card' + (b.id === B.id ? ' sel' : '');
      const n = GAME.players.filter(p => p.banner === b.id && p.gacha !== false).length;
      el.innerHTML = `${Sprites.crest(b.crest)}<span class="mt"><b>${esc(b.name)}</b><small>${esc(b.desc)} · ${n} ${TX('jugadores')}</small><span class="legs"></span></span>`;
      legs.forEach(p => el.querySelector('.legs').appendChild(face(Sprites.refOf(p), 32)));
      el.onclick = () => { P.banner = b.id; Profile.save(); Sound.sfx('click'); renderGacha(); };
      $('bn').appendChild(el);
    });
    const go = n => { if (P.tickets < n) return; P.tickets -= n; Profile.save(); renderMachine(Gacha.pull(n, { banner: B.id }), B.id, renderGacha); };
    $('g1').onclick = () => go(1); $('g10').onclick = () => go(10); $('back').onclick = renderMenu;
    tutorial('gacha'); if (!$('tutq-gacha')) body.insertAdjacentHTML('beforeend', `<p class="note" id="tutq-gacha">${tutBtn('gacha')}</p>`);
  }
  function renderSelvaGacha() {
    const P = Profile.data, S = Selva.data(), legs = Selva.legends();
    screen(`${top(TX('Gacha'))}${wallet()}
      <div class="banners" id="bn"></div>
      <h3>🍃 ${TX('Sobre Selva')} <small>${TXn(Selva.daysLeft(), 'Queda {0} día', 'Quedan {0} días')}</small></h3>
      <div class="hwlegs svlegs" id="svLegs"></div>
      <p class="note">${TX('Jugadores de diseños raros (Mar de Árboles, Occult, aliens, demonios…) y 6 legendarios de evento con diseño «selva y oro». Los que consigas son tuyos para siempre.')}<br>
        ${TX('Legendario 3 % · Épica 15 % · Rara 32 % · Común 50 %. Legendario asegurado a las {0} tiradas (llevas {1}).', SV_PITY, S.pity)}</p>
      ${bottom(`<div class="grid2"><button class="cta" id="g1" ${P.tickets < SV_PRICE ? 'disabled' : ''}>${TX('Tirar ×1')}<small>${TX('1 ticket')}</small></button><button class="cta" id="g10" ${P.tickets < SV_PRICE * 10 ? 'disabled' : ''}>${TX('Tirar ×10')}<small>${TX('10 tickets')}</small></button></div>`)}`, 'bg_green');
    const back = document.createElement('button'); back.className = 'banner-card'; back.innerHTML = `${Sprites.crest(1)}<span class="mt"><b>${TX('Volver a los sobres normales')}</b></span>`;
    back.onclick = () => { P.banner = 1; Profile.save(); Sound.sfx('click'); renderGacha(); }; $('bn').appendChild(back);
    legs.forEach(p => { const w = document.createElement('div'); w.className = 'hwleg svleg' + (P.coll[p.id] ? ' own' : ''); w.appendChild(face(Sprites.refOf(p), 48)); w.insertAdjacentHTML('beforeend', `<small>${esc(p.name)}</small><small>${RAB(p.role)}</small>`); $('svLegs').appendChild(w); });
    const go = n => { const res = Selva.pull(n); if (!res) return UI.toast(TX('No tienes tickets suficientes')); renderMachine(res, SV_BANNER, renderGacha, TX('Sobre Selva')); };
    $('g1').onclick = () => go(1); $('g10').onclick = () => go(10); $('back').onclick = renderMenu;
  }
  // Legendarios de Halloween: marco naranja apagado, estilo miedo (clase .hw)
  const hwc = pd => pd && pd.leyenda ? ' ly' : pd && pd.halloween ? ' hw' : pd && pd.xmas ? ' xm' : pd && pd.lim ? ' lim' : pd && pd.selva ? ' sv' : pd && pd.inf ? ' inf' : '';   // + Sobre Selva   // marcos especiales: Halloween y versiones del Infinito
  // Carta de un resultado del gacha (jugador o técnica legendaria)
  function makeCard(r) {
    const c = document.createElement('div');
    c.className = 'gcard ' + r.tier + (r.tech == null ? hwc(PLAYER(r.id)) : '');
    if (r.tech != null) {
      const t = TECH(r.tech);
      c.classList.add('techcard', EL(t.elem).css);
      c.innerHTML = `<div class="scroll">${TYPE_ICON[t.type] || '★'}</div><div class="gname">${esc(t.name)}</div>
        <div class="gmeta">${rchip('legendaria')}${chip(t.elem)}</div><div class="gmeta">${TYPE_LABEL[t.type]} · ${t.power}</div>
        <div class="gtag">${r.isNew ? TX('¡TÉCNICA NUEVA!') : '+' + r.coins + ' 🪙'}</div>`;
      return c;
    }
    const pd = PLAYER(r.id);
    c.appendChild(face(Sprites.refOf(pd), 80));
    c.insertAdjacentHTML('beforeend', `<div class="gname">${pd.leyenda ? '👑' : pd.halloween ? '🎃' : pd.xmas ? '🎄' : pd.lim ? '⚡' : pd.selva ? '🍃' : ''}${esc(pd.name)}</div><div class="gmeta">${rchip(r.tier)}<span>${RAB(pd.role)}</span>${chip(pd.elem)}</div>
      <div class="gtag">${r.isNew ? 'NUEVO' : r.coins ? '+' + r.coins + ' 🪙' : '★ ' + r.star}</div>`);
    return c;
  }
  function renderReveal(res, done, title = TX('¡Nuevos jugadores!')) {
    screen(`<h2>${title}</h2><div class="reveal" id="rv"></div>${bottom('<button class="cta" id="ok" hidden>' + TX('Continuar') + '</button>')}`, 'bg_whistle');
    const box = $('rv');
    res.forEach((r, i) => {
      const c = makeCard(r); c.style.animationDelay = (i * 0.18) + 's'; box.appendChild(c);
      setTimeout(() => Sound.sfx(r.tier === 'limitada' || r.tier === 'legendaria' || r.tier === 'epica' ? 'reveal' : 'click'), i * 180);
    });
    setTimeout(() => { $('ok').hidden = false; }, res.length * 180 + 300);
    $('ok').onclick = done;
  }

  /* ---------- Máquina de gachapón ---------- */
  const MACHINE_COLORS = { 1: ['#e8c21a', '#1f4fc0'], 2: ['#2a5fd0', '#e8e8f0'], 3: ['#5a1a8a', '#e01a4a'], 4: ['#b8742a', '#f2e6c0'], [HW_BANNER]: ['#ff7a1a', '#6a2aa8'], [SV_BANNER]: ['#2f7a3a', '#e0b030'], [XM_BANNER]: ['#d8283a', '#1f7a3a'], [LM_BANNER]: ['#1f3fb0', '#ffd23a'] };
  const CAP_COLORS = { comun: '#b8bcc8', rara: '#3f8fff', epica: '#a24cff', legendaria: '#ffcc22', limitada: '#35d6ff' };
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
    const B = BANNERS.find(b => b.id === bannerId) || (bannerId === HW_BANNER ? { name: TX('Sobre Calabaza'), crest: 3 } : bannerId === SV_BANNER ? { name: TX('Sobre Selva'), crest: 4104 } : bannerId === XM_BANNER ? { name: TX('Sobre Navideño'), crest: 36 } : bannerId === LM_BANNER ? { name: TX('Tormenta Celestial'), crest: 3021 } : BANNERS[0]);
    screen(`<h2>${esc(title || B.name)}</h2>
      <div class="gmach"><canvas id="mc" width="96" height="128"></canvas><div class="gm-hint" id="mHint">${Controls.pc() ? TX('Arrastra la manivela en círculo (o pulsa Espacio)') : TX('Gira la manivela con el dedo ↻')}</div></div>
      <div class="caps" id="caps"></div>
      ${bottom('<div class="grid2"><button class="ghost" id="mSkip">' + TX('Saltar') + '</button><button class="cta" id="mAll" hidden>' + TX('Abrir todas') + '</button></div><button class="cta" id="mOk" hidden>' + TX('Continuar') + '</button>')}`, 'bg_whistle');
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
    const items = res.map(r => ({ r, shown: (r.tier === 'legendaria' || r.tier === 'limitada') && Math.random() < 0.5 ? 'epica' : r.tier, opened: false }));
    let left = items.length;
    const finish = () => { $('mHint').textContent = TX('¡Ya están todas abiertas!'); $('mAll').hidden = true; $('mSkip').hidden = true; $('mOk').hidden = false; };
    function openCap(it, el) {
      if (it.opened) return Promise.resolve(); it.opened = true;
      return new Promise(res2 => {
        const up = it.shown !== it.r.tier;
        el.classList.add('shake'); Sound.sfx('click');
        setTimeout(() => {
          if (up) { el.classList.remove('t-' + it.shown); el.classList.add('t-' + it.r.tier, 'upgrade'); Sound.sfx('tech'); flash(CAP_COLORS[it.r.tier] || CAP_COLORS.legendaria); }
          setTimeout(() => {
            el.classList.remove('shake'); el.classList.add('open');
            if (it.r.tier === 'limitada') { lmBoom(); Sound.sfx('reveal'); } else if (it.r.tier === 'legendaria' || it.r.tier === 'epica') { flash(CAP_COLORS[it.r.tier]); Sound.sfx('reveal'); } else Sound.sfx('pass');
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
      $('mHint').textContent = items.length > 1 ? TX('Toca cada cápsula para abrirla') : TX('Toca la cápsula para abrirla');
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
    $('mSkip').onclick = () => { alive = false; cancelAnimationFrame(raf); removeEventListener('keydown', key); renderReveal(res, done, title || TX('¡Nuevos jugadores!')); };
    $('mOk').onclick = () => { alive = false; cancelAnimationFrame(raf); removeEventListener('keydown', key); done(); };
  }

  /* =====================================================================
     EVENTO DE HALLOWEEN (pantalla propia, fuera de los modos)
     ===================================================================== */
  /* ---------- Evento «Cadena Leyenda» ---------- */
  function lyMenuBtn() {
    const L = Leyenda.data(), run = Run.load('leyenda');
    return `<button class="mode lymode" id="mLy"><span class="cicon">👑</span><span class="mt"><b>${TX('Cadena Leyenda')}</b><small>${run ? TX('Partido {0} de {1}', run.index + 1, run.schedule.length) : L.done ? TX('¡Completada! · Willy Glass LEYENDA ✓') : TX('15 partidos, una derrota y fuera · récord: {0}', L.best)} · ${Leyenda.left()}</small></span></button>`;
  }
  function renderLeyenda() {
    const L = Leyenda.data(), pd = Leyenda.legend(), T = TECH(LY_TECH);
    const prize = (n, txt) => `<li class="${L.got[n] || (n === 15 && L.done) ? 'got' : ''}"><b>${TX('Partido {0}', n)}</b> · ${txt}${L.got[n] || (n === 15 && L.done) ? ' ✓' : ''}</li>`;
    screen(`${top(TX('Cadena Leyenda'))}
      <div class="lyhead"><div id="lyFace"></div><div><span><b>${esc(pd.name)}</b> <span class="lytag">${TX('LEYENDA')}</span></span><small>${rchip(pd.rarity)} ${RAB(pd.role)} ${chip(pd.elem)} · ${TX('Tiro')} ${pd.ie.tiro} · ${TX('Rapidez')} ${pd.ie.rapidez}</small><small>${TX('Técnica propia:')} <b>${esc(T.name)}</b> (${TX('tiro')} ${T.power})</small></div></div>
      <p class="note"><b>${Leyenda.left()}</b> · ${TX('Ganas a los 15 mejores equipos del juego seguidos y Willy Glass LEYENDA es tuyo para siempre.')}</p>
      <ul class="lyrules">
        <li>${TX('⚔️ 15 partidos, del más flojo al más fuerte.')}</li>
        <li>${TX('💀 Una derrota y vuelves a empezar desde el partido 1.')}</li>
        <li>${TX('📈 Los rivales se hacen más fuertes en cada partido: del partido 1 al 14 suben del 100 % al 125 % de sus estadísticas.')}</li>
        <li>${TX('🔥 Presionan entre dos, roban más, tiran antes y te castigan las contras.')}</li>
        <li>${TX('👑 Jefe final: el equipo Leyendas, con los mejores jugadores del juego.')}</li>
        <li>${TX('🛒 Sin las mejoras de supertécnicas de la tienda.')}</li>
        <li>${TX('🚫 Al repetirla (cuando ya tienes a Willy): sin legendarios en tu equipo.')}</li>
      </ul>
      <h3>${TX('Premios (una vez cada uno)')}</h3>
      <ul class="lyprizes">${Object.entries(LY_PRIZES).map(([n, P]) => prize(+n, esc(P.txt))).join('')}${prize(15, '👑 ' + TX('Willy Glass LEYENDA + 10 tickets'))}</ul>
      <ol class="path">${LY_TEAMS.map((t, i) => `<li class="${i < L.best ? 'done' : ''}">${Sprites.crest(crestOf(t))}<span>${esc(t)}</span></li>`).join('')}</ol>
      <p class="note">${TX('Récord: {0} de 15 · intentos: {1}', L.best, L.tries)}${L.done ? ' · ' + TXn(L.done, 'completada {0} vez', 'completada {0} veces') : ''}</p>
      ${bottom(`<button class="cta" id="lyGo">${TX('Empezar la cadena')}</button>`)}`, 'bg_vs');
    $('lyFace').appendChild(face(Sprites.refOf(pd), 80)); $('lyFace').className = 'pcard legendaria ly lyface';
    $('lyGo').onclick = () => { if (!Leyenda.active()) { UI.toast(TX('El evento ha terminado')); return renderMenu(); } newDraft('leyenda', {}); };
    $('back').onclick = renderMenu;
    Sound.music('menu');
  }
  function hwMenuBtn() {
    const H = Halloween.data(), gift = H.daily !== Halloween.today() || Halloween.loginReady(), n = Halloween.pending();
    return `<button class="mode hwmode" id="mHw"><span class="cicon">🎃</span><span class="mt"><b>${TX('Halloween')}${gift || n ? ' <i class="hwdot"></i>' : ''}</b><small>${TX('Sobre Calabaza, partido jefe y retos')} · 🍬 ${H.candy}${gift ? ' · ' + TX('🎁 regalo') : ''}</small></span></button>`;
  }
  // Calabazas y niebla suave
  function hwDecor() {
    const sc = $('screen'); sc.classList.add('hwtheme');
    sc.insertAdjacentHTML('afterbegin', `<div class="hwfx" aria-hidden="true"><i class="fog f1"></i><i class="fog f2"></i><i class="fog f3"></i>
      <span class="pk p1">🎃</span><span class="pk p2">🎃</span></div>`);
  }
  function renderHalloween() {
    if (!Halloween.active()) return renderMenu();
    const gift = Halloween.daily(), H = Halloween.data(), d = Halloween.daysLeft();
    const legs = HW_LEGENDS.map(L => PLAYER(L.id)).filter(Boolean);
    const retos = Halloween.RETOS.map(R => {
      const st = Halloween.retoState(R), v = Math.min(R.goal, R.val(H));
      return `<div class="hwreto ${st}"><div><b>${R.name}</b><small>${R.desc} · ${v}/${R.goal}</small><small>${TX('Premio:')} ${R.reward.candy} 🍬 · ${R.reward.tickets} 🎟️</small></div>
        ${st === 'got' ? '<span class="hwok">✓</span>' : `<button class="cta" data-reto="${R.id}" ${st === 'ready' ? '' : 'disabled'}>${TX('Recoger')}</button>`}</div>`;
    }).join('');
    const daily = Halloween.DAILY.map(R => {
      const st = Halloween.dailyState(R), v = Math.min(R.goal, R.val(Halloween.dayData()));
      return `<div class="hwreto ${st}"><div><b>${R.name}</b><small>${R.desc} · ${v}/${R.goal}</small><small>${TX('Premio:')} ${R.reward.candy} 🍬 · ${R.reward.tickets} 🎟️</small></div>
        ${st === 'got' ? '<span class="hwok">✓</span>' : `<button class="cta" data-daily="${R.id}" ${st === 'ready' ? '' : 'disabled'}>${TX('Recoger')}</button>`}</div>`;
    }).join('');
    screen(`${top('🎃 ' + TX('Halloween'))}
      <div class="runbar hwbar"><span>🍬 ${H.candy}</span><span>🎟️ ${Profile.data.tickets}</span><span>${d <= 1 ? TX('¡Último día!') : TX('Quedan') + ' ' + d + ' ' + TX('días')}</span></div>
      <h3>${TX('Premios por entrar')} <small>${TX('5 días del evento (no hace falta que sean seguidos)')}</small></h3>
      <div class="hwlogin">${Halloween.LOGIN.map((R, i) => { const L = Halloween.login(), st = i < L.n ? 'got' : i === L.n && Halloween.loginReady() ? 'ready' : 'locked';
        return `<div class="hwday ${st}"><small>${TX('Día {0}', i + 1)}</small><span>${st === 'got' ? '✓' : R.icon}</span><small>${esc(R.label)}</small></div>`; }).join('')}</div>
      ${Halloween.loginReady() ? `<button class="cta" id="hwLogin">${TX('🎁 Recoger el premio del día {0}', Halloween.login().n + 1)}</button>` : Halloween.login().n < Halloween.LOGIN.length ? `<p class="note">${TX('Vuelve mañana a por el siguiente premio.')}</p>` : ''}
      <h3>${TX('Sobre Calabaza')}</h3>
      <div class="hwlegs" id="hwLegs"></div>
      <p class="note">${TX('Solo jugadores villanos y de miedo, y 6 legendarios exclusivos de Halloween.')}<br>
        ${TX('Legendario 3 % · Épica 15 % · Rara 32 % · Común 50 %. Legendario asegurado a las')} ${HW_PITY} ${TX('tiradas (llevas')} ${H.pity}${TX(').')}</p>
      <div class="grid2"><button class="cta" id="hw1" ${H.candy < HW_PRICE ? 'disabled' : ''}>${TX('Tirar ×1')}<small>${HW_PRICE} 🍬</small></button><button class="cta" id="hw10" ${H.candy < HW_PRICE * 10 ? 'disabled' : ''}>${TX('Tirar ×10')}<small>${HW_PRICE * 10} 🍬</small></button></div>
      <h3>${TX('Partido jefe')}</h3>
      <button class="mode hwmode" id="hwBoss">${Sprites.crest(3)}<span class="mt"><b>${TX('Instituto Ocultismo')}</b><small>${TX('Versión jefe · campo nocturno con niebla')}<br>${Halloween.bossDone() ? TX('Premio de hoy ya cobrado (puedes repetir)') : TX('Gánale: +60 🍬 (una vez al día)')}</small></span></button>
      <h3>${TX('Retos del día')} <small>${TX('se renuevan cada medianoche')}</small></h3>
      <div class="hwretos">${daily}</div>
      <h3>${TX('Retos del evento')}</h3>
      <div class="hwretos">${retos}</div>
      <p class="note">${Halloween.rayUnlocked() ? '<b>' + TX('✓ Ray Dark ya es mánager en el Modo Carrera (+10 % de ingresos).') + '</b>' : TX('Completa los 3 retos y') + ' <b>' + TX('Ray Dark') + '</b> ' + TX('se podrá elegir como mánager en el Modo Carrera, con') + ' <b>' + TX('+10 % de ingresos') + '</b>.'}</p>
      <p class="note">${TX('Caramelos: +5 por partido en cualquier modo (+10 más si ganas), +20 de regalo cada día, +60 al ganar al Ocultismo jefe, los retos del día y los del evento. El evento dura hasta el 3 de noviembre; los jugadores que consigas son tuyos para siempre.')}</p>`, 'bg_title');
    hwDecor();
    legs.forEach(p => { const w = document.createElement('div'); w.className = 'hwleg' + (Profile.data.coll[p.id] ? ' own' : ''); w.appendChild(face(Sprites.refOf(p), 48)); w.insertAdjacentHTML('beforeend', `<small>${esc(p.full.replace(/ \(Halloween\)$/, ''))}</small>`); $('hwLegs').appendChild(w); });
    const go = n => { const res = Halloween.pull(n); if (!res) return UI.toast(TX('No tienes caramelos suficientes')); renderMachine(res, HW_BANNER, renderHalloween, TX('Sobre Calabaza')); };
    $('hw1').onclick = () => go(1); $('hw10').onclick = () => go(10);
    $('hwBoss').onclick = startBoss;
    if ($('hwLogin')) $('hwLogin').onclick = () => {
      const R = Halloween.LOGIN[Halloween.login().n];
      if (R.pick) return renderHwPick();
      const out = Halloween.claimLogin(); if (!out) return;
      Sound.sfx('reveal');
      if (out.players.length) return renderReveal(out.players, renderHalloween, TX('¡Premio del día {0}!', out.day));
      UI.toast(TX('Día {0}:', out.day) + ' ' + R.label, 2400); renderHalloween();
    };
    body.querySelectorAll('[data-daily]').forEach(b => b.onclick = () => {
      const r = Halloween.claimDaily(b.dataset.daily); if (!r) return;
      Sound.sfx('reveal'); renderHalloween(); UI.toast('+' + r.candy + ' 🍬 · +' + r.tickets + ' 🎟️', 2600);
    });
    body.querySelectorAll('[data-reto]').forEach(b => b.onclick = () => {
      const r = Halloween.claim(b.dataset.reto); if (!r) return;
      Sound.sfx('reveal'); renderHalloween();
      UI.toast(r.ray ? TX('¡Ray Dark desbloqueado como mánager!') : '+' + r.reward.candy + ' 🍬 · +' + r.reward.tickets + ' 🎟️', 3200);
    });
    $('back').onclick = renderMenu;
    if (gift) setTimeout(() => UI.toast(TX('🎁 Regalo diario:') + ' +' + gift + ' 🍬', 2400), 300);
    Sound.music('menu');
  }
  // Día 4: eliges 1 de 3 jugadores de +80 (las 3 opciones no cambian aunque salgas)
  function renderHwPick() {
    const ids = Halloween.pickOptions();
    screen(`${top('🎃 ' + TX('Elige a tu jugador'), 'back', TX('Volver'))}
      <p class="note">${TX('Premio del día 4: quédate con uno de estos tres jugadores de media 80 o más.')}</p>
      <div class="hwpick" id="hwPick"></div>`, 'bg_title');
    hwDecor();
    ids.forEach(id => {
      const pd = PLAYER(id), b = document.createElement('button'); b.className = 'hwpk';
      b.appendChild(face(Sprites.refOf(pd), 72));
      b.insertAdjacentHTML('beforeend', `<b>${esc(pd.name)}</b><small>${rchip(pd.rarity)} ${RAB(pd.role)} ${chip(pd.elem)}</small><small>${TX('media')} ${Math.round(Halloween.avgOf(pd))}${Profile.data.coll[id] ? ' · ' + TX('ya lo tienes (+1 ★)') : ''}</small>`);
      b.onclick = () => { const out = Halloween.claimLogin(id); if (!out) return; Sound.sfx('reveal'); renderReveal(out.players, renderHalloween, TX('¡Premio del día {0}!', out.day)); };
      $('hwPick').appendChild(b);
    });
    $('back').onclick = renderHalloween;
  }
  function startBoss() {
    const T = savedTeam(), F = FORMATIONS[T.formation], pos = layout(F.roles), L = T.ids;
    if (L.some(x => x == null)) return UI.toast(TX('Completa tu equipo en Plantilla'));
    api.mode = 'hwboss';
    const A = { name: TX('Tu equipo'), players: L.map((id, i) => {
      const pd = PLAYER(id);
      return Shop.boost(Object.assign(buildMatchPlayer(id, F.roles[i], k => statOf(id, Profile.owned(id), k), runMember(id).techs, [], i, pos[i]), { sprite: mySprite(pd, F.roles[i]) }));
    }) };
    startMatch({ A, B: Halloween.bossTeam() }, false, 'niebla', 'match', 'Occult');
  }
  function renderBossEnd(s, candy, bonus) {
    const a = s.score.A, b = s.score.B;
    screen(`<img class="finimg" src="ui/fin.png" alt="${TX('Fin del partido')}"><h2>${a > b ? TX('¡Has vencido al Ocultismo!') : a < b ? TX('El Ocultismo te ha asustado…') : TX('Empate')}</h2>
      ${scoreLine(s)}
      <p class="note">${candy ? '+' + candy + ' 🍬 ' + TX('por jugar') : ''}${bonus ? '<br><b>+' + bonus + ' 🍬 ' + TX('¡premio del jefe!') + '</b>' : a > b ? '<br>' + TX('El premio del jefe ya lo cobraste hoy.') : ''}</p>
      <button class="cta" id="again">${TX('Volver a Halloween')}</button><button class="ghost" id="toMenu">${TX('Menú')}</button>`, a > b ? 'ill27' : a < b ? 'ill15' : 'ill28');
    $('again').onclick = renderHalloween; $('toMenu').onclick = renderMenu;
  }

  /* =====================================================================
     EVENTO DE NAVIDAD (pantalla propia, fuera de los modos; misma estructura que Halloween)
     ===================================================================== */
  function xmMenuBtn() {
    const H = Navidad.data(), gift = H.daily !== Navidad.today() || Navidad.loginReady(), n = Navidad.pending();
    return `<button class="mode xmmode" id="mXm"><span class="cicon">🎄</span><span class="mt"><b>${TX('Navidad')}${gift || n ? ' <i class="xmdot"></i>' : ''}</b><small>${TX('Sobre Navideño, partido jefe y retos')} · ❄️ ${H.snow}${gift ? ' · ' + TX('🎁 regalo') : ''}</small></span></button>`;
  }
  // Antes del 12 de diciembre: botón apagado con la fecha de apertura y pantalla de aviso
  function xmSoonBtn() {
    return `<button class="mode xmmode xmsoon" id="mXmSoon"><span class="cicon">🎄</span><span class="mt"><b>${TX('Navidad')} <em class="lmnew">${TX('PRÓXIMAMENTE')}</em></b><small>${TX('Gacha de Navidad · se abrirá el 12 de diciembre')}</small></span></button>`;
  }
  function renderNavidadSoon() {
    if (Navidad.active()) return renderNavidad();
    const d = Navidad.daysToStart();
    screen(`${top('🎄 ' + TX('Navidad'))}
      <div class="runbar xmbar"><span>🎁 ${TX('Se abrirá el 12 de diciembre')}</span><span>${TXn(d, 'Falta {0} día', 'Faltan {0} días')}</span></div>
      <h3>${TX('Sobre Navideño')}</h3>
      <div class="xmlegs" id="xmLegs"></div>
      <p class="note">${TX('El gacha de Navidad se abrirá el 12 de diciembre y durará hasta el 6 de enero.')}<br>${TX('Jugadores de nieve y hielo, 6 legendarios exclusivos de Navidad y un legendario súper difícil de conseguir.')}</p>`, 'bg_title');
    xmDecor();
    xmLegsRow(XM_LEGENDS.map(L => PLAYER(L.id)).filter(Boolean));
    $('back').onclick = renderMenu;
  }
  // Fila de legendarios exclusivos de Navidad
  function xmLegsRow(legs) {
    legs.forEach(p => { const w = document.createElement('div'); w.className = 'xmleg' + (Profile.data.coll[p.id] ? ' own' : ''); w.appendChild(face(Sprites.refOf(p), 48)); w.insertAdjacentHTML('beforeend', `<small>${esc(p.full.replace(/ \(Navidad\)$/, ''))}</small>`); $('xmLegs').appendChild(w); });
  }
  // Nieve cayendo y adornos
  function xmDecor() {
    const sc = $('screen'); sc.classList.add('xmtheme');
    const flakes = Array.from({ length: 16 }, (_, i) => `<i class="fl" style="left:${(i * 37 + 8) % 100}%;animation-duration:${9 + (i * 7) % 8}s;animation-delay:-${(i * 5) % 12}s;font-size:${10 + (i * 3) % 9}px">❄</i>`).join('');
    sc.insertAdjacentHTML('afterbegin', `<div class="xmfx" aria-hidden="true">${flakes}<span class="xt x1">🎄</span><span class="xt x2">🎁</span></div>`);
  }
  function renderNavidad() {
    if (!Navidad.active()) return renderMenu();
    const gift = Navidad.daily(), H = Navidad.data(), d = Navidad.daysLeft();
    const legs = XM_LEGENDS.concat([XM_BIANCHI]).map(L => PLAYER(L.id)).filter(Boolean);
    const row = (R, key, st, v) => `<div class="xmreto ${st}"><div><b>${R.name}</b><small>${R.desc} · ${v}/${R.goal}</small><small>${TX('Premio:')} ${R.reward.snow} ❄️ · ${R.reward.tickets} 🎟️</small></div>
        ${st === 'got' ? '<span class="xmok">✓</span>' : `<button class="cta" data-${key}="${R.id}" ${st === 'ready' ? '' : 'disabled'}>${TX('Recoger')}</button>`}</div>`;
    const retos = Navidad.RETOS.map(R => row(R, 'xreto', Navidad.retoState(R), Math.min(R.goal, R.val(H)))).join('');
    const daily = Navidad.DAILY.map(R => row(R, 'xdaily', Navidad.dailyState(R), Math.min(R.goal, R.val(Navidad.dayData())))).join('');
    screen(`${top('🎄 ' + TX('Navidad'))}
      <div class="runbar xmbar"><span>❄️ ${H.snow}</span><span>🎟️ ${Profile.data.tickets}</span><span>${d <= 1 ? TX('¡Último día!') : TX('Quedan') + ' ' + d + ' ' + TX('días')}</span></div>
      <h3>${TX('Premios por entrar')} <small>${TX('5 días del evento (no hace falta que sean seguidos)')}</small></h3>
      <div class="xmlogin">${Navidad.LOGIN.map((R, i) => { const L = Navidad.login(), st = i < L.n ? 'got' : i === L.n && Navidad.loginReady() ? 'ready' : 'locked';
        return `<div class="xmday ${st}"><small>${TX('Día {0}', i + 1)}</small><span>${st === 'got' ? '✓' : R.icon}</span><small>${esc(R.label)}</small></div>`; }).join('')}</div>
      ${Navidad.loginReady() ? `<button class="cta" id="xmLogin">${TX('🎁 Recoger el premio del día {0}', Navidad.login().n + 1)}</button>` : Navidad.login().n < Navidad.LOGIN.length ? `<p class="note">${TX('Vuelve mañana a por el siguiente premio.')}</p>` : ''}
      <h3>${TX('Sobre Navideño')}</h3>
      <div class="xmlegs" id="xmLegs"></div>
      <p class="note">${TX('Jugadores de nieve y hielo, 6 legendarios exclusivos de Navidad y un legendario súper difícil de conseguir.')}<br>
        ${TX('Legendario 3 % · Épica 15 % · Rara 32 % · Común 50 %. Legendario asegurado a las')} ${XM_PITY} ${TX('tiradas (llevas')} ${H.pity}${TX(').')}<br>
        ${TX('Bianchi Christmas (nota 105): solo {0} % por tirada, aparte de las demás. Asegurado a las {1} tiradas sin él (llevas {2}).', String(XM_BIANCHI_RATE).replace('.', I18N.en() ? '.' : ','), XM_BIANCHI_PITY, H.bpity)}</p>
      <div class="grid2"><button class="cta" id="xm1" ${H.snow < XM_PRICE ? 'disabled' : ''}>${TX('Tirar ×1')}<small>${XM_PRICE} ❄️</small></button><button class="cta" id="xm10" ${H.snow < XM_PRICE * 10 ? 'disabled' : ''}>${TX('Tirar ×10')}<small>${XM_PRICE * 10} ❄️</small></button></div>
      <h3>${TX('Partido jefe')}</h3>
      <button class="mode xmmode" id="xmBoss">${Sprites.crest(36)}<span class="mt"><b>${TX('Alpino')}</b><small>${TX('Versión jefe · campo nevado')}<br>${Navidad.bossDone() ? TX('Premio de hoy ya cobrado (puedes repetir)') : TX('Gánale: +60 ❄️ (una vez al día)')}</small></span></button>
      <h3>${TX('Retos del día')} <small>${TX('se renuevan cada medianoche')}</small></h3>
      <div class="xmretos">${daily}</div>
      <h3>${TX('Retos del evento')}</h3>
      <div class="xmretos">${retos}</div>
      <p class="note">${Navidad.giftUnlocked() ? '<b>' + TX('✓ Ya has recibido a Shawn Froste de Navidad.') + '</b>' : TX('Completa los 3 retos y recibirás de regalo a') + ' <b>' + TX('Shawn Froste de Navidad') + '</b>.'}</p>
      <p class="note">${TX('Copos: +5 por partido en cualquier modo (+10 más si ganas), +20 de regalo cada día, +60 al ganar al Alpino jefe, los retos del día y los del evento. El evento dura hasta el 6 de enero; los jugadores que consigas son tuyos para siempre.')}</p>`, 'bg_title');
    xmDecor();
    xmLegsRow(legs);
    const go = n => { const res = Navidad.pull(n); if (!res) return UI.toast(TX('No tienes copos suficientes')); renderMachine(res, XM_BANNER, renderNavidad, TX('Sobre Navideño')); };
    $('xm1').onclick = () => go(1); $('xm10').onclick = () => go(10);
    $('xmBoss').onclick = startXmBoss;
    if ($('xmLogin')) $('xmLogin').onclick = () => {
      const R = Navidad.LOGIN[Navidad.login().n];
      if (R.pick) return renderXmPick();
      const out = Navidad.claimLogin(); if (!out) return;
      Sound.sfx('reveal');
      if (out.players.length) return renderReveal(out.players, renderNavidad, TX('¡Premio del día {0}!', out.day));
      UI.toast(TX('Día {0}:', out.day) + ' ' + R.label, 2400); renderNavidad();
    };
    body.querySelectorAll('[data-xdaily]').forEach(b => b.onclick = () => {
      const r = Navidad.claimDaily(b.dataset.xdaily); if (!r) return;
      Sound.sfx('reveal'); renderNavidad(); UI.toast('+' + r.snow + ' ❄️ · +' + r.tickets + ' 🎟️', 2600);
    });
    body.querySelectorAll('[data-xreto]').forEach(b => b.onclick = () => {
      const r = Navidad.claim(b.dataset.xreto); if (!r) return;
      Sound.sfx('reveal');
      if (r.gift) return renderReveal([r.gift], renderNavidad, TX('¡Regalo de Navidad!'));
      renderNavidad(); UI.toast('+' + r.reward.snow + ' ❄️ · +' + r.reward.tickets + ' 🎟️', 3200);
    });
    $('back').onclick = renderMenu;
    if (gift) setTimeout(() => UI.toast(TX('🎁 Regalo diario:') + ' +' + gift + ' ❄️', 2400), 300);
    Sound.music('menu');
  }
  // Día 4: eliges 1 de 3 jugadores de +80 (las 3 opciones no cambian aunque salgas)
  function renderXmPick() {
    const ids = Navidad.pickOptions();
    screen(`${top('🎄 ' + TX('Elige a tu jugador'), 'back', TX('Volver'))}
      <p class="note">${TX('Premio del día 4: quédate con uno de estos tres jugadores de media 80 o más.')}</p>
      <div class="xmpick" id="xmPick"></div>`, 'bg_title');
    xmDecor();
    ids.forEach(id => {
      const pd = PLAYER(id), b = document.createElement('button'); b.className = 'xmpk';
      b.appendChild(face(Sprites.refOf(pd), 72));
      b.insertAdjacentHTML('beforeend', `<b>${esc(pd.name)}</b><small>${rchip(pd.rarity)} ${RAB(pd.role)} ${chip(pd.elem)}</small><small>${TX('media')} ${Math.round(Navidad.avgOf(pd))}${Profile.data.coll[id] ? ' · ' + TX('ya lo tienes (+1 ★)') : ''}</small>`);
      b.onclick = () => { const out = Navidad.claimLogin(id); if (!out) return; Sound.sfx('reveal'); renderReveal(out.players, renderNavidad, TX('¡Premio del día {0}!', out.day)); };
      $('xmPick').appendChild(b);
    });
    $('back').onclick = renderNavidad;
  }
  function startXmBoss() {
    const T = savedTeam(), F = FORMATIONS[T.formation], pos = layout(F.roles), L = T.ids;
    if (L.some(x => x == null)) return UI.toast(TX('Completa tu equipo en Plantilla'));
    api.mode = 'xmboss';
    const A = { name: TX('Tu equipo'), players: L.map((id, i) => {
      const pd = PLAYER(id);
      return Object.assign(buildMatchPlayer(id, F.roles[i], k => statOf(id, Profile.owned(id), k), runMember(id).techs, [], i, pos[i]), { sprite: mySprite(pd, F.roles[i]) });
    }) };
    startMatch({ A, B: Navidad.bossTeam() }, false, 'nieve', 'match', XM_BOSS_TEAM);
  }
  function renderXmBossEnd(s, snow, bonus) {
    const a = s.score.A, b = s.score.B;
    screen(`<img class="finimg" src="ui/fin.png" alt="${TX('Fin del partido')}"><h2>${a > b ? TX('¡Has vencido al Alpino!') : a < b ? TX('El Alpino te ha congelado…') : TX('Empate')}</h2>
      ${scoreLine(s)}
      <p class="note">${snow ? '+' + snow + ' ❄️ ' + TX('por jugar') : ''}${bonus ? '<br><b>+' + bonus + ' ❄️ ' + TX('¡premio del jefe!') + '</b>' : a > b ? '<br>' + TX('El premio del jefe ya lo cobraste hoy.') : ''}</p>
      <button class="cta" id="again">${TX('Volver a Navidad')}</button><button class="ghost" id="toMenu">${TX('Menú')}</button>`, a > b ? 'ill27' : a < b ? 'ill15' : 'ill28');
    $('again').onclick = renderNavidad; $('toMenu').onclick = renderMenu;
  }

  /* =====================================================================
     GACHA LIMITADO «TORMENTA CELESTIAL» (pantalla propia) y AVISO DE JUGADORES NUEVOS
     ===================================================================== */
  // Rayos animados (amarillos y azules) para el gacha limitado
  function lmBolts() {
    const P = ['M12 0 L22 30 L10 40 L26 70 L16 80 L30 100', 'M88 0 L76 26 L90 38 L70 66 L82 78 L64 100', 'M50 0 L44 22 L58 36 L40 62 L52 74 L42 100',
      'M0 40 L24 46 L18 56 L44 62', 'M100 55 L76 60 L84 70 L58 76', 'M30 100 L40 80 L34 74 L52 56'];
    return `<svg class="lmbolts" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${P.map((d, i) => `<path class="lb lb${i % 2}" style="animation-delay:${(i * 0.37).toFixed(2)}s" d="${d}"/>`).join('')}</svg>`;
  }
  // Destello de rayos a pantalla completa al salir un jugador limitado
  function lmBoom() { const d = document.createElement('div'); d.className = 'lmboom'; d.innerHTML = lmBolts() + lmBolts(); document.body.appendChild(d); setTimeout(() => d.remove(), 1500); }
  function lmMenuBtn() {
    const H = Limitado.data();
    return `<button class="mode lmmode" id="mLm"><span class="limbg"></span>${lmBolts()}<span class="mt"><b>⚡ ${TX('Tormenta Celestial')} <em class="lmnew">${TX('LIMITADO')}</em></b><small>${TX('Gacha limitado · 50 🎟️ = 10 jugadores')}${H.pity ? ' · ' + H.pity + '/' + LM_PITY : ''}</small></span></button>`;
  }
  function renderLimitado() {
    const H = Limitado.data(), P = Profile.data;
    const pct = n => { const t = String(+n.toFixed(2)); return (I18N.en() ? t : t.replace('.', ',')) + ' %'; };
    screen(`${top('⚡ ' + TX('Gacha limitado'))}${wallet()}
      <div class="lmhero"><img src="ui/tormenta.jpg" alt="${TX('Tormenta Celestial')}">${lmBolts()}<span class="lmtag">${TX('LIMITADO')}</span>
        <div class="lmname"><b>${TX('Tormenta Celestial')}</b><small>${TX('4 jugadores limitados · nota 100')}</small></div></div>
      <h3>${TX('Jugadores limitados')}</h3>
      <div class="lmfeat" id="lmFeat"></div>
      <h3>${TX('Probabilidades')}</h3>
      <div class="lmrates">${LM_RATES.map(([t, w]) => `<div class="${t}">${rchip(t)}<b>${pct(w)}</b></div>`).join('')}</div>
      <p class="note">${TX('Cada jugador limitado sale con solo {0} de probabilidad. Uno de los 4 está asegurado a las {1} tiradas sin ninguno (llevas {2}).', pct(LM_RATES[0][1] / Limitado.featured().length), LM_PITY, H.pity)}<br>
        ${TX('Los repetidos suben una estrella (máx.')} ${MAX_STARS}${TX('); con 5 estrellas dan monedas.')}</p>
      <h3>${TX('Jugadores del sobre')}</h3>
      <div class="lmlist" id="lmList"></div>
      ${bottom(`<button class="cta lmgo" id="lm10" ${P.tickets < LM_PRICE ? 'disabled' : ''}>${TX('Tirar ×10')}<small>${LM_PRICE} 🎟️ · ${TX('10 jugadores')}</small></button>`)}`, 'bg_title');
    Limitado.featured().forEach(id => {   // los 4 limitados: retrato, puesto, elemento, nota y su supertécnica
      const pd = PLAYER(id), t = TECH(signatureTech(pd)), w = document.createElement('div');
      w.className = 'lmf' + (P.coll[id] ? ' own' : '');
      w.appendChild(face(Sprites.refOf(pd), 48));
      w.insertAdjacentHTML('beforeend', `<span class="lmft"><b>${esc(pd.name)}</b><small>${TX('Nota')} ${Math.round(Limitado.avgOf(pd))} · ${RAB(pd.role)} · ${ELEM_LABEL[pd.elem]}</small><small class="lmfs">${t ? esc(t.name) : ''}</small></span>`);
      $('lmFeat').appendChild(w);
    });
    Limitado.ids().forEach(id => {
      const pd = PLAYER(id), w = document.createElement('div');
      w.className = 'lmp ' + pd.rarity + (P.coll[id] ? ' own' : '');
      w.appendChild(face(Sprites.refOf(pd), 48));
      w.insertAdjacentHTML('beforeend', `<small>${esc(pd.name)}</small>${rchip(pd.rarity)}<em class="lmpc">${pct(Limitado.chanceOf(id))}</em>`);
      $('lmList').appendChild(w);
    });
    $('lm10').onclick = () => {
      const res = Limitado.pull(); if (!res) return UI.toast(TX('No tienes tickets suficientes'));
      renderMachine(res, LM_BANNER, renderLimitado, TX('Tormenta Celestial'));
    };
    $('back').onclick = renderGacha;
    Sound.music('menu');
  }
  // Aviso al abrir el juego cuando hay un jugador nuevo (NEW_PLAYERS en src/limited.js): una vez por dispositivo
  function showNewPlayers(list, i, after) {
    const n = list[i]; if (!n) { if (after) after(); return; }
    const pd = PLAYER(n.id); if (!pd) return showNewPlayers(list, i + 1, after);
    settings.seenPlayers = (settings.seenPlayers || []).concat(n.id); saveSettings();
    const ov = document.createElement('div'); ov.className = 'npov' + (pd.lim ? ' lim' : '');
    const techs = startingTechs(pd).map(TECH).filter(Boolean);
    ov.innerHTML = `<div class="npbox">${lmBolts()}<small class="npk">${TX('¡NUEVO JUGADOR!')}</small><div class="npface"></div><h2>${esc(pd.name)}</h2>
      <div class="gmeta">${rchip(pd.rarity)}<span>${RAB(pd.role)}</span>${chip(pd.elem)}</div>
      <b class="npavg">${TX('Nota')} ${Math.round(Limitado.avgOf(pd))}</b>
      <div class="nptechs">${techs.map(t => `<span>${esc(t.name)}</span>`).join('')}</div>
      <button class="cta" id="npGo">${pd.lim ? TX('Ver el gacha limitado') : TX('Ir al gacha')}</button><button class="ghost" id="npX">${TX('Cerrar')}</button></div>`;
    document.body.appendChild(ov);
    ov.querySelector('.npface').appendChild(face(Sprites.refOf(pd), 112));
    Sound.sfx('reveal'); if (pd.lim) lmBoom();
    $('npGo').onclick = () => { ov.remove(); pd.lim ? renderLimitado() : renderGacha(); };
    $('npX').onclick = () => { ov.remove(); showNewPlayers(list, i + 1, after); };
  }

  /* ---------- Plantilla, entrenamiento y Rayos ---------- */
  const RORDER = { limitada: -1, legendaria: 0, epica: 1, rara: 2, comun: 3 };
  function sortedIds(filter) {
    return Profile.ids().filter(id => !filter || PLAYER(id).role === filter)
      .sort((a, b) => RORDER[PLAYER(a).rarity] - RORDER[PLAYER(b).rarity] || Profile.owned(b).stars - Profile.owned(a).stars || PLAYER(a).name.localeCompare(PLAYER(b).name));
  }
  function miniCard(id, extra = '') {
    const pd = PLAYER(id), o = Profile.owned(id);
    const el = document.createElement('button'); el.className = 'pcard ' + pd.rarity + hwc(pd);
    el.appendChild(face(Sprites.refOf(pd), 56));
    el.insertAdjacentHTML('beforeend', `<div class="pinfo"><div class="pname">${esc(pd.name)}</div>
      <div class="pmeta">${rchip(pd.rarity)} ${ROLE_LABEL[pd.role]} ${chip(pd.elem)} ${o ? stars(o.stars) : ''}</div>${extra}</div>`);
    return el;
  }
  // Ficha pequeña para cuadrículas (plantilla y elegir jugador)
  function tile(id, extra = '') {
    const pd = PLAYER(id), o = Profile.owned(id);
    const el = document.createElement('button'); el.className = 'ptile ' + pd.rarity + hwc(pd);
    el.appendChild(face(Sprites.refOf(pd), 64));
    el.insertAdjacentHTML('beforeend', `<span class="tn">${esc(pd.name)}</span><span class="tm">${rchip(pd.rarity)}<i>${RAB(pd.role)}</i></span>${o ? stars(o.stars) : ''}${extra}`);
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
    return `<div class="pfbar"><div class="pfq"><input id="pfQ" type="search" placeholder="${TX('Buscar por nombre o mote…')}" value="${esc(PF.q)}" autocomplete="off"><button class="ghost" id="pfX" ${pfActive() ? '' : 'hidden'} title="${TX('Quitar filtros')}">✕</button></div>
      <div class="pfsel"><select id="pfR" aria-label="${TX('Rareza')}">${opt('', TX('Rareza'), PF.rar)}${['limitada', 'legendaria', 'epica', 'rara', 'comun'].map(r => opt(r, RARITY[r].label, PF.rar)).join('')}</select>
      <select id="pfE" aria-label="${TX('Elemento')}">${opt('', TX('Elemento'), PF.elem)}${['fuego', 'bosque', 'viento', 'montaña'].map(e => opt(e, ELEM_LABEL[e], PF.elem)).join('')}</select>
      <select id="pfG" aria-label="${TX('Juego')}">${opt('', TX('Juego'), PF.game)}${opt('1', TX('Inazuma 1'), PF.game)}${opt('2', TX('Inazuma 2'), PF.game)}${opt('3', TX('Inazuma 3'), PF.game)}</select></div></div>`;
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
      b.className = 'pslot' + (i === sel ? ' sel' : '') + (it ? ' ' + (it.rarity || '') + hwc(it) : ' empty');
      b.style.left = (50 + pos[i].home[0] / 17 * 44) + '%';
      b.style.top = (85 - pos[i].home[1] / 31 * 71) + '%';
      const fc = document.createElement('span'); fc.className = 'pf';
      if (it) fc.appendChild(face(it.ref, 46)); else fc.textContent = '+';
      b.appendChild(fc);
      b.insertAdjacentHTML('beforeend', `<span class="pr">${RAB(r)}${it && it.badge != null ? ' · ' + it.badge : ''}</span><span class="pn">${it ? esc(firstName(it.name)) : TX('Elegir')}</span>${it && it.elem ? `<span class="pe">${chip(it.elem)}</span>` : ''}`);
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
      <div class="edbar"><button class="ghost" id="edAuto">${TX('⚡ Mejor equipo')}</button><span class="note">${avg != null ? TX('Media del equipo:') + ' <b>' + avg + '</b>' : TX('Faltan jugadores')}</span></div>
      <div id="edPitch"></div>
      <h3>${TX('Puesto:')} ${ROLE_LABEL[role]} <small>${TX('toca un jugador para ponerlo; toca otro puesto del campo para cambiarlo')}</small></h3>
      ${pfBar()}<div class="opts small" id="edShow"><button data-v="pos" aria-pressed="${t.show === 'pos'}">${TX('De')} ${ROLE_LABEL[role].toLowerCase()}</button><button data-v="all" aria-pressed="${t.show === 'all'}">${TX('Todos')}</button></div>
      <div class="pgrid" id="edList"></div>`;
    const redraw = () => { onChange && onChange(); teamEditor(box, t, onChange); };
    box.querySelector('#edPitch').appendChild(pitch(roles, t.ids.map((id, i) => id == null ? null :
      { ref: Sprites.refOf(PLAYER(id)), name: PLAYER(id).name, rarity: PLAYER(id).rarity, halloween: PLAYER(id).halloween, xmas: PLAYER(id).xmas, selva: PLAYER(id).selva, leyenda: PLAYER(id).leyenda, inf: PLAYER(id).inf, elem: PLAYER(id).elem, badge: rate(id, roles[i]) }), t.sel, i => { t.sel = i; Sound.sfx('click'); teamEditor(box, t, onChange); }));
    box.querySelector('#formSel').onchange = e => {   // al cambiar de formación se recolocan los mismos 5
      t.formation = e.target.value; const keep = t.ids.filter(x => x != null);
      t.ids = bestFor(FORMATIONS[t.formation].roles, keep.length === 5 ? keep : Profile.ids().filter(id => !t.ban || !t.ban(id))); t.sel = 0; redraw();
    };
    box.querySelector('#edAuto').onclick = () => { t.ids = t.ban ? bestFor(roles, Profile.ids().filter(id => !t.ban(id))) : autoLineup(t.formation); Sound.sfx('reveal'); redraw(); };
    box.querySelectorAll('#edShow button').forEach(b => b.onclick = () => { t.show = b.dataset.v; teamEditor(box, t, onChange); });
    let pool = Profile.ids().filter(id => !t.ban || !t.ban(id));
    if (t.show === 'pos' || role === 'POR') pool = pool.filter(id => playsAs(PLAYER(id), role));   // a portería solo van porteros
    pool.sort((a, b) => rate(b, role) - rate(a, role));
    const list = box.querySelector('#edList');
    const drawList = () => {
    const ids = pool.filter(pfMatch); list.innerHTML = '';
    if (!ids.length) list.innerHTML = pool.length ? '<p class="note">' + TX('Ningún jugador coincide con la búsqueda.') + '</p>' : '<p class="note">' + TX('No tienes jugadores de este puesto. Toca «Todos».') + '</p>';
    ids.forEach(id => {
      const at = t.ids.indexOf(id);
      const c = tile(id, `<span class="slot">${at >= 0 ? TX('En el equipo · ') + RAB(roles[at]) : TX('Nota ') + rate(id, role)} ${chip(PLAYER(id).elem)}</span>`);
      if (at >= 0) c.classList.add('sel');
      c.onclick = () => {
        if (at >= 0 && roles[at] === 'POR' && t.ids[t.sel] != null && !playsAs(PLAYER(t.ids[t.sel]), 'POR')) return UI.toast(TX('Así la portería se quedaría sin portero'));
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
    const tabs = `<div class="opts" id="tt"><button data-t="equipo" aria-pressed="${teamTab === 'equipo'}">${TX('Mi equipo')}</button><button data-t="jug" aria-pressed="${teamTab === 'jug'}">${TX('Jugadores (')}${Profile.ids().length})</button><button data-t="tec" aria-pressed="${teamTab === 'tec'}">${TX('Técnicas (')}${myTechs.length})</button></div>`;
    if (teamTab === 'tec') {
      screen(`${top(TX('Plantilla'))}${tabs}<p class="note">${TX('Técnicas legendarias que has sacado en el gacha. Las puede equipar cualquier jugador de su elemento desde su ficha.')}</p><div class="cards" id="tk"></div>`);
      if (!myTechs.length) $('tk').innerHTML = '<p class="note">' + TX('Aún no tienes ninguna. Salen en el tramo legendario del gacha.') + '</p>';
      myTechs.forEach(tid => {
        const t = TECH(tid), who = Profile.ids().filter(id => Profile.learnable(id).gacha.includes(tid));
        const c = document.createElement('div'); c.className = 'pcard techrow ' + EL(t.elem).css;
        c.innerHTML = `<div class="scroll small">${TYPE_ICON[t.type] || '★'}</div><div class="pinfo">${techLineMy(t)}<div class="pmeta">${who.length ? who.length + TX(' de tus jugadores pueden equiparla') : TX('Ninguno de tus jugadores es de ') + (ELEM_LABEL[t.elem] || t.elem)}</div></div>`;
        $('tk').appendChild(c);
      });
    } else if (teamTab === 'equipo') {
      screen(`${top(TX('Plantilla'))}${tabs}<p class="note">${TX('Este es el equipo que sale en el partido rápido y al empezar cualquier modo. Se guarda solo.')}</p>
        <h3>${TX('Equipación')} <small>${TX('la llevan tus jugadores de campo en todos los modos (menos en la Carrera)')}</small></h3><div id="kitEd"></div><div id="ed"></div>`);
      if (!api.myTeam) api.myTeam = savedTeam();
      const drawKits = () => {
        const k = myKit(), sw = (key, v) => `<div class="swatches">${Shop.kitColors().map(col => `<button class="sw" data-k="${key}" data-c="${col}" style="background:${col}" aria-pressed="${v === col}"></button>`).join('')}</div>`;
        const who = PLAYER((api.myTeam.ids || []).find(id => id != null && PLAYER(id).role !== 'POR') || 10);
        $('kitEd').innerHTML = `<div class="clubpv"><span id="kitPv"></span><div><b>${k ? TX('Tu equipación') : TX('Equipación del Raimon')}</b><small>${k ? '' : TX('Elige colores para crear la tuya')}</small></div></div>
          <p class="note">${TX('Camiseta')}</p>${sw('a', k && k.a)}<p class="note">${TX('Mangas y pantalón')}</p>${sw('b', k && k.b)}
          <p class="note">${TX('Diseño')}</p><div class="opts kitdz">${Shop.kitDesigns().map(([d, n]) => `<button data-dz="${d}" aria-pressed="${!!k && (k.d || '') === d}">${n}</button>`).join('')}</div>
          ${k ? `<button class="ghost mini" id="kitReset">${TX('Volver a la del Raimon')}</button>` : ''}`;
        $('kitPv').appendChild(k ? Sprites.kitPreview(Sprites.refOf(who), k, 2) : Sprites.portrait(Sprites.refOf(who), 2));
        const set = ch => { Profile.data.kit = Object.assign({ a: '#e8c21a', b: '#1f4fc0', d: '' }, myKit() || {}, ch); Profile.save(); Sound.sfx('click'); drawKits(); };
        $('kitEd').querySelectorAll('.sw').forEach(b => b.onclick = () => set({ [b.dataset.k]: b.dataset.c }));
        $('kitEd').querySelectorAll('[data-dz]').forEach(b => b.onclick = () => set({ d: b.dataset.dz }));
        if ($('kitReset')) $('kitReset').onclick = () => { Profile.data.kit = null; Profile.save(); Sound.sfx('click'); drawKits(); };
      };
      drawKits();
      teamEditor($('ed'), api.myTeam, () => saveTeam(api.myTeam));
    } else {
      const all = sortedIds(teamFilter); if (SORTS[teamSort]) all.sort(SORTS[teamSort]);
      screen(`${top(TX('Plantilla'))}${tabs}${wallet()}${pfBar()}
        <div class="opts" id="tf">${[['', TX('Todos')], ...ROLES4.map(r => [r, RAB(r)])].map(([v, t]) => `<button data-f="${v}" aria-pressed="${teamFilter === v}">${t}</button>`).join('')}</div>
        <div class="sortrow"><span id="tcount"></span><span class="opts small" id="ts">${Object.keys(SORTS).map(k => `<button data-s="${k}" aria-pressed="${teamSort === k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</span></div>
        <div class="pgrid" id="tl"></div>`);
      body.querySelectorAll('#tf button').forEach(b => b.onclick = () => { teamFilter = b.dataset.f; renderTeam(); });
      body.querySelectorAll('#ts button').forEach(b => b.onclick = () => { teamSort = b.dataset.s; renderTeam(); });
      const drawList = () => {
        const ids = all.filter(pfMatch), tl = $('tl'); tl.innerHTML = '';
        $('tcount').textContent = (pfActive() ? ids.length + TX(' de ') + all.length : ids.length) + TX(' jugadores · toca uno para entrenarlo');
        if (!ids.length) tl.innerHTML = '<p class="note">' + TX('Ningún jugador coincide. Prueba con otro nombre o quita filtros (✕).') + '</p>';
        ids.forEach(id => { const pd = PLAYER(id), c = tile(id, `<span class="slot">${TX('Nota ')}${rate(id, pd.role)} ${chip(pd.elem)}</span>`); c.onclick = () => renderPlayer(id); tl.appendChild(c); });
      };
      pfWire(body, drawList, renderTeam); drawList();
    }
    body.querySelectorAll('#tt button').forEach(b => b.onclick = () => { teamTab = b.dataset.t; renderTeam(); });
    tutorial('team'); if (!$('tutq-team')) body.insertAdjacentHTML('beforeend', `<p class="note" id="tutq-team">${tutBtn('team')}</p>`);
    $('back').onclick = renderMenu;
  }
  function renderPlayer(id) {
    const pd = PLAYER(id), o = Profile.owned(id), P = Profile.data;
    screen(`${top(esc(pd.name))}<div class="phead" id="ph"></div>${wallet()}
      <button class="cta" id="rayo" ${P.rayos < 1 || o.stars >= MAX_STARS || pd.leyenda ? 'disabled' : ''}>${TX('⚡ Usar Rayo Raimon')}<small>${pd.leyenda ? TX('Solo sube repitiendo la Cadena Leyenda') : o.stars >= MAX_STARS ? TX('Ya tiene 5 estrellas') : TX('+1 estrella sin necesitar repetidos (tienes ') + P.rayos + ')'}</small></button>
      <h3>${TX('Entrenar')} <small>${TX('+3 por mejora; el límite sube con las estrellas')}</small></h3><div class="ups" id="ups"></div>
      <h3>${TX('Técnicas equipadas')} <small>${TX('las')} ${TECH_SLOTS} ${TX('con las que empieza cada partida · toca un hueco y elige')}</small></h3>
      <div class="eqslots" id="eqs"></div>
      <h3>${TX('Puede aprender')}</h3><div class="eqlist" id="eql"></div>
      <p class="note">${TX('Puede equipar sus propias técnicas y las técnicas legendarias del gacha de su elemento (')}${ELEM_LABEL[pd.elem] || pd.elem}).</p>`);
    const eq = Profile.equipOf(id), L = Profile.learnable(id);
    api.eqSlot = Math.min(api.eqSlot || 0, TECH_SLOTS - 1);
    for (let k = 0; k < TECH_SLOTS; k++) {
      const t = eq[k] != null ? TECH(eq[k]) : null, b = document.createElement('button');
      b.className = 'eqslot' + (k === api.eqSlot ? ' sel' : '');
      b.innerHTML = `<i>${TX('Hueco')} ${k + 1}</i>${t ? techLineMy(t) : '<span class="tline">' + TX('Vacío') + '</span>'}`;
      b.onclick = () => { api.eqSlot = k; renderPlayer(id); };
      $('eqs').appendChild(b);
    }
    const addOpt = (tid, src) => {
      const t = TECH(tid), on = eq.includes(tid), b = document.createElement('button');
      b.className = 'eqopt' + (on ? ' on' : '') + (src === 'gacha' ? ' leg' : '');
      b.innerHTML = `${techLineMy(t)}<i>${on ? TX('Equipada') : src === 'gacha' ? TX('Del gacha') : TX('Suya')}${EVO(tid) != null ? TX(' · evoluciona a ') + esc(TECH(EVO(tid)).name) : ''}</i>`;
      b.onclick = () => { Profile.setEquip(id, api.eqSlot, tid); Sound.sfx('click'); api.eqSlot = (api.eqSlot + 1) % TECH_SLOTS; renderPlayer(id); };
      $('eql').appendChild(b);
    };
    L.gacha.forEach(t => addOpt(t, 'gacha')); L.own.forEach(t => addOpt(t, 'own'));
    if (!L.own.length && !L.gacha.length) $('eql').innerHTML = '<p class="note">' + TX('No tiene técnicas que aprender.') + '</p>';
    const ph = $('ph'); ph.appendChild(face(Sprites.refOf(pd), 112));
    ph.insertAdjacentHTML('beforeend', `<div><div class="pname">${esc(pd.name)}</div>${pd.full !== pd.name ? `<div class="pfull">${esc(pd.full)}</div>` : ''}${pd.also ? `<div class="pfull">${TX('También:')} ${pd.also.map(esc).join(' · ')}</div>` : ''}<div class="pmeta">${rchip(pd.rarity)} ${pd.anyRole ? TX('Todos los puestos') : ROLE_LABEL[pd.role]} ${chip(pd.elem)} ${stars(o.stars)}</div></div>`);
    STAT_KEYS.forEach(k => {
      const b = document.createElement('button'), can = Profile.canUpgrade(id, k), cost = Profile.upgradeCost(id, k);
      b.innerHTML = `${STAT_LABEL[k]} <b>${statOf(id, o, k)}</b><small>${can ? '+3 · ' + cost + '🪙' : TX('máx. ') + statCap(id, o, k)}</small>`;
      b.disabled = !can || P.coins < cost;
      b.onclick = () => { if (Profile.upgrade(id, k)) { Sound.sfx('click'); renderPlayer(id); } };
      $('ups').appendChild(b);
    });
    $('rayo').onclick = () => { if (Profile.useRayo(id)) { Sound.sfx('reveal'); UI.toast(pd.name + TX(' sube a ') + Profile.owned(id).stars + TX(' estrellas')); renderPlayer(id); } };
    $('back').onclick = () => renderTeam();
  }

  /* ---------- Antes de empezar un modo: tu equipo y la dificultad ---------- */
  function newDraft(kind, o) {
    const t = savedTeam();
    api.draft = { kind, o, formation: t.formation, diff: o.diff || 'medio', ids: t.ids };
    if (kind === 'leyenda' && lyRepeat()) { api.draft.ban = lyBanned; api.draft.ids = t.ids.map(id => id != null && lyBanned(id) ? null : id); }   // sin legendarios
    renderDraft();
  }
  const KIND_TITLE = { story: TX('Historia'), special: TX('Equipo especial'), chain: TX('Cadena'), infinite: TX('Infinito'), leyenda: TX('Cadena Leyenda') };
  function renderDraft() {
    const d = api.draft;
    const sub = d.kind === 'special' ? esc(d.o.team) : d.kind === 'chain' ? esc(CHAINS.find(c => c.key === d.o.chain).name) : '';
    screen(`${top(KIND_TITLE[d.kind] + (d.kind === 'story' ? ' · ' + STAGE_NAME[d.o.stage || 's1'] : '') + (sub ? ' · ' + sub : ''))}
      ${d.kind === 'story' ? opts(TX('Dificultad'), 'diff', [['facil', TX('Fácil')], ['medio', TX('Medio')], ['dificil', TX('Difícil')]], d) +
        '<p class="note">' + TX('Fácil: 5 partidos y 3 vidas · Medio: 6 y 2 · Difícil: 7 y 1.') + '</p>' : ''}
      ${d.kind === 'infinite' ? '<p class="note">' + TX('Rivales cada vez más fuertes y 2 vidas. Cada 5 partidos, una oleada especial con premio extra.') + '</p>' : ''}
      ${d.kind === 'leyenda' ? '<p class="note">' + (lyRepeat() ? TX('15 partidos contra los mejores equipos. Una derrota y vuelves a empezar. Al repetirla: sin legendarios y sin las mejoras de la tienda.') : TX('15 partidos contra los mejores equipos. Una derrota y vuelves a empezar. Sin las mejoras de la tienda.')) + '</p>' : ''}
      <div id="ed"></div>
      <p class="note">${TX('Las técnicas, habilidades y fichajes se pierden al acabar; monedas, tickets y Rayos se quedan.')}</p>
      ${bottom(`<button class="cta" id="go">${TX('Empezar')}</button>`)}`);
    bindOpts(d);
    const go = $('go'), sync = () => { go.disabled = d.ids.some(x => x == null || (d.ban && d.ban(x))); if (!d.ban) saveTeam(d); api.myTeam = null; };
    teamEditor($('ed'), d, sync); sync();
    go.onclick = () => {
      if (d.ids.some(x => x == null || (d.ban && d.ban(x)))) return;
      api.run = Run.create(d.kind, d.ids, Object.assign({}, d.o, { diff: d.diff, formation: d.formation }));
      Run.save(api.run); api.pick = null; openRun();
    };
    $('back').onclick = d.kind === 'leyenda' ? renderLeyenda : renderMenu;
  }

  /* ---------- Partidos ---------- */
  async function startMatch(teams, golden, field, musicRole, rival) {
    GAME_SPEED = settings.dev && settings.speed ? +settings.speed : 0.75;
    const hasPad = [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(Boolean);
    if (Controls.pc() && !hasPad && (settings.padTip || 0) < 3) { settings.padTip = (settings.padTip || 0) + 1; saveSettings(); setTimeout(() => UI.toast(TX('🎮 También puedes jugar con mando'), 2600), 1800); }
    const s = Object.assign({}, settings, { golden, field, difficulty: api.mode === 'run' ? Run.diffOf(api.run) : api.mode === 'career' || api.mode === 'wc' ? Career.matchDiff() : api.mode === 'pcareer' || api.mode === 'pduel' ? PC.matchDiff() : api.mode === 'pwc' ? 'dificil' : 'facil' });
    const MO = api.matchOpts; api.matchOpts = null;
    if (MO && MO.lockId) Object.assign(s, { lockId: MO.lockId, autoSwitch: 0 });
    if (MO && MO.extra) Object.assign(s, MO.extra);   // minicampo, límite de goles, amigos que te pasan…
    s.mercy = api.mode === 'run' ? 5 : 0;   // roguelite: con 5 goles de diferencia se acaba el partido
    screen('<h2>' + TX('Cargando…') + '</h2>');
    try {
      api.matchSheet = await Sprites.matchSheet([...teams.A.players, ...teams.B.players].map(p => p.sprite));
    } catch (e) { screen(`<h2>${TX('No se pudieron cargar los jugadores')}</h2><p class="note">${esc(e.message)}</p><button class="cta" id="back">${TX('Volver')}</button>`); $('back').onclick = renderMenu; return; }
    api.match = Logic.createMatch(s, teams);
    if (MO && MO.preset) { api.match.score.A = MO.preset.A; api.match.score.B = MO.preset.B; api.match.time *= MO.preset.timeMul; }   // sales en la 2.ª parte
    $('cA').src = api.mode === 'wc' ? 'ui/crest3016.png' : api.mode === 'pwc' ? `ui/crest${PC.natCrest(PC.data.pwc.nat || PC.myNat())}.png` : api.mode === 'career' && Career.data ? (Career.data.crestImg ? `ui/crest${Career.data.crestImg}.png` : ClubCrest.url(Career.data.crest, Career.data.school)) : api.mode === 'pcareer' || api.mode === 'pduel' ? `ui/crest${PC.data.crestId}.png` : Shop.myCrest() ? ClubCrest.url(Shop.myCrest(), '') : 'ui/crest1.png';
    $('nA').textContent = api.mode === 'wc' ? TX('Japón') : api.mode === 'pwc' ? PC.natName(PC.data.pwc.nat || PC.myNat()) : api.mode === 'career' && Career.data ? Career.data.school.replace(/^Instituto\s+/i, '') : api.mode === 'pcareer' ? PC.data.school : api.mode === 'pduel' ? PLAYER(PC.data.me.id).name : TX('Tú');
    UI.reset();
    api.scene && api.scene.bind(api.match, api.matchSheet);
    show(null); if ($('devFab')) $('devFab').hidden = true;
    api.running = true;
    Sound.music(musicRole || 'match', rival);
    if (field && field !== 'normal') UI.toast(FIELD_LABEL[field] || '', 1600);
  }
  function startQuick() {
    api.mode = 'quick';
    const T = savedTeam(), F = FORMATIONS[T.formation], pos = layout(F.roles), L = T.ids;
    if (L.some(x => x == null)) return UI.toast(TX('Completa tu equipo en Plantilla'));
    const A = { name: TX('Tu equipo'), players: L.map((id, i) => {
      const pd = PLAYER(id);
      return Shop.boost(Object.assign(buildMatchPlayer(id, F.roles[i], k => statOf(id, Profile.owned(id), k), runMember(id).techs, [], i, pos[i]), { sprite: mySprite(pd, F.roles[i]) }));
    }) };
    const key = RIVAL_ORDER[Math.floor(Math.random() * RIVAL_ORDER.length)];
    startMatch({ A, B: rivalTeam(key, 0.9, 0.5) }, false, TEAM_FIELD[key], 'match', key);
  }
  api.togglePause = () => {
    if (!api.match || api.match.over || !$('screen').hidden) return;
    if (api.running) {
      api.running = false;
      $('pauseBody').innerHTML = `<h1>${TX('Pausa')}</h1><button class="cta" id="pResume">${TX('Seguir')}</button>
        <div class="group"><label>${TX('Supertécnicas')}</label><div class="opts">${[['boton', TX('Con botón')], ['auto', TX('Automáticas')]].map(([v, t]) => `<button data-v="${v}" aria-pressed="${settings.techMode === v}">${t}</button>`).join('')}</div></div>
        ${settings.dev && settings.devWin ? '<button class="ghost" id="pWin">' + TX('🛠 Ganar ahora (desarrollador)') + '</button>' : ''}
        <button class="ghost" id="pGuide">${TX('🎮 Guía de controles')}</button>
        <button class="ghost" id="pQuit">${['run', 'career', 'wc', 'pcareer', 'pwc', 'pduel'].includes(api.mode) ? TX('Rendirse (cuenta como derrota)') : TX('Salir al menú')}</button>`;
      $('pauseBody').querySelectorAll('.opts button').forEach(b => b.addEventListener('click', () => {
        settings.techMode = b.dataset.v; saveSettings(); api.match.settings.techMode = b.dataset.v;
        b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      }));
      $('pResume').onclick = () => api.togglePause();
      if ($('pWin')) $('pWin').onclick = () => { const m = api.match; m.score.A = m.score.B + 1; m.time = 0.01; m.golden = false; api.togglePause(); };
      $('pGuide').onclick = () => renderControlsGuide(() => show('pause'));
      $('pQuit').onclick = () => {
        api.match.quit = true;   // rendirse no da caramelos
        if (api.mode === 'run') { api.match.over = true; api.match.result = 'loss'; api.matchEnded(api.match); }
        else if (['career', 'wc', 'pcareer', 'pwc', 'pduel'].includes(api.mode)) { const m = api.match; m.over = true; m.score.A = 0; m.score.B = Math.max(3, m.score.B); m.result = 'loss'; api.matchEnded(m); }
        else if (api.mode === 'techview') { api.match.over = true; api.techDemo = null; renderDevTechs(); }
        else if (api.mode === 'blockview') { api.match.over = true; api.blockDemo = null; renderDevBlocks(); }
        else { api.match.over = true; Sound.stop(0.3); api.mode === 'hwboss' ? renderHalloween() : api.mode === 'xmboss' ? renderNavidad() : renderMenu(); }
      };
      show('pause');
    } else { show(null); api.running = true; }
  };
  api.matchEnded = s => {
    api.running = false;
    setTimeout(() => {
      Sound.stop(0.6);
      setTimeout(() => { try { Cloud.flushOld(); } catch (_) {} }, 2000);   // al acabar el partido se sube lo pendiente si hace rato de la última subida
      // Halloween: caramelos por jugar en cualquier modo (+5, +10 más si ganas)
      const candy = s.quit ? 0 : Halloween.matchPlayed(s.score.A > s.score.B);
      if (candy && api.mode !== 'hwboss') setTimeout(() => UI.toast('+' + candy + ' 🍬 ' + TX('caramelos de Halloween'), 2200), 500);
      // Navidad: copos por jugar en cualquier modo (+5, +10 más si ganas)
      const snow = s.quit ? 0 : Navidad.matchPlayed(s.score.A > s.score.B);
      if (snow && api.mode !== 'xmboss') setTimeout(() => UI.toast('+' + snow + ' ❄️ ' + TX('copos de Navidad'), 2200), candy ? 2900 : 500);
      if (api.mode === 'xmboss') { const won = s.score.A > s.score.B, bonus = Navidad.bossResult(won); Sound.jingle(won ? 'win' : s.score.A < s.score.B ? 'lose' : null); renderXmBossEnd(s, snow, bonus); return; }
      if (api.mode === 'hwboss') { const won = s.score.A > s.score.B, bonus = Halloween.bossResult(won); Sound.jingle(won ? 'win' : s.score.A < s.score.B ? 'lose' : null); renderBossEnd(s, candy, bonus); return; }
      if (api.mode === 'pduel') { const r = PC.duelResult(s.score.A, s.score.B); Sound.jingle(r.win ? 'win' : r.draw ? null : 'lose'); renderPCDuelEnd(r); return; }
      if (api.mode === 'pcareer') { const M = api.pcMatch; const out = PC.playedResult(s, M.lockId, M.part, M.base); jingleFor(out); renderPCResult(out); return; }
      if (api.mode === 'pwc') {
        const M = api.pcMatch, st = (s.pstats || {})[M.lockId] || {}, role = PLAYER(PC.data.me.id).role;
        const note = PC.rateMatch(st, M.part, s.score.A > s.score.B, s.score.A === s.score.B, s.score.B, role);
        const r = PC.wcFinish(s.score.A, s.score.B, note, st);
        Sound.jingle(r.won ? 'win' : r.gA === r.gB && !r.pens ? null : 'lose'); renderPCWC(r); return;
      }
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
    return `<div class="runbar"><span>${esc(r.name)}${r.kind === 'story' ? ' · ' + { facil: TX('Fácil'), medio: TX('Medio'), dificil: TX('Difícil') }[r.diff] : ''}</span>
      <span class="hearts">${'♥'.repeat(r.lives)}<s>${'♥'.repeat(Math.max(0, r.maxLives - r.lives))}</s></span>
      <span>🪙 +${r.coinsEarned}</span><span>🎟️ +${r.ticketsEarned}</span><span>⚡ ${Profile.data.rayos}</span></div>`;
  }
  function memberCard(mi, slot) {
    const r = api.run, m = r.roster[mi], pd = PLAYER(m.id), o = m.temp ? null : Profile.owned(m.id);
    const el = document.createElement('div');
    el.className = 'pcard ' + pd.rarity + hwc(pd) + (api.pick === mi ? ' sel' : '');
    el.appendChild(face(Sprites.refOf(pd), 56));
    el.insertAdjacentHTML('beforeend', `<div class="pinfo"><div class="pname">${esc(pd.name)}${m.temp ? ' <em>' + TX('temporal') + '</em>' : ''}</div>
      <div class="pmeta"><b>${RAB(slot)}</b> · ${ROLE_LABEL[pd.role]} ${chip(pd.elem)} ${o ? stars(o.stars) : ''}</div>
      <div class="ptechs">${m.techs.map(TECH).map(techLine).join('') || '<i>' + TX('Sin técnicas') + '</i>'}</div>
      ${m.passives.length ? `<div class="ppass">${m.passives.map(n => esc(TX(n))).join(' · ')}</div>` : ''}</div>`);
    return el;
  }
  function openRun() {
    const r = api.run;
    if (r.state === 'reward') return renderReward();
    if (r.state === 'over') return renderOver();
    renderMap();
  }
  // Antes del partido: la estrella rival te provoca y tu mejor jugador le contesta (la frase se queda fija en cada partido)
  function fillTalk(r, rival) {
    const box = $('talk'); if (!box) return;
    let star = null; try { star = teamStar(rival, false); } catch (_) {}
    const sum = pd => Object.values(pd.ie).reduce((x, y) => x + y, 0);
    const mine = r.lineup.slice(0, 5).map(mi => r.roster[mi] && PLAYER(r.roster[mi].id)).filter(Boolean).sort((a, b) => sum(b) - sum(a))[0];
    if (!star || !mine) { box.remove(); return; }
    const key = r.kind + ':' + r.index + ':' + rival;
    if (!api.talk || api.talk.key !== key) api.talk = { key, a: Dialog.taunt(star.elem), b: Dialog.reply() };
    box.innerHTML = `<div class="tk"><span class="tkf" id="tkR"></span><div class="tkb"><small>${esc(star.name)}</small>${esc(api.talk.a)}</div></div>
      <div class="tk me"><span class="tkf" id="tkM"></span><div class="tkb"><small>${esc(mine.name)}</small>${esc(api.talk.b)}</div></div>`;
    $('tkR').appendChild(face(Sprites.refOf(star), 48)); $('tkM').appendChild(face(Sprites.refOf(mine), 48));
  }
  function renderMap() {
    const r = api.run, rival = Run.rivalName(r), F = FORMATIONS[r.formation];
    const path = r.kind === 'infinite'
      ? `<p class="note">${TX('Oleada')} ${r.index + 1}${Run.isBoss(r) ? ' · <b>' + TX('¡oleada especial!') + '</b>' : ''} ${TX('· récord')} ${Profile.data.infBest}</p>`
      : `<ol class="path">${r.schedule.map((t, i) => `<li class="${i < r.index ? 'done' : i === r.index ? 'now' : ''}">${Sprites.crest(crestOf(t))}<span>${esc(t)}</span></li>`).join('')}</ol>`;
    screen(`${top(r.kind === 'infinite' ? TX('Oleada ') + (r.index + 1) : TX('Partido ') + (r.index + 1) + TX(' de ') + r.schedule.length, 'toMenu', TX('Menú'))}${runHeader()}
      ${path}<div class="vsrow">${Sprites.crest(crestOf(rival))}<div><b>${esc(rival)}</b><span class="note">${FIELD_LABEL[Run.field(r)] || ''}</span><div class="faces" id="rfaces"></div></div></div>
      <div class="talk" id="talk"></div>
      ${formSelect(r)}
<h3>${TX('Alineación')} <small>${TX('toca un puesto y luego un suplente (u otro puesto) para cambiarlos')}</small></h3>
      <div id="lineup"></div>
      <h3>${TX('Banquillo')}</h3><div class="pgrid" id="bench"></div>
      <details class="techs"><summary>${TX('Ver técnicas del equipo')}</summary><div class="cards" id="tdet"></div></details>
      ${bottom(`<button class="cta" id="goMatch">${TX('Jugar contra')} ${esc(rival)}</button>`)}`, 'bg_vs');
    const rt = TEAM(rival);
    if (rt) rt.players.forEach(m => $('rfaces').appendChild(face(m.file ? { file: m.file, row: m.row } : Sprites.refOf(PLAYER(m.id)), 40)));
    fillTalk(r, rival);
    $('formSel').onchange = e => { r.formation = e.target.value; Run.save(r); renderMap(); };
    const sel = api.mapSel;
    const items = r.lineup.slice(0, 5).map(mi => { const pd = PLAYER(r.roster[mi].id); return { ref: Sprites.refOf(pd), name: pd.name, rarity: pd.rarity, halloween: pd.halloween, xmas: pd.xmas, selva: pd.selva, leyenda: pd.leyenda }; });
    $('lineup').appendChild(pitch(F.roles, items, sel, i => {
      if (sel != null && sel !== i) { Run.swapLineup(r, sel, r.lineup[i]); api.mapSel = null; Run.save(r); }
      else api.mapSel = sel === i ? null : i;
      Sound.sfx('click'); renderMap();
    }));
    r.roster.forEach((m, mi) => {
      if (r.lineup.slice(0, 5).includes(mi)) return;
      const pd = PLAYER(m.id), c = document.createElement('button');
      c.className = 'ptile ' + pd.rarity + hwc(pd); c.appendChild(face(Sprites.refOf(pd), 56));
      c.insertAdjacentHTML('beforeend', `<span class="tn">${esc(pd.name)}</span><span class="tm"><i>${RAB(pd.role)}</i>${m.temp ? '<em class="tmp">' + TX('temporal') + '</em>' : ''}</span>`);
      c.onclick = () => {
        if (api.mapSel == null) return UI.toast(TX('Primero toca el puesto del campo'));
        Run.swapLineup(r, api.mapSel, mi); api.mapSel = null; Run.save(r); Sound.sfx('click'); renderMap();
      };
      $('bench').appendChild(c);
    });
    if (!$('bench').children.length) $('bench').innerHTML = '<p class="note">' + TX('Sin suplentes todavía: los fichajes temporales aparecen aquí.') + '</p>';
    r.lineup.slice(0, 5).forEach((mi, si) => $('tdet').appendChild(memberCard(mi, F.roles[si])));
    $('goMatch').onclick = () => { api.mode = 'run'; startMatch(Run.matchTeams(r), true, Run.field(r), Run.musicRole(r), Run.rivalName(r)); };
    $('toMenu').onclick = renderMenu;
    Sound.music('menu');
  }
  function renderResult(s) {
    const r = api.run, L = r.last;
    const gains = [`<li>🪙 +${L.coins} ${TX('monedas')}</li>`];
    if (L.tickets) gains.push(`<li>🎟️ +${L.tickets} ${TX('ticket')}${L.tickets > 1 ? 's' : ''}</li>`);
    if (L.rayo) gains.push('<li>' + TX('⚡ ¡5 victorias más: ganas un Rayo Raimon!') + '</li>');
    if (L.chainRayo) gains.push('<li>' + TX('⚡ Cadena completada: ¡Rayo Raimon!') + '</li>');
    if (L.chainTech != null) gains.push(`<li>${TX('📜 Primera vez: técnica legendaria')} <b>${esc(TECH(L.chainTech).name)}</b></li>`);
    if (L.perfect) gains.push('<li>' + TX('💎 ¡Cadena perfecta sin perder vidas! +5 🎟️') + '</li>');
    if (L.medal) gains.push(`<li>${L.medal === 'oro' ? '🥇' : '🥈'} ${TX('Medalla de')} ${L.medal}${TX(': +15 🎟️ y otro ⚡ Rayo')}</li>`);
    if (L.lyPrize) gains.push(`<li>👑 ${TX('Premio de la Cadena Leyenda:')} <b>${esc(L.lyPrize)}</b></li>`);
    if (L.legend) gains.push(`<li>👑 <b>${TX('¡Cadena Leyenda completada! Willy Glass LEYENDA es tuyo')}</b> · +10 🎟️</li>`);
    if (L.lifeLost) gains.push(r.kind === 'leyenda' ? `<li>${TX('💀 Una derrota y fuera: la Cadena Leyenda vuelve a empezar desde el partido 1')}</li>` : `<li>${TX('♥ −1 vida')}${r.lives > 0 ? TX(' · repites contra el mismo rival') : ''}</li>`);
    screen(`<img class="finimg" src="ui/fin.png" alt="${TX('Fin del partido')}">${runHeader()}<h2>${L.result === 'win' ? TX('¡Victoria!') : TX('Derrota')}</h2>
      ${scoreLine(s)}
      <ul class="gains">${gains.join('')}</ul><div id="excl"></div>
      <button class="cta" id="next">${TX('Continuar')}</button>`, L.result === 'win' ? 'ill27' : 'ill15');
    if (L.exclusive) {
      const x = L.exclusive, pd = PLAYER(x.id), c = miniCard(x.id, `<div class="slot">${x.isNew ? TX('¡Se une a tu plantilla!') : x.star ? TX('Sube a ') + x.star + TX(' estrellas') : '+' + x.coins + ' 🪙'}</div>`);
      $('excl').insertAdjacentHTML('beforeend', '<h3>' + TX('Premio del equipo especial') + '</h3>'); $('excl').appendChild(c);
    }
    // Jefe del Infinito: elige 1 de 3 versiones (si no eliges ahora, queda guardado en 🎁 Código de regalo)
    const puid = L.versionPick != null ? L.versionPick : L.lyPick, vi = puid != null ? (Profile.data.giftPicks || []).findIndex(g => g.uid === puid) : -1;
    if (vi >= 0) {
      $('excl').insertAdjacentHTML('beforeend', `<h3>${L.lyPick != null ? '👑 ' + TX('Premio de la Cadena Leyenda: elige un jugador') : '∞ ' + TX('Premio del jefe: elige una versión')}</h3><p class="note">${TX('Si no eliges ahora, la tienes en 🎁 Código de regalo.')}</p><div class="hwpick" id="vpick"></div>`);
      Profile.data.giftPicks[vi].opts.forEach(id => {
        const pd = PLAYER(id), b = document.createElement('button'); b.className = 'hwpk' + (L.lyPick != null ? '' : ' infpk');
        b.appendChild(face(Sprites.refOf(pd), 72));
        b.insertAdjacentHTML('beforeend', `<b>${esc(pd.full || pd.name)}</b><small>${rchip(pd.rarity)} ${RAB(pd.role)} ${chip(pd.elem)}</small>${Profile.data.coll[id] ? `<small>${TX('ya lo tienes (+1 ★)')}</small>` : ''}`);
        b.onclick = () => { const i = Profile.data.giftPicks.findIndex(g => g.uid === puid); const x = i >= 0 && Profile.takePick(i, id); if (!x) return; Sound.sfx('reveal'); renderReveal([x], openRun, L.lyPick != null ? TX('¡Nuevo fichaje!') : TX('¡Nueva versión!')); };
        $('vpick').appendChild(b);
      });
    }
    $('next').onclick = L.legend ? () => { Sound.sfx('reveal'); renderReveal([L.legend], openRun, TX('👑 ¡Willy Glass LEYENDA!')); } : openRun;
  }
  const scoreLine = s => `<div class="result">${Sprites.crest(1)}<span class="sc">${s.score.A}–${s.score.B}<small>${TX('Tu equipo ·')} ${esc(s.teams.B.name)}</small></span>${Sprites.crest(crestOf(s.teams.B.name))}</div>`;
  function renderReward() {
    const r = api.run;
    screen(`${runHeader()}<h2>${TX('Elige una recompensa')}</h2><div id="rw" class="cards"></div>`, 'bg_green');
    r.rewards.forEach(o => {
      const c = document.createElement('button'); c.className = 'rcard';
      const who = o.member != null ? PLAYER(r.roster[o.member].id) : o.id != null ? PLAYER(o.id) : null;
      if (who) c.appendChild(face(Sprites.refOf(who), 64));
      let html = '';
      if (o.kind === 'tech') html = `<div class="rk">${TX('Supertécnica')}${o.rare ? ' <em>' + TX('rara') + '</em>' : ''}</div><div class="pname">${esc(who.name)} ${TX('aprende')}</div>${techLine(TECH(o.tech))}${o.replace != null ? `<div class="pmeta">${TX('Sustituye a')} ${esc(TECH(o.replace).name)} ${TX('(máx.')} ${TECH_SLOTS} ${TX('técnicas)')}</div>` : ''}`;
      if (o.kind === 'evolve') html = `<div class="rk">${TX('Evolución')}</div><div class="pname">${esc(who.name)}</div>${techLine(TECH(o.from))}<span class="evo">↓</span>${techLine(TECH(o.to))}`;
      if (o.kind === 'recruit') html = `<div class="rk">${TX('Fichaje temporal')}</div><div class="pname">${esc(who.name)}</div><div class="pmeta">${ROLE_LABEL[who.role]} ${chip(who.elem)} ${TX('· Tiro')} ${who.ie.tiro} ${TX('· Rapidez')} ${who.ie.rapidez}</div>`;
      if (o.kind === 'passive') html = `<div class="rk">${TX('Habilidad')}</div><div class="pname">${esc(TX(o.name))} ${TX('para')} ${esc(who.name)}</div><div class="pmeta">${esc(PASSIVES[o.name].desc)}</div>`;
      if (o.kind === 'coins') html = `<div class="rk">${TX('Monedas')}</div><div class="pname">+${o.amount} 🪙</div>`;
      c.insertAdjacentHTML('beforeend', `<div>${html}</div>`);
      c.onclick = () => { Run.takeReward(r, o); Run.save(r); Sound.sfx('reveal'); renderMap(); };
      $('rw').appendChild(c);
    });
    $('rw').insertAdjacentHTML('afterend', `<button class="ghost" id="rwSkip">${TX('Saltar (no quiero ninguna)')}</button>`);
    $('rwSkip').onclick = () => { Run.takeReward(r, null); Run.save(r); Sound.sfx('click'); renderMap(); };
  }
  function renderOver() {
    const r = api.run, win = r.last && r.last.victory;
    const what = r.kind === 'infinite' ? `${TX('Has llegado a la oleada')} ${r.index + 1} ${TX('(récord:')} ${Profile.data.infBest}).`
      : `${TX('Victorias:')} ${r.wins}${r.kind !== 'special' ? TX(' de ') + r.schedule.length : ''}.`;
    screen(`${runHeader()}<h2>${win ? (r.kind === 'story' ? TX('¡Etapa completada!') : r.kind === 'chain' ? TX('¡Cadena completada!') : r.kind === 'leyenda' ? TX('👑 ¡Cadena Leyenda completada!') : TX('¡Victoria!')) : TX('Fin de la partida')}</h2>
      <p class="note">${what} ${TX('Has ganado')} <b>${r.coinsEarned} ${TX('monedas')}</b> ${TX('y')} <b>${r.ticketsEarned} ${TX('tickets')}</b>${TX(', que se quedan en tu perfil.')}<br>
      ${TX('Las técnicas, habilidades y fichajes temporales se pierden.')}</p>
      ${win && r.kind === 'story' ? (r.stage === 's4' ? '<p class="note"><b>' + TX('Desbloqueado:') + '</b> ' + TX('la cadena «El lado oscuro».') + '</p>' : r.stage === 's3' ? '<p class="note"><b>' + TX('Desbloqueado:') + '</b> ' + TX('la Fase 2 de la Etapa 3: el Mundial.') + '</p>' : r.stage === 's2' ? '<p class="note"><b>' + TX('Desbloqueado:') + '</b> ' + TX('el equipo especial Caos y la Etapa 3.') + '</p>' : '<p class="note"><b>' + TX('Desbloqueado:') + '</b> ' + TX('la Etapa 2, Cadenas, Infinito y nuevos equipos especiales.') + '</p>') : ''}
      <button class="cta" id="toGacha">${TX('Ir al gacha')}</button><button class="ghost" id="toMenu">${TX('Menú')}</button>`, win ? (r.kind === 'story' ? 'ill25' : 'ill27') : 'ill14');
    const end = () => { Run.clear(r.kind); api.run = null; };
    $('toGacha').onclick = () => { end(); renderGacha(); };
    $('toMenu').onclick = () => { end(); renderMenu(); };
  }
  function renderQuickEnd(s, rayo) {
    const a = s.score.A, b = s.score.B;
    screen(`<img class="finimg" src="ui/fin.png" alt="${TX('Fin del partido')}"><h2>${a > b ? TX('¡Victoria!') : a < b ? TX('Derrota') : TX('Empate')}</h2>
      ${scoreLine(s)}
      <p class="note">${TX('El partido rápido no da monedas ni tickets, pero las victorias cuentan para el Rayo Raimon.')}${rayo ? '<br><b>' + TX('⚡ ¡Has ganado un Rayo Raimon!') + '</b>' : ''}</p>
      <button class="cta" id="again">${TX('Otro partido rápido')}</button><button class="ghost" id="toMenu">${TX('Menú')}</button>`, a > b ? 'ill27' : a < b ? 'ill15' : 'ill28');
    $('again').onclick = startQuick; $('toMenu').onclick = renderMenu;
  }

  /* =====================================================================
     MODO CARRERA (pantallas)
     ===================================================================== */
  const myCrestUrl = () => Career.data.crestImg ? `ui/crest${Career.data.crestImg}.png` : ClubCrest.url(Career.data.crest, Career.data.school);
  const cCrest = key => key === YOU ? `<img class="ccrest" src="${myCrestUrl()}" alt="">` : `<img class="ccrest" src="ui/crest${crestOf(key)}.png" alt="">`;
  const bar = (v, cls) => `<span class="cbar ${cls || ''}"><i style="width:${Math.max(0, Math.min(100, v))}%"></i></span>`;
  const money = n => '💰 ' + (Career.data && Career.data.devMoney && n >= 9999999 ? '∞' : n);
  const WEEK_LABEL = { C: TX('Semana de Copa'), P1: TX('Playoff de ascenso · semifinales'), P2: TX('Playoff de ascenso · final') };
  function renderCareer() {
    const c = Career.data;
    if (!c) return renderCareerNew();
    if (c.over) return renderCareerOver();
    if ((c.pendingYouth || []).length) return renderYouthChoice(renderCareer);
    if (c.wc) return renderWC();
    hub = renderCareer;
    tutorial('career'); achToast();
    const nm = Career.nextMatch(), d = Career.myDiv(), mgr = PLAYER(c.manager), wt = Career.weekType();
    const act = (k, A) => `<button class="ghost big act-${k}" data-act="${k}">${A.name}<small>${A.desc}</small></button>`;
    const kindTxt = !nm ? '' : nm.type === 'liga' ? `${TX('Jornada')} ${c.fix[d] ? c.fix[d].slice(0, nm.j + 1).filter(r => r.length).length : nm.j + 1}` : nm.type === 'copa' ? `${TX('Copa ·')} ${CUP_ROUND[nm.round]}` : nm.type === 'semi' ? TX('Playoff · semifinal') : TX('Playoff · ¡FINAL!');
    const cupTxt = !c.cup ? TX('La Copa empieza la temporada que viene') : c.cup.winner ? (c.cup.winner === YOU ? TX('¡Campeones de Copa!') : TX('Campeón de Copa: ') + Career.teamName(c.cup.winner)) : c.cup.out ? TX('Eliminados de la Copa: se juega sin ti') : TX('Siguiente ronda: ') + CUP_ROUND[c.cup.round];
    const sponsor = Math.round((8 + c.fame * 0.5) * DIV_SPONSOR[d] * Career.incomeMul());
    screen(`${top(TX('Modo Carrera'))}
      ${c.migrated ? '<p class="note cmsg">' + TX('Tu carrera se ha adaptado a las ligas de 10 equipos: la temporada actual empieza de nuevo (conservas plantilla, fama y dinero).') + '</p>' : ''}
      <div class="chead"><img class="ccrest big" src="${myCrestUrl()}" alt=""><span id="cMgr"></span><div><b>${esc(c.school)}</b><small>${TX('Mánager:')} ${esc(mgr.name)} ${TX('· Temporada')} ${c.season}${c.goal ? TX(' · ★ Campeón de Primera') : ''}</small></div></div>
      <div class="cstats">
        <div><label>${TX('Fama')}</label>${bar(c.fame, c.fame < 15 ? 'bad' : '')}<small>${c.fame}/100${c.fame < 15 ? TX(' · ¡ojo!') : ''}</small></div>
        <div><label>${TX('Forma')}</label>${bar(c.forma, c.forma < 50 ? 'warn' : 'ok')}<small>${c.forma} %</small></div>
        <div><label>${TX('Dinero')}</label><b class="cmoney">${money(c.money)}</b><small>+${sponsor}${TX('/semana')}</small></div>
      </div>
      <p class="cweek">${TX('Semana')} <b>${c.week}</b>/${WEEKS} · ${DIV_NAME[d]} ${TX('División ·')} ${ordTx(Career.myPos())} · 🏆 ${esc(cupTxt)}</p>
      ${nm ? `<div class="cnext">${cCrest(nm.rival)}<div><b>${kindTxt}: ${esc(Career.teamName(nm.rival))}</b><small>${nm.home ? TX('En casa') : TX('Fuera')} ${TX('· tu media')} ${Career.myRating()} ${TX('· rival')} ${Career.rating(nm.rival)}${nm.ko ? TX(' · si hay empate, penaltis') : ''}</small></div></div>`
        : `<div class="cnext free"><span class="cicon">${wt === 'C' ? '🏆' : '📣'}</span><div><b>${WEEK_LABEL[wt] || TX('Semana libre')}</b><small>${wt === 'C' ? esc(cupTxt) : d === 1 ? TX('En Primera no hay playoff: aprovecha para entrenar.') : TX('No juegas el playoff esta temporada: se juega sin ti.')}</small></div></div>`}
      ${c.bid && Career.m(c.bid.id) ? `<div class="cnext bid">${cCrest(c.bid.key)}<div><b>📨 ${TX('{0} quiere a {1}', esc(Career.teamName(c.bid.key)), esc(PLAYER(c.bid.id).name))}</b><small>${TX('Ofrece')} ${money(c.bid.price)} · ${TX('media')} ${Career.ovr(Career.m(c.bid.id))} · ${TX('la oferta caduca al pasar la semana')}</small>
        <div class="grid2"><button class="cta mini" id="bidYes">${TX('Vender')}</button><button class="ghost mini" id="bidNo">${TX('Rechazar')}</button></div></div></div>` : ''}
      <h3>${TX('Actividad de la semana')} <small>${nm ? TX('después juegas el partido') : TX('y pasa la semana')}</small></h3>
      <div class="grid2">${Object.entries(ACTIVITIES).map(([k, A]) => act(k, A)).join('')}</div>
      <div id="cTrain" hidden><p class="note">${TX('¿Qué entrenáis esta semana? Cada jugador tiene un {0} % de probabilidad de subir +1.', Math.round((TRAIN_CHANCE + TRAIN_CHANCE_CAMPO * c.fac.campo) * 100))}</p><div class="opts">${STAT_KEYS.map(k => `<button data-st="${k}">${STAT_LABEL[k]}</button>`).join('')}</div></div>
      <div class="grid2 cnav"><button class="ghost" id="cSquad">${TX('👥 Plantilla')}</button><button class="ghost" id="cMarket">${TX('💸 Fichajes')}${(c.scout || []).length ? ' (' + c.scout.length + TX(' ojeados)') : ''}</button>
        <button class="ghost" id="cClub">${TX('🏟️ Club')}</button><button class="ghost" id="cTable">${TX('📊 Clasificación')}</button>
        <button class="ghost" id="cCal">${TX('📅 Calendario')}</button><button class="ghost" id="cCup">${TX('🏆 Copa')}</button>
        <button class="ghost" id="cNews">${TX('📰 Noticias')}</button><button class="ghost" id="cHall">${TX('🏛️ Salón de la fama')}</button>
        <button class="ghost" id="cSave">${TX('💾 Guardar')}</button></div>
      <button class="ghost" id="cQuit">${TX('Abandonar carrera')}</button>`, 'bg_green');
    c.migrated = false;
    $('cMgr').appendChild(mgrFace(c.manager, 40));
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
    $('cNews').onclick = () => renderNews(c, renderCareer);
    if ($('bidYes')) $('bidYes').onclick = () => { const r = Career.acceptBid(); if (r.msg) UI.toast(r.msg, 2600); if (r.ok) Sound.sfx('reveal'); renderCareer(); };
    if ($('bidNo')) $('bidNo').onclick = () => { Career.rejectBid(); renderCareer(); };
    $('cQuit').onclick = () => {
      if ($('cQuit').dataset.sure) { Career.clear(); renderMenu(); return; }
      $('cQuit').dataset.sure = 1; $('cQuit').textContent = TX('¿Seguro? Toca otra vez para borrarla');
    };
    $('back').onclick = renderMenu;
  }
  // Noticias de fichajes (Carrera y Carrera Jugador)
  function renderNews(c, back) {
    const N = c.news || [];
    screen(`${top(TX('Noticias de fichajes'))}
      <p class="note">${TX('Los clubes fichan entre ellos en verano (al acabar la temporada) y en invierno (semana {0}).', WINTER_WEEK)}</p>
      <div class="cres">${N.length ? N.map(t => `<p>${esc(t)}</p>`).join('') : `<p>${TX('Todavía no hay noticias.')}</p>`}</div>`, 'bg_green');
    $('back').onclick = back;
  }
  function renderCareerCup() {
    const c = Career.data, C = c.cup;
    const rounds = C ? C.rounds.map((res, i) => `<h3>${CUP_ROUND[i]}</h3><div class="cres">${res.map(poLine).join('')}</div>`).reverse().join('') : '';
    const next = C && !C.winner ? `<h3>${CUP_ROUND[C.round]} <small>${TX('semana')} ${CUP_WEEKS[C.round]}</small></h3><div class="cres">${C.ties.map(([a, b]) => `<p class="${a === YOU || b === YOU ? 'you' : ''}">${esc(Career.teamName(a))} – ${esc(Career.teamName(b))}</p>`).join('')}${C.round === 0 && C.byes.length ? `<p><small>${TX('Esperan en octavos:')} ${C.byes.map(k => esc(Career.teamName(k))).join(', ')}</small></p>` : ''}</div>` : '';
    screen(`${top(TX('Copa Inazuma'))}
      <p class="note">${TX('Hasta 32 equipos de las 3 divisiones, a partido único (con penaltis si hay empate). Ganarla da dinero, fama y')} <b>${TX('10 tickets')}</b> ${TX('para el gacha.')}</p>
      ${!C ? '<p class="note">' + TX('La Copa empieza la temporada que viene.') + '</p>' : C.winner ? `<p class="note cmsg gold">${TX('🏆 Campeón:')} <b>${esc(Career.teamName(C.winner))}</b></p>` : C.out ? '<p class="note cmsg bad">' + TX('Tu club está eliminado.') + '</p>' : ''}
      ${next}${rounds}`, 'bg_green');
    $('back').onclick = renderCareer;
  }
  function renderCareerCupRound(res) {
    const c = Career.data, i = c.cup ? c.cup.rounds.length - 1 : 0;
    screen(`<h2>${TX('Copa Inazuma ·')} ${CUP_ROUND[i]}</h2>${c.cup && c.cup.winner ? `<p class="note cmsg gold">${TX('🏆 Campeón:')} <b>${esc(Career.teamName(c.cup.winner))}</b></p>` : ''}
      <div class="cres">${res.map(poLine).join('')}</div>${bottom('<button class="cta" id="cNext">' + TX('Continuar') + '</button>')}`, 'bg_green');
    $('cNext').onclick = renderCareer;
  }
  function renderHall(back) {
    const list = Career.hall(), c = Career.data;
    const row = (r, now) => `<div class="cpl fac"><img class="ccrest big" src="${r.crestImg ? `ui/crest${r.crestImg}.png` : ClubCrest.url(r.crest || { shape: 'escudo', c1: '#1f4fc0', c2: '#e8c21a', sym: 'rayo' }, r.school)}" alt=""><div class="cplb"><b>${esc(r.school)}</b>
      <small>${now ? TX('En curso') : new Date(r.date).toLocaleDateString('es-ES')} ${TX('· mánager')} ${esc((PLAYER(r.manager) || {}).name || '?')} · ${(CAREER_DIFF[r.diff] || CAREER_DIFF.normal).name}</small>
      <span class="cst">${r.seasons} ${TX('temporadas · mejor división:')} ${DIV_NAME[r.best]}${r.goal ? TX(' · ★ campeón de Primera') : ''}${r.closed ? TX(' · club cerrado') : ''}</span>
      <span class="cst">${TX('Títulos:')} ${r.titles.length ? r.titles.map(esc).join(', ') : 'ninguno'}${r.scorer ? TX(' · máximo goleador: ') + esc(PLAYER(r.scorer[0]).name) + ' (' + r.scorer[1] + ')' : ''}</span></div></div>`;
    const cur = c && c.history.length ? row({ school: c.school, manager: c.manager, crest: c.crest, seasons: c.history.length, titles: c.titles.map(t => t.name), best: Math.min(...c.history.map(h => h.div)), goal: c.goal, diff: c.diff,
      scorer: (m => m && m.goals ? [m.id, m.goals] : null)(c.squad.slice().sort((a, b) => b.goals - a.goals)[0]) }, true) : '';
    screen(`${top(TX('Salón de la fama'))}<p class="note">${TX('Tus carreras de mánager: las terminadas, las abandonadas y la que llevas ahora.')}</p>
      <div class="csquad">${cur}${list.map(r => row(r)).join('') || (cur ? '' : '<p class="note">' + TX('Aún no hay ninguna carrera terminada.') + '</p>')}</div>`, 'bg_team');
    $('back').onclick = back;
  }
  // Resultados de los playoffs en los que no jugabas
  function renderCareerPOInfo() {
    const c = Career.data;
    const rows = [2, 3].map(d => { const P = c.po[d]; const r = (P.finalRes ? [P.finalRes] : P.res) || [];
      return `<h3>${TX('Playoff ·')} ${DIV_NAME[d]}</h3><div class="cres">${r.map(poLine).join('')}</div>`; }).join('');
    screen(`<h2>${TX('Playoffs de ascenso')}</h2>${rows}${bottom('<button class="cta" id="cNext">' + TX('Continuar') + '</button>')}`, 'bg_green');
    $('cNext').onclick = renderCareer;
  }
  const poLine = ([a, b, ga, gb, pens, w]) => `<p class="${a === YOU || b === YOU ? 'you' : ''}">${esc(Career.teamName(a))} <b>${ga} - ${gb}</b> ${esc(Career.teamName(b))}${pens ? ` <small>${TX('(pen.')} ${pens[0]}-${pens[1]})</small>` : ''} → <b>${esc(Career.teamName(w))}</b></p>`;
  // Nueva carrera: creas tu club (empiezas en Tercera) o coges uno que ya existe (su división, su nombre y sus jugadores)
  let cNew = { mode: 'crear', club: null, pick: MANAGERS[0], diff: 'normal', school: 'Instituto Inazuma' };
  const teamAvg = key => { const T = TEAM(key); return Math.round(T.players.reduce((t, p) => { const pd = PLAYER((GAME.idmap || {})[p.id] || p.id) || PLAYER(p.id); return t + STAT_KEYS.reduce((a, k) => a + pd.ie[k], 0) / STAT_KEYS.length; }, 0) / T.players.length); };
  function renderCareerNew() {
    const N = cNew, own = N.mode === 'elegir';
    if (!MANAGERS.includes(N.pick)) N.pick = MANAGERS[0];
    const clubs = own ? [1, 2, 3].map(d => `<h3>${DIV_NAME[d]} ${TX('División')} <small>${CAREER_START[d].length + (d === 3 ? 1 : 0)} ${TX('equipos')}</small></h3><div class="cclubs">${CAREER_START[d].filter(k => TEAM(k)).map(k =>
      `<button class="cclub ${N.club === k ? 'sel' : ''}" data-cclub="${k}"><img class="ccrest" src="ui/crest${crestOf(k)}.png" alt=""><span><b>${esc(TEAM(k).name)}</b><small>${TX('media')} ${teamAvg(k)} · ${Shop.ownsClub(k) ? '✓' : '🔒 ' + Shop.clubPrice(teamAvg(k)) + ' 🪙'}</small></span></button>`).join('')}</div>`).join('') : '';
    screen(`${top(TX('Nueva carrera'))}
      <div class="opts" id="cMode"><button data-cmode="crear" aria-pressed="${!own}">${TX('✨ Crear tu club')}</button><button data-cmode="elegir" aria-pressed="${own}">${TX('🏟️ Elegir un club')}</button></div>
      ${own ? `<p class="note">${TX('Coges un club que ya existe: juegas en su división, con su nombre, su escudo, su equipación y sus jugadores. Cuanto más arriba, más difícil.')} ${TX('Cada club se compra una vez con monedas y es tuyo para siempre: cuanto mejor es su plantilla, más caro.')} <b>🪙 ${Profile.data.coins}</b></p>`
        : `<p class="note">${TX('Eres el')} <b>${TX('mánager')}</b> ${TX('de un club de instituto a punto de desaparecer. Empiezas en')} <b>${TX('Tercera División')}</b> ${TX('con 7 chavales normales.')}</p>`}
      <p class="note">${TX('Las 3 divisiones tienen 12 equipos. Los 2 primeros suben y del 3º al 6º juegan un')} <b>${TX('playoff')}</b> ${TX('por la tercera plaza; los 3 últimos bajan. Ficha jugadores, mejora el club y gana la')} <b>${TX('Primera')}</b>${TX('… pero si la fama llega a 0, cierran el club.')}</p>
      <h3>${TX('Elige a tu mánager')}</h3><div class="cmgrs" id="cMgrs"></div>
      ${own ? clubs : `<h3>${TX('Nombre del instituto')}</h3><div class="giftin"><input id="cSchool" type="text" maxlength="24" value="${esc(N.school)}" autocomplete="off" spellcheck="false" style="text-transform:none"></div>`}
      <h3>${TX('Dificultad')}</h3><div class="opts" id="cDiff">${Object.entries(CAREER_DIFF).map(([k, D]) => `<button data-diff="${k}" aria-pressed="${k === N.diff}">${D.name}</button>`).join('')}</div>
      <p class="note">${own ? TX('Luego puedes cambiar la equipación y el escudo en «Club».') : TX('La equipación y el escudo se eligen después en «Club».')} ${TX('Ganar ligas, la Copa o ascender da tickets para el gacha.')}</p>
      ${Career.hall().length ? '<button class="ghost" id="cHall">' + TX('🏛️ Salón de la fama') + '</button>' : ''}
      ${bottom('<button class="cta" id="cGo">' + (own && N.club && !Shop.ownsClub(N.club) ? TX('🔓 Comprar {0} · {1} 🪙', esc(TEAM(N.club).name), Shop.clubPrice(teamAvg(N.club))) : own && N.club ? TX('Empezar con {0}', esc(TEAM(N.club).name)) : TX('Empezar carrera')) + '</button>')}`, 'bg_title');
    const keepName = () => { if ($('cSchool')) N.school = $('cSchool').value; };
    body.querySelectorAll('[data-cmode]').forEach(b => b.onclick = () => { keepName(); N.mode = b.dataset.cmode; Sound.sfx('click'); renderCareerNew(); });
    body.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => { N.diff = b.dataset.diff; body.querySelectorAll('[data-diff]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    body.querySelectorAll('[data-cclub]').forEach(b => b.onclick = () => { const y = $('screen').scrollTop; N.club = b.dataset.cclub; Sound.sfx('click'); renderCareerNew(); $('screen').scrollTop = y; });
    if ($('cHall')) $('cHall').onclick = () => renderHall(renderCareerNew);
    const box = $('cMgrs');
    [...MANAGERS, ...(Halloween.rayUnlocked() ? [RAY_DARK] : [])].filter(id => PLAYER(id)).forEach(id => {
      const b = document.createElement('button'); b.className = 'cmgr' + (id === N.pick ? ' sel' : '') + (id === RAY_DARK ? ' ray' : '');
      b.appendChild(mgrFace(id, 64)); b.insertAdjacentHTML('beforeend', `<span>${esc(PLAYER(id).name)}</span>${id === RAY_DARK ? `<small>${TX('+10 % de ingresos')}</small>` : ''}`);
      b.onclick = () => { N.pick = id; box.querySelectorAll('.cmgr').forEach(x => x.classList.toggle('sel', x === b)); Sound.sfx('click'); };
      box.appendChild(b);
    });
    if ($('cSchool')) { $('cSchool').addEventListener('keydown', e => e.stopPropagation()); $('cSchool').oninput = keepName; }
    $('cGo').onclick = () => {
      if (own && !N.club) return UI.toast(TX('Elige un club de la lista'));
      if (own && !Shop.ownsClub(N.club)) {
        const r = Shop.buyClub(N.club, teamAvg(N.club));
        if (!r.ok) return UI.toast(r.msg);
        Sound.sfx('reveal'); UI.toast(TX('¡{0} ya es tuyo!', TEAM(N.club).name));
        const y = $('screen').scrollTop; renderCareerNew(); $('screen').scrollTop = y; return;
      }
      if (own) Career.create(N.pick, null, N.diff, N.club);
      else Career.create(N.pick, ($('cSchool').value || '').trim() || TX('Instituto Inazuma'), N.diff);
      Sound.sfx('reveal'); renderCareerClub(true);
    };
    $('back').onclick = renderMenu;
  }
  /* ---------- Mundial de Carrera ---------- */
  const wcCrest = k => k === 'JP' ? '<img class="ccrest" src="ui/crest3016.png" alt="">' : `<img class="ccrest" src="ui/crest${crestOf(k)}.png" alt="">`;
  const wcName = k => k === 'JP' ? TX('Inazuma Japón') : k;
  function renderWC(last) {
    const c = Career.data, w = c.wc; tutorial('wc');
    if (w.state === 'call') {
      const cands = Career.wcCandidates(), sel = new Set(w.pick || []);
      screen(`${top(TX('Mundial · Convocatoria'), 'cBack', TX('Club'))}
        <div class="chead"><img class="ccrest big" src="ui/crest3016.png" alt=""><div><b>${TX('Inazuma Japón')}</b><small>${TX('Mundial · temporada')} ${w.season} ${TX('· eres el seleccionador')}</small></div></div>
        <p class="note">${TX('Convoca a')} <b>${TX('10 jugadores')}</b> ${TX('(dos equipos de 5): los de tu club y los mejores de las ligas (los que juegan en Primera y en los equipos de arriba destacan más). Antes de cada partido eliges qué 5 juegan.')}</p>
        <div class="sortrow"><span id="wcN"></span><button class="ghost mini" id="wcAuto">${TX('⚡ Los 10 mejores')}</button></div>
        <div class="pgrid" id="wcL"></div>
        ${bottom('<button class="cta" id="wcGo" disabled>' + TX('🌍 Empezar el Mundial') + '</button>')}`, 'bg_team');
      const draw = () => {
        const L = $('wcL'); L.innerHTML = '';
        cands.forEach(x => {
          const pd = PLAYER(x.id), el = tile(x.id, `<span class="slot">${x.club === YOU ? TX('Tu club') : esc(Career.teamName(x.club))} ${TX('· media')} ${Career.wcScore(x.id)}</span>`);
          if (sel.has(x.id)) el.classList.add('sel');
          el.onclick = () => { if (sel.has(x.id)) sel.delete(x.id); else if (sel.size < 10) sel.add(x.id); else return UI.toast(TX('Ya tienes 10: quita uno antes')); Sound.sfx('click'); w.pick = [...sel]; draw(); };
          L.appendChild(el);
        });
        $('wcN').textContent = sel.size + TX(' de 10 convocados'); $('wcGo').disabled = sel.size !== 10;
      };
      $('wcAuto').onclick = () => {
        const roles = FORMATIONS[c.formation].roles, pool = cands.map(x => x.id);
        sel.clear(); const ranked = pool.slice().sort((a, b) => Career.wcScore(b) - Career.wcScore(a));
        Career.wcRoles(ranked).forEach(id => sel.add(id)); Career.wcRoles(ranked.filter(id => !sel.has(id))).forEach(id => sel.add(id));
        ranked.forEach(id => { if (sel.size < 10) sel.add(id); });
        w.pick = [...sel]; Sound.sfx('reveal'); draw();
      };
      $('wcGo').onclick = () => { Career.wcStart([...sel]); Sound.sfx('reveal'); renderWC(); };
      $('cBack').onclick = () => UI.toast(TX('Primero convoca a tu selección'));
      draw(); return;
    }
    const tableHtmlWC = () => w.group ? `<table class="ctable"><tr><th></th><th></th><th>${TX('Grupo')}</th><th>${TX('Pts')}</th><th>DG</th></tr>${Career.wcTable().map((r, i) =>
      `<tr class="${r.key === 'JP' ? 'you' : ''} ${i < 2 ? 'zup' : ''}"><td>${i + 1}</td><td>${wcCrest(r.key)}</td><td class="tn">${esc(wcName(r.key))}</td><td><b>${r.pts}</b></td><td>${r.gf - r.gc > 0 ? '+' : ''}${r.gf - r.gc}</td></tr>`).join('')}</table>` : '';
    const lastHtml = last ? `<div class="cvs"><div>${wcCrest('JP')}<b>${TX('Japón')}</b></div><span>${last.gA} - ${last.gB}</span><div>${wcCrest(last.opp)}<b>${esc(last.opp)}</b></div></div>
      ${last.pens ? `<p class="cweek">${TX('Penaltis:')} <b>${last.pens[0]} - ${last.pens[1]}</b></p>` : ''}${last.msg ? `<p class="note cmsg ${w.state === 'out' ? 'bad' : 'gold'}">${esc(last.msg)}</p>` : ''}` : '';
    if (w.state === 'out' || w.state === 'champion') {
      const R = w.reward || {};
      screen(`<h2>${w.state === 'champion' ? TX('🏆 ¡Campeones del mundo!') : TX('Fin del Mundial')}</h2>${lastHtml}
        <p class="cweek">${TX('Resultado:')} <b>${{ campeón: TX('Campeones'), final: TX('Subcampeones'), semi: TX('Semifinalistas'), grupo: TX('Fase de grupos') }[w.place]}</b></p>
        <p class="note cmsg gold">${TX('Fama')} ${R.fame >= 0 ? '+' : ''}${R.fame} · +${R.money} ${TX('💰 para tu club · +')}${R.tickets} ${TX('🎟️ para el gacha')}</p>
        <div class="cres">${w.log.map(l => `<p>${l.r}${TX(': Japón')} <b>${l.gA} - ${l.gB}</b> ${esc(l.opp)}${l.pens ? ` ${TX('(pen.')} ${l.pens[0]}-${l.pens[1]})` : ''}</p>`).join('')}</div>
        ${tableHtmlWC()}
        ${bottom('<button class="cta" id="wcEnd">' + TX('Volver al club') + '</button>')}`, w.state === 'champion' ? 'ill27' : 'bg_green');
      $('wcEnd').onclick = () => { Career.wcClose(); Sound.music('menu'); renderCareer(); };
      return;
    }
    const stage = w.state === 'group' ? `${TX('Fase de grupos · partido')} ${w.round + 1} ${TX('de 3')}` : w.state === 'semi' ? TX('Semifinal') : TX('¡FINAL!');
    screen(`${top(TX('Mundial · ') + (w.state === 'group' ? TX('Grupo') : w.state === 'semi' ? TX('Semifinal') : TX('Final')), 'cBack', TX('Club'))}
      ${lastHtml}
      <div class="cvs"><div>${wcCrest('JP')}<b>${TX('Inazuma Japón')}</b><small>${TX('media')} ${Career.wcRating('JP')}</small></div><span>VS</span><div>${wcCrest(w.opp)}<b>${esc(w.opp)}</b><small>${TX('media')} ${Career.wcRating(w.opp)}</small></div></div>
      <p class="cweek">${stage}${w.state !== 'group' ? TX(' · si hay empate, penaltis') : ''}</p>
      <div class="cres"><p>${TX('Juegan:')} ${w.squad.map(id => esc(PLAYER(id).name)).join(', ')}</p></div><button class="ghost" id="wcLine">${TX('👥 Alineación (10 convocados · 2 equipos)')}</button>
      ${tableHtmlWC()}
      ${bottom('<div class="grid2"><button class="cta" id="wcPlay">' + TX('⚽ Jugar') + '<small>' + TX('tú controlas') + '</small></button><button class="cta" id="wcSim">' + TX('📋 Simular') + '<small>' + TX('como seleccionador') + '</small></button></div>')}`, 'bg_vs');
    $('wcLine').onclick = () => renderWCLine();
    $('wcPlay').onclick = () => { api.mode = 'wc'; startMatch(Career.wcTeams(), w.state !== 'group', TEAM_FIELD[w.opp] || 'normal', w.state === 'final' ? 'match_final' : 'match_hard', w.opp); };
    $('wcSim').onclick = () => { const s = Career.wcSim(), r = Career.wcResult(s.gA, s.gB); Sound.sfx(r.gA > r.gB ? 'reveal' : 'click'); renderWC(r); };
    $('cBack').onclick = () => UI.toast(TX('Termina el Mundial para volver al club'));
  }
  function renderCareerPre(msg) {
    const c = Career.data, nm = Career.nextMatch(), d = Career.myDiv();
    const title = nm.type === 'liga' ? TX('Partido de liga') : nm.type === 'copa' ? TX('Copa · ') + CUP_ROUND[nm.round] : nm.type === 'semi' ? TX('Playoff · semifinal') : TX('Playoff · FINAL');
    screen(`${top(title, 'cBack', TX('Club'))}
      ${msg ? `<p class="note cmsg">${esc(msg)}</p>` : ''}
      <div class="cvs"><div>${cCrest(YOU)}<b>${esc(c.school)}</b><small>${TX('media')} ${Career.myRating()}</small></div><span>VS</span><div>${cCrest(nm.rival)}<b>${esc(Career.teamName(nm.rival))}</b><small>${TX('media')} ${Career.rating(nm.rival)}</small></div></div>
      <p class="cweek">${nm.type === 'liga' ? TX('Jornada {0} de {1}', Career.jornadaNum(nm.j), Career.leagueRounds(d)) : nm.type === 'copa' ? `${TX('Copa Inazuma ·')} ${CUP_ROUND[nm.round]} ${TX('· a partido único, con penaltis')}` : TX('Eliminatoria: si hay empate, penaltis')} · ${DIV_NAME[d]} · ${nm.home ? TX('en casa') : TX('fuera')} ${TX('· forma')} ${c.forma} %</p>
      <button class="ghost" id="cLine">${TX('👥 Alineación (')}${c.formation} · ${FORMATIONS[c.formation].name})</button>
      <h3>${TX('Táctica')} <small>${TX('cuenta sobre todo al simular')}</small></h3>
      <div class="opts">${Object.entries(TACTICS).map(([k, t]) => `<button data-tac="${k}" aria-pressed="${c.tactic === k}">${t.name}</button>`).join('')}</div>
      <p class="note" id="cTacD">${TACTICS[c.tactic].desc}</p>
      ${bottom('<div class="grid2"><button class="cta" id="cPlay">' + TX('⚽ Jugar') + '<small>' + TX('tú controlas') + '</small></button><button class="cta" id="cSim">' + TX('📋 Simular') + '<small>' + TX('como mánager') + '</small></button></div>')}`, 'bg_vs');
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
    $('cBack').onclick = () => UI.toast(TX('Primero juega o simula el partido de esta semana'));
  }
  function renderCareerSim(r) {
    const c = Career.data;
    screen(`<h2>${TX('Simulación')}</h2>
      <div class="cvs sim"><div>${cCrest(YOU)}<b>${esc(c.school)}</b></div><span id="cSc">0 - 0</span><div>${cCrest(r.rival)}<b>${esc(Career.teamName(r.rival))}</b></div></div>
      <p class="cweek" id="cMin">0'</p><div class="cfeed" id="cFeed"></div>
      ${bottom('<button class="ghost" id="cSkip">' + TX('Saltar al final ▶▶') + '</button><button class="cta" id="cDone" hidden>' + TX('Continuar') + '</button>')}`, 'bg_vs');
    let min = 0, i = 0, a = 0, b = 0, done = false;
    Sound.music('match_mid');
    const feed = $('cFeed');
    const show = e => {
      if (e.type === 'goal') { if (e.team === 'A') a++; else b++; $('cSc').textContent = a + ' - ' + b; Sound.sfx('goal'); }
      const line = e.type === 'pens' ? `🥅 <b>${TX('Penaltis:')} ${e.a} - ${e.b}</b> · ${e.a > e.b ? TX('¡pasáis!') : TX('eliminados…')}`
        : e.type === 'goal' ? `⚽ <b>${TX('¡Gol')}${e.team === 'A' ? '' : ' rival'}!</b> ${esc(e.name)}${e.tech ? ' ' + TX('con') + ' <b>' + esc(e.tech) + '</b>' : ''}` : `${TX('🧤 Parada de')} ${esc(e.name || TX('el portero'))}`;
      feed.insertAdjacentHTML('afterbegin', `<p class="${e.team === 'B' ? 'rival' : 'mine'}"><i>${e.min}'</i> ${line}</p>`);
    };
    const finish = () => {
      if (done) return; done = true; clearInterval(iv);
      while (i < r.events.length) show(r.events[i++]);
      $('cMin').textContent = TX('Final'); Sound.sfx('whistleEnd');
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
    return `<table class="ctable"><tr><th></th><th></th><th>${TX('Equipo')}</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>${TX('Pts')}</th></tr>${rows.map((r, i) =>
      `<tr class="${r.key === YOU ? 'you' : ''} ${d > 1 && i < 2 ? 'zup' : ''} ${d > 1 && i >= 2 && i < 6 ? 'zpo' : ''} ${d < 3 && i >= rows.length - 3 ? 'zdown' : ''}"><td>${i + 1}</td><td>${cCrest(r.key)}</td><td class="tn">${esc(Career.teamName(r.key))}</td><td>${r.pj}</td><td>${r.g}</td><td>${r.e}</td><td>${r.p}</td><td>${r.gf - r.gc > 0 ? '+' : ''}${r.gf - r.gc}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table>
      <p class="note ckey">${d > 1 ? '<span class="zup">■</span> ' + TX('ascenso ·') + ' <span class="zpo">■</span> ' + TX('playoff ·') + ' ' : ''}${d < 3 ? '<span class="zdown">■</span> ' + TX('descenso') : TX('Tercera: los 3 últimos pierden fama')}</p>`;
  }
  function renderCareerJornada(out) {
    const c = Career.data, d = Career.myDiv(), win = careerWon(out), draw = out.gA === out.gB && !out.pens;
    const isPO = out.type !== 'L';
    screen(`<h2>${win ? TX('¡Victoria!') : draw ? TX('Empate') : TX('Derrota')}</h2>
      <div class="cvs"><div>${cCrest(YOU)}<b>${esc(c.school)}</b></div><span>${out.gA} - ${out.gB}</span><div>${cCrest(out.rival)}<b>${esc(Career.teamName(out.rival))}</b></div></div>
      ${out.pens ? `<p class="cweek">${TX('Penaltis:')} <b>${out.pens[0]} - ${out.pens[1]}</b></p>` : ''}
      <p class="cweek">${TX('Fama')} ${out.fame >= 0 ? '+' : ''}${out.fame} ${TX('· Taquilla +')}${out.money} ${TX('💰 · Forma')} ${c.forma} %</p>
      ${out.prog && out.prog.length ? `<p class="note cprog">${out.prog.map(x => `${x.d > 0 ? '📈' : '📉'} ${esc(PLAYER(x.id).name)} ${x.d > 0 ? '+1' : '−1'} ${STAT_LABEL[x.k]}`).join(' · ')}</p>` : ''}
      ${c.over ? '<p class="note cmsg bad">' + TX('La fama ha llegado a 0…') + '</p>' : ''}
      ${out.vencido ? `<div class="cnext vencido" id="cVen"><span id="cVenF"></span><div><b>${TX('¡')}${esc(PLAYER(out.vencido.id).name)} ${TX('quiere unirse a tu club!')}</b><small>${TX('Jugaba en')} ${esc(Career.teamName(out.vencido.key))} · ${PLAYER(out.vencido.id).role} · ${rchip(PLAYER(out.vencido.id).rarity)}</small>
        <button class="cta" id="cVenOk">${TX('Fichar por')} ${out.vencido.price} 💰</button></div></div>` : ''}
      ${out.cupWinner ? `<p class="note cmsg gold">🏆 ${out.cupWinner === YOU ? '<b>' + TX('¡Campeones de la Copa Inazuma!') + '</b> ' + TX('+10 🎟️ para el gacha') : TX('Campeón de Copa: ') + esc(Career.teamName(out.cupWinner))}</p>` : ''}
      ${out.type === 'C' ? `<h3>${TX('Copa Inazuma ·')} ${CUP_ROUND[out.cupRound]}</h3><div class="cres">${(out.results.cup || []).map(poLine).join('')}</div>`
        : isPO ? `<h3>${TX('Playoff de ascenso ·')} ${DIV_NAME[d]}</h3><div class="cres">${(out.results[d] || []).map(poLine).join('')}</div>`
        : `<h3>${TX('Resultados de la jornada ·')} ${DIV_NAME[d]}</h3>
      <div class="cres">${out.results[d].map(([a, b, ga, gb]) => `<p class="${a === YOU || b === YOU ? 'you' : ''}">${esc(Career.teamName(a))} <b>${ga} - ${gb}</b> ${esc(Career.teamName(b))}</p>`).join('')}</div>
      <h3>${TX('Clasificación')}</h3>${tableHtml(d, Career.standings(d))}`}
      ${bottom('<button class="cta" id="cNext">' + TX('Continuar') + '</button>')}`, win ? 'ill27' : draw ? 'bg_green' : 'ill14');
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
    const msg = sum.goal ? '<p class="note cmsg gold">🏆 <b>' + TX('¡Campeones de Primera División!') + '</b> ' + TX('Has completado la carrera. Tu club entra en el salón de la fama… y puedes seguir jugando temporadas para siempre (los rivales mejoran cada año).') + '</p>'
      : sum.champion ? `<p class="note cmsg gold">${TX('🏆 ¡Campeones de')} ${DIV_NAME[d]}!</p>` : '';
    const move = sum.moves.includes('up') ? `<p class="note cmsg gold">${TX('⬆️ ¡Ascenso a')} ${DIV_NAME[d - 1]}!${sum.playoff ? TX(' (por el playoff)') : ''}</p>` : sum.moves.includes('down') ? `<p class="note cmsg bad">${TX('⬇️ Descenso a')} ${DIV_NAME[d + 1]}…</p>` : sum.warning ? '<p class="note cmsg bad">' + TX('El director no está contento: últimos de Tercera.') + '</p>' : '';
    const names = ids => ids.map(id => esc(PLAYER(id).name)).join(', ') || 'nadie';
    screen(`<h2>${TX('Fin de la temporada')} ${sum.season}</h2>
      <p class="cweek">${DIV_NAME[d]} ${TX('División · puesto')} <b>${ordTx(sum.pos)}</b> ${TX('· fama')} ${sum.fame >= 0 ? '+' : ''}${sum.fame} ${TX('· premio +')}${sum.money} 💰</p>
      ${msg}${move}
      ${sum.cupWinner ? `<p class="note">${TX('🏆 Copa Inazuma:')} ${sum.cupWinner === YOU ? '<b>' + TX('¡tu club!') + '</b>' : esc(Career.teamName(sum.cupWinner))}</p>` : ''}
      ${sum.wc ? '<p class="note cmsg gold">🌍 <b>' + TX('¡Llega el Mundial!') + '</b> ' + TX('Te han nombrado seleccionador de Inazuma Japón: convoca a los mejores de las ligas.') + '</p>' : ''}
      ${sum.tickets ? `<p class="note cmsg gold">🎟️ +${sum.tickets} ${TX('tickets para el gacha por tus logros de la temporada')}</p>` : ''}
      ${c.over ? '<p class="note cmsg bad">' + TX('La fama ha llegado a 0 y el director cierra el club.') + '</p>' : ''}
      <h3>${TX('Ascensos y descensos')}</h3>
      <p class="note">${TX('⬆️ A Primera:')} ${sum.promoted[1].map(k => esc(Career.teamName(k))).join(', ')}<br>${TX('⬆️ A Segunda:')} ${sum.promoted[2].map(k => esc(Career.teamName(k))).join(', ')}<br>
      ${TX('⬇️ A Segunda:')} ${sum.relegated[1].map(k => esc(Career.teamName(k))).join(', ')}<br>${TX('⬇️ A Tercera:')} ${sum.relegated[2].map(k => esc(Career.teamName(k))).join(', ')}</p>
      <h3>${TX('Tu plantilla')}</h3>
      <p class="note">${TX('🎓 Se gradúan ({0}):', yearTx(LAST_YEAR))} ${names(sum.grads)}<br>${TX('🌱 Llegan de la cantera:')} ${names(sum.youth)}<br>${TX('📈 El resto pasa de curso y gana experiencia:')} <b>+${sum.growth || 1} ${TX('en todas sus stats')}</b>.</p>
      ${(sum.pendingYouth || []).length ? `<p class="note cmsg gold">🌱 ${names(sum.pendingYouth)} ${sum.pendingYouth.length > 1 ? 'quieren' : 'quiere'} ${TX('entrar, pero la plantilla está llena: ahora eliges si haces hueco.')}</p>` : ''}
      ${sum.goal ? hallHtml() : ''}
      ${bottom(`<button class="cta" id="cNext">${c.over ? TX('Ver resumen') : sum.goal ? TX('Seguir jugando (infinito)') : TX('Empezar temporada ') + c.season}</button>`)}`, sum.champion || sum.moves.includes('up') ? 'ill25' : 'bg_team');
    if (sum.champion || sum.moves.includes('up')) Sound.jingle('win');
    $('cNext').onclick = () => { Sound.music('menu'); c.over ? renderCareerOver() : renderCareer(); };
  }
  // Juveniles que no caben: entra si dejas ir a alguien, o se va a otro instituto
  function renderYouthChoice(next) {
    const c = Career.data, kid = (c.pendingYouth || [])[0];
    if (!kid) return next();
    const pd = PLAYER(kid.id);
    screen(`<h2>${TX('🌱 Llega un juvenil')}</h2>
      <p class="note"><b>${esc(pd.name)}</b> (${ROLE_LABEL[pd.role]}${TX(', 1º curso) quiere entrar en el club, pero tu plantilla está llena (')}${SQUAD_MAX}/${SQUAD_MAX}${TX('). ¿Le haces hueco?')}</p>
      <div class="csquad" id="yKid"></div>
      <h3>${TX('Elige a quién dejas ir')}</h3>
      <p class="note">${TX('Ordenados de peor a mejor. Se va del club sin cobrar nada.')}</p>
      <div class="csquad" id="ySquad"></div>
      ${bottom(`<button class="ghost" id="yNo">${TX('No, que')} ${esc(pd.name)} ${TX('se vaya a otro instituto')}</button>`)}`, 'bg_team');
    $('yKid').appendChild(playerRow(kid.id, `<span class="cst">${TX('1º curso · de la cantera')}</span>`, kid));
    c.squad.slice().sort((a, b) => Career.ovr(a) - Career.ovr(b)).forEach(m => {
      const el = playerRow(m.id, `<span class="cst">${yearTx(m.year)}${c.lineup.includes(m.id) ? ' · <b>' + TX('titular') + '</b>' : ''}</span><button class="ghost mini">${TX('Dejar ir')}</button>`, m);
      el.querySelector('button').onclick = () => { const r = Career.resolveYouth(kid.id, m.id); if (r.ok) { UI.toast(r.msg, 2000); Sound.sfx('reveal'); renderYouthChoice(next); } };
      $('ySquad').appendChild(el);
    });
    $('yNo').onclick = () => { const r = Career.resolveYouth(kid.id, null); if (r.ok) UI.toast(r.msg, 1800); renderYouthChoice(next); };
  }
  function hallHtml() {
    const c = Career.data;
    return `<h3>${TX('Salón de la fama')}</h3><p class="note">${esc(c.school)} ${TX('· mánager')} ${esc(PLAYER(c.manager).name)}<br>
      ${TX('Temporadas:')} <b>${c.history.length}</b> ${TX('· Títulos:')} <b>${c.titles.length}</b>${c.titles.length ? ' (' + c.titles.map(t => esc(t.name) + ' ' + TX('T{0}', t.season)).join(', ') + ')' : ''}<br>
      ${TX('Recorrido:')} ${c.history.map(h => TX('T{0}', h.season) + ' ' + DIV_NAME[h.div][0] + ordTx(h.pos) + (h.up ? '⬆' : h.down ? '⬇' : '')).join(' · ') || '—'}</p>`;
  }
  function renderCareerOver() {
    screen(`<h2>${TX('Fin de la carrera')}</h2><p class="note cmsg bad">${TX('La fama del club ha llegado a 0 y el director ha cerrado el club de fútbol.')}</p>
      ${hallHtml()}
      ${bottom('<div class="grid2"><button class="cta" id="cNew">' + TX('Nueva carrera') + '</button><button class="ghost" id="cMenu">' + TX('Menú') + '</button></div>')}`, 'ill15');
    $('cNew').onclick = () => { Career.clear(); renderCareerNew(); };
    $('cMenu').onclick = renderMenu;
  }
  function renderCareerTable(d, back) {
    const c = Career.data;
    const po = c.po && c.po[d] ? `<h3>${TX('Playoff')}</h3><div class="cres">${[...(c.po[d].res || []), ...(c.po[d].finalRes ? [c.po[d].finalRes] : [])].map(poLine).join('') || '<p>' + TX('Semifinales:') + ' ' + c.po[d].semis.map(([a, b]) => esc(Career.teamName(a)) + ' – ' + esc(Career.teamName(b))).join(' · ') + '</p>'}</div>` : '';
    screen(`${top(TX('Clasificación'))}
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
          : C && C.round === r && Career.cupTie() ? 'vs ' + esc(Career.teamName(Career.cupTie().find(k => k !== YOU))) : C && (C.out || C.winner) && r >= C.round ? '<small>' + TX('(sin ti)') + '</small>' : '';
        return `<p class="${w === c.week ? 'now' : ''}"><i>${TX('S{0}', w)}</i> ${TX('🏆 Copa ·')} ${CUP_ROUND[r]} ${txt}</p>`;
      }
      if (t !== 'L') return `<p class="${w === c.week ? 'now' : ''}"><i>${TX('S{0}', w)}</i> ${t === 'P1' ? TX('Playoff · semifinales') : TX('Playoff · final')} <small>${TX('(3º a 6º de Segunda y Tercera)')}</small></p>`;
      const m = (c.fix[d][j] || []).find(p => p.includes(YOU));
      if (!m) return `<p class="${w === c.week ? 'now' : ''}"><i>${TX('S{0}', w)}</i> <small>${TX('Jornada de descanso')}</small></p>`;
      const rv = m[0] === YOU ? m[1] : m[0], jn = c.fix[d].slice(0, j + 1).filter(r => r.length).length - 1;
      const res = (c.results[d][j] || []).find(r => r[0] === YOU || r[1] === YOU);
      const sc = res ? (res[0] === YOU ? res[2] + ' - ' + res[3] : res[3] + ' - ' + res[2]) : '';
      return `<p class="${w === c.week ? 'now' : ''}"><i>${TX('S{0}', w)}</i> ${TX('J{0}', jn + 1)} ${m[0] === YOU ? 'vs' : TX('en')} ${cCrest(rv)} ${esc(Career.teamName(rv))} ${sc ? '<b>' + sc + '</b>' : ''}</p>`;
    }).join('');
    screen(`${top(TX('Calendario'))}<p class="cweek">${TX('Temporada')} ${c.season} · ${DIV_NAME[d]} ${TX('División')}</p><div class="cres ccal">${rows}</div>`, 'bg_green');
    $('back').onclick = renderCareer;
  }
  const statsLine = m => STAT_KEYS.map(k => `${STAT_LABEL[k].slice(0, 3)} <b>${Career.stat(m, k)}</b>`).join(' · ');
  function playerRow(id, extra, m) {
    const pd = PLAYER(id), el = document.createElement('div'); el.className = 'cpl';
    el.appendChild(face(Sprites.refOf(pd), 48));
    m = m || Career.member(id);
    el.insertAdjacentHTML('beforeend', `<div class="cplb"><b>${esc(pd.name)}</b> <small>${RAB(pd.role)} · ${rchip(pd.rarity)} ${TX('· media')} ${Career.ovr(m)}</small>
      <span class="cst">${statsLine(m)}</span>${extra || ''}</div>`);
    return el;
  }
  function renderCareerSquad(back, sel = 0) {
    const c = Career.data;
    if (!Career.lineupOk()) Career.autoLineup();
    const roles = FORMATIONS[c.formation].roles;
    screen(`${top(TX('Plantilla'))}
      ${formSelect(c)}
      <div class="edbar"><button class="ghost" id="cAuto">${TX('⚡ Mejor equipo')}</button><span class="note">${TX('Media:')} <b>${Career.myRating()}</b> · ${c.squad.length}/${SQUAD_MAX} ${TX('jugadores')}</span></div>
      <div id="cPitch"></div>
      <h3>${TX('Puesto:')} ${ROLE_LABEL[roles[sel]]} <small>${TX('toca un jugador para ponerlo')}</small></h3>
      <div class="csquad" id="cList"></div>`, 'bg_green');
    $('cPitch').appendChild(pitch(roles, c.lineup.map((id, i) => { const m = Career.m(id), pd = PLAYER(id); return { ref: Sprites.refOf(pd), name: pd.name, rarity: pd.rarity, badge: Career.rate(m, roles[i]) }; }),
      sel, i => renderCareerSquad(back, i)));
    $('formSel').onchange = e => { c.formation = e.target.value; Career.autoLineup(); Career.save(); renderCareerSquad(back, 0); };
    $('cAuto').onclick = () => { Career.autoLineup(); Career.save(); Sound.sfx('reveal'); renderCareerSquad(back, sel); };
    const list = $('cList');
    c.squad.slice().sort((a, b) => Career.rate(b, roles[sel]) - Career.rate(a, roles[sel])).forEach(m => {
      const at = c.lineup.indexOf(m.id);
      const el = playerRow(m.id, `<span class="cst">${yearTx(m.year)}${m.year >= LAST_YEAR ? TX(' (se gradúa al acabar)') : ''}${at >= 0 ? TX(' · titular (') + RAB(roles[at]) + ')' : ''} ${TX('· nota aquí')} ${Career.rate(m, roles[sel])} · ${m.games} ${TX('PJ ·')} ${m.goals} ${TX('goles')}</span>
        <span class="cst">⚡ ${Career.equipped(m).map(t => esc(TECH(t).name)).join(' · ') || TX('sin técnicas')} <button class="ghost mini ctech">${TX('Técnicas')}</button></span>`, m);
      el.classList.add('btn'); if (at >= 0) el.classList.add('sel');
      el.querySelector('.ctech').onclick = e => { e.stopPropagation(); renderCareerTechs(m.id, () => renderCareerSquad(back, sel)); };
      el.onclick = () => {
        if (roles[sel] === 'POR' && !playsAs(PLAYER(m.id), 'POR')) return UI.toast(TX('A portería solo pueden ir porteros'));
        if (at >= 0 && roles[at] === 'POR' && !playsAs(PLAYER(c.lineup[sel]), 'POR')) return UI.toast(TX('Así la portería se quedaría sin portero'));
        if (at >= 0) c.lineup[at] = c.lineup[sel];
        c.lineup[sel] = m.id; Career.save(); Sound.sfx('click'); renderCareerSquad(back, sel);
      };
      list.appendChild(el);
    });
    $('back').onclick = back;
  }

  function renderCareerTechs(id, back) {
    const m = Career.m(id), pd = PLAYER(id), eq = Career.equipped(m), ls = Career.learnset(id);
    screen(`${top(TX('Técnicas · ') + esc(pd.name))}
      <p class="note">${TX('Elige hasta')} <b>${TECH_SLOTS}</b> ${TX('técnicas para los partidos entre las que')} <b>${esc(pd.name)}</b> ${TX('ya ha aprendido')} (${m.known.length}/${ls.length}). ${TX('Las demás se desbloquean con la actividad «Técnicas» de la semana.')}</p>
      <div class="csquad" id="ctL"></div>`, 'bg_green');
    const L = $('ctL');
    ls.forEach(t => {
      const T = TECH(t), on = eq.includes(t), learned = m.known.includes(t), el = document.createElement('button');
      el.className = 'cpl btn' + (on ? ' sel' : '') + (learned ? '' : ' locked');
      el.innerHTML = `<div class="cplb"><b>${TYPE_ICON[T.type] || '★'} ${esc(T.name)}</b> <small>${TYPE_LABEL[T.type]} ${TX('· potencia')} ${T.power} · ${chip(T.elem)}</small><span class="cst">${on ? TX('✅ Equipada') : learned ? TX('Aprendida · toca para equipar') : TX('🔒 Sin aprender')}</span></div>`;
      el.onclick = () => { if (!learned) return UI.toast(TX('Aún no la ha aprendido: entrena «Técnicas» en la semana')); Career.toggleEquip(id, t); Sound.sfx('click'); renderCareerTechs(id, back); };
      L.appendChild(el);
    });
    if (!ls.length) L.innerHTML = '<p class="note">' + TX('Este jugador no aprende técnicas.') + '</p>';
    $('back').onclick = back;
  }
  function renderWCLine(sel = 0) {
    const c = Career.data, w = c.wc, roles = FORMATIONS[c.formation].roles;
    screen(`${top(TX('Mundial · Alineación'))}
      <div class="edbar"><button class="ghost" id="wlBest">${TX('⚡ Mejores 5')}</button><button class="ghost" id="wl2">${TX('🔄 Equipo 2 (los otros 5)')}</button></div>
      <p class="note">${TX('Media:')} <b>${Career.wcRating('JP')}</b> ${TX('· formación')} ${c.formation} ${TX('· toca un puesto del campo y luego a un convocado.')}</p>
      <div id="wlPitch"></div><h3>${TX('Puesto:')} ${ROLE_LABEL[roles[sel]]}</h3><div class="pgrid" id="wlL"></div>`, 'bg_green');
    $('wlPitch').appendChild(pitch(roles, w.squad.map(id => ({ ref: Sprites.refOf(PLAYER(id)), name: PLAYER(id).name, rarity: PLAYER(id).rarity, halloween: PLAYER(id).halloween, xmas: PLAYER(id).xmas, selva: PLAYER(id).selva, leyenda: PLAYER(id).leyenda, badge: Career.wcScore(id) })), sel, i => renderWCLine(i)));
    (w.call || w.squad).forEach(id => {
      const at = w.squad.indexOf(id), el = tile(id, `<span class="slot">${at >= 0 ? TX('Juega · ') + RAB(roles[at]) : TX('Banquillo')} ${TX('· media')} ${Career.wcScore(id)}</span>`);
      if (at >= 0) el.classList.add('sel');
      el.onclick = () => { if (Career.wcSet(sel, id) === false) return UI.toast(TX('A portería solo pueden ir porteros')); Sound.sfx('click'); renderWCLine(Math.min(4, sel + 1)); };
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
    const tabs = [['ojeados', `${TX('Ojeados (')}${(c.scout || []).length})`], ['libres', TX('Libres')], ['clubes', TX('Otros clubes')], ['fuera', TX('🌍 Fuera')], ['vender', TX('Vender')]];
    const roleF = `<div class="opts small">${[['', TX('Todos')], ...ROLES4.map(r => [r, RAB(r)])].map(([v, t]) => `<button data-role="${v}" aria-pressed="${mkRole === v}">${t}</button>`).join('')}</div>`;
    screen(`${top(TX('Fichajes'))}
      <p class="cweek">${money(c.money)} ${TX('· plantilla')} ${c.squad.length}/${SQUAD_MAX}${err ? ' · <b>' + TX('llena') + '</b>' : ''}</p>
      <div class="opts">${tabs.map(([k, t]) => `<button data-tab="${k}" aria-pressed="${k === tab}">${t}</button>`).join('')}</div>
      <div id="mkHead"></div><div class="csquad" id="mkList"></div>`, 'bg_green');
    body.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => renderCareerMarket(b.dataset.tab));
    $('back').onclick = renderCareer;
    const list = $('mkList'), head = $('mkHead');
    const buyBtn = (id, price, from, label) => {
      const pd = PLAYER(id), el = playerRow(id, `<span class="cst">${from ? TX('En ') + esc(Career.teamName(from)) + ' · ' : ''}${label || ''}</span><button class="cta mini">${from ? TX('Negociar') : TX('Fichar · ') + price + ' 💰'}</button>`);
      el.querySelector('button').onclick = () => {
        if (from) return renderNegotiation(from, id, tab);
        const r = Career.sign(id, price); UI.toast(r.msg, 2200); if (r.ok) { Sound.sfx('reveal'); renderCareerMarket(tab); }
      };
      return el;
    };
    const roleOk = id => !mkRole || PLAYER(id).role === mkRole;
    if (tab === 'ojeados') {
      head.innerHTML = '<p class="note">' + TX('Joyas que han encontrado tus ojeadores: mucho más baratas que en el mercado, pero solo durante unas semanas. Usa la actividad «Ojear» para buscar más.') + '</p>';
      if (!(c.scout || []).length) list.innerHTML = '<p class="note">' + TX('Aún no hay nadie ojeado.') + '</p>';
      (c.scout || []).forEach(s => list.appendChild(buyBtn(s.id, s.price, null, `${TX('Disponible hasta la semana')} ${Math.min(WEEKS, s.until)}`)));
    } else if (tab === 'libres') {
      head.innerHTML = '<p class="note">' + TX('Agentes libres de esta semana (la lista cambia cada semana). Se fichan al momento, sin negociar.') + '</p>' + roleF;
      const mk = Career.marketList();
      mk.libres.filter(roleOk).forEach(id => { const el = buyBtn(id, Math.round(Career.value(id) * 0.8 / 5) * 5, null, id === mk.star ? TX('⭐ Oportunidad de la semana') : ''); if (id === mk.star) el.classList.add('sel'); list.appendChild(el); });
    } else if (tab === 'clubes') {
      head.innerHTML = `<p class="note">${TX('Haz una oferta a otro club. Sus estrellas cuestan más, y a los clubes de divisiones superiores no les gusta vender a uno de abajo. Si te pasas de tacaño, cortan la negociación hasta la semana siguiente.')}</p>
        <div class="opts">${[1, 2, 3].map(k => `<button data-mdv="${k}" aria-pressed="${k === mkDiv}">${DIV_NAME[k]}</button>`).join('')}</div>${roleF}`;
      Career.clubPlayers(mkDiv).filter(x => roleOk(x.id)).sort((a, b) => Career.value(b.id, b.key) - Career.value(a.id, a.key))
        .forEach(x => list.appendChild(buyBtn(x.id, 0, x.key, TX('valor aprox. ') + Career.value(x.id, x.key) + ' 💰' + (x.star ? TX(' · ⭐ su estrella: pedirán más') : ''))));
    } else if (tab === 'fuera') {
      const countries = [...new Set(GAME.players.filter(p => p.abroad).map(p => p.abroad))].sort();
      mkAbroad = countries.includes(mkAbroad) ? mkAbroad : '';
      head.innerHTML = `<p class="note">${TX('Jugadores')} <b>${TX('fuera del país')}</b>${TX(': las selecciones del mundo del Inazuma 3. Se fichan al momento, pero el traspaso internacional cuesta un 30 % más.')}</p>
        <div class="pfsel" style="grid-template-columns:1fr"><select id="mkCountry"><option value="">${TX('Todos los países')}</option>${countries.map(k => `<option value="${esc(k)}" ${k === mkAbroad ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></div>${roleF}`;
      $('mkCountry').onchange = e => { mkAbroad = e.target.value; renderCareerMarket(tab); };
      const ids = Career.abroadList(mkAbroad).filter(p => roleOk(p.id)).sort((a, b) => Career.value(b.id) - Career.value(a.id));
      if (!ids.length) list.innerHTML = '<p class="note">' + TX('No queda nadie disponible con ese filtro.') + '</p>';
      ids.slice(0, 60).forEach(p => list.appendChild(buyBtn(p.id, Career.abroadPrice(p.id), null, TX('🌍 Fuera del país · ') + esc(p.abroad))));
    } else {
      head.innerHTML = `<p class="note">${TX('Vender: un club paga el 70 % de su valor. Liberar: se va gratis (para hacer hueco). Mínimo')} ${SQUAD_MIN} ${TX('jugadores.')}</p>`;
      c.squad.forEach(m => {
        const el = playerRow(m.id, `<span class="cst">${yearTx(m.year)} ${TX('· valor')} ${Career.value(m.id)} 💰</span><span class="row2"><button class="ghost mini" data-sell>${TX('Vender ·')} ${Math.round(Career.value(m.id) * 0.7 / 5) * 5} 💰</button><button class="ghost mini" data-rel>${TX('Liberar')}</button></span>`, m);
        el.querySelector('[data-sell]').onclick = () => { const r = Career.sell(m.id); UI.toast(r.msg, 2200); if (r.ok) renderCareerMarket(tab); };
        el.querySelector('[data-rel]').onclick = e => {
          if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = TX('¿Seguro?'); return; }
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
    screen(`${top(TX('Negociación'), 'nBack', TX('Fichajes'))}
      <div class="cvs"><div>${cCrest(YOU)}<b>${esc(c.school)}</b><small>${money(c.money)}</small></div><span>⇄</span><div>${cCrest(key)}<b>${esc(Career.teamName(key))}</b><small>${DIV_NAME[Career.divOf(key)]}</small></div></div>
      <div id="nPl"></div>
      <p class="cweek">${TX('Valor de mercado aproximado:')} <b>${val} 💰</b></p>
      <div class="negbox"><button class="ghost" data-d="-0.1">−10 %</button><b id="nAmt">${amount} 💰</b><button class="ghost" data-d="0.1">+10 %</button></div>
      <p class="note cmsg" id="nMsg">${TX('Haz tu oferta.')}</p>
      ${bottom('<div class="grid2"><button class="cta" id="nOffer">' + TX('Ofertar') + '</button><button class="cta" id="nCounter" hidden>' + TX('Aceptar') + '</button></div>')}`, 'bg_vs');
    $('nPl').appendChild(playerRow(id));
    const upd = () => { $('nAmt').textContent = amount + ' 💰'; };
    body.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { amount = Math.max(5, Math.round(amount * (1 + +b.dataset.d) / 5) * 5); upd(); });
    const done = price => {
      const r = Career.sign(id, price, key); UI.toast(r.msg, 2400);
      if (r.ok) { Sound.sfx('reveal'); renderCareerMarket(tab); } else $('nMsg').textContent = r.msg;
    };
    $('nOffer').onclick = () => {
      if (amount > c.money) { $('nMsg').textContent = TX('No tienes tanto dinero.'); return; }
      const r = Career.offer(key, id, amount);
      if (r.res === 'accept') return done(amount);
      $('nMsg').textContent = r.msg;
      if (r.res === 'counter') { counter = r.price; $('nCounter').hidden = false; $('nCounter').textContent = TX('Aceptar ') + counter + ' 💰'; }
      if (r.res === 'closed' || (r.res === 'reject' && /cierra/.test(r.msg))) { $('nOffer').disabled = true; $('nCounter').hidden = true; }
    };
    $('nCounter').onclick = () => { if (counter > c.money) { $('nMsg').textContent = TX('No tienes tanto dinero.'); return; } const r = Career.offer(key, id, counter); if (r.res === 'accept') done(counter); else $('nMsg').textContent = r.msg; };
    $('nBack').onclick = () => renderCareerMarket(tab);
  }

  /* ---------- Club: mejoras, equipación y escudo ---------- */
  function renderCareerClub(first) {
    const c = Career.data;
    const sw = (k, v) => `<div class="swatches">${Shop.kitColors().map(col => `<button class="sw" data-k="${k}" data-c="${col}" style="background:${col}" aria-pressed="${v === col}"></button>`).join('')}</div>`;
    screen(`${top(first ? TX('Tu club') : TX('Club'), 'back', first ? TX('Listo') : TX('Volver'))}
      <div class="clubpv"><img class="ccrest huge" id="crPv" src="${myCrestUrl()}" alt=""><span id="kitPv"></span><div><b>${esc(c.school)}</b><small>${money(c.money)}</small></div></div>
      <h3>${TX('Equipación')}</h3><p class="note">${TX('Camiseta')}</p>${sw('a', c.kit.a)}<p class="note">${TX('Mangas y pantalón')}</p>${sw('b', c.kit.b)}
      <p class="note">${TX('Diseño')}</p><div class="opts kitdz">${Shop.kitDesigns().map(([d, n]) => `<button data-dz="${d}" aria-pressed="${(c.kit.d || '') === d}">${n}</button>`).join('')}</div>
      <h3>${TX('Escudo')}</h3>${c.fromClub && TEAM(c.fromClub) ? `<button class="ghost" id="crOrig">${TX('Usar el escudo de siempre')}</button>` : ''}
      <div class="opts">${Shop.crestShapes().map(s => `<button data-shape="${s}" aria-pressed="${c.crest.shape === s}">${SHAPE_NAME[s] || s}</button>`).join('')}</div>
      <p class="note">${TX('Color de fondo')}</p>${sw('c1', c.crest.c1)}<p class="note">${TX('Color del borde y símbolo')}</p>${sw('c2', c.crest.c2)}
      <div class="opts syms">${[['iniciales', TX('Iniciales')], ...Object.entries(CREST_SYMBOLS)].map(([k, s]) => `<button data-sym="${k}" aria-pressed="${c.crest.sym === k}">${s}</button>`).join('')}</div>
      ${first ? '' : `<h3>${TX('Mejoras del club')}</h3><div class="csquad">${Object.entries(FACILITIES).map(([k, F]) => { const lv = c.fac[k], cost = F.cost[lv];
        return `<div class="cpl fac"><div class="cplb"><b>${F.name}</b> <small>${TX('nivel')} ${lv}/${F.cost.length}</small><span class="cst">${F.desc}</span></div>${cost != null ? `<button class="cta mini" data-up="${k}" ${c.money < cost ? 'disabled' : ''}>${TX('Mejorar ·')} ${cost} 💰</button>` : '<span class="cst">' + TX('Máximo') + '</span>'}</div>`; }).join('')}</div>`}
      ${first ? bottom('<button class="cta" id="cDone">' + TX('¡A jugar!') + '</button>') : ''}`, 'bg_green');
    const ref = Sprites.refOf(PLAYER(c.lineup && c.lineup[2] || c.squad[0].id));
    const drawPv = () => { const k = $('kitPv'); k.innerHTML = ''; k.appendChild(Sprites.kitPreview(ref, c.kit, 2)); $('crPv').src = myCrestUrl(); };
    drawPv();
    body.querySelectorAll('.sw').forEach(b => b.onclick = () => {
      const k = b.dataset.k; if (k === 'a' || k === 'b') c.kit[k] = b.dataset.c; else { c.crest[k] = b.dataset.c; c.crestImg = null; }
      Career.save(); b.parentNode.querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv();
    });
    body.querySelectorAll('[data-dz]').forEach(b => b.onclick = () => { c.kit.d = b.dataset.dz; Career.save(); body.querySelectorAll('[data-dz]').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv(); });
    body.querySelectorAll('[data-shape]').forEach(b => b.onclick = () => { c.crest.shape = b.dataset.shape; c.crestImg = null; Career.save(); body.querySelectorAll('[data-shape]').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv(); });
    body.querySelectorAll('[data-sym]').forEach(b => b.onclick = () => { c.crest.sym = b.dataset.sym; c.crestImg = null; Career.save(); body.querySelectorAll('[data-sym]').forEach(x => x.setAttribute('aria-pressed', x === b)); drawPv(); });
    if ($('crOrig')) $('crOrig').onclick = () => { c.crestImg = TEAM(c.fromClub).crest; Career.save(); drawPv(); };
    body.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const r = Career.upgrade(b.dataset.up); UI.toast(r.msg, 2000); if (r.ok) { Sound.sfx('reveal'); renderCareerClub(); } });
    $('back').onclick = renderCareer;
    if ($('cDone')) $('cDone').onclick = renderCareer;
  }

  /* ---------- Modo Carrera Jugador ---------- */
  const PC = PlayerCareer;
  const pcCrest = (key, cls = 'ccrest') => `<img class="${cls}" src="ui/crest${key === YOU ? PC.data.crestId : crestOf(key)}.png" alt="">`;
  const pcRef = m => m && m.spr ? { file: m.spr.file, row: m.spr.row } : Sprites.refOf(PLAYER(m.id));
  const noteCls = n => n == null ? '' : n >= 8 ? 'n-top' : n >= 7 ? 'n-good' : n >= 6 ? 'n-ok' : 'n-bad';
  const noteTx = n => n == null ? '—' : String(n).replace('.', I18N.en() ? '.' : ',');
  let pcDraft = null;
  function renderPC() {
    PC.load();
    const c = PC.data;
    if (!c) return renderPCNew();
    if (c.graduation && !c.graduation.seen) return renderPCEnd();
    if (c.pwc) return renderPCWC();
    if (c.me.techChoice) return renderPCTech(renderPC);
    if (c.me.offers) return renderPCOffers();
    if (c.me.duel) return renderPCDuel();
    if (c.me.event) return renderPCEvent();
    hub = renderPC;
    tutorial('pcareer'); achToast();
    const me = c.me, m = PC.mine(), pd = PLAYER(me.id), nm = PC.nextMatch(), d = PC.myDiv(), wt = PC.weekType(), starter = PC.starter();
    const S = me.season, avg = PC.avg(S.notes), xpNeed = PC_XP(me.lv);
    const kindTxt = !nm ? '' : nm.type === 'liga' ? `${TX('Jornada')} ${c.fix[d] ? c.fix[d].slice(0, nm.j + 1).filter(r => r.length).length : nm.j + 1}` : nm.type === 'copa' ? `${TX('Copa ·')} ${CUP_ROUND[nm.round]}` : nm.type === 'semi' ? TX('Playoff · semifinal') : TX('Playoff · ¡FINAL!');
    const learning = me.learning && TECH(me.learning.id);
    screen(`${top(TX('Carrera Jugador'))}
      <div class="chead pchead"><span id="pcFace"></span><div><b>${esc(pd.name)}</b><small>${RAB(pd.role)} · ${chip(pd.elem)} · ${me.graduated ? TX('Profesional') : yearTx(Math.min(m.year, PC_GRAD_YEAR))} · ${TX('Temporada')} ${c.season}</small>
        <small>${pcCrest(YOU, 'ccrest mini')} ${esc(c.school)} · ${PC.divLabel(d)} · ${ordTx(PC.myPos())}</small></div></div>
      <div class="cstats">
        <div><label>${TX('Media')}</label><b class="cmoney">${PC.ovrMe()}</b><small>${starter ? '✅ ' + TX('Titular') : '🪑 ' + TX('Suplente')}</small></div>
        <div><label>${TX('Nivel')} ${me.lv}</label>${bar(Math.round(me.xp / xpNeed * 100), 'ok')}<small>${me.xp}/${xpNeed} XP</small></div>
        <div><label>${TX('Forma')}</label>${bar(me.forma, me.forma < 50 ? 'warn' : 'ok')}<small>${Math.round(me.forma)} %</small></div>
      </div>
      <p class="cweek">${TX('Esta temporada:')} <b>${S.apps}</b> ${TX('PJ ·')} <b>${S.goals}</b> ${TX('goles')} · <b>${S.assists}</b> ${TX('asist.')} · ${TX('nota media')} <b class="${noteCls(avg)}">${noteTx(avg)}</b></p>
      ${me.pts > 0 ? `<button class="cta" id="pcPts">${TX('📈 Mejorar a tu jugador')}<small>${TXn(me.pts, '{0} punto para repartir', '{0} puntos para repartir')}</small></button>` : ''}
      <p class="cweek">${TX('Semana')} <b>${c.week}</b>/${WEEKS}</p>
      ${nm ? `<div class="cnext">${pcCrest(nm.rival)}<div><b>${kindTxt}: ${esc(PC.teamName(nm.rival))}</b><small>${nm.home ? TX('En casa') : TX('Fuera')} · ${starter ? TX('juegas de titular') : TX('empiezas en el banquillo')}${nm.ko ? TX(' · si hay empate, penaltis') : ''}</small>
        ${PC.rivalsIn(nm.rival).length ? `<small class="pcriv">🔥 ${TX('Juega tu rival {0}: sales con más ganas', esc(PLAYER(PC.rivalsIn(nm.rival)[0]).name))}</small>` : ''}</div></div>`
        : `<div class="cnext free"><span class="cicon">${wt === 'C' ? '🏆' : '📣'}</span><div><b>${WEEK_LABEL[wt] || TX('Semana libre')}</b><small>${TX('Tu club no juega esta semana: aprovecha para entrenar.')}</small></div></div>`}
      ${PC.activityDone() ? `<p class="note cmsg">✅ ${TX('Ya has hecho la actividad de esta semana.')}</p>` : `
      <h3>${TX('Actividad de la semana')}</h3>
      <div class="grid2 pcacts">${Object.entries(PC_ACTS).map(([k, A]) => `<button class="ghost big" data-pact="${k}">${A.name}<small>${k === 'tecnica' && learning ? TX('Sigues con {0} ({1}/{2})', esc(learning.name), me.learning.w, PC.techWeeks()) : k === 'tecnica' ? TXn(PC.techWeeks(), 'Aprende una supertécnica en {0} semana', 'Aprende una supertécnica en {0} semanas') : A.desc}</small></button>`).join('')}</div>
      <div id="pcTrain" hidden><p class="note">${TX('¿Qué entrenas? (+2, a veces +3)')}</p><div class="opts">${STAT_KEYS.map(k => `<button data-pst="${k}">${STAT_LABEL[k]} ${PC.stat(m, k)}</button>`).join('')}</div></div>
      <div id="pcTech" hidden></div>`}
      ${bottom(nm ? `<div class="grid2"><button class="cta" id="pcPlay">${starter ? TX('⚽ Jugar') : TX('🪑 Al banquillo')}<small>${starter ? TX('controlas a tu jugador') : TX('a ver si sales')}</small></button><button class="cta" id="pcSim">${TX('📋 Simular')}<small>${TX('nota aproximada')}</small></button></div>`
        : `<button class="cta" id="pcNext">${TX('Pasar la semana')}</button>`)}
      <div class="grid2 cnav"><button class="ghost" id="pcTechs">${TX('✨ Técnicas')}</button><button class="ghost" id="pcTable">${TX('📊 Clasificación')}</button>
        <button class="ghost" id="pcTeam">${TX('👥 Tu equipo')}</button><button class="ghost" id="pcHist">${TX('📜 Trayectoria')}</button>
        ${me.pd ? `<button class="ghost" id="pcLook">${TX('✂️ Personalizar')}</button>` : ''}<button class="ghost" id="pcRel">${TX('🤝 Amigos y rivales')}</button><button class="ghost" id="pcNews">${TX('📰 Fichajes')}</button>${PC.canAsk() ? `<button class="ghost" id="pcAsk">${TX('📨 Pedir el traspaso')}</button>` : `<button class="ghost" id="pcAsk" disabled>${TX('📨 Pedir el traspaso')}<small>${TX('semanas 1-2 y 8-9')}</small></button>`}</div>
      <button class="ghost" id="pcQuit">${TX('Abandonar carrera')}</button>`, 'bg_green');
    $('pcFace').appendChild(face(pcRef(m), 56));
    if ($('pcPts')) $('pcPts').onclick = () => renderPCPoints();
    if ($('pcLook')) $('pcLook').onclick = () => renderPCLook(renderPC);
    body.querySelectorAll('[data-pact]').forEach(b => b.onclick = () => {
      const k = b.dataset.pact;
      if (k === 'entrenar') { $('pcTrain').hidden = false; $('pcTech').hidden = true; return; }
      if (k === 'tecnica' && !me.learning) {
        const opts = PC.techOptions(3), box = $('pcTech'); $('pcTrain').hidden = true; box.hidden = false;
        if (!opts.length) { box.innerHTML = `<p class="note">${TX('No hay técnicas nuevas a tu alcance ahora mismo: sube de nivel.')}</p>`; return; }
        box.innerHTML = `<p class="note">${TXn(PC.techWeeks(), 'Elige qué técnica practicar ({0} semana):', 'Elige qué técnica practicar ({0} semanas):')}</p>` + opts.map(t => `<button class="ghost pctech" data-ptech="${t}">${techLine(TECH(t))}</button>`).join('');
        box.querySelectorAll('[data-ptech]').forEach(x => x.onclick = () => pcAct('tecnica', +x.dataset.ptech));
        return;
      }
      pcAct(k);
    });
    body.querySelectorAll('[data-pst]').forEach(b => b.onclick = () => pcAct('entrenar', b.dataset.pst));
    const pcAct = (k, arg) => { const r = PC.doActivity(k, arg); Sound.sfx('reveal'); if (r && r.msg) UI.toast(r.msg, 2600); renderPC(); };
    if ($('pcPlay')) $('pcPlay').onclick = () => { if (!PC.activityDone()) return UI.toast(TX('Elige primero la actividad de la semana')); starter ? pcStartMatch() : renderPCBench(); };
    if ($('pcSim')) $('pcSim').onclick = () => {
      if (!PC.activityDone()) return UI.toast(TX('Elige primero la actividad de la semana'));
      const out = starter ? PC.simulateWeek() : PC.simulateWeek(PC.benchPlan()); jingleFor(out); renderPCResult(out);
    };
    if ($('pcNext')) $('pcNext').onclick = () => { if (!PC.activityDone()) return UI.toast(TX('Elige primero la actividad de la semana')); pcAdvance(); };
    $('pcTechs').onclick = () => renderPCTechs();
    $('pcTable').onclick = () => renderPCTable();
    $('pcTeam').onclick = () => renderPCTeam();
    $('pcHist').onclick = () => renderPCHistory(renderPC);
    $('pcNews').onclick = () => renderNews(PC.data, renderPC);
    $('pcRel').onclick = () => renderPCRel();
    $('pcAsk').onclick = () => {
      if (!PC.canAsk()) return UI.toast(TX('Solo puedes pedir el traspaso en las semanas 1-2 y 8-9 (una vez en cada ventana)'), 2600);
      const offers = PC.askTransfer();
      if (offers && offers.length) { Sound.sfx('reveal'); renderPCOffers(); }
      else { UI.toast(TX('Ningún club se interesa por ti ahora mismo. Sigue jugando bien.'), 2800); renderPC(); }
    };
    $('pcQuit').onclick = () => {
      const b = $('pcQuit'); if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = TX('¿Seguro? Toca otra vez'); return; }
      PC.clear(); renderMenu();
    };
    $('back').onclick = renderMenu;
    Sound.music('menu');
  }
  // Pasa la semana: resultados del resto y, al acabar la temporada, el resumen
  function pcAdvance() {
    const sum = PC.advance();
    if (sum) renderPCSeason(sum); else renderPC();
  }

  /* --- Crear la carrera --- */
  function renderPCNew() {
    tutorial('pcareer');
    screen(`${top(TX('Carrera Jugador'))}
      <p class="note">${TX('Vive la carrera de un solo jugador: entrena cada semana, gánate el puesto, juega controlando solo a él y llega a tu selección. Tras 3 temporadas te graduas y das el salto a la Liga Pro, donde sigues jugando sin fin.')}</p>
      <button class="mode" id="pcCreate"><span class="cicon">✨</span><span class="mt"><b>${TX('Crear un jugador')}</b><small>${TX('Nombre, puesto, elemento y aspecto · empieza desde abajo')}</small></span></button>
      <button class="mode" id="pcColl"><span class="cicon">⭐</span><span class="mt"><b>${TX('Un jugador de tu colección')}</b><small>${TX('Vive la carrera de uno de tus jugadores')}</small></span></button>`, 'bg_title');
    $('pcCreate').onclick = () => { pcDraft = { name: '', role: 'DEL', elem: 'fuego', nat: 'JP', looks: PC.lookChoices(12, 'DEL'), look: null }; renderPCCreate(); };
    $('pcColl').onclick = () => renderPCPick();
    $('back').onclick = renderMenu;
  }
  /* ---------- Personalización del jugador creado (v0.35) ---------- */
  const keepScroll = fn => { const y = $('screen').scrollTop; fn(); $('screen').scrollTop = y; };
  const lookRef = (cs, look) => ({ file: 'c' + String(cs[0]).padStart(2, '0') + '.png', row: cs[1], look: look || {} });
  // Editor: vista previa (cara, de frente y de espaldas con el dorsal) + colores de pelo, piel y botas + dorsal
  function lookEditor(box, st, kit, onChange) {
    const L = st.look, sw = (key, list) => `<div class="swatches"><button class="sw orig" data-lk="${key}" data-c="" aria-pressed="${!L[key]}" title="${TX('Original')}">✕</button>${list.map(col => `<button class="sw" data-lk="${key}" data-c="${col}" style="background:${col}" aria-pressed="${L[key] === col}"></button>`).join('')}</div>`;
    box.innerHTML = `<div class="lookpv"><span id="lkF"></span><span id="lkS"></span><span id="lkB"></span></div>
      <p class="note">${TX('Pelo')}</p>${sw('hair', PC_HAIR)}<p class="note">${TX('Piel')}</p>${sw('skin', PC_SKIN)}<p class="note">${TX('Botas')}</p>${sw('boots', PC_BOOTS)}
      <p class="note">${TX('Dorsal')} <small>${TX('(se ve en la espalda)')}</small></p><div class="lknum"><button class="ghost mini" id="lkM">−</button><b id="lkN">${L.num || '—'}</b><button class="ghost mini" id="lkP">+</button></div>`;
    const ref = lookRef(st.cs, L);
    box.querySelector('#lkF').appendChild(face(ref, 96));
    box.querySelector('#lkS').appendChild(Sprites.kitPreview(ref, kit || { a: '#e8c21a', b: '#1f4fc0' }, 2));
    box.querySelector('#lkB').appendChild(Sprites.backView(ref, kit, 2));
    const set = (k, v) => { if (v) L[k] = v; else delete L[k]; Sound.sfx('click'); onChange(); };
    box.querySelectorAll('[data-lk]').forEach(b => b.onclick = () => set(b.dataset.lk, b.dataset.c));
    box.querySelector('#lkM').onclick = () => set('num', L.num > 1 ? L.num - 1 : L.num === 1 ? 0 : 99);
    box.querySelector('#lkP').onclick = () => set('num', ((L.num || 0) % 99) + 1);
  }
  // Cambiar el aspecto después (Tienda o Carrera Jugador): cuesta monedas
  function renderPCLook(back) {
    PC.load();
    const c = PC.data, me = c && c.me;
    if (!me || !me.pd) { UI.toast(TX('Solo para jugadores creados en la Carrera Jugador')); return back(); }
    const pd = PLAYER(me.id) || me.pd;
    const st = pcLookDraft && pcLookDraft.id === me.id ? pcLookDraft : (pcLookDraft = { id: me.id, cs: pd.cs.slice(), look: Object.assign({}, pd.look || {}), looks: null });
    const cost = PC.lookCost(Object.assign({ cs: pd.cs }, pd.look || {}), Object.assign({ cs: st.cs }, st.look));
    screen(`${top(TX('✂️ Personalizar a tu jugador'))}${wallet()}
      <p class="note">${TX('Cambiar cuesta: cara y peinado {0} 🪙 · pelo {1} · piel {2} · botas {3} · dorsal {4}.', PC_LOOK_COST.cara, PC_LOOK_COST.hair, PC_LOOK_COST.skin, PC_LOOK_COST.boots, PC_LOOK_COST.num)}</p>
      <div id="lkEd"></div>
      <h3>${TX('Cara y peinado')} <small>${TX('toca uno')}</small></h3><div class="pclooks" id="lkLooks"></div><button class="ghost" id="lkReroll">🎲 ${TX('Otros aspectos')}</button>
      ${bottom(`<button class="cta" id="lkSave" ${cost && Profile.data.coins >= cost ? '' : 'disabled'}>${cost ? TX('Guardar · {0} 🪙', cost) : TX('Sin cambios')}</button>`)}`, 'bg_green');
    lookEditor($('lkEd'), st, c.kit, () => keepScroll(() => renderPCLook(back)));
    if (!st.looks) st.looks = [PLAYER(me.id)].concat(PC.lookChoices(11, pd.role)).map(p => ({ id: p.id, cs: p.cs.slice() }));
    st.looks.forEach((p, k) => { const b = document.createElement('button'); b.className = 'pclook' + (p.cs + '' === st.cs + '' ? ' sel' : ''); b.appendChild(face(lookRef(p.cs, st.look), 56)); b.onclick = () => { st.cs = p.cs.slice(); Sound.sfx('click'); keepScroll(() => renderPCLook(back)); }; $('lkLooks').appendChild(b); });
    $('lkReroll').onclick = () => { st.looks = [{ id: me.id, cs: pd.cs.slice() }].concat(PC.lookChoices(11, pd.role).map(p => ({ id: p.id, cs: p.cs.slice() }))); renderPCLook(back); };
    $('lkSave').onclick = () => { const r = PC.setLook(st.look, st.cs + '' !== pd.cs + '' ? st.cs : null); if (!r.ok) return UI.toast(r.msg, 2000); pcLookDraft = null; Sound.sfx('reveal'); UI.toast(TX('¡Nuevo look! −{0} 🪙', r.cost), 2000); renderPCLook(back); };
    $('back').onclick = () => { pcLookDraft = null; back(); };
  }
  let pcLookDraft = null;
  function renderPCCreate() {
    const D = pcDraft;
    if (!D.look) D.look = D.looks[0].id;
    screen(`${top(TX('Crear un jugador'))}
      <div class="aform"><label>${TX('Nombre')}<input id="pcName" type="text" maxlength="16" autocomplete="off" spellcheck="false" placeholder="${TX('ej.: Rayo')}" value="${esc(D.name)}"></label></div>
      <div class="group"><label>${TX('Puesto')}</label><div class="opts">${PC_ROLES.map(r => `<button data-prole="${r}" aria-pressed="${D.role === r}">${ROLE_LABEL[r]}</button>`).join('')}</div></div>
      <div class="group"><label>${TX('Elemento')}</label><div class="opts">${['fuego', 'viento', 'bosque', 'montaña'].map(e => `<button data-pelem="${e}" aria-pressed="${D.elem === e}">${ELEM_LABEL[e]}</button>`).join('')}</div></div>
      <div class="group"><label>${TX('Selección (para el Mundial)')}</label><select id="pcNat">${PC_NATS.map(k => `<option value="${k}" ${D.nat === k ? 'selected' : ''}>${esc(PC.natName(k))}</option>`).join('')}</select></div>
      <h3>${TX('Aspecto')} <small>${TX('toca uno')}</small></h3>
      <div class="pclooks" id="pcLooks"></div>
      <button class="ghost" id="pcReroll">🎲 ${TX('Otros aspectos')}</button>
      <h3>${TX('Personaliza')} <small>${TX('gratis ahora; luego, en la Tienda')}</small></h3><div id="pcLookEd"></div>
      <p class="note">${TX('Tu jugador empieza como una promesa (media ~57) y en el banquillo: tendrás que ganarte el puesto.')}</p>
      ${bottom(`<button class="cta" id="pcGo">${TX('Siguiente: elegir club')}</button>`)}`, 'bg_green');
    const box = $('pcLooks');
    D.style = D.style || {};
    D.looks.forEach(p => { const b = document.createElement('button'); b.className = 'pclook' + (p.id === D.look ? ' sel' : ''); b.appendChild(face(lookRef(p.cs, D.style), 56)); b.onclick = () => { D.look = p.id; D.name = $('pcName').value; renderPCCreate(); }; box.appendChild(b); });
    lookEditor($('pcLookEd'), { cs: PLAYER(D.look).cs, look: D.style }, null, () => { D.name = $('pcName').value; keepScroll(renderPCCreate); });
    $('pcName').addEventListener('keydown', e => e.stopPropagation());
    $('pcName').oninput = e => { D.name = e.target.value; };
    $('pcNat').onchange = e => { D.nat = e.target.value; };
    body.querySelectorAll('[data-prole]').forEach(b => b.onclick = () => { D.role = b.dataset.prole; D.name = $('pcName').value; D.looks = PC.lookChoices(12, D.role); D.look = null; renderPCCreate(); });
    body.querySelectorAll('[data-pelem]').forEach(b => b.onclick = () => { D.elem = b.dataset.pelem; D.name = $('pcName').value; renderPCCreate(); });
    $('pcReroll').onclick = () => { D.name = $('pcName').value; D.looks = PC.lookChoices(12, D.role); D.look = null; renderPCCreate(); };
    $('pcGo').onclick = () => {
      D.name = $('pcName').value.trim();
      if (D.name.length < 2) return UI.toast(TX('Ponle un nombre (2 letras o más)'));
      const pd = PC.newCustom({ name: D.name, role: D.role, elem: D.elem, look: D.look, nat: D.nat || 'JP', style: D.style });
      renderPCClubs(pd.id, pd);
    };
    $('back').onclick = renderPCNew;
  }
  function renderPCPick() {
    const ids = Profile.ids().filter(id => PLAYER(id) && PLAYER(id).role !== 'POR' && PLAYER(id).cs).sort((a, b) => PC.ovrOf(b) - PC.ovrOf(a));
    screen(`${top(TX('Elige a tu jugador'))}
      <p class="note">${TX('Los porteros no pueden jugar este modo. Cuanto mejor sea, más arriba empezará y antes será titular.')}</p>
      <div class="csquad" id="pcList"></div>`, 'bg_green');
    if (!ids.length) $('pcList').innerHTML = `<p class="note">${TX('No tienes jugadores de campo en tu colección: haz tiradas en el gacha.')}</p>`;
    ids.slice(0, 60).forEach(id => {
      const pd = PLAYER(id), el = document.createElement('button'); el.className = 'cpl btn';
      el.appendChild(face(Sprites.refOf(pd), 48));
      el.insertAdjacentHTML('beforeend', `<span class="cplb"><b>${esc(pd.name)}</b><span class="cst">${RAB(pd.role)} · ${rchip(pd.rarity)} ${chip(pd.elem)} · ${TX('media')} ${PC.ovrOf(id)}</span></span>`);
      el.onclick = () => renderPCClubs(id, null);
      $('pcList').appendChild(el);
    });
    $('back').onclick = renderPCNew;
  }
  function renderPCClubs(id, pd) {
    const offers = PC.startOffers(id), P = PLAYER(id);
    screen(`${top(TX('Ofertas de institutos'))}
      <div class="chead pchead"><span id="pcFace"></span><div><b>${esc(P.name)}</b><small>${RAB(P.role)} · ${chip(P.elem)} · ${TX('media')} ${PC.ovrOf(id)}<br>🌍 ${esc(PC.natName(natOfPlayer(pd || P)))}</small></div></div>
      <p class="note">${TX('Estos clubes te quieren. Elige dónde empiezas tu carrera (1º curso).')}</p>
      <div class="modes">${offers.map(o => `<button class="mode" data-pclub="${o.key}">${Sprites.crest(crestOf(o.key))}<span class="mt"><b>${esc(TEAM(o.key).name)}</b><small>${DIV_NAME[o.div]} ${TX('División')}</small></span></button>`).join('')}</div>`, 'bg_team');
    $('pcFace').appendChild(face(Sprites.refOf(P), 56));
    body.querySelectorAll('[data-pclub]').forEach(b => b.onclick = () => {
      PC.create(id, b.dataset.pclub, pd); Sound.sfx('reveal');
      UI.toast(TX('¡Fichas por {0}!', TEAM(b.dataset.pclub).name), 2400); renderPC();
    });
    $('back').onclick = pd ? renderPCCreate : renderPCPick;
  }

  /* --- Puntos, técnicas, equipo --- */
  function renderPCPoints() {
    const c = PC.data, me = c.me, m = PC.mine();
    screen(`${top(TX('Mejorar a tu jugador'), 'back', TX('Volver'))}
      <p class="cweek">${TXn(me.pts, '{0} punto para repartir', '{0} puntos para repartir')} · ${TX('media')} <b>${PC.ovrMe()}</b></p>
      <div class="csquad">${STAT_KEYS.map(k => `<div class="cpl fac"><div class="cplb"><b>${STAT_LABEL[k]}</b><span class="cst">${PC.stat(m, k)} / ${PC_STAT_MAX}</span></div>
        <button class="cta mini" data-pup="${k}" ${me.pts <= 0 || PC.stat(m, k) >= PC_STAT_MAX ? 'disabled' : ''}>+1</button></div>`).join('')}</div>`, 'bg_green');
    body.querySelectorAll('[data-pup]').forEach(b => b.onclick = () => { if (PC.spendPoint(b.dataset.pup)) { Sound.sfx('click'); renderPCPoints(); } });
    $('back').onclick = renderPC;
  }
  function renderPCTech(next) {
    const me = PC.data.me, opts = me.techChoice || [], T = me.techWhy && PC_TIERS[me.techWhy - 1];
    screen(`${T ? `<h2>⭐ ${TX('¡Media {0}!', T.ovr)}</h2>
      <p class="note">${TX('Tu nivel desbloquea supertécnicas {0}. Elige una:', T.name)}</p>`
      : `<h2>${TX('¡Subes de nivel!')} ⬆️ ${TX('Nivel')} ${me.lv}</h2>
      <p class="note">${TX('Has ganado puntos para mejorar a tu jugador. Además puedes aprender una de estas supertécnicas:')}</p>`}
      <div class="csquad">${opts.map(t => `<button class="ghost pctech" data-pchoose="${t}">${techLine(TECH(t))}</button>`).join('')}</div>
      ${bottom(`<button class="ghost" id="pcSkip">${TX('Ahora no')}</button>`)}`, 'ill22');
    Sound.jingle('win');
    body.querySelectorAll('[data-pchoose]').forEach(b => b.onclick = () => { PC.chooseTech(+b.dataset.pchoose); UI.toast(TX('¡Has aprendido {0}!', TECH(+b.dataset.pchoose).name), 2200); Sound.sfx('reveal'); next(); });
    $('pcSkip').onclick = () => { PC.chooseTech(null); next(); };
  }
  function renderPCTechs() {
    const m = PC.mine(), eq = PC.equipped(m);
    screen(`${top(TX('Tus técnicas'))}
      <p class="note">${TX('Llevas 2 al partido: toca para equiparlas o quitarlas.')}</p>
      <div class="csquad">${m.known.length ? m.known.map(t => `<button class="ghost pctech ${eq.includes(t) ? 'sel' : ''}" data-peq="${t}">${techLine(TECH(t))}${eq.includes(t) ? ' <b>✅</b>' : ''}</button>`).join('')
        : `<p class="note">${TX('Aún no sabes ninguna. Aprende una al subir de nivel o practicándola.')}</p>`}</div>`, 'bg_green');
    body.querySelectorAll('[data-peq]').forEach(b => b.onclick = () => {
      const t = +b.dataset.peq; let list = PC.equipped(m).slice();
      list = list.includes(t) ? list.filter(x => x !== t) : [t, ...list].slice(0, TECH_SLOTS);
      PC.setEquip(list.length ? list : [t]); Sound.sfx('click'); renderPCTechs();
    });
    $('back').onclick = renderPC;
  }
  function renderPCTeam() {
    const c = PC.data, roles = FORMATIONS[c.formation].roles;
    screen(`${top(TX('Tu equipo'))}
      <p class="cweek">${esc(c.school)} · ${TX('media')} ${PC.myRating()} · ${TX('el entrenador pone a los 5 mejores')}</p>
      <div class="csquad" id="pcSq"></div>`, 'bg_green');
    c.squad.slice().sort((a, b) => (c.lineup.indexOf(a.id) < 0 ? 9 : c.lineup.indexOf(a.id)) - (c.lineup.indexOf(b.id) < 0 ? 9 : c.lineup.indexOf(b.id)) || PC.ovr(b) - PC.ovr(a)).forEach(m => {
      const pd = PLAYER(m.id), at = c.lineup.indexOf(m.id), el = document.createElement('div'); el.className = 'cpl' + (m.id === c.me.id ? ' sel' : '');
      el.appendChild(face(pcRef(m), 44));
      el.insertAdjacentHTML('beforeend', `<span class="cplb"><b>${esc(pd.name)}${m.id === c.me.id ? ' ★' : ''}</b><span class="cst">${RAB(pd.role)} · ${TX('media')} ${PC.ovr(m)} · ${at >= 0 ? '✅ ' + TX('Titular') + ' (' + RAB(roles[at]) + ')' : TX('Banquillo')}</span></span>`);
      $('pcSq').appendChild(el);
    });
    $('back').onclick = renderPC;
  }
  function renderPCTable(d = PC.myDiv()) {
    const rows = PC.standings(d);
    screen(`${top(TX('Clasificación'))}
      <div class="opts">${[1, 2, 3].map(k => `<button data-pdiv="${k}" aria-pressed="${k === d}">${PC.divLabel(k)}</button>`).join('')}</div>
      <table class="ctable"><tr><th></th><th></th><th>${TX('PJ')}</th><th>${TX('Pts')}</th></tr>
      ${rows.map((r, i) => `<tr class="${r.key === YOU ? 'you' : ''}"><td>${i + 1}</td><td>${pcCrest(r.key, 'ccrest mini')} ${esc(PC.teamName(r.key))}</td><td>${r.pj}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table>`, 'bg_green');
    body.querySelectorAll('[data-pdiv]').forEach(b => b.onclick = () => renderPCTable(+b.dataset.pdiv));
    $('back').onclick = renderPC;
  }
  function renderPCHistory(back) {
    const c = PC.data, me = c.me, T = me.total;
    screen(`${top(TX('Trayectoria'))}
      <p class="cweek">${T.apps} ${TX('PJ ·')} ${T.starts} ${TX('de titular')} · ${T.goals} ${TX('goles')} · ${T.assists} ${TX('asist.')} · ⭐ ${T.mvp}</p>
      <table class="ctable"><tr><th>${TX('T')}</th><th>${TX('Club')}</th><th>${TX('PJ')}</th><th>⚽</th><th>${TX('Nota')}</th></tr>
      ${me.seasons.map(s => `<tr><td>${s.season}</td><td>${pcCrest(s.club, 'ccrest mini')} ${esc(TEAM(s.club).name)} <small>(${s.pro && s.div === 1 ? 'Pro' : DIV_NAME[s.div][0]})</small></td><td>${s.apps}</td><td>${s.goals}</td><td class="${noteCls(s.avg)}">${noteTx(s.avg)}</td></tr>`).join('') || `<tr><td colspan="5">${TX('Aún no has acabado ninguna temporada.')}</td></tr>`}</table>
      ${me.awards.length ? `<h3>${TX('Premios')}</h3><p class="note">${me.awards.map(a => `🏅 ${esc(a.name)} (${TX('T{0}', a.season)})`).join('<br>')}</p>` : ''}`, 'bg_green');
    $('back').onclick = back;
  }

  /* --- Partido --- */
  function pcStartMatch(opts = {}) {
    const c = PC.data, nm = PC.nextMatch(), d = PC.myDiv();
    const t = PC.matchTeams(opts);
    api.mode = 'pcareer';
    api.pcMatch = { lockId: t.lockId, part: opts.subIn ? PC_SUB_PART : 1, base: opts.base || { gA: 0, gB: 0 } };
    api.matchOpts = { lockId: t.lockId, preset: opts.base ? { A: opts.base.gA, B: opts.base.gB, timeMul: PC_SUB_PART } : null, extra: { friendKeys: t.friendKeys } };
    startMatch({ A: t.A, B: t.B }, !!nm.ko, TEAM_FIELD[nm.rival], nm.ko ? 'match_final' : { 1: 'match_hard', 2: 'match_mid', 3: 'match_easy' }[d], nm.rival);
  }
  function renderPCBench() {
    const c = PC.data, nm = PC.nextMatch(), plan = PC.benchPlan();
    screen(`<h2>🪑 ${TX('En el banquillo')}</h2>
      <div class="cvs sim"><div>${pcCrest(YOU)}<b>${esc(c.school)}</b></div><span>${plan.gA} - ${plan.gB}</span><div>${pcCrest(nm.rival)}<b>${esc(PC.teamName(nm.rival))}</b></div></div>
      <p class="cweek">${TX('Primera parte')}</p>
      <p class="note cmsg ${plan.enters ? 'gold' : ''}">${plan.enters ? TX('¡El entrenador te llama! Sales a jugar los últimos minutos.') : TX('Esta vez no sales: el entrenador confía en los titulares.')}</p>
      ${bottom(plan.enters ? `<div class="grid2"><button class="cta" id="pcIn">${TX('⚽ Salir al campo')}</button><button class="ghost" id="pcInSim">${TX('📋 Simular')}</button></div>` : `<button class="cta" id="pcOut">${TX('Ver el resultado')}</button>`)}`, 'bg_vs');
    if ($('pcIn')) $('pcIn').onclick = () => pcStartMatch({ subIn: true, base: plan });
    if ($('pcInSim')) $('pcInSim').onclick = () => { const out = PC.simulateWeek(plan); jingleFor(out); renderPCResult(out); };
    if ($('pcOut')) $('pcOut').onclick = () => { const out = PC.simulateWeek(plan); jingleFor(out); renderPCResult(out); };
  }
  function renderPCResult(out) {
    const c = PC.data, r = out.pc, st = r.stats || {};
    const lvUp = r.ups > 0;
    screen(`<h2>${out.gA > out.gB || (out.pens && out.pens[0] > out.pens[1]) ? TX('¡Victoria!') : out.gA === out.gB && !out.pens ? TX('Empate') : TX('Derrota')}</h2>
      <div class="cvs sim"><div>${pcCrest(YOU)}<b>${esc(c.school)}</b></div><span>${out.gA} - ${out.gB}${out.pens ? `<small>(${TX('pen.')} ${out.pens[0]}-${out.pens[1]})</small>` : ''}</span><div>${pcCrest(out.rival)}<b>${esc(PC.teamName(out.rival))}</b></div></div>
      ${r.played ? `<div class="pcnote ${noteCls(r.note)}"><small>${TX('Tu nota')}</small><b>${noteTx(r.note)}</b></div>
        <p class="cweek">${r.starter ? TX('Titular') : TX('Saliste en la 2.ª parte')} · ⚽ ${r.gl} · 🅰️ ${r.as}${r.stats ? ` · ${TX('tiros')} ${st.sh} · ${TX('robos')} ${st.tk || 0} · ${TX('regates')} ${st.dr || 0} · ${TX('pases')} ${st.pok || 0}` : ''}</p>`
        : `<p class="note cmsg">${TX('No jugaste este partido.')}</p>`}
      <p class="cweek">+${r.xp} XP · ${TX('Nivel')} ${r.lv}${lvUp ? ' · <b>' + TX('¡SUBES DE NIVEL!') + '</b>' : ''}</p>
      ${r.rewards.length ? `<p class="note cmsg gold">${r.rewards.join('<br>')}</p>` : ''}
      ${bottom(`<button class="cta" id="pcCont">${TX('Continuar')}</button>`)}`, r.note >= 7.5 ? 'ill25' : 'bg_vs');
    $('pcCont').onclick = () => {
      const go = () => pcAdvance();
      if (PC.data.me.techChoice) renderPCTech(go); else go();
    };
  }
  function renderPCSeason(sum) {
    const c = PC.data, r = sum.pc;
    screen(`<h2>${TX('Fin de la temporada')} ${sum.season}</h2>
      <p class="cweek">${PC.divLabel(sum.div)} · ${TX('puesto')} <b>${ordTx(sum.pos)}</b></p>
      <div class="pcnote ${noteCls(r.avg)}"><small>${TX('Nota media')}</small><b>${noteTx(r.avg)}</b></div>
      <p class="cweek">${r.apps} ${TX('PJ ·')} ${r.starts} ${TX('de titular')} · ⚽ ${r.goals} · 🅰️ ${r.assists}</p>
      ${r.rewards.length ? `<p class="note cmsg gold">${r.rewards.join('<br>')}</p>` : ''}
      <p class="note">${TX('Premios de la temporada:')} +${r.tickets} 🎟️ · +${r.coins} 🪙 · 📈 ${c.me.graduated && !r.graduated ? TX('un año más de experiencia (+1 en todo)') : TX('pasas de curso (+1 en todo)')}</p>
      ${r.callup ? `<p class="note cmsg gold">🌍 <b>${TX('¡Te convocan con {0} para el Mundial!', esc(PC.natName(c.pwc ? c.pwc.nat : PC.myNat())))}</b><br>${TX('Vas como')} <b>${PC_WC_ROLE_LABEL[r.callup] || ''}</b>${r.callup === 'titular' ? '' : ' · ' + TX('gánate el puesto en los partidos')}</p>` : ''}
      ${r.awards && r.awards.balonWinner ? `<p class="note">🏆 ${TX('Balón de Oro de la temporada: {0} ({1})', esc(PLAYER(r.awards.balonWinner.id).name), esc(PC.teamName(r.awards.balonWinner.club)))}</p>` : ''}
      ${r.graduated ? `<p class="note cmsg gold">🎓 <b>${TX('¡Terminas 3º y te graduas!')}</b> ${TX('Te esperan los clubes de la Liga Pro.')}</p>` : ''}
      ${bottom(`<button class="cta" id="pcCont">${TX('Continuar')}</button>`)}`, r.avg >= 7 ? 'ill25' : 'bg_team');
    Sound.jingle(r.avg >= 6.5 ? 'win' : null);
    $('pcCont').onclick = renderPC;
  }
  /* --- Reto 1 contra 1 --- */
  function renderPCDuel() {
    const c = PC.data, D = c.me.duel, pd = PLAYER(D.id), R = c.me.rel[D.id];
    screen(`<h2>⚔️ ${TX('¡Te retan!')}</h2>
      <div class="cvs"><div><span id="dMe"></span><b>${esc(PLAYER(c.me.id).name)}</b><small>${TX('media')} ${PC.ovrMe()}</small></div><span>VS</span><div><span id="dThem"></span><b>${esc(pd.name)}</b><small>${esc(PC.teamName(D.club))}</small></div></div>
      <p class="note">${TX('{0} no ha digerido la derrota y te reta a un 1 contra 1 en un minicampo, cada uno con su portero. Gana el primero que marque 3.', esc(pd.name))}</p>
      ${R ? `<p class="cweek">🔥 ${TX('Rivalidad nivel {0}', R.lv)} · ${TX('Retos: {0} ganados, {1} perdidos', c.me.duels.w, c.me.duels.l)}</p>` : ''}
      ${bottom(`<div class="grid2"><button class="cta" id="dPlay">${TX('⚽ Aceptar el reto')}</button><button class="cta" id="dSim">${TX('📋 Simular')}</button></div><button class="ghost" id="dNo">${TX('Pasar del reto')}</button>`)}`, 'bg_vs');
    $('dMe').appendChild(face(Sprites.refOf(PLAYER(c.me.id)), 56)); $('dThem').appendChild(face(Sprites.refOf(pd), 56));
    $('dPlay').onclick = () => {
      const t = PC.duelTeams();
      api.mode = 'pduel';
      api.matchOpts = { lockId: t.lockId, extra: { mini: true, minutes: 1.5, goalLimit: 3, noOffside: true } };
      startMatch({ A: t.A, B: t.B }, false, 'normal', 'match_special', t.club);
    };
    $('dSim').onclick = () => { const r = PC.duelSimulate(); Sound.jingle(r.win ? 'win' : r.draw ? null : 'lose'); renderPCDuelEnd(r); };
    $('dNo').onclick = () => { UI.toast(PC.duelDecline(), 2600); renderPC(); };
  }
  function renderPCDuelEnd(r) {
    screen(`<h2>${r.win ? TX('¡Reto ganado!') : r.draw ? TX('Empate') : TX('Reto perdido')}</h2>
      <div class="cvs sim"><div><b>${esc(PLAYER(PC.data.me.id).name)}</b></div><span>${r.gA} - ${r.gB}</span><div><b>${esc(r.name)}</b></div></div>
      <p class="note cmsg ${r.win ? 'gold' : ''}">${esc(r.msg)}</p>
      <p class="cweek">+${r.xp} XP${r.tickets ? ' · +' + r.tickets + ' 🎟️' : ''}</p>
      ${bottom(`<button class="cta" id="dCont">${TX('Continuar')}</button>`)}`, r.win ? 'ill25' : 'bg_vs');
    $('dCont').onclick = () => { if (PC.data.me.techChoice) renderPCTech(renderPC); else renderPC(); };
  }
  /* --- Decisiones --- */
  function renderPCEvent() {
    const V = PC.eventView(); if (!V) { PC.data.me.event = null; PC.save(); return renderPC(); }
    screen(`<h2>💬 ${esc(V.title)}</h2>
      <p class="note">${esc(V.text)}</p>
      <div class="csquad">${V.opts.map((o, i) => `<button class="ghost big" data-pev="${i}">${esc(o)}</button>`).join('')}</div>`, 'bg_team');
    body.querySelectorAll('[data-pev]').forEach(b => b.onclick = () => { const msg = PC.resolveEvent(+b.dataset.pev); Sound.sfx('reveal'); if (msg) UI.toast(msg, 3200); PC.data.me.techChoice ? renderPCTech(renderPC) : renderPC(); });
  }
  /* --- Amigos y rivales --- */
  function renderPCRel() {
    const L = PC.relList(), me = PC.data.me;
    screen(`${top(TX('Amigos y rivales'))}
      <p class="note">${TX('Tus amigos del equipo te pasan más el balón y, si están en otro club, a veces te recomiendan. Contra el club de un rival sales con más ganas, y a veces te reta a un 1 contra 1.')}</p>
      <p class="cweek">⚔️ ${TX('Retos: {0} ganados, {1} perdidos', me.duels.w, me.duels.l)}</p>
      <div class="csquad" id="relL"></div>`, 'bg_green');
    if (!L.length) $('relL').innerHTML = `<p class="note">${TX('Aún no tienes amigos ni rivales. Saldrán de las decisiones y de los partidos.')}</p>`;
    L.forEach(r => {
      const pd = PLAYER(r.id), el = document.createElement('div'); el.className = 'cpl';
      el.appendChild(face(Sprites.refOf(pd), 44));
      el.insertAdjacentHTML('beforeend', `<span class="cplb"><b>${r.t === 'amigo' ? '🤝' : '🔥'} ${esc(pd.name)}</b><span class="cst">${r.t === 'amigo' ? TX('Amigo') : TX('Rival')} · ${TX('nivel {0}', r.lv)} · ${r.club === YOU ? TX('tu equipo') : r.club ? esc(PC.teamName(r.club)) : TX('sin club')}</span></span>`);
      $('relL').appendChild(el);
    });
    $('back').onclick = renderPC;
  }
  function renderPCOffers() {
    const c = PC.data, offers = c.me.offers || [], pro = !!c.goPro, mid = !pro && c.week > 1;
    const why = o => o.why === 'amigo' ? TX('te recomienda tu amigo {0}', esc(PLAYER(o.friend).name)) : o.why === 'pro' ? TX('Liga Pro') : o.why === 'up' ? TX('un salto de categoría') : o.why === 'down' ? TX('allí jugarías más') : mid ? TX('te quiere ya') : TX('un club más fuerte');
    const divOf = k => pro ? TX('Liga Pro') : PC.divLabel(PC.divOf(k));
    const rat = k => pro ? PC.proRating(k) : PC.rating(k);
    screen(`<h2>${pro ? '🌍 ' + TX('¡Ofertas de la Liga Pro!') : '📨 ' + TX('Ofertas de otros clubes')}</h2>
      <p class="note">${pro ? TX('Das el salto al fútbol profesional. Elige tu primer club de la Liga Pro: equipos de todo el mundo con las estrellas del Inazuma 3.')
        : mid ? TX('Has pedido el traspaso. Si te vas ahora, sigues la temporada con tu nuevo club (con su clasificación). ¿Te vas o te quedas en {0}?', esc(c.school))
        : TX('Tu temporada no ha pasado desapercibida. ¿Cambias de club o te quedas en {0}?', esc(c.school))}</p>
      <div class="modes">${offers.map(o => `<button class="mode" data-poff="${o.key}">${Sprites.crest(crestOf(o.key))}<span class="mt"><b>${esc(TEAM(o.key).name)}</b><small>${divOf(o.key)} · ${TX('media')} ${rat(o.key)} · ${why(o)}</small></span></button>`).join('')}</div>
      ${pro ? '' : bottom(`<button class="ghost" id="pcStay">${TX('Me quedo en {0}', esc(c.school))}</button>`)}`, pro ? 'ill25' : 'bg_team');
    body.querySelectorAll('[data-poff]').forEach(b => b.onclick = () => { const k = b.dataset.poff; PC.acceptOffer(k); Sound.sfx('reveal'); UI.toast(TX('¡Fichas por {0}!', TEAM(k).name), 2400); renderPC(); });
    if ($('pcStay')) $('pcStay').onclick = () => { PC.rejectOffers(); renderPC(); };
  }

  /* --- Mundial con tu selección --- */
  const ROLE_NOTE = { titular: TX('Juegas de titular todo el partido.'), suplente: TX('Empiezas en el banquillo y sales en la segunda parte. Con buena nota te ganas la titularidad.'),
    reserva: TX('Estás en la convocatoria pero no juegas: lo ves desde la grada. El seleccionador puede subirte a suplente.') };
  const MOVE_MSG = { titular: TX('¡Te ganas la titularidad!'), suplente: TX('El seleccionador te pone de suplente.') };
  function renderPCWC(last) {
    const c = PC.data, W = PC.wcFix(), nat = W.nat;
    const oppName = k => PC.natName(k), oppCrest = k => `<img class="ccrest" src="ui/crest${PC.natCrest(k)}.png" alt="">`;
    if (W.state !== 'on') {
      screen(`<h2>🌍 ${TX('Fin del Mundial')}</h2>
        ${last ? `<p class="note cmsg ${W.state === 'champion' ? 'gold' : ''}">${esc(last.msg || '')}</p>` : ''}
        <p class="note">${W.log.map(l => `${PC.wcRoundName(l.round)} · ${esc(oppName(l.opp))} ${l.gA}-${l.gB}${l.pens ? ` (${TX('pen.')} ${l.pens[0]}-${l.pens[1]})` : ''} · ${l.note != null ? TX('nota') + ' ' + noteTx(l.note) : TX('no jugaste')}`).join('<br>')}</p>
        ${W.reward ? `<p class="note cmsg gold">+${W.reward.tickets} 🎟️ · +${W.reward.coins} 🪙</p>` : ''}
        ${bottom(`<button class="cta" id="pcWcEnd">${TX('Volver al club')}</button>`)}`, W.state === 'champion' ? 'ill25' : 'bg_vs');
      if (W.state === 'champion') Sound.jingle('win');
      $('pcWcEnd').onclick = () => { PC.wcClose(); renderPC(); };
      return;
    }
    const t = PC.wcTeams(), role = W.role;
    const mv = last && last.move ? `<p class="note cmsg ${last.move === 'titular' ? 'gold' : ''}">${last.from === 'reserva' ? TX('El seleccionador te sube a suplente.') : MOVE_MSG[last.move]}</p>` : '';
    screen(`<h2>🌍 ${TX('Mundial con {0}', esc(PC.natName(nat)))}</h2>
      ${last && last.msg ? `<p class="note cmsg">${esc(last.msg)}</p>` : ''}
      ${last ? `<p class="cweek">${TX('Último partido:')} ${last.gA}-${last.gB}${last.note != null ? ` · ${TX('tu nota')} <b class="${noteCls(last.note)}">${noteTx(last.note)}</b>` : ''}</p>` : ''}${mv}
      <p class="cweek">${PC.wcRoundName(W.round)}${W.round < 3 ? ` · ${W.pts} ${TX('pts')}` : ''}</p>
      <div class="cvs">${'<div>' + oppCrest(nat) + `<b>${esc(PC.natName(nat))}</b><small>${TX('media')} ${t.rA}</small></div>`}<span>VS</span><div>${oppCrest(t.opp)}<b>${esc(oppName(t.opp))}</b><small>${TX('media')} ${t.rB}</small></div></div>
      <p class="note cmsg ${role === 'titular' ? 'gold' : ''}">${TX('Tu papel:')} <b>${PC_WC_ROLE_LABEL[role]}</b><br><small>${ROLE_NOTE[role]}</small></p>
      <p class="note">${TX('Juegan:')} ${t.A.players.map(p => esc(p.name) + (p.key === c.me.id ? ' ★' : '')).join(', ')}</p>
      ${bottom(role === 'reserva' ? `<button class="cta" id="pcWcSim">${TX('👀 Verlo desde la grada')}</button>`
        : `<div class="grid2"><button class="cta" id="pcWcPlay">${role === 'suplente' ? TX('⚽ Salir en la 2.ª parte') : TX('⚽ Jugar')}</button><button class="cta" id="pcWcSim">${TX('📋 Simular')}</button></div>`)}`, 'bg_vs');
    if ($('pcWcPlay')) $('pcWcPlay').onclick = () => {
      if (role === 'suplente') {
        const plan = PC.wcBenchPlan(), t2 = PC.wcTeams({ subIn: true });
        api.mode = 'pwc'; api.pcMatch = { lockId: t2.lockId, part: PC_SUB_PART };
        api.matchOpts = { lockId: t2.lockId, preset: { A: plan.gA, B: plan.gB, timeMul: PC_SUB_PART } };
        UI.toast(TX('Primera parte: {0}-{1}. ¡Sales al campo!', plan.gA, plan.gB), 2200);
        return startMatch({ A: t2.A, B: t2.B }, W.round >= 3, 'cielo', 'match_final', t2.opp === 'JP' ? null : t2.opp);
      }
      api.mode = 'pwc'; api.pcMatch = { lockId: t.lockId, part: 1 }; api.matchOpts = { lockId: t.lockId };
      startMatch({ A: t.A, B: t.B }, W.round >= 3, 'cielo', 'match_final', t.opp === 'JP' ? null : t.opp);
    };
    $('pcWcSim').onclick = () => { const r = PC.wcSimulate(); renderPCWC(r); };
  }
  function renderPCEnd() {
    const c = PC.data, me = c.me, G = c.graduation || {}, pd = PLAYER(me.id);
    if (!pd) { PC.clear(); return renderPCNew(); }
    screen(`${top('🎓 ' + TX('¡Te graduas!'))}
      <div class="chead pchead"><span id="pcFace"></span><div><b>${esc(pd.name)}</b><small>${TX('media')} ${PC.ovrMe()} · ${TX('Nivel')} ${me.lv} · ${me.total.goals} ${TX('goles')} · ${me.total.apps} ${TX('PJ')}</small></div></div>
      ${G.joined ? `<p class="note cmsg gold">⭐ ${TX('{0} entra en tu colección con todo lo que ha mejorado. Búscalo en Plantilla.', esc(pd.name))}</p>` : G.star ? `<p class="note cmsg gold">⭐ ${TX('{0} gana una estrella en tu colección.', esc(pd.name))}</p>` : ''}
      <p class="note cmsg">${TX('Premio de graduación:')} +${G.tickets || 0} 🎟️ · +${G.coins || 0} 🪙</p>
      <p class="note">${TX('Tu carrera sigue: ahora juegas en la Liga Pro, sin final. ¡A por todo!')}</p>
      ${bottom(`<div class="grid2"><button class="ghost" id="pcHist2">${TX('📜 Trayectoria')}</button><button class="cta" id="pcGoPro">${TX('🌍 ¡A la Liga Pro!')}</button></div>`)}`, 'ill25');
    $('pcFace').appendChild(face(Sprites.refOf(pd), 56));
    $('pcHist2').onclick = () => renderPCHistory(renderPCEnd);
    $('pcGoPro').onclick = () => { c.graduation.seen = true; PC.save(); renderPC(); };
    $('back') && ($('back').onclick = renderMenu);
  }

  /* ---------- Guardar y cargar partidas ---------- */
  const snapshot = () => Cloud.snapshot();
  const restore = o => Cloud.restore(o);
  const slotKey = i => 'inazuma-slot-' + i;
  const reloadGame = (t = TX('Cargando tu partida…')) => { screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${t}</span></div>`, 'bg_title'); setTimeout(() => location.reload(), 350); };
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
  const describe = o => { const d = Cloud.describe(o || {}); return `${d.players} ${TX('jugadores ·')} ${d.tickets} 🎟️${d.career ? TX(' · Carrera: ') + esc(d.career) : ''}`; };
  const ago = t => { if (!t) return ''; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'ahora mismo' : m < 60 ? 'hace ' + m + ' min' : m < 1440 ? 'hace ' + Math.round(m / 60) + ' h' : new Date(t).toLocaleDateString('es-ES'); };
  // Línea de estado de la cuenta (menú y pantalla de cuenta)
  function cloudLine() {
    if (!Cloud.enabled()) return '';
    const S = Cloud.state;
    if (!Cloud.loggedIn()) return `<p class="cloudst warn">${TX('Invitado · tu partida solo está en este móvil.')} <b>${TX('Crea una cuenta')}</b> ${TX('para no perderla.')}</p>`;
    if (Cloud.expired() || S.status === 'expired') return `<p class="cloudst warn">👤 ${esc(Cloud.user())} ${TX('· sesión caducada:')} <b>${TX('vuelve a entrar')}</b> ${TX('para guardar en la nube.')}</p>`;
    if (S.status === 'conflict') return `<p class="cloudst warn">👤 ${esc(Cloud.user())} ${TX('· hay dos versiones de tu partida:')} <b>${TX('elige cuál conservar')}</b>.</p>`;
    if (S.status === 'offline') return `<p class="cloudst warn">👤 ${esc(Cloud.user())} ${TX('· sin conexión: se guardará en la nube al volver internet.')}</p>`;
    if (S.status === 'error') return `<p class="cloudst warn">👤 ${esc(Cloud.user())} · ${esc(S.msg)}</p>`;
    if (S.status === 'saving') return `<p class="cloudst">👤 ${esc(Cloud.user())} ${TX('· guardando en la nube…')}</p>`;
    return `<p class="cloudst ok">👤 ${esc(Cloud.user())}${Cloud.via() === 'google' ? TX(' (Google)') : ''} ${TX('· ☁️ guardado en la nube')}${S.lastOk ? ' ' + ago(S.lastOk) : ''}</p>`;
  }
  // Refresca la línea de estado si está en pantalla; avisa una vez si aparece un conflicto
  let lastCloudStatus = Cloud.state.status;
  Cloud.onChange(S => {
    document.querySelectorAll('[data-cloudline]').forEach(el => { el.innerHTML = cloudLine(); });
    if (S.status !== lastCloudStatus) {
      if (S.status === 'conflict') UI.toast(TX('Tu partida ha cambiado en otro dispositivo. Elige cuál conservar en 👤 Cuenta.'), 3500);
      else if (S.status === 'expired') UI.toast(TX('Sesión caducada: vuelve a entrar en 👤 Cuenta'), 3000);
    }
    lastCloudStatus = S.status;
  });

  /* ---------- Cuenta: entrar, crear cuenta y estado ---------- */
  function renderAccount(back = renderMenu, mode) {
    if (!Cloud.enabled()) {
      screen(`${top(TX('Cuenta'))}<p class="note">${TX('Las cuentas todavía no están activadas en esta versión del juego. Tu partida se guarda en este móvil.')}</p>
        <button class="ghost" id="aOld">${TX('📦 Traer partida de la versión antigua')}</button>
        <button class="ghost" id="aBackup">${TX('💾 Copias y código de partida')}</button>`, 'bg_green');
      $('aOld').onclick = () => renderTransfer(() => renderAccount(back));
      $('aBackup').onclick = () => renderSaves(() => renderAccount(back));
      $('back').onclick = back; return;
    }
    if (Cloud.state.conflict) return renderConflict(() => renderAccount(back));
    if (!Cloud.loggedIn() || Cloud.expired()) return renderLogin(back, mode || (Cloud.expired() ? 'in' : Profile.data.firstDone ? 'up' : 'in'));
    const S = Cloud.state;
    screen(`${top(TX('Cuenta'))}
      <div data-cloudline>${cloudLine()}</div>
      <p class="note">${TX('Tu partida (plantilla, gacha, Historia, Carrera y la partida en curso) se guarda')} <b>${TX('sola')}</b> ${TX('en la nube cada vez que cambia. En otro móvil u ordenador, entra con tu usuario y contraseña y la tendrás igual.')}</p>
      <div class="grid2"><button class="cta" id="aNow">${TX('☁️ Guardar ahora')}</button><button class="ghost" id="aOut">${TX('Cerrar sesión')}</button></div>
      <p class="note" id="aMsg"></p>
      <details class="adv"><summary>${TX('Opciones avanzadas')}</summary>
        <p class="note">${TX('Copias extra que se quedan solo en este navegador, por si quieres volver a un punto anterior.')}</p>
        <button class="ghost" id="aBackup">${TX('💾 Copias en este móvil')}</button>
      </details>
      <button class="ghost" id="aOld">${TX('📦 Traer partida de la versión antigua')}</button>`, 'bg_green');
    $('aOld').onclick = () => renderTransfer(() => renderAccount(back));
    const msg = t => { $('aMsg').textContent = t; };
    $('aNow').onclick = async () => {
      msg(TX('Guardando…')); if (Career.data) Career.save(); Profile.save(); saveSettings();
      const r = await Cloud.push(true);
      if (r === 'uploaded' || r === 'same') { msg(TX('Guardado en la nube ✓')); Sound.sfx('reveal'); }
      else if (r === 'conflict') renderConflict(() => renderAccount(back));
      else msg(Cloud.state.msg || TX('No se ha podido guardar ahora. Se reintentará solo.'));
    };
    $('aOut').onclick = async () => {
      const b = $('aOut');
      if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = TX('¿Seguro?'); msg(TX('Se guardará tu partida en la nube y este móvil quedará vacío para que pueda entrar otra cuenta. Toca otra vez para confirmar.')); return; }
      msg(TX('Guardando antes de salir…'));
      const r = await Cloud.signOut();
      if (!r.ok) {
        msg(r.msg + TX(' Si sales igualmente, perderás lo que no se haya subido.'));
        b.textContent = TX('Salir igualmente'); b.onclick = async () => { await Cloud.signOut({ force: true }); reloadGame(TX('Sesión cerrada')); };
        return;
      }
      reloadGame(TX('Sesión cerrada'));
    };
    $('aBackup').onclick = () => renderSaves(() => renderAccount(back));
    $('back').onclick = back;
  }
  function renderLogin(back = renderMenu, mode = 'in') {
    const up = mode === 'up', first = !Profile.data.firstDone, expired = Cloud.loggedIn() && Cloud.expired();
    screen(`${top(up ? TX('Crear cuenta') : TX('Iniciar sesión'))}
      <div class="grid2 tabs"><button class="ghost" id="tIn" aria-pressed="${!up}">${TX('Ya tengo cuenta')}</button><button class="ghost" id="tUp" aria-pressed="${up}">${TX('Crear cuenta')}</button></div>
      ${up ? `<p class="note">${TX('Con una cuenta tu partida se guarda en la nube y la recuperas en cualquier móvil u ordenador.')}${Profile.data.firstDone ? ' <b>' + TX('Tu progreso actual se pasará a la cuenta.') + '</b>' : ''}</p>`
        : `<p class="note">${expired ? TX('Tu sesión se ha cerrado. Entra otra vez para seguir guardando en la nube.') : TX('Entra con la misma forma que usaste al crear la cuenta.')}</p>`}
      <button class="gbtn" id="aGoogle" type="button"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.2C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.6 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.9-6.2C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.2 1.5-5 2.3-8.2 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>${TX('Continuar con Google')}</button>
      <p class="gsep"><span>${TX('o con usuario y contraseña')}</span></p>
      <form class="aform" id="aForm" autocomplete="on">
        <label>${TX('Usuario')}<input id="aUser" name="username" type="text" maxlength="16" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="${TX('ej.: fran_10')}" value="${expired ? esc(Cloud.user() || '') : ''}"></label>
        <label>${TX('Contraseña')}<input id="aPass" name="password" type="password" maxlength="72" autocomplete="${up ? 'new-password' : 'current-password'}" placeholder="${TX('mínimo 6 caracteres')}"></label>
        ${up ? '<label>' + TX('Repite la contraseña') + '<input id="aPass2" type="password" maxlength="72" autocomplete="new-password"></label>' : ''}
        <label class="showpw"><input type="checkbox" id="aShow"> ${TX('Mostrar contraseña')}</label>
        <button class="cta" id="aGo" type="submit">${up ? TX('Crear cuenta') : TX('Entrar')}</button>
      </form>
      <p class="giftmsg" id="aMsg"></p>
      ${up ? '<p class="note">' + TX('Con usuario y contraseña, apúntala: como no usamos correo,') + ' <b>' + TX('no se puede recuperar') + '</b> ' + TX('si la olvidas. Con Google no hay contraseña que recordar.') + '</p>' : ''}
      <button class="ghost" id="aOld">${TX('📦 ¿Jugabas en la versión antigua? Trae tu partida')}</button>
      ${first ? '<button class="ghost big" id="aGuest">' + TX('Jugar como invitado') + '<small>' + TX('Tu partida solo se guardará en este móvil') + '</small></button>' : ''}`, 'bg_green');
    const form = $('aForm'), m = $('aMsg'), go = $('aGo');
    form.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') back(); }));
    $('aShow').onchange = e => form.querySelectorAll('input[type=password],input[data-pw]').forEach(i => { i.dataset.pw = 1; i.type = e.target.checked ? 'text' : 'password'; });
    $('tIn').onclick = () => renderLogin(back, 'in'); $('tUp').onclick = () => renderLogin(back, 'up');
    const say = (t, ok) => { m.textContent = t; m.className = 'giftmsg ' + (ok ? 'ok' : 'bad'); };
    $('aUser').addEventListener('input', e => { if (up) { const u = Cloud.cleanUser(e.target.value), bad = u && Cloud.checkUser(u); say(bad && u.length >= 3 ? bad : ''); } });
    form.onsubmit = async e => {
      e.preventDefault(); if (go.disabled) return;
      const u = $('aUser').value, p = $('aPass').value;
      if (up && p !== $('aPass2').value) return say(TX('Las contraseñas no coinciden.'));
      go.disabled = true; say(up ? TX('Creando cuenta…') : TX('Entrando…'), true);
      if (Career.data) Career.save(); Profile.save(); saveSettings();
      const r = up ? await Cloud.signUp(u, p) : await Cloud.signIn(u, p);
      if (!r.ok) { go.disabled = false; Sound.sfx('click'); return say(r.msg); }
      say(TX('Comprobando tu partida…'), true);
      afterSync(await Cloud.sync(), back, up ? TX('¡Cuenta creada! Tu partida ya se guarda en la nube.') : TX('¡Hola, ') + Cloud.user() + '!');
    };
    $('aGoogle').onclick = async () => {
      const g = $('aGoogle'); if (g.disabled) return;
      g.disabled = true; say(TX('Abriendo Google…'), true);
      if (Career.data) Career.save(); Profile.save(); saveSettings();
      const r = await Cloud.signInGoogle();
      if (r.redirect) return;   // la página se va a Google y vuelve sola
      if (!r.ok) { g.disabled = false; return say(r.msg || ''); }
      say(TX('Comprobando tu partida…'), true);
      afterSync(await Cloud.sync(), back, TX('¡Hola, ') + Cloud.user() + '!');
    };
    if ($('aGuest')) $('aGuest').onclick = () => { Cloud.chooseGuest(); renderMenu(); };
    $('aOld').onclick = () => renderTransfer(() => renderLogin(back, mode));
    $('back').onclick = back;
    if (Controls.pc()) $('aUser').focus();
  }
  // Qué hacer tras sincronizar
  function afterSync(r, next, hello) {
    if (r === 'downloaded') return reloadGame(TX('Cargando tu partida de la nube…'));
    if (r === 'conflict') return renderConflict(next);
    if (hello) UI.toast(hello, 2500);
    if (r === 'offline') UI.toast(TX('Sin conexión: tu partida se subirá cuando vuelva internet'), 3000);
    if (r === 'error') UI.toast(Cloud.state.msg || TX('Error con la nube; se reintentará'), 3000);
    Sound.sfx('reveal'); next();
  }
  // Dos versiones distintas: el jugador elige; la otra se guarda como copia en este móvil por si acaso
  function renderConflict(next = renderMenu) {
    const C = Cloud.state.conflict; if (!C) return next();
    const card = (id, title, d, when, cls) => `<button class="cpl conf ${cls}" id="${id}"><span class="cplb"><b>${title}</b>
      <span class="cst">${when}</span>
      <span class="cst">👥 <b>${d.players}</b> ${TX('jugadores · 🎟️')} ${d.tickets} · 🪙 ${d.coins}</span>
      <span class="cst">${TX('Victorias:')} ${d.wins} ${TX('· Etapas completadas:')} ${d.etapas}</span>
      ${d.career ? `<span class="cst">${TX('Carrera:')} ${esc(d.career)}</span>` : ''}
      ${d.pcareer ? `<span class="cst">⭐ ${TX('Carrera Jugador:')} ${esc(d.pcareer)}</span>` : ''}</span></button>`;
    screen(`<div class="top"><h2>${TX('¿Qué partida conservas?')}</h2></div>
      <p class="note">${TX('Tu cuenta')} <b>${esc(Cloud.user())}</b> ${TX('tiene una partida en la nube distinta de la de este móvil. Elige con cuál sigues. La otra se guarda como copia en este móvil (Cuenta → Opciones avanzadas), así que no se pierde.')}</p>
      ${card('cCloud', TX('☁️ La de la nube'), C.cloudInfo, C.cloudDate ? TX('Guardada el ') + new Date(C.cloudDate).toLocaleString('es-ES') : '', '')}
      ${card('cLocal', TX('📱 La de este móvil'), C.localInfo, TX('La que tienes ahora aquí'), '')}
      <p class="note" id="cMsg"></p>`, 'bg_green');
    const keepCopy = (data, label) => { try { localStorage.setItem(slotKey(3), JSON.stringify({ date: Date.now(), data, label })); } catch (_) {} };
    $('cCloud').onclick = async () => { keepCopy(C.local, TX('Copia del móvil')); await Cloud.resolve('cloud'); reloadGame(TX('Cargando tu partida de la nube…')); };
    $('cLocal').onclick = async () => {
      keepCopy(C.cloud.data, TX('Copia de la nube')); $('cMsg').textContent = TX('Subiendo la partida de este móvil…');
      const r = await Cloud.resolve('local');
      if (r === 'uploaded' || r === 'same') { UI.toast(TX('Guardada en la nube ✓'), 2000); next(); }
      else if (r === 'conflict') renderConflict(next);
      else { $('cMsg').textContent = (Cloud.state.msg || TX('No se ha podido subir')) + TX(' Se reintentará más tarde.'); setTimeout(next, 1800); }
    };
  }

  function renderSaves(back = renderMenu) {
    const slots = [1, 2, 3].map(i => { try { return JSON.parse(localStorage.getItem(slotKey(i)) || 'null'); } catch (_) { return null; } });
    screen(`${top(TX('Copias en este móvil'))}
      <p class="note">${TX('Copias que se quedan')} <b>${TX('solo en este navegador')}</b>${TX(', para volver a un punto anterior.')} ${Cloud.enabled() ? TX('Para llevar tu partida a otro dispositivo usa tu') + ' <b>' + TX('cuenta') + '</b>.' : ''}</p>
      <div class="csquad">${slots.map((s, i) => `<div class="cpl fac"><div class="cplb"><b>${TX('Ranura')} ${i + 1}${s && s.label ? ' · ' + esc(s.label) : ''}</b><span class="cst">${s ? new Date(s.date).toLocaleString('es-ES') + ' · ' + describe(s.data) : TX('Vacía')}</span></div>
        <span class="row2"><button class="cta mini" data-save="${i + 1}">${TX('Guardar')}</button>${s ? `<button class="ghost mini" data-load="${i + 1}">${TX('Cargar')}</button>` : ''}</span></div>`).join('')}</div>
      <details class="adv"><summary>${TX('Código de partida (sin cuenta)')}</summary>
      <button class="ghost" id="sExport">${TX('📤 Sacar código de mi partida')}</button>
      <textarea id="sCode" rows="4" placeholder="${TX('Pega aquí un código de partida para cargarlo')}" spellcheck="false"></textarea>
      <div class="grid2"><button class="ghost" id="sCopy">${TX('Copiar')}</button><button class="cta" id="sImport">${TX('📥 Cargar este código')}</button></div>
      <button class="ghost" id="sLink">${TX('🔗 Copiar enlace de transferencia')}<small>${TX('Ábrelo en el otro dispositivo y se carga solo')}</small></button></details>
      <p class="note" id="sMsg"></p>`, 'bg_green');
    const msg = t => { $('sMsg').textContent = t; };
    const ta = $('sCode'); ta.addEventListener('keydown', e => e.stopPropagation());
    body.querySelectorAll('[data-save]').forEach(b => b.onclick = () => {
      if (Career.data) Career.save(); Profile.save(); saveSettings();
      try { localStorage.setItem(slotKey(b.dataset.save), JSON.stringify({ date: Date.now(), data: snapshot() })); UI.toast(TX('Partida guardada en la ranura ') + b.dataset.save); Sound.sfx('reveal'); renderSaves(back); }
      catch (_) { msg(TX('No se ha podido guardar (el navegador no deja más espacio).')); }
    });
    // Cargar una copia: se escribe como cambio normal, así con cuenta también se sube a la nube
    const load = o => { SAVE_KEYS.forEach(k => { try { if (o[k] != null) localStorage.setItem(k, o[k]); else localStorage.removeItem(k); } catch (_) {} }); Cloud.push(true).finally(() => reloadGame()); };
    body.querySelectorAll('[data-load]').forEach(b => b.onclick = () => {
      if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = TX('¿Seguro?'); msg(TX('Cargar sustituye tu partida actual. Toca otra vez para confirmar.')); return; }
      msg(TX('Cargando…')); load(slots[+b.dataset.load - 1].data);
    });
    $('sExport').onclick = async () => { ta.value = await packCode(snapshot()); ta.select(); msg(TX('Código creado: cópialo y guárdalo (por ejemplo en tus notas). Para cargarlo, pégalo aquí en el otro dispositivo.')); };
    $('sCopy').onclick = async () => { ta.select(); try { await navigator.clipboard.writeText(ta.value); msg('Copiado.'); } catch (_) { try { document.execCommand('copy'); msg('Copiado.'); } catch (__) { msg(TX('Selecciónalo y cópialo a mano.')); } } };
    $('sLink').onclick = async () => {
      if (Career.data) Career.save(); Profile.save(); saveSettings();
      const link = location.origin + location.pathname + '#partida=' + encodeURIComponent(await packCode(snapshot()));
      ta.value = link;
      try { await navigator.clipboard.writeText(link); msg(TX('Enlace copiado. Mándatelo (WhatsApp, notas…) y ábrelo en el otro dispositivo.')); }
      catch (_) { ta.select(); msg(TX('Copia el enlace del recuadro y ábrelo en el otro dispositivo.')); }
    };
    $('sImport').onclick = async () => {
      if (!ta.value.trim()) return msg(TX('Pega primero un código.'));
      const rr = await readCode(ta.value); if (rr.error) return msg(rr.error.replace(/<[^>]+>/g, ''));
      const o = rr.data;
      msg(TX('¡Partida cargada! Reiniciando…')); load(o);
    };
    $('back').onclick = back;
  }

  /* ---------- Traer la partida de la versión antigua (u otro dispositivo sin cuenta) ---------- */
  const OLD_URL = 'https://claude.ai/artifact/J4Hbvgaj1rHQC3mtFDSL2C';
  // Busca el código dentro de lo que pegue el jugador (vale con texto de más, saltos de línea o un enlace #partida=)
  // Devuelve posibles códigos, del más largo al más corto (por si se pegó texto justo detrás)
  function findCodes(txt) {
    const raw = String(txt || '');
    let m = raw.replace(/\s+/g, '').match(/#partida=([^&]+)/);
    if (m) { try { return [decodeURIComponent(m[1])]; } catch (_) { return [m[1]]; } }
    m = raw.match(/IR[ZJ]1:[A-Za-z0-9+/=\s]+/); if (!m) return [];
    const parts = m[0].trim().split(/\s+/), out = [];
    for (let k = parts.length; k >= 1 && out.length < 6; k--) out.push(parts.slice(0, k).join(''));
    return out;
  }
  const findCode = txt => findCodes(txt)[0] || '';
  async function readCode(txt) {
    const cs = findCodes(txt);
    if (!cs.length) return { error: TX('No encuentro ningún código. Tiene que empezar por') + ' <b>' + 'IRZ1:' + '</b> ' + TX('y es un texto largo.') };
    let o = null;
    for (const c of cs) { try { o = await unpackCode(c); break; } catch (_) {} }
    if (!o) return { error: TX('El código está') + ' <b>' + TX('incompleto o roto') + '</b>' + TX('. Vuelve a la versión antigua, toca «Copiar» y pégalo entero.') };
    if (!o['inazuma-perfil'] && !o['inazuma-carrera']) return { error: TX('Ese código no tiene ninguna partida dentro.') };
    return { data: o };
  }
  function renderTransfer(back = renderMenu, preset = '') {
    const sync = Cloud.enabled();
    screen(`${top(TX('Traer mi partida'))}
      <p class="note">${TX('Si jugabas en la')} <b>${TX('versión antigua')}</b> ${TX('del juego (o en otro móvil sin cuenta), sigue estos pasos para traer tu partida aquí.')}</p>
      <ol class="steps">
        <li><b>${TX('Abre la versión antigua')}</b> ${TX('con este botón.')}<a class="ghost linkbtn" id="tOpen" href="${OLD_URL}" target="_blank" rel="noopener">${TX('🔗 Abrir la versión antigua')}</a></li>
        <li>${TX('Allí toca')} <b>${TX('💾 Guardar / cargar')}</b> → <b>${TX('📤 Sacar código de mi partida')}</b> → <b>${TX('Copiar')}</b>.</li>
        <li>${TX('Vuelve a esta pestaña y toca')} <b>${TX('📋 Pegar')}</b> ${TX('(o mantén el dedo en el recuadro y elige «Pegar»).')}</li>
        <li>${TX('Revisa que es tu partida y toca')} <b>${TX('Cargar')}</b>.${sync ? TX(' Después crea tu cuenta para no tener que hacer esto nunca más.') : ''}</li>
      </ol>
      <textarea id="tCode" rows="4" placeholder="${TX('Pega aquí el código (empieza por IRZ1:)')}" spellcheck="false" autocapitalize="off" autocorrect="off"></textarea>
      <div class="grid2"><button class="ghost" id="tPaste">${TX('📋 Pegar')}</button><button class="cta" id="tCheck">${TX('Comprobar')}</button></div>
      <div id="tOut"></div>
      ${Profile.data.firstDone ? '<p class="note">' + TX('⚠️ Cargar sustituye la partida que tienes ahora en este dispositivo.') + '</p>' : ''}`, 'bg_green');
    const ta = $('tCode'), out = $('tOut');
    ta.addEventListener('keydown', e => e.stopPropagation());
    if (preset) ta.value = preset;
    const check = async () => {
      if (!ta.value.trim()) { out.innerHTML = '<p class="giftmsg bad">' + TX('Primero pega el código.') + '</p>'; return; }
      out.innerHTML = '<p class="giftmsg ok">' + TX('Leyendo el código…') + '</p>';
      const r = await readCode(ta.value);
      if (r.error) { out.innerHTML = `<p class="giftmsg bad">${r.error}</p>`; Sound.sfx('click'); return; }
      const d = Cloud.describe(r.data);
      out.innerHTML = `<div class="cpl conf"><span class="cplb"><b>${TX('✅ Partida encontrada')}</b>
        <span class="cst">👥 <b>${d.players}</b> ${TX('jugadores · 🎟️')} ${d.tickets} · 🪙 ${d.coins}</span>
        <span class="cst">${TX('Victorias:')} ${d.wins} ${TX('· Etapas completadas:')} ${d.etapas}</span>
        ${d.career ? `<span class="cst">${TX('Carrera:')} ${esc(d.career)}</span>` : ''}</span></div>
        <button class="cta" id="tLoad">${TX('📥 Cargar esta partida')}</button>`;
      Sound.sfx('reveal');
      $('tLoad').onclick = async () => {
        $('tLoad').disabled = true;
        // Copia de seguridad de lo que había, por si acaso
        if (Profile.data.firstDone) { try { localStorage.setItem(slotKey(3), JSON.stringify({ date: Date.now(), data: snapshot(), label: TX('Antes de traer la partida') })); } catch (_) {} }
        SAVE_KEYS.forEach(k => { try { if (r.data[k] != null) localStorage.setItem(k, r.data[k]); else if (k !== 'inazuma-ajustes' && k !== 'inazuma-sonido') localStorage.removeItem(k); } catch (_) {} });
        try { localStorage.setItem('inazuma-traida', '1'); } catch (_) {}
        if (Cloud.loggedIn()) { await Cloud.push(true); }
        reloadGame(TX('¡Partida traída! Cargando…'));
      };
    };
    $('tPaste').onclick = async () => {
      try { const t = await navigator.clipboard.readText(); if (t) { ta.value = t; check(); return; } } catch (_) {}
      ta.focus(); out.innerHTML = '<p class="giftmsg bad">' + TX('Tu navegador no deja pegar con el botón: mantén el dedo en el recuadro y elige «Pegar».') + '</p>';
    };
    ta.addEventListener('paste', () => setTimeout(check, 50));
    $('tCheck').onclick = check;
    $('back').onclick = back;
    if (preset) check();
  }
  // Enlace de transferencia: …/juego/#partida=IRZ1:… abre esta pantalla con el código puesto
  function hashCode() {
    const h = location.hash || ''; if (!/^#partida=/.test(h)) return '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
    return findCode(h);
  }

  /* ---------- Códigos de regalo ---------- */
  /* ---------- Teclas «A tu gusto» (Ajustes): cada acción con la tecla que quieras ---------- */
  const KEY_ACTIONS = [['up', TX('Arriba')], ['down', TX('Abajo')], ['left', TX('Izquierda')], ['right', TX('Derecha')], ['sprint', TX('Esprint')],
    ['pass', TX('Pase / entrada')], ['shoot', TX('Tiro / despeje')], ['switch', TX('Cambiar de jugador')], ['through', TX('Saque largo (portero)')],
    ['dribble', TX('Regate')], ['tech', TX('Supertécnica')], ['techNext', TX('Cambiar técnica')], ['pause', TX('Pausa')]];
  // Teclas repetidas (Tiro y Cambiar de jugador sí pueden ir juntas: con balón chuta y sin balón cambia)
  function keyDups(k) {
    const by = {}; KEY_ACTIONS.forEach(([a]) => (by[k[a]] = by[k[a]] || []).push(a));
    const dup = new Set();
    for (const l of Object.values(by)) if (l.length > 1 && !(l.length === 2 && l.includes('shoot') && l.includes('switch'))) l.forEach(a => dup.add(a));
    return dup;
  }
  function keyMapHtml() {
    const k = Input.customKeys(), dup = keyDups(k);
    return `<p class="note">${TX('Toca una acción y pulsa la tecla que quieras (Esc cancela).')}</p>
      <div class="kmap">${KEY_ACTIONS.map(([a, n]) => `<button class="kbtn${dup.has(a) ? ' dup' : ''}" data-kact="${a}"><span>${n}</span><b>${esc(Input.keyName(k[a]))}</b></button>`).join('')}</div>
      ${dup.size ? `<p class="note kdup">${TX('Hay teclas repetidas (en rojo): cámbialas para que cada una haga una sola cosa.')}</p>` : ''}
      <button class="ghost" id="kReset">${TX('Volver a las de serie')}</button>`;
  }
  function bindKeyMap() {
    if (!$('kReset')) return;
    const redo = () => { const y = $('screen').scrollTop; renderSettings(); $('screen').scrollTop = y; };
    body.querySelectorAll('[data-kact]').forEach(b => b.onclick = () => {
      body.querySelectorAll('.kbtn.wait').forEach(x => x.classList.remove('wait'));
      b.classList.add('wait'); b.querySelector('b').textContent = TX('Pulsa una tecla…'); Sound.sfx('click');
      Input.capture(e => {
        if (e.code !== 'Escape' && e.code) {
          settings.keyMap = Object.assign({}, settings.keyMap, { [b.dataset.kact]: e.code });
          if (e.key && e.key.length === 1 && e.key !== ' ') settings.keyLabels = Object.assign({}, settings.keyLabels, { [e.code]: e.key.toUpperCase() });
          saveSettings(); Sound.sfx('click');
        }
        redo();
      });
    });
    $('kReset').onclick = () => { settings.keyMap = null; settings.keyLabels = null; saveSettings(); Sound.sfx('click'); UI.toast(TX('Teclas como de serie')); redo(); };
  }

  /* ---------- Guía de controles (móvil, ordenador y mando) ---------- */
  let guideTab = null;
  function renderControlsGuide(back = renderMenu) {
    const pad = [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(Boolean);
    const tab = guideTab || (pad ? 'mando' : Controls.pc() ? 'pc' : 'movil'), clas = settings.keys === 'clasicas';
    const row = (k, a, b) => `<tr><td><b>${k}</b></td><td>${a}</td><td>${b}</td></tr>`;
    const table = rows => `<table class="gtable"><tr><th></th><th>${TX('Con balón')}</th><th>${TX('Sin balón')}</th></tr>${rows}</table>`;
    const T = {
      movil: `<p class="note">${TX('El joystick aparece donde pongas el dedo en la mitad izquierda de la pantalla. Para esprintar, lleva el dedo más allá del aro (se pone naranja). Los botones de la derecha cambian según tu equipo tenga el balón o no.')}</p>
        ${table(row(TX('Joystick'), TX('mover y apuntar'), TX('mover')) + row(TX('Tiro'), TX('mantén para cargar, suelta para chutar (un toque = tiro rápido)'), '—') +
          row(TX('Pase'), TX('toque = pase · mantén = pase fuerte'), '—') + row(TX('Entrada'), '—', TX('robar el balón')) +
          row(TX('Regate'), TX('recorte rápido sin técnica'), '—') + row(TX('Cambiar'), '—', TX('al compañero que antes llega al balón (pulsa otra vez para el siguiente)')) +
          row(TX('Técnica'), TX('supertécnica de tiro o regate'), TX('supertécnica de bloqueo')) + row('⇄', TX('elegir otra supertécnica'), TX('elegir otra supertécnica')))}
        <p class="note">${TX('Con el portero: Despeje (suelta) manda el balón lejos, Pase y Saque largo.')}</p>`,
      pc: settings.keys === 'custom' ? (() => { const k = Input.customKeys(), n = c => esc(Input.keyName(c));
        return `<p class="note">${TX('Tienes tus teclas «A tu gusto» (puedes cambiarlas en Ajustes → Controles).')}</p>
        ${table(row([k.up, k.left, k.down, k.right].map(n).join(' '), TX('mover y apuntar'), TX('mover')) + row(n(k.sprint), TX('esprint'), TX('esprint')) +
          row(n(k.shoot), TX('tiro (mantén para cargar)'), k.switch === k.shoot ? TX('cambiar de jugador') : '—') + row(n(k.pass), TX('pase (mantén = fuerte)'), TX('entrada')) +
          row(n(k.dribble), TX('regate'), '—') + (k.switch !== k.shoot ? row(n(k.switch), '—', TX('cambiar de jugador')) : '') +
          row(n(k.tech), TX('supertécnica'), TX('supertécnica')) + row(n(k.techNext), TX('elegir otra supertécnica'), TX('elegir otra supertécnica')) + row(n(k.pause) + ' / Esc', TX('pausa'), TX('pausa')))}
        <p class="note">${TX('Portero con balón: {0} pase · {1} saque largo · {2} despeje.', n(k.pass), n(k.through), n(k.shoot))}</p>`; })() : `<p class="note">${clas ? TX('Tienes las teclas clásicas (puedes cambiarlas en Ajustes → Controles).') : TX('Tienes las teclas nuevas (puedes cambiarlas en Ajustes → Controles).')}</p>
        ${table(row('WASD / ' + TX('flechas'), TX('mover y apuntar'), TX('mover')) + row('Shift', TX('esprint'), TX('esprint')) +
          row(clas ? 'L / X' : 'K / X', TX('tiro (mantén para cargar)'), clas ? '—' : TX('cambiar de jugador')) + row('J / Z', TX('pase (mantén = fuerte)'), TX('entrada')) +
          row('I / V', TX('regate'), '—') + (clas ? row('Q', '—', TX('cambiar de jugador')) : '') +
          row(TX('Espacio'), TX('supertécnica'), TX('supertécnica')) + row(clas ? 'U' : 'E', TX('elegir otra supertécnica'), TX('elegir otra supertécnica')) + row('P / Esc', TX('pausa'), TX('pausa')))}
        <p class="note">${clas ? TX('Portero con balón: J pase · K saque largo · L despeje.') : TX('Portero con balón: J pase · L saque largo · K despeje.')}</p>`,
      mando: `<p class="note">${TX('Funciona con mandos de Xbox, PlayStation y la mayoría de genéricos: conéctalo (por cable o Bluetooth) y pulsa un botón.')}</p>
        ${table(row(TX('Stick / cruceta'), TX('mover y apuntar'), TX('mover')) + row('RT / R2', TX('esprint'), TX('esprint')) + row('X / ▢', TX('tiro (mantén para cargar)'), '—') +
          row('A / ✕', TX('pase (mantén = fuerte)'), TX('entrada')) + row('RB / R1', TX('regate'), '—') +
          row('LB / L1', '—', TX('cambiar de jugador')) + row('Y / △', TX('supertécnica'), TX('supertécnica')) + row('LT / L2', TX('elegir otra supertécnica'), TX('elegir otra supertécnica')) +
          row('Start', TX('pausa'), TX('pausa')))}`,
    };
    screen(`${top('🎮 ' + TX('Controles'))}
      <div class="opts" id="gTabs">${[['movil', TX('📱 Móvil')], ['pc', TX('⌨️ Ordenador')], ['mando', TX('🎮 Mando')]].map(([k, n]) => `<button data-gtab="${k}" aria-pressed="${k === tab}">${n}</button>`).join('')}</div>
      ${T[tab]}
      <h3>${TX('Trucos')}</h3>
      <ul class="gtips"><li>${TX('Pulsa Pase o Tiro un poco antes de que te llegue el balón: pasarás o chutarás al primer toque.')}</li>
        <li>${TX('Tiro cargado a tope (barra llena) = tiro mucho más fuerte.')}</li>
        <li>${TX('Con una técnica de bloqueo puedes frenar o parar los tiros rivales: ponte delante del tiro y pulsa Técnica cuando salga el aviso. Cuanta más defensa y físico, más fácil.')}</li>
        <li>${TX('Las supertécnicas tienen recarga: el botón se va llenando hasta que vuelve a estar lista.')}</li>
        <li>${TX('En Ajustes puedes poner las supertécnicas automáticas y quitar el cambio automático de jugador.')}</li></ul>`, 'bg_green');
    body.querySelectorAll('[data-gtab]').forEach(b => b.onclick = () => { guideTab = b.dataset.gtab; renderControlsGuide(back); });
    $('back').onclick = back;
  }
  /* ---------- Novedades: notas de cada actualización (las más nuevas arriba) ---------- */
  const NEWS = [
    { v: '0.37.0', date: '27/10/2026', items: [
      TX('🎮 Menús de decisión, como en el Inazuma Eleven de la DS: cuando un rival te sale al paso se para el tiempo y eliges entre regatear, usar una técnica o pasar a un compañero, viendo la probabilidad de que salga bien.'),
      TX('⚽ Al pulsar Tiro, con la portería cerca, eliges chutar normal, con poder o vaselina (nuevo: pasa por encima del portero si se ha adelantado). Con el rayo (Técnica) eliges la supertécnica que quieres usar.'),
      TX('🚩 En faltas, saques y penaltis nadie se mueve hasta que se saca: el que saca elige pasar (a quién) o chutar. Se puede quitar en Ajustes → Menús de decisión.'),
      TX('🧤 Cuando el rival te chuta, tu portero elige: Atajo, Despeje o una técnica de parada. Y al encontrarte al rival con el balón eliges quitárselo o usar un bloqueo, viendo qué puede hacer él.')] },
    { v: '0.36.2', date: '26/10/2026', items: [
      TX('⚡ Gacha limitado «Tormenta Celestial»: el sobre ahora cuesta 50 tickets, los 4 limitados son mucho más difíciles de conseguir (asegurado a las 200 tiradas) y entran más legendarios y muchísimos jugadores épicos al sobre.'),
      TX('🔥 Los 4 jugadores limitados tienen una nueva ilustración «modo furia».'),
      TX('🎄 El gacha de Navidad se abrirá el 12 de diciembre.')] },
    { v: '0.36.1', date: '26/10/2026', items: [
      TX('⚡ Nuevo gacha limitado «Tormenta Celestial»: 4 jugadores limitados de nota 100 (Samford, Da Silva, Almeida y Trick). Uno de los 4 está asegurado a las 100 tiradas sin ninguno. El sobre cuesta solo 10 tickets.'),
      TX('🧹 Arion, Victor, Riccardo y Bai Long ya no están en el juego.')] },
    { v: '0.36.0', date: '25/10/2026', items: [
      TX('⚖️ Faltas, tarjetas y penaltis: las entradas por detrás o sin tocar el balón pueden ser falta (tiro libre, o penalti en el área). Hay tarjetas amarillas y rojas: con la segunda amarilla, o con una roja, el jugador se va y su equipo juega con uno menos. Se puede desactivar en Ajustes.'),
      TX('🔄 Ajustes → «Elegir jugador con el balón parado»: cuando el balón sale, hay falta o penalti, el partido espera y eliges quién saca o a quién controlas.')] },
    { v: '0.35.5', date: '25/10/2026', items: [
      TX('🔧 Arreglado: en la Carrera Jugador, algunos retos 1 contra 1 (por ejemplo contra Caleb Stonewall) daban error y no dejaban seguir.')] },
    { v: '0.35.4', date: '25/10/2026', items: [
      TX('📈 Más reto: en la Historia, las Cadenas y el Infinito los rivales se hacen más fuertes a medida que avanzas. En el Infinito suben más y hasta más arriba.'),
      TX('🔥 En Difícil y en las oleadas altas del Infinito (desde la 10, y aún más desde la 25) la IA presiona entre dos, roba más y piensa más rápido.')] },
    { v: '0.35.3', date: '25/10/2026', items: [
      TX('🔧 Arreglado: los retos 1 contra 1 de la Carrera Jugador se podían quedar congelados en un saque (sobre todo si tu jugador es portero).'),
      TX('🧤 En los retos 1 contra 1 los porteros ya no sacan de punta a punta del minicampo: sacan corto o a media distancia.')] },
    { v: '0.35.2', date: '25/10/2026', items: [
      TX('🔧 Arreglado: en el Infinito podían salir clubes de la Liga Pro (como Los Angeles Stars) y el partido no cargaba. Si tenías uno en tu partida, se cambia por otro rival.'),
      TX('🛟 Si algo falla, el juego ya no se queda congelado: sale un aviso con un botón para volver al menú (lo guardado no se pierde).'),
      TX('⌨️ Ordenador: al cambiar de pestaña o de ventana ya no se quedan teclas «pulsadas» al volver al partido.')] },
    { v: '0.35.1', date: '25/10/2026', items: [
      TX('⚖️ Rivales más justos: en ninguna dificultad usan más supertécnicas que tú (como mucho 2). La dificultad está en cómo juegan, no en tener más técnicas.'),
      TX('⚽ Jugar sin defensas ya no sale gratis: los delanteros no bajan a defender a su campo y se quedan arriba esperando la contra. Los rivales lo aprovechan con balones largos a la espalda.')] },
    { v: '0.35.0', date: '25/10/2026', items: [
      TX('🛒 ¡Nueva Tienda! Gasta tus monedas en tickets (hasta 10 al día), sobres «elige 1 de 3» (raro, épico, épico del puesto que quieras y uno legendario por semana), diseños y colores nuevos para tu equipación, tu propio escudo, campos para jugar en casa y niveles para tus supertécnicas (algunas hasta evolucionan).'),
      TX('📖 Álbum de colección: completa los equipos con tus jugadores y recoge un premio por cada uno. Si te falta alguno, lo puedes comprar.'),
      TX('⭐ Nuevo modo Carrera Jugador: crea tu jugador o elige uno de tu colección, gánate el puesto, gradúate y salta a la Liga Pro.'),
      TX('Promesas y negocios: amistades y rivalidades, retos 1 contra 1, decisiones de prensa, vida y vestuario, y fichajes entre clubes.'),
      TX('✂️ Personaliza a tu jugador de la Carrera Jugador: pelo, piel, botas, dorsal y cara. Al crearlo es gratis; después lo puedes cambiar en la Tienda.'),
      TX('🌍 Mundial con tu selección en la Carrera Jugador (también desde la Liga Pro): titular, suplente o reserva según tu nivel.'),
      TX('🏆 Modo Carrera: el Raimon ya es un club, puedes crear tu club o comprar con monedas uno que ya existe (los mejores, más caros), y las 3 divisiones tienen 12 equipos (entran Servicio Secreto, Mary Times, Triple C y Mar de Árboles del Inazuma 2).'),
      TX('Modo Carrera: las supertécnicas se desbloquean cuando el jugador las aprende (todos empiezan con la primera), y entrenar está más equilibrado: cada jugador puede subir +1 con suerte.'),
      TX('Nueva cadena «Los olvidados del 2», con cuatro rivales del Inazuma 2 que faltaban.'),
      TX('🛡️ Bloqueos de tiro como en el Inazuma DS: ponte delante del tiro rival con tu jugador y pulsa Técnica para frenarlo o pararlo, según sus estadísticas y su técnica.'),
      TX('🔺 Supertécnicas de varios jugadores (Triángulo letal, Fuego cruzado, Empuje trillizo…): tus compañeros más cercanos aparecen a hacerla contigo y luego vuelven corriendo a su sitio. Si en el campo están los compañeros que también saben esa técnica, tiene un +5 % de potencia.'),
      TX('💾 3 ranuras de guardado para cada carrera.'),
      TX('🏅 Logros con premios.')] },
    { v: '0.31.14', date: '24/10/2026', items: [
      TX('🧤 Porteros más listos: si hay otro atacante libre para el pase, no salen a lo loco, y cuando el rival pasa vuelven corriendo a tapar la portería.')] },
    { v: '0.31.13', date: '24/10/2026', items: [
      TX('🔴 Cuando Franmen está en directo en Twitch, sale un botón arriba en el menú para ir a verlo.')] },
    { v: '0.31.12', date: '23/10/2026', items: [
      TX('Partidos más equilibrados: con el balón se esprinta un poco menos y los rivales corren algo más cuando defienden. Ya no te escapas solo corriendo.')] },
    { v: '0.31.11', date: '23/10/2026', items: [
      TX('📱 Ajustes → Controles → «Colocar los botones a tu gusto»: en el móvil puedes mover cada botón a donde quieras y cambiar su tamaño.')] },
    { v: '0.31.10', date: '23/10/2026', items: [
      TX('∞ Infinito: al ganar a cada jefe eliges 1 de 3 versiones especiales de jugadores que no salen en el gacha (del 2, del 3…). Cuanto más lejos llegues, más raras. Llevan su propio marco ∞.'),
      TX('Porteros: salen a por el que entra con el balón en el área, y ya no se puede entrar andando con el balón en la portería. Para marcar, hay que chutar.')] },
    { v: '0.31.9', date: '23/10/2026', items: [
      TX('👕 ¡Crea tu equipación! En Plantilla → Mi equipo eliges los colores y el diseño (rayas, mitades, banda, cuadros…). En la Carrera también hay diseños nuevos.'),
      TX('🎨 Muñecos del Inazuma 3 arreglados: todos llevan su muñeco de verdad, sacado del juego original (peinado, colores y tono de piel), y ahora cambian a los colores de su equipo.'),
      TX('Plantilla: en Jugadores ves la nota y el elemento de cada uno, y en Mi equipo el elemento de cada jugador en el campo.'),
      TX('Equipos especiales: cada equipo da un jugador distinto (ya no se repite el premio).'),
      TX('Arreglado: ya no se puede salir por la línea de fondo con el balón para rodear al portero. Si cruzas una línea con el balón, es fuera.')] },
    { v: '0.31.8', date: '22/10/2026', items: [
      TX('💬 ¡Ya tenemos Discord! Entra desde el botón del menú.'),
      TX('Móvil: joystick más grande y con zona muerta; ya no esprintas sin querer (para esprintar, lleva el dedo más allá del aro).'),
      TX('Móvil: botones más grandes y en arco alrededor de Tiro; nueva opción de tamaño en Ajustes.'),
      TX('Se quita el pase al hueco (móvil, teclado y mando): estorbaba. El portero sigue sacando en largo.'),
      TX('Al perder el balón, un toque en Pase ya no te cambia de jugador sin querer.'),
      TX('Cambiar de jugador te lleva al compañero que antes llega al balón; si vuelves a pulsar, al siguiente.')] },
    { v: '0.31.7', date: '22/10/2026', items: [
      TX('Las supertécnicas del Inazuma 3 ya salen en español (antes estaban en inglés) y se han añadido algunas que faltaban.')] },
    { v: '0.31.6', date: '22/10/2026', items: [
      TX('Ordenador: nuevas teclas «A tu gusto» en Ajustes → Controles. Elige la tecla de cada acción, también para moverte.'),
      TX('Nube: la partida se guarda comprimida (ocupa unas 8 veces menos) y se sube al acabar cada partido, al salir del juego y, mientras juegas, cada 5 minutos. Así el servidor aguanta a muchos más jugadores.')] },
    { v: '0.31.5', date: '22/10/2026', items: [
      TX('Controles: si pulsas Pase o Tiro justo antes de recibir el balón, ahora pasas o chutas al primer toque (antes hacías una entrada sin querer).'),
      TX('Pase ya no hace entradas a tus propios compañeros.'),
      TX('Supertécnicas más espectaculares: unas 70 técnicas tienen ahora su propia animación (tiros, paradas, regates y bloqueos).'),
      TX('Nueva guía de controles (móvil, ordenador y mando) en Pausa y en Ajustes.'),
      TX('Roguelite: el partido se acaba si un equipo gana por 5 goles de diferencia.'),
      TX('Las técnicas que ganas tras cada partido ahora encajan con la posición del jugador (un portero ya no recibe técnicas de tiro).'),
      TX('Muñecos del Inazuma 3 arreglados: muchos tenían el muñeco de otro jugador (p. ej. Partinus salía con el pelo marrón).'),
      TX('Nuevo apartado de Novedades (este).')] },
    { v: '0.31.4', date: '21/10/2026', items: [
      TX('Ordenador: en Ajustes puedes elegir las teclas nuevas (K tiro) o las clásicas (L tiro), como antes.')] },
    { v: '0.31.3', date: '21/10/2026', items: [
      TX('Guardado en la nube arreglado: ¡erais tantos que reventasteis el servidor! Ahora la partida se sube como mucho una vez por minuto y al salir del juego.'),
      TX('Si la nube está saturada, tu partida sigue a salvo en tu dispositivo y se sube más tarde sola.')] },
    { v: '0.31.2', date: '21/10/2026', items: [
      TX('Móvil: los botones ya no se «comen» los toques (antes a veces no chutaba ni pasaba).'),
      TX('Ordenador: teclas más cómodas (J/Z pase, K/X tiro, L/C profundidad, I/V regate, E cambiar técnica) y aviso de que se puede jugar con mando.')] },
    { v: '0.31.0', date: '', items: [TX('El juego, traducido al inglés (cámbialo en Ajustes).')] },
  ];
  function renderPatchNotes(back = renderMenu) {
    settings.seenNews = VERSION; settings.aviso = AVISO.key; saveSettings();   // las Novedades ya cuentan lo del aviso
    screen(`${top(TX('📰 Novedades'))}
      ${NEWS.map((n, i) => `<div class="newsv${i === 0 ? ' last' : ''}"><h3>v${n.v}${n.date ? ` <small>${n.date}</small>` : ''}${i === 0 ? ` <span class="newtag">${TX('¡NUEVO!')}</span>` : ''}</h3>
        <ul>${n.items.map(t => `<li>${t}</li>`).join('')}</ul></div>`).join('')}
      ${bottom(`<button class="cta" id="newsOk">${TX('¡A jugar!')}</button>`)}`, 'bg_title');
    $('back').onclick = back; $('newsOk').onclick = back;
  }
  /* ---------- Tienda 🛒 (v0.35) ---------- */
  let shopTab = 'sobres', shopTechType = '', shopTechQ = '', shopAlbumOpen = null;
  function renderShop(tab) {
    if (tab) shopTab = tab;
    Shop.st();
    const P = Profile.data, TABS = [['sobres', TX('🎟️ Sobres')], ['equip', TX('👕 Equipación')], ['escudo', TX('🛡️ Escudo y campo')], ['tecnicas', TX('✨ Técnicas')], ['album', TX('📖 Álbum')], ['jugador', TX('✂️ Tu jugador')]];
    const alN = Shop.albumPending();
    const tabs = `<div class="opts shoptabs" id="shT">${TABS.map(([k, n]) => `<button data-st="${k}" aria-pressed="${shopTab === k}">${n}${k === 'album' && alN ? ' <i class="newdot"></i>' : ''}</button>`).join('')}</div>`;
    const price = (c, ok = P.coins >= c) => `<button class="cta mini" data-buy ${ok ? '' : 'disabled'}>${c} 🪙</button>`;
    let html = '';
    if (shopTab === 'sobres') {
      const left = Shop.ticketsLeft();
      html = `<h3>${TX('Tickets')} <small>${TX('{0} 🪙 cada uno · te quedan {1} hoy', SHOP.ticket, left)}</small></h3>
        <div class="csquad">${[1, 5, 10].map(n => { const k = Math.min(n, left), c = k * SHOP.ticket;
          return `<div class="cpl fac"><span class="cicon">🎟️</span><div class="cplb"><b>${TXn(n, '{0} ticket', '{0} tickets')}</b>${n > left && left ? `<span class="cst">${TX('Solo te quedan {0} hoy', left)}</span>` : ''}</div><button class="cta mini" data-tk="${n}" ${left && P.coins >= c ? '' : 'disabled'}>${left ? (k * SHOP.ticket) + ' 🪙' : TX('Mañana')}</button></div>`; }).join('')}</div>
        <h3>${TX('Sobres de jugador')} <small>${TX('eliges 1 de 3')}</small></h3>
        <div class="csquad">${Object.entries(SHOP.packs).map(([k, K]) => { const wk = K.weekly && !Shop.legReady();
          return `<div class="cpl fac pack ${k}"><span class="cicon">${{ rara: '🔵', epica: '🟣', puesto: '🎯', legendaria: '🌟' }[k]}</span><div class="cplb"><b>${K.name}</b><span class="cst">${K.desc}</span>
            ${K.role ? `<span class="opts small" id="pRole">${ROLES4.map(r => `<button data-prole="${r}" aria-pressed="${shopRole === r}">${RAB(r)}</button>`).join('')}</span>` : ''}</div>
            <button class="cta mini" data-pack="${k}" ${wk || P.coins < K.cost ? 'disabled' : ''}>${wk ? TX('La semana que viene') : K.cost + ' 🪙'}</button></div>`; }).join('')}</div>
        ${(P.giftPicks || []).length ? `<p class="note">${TXn(P.giftPicks.length, 'Tienes {0} «elige 1 de 3» sin abrir:', 'Tienes {0} «elige 1 de 3» sin abrir:')} <button class="ghost mini" id="shPicks">${TX('Elegir ahora')}</button></p>` : ''}`;
    } else if (shopTab === 'equip') {
      const k = myKit() || { a: '#e8c21a', b: '#1f4fc0', d: '' };
      html = `<p class="note">${TX('Lo que compres aparece en el creador de equipación de Mi equipo y del Modo Carrera. Los diseños y colores de siempre siguen gratis.')}</p>
        <h3>${TX('Diseños nuevos')}</h3><div class="shopgrid" id="shD">${Object.entries(SHOP.designs).map(([d, c]) => `<div class="shopit" data-d="${d}"><span class="pv"></span><b>${DESIGN_NAME[d]}</b>${Shop.owns('d:' + d) ? `<button class="ghost mini" data-use="${d}">${(k.d || '') === d ? TX('Puesta ✓') : TX('Ponérmela')}</button>` : `<button class="cta mini" data-bd="${d}" ${P.coins >= c ? '' : 'disabled'}>${c} 🪙</button>`}</div>`).join('')}</div>
        <h3>${TX('Colores especiales')}</h3><div class="shopgrid">${Object.entries(SHOP.colors).map(([col, c]) => `<div class="shopit"><span class="swbig" style="background:${col}"></span><b>${COLOR_NAME[col]}</b>${Shop.owns('c:' + col) ? `<small>${TX('✓ Tuyo')}</small>` : `<button class="cta mini" data-bc="${col}" ${P.coins >= c ? '' : 'disabled'}>${c} 🪙</button>`}</div>`).join('')}</div>`;
    } else if (shopTab === 'escudo') {
      const cr = Shop.crestData(), f = Shop.myField() || 'normal';
      const sw = (key, v) => `<div class="swatches">${Shop.kitColors().map(col => `<button class="sw" data-ck="${key}" data-c="${col}" style="background:${col}" aria-pressed="${v === col}"></button>`).join('')}</div>`;
      html = `<h3>${TX('Escudo de tu equipo')}</h3>
        <div class="clubpv"><img class="ccrest huge" src="${Shop.myCrest() ? ClubCrest.url(cr, '') : 'ui/crest1.png'}" alt=""><div><b>${Shop.myCrest() ? TX('Tu escudo') : TX('Escudo del Raimon')}</b><small>${TX('Sale en el marcador de tus partidos (Historia, Equipos especiales, Cadenas e Infinito)')}</small></div></div>
        ${cr ? `<div class="opts">${Shop.crestShapes().map(s => `<button data-shape="${s}" aria-pressed="${cr.shape === s}">${SHAPE_NAME[s] || s}</button>`).join('')}</div>
          <p class="note">${TX('Color de fondo')}</p>${sw('c1', cr.c1)}<p class="note">${TX('Color del borde y símbolo')}</p>${sw('c2', cr.c2)}
          <div class="opts syms">${Object.entries(CREST_SYMBOLS).map(([k, s]) => `<button data-sym="${k}" aria-pressed="${cr.sym === k}">${s}</button>`).join('')}</div>
          <button class="ghost mini" id="crOff">${P.crestOff ? TX('Usar mi escudo') : TX('Volver al del Raimon')}</button>`
          : `<div class="cpl fac"><span class="cicon">🛡️</span><div class="cplb"><b>${TX('Crea tu escudo')}</b><span class="cst">${TX('Forma, colores y símbolo, como en el Modo Carrera')}</span></div><button class="cta mini" id="bCrest" ${P.coins >= SHOP.crest ? '' : 'disabled'}>${SHOP.crest} 🪙</button></div>`}
        <h3>${TX('Formas especiales')} <small>${TX('también para el escudo del Modo Carrera')}</small></h3>
        <div class="shopgrid">${Object.entries(SHOP.shapes).map(([s, c]) => `<div class="shopit"><img class="ccrest big" src="${ClubCrest.url({ shape: s, c1: (cr || {}).c1 || '#1f4fc0', c2: (cr || {}).c2 || '#e8c21a', sym: (cr || {}).sym || 'estrella' }, '')}" alt=""><b>${SHAPE_NAME[s]}</b>${Shop.owns('s:' + s) ? `<small>${TX('✓ Tuya')}</small>` : `<button class="cta mini" data-bs="${s}" ${P.coins >= c ? '' : 'disabled'}>${c} 🪙</button>`}</div>`).join('')}</div>
        <h3>${TX('Tu campo')} <small>${TX('juegas en casa la mitad de los partidos (no en las finales)')}</small></h3>
        <div class="shopgrid">${['normal', ...Object.keys(SHOP.fields)].map(k => { const F = FIELDS[k] || FIELDS.normal, hx = n => '#' + n.toString(16).padStart(6, '0'), own = k === 'normal' || Shop.owns('f:' + k);
          return `<div class="shopit"><span class="fieldpv" style="background:repeating-linear-gradient(90deg,${hx(F.a)} 0 8px,${hx(F.b)} 8px 16px);border-color:${hx(F.runoff)};box-shadow:inset 0 0 0 1px ${hx(F.line)}"></span><b>${(FIELD_LABEL[k] || k).replace(/^Campo (de la |del |de |)/, '')}</b>${own ? `<button class="ghost mini" data-fld="${k}">${f === k ? TX('Elegido ✓') : TX('Elegir')}</button>` : `<button class="cta mini" data-bf="${k}" ${P.coins >= SHOP.fields[k] ? '' : 'disabled'}>${SHOP.fields[k]} 🪙</button>`}</div>`; }).join('')}</div>`;
    } else if (shopTab === 'tecnicas') {
      html = `<p class="note">${TX('Sube de nivel las supertécnicas de tus jugadores: cada nivel, +{0} de potencia en todos los modos menos en las Carreras. Al nivel 3, algunas pueden evolucionar.', SHOP.LV_POWER)}</p>
        <div class="opts" id="shTT">${[['', TX('Todas')], ...Object.entries(TYPE_LABEL)].map(([k, n]) => `<button data-tt="${k}" aria-pressed="${shopTechType === k}">${k ? TYPE_ICON[k] + ' ' : ''}${n}</button>`).join('')}</div>
        <div class="pfbar"><div class="pfq"><input id="shQ" type="search" placeholder="${TX('Buscar técnica')}" value="${esc(shopTechQ)}" autocomplete="off"></div></div>
        <div class="csquad" id="shTL"></div>`;
    } else if (shopTab === 'jugador') {
      PC.load(); const me = PC.data && PC.data.me, pd = me && me.pd && (PLAYER(me.id) || me.pd);
      html = `<p class="note">${TX('Cambia el pelo, la piel, las botas, el dorsal o la cara de tu jugador creado en la Carrera Jugador.')}</p>
        ${pd ? `<div class="cpl fac"><span id="shPF"></span><div class="cplb"><b>${esc(pd.name)}</b><span class="cst">${TX('Cara y peinado {0} 🪙 · pelo {1} · piel {2} · botas {3} · dorsal {4}', PC_LOOK_COST.cara, PC_LOOK_COST.hair, PC_LOOK_COST.skin, PC_LOOK_COST.boots, PC_LOOK_COST.num)}</span></div><button class="cta mini" id="shLook">${TX('Personalizar')}</button></div>`
          : `<p class="note cmsg">${TX('Crea un jugador en la Carrera Jugador para poder personalizarlo.')}</p>`}`;
    } else {
      const A = Shop.album(), done = A.filter(a => Shop.albumState(a.key).done).length;
      html = `<p class="note">${TX('Completa equipos con los jugadores de tu colección: cada equipo completo da {0} 🪙 y {1} 🎟️. Si te falta alguno, lo puedes comprar.', SHOP.albumPrize.coins, SHOP.albumPrize.tickets)}</p>
        <p class="note"><b>${TX('{0} de {1} equipos completos', done, A.length)}</b></p>
        <div class="csquad" id="shAL">${A.map(a => { const s = Shop.albumState(a.key);
          return `<div class="cpl fac alb${s.done ? ' done' : ''}${shopAlbumOpen === a.key ? ' sel' : ''}" data-al="${esc(a.key)}">${Sprites.crest(a.crest || 2)}<div class="cplb"><b>${esc(a.name)}</b><span class="cst">${s.have}/${s.total}${s.claimed ? ' · ' + TX('✓ Premio recogido') : ''}</span><span class="albar"><i style="width:${Math.round(100 * s.have / s.total)}%"></i></span></div>
            ${s.done && !s.claimed ? `<button class="cta mini" data-claim="${esc(a.key)}">${TX('¡Recoger!')}</button>` : ''}</div>${shopAlbumOpen === a.key ? `<div class="albfaces" id="alF"></div>` : ''}`; }).join('')}</div>`;
    }
    screen(`${top(TX('🛒 Tienda'))}${wallet()}${tabs}${html}`, 'bg_green');
    body.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { Sound.sfx('click'); renderShop(b.dataset.st); });
    $('back').onclick = renderMenu;
    const res = (r, ok) => { if (!r.ok) { Sound.sfx('click'); return UI.toast(r.msg, 2000); } Sound.sfx('reveal'); if (ok) ok(r); else { if (r.msg) UI.toast(r.msg, 1600); renderShop(); } };
    if (shopTab === 'sobres') {
      body.querySelectorAll('[data-tk]').forEach(b => b.onclick = () => res(Shop.buyTickets(+b.dataset.tk)));
      body.querySelectorAll('[data-prole]').forEach(b => b.onclick = () => { shopRole = b.dataset.prole; body.querySelectorAll('[data-prole]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
      body.querySelectorAll('[data-pack]').forEach(b => b.onclick = () => {
        const k = b.dataset.pack;
        if (SHOP.packs[k].role && !shopRole) return UI.toast(TX('Elige primero el puesto'), 1800);
        if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = TX('¿Comprar? Toca otra vez'); return; }
        res(Shop.buyPack(k, shopRole), r => renderShopPick(r.uid));
      });
      if ($('shPicks')) $('shPicks').onclick = () => renderShopPick(P.giftPicks[0].uid);
    } else if (shopTab === 'equip') {
      const who = PLAYER(((api.myTeam || savedTeam()).ids || []).find(id => id != null && PLAYER(id).role !== 'POR') || 10), k = myKit() || { a: '#e8c21a', b: '#1f4fc0' };
      body.querySelectorAll('#shD [data-d]').forEach(el => el.querySelector('.pv').appendChild(Sprites.kitPreview(Sprites.refOf(who), Object.assign({}, k, { d: el.dataset.d }), 1.5)));
      body.querySelectorAll('[data-bd]').forEach(b => b.onclick = () => res(Shop.buyDesign(b.dataset.bd)));
      body.querySelectorAll('[data-bc]').forEach(b => b.onclick = () => res(Shop.buyColor(b.dataset.bc)));
      body.querySelectorAll('[data-use]').forEach(b => b.onclick = () => { Profile.data.kit = Object.assign({ a: '#e8c21a', b: '#1f4fc0', d: '' }, myKit() || {}, { d: b.dataset.use }); Profile.save(); Sound.sfx('click'); renderShop(); });
    } else if (shopTab === 'escudo') {
      if ($('bCrest')) $('bCrest').onclick = () => res(Shop.buyCrest());
      if ($('crOff')) $('crOff').onclick = () => { P.crestOff = !P.crestOff; Profile.save(); Sound.sfx('click'); renderShop(); };
      body.querySelectorAll('[data-shape]').forEach(b => b.onclick = () => { Shop.setCrest({ shape: b.dataset.shape }); P.crestOff = false; Sound.sfx('click'); renderShop(); });
      body.querySelectorAll('[data-ck]').forEach(b => b.onclick = () => { Shop.setCrest({ [b.dataset.ck]: b.dataset.c }); P.crestOff = false; Sound.sfx('click'); renderShop(); });
      body.querySelectorAll('[data-sym]').forEach(b => b.onclick = () => { Shop.setCrest({ sym: b.dataset.sym }); P.crestOff = false; Sound.sfx('click'); renderShop(); });
      body.querySelectorAll('[data-bs]').forEach(b => b.onclick = () => res(Shop.buyShape(b.dataset.bs)));
      body.querySelectorAll('[data-bf]').forEach(b => b.onclick = () => res(Shop.buyField(b.dataset.bf), () => { Shop.setField(b.dataset.bf); renderShop(); }));
      body.querySelectorAll('[data-fld]').forEach(b => b.onclick = () => { Shop.setField(b.dataset.fld); Sound.sfx('click'); renderShop(); });
    } else if (shopTab === 'tecnicas') {
      const draw = () => {
        const q = shopTechQ.trim().toLowerCase();
        const list = Shop.myTechs().map(TECH).filter(t => (!shopTechType || t.type === shopTechType) && (!q || t.name.toLowerCase().includes(q)))
          .sort((a, b) => Shop.techLevel(b.id) - Shop.techLevel(a.id) || b.power - a.power);
        $('shTL').innerHTML = list.slice(0, 120).map(t => { const lv = Shop.techLevel(t.id), c = Shop.levelCost(t.id), e = EVO(t.id);
          const btn = c != null ? `<button class="cta mini" data-lv="${t.id}" ${P.coins >= c ? '' : 'disabled'}>${TX('Nv.')} ${lv + 1} · ${c} 🪙</button>`
            : Shop.canEvolve(t.id) ? `<button class="cta mini" data-evo="${t.id}" ${P.coins >= SHOP.techEvo ? '' : 'disabled'}>${TX('Evolucionar')} · ${SHOP.techEvo} 🪙</button>` : `<span class="cst">${TX('Máximo')}</span>`;
          return `<div class="cpl fac"><span class="cicon">${TYPE_ICON[t.type] || '★'}</span><div class="cplb">${techLineMy(t)}<span class="cst">${'★'.repeat(lv)}${'☆'.repeat(SHOP.TECH_MAX - lv)}${e != null && TECH(e) ? ' · ' + TX('evoluciona a ') + esc(TECH(e).name) + ((P.techs || {})[e] ? ' ✓' : '') : ''}</span></div>${btn}</div>`; }).join('')
          || `<p class="note">${TX('No hay técnicas con ese filtro.')}</p>`;
        $('shTL').querySelectorAll('[data-lv]').forEach(b => b.onclick = () => res(Shop.levelUp(+b.dataset.lv), r => { UI.toast(TX('¡Nivel {0}!', r.lv), 1400); renderShop(); }));
        $('shTL').querySelectorAll('[data-evo]').forEach(b => b.onclick = () => res(Shop.evolve(+b.dataset.evo), r => { UI.toast(TX('¡Nueva técnica: {0}! Equípala en Plantilla', TECH(r.to).name), 2600); renderShop(); }));
      };
      body.querySelectorAll('[data-tt]').forEach(b => b.onclick = () => { shopTechType = b.dataset.tt; body.querySelectorAll('[data-tt]').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
      $('shQ').addEventListener('input', () => { shopTechQ = $('shQ').value; draw(); });
      $('shQ').addEventListener('keydown', e => e.stopPropagation());
      draw();
    } else if (shopTab === 'jugador') {
      if ($('shPF')) { const me = PC.data.me; $('shPF').appendChild(face(Sprites.refOf(PLAYER(me.id) || me.pd), 48)); $('shLook').onclick = () => renderPCLook(() => renderShop('jugador')); }
    } else {
      body.querySelectorAll('[data-al]').forEach(el => el.onclick = e => { if (e.target.closest('[data-claim]')) return; shopAlbumOpen = shopAlbumOpen === el.dataset.al ? null : el.dataset.al; Sound.sfx('click'); renderShop(); if (shopAlbumOpen) { const x = body.querySelector('.alb.sel'); if (x) x.scrollIntoView({ block: 'nearest' }); } });
      body.querySelectorAll('[data-claim]').forEach(b => b.onclick = () => res(Shop.claimAlbum(b.dataset.claim), r => { UI.toast(TX('+{0} 🪙 y +{1} 🎟️', r.coins, r.tickets), 2200); renderShop(); }));
      if ($('alF')) {
        const A = Shop.album().find(a => a.key === shopAlbumOpen);
        A.ids.forEach(id => {
          const pd = PLAYER(id), have = !!P.coll[id], b = document.createElement('div'); b.className = 'albp' + (have ? '' : ' miss');
          b.appendChild(face(Sprites.refOf(pd), 56));
          b.insertAdjacentHTML('beforeend', `<b>${esc(pd.name)}</b><small>${rchip(pd.rarity)} ${RAB(pd.role)}</small>${have ? '' : `<button class="cta mini" data-bp="${id}" ${P.coins >= Shop.priceOf(id) ? '' : 'disabled'}>${Shop.priceOf(id)} 🪙</button>`}`);
          $('alF').appendChild(b);
        });
        $('alF').querySelectorAll('[data-bp]').forEach(b => b.onclick = () => {
          if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = TX('¿Comprar? Toca otra vez'); return; }
          res(Shop.buyPlayer(+b.dataset.bp), r => renderReveal([r], () => renderShop(), TX('¡Fichado!')));
        });
      }
    }
  }
  let shopRole = '';
  // Abre un «elige 1 de 3» comprado en la tienda
  function renderShopPick(uid) {
    const P = Profile.data, i = (P.giftPicks || []).findIndex(g => g.uid === uid); if (i < 0) return renderShop();
    const g = P.giftPicks[i];
    screen(`${top(TX('Elige a tu jugador'))}<p class="note">${esc(g.desc)}</p><div class="hwpick" id="spk"></div><p class="note">${TX('Si sales sin elegir, lo tienes en 🎁 Código de regalo.')}</p>`, 'bg_whistle');
    g.opts.forEach(id => {
      const pd = PLAYER(id); if (!pd) return;
      const b = document.createElement('button'); b.className = 'hwpk';
      b.appendChild(face(Sprites.refOf(pd), 72));
      b.insertAdjacentHTML('beforeend', `<b>${esc(pd.name)}</b><small>${rchip(pd.rarity)} ${RAB(pd.role)} ${chip(pd.elem)}</small>${P.coll[id] ? `<small>${TX('ya lo tienes (+1 ★)')}</small>` : ''}`);
      b.onclick = () => { const j = P.giftPicks.findIndex(x => x.uid === uid); const r = j >= 0 && Profile.takePick(j, id); if (!r) return; Sound.sfx('reveal'); renderReveal([r], () => renderShop(), TX('¡Nuevo fichaje!')); };
      $('spk').appendChild(b);
    });
    $('back').onclick = () => renderShop();
  }

  function renderGift() {
    const P = Profile.data, used = Object.entries(P.codes || {}).sort((x, y) => y[1] - x[1]);
    screen(`${top(TX('Código de regalo'))}${wallet()}
      <p class="note">${TX('Escribe un código para recibir su premio. Cada código se puede canjear una vez.')}</p>
      <div class="giftin"><input id="gcode" type="text" maxlength="32" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${TX('CÓDIGO')}"><button class="cta" id="gok">${TX('Canjear')}</button></div>
      <p class="giftmsg" id="gmsg"></p>
      ${(P.giftPicks || []).map((g, i) => `<h3>🎁 ${esc(g.code)} · ${TX('Elige a tu jugador')}</h3><p class="note">${esc(g.desc)}</p><div class="hwpick" data-gp="${i}"></div>`).join('')}
      ${used.length ? `<h3>${TX('Canjeados')}</h3><p class="note">${used.map(([k, t]) => `<b>${esc(k)}</b> · ${new Date(t).toLocaleDateString('es-ES')}`).join('<br>')}</p>` : ''}`, 'bg_green');
    document.querySelectorAll('[data-gp]').forEach(box => {
      const i = +box.dataset.gp;
      P.giftPicks[i].opts.forEach(id => {
        const pd = PLAYER(id); if (!pd) return;
        const b = document.createElement('button'); b.className = 'hwpk';
        b.appendChild(face(Sprites.refOf(pd), 72));
        b.insertAdjacentHTML('beforeend', `<b>${esc(pd.name)}</b><small>${rchip(pd.rarity)} ${RAB(pd.role)} ${chip(pd.elem)}</small>${P.coll[id] ? `<small>${TX('ya lo tienes (+1 ★)')}</small>` : ''}`);
        b.onclick = () => { const r = Profile.takePick(i, id); if (!r) return; Sound.sfx('reveal'); renderReveal([r], renderGift, TX('¡Código canjeado!')); };
        box.appendChild(b);
      });
    });
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
  // Editor de los botones del móvil: arrastra cada botón y cambia su tamaño (se guarda en settings.padLayout)
  function padEditor(done) {
    const BTN = [['s4', TX('Saque largo')], ['big', TX('Tiro / Entrada')], ['s2', TX('Pase')], ['s3', TX('Técnica')], ['s5', TX('Regate / Cambiar')], ['s6', '⇄']];   // Saque largo (solo portero) va debajo de Regate
    const L = JSON.parse(JSON.stringify(settings.padLayout || {}));
    let sel = 'big';
    const ov = document.createElement('div'); ov.id = 'padEdit';
    ov.innerHTML = `<div class="pehead"><b>${TX('Arrastra cada botón a donde quieras. Toca uno para cambiar su tamaño.')}</b>
      <div class="row"><span id="peName"></span><input type="range" id="peSize" min="70" max="150" step="5"><b id="peVal"></b></div>
      <div class="row"><button class="ghost" id="peReset">${TX('Como venía')}</button><button class="ghost" id="peCancel">${TX('Cancelar')}</button><button class="cta" id="peOk">${TX('Guardar')}</button></div></div>
      <div class="pejoy">${TX('El joystick sale donde pongas el dedo (mitad izquierda)')}</div><div class="padbox" id="peBox"></div>`;
    document.getElementById('shell').appendChild(ov);
    const box = ov.querySelector('#peBox'), k = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--padk')) || 1;
    box.style.right = getComputedStyle($('pad')).right; box.style.bottom = getComputedStyle($('pad')).bottom;
    const els = {};
    const paint = key => { const el = els[key], v = L[key] || {}; el.style.translate = `${v.x || 0}px ${v.y || 0}px`; el.style.scale = String(v.s || 1); };
    const pick = key => { sel = key; Object.entries(els).forEach(([kk, el]) => el.classList.toggle('pesel', kk === key)); const v = L[key] || {};
      ov.querySelector('#peName').textContent = BTN.find(b => b[0] === key)[1] + ':'; ov.querySelector('#peSize').value = Math.round((v.s || 1) * 100); ov.querySelector('#peVal').textContent = Math.round((v.s || 1) * 100) + ' %'; };
    BTN.forEach(([key, name]) => {
      const el = document.createElement('button'); el.className = 'act ' + key + (key === 's3' ? ' fire' : ''); el.innerHTML = name.replace(' / ', '<br>'); box.appendChild(el); els[key] = el; paint(key);
      let drag = null;
      el.addEventListener('pointerdown', e => { e.preventDefault(); pick(key); const v = L[key] || {}; drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: v.x || 0, y: v.y || 0 }; try { el.setPointerCapture(e.pointerId); } catch (_) {} });
      el.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return;
        const v = L[key] = Object.assign({ s: 1 }, L[key]); v.x = Math.round(Math.max(-320, Math.min(60, drag.x + (e.clientX - drag.sx) / k))); v.y = Math.round(Math.max(-560, Math.min(40, drag.y + (e.clientY - drag.sy) / k))); paint(key); });
      const end = () => { drag = null; }; el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    });
    pick('big');
    ov.querySelector('.pehead').insertAdjacentHTML('beforeend', `<small>${TX('«Saque largo» solo sale con el portero: está debajo de «Regate», mueve Regate para verlo.')}</small>`);
    ov.querySelector('#peSize').oninput = e => { const v = L[sel] = Object.assign({ x: 0, y: 0 }, L[sel]); v.s = +e.target.value / 100; ov.querySelector('#peVal').textContent = e.target.value + ' %'; paint(sel); };
    ov.querySelector('#peReset').onclick = () => { for (const kk in L) delete L[kk]; Object.keys(els).forEach(paint); pick(sel); Sound.sfx('click'); };
    const close = save => { if (save) { settings.padLayout = Object.keys(L).length ? L : undefined; saveSettings(); Pad.refresh(); UI.toast(TX('Botones guardados'), 1400); } ov.remove(); done && done(); };
    ov.querySelector('#peCancel').onclick = () => close(false);
    ov.querySelector('#peOk').onclick = () => { Sound.sfx('reveal'); close(true); };
  }
  function renderSettings() {
    const c = Sound.cfg;
    const keys = Object.keys(TRACKS);
    const ROLE_NAMES = { menu: TX('Menús'), intro: TX('Intro'), match: TX('Partido rápido'), match_easy: TX('Etapa 1 · inicio'), match_mid: TX('Etapa 1 · mitad'), match_hard: TX('Etapa 1 · recta final'),
      match_final: TX('Etapa 1 · final y jefes'), s2_easy: TX('Etapa 2 · inicio'), s2_mid: TX('Etapa 2 · mitad'), s2_hard: TX('Etapa 2 · recta final'), s2_final: TX('Etapa 2 · final y jefes'),
      match_special: TX('Equipos especiales'), goal: TX('Gol'), win: TX('Victoria'), lose: TX('Derrota') };
    // Desplegable con las pistas agrupadas como en el juego
    const grouped = jingles => TRACK_GROUPS.filter(g => (g === 'Jingles') === jingles).map(g => `<optgroup label="${g}">${keys.filter(k => TRACKS[k].group === g)
      .map(k => `<option value="${k}">${TRACKS[k].name}</option>`).join('')}</optgroup>`).join('');
    const sel = (role, jingles, extra = []) => `<div class="group"><label>${ROLE_NAMES[role]}</label>
      <select data-role="${role}">${extra.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}${grouped(jingles)}</select></div>`;
    const rnd = [['random', TX('Aleatorio (temas de partido)')]], none = [['', TX('Ninguno')]];
    screen(`${top(TX('Ajustes'))}
      <div class="group"><label>${TX('🌐 Idioma · Language')}</label><div class="opts">${Object.entries(I18N.LANGS).map(([k, n]) => `<button data-lang="${k}" aria-pressed="${I18N.lang === k}">${n}</button>`).join('')}</div></div>
      <h3>${TX('Partido')}</h3>
      ${opts(TX('Duración del partido'), 'minutes', [[2, TX('2 min')], [3, TX('3 min')], [5, TX('5 min')]])}
      ${opts(TX('Supertécnicas'), 'techMode', [['boton', TX('Con botón')], ['auto', TX('Automáticas')]])}
      ${opts(TX('Cámara lenta en supertécnicas'), 'slowmo', [[1, TX('Sí')], [0, TX('No')]])}
      ${opts(TX('Cambio automático de jugador'), 'autoSwitch', [[1, TX('Sí')], [0, TX('No')]])}
            ${opts(TX('Faltas, tarjetas y penaltis'), 'fouls', [[1, TX('Sí')], [0, TX('No')]])}
            ${opts(TX('Elegir jugador con el balón parado'), 'pickStop', [[1, TX('Sí')], [0, TX('No')]])}
            ${opts(TX('Menús de decisión (el tiempo se para y eliges)'), 'decide', [[1, TX('Sí')], [0, TX('No')]])}
            <p class="note">${TX('Cuando un rival te sale al paso eliges regate, técnica o pase (con sus probabilidades). Al pulsar Tiro eliges chutar, con poder o vaselina, y con el rayo (Técnica) eliges la supertécnica. En faltas, saques y penaltis el que saca no se mueve: pasa o chuta.')}</p>
            <p class="note">${TX('Con «Elegir jugador», cuando el balón sale, hay falta o penalti, el partido espera y eliges quién saca o a quién controlas.')}</p>
<h3>${TX('Controles')}</h3>
      ${opts(TX('Botones en pantalla'), 'controls', [['auto', TX('Auto')], ['tactil', TX('Siempre')], ['teclado', TX('Nunca (PC)')]])}
      ${opts(TX('Tamaño de los botones (móvil)'), 'padSize', [['pequeno', TX('Pequeños')], ['normal', TX('Normales')], ['grande', TX('Grandes')]], Object.assign({ padSize: 'normal' }, settings))}
      <button class="ghost" id="sPadEd">${TX('📱 Colocar los botones a tu gusto')}</button>
      ${opts(TX('Teclas del ordenador'), 'keys', [['nuevas', TX('Nuevas (K tiro)')], ['clasicas', TX('Clásicas (L tiro)')], ['custom', TX('A tu gusto')]], Object.assign({ keys: 'nuevas' }, settings))}
      ${settings.keys === 'custom' ? keyMapHtml() : ''}
      <button class="ghost" id="sGuide">${TX('🎮 Guía de controles')}</button>
      <p class="keys"><b>${TX('Mando:')}</b> ${TX('stick o cruceta para moverte · RT esprint · A pase (mantén = fuerte) / entrada · X tiro (mantén) · B saque largo (portero) · Y supertécnica · LT cambiar técnica · RB regate · LB cambiar jugador · Start pausa.')}<br>
      <b>${TX('Móvil:')}</b> ${TX('joystick a la izquierda (más allá del aro = esprint). Mantén Pase para un pase fuerte y usa Regate para un recorte rápido sin técnica. Cambiar te pasa al compañero que antes llega al balón (también cambia solo al ir a por el balón).')}<br>
      <b>${TX('PC:')}</b> ${settings.keys === 'custom' ? TX('tus teclas están justo encima (Esc también pausa).') : settings.keys === 'clasicas' ? TX('WASD o flechas para moverte · Shift esprint · J o Z: pase (mantén = fuerte) / entrada · K o C: saque largo (portero) · L o X: tiro (mantén) / despeje · I o V: regate · Q: cambiar jugador · Espacio: supertécnica · U: cambiar técnica · P o Esc: pausa') : TX('WASD o flechas para moverte · Shift esprint · J o Z: pase (mantén = fuerte) / entrada · K o X: tiro (mantén) / cambiar jugador · L o C: saque largo (portero) · I o V: regate · Espacio: supertécnica · E: cambiar técnica · P o Esc: pausa')}</p>
      <h3>${TX('Sonido')}</h3>
      <div class="mixer"><label>${TX('🎵 Música')} <b id="mvT">${Math.round((c.music ? c.mv ?? 1 : 0) * 100)} %</b><input type="range" id="mvR" min="0" max="100" step="5" value="${Math.round((c.music ? c.mv ?? 1 : 0) * 100)}"></label>
        <label>${TX('🔊 Efectos')} <b id="svT">${Math.round((c.sfx ? c.sv ?? 1 : 0) * 100)} %</b><input type="range" id="svR" min="0" max="100" step="5" value="${Math.round((c.sfx ? c.sv ?? 1 : 0) * 100)}"></label></div>
      <p class="note">${TX('La música sale de tus archivos del Inazuma 1 y 2, reconstruida desde las partituras del juego. Los nombres son los de la colección de música del Inazuma 2.')}</p>
      ${opts(TX('Intro al abrir el juego'), 'intro', [[1, TX('Sí')], [0, TX('No')]])}
      <button class="ghost" id="seeIntro">${TX('▶ Ver la intro')}</button>
      <div class="group"><label>${TX('Rivales con tema propio')}</label><div class="opts"><button id="tt1" aria-pressed="${c.teamThemes !== false}">${TX('Su música')}</button><button id="tt0" aria-pressed="${c.teamThemes === false}">${TX('La de la etapa')}</button></div></div>
      <details class="roles"><summary>${TX('Elegir música de cada momento')}</summary>
      ${sel('menu', false)}${sel('intro', false)}${sel('match', false, rnd)}${['match_easy', 'match_mid', 'match_hard', 'match_final', 's2_easy', 's2_mid', 's2_hard', 's2_final', 'match_special'].map(r => sel(r, false, rnd)).join('')}
      ${sel('goal', true, none)}${sel('win', true, none)}${sel('lose', true, none)}
      <button class="ghost" id="resetRoles">${TX('Volver a la música de serie')}</button></details>
      <h3>${TX('Escuchar')} <small>${TX('toca para oír cada pista')}</small></h3>
      ${TRACK_GROUPS.map(g => `<details class="tgroup"><summary>${g} <small>${keys.filter(k => TRACKS[k].group === g).length}</small></summary><div class="tracks">${keys.filter(k => TRACKS[k].group === g).map(k => `<button class="ghost" data-play="${k}">▶ ${TRACKS[k].name}</button>`).join('')}</div></details>`).join('')}
      <button class="ghost" id="stopAll">${TX('Parar')}</button>
      ${settings.dev ? '<button class="ghost" id="toDev">' + TX('🛠 Modo desarrollador') + '</button>' : ''}
      <p class="note">${TX('Inazuma Gold v')}${VERSION} ${TX('· fan game gratuito y no oficial. Inazuma Eleven es de Level-5.')}</p>`);
    $('sPadEd').onclick = () => padEditor(() => { const yy = $('screen').scrollTop; renderSettings(); $('screen').scrollTop = yy; });
    bindOpts(settings, k => { saveSettings(); if (k === 'controls' || k === 'padSize') Controls.apply(); if (k === 'decide') Pad.refresh(); if (k === 'keys') { const y = $('screen').scrollTop; renderSettings(); $('screen').scrollTop = y; } });
    body.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => {
      if (b.dataset.lang === I18N.lang) return;
      I18N.set(b.dataset.lang); Sound.sfx('click');
      screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${b.dataset.lang === 'en' ? 'Changing language…' : 'Cambiando el idioma…'}</span></div>`, 'bg_title');
      setTimeout(() => location.reload(), 250);
    });
    if ($('toDev')) $('toDev').onclick = () => { Sound.stop(0.2); renderDev(); };
    $('mvR').oninput = e => { const v = +e.target.value / 100; Sound.setVol('music', v); $('mvT').textContent = e.target.value + ' %'; };
    $('svR').oninput = e => { const v = +e.target.value / 100; Sound.setVol('sfx', v); $('svT').textContent = e.target.value + ' %'; };
    $('svR').onchange = () => Sound.sfx('click');
    body.querySelectorAll('select[data-role]').forEach(s => { s.value = c.roles[s.dataset.role] ?? ''; s.onchange = () => Sound.setRole(s.dataset.role, s.value); });
    $('seeIntro').onclick = () => { Sound.stop(0.2); playIntro(renderSettings); };
    $('sGuide').onclick = () => renderControlsGuide(renderSettings);
    bindKeyMap();
    $('tt1').onclick = () => { Sound.setTeamThemes(true); renderSettings(); };
    $('tt0').onclick = () => { Sound.setTeamThemes(false); renderSettings(); };
    $('resetRoles').onclick = () => { Object.entries(Sound.DEF_ROLES).forEach(([r, k]) => Sound.setRole(r, k)); renderSettings(); UI.toast(TX('Música de serie')); };
    body.querySelectorAll('[data-play]').forEach(b => b.onclick = () => Sound.preview(b.dataset.play));
    $('stopAll').onclick = () => Sound.stop(0.2);
    $('back').onclick = () => { Sound.stop(0.2); renderMenu(); };
  }

  /* ---------- Modo desarrollador (20 toques en la versión) ---------- */
  function renderDevClub() {
    const c = Career.data;
    screen(`${top(TX('Elegir club'))}<p class="note">${TX('Ocupas el sitio del club que elijas: su división, su nombre y sus jugadores. Ellos se quedan con tu plantilla. La temporada empieza de nuevo.')}</p>
      ${[1, 2, 3].map(d => `<h3>${DIV_NAME[d]}</h3><div class="modes">${c.divs[d].filter(k => k !== YOU).map(k => `<button class="mode" data-club="${esc(k)}">${Sprites.crest(crestOf(k))}<span class="mt"><b>${esc(Career.teamName(k))}</b><small>${TX('media')} ${Career.rating(k)}</small></span></button>`).join('')}</div>`).join('')}`);
    body.querySelectorAll('[data-club]').forEach(b => b.onclick = () => { Career.devTakeClub(b.dataset.club); Sound.sfx('reveal'); UI.toast(TX('Ahora eres ') + Career.data.school, 1800); renderCareer(); });
    $('back').onclick = renderDev;
  }
  function renderDevSign() {
    screen(`${top(TX('Fichar gratis'))}<p class="note">${TX('Busca cualquier jugador del gacha y tócalo para meterlo en tu plantilla de Carrera (sin límite).')}</p>
      <div class="pfbar"><div class="pfq"><input id="dsQ" type="search" placeholder="${TX('Buscar por nombre o mote…')}" autocomplete="off"></div></div><div class="pgrid" id="dsL"></div>`);
    const draw = () => {
      const q = norm($('dsQ').value.trim()), L = $('dsL'); L.innerHTML = '';
      if (q.length < 2) { L.innerHTML = '<p class="note">' + TX('Escribe al menos 2 letras.') + '</p>'; return; }
      GAME.players.filter(p => p.cs && p.gacha !== false && (norm(p.name).includes(q) || norm(p.full).includes(q))).slice(0, 40).forEach(p => {
        const inSq = !!Career.m(p.id), el = tile(p.id, `<span class="slot">${inSq ? TX('Ya está en tu club') : TX('Fichar gratis')}</span>`);
        if (inSq) el.classList.add('sel');
        el.onclick = () => { if (Career.devSign(p.id)) { Sound.sfx('reveal'); UI.toast(p.name + TX(' se une a ') + Career.data.school, 1400); draw(); } };
        L.appendChild(el);
      });
    };
    $('dsQ').oninput = draw; draw();
    $('back').onclick = renderDev;
  }
  /* ---------- (desarrollador) Galería de supertécnicas: cualquiera, en acción en un minicampo ---------- */
  let techGal = { type: '', elem: '', q: '' };
  function renderDevTechs() {
    api.techDemo = null;
    const G = techGal, all = Object.values(GAME.techniques).filter(t => (t.id < 30000 || t.id >= 30900) && (!G.type || t.type === G.type) && (!G.elem || t.elem === G.elem));
    const types = [['', TX('Todas')], ['tiro', TYPE_LABEL.tiro], ['parada', TYPE_LABEL.parada], ['regate', TYPE_LABEL.regate], ['bloqueo', TYPE_LABEL.bloqueo]];
    const elems = [['', TX('Todos')], ['fuego', ELEM_LABEL.fuego], ['viento', ELEM_LABEL.viento], ['bosque', ELEM_LABEL.bosque], ['montaña', ELEM_LABEL['montaña']], ['neutro', TX('Neutro')]];
    screen(`${top(TX('Galería de supertécnicas'))}
      <p class="note">${TX('Toca una y la verás en acción en un minicampo, una y otra vez. Para volver, pausa y «Salir».')}</p>
      <div class="opts">${types.map(([k, n]) => `<button data-gt="${k}" aria-pressed="${G.type === k}">${n}</button>`).join('')}</div>
      <div class="opts small">${elems.map(([k, n]) => `<button data-ge="${k}" aria-pressed="${G.elem === k}">${n}</button>`).join('')}</div>
      <div class="pfbar"><div class="pfq"><input id="gtQ" type="search" placeholder="${TX('Buscar técnica…')}" autocomplete="off" value="${esc(G.q)}"></div></div>
      <p class="cweek" id="gtN"></p><div class="csquad" id="gtL"></div>`, 'bg_title');
    const draw = () => {
      const q = norm(G.q.trim()), L = $('gtL'), list = all.filter(t => !q || norm(t.name).includes(q)).sort((a, b) => a.type.localeCompare(b.type) || b.power - a.power);
      $('gtN').textContent = TXn(list.length, '{0} técnica', '{0} técnicas');
      L.innerHTML = list.slice(0, 150).map(t => `<button class="ghost pctech" data-gtech="${t.id}">${techLine(t)}</button>`).join('') + (list.length > 150 ? `<p class="note">${TX('Escribe para ver más…')}</p>` : '');
      L.querySelectorAll('[data-gtech]').forEach(b => b.onclick = () => techDemo(+b.dataset.gtech));
    };
    $('gtQ').addEventListener('keydown', e => e.stopPropagation());
    $('gtQ').oninput = e => { G.q = e.target.value; draw(); };
    body.querySelectorAll('[data-gt]').forEach(b => b.onclick = () => { G.type = b.dataset.gt; renderDevTechs(); });
    body.querySelectorAll('[data-ge]').forEach(b => b.onclick = () => { G.elem = b.dataset.ge; renderDevTechs(); });
    draw();
    $('back').onclick = renderDev;
  }
  // Monta un minicampo con 2 contra 2 y repite la técnica elegida
  function techDemo(id) {
    const t = TECH(id); if (!t) return;
    const pick = role => GAME.players.find(p => p.cs && p.gacha !== false && p.role === role && (p.elem === t.elem || t.elem === 'neutro'))
      || GAME.players.find(p => p.cs && p.gacha !== false && p.role === role);
    const shotT = Object.values(GAME.techniques).find(x => x.type === 'tiro' && x.power >= 70 && x.id < 30000);   // tiro del rival (para ver paradas)
    const role = t.type === 'parada' ? 'POR' : t.type === 'bloqueo' ? 'DEF' : 'DEL';
    const owner = GAME.players.find(p => p.cs && (p.leyenda || p.selva) && p.moves.some(([m]) => m === id));   // técnica de evento: la hace su dueño (Gafas Royale → Willy LEYENDA)
    const star = owner && t.type !== 'parada' ? owner : pick(role === 'POR' ? 'DEL' : role), gkA = t.type === 'parada' ? (owner || pick('POR')) : GAME.players.find(p => p.cs && p.role === 'POR');
    const rivF = pick('MED'), gkB = GAME.players.filter(p => p.cs && p.role === 'POR')[1];
    const mk = (pd, r, techs, row) => Object.assign(buildMatchPlayer(pd.id, r, k => Math.round(pd.ie[k] * 0.9), techs, [], row), { sprite: Sprites.refOf(pd), name: pd.name });
    const A = { name: TX('Galería'), players: [mk(gkA, 'POR', t.type === 'parada' ? [id] : [], 0), mk(star, t.type === 'bloqueo' ? 'DEF' : 'DEL', t.type === 'parada' ? [] : [id], 1)] };
    const B = { name: t.name, players: [mk(gkB, 'POR', [], 2), mk(rivF, 'MED', t.type === 'parada' && shotT ? [shotT.id] : [], 3)] };
    api.mode = 'techview';
    api.matchOpts = { lockId: 'A1', extra: { mini: true, minutes: 99, noOffside: true, techMode: 'boton' } };
    api.techDemo = { id, type: t.type, n: 0, next: 0 };
    startMatch({ A, B }, false, 'normal', 'match_special', null).then(() => techLoop());
  }
  // Coloca a los jugadores y lanza la técnica; se repite cada pocos segundos
  function techLoop() {
    const D = api.techDemo, s = api.match; if (!D || api.mode !== 'techview' || !s || s.over) return;
    // Se repite cuando la jugada ha terminado (sin técnica en marcha ni tiro en el aire) y ha pasado un momento
    const busy = s.tech || (s.ball.shot && !s.ball.shot.resolved) || s.players.some(p => p.dash);
    if (busy) D.idleAt = 0; else if (!D.idleAt) D.idleAt = performance.now();
    const now = performance.now(), ready = (!busy && now - D.idleAt > 1300) || now > D.next + 6000;
    if (api.running && now >= D.next && ready) {
      const F = Logic.FIELD, cx = F.w / 2, P = id => s.players.find(p => p.id === id), T = Logic._t;
      const gA = P('A0'), me = P('A1'), gB = P('B0'), rv = P('B1');
      const put = (p, x, y) => Object.assign(p, { x, y, z: 0, vx: 0, vy: 0, dvx: 0, dvy: 0, stun: 0, dash: null, tackle: null, windup: null, tkWind: 0, gkTech: null, diving: false, kickLock: 0 });
      s.tech = null; s.pause = null; s.slow = 0; Object.assign(s.ball, { shot: null, fire: null, vx: 0, vy: 0, vz: 0, z: 0 });
      for (const p of s.players) p.cd = {};
      put(gA, cx, F.l - 1.2); put(gB, cx, 1.2);
      if (D.type === 'tiro') { put(me, cx, 9); put(rv, 3, 20); me.aim = -Math.PI / 2; T.take(s, me); T.startTech(s, me, me.techs[0], 0); }
      else if (D.type === 'parada') { put(me, 3, 10); put(rv, cx, 19); rv.aim = Math.PI / 2; T.take(s, rv); if (rv.techs[0]) T.startTech(s, rv, rv.techs[0], 0); }
      else if (D.type === 'regate') { put(me, cx, 16); put(rv, cx, 12.5); me.aim = -Math.PI / 2; T.take(s, me); T.startTech(s, me, me.techs[0], 0); }
      else { put(rv, cx, 12); put(me, cx, 15.2); rv.aim = Math.PI / 2; T.take(s, rv); T.startTech(s, me, me.techs[0], 0); }
      D.n++; D.next = performance.now() + 1500; D.idleAt = 0;
    }
    setTimeout(techLoop, 200);
  }
  /* ---------- (desarrollador) Probar bloqueos de tiro: un rival te chuta una y otra vez y tú bloqueas ---------- */
  const blockCfg = { tech: null, shot: 'super', def: 85, mode: 'boton', q: '' };
  function renderDevBlocks() {
    api.blockDemo = null;
    const C = blockCfg, all = Object.values(GAME.techniques).filter(t => t.type === 'bloqueo' && t.id < 30000).sort((a, b) => b.power - a.power);
    if (C.tech == null || !TECH(C.tech)) C.tech = all[0].id;
    const opt = (k, list) => `<div class="opts">${list.map(([v, n]) => `<button data-bk="${k}" data-bv="${v}" aria-pressed="${String(C[k]) === String(v)}">${n}</button>`).join('')}</div>`;
    screen(`${top(TX('Probar bloqueos de tiro'))}
      <p class="note">${TX('Eres un defensa en un minicampo y el rival te chuta una y otra vez. Ponte delante y pulsa Técnica cuando salga el aviso. Para volver, pausa y «Salir».')}</p>
      <h3>${TX('Tiro del rival')}</h3>${opt('shot', [['normal', TX('Normal')], ['cargado', TX('Cargado')], ['super', TX('Supertécnica')]])}
      <h3>${TX('Defensa y físico de tu jugador')}</h3>${opt('def', [[50, '50'], [70, '70'], [85, '85'], [99, '99']])}
      <h3>${TX('Cómo se activa')}</h3>${opt('mode', [['boton', TX('Con botón')], ['auto', TX('Automático')]])}
      <h3>${TX('Tu técnica de bloqueo')}</h3>
      <div class="pfbar"><div class="pfq"><input id="bkQ" type="search" placeholder="${TX('Buscar técnica…')}" autocomplete="off" value="${esc(C.q)}"></div></div>
      <div class="csquad" id="bkL"></div>`, 'bg_title');
    const draw = () => {
      const q = norm(C.q.trim()), list = all.filter(t => !q || norm(t.name).includes(q));
      $('bkL').innerHTML = list.slice(0, 80).map(t => `<button class="ghost pctech${t.id === C.tech ? ' sel' : ''}" data-btech="${t.id}">${techLine(t)}</button>`).join('');
      $('bkL').querySelectorAll('[data-btech]').forEach(b => b.onclick = () => { C.tech = +b.dataset.btech; blockDemo(); });
    };
    $('bkQ').addEventListener('keydown', e => e.stopPropagation());
    $('bkQ').oninput = e => { C.q = e.target.value; draw(); };
    body.querySelectorAll('[data-bk]').forEach(b => b.onclick = () => { const k = b.dataset.bk; C[k] = k === 'def' ? +b.dataset.bv : b.dataset.bv; Sound.sfx('click'); const y = $('screen').scrollTop; renderDevBlocks(); $('screen').scrollTop = y; });
    draw();
    $('back').onclick = renderDev;
  }
  function blockDemo() {
    const C = blockCfg, t = TECH(C.tech); if (!t) return;
    const pick = (role, i = 0) => GAME.players.filter(p => p.cs && p.gacha !== false && p.role === role)[i];
    const shotT = Object.values(GAME.techniques).filter(x => x.type === 'tiro' && x.id < 30000).sort((a, b) => b.power - a.power)[8];
    const me = pick('DEF'), rv = pick('DEL', 3);
    const mk = (pd, r, techs, row, st) => Object.assign(buildMatchPlayer(pd.id, r, k => st && st[k] != null ? st[k] : Math.round(pd.ie[k] * 0.9), techs, [], row), { sprite: Sprites.refOf(pd), name: pd.name });
    const A = { name: TX('Bloqueos'), players: [mk(pick('POR'), 'POR', [], 0), mk(me, 'DEF', [t.id], 1, { defensa: C.def, fisico: C.def })] };
    const B = { name: TX('Rival'), players: [mk(pick('POR', 1), 'POR', [], 2), mk(rv, 'DEL', shotT ? [shotT.id] : [], 3, { tiro: 85 })] };
    api.mode = 'blockview';
    api.matchOpts = { lockId: 'A1', extra: { mini: true, minutes: 99, noOffside: true, techMode: C.mode } };
    api.blockDemo = { n: 0, next: 0, stop: 0, slow: 0, miss: 0, shot: null, p0: 0 };
    startMatch({ A, B }, false, 'normal', 'match_special', null).then(() => blockLoop());
  }
  function blockLoop() {
    const D = api.blockDemo, s = api.match; if (!D || api.mode !== 'blockview' || !s || s.over) return;
    const F = Logic.FIELD, cx = F.w / 2, P = id => s.players.find(p => p.id === id), T = Logic._t, me = P('A1');
    if (s.ball.shot && !D.shot) { D.shot = s.ball.shot; D.p0 = s.ball.shot.power; }
    const busy = s.tech || (s.ball.shot && !s.ball.shot.resolved && s.ball.shot === D.shot && !s.ball.owner);
    if (busy) D.idleAt = 0; else if (!D.idleAt) D.idleAt = performance.now();
    const now = performance.now();
    if (D.shot && !busy && now - D.idleAt > 300 && !D.done) {   // resultado del tiro
      D.done = true;
      if (s.ball.owner === me) D.stop++; else if (D.shot.power < D.p0) D.slow++; else D.miss++;
      UI.toast(TX('Parados {0} · Frenados {1} · Sin bloquear {2}', D.stop, D.slow, D.miss), 1500);
    }
    if (api.running && now >= D.next && ((!busy && now - D.idleAt > 1400) || now > D.next + 7000)) {
      const put = (p, x, y) => Object.assign(p, { x, y, z: 0, vx: 0, vy: 0, dvx: 0, dvy: 0, stun: 0, dash: null, tackle: null, windup: null, tkWind: 0, gkTech: null, diving: false, kickLock: 0, invuln: 0 });
      s.tech = null; s.pause = null; s.slow = 0; s.blockAsk = null; Object.assign(s.ball, { shot: null, fire: null, vx: 0, vy: 0, vz: 0, z: 0 });
      for (const p of s.players) p.cd = {};
      const gA = P('A0'), gB = P('B0'), rv = P('B1');
      put(gA, cx, F.l - 1.2); put(gB, cx, 1.2); put(rv, cx + (Math.random() - 0.5) * 4, 15); put(me, cx + (Math.random() - 0.5) * 2, 21);
      rv.aim = Math.PI / 2; me.aim = -Math.PI / 2; s.controlledId = me.id;
      T.take(s, rv);
      if (blockCfg.shot === 'super' && rv.techs[0]) T.startTech(s, rv, rv.techs[0], 0);
      else T.shoot(s, rv, blockCfg.shot === 'cargado' ? 1 : 0.4, (Math.random() - 0.5) * 0.6, null);
      D.n++; D.next = performance.now() + 1500; D.idleAt = 0; D.shot = null; D.done = false;
    }
    setTimeout(blockLoop, 100);
  }
  // (desarrollador) Lista de todas las decisiones de la Carrera Jugador: toca una para que salga ya
  function renderDevEvents() {
    const keys = PC.devEventKeys(), seen = PC.data.me.evSeen || [];
    const title = k => { const save = PC.data.me.event; if (!PC.devEventForce(k, true)) { PC.data.me.event = save; return null; } const v = PC.eventView(); PC.data.me.event = save; return v; };
    const rows = keys.map(k => [k, title(k)]);
    screen(`${top(TX('Probar decisiones'))}
      <p class="note">${TX('Toca una y te sale ahora mismo en la Carrera Jugador. Las marcadas con ✓ ya te han salido hace poco.')}</p>
      <div class="csquad">${rows.map(([k, v]) => `<button class="ghost big" data-dev="${k}" ${v ? '' : 'disabled'}>${seen.includes(k) ? '✓ ' : ''}${v ? esc(v.title) : k}<small>${v ? esc(v.text) : TX('necesita compañeros en tu equipo')}</small></button>`).join('')}</div>`, 'bg_title');
    body.querySelectorAll('[data-dev]').forEach(b => b.onclick = () => { if (PC.devEventForce(b.dataset.dev)) { Sound.sfx('click'); renderPC(); } });
    $('back').onclick = renderDev;
  }
  function renderDev() {
    if (!BETA) return renderMenu();
    const P = Profile.data;
    const b = (id, t, sub = '') => `<button class="ghost big" id="${id}">${t}<small>${sub}</small></button>`;
    screen(`${top(TX('Desarrollador'))}
      <p class="note">v${VERSION} · ${GAME.players.filter(p => p.gacha !== false).length} ${TX('jugadores en el gacha ·')} ${Object.keys(GAME.techniques).length} ${TX('técnicas (')}${LEG_TECHS.length} ${TX('legendarias) ·')} ${GAME.teams.length} ${TX('equipos rivales')}</p>
      ${wallet()}
      <h3>${TX('Recursos')}</h3>
      <div class="grid2">${b('dTick', TX('+1000 tickets'))}${b('dCoin', TX('+100.000 monedas'))}${b('dRayo', TX('+10 Rayos'))}${b('dPity', TX('Épica asegurada'), TX('la próxima tirada'))}</div>
      <h3>${TX('Colección')}</h3>
      <div class="grid2">${b('dAll', TX('Todos los jugadores'))}${b('dStars', TX('Todos a 5 ★'))}${b('dTechs', TX('Todas las técnicas'), 'legendarias')}${b('dTrain', TX('Entrenar al máximo'))}</div>
      <h3>${TX('Progreso')}</h3>
      <div class="grid2">${b('dStory', TX('Completar todas las etapas'), TX('1, 2 y 3 · abre todo'))}${b('dChains', TX('Completar las cadenas'), TX('×5 con medalla de oro'))}${b('dRun', TX('Borrar partida'), TX('en curso'))}${b('dReset', TX('Borrar perfil'), TX('empezar de cero'))}</div>
      <h3>${TX('Carrera')}</h3>
      ${Career.data ? `<p class="note">${esc(Career.data.school)} ${TX('· temporada')} ${Career.data.season} · ${DIV_NAME[Career.myDiv()]} · ${money(Career.data.money)}</p>
      <div class="grid2">${b('dMoney', Career.data.devMoney ? TX('💰 Dinero infinito: SÍ') : TX('💰 Dinero infinito: NO'), TX('toca para cambiar'))}${b('dClub', TX('Elegir club'), TX('ocupas su sitio y sus jugadores'))}
        ${b('dSign', TX('Fichar gratis'), TX('cualquier jugador'))}${b('dFame', TX('Fama y forma al 100'))}
        ${b('dWC', TX('🌍 Empezar el Mundial'), 'ahora mismo')}${b('dSeason', TX('Terminar temporada'), TX('simula lo que queda'))}
        ${b('dDiv1', TX('Subir a Primera'), TX('la temporada empieza de nuevo'))}${b('dDiv3', TX('Bajar a Tercera'), TX('la temporada empieza de nuevo'))}</div>`
        : `<p class="note">${TX('No hay ninguna carrera empezada.')}</p><div class="grid2">${b('dNewCar', TX('Crear carrera rápida'), TX('normal, con Nelly'))}</div>`}
      <h3>${TX('Carrera Jugador')}</h3>
      ${PC.data ? `<p class="note">${esc(PLAYER(PC.data.me.id).name)} · ${esc(PC.data.school)} · ${TX('Temporada')} ${PC.data.season} · ${TX('Nivel')} ${PC.data.me.lv} · ${TX('media')} ${PC.ovrMe()}${PC.data.pro ? ' · ' + TX('Liga Pro') : ''}</p>
      <div class="grid2">${b('pLv', TX('+1 nivel'), TX('puntos y técnica'))}${b('pSt', TX('+10 en todo'), TX('stats de tu jugador'))}
        ${b('pTech', TX('Aprender técnica'), TX('elige 1 de 3'))}${b('pTrust', TX('Titular fijo'), TX('confianza y forma al máximo'))}
        ${b('pSeason', TX('Terminar temporada'), TX('simula lo que queda'))}${b('pOff', TX('Ofertas ahora'), TX('3 clubes te quieren'))}
        ${b('pGrad', TX('Graduarse ya'), TX('y saltar a la Liga Pro'))}${b('pWC', TX('🌍 Mundial ahora'), TX('con tu selección'))}${b('pWCs', TX('🌍 Mundial de suplente'), TX('sales en la 2.ª parte'))}${b('pWCr', TX('🌍 Mundial de reserva'), TX('lo ves desde la grada'))}${b('pNat', TX('🌍 Selección: {0}', esc(PC.natName(PC.myNat()))), TX('toca para cambiarla'))}
        ${b('pDuel', TX('⚔️ Reto 1v1 ahora'), TX('contra un rival de tu liga'))}${b('pEv', TX('💬 Decisión ahora'), TX('prensa, vida o vestuario'))}
        ${b('pEvAll', TX('💬 Probar decisiones'), TX('elige cualquiera de las {0}', PC.devEventKeys().length))}</div>`
        : `<p class="note">${TX('No hay ninguna Carrera Jugador empezada.')}</p>`}
      <h3>${TX('Fichajes')}</h3>
      <div class="grid2">${b('dMkt', TX('Mercado entre clubes'), TX('5 fichajes ahora (Carrera y Jugador)'))}${b('dBid', TX('Oferta por un jugador'), TX('Carrera mánager'))}</div>
      <h3>${TX('Logros')}</h3>
      <div class="grid2">${b('dAchAll', TX('Conseguir todos'), TX('listos para recoger'))}${b('dAchReset', TX('Reiniciar logros'), TX('se vuelven a comprobar'))}</div>
      <h3>${TX('Halloween')}</h3>
      <div class="grid2">${b('dHwOn', settings.hwForce ? TX('🎃 Evento forzado: SÍ') : TX('🎃 Evento forzado: NO'), TX('verlo fuera de fechas'))}${b('dHwCandy', TX('+300 caramelos'))}
        ${b('dHwRetos', TX('Completar los retos'), TX('desbloquea a Ray Dark'))}${b('dHwReset', TX('Reiniciar el evento'), TX('caramelos, retos y regalo'))}</div>
      <h3>${TX('Jugadores especiales')}</h3>
      <div class="grid2">${b('dAddHw', TX('🎃 Legendarios de Halloween'), TX('los {0} + Jim épico', HW_LEGENDS.length))}${b('dAddSv', TX('🍃 Legendarios del Sobre Selva'), TX('los {0}', SV_LEGENDS.length))}
        ${b('dAddInf', TX('∞ Versiones del Infinito'), TX('las {0}', GAME.players.filter(p => p.inf).length))}${b('dAddOrig', TX('⭐ Originales de Fran'), TX('Goggle Jr., Rosfire y Knack'))}</div>
      <h3>${TX('Sobre Selva')}</h3>
      <div class="grid2">${b('dLyWin', TX('Cadena Leyenda: al partido 15'), TX('empieza o salta al último partido'))}${b('dLyReset', TX('Reiniciar la Cadena Leyenda'), TX('premios, récord y Willy'))}</div>
      <div class="grid2">${b('dSvLeg', TX('Legendario en la próxima tirada'), TX('asegurado del Sobre Selva'))}${b('dSvReset', TX('Reiniciar el Sobre Selva'), TX('tiradas y asegurado'))}</div>
      <p class="note">${TX('El Sobre Selva sale en el Gacha cuando el evento de Halloween está forzado (en la beta, siempre).')}</p>
      <h3>${TX('Tienda y álbum')}</h3>
      <div class="grid2">${b('dShopAll', TX('Desbloquear toda la tienda'), TX('diseños, colores, escudo, formas y campos'))}${b('dShopDay', TX('Reiniciar límites'), TX('tickets del día y sobre legendario'))}
        ${b('dTechLv', TX('Técnicas a nivel 3'), TX('las de tus jugadores'))}${b('dAlbum', TX('Completar el álbum'), TX('premios listos para recoger'))}</div>
      <h3>${TX('Partido rápido')}</h3>
      <div class="grid2">${b('dQuick', TX('⚽ Partido rápido'), TX('tus 5 de Plantilla contra un rival al azar'))}${b('dOff', TX('Salir del modo'), 'desarrollador')}</div>
      <h3>${TX('Navidad')}</h3>
      <div class="grid2">${b('dXmOn', settings.xmForce ? TX('🎄 Evento forzado: SÍ') : TX('🎄 Evento forzado: NO'), TX('verlo fuera de fechas'))}${b('dXmSnow', TX('+300 copos'))}
        ${b('dXmRetos', TX('Completar los retos'), TX('y recibir el regalo especial'))}${b('dXmReset', TX('Reiniciar el evento'), TX('copos, retos y regalo'))}</div>
      <h3>${TX('Partido')}</h3>
      ${opts(TX('Velocidad del juego'), 'speed', [[0.5, '50 %'], [0.75, TX('75 % (normal)')], [1, '100 %']])}
      ${opts(TX('Datos en pantalla (FPS, recargas…)'), 'debug', [[1, TX('Sí')], [0, TX('No')]])}
      ${opts(TX('Botón «Ganar ahora» en la pausa'), 'devWin', [[1, TX('Sí')], [0, TX('No')]])}
      <h3>${TX('Supertécnicas')}</h3>
      <div class="grid2">${b('dTechs2', TX('✨ Galería de supertécnicas'), TX('las {0}, en acción', Object.values(GAME.techniques).filter(t => t.id < 30000).length))}${b('dBlocks', TX('🧱 Probar bloqueos de tiro'), TX('te chutan una y otra vez'))}</div>
      <h3>${TX('Gacha')}</h3>
      <div class="grid2">${b('dLeg', TX('Legendario asegurado'), (P.devLeg ? P.devLeg + TX(' pendientes · ') : '') + TX('las próximas 10 tiradas'))}</div>
      <button class="ghost" id="dSim">${TX('Simular 1000 tiradas en cada gacha')} <small>${TX('(no gasta nada)')}</small></button>
      <div id="simOut" class="note"></div>`);
    if (settings.speed == null) settings.speed = 0.75;
    bindOpts(settings, saveSettings);
    const done = msg => { Profile.save(); Sound.sfx('reveal'); UI.toast(msg, 1400); renderDev(); };
    $('dTick').onclick = () => { P.tickets += 1000; done(TX('+1000 tickets')); };
    $('dCoin').onclick = () => { P.coins += 100000; done(TX('+100.000 monedas')); };
    $('dRayo').onclick = () => { P.rayos += 10; done(TX('+10 Rayos Raimon')); };
    $('dPity').onclick = () => { P.pity = 9; done(TX('La próxima tirada será épica o mejor')); };
    $('dAll').onclick = () => { GAME.players.forEach(p => { if (p.gacha !== false && !P.coll[p.id]) P.coll[p.id] = { stars: 1, up: {} }; }); done(TX('Colección completa')); };
    $('dStars').onclick = () => { Object.values(P.coll).forEach(o => { o.stars = MAX_STARS; }); done(TX('Todos con 5 estrellas')); };
    $('dTechs').onclick = () => { LEG_TECHS.forEach(t => { P.techs[t] = 1; }); done(TX('Todas las técnicas legendarias')); };
    $('dTrain').onclick = () => { Object.values(P.coll).forEach(o => STAT_KEYS.forEach(k => { o.up[k] = 40; })); done(TX('Entrenamiento al máximo')); };
    $('dStory').onclick = () => { ['s1', 's2', 's3', 's4'].forEach(k => { P.story[k] = P.story[k] || {}; P.story[k].done = true; P.story[k].best = Math.max(P.story[k].best || 0, 9); }); done(TX('Etapas 1, 2 y 3 completadas')); };
    $('dChains').onclick = () => { CHAINS.forEach(ch => { P.chains[ch.key] = Math.max(P.chains[ch.key] || 0, 5); }); done(TX('Cadenas completadas con oro')); };
    $('dLeg').onclick = () => { P.devLeg = (P.devLeg || 0) + 10; done(TX('Las próximas 10 tiradas serán legendarias')); };
    const cdone = msg => { Career.save(); done(msg); };
    if (Career.data) {
      const C = Career.data;
      $('dMoney').onclick = () => { C.devMoney = !C.devMoney; if (!C.devMoney) C.money = Math.min(C.money, 5000); cdone(C.devMoney ? TX('Dinero infinito activado') : TX('Dinero infinito desactivado')); };
      $('dFame').onclick = () => { C.fame = 100; C.forma = 100; cdone(TX('Fama y forma al 100')); };
      $('dWC').onclick = () => { C.wc = Career.wcCreate(C.season); Career.save(); Sound.sfx('reveal'); renderCareer(); };
      $('dSeason').onclick = () => { const sum = Career.devEndSeason(); Sound.music('menu'); if (sum) renderCareerSeason(sum); else renderCareer(); };
      $('dDiv1').onclick = () => { Career.devToDiv(1); cdone(TX('Ahora estás en Primera')); };
      $('dDiv3').onclick = () => { Career.devToDiv(3); cdone(TX('Ahora estás en Tercera')); };
      $('dClub').onclick = () => renderDevClub();
      $('dSign').onclick = () => renderDevSign();
    } else $('dNewCar').onclick = () => { Career.create(13, TX('Instituto Inazuma')); done(TX('Carrera creada')); };
    $('dRun').onclick = () => { Run.clear(); api.run = null; done(TX('Partida en curso borrada')); };
    $('dQuick').onclick = startQuick;
    $('dTechs2').onclick = () => renderDevTechs();
    $('dBlocks').onclick = () => renderDevBlocks();
    $('dAchAll').onclick = () => { Ach.devAll(); done(TX('Todos los logros listos para recoger')); };
    $('dAchReset').onclick = () => { Ach.devReset(); done(TX('Logros reiniciados')); };
    $('dMkt').onclick = () => {
      let n = 0;
      if (Career.data) { n += Career.aiTransfers(5).length; Career.save(); }
      if (PC.data) { n += PC.aiTransfers(5).length; PC.save(); }
      done(TXn(n, '{0} fichaje entre clubes (mira las noticias)', '{0} fichajes entre clubes (mira las noticias)'));
    };
    $('dBid').onclick = () => {
      if (!Career.data) return UI.toast(TX('No hay ninguna carrera empezada.'));
      Career.data.bid = Career.makeBid(true); Career.save();
      if (Career.data.bid) { Sound.sfx('reveal'); renderCareer(); } else UI.toast(TX('Ningún club puede pujar ahora'));
    };
    if (PC.data) {
      const pdone = msg => { PC.save(); done(msg); };
      $('pLv').onclick = () => { PC.devLevel(); pdone(TX('+1 nivel')); };
      $('pSt').onclick = () => { PC.devStats(10); pdone(TX('+10 en todas las stats')); };
      $('pTech').onclick = () => { if (PC.devTech()) renderPCTech(renderDev); else UI.toast(TX('No hay técnicas nuevas a tu alcance')); };
      $('pTrust').onclick = () => { PC.devTrust(); pdone(TX('Ahora eres titular fijo')); };
      $('pSeason').onclick = () => { const sum = PC.devEndSeason(); Sound.music('menu'); if (sum) renderPCSeason(sum); else renderPC(); };
      $('pOff').onclick = () => { PC.devOffers(); renderPC(); };
      $('pGrad').onclick = () => { if (PC.devGraduate()) renderPC(); else UI.toast(TX('Ya estás graduado')); };
      $('pWC').onclick = () => { PC.devWC(); renderPC(); };
      $('pWCs').onclick = () => { PC.devWC('suplente'); renderPC(); };
      $('pWCr').onclick = () => { PC.devWC('reserva'); renderPC(); };
      $('pNat').onclick = () => { const me = PC.data.me, i = PC_NATS.indexOf(PC.myNat()); me.nat = PC_NATS[(i + 1) % PC_NATS.length]; PC.save(); renderDev(); };
      $('pDuel').onclick = () => { PC.data.me.duel = null; if (PC.devDuel()) renderPC(); else UI.toast(TX('No hay rival disponible')); };
      $('pEv').onclick = () => { if (PC.devEvent()) renderPC(); };
      $('pEvAll').onclick = () => renderDevEvents();
    }
    $('dHwOn').onclick = () => { settings.hwForce = !settings.hwForce; Halloween.forced = settings.hwForce; saveSettings(); done(settings.hwForce ? TX('Evento de Halloween forzado') : TX('Evento de Halloween según la fecha')); };
    $('dHwCandy').onclick = () => { Halloween.data().candy += 300; done(TX('+300 caramelos')); };
    $('dHwRetos').onclick = () => { const H = Halloween.data(); Halloween.RETOS.forEach(R => { H.retos[R.id] = Date.now(); }); H.ray = true; done(TX('Retos completados: Ray Dark desbloqueado')); };
    $('dHwReset').onclick = () => { delete P.hw; Halloween.data(); done(TX('Evento reiniciado')); };
    const addIds = (ids, msg) => { ids.forEach(id => { if (PLAYER(id) && !P.coll[id]) P.coll[id] = { stars: 1, up: {} }; }); done(msg); };
    $('dAddHw').onclick = () => addIds(HW_LEGENDS.map(L => L.id).concat([HW_EPIC.id]), TX('Legendarios de Halloween añadidos'));
    $('dAddSv').onclick = () => addIds(SV_LEGENDS.map(L => L.id), TX('Legendarios del Sobre Selva añadidos'));
    $('dAddInf').onclick = () => addIds(GAME.players.filter(p => p.inf).map(p => p.id), TX('Versiones del Infinito añadidas'));
    $('dAddOrig').onclick = () => addIds(GAME.players.filter(p => p.original).map(p => p.id), TX('Originales añadidos'));
    $('dLyWin').onclick = () => { let r = Run.load('leyenda'); if (!r) { const t = savedTeam(); if (t.ids.some(x => x == null)) return UI.toast(TX('Completa tu equipo en Plantilla')); r = Run.create('leyenda', t.ids, { formation: t.formation }); } r.index = r.schedule.length - 1; r.state = 'map'; Run.save(r); api.run = r; openRun(); };
    $('dLyReset').onclick = () => { delete P.ly; delete P.coll[LY_ID]; Run.clear('leyenda'); Leyenda.data(); done(TX('Cadena Leyenda reiniciada')); };
    $('dSvLeg').onclick = () => { Selva.data().pity = SV_PITY - 1; done(TX('La próxima tirada del Sobre Selva será legendaria')); };
    $('dSvReset').onclick = () => { delete P.sv; Selva.data(); done(TX('Sobre Selva reiniciado')); };
    $('dShopAll').onclick = () => { const S = Shop.st(); Object.keys(SHOP.designs).forEach(d => S.own['d:' + d] = 1); Object.keys(SHOP.colors).forEach(c => S.own['c:' + c] = 1); Object.keys(SHOP.shapes).forEach(x => S.own['s:' + x] = 1); Object.keys(SHOP.fields).forEach(f => S.own['f:' + f] = 1); S.own.crest = 1; if (!P.crest) P.crest = { shape: 'escudo', c1: '#1f4fc0', c2: '#e8c21a', sym: 'rayo' }; done(TX('Tienda desbloqueada')); };
    $('dShopDay').onclick = () => { const S = Shop.st(); S.day = ''; S.t = 0; S.legWeek = -1; done(TX('Límites de la tienda reiniciados')); };
    $('dTechLv').onclick = () => { Shop.st(); Shop.myTechs().forEach(t => { P.techLv[t] = SHOP.TECH_MAX; }); done(TX('Técnicas a nivel 3')); };
    $('dAlbum').onclick = () => { Shop.album().forEach(a => a.ids.forEach(id => { if (!P.coll[id]) P.coll[id] = { stars: 1, up: {} }; })); done(TX('Álbum completo')); };
    $('dXmOn').onclick = () => { settings.xmForce = !settings.xmForce; Navidad.forced = settings.xmForce; saveSettings(); done(settings.xmForce ? TX('Evento de Navidad forzado') : TX('Evento de Navidad según la fecha')); };
    $('dXmSnow').onclick = () => { Navidad.data().snow += 300; done(TX('+300 copos')); };
    $('dXmRetos').onclick = () => { const H = Navidad.data(); Navidad.RETOS.forEach(R => { H.retos[R.id] = Date.now(); }); if (!H.gift) { H.gift = true; Navidad.give(XM_EPIC.id); } Profile.save(); done(TX('Retos completados: regalo especial recibido')); };
    $('dXmReset').onclick = () => { delete P.xm; Navidad.data(); done(TX('Evento reiniciado')); };
      let resetArm = false;
$('dReset').onclick = () => {
      if (!resetArm) { resetArm = true; $('dReset').firstChild.textContent = TX('¿Seguro? Toca otra vez'); return; }
      try { localStorage.removeItem('inazuma-perfil'); } catch (_) {}
      Run.clear(); api.run = null; api.myTeam = null; Profile.load(); UI.toast(TX('Perfil borrado'), 1400); renderMenu();
    };
    $('dOff').onclick = () => { settings.dev = false; settings.debug = 0; saveSettings(); renderMenu(); };
    $('dSim').onclick = () => {
      const rows = BANNERS.map(B => {
        const c = { comun: 0, rara: 0, epica: 0, legendaria: 0, tec: 0 }; let pity = 0;
        for (let i = 0; i < 1000; i++) {
          const t = Gacha.rollTier(pity >= 9); if (t === 'epica' || t === 'legendaria') pity = 0; else pity++;
          if (t === 'legendaria' && Math.random() < 0.5) c.tec++; else c[t]++;
        }
        return `<b>${esc(B.name)}</b>: ${c.comun} ${TX('comunes ·')} ${c.rara} ${TX('raras ·')} ${c.epica} ${TX('épicas ·')} ${c.legendaria} ${TX('legendarios ·')} ${c.tec} ${TX('técnicas')}`;
      });
      $('simOut').innerHTML = rows.join('<br>');
    };
    $('back').onclick = () => hub();
  }
  if ($('devFab')) $('devFab').addEventListener('click', () => { Sound.sfx('click'); renderDev(); });

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
    // Portada: la ilustración entera (ajustada al ancho) con su propio fondo difuminado detrás
    { const d = layer(`<div class="in-bg"></div><div class="in-fg"></div><p class="in-tap">${Controls.pc() ? TX('Haz clic o pulsa una tecla') : TX('Toca para empezar')}</p>`, 'in-slide in-cover');
      d.firstChild.style.backgroundImage = d.children[1].style.backgroundImage = 'url("ui/portada.jpg")'; }
    el.onclick = () => {
      el.onclick = null; Sound.unlock(); Sound.music('intro');
      const n = GAME.players.filter(p => p.gacha !== false).length;
      const stars = GAME.players.filter(p => p.gacha !== false && p.rarity === 'legendaria').sort(() => Math.random() - 0.5).slice(0, 12);
      // Final: logo; tocar durante las imágenes salta directamente aquí
      const end = () => {
        timers.forEach(clearTimeout); boom(); say('');
        layer(`<img class="in-logo slam" src="ui/logo_gold.png" alt="Inazuma Gold"><p class="in-sub">${TX('5 contra 5 · roguelite')}</p><p class="in-tap">${Controls.pc() ? TX('Haz clic o pulsa una tecla') : TX('Toca para continuar')}</p>`, 'in-center in-final');
        el.onclick = finish;
      };
      el.onclick = end;
      const miles = String(Math.floor(n / 100) * 100).replace(/\B(?=(\d{3})+$)/g, '.');
      const nTracks = Object.values(TRACKS).filter(t => !t.jingle).length;
      const crests = [1, 2, 10, 15, 33, 41, 48, 49, 31, 38, 599, 588];
      const T = 3000;   // cada plano del tráiler
      const ie3 = GAME.players.filter(p => p.id >= 30000 && p.cs && !p.original && (p.rarity === 'legendaria' || p.rarity === 'epica')).sort(() => Math.random() - 0.5).slice(0, 12);
      const faces = (list, t, sub) => {
        const d = layer('<div class="in-faces"></div>', 'in-slide');
        list.forEach((p, i) => { const c = face(Sprites.refOf(p), 64); c.style.animationDelay = (i * 0.1) + 's'; d.firstChild.appendChild(c); });
        say(t, sub); return d;
      };
      const S = [
        [0, () => { layer('', 'in-slide'); boom(); slide('bg_title', TX('Un fan game de Inazuma Eleven'), 'kbZoom'); }],
        [T * 0.8, () => slide('ill05', TX('Fútbol 5 contra 5'), 'kbA', TX('En tiempo real · en el móvil y en el PC'))],
        [T * 1.8, () => slide('ill22', TX('Modo roguelite'), 'kbB', TX('Cada partida es distinta: vidas, mejoras y jefes'))],
        [T * 2.8, () => { boom(); slide('ill31', `${TX('Más de')} ${miles} ${TX('jugadores')}`, 'kbA', TX('Del Inazuma 1, 2 y 3, cada uno con su cara y sus técnicas')); }],
        [T * 3.8, () => { boom(); faces(ie3, TX('¡Llega el Inazuma 3!'), TX('Inazuma Japón y las selecciones del mundo: Unicorn, Orpheus, Little Gigant…')); }],
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
          say(TX('Máquina de gachapón'), TX('Gira la manivela: Héroes, Rivales y Villanos'));
        }],
        [T * 5.8, () => { boom(); faces(stars, TX('Legendarios de verdad'), TX('Media de 90 o más desde el primer día')); }],
        [T * 6.8, () => slide('bg_team', TX('Supertécnicas legendarias'), 'kbA', TX('Elige cuál usar en cada momento: animación propia y cámara lenta'))],
        [T * 7.8, () => slide('ill23', TX('Modo Carrera'), 'kbB', TX('Eres el mánager: tus jugadores mejoran (o bajan) según cómo jueguen'))],
        [T * 8.8, () => {
          const d = slide('bg_vs', TX('🌍 El Mundial'), 'kbA', TX('Cada 3 temporadas: convoca a 10 y lleva a Inazuma Japón a lo más alto'));
          d.insertAdjacentHTML('beforeend', `<div class="in-faces in-crests">${[3016, 3053, 3054, 3055, 3057, 3050, 3021, 3058, 3059, 3060, 3061, 3052].map((c, i) => `<img src="ui/crest${c}.png" alt="" style="animation-delay:${i * 0.08}s">`).join('')}</div>`);
        }],
        [T * 9.8, () => slide('ill25', TX('La historia, en 3 etapas'), 'kbB', TX('Del Fútbol Frontier a la Academia Alius… y al Mundial'))],
        [T * 10.8, () => {
          const d = slide('bg_vs', TX('Cadenas, especiales e Infinito'), 'kbB', TX('Rivales cada vez más duros'));
          d.insertAdjacentHTML('beforeend', `<div class="in-faces in-crests">${crests.map((c, i) => `<img src="ui/crest${c}.png" alt="" style="animation-delay:${i * 0.08}s">`).join('')}</div>`);
        }],
        [T * 11.8, () => slide('ill15', TX('Banda sonora original'), 'kbA', `${nTracks} ${TX('temas del Inazuma 1 y 2')}`)],
        [T * 12.8, () => { boom(); slide('ill03', TX('¿Preparado?'), 'kbB', TX('Forma tu equipo y llega a la cima')); }],
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
  // Red de seguridad: si algo falla (un error del código), en vez de quedarse la pantalla congelada sale una barra
  // con «Volver al menú» y el error en pequeño para poder contarlo. Lo que había guardado no se toca.
  let crashT = 0;
  function onCrash(msg) {
    try {
      if (!api.booted || Date.now() - crashT < 400 || document.getElementById('crashBar')) return;
      crashT = Date.now();
      const d = document.createElement('div'); d.id = 'crashBar'; d.className = 'crashbar';
      d.innerHTML = `<b>${TX('⚠️ Algo ha fallado.')}</b><small>${esc(String(msg || '').slice(0, 140))}</small><button class="cta" id="crashGo">${TX('Volver al menú')}</button>`;
      document.body.appendChild(d);
      d.querySelector('#crashGo').onclick = () => {
        d.remove();
        try { if (api.match) { api.match.over = true; api.match.quit = true; } } catch (_) {}
        api.running = false; api.mode = null; api.techDemo = null; api.blockDemo = null;
        document.querySelectorAll('.tutbox').forEach(x => x.remove());
        try { Sound.stop(0.2); } catch (_) {}
        try { show(null); } catch (_) {}
        try { renderMenu(); } catch (e) { location.reload(); }
      };
    } catch (_) {}
  }
  addEventListener('error', e => { if (e && (e.error || e.message) && !(e.target && e.target !== window && (e.target.src || e.target.href))) onCrash(e.message || (e.error && e.error.message)); });
  addEventListener('unhandledrejection', e => { const r = e && e.reason; if (r && !/fetch|network|load|firebase|firestore|auth/i.test(String(r.message || r))) onCrash(r.message || String(r)); });
  // Solo arranca en la web oficial (o en la beta y en las pruebas). Las direcciones van como números para que no se cambien con un simple «buscar y reemplazar».
  const OFFICIAL = String.fromCharCode(104,116,116,112,115,58,47,47,102,114,97,110,109,110,100,101,122,122,122,122,46,103,105,116,104,117,98,46,105,111,47,73,110,97,122,117,109,97,45,82,111,103,117,101,47,106,117,101,103,111) + '/';
  function hostOk() {
    const h = (location.hostname || '').toLowerCase();
    if (BETA) return true;
    const ok = [[102,114,97,110,109,110,100,101,122,122,122,122,46,103,105,116,104,117,98,46,105,111], [103,104,111,115,116,112,114,111,108,111,99,111,46,103,105,116,104,117,98,46,105,111], [108,111,99,97,108,104,111,115,116], [49,50,55,46,48,46,48,46,49]].map(a => String.fromCharCode(...a));
    return ok.includes(h) || h.endsWith('.test');
  }
  function renderCopy() {
    screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold" onerror="this.remove()">
      <h2>${TX('Esta copia del juego no es oficial')}</h2>
      <p class="note">${TX('Inazuma Gold es gratis y solo se juega en su web oficial, donde tienes tu partida guardada, las novedades y los eventos.')}</p>
      <a class="cta linkbtn" href="${OFFICIAL}">${TX('▶ Ir a la web oficial')}</a></div>`, 'bg_title');
  }
  api.boot = () => {
    api.booted = true;
    if (!hostOk()) return renderCopy();
    Controls.apply();
    Career.load(); PlayerCareer.load();
    const pend = hashCode();
    const first = pend ? () => renderTransfer(renderMenu, pend) : renderMenu;
    const start = () => { if (settings.intro !== 0 && !pend) playIntro(first); else first(); };
    if (!Cloud.enabled() || (!(Cloud.loggedIn() && !Cloud.expired()) && !Cloud.pendingRedirect())) return start();
    // Con cuenta: mira la nube antes de empezar (máximo unos segundos; si no hay internet, se juega igual)
    screen(`<div class="title"><img class="logo" src="ui/logo_gold.png" alt="Inazuma Gold"><span>${TX('Comprobando tu partida…')}</span></div>`, 'bg_title');
    let done = false;
    const fallback = setTimeout(() => { if (!done) { done = true; UI.toast(TX('La nube tarda en responder: juegas con la partida de este móvil'), 3000); start(); } }, 8000);
    Cloud.sync().then(r => {
      if (done) { if (r === 'downloaded') reloadGame(TX('Cargando tu partida de la nube…')); return; }
      done = true; clearTimeout(fallback);
      if (r === 'downloaded') return reloadGame(TX('Cargando tu partida de la nube…'));
      if (r === 'conflict') return renderConflict(start);
      if (r === 'offline') UI.toast(TX('Sin conexión: tu partida se subirá cuando vuelva internet'), 3000);
      start();
    });
  };
  return api;
})();
