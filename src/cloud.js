/* =====================================================================
   NUBE: cuentas con usuario y contraseña y guardado de la partida.
   Usa Supabase (Auth + una tabla «saves») mediante su API web, sin
   librerías. La partida es la misma de siempre (las claves de
   localStorage de SAVE_KEYS); aquí solo se sube y se baja entera.

   Cómo decide qué partida manda (rev = número de versión en la nube):
   - Nube sin cambios desde la última vez y móvil con cambios → se sube.
   - Nube con cambios y móvil sin cambios → se baja.
   - Las dos con cambios (o partida de invitado contra una cuenta que
     ya tiene partida) → se pregunta al jugador. Nunca se borra nada
     sin preguntar.
   ===================================================================== */
const SAVE_KEYS = ['inazuma-perfil', 'inazuma-carrera', 'inazuma-ajustes', 'inazuma-run3', 'inazuma-sonido'];

const Cloud = (() => {
  const META_KEY = 'inazuma-cuenta';
  const EMAIL_DOMAIN = 'jugadores.inazumarogue.app';   // el usuario «fran» se guarda como fran@jugadores… (no se envía ningún correo)
  const CFG = (typeof CLOUD_CONFIG !== 'undefined' && CLOUD_CONFIG) || {};
  const BASE = String(CFG.url || '').replace(/\/+$/, ''), KEY = CFG.key || '';
  const PUSH_DELAY = 3000;      // espera tras un cambio antes de subir (agrupa varios guardados)
  const TIMEOUT = 12000;

  /* ---------- Datos de la cuenta en este dispositivo ---------- */
  let meta = {};
  try { meta = JSON.parse(localStorage.getItem(META_KEY) || '{}') || {}; } catch (_) { meta = {}; }
  const saveMeta = () => { try { origSet.call(localStorage, META_KEY, JSON.stringify(meta)); } catch (_) {} };

  /* ---------- Partida local ---------- */
  const origSet = Storage.prototype.setItem, origRemove = Storage.prototype.removeItem;
  let applying = false;
  function snapshot() { const o = {}; SAVE_KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v != null) o[k] = v; } catch (_) {} }); return o; }
  function restore(o) {
    applying = true;
    try { SAVE_KEYS.forEach(k => { try { if (o && o[k] != null) origSet.call(localStorage, k, o[k]); else origRemove.call(localStorage, k); } catch (_) {} }); }
    finally { applying = false; }
  }
  function hash(o) {   // huella corta de la partida para saber si ha cambiado
    const s = SAVE_KEYS.map(k => k + '=' + (o && o[k] != null ? o[k] : '')).join('\u0001');
    let h1 = 0x811c9dc5, h2 = 0x1000193;
    for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822519); }
    return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36) + ':' + s.length;
  }
  // ¿Hay progreso de verdad? (ya hizo la tirada de bienvenida o tiene Carrera)
  function hasProgress(o) {
    try { const p = JSON.parse((o || {})['inazuma-perfil'] || 'null'); if (p && (p.firstDone || Object.keys(p.coll || {}).length)) return true; } catch (_) {}
    return !!(o && o['inazuma-carrera']);
  }
  function describe(o) {
    try {
      const p = JSON.parse(o['inazuma-perfil'] || '{}'), cr = o['inazuma-carrera'] ? JSON.parse(o['inazuma-carrera']) : null;
      const st = p.story || {}, etapas = ['s1', 's2', 's3', 's4'].filter(k => st[k] && st[k].done).length;
      return { players: Object.keys(p.coll || {}).length, tickets: p.tickets || 0, coins: p.coins || 0, wins: p.wins || 0, etapas,
        career: cr ? (cr.school || 'Carrera') + ' · temporada ' + (cr.season || 1) : '' };
    } catch (_) { return { players: 0, tickets: 0, coins: 0, wins: 0, etapas: 0, career: '' }; }
  }

  /* ---------- Avisos de cambios: cualquier guardado del juego programa una subida ---------- */
  Storage.prototype.setItem = function (k, v) { origSet.call(this, k, v); if (!applying && this === localStorage && SAVE_KEYS.includes(k)) touch(); };
  Storage.prototype.removeItem = function (k) { origRemove.call(this, k); if (!applying && this === localStorage && SAVE_KEYS.includes(k)) touch(); };

  /* ---------- Estado visible para la interfaz ---------- */
  const state = { status: 'idle', msg: '', lastOk: meta.lastOk || 0, conflict: null };
  const listeners = new Set();
  function setStatus(status, msg) { state.status = status; state.msg = msg || ''; listeners.forEach(f => { try { f(state); } catch (_) {} }); }

  /* ---------- Llamadas a Supabase ---------- */
  const enabled = () => !!(BASE && KEY);
  const loggedIn = () => !!(meta.uid && meta.rt);
  const user = () => meta.user || null;
  async function req(path, { method = 'GET', body, token, prefer, keepalive } = {}) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT) : 0;
    const headers = { apikey: KEY, 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;   // sin sesión basta «apikey» (vale la clave anon o la publishable)
    if (prefer) headers.Prefer = prefer;
    try {
      const r = await fetch(BASE + path, { method, headers, body: body == null ? undefined : JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined, keepalive: !!keepalive });
      const txt = await r.text(); let json = null; try { json = txt ? JSON.parse(txt) : null; } catch (_) {}
      return { ok: r.ok, status: r.status, json };
    } catch (e) { return { ok: false, status: 0, json: null, offline: true }; }
    finally { if (t) clearTimeout(t); }
  }
  function keepSession(j, username) {
    meta.at = j.access_token; meta.rt = j.refresh_token;
    meta.exp = Date.now() + ((j.expires_in || 3600) - 60) * 1000;
    if (j.user && j.user.id) meta.uid = j.user.id;
    if (username) meta.user = username;
    meta.expired = false; saveMeta();
  }
  async function token() {
    if (!loggedIn()) return null;
    if (meta.at && Date.now() < meta.exp) return meta.at;
    const r = await req('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: meta.rt } });
    if (r.ok && r.json && r.json.access_token) { keepSession(r.json); return meta.at; }
    if (r.offline || r.status >= 500) return null;               // sin conexión: se reintenta luego
    meta.expired = true; meta.at = null; saveMeta();             // sesión caducada: hay que volver a entrar
    setStatus('expired', 'Tu sesión ha caducado. Vuelve a iniciar sesión para seguir guardando en la nube.');
    return null;
  }
  async function api(path, opts = {}) {
    let tk = await token(); if (!tk) return { ok: false, status: 0, offline: !meta.expired, expired: !!meta.expired };
    let r = await req(path, Object.assign({}, opts, { token: tk }));
    if (r.status === 401) { meta.exp = 0; tk = await token(); if (!tk) return { ok: false, status: 401, expired: true }; r = await req(path, Object.assign({}, opts, { token: tk })); }
    return r;
  }

  /* ---------- Usuario y contraseña ---------- */
  const cleanUser = u => String(u || '').trim().toLowerCase();
  function checkUser(u) {
    if (u.length < 3 || u.length > 16) return 'El nombre de usuario debe tener entre 3 y 16 letras o números.';
    if (!/^[a-z0-9_]+$/.test(u)) return 'Usa solo letras sin tildes, números y guion bajo (_). Sin espacios ni ñ.';
    return '';
  }
  const emailOf = u => u + '@' + EMAIL_DOMAIN;
  function authError(r, signup) {
    if (r.offline) return 'No hay conexión. Prueba otra vez cuando tengas internet.';
    const j = r.json || {}, m = String(j.msg || j.message || j.error_description || j.error || '').toLowerCase(), code = String(j.error_code || j.code || '');
    if (code === 'user_already_exists' || m.includes('already registered') || m.includes('already exists')) return 'Ese nombre de usuario ya está cogido. Prueba con otro.';
    if (code === 'invalid_credentials' || m.includes('invalid login')) return 'Usuario o contraseña incorrectos.';
    if (code === 'weak_password' || m.includes('password')) return 'La contraseña es demasiado corta o débil (mínimo 6 caracteres).';
    if (code === 'email_not_confirmed' || m.includes('not confirmed')) return 'La cuenta está pendiente de confirmar. (Hay que desactivar «Confirm email» en Supabase.)';
    if (r.status === 429 || m.includes('rate limit')) return 'Demasiados intentos seguidos. Espera un poco y vuelve a probar.';
    return (signup ? 'No se ha podido crear la cuenta' : 'No se ha podido entrar') + ' (error ' + (r.status || '?') + ').';
  }
  async function signUp(username, password) {
    if (!enabled()) return { ok: false, msg: 'Las cuentas aún no están activadas en esta versión del juego.' };
    const u = cleanUser(username), bad = checkUser(u); if (bad) return { ok: false, msg: bad };
    if (String(password || '').length < 6) return { ok: false, msg: 'La contraseña debe tener al menos 6 caracteres.' };
    const r = await req('/auth/v1/signup', { method: 'POST', body: { email: emailOf(u), password, data: { username: u } } });
    if (!r.ok) return { ok: false, msg: authError(r, true) };
    if (!r.json || !r.json.access_token) {
      // Supabase devuelve un usuario sin sesión si sigue activo «Confirm email», o uno falso si el nombre ya existía
      const login = await req('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: emailOf(u), password } });
      if (!login.ok || !login.json || !login.json.access_token) return { ok: false, msg: login.json && /not confirmed/i.test(JSON.stringify(login.json)) ? authError(login, true) : 'Ese nombre de usuario ya está cogido. Prueba con otro.' };
      return startSession(login.json, u);
    }
    return startSession(r.json, u);
  }
  async function signIn(username, password) {
    if (!enabled()) return { ok: false, msg: 'Las cuentas aún no están activadas en esta versión del juego.' };
    const u = cleanUser(username); if (!u || !password) return { ok: false, msg: 'Escribe tu usuario y tu contraseña.' };
    const r = await req('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: emailOf(u), password } });
    if (!r.ok || !r.json || !r.json.access_token) return { ok: false, msg: authError(r, false) };
    return startSession(r.json, u);
  }
  function startSession(j, u) {
    const sameUser = meta.uid && j.user && j.user.id === meta.uid;
    if (!sameUser) { meta.owner = null; meta.rev = null; meta.hash = null; }   // otra cuenta: lo que haya en el móvil aún no es suyo
    keepSession(j, u);
    return { ok: true };
  }
  // Cerrar sesión: sube lo último y deja el móvil limpio para que otro pueda entrar.
  async function signOut({ keepLocal = false, force = false } = {}) {
    if (loggedIn() && !meta.expired && !force) {
      const r = await push(true);
      if (r !== 'uploaded' && r !== 'same') return { ok: false, msg: r === 'conflict' ? 'Hay otra versión de tu partida en la nube. Resuélvelo antes de salir.' : 'No se ha podido subir tu última partida (¿sin conexión?).' };
    }
    if (meta.at) req('/auth/v1/logout', { method: 'POST', token: meta.at });
    const guest = meta.guest; meta = { guest }; saveMeta();
    if (!keepLocal) { applying = true; try { ['inazuma-perfil', 'inazuma-carrera', 'inazuma-run3'].forEach(k => { try { origRemove.call(localStorage, k); } catch (_) {} }); } finally { applying = false; } }
    state.lastOk = 0; setStatus('idle');
    return { ok: true };
  }

  /* ---------- Subir y bajar ---------- */
  const COLS = 'rev,data,updated_at';
  async function fetchCloud() {
    const r = await api('/rest/v1/saves?user_id=eq.' + encodeURIComponent(meta.uid) + '&select=' + COLS);
    if (!r.ok) return { error: r };
    return { row: Array.isArray(r.json) && r.json[0] ? r.json[0] : null };
  }
  function synced(rev, data) { meta.owner = meta.uid; meta.rev = rev; meta.hash = hash(data); meta.lastOk = state.lastOk = Date.now(); saveMeta(); }
  function failStatus(r) {
    if (r && r.expired) setStatus('expired', 'Tu sesión ha caducado. Vuelve a iniciar sesión para seguir guardando en la nube.');
    else if (r && (r.offline || r.status === 0)) setStatus('offline', 'Sin conexión: se guardará en la nube cuando vuelva internet.');
    else setStatus('error', 'Error al guardar en la nube (' + ((r && r.status) || '?') + '). Se reintentará.');
  }
  // Sube la partida del móvil. «overRev» = pisar a propósito esa versión de la nube (cuando el jugador elige la del móvil).
  let pushing = null, again = false;
  async function push(now, overRev) {
    if (!enabled() || !loggedIn() || meta.expired) return 'off';
    if (state.conflict && overRev == null) return 'conflict';
    if (pushing) { again = true; await pushing; if (!now) return 'queued'; }
    const run = (async () => {
      const data = snapshot(), h = hash(data);
      if (meta.owner === meta.uid && h === meta.hash && overRev == null) { setStatus('ok'); return 'same'; }
      if (!hasProgress(data) && meta.owner !== meta.uid && overRev == null) return 'same';   // no subir una partida vacía a una cuenta nueva
      setStatus('saving');
      const base = overRev != null ? overRev : meta.owner === meta.uid ? meta.rev : null;
      let r;
      if (base == null || base === 0) {
        r = await api('/rest/v1/saves', { method: 'POST', body: { user_id: meta.uid, username: meta.user, data, rev: 1 }, prefer: 'return=representation' });
        if (r.status === 409) { const c = await fetchCloud(); if (c.row) return conflict(c.row); }
      } else {
        r = await api('/rest/v1/saves?user_id=eq.' + encodeURIComponent(meta.uid) + '&rev=eq.' + base, { method: 'PATCH', body: { data, rev: base + 1, username: meta.user }, prefer: 'return=representation' });
        if (r.ok && Array.isArray(r.json) && !r.json.length) { const c = await fetchCloud(); if (c.row) return conflict(c.row); if (c.error) { failStatus(c.error); return 'error'; } }
      }
      if (!r.ok) { failStatus(r); return 'error'; }
      const row = Array.isArray(r.json) ? r.json[0] : r.json;
      synced(row && row.rev != null ? row.rev : (base || 0) + 1, data); setStatus('ok');
      return 'uploaded';
    })();
    pushing = run;
    let res; try { res = await run; } finally { pushing = null; }
    if (again) { again = false; if (res === 'uploaded' || res === 'same') schedule(); }
    return res;
  }
  let timer = 0;
  function schedule() { clearTimeout(timer); timer = setTimeout(() => push(), PUSH_DELAY); }
  function touch() { if (enabled() && loggedIn() && !meta.expired) schedule(); }
  function conflict(row) {
    const local = snapshot();
    state.conflict = { cloud: row, local, cloudInfo: describe(row.data || {}), localInfo: describe(local), cloudDate: row.updated_at };
    setStatus('conflict', 'Hay dos versiones distintas de tu partida.');
    return 'conflict';
  }
  // Al arrancar o al iniciar sesión: decide si subir, bajar o preguntar.
  // Devuelve 'off' | 'offline' | 'expired' | 'error' | 'same' | 'uploaded' | 'downloaded' | 'conflict'
  async function sync() {
    if (!enabled() || !loggedIn()) return 'off';
    if (meta.expired) { setStatus('expired', 'Tu sesión ha caducado. Vuelve a iniciar sesión para seguir guardando en la nube.'); return 'expired'; }
    setStatus('saving');
    const c = await fetchCloud();
    if (c.error) { failStatus(c.error); return c.error.expired ? 'expired' : c.error.offline || !c.error.status ? 'offline' : 'error'; }
    const local = snapshot(), mine = meta.owner === meta.uid;
    const localChanged = !mine || hash(local) !== meta.hash;
    if (!c.row) {   // cuenta sin partida en la nube: se sube la del móvil (si hay algo)
      if (!hasProgress(local)) { meta.owner = meta.uid; meta.rev = 0; meta.hash = hash(local); saveMeta(); setStatus('ok'); return 'same'; }
      return push(true, 0);
    }
    const cloudChanged = !mine || c.row.rev !== meta.rev;
    if (!cloudChanged) { if (localChanged) return push(true); setStatus('ok'); synced(c.row.rev, local); return 'same'; }
    if (!localChanged || !hasProgress(local) || (mine && hash(local) === hash(c.row.data || {}))) { useCloud(c.row); return 'downloaded'; }
    return conflict(c.row);
  }
  function useCloud(row) { restore(row.data || {}); synced(row.rev, row.data || {}); state.conflict = null; setStatus('ok'); }
  // El jugador resuelve el conflicto: 'cloud' (baja la de la nube) o 'local' (sube la del móvil encima)
  async function resolve(choice) {
    const C = state.conflict; if (!C) return 'same';
    if (choice === 'cloud') { useCloud(C.cloud); return 'downloaded'; }
    state.conflict = null;
    const r = await push(true, C.cloud.rev);
    return r;
  }

  // Al salir del juego o cambiar de app: subir ya lo pendiente
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && timer) { clearTimeout(timer); timer = 0; push(true); } });
  if (typeof window !== 'undefined') window.addEventListener('online', () => { if (loggedIn() && state.status === 'offline') push(true); });

  // Partida de invitado: recuerda que ya eligió no crear cuenta (para no insistir)
  const guestChosen = () => !!meta.guest;
  function chooseGuest() { meta.guest = true; saveMeta(); }

  return { SAVE_KEYS, enabled, loggedIn, user, expired: () => !!meta.expired, state, onChange: f => (listeners.add(f), () => listeners.delete(f)),
    signUp, signIn, signOut, sync, push, resolve, snapshot, restore, describe, hasProgress, guestChosen, chooseGuest, checkUser, cleanUser,
    _meta: () => meta };
})();
