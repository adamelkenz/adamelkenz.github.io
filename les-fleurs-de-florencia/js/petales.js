/* Pétales qui tombent sur l'accueil et s'écartent au passage de la souris (ou du doigt). */
(function () {
  var toile = document.querySelector('.petales');
  if (!toile || !toile.getContext) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx = toile.getContext('2d');
  var hero = toile.parentNode;
  var teintes = ['#f2d0cc', '#e9a9ae', '#f7e3da', '#d98d98', '#fbefe6', '#c9a46a'];
  var petales = [], L = 0, H = 0, dpr = 1, actif = true, visible = true;
  var souris = { x: -999, y: -999, vx: 0, vy: 0 };

  function hasard(a, b) { return a + Math.random() * (b - a); }
  function nouveau(haut) {
    return {
      x: hasard(0, L), y: haut ? hasard(-H * .2, -20) : hasard(0, H),
      t: hasard(7, 15),           // taille
      vx: hasard(-.2, .4), vy: hasard(.35, .9),
      a: hasard(0, Math.PI * 2), va: hasard(-.02, .02),
      f: hasard(0, Math.PI * 2), vf: hasard(.015, .045), // battement (retournement du pétale)
      c: teintes[(Math.random() * teintes.length) | 0],
      o: hasard(.55, .95)
    };
  }
  function dimensionner() {
    var r = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    L = r.width; H = r.height;
    toile.width = L * dpr; toile.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(46, Math.max(16, L * H / 26000)));
    while (petales.length < n) petales.push(nouveau(false));
    petales.length = n;
  }
  function dessinerPetale(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.scale(Math.cos(p.f) * .9 + .1, 1);
    ctx.globalAlpha = p.o;
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.moveTo(0, -p.t);
    ctx.bezierCurveTo(p.t * .9, -p.t * .6, p.t * .7, p.t * .7, 0, p.t);
    ctx.bezierCurveTo(-p.t * .7, p.t * .7, -p.t * .9, -p.t * .6, 0, -p.t);
    ctx.fill();
    // nervure
    ctx.globalAlpha = p.o * .35;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(0, -p.t * .7); ctx.lineTo(0, p.t * .8); ctx.stroke();
    ctx.restore();
  }
  var temps = 0;
  function boucle() {
    if (!actif) return;
    temps += .01;
    ctx.clearRect(0, 0, L, H);
    var vent = Math.sin(temps * .7) * .25;
    for (var i = 0; i < petales.length; i++) {
      var p = petales[i];
      var dx = p.x - souris.x, dy = p.y - souris.y, d2 = dx * dx + dy * dy;
      if (d2 < 16900) { // rayon de 130 px
        var d = Math.sqrt(d2) || 1, force = (1 - d / 130) * 1.6;
        p.vx += dx / d * force + souris.vx * .04;
        p.vy += dy / d * force + souris.vy * .04;
        p.va += (Math.random() - .5) * .02;
      }
      p.vx += (vent + .1 - p.vx) * .02;
      p.vy += (.6 - p.vy) * .02;
      p.x += p.vx + Math.sin(p.f) * .35;
      p.y += p.vy;
      p.a += p.va; p.va *= .995;
      p.f += p.vf;
      if (p.y > H + 30 || p.x < -40 || p.x > L + 40) petales[i] = nouveau(true);
      dessinerPetale(p);
    }
    souris.vx *= .9; souris.vy *= .9;
    requestAnimationFrame(boucle);
  }
  function relancer() {
    var doit = visible && !document.hidden;
    if (doit && !actif) { actif = true; requestAnimationFrame(boucle); }
    else if (!doit) actif = false;
  }

  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    if (souris.x > -999) { souris.vx = x - souris.x; souris.vy = y - souris.y; }
    souris.x = x; souris.y = y;
  });
  hero.addEventListener('pointerleave', function () { souris.x = souris.y = -999; });
  window.addEventListener('resize', dimensionner);
  document.addEventListener('visibilitychange', relancer);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; relancer(); }).observe(hero);
  }
  dimensionner();
  requestAnimationFrame(boucle);
})();
