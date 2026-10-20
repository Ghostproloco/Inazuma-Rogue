# Inazuma Rogue

Fan game gratuito y no comercial de **Inazuma Eleven** (Level-5): fútbol 5 contra 5 en tiempo real, roguelite, gacha, modo Carrera y Mundial.
Para navegador (móvil en vertical y PC).

## 🎮 Jugar ahora
**https://franmndezzzz.github.io/Inazuma-Rogue/juego/**

> Inazuma Eleven es propiedad de Level-5. Este proyecto no está afiliado a Level-5 ni a Nintendo.
> La carpeta `juego/` contiene recursos sacados de los juegos originales: **mantén este repositorio privado**.

## Cómo jugar en tu ordenador
1. Abre una terminal en la carpeta `juego/`.
2. Ejecuta `python3 -m http.server 8000`.
3. Abre `http://localhost:8000` en el navegador.

## Estructura
- `src/` · código del juego (lógica, partido, carrera, gacha, interfaz).
- `build.py` · junta `src/` y los datos en `juego/index.html`.
- `juego/` · el juego listo para jugar (index.html, sprites, música, escudos).
- `test/` · pruebas automáticas (Node.js).
## Cuentas y guardado en la nube (Supabase)
El juego guarda la partida en el móvil y, si el jugador tiene cuenta, también en la nube (se sube sola cada vez que cambia).
Para activarlo, una sola vez:

1. Entra en https://supabase.com, crea una cuenta gratuita y pulsa **New project** (nombre: `inazuma-rogue`, región: la más cercana; apunta la contraseña de la base de datos aunque el juego no la usa).
2. **Authentication → Sign In / Providers → Email**: deja **Email** activado y **desactiva «Confirm email»** (las cuentas usan nombre de usuario, no se envían correos). Guarda.
3. **SQL Editor → New query**: pega todo el contenido de `supabase.sql` y pulsa **Run**. Debe salir «Success».
4. **Project Settings → API** (o **API Keys**): copia la **Project URL** y la clave pública (**anon public** o **publishable**).
5. Pégalas en `src/cloud-config.js`, ejecuta `python3 build.py` y sube el juego.

Notas:
- La clave pública puede ir en el juego: las reglas de `supabase.sql` hacen que cada uno solo vea su partida. **Nunca** pongas la `service_role` ni la `secret`.
- Sin correo no hay «he olvidado mi contraseña». Si alguien la pierde, puedes cambiársela en **Authentication → Users** (el usuario `fran` aparece como `fran@jugadores.inazumarogue.app`).
- Si dejas `src/cloud-config.js` vacío, el juego funciona igual que antes, sin cuentas.
- Si dos dispositivos tienen partidas distintas, el juego pregunta cuál conservar y guarda la otra como copia en el móvil.

## Traer la partida de la versión antigua
En la pantalla de bienvenida (y en 👤 Cuenta) está **«¿Jugabas en la versión antigua?»**: abre la versión antigua con un botón, explica dónde sacar el código y lo carga al pegarlo. También sirve un **enlace de transferencia** (`…/juego/#partida=IRZ1:…`), que se crea en Cuenta → Copias y código de partida.
