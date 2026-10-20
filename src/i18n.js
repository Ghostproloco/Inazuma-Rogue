/* =====================================================================
   IDIOMAS: español (el original) e inglés.
   Los textos se escriben en español dentro de TX('…') y, si el juego está
   en inglés, se buscan en EN_TEXT (src/en.js). Lo que falte se queda en
   español. Los huecos {0}, {1}… se rellenan con los argumentos:
     TX('Partido {0} de {1}', 3, 10)  →  «Partido 3 de 10» / «Match 3 of 10»
   El idioma se guarda en este dispositivo; la primera vez se elige el del
   navegador (español si está en español; si no, inglés).
   ===================================================================== */
const I18N = (() => {
  const KEY = 'inazuma-idioma', LANGS = { es: 'Español', en: 'English' };
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (_) {}
  if (!LANGS[lang]) {
    let nav = 'es';
    try { nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'es'; } catch (_) {}
    lang = /^es\b/i.test(nav) ? 'es' : 'en';
  }
  const missing = new Set();
  function set(l) { if (!LANGS[l]) return; try { localStorage.setItem(KEY, l); } catch (_) {} }
  // Nombres de los datos del juego (técnicas y equipos) en el idioma elegido
  function applyData() {
    if (lang !== 'en' || typeof GAME === 'undefined') return;
    for (const id in GAME.techniques) { const t = GAME.techniques[id]; if (t.name_en) t.name = t.name_en; }
    for (const t of GAME.teams || []) if (t.name_en) t.name = t.name_en;
  }
  return { lang, LANGS, set, missing, applyData, en: () => lang === 'en' };
})();

function TX(s, ...a) {
  let r = s;
  if (I18N.lang === 'en') {
    const e = typeof EN_TEXT !== 'undefined' ? EN_TEXT[s] : undefined;
    if (e != null) r = e; else I18N.missing.add(s);
  }
  return a.length ? r.replace(/\{(\d+)\}/g, (m, i) => (a[i] != null ? a[i] : '')) : r;
}
// Plural sencillo: TXn(n, '{0} jugador', '{0} jugadores') → «1 jugador» / «3 players»
function TXn(n, one, many) { return TX(n === 1 ? one : many, n); }
