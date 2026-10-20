/* =====================================================================
   CONFIGURACIÓN DE LAS CUENTAS (Firebase)
   Pega aquí los datos de tu app web de Firebase:
   Consola de Firebase → ⚙️ Configuración del proyecto → General →
   «Tus apps» → la app web → «firebaseConfig».
   Estos datos son públicos a propósito (van en cualquier web que use
   Firebase): lo que protege las partidas son las reglas de firestore.rules.
   Si los dejas vacíos, el juego funciona igual, pero sin cuentas.
   ===================================================================== */
const CLOUD_CONFIG = {
  apiKey: '',       // ej.: 'AIzaSy…'
  authDomain: '',   // ej.: 'inazuma-rogue.firebaseapp.com'
  projectId: '',    // ej.: 'inazuma-rogue'
  appId: '',        // ej.: '1:1234567890:web:abc123…'
};
