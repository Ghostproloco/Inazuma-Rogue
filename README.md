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
## Cuentas y guardado en la nube (Firebase)
El juego guarda la partida en el móvil y, si el jugador tiene cuenta, también en la nube (se sube sola cada vez que cambia).
Se puede entrar con **Google** o con **usuario y contraseña**. Para activarlo, una sola vez:

1. https://console.firebase.google.com → **Crear un proyecto** (`inazuma-rogue`, sin Google Analytics).
2. **Authentication → Comenzar → Método de inicio de sesión**: activa **Correo electrónico/contraseña** y **Google**.
   En **Configuración → Dominios autorizados**, añade `franmndezzzz.github.io`.
3. **Firestore Database → Crear base de datos** (ubicación en Europa, modo producción).
   En la pestaña **Reglas**, pega el contenido de `firestore.rules` y pulsa **Publicar**.
4. **⚙️ Configuración del proyecto → Tus apps → Web (`</>`)**: registra la app y copia `apiKey`, `authDomain`, `projectId` y `appId` en `src/cloud-config.js`.
5. `python3 build.py` y sube el juego.

Notas:
- Esos datos son públicos por diseño; lo que protege las partidas son las reglas de `firestore.rules` (cada uno solo ve la suya).
- Usuario y contraseña no tiene «he olvidado mi contraseña». Si alguien la pierde, puedes cambiarla en **Authentication → Usuarios** (el usuario `fran` aparece como `fran@jugadores.inazumarogue.app`). Con Google no hay contraseña que olvidar.
- Si dejas `src/cloud-config.js` vacío, el juego funciona igual que antes, sin cuentas (y no descarga Firebase).
- Si dos dispositivos tienen partidas distintas, el juego pregunta cuál conservar y guarda la otra como copia en el móvil.

## Traer la partida de la versión antigua
En la pantalla de bienvenida (y en 👤 Cuenta) está **«¿Jugabas en la versión antigua?»**: abre la versión antigua con un botón, explica dónde sacar el código y lo carga al pegarlo. También sirve un **enlace de transferencia** (`…/juego/#partida=IRZ1:…`), que se crea en Cuenta → Copias y código de partida.
