/* Les Pattes Enchantées — le ciel étoilé de l'accueil et la poussière d'étoiles.
   window.Magie.eclat(x, y, n) : gerbe d'étincelles aux coordonnées écran (x, y). */
(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COULEURS = ['#ffd27a', '#f07c1b', '#ffb35c', '#fff3df', '#ff9433'];

  /* ---------- poussière d'étoiles (plein écran) ---------- */
  var cv = document.getElementById('poussiere');
  var ctx = cv && cv.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, grains = [], tourne = false;

  function taille() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function etoile(c, r) {
    c.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4, rr = i % 2 ? r * .32 : r;
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath(); c.fill();
  }

  function ajoute(x, y, vx, vy, r, vie) {
    if (grains.length > 260) grains.shift();
    grains.push({ x: x, y: y, vx: vx, vy: vy, r: r, vie: vie, age: 0, rot: Math.random() * 6, vr: (Math.random() - .5) * .3,
      c: COULEURS[(Math.random() * COULEURS.length) | 0], forme: Math.random() < .55 });
    if (!tourne) { tourne = true; requestAnimationFrame(boucle); }
  }

  function boucle() {
    ctx.clearRect(0, 0, W, H);
    for (var i = grains.length - 1; i >= 0; i--) {
      var g = grains[i];
      g.age++;
      if (g.age > g.vie) { grains.splice(i, 1); continue; }
      g.vx *= .96; g.vy = g.vy * .96 + .06; g.x += g.vx; g.y += g.vy; g.rot += g.vr;
      var k = 1 - g.age / g.vie;
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 1.6) * (.75 + .25 * Math.sin(g.age * .5));
      ctx.translate(g.x, g.y); ctx.rotate(g.rot);
      ctx.fillStyle = g.c;
      if (g.forme) etoile(ctx, g.r * (.4 + .6 * k));
      else { ctx.beginPath(); ctx.arc(0, 0, g.r * .35 * k + .5, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    if (grains.length) requestAnimationFrame(boucle);
    else { tourne = false; ctx.clearRect(0, 0, W, H); }
  }

  var Magie = {
    eclat: function (x, y, n) {
      if (!ctx || calme) return;
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 4.5;
        ajoute(x, y, Math.cos(a) * v, Math.sin(a) * v - 1.5, 4 + Math.random() * 6, 40 + Math.random() * 40);
      }
    },
    trainee: function (x, y) {
      if (!ctx || calme) return;
      ajoute(x + (Math.random() - .5) * 8, y + (Math.random() - .5) * 8, (Math.random() - .5) * .8, Math.random() * .6, 3 + Math.random() * 4, 30 + Math.random() * 25);
    }
  };
  window.Magie = Magie;

  if (ctx) {
    taille();
    window.addEventListener('resize', taille);
    // une traînée d'étincelles suit la souris (pas au doigt : ça gênerait la lecture)
    if (!calme && window.matchMedia('(pointer: fine)').matches) {
      var dx = 0, dy = 0, px = null, py = null;
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        if (px !== null) { dx += Math.abs(e.clientX - px); dy += Math.abs(e.clientY - py); }
        px = e.clientX; py = e.clientY;
        if (dx + dy > 22) { dx = dy = 0; Magie.trainee(e.clientX, e.clientY); }
      }, { passive: true });
    }
  }

  /* ---------- le ciel de l'accueil : étoiles qui scintillent, étoiles filantes ---------- */
  var ciel = document.getElementById('ciel');
  if (!ciel) return;
  var cc = ciel.getContext('2d'), CW = 0, CH = 0, etoiles = [], filante = null, prochaine = 0, visible = true, t = 0;

  function prepare(w, h) {
    CW = w; CH = h;
    var dc = Math.min(dpr, 1.5);
    ciel.width = CW * dc; ciel.height = CH * dc;
    cc.setTransform(dc, 0, 0, dc, 0, 0);
    var n = Math.min(220, Math.round(CW * CH / 5200));
    etoiles = [];
    for (var i = 0; i < n; i++) {
      etoiles.push({ x: Math.random() * CW, y: Math.random() * CH * .85, r: Math.random() < .12 ? 1.6 + Math.random() : .5 + Math.random() * .9,
        p: Math.random() * 6.3, v: .01 + Math.random() * .03, chaud: Math.random() < .25 });
    }
    dessine();
  }

  function dessine() {
    cc.clearRect(0, 0, CW, CH);
    for (var i = 0; i < etoiles.length; i++) {
      var e = etoiles[i];
      var a = .35 + .65 * (.5 + .5 * Math.sin(e.p + t * e.v * 60));
      cc.globalAlpha = calme ? .8 : a;
      cc.fillStyle = e.chaud ? '#ffd9a8' : '#fff';
      if (e.r > 1.5) { cc.save(); cc.translate(e.x, e.y); etoile(cc, e.r * 2.2); cc.restore(); }
      else { cc.beginPath(); cc.arc(e.x, e.y, e.r, 0, 7); cc.fill(); }
    }
    if (filante) {
      var f = filante, k = f.age / f.vie;
      var g = cc.createLinearGradient(f.x, f.y, f.x - f.vx * 14, f.y - f.vy * 14);
      g.addColorStop(0, 'rgba(255,240,220,' + (1 - k) + ')'); g.addColorStop(1, 'rgba(255,180,90,0)');
      cc.globalAlpha = 1; cc.strokeStyle = g; cc.lineWidth = 2; cc.lineCap = 'round';
      cc.beginPath(); cc.moveTo(f.x, f.y); cc.lineTo(f.x - f.vx * 14, f.y - f.vy * 14); cc.stroke();
    }
    cc.globalAlpha = 1;
  }

  var derniere = 0;
  function anime(now) {
    // 30 images par seconde suffisent pour des étoiles qui scintillent
    if (!visible || document.hidden || now - derniere < 32) { requestAnimationFrame(anime); return; }
    derniere = now;
    t = now / 1000;
    if (!filante && now > prochaine) {
      filante = { x: CW * (.2 + Math.random() * .6), y: CH * Math.random() * .3, vx: 9 + Math.random() * 5, vy: 3 + Math.random() * 3, age: 0, vie: 50 };
      if (Math.random() < .5) filante.vx *= -1;
    }
    if (filante) {
      filante.x += filante.vx * 2; filante.y += filante.vy * 2; filante.age += 2;
      if (filante.age > filante.vie) { filante = null; prochaine = now + 3500 + Math.random() * 5000; }
    }
    dessine();
    requestAnimationFrame(anime);
  }

  // la taille du ciel arrive par ResizeObserver : pas de lecture forcée de la mise en page
  var attente;
  if ('ResizeObserver' in window) {
    new ResizeObserver(function (es) {
      var r = es[0].contentRect;
      clearTimeout(attente);
      attente = setTimeout(function () { prepare(r.width, r.height); }, CW ? 150 : 0);
    }).observe(ciel);
  } else prepare(ciel.offsetWidth, ciel.offsetHeight);
  if (!calme) {
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(ciel);
    // une première image fixe tout de suite, l'animation une fois la page chargée
    var demarre = function () {
      setTimeout(function () { prochaine = performance.now() + 1500; requestAnimationFrame(anime); }, 1800);
    };
    if (document.readyState === 'complete') demarre(); else window.addEventListener('load', demarre);
    // un clic dans le ciel fait jaillir des étoiles
    ciel.parentNode.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      Magie.eclat(e.clientX, e.clientY, 16);
    });
  }
})();
