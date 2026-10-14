/* Allô P'tites Pattes — la galerie : les photos sèchent sur un fil à linge.
   Chaque photo est un petit pendule : elle se balance quand on fait défiler la page
   ou qu'on la frôle, puis se calme. Un clic l'ouvre en grand. */
(function () {
  var fil = document.querySelector('[data-fil]');
  if (!fil) return;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var piste = fil.querySelector('[data-fil-piste]');
  var corde = fil.querySelector('[data-corde]');
  var pinces = [].slice.call(fil.querySelectorAll('.pince'));
  var pendules = pinces.map(function (p, i) {
    var incline = parseFloat(p.getAttribute('data-incline')) || 0;
    p.querySelector('.polaroid').style.setProperty('--incline', incline + 'deg');
    return { el: p, a: 0, v: 0, phase: i * 1.7 };
  });

  /* ---------- la corde, qui pend un peu entre chaque pince ---------- */
  function dessineCorde() {
    var w = piste.scrollWidth, y0 = pinces.length ? pinces[0].offsetTop : 40;
    corde.setAttribute('width', w);
    corde.setAttribute('viewBox', '0 0 ' + w + ' 140');
    corde.style.width = w + 'px';
    // positions de mise en page (sans le balancement) : la pince est en haut, au milieu
    var xs = pinces.map(function (p) { return p.offsetLeft + p.offsetWidth / 2; });
    var pts = [-20].concat(xs, [w + 20]);
    var d = 'M' + pts[0] + ' ' + (y0 - 14);
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], sag = Math.min(46, (b - a) * .1);
      var ya = i === 1 ? y0 - 14 : y0, yb = i === pts.length - 1 ? y0 - 14 : y0;
      d += ' Q' + ((a + b) / 2) + ' ' + ((ya + yb) / 2 + sag * 2) + ' ' + b + ' ' + yb;
    }
    corde.innerHTML = '<path d="' + d + '"/><path d="' + d + '"/>';
  }
  dessineCorde();
  if ('ResizeObserver' in window) new ResizeObserver(dessineCorde).observe(piste);
  else window.addEventListener('resize', dessineCorde);
  window.addEventListener('load', dessineCorde);

  /* ---------- les pendules ---------- */
  var actif = false, enVue = false, tPrec = 0, brise = 0;
  function image(t) {
    if (!actif) return;
    var dt = Math.min(.04, (t - (tPrec || t)) / 1000); tPrec = t;
    brise = Math.max(0, brise - dt * .5);
    pendules.forEach(function (p) {
      // un ressort amorti, et une petite brise qui ne s'arrête jamais tout à fait
      var vent = Math.sin(t / 1300 + p.phase) * (.6 + brise * 4);
      var acc = -26 * p.a - 2.4 * p.v + vent;
      p.v += acc * dt; p.a += p.v * dt;
      if (p.a > 12) { p.a = 12; p.v *= -.4; }
      if (p.a < -12) { p.a = -12; p.v *= -.4; }
      p.el.style.transform = 'rotate(' + p.a.toFixed(2) + 'deg)';
    });
    if (enVue) requestAnimationFrame(image); else actif = false;
  }
  function demarre() {
    if (actif || calme || !enVue) return;
    actif = true; tPrec = 0;
    requestAnimationFrame(image);
  }
  // le défilement de la page fait balancer les photos, chacune un peu à sa façon
  var dernierY = window.scrollY;
  window.addEventListener('scroll', function () {
    if (!actif) { dernierY = window.scrollY; return; }
    var dy = window.scrollY - dernierY; dernierY = window.scrollY;
    pendules.forEach(function (p, i) { p.v += Math.max(-40, Math.min(40, dy)) * (i % 2 ? .08 : -.06); });
    brise = Math.min(1, brise + Math.abs(dy) * .004);
  }, { passive: true });
  // et le défilement horizontal du fil, sur téléphone
  var dernierX = fil.scrollLeft;
  fil.addEventListener('scroll', function () {
    var dx = fil.scrollLeft - dernierX; dernierX = fil.scrollLeft;
    pendules.forEach(function (p) { p.v -= dx * .12; });
  }, { passive: true });
  // frôler une photo la pousse
  pendules.forEach(function (p) {
    var xPrec = null;
    p.el.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (xPrec != null) p.v += (e.clientX - xPrec) * .55;
      xPrec = e.clientX;
    });
    p.el.addEventListener('pointerleave', function () { xPrec = null; });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { enVue = es[0].isIntersecting; if (enVue) demarre(); }, { rootMargin: '80px 0px' }).observe(fil);
  } else { enVue = true; demarre(); }

  /* ---------- la visionneuse ---------- */
  var vis = document.querySelector('[data-visionneuse]');
  var boutons = [].slice.call(fil.querySelectorAll('.polaroid'));
  if (!vis || !vis.showModal) {
    boutons.forEach(function (b) { b.addEventListener('click', function () { window.open(b.getAttribute('data-grand'), '_blank'); }); });
    return;
  }
  var img = vis.querySelector('[data-v-img]'), leg = vis.querySelector('[data-v-legende]'), idx = 0, origine = null;
  function montre(i) {
    idx = (i + boutons.length) % boutons.length;
    var b = boutons[idx], petite = b.querySelector('img');
    img.src = b.getAttribute('data-grand');
    img.alt = petite.alt;
    leg.textContent = b.getAttribute('data-legende');
    var fig = vis.querySelector('figure');
    fig.style.animation = 'none'; void fig.offsetWidth; fig.style.animation = '';
  }
  boutons.forEach(function (b, i) {
    b.addEventListener('click', function () {
      origine = b;
      montre(i);
      vis.showModal();
      // la photo tirée du fil donne une secousse à ses voisines
      pendules.forEach(function (p, k) { p.v += (k < i ? -1 : 1) * 30; });
    });
  });
  vis.querySelector('[data-v-prec]').addEventListener('click', function () { montre(idx - 1); });
  vis.querySelector('[data-v-suiv]').addEventListener('click', function () { montre(idx + 1); });
  vis.querySelector('[data-fermer]').addEventListener('click', function () { vis.close(); });
  vis.addEventListener('click', function (e) { if (e.target === vis || e.target.tagName === 'FIGURE') vis.close(); });
  vis.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') montre(idx - 1);
    if (e.key === 'ArrowRight') montre(idx + 1);
  });
  vis.addEventListener('close', function () { if (origine) origine.focus(); });
  // glisser du doigt dans la visionneuse
  var x0 = null;
  vis.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
  vis.addEventListener('pointerup', function (e) {
    if (x0 == null) return;
    var dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) montre(idx + (dx < 0 ? 1 : -1));
  });
})();
