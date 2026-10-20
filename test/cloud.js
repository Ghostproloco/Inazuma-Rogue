// Cuentas y guardado en la nube contra un Supabase falso (en memoria).
// Simula varios dispositivos, cada uno con su propio localStorage.
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/';
const code = fs.readFileSync(S + 'cloud.js', 'utf8');

/* ---------- Supabase falso ---------- */
const server = { users: {}, tokens: {}, refresh: {}, saves: {}, n: 0, down: false, ttl: 3600 };
function auth(h) { const t = (h.Authorization || '').replace('Bearer ', ''); const u = server.tokens[t]; return u && u.exp > Date.now() ? u.uid : null; }
function session(uid) {
  const at = 'at' + (++server.n), rt = 'rt' + server.n;
  server.tokens[at] = { uid, exp: Date.now() + server.ttl * 1000 }; server.refresh[rt] = uid;
  return { access_token: at, refresh_token: rt, expires_in: server.ttl, user: { id: uid } };
}
const res = (status, json) => ({ ok: status < 300, status, text: async () => json == null ? '' : JSON.stringify(json) });
async function fakeFetch(url, o) {
  if (server.down) throw new TypeError('Failed to fetch');
  const u = new URL(url), h = o.headers || {}, b = o.body ? JSON.parse(o.body) : null;
  if (!h.apikey) return res(401, { message: 'No API key' });
  const p = u.pathname, q = u.searchParams;
  if (p === '/auth/v1/signup') {
    if (Object.values(server.users).some(x => x.email === b.email)) return res(422, { code: 422, error_code: 'user_already_exists', msg: 'User already registered' });
    if (b.password.length < 6) return res(422, { error_code: 'weak_password', msg: 'Password should be at least 6 characters' });
    const uid = 'uid-' + (++server.n); server.users[uid] = { email: b.email, pass: b.password };
    return res(200, session(uid));
  }
  if (p === '/auth/v1/token') {
    if (q.get('grant_type') === 'password') {
      const e = Object.entries(server.users).find(([, x]) => x.email === b.email && x.pass === b.password);
      return e ? res(200, session(e[0])) : res(400, { error_code: 'invalid_credentials', error_description: 'Invalid login credentials' });
    }
    const uid = server.refresh[b.refresh_token]; if (!uid) return res(400, { error_code: 'refresh_token_not_found' });
    delete server.refresh[b.refresh_token]; return res(200, session(uid));
  }
  if (p === '/auth/v1/logout') return res(204, null);
  if (p === '/rest/v1/saves') {
    const uid = auth(h); if (!uid) return res(401, { message: 'JWT expired' });
    const who = (q.get('user_id') || '').replace('eq.', '');
    if (o.method === 'GET') { const r = server.saves[who]; return res(200, r && who === uid ? [r] : []); }
    if (o.method === 'POST') {
      if (b.user_id !== uid) return res(403, { message: 'RLS' });
      if (server.saves[uid]) return res(409, { code: '23505' });
      server.saves[uid] = { user_id: uid, username: b.username, data: b.data, rev: b.rev, updated_at: new Date().toISOString() };
      return res(201, [server.saves[uid]]);
    }
    if (o.method === 'PATCH') {
      const r = server.saves[who], rev = +(q.get('rev') || '').replace('eq.', '');
      if (!r || who !== uid || r.rev !== rev) return res(200, []);
      Object.assign(r, b, { updated_at: new Date().toISOString() }); return res(200, [r]);
    }
  }
  return res(404, null);
}

