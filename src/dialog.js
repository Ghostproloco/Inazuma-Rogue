/* =====================================================================
   DIÁLOGOS: frases que dicen los jugadores (antes del partido y durante él).
   Son frases originales con el espíritu de la serie. Se pasan por TX(), así que
   las traducciones están en src/en.js.
   ===================================================================== */
const Dialog = (() => {
  const L = {
 "taunt_fuego": [
  "¿Crees que puedes apagar mi fuego? ¡Inténtalo!",
  "Hoy mi balón arde. ¡Aguanta si puedes!",
  "¡Vas a quemarte antes del descanso!"
 ],
 "taunt_viento": [
  "Seré más rápido que tu mirada. ¡Parpadea y pierdes!",
  "El viento sopla a mi favor hoy.",
  "¡No podrás ni tocar el balón!"
 ],
 "taunt_bosque": [
  "Mis raíces son profundas. ¡No me moverás!",
  "Este campo es mi bosque. ¡Perderás en casa ajena!",
  "Paciencia… el balón acabará en mis manos."
 ],
 "taunt_montaña": [
  "Soy una muralla. ¡Pasa si te atreves!",
  "Nadie ha movido esta montaña. ¿Serás tú el primero?",
  "Prepárate: mis tiros pesan como piedras."
 ],
 "taunt_neutro": [
  "¿Así que tú eres mi rival? ¡Será divertido!",
  "A ver si puedes ganarme.",
  "No me subestimes. ¡Voy a por todas!",
  "Hoy no pienso perder. ¡Prepárate!",
  "Dame un buen partido, si eres capaz."
 ],
 "reply": [
  "¡Eso quería oír! Vamos a jugar.",
  "Hablar es fácil. ¡Demuéstralo en el campo!",
  "Mi equipo no se rinde jamás.",
  "Acepto el reto. ¡Que gane el mejor!",
  "Ya veremos quién se ríe al final.",
  "No me asustas. ¡Empecemos!",
  "¡Nos vemos en el campo!"
 ],
 "shout_fuego": [
  "¡Siente mi fuego!",
  "¡Arde, balón, arde!",
  "¡Todo mi calor en este tiro!"
 ],
 "shout_viento": [
  "¡Más rápido que el viento!",
  "¡Ni lo verás pasar!",
  "¡Corre, balón, corre!"
 ],
 "shout_bosque": [
  "¡La fuerza del bosque!",
  "¡Crece, mi técnica!",
  "¡Raíces, sostenedme!"
 ],
 "shout_montaña": [
  "¡Firme como una roca!",
  "¡Esto pesa mucho!",
  "¡Que tiemble el suelo!"
 ],
 "shout_neutro": [
  "¡Allá va mi técnica!",
  "¡Con todas mis fuerzas!",
  "¡Esta es la buena!"
 ],
 "kind_parada": [
  "¡Por aquí no pasa nadie!",
  "¡Mi portería es sagrada!",
  "¡Lo paro, lo paro!"
 ],
 "kind_bloqueo": [
  "¡No pasarás!",
  "¡Aquí me quedo yo!"
 ],
 "goal": [
  "¡GOOOL! ¡Lo hemos conseguido!",
  "¡Así se hace, equipo!",
  "¡Uno más para nosotros!",
  "¡Esto es solo el principio!"
 ],
 "goalRival": [
  "¿Eso es todo lo que tenéis?",
  "¡Os lo dije!",
  "¡Demasiado fácil!",
  "¡Uno menos para vosotros!"
 ],
 "save": [
  "¡Aquí no pasa nada!",
  "¡Tranquilos, lo tengo!",
  "¡Está parado!"
 ],
 "saveRival": [
  "¡Tu tiro no me asusta!",
  "¡Casi, pero no!",
  "¡Mejor suerte la próxima!"
 ]
};
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const key = e => (L['taunt_' + e] ? e : 'neutro');
  return {
    taunt: e => TX(pick(L['taunt_' + key(e)].concat(L.taunt_neutro))),   // el rival antes del partido
    reply: () => TX(pick(L.reply)),                                        // tu mejor jugador le contesta
    shout: (e, kind) => TX(pick(L['kind_' + kind] || L['shout_' + key(e)].concat(L.shout_neutro))),   // al lanzar una técnica
    goal: () => TX(pick(L.goal)), goalRival: () => TX(pick(L.goalRival)),
    save: () => TX(pick(L.save)), saveRival: () => TX(pick(L.saveRival)),
  };
})();
