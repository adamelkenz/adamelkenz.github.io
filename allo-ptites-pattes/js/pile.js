/* Allô P'tites Pattes — avant / après : les deux tirages épinglés au mur du salon.
   On fait glisser la photo du dessus (ou un coup de séchoir avec le bouton)
   et elle repasse sous la pile, laissant voir l'autre. */
(function () {
  var pile = document.querySelector('[data-pile]');
  if (!pile) return;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tirages = {};
  [].slice.call(pile.querySelectorAll('[data-tirage]')).forEach(function (t) { tirages[t.getAttribute('data-tirage')] = t; });
  var btn = document.querySelector('[data-pile-btn]'), btnTxt = document.querySelector('[data-pile-txt]');
  var etat = pile.querySelector('[data-pile-etat]');
  var dessus = 'avant', occupe = false;

  function place() {
    tirages.avant.setAttribute('data-pos', dessus === 'avant' ? 'dessus' : 'dessous');
    tirages.apres.setAttribute('data-pos', dessus === 'apres' ? 'dessus' : 'dessous');
    if (btnTxt) btnTxt.textContent = dessus === 'avant' ? 'Voir l’après' : 'Revoir l’avant';
    if (btn) btn.setAttribute('aria-pressed', String(dessus === 'apres'));
    if (etat) etat.textContent = 'Photo affichée : ' + (dessus === 'avant' ? 'avant' : 'après');
  }
  function remet(t) {
    ['--x', '--y', '--r'].forEach(function (v) { t.style.removeProperty(v); });
  }
  function bullesSouffle(sens) {
    if (calme) return;
    var r = pile.getBoundingClientRect();
    for (var i = 0; i < 7; i++) {
      var b = document.createElement('span');
      b.className = 'bulle-souffle';
      var taille = 10 + Math.random() * 22;
      b.style.width = b.style.height = taille + 'px';
      b.style.left = (sens > 0 ? 8 : 70) + Math.random() * 20 + '%';
      b.style.top = 20 + Math.random() * 60 + '%';
      b.style.setProperty('--dx', (sens * (80 + Math.random() * 140)).toFixed(0) + 'px');
      b.style.setProperty('--dy', (-40 - Math.random() * 90).toFixed(0) + 'px');
      b.style.animationDelay = (i * .04) + 's';
      pile.appendChild(b);
      b.addEventListener('animationend', function () { this.remove(); });
    }
  }
  // la photo du dessus s'envole d'un côté puis se glisse sous l'autre
  function envole(sens) {
    if (occupe) return;
    var t = tirages[dessus];
    if (calme) { dessus = dessus === 'avant' ? 'apres' : 'avant'; remet(t); place(); return; }
    occupe = true;
    bullesSouffle(sens);
    t.classList.remove('tenu');
    t.classList.add('envol');
    var w = pile.offsetWidth;
    t.style.setProperty('--x', (sens * w * 1.05) + 'px');
    t.style.setProperty('--y', '-24px');
    t.style.setProperty('--r', (sens * 22) + 'deg');
    setTimeout(function () {
      dessus = dessus === 'avant' ? 'apres' : 'avant';
      t.classList.remove('envol');
      remet(t);
      place();
      setTimeout(function () { occupe = false; }, 350);
    }, 430);
  }

  if (btn) btn.addEventListener('click', function () { envole(1); });

  // glisser la photo du dessus
  var tenu = null, x0 = 0, y0 = 0, t0 = 0, dx = 0, dy = 0;
  pile.addEventListener('pointerdown', function (e) {
    var t = e.target.closest('[data-tirage]');
    if (!t || occupe || t !== tirages[dessus]) return;
    tenu = t; x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); dx = dy = 0;
    t.setPointerCapture(e.pointerId);
    t.classList.add('tenu');
  });
  pile.addEventListener('pointermove', function (e) {
    if (!tenu) return;
    dx = e.clientX - x0; dy = e.clientY - y0;
    tenu.style.setProperty('--x', dx + 'px');
    tenu.style.setProperty('--y', (dy * .35) + 'px');
    tenu.style.setProperty('--r', (-2.5 + dx * .05) + 'deg');
  });
  function lache() {
    if (!tenu) return;
    var t = tenu, vitesse = Math.abs(dx) / Math.max(1, performance.now() - t0);
    tenu = null;
    if (Math.abs(dx) > pile.offsetWidth * .22 || (Math.abs(dx) > 30 && vitesse > .6)) envole(dx > 0 ? 1 : -1);
    else if (Math.abs(dx) < 4 && Math.abs(dy) < 4) { t.classList.remove('tenu'); remet(t); envole(1); }
    else { t.classList.remove('tenu'); remet(t); }
  }
  pile.addEventListener('pointerup', lache);
  pile.addEventListener('pointercancel', function () {
    if (!tenu) return;
    tenu.classList.remove('tenu'); remet(tenu); tenu = null;
  });

  place();
})();
