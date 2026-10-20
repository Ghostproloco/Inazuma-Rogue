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
  apiKey: 'AIzaSyBMJeBbGpsEtxtqdrhYbwwDI6_LOvYXke4',
  authDomain: 'inazuma-rogue.firebaseapp.com',
  projectId: 'inazuma-rogue',
  appId: '1:1028369883471:web:f8a4695453bf79f20a653a',
};
