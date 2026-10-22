# Técnicas del Inazuma 3 en español (el juego nunca salió en España: venían en inglés) y algunas que faltaban.
# - name pasa a español; name_en guarda el nombre inglés original (para el juego en inglés).
# - Técnicas nuevas: Torbellino de fuego (Axel, Inazuma 3) y Leyenda del lobo (Shawn, Inazuma 3).
# Se ejecuta UNA vez sobre juego/gamedata.json:  python3 tools/ie3_es.py
import json, os
ROOT = os.path.join(os.path.dirname(__file__), '..'); P = os.path.join(ROOT, 'juego', 'gamedata.json')
G = json.load(open(P))
ES = {
 # bloqueos
 'Diabolical Cut': 'Corte diabólico', 'Welcome Back': 'Bienvenida', 'Sneaking Raid': 'Asalto sigiloso', 'Hell’s Descent': 'Descenso infernal',
 'Ground Running Blaze': 'Llamarada rastrera', 'Zigzag Flame': 'Llama en zigzag', 'Rolling Slide': 'Entrada rodante', 'The Mountain': 'La montaña',
 'Barbarian Shield': 'Escudo bárbaro', 'Iron Wall': 'Muro de hierro', 'Power Charge': 'Carga de fuerza', 'Ground Quake': 'Sacudida terrestre',
 'Gravestone': 'Lápida', 'Stone Prison': 'Prisión de piedra', 'Mega Wall': 'Megamuro', 'Desert Blast': 'Ráfaga del desierto',
 'Snow Angel': 'Ángel de nieve', 'Vac Attack': 'Ataque aspirador', 'Heaven’s Ascent': 'Ascenso celestial',
 # porteros
 'Dimensional Hand': 'Mano dimensional', 'Big Spider': 'Gran araña', 'Fiend Hand': 'Mano diabólica', 'Stinger': 'Aguijón', 'The End': 'El final',
 'God Hand X': 'Mano celestial X', 'Big Explosive Slap': 'Gran bofetón explosivo', 'Soul Hand': 'Mano del alma', 'Million Hands': 'Millón de manos',
 'Shoot Trap': 'Trampa de tiro', 'God Catch': 'Atrapada divina', 'Hammer of Fury': 'Martillo de la furia', 'Flash Upper': 'Gancho relámpago',
 'Colosseum Guard': 'Guardia del coliseo', 'Capoeira Snatch': 'Robo capoeira', 'Card Protect': 'Protección de cartas',
 'Great Barrier Reef': 'Gran barrera de coral', 'Storm Rider': 'Jinete de la tormenta', 'Galatyn': 'Galatín', 'High Voltage': 'Alto voltaje',
 'Needle Hammer': 'Martillo de agujas', 'Electrap': 'Trampa eléctrica', 'Holy Zone': 'Zona sagrada',
 # regates
 'Echo Ball': 'Balón eco', 'Field of Force': 'Campo de fuerza ofensivo', 'Ultra Moon': 'Ultraluna', 'Matador Feint': 'Finta del matador',
 'Devil Ball': 'Balón diabólico', 'Liar Shot': 'Tiro mentiroso', 'Abaddon Drop': 'Caída de Abadón', 'Dog Run': 'Carrera de perro',
 'The Ikaros': 'El Ícaro', 'Breakthrough 3': 'Avance imparable 3', 'Super Elastico': 'Superelástico', 'Kangaroo Kick': 'Patada canguro',
 'Bewilder Blast': 'Ráfaga desconcertante', 'U-Boat': 'Submarino', 'Wind God’s Dance': 'Danza del dios del viento', 'Air Ride': 'Paseo aéreo',
 'Big Card': 'Gran carta', 'Angel Ball': 'Balón angelical',
 # tiros
 'Dragon Slayer': 'Matadragones', 'Emperor Penguin No. 3': 'Pingüino emperador n.º 3', 'Card Buster': 'Rompecartas', 'Grand Fenrir': 'Gran Fenrir',
 'Astro Gate': 'Puerta astral', 'Clone Death Zone': 'Zona mortal clonada', 'Clone Penguin': 'Pingüino clonado', 'Mirage Shoot': 'Tiro espejismo',
 'Chaos Break': 'Ruptura del caos', 'Pegasus Shot': 'Tiro pegaso', 'Double Tornado': 'Tornado doble', 'Doom Spear': 'Lanza de la perdición',
 'Shadow Ray': 'Rayo de sombra', 'Fireball Screw': 'Bola de fuego en espiral', 'Grand Fire': 'Gran fuego', 'Gunshot': 'Disparo de pistola',
 'X Blast': 'Explosión X', 'Emperor Penguin X': 'Pingüino emperador X', 'Hellfire': 'Fuego infernal', 'Tiger Storm': 'Tormenta del tigre',
 'Celestial Smash': 'Golpe celestial', 'Double Jaw': 'Doble mandíbula', 'Doom Rain': 'Lluvia de la perdición', 'Sling Shot': 'Tirachinas',
 'Brave Shot': 'Tiro valiente', 'Gladius Arch': 'Arco de gladio', 'Tiger Drive': 'Impulso del tigre', 'Spectacle Crash': 'Choque espectacular',
 'Paladin Strike': 'Golpe del paladín', 'Unicorn Boost': 'Impulso del unicornio', 'Megaton Head': 'Cabezazo megatón', 'Odin Sword': 'Espada de Odín',
 'Samba Strike': 'Golpe de samba', 'Eiffel Drive': 'Impulso Eiffel', 'Doom Break': 'Ruptura de la perdición', 'Heavenly Drive': 'Impulso celestial',
 'Whirlwind Drop': 'Caída del remolino', 'The Hurricane': 'El huracán', 'The Typhoon': 'El tifón', 'Thunder Beast': 'Bestia del trueno',
 'The Dawn': 'El amanecer', 'Megalodon': 'Megalodón', 'Excalibur': 'Excalibur',
}
T = G['techniques']; done = 0; left = []
for t in T.values():
    if t['id'] < 30000 or t.get('name_en'): continue
    if t['name'] in ES: t['name_en'] = t['name']; t['name'] = ES[t['name']]; done += 1
    else: left.append(t['name'])
# Técnicas nuevas del Inazuma 3 que faltaban
NEW = [
  {'id': 30480, 'name': 'Torbellino de fuego', 'name_en': 'Fire Whirlwind', 'type': 'tiro', 'tp': 70, 'power': 110, 'elem': 'fuego'},
  {'id': 30481, 'name': 'Leyenda del lobo', 'name_en': 'Wolf Legend', 'type': 'tiro', 'tp': 70, 'power': 110, 'elem': 'viento'},
]
for n in NEW:
    if str(n['id']) not in T and not any(t['id'] == n['id'] for t in T.values()): T[str(n['id'])] = n
GIVE = {10: 30480, 30010: 30480, 39501: 30480, 1514: 30481, 31170: 30481}
for p in G['players']:
    if p['id'] in GIVE and not any(m[0] == GIVE[p['id']] for m in p['moves']):
        if p['id'] == 39501: p['moves'] = [[GIVE[p['id']], 1] if m[0] == 143 else m for m in p['moves']]   # Rosfire: en vez del Tornado de fuego
        else: p['moves'].append([GIVE[p['id']], 100])
json.dump(G, open(P, 'w'), ensure_ascii=False, separators=(',', ':'))
names = [t['name'] for t in T.values()]
print('traducidas', done, '· sin traducir', left, '· repetidas', sorted({n for n in names if names.count(n) > 1})[:20])
