/* Allô P'tites Pattes — le séchoir de la vitrine prend vie sur l'accueil :
   il suit le pointeur et souffle des bulles de savon qui éclatent quand on les touche. */
(function () {
  var hero = document.querySelector('.hero');
  var zone = document.querySelector('[data-hero-visuel]');
  var sechoir = document.querySelector('[data-sechoir]');
  var canvas = document.querySelector('[data-bulles]');
  if (!hero || !zone || !sechoir || !canvas || !canvas.getContext) return;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var outils = [].slice.call(zone.querySelectorAll('.outil'));

  var dpr = 1, W = 0, H = 0, cr = null;
  function mesure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cr = canvas.getBoundingClientRect();
    W = cr.width; H = cr.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  }

  // une bulle dessinée une fois, réutilisée à toutes les tailles
  var sprite = document.createElement('canvas');
  (function () {
    var s = 96, c = sprite.getContext('2d'), r = s / 2 - 3;
    sprite.width = sprite.height = s;
    var fond = c.createRadialGradient(s / 2, s / 2, r * .2, s / 2, s / 2, r);
    fond.addColorStop(0, 'rgba(255,255,255,0.08)');
    fond.addColorStop(.7, 'rgba(228,238,242,0.3)');
    fond.addColorStop(1, 'rgba(255,255,255,0.6)');
    c.fillStyle = fond;
    c.beginPath(); c.arc(s / 2, s / 2, r, 0, Math.PI * 2); c.fill();
    var irise = c.createLinearGradient(0, 0, s, s);
    irise.addColorStop(0, 'rgba(127,200,214,0.95)');
    irise.addColorStop(.35, 'rgba(169,184,255,0.9)');
    irise.addColorStop(.65, 'rgba(255,169,203,0.9)');
    irise.addColorStop(1, 'rgba(241,214,139,0.95)');
    c.strokeStyle = irise; c.lineWidth = 4;
    c.beginPath(); c.arc(s / 2, s / 2, r, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.arc(s / 2, s / 2, r * .68, Math.PI * 1.08, Math.PI * 1.42); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.9)';
    c.beginPath(); c.arc(s * .66, s * .3, 3, 0, Math.PI * 2); c.fill();
  })();

  var bulles = [], eclats = [];
  var angle = 18, angleCible = 18;
  var pointeur = null, dernierMvt = 0, enVue = true, actif = false, tPrec = 0, reserve = 0;

  // la buse du séchoir, dans le repère du canvas : le pivot (transform-origin 32 % 44 %)
  // se calcule sur la mise en page non tournée, la buse est à 61,6 unités sur 120 devant lui
  function buse() {
    var w = sechoir.offsetWidth, h = sechoir.offsetHeight;
    var px = sechoir.offsetLeft + .32 * w - canvas.offsetLeft, py = sechoir.offsetTop + .44 * h - canvas.offsetTop;
    var a = angle * Math.PI / 180, d = w * 61.6 / 120;
    return { x: px + Math.cos(a) * d, y: py + Math.sin(a) * d, a: a, pivotX: px, pivotY: py };
  }

  function souffle(n) {
    var b = buse(), echelle = Math.max(.7, Math.min(1.25, W / 640));
    for (var i = 0; i < n; i++) {
      var dir = b.a + (Math.random() - .5) * .7, v = (70 + Math.random() * 110) * echelle;
      bulles.push({
        x: b.x, y: b.y, vx: Math.cos(dir) * v, vy: Math.sin(dir) * v,
        r: (6 + Math.random() * Math.random() * 18) * echelle, r0: 0,
        vie: 0, duree: 2.4 + Math.random() * 2.2, phase: Math.random() * 6.28
      });
    }
    if (bulles.length > 70) bulles.splice(0, bulles.length - 70);
  }
  function eclate(b) {
    eclats.push({ x: b.x, y: b.y, r: b.r, t: 0 });
  }

  function image(t) {
    if (!actif) return;
    var dt = Math.min(.05, (t - (tPrec || t)) / 1000); tPrec = t;
    // le séchoir pivote doucement vers sa cible
    angle += (angleCible - angle) * Math.min(1, dt * 7);
    sechoir.style.setProperty('--rot', angle.toFixed(2) + 'deg');
    // débit : un filet au repos, une bouffée quand on bouge
    var debit = (t - dernierMvt < 600) ? 9 : 2.6;
    reserve += debit * dt;
    while (reserve >= 1) { souffle(1); reserve -= 1; }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (var i = bulles.length - 1; i >= 0; i--) {
      var b = bulles[i];
      b.vie += dt;
      b.vx *= (1 - .55 * dt); b.vy *= (1 - .55 * dt);
      b.vy -= 16 * dt;
      b.x += (b.vx + Math.sin(b.vie * 3 + b.phase) * 10) * dt;
      b.y += b.vy * dt;
      b.r0 = Math.min(b.r, b.r0 + b.r * dt * 6);
      var touche = pointeur && Math.hypot(pointeur.x - b.x, pointeur.y - b.y) < b.r + 8;
      if (b.vie > b.duree || touche || b.x < -40 || b.x > W + 40 || b.y < -40) {
        if (b.vie > b.duree || touche) eclate(b);
        bulles.splice(i, 1); continue;
      }
      var s = b.r0 * 2 * (1 + Math.sin(b.vie * 5 + b.phase) * .04);
      ctx.globalAlpha = Math.min(1, (b.duree - b.vie) * 2);
      ctx.drawImage(sprite, b.x - s / 2, b.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    for (var k = eclats.length - 1; k >= 0; k--) {
      var e = eclats[k];
      e.t += dt;
      var p = e.t / .28;
      if (p >= 1) { eclats.splice(k, 1); continue; }
      ctx.strokeStyle = 'rgba(169,184,255,' + (1 - p) * .8 + ')';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r * (1 + p * .7), 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(127,200,214,' + (1 - p) + ')';
      for (var g = 0; g < 5; g++) {
        var ga = g * 1.256 + .3, gd = e.r * (1 + p * 1.4);
        ctx.beginPath(); ctx.arc(e.x + Math.cos(ga) * gd, e.y + Math.sin(ga) * gd, 1.6 * (1 - p) + .4, 0, Math.PI * 2); ctx.fill();
      }
    }
    requestAnimationFrame(image);
  }
  function demarre() {
    if (actif || calme || !enVue || document.hidden) return;
    actif = true; tPrec = 0;
    requestAnimationFrame(image);
  }
  function arrete() { actif = false; }

  // le séchoir vise le pointeur, les outils suivent en parallaxe
  hero.addEventListener('pointermove', function (e) {
    if (!cr) return;
    cr = canvas.getBoundingClientRect();
    pointeur = { x: e.clientX - cr.left, y: e.clientY - cr.top };
    dernierMvt = performance.now();
    var b = buse();
    var a = Math.atan2(pointeur.y - b.pivotY, pointeur.x - b.pivotX) * 180 / Math.PI;
    angleCible = Math.max(-38, Math.min(62, a));
    var zr = zone.getBoundingClientRect();
    var nx = (e.clientX - (zr.left + zr.width / 2)) / zr.width, ny = (e.clientY - (zr.top + zr.height / 2)) / zr.height;
    outils.forEach(function (o) {
      var p = +o.getAttribute('data-profondeur') || 1;
      o.style.setProperty('--px', (nx * p * 16).toFixed(1));
      o.style.setProperty('--py', (ny * p * 16).toFixed(1));
    });
  });
  hero.addEventListener('pointerleave', function () { pointeur = null; angleCible = 18; });
  hero.addEventListener('pointerdown', function (e) {
    if (calme || !cr) return;
    cr = canvas.getBoundingClientRect();
    pointeur = { x: e.clientX - cr.left, y: e.clientY - cr.top };
    if (e.pointerType !== 'mouse') {
      var b = buse();
      angleCible = Math.max(-38, Math.min(62, Math.atan2(pointeur.y - b.pivotY, pointeur.x - b.pivotX) * 180 / Math.PI));
      dernierMvt = performance.now();
      souffle(6);
      setTimeout(function () { pointeur = null; }, 200);
    }
  });
  sechoir.style.pointerEvents = 'auto';
  sechoir.style.cursor = 'pointer';
  sechoir.addEventListener('click', function () { if (!calme) souffle(16); });

  mesure();
  if ('ResizeObserver' in window) new ResizeObserver(function () { mesure(); }).observe(canvas);
  else window.addEventListener('resize', mesure);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { enVue = es[0].isIntersecting; if (enVue) demarre(); else arrete(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) arrete(); else demarre(); });
  demarre();
})();
