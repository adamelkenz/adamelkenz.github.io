/* Skin By Jaya — « L'histoire de votre peau » : en faisant défiler, la peau subit la pollution,
   le soleil puis le temps ; à la dernière étape, on lui applique le soin du bout du doigt.
   La crème se pose, pénètre, et laisse place à une peau lisse qui accroche la lumière.
   Calques : peau saine, pollution, UV, temps (dosés par le défilement), peau réparée et crème
   (découpées par deux masques basse définition qui gardent la trace du geste). */
(function () {
  var sec = document.querySelector('[data-histoire]');
  if (!sec) return;
  var toile = sec.querySelector('.peau-toile');
  var ctx = toile.getContext && toile.getContext('2d');
  if (!ctx) return;

  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var etapes = [].slice.call(sec.querySelectorAll('[data-etape]'));
  var parNom = {};
  etapes.forEach(function (e) { parNom[e.getAttribute('data-etape')] = e; });
  var barres = {};
  sec.querySelectorAll('[data-ag]').forEach(function (li) { barres[li.getAttribute('data-ag')] = li; });
  var indice = sec.querySelector('[data-indice]');
  var jauge = sec.querySelector('[data-jauge]');
  var pctTxt = sec.querySelector('[data-pct]');
  var btnTout = sec.querySelector('[data-tout]');
  var btnReset = sec.querySelector('[data-reset]');
  var bravo = sec.querySelector('[data-bravo]');

  function toileVide() { return document.createElement('canvas'); }
  var M = 128;
  var masque = toileVide(), creme = toileVide();
  masque.width = masque.height = creme.width = creme.height = M;
  var mctx = masque.getContext('2d'), cctx = creme.getContext('2d');
  var sain = toileVide(), pollu = toileVide(), uv = toileVide(), age = toileVide(), lisse = toileVide(), tmp = toileVide();
  var tctx = tmp.getContext('2d');

  var W = 0;
  var etat = { pollution: 0, soleil: 0, temps: 0, actif: false, soin: 0 };   // soin : visibilité de la réparation (0..1)
  var lum = { x: .38, y: .32, cx: .38, cy: .32 };
  var survol = false, peint = false, dernier = null, touche = false;
  var pct = 0, fini = false, sale = true, derniereCreme = 0;

  function hasard(g) { return function () { g = (g * 16807) % 2147483647; return (g - 1) / 2147483646; }; }
  function borne(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function rond(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
  function tache(c, x, y, r, coul, a) {
    var g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + coul + ',' + a + ')');
    g.addColorStop(.6, 'rgba(' + coul + ',' + a * .45 + ')');
    g.addColorStop(1, 'rgba(' + coul + ',0)');
    c.fillStyle = g; rond(c, x, y, r);
  }
  function grain(c, force, r) {
    var d = c.getImageData(0, 0, W, W), p = d.data;
    for (var i = 0; i < p.length; i += 4) {
      if (!p[i + 3]) continue;
      var v = (r() - .5) * force;
      p[i] += v; p[i + 1] += v; p[i + 2] += v;
    }
    c.putImageData(d, 0, 0);
  }

  /* ---------- fabrication des calques ---------- */
  function calques() {
    var cote = toile.getBoundingClientRect().width;
    if (!cote) return;
    var w = Math.round(cote * Math.min(window.devicePixelRatio || 1, 2));
    if (w === W) return;
    W = w;
    [toile, sain, pollu, uv, age, lisse, tmp].forEach(function (c) { c.width = c.height = W; });
    var k = W / 500, r, c, g, i, x, y;

    // peau saine : un teint correct, sans plus
    r = hasard(4242); c = sain.getContext('2d');
    g = c.createRadialGradient(W * .42, W * .36, W * .05, W * .5, W * .5, W * .72);
    g.addColorStop(0, '#e7c0a7'); g.addColorStop(.6, '#d7a78e'); g.addColorStop(1, '#bd8a72');
    c.fillStyle = g; c.fillRect(0, 0, W, W);
    c.fillStyle = 'rgba(120,70,52,.08)';
    for (i = 0; i < 900; i++) rond(c, r() * W, r() * W, (.4 + r() * .7) * k);
    grain(c, 12, r);

    // pollution : voile gris, suie, plaques ternes
    r = hasard(911); c = pollu.getContext('2d');
    c.fillStyle = 'rgba(78,72,68,.4)'; c.fillRect(0, 0, W, W);
    for (i = 0; i < 12; i++) tache(c, r() * W, r() * W, (50 + r() * 90) * k, '52,48,45', .32);
    c.fillStyle = 'rgba(38,34,32,.55)';
    for (i = 0; i < 1400; i++) rond(c, r() * W, r() * W, (.4 + r() * 1.1) * k);
    c.fillStyle = 'rgba(30,28,26,.5)';
    for (i = 0; i < 70; i++) rond(c, r() * W, r() * W, (1.4 + r() * 2.2) * k);

    // soleil : taches pigmentaires, rougeurs
    r = hasard(1789); c = uv.getContext('2d');
    for (i = 0; i < 7; i++) tache(c, r() * W, r() * W, (45 + r() * 80) * k, '196,92,80', .2);
    for (i = 0; i < 40; i++) {
      x = r() * W; y = r() * W;
      tache(c, x, y, (4 + r() * 18) * k, '118,66,40', .5 + r() * .2);
      if (r() < .4) for (var j = 0; j < 4; j++) tache(c, x + (r() - .5) * 40 * k, y + (r() - .5) * 40 * k, (2 + r() * 6) * k, '110,60,36', .45);
    }

    // temps : teint terne, pores dilatés, ridules
    r = hasard(1997); c = age.getContext('2d');
    c.fillStyle = 'rgba(140,124,116,.22)'; c.fillRect(0, 0, W, W);
    c.fillStyle = 'rgba(100,58,42,.28)';
    for (i = 0; i < 2600; i++) rond(c, r() * W, r() * W, (.6 + r() * 1.3) * k);
    c.lineCap = 'round';
    function ride(x0, y0, x1, y1, cx, cy, ep) {
      c.lineWidth = ep * k; c.strokeStyle = 'rgba(96,54,40,.42)';
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, x1, y1); c.stroke();
      c.lineWidth = ep * .8 * k; c.strokeStyle = 'rgba(255,226,206,.2)';
      c.beginPath(); c.moveTo(x0, y0 + 1.6 * k); c.quadraticCurveTo(cx, cy + 1.6 * k, x1, y1 + 1.6 * k); c.stroke();
    }
    for (i = 0; i < 11; i++) {                // ridules irrégulières, plutôt horizontales
      var lg = W * (.12 + r() * .26);
      x = W * (.12 + r() * .5); y = W * (.18 + r() * .5);
      var x1 = Math.min(W * .9, x + lg), y1 = y + (r() - .5) * 18 * k;
      ride(x, y, x1, y1, (x + x1) / 2 + (r() - .5) * 30 * k, (y + y1) / 2 + (r() < .5 ? -1 : 1) * (5 + r() * 12) * k, .7 + r() * 1.1);
    }
    for (i = 0; i < 5; i++) {                 // pattes d'oie en éventail
      var a = -.55 + i * .26 + (r() - .5) * .1, ox = W * .82, oy = W * .62, lo = W * (.1 + r() * .08);
      ride(ox, oy, ox - Math.cos(a) * lo, oy + Math.sin(a) * lo, ox - Math.cos(a) * lo * .5, oy + Math.sin(a) * lo * .5 - 4 * k, .8 + r() * .6);
    }

    // peau réparée : rosée, unifiée, rebondie
    r = hasard(2026); c = lisse.getContext('2d');
    g = c.createRadialGradient(W * .4, W * .34, W * .02, W * .5, W * .52, W * .7);
    g.addColorStop(0, '#f4d3c0'); g.addColorStop(.45, '#e6b8a0'); g.addColorStop(1, '#c98f76');
    c.fillStyle = g; c.fillRect(0, 0, W, W);
    g = c.createRadialGradient(W * .3, W * .26, 0, W * .3, W * .26, W * .34);
    g.addColorStop(0, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, W);
    g = c.createLinearGradient(0, W, W, 0);
    g.addColorStop(.35, 'rgba(255,240,228,0)'); g.addColorStop(.5, 'rgba(255,244,234,.25)'); g.addColorStop(.65, 'rgba(255,240,228,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, W);
    grain(c, 6, r);
    sale = true;
  }

  /* ---------- effets animés : particules de pollution, rayons UV ---------- */
  var particules = [];
  (function () {
    var r = hasard(77);
    for (var i = 0; i < 90; i++) particules.push({ x: r(), y: r(), v: .0008 + r() * .002, d: (r() - .3) * .0012, t: .6 + r() * 2.2, a: .3 + r() * .5 });
  })();
  var horloge = 0;

  function effets() {
    var k = W / 500;
    var p = etat.pollution * (1 - etat.soleil) * (1 - etat.soin);
    if (p > .01 && !calme) {
      particules.forEach(function (q) {
        q.y += q.v; q.x += q.d + Math.sin(horloge * .02 + q.t * 9) * .0006;
        if (q.y > 1.05) { q.y = -.05; q.x = Math.random(); }
        ctx.fillStyle = 'rgba(46,42,40,' + q.a * p + ')';
        rond(ctx, q.x * W, q.y * W, q.t * k);
      });
    }
    var s = etat.soleil * (1 - etat.temps) * (1 - etat.soin);
    if (s > .01) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.translate(W * 1.05, -W * .1);
      ctx.rotate(Math.PI * .72);
      for (var i = 0; i < 5; i++) {
        var dec = (i - 2) * W * .17 + Math.sin(horloge * .012 + i) * W * .03, l = W * (.05 + (i % 2) * .04);
        var g = ctx.createLinearGradient(dec - l, 0, dec + l, 0);
        g.addColorStop(0, 'rgba(255,214,150,0)'); g.addColorStop(.5, 'rgba(255,214,150,' + .32 * s + ')'); g.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.fillStyle = g; ctx.fillRect(dec - l, 0, l * 2, W * 1.6);
      }
      ctx.restore();
    }
  }

  /* ---------- rendu ---------- */
  function dessine() {
    if (!W) return;
    var lx = lum.cx * W, ly = lum.cy * W, g;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(sain, 0, 0);
    if (etat.pollution > .005) { ctx.globalAlpha = etat.pollution; ctx.drawImage(pollu, 0, 0); }
    if (etat.soleil > .005) { ctx.globalAlpha = etat.soleil; ctx.drawImage(uv, 0, 0); }
    if (etat.temps > .005) { ctx.globalAlpha = etat.temps; ctx.drawImage(age, 0, 0); }
    ctx.globalAlpha = 1;
    // lumière diffuse sur la peau abîmée
    g = ctx.createRadialGradient(lx, ly, 0, lx, ly, W * .45);
    g.addColorStop(0, 'rgba(255,236,220,.1)'); g.addColorStop(1, 'rgba(255,236,220,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
    effets();

    if (etat.soin > .005) {
      // peau réparée + reflet qui suit la lumière, découpée par le masque
      tctx.globalCompositeOperation = 'source-over';
      tctx.clearRect(0, 0, W, W);
      tctx.drawImage(lisse, 0, 0);
      tctx.globalCompositeOperation = 'lighter';
      g = tctx.createRadialGradient(lx, ly, 0, lx, ly, W * .3);
      g.addColorStop(0, 'rgba(255,236,224,.22)'); g.addColorStop(.5, 'rgba(255,230,215,.07)'); g.addColorStop(1, 'rgba(255,230,215,0)');
      tctx.fillStyle = g; tctx.fillRect(0, 0, W, W);
      g = tctx.createRadialGradient(lx, ly, 0, lx, ly, W * .06);
      g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      tctx.fillStyle = g; tctx.fillRect(0, 0, W, W);
      tctx.globalCompositeOperation = 'destination-in';
      tctx.drawImage(masque, 0, 0, W, W);
      ctx.globalAlpha = etat.soin;
      ctx.drawImage(tmp, 0, 0);

      // la crème, blanche et onctueuse, avant de pénétrer
      if (!calme) {
        // épaisseur : une ombre douce sous la crème
        tctx.globalCompositeOperation = 'source-over';
        tctx.clearRect(0, 0, W, W);
        tctx.fillStyle = 'rgba(120,80,60,.5)'; tctx.fillRect(0, 0, W, W);
        tctx.globalCompositeOperation = 'destination-in';
        tctx.drawImage(creme, W * .008, W * .012, W, W);
        ctx.globalAlpha = etat.soin * .5;
        ctx.drawImage(tmp, 0, 0);
        tctx.globalCompositeOperation = 'source-over';
        tctx.clearRect(0, 0, W, W);
        g = tctx.createLinearGradient(0, 0, W, W);
        g.addColorStop(0, '#fffefb'); g.addColorStop(.6, '#f7f1ec'); g.addColorStop(1, '#e9ded6');
        tctx.fillStyle = g; tctx.fillRect(0, 0, W, W);
        g = tctx.createRadialGradient(lx, ly, 0, lx, ly, W * .2);
        g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        tctx.fillStyle = g; tctx.fillRect(0, 0, W, W);
        tctx.globalCompositeOperation = 'destination-in';
        tctx.drawImage(creme, 0, 0, W, W);
        ctx.globalAlpha = etat.soin * .92;
        ctx.drawImage(tmp, 0, 0);
      }
      ctx.globalAlpha = 1;
    }

    // volume : ombre douce sur le pourtour
    g = ctx.createRadialGradient(W * .46, W * .42, W * .3, W * .5, W * .5, W * .52);
    g.addColorStop(0, 'rgba(40,22,14,0)'); g.addColorStop(1, 'rgba(40,22,14,.42)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
    sale = false;
  }

  /* ---------- application du soin ---------- */
  function tampon(x, y) {
    var px = x * M, py = y * M, r = .09 * M, g;
    g = mctx.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.55, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    mctx.fillStyle = g; rond(mctx, px, py, r);
    if (!calme) {
      r = .07 * M;
      g = cctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.6, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      cctx.fillStyle = g; rond(cctx, px, py, r);
      derniereCreme = performance.now();
    }
  }
  function trait(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy);
    var n = Math.max(1, Math.ceil(d / .027));
    for (var i = 1; i <= n; i++) tampon(a.x + dx * i / n, a.y + dy * i / n);
    sale = true;
    mesure();
  }
  // la crème pénètre : elle s'efface petit à petit
  function absorbe() {
    var t = performance.now() - derniereCreme;
    if (t < 450 || t > 4500) return;      // la crème reste le temps du geste, puis pénètre
    cctx.globalCompositeOperation = 'destination-out';
    cctx.fillStyle = 'rgba(0,0,0,.022)';
    cctx.fillRect(0, 0, M, M);
    cctx.globalCompositeOperation = 'source-over';
    sale = true;
  }

  var derniereMesure = 0;
  function mesure(force) {
    var t = performance.now();
    if (!force && t - derniereMesure < 160) return;
    derniereMesure = t;
    var p = mctx.getImageData(0, 0, M, M).data, tot = 0, ok = 0, c = M / 2;
    for (var y = 0; y < M; y++) for (var x = 0; x < M; x++) {
      var dx = x + .5 - c, dy = y + .5 - c;
      if (dx * dx + dy * dy > c * c) continue;
      tot++;
      if (p[(y * M + x) * 4 + 3] > 120) ok++;
    }
    progres(Math.min(100, Math.round(ok / tot / .9 * 100)));
  }
  function progres(v) {
    pct = v;
    pctTxt.textContent = v;
    jauge.style.width = v + '%';
    if (v >= 82 && !fini) termine();
  }

  var anim = null;
  function anime(duree, etape, fin) {
    var t0 = performance.now();
    if (anim) cancelAnimationFrame(anim);
    (function pas(t) {
      var p = borne((t - t0) / duree);
      etape(p);
      if (p < 1) anim = requestAnimationFrame(pas);
      else { anim = null; if (fin) fin(); }
    })(t0);
  }
  function remplit() {
    var plein = function () { mctx.fillStyle = '#fff'; mctx.fillRect(0, 0, M, M); sale = true; progres(100); if (!enBoucle) dessine(); };
    if (calme) return plein();
    anime(1200, function (p) {
      var e = 1 - Math.pow(1 - p, 3), rr = M * .75 * e + 1;
      var g = mctx.createRadialGradient(M / 2, M / 2, 0, M / 2, M / 2, rr);
      g.addColorStop(0, '#fff'); g.addColorStop(.85, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)');
      mctx.fillStyle = g; mctx.fillRect(0, 0, M, M);
      // une dernière couche de crème qui s'étale en anneau
      g = cctx.createRadialGradient(M / 2, M / 2, Math.max(0, rr - 14), M / 2, M / 2, rr);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.6, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      cctx.fillStyle = g; cctx.fillRect(0, 0, M, M);
      derniereCreme = performance.now();
      sale = true;
    }, plein);
  }
  function termine() {
    fini = true;
    remplit();
    btnTout.hidden = true;
    btnReset.hidden = false;
    bravo.hidden = false;
    indice.classList.add('cache');
  }
  function recommence() {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    mctx.clearRect(0, 0, M, M);
    cctx.clearRect(0, 0, M, M);
    fini = false;
    progres(0);
    btnTout.hidden = false;
    btnReset.hidden = true;
    bravo.hidden = true;
    sale = true;
    if (!enBoucle) dessine();
  }
  var demoFaite = false;
  function demo() {
    if (calme || touche || fini || demoFaite || !etat.actif) return;
    demoFaite = true;
    var prec = { x: .26, y: .5 };
    anime(1500, function (p) {
      if (touche) return;
      var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var pt = { x: .26 + .48 * e, y: .5 + Math.sin(e * Math.PI * 2) * .09 };
      lum.x = pt.x; lum.y = pt.y - .1;
      trait(prec, pt); prec = pt;
    });
  }

  /* ---------- gestes (seulement à la dernière étape) ---------- */
  function pos(e) {
    var b = toile.getBoundingClientRect();
    return { x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height };
  }
  function premierGeste() {
    if (touche) return;
    touche = true;
    if (anim && !fini) { cancelAnimationFrame(anim); anim = null; }
    indice.classList.add('cache');
  }
  toile.addEventListener('pointerdown', function (e) {
    if (!etat.actif) return;
    premierGeste();
    peint = true; dernier = pos(e);
    try { toile.setPointerCapture(e.pointerId); } catch (_) {}
    if (!fini) { tampon(dernier.x, dernier.y); sale = true; mesure(); }
    lum.x = dernier.x; lum.y = dernier.y;
    if (!enBoucle) dessine();
  });
  toile.addEventListener('pointermove', function (e) {
    var p = pos(e);
    survol = true;
    lum.x = p.x; lum.y = p.y;
    if (etat.actif && (peint || e.pointerType === 'mouse')) {
      if (e.pointerType === 'mouse') premierGeste();
      if (dernier && !fini) trait(dernier, p);
      dernier = p;
    }
    if (!enBoucle) dessine();
  });
  function relache() { peint = false; dernier = null; }
  toile.addEventListener('pointerup', relache);
  toile.addEventListener('pointercancel', relache);
  toile.addEventListener('pointerleave', function () { survol = false; dernier = null; });
  btnTout.addEventListener('click', function () { premierGeste(); termine(); });
  btnReset.addEventListener('click', recommence);

  /* ---------- défilement : quelle étape, quels dégâts ---------- */
  function avance(e) {
    if (!e) return 0;
    var r = e.getBoundingClientRect(), vh = window.innerHeight;
    return borne((vh * .82 - r.top) / (Math.min(r.height, vh) * .55));
  }
  function majEtapes() {
    var vh = window.innerHeight;
    etat.pollution = avance(parNom.pollution);
    etat.soleil = avance(parNom.soleil);
    etat.temps = avance(parNom.temps);
    var actif = avance(parNom.soin) > .3;
    var courante = null;
    etapes.forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top < vh * .7 && r.bottom > vh * .3) courante = e;
      if (r.top < vh * .7) e.classList.add('vue');
    });
    etapes.forEach(function (e) { e.classList.toggle('en-cours', e === courante); });
    ['pollution', 'soleil', 'temps'].forEach(function (n) {
      var li = barres[n];
      if (!li) return;
      li.querySelector('b').style.width = Math.round(etat[n] * 100) + '%';
      li.classList.toggle('en-cours', etat[n] > 0 && etat[n] < 1);
    });
    if (actif !== etat.actif) {
      etat.actif = actif;
      sec.classList.toggle('actif', actif);
      if (actif) setTimeout(demo, 500);
    }
    sale = true;
    if (!enBoucle) { etat.soin = etat.actif ? 1 : 0; dessine(); }
  }

  /* ---------- boucle : seulement quand la scène est à l'écran ---------- */
  var enBoucle = false, visible = false, t0 = performance.now();
  function boucle(t) {
    if (!visible || document.hidden || calme) { enBoucle = false; return; }
    enBoucle = true;
    horloge++;
    if (!survol && !anim) {
      var a = (t - t0) / 4200;
      lum.x = .5 + Math.cos(a) * .2; lum.y = .42 + Math.sin(a) * .14;
    }
    lum.cx += (lum.x - lum.cx) * .14; lum.cy += (lum.y - lum.cy) * .14;
    etat.soin += ((etat.actif ? 1 : 0) - etat.soin) * .08;
    absorbe();
    dessine();
    requestAnimationFrame(boucle);
  }
  function relance() { if (!enBoucle && visible && !calme && !document.hidden) requestAnimationFrame(boucle); }
  if (calme) {
    var dessineDirect = dessine;
    dessine = function () { lum.cx = lum.x; lum.cy = lum.y; dessineDirect(); };
  }

  var prevu = false;
  window.addEventListener('scroll', function () {
    if (!prevu) { prevu = true; requestAnimationFrame(function () { prevu = false; majEtapes(); }); }
  }, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; relance(); }).observe(toile);
  } else visible = true;
  document.addEventListener('visibilitychange', relance);
  var attente;
  window.addEventListener('resize', function () {
    clearTimeout(attente);
    attente = setTimeout(function () { calques(); majEtapes(); dessine(); }, 150);
  });

  calques();
  majEtapes();
  dessine();
  relance();
})();
