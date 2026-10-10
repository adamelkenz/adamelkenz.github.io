/* L'atelier du poil — comparateur avant / après.
   Glisser au doigt ou à la souris, clic direct sur l'image, ou clavier (curseur natif caché).
   Une paire = un bouton .vignette avec data-avant, data-apres, data-alt-*, data-legende
   (et data-srcset-avant / data-srcset-apres facultatifs). */
(function () {
  var comp = document.querySelector('[data-comparateur]');
  if (!comp) return;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scene = comp.querySelector('[data-scene]');
  var curseur = comp.querySelector('.comp-curseur');
  var imgAvant = comp.querySelector('[data-img-avant]'), imgApres = comp.querySelector('[data-img-apres]');
  var legende = document.querySelector('[data-legende]');
  var vignettes = [].slice.call(document.querySelectorAll('[data-vignettes] .vignette'));
  var demo = null, touche = false;

  function pose(v) {
    v = Math.max(0, Math.min(100, v));
    comp.style.setProperty('--pos', v + '%');
    curseur.value = Math.round(v);
    var r = Math.round(v);
    curseur.setAttribute('aria-valuetext', r <= 2 ? 'Tout après' : r >= 98 ? 'Tout avant' : r + ' % avant, ' + (100 - r) + ' % après');
    comp.classList.toggle('bord-gauche', v < 14);
    comp.classList.toggle('bord-droit', v > 86);
  }
  function stopDemo() {
    touche = true;
    if (demo) { cancelAnimationFrame(demo); demo = null; }
  }
  function depuisX(x) {
    var r = scene.getBoundingClientRect();
    pose((x - r.left) / r.width * 100);
  }

  // glisser (souris, doigt, stylet) ; touch-action: pan-y laisse défiler la page à la verticale
  var tire = false;
  scene.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    tire = true;
    comp.classList.add('tire');
    scene.setPointerCapture(e.pointerId);
    // au doigt, on attend le premier mouvement : un simple défilement vertical ne bouge rien
    if (e.pointerType === 'mouse') { stopDemo(); depuisX(e.clientX); }
  });
  scene.addEventListener('pointermove', function (e) { if (tire) { stopDemo(); depuisX(e.clientX); } });
  function lache() { tire = false; comp.classList.remove('tire'); }
  scene.addEventListener('pointerup', lache);
  scene.addEventListener('pointercancel', lache);

  // clavier et lecteurs d'écran
  curseur.addEventListener('input', function () { stopDemo(); pose(+curseur.value); });
  curseur.addEventListener('focus', stopDemo);
  // le curseur est caché : un clic sur la poignée donne le focus au clavier
  scene.addEventListener('click', function (e) {
    stopDemo();
    if (e.pointerType !== 'mouse') depuisX(e.clientX);
    curseur.focus({ preventScroll: true });
  });

  // changer de paire
  vignettes.forEach(function (b) {
    b.addEventListener('click', function () {
      vignettes.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      imgAvant.removeAttribute('srcset'); imgApres.removeAttribute('srcset');
      if (b.dataset.srcsetAvant) imgAvant.srcset = b.dataset.srcsetAvant;
      if (b.dataset.srcsetApres) imgApres.srcset = b.dataset.srcsetApres;
      imgAvant.src = b.dataset.avant; imgAvant.alt = b.dataset.altAvant || '';
      imgApres.src = b.dataset.apres; imgApres.alt = b.dataset.altApres || '';
      if (legende && b.dataset.legende) legende.innerHTML = b.dataset.legende;
      pose(50);
    });
  });

  // petite démo la première fois que le comparateur apparaît à l'écran
  function lanceDemo() {
    if (touche || calme) return;
    var t0 = null, duree = 2600;
    var cles = [[0, 50], [.3, 80], [.68, 22], [1, 50]];
    function douce(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function pas(ts) {
      if (touche) return;
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / duree), i = 0;
      while (i < cles.length - 2 && p > cles[i + 1][0]) i++;
      var a = cles[i], b = cles[i + 1], q = douce((p - a[0]) / (b[0] - a[0]));
      pose(a[1] + (b[1] - a[1]) * q);
      demo = p < 1 ? requestAnimationFrame(pas) : null;
    }
    demo = requestAnimationFrame(pas);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); setTimeout(lanceDemo, 500); }
    }, { threshold: .6 });
    io.observe(scene);
  }

  pose(50);
})();
