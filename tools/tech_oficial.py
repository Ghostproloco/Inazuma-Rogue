# Nombres OFICIALES en España de las supertécnicas (juegos de Nintendo en castellano:
# Inazuma Eleven 1, 2 y 3 Rayo celeste / Fuego explosivo / La amenaza del Ogro).
# Fuente: listas de técnicas de guiasnintendo.com (copiadas de los juegos españoles).
# Solo cambia "name" (español); "name_en" se queda igual para el juego en inglés.
# Se puede ejecutar las veces que haga falta:  python3 tools/tech_oficial.py
import json, os
ROOT = os.path.join(os.path.dirname(__file__), '..'); P = os.path.join(ROOT, 'juego', 'gamedata.json')
G = json.load(open(P))
OFICIAL = {
 # Inazuma 1 y 2: abreviaturas y pequeños fallos
 144: 'Chut de los 100 toques', 20144: 'Chut de los 100 toques',
 280: 'Chut de los 200 toques', 483: 'Chut de los 200 toques',
 166: 'Espiral de distorsión', 172: 'Escudo de fuerza total',
 209: 'Pingüino emperador n.º 2', 277: 'Pingüino emperador n.º 1', 20277: 'Pingüino emperador n.º 1',
 283: 'Supertrampolín relámpago',
 # Inazuma 3: bloqueos
 30188: 'Gran seísmo', 30189: 'Simún', 30220: 'Emboscada', 30222: 'Estela ígnea',
 30225: 'Golpe de vacío', 30229: 'Jaula de piedra', 30393: 'Zigzag de fuego',
 30394: 'Subida a los cielos', 30395: 'Caída a los infiernos',
 # Inazuma 3: porteros
 30410: 'Mano ultradimensional', 30425: 'Puño de furia', 30426: 'Mano espiritual',
 30429: 'Parada celestial', 30434: 'Araña gigante', 30438: 'Parada de capoeira', 30444: 'Malla eléctrica',
 # Inazuma 3: regates
 30344: 'Campo de fuerza', 30346: 'Caída de Abadón', 30348: 'Vuelo de Ícaro', 30350: 'Danza del viento',
 30351: 'Descarte', 30352: 'Engaño torero', 30355: 'Amago de tiro', 30356: 'Patín aéreo',
 30357: 'Coz 3', 30358: 'Balón galgo', 30359: 'Inmersión', 30360: 'Ultralunar',
 # Inazuma 3: tiros
 30160: 'Remate del tigre', 30234: 'Llamarada infernal', 30235: 'Gran tifón', 30236: 'Torbellino trampolín',
 30239: 'Megadragón', 30242: 'Gran lobo', 30246: 'La aurora', 30248: 'Huracán', 30250: 'Ataque de paladín',
 30253: 'Cañonazo', 30255: 'Tiro espejismo', 30256: 'Remate Pegaso', 30257: 'Remate unicornio',
 30260: 'Disparo valiente', 30314: 'Remate caótico', 30316: 'Mandíbulas dobles', 30452: 'Cañón X',
 30458: 'Diluvio letal', 30459: 'Lanza letal', 30463: 'Triángulo múltiple', 30464: 'Pingüino múltiple',
 # Segunda tanda (24 oct): buscando el nombre inglés en el wiki en español (inazuma.fandom.com/es)
 # y comprobando que el nombre sale en la lista de técnicas de Inazuma Eleven 3 de guiasnintendo.com
 30259: 'Fuego total', 30244: 'Remate celestial', 30254: 'Torbellino de fuego', 30290: 'Remate gafas',
 30319: 'Full goleador', 30347: 'Ignición', 30354: 'Cúpula sónica', 30382: 'Gran sabio', 30435: 'Espada defensora',
 30221: 'Dientes de roca', 30224: 'Placaje extremo', 30226: 'Engaño yoyó', 30431: 'Golpes de luz',
 30432: 'Rechace de fuego', 30446: 'El olvido',
 # Tercera tanda (24 oct): nombres que buscó Fran
 30240: 'Círculo de espadas', 30317: 'Tiro torre Eiffel', 30460: 'Mangual letal', 30461: 'Lluvia oscura',
 30462: 'Descenso estelar', 30441: 'Baraja fugaz', 30442: 'Voltaje dual', 30447: 'Martillo defensor',
 # Técnica inventada para Axel (no sale en los juegos): cambia de nombre porque «Torbellino de fuego» es la oficial de Fireball Screw
 30480: 'Vórtice de fuego',
}
n = 0
for tid, name in OFICIAL.items():
  t = G['techniques'].get(str(tid))
  if not t: print('falta', tid); continue
  if t['name'] != name: print(f"{tid}: {t['name']} -> {name}"); t['name'] = name; n += 1
json.dump(G, open(P, 'w'), ensure_ascii=False, separators=(',', ':'))
print(n, 'cambios')
