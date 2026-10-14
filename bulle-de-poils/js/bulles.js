/* Bulle de poils — la mousse de l'accueil : des bulles de savon qui montent, et qui éclatent quand on les touche. */
(function () {
  var canvas = document.querySelector('[data-mousse]');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var hero = canvas.parentNode;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, bulles = [], gouttes = [], visible = true, enMarche = false, dernier = 0;
  var souris = { x: -999, y: -999 };

  function hasard(a, b) { return a + Math.random() * (b - a); }
  function nouvelle(enBas) {
    var r = hasard(9, W < 700 ? 30 : 44);
    return {
      x: hasard(r, W - r), y: enBas ? H + r + hasard(0, H * .4) : hasard(r, H - r), r: r,
      v: hasard(12, 26) * (30 / (r + 10)) + 6, // les petites montent plus vite
      ph: hasard(0, Math.PI * 2), amp: hasard(8, 22), teinte: hasard(0, 360), dx: 0
    };
  }
  function taille() {
    var r = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var nb = calme ? 7 : Math.round(Math.min(22, Math.max(9, W * H / 52000)));
    while (bulles.length < nb) bulles.push(nouvelle(false));
    bulles.length = nb;
    if (calme) dessine(0);
  }

  function dessineBulle(b) {
    var x = b.x + b.dx, y = b.y, r = b.r;
    // film presque transparent, bord irisé, deux reflets
    var g = ctx.createRadialGradient(x, y, r * .55, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(.7, 'hsla(' + (b.teinte) + ',90%,80%,.10)');
    g.addColorStop(.9, 'hsla(' + (b.teinte + 60) + ',90%,78%,.32)');
    g.addColorStop(1, 'rgba(255,255,255,.75)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = Math.max(1, r / 22);
    ctx.strokeStyle = 'hsla(' + (b.teinte + 140) + ',80%,70%,.45)';
    ctx.beginPath(); ctx.arc(x, y, r - ctx.lineWidth / 2, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.ellipse(x - r * .38, y - r * .42, r * .2, r * .09, -.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath(); ctx.arc(x + r * .42, y + r * .38, r * .06, 0, Math.PI * 2); ctx.fill();
  }

  function eclate(i) {
    var b = bulles[i], x = b.x + b.dx;
    // un anneau qui s'ouvre et quelques gouttelettes
    gouttes.push({ anneau: true, x: x, y: b.y, r: b.r, vie: 1, teinte: b.teinte });
    var nb = 7 + Math.round(b.r / 8);
    for (var k = 0; k < nb; k++) {
      var a = Math.PI * 2 * k / nb + hasard(-.2, .2), s = hasard(60, 160) * (b.r / 30 + .5);
      gouttes.push({ x: x + Math.cos(a) * b.r * .8, y: b.y + Math.sin(a) * b.r * .8, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, r: hasard(1.2, 2.8), vie: 1, teinte: b.teinte + k * 30 });
    }
    bulles[i] = nouvelle(true);
  }

  function dessine(dt) {
    ctx.clearRect(0, 0, W, H);
    var t = performance.now() / 1000;
    for (var i = 0; i < bulles.length; i++) {
      var b = bulles[i];
      if (!calme) {
        b.y -= b.v * dt;
        b.teinte = (b.teinte + dt * 20) % 360;
        var cible = Math.sin(t * .7 + b.ph) * b.amp;
        // le pointeur pousse doucement les bulles
        var ddx = b.x + b.dx - souris.x, ddy = b.y - souris.y, d = Math.hypot(ddx, ddy), zone = b.r + 70;
        if (d < zone && d > 0) { cible += ddx / d * (zone - d) * .9; b.y += ddy / d * (zone - d) * .02; }
        b.dx += (cible - b.dx) * Math.min(1, dt * 3);
        if (b.y < -b.r * 2) bulles[i] = nouvelle(true);
      }
      dessineBulle(b);
    }
    for (var j = gouttes.length - 1; j >= 0; j--) {
      var g = gouttes[j];
      g.vie -= dt * (g.anneau ? 3.2 : 1.6);
      if (g.vie <= 0) { gouttes.splice(j, 1); continue; }
      if (g.anneau) {
        ctx.strokeStyle = 'hsla(' + g.teinte + ',85%,75%,' + (g.vie * .8) + ')';
        ctx.lineWidth = 2 * g.vie;
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r * (1 + (1 - g.vie) * .6), 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      } else {
        g.vy += 320 * dt; g.x += g.vx * dt; g.y += g.vy * dt;
        ctx.fillStyle = 'hsla(' + (g.teinte % 360) + ',80%,72%,' + g.vie + ')';
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function boucle(t) {
    if (!visible || document.hidden) { enMarche = false; return; }
    var dt = Math.min(.05, (t - (dernier || t)) / 1000);
    dernier = t;
    dessine(dt);
    requestAnimationFrame(boucle);
  }
  function lance() { if (!enMarche && !calme) { enMarche = true; dernier = 0; requestAnimationFrame(boucle); } }

  // toucher une bulle la fait éclater (le canvas est derrière le texte : on écoute toute la section)
  function touche(e) {
    if (e.target.closest('a, button, .pbulle')) return;
    var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    for (var i = bulles.length - 1; i >= 0; i--) {
      var b = bulles[i];
      if (Math.hypot(b.x + b.dx - x, b.y - y) < b.r + 10) {
        eclate(i);
        if (calme) { gouttes.length = 0; dessine(0); }
        else lance();
        return;
      }
    }
  }
  hero.addEventListener('pointerdown', touche);
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = canvas.getBoundingClientRect();
    souris.x = e.clientX - r.left; souris.y = e.clientY - r.top;
    // la main du curseur montre qu'on peut éclater la bulle survolée
    var dessus = bulles.some(function (b) { return Math.hypot(b.x + b.dx - souris.x, b.y - souris.y) < b.r + 4; });
    hero.style.cursor = dessus ? 'pointer' : '';
  });
  hero.addEventListener('pointerleave', function () { souris.x = souris.y = -999; hero.style.cursor = ''; });

  window.addEventListener('resize', taille);
  taille();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) lance(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) lance(); });
  lance();
})();
