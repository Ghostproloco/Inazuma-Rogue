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
