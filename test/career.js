const fs = require('fs'), vm = require('vm');
const S = require('path').join(__dirname,'..','src')+'/';
const store = {};
const ctx = { TX: (s, ...a) => a.length ? s.replace(/\{(\d+)\}/g, (m, i) => a[i]) : s, TXn: (n, a, b) => (n === 1 ? a : b).replace('{0}', n), console, Math, JSON, Object, Array, Set, Map, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => delete store[k] } };
ctx.GAME = JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','juego','gamedata.json'), 'utf8'));
ctx.Sprites = { refOf: pd => ({ file: 'c00.png', row: 0 }) };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S + 'logic.js', 'utf8') + '\n' + fs.readFileSync(S + 'run.js', 'utf8') + '\n' + fs.readFileSync(S + 'career.js', 'utf8') + '\nthis.Career=Career;this.DIV_NAME=DIV_NAME;this.PLAYER=PLAYER;this.FORMATIONS=FORMATIONS;Profile.load();this.Profile=Profile;', ctx);
const { Career, DIV_NAME, PLAYER } = ctx;
const BUY = process.argv[2] === 'buy';
const c = Career.create(13, 'Instituto Prueba');
console.log('media inicial', Career.myRating(), 'dinero', c.money);
for (const d of [1, 2, 3]) console.log(DIV_NAME[d], c.divs[d].map(k => k + ':' + Career.rating(k)).join(' '));
let buys = 0, negs = { accept: 0, counter: 0, reject: 0, closed: 0 };
for (let season = 0; season < 6 && !c.over; season++) {
  for (let w = 0; w < 16 && !c.over; w++) {
    if (BUY && c.money > 150) {
      // intenta mejorar al peor titular con el mercado o con ojeados
      const roles = ctx.FORMATIONS[c.formation].roles;
      const worst = c.lineup.map((id, i) => ({ i, r: Career.rate(Career.m(id), roles[i]) })).sort((a, b) => a.r - b.r)[0];
      const role = roles[worst.i];
      const cands = [...(c.scout || []).map(s => ({ id: s.id, price: s.price })), ...Career.marketList().libres.map(id => ({ id, price: Math.round(Career.value(id) * 0.8 / 5) * 5 }))]
        .filter(x => PLAYER(x.id).role === role && x.price <= c.money).map(x => ({ ...x, r: Career.rate(Career.member(x.id), role) })).filter(x => x.r > worst.r + 2).sort((a, b) => b.r - a.r);
      if (cands[0]) {
        if (c.squad.length >= 12) { const bench = c.squad.filter(m => !c.lineup.includes(m.id)).sort((a, b) => Career.ovr(a) - Career.ovr(b))[0]; Career.sell(bench.id); }
        const r = Career.sign(cands[0].id, cands[0].price); if (r.ok) { buys++; Career.autoLineup(); }
      } else {
        // prueba a negociar con un club de su división
        const cp = Career.clubPlayers(Career.myDiv()).filter(x => PLAYER(x.id).role === role);
        const t = cp[Math.floor(Math.random() * cp.length)];
        if (t) { const v = Career.value(t.id, t.key); const o = Career.offer(t.key, t.id, Math.round(v * 0.95)); negs[o.res]++;
          if (o.res === 'counter' && o.price <= c.money) { const o2 = Career.offer(t.key, t.id, o.price); negs[o2.res]++; if (o2.res === 'accept') { if (c.squad.length >= 12) Career.sell(c.squad.filter(m => !c.lineup.includes(m.id))[0].id); if (Career.sign(t.id, o2.price, t.key).ok) { buys++; Career.autoLineup(); } } }
          else if (o.res === 'accept' && o.price <= c.money) { if (c.squad.length >= 12) Career.sell(c.squad.filter(m => !c.lineup.includes(m.id))[0].id); if (Career.sign(t.id, o.price, t.key).ok) { buys++; Career.autoLineup(); } } }
      }
    }
    const nm = Career.nextMatch();
    if (c.forma < 55) Career.doActivity('descansar'); else Career.doActivity(w % 4 === 3 ? 'ojear' : w % 4 === 2 ? 'tecnicas' : 'entrenar', ['tiro', 'defensa', 'control', 'rapidez', 'fisico'][w % 5]);
    if (nm) { const r = Career.simulateMine('equilibrada'); Career.finishMatch(r.gA, r.gB, r.pens, r.forma); }
    const sum = Career.advance();
    if (sum) console.log(`T${sum.season} ${DIV_NAME[sum.div]} ${sum.pos}º ${sum.moves.join(',')}${sum.playoff ? '(playoff)' : ''} fama ${c.fame} dinero ${c.money} media ${Career.myRating()} gradu ${sum.grads.length} juveniles ${sum.youth.length} plantilla ${c.squad.length} fichajes ${buys} ${sum.champion ? "CAMPEÓN" : ""} copa:${sum.cupWinner} 🎟️${sum.tickets} | sube: ${sum.promoted[2].join(',')}`);
  }
}
console.log('over', c.over, 'títulos', JSON.stringify(c.titles), 'negociación', JSON.stringify(negs));
for (const d of [1, 2, 3]) if (c.divs[d].length !== 12) console.log('ERROR tamaño div', d, c.divs[d].length);
