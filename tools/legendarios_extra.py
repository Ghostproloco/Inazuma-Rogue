# Sube a LEGENDARIO a defensas, porteros y algunos medios/delanteros potentes de la serie (los mismos ids: las partidas guardadas no se rompen).
# Les sube las stats al nivel legendario (se conserva su "perfil") y mantiene sus técnicas. Se ejecuta UNA vez:  python3 tools/legendarios_extra.py
import json, os
P = os.path.join(os.path.dirname(__file__), '..', 'juego', 'gamedata.json')
G = json.load(open(P)); BY = {p['id']: p for p in G['players']}
K = ['tiro', 'fisico', 'control', 'defensa', 'rapidez', 'aguante']
# id: media objetivo
UP = {
 # porteros
 212: 92, 148: 92, 20: 91, 68: 91, 1418: 91, 1384: 90,
 # defensas
 3: 92, 5: 91, 4: 92, 2: 92, 1567: 92, 21583: 92, 21399: 91, 133: 91,
 # medios y delanteros
 21585: 91, 21590: 91, 1426: 90, 1425: 90,
}
n = 0
for i, t in UP.items():
    p = BY[i]
    if p['rarity'] == 'legendaria': continue
    old = p['ie']; av = sum(old[k] for k in K) / len(K); d = t - av
    new = {k: max(40, min(99, round(old[k] + d))) for k in K}
    if p.get('ie0'): p['ie0'] = {k: round(new[k] * p['ie0'][k] / old[k]) for k in K}
    p['ie'] = new; p['rarity'] = 'legendaria'; n += 1
    print(i, p['name'], p['role'], round(av), '->', round(sum(new.values()) / 6))
json.dump(G, open(P, 'w'), ensure_ascii=False, separators=(',', ':'))
print(n, 'jugadores subidos a legendario')
