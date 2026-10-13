/* Beauty by Léna — poussière de paillettes dorées sur tout le site.
   Elles dérivent, scintillent, s'écartent du pointeur, suivent le défilement
   et jaillissent en gerbe au clic sur les boutons (window.paillettesEclat). */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var toile = document.querySelector('.paillettes');
  if (!toile || !toile.getContext) return;
  var ctx = toile.getContext('2d');
  var finPointeur = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var COULEURS = ['233,210,166', '201,162,106', '251,245,241', '241,211,206'];
  var l = 0, h = 0, dpr = 1;
  var grains = [], gerbes = [];
  var pointeur = { x: -999, y: -999, px: -999, py: -999, t: 0 };
  var yPrec = window.scrollY;
  var actif = true;

  function hasard(a, b) { return a + Math.random() * (b - a); }
  function grain(y) {
    return {
      x: hasard(0, l), y: y === undefined ? hasard(0, h) : y,
      r: hasard(0.5, 1.7), p: hasard(0.25, 1),           // p : profondeur (vitesse, parallaxe)
      vx: hasard(-0.08, 0.08), vy: hasard(-0.18, -0.04),
      ph: hasard(0, Math.PI * 2), fr: hasard(0.012, 0.035),
      c: COULEURS[(Math.random() * COULEURS.length) | 0],
      ex: 0, ey: 0, etoile: Math.random() < 0.22
    };
  }
  function dimensionner() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    l = window.innerWidth; h = window.innerHeight;
    toile.width = l * dpr; toile.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cibleNb = Math.round(Math.min(64, (l * h) / (finPointeur ? 24000 : 30000)));
    while (grains.length < cibleNb) grains.push(grain());
    grains.length = cibleNb;
  }
  dimensionner();
  window.addEventListener('resize', dimensionner);
  document.addEventListener('visibilitychange', function () { actif = !document.hidden; if (actif) requestAnimationFrame(boucle); });

  function etoile(x, y, r, a, c) {
    ctx.strokeStyle = 'rgba(' + c + ',' + a + ')';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x - r, y); ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r); ctx.lineTo(x, y + r);
    ctx.stroke();
  }
  function point(x, y, r, a, c) {
    ctx.fillStyle = 'rgba(' + c + ',' + a + ')';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  window.paillettesEclat = function (x, y, nb) {
    nb = nb || 22;
    for (var i = 0; i < nb; i++) {
      var ang = hasard(0, Math.PI * 2), v = hasard(1.2, 4.6);
      gerbes.push({ x: x, y: y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - 1.2, r: hasard(0.8, 2.2), vie: 1, dv: hasard(0.012, 0.025), c: COULEURS[i % 2], etoile: i % 3 === 0 });
    }
  };

  if (finPointeur) {
    document.addEventListener('pointermove', function (e) {
      pointeur.x = e.clientX; pointeur.y = e.clientY;
      var dx = e.clientX - pointeur.px, dy = e.clientY - pointeur.py;
      var maintenant = performance.now();
      // une traînée de poussière d'or quand le pointeur file
      if (dx * dx + dy * dy > 900 && maintenant - pointeur.t > 40) {
        pointeur.t = maintenant;
        gerbes.push({ x: e.clientX, y: e.clientY, vx: hasard(-0.4, 0.4), vy: hasard(0.1, 0.8), r: hasard(0.6, 1.5), vie: 0.9, dv: 0.018, c: COULEURS[0], etoile: Math.random() < 0.3 });
        pointeur.px = e.clientX; pointeur.py = e.clientY;
      }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { pointeur.x = pointeur.y = -999; });
  }

  function boucle() {
    if (!actif) return;
    var y = window.scrollY, dy = y - yPrec; yPrec = y;
    ctx.clearRect(0, 0, l, h);
    for (var i = 0; i < grains.length; i++) {
      var g = grains[i];
      g.ph += g.fr;
      g.x += g.vx * g.p;
      g.y += g.vy * g.p - dy * 0.22 * g.p;
      // le pointeur écarte les paillettes
      var ddx = g.x - pointeur.x, ddy = g.y - pointeur.y, d2 = ddx * ddx + ddy * ddy;
      if (d2 < 12100) { var d = Math.sqrt(d2) || 1, f = (110 - d) / 110; g.ex += ddx / d * f * 1.4; g.ey += ddy / d * f * 1.4; }
      g.ex *= 0.9; g.ey *= 0.9;
      g.x += g.ex; g.y += g.ey;
      if (g.y < -10) { g.y = h + 10; g.x = hasard(0, l); }
      else if (g.y > h + 10) { g.y = -10; g.x = hasard(0, l); }
      if (g.x < -10) g.x = l + 10; else if (g.x > l + 10) g.x = -10;
      var s = (Math.sin(g.ph) + 1) / 2;           // scintillement
      var a = 0.12 + s * s * 0.6 * g.p;
      point(g.x, g.y, g.r * (0.7 + s * 0.4), a, g.c);
      if (g.etoile && s > 0.82) etoile(g.x, g.y, g.r * 4.5 * (s - 0.6), (s - 0.82) * 4, g.c);
    }
    for (var j = gerbes.length - 1; j >= 0; j--) {
      var e = gerbes[j];
      e.vy += 0.06; e.vx *= 0.97; e.vy *= 0.97;
      e.x += e.vx; e.y += e.vy - dy * 0.5;
      e.vie -= e.dv;
      if (e.vie <= 0) { gerbes.splice(j, 1); continue; }
      point(e.x, e.y, e.r * e.vie, e.vie, e.c);
      if (e.etoile) etoile(e.x, e.y, e.r * 4 * e.vie, e.vie * 0.9, e.c);
    }
    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);
})();
