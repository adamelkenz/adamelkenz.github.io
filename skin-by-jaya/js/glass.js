/* Skin By Jaya — « Glass Skin » : une peau mate et irrégulière qui devient lisse et lumineuse
   là où l'on passe la souris ou le doigt. Trois calques : la peau mate, la peau « glass »
   (avec son reflet qui suit la lumière) et un masque basse définition qui garde la trace du geste. */
(function () {
  var fig = document.querySelector('[data-glass]');
  if (!fig) return;
  var toile = fig.querySelector('canvas');
  var ctx = toile.getContext && toile.getContext('2d');
  if (!ctx) return;

  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var indice = fig.querySelector('[data-glass-indice]');
  var jauge = fig.querySelector('[data-glass-jauge]');
  var pctTxt = fig.querySelector('[data-glass-pct]');
  var btnTout = fig.querySelector('[data-glass-tout]');
  var btnReset = fig.querySelector('[data-glass-reset]');
  var bravo = fig.querySelector('[data-glass-bravo]');

  var M = 128;                       // côté du masque (px)
  var masque = document.createElement('canvas');
  masque.width = masque.height = M;
  var mctx = masque.getContext('2d');
  var mate = document.createElement('canvas'), mctxMate = mate.getContext('2d');
  var lisse = document.createElement('canvas'), lctx = lisse.getContext('2d');
  var tmp = document.createElement('canvas'), tctx = tmp.getContext('2d');

  var W = 0;                         // côté du canvas en pixels réels
  var lum = { x: .36, y: .32, cx: .36, cy: .32 };   // position de la lumière (cible et courante), 0..1
  var survol = false, peint = false, dernier = null;
  var pct = 0, fini = false, touche = false, visible = false, sale = true;

  // petit générateur pseudo-aléatoire : la même peau à chaque visite
  function hasard(graine) {
    return function () { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; };
  }

  function calques() {
    var cote = toile.getBoundingClientRect().width;
    if (!cote) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(cote * dpr);
    if (w === W) return;
    W = w;
    [toile, mate, lisse, tmp].forEach(function (c) { c.width = c.height = W; });
    var r = hasard(20171), k = W / 500, i, g, x, y, t;

    // --- peau mate : teint terne, pores, petites taches, grain ---
    g = mctxMate.createRadialGradient(W * .42, W * .38, W * .05, W * .5, W * .5, W * .72);
    g.addColorStop(0, '#d6ae98'); g.addColorStop(.6, '#c89c86'); g.addColorStop(1, '#b28571');
    mctxMate.fillStyle = g; mctxMate.fillRect(0, 0, W, W);
    for (i = 0; i < 7; i++) {        // rougeurs diffuses
      x = r() * W; y = r() * W; t = (60 + r() * 90) * k;
      g = mctxMate.createRadialGradient(x, y, 0, x, y, t);
      g.addColorStop(0, 'rgba(190,105,95,.16)'); g.addColorStop(1, 'rgba(190,105,95,0)');
      mctxMate.fillStyle = g; mctxMate.fillRect(x - t, y - t, t * 2, t * 2);
    }
    for (i = 0; i < 26; i++) {       // taches pigmentaires
      x = r() * W; y = r() * W; t = (4 + r() * 16) * k;
      g = mctxMate.createRadialGradient(x, y, 0, x, y, t);
      g.addColorStop(0, 'rgba(125,75,52,.34)'); g.addColorStop(.6, 'rgba(125,75,52,.16)'); g.addColorStop(1, 'rgba(125,75,52,0)');
      mctxMate.fillStyle = g; mctxMate.beginPath(); mctxMate.arc(x, y, t, 0, 7); mctxMate.fill();
    }
    mctxMate.fillStyle = 'rgba(110,64,46,.22)';
    for (i = 0; i < 2600; i++) {     // pores
      x = r() * W; y = r() * W;
      mctxMate.beginPath(); mctxMate.arc(x, y, (.5 + r() * 1.1) * k, 0, 7); mctxMate.fill();
    }
    grain(mctxMate, 26, r);
    mctxMate.fillStyle = 'rgba(140,125,118,.14)';   // voile terne
    mctxMate.fillRect(0, 0, W, W);

    // --- peau « glass » : rosée, unifiée, rebondie ---
    g = lctx.createRadialGradient(W * .4, W * .34, W * .02, W * .5, W * .52, W * .7);
    g.addColorStop(0, '#f8e0d2'); g.addColorStop(.45, '#edc8b5'); g.addColorStop(1, '#d8a58d');
    lctx.fillStyle = g; lctx.fillRect(0, 0, W, W);
    g = lctx.createRadialGradient(W * .3, W * .26, 0, W * .3, W * .26, W * .34);
    g.addColorStop(0, 'rgba(255,255,255,.32)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    lctx.fillStyle = g; lctx.fillRect(0, 0, W, W);
    g = lctx.createLinearGradient(0, W, W, 0);       // reflet nacré en biais
    g.addColorStop(.35, 'rgba(255,240,230,0)'); g.addColorStop(.5, 'rgba(255,244,236,.28)'); g.addColorStop(.65, 'rgba(255,240,230,0)');
    lctx.fillStyle = g; lctx.fillRect(0, 0, W, W);
    grain(lctx, 7, r);
    sale = true;
  }

  // grain fin, opaque à « force » sur 255
  function grain(c, force, r) {
    var d = c.getImageData(0, 0, W, W), p = d.data;
    for (var i = 0; i < p.length; i += 4) {
      var v = (r() - .5) * force;
      p[i] += v; p[i + 1] += v; p[i + 2] += v;
    }
    c.putImageData(d, 0, 0);
  }

  function dessine() {
    if (!W) return;
    var lx = lum.cx * W, ly = lum.cy * W, g;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(mate, 0, 0);
    // sur la peau mate, la lumière se diffuse sans briller
    g = ctx.createRadialGradient(lx, ly, 0, lx, ly, W * .45);
    g.addColorStop(0, 'rgba(255,240,230,.12)'); g.addColorStop(1, 'rgba(255,240,230,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);

    // peau lisse + reflet spéculaire, découpée par le masque
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
    tctx.imageSmoothingEnabled = true;
    tctx.drawImage(masque, 0, 0, W, W);
    ctx.drawImage(tmp, 0, 0);

    // volume : ombre douce sur le pourtour
    g = ctx.createRadialGradient(W * .46, W * .42, W * .3, W * .5, W * .5, W * .52);
    g.addColorStop(0, 'rgba(90,50,35,0)'); g.addColorStop(1, 'rgba(90,50,35,.3)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
    sale = false;
  }

  // --- masque : on « lisse » le long du geste ---
  function tampon(x, y, rayon) {
    var px = x * M, py = y * M, r = rayon * M;
    var g = mctx.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.55, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    mctx.fillStyle = g;
    mctx.beginPath(); mctx.arc(px, py, r, 0, 7); mctx.fill();
  }
  function trait(a, b) {
    var R = .09, dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy);
    var n = Math.max(1, Math.ceil(d / (R * .3)));
    for (var i = 1; i <= n; i++) tampon(a.x + dx * i / n, a.y + dy * i / n, R);
    sale = true;
    mesure();
  }

  // part de la surface lissée (on lit le masque au plus 6 fois par seconde)
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
    afficheProgres(Math.min(100, Math.round(ok / tot / .9 * 100)));
  }
  function afficheProgres(v) {
    pct = v;
    pctTxt.textContent = v;
    jauge.style.width = v + '%';
    if (v >= 82 && !fini) termine();
  }

  // --- animations : remplissage complet, démonstration ---
  var anim = null;
  function anime(duree, etape, fin) {
    var t0 = performance.now();
    if (anim) cancelAnimationFrame(anim);
    (function pas(t) {
      var p = Math.max(0, Math.min(1, (t - t0) / duree));
      etape(p);
      if (p < 1) anim = requestAnimationFrame(pas);
      else { anim = null; if (fin) fin(); }
    })(t0);
  }
  function remplit(doux) {
    if (calme || !doux) {
      mctx.fillStyle = '#fff'; mctx.fillRect(0, 0, M, M);
      sale = true; afficheProgres(100); if (!enBoucle) dessine();
      return;
    }
    anime(1100, function (p) {
      var e = 1 - Math.pow(1 - p, 3);
      var g = mctx.createRadialGradient(M / 2, M / 2, 0, M / 2, M / 2, M * .75 * e + 1);
      g.addColorStop(0, '#fff'); g.addColorStop(.85, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)');
      mctx.fillStyle = g; mctx.fillRect(0, 0, M, M);
      sale = true;
      mesure(p === 1);
    }, function () { mctx.fillStyle = '#fff'; mctx.fillRect(0, 0, M, M); sale = true; afficheProgres(100); });
  }
  function termine() {
    fini = true;
    remplit(true);
    btnTout.hidden = true;
    btnReset.hidden = false;
    bravo.hidden = false;
    indice.classList.add('cache');
  }
  function recommence() {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    mctx.clearRect(0, 0, M, M);
    fini = false;
    afficheProgres(0);
    btnTout.hidden = false;
    btnReset.hidden = true;
    bravo.hidden = true;
    sale = true;
    if (!enBoucle) dessine();
  }
  function demo() {
    if (calme || touche || fini) return;
    var prec = { x: .2, y: .58 };
    anime(1600, function (p) {
      if (touche) return;
      var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var pt = { x: .2 + .6 * e, y: .58 + Math.sin(e * Math.PI * 2) * .1 };
      lum.x = pt.x; lum.y = pt.y - .08;
      trait(prec, pt); prec = pt;
    });
  }

  // --- gestes ---
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
    premierGeste();
    peint = true; dernier = pos(e);
    try { toile.setPointerCapture(e.pointerId); } catch (_) {}
    tampon(dernier.x, dernier.y, .09); sale = true; mesure();
    lum.x = dernier.x; lum.y = dernier.y;
    if (!enBoucle) dessine();
  });
  toile.addEventListener('pointermove', function (e) {
    var p = pos(e);
    survol = true;
    lum.x = p.x; lum.y = p.y;
    // à la souris, il suffit de survoler ; au doigt, on glisse
    if (peint || e.pointerType === 'mouse') {
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

  // --- boucle : seulement quand le cercle est à l'écran ---
  var enBoucle = false, t0 = performance.now();
  function boucle(t) {
    if (!visible || document.hidden || calme) { enBoucle = false; return; }
    enBoucle = true;
    if (!survol && !anim) {          // au repos, la lumière tourne doucement
      var a = (t - t0) / 4200;
      lum.x = .5 + Math.cos(a) * .2; lum.y = .42 + Math.sin(a) * .14;
    }
    var vx = lum.x - lum.cx, vy = lum.y - lum.cy;
    if (Math.abs(vx) + Math.abs(vy) > .0005) { lum.cx += vx * .14; lum.cy += vy * .14; sale = true; }
    if (sale) dessine();
    requestAnimationFrame(boucle);
  }
  function relance() { if (!enBoucle && visible && !calme && !document.hidden) requestAnimationFrame(boucle); }
  if (calme) {                       // pas de boucle : la lumière suit directement le geste
    var dessineDirect = dessine;
    dessine = function () { lum.cx = lum.x; lum.cy = lum.y; dessineDirect(); };
  }

  var dejaVu = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) {
        relance();
        if (!dejaVu) { dejaVu = true; setTimeout(demo, 900); }
      }
    }).observe(toile);
  } else { visible = true; }
  document.addEventListener('visibilitychange', relance);

  var attente;
  window.addEventListener('resize', function () {
    clearTimeout(attente);
    attente = setTimeout(function () { calques(); dessine(); }, 150);
  });

  calques();
  dessine();
  relance();
})();
