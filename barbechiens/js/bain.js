/* Barbechiens · « À vous de shampouiner ! »
   La photo « avant » (le chien mouillé dans la baignoire) est peinte sur un canvas.
   1. on frotte : la mousse s’accumule ;  2. on passe le pulseur : la mousse et
   la photo « avant » s’effacent et révèlent la photo « après », posée dessous. */
(function () {
  'use strict';
  var cadre = document.querySelector('[data-bain]');
  if (!cadre) return;

  var PAIRES = [
    { avant: 'img/bain-avant-1.webp', apres: 'img/bain-apres-1.webp', alt: 'Après : le chien noir, blanc et feu, sec et tout gonflé, sur la table bleue' },
    { avant: 'img/bain-avant-2.webp', apres: 'img/bain-apres-2.webp', alt: 'Après : l’akita roux et crème, sec et duveteux, sur la table bleue' }
  ];
  var SEUIL_MOUSSE = .6, SEUIL_SEC = .86, GX = 16, GY = 20;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = cadre.querySelector('[data-bain-canvas]');
  var ctx = canvas.getContext('2d');
  var fx = document.createElement('canvas');
  fx.className = 'bain-fx';
  fx.setAttribute('aria-hidden', 'true');
  fx.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
  canvas.after(fx);
  var fctx = fx.getContext('2d');
  var imgApres = cadre.querySelector('[data-bain-apres]');
  var astuce = cadre.querySelector('[data-bain-astuce]');
  var finBox = cadre.querySelector('[data-bain-fin]');
  var etapes = document.querySelectorAll('[data-bain-etapes] .etape');
  var jauge = document.querySelector('[data-jauge]');
  var jaugeTxt = document.querySelector('[data-jauge-txt]');
  var jaugeLabel = document.querySelector('[data-jauge-label]');
  var btnAuto = document.querySelector('[data-bain-auto]');
  var btnReset = document.querySelector('[data-bain-reset]');
  var btnAutre = cadre.querySelector('[data-bain-autre]');

  var w = 0, h = 0, dpr = 1, paire = 0, avant = null;
  var phase = 'mousse', grille = [], couvert = 0, curseur = null, dernier = null, actif = false;
  var particules = [], auto = null, visible = false, boucle = null, pret = false;

  function charger(src) {
    return new Promise(function (ok) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = src; });
  }

  function taille() {
    var b = cadre.getBoundingClientRect();
    var bord = parseFloat(getComputedStyle(cadre).borderLeftWidth) || 0;
    w = b.width - bord * 2; h = b.height - bord * 2;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    [canvas, fx].forEach(function (c) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function etape(nom) {
    var ordre = ['mousse', 'pulseur', 'fin'], idx = ordre.indexOf(nom);
    etapes.forEach(function (li, i) {
      if (i === idx) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      li.classList.toggle('fait', i < idx || nom === 'fin');
    });
    jaugeLabel.textContent = nom === 'mousse' ? 'Mousse' : nom === 'pulseur' ? 'Séchage' : 'Terminé';
  }
  function majJauge(v) {
    jauge.style.setProperty('--j', v.toFixed(3));
    jaugeTxt.textContent = Math.round(v * 100) + ' %';
  }

  function reinit() {
    arreterAuto();
    phase = 'mousse';
    grille = new Array(GX * GY).fill(0);
    couvert = 0;
    particules = [];
    canvas.style.transition = 'none';
    canvas.style.opacity = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    if (avant) ctx.drawImage(avant, 0, 0, w, h);
    finBox.hidden = true;
    astuce.textContent = 'Frottez !';
    astuce.classList.remove('cache');
    etape('mousse');
    majJauge(0);
    btnAuto.disabled = false;
  }

  /* ---------- Pinceaux ---------- */
  function marquer(x, y, r, val) {
    var n = 0;
    for (var gy = 0; gy < GY; gy++) {
      for (var gx = 0; gx < GX; gx++) {
        var cx = (gx + .5) * w / GX, cy = (gy + .5) * h / GY, k = gy * GX + gx;
        if (grille[k] !== val && Math.hypot(cx - x, cy - y) < r) { grille[k] = val; n++; }
      }
    }
    if (n) {
      couvert = grille.filter(function (v) { return v === val; }).length / grille.length;
    }
  }
  function bulle(c, x, y, r, a) {
    c.globalAlpha = a;
    var g = c.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(.6, '#fff4f8'); g.addColorStop(.9, '#fbd3e2'); g.addColorStop(1, '#f2a9c5');
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
    c.fillStyle = 'rgba(255,255,255,.9)';
    c.beginPath(); c.ellipse(x - r * .38, y - r * .42, r * .2, r * .12, -.6, 0, 6.2832); c.fill();
    c.globalAlpha = 1;
  }
  function frotter(x, y) {
    var R;
    if (phase === 'mousse') {
      R = w * .075;
      for (var i = 0; i < 3; i++) {
        bulle(ctx, x + (Math.random() - .5) * R * 1.3, y + (Math.random() - .5) * R * 1.3, R * (.28 + Math.random() * .42), .96);
      }
      if (Math.random() < .35) {
        var g = ctx.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,240,246,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.2832); ctx.fill();
      }
      marquer(x, y, R * .95, 1);
      if (Math.random() < .3) particules.push({ t: 'b', x: x, y: y, vx: (Math.random() - .5) * .8, vy: -.6 - Math.random() * 1.2, r: 3 + Math.random() * 7, v: 1 });
      majJauge(Math.min(1, couvert / SEUIL_MOUSSE));
      if (couvert >= SEUIL_MOUSSE) passerAuPulseur();
    } else if (phase === 'pulseur') {
      R = w * .12;
      ctx.globalCompositeOperation = 'destination-out';
      var e = ctx.createRadialGradient(x, y, 0, x, y, R);
      e.addColorStop(0, 'rgba(0,0,0,1)'); e.addColorStop(.55, 'rgba(0,0,0,.9)'); e.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = e; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.2832); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      marquer(x, y, R * .72, 2);
      var dx = dernier ? x - dernier.x : 1, dy = dernier ? y - dernier.y : 0, l = Math.hypot(dx, dy) || 1;
      for (var j = 0; j < 2; j++) {
        particules.push({ t: Math.random() < .5 ? 'f' : 'b', x: x + (Math.random() - .5) * R, y: y + (Math.random() - .5) * R, vx: dx / l * (2 + Math.random() * 3) + (Math.random() - .5) * 2, vy: dy / l * (2 + Math.random() * 3) - Math.random() * 1.5, r: 2 + Math.random() * 5, v: 1 });
      }
      majJauge(Math.min(1, couvert / SEUIL_SEC));
      if (couvert >= SEUIL_SEC) terminer();
    }
  }
  function trait(x, y) {
    if (dernier) {
      var d = Math.hypot(x - dernier.x, y - dernier.y), pas = Math.max(1, Math.ceil(d / 10));
      for (var i = 1; i <= pas; i++) frotter(dernier.x + (x - dernier.x) * i / pas, dernier.y + (y - dernier.y) * i / pas);
    } else frotter(x, y);
    dernier = { x: x, y: y };
  }

  function passerAuPulseur() {
    phase = 'pulseur';
    grille = grille.map(function () { return 0; });
    couvert = 0;
    etape('pulseur');
    majJauge(0);
    astuce.textContent = 'Au pulseur !';
    astuce.classList.remove('cache');
    setTimeout(function () { if (phase === 'pulseur') astuce.classList.add('cache'); }, 1400);
  }
  function terminer() {
    if (phase === 'fin') return;
    phase = 'fin';
    arreterAuto();
    etape('fin');
    majJauge(1);
    canvas.style.transition = reduit ? 'none' : 'opacity .6s ease';
    canvas.style.opacity = 0;
    for (var i = 0; i < 26; i++) particules.push({ t: 'b', x: Math.random() * w, y: h * (.5 + Math.random() * .5), vx: (Math.random() - .5) * 1.5, vy: -1 - Math.random() * 2.5, r: 4 + Math.random() * 10, v: 1 });
    setTimeout(function () { finBox.hidden = false; }, reduit ? 0 : 650);
    btnAuto.disabled = true;
  }

  /* ---------- Effets et curseur ---------- */
  function dessinerCurseur() {
    if (!curseur || phase === 'fin') return;
    var x = curseur.x, y = curseur.y;
    fctx.save();
    if (phase === 'mousse') {
      // une éponge rose
      fctx.translate(x, y); fctx.rotate(-.25);
      fctx.fillStyle = '#ef5488'; fctx.strokeStyle = '#8f0f3e'; fctx.lineWidth = 2.5;
      fctx.beginPath(); fctx.roundRect ? fctx.roundRect(-22, -15, 44, 30, 9) : fctx.rect(-22, -15, 44, 30); fctx.fill(); fctx.stroke();
      fctx.fillStyle = 'rgba(255,255,255,.55)';
      [[-12, -5, 3], [2, -7, 2.4], [12, 2, 3.2], [-4, 6, 2.2], [-15, 7, 1.8]].forEach(function (t) { fctx.beginPath(); fctx.arc(t[0], t[1], t[2], 0, 6.2832); fctx.fill(); });
    } else {
      // l’embout du pulseur
      var a = dernier ? Math.atan2(y - dernier.y, x - dernier.x) : 0;
      fctx.translate(x, y); fctx.rotate(a + Math.PI);
      fctx.fillStyle = '#0d3a68'; fctx.strokeStyle = '#072a4e'; fctx.lineWidth = 2;
      fctx.beginPath(); fctx.moveTo(12, -11); fctx.lineTo(54, -9); fctx.lineTo(54, 9); fctx.lineTo(12, 11); fctx.closePath(); fctx.fill(); fctx.stroke();
      fctx.fillStyle = '#ef5488'; fctx.fillRect(4, -12, 10, 24);
      fctx.strokeStyle = 'rgba(255,255,255,.85)'; fctx.lineWidth = 2.4; fctx.lineCap = 'round';
      var o = (performance.now() / 60) % 10;
      for (var i = -1; i <= 1; i++) { fctx.beginPath(); fctx.moveTo(-4 - o, i * 7); fctx.lineTo(-16 - o, i * 9); fctx.stroke(); }
    }
    fctx.restore();
  }
  function animer() {
    fctx.clearRect(0, 0, w, h);
    particules = particules.filter(function (p) { return p.v > 0; });
    particules.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy += p.t === 'f' ? .05 : -.01; p.v -= .018;
      if (p.t === 'f') { fctx.globalAlpha = Math.max(0, p.v); fctx.fillStyle = '#fff'; fctx.beginPath(); fctx.arc(p.x, p.y, p.r * .7, 0, 6.2832); fctx.fill(); fctx.globalAlpha = 1; }
      else {
        fctx.globalAlpha = Math.max(0, p.v);
        fctx.strokeStyle = 'rgba(255,255,255,.95)'; fctx.lineWidth = 1.5;
        fctx.fillStyle = 'rgba(249, 205, 221, .35)';
        fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, 6.2832); fctx.fill(); fctx.stroke();
        fctx.globalAlpha = 1;
      }
    });
    if (auto) auto();
    dessinerCurseur();
    boucle = visible ? requestAnimationFrame(animer) : null;
  }
  function demarrerBoucle() { if (!boucle && visible) boucle = requestAnimationFrame(animer); }

  /* ---------- Pointeur ---------- */
  function pos(e) { var b = canvas.getBoundingClientRect(); return { x: (e.clientX - b.left) * w / b.width, y: (e.clientY - b.top) * h / b.height }; }
  canvas.addEventListener('pointerdown', function (e) {
    if (!pret || phase === 'fin') return;
    arreterAuto();
    actif = true;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    var p = pos(e);
    curseur = p; dernier = null; trait(p.x, p.y);
    astuce.classList.add('cache');
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!pret) return;
    var p = pos(e);
    curseur = p;
    if (phase === 'fin' || auto) return;
    if (actif || e.pointerType === 'mouse') {
      if (!actif && !dernier) dernier = p;
      trait(p.x, p.y);
      astuce.classList.add('cache');
    }
  });
  function lacher() { actif = false; dernier = null; }
  canvas.addEventListener('pointerup', lacher);
  canvas.addEventListener('pointercancel', lacher);
  canvas.addEventListener('pointerleave', function () { if (!actif) { curseur = null; dernier = null; } });

  /* ---------- Mode automatique ---------- */
  function arreterAuto() { auto = null; if (phase !== 'fin') btnAuto.disabled = false; }
  btnAuto.addEventListener('click', function () {
    if (!pret || phase === 'fin') return;
    astuce.classList.add('cache');
    var rangs = [], y, sens = 1;
    for (y = .07; y <= .95; y += .085) { rangs.push([sens > 0 ? .04 : .96, y], [sens > 0 ? .96 : .04, y]); sens = -sens; }
    var i = 0, t = 0, vitesse = reduit ? 1 : .055;
    dernier = null;
    btnAuto.disabled = true;
    auto = function () {
      for (var n = 0; n < (reduit ? 40 : 1); n++) {
        if (phase === 'fin') { auto = null; return; }
        var a = rangs[i], b = rangs[(i + 1) % rangs.length];
        t += vitesse;
        if (t >= 1) { t = 0; i = (i + 1) % (rangs.length - 1); dernier = null; continue; }
        var x = (a[0] + (b[0] - a[0]) * t) * w, yy = (a[1] + (b[1] - a[1]) * t) * h;
        curseur = { x: x, y: yy };
        trait(x, yy);
      }
    };
    demarrerBoucle();
  });
  btnReset.addEventListener('click', reinit);

  function chargerPaire(n) {
    pret = false;
    paire = n;
    var p = PAIRES[n];
    imgApres.src = p.apres; imgApres.alt = p.alt;
    return charger(p.avant).then(function (im) { avant = im; pret = true; reinit(); });
  }
  btnAutre.addEventListener('click', function () { chargerPaire((paire + 1) % PAIRES.length); });

  /* ---------- Démarrage paresseux ---------- */
  var lance = false;
  function lancer() {
    if (lance) return;
    lance = true;
    taille();
    chargerPaire(0);
    var largeur = w;
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        var b = cadre.getBoundingClientRect();
        if (Math.abs(b.width - largeur) > 2) { largeur = b.width; taille(); if (pret) reinit(); }
      }).observe(cadre);
    }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (visible) { lancer(); demarrerBoucle(); }
    }, { rootMargin: '300px 0px' }).observe(cadre);
  } else { visible = true; lancer(); demarrerBoucle(); }
})();
