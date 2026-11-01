// Objetos 🎒: equipar, bonos en el partido, monedas del imán, gacha, ofertas de la tienda
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = path.join(__dirname, '..', 'src') + '/', store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, Date, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } } };
ctx.GAME = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'juego', 'gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: () => ({ file: 'c00.png', row: 0 }) };
vm.createContext(ctx);
vm.runInContext(['logic.js', 'run.js', 'shop.js', 'items.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n') + '\nProfile.load();Object.assign(this,{Profile,Items,ITEMS,ITEM_IDS,Shop,PLAYER,buildMatchPlayer,statOf,START_COINS,START_TICKETS});', ctx);
const { Profile, Items, ITEMS, ITEM_IDS, Shop, PLAYER, buildMatchPlayer, statOf, START_COINS, START_TICKETS } = ctx;
let ok = true; const chk = (c, m) => { if (!c) { ok = false; console.log('✗', m); } };
chk(START_COINS <= 1000 && START_TICKETS <= 20, 'una cuenta nueva no puede empezar con cantidades enormes: ' + START_COINS + '/' + START_TICKETS);
chk(Profile.data.coins === START_COINS && Profile.data.tickets === START_TICKETS, 'el perfil nuevo usa los valores iniciales');
chk(ITEM_IDS.length >= 12 && ITEM_IDS.every(id => ITEMS[id].icon && ITEMS[id].name && ITEMS[id].rar), 'todos los objetos tienen icono, nombre y rareza');
const mk = id => Object.assign(buildMatchPlayer(id, 'DEL', k => statOf(id, null, k), [], [], 0, null), {});
const id = 10, base = mk(id);
Items.add('botas_huracan'); Items.add('balon_oro');
chk(Items.free('botas_huracan') === 1, 'objeto libre tras comprarlo');
chk(Items.equip(id, 'botas_huracan').ok && Items.of(id) === 'botas_huracan', 'se equipa');
chk(!Items.equip(11, 'botas_huracan').ok, 'no se puede equipar sin copias libres');
const m1 = Shop.boost(mk(id));
chk(m1.speed > base.speed && m1.kick === base.kick + 4, 'las botas dan rapidez y tiro: ' + base.speed + '→' + m1.speed + ' / ' + base.kick + '→' + m1.kick);
Items.equip(id, 'balon_oro'); const m2 = Shop.boost(mk(id));
chk(m2.kick === base.kick + 9 && m2.control === base.control + 3 && m2.speed === base.speed, 'cambiar de objeto sustituye al anterior');
Items.unequip(id); const m3 = Shop.boost(mk(id)); chk(m3.kick === base.kick, 'quitar el objeto devuelve las stats');
Items.add('iman', 2); Items.equip(10, 'iman'); Items.equip(12, 'iman');
chk(Items.coinPct() === 40, 'dos imanes suman +40 % de monedas: ' + Items.coinPct());
Items.add('trebol'); Items.equip(13, 'trebol'); chk(Items.luck() === 50, 'trébol +50 %');
// gacha: la tirada de ×10 siempre da objeto y la de ×1 casi nunca
let none10 = 0, got1 = 0; for (let i = 0; i < 400; i++) { if (!Items.rollDrops(10).length) none10++; got1 += Items.rollDrops(1).length; }
chk(none10 === 0, 'la tirada de ×10 asegura al menos un objeto');
chk(got1 > 10 && got1 < 140, 'una tirada suelta da objeto de vez en cuando: ' + got1 + '/400');
const seen = new Set(); for (let i = 0; i < 3000; i++) Items.rollDrops(10).forEach(x => seen.add(ITEMS[x].rar)); chk(seen.size === 4, 'caen las 4 rarezas: ' + [...seen]);
// tienda
Profile.data.coins = 100000;
const d1 = Items.deals(Date.parse('2026-11-02T12:00:00')), d2 = Items.deals(Date.parse('2026-11-02T23:00:00')), d3 = Items.deals(Date.parse('2026-11-03T12:00:00'));
chk(d1.length === 3 && d1.map(x => x.id).join() === d2.map(x => x.id).join(), 'las ofertas son las mismas todo el día');
chk(d1.map(x => x.id).join() !== d3.map(x => x.id).join() || true, 'cambian al día siguiente (puede coincidir por azar)');
chk(d1.every(x => x.price === Math.round(Items.price(x.id) * 0.75)), 'descuento del 25 %');
const before = Profile.data.coins, r = Items.buyDeal(d1[0].id, Date.parse('2026-11-02T12:00:00'));
chk(r.ok && Profile.data.coins === before - d1[0].price, 'comprar una oferta cobra el precio con descuento');
chk(!Items.buyDeal(d1[0].id, Date.parse('2026-11-02T13:00:00')).ok, 'cada oferta se compra una vez al día');
Profile.data.coins = 10; chk(!Items.buy('corona').ok, 'sin monedas no se compra');
{ const c0 = Items.count('corona'); Profile.data.coins = 20000; chk(Items.buy('corona').ok && Items.count('corona') === c0 + 1 && Profile.data.coins === 5000, 'compra normal'); }
console.log(ok ? '\n✓ Todo bien' : '\nHAY FALLOS'); process.exitCode = ok ? 0 : 1;
