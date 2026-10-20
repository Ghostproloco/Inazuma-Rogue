/* =====================================================================
   CONFIGURACIÓN DE LAS CUENTAS (Supabase)
   Pega aquí los dos datos de tu proyecto de Supabase:
   Project Settings → API → «Project URL» y la clave pública
   («anon public», o «publishable» en los proyectos nuevos).
   La clave anon es pública a propósito: lo que protege los datos son las
   reglas (RLS) de supabase.sql. NUNCA pongas aquí la clave «service_role» ni la «secret».
   Si los dejas vacíos, el juego funciona igual, pero sin cuentas.
   ===================================================================== */
const CLOUD_CONFIG = {
  url: '',   // ej.: 'https://abcdefghijkl.supabase.co'
  key: '',   // ej.: 'sb_publishable_…' o 'eyJhbGciOi…'
};
