// Cuentas y guardado en la nube contra un Firebase falso (en memoria).
// Simula varios dispositivos, cada uno con su propio localStorage y su sesión.
const fs = require('fs'), vm = require('vm'), path = require('path');
const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'cloud.js'), 'utf8');

/* ---------- Servidor falso: cuentas + Firestore (con las mismas reglas que firestore.rules) ---------- */
const server = { users: {}, saves: {}, n: 0, down: false, google: { uid: 'g-fran', email: 'fran@gmail.com', displayName: 'Fran Méndez' } };
const fail = c => { const e = new Error(c); e.code = c; throw e; };
const TS = { __ts: true };
function makeFirebase() {
  const mkUser = (uid, extra = {}) => Object.assign({ uid, email: server.users[uid] ? server.users[uid].email : null, displayName: null, async updateProfile(p) { Object.assign(this, p); } }, extra);
  class Auth {
    constructor() { this.currentUser = null; this.ls = []; }
    onAuthStateChanged(f) { this.ls.push(f); Promise.resolve().then(() => f(this.currentUser)); return () => { this.ls = this.ls.filter(x => x !== f); }; }
    _set(u) { this.currentUser = u; this.ls.slice().forEach(f => f(u)); }
    async createUserWithEmailAndPassword(e, p) {
      if (server.down) fail('auth/network-request-failed');
      if (Object.values(server.users).some(u => u.email === e)) fail('auth/email-already-in-use');
      if (p.length < 6) fail('auth/weak-password');
      const uid = 'uid-' + (++server.n); server.users[uid] = { email: e, pass: p };
      const u = mkUser(uid); this._set(u); return { user: u };
    }
    async signInWithEmailAndPassword(e, p) {
      if (server.down) fail('auth/network-request-failed');
      const hit = Object.entries(server.users).find(([, x]) => x.email === e && x.pass === p);
      if (!hit) fail('auth/invalid-credential');
      const u = mkUser(hit[0]); this._set(u); return { user: u };
    }
    async signInWithPopup() { if (server.popupBlocked) fail('auth/popup-blocked'); const g = server.google; const u = mkUser(g.uid, { email: g.email, displayName: g.displayName }); this._set(u); return { user: u }; }
    async signInWithRedirect() { server.redirected = true; }
    async getRedirectResult() { if (!server.redirected) return { user: null }; server.redirected = false; const g = server.google; const u = mkUser(g.uid, { email: g.email, displayName: g.displayName }); this._set(u); return { user: u }; }
    async signOut() { this._set(null); }
  }
  function GoogleAuthProvider() { this.setCustomParameters = () => {}; }
  function makeDb(auth) {
    const docRef = id => ({ id,
      async get() { if (server.down) fail('unavailable'); check(id, 'read'); const d = server.saves[id]; return snap(d); } });
    const snap = d => ({ exists: !!d, data: () => d ? JSON.parse(JSON.stringify(Object.assign({}, d, { updatedAt: undefined }))) && Object.assign({}, JSON.parse(JSON.stringify(d)), { updatedAt: { toDate: () => new Date(d.updatedAt) } }) : undefined });
    function check(id, op, next) {
      const u = auth.currentUser; if (!u || u.uid !== id) fail('permission-denied');
      if (op === 'write') {
        const cur = server.saves[id];
        if (!cur && next.rev !== 1) fail('permission-denied');
        if (cur && next.rev !== cur.rev + 1) fail('permission-denied');
      }
    }
    return {
      collection: () => ({ doc: docRef }),
      async runTransaction(fn) {
        if (server.down) fail('unavailable');
        const writes = [];
        const tx = { async get(r) { check(r.id, 'read'); return snap(server.saves[r.id]); }, set(r, v) { writes.push([r.id, v]); } };
        const out = await fn(tx);
        for (const [id, v] of writes) { check(id, 'write', v); server.saves[id] = JSON.parse(JSON.stringify(Object.assign({}, v, { updatedAt: Date.now() }))); }
        return out;
      },
    };
  }
  const fb = { apps: [], initializeApp() { const auth = new Auth(), db = makeDb(auth); const app = { auth: () => auth, firestore: () => db }; fb.apps.push(app); return app; },
    app() { return fb.apps[0]; }, auth: { GoogleAuthProvider }, firestore: { FieldValue: { serverTimestamp: () => TS } } };
  return fb;
}