/* ---------- Dispositivos ---------- */
function device() {
  class Storage { constructor() { this._ = {}; } getItem(k) { return k in this._ ? this._[k] : null; } setItem(k, v) { this._[k] = String(v); } removeItem(k) { delete this._[k]; } }
  const ls = new Storage();
  const ctx = { Storage, localStorage: ls, fetch: fakeFetch, URL, setTimeout, clearTimeout, AbortController, JSON, Math, Date, Object, Array, Set, String, console,
    CLOUD_CONFIG: { url: 'https://fake.supabase.co/', key: 'sb_publishable_x' } };
  vm.createContext(ctx);
  vm.runInContext(code + '\nthis.Cloud = Cloud;', ctx);
  const C = ctx.Cloud;
  return { C, ls, ctx,
    play(extra) { const p = JSON.parse(ls.getItem('inazuma-perfil') || '{"coll":{},"tickets":0}'); p.firstDone = true; Object.assign(p, extra); ls.setItem('inazuma-perfil', JSON.stringify(p)); },
    prof() { return JSON.parse(ls.getItem('inazuma-perfil') || 'null'); },
    reboot() { return rebootWith(ls); } };
}
// «Recargar la página»: el mismo localStorage, el código vuelve a arrancar
function rebootWith(oldLs) {
  class Storage { constructor() { this._ = oldLs._; } getItem(k) { return k in this._ ? this._[k] : null; } setItem(k, v) { this._[k] = String(v); } removeItem(k) { delete this._[k]; } }
  const ls = new Storage();
  const ctx = { Storage, localStorage: ls, fetch: fakeFetch, URL, setTimeout, clearTimeout, AbortController, JSON, Math, Date, Object, Array, Set, String, console,
    CLOUD_CONFIG: { url: 'https://fake.supabase.co', key: 'sb_publishable_x' } };
  vm.createContext(ctx); vm.runInContext(code + '\nthis.Cloud = Cloud;', ctx);
  const d = { C: ctx.Cloud, ls, reboot: () => rebootWith(ls), prof() { return JSON.parse(ls.getItem('inazuma-perfil') || 'null'); },
    play(extra) { const p = JSON.parse(ls.getItem('inazuma-perfil') || '{"coll":{}}'); p.firstDone = true; Object.assign(p, extra); ls.setItem('inazuma-perfil', JSON.stringify(p)); } };
  return d;
}

let fails = 0;
const ok = (cond, what) => { console.log((cond ? '  ✓ ' : '  ✗ ') + what); if (!cond) fails++; };

