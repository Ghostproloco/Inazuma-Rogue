# Añade los nombres en inglés (name_en) a técnicas y equipos de juego/gamedata.json.
# Técnicas: tools/tech_en.txt (español|inglés). Equipos: la lista de abajo.
# Las técnicas que ya tienen nombre en inglés (Inazuma 3) se dejan igual.
import json, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
P = os.path.join(ROOT, 'juego', 'gamedata.json')
G = json.load(open(P))
TECH = {}
for line in open(os.path.join(ROOT, 'tools', 'tech_en.txt')):
    line = line.strip()
    if not line or line.startswith('#'): continue
    es, en = line.split('|'); TECH[es] = en
TEAMS = {'Veteranos': 'Veterans', 'Tanques Centella': 'Lightning Tanks', 'Airosos': 'Airborne', 'Guardabosques': 'Rangers',
         'Ardientes': 'Blazers', 'Montañeros': 'Mountaineers', 'Pistolas Centella': 'Lightning Pistols', 'Bombas Centella': 'Lightning Bombers',
         'Cohetes Centella': 'Lightning Rockets', 'Jets Centella': 'Lightning Jets', 'Tormenta de Géminis': 'Gemini Storm', 'Alpino': 'Alpine',
         'Épsilon': 'Epsilon', 'Claustro Sagrado': 'Sacred Cloister', 'Épsilon Plus': 'Epsilon Plus', 'Emperadores Oscuros': 'Dark Emperors',
         'Génesis': 'Genesis', 'Polvo de Diamantes': 'Diamond Dust', 'Caos': 'Chaos'}
# Dos técnicas de portero con el nombre roto en los datos (Darren LaChance, Keenan DiFortune)
BROKEN = {186: ('Mano del bosque', 'Forest Hand'), 187: ('Despeje del bosque', 'Forest Punch')}
missing = []
for t in G['techniques'].values():
    if t['id'] in BROKEN: t['name'], t['name_en'] = BROKEN[t['id']]; continue
    if t['name'] in TECH: t['name_en'] = TECH[t['name']]
    elif t['id'] < 30000: missing.append(t['name'])
for t in G['teams']:
    if t['name'] in TEAMS: t['name_en'] = TEAMS[t['name']]
json.dump(G, open(P, 'w'), ensure_ascii=False, separators=(',', ':'))
print('técnicas sin inglés:', missing or 'ninguna')