/* ---------- Dispositivos ---------- */
function device(store) {
  class Storage { constructor() { this._ = store || {}; } getItem(k) { return k in this._ ? this._[k] : null; } setItem(k, v) { this._[k] = String(v); } removeItem(k) { delete this._[k]; } }
  const ls = new Storage();
  const ctx = { Storage, localStorage: ls, setTimeout, clearTimeout, JSON, Math, Date, Object, Array, Set, String, Promise, console,
    Blob, Response, CompressionStream, DecompressionStream, btoa, atob, Uint8Array,
    CLOUD_CONFIG: { apiKey: 'AIzaFake', authDomain: 'x.firebaseapp.com', projectId: 'x', appId: '1:1:web:1' } };
  ctx.firebase = device.fb[store ? 'same' : 'new']();
  vm.createContext(ctx);
  vm.runInContext(code + '\nthis.Cloud = Cloud;', ctx);
  const d = { C: ctx.Cloud, ls, fb: ctx.firebase,
    play(extra) { const p = JSON.parse(ls.getItem('inazuma-perfil') || '{"coll":{},"tickets":0}'); p.firstDone = true; Object.assign(p, extra); ls.setItem('inazuma-perfil', JSON.stringify(p)); },
    prof() { return JSON.parse(ls.getItem('inazuma-perfil') || 'null'); },
    // «Recargar la página»: mismo localStorage y misma sesión de Firebase (que la guarda el navegador)
    reboot() { device.keep = d.fb; return device(ls._); } };
  return d;
}
device.fb = { new: () => makeFirebase(), same: () => device.keep };

let fails = 0;
const ok = (cond, what) => { console.log((cond ? '  ✓ ' : '  ✗ ') + what); if (!cond) fails++; };
const cloudOf = d => server.saves[d.C._meta().uid];
const cloudTickets = d => JSON.parse(cloudOf(d).data['inazuma-perfil']).tickets;

