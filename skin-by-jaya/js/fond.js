/* Skin By Jaya — fond de l'accueil : des vagues de sérum soyeuses qui ondulent,
   et des bulles et gouttes dorées qui flottent en profondeur (elles suivent un peu la souris). */
(function () {
  var toile = document.querySelector('[data-fond]');
  if (!toile || !toile.getContext) return;
  var ctx = toile.getContext('2d');
  var hero = toile.parentNode;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var w = 0, h = 0, dpr = 1, visible = true, enBoucle = false;
  var souris = { x: .5, y: .5, cx: .5, cy: .5 };

  // les vagues : hauteur de base (part de l'écran), amplitudes, fréquences, vitesses, épaisseur, intensité
  var VAGUES = [
    { y: .58, a1: 46, f1: .0021, s1: .16, a2: 18, f2: .0063, s2: .27, ep: 120, al: .2, ph: 0 },
    { y: .66, a1: 60, f1: .0016, s1: -.12, a2: 22, f2: .0049, s2: .21, ep: 90, al: .16, ph: 1.7 },
    { y: .74, a1: 38, f1: .0026, s1: .2, a2: 14, f2: .0071, s2: -.3, ep: 150, al: .14, ph: 3.1 },
    { y: .82, a1: 52, f1: .0019, s1: -.17, a2: 20, f2: .0055, s2: .24, ep: 110, al: .18, ph: 4.4 },
    { y: .5, a1: 70, f1: .0012, s1: .09, a2: 26, f2: .004, s2: -.15, ep: 60, al: .08, ph: 5.6 }
  ];

  // petit générateur pseudo-aléatoire
  var graine = 731;
  function hasard() { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; }

  var bulles = [];
  function creeBulles() {
    graine = 731;
    bulles = [];
    var n = w < 700 ? 16 : 30;
    for (var i = 0; i < n; i++) {
      var z = .25 + hasard() * .75;
      bulles.push({
        x: hasard(), y: hasard(), z: z,
        r: (w < 700 ? 5 : 7) + z * z * (w < 700 ? 30 : 46) * (.5 + hasard() * .7),
        goutte: hasard() < .32,
        v: .006 + hasard() * .012,
        ph: hasard() * 6.28
      });
    }
    bulles.sort(function (a, b) { return a.z - b.z; });
  }

  function taille() {
    var b = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = b.width; h = b.height;
    toile.width = Math.round(w * dpr); toile.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    creeBulles();
  }

  function vague(v, t) {
    var pas = 14, x, y, ys = [], base = v.y * h;
    var dx = (souris.cx - .5) * 30;
    for (x = -pas; x <= w + pas; x += pas) {
      y = base + Math.sin(x * v.f1 + t * v.s1 + v.ph) * v.a1 + Math.sin(x * v.f2 - t * v.s2 + v.ph * 2) * v.a2 + (souris.cy - .5) * 20;
      ys.push([x + dx, y]);
    }
    // ruban : bord haut, puis bord bas (épaisseur qui respire)
    ctx.beginPath();
    ys.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
    for (var i = ys.length - 1; i >= 0; i--) {
      var e = v.ep * (.55 + .45 * Math.sin(ys[i][0] * .003 + t * .35 + v.ph));
      ctx.lineTo(ys[i][0], ys[i][1] + e);
    }
    ctx.closePath();
    var g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(224,176,122,0)');
    g.addColorStop(.3, 'rgba(224,176,122,' + v.al + ')');
    g.addColorStop(.62, 'rgba(242,200,147,' + v.al * 1.3 + ')');
    g.addColorStop(1, 'rgba(217,160,143,' + v.al * .4 + ')');
    ctx.fillStyle = g;
    ctx.fill();
    // le liseré lumineux du dessus, comme un reflet sur un liquide
    ctx.beginPath();
    ys.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
    var l = ctx.createLinearGradient(0, 0, w, 0);
    l.addColorStop(0, 'rgba(255,226,186,0)');
    l.addColorStop(.5, 'rgba(255,226,186,' + v.al * 2.2 + ')');
    l.addColorStop(1, 'rgba(255,226,186,0)');
    ctx.strokeStyle = l; ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  function bulle(b, t) {
    var defile = window.scrollY || 0;
    var y = ((b.y - t * b.v * b.z) % 1 + 1) % 1;              // elles montent doucement
    var x = b.x * w + Math.sin(t * .4 + b.ph) * 14 * b.z - (souris.cx - .5) * 70 * b.z;
    var py = (y * 1.2 - .1) * h - (souris.cy - .5) * 40 * b.z - defile * b.z * .35;
    var r = b.r, a = .35 + b.z * .65;
    // plus discrètes derrière le texte d'accueil (à gauche sur grand écran)
    if (w > 900) a *= .12 + .88 * Math.min(1, Math.max(0, (x / w - .1) / .5));
    if (py < -r * 2 || py > h + r * 2) return;
    var g;
    if (b.goutte) {
      // goutte de sérum dorée
      g = ctx.createRadialGradient(x - r * .35, py - r * .35, r * .05, x, py, r);
      g.addColorStop(0, 'rgba(255,240,214,' + a + ')');
      g.addColorStop(.35, 'rgba(236,190,128,' + a * .9 + ')');
      g.addColorStop(1, 'rgba(150,96,44,' + a * .75 + ')');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, py, r, 0, 6.283); ctx.fill();
      g = ctx.createRadialGradient(x, py, r * .8, x, py, r * 2.2);
      g.addColorStop(0, 'rgba(224,176,122,' + a * .25 + ')'); g.addColorStop(1, 'rgba(224,176,122,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, py, r * 2.2, 0, 6.283); ctx.fill();
    } else {
      // bulle transparente : corps très léger, bord lumineux
      g = ctx.createRadialGradient(x, py, r * .2, x, py, r);
      g.addColorStop(0, 'rgba(255,230,200,' + a * .02 + ')');
      g.addColorStop(.8, 'rgba(255,226,190,' + a * .08 + ')');
      g.addColorStop(1, 'rgba(255,226,190,' + a * .22 + ')');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, py, r, 0, 6.283); ctx.fill();
      ctx.strokeStyle = 'rgba(255,226,190,' + a * .3 + ')'; ctx.lineWidth = 1;
      ctx.stroke();
    }
    // reflet
    g = ctx.createRadialGradient(x - r * .4, py - r * .45, 0, x - r * .4, py - r * .45, r * .38);
    g.addColorStop(0, 'rgba(255,255,255,' + a * .8 + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x - r * .4, py - r * .45, r * .38, 0, 6.283); ctx.fill();
  }

  function dessine(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    VAGUES.forEach(function (v) { vague(v, t); });
    ctx.globalCompositeOperation = 'source-over';
    bulles.forEach(function (b) { bulle(b, t); });
  }

  var debut = performance.now();
  function boucle(now) {
    if (!visible || document.hidden) { enBoucle = false; return; }
    enBoucle = true;
    souris.cx += (souris.x - souris.cx) * .05;
    souris.cy += (souris.y - souris.cy) * .05;
    dessine((now - debut) / 1000);
    requestAnimationFrame(boucle);
  }
  function relance() { if (!calme && !enBoucle && visible && !document.hidden) requestAnimationFrame(boucle); }

  if (!calme) {
    window.addEventListener('pointermove', function (e) {
      souris.x = e.clientX / window.innerWidth; souris.y = e.clientY / window.innerHeight;
    }, { passive: true });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; relance(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', relance);
  var attente;
  window.addEventListener('resize', function () {
    clearTimeout(attente);
    attente = setTimeout(function () { taille(); if (calme) dessine(8); }, 150);
  });

  taille();
  dessine(8);
  relance();
})();