(async () => {
  console.log('1. Invitado con progreso crea cuenta → se sube su partida');
  let A = device();
  A.play({ coll: { 1: { stars: 1 }, 2: { stars: 2 } }, tickets: 7 });
  ok((await A.C.signUp('Fran_10', 'secreto1')).ok, 'cuenta creada (mayúsculas pasan a minúsculas)');
  ok(await A.C.sync() === 'uploaded', 'sync sube la partida');
  ok(server.saves[A.C._meta().uid].rev === 1 && server.saves[A.C._meta().uid].username === 'fran_10', 'en la nube: rev 1, usuario fran_10');

  console.log('2. Errores de registro y login');
  let X = device();
  ok(/cogido/.test((await X.C.signUp('fran_10', 'otraclave')).msg), 'usuario repetido');
  ok(/incorrectos/.test((await X.C.signIn('fran_10', 'mala')).msg), 'contraseña mala');
  ok(/letras/.test((await X.C.signUp('fr an', 'secreto1')).msg), 'nombre con espacio');
  ok(/6 caracteres/.test((await X.C.signUp('pepe', '123')).msg), 'contraseña corta');

  console.log('3. Móvil nuevo entra → baja la partida');
  let B = device();
  ok((await B.C.signIn('FRAN_10', 'secreto1')).ok, 'login');
  ok(await B.C.sync() === 'downloaded', 'sync baja la partida');
  ok(B.prof().tickets === 7 && Object.keys(B.prof().coll).length === 2, 'mismos datos que el otro móvil');
  B = B.reboot();   // la app recarga tras bajar
  ok(await B.C.sync() === 'same', 'tras recargar: todo al día');

  console.log('4. Cambios en B se suben; A los recibe al abrir');
  B.play({ tickets: 20 });
  ok(await B.C.push(true) === 'uploaded', 'B sube (rev 2)');
  A = A.reboot();
  ok(await A.C.sync() === 'downloaded' && A.prof().tickets === 20, 'A baja la versión de B');
  A = A.reboot(); await A.C.sync();

  console.log('5. Subida automática tras un guardado del juego');
  A.play({ tickets: 21 });
  await new Promise(r => setTimeout(r, 3400));
  ok(server.saves[A.C._meta().uid].rev === 3 && JSON.parse(server.saves[A.C._meta().uid].data['inazuma-perfil']).tickets === 21, 'subida sola a los 3 s (rev 3)');

  console.log('6. Los dos cambian a la vez → conflicto, sin perder nada');
  B.play({ tickets: 99 });
  ok(await B.C.push(true) === 'conflict', 'B detecta que la nube cambió');
  ok(B.C.state.conflict.cloudInfo.tickets === 21 && B.C.state.conflict.localInfo.tickets === 99, 'muestra las dos versiones');
  ok(await B.C.push(true) === 'conflict', 'no pisa nada mientras no se elija');
  ok(await B.C.resolve('local') === 'uploaded', 'elige la del móvil → se sube encima');
  ok(JSON.parse(server.saves[B.C._meta().uid].data['inazuma-perfil']).tickets === 99, 'nube = 99 tickets');
  A = A.reboot();
  ok(await A.C.sync() === 'downloaded' && A.prof().tickets === 99, 'A recibe la elegida');

  console.log('7. Sesión caducada y renovación');
  A = A.reboot(); await A.C.sync();
  A.C._meta().exp = 0;   // token viejo
  A.play({ tickets: 100 });
  ok(await A.C.push(true) === 'uploaded', 'renueva el token y sube');
  A.C._meta().exp = 0; A.C._meta().rt = 'falso';
  A.play({ tickets: 101 });
  ok(await A.C.push(true) !== 'uploaded' && A.C.expired(), 'refresco inválido → sesión caducada (pide entrar otra vez)');
  ok(A.prof().tickets === 101, 'la partida del móvil sigue intacta');
  ok((await A.C.signIn('fran_10', 'secreto1')).ok && await A.C.sync() === 'uploaded', 'vuelve a entrar y sube lo pendiente');

  console.log('8. Sin internet');
  A.play({ tickets: 102 }); server.down = true;
  ok(await A.C.push(true) === 'error' && A.C.state.status === 'offline', 'sin conexión: estado offline, no rompe');
  server.down = false;
  ok(await A.C.push(true) === 'uploaded', 'al volver internet se sube');

  console.log('9. Invitado con partida propia entra en una cuenta que ya tiene partida');
  let C = device();
  C.play({ coll: { 5: { stars: 1 } }, tickets: 3 });
  await C.C.signIn('fran_10', 'secreto1');
  ok(await C.C.sync() === 'conflict', 'pregunta cuál conservar');
  ok(await C.C.resolve('cloud') === 'downloaded' && C.prof().tickets === 102, 'elige la de la nube');

  console.log('10. Cerrar sesión');
  C = rebootWith(C.ls); await C.C.sync();
  C.play({ tickets: 103 });
  ok((await C.C.signOut()).ok, 'sube lo último y cierra');
  ok(JSON.parse(server.saves[A.C._meta().uid].data['inazuma-perfil']).tickets === 103, 'lo último está en la nube');
  ok(C.prof() === null && !C.C.loggedIn(), 'el móvil queda limpio');

  console.log('11. Cuenta nueva sin progreso no sube una partida vacía');
  let D = device();
  await D.C.signUp('nuevo', 'secreto1');
  ok(await D.C.sync() === 'same' && !server.saves[D.C._meta().uid], 'nada subido');
  D.play({ coll: { 9: { stars: 1 } } });
  ok(await D.C.push(true) === 'uploaded' && server.saves[D.C._meta().uid].rev === 1, 'tras la tirada de bienvenida sí se sube');

  console.log('12. Una cuenta no ve la partida de otra');
  ok(server.saves[D.C._meta().uid].username === 'nuevo' && Object.keys(server.saves).length === 2, 'dos partidas separadas');

  console.log(fails ? `\n${fails} FALLOS` : '\nTodo bien');
  process.exit(fails ? 1 : 0);
})();