(async () => {
  console.log('1. Invitado con progreso crea cuenta → se sube su partida');
  let A = device();
  A.play({ coll: { 1: { stars: 1 }, 2: { stars: 2 } }, tickets: 7 });
  ok((await A.C.signUp('Fran_10', 'secreto1')).ok, 'cuenta creada (mayúsculas pasan a minúsculas)');
  ok(await A.C.sync() === 'uploaded', 'sync sube la partida');
  ok(cloudOf(A).rev === 1 && cloudOf(A).username === 'fran_10', 'en la nube: rev 1, usuario fran_10');

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
  B = B.reboot();
  ok(await B.C.sync() === 'same', 'tras recargar: todo al día');

  console.log('4. Cambios en B se suben; A los recibe al abrir');
  B.play({ tickets: 20 });
  ok(await B.C.push(true) === 'uploaded' && cloudOf(B).rev === 2, 'B sube (rev 2)');
  A = A.reboot();
  ok(await A.C.sync() === 'downloaded' && A.prof().tickets === 20, 'A baja la versión de B');
  A = A.reboot(); await A.C.sync();

  console.log('5. Subida automática tras un guardado del juego');
  A.play({ tickets: 21 });
  await new Promise(r => setTimeout(r, 3400));
  ok(cloudOf(A).rev === 3 && cloudTickets(A) === 21, 'subida sola a los 3 s (rev 3)');

  console.log('6. Los dos cambian a la vez → conflicto, sin perder nada');
  B.play({ tickets: 99 });
  ok(await B.C.push(true) === 'conflict', 'B detecta que la nube cambió');
  ok(B.C.state.conflict.cloudInfo.tickets === 21 && B.C.state.conflict.localInfo.tickets === 99, 'muestra las dos versiones');
  ok(await B.C.push(true) === 'conflict', 'no pisa nada mientras no se elija');
  ok(await B.C.resolve('local') === 'uploaded' && cloudTickets(B) === 99, 'elige la del móvil → se sube encima');
  A = A.reboot();
  ok(await A.C.sync() === 'downloaded' && A.prof().tickets === 99, 'A recibe la elegida');

  console.log('7. Sesión cerrada desde fuera');
  A = A.reboot(); await A.C.sync();
  A.fb.app().auth()._set(null);
  A.play({ tickets: 101 });
  ok(await A.C.push(true) !== 'uploaded' && A.C.expired(), 'pide volver a entrar');
  ok(A.prof().tickets === 101, 'la partida del móvil sigue intacta');
  ok((await A.C.signIn('fran_10', 'secreto1')).ok && await A.C.sync() === 'uploaded', 'vuelve a entrar y sube lo pendiente');

  console.log('8. Sin internet');
  A.play({ tickets: 102 }); server.down = true;
  ok(await A.C.push(true) === 'error' && A.C.state.status === 'offline', 'sin conexión: estado offline, no rompe');
  server.down = false;
  ok(await A.C.push(true) === 'uploaded' && cloudTickets(A) === 102, 'al volver internet se sube');

  console.log('9. Invitado con partida propia entra en una cuenta que ya tiene partida');
  let C = device();
  C.play({ coll: { 5: { stars: 1 } }, tickets: 3 });
  await C.C.signIn('fran_10', 'secreto1');
  ok(await C.C.sync() === 'conflict', 'pregunta cuál conservar');
  ok(await C.C.resolve('cloud') === 'downloaded' && C.prof().tickets === 102, 'elige la de la nube');

  console.log('10. Cerrar sesión');
  C = C.reboot(); await C.C.sync();
  C.play({ tickets: 103 });
  ok((await C.C.signOut()).ok, 'sube lo último y cierra');
  ok(cloudTickets(A) === 103, 'lo último está en la nube');
  ok(C.prof() === null && !C.C.loggedIn(), 'el móvil queda limpio');

  console.log('11. Cuenta nueva sin progreso no sube una partida vacía');
  let D = device();
  await D.C.signUp('nuevo', 'secreto1');
  ok(await D.C.sync() === 'same' && !cloudOf(D), 'nada subido');
  D.play({ coll: { 9: { stars: 1 } } });
  ok(await D.C.push(true) === 'uploaded' && cloudOf(D).rev === 1, 'tras la tirada de bienvenida sí se sube');

  console.log('12. Entrar con Google');
  let G = device();
  G.play({ coll: { 7: { stars: 1 } }, tickets: 11 });
  const g = await G.C.signInGoogle();
  ok(g.ok && G.C.user() === 'Fran Méndez' && G.C.via() === 'google', 'entra con su nombre de Google');
  ok(await G.C.sync() === 'uploaded' && cloudOf(G).username === 'Fran Méndez', 'sube su partida');
  let H = device(); server.popupBlocked = true;
  const h = await H.C.signInGoogle();
  ok(h.redirect && H.C.pendingRedirect(), 'ventana bloqueada → va a Google por redirección');
  server.popupBlocked = false;
  // Vuelve de Google: la página arranca de cero con el mismo almacenamiento
  device.keep = makeFirebase(); H = device(H.ls._);
  ok(await H.C.sync() === 'downloaded' && H.prof().tickets === 11 && H.C.user() === 'Fran Méndez', 'al volver: sesión iniciada y partida bajada');

  console.log('13. Una cuenta no ve la partida de otra');
  ok(Object.keys(server.saves).length === 3, 'tres partidas separadas');
  let E = device(); await E.C.signIn('nuevo', 'secreto1');
  const other = await E.fb.app().firestore().collection('saves').doc(A.C._meta().uid).get().then(() => 'leída', e => e.code);
  ok(other === 'permission-denied', 'leer la partida de otro está prohibido');

  console.log('14. Partida enorme → se guarda comprimida');
  const big = {}; for (let i = 0; i < 40000; i++) big[i] = { stars: 3, up: { tiro: 2, regate: 1 } };
  D = D.reboot(); await D.C.sync(); D.play({ coll: big });
  ok(await D.C.push(true) === 'uploaded' && cloudOf(D).z && !cloudOf(D).data, 'subida comprimida');
  let D2 = device(); await D2.C.signIn('nuevo', 'secreto1');
  ok(await D2.C.sync() === 'downloaded' && Object.keys(D2.prof().coll).length === 40000, 'otro móvil la descomprime bien');

  console.log(fails ? `\n${fails} FALLOS` : '\nTodo bien');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
